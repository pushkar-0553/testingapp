import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Github, Mail, Calendar, ExternalLink } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Information */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
          
          <div className="flex items-center space-x-6 mb-8">
            <img
              src={user?.avatarUrl}
              alt={user?.username}
              className="h-24 w-24 rounded-full border-4 border-primary-100"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user?.displayName}</h3>
              <p className="text-gray-600 dark:text-gray-400">@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 py-3 border-b">
              <User className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3 border-b">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3 border-b">
              <Github className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">GitHub Profile</p>
                <a
                  href={user?.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <span>{user?.profileUrl}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">GitHub ID</p>
                <p className="font-medium text-gray-900">{user?.githubId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* About AutoGit */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About AutoGit</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>AutoGit</strong> is a personal learning tracker that helps you document your
              daily learning activities and automatically upload them to GitHub.
            </p>
            <p className="text-sm text-gray-600">
              Built with MERN Stack (MongoDB, Express, React, Node.js) + GitHub API
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Upload files and folders directly to GitHub repositories</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Track learning activities with detailed descriptions and notes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Automatic commit creation with custom messages</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Dashboard with filters and upload status tracking</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>GitHub OAuth authentication for secure access</span>
            </li>
          </ul>
        </div>

        {/* API Permissions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">GitHub Permissions</h2>
          <p className="text-gray-700 mb-4">
            AutoGit requires the following GitHub permissions:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>user:email</strong> - Access your email address</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">✓</span>
              <span><strong>repo</strong> - Access and modify your repositories</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            These permissions are necessary to list your repositories and upload files on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
