import "./Modal.css";

function Modal({ title, onClose, children }) {
    return (
        <div className="modalOverlay" onClick={onClose}>
            <div className="modalBox" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                    <h3>{title}</h3>
                    <i className="fa-solid fa-xmark" onClick={onClose}></i>
                </div>
                <div className="modalContent">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;