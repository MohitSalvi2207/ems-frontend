import { HiOutlineExclamation, HiOutlineX } from 'react-icons/hi';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?', type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onClose}>
            <div className="confirm-dialog animate-slideUp" onClick={e => e.stopPropagation()}>
                <button className="confirm-close" onClick={onClose}><HiOutlineX /></button>

                <div className={`confirm-icon confirm-icon-${type}`}>
                    <HiOutlineExclamation />
                </div>

                <h3 className="confirm-title">{title}</h3>
                <p className="confirm-message">{message}</p>

                <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); onClose(); }}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
