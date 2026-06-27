// netlify/functions/careers-apply.js

const nodemailer = require("nodemailer");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: "Method not allowed." }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid request body." }) };
  }

  const { fullName, email, phone, role, department, coverLetter } = body;
  const errors = [];

  if (!fullName || !fullName.trim()) errors.push("Full name is required.");
  if (!email || !emailRegex.test(email)) errors.push("Enter a valid email address.");
  if (!phone || !phone.trim()) errors.push("Phone number is required.");
  if (!role || !role.trim()) errors.push("Please select the role you are applying for.");

  if (errors.length) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: errors[0] }) };
  }

  const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "info@whitestone.in";

  if (!SMTP_USER || !SMTP_PASS) {
    console.error("Missing SMTP credentials.");
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Email service is not configured. Please set SMTP credentials." })
    };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  const attachments = [];
  if (body.resumeBase64) {
    const matches = body.resumeBase64.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      const contentType = matches[1];
      const base64Data = matches[2];
      
      let extension = "bin";
      if (contentType.includes("pdf")) extension = "pdf";
      else if (contentType.includes("msword")) extension = "doc";
      else if (contentType.includes("officedocument.wordprocessingml")) extension = "docx";
      else if (contentType.includes("jpeg")) extension = "jpg";
      else if (contentType.includes("png")) extension = "png";

      attachments.push({
        filename: `Resume_${fullName.trim().replace(/\s+/g, "_")}.${extension}`,
        content: Buffer.from(base64Data, "base64"),
        contentType: contentType
      });
    }
  }

  try {
    // Email 1: HR team notification
    await transporter.sendMail({
      from: `"${fullName.trim()}" <${SMTP_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: email.trim(),
      subject: `New Job Application: ${role.trim()} - ${fullName.trim()}`,
      text: `You have received a new job application.\n\n` +
            `Applicant Name: ${fullName.trim()}\n` +
            `Email: ${email.trim()}\n` +
            `Phone: ${phone.trim()}\n` +
            `Applied Role: ${role.trim()}\n` +
            `Department: ${department ? department.trim() : "Not specified"}\n\n` +
            `Cover Letter:\n${coverLetter ? coverLetter.trim() : "Not provided"}\n\n` +
            (attachments.length ? `Note: The applicant's resume is attached to this email.` : `Note: No resume was attached.`),
      html: `<p>You have received a new job application.</p>` +
            `<p><strong>Applicant Name:</strong> ${fullName.trim()}<br>` +
            `<strong>Email:</strong> ${email.trim()}<br>` +
            `<strong>Phone:</strong> ${phone.trim()}<br>` +
            `<strong>Applied Role:</strong> ${role.trim()}<br>` +
            `<strong>Department:</strong> ${department ? department.trim() : "Not specified"}</p>` +
            `<p><strong>Cover Letter:</strong><br>${coverLetter ? coverLetter.trim().replace(/\n/g, "<br>") : "Not provided"}</p>` +
            (attachments.length ? `<p><em>Note: The applicant's resume is attached to this email.</em></p>` : `<p><em>Note: No resume was attached.</em></p>`),
      attachments: attachments
    });

    // Email 2: Confirmation to applicant
    await transporter.sendMail({
      from: `"ABC Solutions Careers" <${SMTP_USER}>`,
      to: email.trim(),
      subject: `Application Received: ${role.trim()}`,
      text: `Dear ${fullName.trim()},\n\n` +
            `Thank you for applying for the position of "${role.trim()}" at ABC Solutions Company Pvt. Ltd.\n\n` +
            `We have successfully received your application. Our recruitment team is currently reviewing submissions, and if your background matches our requirements, we will reach out to you within 5 business days for next steps.\n\n` +
            `Best regards,\n` +
            `HR & Recruitment Team\n` +
            `ABC Solutions Company Pvt. Ltd.\n` +
            `Dharmapuri, Tamil Nadu, India`,
      html: `<p>Dear ${fullName.trim()},</p>` +
            `<p>Thank you for applying for the position of "<strong>${role.trim()}</strong>" at ABC Solutions Company Pvt. Ltd.</p>` +
            `<p>We have successfully received your application. Our recruitment team is currently reviewing submissions, and if your background matches our requirements, we will reach out to you within 5 business days for next steps.</p>` +
            `<p>Best regards,<br>` +
            `<strong>HR & Recruitment Team</strong><br>` +
            `ABC Solutions Company Pvt. Ltd.<br>` +
            `Dharmapuri, Tamil Nadu, India</p>`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Application received. Our HR team will reach out within 5 business days."
      })
    };
  } catch (error) {
    console.error("Nodemailer SMTP error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Could not submit your application. Please try again later." })
    };
  }
};
