import { useState, useEffect, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';
import Confetti from 'react-confetti';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  email?: string;
  isSuccess?: boolean;
  onClose?: () => void;
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

  const handleClose = () => {
    if (props.onClose) {
      props.onClose();
    }
  };

  if (!props.isOpen) return null;

  return (
    <Transition appear show={props.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel ref={ref} className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center"
                >
                  {props.isSuccess ? "Success!" : "Generating Your Newsletter..."}
                </Dialog.Title>
                <div className="mt-4 flex flex-col items-center justify-center">
                  {!props.isSuccess && !props.error && (
                    <>
                      <ClipLoader color="#2563EB" size={50} />
                      <p className="mt-4 text-sm text-gray-500">
                        {loadingMessages[messageIndex]}
                      </p>
                    </>
                  )}
                  {props.isSuccess && (
                    <>
                      {showConfetti && <Confetti />}
                      <p className="text-sm text-gray-500">
                        Your newsletter has been generated successfully!
                      </p>
                    </>
                  )}
                  {props.error && (
                    <p className="text-sm text-red-500">
                      {props.error}
                    </p>
                  )}
                </div>
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
