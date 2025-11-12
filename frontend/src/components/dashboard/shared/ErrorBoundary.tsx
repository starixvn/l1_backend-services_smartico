/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI with retry option.
 */

import { Component, ReactNode } from 'react';
import type { ErrorBoundaryProps } from '../../../types/dashboard/components';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component.
 * Catches errors in child components and displays fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="glass-dark p-8 rounded-xl border border-red-500/30 max-w-2xl mx-auto my-8">
          <div className="flex items-start gap-4">
            {/* Error Icon */}
            <div className="flex-shrink-0">
              <svg
                className="w-12 h-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Content */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-300 mb-4">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>

              {/* Error Details */}
              {this.state.error && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 mb-2">
                    Show error details
                  </summary>
                  <div className="bg-slate-900/50 rounded-lg p-4 text-xs font-mono text-red-400 overflow-auto max-h-48">
                    <div className="font-bold mb-2">{this.state.error.name}: {this.state.error.message}</div>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
