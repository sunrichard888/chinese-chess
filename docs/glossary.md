# Domain Glossary — Chinese Chess (象棋)

**Purpose**: Shared terminology for the team. All domain types must match this glossary.

---

## Core Types

| Type | Description | Example/Values |
|------|-------------|----------------|
| `Color` | Which side a piece belongs to | `'red' \| 'black'` |
| `FileType` | File (column) identifier | `0-7` (8 files: a-h) |
| `RankType` | Rank (row) identifier | `0-9` (10 ranks: 0-9) |
| `Position` | Board coordinate | `{ file: number; rank: number }` |
| `PieceType` | Type of chess piece | `'general' \| 'advisor' \| 'elephant' \| 'horse' \| 'chariot' \| 'cannon' \| 'soldier'` |
| `Piece` | A chess piece on the board | `{ type: PieceType; color: Color; position: Position }` |
| `Move` | A move from one position to another | `{ from: Position; to: Position; piece: PieceType }` |
| `Board` | Current state of all pieces | `{ pieces: Piece[]; turn: Color; moveHistory: Move[] }` |
| `GameStatus` | Current game state | `'playing' \| 'check' \| 'checkmate' \| 'stalemate' \| 'draw'` |
| `GameState` | Complete game state | `{ board: Board; status: GameStatus; winner?: Color }` |

---

## Piece Names (Chinese ↔ English)

| English | Chinese | Pinyin | Alternative Names |
|---------|---------|--------|-------------------|
| General | 将/帅 | Jiàng/Shuài | King, Marshal |
| Advisor | 士/仕 | Shì | Guard, Minister |
| Elephant | 象/相 | Xiàng | Minister, Bishop |
| Horse | 马/馬 | Mǎ | Knight |
| Chariot | 车/車 | Jū | Rook, Car |
| Cannon | 炮/砲 | Pào | Cannon, Gun |
| Soldier | 卒/兵 | Zú/Bīng | Pawn |

---

## Board Terminology

| Term | Definition |
|------|------------|
| **File** | Vertical column (8 files, labeled 0-7 or a-h) |
| **Rank** | Horizontal row (10 ranks, labeled 0-9) |
| **Palace** | 3x3 area where General and Advisors must stay |
| **River** | Horizontal gap between ranks 4 and 5 |
| **Side** | Either Red (bottom, moves first) or Black (top) |
| **Center File** | File 4 (the middle file, important for strategy) |

---

## Movement Rules

### General (将/帅)
- Moves 1 step orthogonally (not diagonally)
- Confined to palace (files 3-5, ranks 0-2 for Black; ranks 7-9 for Red)
- Cannot face opposing General directly (Flying General rule)

### Advisor (士/仕)
- Moves 1 step diagonally
- Confined to palace
- Cannot leave the 3x3 area

### Elephant (象/相)
- Moves 2 steps diagonally
- Cannot cross the river
- Can be blocked (象眼 rule — if adjacent diagonal is occupied, cannot move)
- Red elephants stay on Red side, Black elephants on Black side

### Horse (马/馬)
- Moves in L-shape (1 orthogonal + 1 diagonal)
- Can be blocked (蹩马腿 rule — if adjacent orthogonal is occupied, cannot move in that direction)
- 8 possible moves when unblocked

### Chariot (车/車)
- Moves any distance orthogonally (like Rook in Western chess)
- Strongest piece (value: 9)
- Cannot jump over pieces

### Cannon (炮/砲)
- Moves like Chariot when not capturing
- Captures by jumping over exactly one piece (the "screen" or "platform")
- Unique to Chinese Chess

### Soldier (卒/兵)
- Moves 1 step forward (before crossing river)
- After crossing river: can also move 1 step horizontally
- Never moves backward
- Becomes more valuable after crossing river

---

## Game Rules

| Rule | Description |
|------|-------------|
| **Starting Position** | Standard setup with Red moving first |
| **Check** | General is under attack by opponent |
| **Checkmate** | General is in check with no legal move to escape |
| **Stalemate** | Player has no legal move but is not in check |
| **Flying General** | Generals cannot face each other directly without pieces between |
| **Perpetual Check** | Repeatedly checking the same piece is forbidden (varies by rule set) |
| **50-Move Rule** | (Optional) Game is drawn if 50 moves without capture or pawn move |
| **Threefold Repetition** | (Optional) Game is drawn if same position occurs 3 times |

---

## Actions

| Action | Description | Type Signature |
|--------|-------------|----------------|
| `makeMove` | Execute a move on the board | `(board: Board, move: Move) => Board` |
| `getValidMoves` | Get all legal moves for a position | `(board: Board, position: Position) => Position[]` |
| `isInCheck` | Check if a color's General is under attack | `(board: Board, color: Color) => boolean` |
| `isCheckmate` | Check if a color is checkmated | `(board: Board, color: Color) => boolean` |
| `isStalemate` | Check if a color is stalemated | `(board: Board, color: Color) => boolean` |
| `evaluatePosition` | Evaluate board position for AI | `(board: Board, color: Color) => number` |
| `searchBestMove` | AI finds best move | `(board: Board, depth: number, color: Color) => Move` |

---

## Errors

| Error | When It Occurs |
|-------|----------------|
| `InvalidPositionError` | Position is outside board bounds |
| `InvalidMoveError` | Move violates piece movement rules |
| `BlockingError` | Move is blocked by another piece (马腿，象眼) |
| `PalaceConstraintError` | Move would leave palace (General/Advisor) |
| `RiverConstraintError` | Move would cross river (Elephant) |
| `FlyingGeneralError` | Move would cause Flying General violation |
| `CheckNotResolvedError` | Move leaves General in check |
| `WrongTurnError` | Attempted to move when not that color's turn |
| `GameOverError` | Attempted to move after game ended |

---

## Type Design Principles

1. **Make Invalid States Unrepresentable** — Use types to prevent illegal positions
2. **Parse, Don't Validate** — Produce typed values at boundaries
3. **Value Objects Over Primitives** — `Position` not `{ x: number, y: number }`
4. **Nominal Types for Semantics** — `FileType` and `RankType` are not interchangeable
5. **Immutable by Default** — All domain types are readonly

---

## AI-Specific Terms

| Term | Definition |
|------|------------|
| **Ply** | One half-move (one player's move) |
| **Depth** | Number of plies to search |
| **Evaluation** | Numeric score for a position (positive = good for current player) |
| **Principal Variation** | Best line of play found by search |
| **Transposition** | Same position reached via different move order |
| **Zobrist Hash** | Hash function for board positions (for transposition table) |
| **Null Move** | Passing (used in null-move pruning heuristic) |

---

*This glossary is a living document. Update when new domain concepts are discovered.*
