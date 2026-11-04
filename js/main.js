/* =====================================================================
   QUATRÉA — main.js
   Foundation: preloader, custom cursor, navigation, menu overlay,
   page transitions, image lazy-loading. Runs before animations.js.
   ===================================================================== */

(function () {
  "use strict";

  const QUATREA = (window.QUATREA = window.QUATREA || {});
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ----------------------------------------------------------------
  // Preloader
  // ----------------------------------------------------------------
  function completePreloader(preloader) {
    if (!preloader || preloader.dataset.done === "1") return;
    preloader.dataset.done = "1";
    document.body.classList.remove("no-scroll");
    document.documentElement.classList.add("is-loaded");
    window.dispatchEvent(new CustomEvent("quatrea:loaded"));
    // Force-hide after a brief delay (in case the slide-up animation didn't run)
    setTimeout(() => { preloader.style.display = "none"; }, 1200);
  }

  function initPreloader() {
    const preloader = document.querySelector(".preloader");
    if (!preloader) return;

    // If user prefers reduced motion or GSAP missing, hide immediately
    if (prefersReducedMotion || typeof window.gsap === "undefined") {
      completePreloader(preloader);
      preloader.style.display = "none";
      return;
    }

    document.body.classList.add("no-scroll");

    const chars = preloader.querySelectorAll(".preloader__char");
    const lineFill = preloader.querySelector(".preloader__line-fill");
    const counter = preloader.querySelector(".preloader__counter");
    const word = preloader.querySelector(".preloader__word");

    // Safety net: never trap the user
    const safety = setTimeout(() => completePreloader(preloader), 5000);

    try {
      const gs = window.gsap;

      // Explicit initial states
      gs.set(chars, { yPercent: 110 });
      if (lineFill) gs.set(lineFill, { width: "0%" });
      if (word) gs.set(word, { opacity: 1 });

      // Reveal characters
      gs.to(chars, {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.06,
        delay: 0.1,
      });

      // Counter 0 → 100
      if (counter) {
        const obj = { v: 0 };
        gs.to(obj, {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            counter.textContent = String(Math.round(obj.v)).padStart(3, "0");
          },
        });
      }

      // Line fill 0 → 100%
      if (lineFill) {
        gs.to(lineFill, {
          width: "100%",
          duration: 1.6,
          ease: "power2.inOut",
        });
      }

      // Slide preloader up after content reveal completes
      gs.to(preloader, {
        yPercent: -100,
        duration: 1,
        ease: "expo.inOut",
        delay: 2.0,
        onComplete: () => {
          clearTimeout(safety);
          completePreloader(preloader);
        },
      });
      // Fade the word out as the panel slides up
      if (word) {
        gs.to(word, {
          opacity: 0,
          duration: 0.4,
          delay: 2.0,
        });
      }
    } catch (err) {
      console.warn("QUATRÉA preloader error:", err);
      clearTimeout(safety);
      completePreloader(preloader);
      preloader.style.display = "none";
    }
  }

  // ----------------------------------------------------------------
  // Custom cursor (desktop only)
  // ----------------------------------------------------------------
  function initCursor() {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    if (!cursor || !follower || !hasFinePointer || prefersReducedMotion) {
      if (cursor) cursor.style.display = "none";
      if (follower) follower.style.display = "none";
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX, followerY = mouseY;
    let raf;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function loop() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    }
    loop();

    // Interactive hover targets
    const interactiveSelector = "a, button, .magnetic, .bottle, .collection__cell, [data-cursor]";
    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        follower.classList.add("is-active");
        const label = target.getAttribute("data-cursor");
        const labelEl = follower.querySelector(".cursor-follower__label");
        if (labelEl) labelEl.textContent = label || "";
      }
    });
    document.addEventListener("mouseout", (e) => {
      const target = e.target.closest(interactiveSelector);
      if (target) follower.classList.remove("is-active");
    });

    // Hide on iframe / window blur
    window.addEventListener("blur", () => {
      cursor.style.opacity = "0";
      follower.style.opacity = "0";
    });
    window.addEventListener("focus", () => {
      cursor.style.opacity = "1";
      follower.style.opacity = "1";
    });
  }

  // ----------------------------------------------------------------
  // Navigation (scroll state + active link)
  // ----------------------------------------------------------------
  function initNav() {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Mark active link based on current path
    const path = window.location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll(".nav__link").forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;
      const target = href.split("/").pop();
      if (target === path) link.classList.add("is-active");
    });
  }

  // ----------------------------------------------------------------
  // Fullscreen menu overlay
  // ----------------------------------------------------------------
  function initMenuOverlay() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav__toggle");
    const overlay = document.querySelector(".menu-overlay");
    if (!toggle || !overlay || !nav) return;

    const open = () => {
      nav.classList.add("is-menu-open");
      overlay.classList.add("is-open");
      document.body.classList.add("no-scroll");
      if (QUATREA.pauseScroll) QUATREA.pauseScroll();
    };
    const close = () => {
      nav.classList.remove("is-menu-open");
      overlay.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      if (QUATREA.resumeScroll) QUATREA.resumeScroll();
    };

    toggle.addEventListener("click", () => {
      if (overlay.classList.contains("is-open")) close();
      else open();
    });

    overlay.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", close);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
    });
  }

  // ----------------------------------------------------------------
  // Page transitions (intercept internal link clicks)
  // ----------------------------------------------------------------
  function initPageTransitions() {
    if (prefersReducedMotion || typeof window.gsap === "undefined") return;
    const overlay = document.querySelector(".page-transition");
    if (!overlay) return;

    const word = overlay.querySelector(".page-transition__word");
    let isTransitioning = false;

    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (href.startsWith("#")) return;
      try {
        const url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (a.target === "_blank") return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      } catch (_) { return; }

      e.preventDefault();
      if (isTransitioning) return;
      isTransitioning = true;
      if (QUATREA.pauseScroll) QUATREA.pauseScroll();

      // Word based on destination slug
      if (word) {
        const slug = href.split("/").pop().replace(".html", "");
        const labels = {
          "index": "QUATRÉA",
          "spring": "Fleur de Vie",
          "summer": "Soleil d'Or",
          "autumn": "Bois Mystique",
          "winter": "Nuit Éternelle",
          "collection": "Collection",
          "our-story": "Our Story",
          "contact": "Contact",
        };
        const label = labels[slug] || "QUATRÉA";
        word.innerHTML = label.replace(/(É|Or|Mystique|Éternelle|Story)/g, '<span class="accent">$1</span>');
      }

      // Use individual gsap.to calls (more reliable than timeline)
      const gs = window.gsap;
      gs.set(overlay, { yPercent: 100, opacity: 1 });
      if (word) gs.set(word, { opacity: 0, y: 20 });
      gs.to(overlay, { yPercent: 0, duration: 0.6, ease: "expo.inOut" });
      if (word) gs.to(word, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.3 });

      // Safety: navigate even if animation fails
      setTimeout(() => { window.location.href = a.href; }, 1100);
    });

    // On back/forward, ensure overlay is hidden
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) {
        gsap.set(overlay, { yPercent: 100 });
        if (word) gsap.set(word, { opacity: 0 });
        if (QUATREA.resumeScroll) QUATREA.resumeScroll();
      }
    });
  }

  // ----------------------------------------------------------------
  // Active nav indicator for season pages
  // ----------------------------------------------------------------
  function initSeasonNav() {
    // Active link highlighting is handled by initNav.
    // Season pages additionally mark the "Collection" link as active
    // since the four fragrances live within the collection.
    const path = window.location.pathname.split("/").pop();
    const seasonPages = ["spring.html", "summer.html", "autumn.html", "winter.html"];
    if (seasonPages.indexOf(path) !== -1) {
      const collectionLink = document.querySelector('a.nav__link[href="collection.html"]');
      if (collectionLink) collectionLink.classList.add("is-active");
    }
  }

  // ----------------------------------------------------------------
  // Boot
  // ----------------------------------------------------------------
  function boot() {
    initPreloader();
    initCursor();
    initNav();
    initMenuOverlay();
    initPageTransitions();
    initSeasonNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
