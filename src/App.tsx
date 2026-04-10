import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useOnlineGame } from './hooks/useOnlineGame';
import GameSetup from './components/GameSetup';
import OnlineLobby from './components/OnlineLobby';
import Board from './components/Board';
import CardPanel from './components/CardPanel';
import MoveLog from './components/MoveLog';
import WinOverlay from './components/WinOverlay';
import type { Player } from './types';

export default function App() {
  const store = useGameState();
  const online = useOnlineGame();
  const [logOpen, setLogOpen] = useState(false);
  const {
    gameState,
    selectedCard,
    selectedPieceIndex,
    validTargets,
    gameMode,
    isAIThinking,
    isSetup,
    mustPass,
    actions,
  } = store;

  // Handle ?room= URL parameter for direct joining
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && online.lobbyStatus === 'idle') {
      // Auto-start online mode and join the room
      actions.startGame('online', 'medium');
      online.actions.joinRoom(roomParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup screen
  if (isSetup || !gameMode) {
    return <GameSetup onStart={actions.startGame} />;
  }

  // Online mode: lobby or game
  if (gameMode === 'online') {
    // Show lobby until game is ready
    if (online.lobbyStatus !== 'ready' || !online.gameState) {
      return (
        <OnlineLobby
          roomCode={online.roomCode}
          connectionStatus={online.connectionStatus}
          lobbyStatus={online.lobbyStatus}
          errorMessage={online.errorMessage}
          onCreateRoom={online.actions.createRoom}
          onJoinRoom={online.actions.joinRoom}
          onBack={() => {
            online.actions.disconnect();
            actions.resetGame();
          }}
        />
      );
    }

    // Online game is active
    const gs = online.gameState;
    const isMyTurn = gs.currentPlayer === online.playerColor && !gs.winner;
    const currentCards = gs.currentPlayer === 'red' ? gs.redCards : gs.blueCards;
    const onlineFlipped = online.playerColor === 'blue';

    const isPlayerTurnOnline = (player: Player): boolean => {
      if (gs.winner) return false;
      if (gs.currentPlayer !== player) return false;
      return player === online.playerColor;
    };

    return (
      <div className="min-h-screen bg-seigaiha flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-amber-200/50 bg-white/30 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-amber-900 tracking-wide">
            Onitama
          </h1>
          <div className="flex items-center gap-3">
            {/* Player color badge */}
            <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              online.playerColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              You: {online.playerColor === 'red' ? 'Red' : 'Blue'}
            </div>
            {/* Turn indicator */}
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
              gs.currentPlayer === 'red' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isMyTurn ? 'Your turn' : "Opponent's turn"}
            </div>
            <button
              onClick={() => {
                online.actions.disconnect();
                actions.resetGame();
              }}
              className="px-3 py-1.5 text-sm rounded-lg border border-amber-300/50 text-amber-800 hover:bg-amber-100 transition-colors"
            >
              ✕ Leave
            </button>
          </div>
        </header>

        {/* Opponent disconnected notice */}
        {online.opponentDisconnected && (
          <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-sm text-yellow-800 text-center">
            Opponent disconnected. Waiting for them to reconnect...
          </div>
        )}

        {/* Main game area */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10 max-w-5xl w-full justify-center">
            <div className="flex flex-col items-center gap-3">
              <Board
                state={gs}
                selectedPieceIndex={online.selectedPieceIndex}
                validTargets={online.validTargets}
                onSquareClick={online.actions.selectSquare}
                flipped={onlineFlipped}
              />

              {/* Must-pass indicator */}
              {online.mustPass && isMyTurn && (
                <div className="bg-amber-200/70 border border-amber-400/50 rounded-lg px-4 py-2 text-sm text-amber-900">
                  <span className="font-medium">No valid moves!</span> Select a card to pass.
                  <div className="flex gap-2 mt-2">
                    {currentCards.map((card) => (
                      <button
                        key={card.name}
                        onClick={() => online.actions.passCard(card.name)}
                        className="px-3 py-1 rounded bg-amber-700 text-amber-50 text-xs font-medium hover:bg-amber-800 transition-colors"
                      >
                        Pass {card.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 min-w-[220px]">
              <CardPanel
                state={gs}
                selectedCardName={online.selectedCard?.name ?? null}
                currentPlayer={gs.currentPlayer}
                isPlayerTurn={isPlayerTurnOnline}
                onSelectCard={online.actions.selectCard}
                flipped={onlineFlipped}
              />
            </div>
          </div>
        </main>

        {/* Move Log — collapsible right-side panel */}
        {logOpen && (
          <div className="fixed top-16 right-3 w-56 max-h-[70vh] flex flex-col bg-white/80 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-lg z-40">
            <div className="flex items-center justify-between px-3 py-2 border-b border-amber-200/40 shrink-0">
              <h3 className="text-xs font-medium text-amber-800/50 uppercase tracking-wider">Move Log</h3>
              <button onClick={() => setLogOpen(false)} className="text-amber-800/40 hover:text-amber-800 text-sm leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
              <MoveLog moveHistory={gs.moveHistory} pieces={gs.pieces} />
            </div>
          </div>
        )}
        {!logOpen && (
          <button
            onClick={() => setLogOpen(true)}
            className="fixed top-16 right-3 z-40 bg-white/70 backdrop-blur-md border border-amber-200/50 rounded-lg px-3 py-1.5 text-xs text-amber-800/60 hover:text-amber-800 hover:bg-amber-100/80 transition-colors shadow-md"
          >
            📜 Move Log
          </button>
        )}

        {/* Win overlay */}
        {gs.winner && gs.winMethod && (
          <WinOverlay
            winner={gs.winner}
            winMethod={gs.winMethod}
            onPlayAgain={online.actions.requestRematch}
            onBackToMenu={() => {
              online.actions.disconnect();
              actions.resetGame();
            }}
          />
        )}
      </div>
    );
  }

  // Local / AI mode (existing code)
  if (!gameState) {
    return <GameSetup onStart={actions.startGame} />;
  }

  const isPlayerTurn = (player: Player): boolean => {
    if (gameState.winner || isAIThinking) return false;
    if (gameState.currentPlayer !== player) return false;
    if (gameMode === 'ai' && player === 'blue') return false;
    return true;
  };

  const currentCards =
    gameState.currentPlayer === 'red' ? gameState.redCards : gameState.blueCards;

  return (
    <div className="min-h-screen bg-seigaiha flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-amber-200/50 bg-white/30 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-amber-900 tracking-wide">
          Onitama
        </h1>
        <div className="flex items-center gap-3">
          {/* Turn indicator */}
          <div
            className={`
              text-sm font-medium px-3 py-1 rounded-full
              ${isAIThinking
                ? 'bg-blue-100 text-blue-700 animate-pulse'
                : gameState.currentPlayer === 'red'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }
            `}
          >
            {isAIThinking
              ? 'AI thinking...'
              : `${gameState.currentPlayer === 'red' ? 'Red' : 'Blue'}'s turn`}
          </div>
          <button
            onClick={actions.undo}
            disabled={isAIThinking}
            className="px-3 py-1.5 text-sm rounded-lg border border-amber-300/50 text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ↩ Undo
          </button>
          <button
            onClick={actions.resetGame}
            className="px-3 py-1.5 text-sm rounded-lg border border-amber-300/50 text-amber-800 hover:bg-amber-100 transition-colors"
          >
            ✕ Menu
          </button>
        </div>
      </header>

      {/* Main game area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10 max-w-5xl w-full justify-center">
          {/* Board + pass notice */}
          <div className="flex flex-col items-center gap-3">
            <Board
              state={gameState}
              selectedPieceIndex={selectedPieceIndex}
              validTargets={validTargets}
              onSquareClick={actions.selectSquare}
            />

            {/* Must-pass indicator */}
            {mustPass && (
              <div className="bg-amber-200/70 border border-amber-400/50 rounded-lg px-4 py-2 text-sm text-amber-900">
                <span className="font-medium">No valid moves!</span> Select a card to pass.
                <div className="flex gap-2 mt-2">
                  {currentCards.map((card) => (
                    <button
                      key={card.name}
                      onClick={() => actions.passCard(card.name)}
                      className="px-3 py-1 rounded bg-amber-700 text-amber-50 text-xs font-medium hover:bg-amber-800 transition-colors"
                    >
                      Pass {card.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side panel: Cards */}
          <div className="flex flex-col gap-6 min-w-[220px]">
            <CardPanel
              state={gameState}
              selectedCardName={selectedCard?.name ?? null}
              currentPlayer={gameState.currentPlayer}
              isPlayerTurn={isPlayerTurn}
              onSelectCard={actions.selectCard}
            />
          </div>
        </div>
      </main>

      {/* Move Log — collapsible right-side panel */}
      {logOpen && (
        <div className="fixed top-16 right-3 w-56 max-h-[70vh] flex flex-col bg-white/80 backdrop-blur-md border border-amber-200/50 rounded-xl shadow-lg z-40">
          <div className="flex items-center justify-between px-3 py-2 border-b border-amber-200/40 shrink-0">
            <h3 className="text-xs font-medium text-amber-800/50 uppercase tracking-wider">
              Move Log
            </h3>
            <button
              onClick={() => setLogOpen(false)}
              className="text-amber-800/40 hover:text-amber-800 text-sm leading-none"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <MoveLog
              moveHistory={gameState.moveHistory}
              pieces={gameState.pieces}
            />
          </div>
        </div>
      )}

      {/* Toggle button when closed */}
      {!logOpen && (
        <button
          onClick={() => setLogOpen(true)}
          className="fixed top-16 right-3 z-40 bg-white/70 backdrop-blur-md border border-amber-200/50 rounded-lg px-3 py-1.5 text-xs text-amber-800/60 hover:text-amber-800 hover:bg-amber-100/80 transition-colors shadow-md"
        >
          📜 Move Log
        </button>
      )}

      {/* Win overlay */}
      {gameState.winner && gameState.winMethod && (
        <WinOverlay
          winner={gameState.winner}
          winMethod={gameState.winMethod}
          onPlayAgain={() => actions.startGame(gameMode, store.aiDifficulty)}
          onBackToMenu={actions.resetGame}
        />
      )}
    </div>
  );
}
