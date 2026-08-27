/* Reveal control for the slates. The recorder drives this frame by frame:
 *   window.__slate(i, t)   reveal element i, progress t (0 -> 1)
 *   window.__slateClear(o) fade the whole stage to opacity o
 * Nothing animates on its own, so a captured frame is never mid-transition.
 */
(() => {
  const els = () => Array.from(document.querySelectorAll(".r"));
  window.__slate = (i, t) => {
    const el = els()[i];
    if (!el) return;
    el.style.opacity = String(t);
    el.style.transform = "translateY(" + (14 * (1 - t)).toFixed(2) + "px)";
  };
  window.__slateClear = (o) => {
    const stage = document.querySelector(".stage");
    if (stage) stage.style.opacity = String(o);
  };
  window.__slateReady = true;
})();
