import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

export interface Message {
  _id: string;
  roomId: string;
  nickname: string;
  text: string;
  createdAt: string;
}

interface ChatContextProps {
  nickname: string;
  roomId: string;
  joined: boolean;
  messages: Message[];
  presenceList: string[];
  errorMessage: string | null;
  joinRoom: (nickname: string, roomId?: string) => void;
  sendMessage: (text: string) => void;
  leaveRoom: () => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextProps>({
  nickname: '',
  roomId: 'main',
  joined: false,
  messages: [],
  presenceList: [],
  errorMessage: null,
  joinRoom: () => {},
  sendMessage: () => {},
  leaveRoom: () => {},
  clearError: () => {},
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket, connected } = useSocket();
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('main');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [presenceList, setPresenceList] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !connected) {
      // If we disconnect from socket, mark as not joined
      if (joined) {
        setJoined(false);
        setErrorMessage('Disconnected from server. Retrying connection...');
      }
      return;
    }

    // Subscribe to chat history
    const onChatHistory = (history: Message[]) => {
      console.log('Received chat history, messages count:', history.length);
      setMessages(history);
      setJoined(true);
      setErrorMessage(null);
    };

    // Subscribe to new messages
    const onNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    // Subscribe to presence updates
    const onPresenceUpdate = (list: string[]) => {
      setPresenceList(list);
    };

    // Subscribe to error events from server
    const onError = (msg: string) => {
      setErrorMessage(msg);
    };

    // Presence notice listeners
    const onUserJoined = (data: { nickname: string }) => {
      console.log(`${data.nickname} joined the chat`);
    };

    const onUserLeft = (data: { nickname: string }) => {
      console.log(`${data.nickname} left the chat`);
    };

    socket.on('chat-history', onChatHistory);
    socket.on('new-message', onNewMessage);
    socket.on('presence-update', onPresenceUpdate);
    socket.on('error-message', onError);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);

    // If socket reconnected and we had nickname, rejoin automatically
    if (nickname && !joined) {
      socket.emit('join', { nickname, roomId });
    }

    return () => {
      socket.off('chat-history', onChatHistory);
      socket.off('new-message', onNewMessage);
      socket.off('presence-update', onPresenceUpdate);
      socket.off('error-message', onError);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
    };
  }, [socket, connected, nickname, roomId, joined]);

  const joinRoom = (name: string, room = 'main') => {
    if (!socket || !connected) {
      setErrorMessage('Server connection is not established yet. Please wait...');
      return;
    }
    const cleanNickname = name.trim();
    const cleanRoomId = room.trim() || 'main';

    setNickname(cleanNickname);
    setRoomId(cleanRoomId);
    setErrorMessage(null);

    socket.emit('join', { nickname: cleanNickname, roomId: cleanRoomId });
  };

  const sendMessage = (text: string) => {
    if (!socket || !connected || !joined) {
      setErrorMessage('Cannot send message: Not connected to the room.');
      return;
    }
    socket.emit('send-message', { text });
  };

  const leaveRoom = () => {
    setJoined(false);
    setNickname('');
    setMessages([]);
    setPresenceList([]);
    setErrorMessage(null);
    // Reload page or let Socket handle room departure naturally on socket reset
    if (socket) {
      // Disconnect and reconnect to clear room state on server
      socket.disconnect();
      socket.connect();
    }
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return (
    <ChatContext.Provider
      value={{
        nickname,
        roomId,
        joined,
        messages,
        presenceList,
        errorMessage,
        joinRoom,
        sendMessage,
        leaveRoom,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
