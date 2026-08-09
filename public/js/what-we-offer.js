(function () {
  window.ABCSolutionsCompanyCounters && window.ABCSolutionsCompanyCounters.observe();

  document.querySelectorAll(".tool-pill").forEach((tool) => {
    tool.addEventListener("click", () => {
      tool.classList.remove("tool-pulse");
      window.requestAnimationFrame(() => tool.classList.add("tool-pulse"));
    });
  });

  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
})();
