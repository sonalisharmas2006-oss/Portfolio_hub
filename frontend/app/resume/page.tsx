
import type { Metadata } from "next";

const resumeUrl = "/Sonali_Sharma_Job_Profile_Resume.pdf";

export const metadata: Metadata = {
  title: "Resume",
  description: "View and download Sonali Sharma's resume.",
};

export default function ResumePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "100px 6% 110px",
        background: "#ead9c2",
        color: "#49301f",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <p style={{ letterSpacing: "3px", textTransform: "uppercase" }}>
          A little about my journey
        </p>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 76px)", margin: "12px 0" }}>
          My Resume
        </h1>

        <p style={{ marginBottom: "24px" }}>
          Education, skills, projects and experience — all in one place.
        </p>

        <a
          href={resumeUrl}
          download="Sonali_Sharma_Resume.pdf"
          style={{
            display: "inline-block",
            padding: "13px 24px",
            marginBottom: "28px",
            borderRadius: "30px",
            background: "#49301f",
            color: "#fff8ed",
            textDecoration: "none",
          }}
        >
          Download Resume ↓
        </a>

        <div
          style={{
            width: "100%",
            height: "min(78vh, 950px)",
            minHeight: "550px",
            overflow: "hidden",
            borderRadius: "16px",
            border: "1px solid rgba(73,48,31,.2)",
            background: "#fff",
            boxShadow: "0 15px 45px rgba(73,48,31,.12)",
          }}
        >
          <iframe
            src={resumeUrl}
            title="Sonali Sharma Resume"
            width="100%"
            height="100%"
            style={{ border: 0 }}
          />
        </div>
      </div>
    </main>
  );
}
