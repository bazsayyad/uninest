let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = localStorage.getItem("notes") || "";
let resources = JSON.parse(localStorage.getItem("resources")) || [];
let darkMode = localStorage.getItem("darkMode") === "true";

function saveAll() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("notes", notes);
  localStorage.setItem("resources", JSON.stringify(resources));
  localStorage.setItem("darkMode", darkMode);
}

function addTask() {
  let input = document.getElementById("taskInput");
  if (!input) return;

  if (input.value.trim() !== "") {
    tasks.push({ text: input.value, done: false });
    input.value = "";
    saveAll();
    renderTasks();
    updateDashboard();
  }
}

function renderTasks() {
  let list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";
  tasks.forEach((t, i) => {
    let li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""}
      onchange="toggleTask(${i})">
      ${t.text}
    `;
    list.appendChild(li);
  });
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  saveAll();
  renderTasks();
  updateDashboard();
}

function saveNotes() {
  let area = document.getElementById("noteArea");
  if (!area) return;
  notes = area.value;
  saveAll();
}

function loadNotes() {
  let area = document.getElementById("noteArea");
  if (area) area.value = notes;
}

function addResource() {
  let input = document.getElementById("linkInput");
  if (!input) return;

  if (input.value !== "") {
    resources.push(input.value);
    input.value = "";
    saveAll();
    renderResources();
  }
}

function renderResources() {
  let list = document.getElementById("resourceList");
  if (!list) return;

  list.innerHTML = "";
  resources.forEach(r => {
    let li = document.createElement("li");
    li.innerHTML = `<a href="${r}" target="_blank">${r}</a>`;
    list.appendChild(li);
  });
}

function updateDashboard() {
  let bar = document.getElementById("progressBar");
  let text = document.getElementById("progressText");
  let msg = document.getElementById("stressMsg");

  if (!bar) return;

  let done = tasks.filter(t => t.done).length;
  let total = tasks.length;
  let pending = total - done;

  let percent = total ? (done / total) * 100 : 0;
  bar.style.width = percent + "%";
  text.textContent = `Completed ${done} of ${total} tasks`;

  // ---- NEW STRESS LOGIC ----
  let stressScore = 0;

  if (pending >= 8) stressScore = 90;
  else if (pending >= 5) stressScore = 60;
  else if (pending >= 3) stressScore = 40;
  else stressScore = 10;

  if (stressScore >= 70) {
    msg.innerHTML = "🔴 High Stress — Reduce workload immediately.";
    msg.style.color = "red";
  } 
  else if (stressScore >= 40) {
    msg.innerHTML = "🟡 Moderate Stress — Plan properly.";
    msg.style.color = "orange";
  } 
  else {
    msg.innerHTML = "🟢 Low Stress — You're balanced.";
    msg.style.color = "green";
  }
}

function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.classList.toggle("dark", darkMode);
  saveAll();
}

function loadDarkMode() {
  document.body.classList.toggle("dark", darkMode);
}

renderTasks();
renderResources();
loadNotes();
updateDashboard();
loadDarkMode();