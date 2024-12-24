interface ErrorMessageProps {
  message: string;
  details?: string;
}

export default function ErrorMessage({ message, details }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <div className="error-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div className="message-container">
          <p className="message">{message}</p>
          {details && <p className="details">{details}</p>}
        </div>
      </div>
      <style jsx>{`
        .error-message {
          margin: 1rem 0;
          padding: 1rem;
          border-radius: 0.5rem;
          background-color: #FEE2E2;
          border: 1px solid #FCA5A5;
        }
        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        svg {
          flex-shrink: 0;
          color: #DC2626;
          margin-top: 0.125rem;
        }
        .message-container {
          flex: 1;
        }
        .message {
          margin: 0;
          color: #991B1B;
          font-weight: 500;
        }
        .details {
          margin: 0.5rem 0 0;
          color: #7F1D1D;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
