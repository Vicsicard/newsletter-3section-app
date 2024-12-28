import { useState, useEffect, forwardRef } from 'react';
import { ClipLoader } from 'react-spinners';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoadingModal = forwardRef<HTMLDivElement, LoadingModalProps>(
  ({ isOpen, onClose, message = 'Loading...' }, ref) => {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-2 flex flex-col items-center justify-center space-y-4">
                    <ClipLoader color="#3B82F6" size={50} />
                    <p className="text-sm text-gray-500">
                      {message}
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }
);

LoadingModal.displayName = 'LoadingModal';

export default LoadingModal;
