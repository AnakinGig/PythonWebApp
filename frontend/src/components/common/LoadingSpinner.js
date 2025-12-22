import React from 'react';

const LoadingSpinner = ({ size = 'md', message, text = 'Chargement...', fullscreen = false }) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border spinner-border-lg'
  }[size];

  return (
    <div className="d-flex align-items-center justify-content-center" style={fullscreen ? { minHeight: '100vh' } : undefined}>
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {(message || text) && <span className="ms-2">{message || text}</span>}
    </div>
  );
};

export const ButtonSpinner = () => (
  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
);

export default LoadingSpinner;
