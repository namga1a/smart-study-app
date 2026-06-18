import { searchWikipedia } from "./api.js";

/* ---------------- TASK SYSTEM ---------------- */

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function renderTasks() {
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="${task.completed ? "completed" : ""}">
        ${task.text}
      </span>
      <button class="complete-btn">Complete</button>
      <button class="delete-btn">Delete</button>
    `;

    li.querySelector(".complete-btn").addEventListener("click", () => {
      toggleTask(index);
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      deleteTask(index);
    });

    list.appendChild(li);
  });
}

function addTask(e) {
  e.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  tasks.push({
    text: value,
    completed: false,
  });

  saveTasks();
  input.value = "";
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ---------------- SEARCH SYSTEM ---------------- */

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const loading = document.getElementById("loading");

function searchQuery() {
  const query = searchInput.value.trim();
  if (!query) return;

  loading.innerHTML = `<div class="spinner"></div>`;
  results.innerHTML = "";

  searchWikipedia(query)
    .then((data) => {
      const article = document.createElement("article");

      article.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.extract}</p>
      `;

      results.appendChild(article);
    })
    .catch(() => {
      results.innerHTML = `
        <div class="error">
          ❌ No results found. Try another topic.
        </div>
      `;
    })
    .finally(() => {
      loading.innerHTML = "";
    });
}

/* ---------------- DEBOUNCE ---------------- */

function debounce(func, delay) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/* ---------------- EVENT HANDLERS ---------------- */

if (form && input && list) {
  form.addEventListener("submit", addTask);
  renderTasks();
}

if (searchForm && searchInput) {
  function handleSubmit(e) {
    e.preventDefault();
    searchQuery();
  }

  const handleInput = debounce(searchQuery, 500);

  searchForm.addEventListener("submit", handleSubmit);
  searchInput.addEventListener("input", handleInput);
}

const notesForm = document.getElementById("notes-form");
const notesInput = document.getElementById("notes-input");
const noteTitle = document.getElementById("note-title");
const notesList = document.getElementById("notes-list");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

function renderNotes() {
  notesList.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = note.title;

    const p = document.createElement("p");
    p.classList.add("note-content");
    p.textContent = note.content;

    const btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.classList.add("delete-note");

    btn.addEventListener("click", () => {
      deleteNote(index);
    });

    div.appendChild(title);
    div.appendChild(p);
    div.appendChild(btn);

    notesList.appendChild(div);
  });
}

function addNote(e) {
  e.preventDefault();

  const title = noteTitle.value.trim();
  const content = notesInput.value.trim();

  if (!title || !content) return;

  notes.push({
    title,
    content,
  });
  localStorage.setItem("notes", JSON.stringify(notes));

  noteTitle.value = "";
  notesInput.value = "";
  renderNotes();
}

function deleteNote(index) {
  notes.splice(index, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
}

if (notesForm && notesInput && notesList) {
  notesForm.addEventListener("submit", addNote);
  renderNotes();
}
