"use client";

import { useEffect, useRef, useState } from "react";

type Props = { resumeUrl: string };

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (options: { url: string }) => {
        promise: Promise<{
          numPages: number;
          getPage: (pageNumber: number) => Promise<{
            getViewport: (options: { scale: number }) => { width: number; height: number };
            render: (options: {
              canvasContext: CanvasRenderingContext2D;
              viewport: { width: number; height: number };
            }) => { promise: Promise<void> };
          }>;
        }>;
      };
    };
  }
}

const PDFJS_SCRIPT =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function ResumeViewer({ resumeUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderResume() {
      try {
        if (!window.pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector<HTMLScriptElement>(
              'script[data-pdfjs="true"]'
            );
            if (existing) {
              if (window.pdfjsLib) return resolve();
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener("error", () => reject(), { once: true });
              return;
            }
            const script = document.createElement("script");
            script.src = PDFJS_SCRIPT;
            script.async = true;
            script.dataset.pdfjs = "true";
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.head.appendChild(script);
          });
        }

        if (cancelled || !window.pdfjsLib || !canvasRef.current) return;
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

        const pdf = await window.pdfjsLib.getDocument({ url: resumeUrl }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable");

        const availableWidth = Math.min(
          canvas.parentElement?.clientWidth || window.innerWidth - 32,
          1100
        );
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = (availableWidth / baseViewport.width) * Math.min(
          window.devicePixelRatio || 1,
          2
        );
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        await page.render({ canvasContext: context, viewport }).promise;
      } catch {
        if (!cancelled) setError(true);
      }
    }

    renderResume();
    return () => {
      cancelled = true;
    };
  }, [resumeUrl]);

  return (
    <section
      aria-label="Resume preview"
      style={{
        width: "100%",
        minHeight: 320,
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid rgba(73,48,31,.2)",
        background: "#fff",
        boxShadow: "0 15px 45px rgba(73,48,31,.12)",
      }}
    >
      {error ? (
        <div style={{ padding: 24, color: "#49301f", textAlign: "center" }}>
          Resume preview could not load. Please use the Download Resume button.
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          aria-label="First page of Sonali Sharma's resume"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      )}
    </section>
  );
}
