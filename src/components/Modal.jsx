import { HiOutlineX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${size === 'lg' ? 'modal-lg' : ''}`}
                onClick={e => e.stopPropagation()}
                style={size === 'lg' ? { maxWidth: '720px' } : {}}
            >
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <HiOutlineX />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
