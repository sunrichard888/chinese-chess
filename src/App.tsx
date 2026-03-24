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
    undo,
    redo,
  } = useGameStore();

  const [flipBoard, setFlipBoard] = useState(false);

  // Initialize audio on mount
  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [message, setMessage] = useState('');

  // Check for game over and check status after each move
  useEffect(() => {
    const status = evaluateGameStatus(gameState.board);
    
    if (status.status === 'checkmate' || status.status === 'stalemate' || status.status === 'draw') {
      setGameOver(true);
      setWinner(status.winner || null);
      
      const message = status.status === 'checkmate'
        ? `绝杀！${status.winner === Color.Red ? '红方' : '黑方'}获胜！`
        : status.status === 'stalemate'
        ? '和棋！无子可动'
        : '和棋！';
      
      setMessage(message);
      
      // Announce game over
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    } else if (status.status === 'check') {
      const checkMessage = gameState.board.turn === Color.Red ? '红方将军！' : '黑方将军！';
      setMessage(checkMessage);
      
      // Announce check
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('将军！');
        utterance.lang = 'zh-CN';
        utterance.rate = 1.1;
        speechSynthesis.speak(utterance);
      }
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

      // Simulate thinking time for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const aiResult = getBestMove(gameState.board, difficultyConfig, Color.Black);
      
      if (aiResult.move) {
        makeMove(aiResult.move.from, aiResult.move.to);
      } else {
        // AI has no valid moves - check if checkmate or stalemate
        console.log('AI has no valid moves - game should be over');
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
                {gameState.board.turn === Color.Red ? '🔴 红方' : '⚫ 黑方'}
              </span>
            </p>
            {message && (
              <p className={`text-xl font-bold mt-2 px-4 py-2 rounded-lg ${
                message.includes('绝杀') 
                  ? 'bg-red-600 text-white animate-bounce' 
                  : message.includes('将军')
                  ? 'bg-orange-500 text-white animate-pulse'
                  : 'text-amber-800'
              }`}>
                {message.includes('绝杀') && '🎉 '}
                {message.includes('将军') && '⚠️ '}
                {message}
              </p>
            )}
          </div>
          
          <div className="flex gap-4 items-center">
            {/* Flip Board Button */}
            <button
              onClick={() => setFlipBoard(!flipBoard)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              title="Flip board view (翻转棋盘)"
            >
              🔄 Flip
            </button>
            
            {/* Undo/Redo Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => undo()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                disabled={gameOver}
                title="Undo last move (悔棋)"
              >
                ↶ Undo
              </button>
              <button
                onClick={() => redo()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                disabled={gameOver}
                title="Redo last undone move (重做)"
              >
                ↷ Redo
              </button>
            </div>
            
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
              <h2 className="text-3xl font-bold mb-4 text-amber-900">{message}</h2>
              {winner && (
                <div className="text-2xl mb-6">
                  <p className="mb-2">🏆 获胜者</p>
                  <p className={winner === Color.Red ? 'text-red-600 font-bold' : 'text-black font-bold'}>
                    {winner === Color.Red ? '🔴 红方' : '⚫ 黑方'}
                  </p>
                </div>
              )}
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-amber-600 text-white text-lg rounded-lg hover:bg-amber-700 transition"
              >
                🔄 再来一局
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
            flipBoard={flipBoard}
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
