"""Resume template and export service."""
from typing import Dict, Any, List
from datetime import datetime
import json
from fpdf import FPDF
import io

class ResumeTemplate:
    """Base class for resume templates."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
    
    def generate_html(self, data: Dict[str, Any]) -> str:
        """Generate HTML version of resume."""
        raise NotImplementedError
    
    def generate_text(self, data: Dict[str, Any]) -> str:
        """Generate plain text version of resume."""
        raise NotImplementedError

class ModernTemplate(ResumeTemplate):
    """Modern resume template."""
    
    def __init__(self):
        super().__init__(
            "Modern",
            "Clean and modern design with emphasis on skills"
        )
    
    def generate_html(self, data: Dict[str, Any]) -> str:
        """Generate HTML resume."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                h1 {{
                    color: #2C3E50;
                    border-bottom: 3px solid #3498DB;
                    padding-bottom: 10px;
                }}
                h2 {{
                    color: #34495E;
                    margin-top: 25px;
                    border-bottom: 1px solid #BDC3C7;
                    padding-bottom: 5px;
                }}
                .contact-info {{
                    color: #7F8C8D;
                    margin-bottom: 20px;
                }}
                .skills {{
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin: 10px 0;
                }}
                .skill-tag {{
                    background-color: #3498DB;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 14px;
                }}
                .experience-item {{
                    margin-bottom: 20px;
                }}
                .date {{
                    color: #7F8C8D;
                    font-style: italic;
                }}
            </style>
        </head>
        <body>
            <h1>{data.get('name', 'Your Name')}</h1>
            
            <div class="contact-info">
                {data.get('email', 'email@example.com')} | 
                {data.get('phone', '123-456-7890')} | 
                {data.get('location', 'City, State')}
            </div>
            
            <h2>Professional Summary</h2>
            <p>{data.get('summary', 'Professional summary goes here...')}</p>
            
            <h2>Skills</h2>
            <div class="skills">
                {self._generate_skills_html(data.get('skills', []))}
            </div>
            
            <h2>Professional Experience</h2>
            {self._generate_experience_html(data.get('experience', []))}
            
            <h2>Education</h2>
            {self._generate_education_html(data.get('education', []))}
        </body>
        </html>
        """
    
    def _generate_skills_html(self, skills: List[str]) -> str:
        """Generate HTML for skills."""
        return ''.join(f'<span class="skill-tag">{skill}</span>' for skill in skills)
    
    def _generate_experience_html(self, experience: List[Dict]) -> str:
        """Generate HTML for experience."""
        html = ""
        for exp in experience:
            html += f"""
            <div class="experience-item">
                <h3>{exp.get('title', 'Job Title')} - {exp.get('company', 'Company Name')}</h3>
                <div class="date">{exp.get('start_date', 'Start')} - {exp.get('end_date', 'Present')}</div>
                <p>{exp.get('description', 'Job description...')}</p>
            </div>
            """
        return html
    
    def _generate_education_html(self, education: List[Dict]) -> str:
        """Generate HTML for education."""
        html = ""
        for edu in education:
            html += f"""
            <div>
                <h3>{edu.get('degree', 'Degree')} - {edu.get('school', 'School Name')}</h3>
                <div class="date">{edu.get('graduation_date', 'Graduation Date')}</div>
            </div>
            """
        return html
    
    def generate_text(self, data: Dict[str, Any]) -> str:
        """Generate plain text resume."""
        text = f"""
{data.get('name', 'Your Name').upper()}
{data.get('email', 'email@example.com')} | {data.get('phone', '123-456-7890')} | {data.get('location', 'City, State')}

PROFESSIONAL SUMMARY
{data.get('summary', 'Professional summary goes here...')}

SKILLS
{', '.join(data.get('skills', []))}

