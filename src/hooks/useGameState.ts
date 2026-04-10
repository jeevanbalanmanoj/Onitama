import { useState, useCallback, useRef, useEffect } from 'react';
import type { AIDifficulty, Card, GameMode, GameState, Move, Position } from '../types';
import { initGame, applyMove, getValidTargets, canPlayerMove, passWithCard } from '../engine/game';
import { getAIMove } from '../engine/ai';

export interface GameActions {
  selectCard: (card: Card) => void;
  selectSquare: (row: number, col: number) => void;
  undo: () => void;
  resetGame: () => void;
  startGame: (mode: GameMode, difficulty: AIDifficulty) => void;
  passCard: (cardName: string) => void;
}

export interface GameStore {
  gameState: GameState | null;
  selectedCard: Card | null;
  selectedPieceIndex: number | null;
  validTargets: Position[];
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  isAIThinking: boolean;
  isSetup: boolean;
  mustPass: boolean;
  actions: GameActions;
}

export function useGameState(): GameStore {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [validTargets, setValidTargets] = useState<Position[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('local');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isSetup, setIsSetup] = useState(true);
  const [mustPass, setMustPass] = useState(false);
  const undoStack = useRef<GameState[]>([]);
  const aiTimeoutRef = useRef<number | null>(null);

  // Check if current player must pass after state changes
  useEffect(() => {
    if (gameState && !gameState.winner && !canPlayerMove(gameState)) {
      setMustPass(true);
    } else {
      setMustPass(false);
    }
  }, [gameState]);

  const clearSelection = useCallback(() => {
    setSelectedCard(null);
    setSelectedPieceIndex(null);
    setValidTargets([]);
  }, []);

  const triggerAITurn = useCallback(
    (state: GameState) => {
      if (state.winner) return;
      if (state.currentPlayer !== 'blue') return;

      setIsAIThinking(true);
      aiTimeoutRef.current = window.setTimeout(() => {
        const result = getAIMove(state, aiDifficulty);

        if (result.move) {
          const newState = applyMove(state, result.move);
          undoStack.current.push(state);
          setGameState(newState);
        } else if (result.passCard) {
          const newState = passWithCard(state, result.passCard);
          undoStack.current.push(state);
          setGameState(newState);
        }

        setIsAIThinking(false);
        clearSelection();
      }, 400);
    },
    [aiDifficulty, clearSelection]
  );

  const startGame = useCallback(
    (mode: GameMode, difficulty: AIDifficulty) => {
      setGameMode(mode);
      setAIDifficulty(difficulty);
      const state = initGame();
      setGameState(state);
      undoStack.current = [];
      clearSelection();
      setIsSetup(false);
      setIsAIThinking(false);

      // If AI mode and blue goes first, trigger AI immediately
      if (mode === 'ai' && state.currentPlayer === 'blue') {
        triggerAITurn(state);
      }
    },
    [clearSelection, triggerAITurn]
  );

  const selectCard = useCallback(
    (card: Card) => {
      if (!gameState || gameState.winner || isAIThinking) return;
      if (gameMode === 'ai' && gameState.currentPlayer === 'blue') return;

      if (selectedCard?.name === card.name) {
        // Deselect
        clearSelection();
        return;
      }

      setSelectedCard(card);

      // If a piece is already selected, recalculate valid targets with new card
      if (selectedPieceIndex !== null) {
        const targets = getValidTargets(gameState, card, selectedPieceIndex);
        setValidTargets(targets);
      } else {
        setValidTargets([]);
      }
    },
    [gameState, selectedCard, selectedPieceIndex, isAIThinking, gameMode, clearSelection]
  );

  const executeMove = useCallback(
    (state: GameState, move: Move) => {
      undoStack.current.push(state);
      const newState = applyMove(state, move);
      setGameState(newState);
      clearSelection();

      // Trigger AI turn if applicable
      if (gameMode === 'ai' && !newState.winner && newState.currentPlayer === 'blue') {
        triggerAITurn(newState);
      }
    },
    [gameMode, clearSelection, triggerAITurn]
  );

  const selectSquare = useCallback(
    (row: number, col: number) => {
      if (!gameState || gameState.winner || isAIThinking) return;
      if (gameMode === 'ai' && gameState.currentPlayer === 'blue') return;
      if (mustPass) return;

      const clickedPiece = gameState.board[row][col];

      // If clicking a valid target and we have a full selection, execute the move
      if (
        selectedCard &&
        selectedPieceIndex !== null &&
        validTargets.some((t) => t.row === row && t.col === col)
      ) {
        const move: Move = {
          player: gameState.currentPlayer,
          pieceIndex: selectedPieceIndex,
          cardName: selectedCard.name,
          from: {
            row: gameState.pieces[selectedPieceIndex].row,
            col: gameState.pieces[selectedPieceIndex].col,
          },
          to: { row, col },
        };
        executeMove(gameState, move);
        return;
      }

      // If clicking own piece
      if (clickedPiece && clickedPiece.player === gameState.currentPlayer) {
        const pieceIdx = gameState.pieces.findIndex(
          (p) => p.row === row && p.col === col
        );
        if (pieceIdx === -1) return;

        if (selectedPieceIndex === pieceIdx) {
          // Deselect piece
          setSelectedPieceIndex(null);
          setValidTargets([]);
          return;
        }

        setSelectedPieceIndex(pieceIdx);

        // If a card is already selected, show valid targets
        if (selectedCard) {
          const targets = getValidTargets(gameState, selectedCard, pieceIdx);
          setValidTargets(targets);
        } else {
          setValidTargets([]);
        }
        return;
      }

      // Clicking empty/enemy square with no valid selection — deselect
      clearSelection();
    },
    [
      gameState,
      isAIThinking,
      gameMode,
      mustPass,
      selectedCard,
      selectedPieceIndex,
      validTargets,
      executeMove,
      clearSelection,
    ]
  );

  const passCard = useCallback(
    (cardName: string) => {
      if (!gameState || gameState.winner || isAIThinking || !mustPass) return;

      undoStack.current.push(gameState);
      const newState = passWithCard(gameState, cardName);
      setGameState(newState);
      clearSelection();

      if (gameMode === 'ai' && !newState.winner && newState.currentPlayer === 'blue') {
        triggerAITurn(newState);
      }
    },
    [gameState, isAIThinking, mustPass, gameMode, clearSelection, triggerAITurn]
  );

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    if (isAIThinking) return;

    if (gameMode === 'ai') {
      // Undo both AI and player move
      if (undoStack.current.length >= 2) {
        undoStack.current.pop(); // AI move
        const prevState = undoStack.current.pop()!; // Player move
        setGameState(prevState);
      } else {
        const prevState = undoStack.current.pop()!;
        setGameState(prevState);
      }
    } else {
      const prevState = undoStack.current.pop()!;
      setGameState(prevState);
    }
    clearSelection();
  }, [gameMode, isAIThinking, clearSelection]);

  const resetGame = useCallback(() => {
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current);
    }
    setGameState(null);
    clearSelection();
    setIsSetup(true);
    setIsAIThinking(false);
    undoStack.current = [];
  }, [clearSelection]);

  return {
    gameState,
    selectedCard,
    selectedPieceIndex,
    validTargets,
    gameMode,
    aiDifficulty,
    isAIThinking,
    isSetup,
    mustPass,
    actions: {
      selectCard,
      selectSquare,
      undo,
      resetGame,
      startGame,
      passCard,
    },
  };
}


