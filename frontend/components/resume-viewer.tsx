type Props = { resumeUrl: string };

const PUBLIC_RESUME_URL =
  "https://portfolio-hub-psi-beige.vercel.app/Sonali_Sharma_Job_Profile_Resume.pdf";

export default function ResumeViewer({ resumeUrl }: Props) {
  const googleViewerUrl =
    "https://docs.google.com/gview?embedded=1&url=" +
    encodeURIComponent(PUBLIC_RESUME_URL);

  return (
    <section className="resume-preview" aria-label="Resume preview">
      <iframe
        className="resume-preview-desktop"
        src={resumeUrl}
        title="Sonali Sharma Resume"
        width="100%"
        height="100%"
        loading="lazy"
      />
      <iframe
        className="resume-preview-mobile"
        src={googleViewerUrl}
        title="Sonali Sharma Resume PDF preview"
        width="100%"
        height="100%"
        loading="eager"
        allow="fullscreen"
      />
      <style>{`
        .resume-preview {
          width: 100%;
          height: min(78vh, 950px);
          min-height: 550px;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(73,48,31,.2);
          background: #fff;
          box-shadow: 0 15px 45px rgba(73,48,31,.12);
        }
        .resume-preview iframe {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
          background: #fff;
        }
        .resume-preview-mobile { display: none !important; }
        @media (max-width: 767px) {
          .resume-preview {
            height: 72vh;
            min-height: 520px;
          }
          .resume-preview-desktop { display: none !important; }
          .resume-preview-mobile { display: block !important; }
        }
      `}</style>
      <noscript>
        <p>
          <a href={resumeUrl} target="_blank" rel="noreferrer">
            Open resume PDF
          </a>
        </p>
      </noscript>
    </section>
  );
}
