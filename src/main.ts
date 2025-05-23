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

  private generateId(): string {
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

// User Repository Class
class UserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId mapping

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
  private tasks: Map<string, Task> = new Map();
  private userTaskIndex: Map<string, Set<string>> = new Map(); // userId -> Set of taskIds

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

  private addToUserIndex(userId: string, taskId: string): void {
    if (!this.userTaskIndex.has(userId)) {
      this.userTaskIndex.set(userId, new Set());
    }
    this.userTaskIndex.get(userId)!.add(taskId);
  }

  private removeFromUserIndex(userId: string, taskId: string): void {
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
  private userRepository: UserRepository;
  private taskRepository: TaskRepository;

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

// UI Manager Class
class UIManager {
  private managementSystem: UserTaskManagementSystem;
  private currentEditingUser: User | null = null;
  private currentEditingTask: Task | null = null;
  private confirmCallback: (() => void) | null = null;

  constructor() {
    this.managementSystem = new UserTaskManagementSystem();
    this.initializeEventListeners();
  
    this.render();
  }

  private initializeEventListeners(): void {
    // Tab switching
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('tab-button')) {
        this.switchTab(target.dataset.tab!);
      }
    });

    // Add User button
    const addUserBtn = document.getElementById('addUserBtn');
    addUserBtn?.addEventListener('click', () => this.showUserModal());

    // Add Task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    addTaskBtn?.addEventListener('click', () => this.showTaskModal());

    // Modal close buttons
    document.getElementById('closeUserModal')?.addEventListener('click', () => this.hideUserModal());
    document.getElementById('closeTaskModal')?.addEventListener('click', () => this.hideTaskModal());
    document.getElementById('closeConfirmModal')?.addEventListener('click', () => this.hideConfirmModal());

    // Cancel buttons
    document.getElementById('cancelUserBtn')?.addEventListener('click', () => this.hideUserModal());
    document.getElementById('cancelTaskBtn')?.addEventListener('click', () => this.hideTaskModal());
    document.getElementById('cancelConfirmBtn')?.addEventListener('click', () => this.hideConfirmModal());

    // Form submissions
    document.getElementById('userForm')?.addEventListener('submit', (e) => this.handleUserFormSubmit(e));
    document.getElementById('taskForm')?.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));

    // Confirm action
    document.getElementById('confirmActionBtn')?.addEventListener('click', () => this.handleConfirmAction());

    // Filters
    document.getElementById('statusFilter')?.addEventListener('change', () => this.renderTasks());
    document.getElementById('priorityFilter')?.addEventListener('change', () => this.renderTasks());
    document.getElementById('assigneeFilter')?.addEventListener('change', () => this.renderTasks());

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('modal')) {
        if (target.id === 'userModal') this.hideUserModal();
        if (target.id === 'taskModal') this.hideTaskModal();
        if (target.id === 'confirmModal') this.hideConfirmModal();
      }
    });
  }

  private switchTab(tabName: string): void {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`)?.classList.add('active');

    // Render content if switching to tasks tab
    if (tabName === 'tasks') {
      this.renderTasks();
    }
  }

  private showUserModal(user?: User): void {
    this.currentEditingUser = user || null;
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm') as HTMLFormElement;
    
    if (user) {
      title!.textContent = 'Edit User';
      (document.getElementById('userName') as HTMLInputElement).value = user.name;
      (document.getElementById('userEmail') as HTMLInputElement).value = user.email;
      (document.getElementById('userRole') as HTMLInputElement).value = user.role;
    } else {
      title!.textContent = 'Add User';
      form.reset();
    }

    modal?.classList.add('show');
  }

  private hideUserModal(): void {
    document.getElementById('userModal')?.classList.remove('show');
    this.currentEditingUser = null;
  }

  private showTaskModal(task?: Task): void {
    this.currentEditingTask = task || null;
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('taskModalTitle');
    const form = document.getElementById('taskForm') as HTMLFormElement;
    
    // Populate assignee dropdown
    this.populateAssigneeDropdown();

    if (task) {
      title!.textContent = 'Edit Task';
      (document.getElementById('taskTitle') as HTMLInputElement).value = task.title;
      (document.getElementById('taskDescription') as HTMLTextAreaElement).value = task.description;
      (document.getElementById('taskPriority') as HTMLSelectElement).value = task.priority;
      (document.getElementById('taskDueDate') as HTMLInputElement).value = 
        task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
      (document.getElementById('taskAssignee') as HTMLSelectElement).value = task.assignedUserId || '';
    } else {
      title!.textContent = 'Add Task';
      form.reset();
      (document.getElementById('taskPriority') as HTMLSelectElement).value = TaskPriority.MEDIUM;
    }

    modal?.classList.add('show');
  }

  private hideTaskModal(): void {
    document.getElementById('taskModal')?.classList.remove('show');
    this.currentEditingTask = null;
  }

  private showConfirmModal(message: string, callback: () => void): void {
    document.getElementById('confirmMessage')!.textContent = message;
    this.confirmCallback = callback;
    document.getElementById('confirmModal')?.classList.add('show');
  }

  private hideConfirmModal(): void {
    document.getElementById('confirmModal')?.classList.remove('show');
    this.confirmCallback = null;
  }

  private populateAssigneeDropdown(): void {
    const dropdown = document.getElementById('taskAssignee') as HTMLSelectElement;
    const users = this.managementSystem.getAllUsers();
    
    // Clear existing options (except "Unassigned")
    dropdown.innerHTML = '<option value="">Unassigned</option>';
    
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      dropdown.appendChild(option);
    });

    // Also update filter dropdown
    const filterDropdown = document.getElementById('assigneeFilter') as HTMLSelectElement;
    const currentValue = filterDropdown.value;
    filterDropdown.innerHTML = '<option value="">All Assignees</option><option value="unassigned">Unassigned</option>';
    
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = user.name;
      filterDropdown.appendChild(option);
    });
    
    filterDropdown.value = currentValue;
  }

  private handleUserFormSubmit(e: Event): void {
    e.preventDefault();
    
    const name = (document.getElementById('userName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('userEmail') as HTMLInputElement).value.trim();
    const role = (document.getElementById('userRole') as HTMLInputElement).value.trim() || 'user';

    try {
      if (this.currentEditingUser) {
        // Update existing user
        this.managementSystem.updateUser(this.currentEditingUser.id, { name, role });
      } else {
        // Create new user
        this.managementSystem.createUser(name, email, role);
      }
      
      this.hideUserModal();
      this.render();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  private handleTaskFormSubmit(e: Event): void {
    e.preventDefault();
    
    const title = (document.getElementById('taskTitle') as HTMLInputElement).value.trim();
    const description = (document.getElementById('taskDescription') as HTMLTextAreaElement).value.trim();
    const priority = (document.getElementById('taskPriority') as HTMLSelectElement).value as TaskPriority;
    const dueDateValue = (document.getElementById('taskDueDate') as HTMLInputElement).value;
    const assigneeId = (document.getElementById('taskAssignee') as HTMLSelectElement).value;
    
    const dueDate = dueDateValue ? new Date(dueDateValue) : undefined;

    try {
      if (this.currentEditingTask) {
        // Update existing task
        this.managementSystem.updateTask(this.currentEditingTask.id, {
          title,
          description,
          priority,
          dueDate
        });
        
        // Handle assignment change
        if (assigneeId && assigneeId !== this.currentEditingTask.assignedUserId) {
          this.managementSystem.assignTaskToUser(this.currentEditingTask.id, assigneeId);
        } else if (!assigneeId && this.currentEditingTask.assignedUserId) {
          this.managementSystem.unassignTask(this.currentEditingTask.id);
        }
      } else {
        // Create new task
        const task = this.managementSystem.createTask(title, description, priority, dueDate);
        if (assigneeId) {
          this.managementSystem.assignTaskToUser(task.id, assigneeId);
        }
      }
      
      this.hideTaskModal();
      this.render();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  private handleConfirmAction(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.hideConfirmModal();
  }

  private deleteUser(userId: string): void {
    this.showConfirmModal('Are you sure you want to delete this user? All assigned tasks will be unassigned.', () => {
      try {
        this.managementSystem.deleteUser(userId);
        this.render();
      } catch (error: any) {
        alert('Error: ' + error.message);
      }
    });
  }

  private deleteTask(taskId: string): void {
    this.showConfirmModal('Are you sure you want to delete this task?', () => {
      try {
        this.managementSystem.deleteTask(taskId);
        this.render();
      } catch (error: any) {
        alert('Error: ' + error.message);
      }
    });
  }

  private toggleTaskStatus(taskId: string): void {
    try {
      const task = this.managementSystem.getTaskById(taskId);
      let newStatus: TaskStatus;
      
      switch (task.status) {
        case TaskStatus.PENDING:
          newStatus = TaskStatus.IN_PROGRESS;
          break;
        case TaskStatus.IN_PROGRESS:
          newStatus = TaskStatus.COMPLETED;
          break;
        case TaskStatus.COMPLETED:
          newStatus = TaskStatus.PENDING;
          break;
        default:
          newStatus = TaskStatus.PENDING;
      }
      
      this.managementSystem.updateTask(taskId, { status: newStatus });
      this.render();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  private render(): void {
    this.renderStats();
    this.renderUsers();
    this.renderTasks();
    this.populateAssigneeDropdown();
  }

  private renderStats(): void {
    const stats = this.managementSystem.getSystemStats();
    
    document.getElementById('totalUsers')!.textContent = stats.totalUsers.toString();
    document.getElementById('totalTasks')!.textContent = stats.totalTasks.toString();
    document.getElementById('assignedTasks')!.textContent = stats.assignedTasks.toString();
  }

  private renderUsers(): void {
    const usersGrid = document.getElementById('usersGrid')!;
    const users = this.managementSystem.getAllUsers();
    
    if (users.length === 0) {
      usersGrid.innerHTML = `
        <div class="empty-state">
          <h3>No users found</h3>
          <p>Click "Add User" to create your first user.</p>
        </div>
      `;
      return;
    }

    usersGrid.innerHTML = users.map(user => `
      <div class="user-card fade-in">
        <h3>${this.escapeHtml(user.name)}</h3>
        <div class="user-email">${this.escapeHtml(user.email)}</div>
        <div class="user-role">${this.escapeHtml(user.role)}</div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" onclick="uiManager.showUserModal(uiManager.managementSystem.getUserById('${user.id}'))">
            Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="uiManager.deleteUser('${user.id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  private renderTasks(): void {
    const tasksGrid = document.getElementById('tasksGrid')!;
    let tasks = this.managementSystem.getAllTasks();
    
    // Apply filters
    const statusFilter = (document.getElementById('statusFilter') as HTMLSelectElement).value;
    const priorityFilter = (document.getElementById('priorityFilter') as HTMLSelectElement).value;
    const assigneeFilter = (document.getElementById('assigneeFilter') as HTMLSelectElement).value;

    if (statusFilter) {
      tasks = tasks.filter(task => task.status === statusFilter);
    }
    
    if (priorityFilter) {
      tasks = tasks.filter(task => task.priority === priorityFilter);
    }
    
    if (assigneeFilter === 'unassigned') {
      tasks = tasks.filter(task => !task.assignedUserId);
    } else if (assigneeFilter) {
      tasks = tasks.filter(task => task.assignedUserId === assigneeFilter);
    }

    if (tasks.length === 0) {
      tasksGrid.innerHTML = `
        <div class="empty-state">
          <h3>No tasks found</h3>
          <p>Click "Add Task" to create your first task or adjust your filters.</p>
        </div>
      `;
      return;
    }

    tasksGrid.innerHTML = tasks.map(task => {
      const assignedUser = task.assignedUserId ? 
        this.managementSystem.getAllUsers().find(u => u.id === task.assignedUserId) : null;
      
      return `
        <div class="task-card fade-in">
          <h3>${this.escapeHtml(task.title)}</h3>
          <div class="task-description">${this.escapeHtml(task.description)}</div>
          <div class="task-meta">
            <span class="status-badge ${task.status}">${this.formatStatus(task.status)}</span>
            <span class="priority-badge ${task.priority}">${this.formatPriority(task.priority)}</span>
          </div>
          ${task.assignedUserId ? 
            `<div class="task-assignee">Assigned to: ${this.escapeHtml(assignedUser?.name || 'Unknown User')}</div>` : 
            '<div class="task-assignee">Unassigned</div>'
          }
          ${task.dueDate ? 
            `<div class="task-due-date">Due: ${task.dueDate.toLocaleDateString()}</div>` : 
            ''
          }
          <div class="card-actions">
            <button class="btn btn-sm btn-secondary" onclick="uiManager.toggleTaskStatus('${task.id}')">
              ${this.getStatusButtonText(task.status)}
            </button>
            <button class="btn btn-sm btn-secondary" onclick="uiManager.showTaskModal(uiManager.managementSystem.getTaskById('${task.id}'))">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="uiManager.deleteTask('${task.id}')">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private formatStatus(status: TaskStatus): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatPriority(priority: TaskPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  private getStatusButtonText(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.PENDING: return 'Start';
      case TaskStatus.IN_PROGRESS: return 'Complete';
      case TaskStatus.COMPLETED: return 'Reopen';
      default: return 'Update';
    }
  }
}

// Initialize the application
let uiManager: UIManager;

document.addEventListener('DOMContentLoaded', () => {
  uiManager = new UIManager();
});

// Make uiManager globally accessible for onclick handlers
// (window as any).uiManager = uiManager;