const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const boardsRouter = require('./routes/boards');
const tasksRouter = require('./routes/tasks');

app.use('/api/boards', boardsRouter);
app.use('/api/tasks', tasksRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Kanban API Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Kanban API Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`📝 API endpoints:`);
  console.log(`   GET    /api/boards/:channelId/tasks`);
  console.log(`   POST   /api/boards/:channelId/tasks`);
  console.log(`   PATCH  /api/tasks/:taskId`);
  console.log(`   DELETE /api/tasks/:taskId`);
  console.log(`   GET    /api/tasks/:taskId`);
});

module.exports = app;