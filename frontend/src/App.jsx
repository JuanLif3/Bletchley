import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import AcceptInvite from './components/AcceptInvite';
import Sidebar from './components/Sidebar';
import websocketService from './services/websocket';
import { destructAPI } from './services/api';
import './App.css';

// Componente principal que maneja el estado
function MainApp({ user, setUser, selectedChat, setSelectedChat, isMobile }) {
  const navigate = useNavigate();
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Cargar estado de privacidad desde localStorage
  useEffect(() => {
    const savedPrivacy = localStorage.getItem('privacyMode');
    if (savedPrivacy === 'true') {
      setIsPrivacyMode(true);
      document.body.classList.add('privacy-mode');
    }
  }, []);

  const handleLogout = () => {
    websocketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedChat(null);
    navigate('/');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Toggle modo privacidad
  const handlePrivacyClick = () => {
    const newMode = !isPrivacyMode;
    setIsPrivacyMode(newMode);
    document.body.classList.toggle('privacy-mode', newMode);
    localStorage.setItem('privacyMode', JSON.stringify(newMode));
  };

  // Auto-destrucción
  const handleSelfDestruct = async () => {
    const confirm = window.confirm(
        '⚠️ ¡ATENCIÓN! Esto eliminará permanentemente tu cuenta, todos tus chats y mensajes. Esta acción no se puede deshacer. ¿Estás seguro?'
    );

    if (!confirm) return;

    try {
      await destructAPI.selfDestruct();
      websocketService.disconnect();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('privateKey');
      localStorage.removeItem('encryptedPrivateKey');
      localStorage.removeItem('privacyMode');
      setUser(null);
      setSelectedChat(null);
      navigate('/');
      alert('✅ Tu cuenta ha sido eliminada exitosamente');
    } catch (error) {
      console.error('Error en auto-destrucción:', error);
      alert('❌ Error al eliminar la cuenta: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSettingsClick = () => {
    console.log('🔧 Abrir configuración');
  };

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    if (isMobile) {
      document.querySelector('.chat-list-wrapper')?.classList.add('hidden');
      document.querySelector('.chat-wrapper')?.classList.remove('hidden');
    }
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    if (isMobile) {
      document.querySelector('.chat-list-wrapper')?.classList.remove('hidden');
      document.querySelector('.chat-wrapper')?.classList.add('hidden');
    }
  };

  if (!user) {
    return <Login onLogin={(userData) => {
      setUser(userData);
      const token = localStorage.getItem('token');
      if (token) {
        websocketService.connect(token);
      }
      navigate('/');
    }} />;
  }

  return (
      <div className="app">
        <div className="app-container">
          <div className="app-main">
            <div className={`chat-list-wrapper ${isMobile && selectedChat ? 'hidden' : ''}`}>
              <ChatList
                  onSelectChat={handleSelectChat}
                  onLogout={handleLogout}
                  onProfileUpdate={handleProfileUpdate}
              />
            </div>

            <div className={`chat-wrapper ${!selectedChat ? 'hidden' : ''}`}>
              {selectedChat ? (
                  <Chat chatId={selectedChat} onBack={handleBackToChats} />
              ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <p className="empty-state-title">Selecciona un chat</p>
                    <p className="empty-state-hint">o inicia una nueva conversación</p>
                  </div>
              )}
            </div>

            <Sidebar
                onSettingsClick={handleSettingsClick}
                onPrivacyClick={handlePrivacyClick}
                onSelfDestructClick={handleSelfDestruct}
            />
          </div>
        </div>
      </div>
  );
}

// Componente App principal con Router
function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        websocketService.connect(token);
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <MainApp
                user={user}
                setUser={setUser}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                isMobile={isMobile}
            />
          } />
          <Route path="/register" element={<Register onRegister={() => window.location.href = '/'} />} />
          <Route path="/invite/:token" element={<AcceptInvite />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;