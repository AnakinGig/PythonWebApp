import React, { useEffect } from 'react';
import { ButtonSpinner } from './LoadingSpinner';

/**
 * Reusable Modal Component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal should close
 * @param {string} title - Modal header title
 * @param {node} children - Modal body content
 * @param {function} onConfirm - Optional confirm action
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {string} confirmVariant - Bootstrap button variant (primary, danger, success, etc.)
 * @param {string} size - Modal size (sm, md, lg, xl)
 * @param {boolean} loading - Shows spinner on confirm button
 * @param {boolean} showFooter - Show/hide footer
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmVariant = "primary",
  size = "md",
  loading = false,
  showFooter = true
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop with fade animation */}
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050
        }}
        onClick={handleBackdropClick}
      />
      
      {/* Modal Dialog */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1055,
          overflow: 'auto'
        }} 
        onClick={handleBackdropClick}
        aria-labelledby="modalTitle" 
        aria-modal="true" 
        role="dialog"
      >
        <div 
          className={`modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable`}
          style={{
            animation: 'modalSlideIn 0.3s ease-out'
          }}
        >
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header bg-light border-bottom">
              <h5 className="modal-title fw-bold" id="modalTitle">{title}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose} 
                aria-label="Close" 
                disabled={loading}
              />
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {children}
            </div>
            {showFooter && (
              <div className="modal-footer bg-light border-top">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary" 
                  onClick={onClose} 
                  disabled={loading}
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button 
                    type="button" 
                    className={`btn btn-${confirmVariant}`} 
                    onClick={onConfirm} 
                    disabled={loading}
                  >
                    {loading ? <ButtonSpinner /> : confirmText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Modal;
