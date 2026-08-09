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

## 📧 SMTP Email Configuration

The serverless backend uses **Nodemailer** to send notification and confirmation emails directly via SMTP (e.g. Gmail).

### Step 1: Configure SMTP Variables
Rename or copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```


Open `.env` and fill in the values:
*   `SMTP_HOST` — The address of your SMTP server (e.g. `smtp.gmail.com` for Gmail).
*   `SMTP_PORT` — The SMTP port (defaults to `587`. If using SSL on port `465`, secure connection will be enabled automatically).
*   `SMTP_USER` — The email address used to authenticate and send the mail (e.g. `example@gmail.com`).
*   `SMTP_PASS` — The password or Google App Password (required for Gmail) corresponding to the email account.
*   `COMPANY_EMAIL` — The target inbox where notifications and job applications will be forwarded (e.g. `info@whitestone.in`).

### Step 2: Set up Google App Password (If using Gmail)
1. Go to your [Google Account settings](https://myaccount.google.com/).
2. Enable **2-Step Verification** under Security.
3. Under Security -> **App passwords**, generate a new App Password (select 'Other' and name it, e.g. `ABC Website`).
4. Copy the 16-character code generated and paste it as the `SMTP_PASS` value in your `.env` file.

## ⚙️ Local Development

To run the application locally and test Netlify serverless functions:

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure environment variables:**
    Copy `.env.example` to `.env` in the project root:
    ```bash
    cp .env.example .env
    ```
    Populate the variables in `.env` with your actual EmailJS keys and template IDs.

3.  **Compile React widgets:**
    ```bash
    npm run build
    ```
4.  **Run with Netlify CLI (Optional, for functions testing):**
    If you have `netlify-cli` installed globally (`npm install -g netlify-cli`), you can start the development server mimicking Netlify environments:
    ```bash
    netlify dev
    ```
    This runs the frontend assets and starts local functions on `http://localhost:8888`.

---


## 🚀 Netlify Deployment

1.  **Push your repository to GitHub** (make sure `.env` is ignored).
2.  **Log in to Netlify** and select **Add New Site** → **Import from Git**.
3.  **Select your repository** and configure the build settings:
    *   **Build command:** `npm run netlify-build`
    *   **Publish directory:** `public`
    *   **Functions directory:** `netlify/functions`
4.  **Set Environment Variables:**
    Under **Site settings** → **Environment variables**, add the following keys from your `.env` configuration:
    *   `EMAILJS_SERVICE_ID`
    *   `EMAILJS_PUBLIC_KEY`
    *   `EMAILJS_PRIVATE_KEY`
    *   `EMAILJS_TEMPLATE_ID_COMPANY`
    *   `EMAILJS_TEMPLATE_ID_CONFIRM`
    *   `EMAILJS_TEMPLATE_ID_JOB_NOTIFY`
    *   `EMAILJS_TEMPLATE_ID_JOB_CONFIRM`
5.  **Click Deploy Site.** Netlify will automate the React compile build and host the static pages alongside serverless endpoints.
