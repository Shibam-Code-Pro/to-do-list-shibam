// ===============================================
// TO-DO LIST APP - BEGINNER FRIENDLY VERSION
// ===============================================
// This app lets users add, edit, delete, and filter tasks
// All data is saved in the browser's localStorage

// Main app object that contains all our functions and data
class TodoApp {
  constructor() {
    // Array to store all our tasks
    this.todos = [];
    
    // Which filter is currently active (all, active, or completed)
    this.currentFilter = 'all';
    
    // ID of the task being edited (null when not editing)
    this.editingTodoId = null;
    
    // Get references to all HTML elements we need
    this.elements = {
      addForm: document.getElementById('addTodoForm'),           // Form to add new tasks
      todoInput: document.getElementById('todoInput'),           // Input field for new tasks
      todoList: document.getElementById('todoList'),             // List where tasks appear
      emptyState: document.getElementById('emptyState'),         // Message when no tasks
      filterButtons: document.querySelectorAll('.filter-btn'),  // All/Active/Completed buttons
      todoCount: document.getElementById('todoCount'),           // Task counter text
      editModal: document.getElementById('editModal'),           // Pop-up for editing
      editForm: document.getElementById('editTodoForm'),         // Form inside edit pop-up
      editInput: document.getElementById('editTodoInput'),       // Input field in edit pop-up
      closeModal: document.getElementById('closeModal'),         // X button to close pop-up
      cancelEdit: document.getElementById('cancelEdit')          // Cancel button in pop-up
    };
    
    // Start the app
    this.init();
  }
  
  // ===============================================
  // INITIALIZE THE APP
  // ===============================================
  init() {
    this.loadTodos();        // Load saved tasks from browser storage
    this.bindEvents();       // Set up all button clicks and form submissions
    this.render();           // Display the tasks on screen
    
    // Put cursor in input field so user can start typing immediately
    this.elements.todoInput.focus();
  }
  
