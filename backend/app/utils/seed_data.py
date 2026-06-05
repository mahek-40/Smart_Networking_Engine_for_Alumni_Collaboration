"""
Database seeding script — 20 rich, realistic alumni / student / mentor profiles.

Run from project root:
    cd backend
    python app/utils/seed_data.py

Or call seed() programmatically from the admin route.
"""
import asyncio
from datetime import datetime
from bson import ObjectId

from app.database.connection import get_collection, connect_to_mongo, close_mongo_connection
from app.auth.security import hash_password

# ─── 20 realistic demo profiles ───────────────────────────────────────────────
# Distribution: 5 Students · 8 Alumni · 7 Mentors
# Covers: Software Dev, FinTech, HealthTech, E-commerce, Consulting, Aerospace, EdTech

PROFILES = [
    # ── Students (5) ──────────────────────────────────────────────────────────
    {
        "email": "aarav.stu@alumni.dev",
        "full_name": "Aarav Sharma",
        "password": "demo1234",
        "role": "Student",
        "skills": ["Python", "Django", "PostgreSQL", "Git", "REST APIs"],
        "interests": ["Backend Development", "Web APIs", "Open Source", "Career Growth"],
        "industry": "Software Development",
        "career_goals": "Seeking a backend SWE internship and a mentor to guide my first production deployment.",
        "bio": "Final-year CS student passionate about scalable backend systems and database design.",
        "graduation_year": 2026,
        "experience_years": 0,
    },
    {
        "email": "priya.stu@alumni.dev",
        "full_name": "Priya Nair",
        "password": "demo1234",
        "role": "Student",
        "skills": ["React", "TypeScript", "CSS", "Figma", "HTML"],
        "interests": ["Frontend Development", "UI/UX Design", "Accessibility", "Design Systems"],
        "industry": "Software Development",
        "career_goals": "Looking to break into product design at a tech startup with a strong frontend focus.",
        "bio": "Pre-final year student building React apps and refining UI/UX skills with Figma prototypes.",
        "graduation_year": 2027,
        "experience_years": 0,
    },
    {
        "email": "leo.stu@alumni.dev",
        "full_name": "Leo Martinez",
        "password": "demo1234",
        "role": "Student",
        "skills": ["Python", "Pandas", "NumPy", "Matplotlib", "SQL"],
        "interests": ["Data Science", "Machine Learning", "Predictive Analytics", "Research"],
        "industry": "FinTech",
        "career_goals": "Aiming to join a FinTech data team to apply ML for fraud detection and risk modeling.",
        "bio": "Math and CS double major with hands-on experience in Python data pipelines and statistical modeling.",
        "graduation_year": 2026,
        "experience_years": 0,
    },
    {
        "email": "sara.stu@alumni.dev",
        "full_name": "Sara Kim",
        "password": "demo1234",
        "role": "Student",
        "skills": ["Java", "Spring Boot", "MySQL", "Docker", "Git"],
        "interests": ["Backend Development", "Microservices", "DevOps", "Cloud Computing"],
        "industry": "E-commerce",
        "career_goals": "Seeking to join an e-commerce startup as a backend engineer after graduation.",
        "bio": "Junior CS student building Java microservices and exploring Docker and Kubernetes.",
        "graduation_year": 2028,
        "experience_years": 0,
    },
    {
        "email": "noah.stu@alumni.dev",
        "full_name": "Noah Patel",
        "password": "demo1234",
        "role": "Student",
        "skills": ["Python", "TensorFlow", "Computer Vision", "OpenCV", "Git"],
        "interests": ["Artificial Intelligence", "Computer Vision", "Deep Learning", "Robotics"],
        "industry": "Software Development",
        "career_goals": "Pursuing a Master's in AI. Interested in computer vision research and autonomous systems.",
        "bio": "Final-year student working on a graduation project involving real-time object detection.",
        "graduation_year": 2026,
        "experience_years": 0,
    },

    # ── Alumni (8) ────────────────────────────────────────────────────────────
    {
        "email": "alice.dev@alumni.dev",
        "full_name": "Alice Johnson",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Python", "FastAPI", "MongoDB", "Docker", "Machine Learning"],
        "interests": ["Backend Development", "AI Engineering", "Open Source", "Career Mentorship"],
        "industry": "Software Development",
        "career_goals": "Transitioning to an AI/ML engineering lead role while mentoring junior backend developers.",
        "bio": "Senior Backend Developer with 5 years in scalable APIs, microservices, and ML integrations.",
        "graduation_year": 2020,
        "experience_years": 5,
    },
    {
        "email": "diana.ds@alumni.dev",
        "full_name": "Diana Prince",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Python", "SQL", "PyTorch", "Pandas", "Tableau"],
        "interests": ["Data Science", "Deep Learning", "Predictive Analytics", "NLP Research"],
        "industry": "FinTech",
        "career_goals": "Collaborating on NLP research in financial forecasting and mentoring data science students.",
        "bio": "Data Scientist in FinTech with 7 years in predictive modeling, risk analytics, and financial ML.",
        "graduation_year": 2018,
        "experience_years": 7,
    },
    {
        "email": "fiona.pm@alumni.dev",
        "full_name": "Fiona Gallagher",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Agile", "Scrum", "Product Roadmap", "SQL", "Jira"],
        "interests": ["Product Management", "Tech Startups", "User Experience", "Entrepreneurship"],
        "industry": "HealthTech",
        "career_goals": "Co-founding a HealthTech startup. Seeking backend engineers and data scientists.",
        "bio": "Technical Product Manager with 6 years growing digital health products from 0 to 1.",
        "graduation_year": 2019,
        "experience_years": 6,
    },
    {
        "email": "hannah.sec@alumni.dev",
        "full_name": "Hannah Abbott",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Python", "Linux", "Network Security", "Cryptography", "Penetration Testing"],
        "interests": ["Cybersecurity", "Ethical Hacking", "Cloud Security", "SecOps"],
        "industry": "Aerospace",
        "career_goals": "Collaborating on building secure systems and sharing cloud security best practices.",
        "bio": "Security Analyst securing cloud-native applications and conducting vulnerability assessments.",
        "graduation_year": 2021,
        "experience_years": 4,
    },
    {
        "email": "julia.ui@alumni.dev",
        "full_name": "Julia Roberts",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Figma", "User Research", "Wireframing", "React", "CSS"],
        "interests": ["UI/UX Design", "Interaction Design", "Frontend Development", "Design Systems"],
        "industry": "E-commerce",
        "career_goals": "Collaborating with frontend developers on accessible design systems for e-commerce.",
        "bio": "Product Designer with 3 years building accessible UI components and e-commerce checkout flows.",
        "graduation_year": 2022,
        "experience_years": 3,
    },
    {
        "email": "marco.be@alumni.dev",
        "full_name": "Marco Rossi",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Node.js", "Express", "PostgreSQL", "Redis", "AWS Lambda"],
        "interests": ["Backend Development", "Serverless", "API Design", "Open Source"],
        "industry": "E-commerce",
        "career_goals": "Building serverless backends for high-traffic e-commerce. Open to collaborations.",
        "bio": "Backend Engineer with 4 years specializing in Node.js microservices and AWS serverless architectures.",
        "graduation_year": 2021,
        "experience_years": 4,
    },
    {
        "email": "nadia.ml@alumni.dev",
        "full_name": "Nadia Chen",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Python", "Scikit-learn", "XGBoost", "SQL", "Apache Spark"],
        "interests": ["Machine Learning", "Feature Engineering", "MLOps", "Data Pipelines"],
        "industry": "FinTech",
        "career_goals": "Scaling ML models to production using MLOps pipelines and Feature Stores.",
        "bio": "ML Engineer with 5 years deploying fraud detection and credit-scoring models at scale.",
        "graduation_year": 2020,
        "experience_years": 5,
    },
    {
        "email": "oliver.edu@alumni.dev",
        "full_name": "Oliver Thompson",
        "password": "demo1234",
        "role": "Alumni",
        "skills": ["Python", "Django", "PostgreSQL", "REST APIs", "Git"],
        "interests": ["EdTech", "Backend Development", "Open Source", "Teaching"],
        "industry": "EdTech",
        "career_goals": "Building scalable EdTech platforms that improve access to quality education.",
        "bio": "Backend Developer at an EdTech startup, building LMS platforms and assessment APIs.",
        "graduation_year": 2019,
        "experience_years": 6,
    },

    # ── Mentors (7) ───────────────────────────────────────────────────────────
    {
        "email": "bob.mgr@alumni.dev",
        "full_name": "Bob Smith",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["System Design", "AWS", "Agile", "Team Leadership", "Project Management"],
        "interests": ["Engineering Management", "Cloud Architecture", "Career Mentorship", "Tech Startups"],
        "industry": "Consulting",
        "career_goals": "Offering career counseling, mock interviews, and system design coaching.",
        "bio": "Engineering Manager at a top-tier tech consulting firm. Former cloud principal architect.",
        "graduation_year": 2015,
        "experience_years": 10,
    },
    {
        "email": "evan.ops@alumni.dev",
        "full_name": "Evan Wright",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["Kubernetes", "Docker", "Terraform", "CI/CD", "AWS", "Linux"],
        "interests": ["DevOps", "Cloud Engineering", "Infrastructure as Code", "Site Reliability"],
        "industry": "E-commerce",
        "career_goals": "Helping students understand production deployments, SRE, and DevOps culture.",
        "bio": "Site Reliability Engineer with 8 years in container orchestration and cloud infrastructure automation.",
        "graduation_year": 2016,
        "experience_years": 8,
    },
    {
        "email": "ian.ai@alumni.dev",
        "full_name": "Ian Malcolm",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["Python", "PyTorch", "NLP", "Computer Vision", "TensorFlow"],
        "interests": ["Artificial Intelligence", "Deep Learning Research", "Explainable AI", "Research Mentorship"],
        "industry": "Software Development",
        "career_goals": "Mentoring PhD/Master students in AI. Reviewing academic projects and research proposals.",
        "bio": "Research Scientist at an AI lab. PhD in CS specializing in deep learning, NLP, and computer vision.",
        "graduation_year": 2012,
        "experience_years": 12,
    },
    {
        "email": "sarah.cto@alumni.dev",
        "full_name": "Sarah Okonkwo",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["System Design", "Python", "Distributed Systems", "Team Leadership", "Career Coaching"],
        "interests": ["Engineering Leadership", "Diversity in Tech", "Startup Growth", "Career Mentorship"],
        "industry": "Software Development",
        "career_goals": "Helping underrepresented engineers navigate career growth and technical leadership.",
        "bio": "CTO of a Series-B startup. 15 years of experience building distributed systems and engineering teams.",
        "graduation_year": 2010,
        "experience_years": 15,
    },
    {
        "email": "raj.finance@alumni.dev",
        "full_name": "Raj Mehta",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["Python", "SQL", "R", "Financial Modeling", "Risk Analysis", "Pandas"],
        "interests": ["FinTech", "Data Science", "Quantitative Finance", "Career Mentorship"],
        "industry": "FinTech",
        "career_goals": "Guiding students into quant finance and FinTech data roles.",
        "bio": "Quant Analyst with 10 years in algorithmic trading, risk modeling, and ML for financial markets.",
        "graduation_year": 2014,
        "experience_years": 10,
    },
    {
        "email": "clara.health@alumni.dev",
        "full_name": "Clara Santos",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["Python", "NLP", "Healthcare Analytics", "FHIR", "SQL"],
        "interests": ["HealthTech", "Medical AI", "NLP", "Patient Data Privacy", "Career Mentorship"],
        "industry": "HealthTech",
        "career_goals": "Mentoring developers building at the intersection of AI and healthcare.",
        "bio": "Health Data Scientist with 8 years applying NLP to clinical notes and medical records.",
        "graduation_year": 2015,
        "experience_years": 8,
    },
    {
        "email": "tom.product@alumni.dev",
        "full_name": "Tom Bradley",
        "password": "demo1234",
        "role": "Mentor",
        "skills": ["Product Strategy", "Agile", "User Research", "A/B Testing", "SQL"],
        "interests": ["Product Management", "Startup Ecosystems", "Growth Hacking", "Career Mentorship"],
        "industry": "EdTech",
        "career_goals": "Coaching aspiring product managers through portfolio reviews and mock PM interviews.",
        "bio": "Head of Product at an EdTech unicorn. Built products used by 5M+ learners across 30 countries.",
        "graduation_year": 2013,
        "experience_years": 12,
    },
]


