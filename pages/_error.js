function Error({ statusCode, message }) {
  return (
    <div className="error-container">
      <h1>{statusCode ? `Error ${statusCode}` : 'An error occurred'}</h1>
      <p>{message || 'Something went wrong. Please try again later.'}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Try Again
      </button>
      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          background-color: #fafafa;
        }
        h1 {
          color: #e11d48;
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          color: #4b5563;
          margin-bottom: 2rem;
        }
        .retry-button {
          background-color: #e11d48;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .retry-button:hover {
          background-color: #be123c;
        }
      `}</style>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err ? err.message : '';
  return { statusCode, message };
};

export default Error;
