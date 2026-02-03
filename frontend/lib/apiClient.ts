const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Task {
  id: string;
  title: string;
  description: string;
  column: 'todo' | 'in-progress' | 'done';
  channelId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all tasks for a channel
 */
export async function getTasks(channelId: string): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/boards/${channelId}/tasks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Create a new task
 */
export async function createTask(
  channelId: string,
  data: { title: string; description: string; column: Task['column'] }
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/boards/${channelId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'column'>>
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update task: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete task: ${response.statusText}`);
  }
}
