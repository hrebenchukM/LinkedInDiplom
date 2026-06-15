import React from 'react';
import './Modal.css';
import Portal from './Portal';

const Modal = ({ isOpen, onClose, title, children,className = '' }) => {
  if (!isOpen) return null;

  return (
    <Portal>
 <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
    </Portal>
  );
};

export default Modal;


