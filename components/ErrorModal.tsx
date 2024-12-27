import { forwardRef } from 'react';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal = forwardRef<HTMLDivElement, ErrorModalProps>(({ message, onClose }, ref) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div 
        ref={ref}
        className="fixed inset-0 z-10 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
        tabIndex={-1}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 
                  className="text-base font-semibold leading-6 text-gray-900"
                  id="error-title"
                >
                  Error
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-red-600">
                    {message}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                onClick={onClose}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ErrorModal.displayName = 'ErrorModal';

export default ErrorModal;
