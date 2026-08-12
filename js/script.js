// SELECT HTML ELEMENTS
const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const dueDate = document.getElementById("due-date");
const priority = document.getElementById("priority");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll("[data-filter]");
const sortTasks = document.getElementById("sort-tasks");

// TASK ARRAY
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// FILTER AND SORT VALUES
let currentFilter = "all";
let currentSort = "default";

// EDIT VALUE
let editingTaskIndex = null;

// SAVE TASKS
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// UPDATE PROGRESS
function updateProgress() {
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(function(task) {
        return task.completed;
    }).length;

    let percentage = 0;
    if (totalTasks > 0) {
        percentage = Math.round((completedTasks / totalTasks) * 100);
    }

    progressFill.style.width = percentage + "%";
    progressText.textContent =
        completedTasks +
        " of " +
        totalTasks +
        " completed (" +
        percentage +
        "%)";
}

// DISPLAY TASKS
function displayTasks() {
    taskList.innerHTML = "";
    updateProgress();
    let tasksToDisplay = [...tasks];

    // FILTER TASKS
    if (currentFilter === "pending") {
        tasksToDisplay = tasksToDisplay.filter(function(task) {
            return task.completed === false;
        });

    }

    if (currentFilter === "completed") {
        tasksToDisplay = tasksToDisplay.filter(function(task) {
            return task.completed === true;
        });

    }

    // SORT BY DATE
    if (currentSort === "date") {
        tasksToDisplay.sort(function(a, b) {
            return new Date(a.date) - new Date(b.date);
        });

    }

    // SORT BY PRIORITY
    if (currentSort === "priority") {
        const priorityOrder = {
            high: 1,
            medium: 2,
            low: 3
        };
        tasksToDisplay.sort(function(a, b) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

    }

    // NO TASKS
    if (tasksToDisplay.length === 0) {
        taskList.innerHTML = "<p>No tasks to display.</p>";
        return;
    }

    // DISPLAY EACH TASK
    tasksToDisplay.forEach(function(task) {
        const originalIndex = tasks.indexOf(task);
        const taskCard = document.createElement("div");

        taskCard.classList.add("task-card");
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>Due Date: ${task.date}</p>
            <p>Priority: ${task.priority}</p>
            <p>Status: ${task.completed ? "Completed" : "Pending"}</p>
            <button onclick="toggleTask(${originalIndex})">
                ${task.completed ? "Mark Pending" : "Complete"}
            </button>
            <button onclick="editTask(${originalIndex})">
                Edit
            </button>
            <button onclick="deleteTask(${originalIndex})">
                Delete
            </button>
        `;
        taskList.appendChild(taskCard);
    });
}

// ADD OR UPDATE TASK
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    // IF WE ARE EDITING A TASK
    if (editingTaskIndex !== null) {

        tasks[editingTaskIndex].title = taskTitle.value;
        tasks[editingTaskIndex].date = dueDate.value;
        tasks[editingTaskIndex].priority = priority.value;
        editingTaskIndex = null;
        taskForm.querySelector("button[type='submit']").textContent = "Add Task";

    } else {
        // CREATE NEW TASK
        const newTask = {
            title: taskTitle.value,
            date: dueDate.value,
            priority: priority.value,
            completed: false
        };
        tasks.push(newTask);
    }

    saveTasks();
    displayTasks();
    displayCalendar();
    taskForm.reset();
});

// EDIT TASK
function editTask(index) {
    editingTaskIndex = index;

    taskTitle.value = tasks[index].title;
    dueDate.value = tasks[index].date;
    priority.value = tasks[index].priority;
    taskForm.querySelector("button[type='submit']").textContent = "Update Task";
    document.getElementById("dashboard").scrollIntoView({
        behavior: "smooth"
    });
}

// COMPLETE / PENDING TASK
function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    displayTasks();
    displayCalendar();
}

// DELETE TASK
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    displayTasks();
    displayCalendar();
}

// FILTER BUTTONS
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;
        displayTasks();
    });
});

// SORT TASKS
sortTasks.addEventListener("change", function() {
    currentSort = sortTasks.value;
    displayTasks();
});

// CALENDAR
const calendarGrid = document.getElementById("calendar-grid");
const calendarMonth = document.getElementById("calendar-month");
const previousMonthButton = document.getElementById("previous-month");
const nextMonthButton = document.getElementById("next-month");
let currentDate = new Date();

// DISPLAY CALENDAR
function displayCalendar() {

    calendarGrid.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    calendarMonth.textContent = monthNames[month] + " " + year;
    const weekDays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    weekDays.forEach(function(day) {
        const dayName = document.createElement("div");
        dayName.classList.add("calendar-day-name");
        dayName.textContent = day;
        calendarGrid.appendChild(dayName);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement("div");
        emptyDay.classList.add("calendar-day", "empty-day");
        calendarGrid.appendChild(emptyDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const dayBox = document.createElement("div");
        dayBox.classList.add("calendar-day");

        const dayNumber = document.createElement("span");
        dayNumber.classList.add("day-number");
        dayNumber.textContent = day;
        dayBox.appendChild(dayNumber);

        tasks.forEach(function(task) {
            const taskDate = new Date(task.date + "T00:00:00");
            const taskYear = taskDate.getFullYear();
            const taskMonth = taskDate.getMonth();
            const taskDay = taskDate.getDate();

            if (
                taskYear === year &&
                taskMonth === month &&
                taskDay === day
            ) {

                const dot = document.createElement("span");
                dot.classList.add("task-dot");

                if (task.priority === "high") {
                    dot.classList.add("high-priority");
                }
                if (task.priority === "medium") {
                    dot.classList.add("medium-priority");
                }
                if (task.priority === "low") {
                    dot.classList.add("low-priority");
                }

                dayBox.appendChild(dot);
            }
        });

        calendarGrid.appendChild(dayBox);
    }
}

// PREVIOUS MONTH
previousMonthButton.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    displayCalendar();
});

// NEXT MONTH
nextMonthButton.addEventListener("click", function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    displayCalendar();
});

// DARK MODE
const themeButton = document.getElementById("theme-button");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeButton.textContent = "☾";
}

themeButton.addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        themeButton.textContent = "☾";
        localStorage.setItem("theme", "dark");

    } else {
        themeButton.textContent = "☀";
        localStorage.setItem("theme", "light");
    }
});

// START APP
displayTasks();
displayCalendar();