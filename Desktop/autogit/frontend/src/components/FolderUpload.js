import React, { useState } from 'react';
import { FolderOpen, File, X, Upload, Loader } from 'lucide-react';

const FolderUpload = ({ onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB - GitHub API limit
    
    // Filter out files that are too large
    const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE);
    const largeFiles = files.filter(f => f.size > MAX_FILE_SIZE);
    
    if (largeFiles.length > 0) {
      const largeFileNames = largeFiles.map(f => f.name).join(', ');
      alert(`⚠️ ${largeFiles.length} file(s) exceed GitHub's 25MB API limit and will be skipped:\n\n${largeFileNames}\n\nTo upload large files, use Git commands locally.`);
    }
    
    setSelectedFiles(validFiles);
    
    // Extract folder name from first file path
    if (files.length > 0) {
      const path = files[0].webkitRelativePath;
      const folder = path.split('/')[0];
      setFolderName(folder);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select a folder first');
      return;
    }

    setLoading(true);
    try {
      await onUpload(selectedFiles, folderName);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload folder');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FolderOpen className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Upload Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Folder Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Folder
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-700 font-medium text-lg">
                  Choose a folder
                </span>
                <input
                  type="file"
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleFolderSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                All files in the folder will be uploaded
              </p>
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Files larger than 25MB will be skipped (GitHub API limit)
              </p>
            </div>
          </div>

          {/* Selected Folder Info */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">{folderName}</span>
                  </div>
                  <span className="text-sm text-blue-700">
                    {selectedFiles.length} file(s) • {formatFileSize(getTotalSize())}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Files to Upload ({selectedFiles.length})
              </h3>
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <File className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 truncate">
                          {file.webkitRelativePath || file.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">
              📁 Folder Upload Info
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Folder structure will be preserved</li>
              <li>• Files will be uploaded to: <code className="bg-yellow-100 px-1 rounded">autogit-uploads/YYYY-MM-DD/folder-name/</code></li>
              <li>• Maximum total size: 100MB</li>
              <li>• Hidden files (starting with .) will be included</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="btn-primary flex items-center space-x-2"
            disabled={selectedFiles.length === 0 || loading}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Upload Folder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderUpload;
