import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  connected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Read the server URL from env or fallback to local port 5000
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    console.log(`Connecting to Socket server at: ${serverUrl}`);

    const socket = io(serverUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const onConnect = () => {
      console.log('Socket connected successfully');
      setConnected(true);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      console.log('Cleaning up socket connection...');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
