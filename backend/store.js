// In-memory storage for tasks, organized by channel
const boards = new Map(); // channelId -> tasks[]

// Get all tasks for a channel
function getTasks(channelId) {
  if (!boards.has(channelId)) {
    // Initialize with demo data for new channels
    boards.set(channelId, [
      {
        id: '1',
        title: 'Setup Teams integration',
        description: 'Configure the Microsoft Teams SDK and test the app loading',
        column: 'done',
        channelId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Build Kanban UI',
        description: 'Create the drag-and-drop Kanban board interface',
        column: 'in-progress',
        channelId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Add backend API',
        description: 'Implement Express server for task persistence',
        column: 'todo',
        channelId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }
  return boards.get(channelId);
}

// Add a task to a channel
function addTask(channelId, taskData) {
  const tasks = getTasks(channelId);
  const newTask = {
    ...taskData,
    channelId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return newTask;
}

// Update a task
function updateTask(taskId, updates) {
  for (const [channelId, tasks] of boards.entries()) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      return tasks[taskIndex];
    }
  }
  return null;
}

// Delete a task
function deleteTask(taskId) {
  for (const [channelId, tasks] of boards.entries()) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const deletedTask = tasks.splice(taskIndex, 1)[0];
      return deletedTask;
    }
  }
  return null;
}

// Get task by ID
function getTaskById(taskId) {
  for (const [channelId, tasks] of boards.entries()) {
    const task = tasks.find(task => task.id === taskId);
    if (task) return task;
  }
  return null;
}

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getTaskById,
};