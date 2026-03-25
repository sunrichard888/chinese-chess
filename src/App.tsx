import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [boardTheme, setBoardTheme] = useState<'classic' | 'modern' | 'green'>('classic');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [message, setMessage] = useState('');
  const aiRunning = useRef(false);

  useEffect(() => { initializeAudio(); }, [initializeAudio]);

  /* ── game status detection ── */
  useEffect(() => {
    const status = evaluateGameStatus(gameState.board);

    if (status.status === 'checkmate' || status.status === 'stalemate' || status.status === 'draw') {
      setGameOver(true);
      setWinner(status.winner || null);

      const msg =
        status.status === 'checkmate'
          ? `绝杀！${status.winner === Color.Red ? '红方' : '黑方'}获胜！`
          : status.status === 'stalemate'
          ? '和棋！无子可动'
          : '和棋！';
      setMessage(msg);

      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(msg);
        u.lang = 'zh-CN';
        u.rate = 0.9;
        speechSynthesis.speak(u);
      }
    } else if (status.status === 'check') {
      const checkMsg = gameState.board.turn === Color.Red ? '红方被将军！' : '黑方被将军！';
      setMessage(checkMsg);

      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('将军！');
        u.lang = 'zh-CN';
        u.rate = 1.1;
        speechSynthesis.speak(u);
      }
    } else {
      setMessage('');
    }
  }, [gameState]);

  /* ── AI move ── */
  useEffect(() => {
    // Gate: only in PvAI, Black's turn, game not over, AI not already running
    if (gameMode !== 'pvai') return;
    if (gameOver) return;
    if (gameState.board.turn !== Color.Black) return;
    if (aiRunning.current) return;

    // Double-check game status before kicking off AI
    const status = evaluateGameStatus(gameState.board);
    if (status.status === 'checkmate' || status.status === 'stalemate' || status.status === 'draw') {
      return;
    }

    aiRunning.current = true;

    const timer = setTimeout(() => {
      try {
        const diffConfig: Difficulty =
          difficulty === 'easy' ? Difficulty.Easy :
          difficulty === 'hard' ? Difficulty.Hard :
          Difficulty.Medium;

        const result = getBestMove(gameState.board, diffConfig, Color.Black);

        if (result.move?.from && result.move?.to) {
          makeMove(result.move.from, result.move.to);
        } else {
          // No valid move → game must be over
          const s = evaluateGameStatus(gameState.board);
          if (s.status === 'checkmate' || s.status === 'stalemate') {
            setGameOver(true);
            setWinner(s.winner || null);
            setMessage(
              s.status === 'checkmate'
                ? `绝杀！${s.winner === Color.Red ? '红方' : '黑方'}获胜！`
                : '和棋！无子可动'
            );
          }
        }
      } finally {
        aiRunning.current = false;
      }
    }, 400);

    return () => { clearTimeout(timer); aiRunning.current = false; };
  }, [gameState.board.turn, gameMode, gameOver, difficulty, gameState.board, makeMove]);

  /* ── click handler ── */
  const handlePositionSelect = useCallback(
    (position: { file: number; rank: number } | null) => {
      if (gameOver) return;
      if (!position) { selectPosition(null); return; }

      const state = useGameStore.getState();

      if (state.selectedPosition) {
        const success = makeMove(state.selectedPosition, position);
        if (success) { selectPosition(null); return; }
      }

      selectPosition(position);
    },
    [selectPosition, makeMove, gameOver],
  );

  const handleReset = () => {
    resetGame();
    setGameOver(false);
    setWinner(null);
    setMessage('');
    aiRunning.current = false;
  };

  /* ── UI ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center p-4">
      {/* Header */}
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold text-amber-900">中国象棋</h1>
        <p className="text-sm text-amber-700">Chinese Chess</p>
      </header>

      {/* Status bar */}
      <div className="w-full max-w-xl mb-3 px-4 py-2 bg-white rounded-lg shadow flex items-center justify-between">
        <span className="font-semibold">
          {gameState.board.turn === Color.Red ? '🔴 红方走棋' : '⚫ 黑方走棋'}
        </span>
        {message && (
          <span className={`font-bold text-sm px-3 py-1 rounded ${
            message.includes('绝杀') ? 'bg-red-600 text-white' :
            message.includes('将军') ? 'bg-orange-500 text-white' :
            'text-amber-800'
          }`}>
            {message}
          </span>
        )}
        <span className="text-sm text-amber-700">
          第 {Math.floor(gameState.board.moveHistory.length / 2) + 1} 回合
        </span>
      </div>

      {/* Board */}
      <div className="w-full max-w-xl bg-white p-4 rounded-lg shadow-lg">
        <BoardView
          pieces={gameState.board.pieces}
          selectedPosition={selectedPosition}
          validMoves={validMoves}
          lastMove={lastMove}
          inCheck={inCheck}
          onPositionSelect={handlePositionSelect}
          flipBoard={flipBoard}
          theme={boardTheme}
        />
      </div>

      {/* Controls */}
      <div className="w-full max-w-xl mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => undo()} disabled={gameOver}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 text-sm font-medium">
          ↶ 悔棋
        </button>
        <button onClick={() => redo()} disabled={gameOver}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 text-sm font-medium">
          ↷ 重做
        </button>
        <button onClick={() => setFlipBoard(!flipBoard)}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
          🔄 翻转
        </button>
        <button onClick={handleReset}
          className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
          🆕 新局
        </button>
      </div>

      {/* Settings row */}
      <div className="w-full max-w-xl mt-2 flex flex-wrap items-center gap-2 text-sm">
        <select value={boardTheme}
          onChange={(e) => setBoardTheme(e.target.value as 'classic' | 'modern' | 'green')}
          className="px-3 py-1.5 border rounded-lg bg-white">
          <option value="classic">🎨 经典木纹</option>
          <option value="modern">⚫ 现代简约</option>
          <option value="green">🌿 绿色棋盘</option>
        </select>

        <select value={gameMode}
          onChange={(e) => { setGameMode(e.target.value as 'pvp' | 'pvai' | 'aivai'); handleReset(); }}
          className="px-3 py-1.5 border rounded-lg bg-white"
          disabled={!gameOver && gameState.board.moveHistory.length > 0}>
          <option value="pvai">🤖 人机对战</option>
          <option value="pvp">👥 双人对战</option>
          <option value="aivai">🤖🤖 AI 对战</option>
        </select>

        <select value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="px-3 py-1.5 border rounded-lg bg-white"
          disabled={gameMode !== 'pvai'}>
          <option value="easy">简单</option>
          <option value="medium">中等</option>
          <option value="hard">困难</option>
        </select>

        <VolumeControl />
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={handleReset}>
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4"
               onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-3 text-amber-900">{message}</h2>
            {winner && (
              <div className="text-xl mb-5">
                <p className="mb-1">🏆 获胜者</p>
                <p className={`font-bold ${winner === Color.Red ? 'text-red-600' : 'text-gray-900'}`}>
                  {winner === Color.Red ? '🔴 红方' : '⚫ 黑方'}
                </p>
              </div>
            )}
            <button onClick={handleReset}
              className="px-8 py-3 bg-amber-600 text-white text-lg rounded-lg hover:bg-amber-700 transition">
              🔄 再来一局
            </button>
          </div>
        </div>
      )}

      <footer className="mt-6 text-center text-amber-600 text-xs">
        Built with React + TypeScript + Tailwind CSS
      </footer>
    </div>
  );
}

export default App;
