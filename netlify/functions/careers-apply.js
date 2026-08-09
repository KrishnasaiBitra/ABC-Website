// netlify/functions/careers-apply.js
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
  getCorsHeaders,
  parseBase64Upload
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
    return jsonResponse(429, { success: false, message: 'Too many submission attempts. Please try again later.' }, origin);
  }

  const fullName = normalizeString(body.fullName, { maxLength: MAX_LENGTHS.name });
  const email = normalizeString(body.email, { maxLength: MAX_LENGTHS.email });
  const phone = normalizeString(body.phone, { maxLength: MAX_LENGTHS.phone });
  const role = normalizeString(body.role, { maxLength: MAX_LENGTHS.role });
  const department = normalizeString(body.department, { maxLength: MAX_LENGTHS.department, allowEmpty: true });
  const coverLetter = normalizeString(body.coverLetter, { maxLength: MAX_LENGTHS.coverLetter, allowEmpty: true });

  if (!fullName) {
    return jsonResponse(400, { success: false, message: 'Full name is required.' }, origin);
  }
  if (!email || !isEmailValid(email)) {
    return jsonResponse(400, { success: false, message: 'Enter a valid email address.' }, origin);
  }
  if (!phone) {
    return jsonResponse(400, { success: false, message: 'Phone number is required.' }, origin);
  }
  if (!role) {
    return jsonResponse(400, { success: false, message: 'Please select the role you are applying for.' }, origin);
  }

  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const COMPANY_EMAIL = process.env.COMPANY_EMAIL;

  if (!SMTP_USER || !SMTP_PASS || !COMPANY_EMAIL) {
    console.error('Career form missing SMTP config', { hasUser: !!SMTP_USER, hasPass: !!SMTP_PASS, hasCompanyEmail: !!COMPANY_EMAIL });
    return jsonResponse(500, { success: false, message: 'Email service is not configured. Please try again later.' }, origin);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const attachments = [];
  if (typeof body.resumeBase64 === 'string' && body.resumeBase64.trim()) {
    const parsedResume = parseBase64Upload(body.resumeBase64, { maxBytes: 5 * 1024 * 1024 });
    if (!parsedResume.ok) {
      return jsonResponse(400, { success: false, message: parsedResume.error }, origin);
    }

    attachments.push({
      filename: `Resume_${fullName.replace(/\s+/g, '_')}.${parsedResume.extension}`,
      content: parsedResume.buffer,
      contentType: parsedResume.mime
    });
  }

  const safeFullName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeRole = escapeHtml(role);
  const safeDepartment = escapeHtml(department || 'Not specified');
  const safeCoverLetter = escapeHtml(coverLetter || 'Not provided');

  try {
    const companyMail = await transporter.sendMail({
      from: `"Afnamtech Private Limited" <${SMTP_USER}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Job Application: ${role} - ${fullName}`,
      text: `You have received a new job application.\n\nApplicant Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nApplied Role: ${role}\nDepartment: ${department || 'Not specified'}\n\nCover Letter:\n${coverLetter || 'Not provided'}\n\n${attachments.length ? 'Note: The applicant\'s resume is attached to this email.' : 'Note: No resume was attached.'}`,
      html: `<p>You have received a new job application.</p><p><strong>Applicant Name:</strong> ${safeFullName}<br><strong>Email:</strong> ${safeEmail}<br><strong>Phone:</strong> ${safePhone}<br><strong>Applied Role:</strong> ${safeRole}<br><strong>Department:</strong> ${safeDepartment}</p><p><strong>Cover Letter:</strong><br>${safeCoverLetter.replace(/\n/g, '<br>')}</p>${attachments.length ? '<p><em>Note: The applicant\'s resume is attached to this email.</em></p>' : '<p><em>Note: No resume was attached.</em></p>'}`,
      attachments
    });
    console.log('Career company mail accepted by SMTP', {
      to: COMPANY_EMAIL,
      messageId: companyMail && companyMail.messageId,
      response: companyMail && companyMail.response
    });

    const confirmationMail = await transporter.sendMail({
      from: `"Afnamtech Private Limited" <${SMTP_USER}>`,
      to: email,
      replyTo: COMPANY_EMAIL,
      subject: `Application Received: ${role}`,
      text: `Dear ${fullName},\n\nThank you for applying for the position of "${role}" at Afnamtech Private Limited.\n\nWe have successfully received your application. Our recruitment team is currently reviewing submissions, and if your background matches our requirements, we will reach out to you within 5 business days for next steps.\n\nBest regards,\nHR & Recruitment Team\nAfnamtech Private Limited\nProsperous Enclave layout, 1" cross, Plot #47, 3rd Floor, Vitta sandra, Electronics City, Behind Vibgyor School, Bangalore - 560100.`,
      html: `<p>Dear ${safeFullName},</p><p>Thank you for applying for the position of "<strong>${safeRole}</strong>" at Afnamtech Private Limited.</p><p>We have successfully received your application. Our recruitment team is currently reviewing submissions, and if your background matches our requirements, we will reach out to you within 5 business days for next steps.</p><p>Best regards,<br><strong>HR & Recruitment Team</strong><br>Afnamtech Private Limited<br>Prosperous Enclave layout, 1" cross, Plot #47, 3rd Floor, Vitta sandra, Electronics City, Behind Vibgyor School, Bangalore - 560100.</p>`
    });
    console.log('Career confirmation mail accepted by SMTP', {
      to: email,
      messageId: confirmationMail && confirmationMail.messageId,
      response: confirmationMail && confirmationMail.response
    });

    return jsonResponse(200, {
      success: true,
      message: 'Application received. Our HR team will reach out within 5 business days.'
    }, origin);
  } catch (error) {
    console.error('Career application SMTP send failed', {
      code: error && error.code,
      message: error && error.message,
      response: error && error.response ? String(error.response).slice(0, 200) : null
    });
    return jsonResponse(500, { success: false, message: 'Could not submit your application. Please try again later.' }, origin);
  }
};
