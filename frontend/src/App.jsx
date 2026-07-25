import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import AcceptInvite from './components/AcceptInvite';
import websocketService from './services/websocket';
import './App.css';

// Componente principal que maneja el estado
function MainApp({ user, setUser, selectedChat, setSelectedChat, isMobile }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    websocketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedChat(null);
    navigate('/');
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
              <ChatList onSelectChat={handleSelectChat} />
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
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
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