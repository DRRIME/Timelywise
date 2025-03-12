document.addEventListener("DOMContentLoaded", () => {
    console.log("Script running on:", window.location.pathname);

    const startButton = document.getElementById("startButton");
    if (startButton) {
        startButton.addEventListener("click", () => {
            window.location.href = "app.html";
        });
    }

    if (window.location.pathname.includes("app.html")) {
        console.log("Running Kanban script on app.html");

        const columnsContainer = document.getElementById("kanban-board");
        const addColumnButton = document.getElementById("addColumn");
        const toggleSidebarButton = document.getElementById('toggleSidebar');  // Get the toggle sidebar button

        let columns = JSON.parse(localStorage.getItem("columns")) || [
            { id: "todo", title: "To Do" },
            { id: "in-progress", title: "In Progress" },
            { id: "done", title: "Done" }
        ];
        let tasks = JSON.parse(localStorage.getItem("tasks")) || { todo: [], "in-progress": [], done: [] };

        let draggedTask = null;
        let draggedColumn = null;

        function loadColumns() {
            columnsContainer.innerHTML = "";
            columns.forEach(column => createColumnElement(column.id, column.title));
            loadTasks();
        }

        function createColumnElement(columnId, title) {
            const column = document.createElement("div");
            column.classList.add("column");
            column.setAttribute("id", columnId);

            const headerContainer = document.createElement("div");
            headerContainer.classList.add("header-container");

            const header = document.createElement("h2");
            header.textContent = title;
            header.style.userSelect = "none";

            const editIcon = document.createElement("span");
            editIcon.innerHTML = "&#9998;"; 
            editIcon.classList.add("edit-icon");
            editIcon.onclick = () => {
                const newTitle = prompt("Enter new column name:", title);
                if (newTitle) {
                    header.textContent = newTitle;
                    editIcon.innerHTML = "&#9998;";
                    columns = columns.map(col => (col.id === columnId ? { id: columnId, title: newTitle } : col));
                    localStorage.setItem("columns", JSON.stringify(columns));
                }
            };

            headerContainer.appendChild(header);
            headerContainer.appendChild(editIcon);

            const taskList = document.createElement("div");
            taskList.classList.add("task-list");

            const addTaskBtn = document.createElement("button");
            addTaskBtn.textContent = "+ Add Task";
            addTaskBtn.classList.add("add-task-btn");
            addTaskBtn.onclick = () => {
                const taskText = prompt("Enter new task:");
                if (taskText) {
                    tasks[columnId].push(taskText);
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                    createTaskElement(taskText, columnId);
                }
            };

            column.appendChild(headerContainer);
            column.appendChild(taskList);
            column.appendChild(addTaskBtn);
            columnsContainer.appendChild(column);

            if (!tasks[columnId]) {
                tasks[columnId] = [];
            }

            let pressTimer;
            function startPressTimer() {
                pressTimer = setTimeout(() => {
                    if (confirm(`Delete column "${title}"?`)) {
                        columns = columns.filter(c => c.id !== columnId);
                        delete tasks[columnId];
                        localStorage.setItem("columns", JSON.stringify(columns));
                        localStorage.setItem("tasks", JSON.stringify(tasks));
                        loadColumns();
                    }
                }, 1500);
            }

            function clearPressTimer() {
                clearTimeout(pressTimer);
            }

            column.addEventListener("mousedown", startPressTimer);
            column.addEventListener("mouseup", clearPressTimer);
            column.addEventListener("mouseleave", clearPressTimer);

            column.addEventListener("touchstart", startPressTimer);
            column.addEventListener("touchend", clearPressTimer);
            column.addEventListener("touchmove", clearPressTimer);

            taskList.addEventListener("dragover", (e) => e.preventDefault());
            taskList.addEventListener("drop", (e) => {
                e.preventDefault();
                if (!draggedTask) return;

                const newColumn = columnId;
                if (draggedColumn !== newColumn) {
                    tasks[draggedColumn] = tasks[draggedColumn].filter(t => t !== draggedTask.textContent.replace("✖", "").trim());
                    tasks[newColumn].push(draggedTask.textContent.replace("✖", "").trim());
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                    loadTasks();
                }
            });
        }

        function createTaskElement(text, columnId) {
            const taskList = document.querySelector(`#${columnId} .task-list`);
            if (!taskList) return;

            const taskItem = document.createElement("div");
            taskItem.classList.add("task");
            taskItem.textContent = text;
            taskItem.draggable = true;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "✖";
            deleteBtn.classList.add("delete-btn");
            deleteBtn.onclick = () => {
                tasks[columnId] = tasks[columnId].filter(t => t !== text);
                localStorage.setItem("tasks", JSON.stringify(tasks));
                taskItem.remove();
            };

            taskItem.appendChild(deleteBtn);
            taskList.appendChild(taskItem);

            taskItem.addEventListener("dragstart", (e) => {
                draggedTask = taskItem;
                draggedColumn = columnId;
                e.dataTransfer.setData("text", text);
                taskItem.classList.add("dragging");
            });

            taskItem.addEventListener("dragend", () => {
                taskItem.classList.remove("dragging");
                draggedTask = null;
                draggedColumn = null;
            });
        }

        function loadTasks() {
            columns.forEach(column => {
                const taskList = document.querySelector(`#${column.id} .task-list`);
                if (taskList) {
                    taskList.innerHTML = "";
                    tasks[column.id].forEach(taskText => createTaskElement(taskText, column.id));
                }
            });
        }

        addColumnButton.addEventListener("click", () => {
            const columnTitle = prompt("Enter column name:");
            if (columnTitle) {
                const columnId = columnTitle.toLowerCase().replace(/\s+/g, "-");
                columns.push({ id: columnId, title: columnTitle });
                tasks[columnId] = [];
                localStorage.setItem("columns", JSON.stringify(columns));
                localStorage.setItem("tasks", JSON.stringify(tasks));
                createColumnElement(columnId, columnTitle);
            }
        });

        // Add the toggle sidebar functionality here
        toggleSidebarButton.addEventListener("click", function () {
            document.getElementById('menu').classList.toggle('minimized');
        });

        loadColumns();
    }
});
