// DOM elements
const taskInput = document.getElementById('taskInput');
const taskDate = document.getElementById('taskDate');
const taskCategory = document.getElementById('taskCategory');
const taskPriority = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const searchTask = document.getElementById('searchTask');
const themeSwitch = document.getElementById('themeSwitch');
const sortPriorityBtn = document.getElementById('sortPriorityBtn');
const sortDateBtn = document.getElementById('sortDateBtn');
const calendarViewBtn = document.getElementById('calendarViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const calendarDiv = document.getElementById('calendar');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let isCalendarView = false;

renderTasks();

// Add Task
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text: text,
    date: taskDate.value,
    category: taskCategory.value,
    priority: taskPriority.value,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskDate.value = '';
});

// Render Tasks
function renderTasks() {
  if (isCalendarView) {
    renderCalendar();
    return;
  }

  calendarDiv.style.display = 'none';
  taskList.style.display = 'block';
  taskList.innerHTML = '';

  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
      <span>${task.text} (${task.category}, ${task.priority}) ${task.date ? '- ' + task.date : ''}</span>
      <div class="task-actions">
        <button class="complete">${task.completed ? 'Undo' : 'Done'}</button>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;

    li.querySelector('.complete').addEventListener('click', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    li.querySelector('.edit').addEventListener('click', () => {
      const newText = prompt('Edit task:', task.text);
      if (newText) {
        task.text = newText;
        saveTasks();
        renderTasks();
      }
    });

    li.querySelector('.delete').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Search tasks
searchTask.addEventListener('input', () => {
  const query = searchTask.value.toLowerCase();
  document.querySelectorAll('.task-item').forEach(item => {
    const text = item.querySelector('span').innerText.toLowerCase();
    item.style.display = text.includes(query) ? 'flex' : 'none';
  });
});

// Theme toggle
themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', themeSwitch.checked);
});

// Sort by priority
sortPriorityBtn.addEventListener('click', () => {
  const order = { High: 1, Medium: 2, Low: 3 };
  tasks.sort((a,b) => order[a.priority] - order[b.priority]);
  renderTasks();
});

// Sort by date
sortDateBtn.addEventListener('click', () => {
  tasks.sort((a,b) => new Date(a.date || 0) - new Date(b.date || 0));
  renderTasks();
});

// Calendar view
calendarViewBtn.addEventListener('click', () => {
  isCalendarView = true;
  renderTasks();
});

listViewBtn.addEventListener('click', () => {
  isCalendarView = false;
  renderTasks();
});

// Render calendar
function renderCalendar() {
  calendarDiv.style.display = 'block';
  taskList.style.display = 'none';
  calendarDiv.innerHTML = '';

  const grouped = {};
  tasks.forEach(task => {
    const date = task.date || 'No Date';
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(task);
  });

  for (const date in grouped) {
    const h3 = document.createElement('h3');
    h3.textContent = date;
    calendarDiv.appendChild(h3);

    grouped[date].forEach(task => {
      const p = document.createElement('p');
      p.textContent = `${task.text} (${task.category}, ${task.priority}) ${task.completed ? '[Done]' : ''}`;
      calendarDiv.appendChild(p);
    });
  }
}
taskList.innerHTML = '';
tasks.forEach((task, index) => {
  const li = document.createElement('li');
  li.className = 'task-item ' + task.priority.toLowerCase();
  if (task.completed) li.classList.add('completed');
  li.draggable = true; // Make draggable
  li.dataset.index = index;

  li.innerHTML = `
    <span>${task.text} (${task.category}, ${task.priority}) ${task.date ? '- ' + task.date : ''}</span>
    <div class="task-actions">
      <button class="complete">${task.completed ? 'Undo' : 'Done'}</button>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </div>
  `;

  // Drag events
  li.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', index);
  });

  li.addEventListener('dragover', (e) => {
    e.preventDefault();
    li.style.borderTop = '3px dashed #007bff';
  });

  li.addEventListener('dragleave', () => {
    li.style.borderTop = '';
  });

  li.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const droppedIndex = index;
    // Swap tasks
    const temp = tasks[draggedIndex];
    tasks.splice(draggedIndex, 1);
    tasks.splice(droppedIndex, 0, temp);
    saveTasks();
    renderTasks();
  });

  // Reset border after drag
  li.addEventListener('dragend', () => {
    document.querySelectorAll('.task-item').forEach(item => item.style.borderTop = '');
  });

  // Add actions (complete/edit/delete)
  li.querySelector('.complete').addEventListener('click', () => {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  });
  li.querySelector('.edit').addEventListener('click', () => {
    const newText = prompt('Edit task:', task.text);
    if (newText) {
      task.text = newText;
      saveTasks();
      renderTasks();
    }
  });
  li.querySelector('.delete').addEventListener('click', () => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  taskList.appendChild(li);
});
function checkReminders() {
  const today = new Date().toISOString().split('T')[0];
  tasks.forEach(task => {
    if (task.date === today && !task.notified) {
      alert(`Reminder: Task "${task.text}" is due today!`);
      task.notified = true; // Prevent multiple alerts
    }
  });
  saveTasks();
}

// Check reminders every minute
setInterval(checkReminders, 60000);
checkReminders(); // Check immediately on load
li.querySelector('.complete').addEventListener('click', () => {
  task.completed = !task.completed;
  if (task.completed) {
    // Add animation class before updating storage
    li.classList.add('completed');

    // Wait for animation to finish before re-rendering
    setTimeout(() => {
      saveTasks();
      renderTasks();
    }, 500); // match the CSS animation duration
  } else {
    saveTasks();
    renderTasks();
  }
});addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text: text,
    date: taskDate.value,
    category: taskCategory.value,
    priority: taskPriority.value,
    completed: false
  };

  tasks.push(task);
  saveTasks();

  // Render the task list
  renderTasks();

  // Add the "added" animation class to the last task
  const lastTask = taskList.lastChild;
  if (lastTask) lastTask.classList.add('added');

  // Clear inputs
  taskInput.value = '';
  taskDate.value = '';
});
