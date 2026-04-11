import { useState, useCallback, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Card, GameState, Move, Player, Position } from '../types';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  ConnectionStatus,
  LobbyStatus,
  MovePayload,
} from '../types/online';
import { applyMove, getValidTargets, canPlayerMove, passWithCard } from '../engine/game';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

// Build a GameState from the server-provided card deal
function buildInitialState(
  redCards: [Card, Card],
  blueCards: [Card, Card],
  neutralCard: Card,
  startingPlayer: Player,
): GameState {
  const pieces = [
    { player: 'blue' as Player, type: 'student' as const, row: 0, col: 0 },
    { player: 'blue' as Player, type: 'student' as const, row: 0, col: 1 },
    { player: 'blue' as Player, type: 'master' as const, row: 0, col: 2 },
    { player: 'blue' as Player, type: 'student' as const, row: 0, col: 3 },
    { player: 'blue' as Player, type: 'student' as const, row: 0, col: 4 },
    { player: 'red' as Player, type: 'student' as const, row: 4, col: 0 },
    { player: 'red' as Player, type: 'student' as const, row: 4, col: 1 },
    { player: 'red' as Player, type: 'master' as const, row: 4, col: 2 },
    { player: 'red' as Player, type: 'student' as const, row: 4, col: 3 },
    { player: 'red' as Player, type: 'student' as const, row: 4, col: 4 },
  ];
  const board: (typeof pieces[0] | null)[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => null),
  );
  for (const p of pieces) board[p.row][p.col] = p;

  return {
    board,
    pieces,
    redCards,
    blueCards,
    neutralCard,
    currentPlayer: startingPlayer,
    winner: null,
    winMethod: null,
    moveHistory: [],
  };
}

export interface OnlineGameActions {
  createRoom: (preferredColor?: Player) => void;
  joinRoom: (code: string) => void;
  selectCard: (card: Card) => void;
  selectSquare: (row: number, col: number) => void;
  passCard: (cardName: string) => void;
  requestRematch: () => void;
  disconnect: () => void;
}

export interface OnlineGameStore {
  gameState: GameState | null;
  selectedCard: Card | null;
  selectedPieceIndex: number | null;
  validTargets: Position[];
  playerColor: Player | null;
  roomCode: string | null;
  connectionStatus: ConnectionStatus;
  lobbyStatus: LobbyStatus;
  errorMessage: string | null;
  opponentDisconnected: boolean;
  mustPass: boolean;
  actions: OnlineGameActions;
}