PROFESSIONAL EXPERIENCE
"""
        for exp in data.get('experience', []):
            text += f"""
{exp.get('title', 'Job Title')} - {exp.get('company', 'Company Name')}
{exp.get('start_date', 'Start')} - {exp.get('end_date', 'Present')}
{exp.get('description', 'Job description...')}
"""
        
        text += "\nEDUCATION\n"
        for edu in data.get('education', []):
            text += f"""
{edu.get('degree', 'Degree')} - {edu.get('school', 'School Name')}
{edu.get('graduation_date', 'Graduation Date')}
"""
        
        return text

class ATSTemplate(ResumeTemplate):
    """ATS-friendly resume template."""
    
    def __init__(self):
        super().__init__(
            "ATS-Friendly",
            "Optimized for Applicant Tracking Systems"
        )
    
    def generate_html(self, data: Dict[str, Any]) -> str:
        """Generate ATS-friendly HTML."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    color: #000;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                h1, h2, h3 {{
                    color: #000;
                    font-weight: bold;
                }}
                h1 {{
                    font-size: 24px;
                    margin-bottom: 5px;
                }}
                h2 {{
                    font-size: 18px;
                    margin-top: 20px;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                }}
                h3 {{
                    font-size: 16px;
                    margin-bottom: 5px;
                }}
                p, li {{
                    margin: 5px 0;
                }}
                ul {{
                    margin: 10px 0;
                    padding-left: 20px;
                }}
            </style>
        </head>
        <body>
            <h1>{data.get('name', 'Your Name')}</h1>
            <p>{data.get('email', 'email@example.com')} | {data.get('phone', '123-456-7890')} | {data.get('location', 'City, State')}</p>
            
            <h2>Summary</h2>
            <p>{data.get('summary', 'Professional summary goes here...')}</p>
            
            <h2>Skills</h2>
            <p>{', '.join(data.get('skills', []))}</p>
            
            <h2>Experience</h2>
            {self._generate_ats_experience(data.get('experience', []))}
            
            <h2>Education</h2>
            {self._generate_ats_education(data.get('education', []))}
        </body>
        </html>
        """
    
    def _generate_ats_experience(self, experience: List[Dict]) -> str:
        """Generate ATS-friendly experience section."""
        html = ""
        for exp in experience:
            html += f"""
            <h3>{exp.get('title', 'Job Title')}</h3>
            <p>{exp.get('company', 'Company Name')} | {exp.get('start_date', 'Start')} - {exp.get('end_date', 'Present')}</p>
            <ul>
                <li>{exp.get('description', 'Job description...')}</li>
            </ul>
            """
        return html
    
    def _generate_ats_education(self, education: List[Dict]) -> str:
        """Generate ATS-friendly education section."""
        html = ""
        for edu in education:
            html += f"""
            <p><strong>{edu.get('degree', 'Degree')}</strong>, {edu.get('school', 'School Name')}, {edu.get('graduation_date', 'Graduation Date')}</p>
            """
        return html
    
    def generate_text(self, data: Dict[str, Any]) -> str:
        """Generate ATS-friendly plain text."""
        return super().generate_text(data)  # Same as modern template for text

class TemplateManager:
    """Manage resume templates."""
    
    def __init__(self):
        self.templates = {
            "modern": ModernTemplate(),
            "ats": ATSTemplate()
        }
    
    def get_template(self, template_name: str) -> ResumeTemplate:
        """Get a template by name."""
        return self.templates.get(template_name, ModernTemplate())
    
    def list_templates(self) -> List[Dict[str, str]]:
        """List available templates."""
        return [
            {"name": name, "description": template.description}
            for name, template in self.templates.items()
        ]
    
    def generate_resume(
        self,
        template_name: str,
        data: Dict[str, Any],
        format: str = "html"
    ) -> str:
        """Generate resume using specified template."""
        template = self.get_template(template_name)
        
        if format == "html":
            return template.generate_html(data)
        elif format == "text":
            return template.generate_text(data)
        else:
            raise ValueError(f"Unsupported format: {format}")
