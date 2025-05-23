"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPriority = exports.TaskStatus = exports.Task = exports.User = exports.UserTaskManagementSystem = void 0;
// Enums and Interfaces
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (TaskStatus = {}));
exports.TaskStatus = TaskStatus;
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (TaskPriority = {}));
exports.TaskPriority = TaskPriority;
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
exports.User = User;
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
exports.Task = Task;
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
exports.UserTaskManagementSystem = UserTaskManagementSystem;
// Example Usage
console.log('=== User and Task Management System Demo ===\n');
const system = new UserTaskManagementSystem();
try {
    // Create users
    console.log('Creating users...');
    const user1 = system.createUser('John Doe', 'john@example.com', 'developer');
    const user2 = system.createUser('Jane Smith', 'jane@example.com', 'manager');
    const user3 = system.createUser('Bob Wilson', 'bob@example.com', 'designer');
    console.log(`Created users: ${user1.name}, ${user2.name}, ${user3.name}\n`);
    // Create tasks
    console.log('Creating tasks...');
    const task1 = system.createTask('Implement user authentication', 'Build login and registration system', TaskPriority.HIGH, new Date('2024-12-31'));
    const task2 = system.createTask('Design dashboard UI', 'Create mockups for the main dashboard', TaskPriority.MEDIUM, new Date('2024-12-15'));
    const task3 = system.createTask('Code review process', 'Review and approve pending pull requests', TaskPriority.URGENT);
    console.log(`Created tasks: ${task1.title}, ${task2.title}, ${task3.title}\n`);
    // Assign tasks to users
    console.log('Assigning tasks...');
    system.assignTaskToUser(task1.id, user1.id);
    system.assignTaskToUser(task2.id, user3.id);
    system.assignTaskToUser(task3.id, user2.id);
    console.log('Tasks assigned successfully\n');
    // Get user tasks
    console.log(`Tasks assigned to ${user1.name}:`);
    const johnTasks = system.getUserTasks(user1.id);
    johnTasks.forEach(task => {
        console.log(`- ${task.title} (${task.status}, ${task.priority})`);
    });
    console.log(`\nTasks assigned to ${user3.name}:`);
    const bobTasks = system.getUserTasks(user3.id);
    bobTasks.forEach(task => {
        console.log(`- ${task.title} (${task.status}, ${task.priority})`);
    });
    // Update task status
    console.log('\nUpdating task status...');
    system.updateTask(task1.id, { status: TaskStatus.IN_PROGRESS });
    system.updateTask(task2.id, { status: TaskStatus.COMPLETED });
    // Get system statistics
    console.log('\n=== System Statistics ===');
    const stats = system.getSystemStats();
    console.log(`Total Users: ${stats.totalUsers}`);
    console.log(`Total Tasks: ${stats.totalTasks}`);
    console.log(`Assigned Tasks: ${stats.assignedTasks}`);
    console.log(`Unassigned Tasks: ${stats.unassignedTasks}`);
    console.log('Tasks by Status:', stats.tasksByStatus);
    console.log('Tasks by Priority:', stats.tasksByPriority);
    // Demonstrate reassignment
    console.log('\n=== Task Reassignment Demo ===');
    console.log(`Reassigning "${task2.title}" from ${user3.name} to ${user1.name}`);
    system.reassignTask(task2.id, user1.id);
    const updatedJohnTasks = system.getUserTasks(user1.id);
    console.log(`\nUpdated tasks for ${user1.name}:`);
    updatedJohnTasks.forEach(task => {
        console.log(`- ${task.title} (${task.status}, ${task.priority})`);
    });
}
catch (error) {
    console.error('Error occurred:', error);
}
