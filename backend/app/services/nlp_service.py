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
        
        # Common words to exclude (not skills)
        self.stop_words = {
            'experience', 'experienced', 'work', 'working', 'worked', 'develop', 'developed',
            'developing', 'build', 'built', 'building', 'create', 'created', 'creating',
            'year', 'years', 'month', 'months', 'day', 'days', 'responsible', 'responsibility',
            'responsibilities', 'required', 'requirement', 'requirements', 'skill', 'skills',
            'team', 'teams', 'project', 'projects', 'company', 'companies', 'client', 'clients',
            'application', 'applications', 'system', 'systems', 'software', 'development',
            'looking', 'seeking', 'need', 'needs', 'must', 'have', 'should', 'would', 'could',
            'will', 'can', 'using', 'used', 'use', 'including', 'include', 'includes',
            'knowledge', 'understanding', 'familiar', 'familiarity', 'proficient', 'proficiency',
            'strong', 'good', 'excellent', 'expert', 'expertise', 'advanced', 'basic',
            'minimum', 'maximum', 'least', 'most', 'more', 'less', 'better', 'best',
            'new', 'existing', 'current', 'previous', 'present', 'past', 'future',
            'first', 'second', 'third', 'last', 'next', 'other', 'another', 'each',
            'all', 'some', 'any', 'many', 'few', 'several', 'various', 'multiple',
            'single', 'double', 'triple', 'high', 'low', 'medium', 'large', 'small',
            'big', 'little', 'long', 'short', 'wide', 'narrow', 'deep', 'shallow',
            'etc', 'e.g', 'i.e', 'ex', 'example', 'examples', 'such', 'like',
            'bachelors', 'masters', 'degree', 'certification', 'certified', 'certificate',
            'university', 'college', 'school', 'education', 'graduate', 'undergraduate',
            'senior', 'junior', 'lead', 'principal', 'staff', 'engineer', 'developer',
            'manager', 'director', 'architect', 'analyst', 'consultant', 'specialist',
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'shall', 'may', 'might', 'must', 'can', 'could', 'would', 'should'
        }
        
        # Known technology skills (comprehensive list)
        self.known_skills = {
            # Programming Languages
            'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'golang',
            'rust', 'swift', 'kotlin', 'scala', 'php', 'perl', 'r', 'matlab', 'julia',
            'objective-c', 'dart', 'lua', 'haskell', 'clojure', 'elixir', 'erlang', 'f#',
            
            # Frontend
            'react', 'react.js', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'vuejs',
            'svelte', 'next.js', 'nextjs', 'nuxt.js', 'nuxtjs', 'gatsby', 'ember', 'backbone',
            'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'stylus',
            'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui', 'antd', 'chakra-ui',
            'styled-components', 'emotion', 'jquery', 'webpack', 'vite', 'parcel', 'rollup',
            'babel', 'redux', 'mobx', 'zustand', 'recoil', 'jest', 'cypress', 'playwright',
            
            # Backend
            'node.js', 'nodejs', 'node', 'express', 'express.js', 'fastapi', 'django', 'flask',
            'spring', 'spring-boot', 'springboot', 'rails', 'ruby-on-rails', 'laravel',
            'asp.net', '.net', 'dotnet', 'gin', 'echo', 'fiber', 'koa', 'nestjs', 'nest.js',
            'fastify', 'hapi', 'strapi', 'graphql', 'rest', 'restful', 'soap', 'grpc',
            'microservices', 'serverless', 'lambda', 'api', 'oauth', 'jwt', 'websocket',
            
            # Databases
            'sql', 'nosql', 'postgresql', 'postgres', 'mysql', 'mariadb', 'mongodb', 'redis',
            'elasticsearch', 'elastic', 'cassandra', 'dynamodb', 'sqlite', 'oracle',
            'sqlserver', 'sql-server', 'mssql', 'neo4j', 'couchdb', 'firebase', 'firestore',
            'supabase', 'prisma', 'sequelize', 'typeorm', 'mongoose', 'knex', 'drizzle',
            
            # Cloud & DevOps
            'aws', 'amazon-web-services', 'azure', 'gcp', 'google-cloud', 'google-cloud-platform',
            'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab', 'github', 'git', 'bitbucket',
            'terraform', 'ansible', 'puppet', 'chef', 'helm', 'istio', 'consul', 'vault',
            'ci/cd', 'cicd', 'travis', 'circleci', 'github-actions', 'gitlab-ci', 'argocd',
            'prometheus', 'grafana', 'datadog', 'newrelic', 'elk', 'kibana', 'logstash',
            'nginx', 'apache', 'caddy', 'haproxy', 'cloudflare', 'cdn', 'load-balancing',
            'linux', 'ubuntu', 'centos', 'rhel', 'debian', 'bash', 'shell', 'powershell',
            
            # Data & AI/ML
            'machine-learning', 'ml', 'deep-learning', 'dl', 'artificial-intelligence', 'ai',
            'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
            'matplotlib', 'seaborn', 'plotly', 'jupyter', 'notebook', 'colab', 'nltk',
            'spacy', 'opencv', 'computer-vision', 'nlp', 'natural-language-processing',
            'bert', 'gpt', 'transformer', 'lstm', 'cnn', 'rnn', 'gan', 'reinforcement-learning',
            'hadoop', 'spark', 'pyspark', 'hive', 'presto', 'flink', 'kafka', 'airflow',
            'tableau', 'power-bi', 'powerbi', 'looker', 'metabase', 'superset', 'dbt',
            
            # Mobile
            'ios', 'android', 'react-native', 'flutter', 'xamarin', 'ionic', 'cordova',
            'swift-ui', 'swiftui', 'jetpack-compose', 'expo', 'capacitor',
            
            # Testing
            'unit-testing', 'integration-testing', 'e2e-testing', 'tdd', 'bdd', 'pytest',
            'unittest', 'mocha', 'chai', 'jasmine', 'karma', 'selenium', 'puppeteer',
            'postman', 'insomnia', 'jmeter', 'locust', 'vitest',
            
            # Other Tools & Concepts
            'agile', 'scrum', 'kanban', 'jira', 'confluence', 'slack', 'trello', 'asana',
            'figma', 'sketch', 'adobe-xd', 'photoshop', 'illustrator', 'ui/ux', 'ux/ui',
            'vscode', 'vs-code', 'intellij', 'eclipse', 'vim', 'emacs', 'sublime',
            'blockchain', 'web3', 'ethereum', 'solidity', 'smart-contracts', 'nft', 'defi',
            'ar', 'vr', 'unity', 'unreal-engine', 'three.js', 'threejs', 'webgl', 'canvas'
        }
    
    def extract_skills_advanced(self, text: str) -> Set[str]:
        """Extract skills using advanced NLP techniques with better filtering."""
        text_lower = text.lower()
        skills = set()
        
        # Method 1: Direct matching with known skills
        for skill in self.known_skills:
            # Check for word boundaries to avoid partial matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                skills.add(skill)
        
        # Method 2: Extract multi-word technical terms
        multi_word_patterns = [
            r'machine\s+learning',
            r'deep\s+learning',
            r'computer\s+vision',
            r'natural\s+language\s+processing',
            r'version\s+control',
            r'full[\s\-]?stack',
            r'front[\s\-]?end',
            r'back[\s\-]?end',
            r'dev[\s\-]?ops',
            r'data\s+science',
            r'data\s+analysis',
            r'data\s+engineering',
            r'cloud\s+computing',
            r'web\s+development',
            r'mobile\s+development',
            r'cross[\s\-]platform',
            r'real[\s\-]time',
            r'open[\s\-]source',
            r'load\s+balancing',
            r'message\s+queue',
            r'event[\s\-]driven',
            r'test[\s\-]driven',
            r'object[\s\-]oriented',
            r'functional\s+programming',
            r'reactive\s+programming',
            r'distributed\s+systems',
            r'high\s+availability',
            r'fault\s+tolerance',
            r'elastic\s+search',
            r'big\s+data',
            r'business\s+intelligence',
            r'continuous\s+integration',
            r'continuous\s+deployment',
        ]
        
        for pattern in multi_word_patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                skill_text = match.group().replace(' ', '-')
                skills.add(skill_text)
        
        # Method 3: Extract technology names with version numbers
        version_pattern = r'\b([a-zA-Z]+[\w]*)\s*(?:v?[\d\.]+)\b'
        matches = re.finditer(version_pattern, text_lower)
        for match in matches:
            potential_skill = match.group(1).lower()
            if potential_skill in self.known_skills:
                skills.add(potential_skill)
        
        # Method 4: Extract from common phrases like "experience with X"
        experience_patterns = [
            r'experience\s+(?:with|in)\s+([a-zA-Z][\w\.\#\+\-]*)',
            r'knowledge\s+of\s+([a-zA-Z][\w\.\#\+\-]*)',
            r'proficient\s+in\s+([a-zA-Z][\w\.\#\+\-]*)',
            r'familiar\s+with\s+([a-zA-Z][\w\.\#\+\-]*)',
            r'worked\s+with\s+([a-zA-Z][\w\.\#\+\-]*)',
            r'using\s+([a-zA-Z][\w\.\#\+\-]*)',
            r'skills?:\s*([^\.]+)',  # Skills: Python, Java, etc.
        ]
        
        for pattern in experience_patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                potential_skills = match.group(1).split(',')
                for ps in potential_skills:
                    ps_clean = ps.strip().lower()
                    # Remove "and", "or" connectors
                    ps_clean = re.sub(r'\b(and|or)\b', '', ps_clean).strip()
                    if ps_clean in self.known_skills:
                        skills.add(ps_clean)
        
        # Method 5: Use spaCy NER for proper nouns that might be technologies
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART"]:
                ent_lower = ent.text.lower()
                if ent_lower in self.known_skills:
                    skills.add(ent_lower)
        
        # Clean up skills - remove any that are too short or in stop words
        cleaned_skills = set()
        for skill in skills:
            # Remove extra spaces and clean up
            skill = re.sub(r'\s+', '-', skill.strip())
            skill = re.sub(r'[^\w\-\.\#\+]', '', skill)
            
            # Filter out bad skills
            if (len(skill) > 1 and 
                skill not in self.stop_words and 
                not skill.isdigit() and
                any(c.isalpha() for c in skill)):
                cleaned_skills.add(skill)
        
        return cleaned_skills
    
    def calculate_semantic_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts."""
        doc1 = self.nlp(text1[:1000])  # Limit text length for performance
        doc2 = self.nlp(text2[:1000])
        
        if doc1.vector_norm and doc2.vector_norm:
            return doc1.similarity(doc2)
        return 0.0
    
    def extract_experience_level(self, text: str) -> str:
        """Extract experience level from text."""
        text_lower = text.lower()
        
        # Look for year patterns
        year_pattern = r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience)?'
        matches = re.findall(year_pattern, text_lower)
        
        if matches:
            years = max(int(m) for m in matches if m.isdigit())
            if years >= 10:
                return "Senior/Lead"
            elif years >= 5:
                return "Senior"
            elif years >= 3:
                return "Mid-level"
            elif years >= 1:
                return "Junior"
            else:
                return "Entry-level"
        
        # Check for level indicators
        if re.search(r'\b(senior|sr\.?|lead|principal|staff|architect)\b', text_lower):
            return "Senior"
        elif re.search(r'\b(mid[\s\-]?level|intermediate|experienced)\b', text_lower):
            return "Mid-level"
        elif re.search(r'\b(junior|jr\.?|entry[\s\-]?level|beginner|intern)\b', text_lower):
            return "Junior"
        
        return "Not specified"
    
    def extract_key_phrases(self, text: str, top_n: int = 10) -> List[Tuple[str, float]]:
        """Extract key phrases using TF-IDF-like scoring."""
        doc = self.nlp(text[:1000])  # Limit for performance
        
        phrases = []
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.lower().strip()
            if (len(chunk_text) > 2 and 
                chunk_text not in self.stop_words and
                not any(word in chunk_text for word in ['experience', 'year', 'position'])):
                phrases.append(chunk_text)
        
        # Count and score
        phrase_freq = Counter(phrases)
        scored_phrases = []
        for phrase, freq in phrase_freq.items():
            # Prefer longer, more specific phrases
            score = freq * (1 + len(phrase.split()) * 0.2)
            scored_phrases.append((phrase, score))
        
        scored_phrases.sort(key=lambda x: x[1], reverse=True)
        return scored_phrases[:top_n]
    
    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities from text."""
        doc = self.nlp(text[:1000])
        entities = {
            "organizations": [],
            "locations": [],
            "technologies": []
        }
        
        for ent in doc.ents:
            if ent.label_ == "ORG":
                entities["organizations"].append(ent.text)
            elif ent.label_ in ["GPE", "LOC"]:
                entities["locations"].append(ent.text)
        
        return entities
