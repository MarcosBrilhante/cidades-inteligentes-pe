const preference = matchMedia("(prefers-reduced-motion: reduce)");
const animations = new Set();
let observer;
let disposePage = () => {};
let userReduced = false;
try {
  userReduced = localStorage.getItem("cipe-reduce-motion") === "true";
} catch {}
export const motionEnabled = () => !preference.matches && !userReduced;

export function clearPageMotion() {
  observer?.disconnect();
  observer = null;
  disposePage();
  disposePage = () => {};
  for (const animation of animations) animation.cancel();
  animations.clear();
}

function play(element, frames, options = {}) {
  if (!motionEnabled() || !element?.animate) return;
  const animation = element.animate(frames, {
    duration: 560,
    easing: "cubic-bezier(.16,1,.3,1)",
    ...options,
  });
  animations.add(animation);
  const remove = () => animations.delete(animation);
  animation.addEventListener("finish", remove, { once: true });
  animation.addEventListener("cancel", remove, { once: true });
  return animation;
}

export function initMotion(button, onChange) {
  function sync() {
    const enabled = motionEnabled();
    document.documentElement.dataset.motion = enabled ? "on" : "off";
    button.setAttribute("aria-pressed", String(!enabled));
    button.setAttribute(
      "aria-label",
      preference.matches
        ? "Movimento reduzido pelo sistema"
        : "Reduzir animações",
    );
    button.title = preference.matches
      ? "A preferência de movimento reduzido do sistema está ativa"
      : enabled
        ? "Reduzir animações"
        : "Ativar animações";
    button.disabled = preference.matches;
    if (!enabled) clearPageMotion();
    onChange?.();
  }
  button.addEventListener("click", () => {
    userReduced = !userReduced;
    try {
      localStorage.setItem("cipe-reduce-motion", String(userReduced));
    } catch {}
    sync();
  });
  preference.addEventListener("change", sync);
  sync();
}

export function animatePage(root, { navigation = false } = {}) {
  clearPageMotion();
  if (!motionEnabled()) return;
  // Never hide content in CSS: unsupported APIs and canceled motion remain readable.
  if (navigation) {
    const heading = root.querySelector(
      ".hero > div:first-child, .page-heading",
    );
    play(
      heading,
      [
        { opacity: 0.35, transform: "translateY(18px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 700 },
    );
    const groups = root.querySelectorAll(
      ":scope > .filter-panel, :scope > .stats-grid, :scope > .charts-grid, :scope > .bottom-grid, :scope > .context-panel, :scope > .glossary-panel, :scope > .info-grid, :scope > .participation-grid, :scope > .map-layout, :scope > .table-panel",
    );
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          let order = 0;
          for (const entry of entries) {
            if (!entry.isIntersecting || !entry.target.isConnected) continue;
            observer?.unobserve(entry.target);
            if (entry.target.contains(document.activeElement)) continue;
            play(
              entry.target,
              [
                { opacity: 0.45, transform: "translateY(22px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { delay: order++ * 70 },
            );
          }
        },
        { threshold: 0, rootMargin: "0px 0px -20px 0px" },
      );
      groups.forEach((group) => observer.observe(group));
    }
  } else {
    root.querySelectorAll(".stat-value").forEach((value, index) => {
      play(
        value,
        [
          { opacity: 0.4, transform: "translateY(9px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 420, delay: index * 45 },
      );
    });
  }
  const onToggle = (event) => {
    if (event.target instanceof HTMLDetailsElement && event.target.open) {
      play(
        event.target.querySelector(":scope > div"),
        [
          { opacity: 0.3, transform: "translateY(-6px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 260 },
      );
    }
  };
  const onFocus = (event) => {
    for (const animation of animations) {
      if (animation.effect?.target?.contains(event.target)) animation.finish();
    }
  };
  root.addEventListener("toggle", onToggle, true);
  root.addEventListener("focusin", onFocus);
  disposePage = () => {
    root.removeEventListener("toggle", onToggle, true);
    root.removeEventListener("focusin", onFocus);
  };
}
