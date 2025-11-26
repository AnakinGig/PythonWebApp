import React from 'react';
import { ButtonSpinner } from './LoadingSpinner';

/**
 * Confirmation Dialog Component
 * Simple yes/no confirmation dialog
 * 
 * @param {boolean} isOpen - Controls dialog visibility
 * @param {function} onClose - Called when dialog should close
 * @param {function} onConfirm - Called when user confirms
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {boolean} loading - Shows spinner on confirm button
 * @param {boolean} danger - Use danger styling for destructive actions
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message, 
  loading = false, 
  danger = false 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick} aria-labelledby="confirmDialogTitle" aria-modal="true" role="dialog">
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="confirmDialogTitle">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" disabled={loading}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Non
            </button>
            <button type="button" className={`btn btn-${danger ? 'danger' : 'primary'}`} onClick={onConfirm} disabled={loading}>
              {loading ? <ButtonSpinner /> : "Oui"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
