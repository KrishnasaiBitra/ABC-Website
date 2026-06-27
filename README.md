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

## 📧 EmailJS Setup

EmailJS is used to handle form notifications and confirmations without maintaining a backend mail server or a database.

### Step 1: Create an Account & Add Email Service
1. Sign up on the [EmailJS Dashboard](https://dashboard.emailjs.com/).
2. Navigate to **Email Services** and click **Add New Service**.
3. Connect your preferred provider (e.g., Gmail, Outlook, or a custom SMTP server).
4. Note your **Service ID** (e.g., `service_xxxxxx`).

### Step 2: Configure the 4 Required Email Templates
Create the following 4 email templates in the EmailJS dashboard. Be sure to match the variable placeholder names exactly.

#### 1. Contact Notification Template (`EMAILJS_TEMPLATE_ID_COMPANY`)
Sent to the company admin (`info@whitestone.in`) when a user submits the landing page contact form.
*   **Recipient Email:** `info@whitestone.in`
*   **Placeholders used:**
    *   `{{from_name}}` — Full name of the sender
    *   `{{from_email}}` — Email address of the sender
    *   `{{subject}}` — Subject line of the enquiry
    *   `{{message}}` — Body of the message
    *   `{{to_email}}` — Target company inbox

#### 2. Contact Confirmation Template (`EMAILJS_TEMPLATE_ID_CONFIRM`)
Automated confirmation email sent back to the client acknowledging their enquiry.
*   **Recipient Email:** `{{to_email}}`
*   **Placeholders used:**
    *   `{{to_name}}` — Name of the recipient
    *   `{{to_email}}` — Email address of the recipient
    *   `{{subject}}` — Reference subject of the enquiry

#### 3. Job Application Notification Template (`EMAILJS_TEMPLATE_ID_JOB_NOTIFY`)
Sent to the HR team when a job application is received.
*   **Recipient Email:** `info@whitestone.in`
*   **Placeholders used:**
    *   `{{applicant_name}}` — Full name of the applicant
    *   `{{applicant_email}}` — Email address of the applicant
    *   `{{applicant_phone}}` — Contact phone number
    *   `{{applied_role}}` — Role applied for
    *   `{{department}}` — Department of the role
    *   `{{cover_letter}}` — Applicant's cover letter statement
    *   `{{to_email}}` — Target HR email inbox

#### 4. Job Application Confirmation Template (`EMAILJS_TEMPLATE_ID_JOB_CONFIRM`)
Automated receipt email sent back to the job applicant.
*   **Recipient Email:** `{{to_email}}`
*   **Placeholders used:**
    *   `{{to_name}}` — Name of the applicant
    *   `{{to_email}}` — Email of the applicant
    *   `{{applied_role}}` — Title of the role applied for

### Step 3: Collect Integration Credentials
Find your integration keys in the EmailJS dashboard:
1. **Public Key:** Found under **Account** / **API Keys**.
2. **Private Key:** Found under **Account** / **API Keys** (Access Token).
3. **Template IDs:** Found under the settings of each template you created.

---

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
