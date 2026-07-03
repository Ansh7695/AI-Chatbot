import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves } from 'lucide-react';

interface MessageListProps {
  highlightedIds: string[];
}

export const MessageList: React.FC<MessageListProps> = ({ highlightedIds }) => {
  const { messages, nickname } = useChat();
  const listRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Monitor scroll position to see if user is reading older history
  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // If the user is within 120px of the bottom, enable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShouldAutoScroll(isAtBottom);
  };

  // Perform auto-scroll to bottom
  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      // Delay slightly to let DOM render
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, shouldAutoScroll]);

  // Initial scroll on join
  useEffect(() => {
    scrollToBottom();
    setShouldAutoScroll(true);
  }, []);

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-6 flex flex-col min-h-[350px] max-h-[60vh] md:max-h-[calc(100vh-250px)]"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 mb-3"
          >
            <Waves className="w-6 h-6 text-clay-coral/60" />
          </motion.div>
          <p className="font-display font-medium text-lg text-gray-400">The tide pool is still.</p>
          <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
            Send a message to create the first ripple in the conversation.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isOwn = message.nickname === nickname;
              const isHighlighted = highlightedIds.includes(message._id);

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn}
                  isHighlighted={isHighlighted}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
