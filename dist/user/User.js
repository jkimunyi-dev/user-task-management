"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = User;