export function useOnlineGame(): OnlineGameStore {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const roomCodeRef = useRef<string | null>(null);
  const hasConnectedOnce = useRef(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [validTargets, setValidTargets] = useState<Position[]>([]);
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lobbyStatus, setLobbyStatus] = useState<LobbyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [mustPass, setMustPass] = useState(false);

  // Check must-pass
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

  // Connect socket (lazy — on first create/join)
  const getSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      setConnectionStatus('connected');
      // Only rejoin on actual reconnects, not the first connect
      // (the first connect has a join_room/create_room emit already queued)
      if (hasConnectedOnce.current) {
        const code = roomCodeRef.current;
        if (code) {
          socket.emit('rejoin_room', { roomCode: code });
        }
      }
      hasConnectedOnce.current = true;
    });

    socket.on('disconnect', () => setConnectionStatus('disconnected'));

    socket.on('connect_error', () => {
      setConnectionStatus('disconnected');
      // Only show error if we were trying to join/create, not on routine reconnect attempts
      if (!roomCodeRef.current) {
        setErrorMessage('Unable to connect to server. Please try again.');
        setLobbyStatus('error');
      }
    });

    socket.on('room_created', ({ roomCode: code }) => {
      setRoomCode(code);
      roomCodeRef.current = code;
      setLobbyStatus('waiting');
    });

    socket.on('waiting_for_opponent', () => {
      setLobbyStatus('waiting');
    });

    socket.on('game_start', (data) => {
      setPlayerColor(data.yourColor);
      setRoomCode(data.roomCode);
      roomCodeRef.current = data.roomCode;
      setLobbyStatus('ready');
      setOpponentDisconnected(false);
      clearSelection();
      const state = buildInitialState(
        data.redCards,
        data.blueCards,
        data.neutralCard,
        data.startingPlayer,
      );
      setGameState(state);
    });

    socket.on('opponent_move', (data: MovePayload) => {
      setGameState((prev) => {
        if (!prev) return prev;
        const move: Move = {
          player: prev.currentPlayer,
          pieceIndex: data.pieceIndex,
          cardName: data.cardName,
          from: data.from,
          to: data.to,
        };
        return applyMove(prev, move);
      });
      clearSelection();
    });

    socket.on('opponent_pass', (data) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return passWithCard(prev, data.cardName);
      });
      clearSelection();
    });

    socket.on('opponent_disconnected', () => {
      setOpponentDisconnected(true);
    });

    socket.on('opponent_reconnected', () => {
      setOpponentDisconnected(false);
    });

    socket.on('player_left', () => {
      // Opponent's disconnect timed out — they're gone.
      // Reset to waiting state so the room can accept a new player.
      setOpponentDisconnected(false);
      setGameState(null);
      setLobbyStatus('waiting');
      clearSelection();
    });

    socket.on('room_error', ({ message }) => {
      setErrorMessage(message);
      setLobbyStatus('error');
    });

    setConnectionStatus('connecting');
    socketRef.current = socket;
    return socket;
  }, [clearSelection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Mobile: reconnect when tab returns to foreground.
  // iOS Safari and Android Chrome silently kill WebSocket connections
  // when backgrounded without firing a 'disconnect' event.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socketRef.current) {
        if (socketRef.current.disconnected) {
          // Actually disconnected — reconnect
          socketRef.current.connect();
        }
        // If socket thinks it's connected, leave it alone.
        // Socket.IO's built-in heartbeat/ping will detect stale connections.
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const createRoomAction = useCallback((preferredColor?: Player) => {
    setErrorMessage(null);
    setLobbyStatus('creating');
    const socket = getSocket();
    socket.emit('create_room', preferredColor ? { preferredColor } : undefined);
  }, [getSocket]);

  const joinRoomAction = useCallback(
    (code: string) => {
      setErrorMessage(null);
      setLobbyStatus('joining');
      const upperCode = code.toUpperCase();
      // Don't set roomCodeRef yet — set it when server confirms via game_start.
      // Setting it here caused a race: getSocket()'s connect handler would see
      // the ref and fire rejoin_room, duplicating the join_room emit below.
      const socket = getSocket();
      socket.emit('join_room', { roomCode: upperCode });
    },
    [getSocket],
  );

  const isMyTurn = useCallback((): boolean => {
    if (!gameState || !playerColor) return false;
    if (gameState.winner) return false;
    return gameState.currentPlayer === playerColor;
  }, [gameState, playerColor]);

  const selectCard = useCallback(
    (card: Card) => {
      if (!gameState || !isMyTurn()) return;

      if (selectedCard?.name === card.name) {
        clearSelection();
        return;
      }

      setSelectedCard(card);
      if (selectedPieceIndex !== null) {
        const targets = getValidTargets(gameState, card, selectedPieceIndex);
        setValidTargets(targets);
      } else {
        setValidTargets([]);
      }
    },
    [gameState, selectedCard, selectedPieceIndex, isMyTurn, clearSelection],
  );

  const selectSquare = useCallback(
    (row: number, col: number) => {
      if (!gameState || !isMyTurn() || mustPass) return;

      const clickedPiece = gameState.board[row][col];

      // Execute move if valid target selected
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

        // Apply locally
        const newState = applyMove(gameState, move);
        setGameState(newState);
        clearSelection();

        // Send to server
        socketRef.current?.emit('move', {
          pieceIndex: move.pieceIndex,
          cardName: move.cardName,
          from: move.from,
          to: move.to,
        });
        return;
      }

      // Select own piece
      if (clickedPiece && clickedPiece.player === playerColor) {
        const pieceIdx = gameState.pieces.findIndex(
          (p) => p.row === row && p.col === col,
        );
        if (pieceIdx === -1) return;

        if (selectedPieceIndex === pieceIdx) {
          setSelectedPieceIndex(null);
          setValidTargets([]);
          return;
        }

        setSelectedPieceIndex(pieceIdx);
        if (selectedCard) {
          const targets = getValidTargets(gameState, selectedCard, pieceIdx);
          setValidTargets(targets);
        } else {
          setValidTargets([]);
        }
        return;
      }

      clearSelection();
    },
    [gameState, playerColor, selectedCard, selectedPieceIndex, validTargets, isMyTurn, mustPass, clearSelection],
  );

  const passCardAction = useCallback(
    (cardName: string) => {
      if (!gameState || !isMyTurn() || !mustPass) return;

      const newState = passWithCard(gameState, cardName);
      setGameState(newState);
      clearSelection();

      socketRef.current?.emit('pass', { cardName });
    },
    [gameState, isMyTurn, mustPass, clearSelection],
  );

  const requestRematch = useCallback(() => {
    socketRef.current?.emit('rematch');
  }, []);

  const disconnectAction = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    roomCodeRef.current = null;
    hasConnectedOnce.current = false;
    setGameState(null);
    setPlayerColor(null);
    setRoomCode(null);
    setConnectionStatus('disconnected');
    setLobbyStatus('idle');
    setErrorMessage(null);
    setOpponentDisconnected(false);
    clearSelection();
  }, [clearSelection]);

  return {
    gameState,
    selectedCard,
    selectedPieceIndex,
    validTargets,
    playerColor,
    roomCode,
    connectionStatus,
    lobbyStatus,
    errorMessage,
    opponentDisconnected,
    mustPass,
    actions: {
      createRoom: createRoomAction,
      joinRoom: joinRoomAction,
      selectCard,
      selectSquare,
      passCard: passCardAction,
      requestRematch,
      disconnect: disconnectAction,
    },
  };
}
