import { searchWikipedia } from "./api.js";

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const results = document.getElementById("results");
const loading = document.getElementById("loading");

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

    const deleteBtn = li.querySelector(".delete-btn");

    const completeBtn = li.querySelector(".complete-btn");

    completeBtn.addEventListener("click", () => {
      toggleTask(index);
    });

    deleteBtn.addEventListener("click", () => {
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
  localStorage.setItem("tasks", JSON.stringify(tasks));

  input.value = "";
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;

  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTasks();
}

async function handleSearch(e) {
  e.preventDefault();

  const query = searchInput.value.trim();
  if (!query) return;

  loading.textContent = "Loading...";
  results.innerHTML = "";

  try {
    const data = await searchWikipedia(query);

    const article = document.createElement("article");

    article.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.extract}</p>
    `;

    results.appendChild(article);

  } catch (error) {
    results.innerHTML = "<p>Topic not found.</p>";
  }

  loading.textContent = "";
}

if (form && input && list) {
  form.addEventListener("submit", addTask);
  renderTasks();
}

if (searchForm) {
  searchForm.addEventListener("submit", handleSearch);
}