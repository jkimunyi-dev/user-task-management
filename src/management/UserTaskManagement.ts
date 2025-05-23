import TaskRepository from "../task/TaskRepository";
import UserRepository from "../user/UserRepository";

class UserTaskManagementSystem {
  public userRepository: UserRepository;
  public taskRepository: TaskRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.taskRepository = new TaskRepository();
  }

  // User Management Methods
  public createUser(name: string, email: string, role?: string): User {
    return this.userRepository.create(name, email, role);
  }

  public getUserById(id: string): User {
    return this.userRepository.findById(id);
  }

  public getUserByEmail(email: string): User | null {
    return this.userRepository.findByEmail(email);
  }

  public getAllUsers(): User[] {
    return this.userRepository.findAll();
  }

  public updateUser(id: string, updates: Partial<Pick<IUser, 'name' | 'role'>>): User {
    return this.userRepository.update(id, updates);
  }

  public deleteUser(id: string): boolean {
    // First, unassign all tasks from this user
    const userTasks = this.taskRepository.findByUserId(id);
    userTasks.forEach(task => {
      this.taskRepository.unassignTask(task.id);
    });

    return this.userRepository.delete(id);
  }

  // Task Management Methods
  public createTask(
    title: string,
    description: string,
    priority?: TaskPriority,
    dueDate?: Date
  ): Task {
    return this.taskRepository.create(title, description, priority, dueDate);
  }

  public getTaskById(id: string): Task {
    return this.taskRepository.findById(id);
  }

  public getAllTasks(): Task[] {
    return this.taskRepository.findAll();
  }

  public getTasksByStatus(status: TaskStatus): Task[] {
    return this.taskRepository.findByStatus(status);
  }

  public getTasksByPriority(priority: TaskPriority): Task[] {
    return this.taskRepository.findByPriority(priority);
  }

  public updateTask(
    id: string,
    updates: Partial<Pick<ITask, 'title' | 'description' | 'status' | 'priority' | 'dueDate'>>
  ): Task {
    return this.taskRepository.update(id, updates);
  }

  public deleteTask(id: string): boolean {
    return this.taskRepository.delete(id);
  }

  // Task Assignment Methods
  public assignTaskToUser(taskId: string, userId: string): void {
    // Validate that both user and task exist
    this.userRepository.findById(userId); // Throws if not found
    this.taskRepository.findById(taskId); // Throws if not found

    this.taskRepository.assignTaskToUser(taskId, userId);
  }

  public unassignTask(taskId: string): void {
    this.taskRepository.unassignTask(taskId);
  }

  public getUserTasks(userId: string): Task[] {
    // Validate that user exists
    this.userRepository.findById(userId); // Throws if not found
    
    return this.taskRepository.findByUserId(userId);
  }

  public reassignTask(taskId: string, newUserId: string): void {
    // Validate that both user and task exist
    this.userRepository.findById(newUserId); // Throws if not found
    this.taskRepository.findById(taskId); // Throws if not found

    this.taskRepository.assignTaskToUser(taskId, newUserId);
  }

  // Utility Methods
  public getSystemStats(): {
    totalUsers: number;
    totalTasks: number;
    tasksByStatus: Record<TaskStatus, number>;
    tasksByPriority: Record<TaskPriority, number>;
    assignedTasks: number;
    unassignedTasks: number;
  } {
    const allTasks = this.getAllTasks();
    const tasksByStatus = allTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>);

    const tasksByPriority = allTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>);

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

export default UserTaskManagementSystem;
