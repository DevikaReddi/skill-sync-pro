"""Main analysis service that orchestrates the resume analysis."""
import time
from typing import Dict, Any, Set, List
from app.services.text_processor import TextProcessor, SkillMatcher
from app.services.nlp_service import NLPService
from app.services.embeddings_service import EmbeddingsService
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
        self.embeddings_service = EmbeddingsService()
    
    async def analyze(self, request: ResumeAnalysisRequest) -> AnalysisResponse:
        """Perform complete analysis of resume against job description."""
        start_time = time.time()
        
        try:
            # Clean texts
            clean_resume = self.text_processor.clean_text(request.resume_text)
            clean_jd = self.text_processor.clean_text(request.job_description)
            
            # Extract skills using both methods
            basic_resume_skills = self.text_processor.extract_keywords(clean_resume)
            basic_jd_skills = self.text_processor.extract_keywords(clean_jd)
            
            nlp_resume_skills = self.nlp_service.extract_skills_advanced(request.resume_text)
            nlp_jd_skills = self.nlp_service.extract_skills_advanced(request.job_description)
            
            # Combine both approaches
            resume_skills = basic_resume_skills.union(nlp_resume_skills)
            jd_skills = basic_jd_skills.union(nlp_jd_skills)
            
            # Extract additional insights
            resume_level = self.nlp_service.extract_experience_level(request.resume_text)
            jd_level = self.nlp_service.extract_experience_level(request.job_description)
            
            # Calculate match score
            skill_match_score = self.skill_matcher.calculate_match_score(resume_skills, jd_skills)
            
            # Experience level bonus
            level_bonus = 0
            if resume_level == jd_level and resume_level != "Not specified":
                level_bonus = 10
            elif resume_level in ["Senior", "Lead"] and jd_level in ["Mid-level", "Junior"]:
                level_bonus = 5
            
            # Semantic similarity
            semantic_score = self.nlp_service.calculate_semantic_similarity(
                request.resume_text[:1000], 
                request.job_description[:1000]
            ) * 100
            
            # Final score
            final_score = (skill_match_score * 0.7) + (semantic_score * 0.2) + (level_bonus * 0.1)
            final_score = min(100, max(0, final_score))
            
            # Categorize skills
            categorized = self.skill_matcher.categorize_skills(resume_skills, jd_skills)
            
            # Analyze market demand for skills
            all_skills = list(resume_skills.union(jd_skills))
            demand_analysis = self.embeddings_service.analyze_skill_market_demand(all_skills)
            
            # Create skill objects with AI-enhanced relevance
            matching_skills = []
            for skill in categorized['matching']:
                relevance = 0.9 if demand_analysis.get(skill, "Standard") == "High" else 0.7
                matching_skills.append(
                    Skill(
                        name=skill,
                        category=self._categorize_skill(skill),
                        relevance_score=relevance
                    )
                )
            
            skill_gaps = []
            for skill in categorized['gaps']:
                relevance = 0.8 if demand_analysis.get(skill, "Standard") == "High" else 0.6
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
            
            # Generate AI-powered recommendations
            skill_recommendations = self.embeddings_service.get_skill_recommendations(
                categorized['gaps'],
                categorized['unique']
            )
            
            # Format recommendations
            recommendations = self._format_recommendations(
                skill_recommendations,
                resume_level,
                jd_level
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
                recommendations=recommendations[:5],
                processing_time_ms=processing_time
            )
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            raise
    
    def _format_recommendations(self, skill_recs: List[Dict], 
                               resume_level: str, jd_level: str) -> List[str]:
        """Format AI-powered recommendations into readable strings."""
        recommendations = []
        
        # Level-based recommendation
        if jd_level != "Not specified" and resume_level != jd_level:
            if jd_level in ["Senior", "Lead"] and resume_level in ["Junior", "Mid-level"]:
                recommendations.append(
                    f"Consider gaining more experience to match the {jd_level} level requirement"
                )
        
        # Top priority skills
        high_priority = [r for r in skill_recs if r["priority"] == "high"]
        if high_priority:
            skills_list = ", ".join([r["skill"] for r in high_priority[:3]])
            recommendations.append(f"Priority skills to learn: {skills_list}")
        
        # Skills with similar alternatives
        for rec in skill_recs[:2]:
            if rec["related_skills"]:
                related = rec["related_skills"][0]["name"]
                recommendations.append(
                    f"For {rec['skill']}, you might also consider learning {related}"
                )
        
        # Learning path suggestion
        if skill_recs:
            first_skill = skill_recs[0]
            if first_skill["learning_path"]:
                recommendations.append(
                    f"Learning path for {first_skill['skill']}: {first_skill['learning_path'][0]}"
                )
        
        return recommendations
    
    def _categorize_skill(self, skill: str) -> str:
        """Categorize a skill into a category."""
        categories = {
            'Programming': ['python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'typescript'],
            'Frontend': ['react', 'angular', 'vue', 'html', 'css', 'sass', 'tailwind', 'bootstrap'],
            'Backend': ['node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'rails'],
            'Database': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch'],
            'Cloud/DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform'],
            'Data/AI': ['machine-learning', 'deep-learning', 'tensorflow', 'pytorch', 'pandas', 'numpy'],
            'Tools': ['git', 'jira', 'confluence', 'linux', 'agile', 'scrum']
        }
        
        skill_lower = skill.lower()
        for category, skills in categories.items():
            if any(s in skill_lower for s in skills):
                return category
        return 'Other'

    async def analyze_with_updates(self, request: ResumeAnalysisRequest, client_id: str = None):
        """Perform analysis with real-time updates."""
        from app.core.websocket import manager
        import json
        
        async def send_update(stage: str, progress: int):
            if client_id:
                await manager.send_personal_message(
                    json.dumps({
                        "type": "analysis_progress",
                        "stage": stage,
                        "progress": progress
                    }),
                    client_id
                )
        
        # Send progress updates
        await send_update("Starting analysis", 0)
        
        # Text cleaning
        await send_update("Cleaning text", 20)
        clean_resume = self.text_processor.clean_text(request.resume_text)
        clean_jd = self.text_processor.clean_text(request.job_description)
        
        # Skill extraction
        await send_update("Extracting skills", 40)
        resume_skills = self.nlp_service.extract_skills_advanced(request.resume_text)
        jd_skills = self.nlp_service.extract_skills_advanced(request.job_description)
        
        # Matching
        await send_update("Matching skills", 60)
        result = await self.analyze(request)
        
        # Generating recommendations
        await send_update("Generating recommendations", 80)
        
        # Complete
        await send_update("Analysis complete", 100)
        
        return result
