import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { LogOut, Users, Tag, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const PresenceBar: React.FC = () => {
  const { roomId, nickname, presenceList, leaveRoom } = useChat();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy share link:', err);
      });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-white/10 bg-white/5 backdrop-blur-md rounded-t-3xl">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pool-mid text-glow-bio border border-glow-bio/30">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-display font-bold text-lg text-white capitalize leading-tight">
              Room: {roomId}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className={`
                px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all duration-300
                ${copied 
                  ? 'bg-glow-bio/20 text-glow-bio border border-glow-bio/30' 
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }
              `}
              title="Copy share link"
            >
              {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
              <span className="text-[9px]">{copied ? 'Copied!' : 'Share'}</span>
            </motion.button>
          </div>
          <p className="text-xs text-gray-400">
            Logged in as <span className="text-clay-coral font-semibold">{nickname}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 max-w-full md:max-w-[50%] overflow-x-auto py-1">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 mr-2 flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-glow-bio" />
          <span>Active ({presenceList.length}):</span>
        </div>
        
        {presenceList.map((user, idx) => {
          const isSelf = user === nickname;
          return (
            <div
              key={`${user}-${idx}`}
              className={`
                px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 border transition-all duration-300
                ${isSelf 
                  ? 'bg-clay-coral/20 text-clay-coral border-clay-coral/30' 
                  : 'bg-white/10 text-gray-200 border-white/5'
                }
              `}
            >
              {user} {isSelf && '(you)'}
            </div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={leaveRoom}
        className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white tracking-wider bg-red-950/40 border border-red-500/30 hover:bg-red-900/40 transition-colors cursor-pointer self-start md:self-auto"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Leave</span>
      </motion.button>
    </div>
  );
};
