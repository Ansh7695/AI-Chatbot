import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { GlassContainer } from '../layout/GlassContainer';
import { MessageSquare, DoorOpen, AlertCircle } from 'lucide-react';

export const NicknameGate: React.FC = () => {
  const { joinRoom, errorMessage, clearError } = useChat();
  const { connected } = useSocket();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('main');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setRoom(roomParam.trim());
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a nickname.');
      return;
    }

    if (name.length > 20) {
      setValidationError('Nickname must be under 20 characters.');
      return;
    }

    if (room && room.length > 15) {
      setValidationError('Room name must be under 15 characters.');
      return;
    }

    joinRoom(name, room || 'main');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center min-h-[90vh] px-4"
    >
      <GlassContainer className="w-full max-w-md p-8 md:p-10 relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-glow-bio/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-clay-coral/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={connected ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-clay-coral text-white shadow-lg mb-4 clay-surface-coral"
          >
            <MessageSquare className="w-8 h-8" />
          </motion.div>
          
          <h1 className="font-display text-4xl md:text-5xl text-clay-coral font-bold tracking-tight mb-2">
            Cove
          </h1>
          <p className="text-gray-400 text-sm text-center">
            A quiet, real-time tide pool of conversation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-gray-300 text-sm font-medium mb-2 pl-1">
              Your Nickname
            </label>
            <input
              type="text"
              id="nickname"
              className="w-full px-5 py-3 clay-input text-white text-base"
              placeholder="e.g. Pebble, Wavelet..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationError(null);
                clearError();
              }}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="room" className="block text-gray-300 text-sm font-medium mb-2 pl-1">
              Room Identifier (Optional)
            </label>
            <input
              type="text"
              id="room"
              className="w-full px-5 py-3 clay-input text-white text-base"
              placeholder="defaults to 'main'"
              value={room}
              onChange={(e) => {
                setRoom(e.target.value);
                setValidationError(null);
                clearError();
              }}
              autoComplete="off"
            />
          </div>

          {/* Connection Status indicator */}
          <div className="flex items-center space-x-2 text-xs text-gray-400 pl-1">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-glow-bio animate-pulse glow-active' : 'bg-yellow-500 animate-pulse'}`} />
            <span>
              {connected ? 'Connected to server' : 'Connecting to websocket server...'}
            </span>
          </div>

          {/* Validation & API Error displays */}
          {(validationError || errorMessage) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-2 bg-red-900/20 border border-red-500/30 text-red-200 rounded-xl p-3 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{validationError || errorMessage}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={connected ? { scale: 1.02, y: -1 } : {}}
            whileTap={connected ? { scale: 0.98 } : {}}
            disabled={!connected}
            type="submit"
            className="w-full py-4 font-semibold text-white tracking-wide transition-all shadow-md flex items-center justify-center space-x-2 clay-surface-coral disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <DoorOpen className="w-5 h-5" />
            <span>Enter the Room</span>
          </motion.button>
        </form>
      </GlassContainer>
    </motion.div>
  );
};
