import { IUser } from "../interfaces/Interfaces";

// User Entity Class
class User implements IUser {
  public id: string;
  public name: string;
  public email: string;
  public role: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(name: string, email: string, role: string = 'user') {
    this.id = this.generateId();
    this.name = name;
    this.email = email;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  public updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }

  public updateRole(role: string): void {
    this.role = role;
    this.updatedAt = new Date();
  }

  public toJSON(): IUser {
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

export default User;