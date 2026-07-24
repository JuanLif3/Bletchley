import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ChatList from './components/ChatList';
import Chat from './components/Chat';
import websocketService from './services/websocket';
import './App.css';
function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isRegister, setIsRegister] = useState(window.location.pathname === '/register');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    // Verificar sesión guardada
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

  useEffect(() => {
    const handlePopState = () => {
      setIsRegister(window.location.pathname === '/register');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    const token = localStorage.getItem('token');
    if (token) {
      websocketService.connect(token);
    }
    window.history.pushState({}, '', '/');
    setIsRegister(false);
  };

  const handleLogout = () => {
    websocketService.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedChat(null);
    window.location.href = '/';
  };

  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    // En móvil, ocultar la lista de chats
    if (isMobile) {
      document.querySelector('.chat-list-wrapper')?.classList.add('hidden');
      document.querySelector('.chat-wrapper')?.classList.remove('hidden');
    }
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    // En móvil, mostrar la lista de chats
    if (isMobile) {
      document.querySelector('.chat-list-wrapper')?.classList.remove('hidden');
      document.querySelector('.chat-wrapper')?.classList.add('hidden');
    }
  };

  // Pantalla de Login/Register
  if (!user) {
    if (isRegister) {
      return <Register onRegister={() => { window.location.href = '/'; }} />;
    }
    return <Login onLogin={handleLogin} />;
  }

  // Pantalla principal con chats
  return (
      <div className="app">
        <div className="app-container">
          <div className="app-main">
            {/* Lista de chats - siempre visible en desktop */}
            <div className={`chat-list-wrapper ${isMobile && selectedChat ? 'hidden' : ''}`}>
              <ChatList onSelectChat={handleSelectChat} />
            </div>

            {/* Chat - visible cuando hay uno seleccionado */}
            <div className={`chat-wrapper ${!selectedChat ? 'hidden' : ''}`}>
              {selectedChat ? (
                  <Chat chatId={selectedChat} onBack={handleBackToChats} />
              ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    color: '#3a3f4e',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>💬</div>
                    <p style={{ fontSize: '0.95rem' }}>Selecciona un chat</p>
                    <p style={{ fontSize: '0.8rem', color: '#2a2f3e' }}>o inicia una nueva conversación</p>
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

export default App;