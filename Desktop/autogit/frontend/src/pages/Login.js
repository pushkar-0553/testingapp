import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Github, GitBranch, Upload, BarChart } from 'lucide-react';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Github className="h-16 w-16 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AutoGit</h1>
          <p className="text-lg text-gray-600">
            Personal GitHub Upload & Learning Tracker
          </p>
        </div>

        <div className="card">
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <Upload className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Auto Upload</h3>
                <p className="text-sm text-gray-600">
                  Upload files directly to GitHub without git commands
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <GitBranch className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Track Learning</h3>
                <p className="text-sm text-gray-600">
                  Log your daily learning activities with notes and attachments
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <BarChart className="h-6 w-6 text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">View Progress</h3>
                <p className="text-sm text-gray-600">
                  Dashboard with filters and commit history
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={login}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
          >
            <Github className="h-5 w-5" />
            <span>Login with GitHub</span>
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By logging in, you agree to grant access to your GitHub repositories
          </p>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Built with MERN Stack + GitHub API</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
