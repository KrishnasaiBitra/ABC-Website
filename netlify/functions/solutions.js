// netlify/functions/solutions.js

const solutions = [
  {
    order: 1,
    title: "AML (Anti-Money Laundering)",
    description: "Our AML suite is designed for banks and financial institutions that need to stay ahead of regulatory requirements without sacrificing operational speed.",
    features: ["Customer Due-Diligence (CDD) - KYC and Risk Profiling", "Transaction Monitoring", "Suspicious Activity Reporting (SAR)", "Watchlist Screening (OFAC, FATF)", "Case Management", "Regulatory Reporting", "Integration Capabilities"]
  },
  {
    order: 2,
    title: "Ticketing System",
    description: "A purpose-built ticketing engine that brings order to the chaos of internal queries, audit trails, and escalation management.",
    features: ["Complete visibility into audit and query workflows", "Rapid query resolution with SLA tracking", "Reports exportable in PDF, XLS, XLSX, DOC, DOCX formats", "Eliminates manual tracking - everything is logged and timestamped"]
  },
  {
    order: 3,
    title: "ChatBot",
    description: "Deploy a conversational banking assistant that handles customer queries, guides through transactions, and escalates to human agents — round the clock.",
    features: ["Integrated with Mobile Apps and Websites", "24x7 personalized customer service", "25+ channel support and 55+ languages", "Customer service, staff training, and data analytics use cases", "Available on Cloud and On-Premise", "Advanced AI and ML capabilities"]
  },
  {
    order: 4,
    title: "HRMS (WS Workforce)",
    description: "A unified HR platform that replaces disconnected spreadsheets and legacy payroll systems with one integrated dashboard — standalone or API-connected.",
    features: ["Employee Engagement & Management", "Attendance & Leave Management", "Payroll Management", "Recruitment Management", "Compliance Management", "Mobile Accessibility", "Analytics and Reporting"]
  },
  {
    order: 5,
    title: "Payment Automation",
    description: "Automate your payment processing pipeline — from inward credits to return handling — with full auditability and API-first design.",
    features: ["Handles incoming credits, acknowledgements, and return requests seamlessly", "Third-party system integration via open APIs", "Automatic daily reconciliation for accurate financial records", "Powerful reporting and analytics engine"]
  },
  {
    order: 6,
    title: "CRM (WS CRM)",
    description: "Smarter customer management for Core Banking — with built-in operational controls and the flexibility to plug into your existing infrastructure.",
    features: ["Tracks contact details, communication history, preferences, and interactions", "Manages sales opportunities through the pipeline", "CRM features accessible via mobile apps", "Role-based access controls for data privacy", "Scales from small startups to large enterprises"]
  }
];

exports.handler = async function () {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, data: solutions })
  };
};
