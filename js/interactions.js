/* =====================================================================
   QUATRÉA — interactions.js
   Magnetic buttons, image hover effects, newsletter form,
   season-page specific interactions, keyboard accessibility.
   ===================================================================== */

(function () {
  "use strict";

  const QUATREA = (window.QUATREA = window.QUATREA || {});
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ----------------------------------------------------------------
  // Magnetic buttons
  // ----------------------------------------------------------------
  function initMagnetic() {
    if (prefersReducedMotion || !hasFinePointer || typeof window.gsap === "undefined") return;
    const magnets = document.querySelectorAll(".magnetic");
    magnets.forEach((el) => {
      const strength = parseFloat(el.getAttribute("data-magnet") || "0.35");
      let raf;

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          gsap.to(el, { x: x * strength, y: y * strength, duration: 0.6, ease: "power3.out" });
          const inner = el.querySelector(".magnetic__inner");
          if (inner) gsap.to(inner, { x: x * strength * 0.5, y: y * strength * 0.5, duration: 0.6, ease: "power3.out" });
        });
      });

      el.addEventListener("mouseleave", () => {
        if (raf) cancelAnimationFrame(raf);
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
        const inner = el.querySelector(".magnetic__inner");
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  // ----------------------------------------------------------------
  // Newsletter form — fake submit with elegant success state
  // ----------------------------------------------------------------
  function initNewsletter() {
    const form = document.querySelector(".newsletter__form");
    if (!form) return;
    const success = form.querySelector(".newsletter__success");
    const submit = form.querySelector("[type='submit']");
    const emailInput = form.querySelector("[type='email']");
    const nameInput = form.querySelector("[name='name']");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput && emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderBottomColor = "var(--spring-deep)";
          setTimeout(() => { emailInput.style.borderBottomColor = ""; }, 1800);
        }
        return;
      }
      if (submit) {
        submit.disabled = true;
        submit.style.opacity = "0.5";
        submit.style.pointerEvents = "none";
      }
      // Simulated async submission
      setTimeout(() => {
        if (success) {
          const name = nameInput ? nameInput.value.trim() : "";
          success.textContent = name
            ? `Merci, ${name}. Your invitation is on its way.`
            : "Merci. Your invitation is on its way.";
          success.classList.add("is-visible");
        }
        form.reset();
        if (submit) {
          submit.disabled = false;
          submit.style.opacity = "";
          submit.style.pointerEvents = "";
        }
      }, 900);
    });
  }

  // ----------------------------------------------------------------
  // Contact form (contact page)
  // ----------------------------------------------------------------
  function initContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    const status = form.querySelector(".contact-form__status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const required = form.querySelectorAll("[required]");
      let valid = true;
      required.forEach((field) => {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderBottomColor = "var(--spring-deep)";
          setTimeout(() => { field.style.borderBottomColor = ""; }, 1800);
        }
      });
      if (!valid) return;
      if (status) {
        status.textContent = "Your message has been received. QUATRÉA will respond within 48 hours.";
        status.classList.add("is-visible");
      }
      form.reset();
    });
  }

  // ----------------------------------------------------------------
  // Collection / season hover — image zoom handled by CSS, this
  // adds a directional cursor label.
  // ----------------------------------------------------------------
  function initHoverLabels() {
    if (!hasFinePointer) return;
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      // already handled by main.js cursor module; no-op placeholder
    });
  }

  // ----------------------------------------------------------------
  // Scroll-to links (anchors on a page)
  // ----------------------------------------------------------------
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (QUATREA.scrollTo) QUATREA.scrollTo(target, { offset: -20 });
        else target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  // ----------------------------------------------------------------
  // Season page note tabs (top/heart/base)
  // ----------------------------------------------------------------
  function initNoteTabs() {
    const tabs = document.querySelectorAll("[data-note-tab]");
    if (!tabs.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.getAttribute("data-note-tab");
        const target = document.querySelector(`[data-note-panel="${id}"]`);
        if (!target) return;
        const parent = tab.closest(".note-tabs");
        if (parent) parent.querySelectorAll("[data-note-tab]").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        document.querySelectorAll("[data-note-panel]").forEach((p) => p.classList.remove("is-active"));
        target.classList.add("is-active");
      });
    });
  }

  // ----------------------------------------------------------------
  // Footer year
  // ----------------------------------------------------------------
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  // ----------------------------------------------------------------
  // Boot
  // ----------------------------------------------------------------
  function boot() {
    initMagnetic();
    initNewsletter();
    initContactForm();
    initHoverLabels();
    initAnchorLinks();
    initNoteTabs();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
