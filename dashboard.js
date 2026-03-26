document.addEventListener("DOMContentLoaded", () => {
  const {
    getTasks,
    saveTasks,
    stressInfo,
    progressInfo,
    setActiveNav,
    getResources,
    initTheme,
    initCursorGlow,
  } = window.UniNest;

  setActiveNav();
  initCursorGlow();
  initTheme();

  const progressBar = document.getElementById("progressBar");
  const progressBadge = document.getElementById("progressBadge");
  const progressCount = document.getElementById("progressCount");
  const pendingCount = document.getElementById("pendingCount");
  const stressBadge = document.getElementById("stressBadge");
  const stressMessage = document.getElementById("stressMessage");
  const resourcePeek = document.getElementById("resourcePeek");
  const resourceEmpty = document.getElementById("resourceEmpty");
  const progressBars = document.getElementById("progressBars");
  const progressLabels = document.getElementById("progressLabels");

  const refreshProgress = () => {
    const stats = progressInfo(getTasks());
    progressBar.style.width = `${stats.percent}%`;
    progressBadge.textContent = `${stats.percent}% done`;
    progressCount.textContent = `${stats.done} of ${stats.total} tasks done`;
    pendingCount.textContent = `${stats.pending} pending`;
    renderGraph();
  };

  const refreshStress = () => {
    const info = stressInfo(getTasks());
    stressBadge.textContent = info.level;
    stressBadge.className = `badge ${info.badge}`;
    stressMessage.textContent = info.message;
  };

  const renderResources = () => {
    const items = getResources();
    resourcePeek.innerHTML = "";
    if (!items.length) {
      resourceEmpty.style.display = "block";
      return;
    }
    resourceEmpty.style.display = "none";
    items
      .slice(-3)
      .reverse()
      .forEach((item) => {
        const row = document.createElement("div");
        row.className = "list-item";
        const link = document.createElement("a");
        link.href = item.url;
        link.className = "link";
        link.textContent = item.title || item.url;
        link.target = "_blank";
        const tag = document.createElement("span");
        tag.className = "pill";
        tag.textContent = item.type || "Link";
        row.appendChild(link);
        row.appendChild(tag);
        resourcePeek.appendChild(row);
      });
  };

  refreshProgress();
  refreshStress();
  renderResources();

  const quickForm = document.getElementById("quickTaskForm");
  const quickInput = document.getElementById("quickTaskInput");
  const quickPriority = document.getElementById("quickTaskPriority");

  quickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = quickInput.value.trim();
    if (!title) return;
    const tasks = getTasks();
    tasks.push({
      id: Date.now(),
      title,
      priority: quickPriority.value,
      done: false,
      createdAt: Date.now(),
    });
    saveTasks(tasks);
    quickInput.value = "";
    refreshProgress();
    refreshStress();
  });

  /* Pomodoro */
  const pomoTime = document.getElementById("pomoTime");
  const pomoStatus = document.getElementById("pomoStatus");
  const pomoMode = document.getElementById("pomoMode");
  const pomoStart = document.getElementById("pomoStart");
  const pomoReset = document.getElementById("pomoReset");
  const pomoPreset = document.getElementById("pomoPreset");

  if (pomoTime && pomoStart && pomoPreset) {
    let focusSeconds = Number(pomoPreset.value) * 60;
    let breakSeconds = Math.round(Number(pomoPreset.value) * 0.2) * 60;
    let pomoSeconds = focusSeconds;
    let timer = null;
    let isBreak = false;
    let running = false;

    const formatTime = (sec) => {
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${s}`;
    };

    const updatePomoUI = () => {
      pomoTime.textContent = formatTime(pomoSeconds);
      pomoStatus.textContent = running
        ? isBreak
          ? "Break in progress. Stretch!"
          : "Focus time. Deep work."
        : "Ready to start a focus session.";
      pomoMode.textContent = isBreak
        ? "Break"
        : `Focus ${focusSeconds / 60} • Break ${breakSeconds / 60}`;
      pomoStart.textContent = running ? "Pause" : "Start";
    };

    const tick = () => {
      if (pomoSeconds > 0) {
        pomoSeconds -= 1;
        updatePomoUI();
        return;
      }
      // switch modes
      isBreak = !isBreak;
      pomoSeconds = isBreak ? breakSeconds : focusSeconds;
      updatePomoUI();
    };

    const stopTimer = () => {
      if (timer) clearInterval(timer);
      timer = null;
      running = false;
    };

    pomoStart.addEventListener("click", (e) => {
      e.preventDefault();
      if (running) {
        stopTimer();
        updatePomoUI();
        return;
      }
      running = true;
      timer = setInterval(tick, 1000);
      updatePomoUI();
    });

    pomoReset.addEventListener("click", (e) => {
      e.preventDefault();
      stopTimer();
      isBreak = false;
      focusSeconds = Number(pomoPreset.value) * 60;
      breakSeconds = Math.round(Number(pomoPreset.value) * 0.2) * 60;
      pomoSeconds = focusSeconds;
      updatePomoUI();
    });

    pomoPreset.addEventListener("change", () => {
      stopTimer();
      isBreak = false;
      focusSeconds = Number(pomoPreset.value) * 60;
      breakSeconds = Math.round(Number(pomoPreset.value) * 0.2) * 60;
      pomoSeconds = focusSeconds;
      updatePomoUI();
    });

    updatePomoUI();
  }

  /* Calendar */
  const calendarDate = document.getElementById("calendarDate");
  const calendarToday = document.getElementById("calendarToday");
  const calendarTime = document.getElementById("calendarTime");
  const calendarGrid = document.getElementById("calendarGrid");

  const renderCalendar = () => {
    if (!calendarGrid || !calendarDate || !calendarToday || !calendarTime) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    calendarDate.textContent = now.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
    calendarToday.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    calendarTime.textContent = now.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    calendarGrid.innerHTML = "";
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // day headers
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    days.forEach((d) => {
      const head = document.createElement("div");
      head.className = "calendar-head";
      head.textContent = d;
      calendarGrid.appendChild(head);
    });

    // blank cells before first day
    for (let i = 0; i < startDay; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell empty";
      cell.textContent = "";
      calendarGrid.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      cell.textContent = day;
      if (day === now.getDate()) cell.classList.add("today");
      calendarGrid.appendChild(cell);
    }
  };

  setInterval(renderCalendar, 1000);
  renderCalendar();

  /* Progress graph */
  function renderGraph() {
    if (!progressBars || !progressLabels) return;
    const tasks = getTasks();
    const today = new Date();
    const buckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toDateString();
      buckets.push({ key, date: new Date(d), count: 0 });
    }
    tasks.forEach((t) => {
      if (!t.done) return;
      const created = t.createdAt ? new Date(t.createdAt) : new Date();
      const createdKey = created.toDateString();
      const bucket = buckets.find((b) => b.key === createdKey);
      if (bucket) bucket.count += 1;
    });

    const max = Math.max(...buckets.map((b) => b.count), 1);
    progressBars.innerHTML = "";
    progressLabels.innerHTML = "";
    buckets.forEach((b) => {
      const bar = document.createElement("div");
      bar.className = "spark-bar";
      bar.style.height = `${(b.count / max) * 100}%`;
      progressBars.appendChild(bar);

      const label = document.createElement("div");
      label.textContent = b.date.toLocaleDateString(undefined, {
        weekday: "short",
      });
      progressLabels.appendChild(label);
    });
  }

  // initial draws
  renderGraph();
  renderCalendar();
});
