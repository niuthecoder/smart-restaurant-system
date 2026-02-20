import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4">
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
    <p className="text-gray-600 dark:text-gray-300 mt-2 text-center max-w-md">
      {error?.message || 'An unexpected error occurred.'}
    </p>
    <button
      type="button"
      onClick={() => (resetErrorBoundary ? resetErrorBoundary() : window.location.hash = 'home')}
      className="mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600"
    >
      Try again
    </button>
  </div>
);

export default ErrorFallback;
