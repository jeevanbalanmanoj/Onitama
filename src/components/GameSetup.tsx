import { useState } from 'react';
import type { GameMode, AIDifficulty } from '../types';

interface GameSetupProps {
  onStart: (mode: GameMode, difficulty: AIDifficulty) => void;
}

export default function GameSetup({ onStart }: GameSetupProps) {
  const [mode, setMode] = useState<GameMode>('local');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-amber-100/80 px-4">
      <div className="max-w-md w-full">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold text-amber-900 mb-2 tracking-wide">
            Onitama
          </h1>
          <p className="text-lg text-amber-800/50">
            A game of martial tactics
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/50 space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-800/70 mb-3 uppercase tracking-wider">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('local')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                  mode === 'local'
                    ? 'bg-amber-700 text-amber-50 border-amber-700 shadow-md'
                    : 'bg-white/80 text-amber-800 border-amber-300/50 hover:border-amber-400'
                }`}
              >
                <div className="text-lg">🎎</div>
                <div className="text-sm mt-1">Local PvP</div>
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                  mode === 'ai'
                    ? 'bg-amber-700 text-amber-50 border-amber-700 shadow-md'
                    : 'bg-white/80 text-amber-800 border-amber-300/50 hover:border-amber-400'
                }`}
              >
                <div className="text-lg">🤖</div>
                <div className="text-sm mt-1">vs AI</div>
              </button>
            </div>
          </div>

          {/* AI Difficulty (only shown in AI mode) */}
          {mode === 'ai' && (
            <div>
              <label className="block text-sm font-medium text-amber-800/70 mb-3 uppercase tracking-wider">
                AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-2.5 rounded-lg font-medium text-sm capitalize transition-all duration-200 border-2 ${
                      difficulty === d
                        ? 'bg-amber-700 text-amber-50 border-amber-700 shadow-md'
                        : 'bg-white/80 text-amber-800 border-amber-300/50 hover:border-amber-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={() => onStart(mode, difficulty)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700 to-red-800 text-white font-bold text-lg hover:from-red-800 hover:to-red-900 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Begin Match
          </button>
        </div>

        {/* Rules hint */}
        <p className="text-center mt-6 text-sm text-amber-800/40">
          Capture the opponent's Master or move your Master to their Temple
        </p>
      </div>
    </div>
  );
}
