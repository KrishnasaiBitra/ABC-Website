# ABC Solutions Company Website

Full-stack company website for ABC Solutions Company Pvt. Ltd., a banking technology company based in Dharmapuri, Tamil Nadu, India.

---

## Technical Stack

*   **Frontend:** HTML, CSS, JavaScript (bundled React widget for job listings)
*   **Backend:** Netlify Functions (Serverless Node.js endpoints)
*   **Database:** None (Fully serverless/stateless)
*   **Form Submissions & Mail:** EmailJS integration (direct routing of enquiry/application emails and sender confirmations)
*   **Deployment:** Netlify

---

## Key Features

*   **Corporate Solutions Portal:** Browse core services including AML (Anti-Money Laundering), Payment Automation, Ticketing Systems, ChatBots, CRM, and HRMS.
*   **Dynamic Job Listings:** Interactive career dashboard powered by React and backed by serverless job endpoints.
*   **Floating Contact Form:** Floating action button at the bottom-right triggering a responsive, modern popup form.
*   **Direct Mail Delivery:** Integrates EmailJS to instantly alert the internal team and provide automated email receipts to clients and job applicants.

---


## Project Structure

```text
netlify/
  └── functions/        ← Netlify serverless functions (contact, careers, solutions)
public/
  ├── css/              ← Layout, components, and module-specific stylesheets
  ├── js/               ← nav.js, home.js, and main form.js handler
  ├── react/            ← React entry and Job listings widgets
  ├── assets/           ← Site images and SVG vectors
  ├── index.html        ← Landing page containing floating popup markup
  ├── solutions.html    ← Solutions details page
  ├── career.html       ← Job applications dashboard
  ├── what-we-offer.html ← Capabilities page
  └── our-story.html    ← Corporate history page
netlify.toml            ← Netlify build and clean URLs routing setup
package.json            ← Node dependencies & esbuild compilation scripts
```

---

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
