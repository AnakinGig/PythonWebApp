import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'error', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'error' ? 'bg-danger' : type === 'success' ? 'bg-success' : 'bg-info';

  return (
    <div 
      className={`toast show position-fixed top-0 end-0 m-3 ${bgColor} text-white`} 
      role="alert" 
      style={{ zIndex: 9999, minWidth: '300px' }}
    >
      <div className="toast-header">
        <strong className="me-auto">
          {type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : 'ℹInfo'}
        </strong>
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        ></button>
      </div>
      <div className="toast-body">
        {message}
      </div>
    </div>
  );
};

export default Toast;
