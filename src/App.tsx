import { useState, useEffect, useCallback } from 'react';
import { BoardView } from './ui/BoardView';
import { useGameStore } from './app/game-store';
import { getBestMove, Difficulty } from './ai/engine';
import { Color } from './core/types';
import { evaluateGameStatus } from './core/rules';
import { VolumeControl } from './ui/VolumeControl';

function App() {
  const {
    gameState,
    selectedPosition,
    validMoves,
    lastMove,
    inCheck,
    difficulty,
    gameMode,
    selectPosition,
    makeMove,
    resetGame,
    setDifficulty,
    setGameMode,
    initializeAudio,
  } = useGameStore();

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [message, setMessage] = useState('');

  // Check for game over after each move
  useEffect(() => {
    const status = evaluateGameStatus(gameState.board);
    if (status.status === 'checkmate' || status.status === 'stalemate' || status.status === 'draw') {
      setGameOver(true);
      setWinner(status.winner || null);
      setMessage(
        status.status === 'checkmate'
          ? `Checkmate! ${status.winner === Color.Red ? 'Red' : 'Black'} wins!`
          : status.status === 'stalemate'
          ? 'Stalemate! Draw.'
          : 'Draw!'
      );
    } else if (status.status === 'check') {
      setMessage('Check!');
    } else {
      setMessage('');
    }
  }, [gameState]);

  // AI move for PvAI mode
  useEffect(() => {
    if (gameMode !== 'pvai' || gameOver) return;
    if (gameState.board.turn !== Color.Black) return;

    const makeAIMove = async () => {
      const difficultyConfig: Difficulty = 
        difficulty === 'easy' ? Difficulty.Easy :
        difficulty === 'hard' ? Difficulty.Hard :
        Difficulty.Medium;

      // Simulate async for UI update
      await new Promise(resolve => setTimeout(resolve, 100));

      const aiResult = getBestMove(gameState.board, difficultyConfig, Color.Black);
      
      if (aiResult.move) {
        makeMove(aiResult.move.from, aiResult.move.to);
      }
    };

    makeAIMove();
  }, [gameState.board.turn, gameMode, gameOver, difficulty]);

  const handlePositionSelect = useCallback((position: { file: number; rank: number } | null) => {
    if (!position) {
      selectPosition(null);
      return;
    }

    const state = useGameStore.getState();
    
    // If a piece is already selected, try to move
    if (state.selectedPosition) {
      const success = makeMove(state.selectedPosition, position);
      if (success) {
        selectPosition(null);
        return;
      }
    }

    // Select the piece at the position
    selectPosition(position);
  }, [selectPosition, makeMove]);

  const handleReset = () => {
    resetGame();
    setGameOver(false);
    setWinner(null);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-amber-900 mb-2">中国象棋</h1>
        <p className="text-amber-700">Chinese Chess</p>
      </header>

      <main className="container mx-auto max-w-4xl">
        {/* Game Info */}
        <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow">
          <div>
            <p className="text-lg font-semibold">
              Turn: <span className={gameState.board.turn === Color.Red ? 'text-red-600' : 'text-black'}>
                {gameState.board.turn === Color.Red ? 'Red' : 'Black'}
              </span>
            </p>
            {message && (
              <p className={`text-lg font-bold ${message.includes('Check') ? 'text-red-600 animate-pulse' : 'text-amber-800'}`}>
                {message}
              </p>
            )}
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Game Mode Selector */}
            <select
              value={gameMode}
              onChange={(e) => {
                setGameMode(e.target.value as 'pvp' | 'pvai' | 'aivai');
                handleReset();
              }}
              className="px-4 py-2 border rounded-lg bg-white"
              disabled={!gameOver && gameState.board.moveHistory.length > 0}
              title={gameState.board.moveHistory.length > 0 ? "Finish current game to change mode" : "Select game mode"}
            >
              <option value="pvai">Player vs AI</option>
              <option value="pvp">Player vs Player</option>
              <option value="aivai">AI vs AI</option>
            </select>
            
            {/* Difficulty Selector */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              className="px-4 py-2 border rounded-lg"
              disabled={gameMode !== 'pvai'}
              title={gameMode === 'pvai' ? "Select AI difficulty" : "Only available in PvAI mode"}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            
            {/* Volume Control */}
            <VolumeControl />
            
            {/* New Game Button */}
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              New Game
            </button>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center">
              <h2 className="text-3xl font-bold mb-4">{message}</h2>
              {winner && (
                <p className="text-xl mb-6">
                  {winner === Color.Red ? '🔴 Red' : '⚫ Black'} Wins!
                </p>
              )}
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-amber-600 text-white text-lg rounded-lg hover:bg-amber-700 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Board */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <BoardView
            pieces={gameState.board.pieces}
            selectedPosition={selectedPosition}
            validMoves={validMoves}
            lastMove={lastMove}
            inCheck={inCheck}
            onPositionSelect={handlePositionSelect}
          />
        </div>

        {/* Status Bar */}
        <div className="mt-4 p-4 bg-white rounded-lg shadow flex justify-between items-center">
          <div className="text-sm text-amber-800">
            <p>Mode: {gameMode === 'pvai' ? 'Player vs AI' : gameMode === 'pvp' ? 'Player vs Player' : 'AI vs AI'}</p>
            <p>Difficulty: {difficulty}</p>
          </div>
          <div className="text-sm text-amber-800">
            <p>Moves: {gameState.board.moveHistory.length}</p>
          </div>
        </div>
      </main>

      <footer className="text-center mt-8 text-amber-700 text-sm">
        <p>Built with React + TypeScript + Tailwind CSS</p>
        <p>Factory Mode Demo - Slice 1-4 Complete</p>
      </footer>
    </div>
  );
}

export default App;
