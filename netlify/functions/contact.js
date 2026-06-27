// netlify/functions/contact.js

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

  const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const EMAILJS_TEMPLATE_ID_COMPANY = process.env.EMAILJS_TEMPLATE_ID_COMPANY;
  const EMAILJS_TEMPLATE_ID_CONFIRM = process.env.EMAILJS_TEMPLATE_ID_CONFIRM;
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
    // Email 1: Notify the company about the new enquiry
    await sendEmail(EMAILJS_TEMPLATE_ID_COMPANY, {
      from_name: fullName.trim(),
      from_email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      to_email: "info@whitestone.in"
    });

    // Email 2: Confirmation to the person who submitted the form
    await sendEmail(EMAILJS_TEMPLATE_ID_CONFIRM, {
      to_name: fullName.trim(),
      to_email: email.trim(),
      subject: subject.trim()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Your message has been received. We'll get back to you within 24 hours."
      })
    };
  } catch (error) {
    console.error("EmailJS error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "Could not send your message. Please try again later." })
    };
  }
};
