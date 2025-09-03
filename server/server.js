const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with detailed configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-manager';

// MongoDB Connection Options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Function to connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('Successfully connected to MongoDB.');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Initial connection attempt
connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true },
  type: { type: String, enum: ['personal', 'company'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const Task = mongoose.model('Task', taskSchema);

// Test route to verify MongoDB connection
app.get('/api/test', async (req, res) => {
  try {
    const count = await Task.countDocuments();
    res.json({ 
      message: 'MongoDB connection is working!',
      taskCount: count,
      database: mongoose.connection.name,
      host: mongoose.connection.host
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'MongoDB connection test failed',
      error: error.message 
    });
  }
});

// Routes with better error handling
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    console.log('Received task data:', req.body); // Debug log
    const task = new Task(req.body);
    const savedTask = await task.save();
    console.log('Saved task:', savedTask); // Debug log
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: 'Failed to create task', error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: 'Failed to update task', error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

// Add a new route to get task history
app.get('/api/tasks/history', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({ message: 'Failed to fetch task history', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test the MongoDB connection at: http://localhost:${PORT}/api/test`);
}); 