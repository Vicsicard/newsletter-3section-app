export default function ErrorMessage({ message, details }) {
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
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
        }
        .error-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .message-container {
          flex: 1;
        }
        .message {
          color: #b91c1c;
          font-weight: 500;
          margin: 0;
        }
        .details {
          color: #991b1b;
          font-size: 0.875rem;
          margin: 4px 0 0 0;
        }
        svg {
          color: #dc2626;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
