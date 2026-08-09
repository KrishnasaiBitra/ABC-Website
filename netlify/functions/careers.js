// netlify/functions/careers.js

const jobs = [
  {
    role: "Core Banking Integration Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "Dharmapuri (On-site)",
    isRemote: false,
    description: "You'll work directly on CBS platforms — integrations, customizations, data mapping, and deployment support. You know banking middleware and you're not afraid of legacy codebases.",
    requirements: ["2+ years in banking IT", "Java/Spring Boot", "CBS experience (Finacle or BaNCS preferred)"]
  },
  {
    role: "React Frontend Developer",
    department: "Engineering",
    type: "Full-time",
    location: "Remote",
    isRemote: true,
    description: "You'll build and maintain client-facing dashboards and internal portals. Clean code, component reuse, and performance matter to us.",
    requirements: ["1+ years with React", "REST API integration", "Solid CSS skills"]
  },
  {
    role: "Business Analyst - Banking Domain",
    department: "Banking",
    type: "Full-time",
    location: "Dharmapuri (On-site)",
    isRemote: false,
    description: "You'll bridge the gap between our clients' banking operations and our technical teams. You should be able to read a BRD and translate it into a spec that developers actually use.",
    requirements: ["Banking domain experience", "Strong documentation skills", "Client-facing communication"]
  },
  {
    role: "HR Executive",
    department: "HR",
    type: "Full-time",
    location: "Dharmapuri (On-site)",
    isRemote: false,
    description: "Manage recruitment pipelines, onboarding, payroll coordination, and employee engagement. You should be organized and people-first.",
    requirements: ["1+ years in HR", "Familiarity with HRMS tools"]
  }
];

exports.handler = async function (event) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, data: jobs })
  };
};
