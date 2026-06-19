import { searchWikipedia, fetchProgrammingInfo } from "./api.js";

/* ---------------- CONSTANTS & HELPERS ---------------- */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const Storage = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
};

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

/* ---------------- DOM ELEMENTS ---------------- */

const DOM = {
  task: {
    form: document.getElementById("task-form"),
    input: document.getElementById("task-input"),
    list: document.getElementById("task-list"),
    dateInput: document.getElementById("task-date"),
  },
  search: {
    form: document.getElementById("search-form"),
    input: document.getElementById("search-input"),
    results: document.getElementById("results"),
    loading: document.getElementById("loading"),
  },
  notes: {
    form: document.getElementById("notes-form"),
    input: document.getElementById("notes-input"),
    title: document.getElementById("note-title"),
    list: document.getElementById("notes-list"),
  },
  math: {
    calcDisplay: document.getElementById("calc-display"),
    pyA: document.getElementById("py-a"),
    pyB: document.getElementById("py-b"),
    solvePyBtn: document.getElementById("solve-py"),
    pyResult: document.getElementById("py-result"),
  },
  programming: {
    docView: document.getElementById("doc-view"),
    tabs: document.querySelectorAll(".lang-tab"),
  },
};

/* ---------------- STATE ---------------- */

let tasks = Storage.get("tasks");
let notes = Storage.get("notes");

/* ---------------- TASK SYSTEM ---------------- */

function renderTasks() {
  if (!DOM.task.list) return;
  DOM.task.list.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = task.text;
    if (task.completed) span.classList.add("completed");

    const dateLabel = document.createElement("small");
    if (task.dueDate) {
      const diffDays = Math.ceil((new Date(task.dueDate) - new Date()) / MS_PER_DAY);
      
      if (diffDays < 0) {
        dateLabel.textContent = `Due: ${task.dueDate} | ⚠ Overdue`;
        dateLabel.style.color = "red";
      } else if (diffDays === 0) {
        dateLabel.textContent = `Due: ${task.dueDate} | ⚠ Today`;
        dateLabel.style.color = "orange";
      } else {
        dateLabel.textContent = `Due: ${task.dueDate} | ${diffDays} days left`;
      }
    }

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.classList.add("complete-btn");
    completeBtn.onclick = () => toggleTask(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteTask(index);

    const btnContainer = document.createElement("div");
    btnContainer.classList.add("btn-container");
    btnContainer.appendChild(completeBtn);
    btnContainer.appendChild(deleteBtn);

    li.append(span, dateLabel, btnContainer);
    DOM.task.list.appendChild(li);
  });
}

function addTask(e) {
  e.preventDefault();
  const value = DOM.task.input.value.trim();
  if (!value) return;

  tasks.push({
    text: value,
    completed: false,
    dueDate: DOM.task.dateInput.value || null,
  });

  Storage.set("tasks", tasks);
  DOM.task.input.value = "";
  DOM.task.dateInput.value = "";
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  Storage.set("tasks", tasks);
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  Storage.set("tasks", tasks);
  renderTasks();
}

/* ---------------- SEARCH SYSTEM ---------------- */

function searchQuery() {
  const { input, results, loading } = DOM.search;
  if (!input || !results || !loading) return;

  const query = input.value.trim();
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
      results.innerHTML = `<div class="error">❌ No results found</div>`;
    })
    .finally(() => {
      loading.innerHTML = "";
    });
}

/* ---------------- NOTES SYSTEM ---------------- */

