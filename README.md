# Afnamtech Private Limited Website

Static company website for Afnamtech Private Limited, built with HTML, CSS, JavaScript, and Netlify serverless functions.

## Stack

- Frontend: static HTML, CSS, and JavaScript
- Local dev server: Node.js
- Serverless APIs: Netlify Functions
- Email delivery: Nodemailer with SMTP
- Build: esbuild via a cross-platform Node script

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   On macOS/Linux use `cp .env.example .env`.
3. Fill in your SMTP values in `.env`:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `COMPANY_EMAIL`
4. Build the React widget bundle:
   ```bash
   npm run build
   ```
5. Start the local site:
   ```bash
   npm start
   ```
   The local server runs at `http://localhost:3000` by default.

## SMTP configuration

This project sends contact and application emails using SMTP, not EmailJS.

Use a real Gmail App Password if you are using Gmail:

1. Enable 2-Step Verification in your Google account.
2. Create an App Password.
3. Put the app password in `SMTP_PASS` without spaces.
4. Keep `SMTP_USER` as the full Gmail address used to send mail.

The `.env` file is never committed to source control.

## Upload restrictions

Resume uploads are allowed only for:
- PDF
- DOC
- DOCX

Limits:
- maximum file size: 5 MB
- server-side validation is authoritative
- requests with unsupported or malformed payloads are rejected

## Anti-spam protection

The contact and career APIs implement:
- required field validation
- maximum field lengths
- honeypot rejection
- request body size limits on the local Node server
- rate limiting per client IP
- 413 HTTP responses for oversized bodies

## Netlify deployment

Set these values as environment variables in the Netlify dashboard:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `COMPANY_EMAIL`

Build settings:
- build command: `npm run netlify-build`
- publish directory: `public`
- functions directory: `netlify/functions`

## Project structure

```text
netlify/functions/   Serverless contact, careers, and application endpoints
public/              Static site pages and front-end assets
lib/                 Shared validation and company config helpers
scripts/             Build script for cross-platform bundling
tests/               Focused validation and API tests
server.js            Local Node development server
```

## Notes

- The local server returns 404 for missing static files instead of serving the home page.
- Same-origin `/api/*` requests are used for the site; any cross-origin API access must be explicitly allowlisted.
- The app does not store leads or applications in a database; it sends email notifications by SMTP.
