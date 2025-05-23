import { IUser, ITask, TaskStatus, TaskPriority } from "./interfaces/Interfaces";
import UserTaskManagementSystem from "./management/UserTaskManagement";

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