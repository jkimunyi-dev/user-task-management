// Enums and Interfaces
enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedUserId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
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

  public generateId(): string {
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

// User Repository Class
class UserRepository {
  public users: Map<string, User> = new Map();
  public emailIndex: Map<string, string> = new Map(); // email -> userId mapping

  public create(name: string, email: string, role?: string): User {
    if (this.emailIndex.has(email)) {
      throw new Error('User with email already exists');
    }

    const user = new User(name, email, role);
    this.users.set(user.id, user);
    this.emailIndex.set(email, user.id);
    return user;
  }

  public findById(id: string): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  public findByEmail(email: string): User | null {
    const userId = this.emailIndex.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  public findAll(): User[] {
    return Array.from(this.users.values());
  }

  public update(id: string, updates: Partial<Pick<IUser, 'name' | 'role'>>): User {
    const user = this.findById(id);
    
    if (updates.name) {
      user.updateName(updates.name);
    }
    if (updates.role) {
      user.updateRole(updates.role);
    }

    return user;
  }

  public delete(id: string): boolean {
    const user = this.findById(id);
    this.emailIndex.delete(user.email);
    return this.users.delete(id);
  }

  public exists(id: string): boolean {
    return this.users.has(id);
  }
}

// Task Repository Class
class TaskRepository {
  public tasks: Map<string, Task> = new Map();
  public userTaskIndex: Map<string, Set<string>> = new Map(); // userId -> Set of taskIds

  public create(
    title: string,
    description: string,
    priority?: TaskPriority,
    dueDate?: Date
  ): Task {
    const task = new Task(title, description, priority, dueDate);
    this.tasks.set(task.id, task);
    return task;
  }

  public findById(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  public findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  public findByUserId(userId: string): Task[] {
    const taskIds = this.userTaskIndex.get(userId) || new Set();
    return Array.from(taskIds)
      .map(taskId => this.tasks.get(taskId))
      .filter((task): task is Task => task !== undefined);
  }

  public findByStatus(status: TaskStatus): Task[] {
    return this.findAll().filter(task => task.status === status);
  }

  public findByPriority(priority: TaskPriority): Task[] {
    return this.findAll().filter(task => task.priority === priority);
  }

  public update(
    id: string,
    updates: Partial<Pick<ITask, 'title' | 'description' | 'status' | 'priority' | 'dueDate'>>
  ): Task {
    const task = this.findById(id);

    if (updates.title) task.updateTitle(updates.title);
    if (updates.description) task.updateDescription(updates.description);
    if (updates.status) task.updateStatus(updates.status);
    if (updates.priority) task.updatePriority(updates.priority);
    if (updates.dueDate !== undefined) task.updateDueDate(updates.dueDate);

    return task;
  }

  public delete(id: string): boolean {
    const task = this.findById(id);
    
    // Remove from user index if assigned
    if (task.assignedUserId) {
      this.removeFromUserIndex(task.assignedUserId, id);
    }

    return this.tasks.delete(id);
  }

  public assignTaskToUser(taskId: string, userId: string): void {
    const task = this.findById(taskId);
    
    // Remove from previous user's index if reassigning
    if (task.assignedUserId) {
      this.removeFromUserIndex(task.assignedUserId, taskId);
    }

    // Assign to new user
    task.assignToUser(userId);
    this.addToUserIndex(userId, taskId);
  }

  public unassignTask(taskId: string): void {
    const task = this.findById(taskId);
    
    if (task.assignedUserId) {
      this.removeFromUserIndex(task.assignedUserId, taskId);
      task.unassign();
    }
  }

  public addToUserIndex(userId: string, taskId: string): void {
    if (!this.userTaskIndex.has(userId)) {
      this.userTaskIndex.set(userId, new Set());
    }
    this.userTaskIndex.get(userId)!.add(taskId);
  }

  public removeFromUserIndex(userId: string, taskId: string): void {
    const userTasks = this.userTaskIndex.get(userId);
    if (userTasks) {
      userTasks.delete(taskId);
      if (userTasks.size === 0) {
        this.userTaskIndex.delete(userId);
      }
    }
  }

  public exists(id: string): boolean {
    return this.tasks.has(id);
  }
}

// Main Management System Class
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

// Export classes and types
export {
  UserTaskManagementSystem,
  User,
  Task,
  TaskStatus,
  TaskPriority,

  type IUser,
  type ITask
};

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
  const task1 = system.createTask(
    'Implement user authentication',
    'Build login and registration system',
    TaskPriority.HIGH,
    new Date('2024-12-31')
  );
  
  const task2 = system.createTask(
    'Design dashboard UI',
    'Create mockups for the main dashboard',
    TaskPriority.MEDIUM,
    new Date('2024-12-15')
  );
  
  const task3 = system.createTask(
    'Code review process',
    'Review and approve pending pull requests',
    TaskPriority.URGENT
  );

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

} catch (error) {
  console.error('Error occurred:', error);
}