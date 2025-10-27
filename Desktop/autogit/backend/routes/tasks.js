const express = require('express');
const multer = require('multer');
const { ensureAuthenticated } = require('../middleware/auth');
const Task = require('../models/Task');
const { uploadToGitHub } = require('../utils/githubUpload');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB per file
    files: 1000 // Maximum 1000 files
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for current user
// @access  Private
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const { repository, status, startDate, endDate } = req.query;
    
    let query = { userId: req.user._id };
    
    if (repository) {
      query['repository.fullName'] = repository;
    }
    
    if (status) {
      query.uploadStatus = status;
    }
    
    if (startDate || endDate) {
      query.uploadDate = {};
      if (startDate) query.uploadDate.$gte = new Date(startDate);
      if (endDate) query.uploadDate.$lte = new Date(endDate);
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tasks', 
      message: error.message 
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task', 
      message: error.message 
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task and upload to GitHub
// @access  Private
router.post('/', ensureAuthenticated, upload.array('files', 1000), async (req, res) => {
  try {
    const { title, description, notes, repository, owner, branch, uploadType, folderName } = req.body;

    if (!title || !description || !repository || !owner) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Title, description, repository, and owner are required' 
      });
    }

    // Create task
    const taskData = {
      userId: req.user._id,
      title,
      description,
      notes: notes || '',
      repository: {
        name: repository,
        owner,
        fullName: `${owner}/${repository}`
      },
      uploadStatus: 'uploading',
      uploadedFiles: req.files ? req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        size: file.size
      })) : []
    };

    // Add folder info if it's a folder upload
    if (uploadType === 'folder' && folderName) {
      taskData.description = `${description} (Folder: ${folderName})`;
    }

    const task = await Task.create(taskData);

    // Upload to GitHub in background
    uploadToGitHub(
      req.user.accessToken,
      owner,
      repository,
      branch || 'main',
      req.files || [],
      uploadType === 'folder' ? `${title} - ${folderName}` : title,
      task._id
    ).catch(error => {
      console.error('GitHub upload error:', error);
    });

    res.status(201).json({ 
      task,
      message: 'Task created and upload initiated' 
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      error: 'Failed to create task', 
      message: error.message 
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { title, description, notes } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, description, notes },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      error: 'Failed to update task', 
      message: error.message 
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      error: 'Failed to delete task', 
      message: error.message 
    });
  }
});

// Error handling middleware for Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds 500MB limit. Please upload smaller files or split into multiple uploads.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 1000 files allowed per upload.'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }
  next(error);
});

module.exports = router;
