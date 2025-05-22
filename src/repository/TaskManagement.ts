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
      throw new TaskNotFoundError(id);
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
