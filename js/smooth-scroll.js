/* =====================================================================
   QUATRÉA — smooth-scroll.js
   Lenis smooth scrolling, integrated with GSAP ScrollTrigger.
   Exposes window.QUATREA.lenis for other modules.
   Respects prefers-reduced-motion.
   ===================================================================== */

(function () {
  "use strict";

  const QUATREA = (window.QUATREA = window.QUATREA || {});

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // If reduced motion or Lenis missing, just wire up ScrollTrigger.
  if (prefersReducedMotion || typeof window.Lenis === "undefined") {
    QUATREA.lenis = null;
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
    // Mark ready so animations.js can proceed
    document.documentElement.classList.add("lenis-ready");
    return;
  }

  // Register GSAP ScrollTrigger plugin
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1.4,
    wheelMultiplier: 1,
    gestureOrientation: "vertical",
    lerp: 0.09,
  });

  QUATREA.lenis = lenis;

  // Sync Lenis scroll → ScrollTrigger
  lenis.on("scroll", () => {
    if (window.ScrollTrigger) window.ScrollTrigger.update();
  });

  // Drive Lenis from GSAP ticker (so both share the same loop)
  if (window.gsap) {
    window.gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    window.gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Expose helper: programmatic scroll to a selector or pixel value
  QUATREA.scrollTo = function (target, options) {
    if (!lenis) {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (typeof target === "number") {
      lenis.scrollTo(target, Object.assign({ duration: 1.4 }, options || {}));
    } else {
      lenis.scrollTo(target, Object.assign({ offset: -40, duration: 1.4 }, options || {}));
    }
  };

  // Pause / resume during page transitions
  QUATREA.pauseScroll = function () { lenis && lenis.stop(); };
  QUATREA.resumeScroll = function () { lenis && lenis.start(); };

  // Refresh ScrollTrigger after fonts/images settle
  window.addEventListener("load", () => {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  });

  document.documentElement.classList.add("lenis-ready");
})();
