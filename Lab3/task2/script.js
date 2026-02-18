// Выбираем основные элементы для управл.
const taskInput = document.getElementById('new-task');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// Функция для добавления новой задачи
function addTask() {
    const taskValue = taskInput.value.trim();

    if (taskValue === '') {
        alert('Please enter a task!');
        return;
    }

    const li = document.createElement('li');
    
    const wrapper = document.createElement('div');
    wrapper.classList.add('task-wrapper');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const span = document.createElement('span');
    span.textContent = taskValue;
    span.classList.add('task-text');

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '&minus;'; 
    deleteBtn.classList.add('delete-btn');

    wrapper.appendChild(checkbox);
    wrapper.appendChild(span);
    li.appendChild(wrapper);
    li.appendChild(deleteBtn);

    // Событие выполнено
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            span.classList.add('done');
        } else {
            span.classList.remove('done');
        }
    });

    // Удаляем задачу
    deleteBtn.addEventListener('click', function() {
        todoList.removeChild(li);
    });

    // Добавляем элемент в список
    todoList.appendChild(li);

    // Очищаем поле ввода
    taskInput.value = '';
}

addButton.addEventListener('click', addTask);
// Альтернатива
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});