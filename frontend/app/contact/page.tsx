
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";

const RECIPIENT_EMAIL = "sonalisharma.s2006@gmail.com";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");

    const subject = encodeURIComponent(form.subject.trim());

    const body = encodeURIComponent(
      `Hello Sonali,

You have received a new message through your portfolio contact form.

Name: ${form.name.trim()}
Email: ${form.email.trim()}

Message:
${form.message.trim()}

---
Sent from your portfolio contact form.`
    );

    const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;

    window.location.href = mailtoUrl;

    setStatus(
      "Your email application should open with your message ready. Please click Send there to deliver it."
    );
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

          <a
            className="direct-email"
            href={`mailto:${RECIPIENT_EMAIL}`}
          >
            {RECIPIENT_EMAIL} ↗
          </a>
        </div>

        <form
          className="letter-form contact-page-form"
          onSubmit={submit}
        >
          <label>
            Your name
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="How should I call you?"
            />
          </label>

          <label>
            Your email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Subject
            <input
              required
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
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
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              placeholder="Write your note here..."
            />
          </label>

          <button className="button button-dark" type="submit">
            Send message <Send size={15} />
          </button>

          {status && (
            <p className="form-status" role="status">
              {status}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
