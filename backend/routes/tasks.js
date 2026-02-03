const express = require('express');
const router = express.Router();
const store = require('../store');

// PATCH /api/tasks/:taskId - Update a task
router.patch('/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const updatedTask = store.updateTask(taskId, updates);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:taskId - Delete a task
router.delete('/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;

    const deletedTask = store.deleteTask(taskId);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// GET /api/tasks/:taskId - Get a specific task
router.get('/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = store.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

module.exports = router;