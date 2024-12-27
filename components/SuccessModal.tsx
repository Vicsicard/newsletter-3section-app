import { forwardRef } from 'react';

interface SuccessModalProps {
  message: string;
  email: string;
  onClose: () => void;
}

const SuccessModal = forwardRef<HTMLDivElement, SuccessModalProps>(({ message, email, onClose }, ref) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
      <div 
        ref={ref}
        className="fixed inset-0 z-10 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        tabIndex={-1}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 
                  className="text-base font-semibold leading-6 text-gray-900"
                  id="success-title"
                >
                  Success!
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    We will send updates to: {email}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SuccessModal.displayName = 'SuccessModal';

export default SuccessModal;
