import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { PresenceBar } from './PresenceBar';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { AIPanel } from '../AIPanel/AIPanel';
import { GlassContainer } from '../layout/GlassContainer';
import { Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatRoom: React.FC = () => {
  const { errorMessage, clearError } = useChat();
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleHighlight = (ids: string[]) => {
    setHighlightedIds(ids);
  };

  const handleClearHighlights = () => {
    setHighlightedIds([]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 md:py-6 h-[95vh] flex flex-col justify-between relative">
      {/* Global Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 inset-x-4 z-50 flex items-center justify-between bg-red-950/90 border border-red-500/35 text-red-200 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md text-sm"
          >
            <span>{errorMessage}</span>
            <button
              onClick={clearError}
              className="p-1 rounded-full hover:bg-white/10 transition-colors text-red-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[88vh] items-stretch relative">
        {/* Main Chat Basin */}
        <div className="col-span-1 lg:col-span-3 flex flex-col justify-between h-full relative">
          <GlassContainer className="flex-1 flex flex-col justify-between h-full border-white/10 overflow-hidden relative">
            <PresenceBar />
            <MessageList highlightedIds={highlightedIds} />
            <MessageInput />
          </GlassContainer>
        </div>

        {/* Desktop AI Panel Sidebar */}
        <div className="hidden lg:block col-span-1 h-full">
          <AIPanel
            onHighlightMessages={handleHighlight}
            onClearHighlights={handleClearHighlights}
          />
        </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile AI Utilities */}
      <div className="lg:hidden fixed bottom-20 right-6 z-30">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMobileDrawerOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white clay-surface-coral shadow-lg focus:outline-none glow-active cursor-pointer"
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Mobile Sliding Glass Bottom Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-pool-deep/70 backdrop-blur-sm z-30 lg:hidden"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-40 h-[75vh] rounded-t-[32px] border-t border-white/20 bg-pool-mid/95 backdrop-blur-2xl shadow-2xl p-5 flex flex-col lg:hidden"
            >
              {/* Grab/Close Handle bar */}
              <div 
                className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 cursor-pointer" 
                onClick={() => setIsMobileDrawerOpen(false)} 
              />
              <div className="flex justify-between items-center mb-4 pl-1">
                <span className="font-display text-lg font-bold text-white">AI Tools</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AIPanel
                  onHighlightMessages={handleHighlight}
                  onClearHighlights={handleClearHighlights}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
