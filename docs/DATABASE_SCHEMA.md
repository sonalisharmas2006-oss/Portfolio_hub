# Database Schema

- `content_items`: flexible CMS entries for profile, education, experience, skills, projects, achievements, certificates, resume, social-links and site-settings. Unique `(collection, slug)`.
- `admin_users`: administrator username and salted PBKDF2 password hash.
- `contact_messages`: validated public contact submissions and delivery status.

The JSON `data` column intentionally supports LinkedIn-style editable fields. Public reads filter `is_published = true`; admin reads include drafts.
