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
        /* Headless captures no pointer, so the cursor is drawn. */
        .cur {
          position: fixed; left: 0; top: 0; width: 22px; height: 22px;
          margin: -11px 0 0 -11px; border-radius: 50%;
          border: 2px solid rgba(18,28,43,.55);
          background: rgba(255,255,255,.35);
          opacity: 0;
        }
        .cur::after {
          content: ""; position: absolute; left: 50%; top: 50%;
          width: 6px; height: 6px; margin: -3px 0 0 -3px;
          border-radius: 50%; background: ${INK};
        }
        .cur.press {
          transform: scale(.82);
          border-color: ${CLAY};
        }
      </style>
      <div class="cap"></div>
      <div class="cur"></div>
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
    window.__cur = (x, y, opacity, pressing) => {
      if (x !== undefined && x !== null) {
        cur.style.left = x + "px";
        cur.style.top = y + "px";
      }
      if (opacity !== undefined) cur.style.opacity = String(opacity);
      if (pressing !== undefined) cur.classList.toggle("press", !!pressing);
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
