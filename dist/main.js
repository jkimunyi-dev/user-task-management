"use strict";
// Enums and Interfaces
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (TaskPriority = {}));
// User Entity Class
class User {
    constructor(name, email, role = 'user') {
        this.id = this.generateId();
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    generateId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    updateName(name) {
        this.name = name;
        this.updatedAt = new Date();
    }
    updateRole(role) {
        this.role = role;
        this.updatedAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
// Task Entity Class
class Task {
    constructor(title, description, priority = TaskPriority.MEDIUM, dueDate) {
        this.id = this.generateId();
        this.title = title;
        this.description = description;
        this.status = TaskStatus.PENDING;
        this.priority = priority;
        this.dueDate = dueDate;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    generateId() {
        return 'task_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    updateTitle(title) {
        this.title = title;
        this.updatedAt = new Date();
    }
    updateDescription(description) {
        this.description = description;
        this.updatedAt = new Date();
    }
    updateStatus(status) {
        this.status = status;
        this.updatedAt = new Date();
    }
    updatePriority(priority) {
        this.priority = priority;
        this.updatedAt = new Date();
    }
    updateDueDate(dueDate) {
        this.dueDate = dueDate;
        this.updatedAt = new Date();
    }
    assignToUser(userId) {
        this.assignedUserId = userId;
        this.updatedAt = new Date();
    }
    unassign() {
        this.assignedUserId = undefined;
        this.updatedAt = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            assignedUserId: this.assignedUserId,
            dueDate: this.dueDate,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}
// User Repository Class
class UserRepository {
    constructor() {
        this.users = new Map();
        this.emailIndex = new Map(); // email -> userId mapping
    }
    create(name, email, role) {
        if (this.emailIndex.has(email)) {
            throw new Error('User with email already exists');
        }
        const user = new User(name, email, role);
        this.users.set(user.id, user);
        this.emailIndex.set(email, user.id);
        return user;
    }
    findById(id) {
        const user = this.users.get(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    findByEmail(email) {
        const userId = this.emailIndex.get(email);
        return userId ? this.users.get(userId) || null : null;
    }
    findAll() {
        return Array.from(this.users.values());
    }
    update(id, updates) {
        const user = this.findById(id);
        if (updates.name) {
            user.updateName(updates.name);
        }
        if (updates.role) {
            user.updateRole(updates.role);
        }
        return user;
    }
    delete(id) {
        const user = this.findById(id);
        this.emailIndex.delete(user.email);
        return this.users.delete(id);
    }
    exists(id) {
        return this.users.has(id);
    }
}
// Task Repository Class
class TaskRepository {
    constructor() {
        this.tasks = new Map();
        this.userTaskIndex = new Map(); // userId -> Set of taskIds
    }
    create(title, description, priority, dueDate) {
        const task = new Task(title, description, priority, dueDate);
        this.tasks.set(task.id, task);
        return task;
    }
    findById(id) {
        const task = this.tasks.get(id);
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    }
    findAll() {
        return Array.from(this.tasks.values());
    }
    findByUserId(userId) {
        const taskIds = this.userTaskIndex.get(userId) || new Set();
        return Array.from(taskIds)
            .map(taskId => this.tasks.get(taskId))
            .filter((task) => task !== undefined);
    }
    findByStatus(status) {
        return this.findAll().filter(task => task.status === status);
    }
    findByPriority(priority) {
        return this.findAll().filter(task => task.priority === priority);
    }
    update(id, updates) {
        const task = this.findById(id);
        if (updates.title)
            task.updateTitle(updates.title);
        if (updates.description)
            task.updateDescription(updates.description);
        if (updates.status)
            task.updateStatus(updates.status);
        if (updates.priority)
            task.updatePriority(updates.priority);
        if (updates.dueDate !== undefined)
            task.updateDueDate(updates.dueDate);
        return task;
    }
    delete(id) {
        const task = this.findById(id);
        // Remove from user index if assigned
        if (task.assignedUserId) {
            this.removeFromUserIndex(task.assignedUserId, id);
        }
        return this.tasks.delete(id);
    }
    assignTaskToUser(taskId, userId) {
        const task = this.findById(taskId);
        // Remove from previous user's index if reassigning
        if (task.assignedUserId) {
            this.removeFromUserIndex(task.assignedUserId, taskId);
        }
        // Assign to new user
        task.assignToUser(userId);
        this.addToUserIndex(userId, taskId);
    }
    unassignTask(taskId) {
        const task = this.findById(taskId);
        if (task.assignedUserId) {
            this.removeFromUserIndex(task.assignedUserId, taskId);
            task.unassign();
        }
    }
    addToUserIndex(userId, taskId) {
        if (!this.userTaskIndex.has(userId)) {
            this.userTaskIndex.set(userId, new Set());
        }
        this.userTaskIndex.get(userId).add(taskId);
    }
    removeFromUserIndex(userId, taskId) {
        const userTasks = this.userTaskIndex.get(userId);
        if (userTasks) {
            userTasks.delete(taskId);
            if (userTasks.size === 0) {
                this.userTaskIndex.delete(userId);
            }
        }
    }
    exists(id) {
        return this.tasks.has(id);
    }
}
// Main Management System Class
class UserTaskManagementSystem {
    constructor() {
        this.userRepository = new UserRepository();
        this.taskRepository = new TaskRepository();
    }
    // User Management Methods
    createUser(name, email, role) {
        return this.userRepository.create(name, email, role);
    }
    getUserById(id) {
        return this.userRepository.findById(id);
    }
    getUserByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    getAllUsers() {
        return this.userRepository.findAll();
    }
    updateUser(id, updates) {
        return this.userRepository.update(id, updates);
    }
    deleteUser(id) {
        // First, unassign all tasks from this user
        const userTasks = this.taskRepository.findByUserId(id);
        userTasks.forEach(task => {
            this.taskRepository.unassignTask(task.id);
        });
        return this.userRepository.delete(id);
    }
    // Task Management Methods
    createTask(title, description, priority, dueDate) {
        return this.taskRepository.create(title, description, priority, dueDate);
    }
    getTaskById(id) {
        return this.taskRepository.findById(id);
    }
    getAllTasks() {
        return this.taskRepository.findAll();
    }
    getTasksByStatus(status) {
        return this.taskRepository.findByStatus(status);
    }
    getTasksByPriority(priority) {
        return this.taskRepository.findByPriority(priority);
    }
    updateTask(id, updates) {
        return this.taskRepository.update(id, updates);
    }
    deleteTask(id) {
        return this.taskRepository.delete(id);
    }
    // Task Assignment Methods
    assignTaskToUser(taskId, userId) {
        // Validate that both user and task exist
        this.userRepository.findById(userId); // Throws if not found
        this.taskRepository.findById(taskId); // Throws if not found
        this.taskRepository.assignTaskToUser(taskId, userId);
    }
    unassignTask(taskId) {
        this.taskRepository.unassignTask(taskId);
    }
    getUserTasks(userId) {
        // Validate that user exists
        this.userRepository.findById(userId); // Throws if not found
        return this.taskRepository.findByUserId(userId);
    }
    reassignTask(taskId, newUserId) {
        // Validate that both user and task exist
        this.userRepository.findById(newUserId); // Throws if not found
        this.taskRepository.findById(taskId); // Throws if not found
        this.taskRepository.assignTaskToUser(taskId, newUserId);
    }
    // Utility Methods
    getSystemStats() {
        const allTasks = this.getAllTasks();
        const tasksByStatus = allTasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});
        const tasksByPriority = allTasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
        const assignedTasks = allTasks.filter(task => task.assignedUserId).length;
        return {
            totalUsers: this.getAllUsers().length,
            totalTasks: allTasks.length,
            tasksByStatus,
            tasksByPriority,
            assignedTasks,
            unassignedTasks: allTasks.length - assignedTasks
        };
    }
}
// UI Manager Class
class UIManager {
    constructor() {
        this.currentEditingUser = null;
        this.currentEditingTask = null;
        this.confirmCallback = null;
        this.managementSystem = new UserTaskManagementSystem();
        this.initializeEventListeners();
        this.render();
    }
    initializeEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('tab-button')) {
                this.switchTab(target.dataset.tab);
            }
        });
        // Add User button
        const addUserBtn = document.getElementById('addUserBtn');
        addUserBtn?.addEventListener('click', () => this.showUserModal());
        // Add Task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        addTaskBtn?.addEventListener('click', () => this.showTaskModal());
        // Modal close buttons
        document.getElementById('closeUserModal')?.addEventListener('click', () => this.hideUserModal());
        document.getElementById('closeTaskModal')?.addEventListener('click', () => this.hideTaskModal());
        document.getElementById('closeConfirmModal')?.addEventListener('click', () => this.hideConfirmModal());
        // Cancel buttons
        document.getElementById('cancelUserBtn')?.addEventListener('click', () => this.hideUserModal());
        document.getElementById('cancelTaskBtn')?.addEventListener('click', () => this.hideTaskModal());
        document.getElementById('cancelConfirmBtn')?.addEventListener('click', () => this.hideConfirmModal());
        // Form submissions
        document.getElementById('userForm')?.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
        document.getElementById('taskForm')?.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));
        // Confirm action
        document.getElementById('confirmActionBtn')?.addEventListener('click', () => this.handleConfirmAction());
        // Filters
        document.getElementById('statusFilter')?.addEventListener('change', () => this.renderTasks());
        document.getElementById('priorityFilter')?.addEventListener('change', () => this.renderTasks());
        document.getElementById('assigneeFilter')?.addEventListener('change', () => this.renderTasks());
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('modal')) {
                if (target.id === 'userModal')
                    this.hideUserModal();
                if (target.id === 'taskModal')
                    this.hideTaskModal();
                if (target.id === 'confirmModal')
                    this.hideConfirmModal();
            }
        });
    }
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
        // Render content if switching to tasks tab
        if (tabName === 'tasks') {
            this.renderTasks();
        }
    }
    showUserModal(user) {
        this.currentEditingUser = user || null;
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');
        if (user) {
            title.textContent = 'Edit User';
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
        }
        else {
            title.textContent = 'Add User';
            form.reset();
        }
        modal?.classList.add('show');
    }
    hideUserModal() {
        document.getElementById('userModal')?.classList.remove('show');
        this.currentEditingUser = null;
    }
    showTaskModal(task) {
        this.currentEditingTask = task || null;
        const modal = document.getElementById('taskModal');
        const title = document.getElementById('taskModalTitle');
        const form = document.getElementById('taskForm');
        // Populate assignee dropdown
        this.populateAssigneeDropdown();
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value =
                task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
            document.getElementById('taskAssignee').value = task.assignedUserId || '';
        }
        else {
            title.textContent = 'Add Task';
            form.reset();
            document.getElementById('taskPriority').value = TaskPriority.MEDIUM;
        }
        modal?.classList.add('show');
    }
    hideTaskModal() {
        document.getElementById('taskModal')?.classList.remove('show');
        this.currentEditingTask = null;
    }
    showConfirmModal(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        this.confirmCallback = callback;
        document.getElementById('confirmModal')?.classList.add('show');
    }
    hideConfirmModal() {
        document.getElementById('confirmModal')?.classList.remove('show');
        this.confirmCallback = null;
    }
    populateAssigneeDropdown() {
        const dropdown = document.getElementById('taskAssignee');
        const users = this.managementSystem.getAllUsers();
        // Clear existing options (except "Unassigned")
        dropdown.innerHTML = '<option value="">Unassigned</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            dropdown.appendChild(option);
        });
        // Also update filter dropdown
        const filterDropdown = document.getElementById('assigneeFilter');
        const currentValue = filterDropdown.value;
        filterDropdown.innerHTML = '<option value="">All Assignees</option><option value="unassigned">Unassigned</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            filterDropdown.appendChild(option);
        });
        filterDropdown.value = currentValue;
    }
    handleUserFormSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const role = document.getElementById('userRole').value.trim() || 'user';
        try {
            if (this.currentEditingUser) {
                // Update existing user
                this.managementSystem.updateUser(this.currentEditingUser.id, { name, role });
            }
            else {
                // Create new user
                this.managementSystem.createUser(name, email, role);
            }
            this.hideUserModal();
            this.render();
        }
        catch (error) {
            alert('Error: ' + error.message);
        }
    }
    handleTaskFormSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const dueDateValue = document.getElementById('taskDueDate').value;
        const assigneeId = document.getElementById('taskAssignee').value;
        const dueDate = dueDateValue ? new Date(dueDateValue) : undefined;
        try {
            if (this.currentEditingTask) {
                // Update existing task
                this.managementSystem.updateTask(this.currentEditingTask.id, {
                    title,
                    description,
                    priority,
                    dueDate
                });
                // Handle assignment change
                if (assigneeId && assigneeId !== this.currentEditingTask.assignedUserId) {
                    this.managementSystem.assignTaskToUser(this.currentEditingTask.id, assigneeId);
                }
                else if (!assigneeId && this.currentEditingTask.assignedUserId) {
                    this.managementSystem.unassignTask(this.currentEditingTask.id);
                }
            }
            else {
                // Create new task
                const task = this.managementSystem.createTask(title, description, priority, dueDate);
                if (assigneeId) {
                    this.managementSystem.assignTaskToUser(task.id, assigneeId);
                }
            }
            this.hideTaskModal();
            this.render();
        }
        catch (error) {
            alert('Error: ' + error.message);
        }
    }
    handleConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirmModal();
    }
    deleteUser(userId) {
        this.showConfirmModal('Are you sure you want to delete this user? All assigned tasks will be unassigned.', () => {
            try {
                this.managementSystem.deleteUser(userId);
                this.render();
            }
            catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
    deleteTask(taskId) {
        this.showConfirmModal('Are you sure you want to delete this task?', () => {
            try {
                this.managementSystem.deleteTask(taskId);
                this.render();
            }
            catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
    toggleTaskStatus(taskId) {
        try {
            const task = this.managementSystem.getTaskById(taskId);
            let newStatus;
            switch (task.status) {
                case TaskStatus.PENDING:
                    newStatus = TaskStatus.IN_PROGRESS;
                    break;
                case TaskStatus.IN_PROGRESS:
                    newStatus = TaskStatus.COMPLETED;
                    break;
                case TaskStatus.COMPLETED:
                    newStatus = TaskStatus.PENDING;
                    break;
                default:
                    newStatus = TaskStatus.PENDING;
            }
            this.managementSystem.updateTask(taskId, { status: newStatus });
            this.render();
        }
        catch (error) {
            alert('Error: ' + error.message);
        }
    }
    render() {
        this.renderStats();
        this.renderUsers();
        this.renderTasks();
        this.populateAssigneeDropdown();
    }
    renderStats() {
        const stats = this.managementSystem.getSystemStats();
        document.getElementById('totalUsers').textContent = stats.totalUsers.toString();
        document.getElementById('totalTasks').textContent = stats.totalTasks.toString();
        document.getElementById('assignedTasks').textContent = stats.assignedTasks.toString();
    }
    renderUsers() {
        const usersGrid = document.getElementById('usersGrid');
        const users = this.managementSystem.getAllUsers();
        if (users.length === 0) {
            usersGrid.innerHTML = `
        <div class="empty-state">
          <h3>No users found</h3>
          <p>Click "Add User" to create your first user.</p>
        </div>
      `;
            return;
        }
        usersGrid.innerHTML = users.map(user => `
      <div class="user-card fade-in">
        <h3>${this.escapeHtml(user.name)}</h3>
        <div class="user-email">${this.escapeHtml(user.email)}</div>
        <div class="user-role">${this.escapeHtml(user.role)}</div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" onclick="uiManager.showUserModal(uiManager.managementSystem.getUserById('${user.id}'))">
            Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="uiManager.deleteUser('${user.id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
    }
    renderTasks() {
        const tasksGrid = document.getElementById('tasksGrid');
        let tasks = this.managementSystem.getAllTasks();
        // Apply filters
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const assigneeFilter = document.getElementById('assigneeFilter').value;
        if (statusFilter) {
            tasks = tasks.filter(task => task.status === statusFilter);
        }
        if (priorityFilter) {
            tasks = tasks.filter(task => task.priority === priorityFilter);
        }
        if (assigneeFilter === 'unassigned') {
            tasks = tasks.filter(task => !task.assignedUserId);
        }
        else if (assigneeFilter) {
            tasks = tasks.filter(task => task.assignedUserId === assigneeFilter);
        }
        if (tasks.length === 0) {
            tasksGrid.innerHTML = `
        <div class="empty-state">
          <h3>No tasks found</h3>
          <p>Click "Add Task" to create your first task or adjust your filters.</p>
        </div>
      `;
            return;
        }
        tasksGrid.innerHTML = tasks.map(task => {
            const assignedUser = task.assignedUserId ?
                this.managementSystem.getAllUsers().find(u => u.id === task.assignedUserId) : null;
            return `
        <div class="task-card fade-in">
          <h3>${this.escapeHtml(task.title)}</h3>
          <div class="task-description">${this.escapeHtml(task.description)}</div>
          <div class="task-meta">
            <span class="status-badge ${task.status}">${this.formatStatus(task.status)}</span>
            <span class="priority-badge ${task.priority}">${this.formatPriority(task.priority)}</span>
          </div>
          ${task.assignedUserId ?
                `<div class="task-assignee">Assigned to: ${this.escapeHtml(assignedUser?.name || 'Unknown User')}</div>` :
                '<div class="task-assignee">Unassigned</div>'}
          ${task.dueDate ?
                `<div class="task-due-date">Due: ${task.dueDate.toLocaleDateString()}</div>` :
                ''}
          <div class="card-actions">
            <button class="btn btn-sm btn-secondary" onclick="uiManager.toggleTaskStatus('${task.id}')">
              ${this.getStatusButtonText(task.status)}
            </button>
            <button class="btn btn-sm btn-secondary" onclick="uiManager.showTaskModal(uiManager.managementSystem.getTaskById('${task.id}'))">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="uiManager.deleteTask('${task.id}')">
              Delete
            </button>
          </div>
        </div>
      `;
        }).join('');
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    formatStatus(status) {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    formatPriority(priority) {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
    getStatusButtonText(status) {
        switch (status) {
            case TaskStatus.PENDING: return 'Start';
            case TaskStatus.IN_PROGRESS: return 'Complete';
            case TaskStatus.COMPLETED: return 'Reopen';
            default: return 'Update';
        }
    }
}
// Initialize the application
let uiManager;
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
});
// Make uiManager globally accessible for onclick handlers
// (window as any).uiManager = uiManager;
