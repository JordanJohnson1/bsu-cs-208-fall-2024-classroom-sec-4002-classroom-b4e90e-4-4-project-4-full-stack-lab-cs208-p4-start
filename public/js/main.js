
document.addEventListener('DOMContentLoaded', () => {
    const addForm = document.querySelector('form[action="/add"]');
    const todoList = document.querySelector('ul');

    // handle adding a new task with AJAX
    addForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const todoInput = addForm.querySelector('input[name="todo"]');
        const task = todoInput.value.trim();

    if (task) {
    try {
        // send request to add the new task
        const response = await fetch('/add', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest' 
            },
            body: new URLSearchParams({ todo: task })
        });

        if (response.ok) {
            const newTask = await response.json(); // get the new task from the response
            appendTaskToList(newTask); // add the new task to the DOM
            todoInput.value = ''; // clear the input field
        } else {
            console.error('Failed to add task');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    }
    });

    // handle deleting a task with AJAX
    todoList.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.textContent === 'Delete') {
        const taskId = event.target.parentNode.querySelector('input[name="id"]').value;

    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ id: taskId })
        });

        if (response.ok) {
            event.target.closest('li').remove(); 
        } else {
            console.error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    }
    });

// function to add a new task to the DOM
function appendTaskToList(task) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        ${task.task}
        <form action="/delete" method="post" style="display:inline; margin-left: 10px;">
            <input type="hidden" name="id" value="${task.id}">
            <button type="submit">Delete</button>
        </form>
    `;
    todoList.appendChild(listItem);
    }
});