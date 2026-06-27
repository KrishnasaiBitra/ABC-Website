// netlify/functions/careers-apply.js

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

  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID_JOB_NOTIFY = process.env.EMAILJS_TEMPLATE_ID_JOB_NOTIFY;
  const EMAILJS_TEMPLATE_ID_JOB_CONFIRM = process.env.EMAILJS_TEMPLATE_ID_JOB_CONFIRM;
  const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
  const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

  const emailjsUrl = "https://api.emailjs.com/api/v1.0/email/send";

  async function sendEmail(templateId, templateParams) {
    const res = await fetch(emailjsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: templateParams
      })
    });
    if (!res.ok) throw new Error(`EmailJS error: ${res.status}`);
  }

  try {
    // Email 1: HR team notification
    await sendEmail(EMAILJS_TEMPLATE_ID_JOB_NOTIFY, {
      applicant_name: fullName.trim(),
      applicant_email: email.trim(),
      applicant_phone: phone.trim(),
      applied_role: role.trim(),
      department: department ? department.trim() : "Not specified",
      cover_letter: coverLetter ? coverLetter.trim() : "Not provided",
      to_email: "info@whitestone.in"
    });

    // Email 2: Confirmation to applicant
    await sendEmail(EMAILJS_TEMPLATE_ID_JOB_CONFIRM, {
      to_name: fullName.trim(),
      to_email: email.trim(),
      applied_role: role.trim()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Application received. Our HR team will reach out within 5 business days."
      })
    };
  } catch (error) {
    console.error("EmailJS error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Could not submit your application. Please try again later." })
    };
  }
};
