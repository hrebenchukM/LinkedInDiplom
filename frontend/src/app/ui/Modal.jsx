import React, { useEffect } from 'react';
import './Modal.css';
import Portal from './Portal';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  className = '',
  bodyClassName = '',
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className={`modal-content ${className}`.trim()}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          <div className="modal-header">
            <h2 id="modal-title">{title}</h2>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className={`modal-body ${bodyClassName}`.trim()}>{children}</div>

          {footer ? <div className="modal-footer">{footer}</div> : null}
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
