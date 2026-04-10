import { motion, AnimatePresence } from 'motion/react';
import type { Player } from '../types';

interface WinOverlayProps {
  winner: Player;
  winMethod: 'stone' | 'stream';
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function WinOverlay({ winner, winMethod, onPlayAgain, onBackToMenu }: WinOverlayProps) {
  const methodName = winMethod === 'stone' ? 'the Stone' : 'the Stream';
  const winnerColor = winner === 'red' ? 'text-red-600' : 'text-blue-600';
  const winnerBg = winner === 'red' ? 'from-red-500/10' : 'from-blue-500/10';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          className={`bg-gradient-to-b ${winnerBg} to-amber-50 rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center border border-amber-300/30`}
        >
          <div className="text-5xl mb-3">
            {winMethod === 'stone' ? '⚔️' : '🏯'}
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${winnerColor}`}>
            {winner === 'red' ? 'Red' : 'Blue'} Wins!
          </h2>
          <p className="text-amber-800/70 mb-6">
            Victory by Way of {methodName}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onPlayAgain}
              className="px-5 py-2.5 rounded-lg bg-amber-700 text-amber-50 font-medium hover:bg-amber-800 transition-colors shadow-md"
            >
              Play Again
            </button>
            <button
              onClick={onBackToMenu}
              className="px-5 py-2.5 rounded-lg border-2 border-amber-700/30 text-amber-800 font-medium hover:bg-amber-100 transition-colors"
            >
              Menu
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
