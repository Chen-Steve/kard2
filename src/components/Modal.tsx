import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'danger' | 'primary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <Icon icon="ph:x" className="h-5 w-5" />
          </button>

          {/* Title */}
          <h3 className="text-lg font-medium leading-6 text-gray-900 pr-8">
            {title}
          </h3>

          {/* Content */}
          <div className="mt-4">{children}</div>

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div className="mt-6 flex justify-end gap-3">
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {secondaryAction.label}
                </button>
              )}
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    primaryAction.variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {primaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 