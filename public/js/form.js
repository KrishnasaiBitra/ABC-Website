(function () {
  const contactForm = document.querySelector("[data-contact-form]");
  const careerForm = document.querySelector("[data-career-form]");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_NAME_LENGTH = 100;
  const MAX_SUBJECT_LENGTH = 200;
  const MAX_PHONE_LENGTH = 30;
  const MAX_ROLE_LENGTH = 200;
  const MAX_DEPARTMENT_LENGTH = 100;
  const MAX_COVER_LETTER_LENGTH = 4000;

  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (scrollToTopBtn) {
    window.addEventListener('scroll', function () {
      scrollToTopBtn.style.display = (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) ? 'block' : 'none';
    });
    scrollToTopBtn.addEventListener('click', function () {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    });
  }

  const contactPopupBtn = document.getElementById('contactPopupBtn');
  const contactPopupOverlay = document.getElementById('contactPopupOverlay');
  const contactPopupClose = document.getElementById('contactPopupClose');

  if (contactPopupBtn && contactPopupOverlay) {
    contactPopupBtn.addEventListener('click', function () {
      contactPopupOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    contactPopupClose && contactPopupClose.addEventListener('click', closePopup);
    contactPopupOverlay.addEventListener('click', function (e) {
      if (e.target === contactPopupOverlay) closePopup();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });
  }

  function closePopup() {
    if (contactPopupOverlay) {
      contactPopupOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  window.ABCSolutionsCompanyCounters = {
    observe() {
      const counters = document.querySelectorAll('[data-count]');
      if (!counters.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.count);
          const suffix = el.dataset.suffix || '';
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

  function errorFor(field) {
    const value = String(field.value || '').trim();
    if (field.required && !value) return 'This field is required.';
    if (field.name === 'email' && value && !emailRegex.test(value)) return 'Enter a valid email address.';
    if (field.name === 'message' && value.length < 10) return 'Message must be at least 10 characters.';
    if (field.name === 'message' && value.length > MAX_MESSAGE_LENGTH) return 'Message is too long.';
    if (field.name === 'fullName' && value.length > MAX_NAME_LENGTH) return 'Name is too long.';
    if (field.name === 'subject' && value.length > MAX_SUBJECT_LENGTH) return 'Subject is too long.';
    if (field.name === 'phone' && value.length > MAX_PHONE_LENGTH) return 'Phone number is too long.';
    if (field.name === 'role' && value.length > MAX_ROLE_LENGTH) return 'Role name is too long.';
    if (field.name === 'department' && value.length > MAX_DEPARTMENT_LENGTH) return 'Department is too long.';
    if (field.name === 'coverLetter' && value.length > MAX_COVER_LETTER_LENGTH) return 'Cover letter is too long.';
    return '';
  }

  function showFieldError(field, message) {
    const holder = field.closest('.form-field') && field.closest('.form-field').querySelector('.field-error');
    if (holder) holder.textContent = message;
  }

  function validate(form) {
    let valid = true;
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      if (field.name === 'website' && field.value.trim()) {
        valid = false;
        return;
      }
      const message = errorFor(field);
      showFieldError(field, message);
      if (message) valid = false;
    });
    return valid;
  }

  function wireValidation(form) {
    form.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('blur', () => showFieldError(field, errorFor(field)));
    });
  }

  function isAllowedResumeFile(file) {
    if (!file) return { ok: true, file: null };
    const allowedMime = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.ms-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]);
    const extension = file.name && file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    const allowedExt = new Set(['pdf', 'doc', 'docx']);
    const mimeOk = allowedMime.has(file.type) || allowedExt.has(extension);
    const sizeOk = file.size > 0 && file.size <= 5 * 1024 * 1024;
    if (!mimeOk || !sizeOk) {
      return { ok: false, error: 'Upload a PDF, DOC, or DOCX file up to 5 MB.' };
    }
    return { ok: true, file };
  }

  async function fileToBase64(file) {
    if (!file) return '';
    const allowed = isAllowedResumeFile(file);
    if (!allowed.ok) {
      throw new Error(allowed.error || 'Unsupported resume file.');
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitForm(form, url, extra = {}) {
    const msgEl = form.querySelector('.form-message');
    const button = form.querySelector("button[type='submit']");
    if (!validate(form)) return;

    const data = Object.fromEntries(new FormData(form).entries());
    Object.assign(data, extra);
    if (msgEl) msgEl.textContent = '';
    if (button) button.disabled = true;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const payload = await response.json();
      if (!response.ok) throw payload;
      if (msgEl) {
        msgEl.className = 'form-message success';
        msgEl.textContent = payload.message;
      }
      form.reset();
      if (form.closest('#contactPopupOverlay')) {
        setTimeout(closePopup, 2500);
      }
    } catch (error) {
      if (msgEl) {
        msgEl.className = 'form-message error';
        msgEl.textContent = error.message || 'Something went wrong. Please try again.';
      }
    } finally {
      if (button) button.disabled = false;
    }
  }

  if (contactForm) {
    wireValidation(contactForm);
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-9999px';
    honeypot.style.width = '1px';
    honeypot.style.height = '1px';
    honeypot.style.opacity = '0';
    honeypot.setAttribute('aria-hidden', 'true');
    contactForm.appendChild(honeypot);

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitForm(contactForm, '/api/contact');
    });
  }

  if (careerForm) {
    wireValidation(careerForm);
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-9999px';
    honeypot.style.width = '1px';
    honeypot.style.height = '1px';
    honeypot.style.opacity = '0';
    honeypot.setAttribute('aria-hidden', 'true');
    careerForm.appendChild(honeypot);

    careerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const resume = careerForm.querySelector("[name='resume']");
      const resumeFile = resume && resume.files && resume.files[0] ? resume.files[0] : null;
      try {
        const resumeBase64 = await fileToBase64(resumeFile);
        submitForm(careerForm, '/api/careers-apply', { resumeBase64 });
      } catch (error) {
        const msgEl = careerForm.querySelector('.form-message');
        if (msgEl) {
          msgEl.className = 'form-message error';
          msgEl.textContent = error.message || 'Unsupported file type.';
        }
      }
    });
  }
})();
