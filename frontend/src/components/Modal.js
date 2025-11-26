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
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick} aria-labelledby="modalTitle" aria-modal="true" role="dialog">
      <div className={`modal-dialog modal-${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalTitle">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" disabled={loading}></button>
          </div>
          <div className="modal-body">
            {children}
          </div>
          {showFooter && (
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                {cancelText}
              </button>
              {onConfirm && (
                <button type="button" className={`btn btn-${confirmVariant}`} onClick={onConfirm} disabled={loading}>
                  {loading ? <ButtonSpinner /> : confirmText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
