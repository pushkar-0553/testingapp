import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Dialog = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false
}) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
    error: <AlertCircle className="h-12 w-12 text-red-500" />,
    warning: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
    info: <Info className="h-12 w-12 text-blue-500" />,
    confirm: <AlertTriangle className="h-12 w-12 text-orange-500" />
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              type === 'error' 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : type === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : type === 'warning' || type === 'confirm'
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
