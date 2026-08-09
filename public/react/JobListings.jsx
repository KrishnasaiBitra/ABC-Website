import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

export function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/careers")
      .then((response) => response.json())
      .then((payload) => setJobs(payload.data || []))
      .catch(() => setJobs([]));
  }, []);

  const visible = useMemo(() => {
    if (filter === "All") return jobs;
    return jobs.filter((job) => [job.department, job.type, job.location].some((value) => String(value).includes(filter)));
  }, [filter, jobs]);

  return (
    <div>
      <div className="filters">
        {["All", "Engineering", "Banking", "HR", "Full-time", "Remote"].map((item) => (
          <button className={`filter-btn ${filter === item ? "active" : ""}`} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>
      <div className="grid">
        {visible.map((job) => (
          <article className="card job-card" key={job.role}>
            <h3>{job.role}</h3>
            <div className="job-meta"><span>{job.department}</span><span>{job.type}</span><span>{job.location}</span></div>
            <p>{job.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

const mount = document.querySelector("[data-react-job-listings]");
if (mount) createRoot(mount).render(<JobListings />);
