# QUATRÉA — Luxury Perfume Brand Website

A premium, multipage luxury perfume website for the fictional fragrance maison **QUATRÉA**, representing the four seasons through four exclusive fragrances.

## The Four Fragrances

| № | Season | Name | Notes |
|---|--------|------|-------|
| 01 | Spring | **Fleur de Vie** | Pear Blossom · White Peony · Musk |
| 02 | Summer | **Soleil d'Or** | Fig Leaf · Neroli · Cedar |
| 03 | Autumn | **Bois Mystique** | Cedar · Vetiver · Tobacco |
| 04 | Winter | **Nuit Éternelle** | Black Amber · Iris · Oud |

## Tech Stack

- **HTML5** — semantic, accessible structure
- **CSS3** — custom design system, no frameworks
- **Vanilla JavaScript** — no React/Vue/Angular
- **GSAP 3.12.5** + **ScrollTrigger** — animations
- **Lenis 1.1.14** — smooth scrolling
- **Google Fonts** — Cormorant Garamond, Marcellus, Jost

## Project Structure

```
quatrea/
├── index.html              # Homepage
├── spring.html             # Fleur de Vie
├── summer.html             # Soleil d'Or
├── autumn.html             # Bois Mystique
├── winter.html             # Nuit Éternelle
├── collection.html         # The Collection
├── our-story.html         # Maison & atelier
├── contact.html            # Contact & atelier visits
├── css/
│   ├── style.css           # Design system, components (~47 KB)
│   ├── animations.css      # Keyframes, GSAP states (~6 KB)
│   └── responsive.css      # Tablet & mobile breakpoints (~7 KB)
├── js/
│   ├── smooth-scroll.js    # Lenis ↔ GSAP ScrollTrigger bridge
│   ├── main.js             # Preloader, cursor, nav, menu, page transitions
│   ├── animations.js       # Hero entrance, reveals, parallax, horizontal scroll
│   └── interactions.js     # Magnetic buttons, forms, hover labels
└── assets/
    └── img/
        ├── hero-bottle.png         # Custom AI-generated hero bottle
        ├── bottle-spring.png       # Fleur de Vie
        ├── bottle-summer.png       # Soleil d'Or
        ├── bottle-autumn.png       # Bois Mystique
        └── bottle-winter.png       # Nuit Éternelle
```

## Local Execution

The site is fully static. Any HTTP server will work.

### Option 1 — Python (simplest, no install)

```bash
cd quatrea
python3 -m http.server 8000
```

Then visit http://localhost:8000/

### Option 2 — Node.js

```bash
cd quatrea
npx serve -p 8000
# or
npx http-server -p 8000
```

### Option 3 — VS Code Live Server

Right-click `index.html` → "Open with Live Server".

### Option 4 — Direct file access

You can also open `index.html` directly in a browser. However, some features (like the page transitions and external image loading) work best via an HTTP server.

## Deployment

The site is 100% static — deploy the entire `quatrea/` folder to any static host:

### Netlify
```bash
cd quatrea
npx netlify deploy --dir=. --prod
```
Or drag-and-drop the `quatrea/` folder onto https://app.netlify.com/drop

### Vercel
```bash
cd quatrea
npx vercel --prod
```

### GitHub Pages
1. Push the `quatrea/` folder contents to a GitHub repository
2. Settings → Pages → Source: main branch → / (root)
3. Site will be live at `https://<username>.github.io/<repo>/`

### Cloudflare Pages / AWS S3 / Any static host
Upload all files preserving the folder structure.

## Features

### Animations (GSAP + ScrollTrigger)
- Cinematic preloader with counter and character reveal
- Hero entrance: scale, parallax, staggered text
- Scroll-triggered reveals (`[data-reveal]`)
- Split-line text reveals
- Horizontal scrolling seasons section (pinned)
- Parallax photography
- Image mask sweep reveals
- Staggered bottle and collection card reveals
- Subtle continuous parallax on hero/page-header images
- Custom page transition overlay (slide-up + word change)

### Interactions
- Custom cursor with magnetic follower (desktop only)
- Magnetic buttons (`[data-magnet]`)
- Hover-revealed image masks (`.img-mask`)
- Animated underlined links
- Mobile fullscreen menu overlay (with season index)
- Newsletter & contact forms with elegant validation + success states

### Accessibility & Performance
- Respects `prefers-reduced-motion` (animations disabled, content visible)
- Hides custom cursor on touch devices
- Skip-link for keyboard navigation
- Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`)
- All images use `loading="lazy"` (except hero, which is `eager`)
- All images have descriptive `alt` text
- Preconnect to Google Fonts and Unsplash for faster loading
- No build step required

### Responsive Breakpoints
- Desktop: > 1366px
- Laptop: 1024 – 1366px
- Tablet: 768 – 1024px (horizontal seasons become vertical stack)
- Mobile: < 768px (single-column, simplified nav, fullscreen menu)
- Small mobile: < 540px

## Browser Support

Tested on:
- Chrome 120+
- Firefox 120+
- Safari 16+
- Edge 120+

Requires JavaScript enabled. The site degrades gracefully with `prefers-reduced-motion: reduce` — all content remains visible, animations are disabled.

## Credits

- **Brand concept & design**: QUATRÉA (fictional maison)
- **Perfume bottle photography**: Custom-generated for QUATRÉA
- **Editorial & landscape photography**: [Unsplash](https://unsplash.com)
- **Typography**: Cormorant Garamond, Marcellus, Jost (Google Fonts)
- **Animation**: GSAP, ScrollTrigger, Lenis

---

© MMXXIV Maison QUATRÉA. All rights reserved.
