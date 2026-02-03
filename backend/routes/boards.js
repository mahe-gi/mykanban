const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../store');

// GET /api/boards/:channelId/tasks - Get all tasks for a channel
router.get('/:channelId/tasks', (req, res) => {
  try {
    const { channelId } = req.params;
    const tasks = store.getTasks(channelId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/boards/:channelId/tasks - Create a new task
router.post('/:channelId/tasks', (req, res) => {
  try {
    const { channelId } = req.params;
    const { title, description, column } = req.body;

    if (!title || !column) {
      return res.status(400).json({ error: 'Title and column are required' });
    }

    const taskData = {
      id: uuidv4(),
      title,
      description: description || '',
      column,
    };

    const newTask = store.addTask(channelId, taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

module.exports = router;