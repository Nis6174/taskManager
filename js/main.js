// Clock display
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  document.getElementById('hour').textContent = h;
  const colons = document.querySelectorAll('#colon');
  for(let colon of colons) colon.style.visibility = (now.getSeconds() % 2 === 0) ? 'visible' : 'hidden';
  document.getElementById('minute').textContent = m;
  document.getElementById('second').textContent = s;
}
setInterval(updateClock, 1000);
updateClock();

// Task management logic
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const categoryTabs = document.getElementById('category-tabs');
const memoArea = document.getElementById('memo');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let memoText = localStorage.getItem('memoText') || '';
let currentCategory = 'all';

memoArea.value = memoText;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function saveMemo() {
  localStorage.setItem('memoText', memoArea.value);
}

function isOverdue(deadline) {
  const today = new Date();
  const d = new Date(deadline + 'T23:59:59');
  return d < today && !isSameDate(d, today);
}

// helper for same day
function isSameDate(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function renderTasks() {
  taskList.innerHTML = '';

  const filtered = tasks.filter(t => currentCategory === 'all' || t.category === currentCategory);

  filtered.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = 'task-item';
    if(task.completed) div.classList.add('completed');
    if(!task.completed && isOverdue(task.deadline)) div.classList.add('overdue');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.title = 'Mark task as completed';
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement('div');
    info.className = 'task-info';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.textContent = `Deadline: ${task.deadline} | Category: ${task.category}`;

    info.appendChild(title);
    info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.title = 'Delete task';
    delBtn.addEventListener('click', () => {
      if(confirm('Are you sure to delete this task?')) {
        tasks.splice(i, 1);
        saveTasks();
        renderTasks();
      }
    });
    actions.appendChild(delBtn);

    div.appendChild(checkbox);
    div.appendChild(info);
    div.appendChild(actions);

    taskList.appendChild(div);
  });
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const deadline = document.getElementById('task-deadline').value;
  const category = document.getElementById('task-category').value;
  if(!title || !deadline || !category) return;

  tasks.push({
    title,
    deadline,
    category,
    completed: false,
  });
  saveTasks();
  renderTasks();

  taskForm.reset();
  document.getElementById('task-category').selectedIndex = 0;
});

categoryTabs.addEventListener('click', e => {
  if(e.target.classList.contains('category-tab')){
    for(let tab of categoryTabs.children){
      tab.classList.remove('active');
    }
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    renderTasks();
  }
});

memoArea.addEventListener('input', () => {
  saveMemo();
});

renderTasks();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered with scope: ', registration.scope);
    })
    .catch(error => {
      console.log('Service Worker registration failed: ', error);
    });
}
