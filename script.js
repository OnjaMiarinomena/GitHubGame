const roleCards = document.querySelectorAll(".role-card");

roleCards.forEach((card) => {
  card.addEventListener("click", () => {
    roleCards.forEach((item) => {
      item.classList.remove("active-role");
    });

    card.classList.add("active-role");
  });
});
