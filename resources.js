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

  const detectType = (url) => {
    const lower = url.toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF";
    if (lower.includes("youtube.com") || lower.includes("youtu.be") || lower.includes("vimeo.com"))
      return "Video";
    if (lower.includes("drive.google.com") || lower.includes("docs.google.com"))
      return "Document";
    if (lower.includes("figma.com") || lower.includes("canva.com")) return "Design";
    if (lower.includes(".mp4") || lower.includes(".mov")) return "Video";
    if (lower.includes(".ppt") || lower.includes(".pptx")) return "Slides";
    if (lower.includes(".doc") || lower.includes(".docx")) return "Document";
    return "Link";
  };

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
    const pickedType = typeSelect.value === "auto" ? detectType(url) : typeSelect.value;
    const resources = getResources();
    resources.push({
      id: Date.now(),
      title,
      url,
      type: pickedType,
    });
    saveResources(resources);
    titleInput.value = "";
    urlInput.value = "";
    typeSelect.value = "auto";
    render();
  });

  render();
});
