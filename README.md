# Onitama

A digital implementation of the board game **Onitama** built with React, TypeScript, and Vite.

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

## About the Game

Onitama is a two-player abstract strategy game created by Shimpei Sato. It's played on a 5×5 board where each player controls a **Master** and four **Students**. The game combines the elegance of chess with a unique card-based movement system that changes every game.

## Rules

### Setup

- Each player starts with 5 pieces on their back row: 4 Students and 1 Master (center).
- **Red** starts on the bottom row, **Blue** on the top row.
- The center square on each player's back row is their **Temple** (shrine).
- 5 movement cards are randomly dealt: 2 to each player and 1 neutral card in the middle. The neutral card's color determines who goes first.

### How to Play

1. **Select a card** from your hand.
2. **Select one of your pieces** (Master or Student).
3. **Move it** to a valid square according to the card's movement pattern.
4. The card you used swaps with the neutral card — your opponent will eventually get it.

Movement cards show a 5×5 grid where the center is your piece's current position and the highlighted squares are where it can move. Offsets are mirrored for the opposite player.

### Winning

There are two ways to win:

- **Way of the Stone** — Capture your opponent's Master.
- **Way of the Stream** — Move your own Master onto your opponent's Temple square.

### Passing

If neither of your cards produces a legal move, you must **pass** by choosing a card to swap with the neutral card (without moving any piece).

## Features

- Local PvP (two players on the same device)
- vs AI with three difficulty levels (Easy, Medium, Hard)
- AI uses minimax with alpha-beta pruning
- Animated piece movement (Motion library)
- Undo support
- Move log with algebraic notation (a1–e5)
- 16 unique movement cards
- Torii gate shrine markers on temple squares

## Tech Stack

- **Vite** — Build tool & dev server
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Styling
- **Motion** — Animations

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/     # React UI components (Board, Square, Cards, etc.)
├── data/           # Card definitions (16 Onitama cards)
├── engine/         # Pure game logic & AI (minimax)
├── hooks/          # useGameState hook (central state management)
├── types/          # TypeScript type definitions
└── index.css       # Tailwind CSS entry point
```

## License

This is a fan-made digital adaptation of Onitama for personal/educational use. Onitama is designed by Shimpei Sato and published by Arcane Wonders.
