import { useState } from 'react';
import '../styles/Sidebar.css';

function Sidebar({ onSettingsClick, onPrivacyClick, onSelfDestructClick }) {
    const [activeTooltip, setActiveTooltip] = useState(null);

    const handleMouseEnter = (tooltip) => {
        setActiveTooltip(tooltip);
    };

    const handleMouseLeave = () => {
        setActiveTooltip(null);
    };

    return (
        <div className="sidebar">
            {/* Icono 1: Configuración / Perfil */}
            <div
                className="sidebar-icon"
                onClick={onSettingsClick}
                onMouseEnter={() => handleMouseEnter('settings')}
                onMouseLeave={handleMouseLeave}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                {activeTooltip === 'settings' && (
                    <div className="sidebar-tooltip">Configuración</div>
                )}
            </div>

            {/* Icono 2: Privacidad */}
            <div
                className="sidebar-icon"
                onClick={onPrivacyClick}
                onMouseEnter={() => handleMouseEnter('privacy')}
                onMouseLeave={handleMouseLeave}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    <circle cx="12" cy="16" r="1.5"/>
                    <path d="M12 16v2"/>
                </svg>
                {activeTooltip === 'privacy' && (
                    <div className="sidebar-tooltip">Privacidad</div>
                )}
            </div>

            {/* Icono 3: Auto-destrucción */}
            <div
                className="sidebar-icon sidebar-icon-danger"
                onMouseDown={onSelfDestructClick}
                onMouseEnter={() => handleMouseEnter('selfdestruct')}
                onMouseLeave={handleMouseLeave}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                {activeTooltip === 'selfdestruct' && (
                    <div className="sidebar-tooltip sidebar-tooltip-danger">
                        Mantén 5s para auto-destruir
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;