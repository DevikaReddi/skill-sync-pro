"""Text processing utilities for resume and job description analysis."""
import re
from typing import List, Dict, Set
import logging

logger = logging.getLogger(__name__)

class TextProcessor:
    """Handles text preprocessing and cleaning."""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize text."""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep important ones
        text = re.sub(r'[^\w\s\-\+\#\.\,\;\:\@]', '', text)
        # Remove URLs
        text = re.sub(r'http\S+|www.\S+', '', text)
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        return text.strip()
    
    @staticmethod
    def extract_sections(text: str) -> Dict[str, str]:
        """Extract common resume/JD sections."""
        sections = {
            'skills': '',
            'experience': '',
            'education': '',
            'requirements': '',
            'responsibilities': ''
        }
        
        # Common section headers
        section_patterns = {
            'skills': r'(?:skills|technologies|technical skills|competencies)[\s\:]*',
            'experience': r'(?:experience|work history|employment|professional experience)[\s\:]*',
            'education': r'(?:education|academic|qualification|degree)[\s\:]*',
            'requirements': r'(?:requirements|required|must have|qualifications)[\s\:]*',
            'responsibilities': r'(?:responsibilities|duties|role|you will)[\s\:]*'
        }
        
        text_lower = text.lower()
        
        for section, pattern in section_patterns.items():
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                start = match.end()
                # Find the next section or end of text
                next_section_start = len(text)
                for other_pattern in section_patterns.values():
                    if other_pattern != pattern:
                        next_match = re.search(other_pattern, text_lower[start:], re.IGNORECASE)
                        if next_match:
                            next_section_start = min(next_section_start, start + next_match.start())
                
                sections[section] = text[start:next_section_start].strip()
        
        return sections
    
    @staticmethod
    def tokenize(text: str) -> List[str]:
        """Simple tokenization."""
        # Convert to lowercase and split
        tokens = text.lower().split()
        # Remove punctuation from tokens
        tokens = [re.sub(r'[^\w\-\+\#]', '', token) for token in tokens]
        # Remove empty tokens
        tokens = [token for token in tokens if token]
        return tokens
    
    @staticmethod
    def extract_keywords(text: str, min_length: int = 2) -> Set[str]:
        """Extract potential keywords/skills from text."""
        # Common tech skills and keywords (expand this list)
        tech_keywords = {
            # Programming Languages
            'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
            'kotlin', 'scala', 'php', 'perl', 'r', 'matlab', 'sql', 'bash', 'powershell',
            
            # Frontend
            'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby', 'webpack', 'vite',
            'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'jquery',
            
            # Backend
            'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails', '.net', 'laravel',
            
            # Databases
            'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
            'sqlite', 'oracle', 'neo4j', 'firebase', 'supabase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'git',
            'terraform', 'ansible', 'puppet', 'chef', 'circleci', 'travis', 'heroku', 'vercel',
            
            # Data & AI
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
            'numpy', 'jupyter', 'tableau', 'power bi', 'spark', 'hadoop', 'airflow',
            
            # Other
            'agile', 'scrum', 'jira', 'confluence', 'rest', 'graphql', 'api', 'microservices',
            'ci/cd', 'tdd', 'linux', 'unix', 'windows', 'macos', 'mobile', 'ios', 'android'
        }
        
        tokens = TextProcessor.tokenize(text)
        keywords = set()
        
        # Check for exact matches
        for token in tokens:
            if len(token) >= min_length:
                if token in tech_keywords:
                    keywords.add(token)
        
        # Check for compound terms (like "machine learning")
        text_lower = text.lower()
        for keyword in tech_keywords:
            if ' ' in keyword and keyword in text_lower:
                keywords.add(keyword)
        
        return keywords


class SkillMatcher:
    """Handles skill matching and analysis."""
    
    @staticmethod
    def calculate_match_score(resume_skills: Set[str], jd_skills: Set[str]) -> float:
        """Calculate match percentage between resume and JD skills."""
        if not jd_skills:
            return 0.0
        
        matching = resume_skills.intersection(jd_skills)
        return (len(matching) / len(jd_skills)) * 100
    
    @staticmethod
    def categorize_skills(resume_skills: Set[str], jd_skills: Set[str]) -> Dict[str, List[str]]:
        """Categorize skills into matching, gaps, and unique."""
        return {
            'matching': sorted(list(resume_skills.intersection(jd_skills))),
            'gaps': sorted(list(jd_skills - resume_skills)),
            'unique': sorted(list(resume_skills - jd_skills))
        }
    
    @staticmethod
    def generate_recommendations(skill_gaps: List[str]) -> List[str]:
        """Generate recommendations based on skill gaps."""
        recommendations = []
        
        if not skill_gaps:
            recommendations.append("Great match! Your skills align well with the job requirements.")
        else:
            # Priority skills (commonly important)
            priority_skills = {'docker', 'kubernetes', 'aws', 'react', 'python', 'javascript'}
            priority_gaps = [skill for skill in skill_gaps if skill in priority_skills]
            
            if priority_gaps:
                recommendations.append(f"Priority skills to focus on: {', '.join(priority_gaps[:3])}")
            
            if len(skill_gaps) > 5:
                recommendations.append(f"Consider focusing on the top {min(5, len(skill_gaps))} missing skills first")
            
            # Skill category recommendations
            cloud_skills = {'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'}
            if any(skill in skill_gaps for skill in cloud_skills):
                recommendations.append("Consider gaining cloud/DevOps experience through hands-on projects")
            
            frontend_skills = {'react', 'angular', 'vue', 'javascript', 'typescript', 'css'}
            if any(skill in skill_gaps for skill in frontend_skills):
                recommendations.append("Strengthen your frontend development skills with modern frameworks")
            
            data_skills = {'python', 'pandas', 'numpy', 'sql', 'tableau', 'machine learning'}
            if any(skill in skill_gaps for skill in data_skills):
                recommendations.append("Data analysis skills are in high demand - consider online courses")
        
        return recommendations[:5]  # Limit to 5 recommendations
