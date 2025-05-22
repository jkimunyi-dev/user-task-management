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
}