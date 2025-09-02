"""AI-powered insights and predictions service."""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import re
from collections import Counter
from app.services.nlp_service import NLPService
from sqlalchemy.orm import Session
from app.models.user import AnalysisHistory
import numpy as np

class AIInsightsEngine:
    """Generate AI-powered insights and predictions."""
    
    def __init__(self):
        self.nlp_service = NLPService()
        
        # Industry benchmarks (these would ideally come from a database)
        self.industry_benchmarks = {
            "software_engineer": {
                "avg_match": 72.5,
                "top_skills": ["python", "javascript", "react", "docker", "aws", "git"],
                "experience_distribution": {"Junior": 30, "Mid-level": 45, "Senior": 25}
            },
            "data_scientist": {
                "avg_match": 68.3,
                "top_skills": ["python", "machine learning", "sql", "tensorflow", "pandas", "statistics"],
                "experience_distribution": {"Junior": 25, "Mid-level": 40, "Senior": 35}
            },
            "product_manager": {
                "avg_match": 65.8,
                "top_skills": ["agile", "scrum", "analytics", "roadmap", "stakeholder management", "jira"],
                "experience_distribution": {"Junior": 20, "Mid-level": 50, "Senior": 30}
            }
        }
    
    def generate_insights(
        self, 
        resume_text: str, 
        job_description: str, 
        match_result: Dict[str, Any],
        db: Optional[Session] = None,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate comprehensive AI insights."""
        
        # Detect job role
        job_role = self._detect_job_role(job_description)
        
        # Get industry benchmark
        benchmark = self.industry_benchmarks.get(
            job_role, 
            {"avg_match": 70.0, "top_skills": [], "experience_distribution": {}}
        )
        
        # Generate various insights
        insights = {
            "job_role": job_role,
            "industry_comparison": self._compare_to_industry(match_result, benchmark),
            "skill_insights": self._analyze_skill_patterns(match_result, benchmark),
            "optimization_potential": self._calculate_optimization_potential(match_result),
            "career_trajectory": self._predict_career_trajectory(resume_text, job_role),
            "market_positioning": self._analyze_market_positioning(match_result, benchmark),
            "improvement_roadmap": self._generate_improvement_roadmap(match_result, benchmark),
            "competitive_analysis": self._competitive_analysis(match_result, benchmark, db, user_id)
        }
        
        return insights
    
    def _detect_job_role(self, job_description: str) -> str:
        """Detect the job role from job description."""
        job_description_lower = job_description.lower()
        
        role_keywords = {
            "software_engineer": ["software engineer", "developer", "programmer", "sde", "full stack"],
            "data_scientist": ["data scientist", "machine learning", "ml engineer", "ai engineer"],
            "product_manager": ["product manager", "product owner", "pm", "product lead"]
        }
        
        for role, keywords in role_keywords.items():
            if any(keyword in job_description_lower for keyword in keywords):
                return role
        
        return "general"
    
    def _compare_to_industry(self, match_result: Dict, benchmark: Dict) -> Dict[str, Any]:
        """Compare results to industry benchmarks."""
        match_percentage = match_result.get("match_percentage", 0)
        avg_match = benchmark.get("avg_match", 70)
        
        difference = match_percentage - avg_match
        percentile = self._calculate_percentile(match_percentage, avg_match)
        
        return {
            "your_score": match_percentage,
            "industry_average": avg_match,
            "difference": round(difference, 1),
            "percentile": percentile,
            "interpretation": self._interpret_comparison(difference),
            "benchmark_status": "above_average" if difference > 0 else "below_average"
        }
    
    def _calculate_percentile(self, score: float, avg: float, std_dev: float = 15) -> int:
        """Calculate percentile based on normal distribution."""
        from scipy import stats
        z_score = (score - avg) / std_dev
        percentile = stats.norm.cdf(z_score) * 100
        return min(99, max(1, int(percentile)))
    
    def _interpret_comparison(self, difference: float) -> str:
        """Interpret the comparison difference."""
        if difference >= 20:
            return "Exceptional match - well above industry average"
        elif difference >= 10:
            return "Strong match - above industry average"
        elif difference >= 0:
            return "Good match - at or slightly above average"
        elif difference >= -10:
            return "Fair match - slightly below average"
        else:
            return "Needs improvement - below industry average"
    
    def _analyze_skill_patterns(self, match_result: Dict, benchmark: Dict) -> Dict[str, Any]:
        """Analyze skill patterns and trends."""
        matching_skills = [s["name"] for s in match_result.get("skill_analysis", {}).get("matching_skills", [])]
        missing_skills = [s["name"] for s in match_result.get("skill_analysis", {}).get("skill_gaps", [])]
        benchmark_skills = benchmark.get("top_skills", [])
        
        # Find trending skills
        trending_skills = [skill for skill in benchmark_skills if skill not in matching_skills][:3]
        
        # Calculate skill coverage
        skill_coverage = len(matching_skills) / (len(matching_skills) + len(missing_skills)) * 100 if (matching_skills or missing_skills) else 0
        
        return {
            "skill_coverage_percentage": round(skill_coverage, 1),
            "trending_skills_to_learn": trending_skills,
            "strongest_skills": matching_skills[:5],
            "critical_gaps": missing_skills[:3],
            "industry_alignment": self._calculate_skill_alignment(matching_skills, benchmark_skills)
        }
    
    def _calculate_skill_alignment(self, user_skills: List[str], industry_skills: List[str]) -> float:
        """Calculate alignment with industry skills."""
        if not industry_skills:
            return 0.0
        
        aligned_skills = [s for s in user_skills if s in industry_skills]
        return round(len(aligned_skills) / len(industry_skills) * 100, 1)
    
    def _calculate_optimization_potential(self, match_result: Dict) -> Dict[str, Any]:
        """Calculate potential for optimization."""
        current_match = match_result.get("match_percentage", 0)
        skill_gaps = match_result.get("skill_analysis", {}).get("skill_gaps", [])
        
        # Calculate potential improvement
        potential_improvement = min(30, len(skill_gaps) * 5)  # Each skill gap could add ~5%
        potential_match = min(95, current_match + potential_improvement)
        
        return {
            "current_match": current_match,
            "potential_match": potential_match,
            "improvement_possible": potential_improvement,
            "effort_required": self._estimate_effort(len(skill_gaps)),
            "time_estimate": f"{len(skill_gaps) * 2}-{len(skill_gaps) * 4} weeks"
        }
    
    def _estimate_effort(self, gap_count: int) -> str:
        """Estimate effort required."""
        if gap_count <= 2:
            return "Low - Quick wins possible"
        elif gap_count <= 5:
            return "Medium - Moderate effort needed"
        else:
            return "High - Significant investment required"
    
    def _predict_career_trajectory(self, resume_text: str, job_role: str) -> Dict[str, Any]:
        """Predict career trajectory based on current profile."""
        experience_level = self.nlp_service.extract_experience_level(resume_text)
        
        trajectories = {
            "Junior": {
                "next_level": "Mid-level",
                "timeline": "2-3 years",
                "key_milestones": ["Master core skills", "Lead small projects", "Mentor juniors"]
            },
            "Mid-level": {
                "next_level": "Senior",
                "timeline": "3-5 years",
                "key_milestones": ["Lead major projects", "Architect solutions", "Build expertise"]
            },
            "Senior": {
                "next_level": "Lead/Principal",
                "timeline": "3-5 years",
                "key_milestones": ["Drive strategy", "Lead teams", "Industry influence"]
            }
        }
        
        return trajectories.get(experience_level, {
            "next_level": "Senior",
            "timeline": "Varies",
            "key_milestones": ["Build experience", "Develop expertise"]
        })
    
    def _analyze_market_positioning(self, match_result: Dict, benchmark: Dict) -> Dict[str, Any]:
        """Analyze market positioning."""
        match_percentage = match_result.get("match_percentage", 0)
        
        if match_percentage >= 85:
            positioning = "Premium candidate"
            strategy = "Target senior roles and negotiate higher compensation"
        elif match_percentage >= 70:
            positioning = "Competitive candidate"
            strategy = "Apply confidently and highlight unique strengths"
        elif match_percentage >= 55:
            positioning = "Developing candidate"
            strategy = "Focus on skill development and entry-level opportunities"
        else:
            positioning = "Early-stage candidate"
            strategy = "Build fundamental skills and gain experience"
        
        return {
            "positioning": positioning,
            "strategy": strategy,
            "confidence_level": self._calculate_confidence(match_percentage)
        }
    
    def _calculate_confidence(self, match_percentage: float) -> str:
        """Calculate confidence level."""
        if match_percentage >= 80:
            return "High - Strong match"
        elif match_percentage >= 60:
            return "Medium - Good potential"
        else:
            return "Low - Needs improvement"
    
    def _generate_improvement_roadmap(self, match_result: Dict, benchmark: Dict) -> List[Dict[str, Any]]:
        """Generate improvement roadmap."""
        skill_gaps = match_result.get("skill_analysis", {}).get("skill_gaps", [])
        
        roadmap = []
        for i, skill in enumerate(skill_gaps[:5], 1):
            roadmap.append({
                "priority": i,
                "skill": skill.get("name"),
                "importance": skill.get("importance", "High"),
                "learning_resources": self._suggest_resources(skill.get("name")),
                "estimated_time": "2-4 weeks"
            })
        
        return roadmap
    
    def _suggest_resources(self, skill: str) -> List[str]:
        """Suggest learning resources for a skill."""
        # This would ideally connect to a resource database
        return [
            f"Online course: Learn {skill}",
            f"Documentation: {skill} official docs",
            f"Practice: Build a {skill} project"
        ]
    
    def _competitive_analysis(
        self, 
        match_result: Dict, 
        benchmark: Dict,
        db: Optional[Session],
        user_id: Optional[int]
    ) -> Dict[str, Any]:
        """Analyze competitive positioning."""
        
        # Get historical data if available
        if db and user_id:
            recent_analyses = db.query(AnalysisHistory).filter(
                AnalysisHistory.user_id == user_id
            ).order_by(AnalysisHistory.created_at.desc()).limit(10).all()
            
            if recent_analyses:
                avg_match = sum(a.match_percentage for a in recent_analyses) / len(recent_analyses)
                trend = "improving" if recent_analyses[0].match_percentage > avg_match else "stable"
            else:
                avg_match = match_result.get("match_percentage", 0)
                trend = "new"
        else:
            avg_match = match_result.get("match_percentage", 0)
            trend = "unknown"
        
        return {
            "average_performance": round(avg_match, 1),
            "trend": trend,
            "competitive_edge": self._identify_competitive_edge(match_result),
            "market_readiness": self._assess_market_readiness(match_result)
        }
    
    def _identify_competitive_edge(self, match_result: Dict) -> List[str]:
        """Identify competitive advantages."""
        edges = []
        
        if match_result.get("match_percentage", 0) > 80:
            edges.append("High skill match")
        
        matching_skills = match_result.get("skill_analysis", {}).get("matching_skills", [])
        if len(matching_skills) > 10:
            edges.append("Broad skill set")
        
        # Check for specialized skills
        specialized_skills = ["machine learning", "kubernetes", "blockchain", "cloud architecture"]
        if any(skill["name"] in specialized_skills for skill in matching_skills):
            edges.append("Specialized expertise")
        
        return edges if edges else ["Developing profile"]
    
    def _assess_market_readiness(self, match_result: Dict) -> str:
        """Assess market readiness."""
        match_percentage = match_result.get("match_percentage", 0)
        
        if match_percentage >= 75:
            return "Ready - Apply with confidence"
        elif match_percentage >= 60:
            return "Nearly ready - Minor improvements recommended"
        else:
            return "Preparation needed - Focus on skill development"
