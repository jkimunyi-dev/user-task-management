import { ITask, TaskStatus, TaskPriority } from "../interfaces/Interfaces";

// Task Entity Class
class Task implements ITask {
  public id: string;
  public title: string;
  public description: string;
  public status: TaskStatus;
  public priority: TaskPriority;
  public assignedUserId?: string;
  public dueDate?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    title: string,
    description: string,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate?: Date
  ) {
    this.id = this.generateId();
    this.title = title;
    this.description = description;
    this.status = TaskStatus.PENDING;
    this.priority = priority;
    this.dueDate = dueDate;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  private generateId(): string {
    return 'task_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  public updateTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date();
  }

  public updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  public updateStatus(status: TaskStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public updatePriority(priority: TaskPriority): void {
    this.priority = priority;
    this.updatedAt = new Date();
  }

  public updateDueDate(dueDate: Date | undefined): void {
    this.dueDate = dueDate;
    this.updatedAt = new Date();
  }

  public assignToUser(userId: string): void {
    this.assignedUserId = userId;
    this.updatedAt = new Date();
  }

  public unassign(): void {
    this.assignedUserId = undefined;
    this.updatedAt = new Date();
  }

  public toJSON(): ITask {
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

export default Task;