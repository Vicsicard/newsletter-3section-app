import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="error-reset-button"
          >
            Try again
          </button>
          <style jsx>{`
            .error-boundary {
              padding: 20px;
              text-align: center;
              background: #fff3f3;
              border-radius: 8px;
              margin: 20px;
            }
            .error-reset-button {
              margin-top: 16px;
              padding: 8px 16px;
              background: #ff4444;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            .error-reset-button:hover {
              background: #ff0000;
            }
            details {
              margin: 20px;
              padding: 10px;
              background: #ffe6e6;
              border-radius: 4px;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}
