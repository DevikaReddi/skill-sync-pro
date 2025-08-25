"""Main analysis service that orchestrates the resume analysis."""
import time
from typing import Dict, Any
from app.services.text_processor import TextProcessor, SkillMatcher
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
    
    async def analyze(self, request: ResumeAnalysisRequest) -> AnalysisResponse:
        """Perform complete analysis of resume against job description."""
        start_time = time.time()
        
        try:
            # Clean texts
            clean_resume = self.text_processor.clean_text(request.resume_text)
            clean_jd = self.text_processor.clean_text(request.job_description)
            
            # Extract keywords/skills
            resume_skills = self.text_processor.extract_keywords(clean_resume)
            jd_skills = self.text_processor.extract_keywords(clean_jd)
            
            # Calculate match score
            match_score = self.skill_matcher.calculate_match_score(resume_skills, jd_skills)
            
            # Categorize skills
            categorized = self.skill_matcher.categorize_skills(resume_skills, jd_skills)
            
            # Create skill objects
            matching_skills = [
                Skill(
                    name=skill,
                    category=self._categorize_skill(skill),
                    relevance_score=0.9
                ) for skill in categorized['matching']
            ]
            
            skill_gaps = [
                Skill(
                    name=skill,
                    category=self._categorize_skill(skill),
                    relevance_score=0.7
                ) for skill in categorized['gaps']
            ]
            
            unique_skills = [
                Skill(
                    name=skill,
                    category=self._categorize_skill(skill),
                    relevance_score=0.5
                ) for skill in categorized['unique']
            ]
            
            # Generate recommendations
            recommendations = self.skill_matcher.generate_recommendations(categorized['gaps'])
            
            # Create response
            skill_analysis = SkillAnalysis(
                matching_skills=matching_skills,
                skill_gaps=skill_gaps,
                unique_skills=unique_skills
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return AnalysisResponse(
                success=True,
                match_percentage=round(match_score, 1),
                skill_analysis=skill_analysis,
                recommendations=recommendations,
                processing_time_ms=processing_time
            )
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            raise
    
    def _categorize_skill(self, skill: str) -> str:
        """Categorize a skill into a category."""
        categories = {
            'Programming': ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'typescript'],
            'Frontend': ['react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap'],
            'Backend': ['node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails'],
            'Database': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch'],
            'Cloud/DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform'],
            'Data/AI': ['machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'tableau'],
            'Tools': ['git', 'jira', 'confluence', 'linux', 'agile', 'scrum']
        }
        
        for category, skills in categories.items():
            if skill.lower() in skills:
                return category
        return 'Other'