async def seed(clear_existing: bool = True) -> None:
    """
    Seed the database with 20 demo profiles.

    Args:
        clear_existing: If True, drops all existing data before seeding.
    """
    connect_to_mongo()

    users_col = get_collection("users")
    profiles_col = get_collection("profiles")
    activities_col = get_collection("activities")
    recommendations_col = get_collection("recommendations")

    if clear_existing:
        print("Clearing existing collections...")
        await users_col.delete_many({})
        await profiles_col.delete_many({})
        await activities_col.delete_many({})
        await recommendations_col.delete_many({})

    print(f"Seeding {len(PROFILES)} profiles...")
    now = datetime.utcnow()

    for data in PROFILES:
        user_id = ObjectId()
        hashed_pwd = hash_password(data["password"])

        user_doc = {
            "_id": user_id,
            "email": data["email"],
            "hashed_password": hashed_pwd,
            "full_name": data["full_name"],
            "created_at": now,
            "updated_at": now,
        }
        await users_col.insert_one(user_doc)

        profile_doc = {
            "_id": ObjectId(),
            "user_id": user_id,
            "email": data["email"],
            "full_name": data["full_name"],
            "role": data["role"],
            "skills": data["skills"],
            "interests": data["interests"],
            "industry": data["industry"],
            "career_goals": data["career_goals"],
            "bio": data["bio"],
            "graduation_year": data["graduation_year"],
            "experience_years": data.get("experience_years", 0),
            "created_at": now,
            "updated_at": now,
        }
        await profiles_col.insert_one(profile_doc)
        print(f"  ✓  {data['full_name']:<25} ({data['role']})")

    print(f"\nSeeding complete — {len(PROFILES)} profiles inserted.")
    print(f"  Students : {sum(1 for p in PROFILES if p['role'] == 'Student')}")
    print(f"  Alumni   : {sum(1 for p in PROFILES if p['role'] == 'Alumni')}")
    print(f"  Mentors  : {sum(1 for p in PROFILES if p['role'] == 'Mentor')}")
    close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())
