(function () {
  document.querySelectorAll(".solution-card").forEach((card) => {
    const button = card.querySelector("button");
    if (!button) return;

    button.addEventListener("click", () => {
      const open = card.classList.contains("open");
      document.querySelectorAll(".solution-card.open").forEach((item) => item.classList.remove("open"));
      if (!open) card.classList.add("open");
      button.textContent = open ? "Explore more" : "Show less";
    });
  });
})();
