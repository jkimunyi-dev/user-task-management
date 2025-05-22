class UserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId mapping

  public create(name: string, email: string, role?: string): User {
    if (this.emailIndex.has(email)) {
      throw new DuplicateEmailError(email);
    }

    const user = new User(name, email, role);
    this.users.set(user.id, user);
    this.emailIndex.set(email, user.id);
    return user;
  }

  public findById(id: string): User {
    const user = this.users.get(id);
    if (!user) {
      throw new UserNotFoundError(id);
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