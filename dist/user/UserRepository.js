"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
class UserRepository {
    constructor() {
        this.users = new Map();
        this.emailIndex = new Map(); // email -> userId mapping
    }
    create(name, email, role) {
        if (this.emailIndex.has(email)) {
            throw new Error('User with this email already exists');
        }
        const user = new User_1.default(name, email, role);
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
