document.addEventListener('DOMContentLoaded', () => {
    const registerContainer = document.getElementById('register-container');
    const loginContainer = document.getElementById('login-container');
    const todoContainer = document.getElementById('todo-container');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const goToLoginBtn = document.getElementById('go-to-login-btn');
    const goToRegisterBtn = document.getElementById('go-to-register-btn');
    const changeThemeBtn = document.getElementById('change-theme-btn');

    const taskInput = document.getElementById('new-task');
    const taskPriorityInput = document.getElementById('task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const archivedList = document.getElementById('archived-list');

    const maxTasks = 10;
    let currentUser = null;
    let darkMode = false;

    registerBtn.addEventListener('click', registerUser);
    loginBtn.addEventListener('click', loginUser);
    logoutBtn.addEventListener('click', logoutUser);
    goToLoginBtn.addEventListener('click', () => toggleView('login'));
    goToRegisterBtn.addEventListener('click', () => toggleView('register'));
    addTaskBtn.addEventListener('click', addTask);
    taskList.addEventListener('click', handleTaskAction);
    archivedList.addEventListener('click', handleTaskAction);

    const checkUser = localStorage.getItem('userInfo');
    const savedInfo = JSON.parse(checkUser);
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};

    if (savedInfo?.username) {
        currentUser = savedInfo.username;
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'none';
        todoContainer.style.display = 'block';
        loadTasks();
    }

    function toggleView(view) {
        if (view === 'login') {
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'block';
        } else {
            registerContainer.style.display = 'block';
            loginContainer.style.display = 'none';
        }
    }

    function registerUser() {
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();
        if (username === '' || password === '') {
            alert('Please enter a username and password');
            return;
        }
        if (localStorage.getItem(username)) {
            alert('Username already exists');
            return;
        }
        const userInfo = {
            username,
            password
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        alert('Registration successful');
        toggleView('login');
    }

    function loginUser() {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || userInfo.password !== password) {
            alert('Invalid username or password');
            return;
        }
        currentUser = username;
        loginContainer.style.display = 'none';
        todoContainer.style.display = 'block';
        loadTasks();
    }

    function logoutUser() {
        currentUser = null;
        todoContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        taskList.innerHTML = '';
        archivedList.innerHTML = '';
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';
    }

    function saveTasks() {
        if (currentUser) {
            const tasks = {
                active: Array.from(taskList.children).map(item => item.innerHTML),
                archived: Array.from(archivedList.children).map(item => item.innerHTML)
            };
            localStorage.setItem('tasks', JSON.stringify({ [currentUser]: tasks }));
        }
    }

    function loadTasks() {
        if (currentUser) {
            const userTasks = JSON.parse(localStorage.getItem('tasks')) || {};
            if (userTasks[currentUser]) {
                taskList.innerHTML = userTasks[currentUser].active.map(html => `<li>${html}</li>`).join('');
                archivedList.innerHTML = userTasks[currentUser].archived.map(html => `<li>${html}</li>`).join('');
            }
        }
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const taskPriority = taskPriorityInput.value;

        if (taskText === '') {
            alert('Please enter a task');
            return;
        }

        if (taskList.children.length >= maxTasks) {
            alert('Task limit reached. Complete or delete tasks to add more.');
            return;
        }

        const listItem = document.createElement('li');

        const taskDetails = document.createElement('span');
        taskDetails.className = 'task-details';

        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = currentTime.toLocaleDateString();

        taskDetails.innerHTML = `<strong>${taskText}</strong><br><small>${formattedDate} ${formattedTime}</small><br><span class="priority-${taskPriority}">${taskPriority} priority</span>`;
        listItem.appendChild(taskDetails);

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttons';

        const archiveBtn = document.createElement('button');
        archiveBtn.textContent = 'Archive';
        archiveBtn.classList.add('archive-btn');
        buttonsDiv.appendChild(archiveBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        buttonsDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.style.backgroundColor = 'red';
        buttonsDiv.appendChild(deleteBtn);

        listItem.appendChild(buttonsDiv);
        taskList.appendChild(listItem);

        taskInput.value = '';
        taskPriorityInput.value = 'low';

        saveTasks();
    }

    function handleTaskAction(event) {
        const taskItem = event.target.closest('li');

        if (!taskItem) return;
        const taskDetails = taskItem.querySelector('.task-details');

        if (event.target.classList.contains('edit-btn')) {
            const taskTextElement = taskDetails.querySelector('strong');
            const taskText = taskTextElement.textContent;
            const newTaskText = prompt('Edit your task:', taskText);
            if (newTaskText) {
                taskTextElement.textContent = newTaskText;
                saveTasks();
            }
        }

        if (event.target.classList.contains('delete-btn')) {
            const confirmed = confirm('Do you want to delete this task?');
            if (confirmed) {
                taskItem.remove();
                saveTasks();
            }
        }

        if (event.target.classList.contains('archive-btn')) {
            taskItem.remove();
            archivedList.appendChild(taskItem);
            const buttonsDiv = taskItem.querySelector('.buttons');
            buttonsDiv.innerHTML = ''; // Remove existing buttons
            const restoreBtn = document.createElement('button');
            restoreBtn.textContent = 'Restore';
            restoreBtn.classList.add('restore-btn');
            buttonsDiv            .appendChild(restoreBtn);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            buttonsDiv.appendChild(editBtn);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.style.backgroundColor = 'red';
            buttonsDiv.appendChild(deleteBtn);
            saveTasks();
        }

        if (event.target.classList.contains('restore-btn')) {
            taskItem.remove();
            taskList.appendChild(taskItem);
            const buttonsDiv = taskItem.querySelector('.buttons');
            buttonsDiv.innerHTML = ''; // Remove existing buttons
            const archiveBtn = document.createElement('button');
            archiveBtn.textContent = 'Archive';
            archiveBtn.classList.add('archive-btn');
            buttonsDiv.appendChild(archiveBtn);
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            buttonsDiv.appendChild(editBtn);
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.style.backgroundColor = 'red';
            buttonsDiv.appendChild(deleteBtn);
            saveTasks();
        }
    }

    function changeTheme() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark', darkMode);
    }
});

