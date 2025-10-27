import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, 
  Calendar, 
  GitCommit, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tasks/${id}`, {
        withCredentials: true
      });
      setTask(response.data.task);
    } catch (error) {
      console.error('Error fetching task:', error);
      alert('Failed to load task');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${id}`, {
        withCredentials: true
      });
      alert('Task deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'uploading':
        return <Clock className="h-8 w-8 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      uploading: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="card">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b">
            <div className="flex items-start space-x-4">
              {getStatusIcon(task.uploadStatus)}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
                {getStatusBadge(task.uploadStatus)}
              </div>
            </div>
            
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div className="flex items-center space-x-3">
              <GitCommit className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Repository</p>
                <p className="font-medium text-gray-900">{task.repository.fullName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Upload Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(task.uploadDate).toLocaleString()}
                </p>
              </div>
            </div>

            {task.commitUrl && (
              <div className="flex items-center space-x-3">
                <ExternalLink className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Commit</p>
                  <a
                    href={task.commitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    View on GitHub →
                  </a>
                </div>
              </div>
            )}

            {task.commitSha && (
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Commit SHA</p>
                  <p className="font-mono text-sm text-gray-900">{task.commitSha.substring(0, 7)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Notes */}
          {task.notes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{task.notes}</p>
              </div>
            </div>
          )}

          {/* Uploaded Files */}
          {task.uploadedFiles && task.uploadedFiles.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Files</h2>
              <div className="space-y-2">
                {task.uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{file.filename}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {task.uploadStatus === 'failed' && task.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Error Details</h3>
              <p className="text-sm text-red-800">{task.errorMessage}</p>
            </div>
          )}

          {/* Upload in Progress */}
          {task.uploadStatus === 'uploading' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
                <p className="text-sm text-yellow-800">
                  Upload in progress... This may take a few moments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
