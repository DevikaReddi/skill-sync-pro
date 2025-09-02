"""PDF parsing service for resume extraction."""
import io
import re
from typing import Optional, Dict, Any
import PyPDF2
import pdfplumber
import logging

logger = logging.getLogger(__name__)

class PDFParser:
    """Service for parsing PDF resumes."""
    
    def extract_text_from_pdf(self, pdf_file: bytes) -> Optional[str]:
        """Extract text from PDF file."""
        try:
            # Try with pdfplumber first (better for complex layouts)
            text = self._extract_with_pdfplumber(pdf_file)
            if text and len(text) > 100:
                return self._clean_extracted_text(text)
            
            # Fallback to PyPDF2
            text = self._extract_with_pypdf2(pdf_file)
            if text:
                return self._clean_extracted_text(text)
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            return None
    
    def _extract_with_pdfplumber(self, pdf_file: bytes) -> Optional[str]:
        """Extract text using pdfplumber."""
        try:
            text_parts = []
            with pdfplumber.open(io.BytesIO(pdf_file)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            
            return '\n'.join(text_parts) if text_parts else None
            
        except Exception as e:
            logger.warning(f"pdfplumber extraction failed: {e}")
            return None
    
    def _extract_with_pypdf2(self, pdf_file: bytes) -> Optional[str]:
        """Extract text using PyPDF2."""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file))
            text_parts = []
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                if text:
                    text_parts.append(text)
            
            return '\n'.join(text_parts) if text_parts else None
            
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed: {e}")
            return None
    
    def _clean_extracted_text(self, text: str) -> str:
        """Clean and format extracted text."""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Fix common extraction issues
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # Add space between camelCase
        text = re.sub(r'(\w)([•●▪])', r'\1 \2', text)  # Add space before bullets
        
        # Restore line breaks for common sections
        section_headers = [
            'EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY', 'OBJECTIVE',
            'PROJECTS', 'CERTIFICATIONS', 'ACHIEVEMENTS', 'REFERENCES'
        ]
        
        for header in section_headers:
            text = re.sub(f'({header})', r'\n\n\1\n', text, flags=re.IGNORECASE)
        
        # Clean up multiple line breaks
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()
    
    def validate_resume_content(self, text: str) -> Dict[str, Any]:
        """Validate if extracted text is a valid resume."""
        validation = {
            "is_valid": True,
            "issues": [],
            "confidence": 100
        }
        
        # Check minimum length
        if len(text) < 100:
            validation["is_valid"] = False
            validation["issues"].append("Text too short to be a valid resume")
            validation["confidence"] -= 50
        
        # Check for resume indicators
        resume_indicators = ['experience', 'education', 'skills', 'work', 'professional']
        text_lower = text.lower()
        
        indicator_count = sum(1 for indicator in resume_indicators if indicator in text_lower)
        if indicator_count < 2:
            validation["issues"].append("Missing common resume sections")
            validation["confidence"] -= 30
        
        # Check for contact information patterns
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        
        has_email = bool(re.search(email_pattern, text))
        has_phone = bool(re.search(phone_pattern, text))
        
        if not has_email and not has_phone:
            validation["issues"].append("No contact information found")
            validation["confidence"] -= 20
        
        validation["confidence"] = max(0, validation["confidence"])
        if validation["confidence"] < 50:
            validation["is_valid"] = False
        
        return validation

class DocumentProcessor:
    """Process various document formats."""
    
    def __init__(self):
        self.pdf_parser = PDFParser()
        self.supported_formats = ['.pdf', '.txt', '.docx']
    
    def process_document(self, file_content: bytes, file_type: str) -> Optional[str]:
        """Process document based on file type."""
        if file_type == 'application/pdf':
            return self.pdf_parser.extract_text_from_pdf(file_content)
        elif file_type == 'text/plain':
            return file_content.decode('utf-8', errors='ignore')
        else:
            return None
    
    def is_supported_format(self, file_type: str) -> bool:
        """Check if file format is supported."""
        supported_types = [
            'application/pdf',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        return file_type in supported_types
