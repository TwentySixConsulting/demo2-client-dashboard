/* The caption, cursor and wipe layer, injected before any page script runs.
 *
 * WHY AN INIT SCRIPT RATHER THAN PLAYWRIGHT'S OVERLAY API. This runs on EVERY
 * document in the context, so it survives the full page loads between the React
 * app, /pay/ and /benefits/ by construction rather than by relying on Playwright
 * internals re-adding it.
 *
 * WHY A SHADOW ROOT. The app's stylesheets (including its @media print block)
 * cannot reach inside one, so nothing the dashboard does can restyle or hide the
 * caption.
 *
 * WHY THE @font-face GOES ON THE OUTER DOCUMENT. Font loading in Chrome is
 * document-scoped: an @font-face declared inside a shadow root does nothing. So
 * the rules are appended to document.head while the usage stays in the shadow
 * root. The payload is the same woff2 the PDFs embed, served from disk by a
 * Playwright route, so a caption can never be caught mid-FOUT.
 *
 * Everything here is driven from Python via window.__cap / __cur / __wipe.
 */
(() => {
  if (window.__zbOverlay) return;
  window.__zbOverlay = true;

  const CREAM = "#FBFBF8";
  const INK = "#121C2B";
  const CLAY = "#C9785A";

  function boot() {
    // Defeat any CSS scroll-behavior:smooth. The recorder drives scroll frame
    // by frame; a browser-timed smooth scroll would make position per frame
    // non-deterministic, which is the one property this pipeline exists for.
    document.documentElement.style.scrollBehavior = "auto";

    // Fonts, on the outer document.
    const f = document.createElement("link");
    f.rel = "stylesheet";
    f.href = "/__overlay-fonts.css";
    document.head.appendChild(f);

    // Kill scrollbars belt-and-braces (the launch flag handles most cases).
    const s = document.createElement("style");
    s.textContent = "::-webkit-scrollbar{display:none!important}" +
      "html{scrollbar-width:none!important}";
    document.head.appendChild(s);

    const host = document.createElement("div");
    host.id = "__zb_overlay";
    host.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        .wipe {
          position: fixed; inset: 0; background: ${CREAM};
          opacity: 0; transition: none;
        }
        .cap {
          position: fixed; left: 50%; bottom: 44px;
          /* .cap.top moves it clear of anything the app draws bottom-right,
             such as the tour's own nudge card. */
          transform: translateX(-50%);
          max-width: 1060px; box-sizing: border-box;
          padding: 18px 30px;
          background: ${INK}f0;
          border-radius: 14px;
          border-top: 1px solid ${CLAY};
          box-shadow: 0 18px 48px rgba(18,28,43,.28);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 21px; font-weight: 500; line-height: 1.45;
          letter-spacing: .002em;
          color: ${CREAM};
          text-align: center;
          opacity: 0;
        }
        .cap.top { bottom: auto; top: 96px; }
        .chapter {
          position: fixed; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 14px;
          background: ${CREAM}; opacity: 0;
          font-family: 'Poppins', system-ui, sans-serif; color: ${INK};
        }
        .chapter b {
          font-size: 54px; font-weight: 700; letter-spacing: -.02em;
        }
        .chapter i {
          font-style: normal; font-size: 20px; font-weight: 500;
          color: #4B5563; font-family: 'Inter', system-ui, sans-serif;
        }
        .chapter u {
          text-decoration: none; font-family: 'Poppins', system-ui, sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: .2em;
          text-transform: uppercase; color: ${CLAY};
        }
        /* Headless Chrome renders no OS cursor, so it is drawn. An arrow reads as
           somebody using software; the ring it replaces read as a laser pointer.
           The hotspot is the SVG's top-left tip, so the pointer indicates the
           target rather than covering it: hence no centring translate. */
        .cur {
          position: fixed; left: 0; top: 0;
          width: 22px; height: 30px;
          opacity: 0;
          transition: none;
          will-change: transform;
        }
        .cur svg { display: block; overflow: visible; }
        .cur .arrow, .cur .hand, .cur .beam { display: none; }
        .cur[data-kind="default"] .arrow,
        .cur[data-kind="pointer"] .hand,
        .cur[data-kind="text"] .beam { display: block; }
        /* A press dips the pointer very slightly. The old version scaled the
           whole ring, which looked like the cursor was being squeezed. */
        .cur.press { transform: translate(1px, 1px); }

        /* Click feedback at the point of CONTACT, not on the pointer. Driven
           frame by frame from Python so it cannot drift out of sync. */
        .ripple {
          position: fixed; left: 0; top: 0;
          width: 28px; height: 28px;
          margin: -14px 0 0 -14px;
          border-radius: 50%;
          border: 2px solid ${CLAY};
          opacity: 0;
          pointer-events: none;
        }
      </style>
      <div class="cap"></div>
      <div class="ripple"></div>
      <div class="cur" data-kind="default">
        <svg width="22" height="30" viewBox="0 0 22 30" fill="none">
          <!-- macOS-shaped arrow. White outline first so it reads on both the
               white canvas and the dark caption bar; ink fill over it. -->
          <g class="arrow">
            <path d="M1.2 1.1 L1.2 22.6 L6.9 17.2 L10.4 25.7 L14.1 24.1 L10.6 15.8 L18.3 15.4 Z"
                  fill="#fff" stroke="#fff" stroke-width="3.2"
                  stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M1.2 1.1 L1.2 22.6 L6.9 17.2 L10.4 25.7 L14.1 24.1 L10.6 15.8 L18.3 15.4 Z"
                  fill="#121C2B"/>
          </g>
          <g class="hand" transform="translate(-4 -1)">
            <path d="M9.5 13.2 V5.6 a1.85 1.85 0 0 1 3.7 0 v7.2
                     m0-1.2 a1.7 1.7 0 0 1 3.4 0 v1.6
                     m0-1.1 a1.7 1.7 0 0 1 3.4 0 v2.1
                     m0-1.4 a1.6 1.6 0 0 1 3.2 0 v5.6
                     c0 4.3-2.6 6.9-6.9 6.9 h-2.2
                     c-3.6 0-4.9-1.6-6.6-4.4 l-2.6-4.4
                     a1.85 1.85 0 0 1 3.1-2 l1.5 2.1 Z"
                  fill="#fff" stroke="#fff" stroke-width="3.2"
                  stroke-linejoin="round" stroke-linecap="round"/>
            <path d="M9.5 13.2 V5.6 a1.85 1.85 0 0 1 3.7 0 v7.2
                     m0-1.2 a1.7 1.7 0 0 1 3.4 0 v1.6
                     m0-1.1 a1.7 1.7 0 0 1 3.4 0 v2.1
                     m0-1.4 a1.6 1.6 0 0 1 3.2 0 v5.6
                     c0 4.3-2.6 6.9-6.9 6.9 h-2.2
                     c-3.6 0-4.9-1.6-6.6-4.4 l-2.6-4.4
                     a1.85 1.85 0 0 1 3.1-2 l1.5 2.1 Z"
                  fill="#121C2B"/>
          </g>
          <g class="beam" transform="translate(-3 -13)">
            <path d="M5 2 h6 M8 2 v24 M5 26 h6"
                  stroke="#fff" stroke-width="4.4" stroke-linecap="round"/>
            <path d="M5 2 h6 M8 2 v24 M5 26 h6"
                  stroke="#121C2B" stroke-width="1.8" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
      <div class="chapter"><u></u><b></b><i></i></div>
      <div class="wipe"></div>`;

    const attach = () => {
      if (document.body && !document.body.contains(host)) {
        document.body.appendChild(host);
      }
    };
    attach();
    new MutationObserver(attach).observe(document.documentElement, {
      childList: true,
    });

    const cap = root.querySelector(".cap");
    const cur = root.querySelector(".cur");
    const ripple = root.querySelector(".ripple");
    cur.style.filter = "drop-shadow(0 2px 6px rgba(18,28,43,.35))";
    const wipe = root.querySelector(".wipe");
    const chap = root.querySelector(".chapter");

    // Start wiped in, so a fresh document never flashes its own paint before
    // the recorder fades out. The recorder always fades out explicitly.
    wipe.style.opacity = "1";

    window.__cap = (text, opacity, pos) => {
      if (text !== null && text !== undefined) cap.textContent = text;
      if (pos !== undefined && pos !== null) cap.classList.toggle("top", pos === "top");
      if (opacity !== undefined) cap.style.opacity = String(opacity);
    };
    window.__cur = (x, y, opacity, pressing, kind) => {
      if (x !== undefined && x !== null) {
        cur.style.left = x + "px";
        cur.style.top = y + "px";
      }
      if (opacity !== undefined) cur.style.opacity = String(opacity);
      if (pressing !== undefined) cur.classList.toggle("press", !!pressing);
      if (kind) cur.setAttribute("data-kind", kind);
    };

    /* What the app itself would show at this point, so the drawn pointer cannot
       disagree with the real one. Falls back to the arrow. */
    window.__curKindAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return "default";
      const c = getComputedStyle(el).cursor;
      if (c === "pointer") return "pointer";
      if (c === "text" || c === "vertical-text") return "text";
      return "default";
    };

    /* t goes 0 -> 1 across the ripple. Scale and fade are computed here rather
       than in a CSS transition so every frame is exact. */
    window.__ripple = (x, y, t) => {
      if (t === null || t === undefined) { ripple.style.opacity = "0"; return; }
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.style.transform = "scale(" + (0.4 + t * 1.5) + ")";
      ripple.style.opacity = String(Math.max(0, 1 - t) * 0.9);
    };
    window.__wipe = (opacity) => {
      wipe.style.opacity = String(opacity);
    };
    window.__chapter = (eyebrow, title, sub, opacity) => {
      if (title !== undefined && title !== null) {
        chap.querySelector("u").textContent = eyebrow || "";
        chap.querySelector("b").textContent = title;
        chap.querySelector("i").textContent = sub || "";
      }
      if (opacity !== undefined) chap.style.opacity = String(opacity);
    };
    // Signal to Python that the API is live in THIS document.
    window.__zbReady = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
