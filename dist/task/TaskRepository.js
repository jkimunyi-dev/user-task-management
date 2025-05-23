"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = __importDefault(require("./Task"));
class TaskRepository {
    constructor() {
        this.tasks = new Map();
        this.userTaskIndex = new Map(); // userId -> Set of taskIds
    }
    create(title, description, priority, dueDate) {
        const task = new Task_1.default(title, description, priority, dueDate);
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
exports.default = TaskRepository;
