"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { publicApi } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");
    setBusy(true);
    try {
      const result = await publicApi.contact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      if (result.email_status === "sent") {
        setStatus("Your message has been sent successfully. Thank you for reaching out!");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else if (result.email_status === "failed") {
        setStatus("Your message was saved, but email delivery failed. Please use the direct email link below.");
      } else {
        setStatus("Your message was received, but email delivery is not configured yet. Please use the direct email link below.");
      }
    } catch {
      setStatus("We couldn't send your message right now. Please try again or use the direct email link below.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="standalone-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> Back to portfolio
      </Link>

      <section className="contact-page-grid">
        <div className="contact-page-intro">
          <span className="standalone-icon">
            <Mail size={30} />
          </span>
          <p className="eyebrow">The postbox</p>
          <h1>Let’s talk.</h1>
          <p className="standalone-lead">
            Have a project, opportunity or idea to discuss? Send me a note.
            I’d love to hear from you.
          </p>
          <a className="direct-email" href="mailto:sonalisharma.s2006@gmail.com">
            sonalisharma.s2006@gmail.com ↗
          </a>
        </div>

        <form className="letter-form contact-page-form" onSubmit={submit}>
          <label>
            Your name
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="How should I call you?"
            />
          </label>

          <label>
            Your email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Subject
            <input
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="What's this about?"
            />
          </label>

          <label>
            Your message
            <textarea
              required
              minLength={10}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Write your note here..."
            />
          </label>

          <button className="button button-dark" type="submit" disabled={busy}>
            {busy ? "Sending..." : "Send message"} <Send size={15} />
          </button>

          {status && <p className="form-status" role="status">{status}</p>}
        </form>
      </section>
    </main>
  );
}
