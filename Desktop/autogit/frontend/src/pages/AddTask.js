import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import FolderUpload from '../components/FolderUpload';
import { Upload, FileText, GitBranch, Loader, FolderOpen, Edit3 } from 'lucide-react';

const AddTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: '',
    repository: '',
    owner: '',
    branch: 'main'
  });
  const [files, setFiles] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showFolderUpload, setShowFolderUpload] = useState(false);
  const [uploadType, setUploadType] = useState('files'); // 'files' or 'folder'

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get('/api/repos', {
        withCredentials: true
      });
      setRepositories(response.data.repositories);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRepositoryChange = (e) => {
    const selectedRepo = repositories.find(r => r.fullName === e.target.value);
    if (selectedRepo) {
      setFormData({
        ...formData,
        repository: selectedRepo.name,
        owner: selectedRepo.owner,
        branch: selectedRepo.defaultBranch || 'main'
      });
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setUploadType('files');
  };

  const handleEditorSave = (markdown) => {
    // Create a markdown file from the editor content
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const file = new File([blob], `${formData.title || 'notes'}.md`, { type: 'text/markdown' });
    setFiles([file]);
    setFormData({ ...formData, notes: markdown });
    setShowEditor(false);
    setUploadType('files');
  };

  const handleFolderUpload = async (folderFiles, folderName) => {
    if (!formData.title || !formData.repository) {
      alert('Please fill in task title and select repository first');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description || `Uploaded folder: ${folderName}`);
      data.append('notes', formData.notes);
      data.append('repository', formData.repository);
      data.append('owner', formData.owner);
      data.append('branch', formData.branch);
      data.append('uploadType', 'folder');
      data.append('folderName', folderName);

      // Append files with their relative paths preserved
      folderFiles.forEach((file) => {
        // Create a new File object with the relative path as the name
        const relativePath = file.webkitRelativePath || file.name;
        const newFile = new File([file], relativePath, { type: file.type });
        data.append('files', newFile);
      });

      const response = await axios.post('/api/tasks', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Folder uploaded successfully!');
      navigate(`/task/${response.data.task._id}`);
    } catch (error) {
      console.error('Error uploading folder:', error);
      alert('Failed to upload folder: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setShowFolderUpload(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.repository) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('notes', formData.notes);
      data.append('repository', formData.repository);
      data.append('owner', formData.owner);
      data.append('branch', formData.branch);
      data.append('uploadType', uploadType);

      files.forEach((file) => {
        data.append('files', file);
      });

      const response = await axios.post('/api/tasks', data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Task created successfully! Upload initiated.');
      navigate(`/task/${response.data.task._id}`);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Task</h1>
          <p className="text-gray-600 mt-1">Create a learning task and upload to GitHub</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          {/* Task Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Completed React Hooks Tutorial"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you learned or worked on..."
              rows="4"
              className="input-field"
              required
            />
          </div>

          {/* Notes with Rich Text Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowEditor(true)}
                className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
              >
                <Edit3 className="h-4 w-4" />
                <span>Open Rich Text Editor</span>
              </button>
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes, resources, or thoughts..."
              rows="3"
              className="input-field"
            />
          </div>

          {/* Repository Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Repository <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-gray-400" />
              <select
                onChange={handleRepositoryChange}
                className="input-field"
                required
              >
                <option value="">Choose a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.fullName}>
                    {repo.fullName} {repo.private ? '(Private)' : '(Public)'}
                  </option>
                ))}
              </select>
            </div>
            {repositories.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Loading repositories...
              </p>
            )}
          </div>

          {/* Branch */}
          {formData.repository && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                placeholder="main"
                className="input-field"
              />
            </div>
          )}

          {/* File Upload with Folder Option */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Files or Folder (Optional)
            </label>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">
                    Choose files
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">Multiple files</p>
              </div>

              <div 
                onClick={() => setShowFolderUpload(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
              >
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <span className="text-primary-600 hover:text-primary-700 font-medium">
                  Upload Folder
                </span>
                <p className="text-sm text-gray-500 mt-2">Entire folder</p>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Selected files:</p>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Create & Upload</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your files will be uploaded to the selected repository</li>
            <li>• Files are organized in <code className="bg-blue-100 px-1 rounded">autogit-uploads/YYYY-MM-DD/</code> folder</li>
            <li>• A commit will be created automatically with your task title</li>
            <li>• You can track the upload status in the dashboard</li>
          </ul>
        </div>

        {/* Rich Text Editor Modal */}
        {showEditor && (
          <RichTextEditor
            initialContent={formData.notes}
            onSave={handleEditorSave}
            onClose={() => setShowEditor(false)}
          />
        )}

        {/* Folder Upload Modal */}
        {showFolderUpload && (
          <FolderUpload
            onClose={() => setShowFolderUpload(false)}
            onUpload={handleFolderUpload}
          />
        )}
      </div>
    </div>
  );
};

export default AddTask;
