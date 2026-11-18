from sqlalchemy.orm import Session
from .models import ContentItem


def _ensure_item(db: Session, collection: str, slug: str, **fields):
    """Insert missing starter content without overwriting admin edits."""
    exists = db.query(ContentItem.id).filter_by(collection=collection, slug=slug).first()
    if exists:
        return
    db.add(ContentItem(collection=collection, slug=slug, **fields))


def seed_initial_content(db: Session):
    # Idempotent backfill: add missing starter records individually.
    # Existing records and any edits made in the admin portal are preserved.
    _ensure_item(
        db, "profile", "sonali-sharma", title="Sonali Sharma",
        is_published=True, data={
            "full_name": "Sonali Sharma",
            "headline": "B.Tech CSE (AI & ML) Student | Developer",
            "location": "Kolkata, West Bengal, India",
            "institution": "Narula Institute of Technology",
            "degree": "B.Tech – Computer Science Engineering (AI & ML)",
            "batch": "2025–2029", "ygpa": "9.00",
            "about": "I am a Computer Science student specializing in Artificial Intelligence and Machine Learning, interested in software development and building practical technology projects.",
            "email": "sonalisharma.s2006@gmail.com",
            "github": "https://github.com/sonalisharmas2006-oss",
            "linkedin": "https://www.linkedin.com/in/sonali-sharma-8b3885371",
            "instagram": "https://www.instagram.com/cuddle_petalss/"
        })

    skills = [
        ("java", "Java", "Programming"), ("c", "C", "Programming"),
        ("html-css", "HTML & CSS", "Frontend"), ("javascript", "JavaScript", "Frontend"),
        ("rest-apis", "REST APIs", "Backend"), ("git-github", "Git & GitHub", "Tools"),
        ("vscode", "Visual Studio Code", "Tools"), ("aiml", "AI/ML Fundamentals", "AI & ML"),
    ]
    for i, (slug, name, category) in enumerate(skills):
        _ensure_item(db, "skills", slug, title=name, data={"name": name, "category": category},
                     is_published=True, sort_order=i)

    projects = [
        ("autoescrow", "AutoEscrow", "AI-agent work coordination with agreements, verification, simulated escrow accounting and audit history.", "https://github.com/sonalisharmas2006-oss/AutoEscrow"),
        ("h2s-dosimeter", "H2S Dosimeter", "AI-assisted passive hydrogen sulfide exposure monitoring project.", "https://github.com/sonalisharmas2006-oss/H2S_Dosimeter"),
        ("hirelens", "HireLens", "Interview-coaching and analysis platform concept.", "https://github.com/sonalisharmas2006-oss/HireLens"),
        ("passport-tracker", "Passport Tracker", "A project focused on passport application tracking and verification transparency.", "https://github.com/sonalisharmas2006-oss/Passport_Tracker"),
        ("student-hub", "Student-Hub", "Student support platform project.", "https://github.com/sonalisharmas2006-oss/Student-Hub"),
        ("new-chatbot", "New Chatbot", "Chatbot project and experimentation space.", "https://github.com/sonalisharmas2006-oss/New_Chatbot"),
        ("code-nexus", "Code Nexus", "AI-powered web threat and digital trust intelligence platform combining multi-signal phishing URL and malicious-message inspection with tamper-proof audit verification on Ethereum Sepolia.", "https://github.com/sonalisharmas2006-oss"),
    ]
    for i, (slug, title, description, github) in enumerate(projects):
        _ensure_item(db, "projects", slug, title=title,
            data={"short_description": description, "github_url": github,
                  "status": "Needs review" if slug != "code-nexus" else "In progress"},
            is_published=False, sort_order=i)

    achievements = [
        ("orbion-hackathon-first-runners-up", "Orbion Hackathon — 1st Runners-up",
         {"event": "Orbion Hackathon", "position": "1st Runners-up", "date": "2026-11-14",
          "prize": "₹3,000", "description": "Secured 1st runners-up position with the team at Orbion Hackathon.",
          "evidence_asset": "WhatsApp Image 2026-11-16 at 23.01.56.jpeg"}),
        ("rushkiddos-1-winners", "RushKIDDOS 1.0 Hackathon — Winners",
         {"event": "RushKIDDOS 1.0 Hackathon", "position": "Winners", "date": "2026-04-26",
          "description": "A winning hackathon achievement with the team.",
          "evidence_asset": "/assets/achievements/rushkiddos-team.jpeg"}),
    ]
    for i, (slug, title, data) in enumerate(achievements):
        _ensure_item(db, "achievements", slug, title=title, data=data,
                     is_published=True, is_featured=True, sort_order=i)

    certificates = [
        ("hackmatrix-top-30", "HackMatrix ’26 — Top 30 Finalist", "HackMatrix ’26", "2026", "Finalist badge", "hackmatrix-top-30.jpeg"),
        ("hackmatrix-code-nexus", "HackMatrix ’26 — Code Nexus", "MLH / ACM", "2026", "Certificate of appreciation", "hackmatrix-code-nexus.jpeg"),
        ("whycode-4u", "WhyCode.4u Hackathon", "WhyCode.4u", "2026", "Participation", "whycode-participation.jpeg"),
        ("cyberexplore-2026", "Cyberexplore 2026", "Techno India Group", "29 May 2026", "Participation", "cyberexplore-2026.jpeg"),
        ("iot-workshop-2026", "IoT Workshop — Pre-Engineers Day Celebrations", "Narula Institute of Technology", "9–11 September 2026", "Participation", "iot-workshop-2026.jpeg"),
        ("rushkiddos-1-certificate", "RushKIDDOS 1.0 Hackathon", "RushKIDDOS 1.0", "2026", "Certificate of achievement", "rushkiddos-1.jpeg"),
    ]
    for i, (slug, title, issuer, issue_date, description, filename) in enumerate(certificates):
        _ensure_item(db, "certificates", slug, title=title,
            data={"issuer": issuer, "issue_date": issue_date, "description": description,
                  "image_url": f"/assets/certificates/{filename}",
                  "file_url": f"/assets/certificates/{filename}"},
            is_published=True, is_featured=False, sort_order=i)

    education = [
        ("btech-cse-aiml", "B.Tech – CSE (AI & ML)", "Narula Institute of Technology", "2025", "2029", "YGPA 9.00", "MAKAUT"),
        ("class-xii-isc", "Class XII (ISC) — PCM + Computer Science", "Douglas Memorial Higher Secondary School", "2023", "2025", "86.4%; Computer Science 100%", "ISC"),
        ("class-x-icse", "Class X (ICSE)", "Douglas Memorial Higher Secondary School", "2022", "2023", "87.4%; Computer Applications 98%", "ICSE"),
    ]
    for i, (slug, degree, institution, start, end, grade, board) in enumerate(education):
        _ensure_item(db, "education", slug, title=degree,
            data={"institution": institution, "degree": degree, "start_year": start,
                  "end_year": end, "grade": grade, "description": board},
            is_published=True, sort_order=i)

    social_links = [
        ("github", "GitHub", "https://github.com/sonalisharmas2006-oss"),
        ("linkedin", "LinkedIn", "https://www.linkedin.com/in/sonali-sharma-8b3885371"),
        ("instagram", "Instagram", "https://www.instagram.com/cuddle_petalss/"),
        ("email", "Email", "mailto:sonalisharma.s2006@gmail.com"),
    ]
    for i, (slug, label, url) in enumerate(social_links):
        _ensure_item(db, "social-links", slug, title=label,
            data={"label": label, "platform": label.lower(), "url": url},
            is_published=True, sort_order=i)

    db.commit()
