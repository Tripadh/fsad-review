import { useEffect, useRef, useState } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef(null);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay${closing ? ' modal-overlay--closing' : ''}`}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div className={`modal-content modal-content--${size}${closing ? ' modal-content--closing' : ''}`}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
