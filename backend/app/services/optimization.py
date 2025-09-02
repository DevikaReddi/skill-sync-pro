"""Resume optimization service."""
from typing import Dict, List, Any
import re
from app.services.nlp_service import NLPService

class ResumeOptimizer:
    """Optimize resume content for better matching."""
    
    def __init__(self):
        self.nlp_service = NLPService()
        
        # Action verbs for different contexts
        self.action_verbs = {
            "technical": ["developed", "implemented", "designed", "architected", "optimized", "automated", "deployed"],
            "leadership": ["led", "managed", "coordinated", "mentored", "directed", "supervised", "guided"],
            "achievement": ["achieved", "improved", "increased", "reduced", "delivered", "launched", "completed"],
            "analytical": ["analyzed", "evaluated", "assessed", "researched", "investigated", "identified", "measured"]
        }
    
    def optimize_resume(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Generate optimization suggestions for resume."""
        
        suggestions = {
            "keyword_optimization": self._optimize_keywords(resume_text, job_description),
            "structure_improvements": self._analyze_structure(resume_text),
            "action_verb_suggestions": self._suggest_action_verbs(resume_text),
            "quantification_opportunities": self._find_quantification_opportunities(resume_text),
            "formatting_tips": self._formatting_suggestions(resume_text),
            "ats_optimization": self._ats_optimization(resume_text, job_description),
            "overall_score": self._calculate_optimization_score(resume_text, job_description)
        }
        
        return suggestions
    
    def _optimize_keywords(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Optimize keywords for better matching."""
        jd_keywords = self.nlp_service.extract_skills_advanced(job_description)
        resume_keywords = self.nlp_service.extract_skills_advanced(resume_text)
        
        missing_keywords = [kw for kw in jd_keywords if kw not in resume_keywords]
        
        # Find keyword variations
        keyword_variations = self._find_keyword_variations(missing_keywords, resume_text)
        
        return {
            "missing_keywords": missing_keywords[:10],
            "keyword_variations": keyword_variations,
            "keyword_density": self._calculate_keyword_density(resume_text, jd_keywords),
            "suggestions": self._generate_keyword_suggestions(missing_keywords)
        }
    
    def _find_keyword_variations(self, keywords: List[str], text: str) -> Dict[str, str]:
        """Find variations of keywords that might exist."""
        variations = {}
        text_lower = text.lower()
        
        keyword_map = {
            "javascript": ["js", "node.js", "nodejs"],
            "python": ["py", "python3"],
            "kubernetes": ["k8s"],
            "continuous integration": ["ci/cd", "ci"],
            "machine learning": ["ml", "deep learning"]
        }
        
        for keyword in keywords:
            if keyword in keyword_map:
                for variant in keyword_map[keyword]:
                    if variant in text_lower:
                        variations[keyword] = f"Found as '{variant}' - consider using full term"
        
        return variations
    
    def _calculate_keyword_density(self, text: str, keywords: List[str]) -> float:
        """Calculate keyword density."""
        text_lower = text.lower()
        total_words = len(text.split())
        keyword_count = sum(text_lower.count(kw) for kw in keywords)
        
        return round((keyword_count / total_words) * 100, 2) if total_words > 0 else 0
    
    def _generate_keyword_suggestions(self, missing_keywords: List[str]) -> List[str]:
        """Generate suggestions for incorporating keywords."""
        suggestions = []
        
        for keyword in missing_keywords[:5]:
            suggestions.append(f"Add '{keyword}' to relevant experience or skills section")
        
        return suggestions
    
    def _analyze_structure(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume structure."""
        sections = self._detect_sections(resume_text)
        
        recommended_sections = ["contact", "summary", "experience", "education", "skills"]
        missing_sections = [s for s in recommended_sections if s not in sections]
        
        return {
            "detected_sections": sections,
            "missing_sections": missing_sections,
            "section_order_suggestion": recommended_sections,
            "improvements": self._structure_improvements(sections, missing_sections)
        }
    
    def _detect_sections(self, text: str) -> List[str]:
        """Detect sections in resume."""
        sections = []
        section_patterns = {
            "contact": r"(email|phone|linkedin|github)",
            "summary": r"(summary|objective|profile)",
            "experience": r"(experience|work history|employment)",
            "education": r"(education|academic|degree)",
            "skills": r"(skills|technical|competencies)"
        }
        
        text_lower = text.lower()
        for section, pattern in section_patterns.items():
            if re.search(pattern, text_lower):
                sections.append(section)
        
        return sections
    
    def _structure_improvements(self, detected: List[str], missing: List[str]) -> List[str]:
        """Generate structure improvement suggestions."""
        improvements = []
        
        if "summary" in missing:
            improvements.append("Add a professional summary at the beginning")
        if "skills" in missing:
            improvements.append("Create a dedicated skills section")
        if len(detected) < 3:
            improvements.append("Consider adding more structured sections")
        
        return improvements
    
    def _suggest_action_verbs(self, resume_text: str) -> Dict[str, Any]:
        """Suggest stronger action verbs."""
        weak_verbs = ["worked", "helped", "did", "made", "got", "had", "was", "were"]
        
        found_weak_verbs = []
        text_lower = resume_text.lower()
        
        for verb in weak_verbs:
            if verb in text_lower:
                found_weak_verbs.append(verb)
        
        replacements = {
            "worked": self.action_verbs["technical"],
            "helped": ["facilitated", "assisted", "supported", "contributed"],
            "did": self.action_verbs["achievement"],
            "made": ["created", "produced", "generated", "built"]
        }
        
        return {
            "weak_verbs_found": found_weak_verbs,
            "suggested_replacements": {v: replacements.get(v, self.action_verbs["technical"][:3]) 
                                     for v in found_weak_verbs},
            "power_verbs": self.action_verbs["achievement"][:10]
        }
    
    def _find_quantification_opportunities(self, resume_text: str) -> List[str]:
        """Find opportunities to add quantification."""
        opportunities = []
        
        patterns = [
            (r"improved", "Consider quantifying: 'improved by X%'"),
            (r"reduced", "Consider quantifying: 'reduced by X% or $X'"),
            (r"increased", "Consider quantifying: 'increased by X%'"),
            (r"managed", "Consider quantifying: 'managed X people/projects'"),
            (r"led", "Consider quantifying: 'led team of X'"),
            (r"developed", "Consider quantifying: 'developed X features/projects'")
        ]
        
        text_lower = resume_text.lower()
        for pattern, suggestion in patterns:
            if re.search(pattern, text_lower) and not re.search(r"\d+", text_lower):
                opportunities.append(suggestion)
        
        return opportunities[:5]
    
    def _formatting_suggestions(self, resume_text: str) -> List[str]:
        """Generate formatting suggestions."""
        suggestions = []
        
        lines = resume_text.split('\n')
        
        # Check length
        if len(resume_text) > 3000:
            suggestions.append("Consider condensing - aim for 1-2 pages")
        elif len(resume_text) < 500:
            suggestions.append("Add more detail about your experience")
        
        # Check line length
        long_lines = [l for l in lines if len(l) > 100]
        if long_lines:
            suggestions.append("Break long lines into bullet points")
        
        # Check for bullets
        if not any(line.strip().startswith(('•', '-', '*')) for line in lines):
            suggestions.append("Use bullet points for better readability")
        
        return suggestions
    
    def _ats_optimization(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Optimize for ATS (Applicant Tracking System)."""
        
        ats_issues = []
        ats_score = 100
        
        # Check for tables (ATS unfriendly)
        if "table" in resume_text.lower() or "|" in resume_text:
            ats_issues.append("Avoid tables - use simple formatting")
            ats_score -= 20
        
        # Check for special characters
        special_chars = ['©', '®', '™', '♦', '★']
        if any(char in resume_text for char in special_chars):
            ats_issues.append("Remove special characters")
            ats_score -= 10
        
        # Check for standard sections
        standard_sections = ["experience", "education", "skills"]
        text_lower = resume_text.lower()
        for section in standard_sections:
            if section not in text_lower:
                ats_issues.append(f"Add standard section: {section}")
                ats_score -= 10
        
        return {
            "ats_score": max(0, ats_score),
            "issues": ats_issues,
            "recommendations": [
                "Use standard section headings",
                "Avoid graphics and images",
                "Use common fonts",
                "Save as .docx or .pdf"
            ]
        }
    
    def _calculate_optimization_score(self, resume_text: str, job_description: str) -> int:
        """Calculate overall optimization score."""
        score = 50  # Base score
        
        # Keyword match
        jd_keywords = self.nlp_service.extract_skills_advanced(job_description)
        resume_keywords = self.nlp_service.extract_skills_advanced(resume_text)
        keyword_match = len([kw for kw in jd_keywords if kw in resume_keywords]) / len(jd_keywords) if jd_keywords else 0
        score += keyword_match * 30
        
        # Structure
        sections = self._detect_sections(resume_text)
        score += len(sections) * 4
        
        # Length
        if 500 < len(resume_text) < 3000:
            score += 10
        
        return min(100, int(score))
