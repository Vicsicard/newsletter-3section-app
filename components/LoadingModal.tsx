import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import Confetti from 'react-confetti';

interface LoadingModalProps {
  isOpen: boolean;
  email: string;
  isSuccess: boolean;
  onClose: () => void;
}

const loadingMessages = [
  "Just a few seconds more...",
  "Well, maybe a few more seconds...",
  "Yeah, you guessed it... a few more seconds...",
  "Almost there! Just a bit longer...",
  "Your newsletter is being crafted with care...",
  "Adding some extra sparkle to your content..."
];

export default function LoadingModal({ isOpen, email, isSuccess, onClose }: LoadingModalProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isSuccess]);

  useEffect(() => {
    if (isSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
        
        {!isSuccess ? (
          <div className="text-center">
            <ClipLoader color="#4F46E5" size={50} />
            <p className="mt-4 text-lg text-gray-700 animate-fade-in">
              {loadingMessages[messageIndex]}
            </p>
          </div>
        ) : (
          <div className="text-center">
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
              {email}
            </p>
            <button
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
