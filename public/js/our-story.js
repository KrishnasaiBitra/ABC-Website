(function () {
  window.ABCSolutionsCompanyCounters && window.ABCSolutionsCompanyCounters.observe();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".milestone").forEach((item, index) => {
    item.classList.add(index % 2 === 0 ? "slide-left" : "slide-right");
    observer.observe(item);
  });
})();