  // ===============================================
  // SET UP ALL EVENT LISTENERS (Button Clicks, etc.)
  // ===============================================
  bindEvents() {
    // When user submits the "add task" form
    this.elements.addForm.addEventListener('submit', (e) => {
      e.preventDefault();    // Don't refresh the page
      this.addTodo();        // Add the new task
    });
    
    // When user clicks filter buttons (All, Active, Completed)
    this.elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);  // Change which tasks are shown
      });
    });
    
    // When user submits the edit form in the pop-up
    this.elements.editForm.addEventListener('submit', (e) => {
      e.preventDefault();    // Don't refresh the page
      this.saveEdit();       // Save the edited task
    });
    
    // When user clicks the X button to close edit pop-up
    this.elements.closeModal.addEventListener('click', () => {
      this.closeEditModal();
    });
    
    // When user clicks Cancel button in edit pop-up
    this.elements.cancelEdit.addEventListener('click', () => {
      this.closeEditModal();
    });
    
    // When user clicks outside the edit pop-up (on the dark background)
    this.elements.editModal.addEventListener('click', (e) => {
      if (e.target === this.elements.editModal) {
        this.closeEditModal();
      }
    });
    
    // When user presses Escape key, close the edit pop-up
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.editModal.classList.contains('show')) {
        this.closeEditModal();
      }
    });
  }
  
  // ===============================================
  // ADD A NEW TASK
  // ===============================================
  addTodo() {
    // Get the text from the input field and remove extra spaces
    const text = this.elements.todoInput.value.trim();
    
    // If input is empty, don't add anything
    if (!text) return;
    
    // Create a new task object
    const todo = {
      id: Date.now().toString(),        // Unique ID using current time
      text: text,                       // The task text
      completed: false,                 // New tasks start as not completed
      createdAt: new Date().toISOString() // When it was created
    };
    
    // Add new task to the beginning of the list (newest first)
    this.todos.unshift(todo);
    
    // Clear the input field
    this.elements.todoInput.value = '';
    
    // Save to browser storage and update the display
    this.saveTodos();
    this.render();
    
    // Put cursor back in input field for adding more tasks
    this.elements.todoInput.focus();
  }
  
  // ===============================================
  // MARK TASK AS COMPLETE/INCOMPLETE
  // ===============================================
  toggleTodo(id) {
    // Find the task with this ID
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      // Switch between completed and not completed
      todo.completed = !todo.completed;
      
      // Save changes and update display
      this.saveTodos();
      this.render();
    }
  }
  
  // ===============================================
  // DELETE A TASK
  // ===============================================
  deleteTodo(id) {
    // Ask user to confirm before deleting
    if (confirm('Are you sure you want to delete this task?')) {
      // Remove the task from our list
      this.todos = this.todos.filter(t => t.id !== id);
      
      // Save changes and update display
      this.saveTodos();
      this.render();
    }
  }
  
  // ===============================================
  // OPEN EDIT POP-UP FOR A TASK
  // ===============================================
  editTodo(id) {
    // Find the task with this ID
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      // Remember which task we're editing
      this.editingTodoId = id;
      
      // Put the current task text in the edit input
      this.elements.editInput.value = todo.text;
      
      // Show the edit pop-up
      this.elements.editModal.classList.add('show');
      
      // Focus on the input and select all text for easy editing
      setTimeout(() => {
        this.elements.editInput.focus();
        this.elements.editInput.select();
      }, 100);
    }
  }
  
  // ===============================================
  // SAVE THE EDITED TASK
  // ===============================================
  saveEdit() {
    // Get the new text and remove extra spaces
    const newText = this.elements.editInput.value.trim();
    
    // If input is empty, don't save
    if (!newText) return;
    
    // Find the task we're editing and update its text
    const todo = this.todos.find(t => t.id === this.editingTodoId);
    if (todo) {
      todo.text = newText;
      
      // Save changes, update display, and close pop-up
      this.saveTodos();
      this.render();
      this.closeEditModal();
    }
  }
  
  // ===============================================
  // CLOSE THE EDIT POP-UP
  // ===============================================
  closeEditModal() {
    // Hide the pop-up
    this.elements.editModal.classList.remove('show');
    
    // Clear the editing state
    this.editingTodoId = null;
    this.elements.editInput.value = '';
  }
  
  // ===============================================
  // CHANGE WHICH TASKS ARE SHOWN (All/Active/Completed)
  // ===============================================
  setFilter(filter) {
    // Remember which filter is active
    this.currentFilter = filter;
    
    // Update button appearance - make clicked button look active
    this.elements.filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    // Update the display to show filtered tasks
    this.render();
  }
  
  // ===============================================
  // GET TASKS BASED ON CURRENT FILTER
  // ===============================================
  getFilteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(todo => !todo.completed);    // Only incomplete tasks
      case 'completed':
        return this.todos.filter(todo => todo.completed);     // Only completed tasks
      default:
        return this.todos;                                    // All tasks
    }
  }
  
  // ===============================================
  // UPDATE THE DISPLAY (Show tasks on screen)
  // ===============================================
  render() {
    // Get tasks based on current filter (All/Active/Completed)
    const filteredTodos = this.getFilteredTodos();
    
    // Clear the current task list
    this.elements.todoList.innerHTML = '';
    
    // If no tasks to show, display "No tasks yet" message
    if (filteredTodos.length === 0) {
      this.elements.emptyState.classList.add('show');
    } else {
      // Hide the "No tasks yet" message
      this.elements.emptyState.classList.remove('show');
      
      // Create and display each task
      filteredTodos.forEach(todo => {
        const todoElement = this.createTodoElement(todo);
        this.elements.todoList.appendChild(todoElement);
      });
    }
    
    // Update the task counter (e.g., "3 tasks remaining")
    this.updateTodoCount();
  }
  
  // ===============================================
  // CREATE HTML FOR ONE TASK
  // ===============================================
  createTodoElement(todo) {
    // Create a list item element
    const li = document.createElement('li');
    
    // Add CSS classes (completed tasks get extra styling)
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    
    // Create the HTML content for this task
    li.innerHTML = `
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${todo.completed ? 'checked' : ''}
        onchange="app.toggleTodo('${todo.id}')"
      >
      <span class="todo-text">${this.escapeHtml(todo.text)}</span>
      <div class="todo-actions">
        <button class="action-btn edit-btn" onclick="app.editTodo('${todo.id}')" title="Edit task">
          ✏️
        </button>
        <button class="action-btn delete-btn" onclick="app.deleteTodo('${todo.id}')" title="Delete task">
          🗑️
        </button>
      </div>
    `;
    
    return li;
  }
  
  // ===============================================
  // UPDATE TASK COUNTER (e.g., "3 tasks remaining")
  // ===============================================
  updateTodoCount() {
    // Count how many tasks are not completed
    const activeTodos = this.todos.filter(todo => !todo.completed);
    const count = activeTodos.length;
    
    // Use correct grammar (1 task vs 2 tasks)
    const text = count === 1 ? 'task remaining' : 'tasks remaining';
    
    // Update the counter text on screen
    this.elements.todoCount.textContent = `${count} ${text}`;
  }
  
  // ===============================================
  // MAKE TEXT SAFE FOR HTML (Prevent security issues)
  // ===============================================
  escapeHtml(text) {
    // This prevents malicious code from being inserted into tasks
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // ===============================================
  // SAVE TASKS TO BROWSER STORAGE
  // ===============================================
  saveTodos() {
    try {
      // Convert our tasks to text and save in browser
      localStorage.setItem('modernTodos', JSON.stringify(this.todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  }
  
  // ===============================================
  // LOAD SAVED TASKS FROM BROWSER STORAGE
  // ===============================================
  loadTodos() {
    try {
      // Get saved tasks from browser
      const saved = localStorage.getItem('modernTodos');
      if (saved) {
        // Convert text back to task objects
        this.todos = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
      this.todos = [];  // Start with empty list if loading fails
    }
  }
}

// ===============================================
// START THE APP WHEN PAGE LOADS
// ===============================================
// Wait for the HTML to fully load, then create our app
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TodoApp();
});

// This line is for advanced users who want to test the code
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TodoApp;
}
