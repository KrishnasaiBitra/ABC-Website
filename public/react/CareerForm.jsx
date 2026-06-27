import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function toBase64(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CareerForm({ jobs = [] }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages
    
    const form = event.currentTarget;
    
    try {
      const formData = new FormData(form);
      const resumeBase64 = await toBase64(formData.get("resume"));
      const data = Object.fromEntries(formData.entries());
      delete data.resume;
      data.resumeBase64 = resumeBase64;
      
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const payload = await response.json();
      setMessage(payload.message || "Application submitted successfully!");
      form.reset();
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
      <label className="form-field"><span>Phone</span><input name="phone" required /></label>
      <label className="form-field"><span>Role</span><select name="role" required>{jobs.map((job) => <option key={job.role}>{job.role}</option>)}</select></label>
      <label className="form-field"><span>Department</span><select name="department" required><option>Engineering</option><option>Banking</option><option>HR</option><option>Operations</option></select></label>
      <label className="form-field"><span>Resume</span><input type="file" name="resume" /></label>
      <label className="form-field full"><span>Cover Letter</span><textarea name="coverLetter" /></label>
      <div className="full"><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Submitting" : "Submit Application"}</button><p>{message}</p></div>
    </form>
  );
}

const mount = document.querySelector("[data-react-career-form]");
if (mount) createRoot(mount).render(<CareerForm jobs={window.ABCSolutionsCompanyJobs || []} />);
