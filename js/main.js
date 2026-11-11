const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const navigationLinks = document.querySelectorAll(".nav-link");
const yearElement = document.querySelector("#current-year");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function closeMenu() {
  if (!menuToggle || !navigation) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute(
    "aria-label",
    isExpanded ? "Open menu" : "Close menu",
  );
  navigation?.classList.toggle("is-open", !isExpanded);
  document.body.classList.toggle("menu-open", !isExpanded);
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const sections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navigationLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${entry.target.id}`,
          );
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity() || !formStatus) return;

  const submitButton = contactForm.querySelector('button[type="submit"]');
  if (!(submitButton instanceof HTMLButtonElement)) return;

  const originalButtonText = submitButton.innerHTML;
  const formData = new FormData(contactForm);
  const payload = {
    name: formData.get("name"),
    surname: formData.get("surname"),
    message: formData.get("message"),
  };

  submitButton.disabled = true;
  formStatus.textContent = "Sending your message...";

  fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message.");
      }

      formStatus.textContent = "Thanks! Your message has been sent.";
      contactForm.reset();
    })
    .catch((error) => {
      formStatus.textContent =
        error instanceof Error
          ? error.message
          : "Unable to send your message. Please try again.";
    })
    .finally(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    });
});