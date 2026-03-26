// UniNest shared utilities for storage, stress, progress, and nav state.
(function () {
  const STORAGE_KEYS = {
    tasks: "uninest_tasks",
    notes: "uninest_notes",
    resources: "uninest_resources",
  };

  const read = (key, fallback = []) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("Unable to read storage", e);
      return fallback;
    }
  };

  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Unable to write storage", e);
    }
  };

  const getTasks = () =>
    read(STORAGE_KEYS.tasks, []).map((t) => ({
      ...t,
      createdAt: t.createdAt || Date.now(),
    }));
  const saveTasks = (tasks) => write(STORAGE_KEYS.tasks, tasks);

  const getNotes = () => read(STORAGE_KEYS.notes, []);
  const saveNotes = (notes) => write(STORAGE_KEYS.notes, notes);

  const getResources = () => read(STORAGE_KEYS.resources, []);
  const saveResources = (resources) => write(STORAGE_KEYS.resources, resources);

  const stressInfo = (tasks) => {
    const pending = tasks.filter((t) => !t.done).length;
    let level = "Low";
    let badge = "badge-low";
    let message = "On top of things. Keep cruising.";

    if (pending >= 3 && pending <= 5) {
      level = "Moderate";
      badge = "badge-mid";
      message = "Manageable workload. Prioritize and batch tasks.";
    } else if (pending >= 6) {
      level = "High";
      badge = "badge-high";
      message = "Workload heavy. Break tasks down and clear blockers.";
    }
    return { pending, level, badge, message };
  };

  const progressInfo = (tasks) => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, pending: total - done, percent };
  };

  const setActiveNav = () => {
    const current = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.dataset.nav === current) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  // Theme handling
  const THEME_KEY = "uninest_theme";
  const getTheme = () => read(THEME_KEY, "dark");
  const setGlowStyle = (theme) => {
    let glow = document.getElementById("cursorGlow");
    if (!glow) return;
    glow.style.boxShadow =
      theme === "dark"
        ? "0 0 18px 8px rgba(255,255,255,0.55)"
        : "0 0 14px 6px rgba(0,0,0,0.35)";
    glow.style.background =
      theme === "dark" ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.55)";
  };

  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    write(THEME_KEY, theme);
    setGlowStyle(theme);
  };

  const initTheme = () => {
    const saved = getTheme();
    applyTheme(saved);
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.textContent = saved === "dark" ? "Light mode" : "Dark mode";
      toggle.addEventListener("click", () => {
        const next = document.body.dataset.theme === "dark" ? "light" : "dark";
        applyTheme(next);
        toggle.textContent = next === "dark" ? "Light mode" : "Dark mode";
      });
    }
  };

  // Lightweight click sound using Web Audio API
  let clickSoundCtx = null;
  let clickSoundBound = false;
  const playClick = () => {
    try {
      clickSoundCtx =
        clickSoundCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (clickSoundCtx.state === "suspended") clickSoundCtx.resume();
      const osc = clickSoundCtx.createOscillator();
      const gain = clickSoundCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, clickSoundCtx.currentTime);
      gain.gain.setValueAtTime(0.08, clickSoundCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        clickSoundCtx.currentTime + 0.08
      );
      osc.connect(gain).connect(clickSoundCtx.destination);
      osc.start();
      osc.stop(clickSoundCtx.currentTime + 0.1);
    } catch (e) {
      // ignore audio errors silently to keep UX smooth
    }
  };

  const initClickSound = () => {
    if (clickSoundBound) return;
    clickSoundBound = true;
    const clickableTags = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA"];
    document.addEventListener(
      "click",
      (e) => {
        const tag = e.target.tagName;
        if (clickableTags.includes(tag)) {
          playClick();
        }
      },
      { capture: true }
    );
  };

  // Cursor glow follower
  const initCursorGlow = () => {
    // Cursor glow removed per feedback; clean up any existing element
    const glow = document.getElementById("cursorGlow");
    if (glow) glow.remove();
  };

  const formatDate = (d) => {
    const date = typeof d === "number" ? new Date(d) : d;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportAllData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      theme: document.body.dataset.theme,
      tasks: getTasks(),
      notes: getNotes(),
      resources: getResources(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const stamp = new Date()
      .toISOString()
      .replace(/[:T]/g, "-")
      .split(".")[0];
    const filename = `uninest-backup-${stamp}.json`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const initExport = () => {
    const btn = document.getElementById("exportData");
    if (!btn || btn.dataset.bound === "true") return;
    btn.dataset.bound = "true";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      exportAllData();
    });
  };

  let transitionsBound = false;
  const initPageTransitions = () => {
    if (transitionsBound) return;
    transitionsBound = true;
    const links = document.querySelectorAll(".nav-links a[data-nav]");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (
          !href ||
          link.dataset.nav === document.body.dataset.page ||
          link.target === "_blank" ||
          e.metaKey ||
          e.ctrlKey
        ) {
          return;
        }
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => {
          window.location.href = href;
        }, 160);
      });
    });
    window.addEventListener("pageshow", () => {
      document.body.classList.remove("is-leaving");
    });
  };

  // Gentle page fade when navigating between tabs/pages
  document.addEventListener("DOMContentLoaded", () => {
    // Defer to next frame so the initial render is ready before revealing
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));
    initPageTransitions();
    initExport();
    initClickSound();
  });

  // Expose globally for page scripts.
  window.UniNest = {
    STORAGE_KEYS,
    getTasks,
    saveTasks,
    stressInfo,
    progressInfo,
    setActiveNav,
    initTheme,
    initCursorGlow,
    getNotes,
    saveNotes,
    getResources,
    saveResources,
    formatDate,
    initExport,
    initPageTransitions,
    initClickSound,
  };
})();
