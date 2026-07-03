import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { GlassContainer } from '../layout/GlassContainer';
import { Sparkles, Search, MessageSquare, AlertCircle, RefreshCw, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIPanelProps {
  onHighlightMessages: (ids: string[]) => void;
  onClearHighlights: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  onHighlightMessages,
  onClearHighlights,
}) => {
  const { roomId } = useChat();
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchActive, setSearchActive] = useState(false);

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  const handleSummarize = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await fetch(`${serverUrl}/api/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch summary');
      }
      setSummary(data.summary);
    } catch (err: any) {
      setSummaryError(err.message || 'Error occurred while generating summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchAnswer(null);
    onClearHighlights();

    try {
      const response = await fetch(`${serverUrl}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, query: searchQuery }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Search failed');
      }
      
      setSearchAnswer(data.answer);
      setSearchActive(true);
      if (data.relevantMessageIds && data.relevantMessageIds.length > 0) {
        onHighlightMessages(data.relevantMessageIds);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error occurred during semantic search.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchAnswer(null);
    setSearchActive(false);
    setSearchError(null);
    onClearHighlights();
  };

  const isAnyLoading = summaryLoading || searchLoading;

  return (
    <GlassContainer className="w-full h-full p-6 flex flex-col justify-start relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-glow-bio/10 blur-2xl pointer-events-none" />
      <div className="absolute top-[40%] -left-10 w-32 h-32 rounded-full bg-clay-coral/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-4 mb-6">
        <Sparkles className="w-5 h-5 text-glow-bio" />
        <h2 className="font-display text-xl font-semibold text-white">AI Utilities</h2>
      </div>

      {/* Liquid Dome Animation */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-20 h-20 rounded-t-full border border-white/20 bg-white/5 overflow-hidden flex items-end justify-center">
          {/* Liquid representation */}
          <div
            className={`
              w-[200%] absolute left-[-50%] transition-all duration-1000 ease-in-out
              ${isAnyLoading 
                ? 'h-[85%] bg-glow-bio/40 animate-pulse glow-active' 
                : 'h-[20%] bg-clay-coral/20'
              }
            `}
            style={{
              borderRadius: '38%',
              transform: isAnyLoading ? 'rotate(360deg)' : 'none',
              transitionProperty: 'height, background-color, transform',
              animation: isAnyLoading ? 'bioluminescent-pulse 2s infinite ease-in-out' : 'none',
            }}
          />
          {/* Glass glare overlay */}
          <div className="absolute top-1 left-3 w-4 h-1.5 bg-white/40 rounded-full blur-[0.5px]" />
          <Sparkles 
            className={`
              w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-colors duration-500
              ${isAnyLoading ? 'text-white animate-spin' : 'text-gray-400'}
            `}
            style={{ animationDuration: isAnyLoading ? '3s' : '0s' }}
          />
        </div>
        <span className="text-[10px] text-gray-400 font-mono mt-2 tracking-wider uppercase">
          {isAnyLoading ? 'Bioluminescence Active' : 'Pool Calm'}
        </span>
      </div>

      {/* Utilities Container */}
      <div className="space-y-6 overflow-y-auto flex-1 pr-1">
        {/* 1. Summary Utility */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-300 font-mono tracking-wider uppercase">
            Tide Pool Summary
          </h3>
          
          {!summary && !summaryLoading && !summaryError && (
            <button
              onClick={handleSummarize}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium text-xs hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-glow-bio" />
              <span>Summarize Recent Chat</span>
            </button>
          )}

          {summaryLoading && (
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl animate-pulse space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-5/6"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          )}

          {summaryError && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">Summary Failed</span>
              </div>
              <p>{summaryError}</p>
              <button
                onClick={handleSummarize}
                className="text-[10px] text-glow-bio underline hover:text-white cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {summary && !summaryLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="clay-surface-sand text-pool-deep p-4 rounded-2xl relative shadow-md"
            >
              {/* Pebble shine */}
              <div className="absolute top-1 left-2 w-3.5 h-1 bg-white/60 rounded-full blur-[0.5px]" />
              <p className="text-xs leading-relaxed font-sans">{summary}</p>
              
              <div className="mt-3 flex justify-between items-center text-[10px] text-pool-mid/60 font-mono">
                <span>Summary Generated</span>
                <button
                  onClick={handleSummarize}
                  className="flex items-center space-x-1 hover:text-pool-deep cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* 2. Semantic Search Utility */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-xs font-semibold text-gray-300 font-mono tracking-wider uppercase">
            Semantic Search
          </h3>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-2.5 clay-input text-xs text-white placeholder-gray-500 pr-8"
                placeholder="Ask e.g. 'what did A say about coffee?'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              className="px-3.5 rounded-full clay-surface-coral text-white text-xs font-medium hover:bg-clay-coral/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              Ask
            </button>
          </form>

          {searchLoading && (
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl animate-pulse space-y-2">
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
              <div className="h-3 bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-white/10 rounded w-5/6"></div>
            </div>
          )}

          {searchError && (
            <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">Search Failed</span>
              </div>
              <p>{searchError}</p>
            </div>
          )}

          {searchActive && searchAnswer && !searchLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl border border-glow-bio/35 bg-white/5 shadow-md relative"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-glow-bio font-mono uppercase tracking-wider">
                  AI Response
                </span>
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-xs leading-relaxed font-sans text-gray-200">
                {searchAnswer}
              </p>
              
              <div className="mt-3 text-[9px] text-gray-500 font-mono">
                *Bubbles analyzed and highlighted in chat basin.
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </GlassContainer>
  );
};
