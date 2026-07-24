import '../styles/EmptyState.css';

function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <p className="empty-state-title">Selecciona un chat</p>
            <p className="empty-state-hint">o inicia una nueva conversación</p>
        </div>
    );
}

export default EmptyState;