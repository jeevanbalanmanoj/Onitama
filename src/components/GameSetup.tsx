import { useState } from 'react';
import type { GameMode, AIDifficulty, Player } from '../types';

interface GameSetupProps {
  onStart: (mode: GameMode, difficulty: AIDifficulty, humanColor?: Player) => void;
}

function SwordsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Left sword */}
      <line x1="10" y1="38" x2="32" y2="10" />
      <line x1="28" y1="14" x2="34" y2="8" />
      <line x1="30" y1="12" x2="36" y2="12" />
      <line x1="32" y1="10" x2="32" y2="16" />
      <line x1="12" y1="34" x2="8" y2="38" />
      {/* Right sword */}
      <line x1="38" y1="38" x2="16" y2="10" />
      <line x1="20" y1="14" x2="14" y2="8" />
      <line x1="18" y1="12" x2="12" y2="12" />
      <line x1="16" y1="10" x2="16" y2="16" />
      <line x1="36" y1="34" x2="40" y2="38" />
    </svg>
  );
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24,8 C20,8 16,10 15,14 C12,14 9,17 9,21 C9,24 10,26 12,27 C11,29 11,32 13,34 C15,36 18,37 20,36 C21,38 23,40 24,40" />
      <path d="M24,8 C28,8 32,10 33,14 C36,14 39,17 39,21 C39,24 38,26 36,27 C37,29 37,32 35,34 C33,36 30,37 28,36 C27,38 25,40 24,40" />
      <line x1="24" y1="14" x2="24" y2="40" />
      <path d="M17,19 C19,19 21,18 22,16" />
      <path d="M31,19 C29,19 27,18 26,16" />
      <path d="M14,27 C17,26 20,25 22,22" />
      <path d="M34,27 C31,26 28,25 26,22" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="4" ry="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
      <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function LearnModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-amber-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-amber-200/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-200/50">
          <h2 className="text-xl font-bold text-amber-900" style={{ fontFamily: '"Noto Serif JP", serif' }}>
            How to Play
          </h2>
          <button onClick={onClose} className="text-amber-700/50 hover:text-amber-900 text-xl leading-none">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4 text-sm text-amber-900/80 leading-relaxed">
          {/* YouTube embed */}
          <section>
            <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/IFRewjcngwU"
                title="How to play Onitama"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-amber-900 mb-1">Goal</h3>
            <p>Win by <strong>capturing your opponent's Master</strong> (king piece) or by moving <strong>your Master onto their Temple</strong> (the marked shrine square).</p>
          </section>

          <section>
            <h3 className="font-semibold text-amber-900 mb-1">Setup</h3>
            <p>Each player has <strong>1 Master + 4 Students</strong> on a 5×5 board. Five movement cards are dealt: 2 per player, 1 neutral.</p>
          </section>

          <section>
            <h3 className="font-semibold text-amber-900 mb-1">On Your Turn</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Pick one of your two cards.</li>
              <li>Move any one of your pieces using that card's pattern.</li>
              <li>Your used card goes to the neutral slot; the old neutral card becomes yours.</li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold text-amber-900 mb-1">Movement</h3>
            <p>Each card shows a pattern of squares relative to the piece. You can land on empty squares or <strong>capture</strong> an opponent's piece. You cannot land on your own pieces or move off the board.</p>
          </section>

          <section>
            <h3 className="font-semibold text-amber-900 mb-1">Winning</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Way of the Stone</strong> — Capture the opponent's Master.</li>
              <li><strong>Way of the Stream</strong> — Move your Master to the opponent's Temple square.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}

