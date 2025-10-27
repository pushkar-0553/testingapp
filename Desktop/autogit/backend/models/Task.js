const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  repository: {
    name: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    }
  },
  commitUrl: {
    type: String,
    default: ''
  },
  commitSha: {
    type: String,
    default: ''
  },
  uploadStatus: {
    type: String,
    enum: ['pending', 'uploading', 'success', 'failed'],
    default: 'pending'
  },
  uploadedFiles: [{
    filename: String,
    path: String,
    size: Number
  }],
  errorMessage: {
    type: String,
    default: ''
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ 'repository.fullName': 1 });

module.exports = mongoose.model('Task', taskSchema);
