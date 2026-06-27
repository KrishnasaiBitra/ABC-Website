// netlify/functions/contact.js

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

  const { fullName, email, subject, message } = body;
  const errors = [];

  if (!fullName || !fullName.trim()) errors.push("Full name is required.");
  if (!email || !emailRegex.test(email)) errors.push("Enter a valid email address.");
  if (!subject || !subject.trim()) errors.push("Subject is required.");
  if (!message || message.trim().length < 10) errors.push("Message must be at least 10 characters.");

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

  try {
    // Email 1: Notify the company about the new enquiry
    await transporter.sendMail({
      from: `"${fullName.trim()}" <${SMTP_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: email.trim(),
      subject: `New Contact Enquiry: ${subject.trim()}`,
      text: `You have received a new contact enquiry from your website.\n\n` +
            `Name: ${fullName.trim()}\n` +
            `Email: ${email.trim()}\n` +
            `Subject: ${subject.trim()}\n\n` +
            `Message:\n${message.trim()}`,
      html: `<p>You have received a new contact enquiry from your website.</p>` +
            `<p><strong>Name:</strong> ${fullName.trim()}<br>` +
            `<strong>Email:</strong> ${email.trim()}<br>` +
            `<strong>Subject:</strong> ${subject.trim()}</p>` +
            `<p><strong>Message:</strong><br>${message.trim().replace(/\n/g, "<br>")}</p>`
    });

    // Email 2: Confirmation response to the person who submitted the form
    await transporter.sendMail({
      from: `"ABC Solutions Company" <${SMTP_USER}>`,
      to: email.trim(),
      subject: `Thank you for contacting us: ${subject.trim()}`,
      text: `Dear ${fullName.trim()},\n\n` +
            `Thank you for reaching out to ABC Solutions Company Pvt. Ltd.\n\n` +
            `We have received your message regarding "${subject.trim()}". Our team will review your enquiry and get back to you within 24 hours.\n\n` +
            `Best regards,\n` +
            `Banking Technology Team\n` +
            `ABC Solutions Company Pvt. Ltd.\n` +
            `Dharmapuri, Tamil Nadu, India`,
      html: `<p>Dear ${fullName.trim()},</p>` +
            `<p>Thank you for reaching out to ABC Solutions Company Pvt. Ltd.</p>` +
            `<p>We have received your message regarding "<strong>${subject.trim()}</strong>". Our team will review your enquiry and get back to you within 24 hours.</p>` +
            `<p>Best regards,<br>` +
            `<strong>Banking Technology Team</strong><br>` +
            `ABC Solutions Company Pvt. Ltd.<br>` +
            `Dharmapuri, Tamil Nadu, India</p>`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Your message has been received. We'll get back to you within 24 hours."
      })
    };
  } catch (error) {
    console.error("Nodemailer SMTP error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Could not send your message. Please try again later." })
    };
  }
};
