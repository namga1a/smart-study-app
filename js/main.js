import { searchWikipedia } from "./api.js";

/* ---------------- ELEMENTS ---------------- */

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const dateInput = document.getElementById("task-date");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const loading = document.getElementById("loading");

const notesForm = document.getElementById("notes-form");
const notesInput = document.getElementById("notes-input");
const noteTitle = document.getElementById("note-title");
const notesList = document.getElementById("notes-list");

/* ---------------- DATA ---------------- */

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];

/* ---------------- TASK SYSTEM ---------------- */

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.completed) {
      span.classList.add("completed");
    }

    const date = document.createElement("small");

    if (task.dueDate) {
      const due = new Date(task.dueDate);
      const today = new Date();

      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        date.textContent = `Due: ${task.dueDate} | ⚠ Overdue`;
        date.style.color = "red";
      } else if (diffDays === 0) {
        date.textContent = `Due: ${task.dueDate} | ⚠ Today`;
        date.style.color = "orange";
      } else {
        date.textContent = `Due: ${task.dueDate} | ${diffDays} days left`;
      }
    }

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.classList.add("complete-btn");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    completeBtn.onclick = () => toggleTask(index);
    deleteBtn.onclick = () => deleteTask(index);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("btn-container");

    btnContainer.appendChild(completeBtn);
    btnContainer.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(date);
    li.appendChild(btnContainer);

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
    dueDate: dateInput.value || null,
  });

  saveTasks();
  input.value = "";
  dateInput.value = "";
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

/* ---------------- SEARCH SYSTEM ---------------- */

function searchQuery() {
  const query = searchInput.value.trim();
  if (!query) return;

  loading.innerHTML = `<div class="spinner"></div>`;
  results.innerHTML = "";

  searchWikipedia(query)
    .then((data) => {
      results.innerHTML = `
        <article>
          <h3>${data.title}</h3>
          <p>${data.extract}</p>
        </article>
      `;
    })
    .catch(() => {
      results.innerHTML = `
        <div class="error">❌ No results found</div>
      `;
    })
    .finally(() => {
      loading.innerHTML = "";
    });
}

function debounce(func, delay) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/* ---------------- NOTES SYSTEM ---------------- */

function renderNotes() {
  notesList.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <button class="delete-note">Delete</button>
    `;

    div.querySelector("button").onclick = () => deleteNote(index);

    notesList.appendChild(div);
  });
}

function addNote(e) {
  e.preventDefault();

  const title = noteTitle.value.trim();
  const content = notesInput.value.trim();

  if (!title || !content) return;

  notes.push({ title, content });

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

/* ---------------- EVENTS ---------------- */

if (form) {
  form.addEventListener("submit", addTask);
  renderTasks();
}

if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchQuery();
  });

  searchInput.addEventListener("input", debounce(searchQuery, 500));
}

if (notesForm) {
  notesForm.addEventListener("submit", addNote);
  renderNotes();
}