// netlify/functions/contact.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const nodemailer = require('nodemailer');
const {
  jsonResponse,
  normalizeString,
  isEmailValid,
  escapeHtml,
  MAX_LENGTHS,
  getClientIp,
  createRateLimiter,
  getCorsHeaders
} = require('../../lib/validation');

const rateLimiter = createRateLimiter();

exports.handler = async function (event) {
  const origin = event.headers && (event.headers.origin || event.headers.Origin) ? (event.headers.origin || event.headers.Origin) : null;

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: getCorsHeaders(origin),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { success: false, message: 'Method not allowed.' }, origin);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { success: false, message: 'Invalid request body.' }, origin);
  }

  if (body && typeof body === 'object' && body.website && String(body.website).trim()) {
    return jsonResponse(400, { success: false, message: 'Submission rejected.' }, origin);
  }

  const clientIp = getClientIp(event.headers || {});
  const limit = rateLimiter(clientIp);
  if (!limit.allowed) {
    return jsonResponse(429, { success: false, message: 'Too many submissions. Please try again later.' }, origin);
  }

  const fullName = normalizeString(body.fullName, { maxLength: MAX_LENGTHS.name });
  const email = normalizeString(body.email, { maxLength: MAX_LENGTHS.email });
  const subject = normalizeString(body.subject, { maxLength: MAX_LENGTHS.subject });
  const message = normalizeString(body.message, { maxLength: MAX_LENGTHS.message });

  if (!fullName) {
    return jsonResponse(400, { success: false, message: 'Full name is required.' }, origin);
  }
  if (!email || !isEmailValid(email)) {
    return jsonResponse(400, { success: false, message: 'Enter a valid email address.' }, origin);
  }
  if (!subject) {
    return jsonResponse(400, { success: false, message: 'Subject is required.' }, origin);
  }
  if (!message || message.length < 10) {
    return jsonResponse(400, { success: false, message: 'Message must be at least 10 characters.' }, origin);
  }

  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const COMPANY_EMAIL = process.env.COMPANY_EMAIL;

  if (!SMTP_USER || !SMTP_PASS || !COMPANY_EMAIL) {
    console.error('Contact form missing SMTP config', { hasUser: !!SMTP_USER, hasPass: !!SMTP_PASS, hasCompanyEmail: !!COMPANY_EMAIL });
    return jsonResponse(500, { success: false, message: 'Email service is not configured. Please try again later.' }, origin);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message);

  try {
    const companyMail = await transporter.sendMail({
      from: `"ABC Solutions Company" <${SMTP_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Contact Enquiry: ${subject}`,
      text: `You have received a new contact enquiry from your website.\n\nName: ${fullName}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `<p>You have received a new contact enquiry from your website.</p>` +
        `<p><strong>Name:</strong> ${safeName}<br>` +
        `<strong>Email:</strong> ${safeEmail}<br>` +
        `<strong>Subject:</strong> ${safeSubject}</p>` +
        `<p><strong>Message:</strong><br>${safeMessage.replace(/\n/g, '<br>')}</p>`
    });
    console.log('Contact company mail accepted by SMTP', {
      to: COMPANY_EMAIL,
      messageId: companyMail && companyMail.messageId,
      response: companyMail && companyMail.response
    });

    const confirmationMail = await transporter.sendMail({
      from: `"ABC Solutions Company" <${SMTP_USER}>`,
      to: email,
      replyTo: COMPANY_EMAIL,
      subject: `Thank you for contacting us: ${subject}`,
      text: `Dear ${fullName},\n\nThank you for reaching out to Afnamtech Private Limited.\n\nWe have received your message regarding "${subject}". Our team will review your enquiry and get back to you within 24 hours.\n\nBest regards,\nBanking Technology Team\nAfnamtech Private Limited\nProsperous Enclave layout, 1" cross, Plot #47, 3rd Floor, Vitta sandra, Electronics City, Behind Vibgyor School, Bangalore - 560100.`,
      html: `<p>Dear ${safeName},</p><p>Thank you for contacting Afnamtech Private Limited.</p><p>We have received your message regarding "<strong>${safeSubject}</strong>". Our team will review your enquiry and get back to you within 24 hours.</p><p>Best regards,<br><strong>Banking Technology Team</strong><br>Afnamtech Private Limited<br>Prosperous Enclave layout, 1" cross, Plot #47, 3rd Floor, Vitta sandra, Electronics City, Behind Vibgyor School, Bangalore - 560100.</p>`
    });
    console.log('Contact confirmation mail accepted by SMTP', {
      to: email,
      messageId: confirmationMail && confirmationMail.messageId,
      response: confirmationMail && confirmationMail.response
    });

    return jsonResponse(200, {
      success: true,
      message: "Your message has been received. We'll get back to you within 24 hours."
    }, origin);
  } catch (error) {
    console.error('Contact SMTP send failed', {
      code: error && error.code,
      message: error && error.message,
      response: error && error.response ? String(error.response).slice(0, 200) : null
    });
    return jsonResponse(500, { success: false, message: 'Could not send your message. Please try again later.' }, origin);
  }
};
