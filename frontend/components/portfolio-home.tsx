"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- portfolio content fields are arbitrary JSON from the API */

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, CSSProperties, PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Sparkles,
  Home,
  FolderKanban,
  X,
  ExternalLink,
  Download,
} from "lucide-react";

import { publicApi, resolveAssetUrl } from "@/lib/api";
import type { ContentItem, PortfolioData } from "@/types";

const certificateFallback = [
  {
    title: "HackMatrix ’26 — Top 30 Finalist",
    issuer: "HackMatrix ’26",
    date: "2026",
    image: "/assets/certificates/hackmatrix-top-30.jpeg",
    url: "/assets/certificates/hackmatrix-top-30.jpeg",
    kind: "Finalist badge",
  },
  {
    title: "HackMatrix ’26 — Code Nexus",
    issuer: "MLH / ACM",
    date: "2026",
    image: "/assets/certificates/hackmatrix-code-nexus.jpeg",
    url: "/assets/certificates/hackmatrix-code-nexus.jpeg",
    kind: "Certificate of appreciation",
  },
  {
    title: "WhyCode.4u Hackathon",
    issuer: "WhyCode.4u",
    date: "2026",
    image: "/assets/certificates/whycode-participation.jpeg",
    url: "/assets/certificates/whycode-participation.jpeg",
    kind: "Participation",
  },
  {
    title: "Cyberexplore 2026",
    issuer: "Techno India Group",
    date: "29 May 2026",
    image: "/assets/certificates/cyberexplore-2026.jpeg",
    url: "/assets/certificates/cyberexplore-2026.jpeg",
    kind: "Participation",
  },
  {
    title: "IoT Workshop — Pre-Engineers Day Celebrations",
    issuer: "Narula Institute of Technology",
    date: "9–11 September 2026",
    image: "/assets/certificates/iot-workshop-2026.jpeg",
    url: "/assets/certificates/iot-workshop-2026.jpeg",
    kind: "Participation",
  },
  {
    title: "RushKIDDOS 1.0 Hackathon",
    issuer: "RushKIDDOS 1.0",
    date: "2026",
    image: "/assets/certificates/rushkiddos-1.jpeg",
    url: "/assets/certificates/rushkiddos-1.jpeg",
    kind: "Certificate of achievement",
  },
];

const projectFallback = [
  {
    title: "AutoEscrow",
    slug: "autoescrow",
    description:
      "Trust and verification infrastructure for autonomous AI-agent commerce.",
    url: "https://github.com/sonalisharmas2006-oss/AutoEscrow",
    tags: ["AI Agents", "Verification", "Web"],
  },
  {
    title: "H2S Dosimeter",
    slug: "h2s-dosimeter",
    description:
      "An AI-assisted passive hydrogen sulfide exposure monitoring project.",
    url: "https://github.com/sonalisharmas2006-oss/H2S_Dosimeter",
    tags: ["AI/ML", "FastAPI", "Monitoring"],
  },
  {
    title: "HireLens",
    slug: "hirelens",
    description: "An interview-coaching and analysis platform concept.",
    url: "https://github.com/sonalisharmas2006-oss/HireLens",
    tags: ["Interview Tech", "AI"],
  },
  {
    title: "Passport Tracker",
    slug: "passport-tracker",
    description:
      "A web project focused on passport tracking and transparency. Explore the repository for its current implementation.",
    url: "https://github.com/sonalisharmas2006-oss/Passport_Tracker",
    tags: ["Web Development"],
  },
  {
    title: "Student-Hub",
    slug: "student-hub",
    description:
      "A student support platform project. The repository contains the implementation and current project details.",
    url: "https://github.com/sonalisharmas2006-oss/Student-Hub",
    tags: ["Web Development", "Student Tools"],
  },
  {
    title: "New Chatbot",
    slug: "new-chatbot",
    description:
      "A chatbot project and experimentation space. Explore the repository for implementation details.",
    url: "https://github.com/sonalisharmas2006-oss/New_Chatbot",
    tags: ["Chatbot", "AI"],
  },
];

