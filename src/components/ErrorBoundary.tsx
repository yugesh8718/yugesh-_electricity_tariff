/**
 * ErrorBoundary.tsx
 *
 * Class component that catches unhandled render errors in its subtree.
 * Shows a fallback UI with the error message and a "Try again" button
 * that resets the error state, allowing React to re-render children.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log for developer visibility without exposing secrets
    if (import.meta.env.DEV) {
      console.error('[WattWise] ErrorBoundary caught an error:', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel" role="alert" aria-live="assertive">
          <h2>Something went wrong</h2>
          <p className="field-hint" style={{ marginTop: 8, marginBottom: 16 }}>
            {this.state.message || 'An unexpected error occurred.'}
          </p>
          <button className="btn btn-primary" onClick={this.handleReset} type="button">
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
