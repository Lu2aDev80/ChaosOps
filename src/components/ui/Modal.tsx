import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} color="#10b981" />;
      case 'error':
        return <AlertCircle size={24} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={24} color="#f59e0b" />;
      default:
        return <Info size={24} color="#3b82f6" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '1.2rem 1.35rem 1.15rem 1.25rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3), 4px 8px 0 rgba(0,0,0,0.1)',
          border: '3px solid #181818',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          transform: 'rotate(-0.3deg)',
          animation: 'modalSlideIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes modalSlideIn {
              from {
                opacity: 0;
                transform: scale(0.95) rotate(-0.3deg) translateY(-20px);
              }
              to {
                opacity: 1;
                transform: scale(1) rotate(-0.3deg) translateY(0);
              }
            }
          `}
        </style>

        {/* Decorative tape */}
        <div
          style={{
            position: 'absolute',
            top: '-15px',
            left: '40%',
            width: '60px',
            height: '20px',
            background: `repeating-linear-gradient(135deg, #fffbe7 0 6px, ${getTypeColor()} 6px 12px)`,
            borderRadius: '8px',
            border: `3px solid ${getTypeColor()}`,
            boxShadow: `0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)`,
            transform: 'translateX(-50%) rotate(-3deg)',
            zIndex: 10,
          }}
        />

        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem 1.5rem 1rem',
              borderBottom: '2px dashed #e5e7eb',
            }}
          >
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {getIcon()}
                <h2
                  style={{
                    fontFamily: '"Gloria Hallelujah", "Caveat", "Comic Neue", cursive, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
              </div>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                }}
                aria-label="Modal schließen"
              >
                <X size={24} color="#64748b" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  type = 'warning',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type} showCloseButton={false}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p
          style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1rem',
            color: '#475569',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #64748b',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            backgroundColor: '#fff',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '2px 4px 0 #64748b',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '3px 6px 0 #64748b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '2px 4px 0 #64748b';
          }}
        >
          {cancelText}
        </button>

        <button
          onClick={handleConfirm}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #181818',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            backgroundColor: type === 'error' ? '#ef4444' : '#fbbf24',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '2px 4px 0 #181818',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type} showCloseButton={false}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p
          style={{
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            fontSize: '1rem',
            color: '#475569',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #181818',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: '"Inter", "Roboto", Arial, sans-serif',
            backgroundColor: '#fbbf24',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '2px 4px 0 #181818',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '3px 6px 0 #181818';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '2px 4px 0 #181818';
          }}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};
