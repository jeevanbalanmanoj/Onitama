import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useOnlineGame } from './hooks/useOnlineGame';
import GameSetup from './components/GameSetup';
import OnlineLobby from './components/OnlineLobby';
import Board from './components/Board';
import CardHand from './components/CardHand';
import CardDisplay from './components/CardDisplay';
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
      // Clean the URL to prevent re-triggering on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, '', url.pathname + url.search);

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
    const onlineTopPlayer: Player = onlineFlipped ? 'red' : 'blue';
    const onlineBottomPlayer: Player = onlineFlipped ? 'blue' : 'red';

    const isPlayerTurnOnline = (player: Player): boolean => {
      if (gs.winner) return false;
      if (gs.currentPlayer !== player) return false;
      return player === online.playerColor;
    };

    return (
      <div className="h-screen bg-seigaiha flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-amber-200/50 bg-white/30 backdrop-blur-sm">
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
        <main className="flex-1 flex items-center justify-center p-2 min-h-0">
          <div className="relative">
            {/* Center column: opponent cards → board → player cards */}
            <div className="flex flex-col items-center gap-1 w-full max-w-[460px]">
              {/* Top player's cards */}
              <div className="flex flex-col items-center gap-0.5 w-full">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${onlineTopPlayer === 'blue' ? 'text-blue-700/70' : 'text-red-700/70'}`}>
                  {onlineTopPlayer === 'blue' ? 'Blue' : 'Red'} {gs.currentPlayer === onlineTopPlayer ? '• Turn' : ''}
                </span>
                <CardHand
                  cards={onlineTopPlayer === 'blue' ? gs.blueCards : gs.redCards}
                  player={onlineTopPlayer}
                  selectedCardName={gs.currentPlayer === onlineTopPlayer ? (online.selectedCard?.name ?? null) : null}
                  isActive={isPlayerTurnOnline(onlineTopPlayer)}
                  onSelectCard={online.actions.selectCard}
                  flipped={onlineFlipped}
                />
              </div>

              {/* Board */}
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

              {/* Bottom player's cards */}
              <div className="flex flex-col items-center gap-0.5 w-full">
                <CardHand
                  cards={onlineBottomPlayer === 'red' ? gs.redCards : gs.blueCards}
                  player={onlineBottomPlayer}
                  selectedCardName={gs.currentPlayer === onlineBottomPlayer ? (online.selectedCard?.name ?? null) : null}
                  isActive={isPlayerTurnOnline(onlineBottomPlayer)}
                  onSelectCard={online.actions.selectCard}
                  flipped={onlineFlipped}
                />
                <span className={`text-[10px] font-medium uppercase tracking-wider ${onlineBottomPlayer === 'red' ? 'text-red-700/70' : 'text-blue-700/70'}`}>
                  {onlineBottomPlayer === 'blue' ? 'Blue' : 'Red'} {gs.currentPlayer === onlineBottomPlayer ? '• Turn' : ''}
                </span>
              </div>
            </div>

            {/* Neutral card on the side — absolutely positioned */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 flex flex-col items-center gap-1 w-[120px]">
              <span className="text-xs font-medium text-amber-700/50 uppercase tracking-wider">
                Next
              </span>
              <CardDisplay
                card={gs.neutralCard}
                isSelected={false}
                isPlayable={false}
                perspective={gs.currentPlayer}
                isNeutral
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
    if (gameMode === 'ai' && player !== store.humanColor) return false;
    return true;
  };

  const currentCards =
    gameState.currentPlayer === 'red' ? gameState.redCards : gameState.blueCards;

  // Flip board: AI mode when human is blue, local mode when it's blue's turn
  const localFlipped =
    gameMode === 'ai'
      ? store.humanColor === 'blue'
      : gameMode === 'local'
        ? gameState.currentPlayer === 'blue'
        : false;

  const localTopPlayer: Player = localFlipped ? 'red' : 'blue';
  const localBottomPlayer: Player = localFlipped ? 'blue' : 'red';

  return (
    <div className="h-screen bg-seigaiha flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-amber-200/50 bg-white/30 backdrop-blur-sm">
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
      <main className="flex-1 flex items-center justify-center p-2 min-h-0">
        <div className="relative">
          {/* Center column: opponent cards → board → player cards */}
          <div className="flex flex-col items-center gap-1 w-full max-w-[460px]">
            {/* Top player's cards */}
            <div className="flex flex-col items-center gap-0.5 w-full">
              <span className={`text-[10px] font-medium uppercase tracking-wider ${localTopPlayer === 'blue' ? 'text-blue-700/70' : 'text-red-700/70'}`}>
                {localTopPlayer === 'blue' ? 'Blue' : 'Red'} {gameState.currentPlayer === localTopPlayer ? '• Turn' : ''}
              </span>
              <CardHand
                cards={localTopPlayer === 'blue' ? gameState.blueCards : gameState.redCards}
                player={localTopPlayer}
                selectedCardName={gameState.currentPlayer === localTopPlayer ? (selectedCard?.name ?? null) : null}
                isActive={isPlayerTurn(localTopPlayer)}
                onSelectCard={actions.selectCard}
                flipped={localFlipped}
              />
            </div>

            {/* Board */}
            <Board
              state={gameState}
              selectedPieceIndex={selectedPieceIndex}
              validTargets={validTargets}
              onSquareClick={actions.selectSquare}
              flipped={localFlipped}
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

            {/* Bottom player's cards */}
            <div className="flex flex-col items-center gap-0.5 w-full">
              <CardHand
                cards={localBottomPlayer === 'red' ? gameState.redCards : gameState.blueCards}
                player={localBottomPlayer}
                selectedCardName={gameState.currentPlayer === localBottomPlayer ? (selectedCard?.name ?? null) : null}
                isActive={isPlayerTurn(localBottomPlayer)}
                onSelectCard={actions.selectCard}
                flipped={localFlipped}
              />
              <span className={`text-[10px] font-medium uppercase tracking-wider ${localBottomPlayer === 'red' ? 'text-red-700/70' : 'text-blue-700/70'}`}>
                {localBottomPlayer === 'blue' ? 'Blue' : 'Red'} {gameState.currentPlayer === localBottomPlayer ? '• Turn' : ''}
              </span>
            </div>
          </div>

          {/* Neutral card on the side — absolutely positioned */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 flex flex-col items-center gap-1 w-[120px]">
            <span className="text-xs font-medium text-amber-700/50 uppercase tracking-wider">
              Next
            </span>
            <CardDisplay
              card={gameState.neutralCard}
              isSelected={false}
              isPlayable={false}
              perspective={gameState.currentPlayer}
              isNeutral
              flipped={localFlipped}
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
          onPlayAgain={() => actions.startGame(gameMode, store.aiDifficulty, store.humanColor)}
          onBackToMenu={actions.resetGame}
        />
      )}
    </div>
  );
}
