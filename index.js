import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";

import { initialData } from "./initialData.js";


function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData();

const elements = {
  filterDiv: document.getElementById("filterDiv"),


  boardsContainer: document.getElementById("boards-nav-links-div"),


  modalWindow: document.querySelector(".modal-window"),


  editTaskModal: document.querySelector(".edit-task-modal-window"),



  headerBoardName: document.getElementById("header-board-name"),



  sidebar: document.getElementById("side-bar-div"),



  hideSideBarBtn: document.querySelector(".hide-side-bar-div"),


  showSideBarBtn: document.getElementById("show-side-bar-btn"),


  themeSwitch: document.getElementById("switch"),


  createNewTaskBtn: document.getElementById("add-new-task-btn"),


  boardsNavLinksDiv: document.getElementById("boards-nav-links-div"),


  columnDivs: document.querySelectorAll(".column-div"),


  createTaskBtn: document.getElementById("create-task-btn")
  
  ,
  addTaskForm: document.getElementById("new-task-modal-window"),


  editTaskForm: document.getElementById("edit-task-form"),


  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),


  titleInput: document.getElementById("title-input"),


  descInput: document.getElementById("desc-input"),


  modalSelectStatus: document.getElementById("select-status"),


  editTaskTitleInput: document.getElementById("edit-task-title-input"),


  editTaskDescInput: document.getElementById("edit-task-desc-input"),


  editTaskSelectStatus: document.getElementById("edit-select-status"),


  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),


  cancelEditBtn: document.getElementById("cancel-edit-btn"),


  saveChangesBtn: document.getElementById("save-task-changes-btn"),

  
  deleteTaskBtn: document.getElementById("delete-task-btn"),
};

function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

let activeBoard = "";


function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}


function displayBoards(boards) {
  elements.boardsContainer.innerHTML = ""; 
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", function () {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; 
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    elements.boardsContainer.appendChild(boardElement);
  });
}


function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); 
  const filteredTasks = tasks.filter((task) => task.board === boardName);

 
  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
   
    column.innerHTML = `<div class="column-head-div">
    <span class="dot" id="${status}-dot"></span>
    <h4 class="columnHeader">${status.toUpperCase()}</h4>
    </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });
        tasksContainer.appendChild(taskElement);
      });
  });
}


function openEditTaskModal(task) {
 
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  elements.editTaskSelectStatus.value = task.status;

  elements.saveChangesBtn.onclick = function () {
    saveTaskChanges(task.id);
  };
 
  elements.deleteTaskBtn.onclick = function () {
    
    const confirmation = window.confirm(
      "Are you sure you would like to delete this Task?"
    );
    if (confirmation) {
      deleteTask(task.id); 
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    }
  };
 
  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  
  const updatedTask = {
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editTaskSelectStatus.value,
  };
  
  patchTask(taskId, updatedTask);
  
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

function setupEventListeners() {
  
  elements.cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  
  elements.cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; 
  });

 
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; 
  });
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));



  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));


  elements.themeSwitch.addEventListener("change", toggleTheme);


  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; 
  });

  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

function addTask(event) {
  event.preventDefault();
  
  const task = {
    title: elements.titleInput.value,
    description: elements.descInput.value,
    status: elements.modalSelectStatus.value,
    board: activeBoard,
  };
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; 
    event.target.reset(); 
    refreshTasksUI();
  }
}

function addTaskToUI(task) {
  
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title;
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}


function toggleSidebar(show) {
  if (show) {
    elements.sidebar.style.display = "flex";
    elements.showSideBarBtn.style.display = "none";
    elements.hideSideBarBtn.style.display = "flex";
  } else {
    elements.sidebar.style.display = "none";
    elements.showSideBarBtn.style.display = "block";
    elements.hideSideBarBtn.style.display = "none";
  }
}


function toggleTheme() {
  const themeLogo = document.getElementById("logo");
  if (elements.themeSwitch.checked) {
    document.body.classList.add("light-theme");
    document.body.classList.remove("dark-theme");
    themeLogo.src = "./assets/logo-light.svg";
  } else {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    themeLogo.src = "./assets/logo-dark.svg";
  }
}


document.addEventListener("DOMContentLoaded", function () {
  init(); 
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); 
}




