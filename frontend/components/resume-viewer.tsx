"use client";

import { useEffect, useState } from "react";

type Props = { resumeUrl: string };

export default function ResumeViewer({ resumeUrl }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    setOrigin(window.location.origin);
  }, []);

  const absolutePdfUrl = origin ? `${origin}${resumeUrl}` : "";
  const viewerUrl =
    isMobile && absolutePdfUrl
      ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(absolutePdfUrl)}`
      : resumeUrl;

  return (
    <section
      aria-label="Resume preview"
      style={{
        width: "100%",
        height: "min(78vh, 950px)",
        minHeight: "min(550px, 65vh)",
        overflow: "hidden",
        borderRadius: "16px",
        border: "1px solid rgba(73,48,31,.2)",
        background: "#fff",
        boxShadow: "0 15px 45px rgba(73,48,31,.12)",
      }}
    >
      <iframe
        key={viewerUrl}
        src={viewerUrl}
        title="Sonali Sharma Resume"
        width="100%"
        height="100%"
        style={{ border: 0, background: "#fff" }}
        loading="lazy"
        allow="fullscreen"
      />
      <p style={{ padding: "8px 14px", margin: 0, fontSize: 12 }}>
        If the preview does not load,{" "}
        <a href={resumeUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
          open the resume in a new tab
        </a>.
      </p>
    </section>
  );
}
