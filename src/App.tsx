import { useState, useEffect, useCallback, useRef } from 'react';
import { BoardView } from './ui/BoardView';
import { useGameStore } from './app/game-store';
import { getBestMove, Difficulty } from './ai/engine';
import { getEngine, DIFFICULTY_CONFIGS, EngineStatus } from './ai/fairy-stockfish';
import { Color } from './core/types';
import { evaluateGameStatus } from './core/rules';
import { VolumeControl } from './ui/VolumeControl';

type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';

function App() {
  const {
    gameState,
    selectedPosition,
    validMoves,
    lastMove,
    inCheck,
    gameMode,
    selectPosition,
    makeMove,
    resetGame,
    setGameMode,
    initializeAudio,
    undo,
    redo,
  } = useGameStore();

  const [flipBoard, setFlipBoard] = useState(false);
  const [boardTheme, setBoardTheme] = useState<'classic' | 'stone' | 'glass'>('classic');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [statusText, setStatusText] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('medium');
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('loading');
  const [aiThinking, setAiThinking] = useState(false);
  const aiRunning = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => { initializeAudio(); }, [initializeAudio]);

  /* ── Initialize Fairy-Stockfish engine ── */
  useEffect(() => {
    const engine = getEngine();
    const unsub = engine.onStatus((s) => setEngineStatus(s));
    engine.waitReady().then((ok) => {
      if (ok) setEngineStatus('ready');
      else setEngineStatus('error');
    });
    return unsub;
  }, []);

  /* ── Enhanced audio ── */
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch { /* silent */ }
    }
    return audioCtxRef.current;
  }, []);

  const playCheckSound = useCallback(() => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    [660, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  }, [getAudioCtx]);

  const playCheckmateSound = useCallback(() => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const freqs = [880, 660, 440, 330, 220];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = i < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.5);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
    setTimeout(() => {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('绝杀');
        u.lang = 'zh-CN';
        u.rate = 0.8;
        u.pitch = 0.8;
        speechSynthesis.speak(u);
      }
    }, 700);
  }, [getAudioCtx]);

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
      setStatusText(msg);
      if (status.status === 'checkmate') playCheckmateSound();
    } else if (status.status === 'check') {
      const checkMsg = gameState.board.turn === Color.Red ? '红方被将军！' : '黑方被将军！';
      setStatusText(checkMsg);
      playCheckSound();
    } else {
      setStatusText('');
    }
  }, [gameState, playCheckSound, playCheckmateSound]);

  /* ── AI move (Fairy-Stockfish primary, fallback to built-in engine) ── */
  useEffect(() => {
    if (gameMode !== 'pvai') return;
    if (gameOver) return;
    if (gameState.board.turn !== Color.Black) return;
    if (aiRunning.current) return;

    const status = evaluateGameStatus(gameState.board);
    if (status.status === 'checkmate' || status.status === 'stalemate' || status.status === 'draw') return;

    aiRunning.current = true;
    setAiThinking(true);

    const config = DIFFICULTY_CONFIGS[aiDifficulty] || DIFFICULTY_CONFIGS.medium;

    const doMove = async () => {
      try {
        let move = null;

        // Try Fairy-Stockfish first
        if (engineStatus === 'ready') {
          const engine = getEngine();
          move = await engine.getBestMove(gameState.board, config);
        }

        // Fallback to built-in engine if WASM failed
        if (!move) {
          const fallbackDiff =
            aiDifficulty === 'beginner' || aiDifficulty === 'easy' ? Difficulty.Easy :
            aiDifficulty === 'hard' || aiDifficulty === 'master' ? Difficulty.Hard :
            Difficulty.Medium;
          const result = getBestMove(gameState.board, fallbackDiff, Color.Black);
          move = result.move;
        }

        if (move?.from && move?.to) {
          makeMove(move.from, move.to);
        } else {
          const s = evaluateGameStatus(gameState.board);
          if (s.status === 'checkmate' || s.status === 'stalemate') {
            setGameOver(true);
            setWinner(s.winner || null);
            setStatusText(
              s.status === 'checkmate'
                ? `绝杀！${s.winner === Color.Red ? '红方' : '黑方'}获胜！`
                : '和棋！无子可动'
            );
          }
        }
      } finally {
        aiRunning.current = false;
        setAiThinking(false);
      }
    };

    // Small delay so user sees their move before AI responds
    const timer = setTimeout(doMove, 300);
    return () => { clearTimeout(timer); aiRunning.current = false; setAiThinking(false); };
  }, [gameState.board.turn, gameMode, gameOver, aiDifficulty, engineStatus, gameState.board, makeMove]);

  /* ── click handler ── */
  const handlePositionSelect = useCallback(
    (position: { file: number; rank: number } | null) => {
      if (gameOver || aiThinking) return;
      if (!position) { selectPosition(null); return; }

      const state = useGameStore.getState();
      if (state.selectedPosition) {
        const success = makeMove(state.selectedPosition, position);
        if (success) { selectPosition(null); return; }
      }
      selectPosition(position);
    },
    [selectPosition, makeMove, gameOver, aiThinking],
  );

  const handleReset = () => {
    resetGame();
    setGameOver(false);
    setWinner(null);
    setStatusText('');
    aiRunning.current = false;
    setAiThinking(false);
  };

  /* ── Engine status indicator ── */
  const engineStatusLabel = () => {
    switch (engineStatus) {
      case 'loading': return '⏳ 引擎加载中...';
      case 'ready': return '✅ Fairy-Stockfish';
      case 'thinking': return '🤔 思考中...';
      case 'error': return '⚠️ 使用内置引擎';
    }
  };

  /* ── UI ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center p-4">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold text-amber-900">中国象棋</h1>
        <p className="text-sm text-amber-700">Chinese Chess</p>
      </header>

      {/* Status bar */}
      <div className="w-full max-w-xl mb-3 px-4 py-2 bg-white rounded-lg shadow flex items-center justify-between">
        <span className="font-semibold">
          {gameState.board.turn === Color.Red ? '🔴 红方走棋' : '⚫ 黑方走棋'}
          {aiThinking && gameState.board.turn === Color.Black && (
            <span className="ml-2 text-xs text-blue-500 animate-pulse">思考中...</span>
          )}
        </span>
        {statusText && (
          <span className={`font-bold text-sm px-3 py-1 rounded ${
            statusText.includes('绝杀') ? 'bg-red-600 text-white' :
            statusText.includes('将军') ? 'bg-orange-500 text-white' :
            'text-amber-800'
          }`}>
            {statusText}
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
          isCheckmate={gameOver && statusText.includes('绝杀')}
          checkmateWinner={winner}
          onPositionSelect={handlePositionSelect}
          flipBoard={flipBoard}
          theme={boardTheme}
        />
      </div>

      {/* Controls */}
      <div className="w-full max-w-xl mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => undo()} disabled={gameOver || aiThinking}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 text-sm font-medium">
          ↶ 悔棋
        </button>
        <button onClick={() => redo()} disabled={gameOver || aiThinking}
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

      {/* Settings */}
      <div className="w-full max-w-xl mt-2 flex flex-wrap items-center gap-2 text-sm">
        <select value={boardTheme}
          onChange={(e) => setBoardTheme(e.target.value as 'classic' | 'stone' | 'glass')}
          className="px-3 py-1.5 border rounded-lg bg-white">
          <option value="classic">🪵 经典木纹</option>
          <option value="stone">🪨 青石玉棋</option>
          <option value="glass">💎 水晶琉璃</option>
        </select>

        <select value={gameMode}
          onChange={(e) => { setGameMode(e.target.value as 'pvp' | 'pvai' | 'aivai'); handleReset(); }}
          className="px-3 py-1.5 border rounded-lg bg-white"
          disabled={(!gameOver && gameState.board.moveHistory.length > 0) || aiThinking}>
          <option value="pvai">🤖 人机对战</option>
          <option value="pvp">👥 双人对战</option>
          <option value="aivai">🤖🤖 AI 对战</option>
        </select>

        <select value={aiDifficulty}
          onChange={(e) => setAiDifficulty(e.target.value as DifficultyLevel)}
          className="px-3 py-1.5 border rounded-lg bg-white"
          disabled={gameMode !== 'pvai' || aiThinking}>
          <option value="beginner">🟢 入门</option>
          <option value="easy">🟡 初级</option>
          <option value="medium">🟠 中级</option>
          <option value="hard">🔴 高级</option>
          <option value="master">⚫ 大师</option>
        </select>

        <VolumeControl />
      </div>

      {/* Engine status */}
      <div className="w-full max-w-xl mt-1 text-xs text-center text-amber-600">
        {engineStatusLabel()}
      </div>

      {/* Game over */}
      {gameOver && (
        <div className="w-full max-w-xl mt-3 p-4 bg-white rounded-lg shadow-lg text-center">
          <p className="text-lg font-bold text-amber-900 mb-2">{statusText}</p>
          {winner && (
            <p className={`text-base mb-3 ${winner === Color.Red ? 'text-red-600' : 'text-gray-900'}`}>
              🏆 {winner === Color.Red ? '红方' : '黑方'}获胜
            </p>
          )}
          <button onClick={handleReset}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium">
            🔄 再来一局
          </button>
        </div>
      )}

      <footer className="mt-6 text-center text-amber-600 text-xs">
        Built with React + TypeScript + Tailwind CSS + Fairy-Stockfish
      </footer>
    </div>
  );
}

export default App;
