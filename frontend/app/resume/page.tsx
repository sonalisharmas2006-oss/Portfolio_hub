import type { Metadata } from "next";
import ResumeViewer from "@/components/resume-viewer";
import { getPublicCollection, resolveAssetUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resume",
  description: "View and download Sonali Sharma's resume.",
};

export default async function ResumePage() {
  const resume = (await getPublicCollection("resume"))[0];
  const resumeUrl = resolveAssetUrl(resume?.data?.file_url || resume?.data?.resume_url)
    || "/Sonali_Sharma_Job_Profile_Resume.pdf";

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

        <ResumeViewer resumeUrl={resumeUrl} />
      </div>
    </main>
  );
}
