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

form.addEventListener("submit", addTask);

renderTasks();
