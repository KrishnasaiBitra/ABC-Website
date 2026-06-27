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

  // Helper to normalize path comparison
  const normalizePath = (path) => path.replace(/\.html$/, "").replace(/\/$/, "") || "/";
  const normalizedCurrent = normalizePath(window.location.pathname);

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

  // Create Left & Right Side Navigation Bars
  function createSideNavs() {
    if (document.getElementById("side-nav-left")) return;

    // Define all 5 navigation items
    const navItems = [
      {
        href: "/",
        label: "Home",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
      },
      {
        href: "/our-story",
        label: "Our Story",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`
      },
      {
        href: "/solutions",
        label: "Solutions",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="15" x2="23" y2="15"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="15" x2="4" y2="15"></line></svg>`
      },
      {
        href: "/what-we-offer",
        label: "What We Offer",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`
      },
      {
        href: "/career",
        label: "Career",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
      }
    ];

    // Find label of active item to show in vertical name mode
    const activeItem = navItems.find(item => {
      const normalizedLink = normalizePath(new URL(item.href, window.location.origin).pathname);
      return normalizedLink === normalizedCurrent || (normalizedCurrent === "/" && normalizedLink === "/index");
    });
    const activeLabel = activeItem ? activeItem.label : "Home";

    function buildSideNav(id, positionClass, items) {
      const nav = document.createElement("nav");
      nav.id = id;
      nav.className = `side-nav ${positionClass}`;
      nav.setAttribute("aria-label", `${positionClass.replace("side-nav-", "")} side navigation`);

      items.forEach(item => {
        const a = document.createElement("a");
        a.href = item.href;
        a.className = "side-nav-item";
        a.innerHTML = `
          ${item.icon}
          <span class="side-nav-tooltip">${item.label}</span>
        `;
        nav.appendChild(a);
      });

      // Add name overlay
      const activeNameDiv = document.createElement("div");
      activeNameDiv.className = "side-nav-active-name";
      activeNameDiv.innerHTML = `<span>${activeLabel}</span>`;
      nav.appendChild(activeNameDiv);

      document.body.appendChild(nav);
    }

    // Build the left side nav with all 5 links
    buildSideNav("side-nav-left", "side-nav-left", navItems);
  }

  // Assign section IDs dynamically on load
  function assignSectionIds() {
    const path = normalizedCurrent;
    const sections = document.querySelectorAll("main > section");
    
    if (path === "/" || path === "/index") {
      const ids = ["hero", "products", "projects", "case-studies", "engagement", "leadership", "partners", "why-us", "clients", "tools"];
      sections.forEach((sec, idx) => {
        if (ids[idx] && !sec.id) sec.id = ids[idx];
      });
    } else if (path === "/our-story") {
      const ids = ["hero", "overview", "stats", "milestones"];
      sections.forEach((sec, idx) => {
        if (ids[idx] && !sec.id) sec.id = ids[idx];
      });
    } else if (path === "/solutions") {
      const ids = ["hero", "solutions-list"];
      sections.forEach((sec, idx) => {
        if (ids[idx] && !sec.id) sec.id = ids[idx];
      });
    } else if (path === "/what-we-offer") {
      const ids = ["hero", "services", "stats", "engagement-models"];
      sections.forEach((sec, idx) => {
        if (ids[idx] && !sec.id) sec.id = ids[idx];
      });
    } else if (path === "/career") {
      const ids = ["hero", "careers-intro", "open-positions", "application-form", "why-us"];
      sections.forEach((sec, idx) => {
        if (ids[idx] && !sec.id) sec.id = ids[idx];
      });
    }
  }

  // Create Slide-out Navigation Drawer
  function createRightMenuDrawer() {
    if (document.getElementById("side-menu-drawer")) return;

    // Trigger button (Floating Grid Icon on the right)
    const trigger = document.createElement("button");
    trigger.className = "side-menu-trigger";
    trigger.setAttribute("aria-label", "Open site navigation");
    trigger.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    `;

    // Backdrop Overlay
    const overlay = document.createElement("div");
    overlay.className = "side-menu-overlay";

    // Drawer Panel
    const drawer = document.createElement("div");
    drawer.className = "side-menu-drawer";
    drawer.id = "side-menu-drawer";

    // SVGs for socials
    const fb = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
    const tw = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`;
    const li = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
    const yt = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`;

    drawer.innerHTML = `
      <button class="side-menu-close" id="side-menu-close" aria-label="Close menu">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        Close
      </button>
      <div class="drawer-content">
        <div class="drawer-brand">
          <span>ABC Solutions</span><small>company</small>
        </div>
        <div class="drawer-section-title">QUICK LINKS</div>
        <ul class="drawer-menu">
          <li class="drawer-menu-item">
            <a href="/" class="parent-link">Home</a>
            <ul class="drawer-submenu">
              <li><a href="/#products">Products</a></li>
              <li><a href="/#projects">Projects</a></li>
              <li><a href="/#case-studies">Case Studies</a></li>
              <li><a href="/#engagement">Engagement Models</a></li>
              <li><a href="/#leadership">Leadership</a></li>
              <li><a href="/#partners">Partners</a></li>
              <li><a href="/#why-us">Why Us</a></li>
              <li><a href="/#clients">Clients</a></li>
              <li><a href="/#tools">Tech Stack</a></li>
            </ul>
          </li>
          <li class="drawer-menu-item">
            <a href="/our-story" class="parent-link">Our Story</a>
            <ul class="drawer-submenu">
              <li><a href="/our-story#overview">Overview</a></li>
              <li><a href="/our-story#milestones">Milestones</a></li>
            </ul>
          </li>
          <li class="drawer-menu-item">
            <a href="/solutions" class="parent-link">Solutions</a>
            <ul class="drawer-submenu">
              <li><a href="/solutions#solutions-list">Our Products & Solutions</a></li>
            </ul>
          </li>
          <li class="drawer-menu-item">
            <a href="/what-we-offer" class="parent-link">What We Offer</a>
            <ul class="drawer-submenu">
              <li><a href="/what-we-offer#services">Core Services</a></li>
              <li><a href="/what-we-offer#stats">Frameworks & Tools</a></li>
              <li><a href="/what-we-offer#engagement-models">Engagement Models</a></li>
            </ul>
          </li>
          <li class="drawer-menu-item">
            <a href="/career" class="parent-link">Career</a>
            <ul class="drawer-submenu">
              <li><a href="/career#careers-intro">Overview</a></li>
              <li><a href="/career#open-positions">Open Positions</a></li>
              <li><a href="/career#application-form">Application Form</a></li>
              <li><a href="/career#why-us">Why Work With Us</a></li>
            </ul>
          </li>
        </ul>
        <div class="drawer-socials">
          <a href="https://www.facebook.com/whitestonepvtltd" target="_blank" aria-label="Facebook">${fb}</a>
          <a href="https://x.com/whitestonepvtld" target="_blank" aria-label="X">${tw}</a>
          <a href="https://www.linkedin.com/company/whitestonepvtltd" target="_blank" aria-label="LinkedIn">${li}</a>
          <a href="https://www.instagram.com/whitestonepvtltd" target="_blank" aria-label="Instagram">${yt}</a>
        </div>
      </div>
    `;

    document.body.appendChild(trigger);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    function openDrawer() {
      drawer.classList.add("open");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    trigger.addEventListener("click", openDrawer);
    overlay.addEventListener("click", closeDrawer);
    
    const closeBtn = drawer.querySelector("#side-menu-close");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        closeDrawer();
      }
    });

    // Handle submenu link scrolling on the same page
    drawer.querySelectorAll(".drawer-submenu a, .parent-link").forEach(link => {
      link.addEventListener("click", (e) => {
        const linkUrl = new URL(link.href, window.location.origin);
        
        if (normalizePath(linkUrl.pathname) === normalizedCurrent) {
          const hash = linkUrl.hash;
          if (hash) {
            e.preventDefault();
            const targetElement = document.querySelector(hash);
            if (targetElement) {
              closeDrawer();
              setTimeout(() => {
                targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                history.pushState(null, null, hash);
              }, 300);
            }
          } else if (link.classList.contains("parent-link")) {
            e.preventDefault();
            closeDrawer();
            window.scrollTo({ top: 0, behavior: "smooth" });
            history.pushState(null, null, window.location.pathname);
          }
        }
      });
    });
  }

  // Initialize features
  assignSectionIds();
  createSideNavs();
  createRightMenuDrawer();

  // Set active classes and navigation event listeners
  document.querySelectorAll(".nav-links a, .side-nav-item").forEach((link) => {
    const normalizedLink = normalizePath(new URL(link.href).pathname);
    
    if (normalizedLink === normalizedCurrent || (normalizedCurrent === "/" && normalizedLink === "/index")) {
      link.classList.add("active");
    }

    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Handle smooth scroll on load if hash is present
  if (window.location.hash) {
    window.scrollTo(0, 0);
    window.addEventListener("load", () => {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
    });
  }

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