const containers = [
  {
    label: "WHAT I DO",
    target: "#about",
    tone: "rose",
    symbol: "✳",
    note: "Ideas into impact",
  },
  {
    label: "ABOUT ME",
    target: "#about",
    tone: "cream",
    symbol: "⌂",
    note: "A little introduction",
  },
  {
    label: "PROJECTS",
    target: "#work",
    tone: "sage",
    symbol: "▱",
    note: "Things I am building",
  },
  {
    label: "ACHIEVEMENTS",
    target: "#achievements",
    tone: "blue",
    symbol: "✧",
    note: "Milestones & moments",
  },
  {
    label: "CERTIFICATES",
    target: "#certificates",
    tone: "gold",
    symbol: "❀",
    note: "Proof of learning",
  },
  {
    label: "SAY HELLO",
    target: "/contact",
    tone: "terracotta",
    symbol: "↗",
    note: "Let’s connect",
  },
];

function itemData(item: ContentItem) {
  return item?.data || {};
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function scrollTo(target: string) {
  if (target.startsWith("/")) {
    window.location.href = target;
    return;
  }

  document
    .querySelector(target)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CargoContainers() {
  const gridRef = useRef<HTMLDivElement>(null);

  const drag = useRef({
    active: false,
    x: 0,
    y: 0,
    moved: false,
  });

  function startDrag(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) return;

    drag.current = {
      active: true,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moveDrag(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current.active || !gridRef.current) return;

    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    if (Math.abs(dx) + Math.abs(dy) > 5) {
      drag.current.moved = true;
    }

    gridRef.current.style.transform =
      `rotateX(${Math.max(-8, Math.min(8, -dy * 0.045))}deg) ` +
      `rotateY(${Math.max(-11, Math.min(11, dx * 0.045))}deg)`;
  }

  function stopDrag() {
    drag.current.active = false;

    if (gridRef.current) {
      gridRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  }

  return (
    <section className="cargo-section" aria-labelledby="cargo-title">
      <div className="cargo-title-wrap">
        <p className="hand-note">
          click, drag & explore <span>↘</span>
        </p>

        <p className="eyebrow">A little world of mine</p>

        <h2 id="cargo-title" className="portfolio-word">
          PORTFOLIO<span>✳</span>
        </h2>

        <p className="cargo-caption">
          Six little doors. A whole lot of stories.
        </p>
      </div>

      <div
        className="cargo-stage"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <div className="suspension suspension-one" />
        <div className="suspension suspension-two" />

        <div className="cargo-grid" ref={gridRef}>
          {containers.map((container, index) => (
            <a
              key={container.label}
              href={container.target}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(container.target);
              }}
              className={`cargo-box cargo-${container.tone} cargo-box-${index + 1}`}
              aria-label={`Explore ${container.label}`}
            >
              <span className="cargo-ribs" />
              <span className="cargo-symbol">{container.symbol}</span>
              <strong>{container.label}</strong>
              <small>{container.note}</small>
              <span className="cargo-door" />
            </a>
          ))}
        </div>

        <div className="glow-ring" />
        <div className="glow-ring glow-ring-two" />
      </div>

      <p className="cargo-footnote">
        <Sparkles size={15} />
        Every container opens a different chapter
        <Sparkles size={15} />
      </p>
    </section>
  );
}

function SocialLinks({ profile }: { profile: any }) {
  const links = [
    {
      href:
        profile.github ||
        "https://github.com/sonalisharmas2006-oss",
      label: "GitHub",
      icon: <Github />,
    },
    {
      href:
        profile.linkedin ||
        "https://www.linkedin.com/in/sonali-sharma-8b3885371",
      label: "LinkedIn",
      icon: <Linkedin />,
    },
    {
      href:
        profile.instagram ||
        "https://www.instagram.com/cuddle_petalss/",
      label: "Instagram",
      icon: <Instagram />,
    },
    {
      href: `mailto:${profile.email || "sonalisharma.s2006@gmail.com"}`,
      label: "Email",
      icon: <Mail />,
    },
  ];

  return (
    <div className="social-row">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.label === "Email" ? undefined : "_blank"}
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

export default function PortfolioHome({
  data,
}: {
  data: PortfolioData;
}) {
  const profile = itemData(data.profile as ContentItem);
  const name = profile.full_name || "Sonali Sharma";

  const [certIndex, setCertIndex] = useState(0);
  const [certPaused, setCertPaused] = useState(false);
  const [achievementIndex, setAchievementIndex] = useState(0);

  const [contact, setContact] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactState, setContactState] = useState("");
  const [contactBusy, setContactBusy] = useState(false);

  const [preview, setPreview] = useState<{
    title: string;
    url: string;
  } | null>(null);

  const certificates = useMemo(
    () =>
      data.certificates.length
        ? data.certificates.map((certificate) => ({
            title: certificate.title,
            issuer:
              itemData(certificate).issuer ||
              itemData(certificate).issuing_organization ||
              "Certificate",
            date: itemData(certificate).issue_date || "",
            image: resolveAssetUrl(
              itemData(certificate).image_url ||
                itemData(certificate).preview_url ||
                (String(itemData(certificate).file_url || "")
                  .toLowerCase()
                  .endsWith(".pdf")
                  ? null
                  : itemData(certificate).file_url)
            ),
            url: resolveAssetUrl(
              itemData(certificate).file_url ||
                itemData(certificate).credential_url ||
                itemData(certificate).image_url
            ),
            kind: "Certificate",
          }))
        : certificateFallback,
    [data.certificates]
  );

  // Automatically rotate certificate cards.
  useEffect(() => {
    if (certPaused || certificates.length <= 3) return;

    const timer = window.setInterval(() => {
      setCertIndex(
        (current) => (current + 1) % certificates.length
      );
    }, 3000);

    return () => window.clearInterval(timer);
  }, [certPaused, certificates.length]);

  // Orbion fallback achievement.

  const baseAchievements: ContentItem[] = data.achievements.length
    ? data.achievements
    : [
        {
          id: 0,
          collection: "achievements",
          title: "Orbion Hackathon — 1st Runners-up",
          slug: "orbion-hackathon-first-runners-up",
          data: {
            event: "Orbion Hackathon",
            position: "1st Runners-up",
            date: "2026-11-14",
            prize: "₹3,000",
            description:
              "Secured 1st runners-up position with the team at Orbion Hackathon.",
            evidence_asset: "/assets/achievements/orbion-team.jpeg",
          },
          is_published: true,
          is_featured: true,
          sort_order: 0,
          created_at: "2026-11-14T00:00:00Z",
          updated_at: "2026-11-14T00:00:00Z",
        },
      ];

  // RushKIDDOS fallback achievement.
  const rushkiddosFallback: ContentItem = {
    id: -2,
    collection: "achievements",
    title: "RushKIDDOS 1.0 Hackathon — Winners",
    slug: "rushkiddos-1-winners",
    data: {
      event: "RushKIDDOS 1.0 Hackathon",
      position: "Winners",
      description:
        "A winning hackathon moment shared with my team.",
      evidence_asset: "/assets/achievements/rushkiddos-team.jpeg",
    },
    is_published: true,
    is_featured: true,
    sort_order: 1,
    created_at: "2026-11-14T00:00:00Z",
    updated_at: "2026-11-14T00:00:00Z",
  };

  const achievements: ContentItem[] = baseAchievements.some((item) =>
    String(item.title || "").toLowerCase().includes("rushkiddos")
  )
    ? baseAchievements
    : [...baseAchievements, rushkiddosFallback];

  const projects = data.projects.length
    ? data.projects.map((project) => ({
        title: project.title,
        slug: project.slug,
        description:
          itemData(project).short_description ||
          itemData(project).description ||
          "Project details are being updated.",
        url: itemData(project).github_url,
        tags: itemData(project).technologies || [],
      }))
    : projectFallback;

  const skills = data.skills.map(
    (skill) => itemData(skill).name || skill.title
  );

  const achievement =
    achievements[
      Math.min(achievementIndex, achievements.length - 1)
    ];

  const ad = itemData(achievement);

  const achievementImage = String(achievement.title || "")
    .toLowerCase()
    .includes("rushkiddos")
    ? "/assets/achievements/rushkiddos-team.jpeg"
    : typeof ad.evidence_asset === "string" &&
        (ad.evidence_asset.startsWith("http") ||
          ad.evidence_asset.startsWith("/uploads/"))
      ? resolveAssetUrl(ad.evidence_asset)
      : "/assets/achievements/orbion-team.jpeg";

  async function submitContact(e: FormEvent) {
    e.preventDefault();
    setContactBusy(true);
    setContactState("");

    try {
      const result = await publicApi.contact(contact);

      if (result.email_status === "sent") {
        setContactState(
          "Your message has been sent. Thank you for reaching out!"
        );
      } else if (result.email_status === "not_configured") {
        setContactState(
          "Your message was received by the site, but email delivery is not configured yet. Please email me directly at sonalisharma.s2006@gmail.com."
        );
      } else {
        setContactState(
          "Your message was saved, but email delivery failed. Please email me directly at sonalisharma.s2006@gmail.com."
        );
      }

      setContact({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setContactState(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please email me directly."
      );
    } finally {
      setContactBusy(false);
    }
  }

  async function share(title: string, url: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // Fall back to copying the URL.
      }
    }

    await navigator.clipboard?.writeText(url);
    setContactState("Link copied to clipboard.");
  }

  return (
  <main className="portfolio-shell">
    <header className="portfolio-topbar">
      <Link href="/#top" className="topbar-brand">
        <img
          src="/assets/brand/sunflower-logo.jpg"
          alt="Sonali Sharma logo"
        />
        <span>
          <strong>Sonali Sharma</strong>
          <small>MY CREATIVE CORNER · KOLKATA, INDIA</small>
        </span>
      </Link>

      <div className="topbar-note">
        <span>✳</span> A little creativity, a lot of curiosity.
      </div>

      <span className="topbar-edition">PORTFOLIO · 2026</span>
    </header>

    <section id="top" className="hero section-wrap">
        <div className="hero-photo-column">
          <div className="photo-tape" />

          <div className="polaroid hero-polaroid">
            <Image
              src={
                resolveAssetUrl(profile.profile_image) ||
                "/assets/profile/sonali-portrait.jpeg"
              }
              alt="Sonali Sharma portrait"
              width={640}
              height={960}
              priority
              loading="eager"
              fetchPriority="high"
              unoptimized
            />
            <span>sonali, in her element ♡</span>
          </div>

          <div className="hero-flower flower-one">✿</div>
          <div className="hero-flower flower-two">❀</div>

          <p className="margin-note">
            a curious mind
            <br />
            with a builder&apos;s heart ↗
          </p>
        </div>

        <div className="hero-copy">
          <p className="script-greeting">
            Hi, I’m <span>Sonali</span>
          </p>

          <h1>
            {name.split(" ")[0]}
            <br />
            <em>{name.split(" ").slice(1).join(" ")}</em>
          </h1>

          <p className="hero-role">Developer · AI &amp; ML Student</p>

          <p className="hero-intro">
            A Computer Science student who loves building thoughtful,
            real-world solutions at the intersection of technology,
            design and innovation.
          </p>

          <SocialLinks profile={profile} />

          <a href="#about" className="text-link">
            A little more about me <ArrowDown size={15} />
          </a>

          <div className="hero-postmark">
            KOLKATA
            <br />
            <span>INDIA · 2026</span>
          </div>
        </div>

        <div className="hero-sketch" aria-hidden="true">
          ✳
        </div>
      </section>

      <CargoContainers />

      <section
        id="about"
        className="section-wrap about-section"
      >
        <div className="section-heading">
          <p className="eyebrow">
            01 / the person behind the pixels
          </p>
          <h2>
            A little <em>about me.</em>
          </h2>
          <span className="heading-flower">✿</span>
        </div>

        <div className="about-grid">
          <div className="about-note vintage-card">
            <span className="paperclip" />
            <p className="script-greeting">Dear visitor,</p>

            <p>
              {profile.about ||
                "I’m Sonali — a Computer Science student specializing in Artificial Intelligence and Machine Learning. I enjoy exploring ideas, building useful projects and learning by creating."}
            </p>

            <p className="signature">— Sonali</p>
          </div>

          <div className="about-facts">
            <div>
              <span>Currently studying</span>
              <strong>
                {profile.degree || "B.Tech — CSE (AI & ML)"}
              </strong>
              <small>
                {profile.institution ||
                  "Narula Institute of Technology"}
              </small>
            </div>

            <div>
              <span>Batch</span>
              <strong>{profile.batch || "2025–2029"}</strong>
            </div>

            <div>
              <span>Based in</span>
              <strong>{profile.location || "Kolkata, India"}</strong>
            </div>

            <div>
              <span>First-year YGPA</span>
              <strong>{profile.ygpa || "9.00"}</strong>
            </div>
          </div>
        </div>

        {(data.education.length > 0 ||
          data.experience.length > 0) && (
          <div className="about-timeline">
            {data.education.length > 0 && (
              <div>
                <p className="eyebrow">Education</p>

                {data.education.map((item) => (
                  <article key={item.id}>
                    <strong>
                      {itemData(item).degree || item.title}
                    </strong>
                    <span>
                      {itemData(item).institution} ·{" "}
                      {itemData(item).start_year || ""}
                      {itemData(item).end_year
                        ? `–${itemData(item).end_year}`
                        : ""}
                    </span>
                    <small>{itemData(item).grade || ""}</small>
                  </article>
                ))}
              </div>
            )}

            {data.experience.length > 0 && (
              <div>
                <p className="eyebrow">Experience</p>

                {data.experience.map((item) => (
                  <article key={item.id}>
                    <strong>
                      {itemData(item).position || item.title}
                    </strong>
                    <span>
                      {itemData(item).organization} ·{" "}
                      {itemData(item).start_date || ""}
                      {itemData(item).end_date
                        ? `–${itemData(item).end_date}`
                        : ""}
                    </span>
                    <small>
                      {itemData(item).description || ""}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="skills-strip">
          <p className="eyebrow">Things I work with</p>

          <div className="tag-row">
            {(skills.length
              ? skills
              : [
                  "Java",
                  "C",
                  "HTML5",
                  "CSS3",
                  "JavaScript",
                  "REST APIs",
                  "Git & GitHub",
                  "AI/ML fundamentals",
                ]
            ).map((skill, index) => (
              <span
                className={`tag tag-${index % 4}`}
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="work"
        className="section-wrap work-section"
      >
        <div className="section-heading">
          <p className="eyebrow">
            02 / selected explorations
          </p>

          <h2>
            Things I’ve <em>been making.</em>
          </h2>

          <p className="section-subtitle">
            A few ideas, experiments and projects that keep me curious.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project: any, index: number) => (
            <article
              className={`project-card project-card-${index % 4}`}
              key={project.slug}
            >
              <div className="project-art">
                <span className="project-number">
                  0{index + 1}
                </span>

                <div className="particle-orbit">
                  {Array.from({ length: 12 }).map((_, n) => (
                    <i
                      key={n}
                      style={{ "--i": n } as CSSProperties}
                    />
                  ))}
                </div>

                <span className="project-glyph">
                  {["✳", "⌘", "◌", "▱"][index % 4]}
                </span>

                <span className="project-sticker">
                  {index % 2
                    ? "in progress"
                    : "made with curiosity"}
                </span>
              </div>

              <div className="project-copy">
                <p className="eyebrow">
                  PROJECT / {String(index + 1).padStart(2, "0")}
                </p>

                <h3>{project.title}</h3>
                <p>{project.description}</p>

                <div className="tag-row">
                  {(project.tags || [])
                    .slice(0, 4)
                    .map((tag: string) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                </div>

                <div className="project-actions">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub <ArrowUpRight size={14} />
                    </a>
                  )}

                  {data.projects.some(
                    (item) => item.slug === project.slug
                  ) && (
                    <Link href={`/projects/${project.slug}`}>
                      Case study <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="github-more">
          More experiments live on{" "}
          <a
            href="https://github.com/sonalisharmas2006-oss"
            target="_blank"
            rel="noreferrer"
          >
            my GitHub <ArrowUpRight size={14} />
          </a>
          .
        </p>
      </section>

      <section
        id="achievements"
        className="section-wrap achievements-section"
      >
        <div className="section-heading">
          <p className="eyebrow">03 / little milestones</p>
          <h2>
            Moments worth <em>keeping.</em>
          </h2>
        </div>

        <div className="achievement-feature">
          <div className="achievement-photo">
            <Image
              src={achievementImage || "/assets/achievements/orbion-team.jpeg"}
              alt="Sonali and her team celebrating their hackathon award"
              width={900}
              height={600}
              loading="lazy"
              unoptimized
            />
            <span className="photo-caption">
              a team effort, a lovely memory
            </span>
          </div>

          <div className="achievement-paper vintage-card">
            <span className="award-seal">
              <Award size={27} />
            </span>

            <p className="eyebrow">FEATURED ACHIEVEMENT</p>

            <h3>{achievement.title || ad.event}</h3>

            <p className="achievement-position">
              {ad.position || "1st Runners-up"}
            </p>

            <p>
              {ad.description ||
                "A milestone made possible by teamwork, persistence and a lot of learning."}
            </p>

            <div className="achievement-meta">
              <span>
                ▦ {formatDate(ad.date) || "14 Nov 2026"}
              </span>

              {ad.prize && (
                <span>
                  ₹ {ad.prize.replace(/^₹\s*/, "")}
                </span>
              )}
            </div>

            <div className="carousel-controls">
              <button
                aria-label="Previous achievement"
                onClick={() =>
                  setAchievementIndex(
                    (achievementIndex + achievements.length - 1) %
                      achievements.length
                  )
                }
              >
                <ChevronLeft />
              </button>

              <span>
                {achievementIndex + 1} / {achievements.length}
              </span>

              <button
                aria-label="Next achievement"
                onClick={() =>
                  setAchievementIndex(
                    (achievementIndex + 1) % achievements.length
                  )
                }
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="certificates"
        className="section-wrap certificates-section"
      >
        <div className="section-heading">
          <p className="eyebrow">04 / proof of curiosity</p>

          <h2>
            Little papers, <em>big learning.</em>
          </h2>

          <p className="section-subtitle">
            A collection of workshops, hackathons and milestones along the way.
          </p>
        </div>

        <div
  className="certificate-carousel"
  onMouseEnter={() => setCertPaused(true)}
  onMouseLeave={() => setCertPaused(false)}
  onFocus={() => setCertPaused(true)}
  onBlur={() => setCertPaused(false)}
>
          <button
            className="round-arrow"
            onClick={() =>
              setCertIndex(
                (certIndex + certificates.length - 1) %
                  certificates.length
              )
            }
            aria-label="Previous certificates"
          >
            <ChevronLeft />
          </button>

          <div className="certificate-track">
            {certificates.map((certificate: any, index: number) => {
              const active =
                (index >= certIndex && index < certIndex + 3) ||
                (certIndex + 3 > certificates.length &&
                  index < (certIndex + 3) % certificates.length);

              return (
                <article
                  key={certificate.title}
                  className={`certificate-card ${
                    active ? "visible" : ""
                  } cert-${index % 4}`}
                >
                  <button
                    className="certificate-image"
                    onClick={() =>
                      certificate.url || certificate.image
                        ? setPreview({
                            title: certificate.title,
                            url: certificate.url || certificate.image,
                          })
                        : undefined
                    }
                    aria-label={`Preview ${certificate.title}`}
                  >
                    {certificate.image ? (
                      <img
                        src={certificate.image}
                        alt={`${certificate.title} certificate`}
                        loading="lazy"
                      />
                    ) : (
                      <span className="certificate-placeholder">
                        CERTIFICATE
                        <br />
                        OF ACHIEVEMENT
                      </span>
                    )}
                  </button>

                  <div className="certificate-info">
                    <p>{certificate.kind || "Certificate"}</p>
                    <h3>{certificate.title}</h3>

                    <small>
                      {certificate.issuer}{" "}
                      {certificate.date && `· ${certificate.date}`}
                    </small>

                    <div className="certificate-actions">
                      {(certificate.url || certificate.image) && (
                        <button
                          onClick={() =>
                            setPreview({
                              title: certificate.title,
                              url: certificate.url || certificate.image,
                            })
                          }
                        >
                          View
                        </button>
                      )}

                      {certificate.url && (
                        <a
                          href={certificate.url}
                          download
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      )}

                      {(certificate.url || certificate.image) && (
                        <button
                          onClick={() =>
                            share(
                              certificate.title,
                              certificate.url || certificate.image
                            )
                          }
                        >
                          Share
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            className="round-arrow"
            onClick={() =>
              setCertIndex((certIndex + 1) % certificates.length)
            }
            aria-label="Next certificates"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="certificate-dots">
          {certificates.map((_, index) => (
            <button
              key={index}
              className={index === certIndex ? "active" : ""}
              onClick={() => setCertIndex(index)}
              aria-label={`Show certificate ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <p>Made with curiosity, coffee &amp; a little bit of code.</p>

        <span>
          SONALI SHARMA · DEVELOPER · AI &amp; ML STUDENT
        </span>

        <a href="/admin" className="admin-footer-link">
          Admin Login ↗
        </a>
      </footer>

      {preview && (
        <div
          className="preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          onClick={() => setPreview(null)}
        >
          <div
            className="preview-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="preview-close"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
            >
              <X />
            </button>

            <h3>{preview.title}</h3>

            {preview.url.toLowerCase().endsWith(".pdf") ? (
              <iframe src={preview.url} title={preview.title} />
            ) : (
              <img src={preview.url} alt={preview.title} />
            )}

            <div className="button-row">
              <a
                className="button button-dark"
                href={preview.url}
                target="_blank"
                rel="noreferrer"
              >
                Open original <ExternalLink size={14} />
              </a>

              <a
                className="button button-outline"
                href={preview.url}
                download
              >
                Download <Download size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}