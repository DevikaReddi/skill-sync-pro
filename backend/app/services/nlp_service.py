"""NLP service using spaCy for advanced text processing."""
import spacy
from typing import List, Dict, Set, Tuple
import re
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class NLPService:
    """Advanced NLP processing using spaCy."""
    
    def __init__(self):
        """Initialize spaCy model."""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.error("spaCy model not found. Installing...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")
        
        # Add custom stop words for resume/JD context
        self.custom_stop_words = {
            'experience', 'experienced', 'work', 'working', 'worked',
            'develop', 'developed', 'developing', 'build', 'built', 'building',
            'create', 'created', 'creating', 'year', 'years', 'month', 'months',
            'responsible', 'responsibility', 'responsibilities', 'required',
            'requirement', 'requirements', 'skill', 'skills', 'etc', 'team'
        }
        
        # Skill patterns for better extraction
        self.skill_patterns = [
            {"label": "SKILL", "pattern": [{"LOWER": "machine"}, {"LOWER": "learning"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "deep"}, {"LOWER": "learning"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "natural"}, {"LOWER": "language"}, {"LOWER": "processing"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "computer"}, {"LOWER": "vision"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "data"}, {"LOWER": "science"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "data"}, {"LOWER": "analysis"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "web"}, {"LOWER": "development"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "full"}, {"LOWER": "stack"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "ci"}, {"LOWER": "cd"}]},
            {"label": "SKILL", "pattern": [{"LOWER": "version"}, {"LOWER": "control"}]},
        ]
        
        # Add ruler for multi-word skills
        ruler = self.nlp.add_pipe("entity_ruler", before="ner")
        ruler.add_patterns(self.skill_patterns)
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities from text."""
        doc = self.nlp(text)
        entities = {
            "skills": [],
            "organizations": [],
            "technologies": [],
            "certifications": []
        }
        
        for ent in doc.ents:
            if ent.label_ in ["ORG", "COMPANY"]:
                entities["organizations"].append(ent.text)
            elif ent.label_ == "SKILL":
                entities["skills"].append(ent.text.lower())
        
        return entities
    
    def extract_skills_advanced(self, text: str) -> Set[str]:
        """Extract skills using advanced NLP techniques."""
        doc = self.nlp(text.lower())
        skills = set()
        
        # 1. Extract noun phrases that might be skills
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.strip()
            # Filter out common non-skill phrases
            if (len(chunk_text) > 2 and 
                chunk_text not in self.custom_stop_words and
                not any(word in chunk_text for word in ['experience', 'year', 'position', 'role'])):
                
                # Check if it contains known tech terms
                tech_indicators = ['framework', 'library', 'platform', 'tool', 'language',
                                 'database', 'server', 'cloud', 'api', 'sdk']
                if any(indicator in chunk_text for indicator in tech_indicators):
                    skills.add(chunk_text)
        
        # 2. Extract proper nouns (often technologies)
        for token in doc:
            if token.pos_ == "PROPN" and len(token.text) > 1:
                # Check if it looks like a technology
                if (token.text[0].isupper() or 
                    any(char.isdigit() for char in token.text) or
                    '.' in token.text):
                    skills.add(token.text.lower())
        
        # 3. Extract using dependency parsing
        for token in doc:
            # Find objects of prepositions (often skills after "experience in", "knowledge of")
            if token.dep_ == "pobj" and token.head.text in ["in", "of", "with"]:
                if token.pos_ in ["NOUN", "PROPN"] and len(token.text) > 2:
                    skills.add(token.text)
        
        # 4. Pattern matching for common skill formats
        skill_patterns = [
            r'\b[A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)+\b',  # Matches: React.js, Node.js
            r'\b[A-Z]+[a-z]+[A-Z][a-z]+\b',  # Matches: JavaScript, TypeScript
            r'\b[A-Z]{2,}(?:/[A-Z]+)*\b',  # Matches: CI/CD, REST/SOAP
            r'\b(?:python|java|javascript|typescript|react|angular|vue|docker|kubernetes|aws|azure|gcp)\b',
        ]
        
        for pattern in skill_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                skills.add(match.group().lower())
        
        # 5. Extract from bullet points (commonly used in resumes)
        bullet_pattern = r'[•·\-*]\s*([^•·\-*\n]+)'
        bullets = re.findall(bullet_pattern, text)
        for bullet in bullets:
            # Extract first few words which often contain skills
            words = bullet.split()[:5]
            for word in words:
                if len(word) > 2 and word.lower() not in self.custom_stop_words:
                    if word[0].isupper() or '.' in word:
                        skills.add(word.lower())
        
        # Clean up extracted skills
        cleaned_skills = set()
        for skill in skills:
            # Remove punctuation and extra spaces
            cleaned = re.sub(r'[^\w\s\-\+\#/.]', '', skill).strip()
            if cleaned and len(cleaned) > 1:
                cleaned_skills.add(cleaned)
        
        return cleaned_skills
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts."""
        doc1 = self.nlp(text1)
        doc2 = self.nlp(text2)
        
        # Use spaCy's built-in similarity (requires vectors)
        if doc1.vector_norm and doc2.vector_norm:
            return doc1.similarity(doc2)
        return 0.0
    
    def extract_experience_level(self, text: str) -> str:
        """Extract experience level from text."""
        doc = self.nlp(text.lower())
        
        # Look for year patterns
        year_pattern = r'(\d+)\+?\s*(?:years?|yrs?)'
        matches = re.findall(year_pattern, text.lower())
        
        if matches:
            years = max(int(m) for m in matches)
            if years >= 10:
                return "Senior/Lead"
            elif years >= 5:
                return "Senior"
            elif years >= 3:
                return "Mid-level"
            elif years >= 1:
                return "Junior"
        
        # Check for level indicators in text
        level_indicators = {
            "senior": "Senior",
            "lead": "Lead",
            "principal": "Principal",
            "staff": "Staff",
            "junior": "Junior",
            "entry": "Entry-level",
            "intern": "Intern",
            "mid-level": "Mid-level",
            "experienced": "Mid-level"
        }
        
        for indicator, level in level_indicators.items():
            if indicator in text.lower():
                return level
        
        return "Not specified"
    
    def extract_key_phrases(self, text: str, top_n: int = 10) -> List[Tuple[str, float]]:
        """Extract key phrases using TF-IDF-like scoring."""
        doc = self.nlp(text.lower())
        
        # Extract noun phrases
        phrases = []
        for chunk in doc.noun_chunks:
            if len(chunk.text) > 2 and chunk.text not in self.custom_stop_words:
                phrases.append(chunk.text)
        
        # Count frequency
        phrase_freq = Counter(phrases)
        
        # Score based on frequency and length (longer phrases are more specific)
        scored_phrases = []
        for phrase, freq in phrase_freq.items():
            score = freq * (1 + len(phrase.split()) * 0.1)
            scored_phrases.append((phrase, score))
        
        # Sort by score and return top N
        scored_phrases.sort(key=lambda x: x[1], reverse=True)
        return scored_phrases[:top_n]
