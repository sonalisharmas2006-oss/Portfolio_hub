from sqlalchemy.orm import Session
from .models import ContentItem

def seed_initial_content(db: Session):
    # Only inserts starter records when the relevant collection is empty.
    # All records remain editable/deletable from the admin API.
    if db.query(ContentItem).filter_by(collection="profile").count() == 0:
        db.add(ContentItem(
            collection="profile", slug="sonali-sharma", title="Sonali Sharma",
            is_published=True, data={
                "full_name": "Sonali Sharma",
                "headline": "B.Tech CSE (AI & ML) Student | Developer",
                "location": "Kolkata, West Bengal, India",
                "institution": "Narula Institute of Technology",
                "degree": "B.Tech – Computer Science Engineering (AI & ML)",
                "batch": "2025–2029",
                "ygpa": "9.00",
                "about": "I am a Computer Science student specializing in Artificial Intelligence and Machine Learning, interested in software development and building practical technology projects.",
                "email": "sonalisharma.s2006@gmail.com",
                "github": "https://github.com/sonalisharmas2006-oss",
                "linkedin": "https://www.linkedin.com/in/sonali-sharma-8b3885371",
                "instagram": "https://www.instagram.com/cuddle_petalss/"
            }))
    skills = [
        ("java", "Java", "Programming"),
        ("c", "C", "Programming"),
        ("html-css", "HTML & CSS", "Frontend"),
        ("javascript", "JavaScript", "Frontend"),
        ("rest-apis", "REST APIs", "Backend"),
        ("git-github", "Git & GitHub", "Tools"),
        ("vscode", "Visual Studio Code", "Tools"),
        ("aiml", "AI/ML Fundamentals", "AI & ML"),
    ]
    if db.query(ContentItem).filter_by(collection="skills").count() == 0:
        for i, (slug, name, category) in enumerate(skills):
            db.add(ContentItem(collection="skills", slug=slug, title=name,
                               data={"name": name, "category": category},
                               is_published=True, sort_order=i))
    if db.query(ContentItem).filter_by(collection="achievements").count() == 0:
        db.add(ContentItem(collection="achievements", slug="orbion-hackathon-first-runners-up",
            title="Orbion Hackathon — 1st Runners-up", is_published=True, is_featured=True,
            data={"event": "Orbion Hackathon", "position": "1st Runners-up",
                  "date": "2026-11-14", "prize": "₹3,000",
                  "description": "Secured 1st runners-up position with the team at Orbion Hackathon.",
                  "evidence_asset": "WhatsApp Image 2026-11-16 at 23.01.56.jpeg"}))
    projects = [
        ("autoescrow", "AutoEscrow", "AI-agent work coordination with agreements, verification, simulated escrow accounting and audit history.", "https://github.com/sonalisharmas2006-oss/AutoEscrow"),
        ("h2s-dosimeter", "H2S Dosimeter", "AI-assisted passive hydrogen sulfide exposure monitoring project. Update this description to reflect the current implementation.", "https://github.com/sonalisharmas2006-oss/H2S_Dosimeter"),
        ("hirelens", "HireLens", "Interview analytics project. Add verified features, screenshots and current project status.", "https://github.com/sonalisharmas2006-oss/HireLens"),
        ("passport-tracker", "Passport Tracker", "A project focused on reducing passport fraud and bribery risks.", "https://github.com/sonalisharmas2006-oss/Passport_Tracker"),
        ("student-hub", "Student-Hub", "Student support platform. Add verified functionality and screenshots.", "https://github.com/sonalisharmas2006-oss/Student-Hub"),
        ("new-chatbot", "New Chatbot", "Chatbot project. Add verified functionality and current status.", "https://github.com/sonalisharmas2006-oss/New_Chatbot"),
    ]
    if db.query(ContentItem).filter_by(collection="projects").count() == 0:
        for i, (slug, title, description, github) in enumerate(projects):
            db.add(ContentItem(collection="projects", slug=slug, title=title,
                data={"short_description": description, "github_url": github, "status": "Needs review"},
                is_published=False, sort_order=i))
    db.commit()