function renderNotes() {
  if (!DOM.notes.list) return;
  DOM.notes.list.innerHTML = "";

  notes.forEach((note, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <button class="delete-note">Delete</button>
    `;
    div.querySelector("button").onclick = () => deleteNote(index);
    DOM.notes.list.appendChild(div);
  });
}

function addNote(e) {
  e.preventDefault();
  const title = DOM.notes.title.value.trim();
  const content = DOM.notes.input.value.trim();
  if (!title || !content) return;

  notes.push({ title, content });
  Storage.set("notes", notes);

  DOM.notes.title.value = "";
  DOM.notes.input.value = "";
  renderNotes();
}

function deleteNote(index) {
  notes.splice(index, 1);
  Storage.set("notes", notes);
  renderNotes();
}

/* ---------------- MATHEMATICS SYSTEM ---------------- */

function initMathSystem() {
  const { calcDisplay, solvePyBtn, pyA, pyB, pyResult } = DOM.math;

  if (calcDisplay) {
    document.querySelectorAll(".calc-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.textContent;
        if (value === "C") {
          calcDisplay.value = "";
        } else if (value === "=") {
          try {
            calcDisplay.value = Function(`"use strict"; return (${calcDisplay.value})`)();
          } catch {
            calcDisplay.value = "Error";
          }
        } else {
          if (calcDisplay.value === "Error") calcDisplay.value = "";
          calcDisplay.value += value;
        }
      });
    });
  }

  if (solvePyBtn) {
    solvePyBtn.addEventListener("click", () => {
      const a = parseFloat(pyA.value);
      const b = parseFloat(pyB.value);
      if (a > 0 && b > 0) {
        const c = Math.sqrt(a * a + b * b).toFixed(2);
        pyResult.textContent = `Hypotenuse (c) = ${c}`;
      } else {
        pyResult.textContent = "❌ Please enter valid lengths.";
      }
    });
  }
}

/* ---------------- PROGRAMMING SYSTEM ---------------- */

function loadLanguageDoc(tag) {
  const { docView } = DOM.programming;
  if (!docView) return;

  docView.innerHTML = `<div class="spinner"></div>`;

  fetchProgrammingInfo(tag)
    .then((data) => {
      docView.innerHTML = `
        <article class="doc-card" style="text-align: left; animation: fadeIn 0.3s ease;">
          <h2 style="border: none; margin-bottom: 12px; font-size: 1.8rem; text-transform: capitalize; color: var(--primary);">
            ${data.tag_name}
          </h2>
          <p class="doc-desc" style="line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px; color: var(--text);">
            ${data.excerpt}
          </p>
          <div class="doc-meta" style="background: var(--bg-card); border: 1px solid #e2e8f0; padding: 14px; border-radius: var(--radius-sm); margin-bottom: 20px;">
            <strong>Data Stream Attribution:</strong>
            <p style="font-size: 0.9rem; color: #64748b; margin-top: 4px;">
              Live verification via Stack Overflow Developer Wiki Registry | Target Query Key: <code>${data.tag_name}</code>
            </p>
          </div>
          <div style="margin-top: 12px;">
            <a href="https://stackoverflow.com/tags/${encodeURIComponent(data.tag_name)}/info" target="_blank" class="complete-btn" style="display: inline-block; padding: 10px 18px; text-decoration: none; font-size: 0.9rem; border-radius: var(--radius-sm); color: white; background-color: var(--primary);">
              View Community Q&A Board Wiki →
            </a>
          </div>
        </article>
      `;
    })
    .catch((error) => {
      console.error(error);
      docView.innerHTML = `<div class="error" style="text-align: left;">❌ ${error.message}</div>`;
    });
}

function initProgrammingSystem() {
  const { docView, tabs } = DOM.programming;
  if (!docView || tabs.length === 0) return;

  const initialActiveTab = document.querySelector(".lang-tab.active");
  if (initialActiveTab) {
    loadLanguageDoc(initialActiveTab.dataset.tag);
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      loadLanguageDoc(tab.dataset.tag);
    });
  });
}

/* ---------------- INITIALIZATION & EVENT LISTENERS ---------------- */

if (DOM.task.form) {
  DOM.task.form.addEventListener("submit", addTask);
  renderTasks();
}

if (DOM.search.form) {
  DOM.search.form.addEventListener("submit", (e) => {
    e.preventDefault();
    searchQuery();
  });
  DOM.search.input.addEventListener("input", debounce(searchQuery, 500));
}

if (DOM.notes.form) {
  DOM.notes.form.addEventListener("submit", addNote);
  renderNotes();
}

initMathSystem();
initProgrammingSystem();