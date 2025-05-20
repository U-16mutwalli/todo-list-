const taskList = document.getElementById('taskList');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const feedback = document.getElementById('feedback');

const API_URL = 'https://jsonplaceholder.typicode.com/todos';
let localTasks = [];


function showMessage(msg, isError = false) {
  feedback.innerText = msg;
  feedback.style.color = isError ? 'red' : 'green';
  setTimeout(() => (feedback.innerText = ''), 3000);
}

async function loadTasks() {
  try {
    const res = await fetch(`${API_URL}?_limit=5`);
    if (!res.ok) throw new Error('Network response was not ok');
    const apiTasks = await res.json();

    taskList.innerHTML = '';

    const combinedTasks = [...apiTasks, ...localTasks];
    combinedTasks.forEach(showTask);
  } catch (err) {
    console.error('Failed to load tasks:', err);
    showMessage('❌ Failed to load tasks!', true);
  }
}

function showTask(task) {
  const li = document.createElement('li');
  li.className = task.completed ? 'completed' : '';
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => updateStatus(task.id, checkbox.checked));

  const info = document.createElement('span');
  info.innerText = `${task.title} — ${task.completed ? 'Completed' : 'Pending'}`;
  info.contentEditable = false;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => toggleEdit(info, task.id);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = () => removeTask(task.id);

  actions.append(editBtn, deleteBtn);
  li.append(checkbox, info, actions);
  taskList.appendChild(li);
}

taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  const newTask = {
    userId: 1,
    title,
    completed: false,
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(newTask),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to add task');
    const createdTask = await res.json();

    
    createdTask.id = Date.now();

    localTasks.push(createdTask);
    showTask(createdTask);

    taskInput.value = '';
    showMessage('✅ Task added successfully!');
  } catch (err) {
    console.error(err);
    showMessage('❌ Failed to add task.', true);
  }
});

async function updateStatus(id, isDone) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: isDone }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to update status');

   
    localTasks = localTasks.map(t => (t.id === id ? { ...t, completed: isDone } : t));

    
    const li = taskList.querySelector(`li[data-id="${id}"]`);
    if (li) {
      const span = li.querySelector('span');
      span.innerText = `${span.innerText.split('—')[0].trim()} — ${isDone ? 'Completed' : 'Pending'}`;
      li.classList.toggle('completed', isDone);
    }

    showMessage(`✅ Task marked as ${isDone ? 'completed' : 'pending'}`);
  } catch (err) {
    console.error(err);
    showMessage('❌ Failed to update status.', true);
  }
}


async function toggleEdit(span, id) {
  if (span.isContentEditable) {
    
    span.contentEditable = false;
    const updatedTitle = span.innerText.split('—')[0].trim();

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: updatedTitle }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to update title');

      localTasks = localTasks.map(t => (t.id === id ? { ...t, title: updatedTitle } : t));
      showMessage('✅ Task title updated!');
    } catch (err) {
      console.error(err);
      showMessage('❌ Failed to update title.', true);
    }
  } else {
    
    span.contentEditable = true;
    span.focus();
  }
}

async function removeTask(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');

   
    localTasks = localTasks.filter(t => t.id !== id);
    const li = taskList.querySelector(`li[data-id="${id}"]`);
    if (li) li.remove();

    showMessage('✅ Task deleted.');
  } catch (err) {
    console.error(err);
    showMessage('❌ Failed to delete task.', true);
  }
}

loadTasks();
