"""Analytics service for tracking user metrics."""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.user import AnalysisHistory, User
import json

class AnalyticsService:
    """Service for user analytics and insights."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_dashboard(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive dashboard data for a user."""
        # Total analyses
        total_analyses = self.db.query(AnalysisHistory).filter(
            AnalysisHistory.user_id == user_id
        ).count()
        
        if total_analyses == 0:
            return self._empty_dashboard()
        
        # Get date range
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Recent analyses
        recent_analyses = self.db.query(AnalysisHistory).filter(
            and_(
                AnalysisHistory.user_id == user_id,
                AnalysisHistory.created_at >= thirty_days_ago
            )
        ).all()
        
        # Calculate statistics
        all_matches = [a.match_percentage for a in recent_analyses]
        avg_match = sum(all_matches) / len(all_matches) if all_matches else 0
        
        # Skill frequency analysis
        skill_frequency = self._analyze_skill_frequency(recent_analyses)
        
        # Progress over time
        progress_data = self._calculate_progress(recent_analyses)
        
        # Top skills and gaps
        top_skills, top_gaps = self._analyze_skills(recent_analyses)
        
        return {
            "total_analyses": total_analyses,
            "recent_count": len(recent_analyses),
            "average_match": round(avg_match, 1),
            "best_match": round(max(all_matches), 1) if all_matches else 0,
            "improvement": self._calculate_improvement(recent_analyses),
            "skill_frequency": skill_frequency,
            "progress_chart": progress_data,
            "top_matching_skills": top_skills[:10],
            "common_skill_gaps": top_gaps[:10],
            "last_analysis_date": recent_analyses[0].created_at if recent_analyses else None
        }
    
    def _empty_dashboard(self) -> Dict[str, Any]:
        """Return empty dashboard data."""
        return {
            "total_analyses": 0,
            "recent_count": 0,
            "average_match": 0,
            "best_match": 0,
            "improvement": 0,
            "skill_frequency": {},
            "progress_chart": [],
            "top_matching_skills": [],
            "common_skill_gaps": [],
            "last_analysis_date": None
        }
    
    def _analyze_skill_frequency(self, analyses: List[AnalysisHistory]) -> Dict[str, int]:
        """Analyze frequency of skills across analyses."""
        skill_count = {}
        
        for analysis in analyses:
            if analysis.skill_analysis:
                skills = analysis.skill_analysis.get("matching_skills", [])
                for skill in skills:
                    skill_name = skill.get("name", "")
                    if skill_name:
                        skill_count[skill_name] = skill_count.get(skill_name, 0) + 1
        
        # Sort by frequency and return top 20
        sorted_skills = dict(sorted(
            skill_count.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:20])
        
        return sorted_skills
    
    def _calculate_progress(self, analyses: List[AnalysisHistory]) -> List[Dict]:
        """Calculate progress over time."""
        if not analyses:
            return []
        
        # Sort by date
        sorted_analyses = sorted(analyses, key=lambda x: x.created_at)
        
        progress_data = []
        for analysis in sorted_analyses:
            progress_data.append({
                "date": analysis.created_at.isoformat(),
                "match_percentage": analysis.match_percentage,
                "title": analysis.title or "Untitled Analysis"
            })
        
        return progress_data
    
    def _analyze_skills(self, analyses: List[AnalysisHistory]) -> tuple:
        """Analyze top matching skills and common gaps."""
        matching_skills = {}
        skill_gaps = {}
        
        for analysis in analyses:
            if analysis.skill_analysis:
                # Count matching skills
                for skill in analysis.skill_analysis.get("matching_skills", []):
                    name = skill.get("name", "")
                    if name:
                        matching_skills[name] = matching_skills.get(name, 0) + 1
                
                # Count skill gaps
                for skill in analysis.skill_analysis.get("skill_gaps", []):
                    name = skill.get("name", "")
                    if name:
                        skill_gaps[name] = skill_gaps.get(name, 0) + 1
        
        # Sort and format
        top_skills = [
            {"name": k, "count": v} 
            for k, v in sorted(matching_skills.items(), key=lambda x: x[1], reverse=True)
        ]
        
        top_gaps = [
            {"name": k, "count": v}
            for k, v in sorted(skill_gaps.items(), key=lambda x: x[1], reverse=True)
        ]
        
        return top_skills, top_gaps
    
    def _calculate_improvement(self, analyses: List[AnalysisHistory]) -> float:
        """Calculate improvement trend."""
        if len(analyses) < 2:
            return 0.0
        
        sorted_analyses = sorted(analyses, key=lambda x: x.created_at)
        
        # Compare first half average with second half average
        mid_point = len(sorted_analyses) // 2
        first_half = sorted_analyses[:mid_point]
        second_half = sorted_analyses[mid_point:]
        
        if not first_half or not second_half:
            return 0.0
        
        first_avg = sum(a.match_percentage for a in first_half) / len(first_half)
        second_avg = sum(a.match_percentage for a in second_half) / len(second_half)
        
        improvement = second_avg - first_avg
        return round(improvement, 1)

    def get_skill_trends(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get skill trend analysis."""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        analyses = self.db.query(AnalysisHistory).filter(
            and_(
                AnalysisHistory.user_id == user_id,
                AnalysisHistory.created_at >= cutoff_date
            )
        ).order_by(AnalysisHistory.created_at).all()
        
        if not analyses:
            return {"trending_up": [], "trending_down": [], "stable": []}
        
        # Track skill appearances over time
        skill_timeline = {}
        
        for i, analysis in enumerate(analyses):
            if analysis.skill_analysis:
                matching = set(s.get("name", "") for s in analysis.skill_analysis.get("matching_skills", []))
                for skill in matching:
                    if skill:
                        if skill not in skill_timeline:
                            skill_timeline[skill] = []
                        skill_timeline[skill].append(i)
        
        # Categorize trends
        trending_up = []
        trending_down = []
        stable = []
        
        for skill, appearances in skill_timeline.items():
            if len(appearances) >= 2:
                # Calculate trend
                first_third = len(analyses) // 3
                last_third = 2 * len(analyses) // 3
                
                early_count = sum(1 for a in appearances if a < first_third)
                late_count = sum(1 for a in appearances if a >= last_third)
                
                if late_count > early_count:
                    trending_up.append(skill)
                elif late_count < early_count:
                    trending_down.append(skill)
                else:
                    stable.append(skill)
        
        return {
            "trending_up": trending_up[:5],
            "trending_down": trending_down[:5],
            "stable": stable[:5]
        }
