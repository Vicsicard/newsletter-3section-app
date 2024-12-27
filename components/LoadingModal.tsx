import { useState, useEffect, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';
import Confetti from 'react-confetti';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  email: string;
  isSuccess: boolean;
  onClose: () => void;
  error?: string | null;
}

const loadingMessages = [
  "Just a few seconds more...",
  "Well, maybe a few more seconds...",
  "Yeah, you guessed it... a few more seconds...",
  "Almost there! Just a bit longer...",
  "Your newsletter is being crafted with care...",
  "Adding some extra sparkle to your content..."
];

const LoadingModal = forwardRef<HTMLDivElement, LoadingModalProps>((props, ref) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!props.isOpen || props.isSuccess) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [props.isOpen, props.isSuccess]);

  useEffect(() => {
    if (props.isSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [props.isSuccess]);

  if (!props.isOpen) return null;

  return (
    <Transition appear show={props.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={props.onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                ref={ref}
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {props.error ? 'Error' : props.isSuccess ? 'Success!' : 'Processing...'}
                </Dialog.Title>
                <div className="mt-2">
                  {props.error ? (
                    <p className="text-sm text-red-600">
                      {props.error}
                    </p>
                  ) : props.isSuccess ? (
                    <div className="text-center">
                      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-16 w-16 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Success! 🎉
                      </h3>
                      <p className="text-lg text-gray-700">
                        Your draft newsletter has been sent to:
                      </p>
                      <p className="text-lg font-semibold text-indigo-600 mb-6">
                        {props.email}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <ClipLoader color="#4F46E5" size={50} />
                      <p className="text-sm text-gray-500">
                        {loadingMessages[messageIndex]}
                      </p>
                    </div>
                  )}
                </div>

                {(props.error || props.isSuccess) && (
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={props.onClose}
                    >
                      {props.error ? 'Try Again' : 'Close'}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

LoadingModal.displayName = 'LoadingModal';

export default LoadingModal;
