"""Embeddings service using simpler approach without heavy ML dependencies."""
import numpy as np
from typing import List, Dict, Tuple
import pickle
import os
from pathlib import Path
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class EmbeddingsService:
    """Service for generating and managing skill embeddings using TF-IDF."""
    
    def __init__(self):
        """Initialize the embeddings service."""
        logger.info("Initializing EmbeddingsService...")
        
        # Cache directory for embeddings
        self.cache_dir = Path("cache/embeddings")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Initialize skill database
        self.skill_database = self._initialize_skill_database()
        
        # Fit vectorizer on all skills
        all_descriptions = [data["description"] for data in self.skill_database.values()]
        self.skill_vectors = self.vectorizer.fit_transform(all_descriptions)
        
        logger.info("EmbeddingsService initialized successfully")
    
    def _initialize_skill_database(self) -> Dict:
        """Initialize comprehensive skill database."""
        
        skills_data = {
            "Programming Languages": [
                ("Python", ["data science", "web development", "automation", "machine learning"]),
                ("JavaScript", ["web development", "frontend", "Node.js", "full-stack"]),
                ("TypeScript", ["type safety", "large applications", "Angular", "React"]),
                ("Java", ["enterprise", "Android", "Spring", "backend"]),
                ("Go", ["microservices", "cloud", "performance", "concurrent"]),
                ("Rust", ["systems programming", "performance", "safety", "WebAssembly"]),
                ("C++", ["systems", "game development", "performance", "embedded"]),
                ("C#", [".NET", "Unity", "Windows", "enterprise"]),
                ("Ruby", ["Rails", "web development", "scripting", "DevOps"]),
                ("PHP", ["web development", "WordPress", "Laravel", "backend"]),
            ],
            "Frontend Technologies": [
                ("React", ["component-based", "SPA", "JavaScript", "UI"]),
                ("Angular", ["enterprise", "TypeScript", "SPA", "Google"]),
                ("Vue.js", ["progressive", "lightweight", "SPA", "reactive"]),
                ("Next.js", ["SSR", "React", "full-stack", "performance"]),
                ("HTML5", ["markup", "semantic", "web standards", "accessibility"]),
                ("CSS3", ["styling", "responsive", "animations", "flexbox"]),
                ("Tailwind CSS", ["utility-first", "responsive", "customizable", "modern"]),
                ("Bootstrap", ["responsive", "components", "grid", "mobile-first"]),
                ("Webpack", ["bundling", "optimization", "modules", "build"]),
                ("Redux", ["state management", "React", "predictable", "flux"]),
            ],
            "Backend Technologies": [
                ("Node.js", ["JavaScript", "server-side", "npm", "event-driven"]),
                ("Express.js", ["Node.js", "REST API", "middleware", "routing"]),
                ("Django", ["Python", "full-featured", "ORM", "admin"]),
                ("Flask", ["Python", "microframework", "flexible", "lightweight"]),
                ("FastAPI", ["Python", "async", "type hints", "modern"]),
                ("Spring Boot", ["Java", "microservices", "enterprise", "production"]),
                ("Ruby on Rails", ["Ruby", "convention", "rapid development", "MVC"]),
                (".NET Core", ["C#", "cross-platform", "Microsoft", "enterprise"]),
                ("GraphQL", ["query language", "API", "flexible", "type system"]),
                ("REST API", ["HTTP", "stateless", "resources", "standards"]),
            ],
            "Databases": [
                ("PostgreSQL", ["relational", "ACID", "advanced", "open source"]),
                ("MySQL", ["relational", "popular", "LAMP", "performance"]),
                ("MongoDB", ["NoSQL", "document", "flexible", "scalable"]),
                ("Redis", ["cache", "in-memory", "fast", "pub/sub"]),
                ("Elasticsearch", ["search", "analytics", "full-text", "distributed"]),
                ("Cassandra", ["distributed", "NoSQL", "scalable", "column-family"]),
                ("SQLite", ["embedded", "lightweight", "serverless", "file-based"]),
                ("DynamoDB", ["AWS", "NoSQL", "managed", "serverless"]),
            ],
            "Cloud & DevOps": [
                ("AWS", ["cloud", "Amazon", "services", "scalable"]),
                ("Azure", ["Microsoft", "cloud", "enterprise", "hybrid"]),
                ("Google Cloud", ["GCP", "Google", "cloud", "machine learning"]),
                ("Docker", ["containers", "microservices", "deployment", "isolation"]),
                ("Kubernetes", ["orchestration", "containers", "scaling", "cloud-native"]),
                ("Jenkins", ["CI/CD", "automation", "pipelines", "plugins"]),
                ("Terraform", ["IaC", "provisioning", "cloud", "declarative"]),
                ("Ansible", ["automation", "configuration", "agentless", "playbooks"]),
            ],
            "Data & AI/ML": [
                ("Machine Learning", ["AI", "algorithms", "prediction", "models"]),
                ("Deep Learning", ["neural networks", "AI", "complex patterns", "GPU"]),
                ("TensorFlow", ["Google", "deep learning", "production", "flexible"]),
                ("PyTorch", ["Facebook", "research", "dynamic", "pythonic"]),
                ("Pandas", ["data analysis", "Python", "DataFrames", "manipulation"]),
                ("NumPy", ["numerical", "arrays", "scientific", "Python"]),
            ],
        }
        
        skill_db = {}
        
        for category, skills_list in skills_data.items():
            for skill_name, keywords in skills_list:
                # Create rich description for embedding
                description = f"{skill_name} - {category}: {', '.join(keywords)}"
                
                skill_db[skill_name.lower()] = {
                    "name": skill_name,
                    "category": category,
                    "keywords": keywords,
                    "description": description
                }
        
        logger.info(f"Initialized {len(skill_db)} skills in database")
        return skill_db
    
    def get_similar_skills(self, skill: str, top_n: int = 5) -> List[Tuple[str, float]]:
        """Find similar skills using TF-IDF similarity."""
        skill_lower = skill.lower()
        
        # Create query vector
        if skill_lower in self.skill_database:
            query_text = self.skill_database[skill_lower]["description"]
        else:
            query_text = skill
        
        query_vector = self.vectorizer.transform([query_text])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self.skill_vectors).flatten()
        
        # Get top similar skills
        skill_names = list(self.skill_database.keys())
        similar_indices = similarities.argsort()[-top_n-1:][::-1]
        
        results = []
        for idx in similar_indices:
            skill_name = skill_names[idx]
            if skill_name != skill_lower:  # Don't include the skill itself
                results.append((self.skill_database[skill_name]["name"], float(similarities[idx])))
        
        return results[:top_n]
    
    def get_skill_recommendations(self, skill_gaps: List[str], 
                                 unique_skills: List[str]) -> List[Dict]:
        """Generate intelligent skill recommendations based on gaps and existing skills."""
        recommendations = []
        
        for gap in skill_gaps[:10]:  # Limit to top 10 gaps
            similar_skills = self.get_similar_skills(gap, top_n=3)
            
            # Check if user has any similar skills
            has_related = False
            for unique in unique_skills:
                if unique.lower() in [s[0].lower() for s in similar_skills]:
                    has_related = True
                    break
            
            recommendation = {
                "skill": gap,
                "priority": "high" if not has_related else "medium",
                "related_skills": [{"name": s[0], "similarity": s[1]} for s in similar_skills],
                "learning_path": self._generate_learning_path(gap)
            }
            recommendations.append(recommendation)
        
        return recommendations
    
    def _generate_learning_path(self, skill: str) -> List[str]:
        """Generate a learning path for a skill."""
        skill_lower = skill.lower()
        
        # Define learning paths for common skills
        learning_paths = {
            "docker": [
                "Learn containerization basics",
                "Practice with Docker commands",
                "Understand Dockerfile and docker-compose",
                "Deploy a multi-container application"
            ],
            "kubernetes": [
                "Master Docker first",
                "Learn Kubernetes concepts (pods, services)",
                "Practice with kubectl",
                "Deploy applications on a K8s cluster"
            ],
            "react": [
                "Master JavaScript ES6+",
                "Learn React fundamentals (components, props, state)",
                "Understand hooks and lifecycle",
                "Build a complete SPA project"
            ],
            "aws": [
                "Start with AWS Free Tier",
                "Learn core services (EC2, S3, RDS)",
                "Understand IAM and security",
                "Get AWS Certified Cloud Practitioner"
            ],
            "python": [
                "Learn Python syntax and basics",
                "Master data structures and algorithms",
                "Explore frameworks (Django/FastAPI)",
                "Build real-world projects"
            ]
        }
        
        # Return specific path or generic one
        if skill_lower in learning_paths:
            return learning_paths[skill_lower]
        else:
            return [
                f"Research {skill} fundamentals",
                f"Find online courses or tutorials for {skill}",
                f"Practice with hands-on projects",
                f"Join communities and contribute to open source"
            ]
    
    def analyze_skill_market_demand(self, skills: List[str]) -> Dict[str, str]:
        """Analyze market demand for skills."""
        # Simplified demand analysis based on categories
        high_demand = {
            "cloud", "ai", "ml", "kubernetes", "docker", "react", "python",
            "typescript", "aws", "data", "devops", "microservices"
        }
        
        medium_demand = {
            "java", "angular", "vue", "django", "flask", "postgresql",
            "mongodb", "redis", "jenkins", "git"
        }
        
        demand_analysis = {}
        for skill in skills:
            skill_lower = skill.lower()
            if any(hd in skill_lower for hd in high_demand):
                demand_analysis[skill] = "High"
            elif any(md in skill_lower for md in medium_demand):
                demand_analysis[skill] = "Medium"
            else:
                demand_analysis[skill] = "Standard"
        
        return demand_analysis
