(function () {
  // Redirect API requests to live Netlify backend when hosted on GoDaddy (or other production hosts)
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === "string" && input.startsWith("/api/")) {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!isLocal) {
        // REPLACE this URL with your actual deployed Netlify site address
        const NETLIFY_BACKEND_URL = "https://abc-solutions-company.netlify.app";
        input = NETLIFY_BACKEND_URL + input;
      }
    }
    return originalFetch(input, init);
  };

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 80);
  }

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll(".nav-links a").forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
    if (linkPath === currentPath || (currentPath === "/" && linkPath.endsWith("index.html"))) {
      link.classList.add("active");
    }

    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll('a[href^="#section-"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
})();
