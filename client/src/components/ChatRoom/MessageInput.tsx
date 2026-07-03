import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const MessageInput: React.FC = () => {
  const { sendMessage } = useChat();
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendMessage(text);
    setText('');
    
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/10 rounded-b-3xl flex items-center gap-3">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-5 py-3.5 clay-input text-white text-sm placeholder-gray-500 pr-12 font-sans"
          placeholder="Cast a pebble into the pool..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        
        {/* Subtle input reflection indicator */}
        <div className="absolute top-1.5 left-4 w-4 h-0.5 bg-white/20 rounded-full pointer-events-none" />
      </div>

      <motion.button
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!text.trim()}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-md cursor-pointer
          ${text.trim() 
            ? 'clay-surface-coral hover:bg-clay-coral/90' 
            : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
          }
        `}
      >
        <Send className="w-5 h-5" />
      </motion.button>
    </form>
  );
};
