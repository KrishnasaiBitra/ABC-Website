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

---

## GoDaddy hosting only: important limitation

This project is built around Netlify Functions and is not a pure static-site-only app. The contact and career forms send email through serverless functions in `netlify/functions`, and those routes are not available on a plain GoDaddy static host.

If the website is hosted only on GoDaddy, the backend must be moved to a real Node server or equivalent runtime because GoDaddy static hosting will not execute the Netlify Functions used here.

### What this means in practice

- The app can be hosted on Netlify as designed.
- If you host only on GoDaddy, the APIs at `/api/contact`, `/api/careers`, and `/api/careers-apply` will not work unless you convert them into a Node/Express backend or move them to another compatible server host.
- SMTP credentials must be stored in server environment variables, not in browser code.
- The frontend can still be static on GoDaddy, but the email backend must be hosted elsewhere or rewritten as a Node server.

### Recommended GoDaddy setup

For a GoDaddy-only deployment, convert the Netlify Function logic into a Node server that exposes the same API paths:

- `POST /api/contact`
- `GET /api/careers`
- `POST /api/careers-apply`

This requires:

1. A Node runtime compatible with the hosting plan or a VPS.
2. A server entry point such as `server.js` that handles API routes.
3. SMTP configuration in server environment variables.
4. Frontend requests that continue hitting `/api/...` without requiring Netlify-specific deployment.

### Summary

The project is intended for Netlify deployment because the backend email functions are part of the Netlify architecture. For a GoDaddy-only hosting model, a Node server migration is required before the form system can work correctly.

---

## Full process to do it correctly

There are 2 real paths for this project:

1. Best path: deploy on Netlify
2. GoDaddy-only path: convert this project into a Node server app first

Because this project is already built around Netlify Functions, Netlify is the recommended and simplest deployment option. If you must use GoDaddy only, the project must be migrated to a Node backend before deployment.

---

## Option A: Recommended — Netlify deployment

This project is already designed for Netlify.

### Step 1: Push code to GitHub

Push the repository to GitHub, then import it into Netlify.

Repository example:

- https://github.com/KrishnasaiBitra/ABC-Website

### Step 2: Configure the Netlify project

In the Netlify dashboard:

- Site name: your project name
- Build command: `npm run netlify-build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

These settings are already defined in this repository and should match the project structure.

### Step 3: Add environment variables

Add these values in Netlify → Site settings → Environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `COMPANY_EMAIL`

These variables are required because the email backend is in the serverless functions under `netlify/functions`.

### Step 4: Deploy the site

Click Deploy site.

### Step 5: Test the live forms

Open the deployed website and submit the contact form or career form.

If Gmail accepts the message, the function sends it successfully. If it fails, the usual causes are:

- wrong SMTP details
- destination mailbox blocking or filtering mail
- Google Workspace restrictions on automated outbound mail
- missing Netlify environment variables

---

## Option B: GoDaddy-only hosting

This is the path if your final host must be GoDaddy.

### Important fact

Your current project uses Netlify Functions, which do not run on plain GoDaddy static hosting.

So the real process is:

### Step 1: Convert the Netlify functions to a Node backend

Move the logic from:

- `netlify/functions/contact.js`
- `netlify/functions/careers-apply.js`
- `netlify/functions/careers.js`

into a single Node backend server.

The local Node server already present in this repo, `server.js`, is a good starting point.

### Step 2: Create backend API routes

Your Node server should expose the same routes as the current app:

- `POST /api/contact`
- `POST /api/careers-apply`
- `GET /api/careers`

### Step 3: Keep the frontend static

The HTML pages in the `public` folder can still remain static on GoDaddy.

However, all form submissions must call the Node API instead of Netlify Functions.

### Step 4: Put SMTP values on the server

Store these values in server environment variables instead of browser code:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `COMPANY_EMAIL`

Do not expose SMTP credentials in JavaScript on the frontend.

### Step 5: Deploy the Node app to a compatible environment

GoDaddy static hosting alone is not enough if you want backend APIs.

You need one of these:

- a GoDaddy VPS with Node support
- another Node-capable hosting platform
- or a server where Node can run continuously

### Step 6: Upload the static frontend

After the backend is working, upload the frontend static files to GoDaddy.

### Step 7: Update DNS

Point the domain to the GoDaddy hosting environment.

### Step 8: Test everything

Test the following after deployment:

- contact form
- career form
- resume upload
- email delivery
- success and error states

---

## What I recommend for you

Because this project was built as a Netlify app, the easiest and safest option is:

- keep it on Netlify
- use Netlify Functions
- set the SMTP values in Netlify
- deploy directly there

If your requirement is strictly “must be on GoDaddy only,” then the project must be converted from Netlify Functions to a Node server architecture before deployment.

---

## Simple rule

- Netlify hosting → works with the current project
- GoDaddy static hosting only → does not work with the current project
- GoDaddy + Node server → works after converting the backend

---

## Final conclusion

This site is not a plain static website in terms of backend behavior. It includes email APIs and server-side processing, so deployment must match the app architecture.

If you want the fastest, correct setup: use Netlify.

If you want to force GoDaddy as the final host: first convert this app into a proper Node backend application and then deploy it on a GoDaddy-compatible Node environment.

This is the correct implementation path for the project as it currently exists.

