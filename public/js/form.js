(function () {
  const contactForm = document.querySelector("[data-contact-form]");
  const careerForm = document.querySelector("[data-career-form]");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ─── Scroll-to-top button ───────────────────────────────────────────────────
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    window.addEventListener("scroll", function () {
      scrollToTopBtn.style.display =
        (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000)
          ? "block" : "none";
    });
    scrollToTopBtn.addEventListener("click", function () {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
  }

  // ─── Contact popup button ───────────────────────────────────────────────────
  const contactPopupBtn = document.getElementById("contactPopupBtn");
  const contactPopupOverlay = document.getElementById("contactPopupOverlay");
  const contactPopupClose = document.getElementById("contactPopupClose");

  if (contactPopupBtn && contactPopupOverlay) {
    contactPopupBtn.addEventListener("click", function () {
      contactPopupOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    });
    contactPopupClose && contactPopupClose.addEventListener("click", closePopup);
    contactPopupOverlay.addEventListener("click", function (e) {
      if (e.target === contactPopupOverlay) closePopup();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopup();
    });
  }

  function closePopup() {
    if (contactPopupOverlay) {
      contactPopupOverlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  // ─── Counter animation ──────────────────────────────────────────────────────
  window.ABCSolutionsCompanyCounters = {
    observe() {
      const counters = document.querySelectorAll("[data-count]");
      if (!counters.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / 1500, 1);
            el.textContent = `${Math.floor(progress * target)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      }, { threshold: 0.35 });

      counters.forEach((counter) => observer.observe(counter));
    }
  };

  // ─── Form helpers ───────────────────────────────────────────────────────────
  function errorFor(field) {
    const value = field.value.trim();
    if (field.required && !value) return "This field is required.";
    if (field.type === "email" && value && !emailRegex.test(value)) return "Enter a valid email address.";
    if (field.name === "message" && value.length < 10) return "Message must be at least 10 characters.";
    return "";
  }

  function showFieldError(field, message) {
    const holder = field.closest(".form-field") && field.closest(".form-field").querySelector(".field-error");
    if (holder) holder.textContent = message;
  }

  function validate(form) {
    let valid = true;
    form.querySelectorAll("input, textarea, select").forEach((field) => {
      const message = errorFor(field);
      showFieldError(field, message);
      if (message) valid = false;
    });
    return valid;
  }

  // Wire validation to error on blur
  function wireValidation(form) {
    form.querySelectorAll("input, textarea, select").forEach((field) => {
      field.addEventListener("blur", () => showFieldError(field, errorFor(field)));
    });
  }

  async function fileToBase64(file) {
    if (!file) return "";
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitForm(form, url, extra = {}) {
    const msgEl = form.querySelector(".form-message");
    const button = form.querySelector("button[type='submit']");
    if (!validate(form)) return;

    const data = Object.fromEntries(new FormData(form).entries());
    Object.assign(data, extra);
    if (msgEl) msgEl.textContent = "";
    if (button) button.disabled = true;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const payload = await response.json();
      if (!response.ok) throw payload;
      if (msgEl) {
        msgEl.className = "form-message success";
        msgEl.textContent = payload.message;
      }
      form.reset();
      // Close popup after successful contact submission
      if (form.closest("#contactPopupOverlay")) {
        setTimeout(closePopup, 2500);
      }
    } catch (error) {
      if (msgEl) {
        msgEl.className = "form-message error";
        msgEl.textContent = error.message || "Something went wrong. Please try again.";
      }
    } finally {
      if (button) button.disabled = false;
    }
  }

  if (contactForm) {
    wireValidation(contactForm);
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm(contactForm, "/api/contact");
    });
  }

  if (careerForm) {
    wireValidation(careerForm);
    careerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const resume = careerForm.querySelector("[name='resume']");
      const resumeBase64 = await fileToBase64(resume && resume.files[0]);
      submitForm(careerForm, "/api/careers-apply", { resumeBase64 });
    });
  }
})();
