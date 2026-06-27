import React, { useState } from "react";
import { createRoot } from "react-dom/client";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages
    
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const payload = await response.json();
      setMessage(payload.message || "Message sent successfully!");
      event.currentTarget.reset();
    } catch (error) {
      console.error("Form submission error:", error);
      setMessage(`Error: ${error.message}. Please try again later.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="application-form" onSubmit={submit}>
      <label className="form-field"><span>Full Name</span><input name="fullName" required /></label>
      <label className="form-field"><span>Email</span><input type="email" name="email" required /></label>
      <label className="form-field full"><span>Subject</span><input name="subject" required /></label>
      <label className="form-field full"><span>Message</span><textarea name="message" required minLength="10" /></label>
      <div className="full"><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Sending" : "Send Message"}</button><p>{message}</p></div>
    </form>
  );
}

const mount = document.querySelector("[data-react-contact-form]");
if (mount) createRoot(mount).render(<ContactForm />);
