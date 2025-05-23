"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TaskRepository_1 = __importDefault(require("../task/TaskRepository"));
const UserRepository_1 = __importDefault(require("../user/UserRepository"));
class UserTaskManagementSystem {
    constructor() {
        this.userRepository = new UserRepository_1.default();
        this.taskRepository = new TaskRepository_1.default();
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
exports.default = UserTaskManagementSystem;