export default function GameSetup({ onStart }: GameSetupProps) {
  const [mode, setMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [humanColor, setHumanColor] = useState<Player>('red');
  const [showLearn, setShowLearn] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-seigaiha px-4 relative overflow-hidden">
      {/* Decorative ink-wash circles */}
      <div className="absolute top-[-120px] right-[-80px] w-80 h-80 rounded-full bg-red-900/[0.03] blur-2xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-72 h-72 rounded-full bg-amber-800/[0.04] blur-2xl pointer-events-none" />

      {/* Background Japanese calligraphy & pagoda */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        {/* Large kanji characters */}
        <span className="absolute top-[8%] left-[5%] text-[140px] font-bold text-amber-800/[0.035] rotate-[-12deg]" style={{ fontFamily: '"Noto Serif JP", serif' }}>武</span>
        <span className="absolute top-[15%] right-[8%] text-[100px] font-bold text-amber-800/[0.03] rotate-[8deg]" style={{ fontFamily: '"Noto Serif JP", serif' }}>道</span>
        <span className="absolute bottom-[20%] left-[8%] text-[110px] font-bold text-amber-800/[0.03] rotate-[6deg]" style={{ fontFamily: '"Noto Serif JP", serif' }}>心</span>
        <span className="absolute bottom-[10%] right-[5%] text-[90px] font-bold text-amber-800/[0.035] rotate-[-5deg]" style={{ fontFamily: '"Noto Serif JP", serif' }}>鬼</span>
        <span className="absolute top-[45%] left-[2%] text-[80px] font-bold text-amber-800/[0.025] rotate-[-8deg]" style={{ fontFamily: '"Noto Serif JP", serif' }}>気</span>
        <span className="absolute top-[50%] right-[3%] text-[70px] font-bold text-amber-800/[0.025] rotate-[10deg]" style={{ fontFamily: '"Noto Serif JP", serif' }}>勝</span>

        {/* Pagoda silhouette */}
        <svg viewBox="0 0 200 400" className="absolute bottom-0 right-[12%] w-48 h-96 text-amber-800/[0.035]" fill="currentColor">
          {/* Base platform */}
          <rect x="60" y="380" width="80" height="8" rx="2" />
          {/* First floor */}
          <rect x="72" y="320" width="56" height="60" />
          <path d="M50,320 L100,300 L150,320 Z" />
          <path d="M40,320 L100,296 L160,320 Z" fill="none" stroke="currentColor" strokeWidth="3" />
          {/* Second floor */}
          <rect x="78" y="260" width="44" height="40" />
          <path d="M55,260 L100,240 L145,260 Z" />
          <path d="M48,260 L100,237 L152,260 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
          {/* Third floor */}
          <rect x="82" y="210" width="36" height="30" />
          <path d="M62,210 L100,192 L138,210 Z" />
          <path d="M56,210 L100,189 L144,210 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Top floor */}
          <rect x="88" y="170" width="24" height="22" />
          <path d="M70,170 L100,155 L130,170 Z" />
          <path d="M65,170 L100,152 L135,170 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          {/* Spire */}
          <rect x="98" y="130" width="4" height="25" />
          <circle cx="100" cy="126" r="6" />
          <path d="M100,100 L100,120" stroke="currentColor" strokeWidth="3" />
          <circle cx="100" cy="98" r="4" />
        </svg>
      </div>

      <div className="max-w-sm w-full relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-7xl font-bold text-amber-900 mb-3 tracking-wide" style={{ fontFamily: '"Noto Serif JP", serif' }}>
            Onitama
          </h1>
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="h-px w-12 bg-amber-800/20" />
            <p className="text-sm text-amber-800/40 tracking-[0.25em] uppercase">
              Martial Tactics
            </p>
            <div className="h-px w-12 bg-amber-800/20" />
          </div>
          <p className="text-xs text-amber-800/35 mt-2 leading-relaxed">
            Capture the opponent's Master or move your Master to their Temple!
          </p>
        </div>

        {/* Mode Selection — modern toggle-style */}
        <div className="space-y-3">
          <button
            onClick={() => setMode('ai')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 border ${
              mode === 'ai'
                ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-lg shadow-amber-900/20'
                : 'bg-white/50 text-amber-900 border-amber-200/60 hover:bg-white/70 hover:border-amber-300/80'
            }`}
          >
            <BrainIcon className={`w-8 h-8 shrink-0 ${mode === 'ai' ? 'text-amber-200' : 'text-amber-700/60'}`} />
            <div className="text-left">
              <div className="font-semibold text-base">Single Player</div>
              <div className={`text-xs mt-0.5 ${mode === 'ai' ? 'text-amber-200/70' : 'text-amber-700/40'}`}>
                Challenge the AI
              </div>
            </div>
          </button>

          {/* AI Difficulty + Color */}
          {mode === 'ai' && (
            <div className="flex gap-2 px-1">
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl font-medium text-sm capitalize transition-all duration-200 border ${
                    difficulty === d
                      ? 'bg-red-800 text-white border-red-800 shadow-md'
                      : 'bg-white/40 text-amber-800 border-amber-200/50 hover:border-amber-300'
                  }`}
                >
                  {d}
                </button>
              ))}
              <div className="w-px bg-amber-200/50 mx-0.5" />
              <button
                onClick={() => setHumanColor(humanColor === 'red' ? 'blue' : 'red')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 border whitespace-nowrap ${
                  humanColor === 'red'
                    ? 'bg-red-700 text-white border-red-700 shadow-md'
                    : 'bg-blue-700 text-white border-blue-700 shadow-md'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${humanColor === 'red' ? 'bg-red-300' : 'bg-blue-300'}`} />
                {humanColor === 'red' ? 'Red' : 'Blue'}
              </button>
            </div>
          )}

          <button
            onClick={() => setMode('local')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 border ${
              mode === 'local'
                ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-lg shadow-amber-900/20'
                : 'bg-white/50 text-amber-900 border-amber-200/60 hover:bg-white/70 hover:border-amber-300/80'
            }`}
          >
            <SwordsIcon className={`w-8 h-8 shrink-0 ${mode === 'local' ? 'text-amber-200' : 'text-amber-700/60'}`} />
            <div className="text-left">
              <div className="font-semibold text-base">Local Multiplayer</div>
              <div className={`text-xs mt-0.5 ${mode === 'local' ? 'text-amber-200/70' : 'text-amber-700/40'}`}>
                Two players, one device
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode('online')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 border ${
              mode === 'online'
                ? 'bg-amber-900 text-amber-50 border-amber-900 shadow-lg shadow-amber-900/20'
                : 'bg-white/50 text-amber-900 border-amber-200/60 hover:bg-white/70 hover:border-amber-300/80'
            }`}
          >
            <GlobeIcon className={`w-8 h-8 shrink-0 ${mode === 'online' ? 'text-amber-200' : 'text-amber-700/60'}`} />
            <div className="text-left">
              <div className="font-semibold text-base">Online Multiplayer</div>
              <div className={`text-xs mt-0.5 ${mode === 'online' ? 'text-amber-200/70' : 'text-amber-700/40'}`}>
                Play with a friend via link
              </div>
            </div>
          </button>

          {/* Start Button */}
          <button
            onClick={() => onStart(mode, difficulty, humanColor)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-800 to-red-900 text-white font-bold text-lg tracking-wide hover:from-red-900 hover:to-red-950 transition-all duration-200 shadow-lg shadow-red-900/25 hover:shadow-xl active:scale-[0.98] mt-2"
          >
            Begin Match
          </button>
        </div>

        {/* Learn to Play */}
        <button
          onClick={() => setShowLearn(true)}
          className="flex items-center justify-center gap-2 mx-auto mt-6 px-4 py-2 rounded-xl text-sm text-amber-800/60 hover:text-amber-900 hover:bg-white/40 transition-all duration-200 border border-transparent hover:border-amber-200/50"
        >
          <BookIcon className="w-4 h-4" />
          Learn to Play
        </button>
      </div>

      {showLearn && <LearnModal onClose={() => setShowLearn(false)} />}
    </div>
  );
}
