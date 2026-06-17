import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
  const modalRoot = document.getElementById('modal-root') ?? document.body;
  return createPortal(children, modalRoot);
};

export default Portal;
