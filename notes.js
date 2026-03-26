document.addEventListener("DOMContentLoaded", () => {
  const {
    getNotes,
    saveNotes,
    setActiveNav,
    formatDate,
    initTheme,
    initCursorGlow,
  } = window.UniNest;

  setActiveNav();
  initCursorGlow();
  initTheme();

  const form = document.getElementById("noteForm");
  const titleInput = document.getElementById("noteTitle");
  const bodyInput = document.getElementById("noteBody");
  const list = document.getElementById("notesList");
  const emptyState = document.getElementById("notesEmpty");
  const count = document.getElementById("notesCount");

  const render = () => {
    const notes = getNotes();
    list.innerHTML = "";
    if (!notes.length) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }
    notes
      .slice()
      .reverse()
      .forEach((note) => {
        const row = document.createElement("div");
        row.className = "list-item";
        row.style.alignItems = "flex-start";

        const text = document.createElement("div");
        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = note.title;

        const preview = document.createElement("div");
        preview.className = "muted";
        preview.style.marginTop = "6px";
        preview.textContent =
          note.body.length > 180
            ? note.body.slice(0, 180) + "…"
            : note.body;

        const meta = document.createElement("div");
        meta.className = "muted";
        meta.style.marginTop = "6px";
        meta.textContent = "Saved " + formatDate(note.createdAt);

        text.appendChild(title);
        text.appendChild(preview);
        text.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "flex";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "ghost";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => remove(note.id));

        actions.appendChild(deleteBtn);

        row.appendChild(text);
        row.appendChild(actions);
        list.appendChild(row);
      });

    count.textContent = `${notes.length} note${notes.length === 1 ? "" : "s"}`;
  };

  const remove = (id) => {
    const remaining = getNotes().filter((n) => n.id !== id);
    saveNotes(remaining);
    render();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    if (!title || !body) return;
    const notes = getNotes();
    notes.push({
      id: Date.now(),
      title,
      body,
      createdAt: Date.now(),
    });
    saveNotes(notes);
    titleInput.value = "";
    bodyInput.value = "";
    render();
  });

  render();
});
