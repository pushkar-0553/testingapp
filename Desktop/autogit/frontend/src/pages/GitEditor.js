import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import axios from 'axios';
import {
  FolderPlus, FilePlus, Save, FolderOpen, Trash2,
  RefreshCw, FileText, X, Upload, CheckCircle, Clock,
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered,
  Undo, Redo, FileCode
} from 'lucide-react';
import Dialog from '../components/Dialog';
import Navbar from '../components/Navbar';
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight(common);

const GitEditor = () => {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [branches, setBranches] = useState([]);
  const [repoContents, setRepoContents] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSha, setFileSha] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  
  // Modals
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showFolderUpload, setShowFolderUpload] = useState(false);
  
  // Form states
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  
  // Task states
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: '<p>Select a file or create a new one to start editing...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none p-6 min-h-full',
      },
    },
  });

  useEffect(() => {
    fetchRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      fetchBranches();
      fetchRepoContents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, selectedBranch]);

  const fetchRepositories = async () => {
    try {
      const response = await axios.get('/api/repos', { withCredentials: true });
      setRepositories(response.data.repositories);
    } catch (error) {
      showDialog('error', 'Error', 'Failed to fetch repositories');
    }
  };

  const fetchBranches = async () => {
    if (!selectedRepo) return;
    try {
      const response = await axios.get(`/api/github/branches?owner=${selectedRepo.owner}&repo=${selectedRepo.name}`, {
        withCredentials: true
      });
      setBranches(response.data.branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchRepoContents = async (path = '') => {
    if (!selectedRepo) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/github/repo-contents?owner=${selectedRepo.owner}&repo=${selectedRepo.name}&path=${path}`,
        { withCredentials: true }
      );
      setRepoContents(Array.isArray(response.data.contents) ? response.data.contents : [response.data.contents]);
      setCurrentPath(path);
    } catch (error) {
      showDialog('error', 'Error', 'Failed to fetch repository contents');
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (file) => {
    if (file.type !== 'file') {
      fetchRepoContents(file.path);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `/api/github/file-content?owner=${selectedRepo.owner}&repo=${selectedRepo.name}&path=${file.path}`,
        { withCredentials: true }
      );
      editor?.commands.setContent(response.data.content);
      setSelectedFile(file);
      setFileSha(response.data.sha);
      setCommitMessage(`Update ${file.name}`);
    } catch (error) {
      showDialog('error', 'Error', 'Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  const saveFile = async () => {
    if (!selectedFile || !editor) return;

    const content = editor.getHTML();
    
    if (!commitMessage.trim()) {
      showDialog('warning', 'Warning', 'Please enter a commit message');
      return;
    }

    setLoading(true);
    try {
      await axios.put('/api/github/update-file', {
        owner: selectedRepo.owner,
        repo: selectedRepo.name,
        path: selectedFile.path,
        content,
        message: commitMessage,
        sha: fileSha,
        branch: selectedBranch
      }, { withCredentials: true });

      showDialog('success', 'Success', `File '${selectedFile.name}' saved successfully!`);
      fetchRepoContents(currentPath);
    } catch (error) {
      showDialog('error', 'Error', error.response?.data?.message || 'Failed to save file');
    } finally {
      setLoading(false);
    }
  };

  const createNewFile = async () => {
    if (!newFileName.trim() || !commitMessage.trim()) {
      showDialog('warning', 'Warning', 'Please enter file name and commit message');
      return;
    }

    const content = editor?.getHTML() || '';
    const filePath = currentPath ? `${currentPath}/${newFileName}` : newFileName;

    setLoading(true);
    try {
      await axios.post('/api/github/create-file', {
        owner: selectedRepo.owner,
        repo: selectedRepo.name,
        path: filePath,
        content,
        message: commitMessage,
        branch: selectedBranch
      }, { withCredentials: true });

      showDialog('success', 'Success', `File '${newFileName}' created successfully!`);
      setShowCreateFile(false);
      setNewFileName('');
      fetchRepoContents(currentPath);
    } catch (error) {
      showDialog('error', 'Error', error.response?.data?.message || 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (file) => {
    setDialog({
      isOpen: true,
      type: 'confirm',
      title: 'Confirm Delete',
      message: `Are you sure you want to delete '${file.name}'? This action cannot be undone.`,
      showCancel: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          await axios.delete('/api/github/delete-file', {
            data: {
              owner: selectedRepo.owner,
              repo: selectedRepo.name,
              path: file.path,
              message: `Delete ${file.name}`,
              sha: file.sha,
              branch: selectedBranch
            },
            withCredentials: true
          });

          showDialog('success', 'Success', `File '${file.name}' deleted successfully!`);
          fetchRepoContents(currentPath);
        } catch (error) {
          showDialog('error', 'Error', 'Failed to delete file');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const createRepository = async () => {
    if (!newRepoName.trim()) {
      showDialog('warning', 'Warning', 'Please enter repository name');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/github/create-repo', {
        name: newRepoName,
        description: newRepoDesc,
        private: newRepoPrivate,
        autoInit: true
      }, { withCredentials: true });

      showDialog('success', 'Success', `Repository '${newRepoName}' created successfully!`);
      setShowCreateRepo(false);
      setNewRepoName('');
      setNewRepoDesc('');
      fetchRepositories();
    } catch (error) {
      showDialog('error', 'Error', error.response?.data?.message || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showCancel: type === 'confirm'
    });
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="flex items-center space-x-1 p-2 border-b bg-gray-50">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-300' : ''}`}
          title="Code Block"
        >
          <FileCode className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
          {/* Repository Selector */}
          <div className="p-4 border-b dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Repository</label>
            <select
              value={selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : ''}
              onChange={(e) => {
                const [owner, name] = e.target.value.split('/');
                setSelectedRepo({ owner, name });
              }}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select repository...</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={`${repo.owner}/${repo.name}`}>
                  {repo.fullName}
                </option>
              ))}
            </select>

            {selectedRepo && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                >
                  {branches.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-b dark:border-gray-700 space-y-2">
            <button
              onClick={() => setShowCreateRepo(true)}
              className="w-full flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Repository</span>
            </button>

            {selectedRepo && (
              <>
                <button
                  onClick={() => setShowCreateFile(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FilePlus className="h-4 w-4" />
                  <span>New File</span>
                </button>

                <button
                  onClick={() => fetchRepoContents(currentPath)}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setShowFolderUpload(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Folder</span>
                </button>

                <button
                  onClick={() => setShowCreateTask(true)}
                  className="w-full flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <FilePlus className="h-4 w-4" />
                  <span>New Task</span>
                </button>
              </>
            )}
          </div>

          {/* File Explorer */}
          <div className="flex-1 overflow-y-auto p-4 border-b dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Files</h3>
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : repoContents.length === 0 ? (
              <p className="text-sm text-gray-500">No files found</p>
            ) : (
              <div className="space-y-1">
                {currentPath && (
                  <button
                    onClick={() => {
                      const parentPath = currentPath.split('/').slice(0, -1).join('/');
                      fetchRepoContents(parentPath);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                  >
                    <FolderOpen className="h-4 w-4 text-gray-400" />
                    <span>..</span>
                  </button>
                )}
                {repoContents.map((item) => (
                  <div key={item.path} className="flex items-center space-x-1">
                    <button
                      onClick={() => loadFile(item)}
                      className="flex-1 text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-2 text-gray-900 dark:text-gray-100"
                    >
                      {item.type === 'dir' ? (
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="truncate">{item.name}</span>
                    </button>
                    {item.type === 'file' && (
                      <button
                        onClick={() => deleteFile(item)}
                        className="p-2 hover:bg-red-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task List */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No tasks yet</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {task.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <MenuBar />
          
          {selectedFile && (
            <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedFile.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedFile.path}</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message..."
                  className="px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  onClick={saveFile}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Create Repository Modal */}
      {showCreateRepo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Create New Repository</h3>
              <button onClick={() => setShowCreateRepo(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Repository Name *</label>
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="my-awesome-project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="A brief description..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRepoPrivate}
                  onChange={(e) => setNewRepoPrivate(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm">Private repository</label>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowCreateRepo(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createRepository}
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create File Modal */}
      {showCreateFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold">Create New File</h3>
              <button onClick={() => setShowCreateFile(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">File Name *</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="example.md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Commit Message *</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Create new file"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowCreateFile(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createNewFile}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        showCancel={dialog.showCancel}
      />
    </div>
  );
};

export default GitEditor;
