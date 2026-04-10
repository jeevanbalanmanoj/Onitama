import { useState } from 'react';
import type { Player } from '../types';
import type { ConnectionStatus, LobbyStatus } from '../types/online';

interface OnlineLobbyProps {
  roomCode: string | null;
  connectionStatus: ConnectionStatus;
  lobbyStatus: LobbyStatus;
  errorMessage: string | null;
  onCreateRoom: (preferredColor?: Player) => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
}

export default function OnlineLobby({
  roomCode,
  connectionStatus,
  lobbyStatus,
  errorMessage,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: OnlineLobbyProps) {
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [preferredColor, setPreferredColor] = useState<Player>('red');

  const shareUrl = roomCode
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Waiting for opponent view
  if (lobbyStatus === 'waiting' && roomCode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-seigaiha px-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Room Created</h2>
            <p className="text-sm text-amber-800/50">Share this code with your opponent</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/50 space-y-5">
            {/* Room code display */}
            <div className="text-center">
              <button
                onClick={handleCopyCode}
                className="text-5xl font-mono font-bold text-amber-900 tracking-[0.3em] hover:text-amber-700 transition-colors cursor-pointer"
                title="Click to copy code"
              >
                {roomCode}
              </button>
            </div>

            {/* Share link */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-xs bg-amber-50/50 border border-amber-200/50 rounded-lg text-amber-800/60 truncate"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-xs rounded-lg bg-amber-800 text-amber-50 hover:bg-amber-900 transition-colors shrink-0"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 py-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
              <span className="text-sm text-amber-800/60">Waiting for opponent to join...</span>
            </div>

            {/* Connection status */}
            <div className="flex items-center justify-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <span className="text-xs text-amber-800/30">{connectionStatus}</span>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full mt-4 py-2.5 text-sm text-amber-800/50 hover:text-amber-800 transition-colors"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Default: create or join
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-seigaiha px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: '"Noto Serif JP", serif' }}>
            Online Match
          </h2>
          <p className="text-sm text-amber-800/40">Play against a friend online</p>
        </div>

        <div className="space-y-5">
          {/* Create room */}
          <button
            onClick={() => onCreateRoom(preferredColor)}
            disabled={lobbyStatus === 'creating'}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-amber-900 text-amber-50 border border-amber-900 shadow-lg shadow-amber-900/20 transition-all duration-200 hover:bg-amber-800 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 shrink-0 text-amber-200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <div className="text-left">
              <div className="font-semibold">Create Room</div>
              <div className="text-xs text-amber-200/70">Get a code to share</div>
            </div>
          </button>

          {/* Color preference */}
          <div className="flex items-center justify-center gap-2 px-1">
            <span className="text-xs text-amber-800/40">Play as</span>
            <div className="flex rounded-xl overflow-hidden border border-amber-200/50 shadow-sm">
              <button
                onClick={() => setPreferredColor('red')}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition-all duration-200 ${
                  preferredColor === 'red'
                    ? 'bg-red-700 text-white'
                    : 'bg-white/40 text-amber-800 hover:bg-white/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${preferredColor === 'red' ? 'bg-red-300' : 'bg-red-400/60'}`} />
                Red
              </button>
              <button
                onClick={() => setPreferredColor('blue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition-all duration-200 ${
                  preferredColor === 'blue'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white/40 text-amber-800 hover:bg-white/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${preferredColor === 'blue' ? 'bg-blue-300' : 'bg-blue-400/60'}`} />
                Blue
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-amber-800/15" />
            <span className="text-xs text-amber-800/30 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-amber-800/15" />
          </div>

          {/* Join room */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="Enter room code"
                className="flex-1 px-4 py-3 rounded-xl bg-white/50 border border-amber-200/60 text-amber-900 text-center font-mono text-lg tracking-[0.2em] placeholder:text-amber-800/25 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                onClick={() => joinCode.length === 4 && onJoinRoom(joinCode)}
                disabled={joinCode.length !== 4 || lobbyStatus === 'joining'}
                className="px-5 py-3 rounded-xl bg-red-800 text-white font-semibold hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Join
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="text-center text-sm text-red-700 bg-red-50/80 rounded-lg py-2 px-3 border border-red-200/50">
              {errorMessage}
            </div>
          )}

          {/* Connection status */}
          {connectionStatus !== 'disconnected' && (
            <div className="flex items-center justify-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`} />
              <span className="text-xs text-amber-800/30">{connectionStatus === 'connecting' ? 'Connecting...' : 'Connected'}</span>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full mt-6 py-2.5 text-sm text-amber-800/50 hover:text-amber-800 transition-colors"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}
