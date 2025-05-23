"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Interfaces_1 = require("../interfaces/Interfaces");
// Task Entity Class
class Task {
    constructor(title, description, priority = Interfaces_1.TaskPriority.MEDIUM, dueDate) {
        this.id = this.generateId();
        this.title = title;
        this.description = description;
        this.status = Interfaces_1.TaskStatus.PENDING;
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
exports.default = Task;
