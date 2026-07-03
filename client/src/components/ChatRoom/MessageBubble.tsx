import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../context/ChatContext';
import { Tag } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isHighlighted: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  isHighlighted,
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Format timestamp nicely
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  // Scroll into view if highlighted by AI search query
  useEffect(() => {
    if (isHighlighted && bubbleRef.current) {
      setTimeout(() => {
        bubbleRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [isHighlighted]);

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: isHighlighted ? 1.03 : 1,
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }}
      className={`flex flex-col mb-4 max-w-[80%] md:max-w-[70%] ${isOwn ? 'self-end items-end' : 'self-start items-start'}`}
    >
      {/* Sender Name */}
      <span className="text-xs text-gray-400 mb-1 px-2 font-mono flex items-center gap-1">
        {message.nickname}
        {isOwn && <span className="text-[10px] text-gray-500 font-sans">(You)</span>}
        {isHighlighted && <Tag className="w-3 h-3 text-glow-bio inline" />}
      </span>

      {/* Message Pebble */}
      <div
        className={`
          px-4 py-3 text-sm relative transition-all duration-300
          ${isOwn 
            ? 'clay-surface-sand text-pool-deep rounded-2xl rounded-tr-sm' 
            : 'glass-container text-white rounded-2xl rounded-tl-sm border-white/5 bg-white/5'
          }
          ${isHighlighted 
            ? 'ring-2 ring-glow-bio shadow-[0_0_20px_rgba(111,231,221,0.5)] glow-active' 
            : ''
          }
        `}
      >
        {/* Bioluminescent liquid reflection spot for own clay bubbles */}
        {isOwn && (
          <div className="absolute top-1.5 left-3 w-3 h-1 bg-white/60 rounded-full blur-[0.5px]" />
        )}
        
        <p className="whitespace-pre-wrap leading-relaxed tracking-wide font-sans">{message.text}</p>
        
        {/* Timestamp */}
        <div 
          className={`
            text-[9px] mt-1.5 text-right font-mono
            ${isOwn ? 'text-pool-mid/60' : 'text-gray-400'}
          `}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </motion.div>
  );
};
