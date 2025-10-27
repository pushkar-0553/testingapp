import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Plus, Calendar, GitCommit, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    repository: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.repository) params.append('repository', filter.repository);
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);

      const response = await axios.get(`/api/tasks?${params.toString()}`, {
        withCredentials: true
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track your learning activities and GitHub uploads</p>
          </div>
          
          <Link to="/add-task" className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="uploading">Uploading</option>
              <option value="pending">Pending</option>
            </select>

            <input
              type="text"
              placeholder="Repository name"
              value={filter.repository}
              onChange={(e) => setFilter({ ...filter, repository: e.target.value })}
              className="input-field"
            />

            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="input-field"
            />

            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.uploadStatus === 'success').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter(t => t.uploadStatus === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.uploadStatus === 'uploading').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Tasks</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found. Create your first task!</p>
              <Link to="/add-task" className="btn-primary mt-4 inline-flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Task</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Link
                  key={task._id}
                  to={`/task/${task._id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(task.uploadStatus)}
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        {getStatusBadge(task.uploadStatus)}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <GitCommit className="h-4 w-4" />
                          <span>{task.repository.fullName}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(task.uploadDate).toLocaleDateString()}</span>
                        </div>

                        {task.uploadedFiles && task.uploadedFiles.length > 0 && (
                          <span>{task.uploadedFiles.length} file(s)</span>
                        )}
                      </div>
                    </div>

                    {task.commitUrl && (
                      <a
                        href={task.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Commit →
                      </a>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
