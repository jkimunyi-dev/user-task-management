"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class UserRepository {
    constructor() {
        this.users = new Map();
        this.emailIndex = new Map(); // email -> userId mapping
    }
    create(name, email, role) {
        if (this.emailIndex.has(email)) {
            throw new Error('User with email already exists');
        }
        const user = new __1.User(name, email, role);
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
exports.default = UserRepository;
