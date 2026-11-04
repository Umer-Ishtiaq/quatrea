/* =====================================================================
   QUATRÉA — animations.js
   GSAP + ScrollTrigger animations: hero entrance, reveals, parallax,
   horizontal scroll, bottle reveals, marquee. Respect reduced-motion.
   ===================================================================== */

(function () {
  "use strict";

  const QUATREA = (window.QUATREA = window.QUATREA || {});
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function init() {
    if (typeof window.gsap === "undefined") {
      document.documentElement.classList.add("is-loaded");
      return;
    }
    const gsap = window.gsap;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
    const ST = window.ScrollTrigger;

    // Reduced motion: just clear all reveal states, refresh ScrollTrigger.
    if (prefersReducedMotion) {
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
        el.style.clipPath = "none";
      });
      document.querySelectorAll(".img-mask").forEach((el) => el.classList.add("is-revealed"));
      document.querySelectorAll(".clip-reveal").forEach((el) => el.classList.add("is-revealed"));
      document.documentElement.classList.add("is-loaded");
      if (ST) ST.refresh();
      return;
    }

    // Wait for preloader + fonts to settle before measuring
    const startWhen = () => {
      return new Promise((resolve) => {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => resolve());
        } else {
          resolve();
        }
      });
    };

    function runAll() {
      initHeroEntrance();
      initRevealUp();
      initSplitLines();
      initParallax();
      initImageMasks();
      initHorizontalSeasons();
      initBottleReveal();
      initNotesReveal();
      initCollectionReveal();
      initCounterStats();
      initPageHeaderEntrance();
      initSectionColorShift();

      // After all scrolltriggers are created, refresh
      if (ST) {
        // Wait one frame so layout settles
        requestAnimationFrame(() => ST.refresh());
      }
    }

    // Start once preloader fires the "loaded" event OR immediately if already loaded
    if (document.documentElement.classList.contains("is-loaded")) {
      startWhen().then(runAll);
    } else {
      window.addEventListener("quatrea:loaded", () => startWhen().then(runAll), { once: true });
      // Safety timeout in case preloader doesn't fire
      setTimeout(() => {
        if (!document.documentElement.classList.contains("is-loaded")) {
          document.documentElement.classList.add("is-loaded");
          startWhen().then(runAll);
        }
      }, 4000);
    }

    // ----------------------------------------------------------------
    // Hero entrance
    // ----------------------------------------------------------------
    function initHeroEntrance() {
      const hero = document.querySelector(".hero");
      if (!hero) return;

      const mediaImg = hero.querySelector(".hero__media img");
      const eyebrow = hero.querySelector(".hero__eyebrow");
      const titleLines = hero.querySelectorAll(".hero__title .word");
      const sub = hero.querySelector(".hero__sub");
      const cta = hero.querySelectorAll(".hero__cta > *");
      const scrollCue = hero.querySelector(".hero__scroll-cue");
      const corner = hero.querySelector(".hero__corner");

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      if (mediaImg) {
        tl.fromTo(mediaImg, { scale: 1.25 }, { scale: 1.05, duration: 2.4, ease: "power3.out" }, 0);
      }
      if (eyebrow) {
        tl.fromTo(eyebrow, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, 0.5);
      }
      if (titleLines.length) {
        tl.fromTo(titleLines, { yPercent: 110, opacity: 0 }, {
          yPercent: 0, opacity: 1, duration: 1.6, stagger: 0.12,
        }, 0.65);
      }
      if (sub) {
        tl.fromTo(sub, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, 1.1);
      }
      if (cta.length) {
        tl.fromTo(cta, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.12 }, 1.3);
      }
      if (scrollCue) {
        tl.fromTo(scrollCue, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1 }, 1.6);
      }
      if (corner) {
        tl.fromTo(corner, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 1.7);
      }

      // Subtle continuous parallax on hero image
      if (mediaImg && ST) {
        gsap.to(mediaImg, {
          yPercent: 14,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }
    }

    // ----------------------------------------------------------------
    // Reveal up — generic [data-reveal]
    // ----------------------------------------------------------------
    function initRevealUp() {
      if (!ST) return;
      const els = gsap.utils.toArray("[data-reveal]");
      els.forEach((el) => {
        const dir = el.getAttribute("data-reveal") || "up";
        const fromVars = { opacity: 0 };
        const toVars = { opacity: 1, duration: 1.1, ease: "expo.out" };

        switch (dir) {
          case "up": fromVars.y = 40; toVars.y = 0; break;
          case "down": fromVars.y = -40; toVars.y = 0; break;
          case "left": fromVars.x = 40; toVars.x = 0; break;
          case "right": fromVars.x = -40; toVars.x = 0; break;
          case "scale": fromVars.scale = 1.08; toVars.scale = 1; break;
          case "fade": break;
          case "clip":
            fromVars.clipPath = "inset(0 0 100% 0)";
            toVars.clipPath = "inset(0 0 0% 0)";
            break;
        }

        const delay = parseFloat(el.getAttribute("data-reveal-delay") || "0");
        toVars.delay = delay;

        gsap.fromTo(el, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
            once: false,
          },
        });
      });
    }

    // ----------------------------------------------------------------
    // Split-line reveals — wrap text in .split-line__inner, slide up
    // ----------------------------------------------------------------
    function initSplitLines() {
      if (!ST) return;
      const lines = gsap.utils.toArray(".split-line__inner");
      lines.forEach((line) => {
        gsap.fromTo(line, {
          yPercent: 110,
        }, {
          yPercent: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: line,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }

    // ----------------------------------------------------------------
    // Parallax — elements with [data-parallax]
    // ----------------------------------------------------------------
    function initParallax() {
      if (!ST) return;
      const els = gsap.utils.toArray("[data-parallax]");
      els.forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
        gsap.fromTo(el, { yPercent: -speed * 100 }, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") || el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // Generic image parallax inside sections
      const parallaxImgs = gsap.utils.toArray("[data-parallax-img]");
      parallaxImgs.forEach((img) => {
        const amount = parseFloat(img.getAttribute("data-parallax-img")) || 15;
        gsap.fromTo(img, { yPercent: -amount * 0.4 }, {
          yPercent: amount * 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    }

    // ----------------------------------------------------------------
    // Image masks — sweep reveal
    // ----------------------------------------------------------------
    function initImageMasks() {
      if (!ST) return;
      const masks = gsap.utils.toArray(".img-mask");
      masks.forEach((mask) => {
        ST.create({
          trigger: mask,
          start: "top 95%",
          onEnter: () => mask.classList.add("is-revealed"),
          onLeaveBack: () => mask.classList.remove("is-revealed"),
        });
      });
      const clips = gsap.utils.toArray(".clip-reveal");
      clips.forEach((c) => {
        ST.create({
          trigger: c,
          start: "top 95%",
          onEnter: () => c.classList.add("is-revealed"),
          onLeaveBack: () => c.classList.remove("is-revealed"),
        });
      });
    }

    // ----------------------------------------------------------------
    // Horizontal scrolling seasons section (desktop only)
    // ----------------------------------------------------------------
    function initHorizontalSeasons() {
      if (!ST) return;
      const section = document.querySelector(".seasons");
      const track = document.querySelector(".seasons__track");
      const pin = document.querySelector(".seasons__pin");
      if (!section || !track || !pin) return;

      // Disable horizontal on tablet/mobile
      if (window.matchMedia("(max-width: 1024px)").matches) return;

      const panels = track.querySelectorAll(".season-panel");
      const fill = document.querySelector(".seasons__progress-fill");
      const label = document.querySelector(".seasons__progress-label");

      const totalScroll = () => track.scrollWidth - window.innerWidth + 100;

      const tween = gsap.to(track, {
        x: () => -totalScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () => "+=" + totalScroll(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (fill) gsap.set(fill, { scaleX: self.progress });
            if (label && panels.length) {
              const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
              const names = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];
              label.textContent = `${String(idx + 1).padStart(2, "0")} — ${names[idx] || ""}`;
            }
          },
        },
      });

      // Parallax inside each panel media
      panels.forEach((panel) => {
        const img = panel.querySelector(".season-panel__media img");
        const content = panel.querySelector(".season-panel__content");
        if (img) {
          gsap.fromTo(img, { xPercent: -8 }, {
            xPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          });
        }
      });
    }

    // ----------------------------------------------------------------
    // Bottle reveal — staggered cards
    // ----------------------------------------------------------------
    function initBottleReveal() {
      if (!ST) return;
      const bottles = gsap.utils.toArray(".bottle");
      bottles.forEach((bottle, i) => {
        const img = bottle.querySelector(".bottle__media img");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: bottle,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
        tl.fromTo(bottle.querySelector(".bottle__media"), { y: 60, opacity: 0 }, {
          y: 0, opacity: 1, duration: 1.1, ease: "expo.out",
        });
        if (img) {
          tl.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 1.4, ease: "expo.out" }, "<");
        }
        tl.fromTo([
          bottle.querySelector(".bottle__season"),
          bottle.querySelector(".bottle__name"),
          bottle.querySelector(".bottle__notes"),
          bottle.querySelector(".bottle__meta"),
        ].filter(Boolean), { y: 20, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "expo.out",
        }, "-=0.4");
      });
    }

    // ----------------------------------------------------------------
    // Notes pyramid — staggered card reveal
    // ----------------------------------------------------------------
    function initNotesReveal() {
      if (!ST) return;
      const cards = gsap.utils.toArray(".note-card");
      if (!cards.length) return;
      gsap.fromTo(cards, { y: 50, opacity: 0 }, {
        y: 0, opacity: 1,
        duration: 1, ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: ".notes__grid",
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }

    // ----------------------------------------------------------------
    // Collection cells — staggered reveal
    // ----------------------------------------------------------------
    function initCollectionReveal() {
      if (!ST) return;
      const cells = gsap.utils.toArray(".collection__cell");
      cells.forEach((cell) => {
        const img = cell.querySelector("img");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cell,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        tl.fromTo(cell, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out" });
        if (img) tl.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.3, ease: "expo.out" }, "<");
      });
    }

    // ----------------------------------------------------------------
    // Counters — increment from 0
    // ----------------------------------------------------------------
    function initCounterStats() {
      if (!ST) return;
      const counters = gsap.utils.toArray("[data-counter]");
      counters.forEach((el) => {
        const target = parseFloat(el.getAttribute("data-counter")) || 0;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = target % 1 === 0 ? Math.round(obj.v) : obj.v.toFixed(1);
          },
        });
      });
    }

    // ----------------------------------------------------------------
    // Page header entrance (sub pages)
    // ----------------------------------------------------------------
    function initPageHeaderEntrance() {
      const ph = document.querySelector(".page-header");
      if (!ph) return;
      const mediaImg = ph.querySelector(".page-header__media img");
      const eyebrow = ph.querySelector(".page-header__eyebrow");
      const title = ph.querySelector(".page-header__title");
      const sub = ph.querySelector(".page-header__sub");
      const meta = ph.querySelector(".page-header__meta");

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      if (mediaImg) tl.fromTo(mediaImg, { scale: 1.25 }, { scale: 1.05, duration: 2.2 }, 0);
      if (eyebrow) tl.fromTo(eyebrow, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.5);
      if (title) tl.fromTo(title, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, 0.7);
      if (sub) tl.fromTo(sub, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1.0);
      if (meta) tl.fromTo(meta, { opacity: 0 }, { opacity: 1, duration: 1 }, 1.2);

      if (mediaImg && ST) {
        gsap.to(mediaImg, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: ph,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      }
    }

    // ----------------------------------------------------------------
    // Subtle bg color shift as user scrolls past dark sections
    // ----------------------------------------------------------------
    function initSectionColorShift() {
      // Already handled by section backgrounds; placeholder for future theming hooks.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
