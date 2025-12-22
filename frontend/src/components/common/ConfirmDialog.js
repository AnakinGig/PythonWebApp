import React from 'react';
import { ButtonSpinner } from './LoadingSpinner';

/**
 * Confirmation Dialog Component
 * Simple yes/no confirmation dialog
 * 
 * @param {boolean} show / isOpen - Controls dialog visibility
 * @param {function} onCancel / onClose - Called when dialog should close
 * @param {function} onConfirm - Called when user confirms
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {boolean} loading - Shows spinner on confirm button
 * @param {boolean|string} variant / danger - Style variant (primary|danger)
 */
const ConfirmDialog = ({ 
  show, 
  isOpen, 
  onClose, 
  onCancel, 
  onConfirm, 
  title = "Confirmation", 
  message, 
  loading = false, 
  variant, 
  danger = false,
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}) => {
  const visible = typeof show === 'boolean' ? show : !!isOpen;
  if (!visible) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      (onCancel || onClose)?.();
    }
  };

  const onCancelHandler = () => (onCancel || onClose)?.();
  const isDanger = (variant === 'danger') || danger;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={handleBackdropClick} aria-labelledby="confirmDialogTitle" aria-modal="true" role="dialog">
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="confirmDialogTitle">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancelHandler} aria-label="Close" disabled={loading}></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancelHandler} disabled={loading}>
              {cancelText}
            </button>
            <button type="button" className={`btn btn-${isDanger ? 'danger' : 'primary'}`} onClick={onConfirm} disabled={loading}>
              {loading ? <ButtonSpinner /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
