import React from 'react';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider, useChat } from './context/ChatContext';
import { NicknameGate } from './components/NicknameGate/NicknameGate';
import { ChatRoom } from './components/ChatRoom/ChatRoom';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { AnimatePresence } from 'framer-motion';

const MainApp: React.FC = () => {
  const { joined } = useChat();

  return (
    <div className="relative min-h-screen text-white select-none">
      {/* 3D Drifting Background Layer */}
      <AmbientBackground />

      <main className="relative z-10 w-full min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!joined ? (
            <NicknameGate key="gate" />
          ) : (
            <ChatRoom key="room" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <ChatProvider>
        <MainApp />
      </ChatProvider>
    </SocketProvider>
  );
}

export default App;
