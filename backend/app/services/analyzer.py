"""Main analysis service that orchestrates the resume analysis."""
import time
from typing import Dict, Any, Set, List
from app.services.text_processor import TextProcessor, SkillMatcher
from app.services.nlp_service import NLPService
from app.models.analysis import (
    ResumeAnalysisRequest,
    AnalysisResponse,
    SkillAnalysis,
    Skill
)
import logging

logger = logging.getLogger(__name__)

class ResumeAnalyzer:
    """Main service for analyzing resumes against job descriptions."""
    
    def __init__(self):
        self.text_processor = TextProcessor()
        self.skill_matcher = SkillMatcher()
        self.nlp_service = NLPService()
    
    async def analyze(self, request: ResumeAnalysisRequest) -> AnalysisResponse:
        """Perform complete analysis of resume against job description."""
        start_time = time.time()
        
        try:
            # Clean texts
            clean_resume = self.text_processor.clean_text(request.resume_text)
            clean_jd = self.text_processor.clean_text(request.job_description)
            
            # Extract skills using both methods and combine
            # 1. Basic keyword extraction
            basic_resume_skills = self.text_processor.extract_keywords(clean_resume)
            basic_jd_skills = self.text_processor.extract_keywords(clean_jd)
            
            # 2. Advanced NLP extraction
            nlp_resume_skills = self.nlp_service.extract_skills_advanced(request.resume_text)
            nlp_jd_skills = self.nlp_service.extract_skills_advanced(request.job_description)
            
            # 3. Combine both approaches for better coverage
            resume_skills = basic_resume_skills.union(nlp_resume_skills)
            jd_skills = basic_jd_skills.union(nlp_jd_skills)
            
            # Extract additional insights
            resume_level = self.nlp_service.extract_experience_level(request.resume_text)
            jd_level = self.nlp_service.extract_experience_level(request.job_description)
            
            # Extract key phrases for better recommendations
            resume_phrases = self.nlp_service.extract_key_phrases(request.resume_text, 5)
            jd_phrases = self.nlp_service.extract_key_phrases(request.job_description, 5)
            
            # Calculate match score with weighted factors
            skill_match_score = self.skill_matcher.calculate_match_score(resume_skills, jd_skills)
            
            # Adjust score based on experience level match
            level_bonus = 0
            if resume_level == jd_level and resume_level != "Not specified":
                level_bonus = 10
            elif resume_level in ["Senior", "Lead"] and jd_level in ["Mid-level", "Junior"]:
                level_bonus = 5
            
            # Calculate semantic similarity for overall context
            semantic_score = self.nlp_service.calculate_semantic_similarity(
                request.resume_text, 
                request.job_description
            ) * 100
            
            # Weighted final score
            final_score = (skill_match_score * 0.7) + (semantic_score * 0.2) + (level_bonus * 0.1)
            final_score = min(100, max(0, final_score))  # Clamp between 0-100
            
            # Categorize skills
            categorized = self.skill_matcher.categorize_skills(resume_skills, jd_skills)
            
            # Create skill objects with relevance scores
            matching_skills = []
            for skill in categorized['matching']:
                relevance = 0.9 if skill in jd_phrases else 0.7
                matching_skills.append(
                    Skill(
                        name=skill,
                        category=self._categorize_skill(skill),
                        relevance_score=relevance
                    )
                )
            
            skill_gaps = []
            for skill in categorized['gaps']:
                # Higher relevance for skills mentioned multiple times
                relevance = 0.8 if skill in [p[0] for p in jd_phrases[:3]] else 0.6
                skill_gaps.append(
                    Skill(
                        name=skill,
                        category=self._categorize_skill(skill),
                        relevance_score=relevance
                    )
                )
            
            unique_skills = []
            for skill in categorized['unique']:
                unique_skills.append(
                    Skill(
                        name=skill,
                        category=self._categorize_skill(skill),
                        relevance_score=0.5
                    )
                )
            
            # Generate enhanced recommendations
            recommendations = self._generate_smart_recommendations(
                categorized['gaps'],
                resume_level,
                jd_level,
                jd_phrases
            )
            
            # Create response
            skill_analysis = SkillAnalysis(
                matching_skills=matching_skills,
                skill_gaps=skill_gaps,
                unique_skills=unique_skills
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return AnalysisResponse(
                success=True,
                match_percentage=round(final_score, 1),
                skill_analysis=skill_analysis,
                recommendations=recommendations,
                processing_time_ms=processing_time
            )
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            raise
    
    def _generate_smart_recommendations(self, gaps: List[str], resume_level: str, 
                                       jd_level: str, jd_phrases: List) -> List[str]:
        """Generate intelligent recommendations based on analysis."""
        recommendations = []
        
        # Level-based recommendations
        if jd_level != "Not specified" and resume_level != jd_level:
            if jd_level in ["Senior", "Lead"] and resume_level in ["Junior", "Mid-level"]:
                recommendations.append(
                    f"Consider gaining more experience to match the {jd_level} level requirement"
                )
        
        # Skill gap recommendations with priority
        if gaps:
            # Prioritize based on categories
            priority_categories = {
                'Cloud/DevOps': 'cloud and deployment',
                'Programming': 'programming languages',
                'Frontend': 'frontend frameworks',
                'Backend': 'backend technologies',
                'Database': 'database management'
            }
            
            categorized_gaps = {}
            for gap in gaps[:10]:  # Focus on top 10 gaps
                category = self._categorize_skill(gap)
                if category not in categorized_gaps:
                    categorized_gaps[category] = []
                categorized_gaps[category].append(gap)
            
            for category, skills in categorized_gaps.items():
                if category in priority_categories:
                    skills_str = ', '.join(skills[:3])
                    recommendations.append(
                        f"Strengthen your {priority_categories[category]} skills: {skills_str}"
                    )
        
        # Add specific learning path suggestions
        if any('cloud' in gap or 'aws' in gap or 'azure' in gap for gap in gaps):
            recommendations.append(
                "Consider cloud certifications (AWS/Azure/GCP) to validate your skills"
            )
        
        if any('docker' in gap or 'kubernetes' in gap for gap in gaps):
            recommendations.append(
                "Hands-on DevOps experience with containerization would strengthen your profile"
            )
        
        # Limit recommendations
        return recommendations[:5]
    
    def _categorize_skill(self, skill: str) -> str:
        """Categorize a skill into a category."""
        categories = {
            'Programming': ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'typescript', 'kotlin', 'swift', 'scala', 'r', 'matlab'],
            'Frontend': ['react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery', 'next.js', 'gatsby', 'webpack'],
            'Backend': ['node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails', '.net', 'laravel', 'gin', 'echo'],
            'Database': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'neo4j', 'firebase'],
            'Cloud/DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'ci/cd', 'gitlab', 'github actions'],
            'Data/AI': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'power bi', 'spark'],
            'Mobile': ['ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'xamarin'],
            'Tools': ['git', 'jira', 'confluence', 'linux', 'agile', 'scrum', 'vs code', 'intellij', 'postman']
        }
        
        skill_lower = skill.lower()
        for category, skills in categories.items():
            if any(s in skill_lower for s in skills):
                return category
        return 'Other'
