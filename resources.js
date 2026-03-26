document.addEventListener("DOMContentLoaded", () => {
  const {
    getResources,
    saveResources,
    setActiveNav,
    initTheme,
    initCursorGlow,
  } = window.UniNest;

  setActiveNav();
  initCursorGlow();
  initTheme();

  const form = document.getElementById("resourceForm");
  const titleInput = document.getElementById("resourceTitle");
  const urlInput = document.getElementById("resourceUrl");
  const typeSelect = document.getElementById("resourceType");
  const list = document.getElementById("resourceList");
  const emptyMsg = document.getElementById("resourceEmptyMsg");
  const count = document.getElementById("resourceCount");

  const render = () => {
    const resources = getResources();
    list.innerHTML = "";
    if (!resources.length) {
      emptyMsg.style.display = "block";
    } else {
      emptyMsg.style.display = "none";
    }
    resources
      .slice()
      .reverse()
      .forEach((res) => {
        const row = document.createElement("div");
        row.className = "list-item";

        const left = document.createElement("div");
        left.style.display = "grid";
        left.style.gap = "6px";

        const link = document.createElement("a");
        link.href = res.url;
        link.className = "link";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = res.title || res.url;

        const url = document.createElement("div");
        url.className = "muted";
        url.textContent = res.url;

        left.appendChild(link);
        left.appendChild(url);

        const right = document.createElement("div");
        right.className = "flex";

        const type = document.createElement("span");
        type.className = "pill";
        type.textContent = res.type || "Link";

        const del = document.createElement("button");
        del.className = "ghost";
        del.textContent = "Delete";
        del.addEventListener("click", () => remove(res.id));

        right.appendChild(type);
        right.appendChild(del);

        row.appendChild(left);
        row.appendChild(right);
        list.appendChild(row);
      });

    count.textContent = `${resources.length} saved`;
  };

  const remove = (id) => {
    const remaining = getResources().filter((r) => r.id !== id);
    saveResources(remaining);
    render();
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const url = urlInput.value.trim();
    if (!title || !url) return;
    const resources = getResources();
    resources.push({
      id: Date.now(),
      title,
      url,
      type: typeSelect.value,
    });
    saveResources(resources);
    titleInput.value = "";
    urlInput.value = "";
    render();
  });

  render();
});
