// Uwaga: podmień poniższe wartości na swoje z Supabase (jeśli używasz)
const SUPABASE_URL = "https://<YOUR-PROJECT>.supabase.co";
const SUPABASE_ANON_KEY = "<YOUR-ANON-KEY>";

// jeśli chcesz używać Supabase, odkomentuj poniższe linie i ustaw klucze powyżej
let supabase = null;
if (typeof window?.supabase !== "undefined") {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("Supabase init failed:", e);
    supabase = null;
  }
}

const $ = id => document.getElementById(id);
const addBtn = $("addBtn");
const titleInput = $("titleInput");
const descInput = $("descInput");
const dueInput = $("dueInput");
const todoList = $("todoList");
const pagination = $("pagination");
const errorBox = $("errorMessage");

let todos = [];
const itemsPerPage = 3;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
  loadTodos();
});

async function loadTodos() {
  // próba pobrania z Supabase, fallback na localStorage
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, description, due_date")
        .order("id", { ascending: false });
      if (!error && data) {
        todos = data.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          due_date: t.due_date
        }));
        localStorage.setItem("todos", JSON.stringify(todos));
        currentPage = 1;
        render();
        return;
      }
    }
  } catch (e) {
    console.warn("Supabase fetch failed, using local copy:", e);
  }

  // fallback na localStorage
  todos = JSON.parse(localStorage.getItem("todos")) || [];
  currentPage = 1;
  render();
}

addBtn.onclick = async () => {
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const due_date = dueInput.value;

  if (!title) return showError("Title is required");

  // nowy obiekt - jeśli bez id, dodajemy lokalne id tymczasowe
  const newTask = {
    // id will be set after insert from supabase, temporarily use timestamp
    id: null,
    title,
    description,
    due_date
  };

  // dodaj lokalnie na początek
  todos.unshift(newTask);
  localStorage.setItem("todos", JSON.stringify(todos));

  // reset form
  titleInput.value = "";
  descInput.value = "";
  dueInput.value = "";
  currentPage = 1;
  render();

  // spróbuj zapisać do Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ title, description, due_date }])
        .select("id, title, description, due_date");
      if (!error && data && data.length) {
        // zastąp pierwszy element odpowiedzią z serwera (z id)
        todos[0] = data[0];
        localStorage.setItem("todos", JSON.stringify(todos));
        render();
      } else if (error) {
        console.warn("Insert error:", error);
        showError("Saved locally — will sync when online");
      }
    } catch (e) {
      console.warn("Supabase insert failed:", e);
      showError("Saved locally — will sync when online");
    }
  } else {
    // brak supabase -> offline
    showError("Saved locally — Supabase not configured");
  }
};

function render() {
  renderTodos();
  renderPagination();
}

function renderTodos() {
  todoList.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const subset = todos.slice(start, start + itemsPerPage);

  if (subset.length === 0) {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.innerHTML = `<div class="todo-main"><em>No tasks</em></div>`;
    todoList.appendChild(li);
    return;
  }

  subset.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    // bezpieczeństwo - escape HTML
    const title = escapeHtml(item.title || "");
    const desc = escapeHtml(item.description || "");
    const due = escapeHtml(item.due_date || "");

    li.innerHTML = `
      <div class="todo-main">
        <strong>${title}</strong>
        <small>${desc}</small>
        <em>${due}</em>
      </div>
      <div class="todo-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    // index w globalnej tablicy
    const globalIndex = start + i;

    li.querySelector(".edit-btn").onclick = () => editTask(globalIndex, li);
    li.querySelector(".delete-btn").onclick = () => deleteTask(globalIndex);
    todoList.appendChild(li);
  });
}

function renderPagination() {
  pagination.innerHTML = "";
  const pages = Math.max(1, Math.ceil(todos.length / itemsPerPage));
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.className = "pagination-btn";
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => {
      currentPage = i;
      render();
      // scroll to top of list for better UX
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    pagination.appendChild(btn);
  }
}

function editTask(index, li) {
  const item = todos[index];
  const title = escapeHtml(item.title || "");
  const desc = escapeHtml(item.description || "");
  const due = item.due_date || "";

  li.innerHTML = `
    <input class="todo-text" id="editTitle" value="${title}" placeholder="Title">
    <input class="todo-text" id="editDesc" value="${desc}" placeholder="Description">
    <input type="date" class="todo-text" id="editDue" value="${due}">
    <button class="save-btn">Save</button>
    <button class="delete-btn">Delete</button>
  `;

  li.querySelector(".save-btn").onclick = async () => {
    const valueTitle = li.querySelector("#editTitle").value.trim();
    const valueDesc = li.querySelector("#editDesc").value.trim();
    const valueDue = li.querySelector("#editDue").value;

    if (!valueTitle) return showError("Title cannot be empty");

    const old = { ...item };
    todos[index] = { ...item, title: valueTitle, description: valueDesc, due_date: valueDue };
    localStorage.setItem("todos", JSON.stringify(todos));
    render();

    if (old.id && supabase) {
      try {
        await supabase
          .from("tasks")
          .update({ title: valueTitle, description: valueDesc, due_date: valueDue })
          .eq("id", old.id);
      } catch (e) {
        console.warn("Update failed:", e);
        showError("Saved locally — will sync when online");
      }
    }
  };

  li.querySelector(".delete-btn").onclick = () => deleteTask(index);
}

async function deleteTask(index) {
  const removed = todos.splice(index, 1)[0];
  localStorage.setItem("todos", JSON.stringify(todos));

  // adjust page if needed
  if ((currentPage - 1) * itemsPerPage >= todos.length) {
    currentPage = Math.max(1, currentPage - 1);
  }
  render();

  if (removed && removed.id && supabase) {
    try {
      await supabase.from("tasks").delete().eq("id", removed.id);
    } catch (e) {
      console.warn("Delete failed on server:", e);
      showError("Deleted locally — will sync when online");
    }
  }
}

function showError(text) {
  if (!errorBox) return;
  errorBox.textContent = text;
  errorBox.style.display = "block";
  clearTimeout(window.__todo_error_timeout);
  window.__todo_error_timeout = setTimeout(() => (errorBox.style.display = "none"), 3500);
}

function escapeHtml(s) {
  if (typeof s !== "string") return "";
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
