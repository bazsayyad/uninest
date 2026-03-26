document.addEventListener("DOMContentLoaded", () => {
  const {
    getTasks,
    saveTasks,
    progressInfo,
    setActiveNav,
    initTheme,
    initCursorGlow,
  } = window.UniNest;

  setActiveNav();
  initCursorGlow();
  initTheme();

  const taskForm = document.getElementById("taskForm");
  const titleInput = document.getElementById("taskTitle");
  const prioritySelect = document.getElementById("taskPriority");
  const list = document.getElementById("taskList");
  const emptyState = document.getElementById("taskEmpty");
  const summary = document.getElementById("taskSummary");
  const stats = document.getElementById("taskStats");
  const pendingPill = document.getElementById("taskPendingPill");
  const clearCompleted = document.getElementById("clearCompleted");
  const clearAll = document.getElementById("clearAll");

  const priorityLabel = (priority) => {
    if (priority === "high") return { text: "High", className: "badge-high" };
    if (priority === "low") return { text: "Low", className: "badge-low" };
    return { text: "Normal", className: "badge-mid" };
  };

  const render = () => {
    const tasks = getTasks();
    list.innerHTML = "";
    if (!tasks.length) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }
    tasks
      .slice()
      .reverse()
      .forEach((task) => {
        const row = document.createElement("div");
        row.className = "list-item";

        const left = document.createElement("div");
        left.className = "checkbox-row";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change", () => toggle(task.id));

        const title = document.createElement("span");
        title.className = "task-title" + (task.done ? " done" : "");
        title.textContent = task.title;

        left.appendChild(checkbox);
        left.appendChild(title);

        const badge = document.createElement("span");
        const info = priorityLabel(task.priority);
        badge.className = "badge " + info.className;
        badge.textContent = info.text;

        row.appendChild(left);
        row.appendChild(badge);
        list.appendChild(row);
      });

    const p = progressInfo(tasks);
    summary.textContent = `${p.total} task${p.total === 1 ? "" : "s"}`;
    stats.textContent = `${p.done} done • ${p.pending} pending`;
    pendingPill.textContent = `${p.pending} pending`;
  };

  const toggle = (id) => {
    const updated = getTasks().map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    saveTasks(updated);
    render();
  };

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) return;
    const tasks = getTasks();
    tasks.push({
      id: Date.now(),
      title,
      priority: prioritySelect.value,
      done: false,
      createdAt: Date.now(),
    });
    saveTasks(tasks);
    titleInput.value = "";
    render();
  });

  clearCompleted.addEventListener("click", () => {
    const remaining = getTasks().filter((t) => !t.done);
    saveTasks(remaining);
    render();
  });

  clearAll.addEventListener("click", () => {
    const confirmed = confirm("Clear all tasks? This only affects your device.");
    if (!confirmed) return;
    saveTasks([]);
    render();
  });

  render();
});
