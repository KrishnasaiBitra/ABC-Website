(function () {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dotsContainer = document.querySelector(".slider-dots");
  const prev = document.querySelector("[data-slider-prev]");
  const next = document.querySelector("[data-slider-next]");
  let active = 0;
  let timer;

  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle("active", idx === active));
    document.querySelectorAll(".slider-dots button").forEach((dot, idx) => {
      dot.classList.toggle("active", idx === active);
    });
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(active + 1), 4500);
  }

  if (dotsContainer && slides.length) {
    slides.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show slide ${idx + 1}`);
      dot.addEventListener("click", () => {
        showSlide(idx);
        restart();
      });
      dotsContainer.appendChild(dot);
    });
  }

  if (prev) prev.addEventListener("click", () => { showSlide(active - 1); restart(); });
  if (next) next.addEventListener("click", () => { showSlide(active + 1); restart(); });
  showSlide(0);
  restart();

  window.ABCSolutionsCompanyCounters && window.ABCSolutionsCompanyCounters.observe();
})();
