'use client';

import { useReducer, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { gameReducer, initialState } from '@/lib/gameReducer';
import { playMove, playEncounter, playHit, playDefeat, playChest, playTrap, playStairsOpen, playFloorClear, playGameOver, playInvalid } from '@/lib/sound';
import GameBoard from '@/components/GameBoard';
import StatusBar from '@/components/StatusBar';
import EquipmentList from '@/components/EquipmentList';
import BattleAnimation from '@/components/BattleAnimation';
import FloorClearModal from '@/components/FloorClearModal';
import ResultModal from '@/components/ResultModal';

const BEST_KEY = 'osd-best-floor';
const ENCYCLOPEDIA_KEY = 'osd-encyclopedia';
const DAILY_KEY = 'osd-daily';

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get('mode') || 'normal') as 'normal' | 'daily';

  const [state, dispatch] = useReducer(gameReducer, initialState);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const prevCanDescend = useRef(false);
  const [bestFloor, setBestFloor] = useBestFloor();

  // Start game on mount
  useEffect(() => {
    // Check daily limit
    if (mode === 'daily') {
      try {
        const saved = localStorage.getItem(DAILY_KEY);
        if (saved) {
          const record = JSON.parse(saved);
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          if (record.date === today) {
            alert('本日のデイリーダンジョンは挑戦済みです');
            router.push('/');
            return;
          }
        }
      } catch {
        // ignore
      }
    }
    dispatch({ type: 'START', mode });
  }, [mode, router]);

  // Sound effects based on state changes
  const prevPhaseRef = useRef(state.phase);
  useEffect(() => {
    if (state.phase === 'battle' && prevPhaseRef.current === 'playing') {
      playEncounter();
      setTimeout(playHit, 300);
      if (state.battleResult?.defeated) {
        setTimeout(playDefeat, 600);
      }
    }
    if (state.phase === 'floor-clear' && prevPhaseRef.current === 'playing') {
      playFloorClear();
    }
    if (state.phase === 'game-over' && prevPhaseRef.current !== 'game-over') {
      playGameOver();
      saveBestRecord(state.floor, state.heroStats.attack, state.heroStats.defense, state.score);
      saveEncyclopedia(state);
      if (state.isDaily) {
        saveDailyRecord(state);
      }
    }
    prevPhaseRef.current = state.phase;
  }, [state.phase, state.battleResult, state.floor, state.heroStats, state.score, state.isDaily]);

  // Stairs open sound
  useEffect(() => {
    if (state.canDescend && !prevCanDescend.current) {
      playStairsOpen();
    }
    prevCanDescend.current = state.canDescend;
  }, [state.canDescend]);

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (state.phase !== 'playing') return;
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
      if (e.key === 'z' || e.key === 'u') {
        dispatch({ type: 'UNDO' });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.heroPos, state.gridSize, state.grid, state.canDescend]);

  // Touch controls
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    function handleTouchStart(e: TouchEvent) {
      e.preventDefault();
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      const threshold = 30;

      if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

      let dir: 'up' | 'down' | 'left' | 'right';
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'right' : 'left';
      } else {
        dir = dy > 0 ? 'down' : 'up';
      }
      handleMove(dir);
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state.phase, state.heroPos, state.gridSize, state.grid, state.canDescend]);

  function handleMove(dir: 'up' | 'down' | 'left' | 'right') {
    if (state.phase !== 'playing') return;

    // Check if move is valid for sound
    const dirMap = {
      up: { row: -1, col: 0 },
      down: { row: 1, col: 0 },
      left: { row: 0, col: -1 },
      right: { row: 0, col: 1 },
    };
    const delta = dirMap[dir];
    const newRow = state.heroPos.row + delta.row;
    const newCol = state.heroPos.col + delta.col;

    if (
      newRow < 0 || newRow >= state.gridSize ||
      newCol < 0 || newCol >= state.gridSize ||
      state.grid[newRow]?.[newCol]?.visited ||
      (state.grid[newRow]?.[newCol]?.type === 'stairs' && !state.canDescend)
    ) {
      playInvalid();
      return;
    }

    const targetType = state.grid[newRow][newCol].type;
    if (targetType === 'chest') {
      setTimeout(playChest, 50);
    } else if (targetType === 'trap') {
      setTimeout(playTrap, 50);
    } else {
      playMove();
    }

    dispatch({ type: 'MOVE', dir });
  }

  const handleBattleEnd = useCallback(() => {
    dispatch({ type: 'BATTLE_END' });
  }, []);

  const handleNextFloor = useCallback(() => {
    dispatch({ type: 'NEXT_FLOOR' });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: 'START', mode });
  }, [mode]);

  const handleTitle = useCallback(() => {
    router.push('/');
  }, [router]);

  // Don't render until game is started
  if (state.phase === 'title' || state.grid.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">ダンジョン生成中...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Status Bar */}
      <StatusBar
        stats={state.heroStats}
        floor={state.floor}
        score={state.score}
        visitedCount={state.visitedCount}
        totalCells={state.totalCells}
      />

      {/* Game Board */}
      <div
        ref={boardRef}
        className="flex-1 flex items-center justify-center touch-none"
      >
        <GameBoard
          grid={state.grid}
          gridSize={state.gridSize}
          heroPos={state.heroPos}
          path={state.path}
          canDescend={state.canDescend}
        />
      </div>

      {/* Footer: Undo + Equipment */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50">
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          disabled={state.path.length <= 1}
        >
          ↩️ 戻す
        </button>
        <EquipmentList itemsCollected={state.itemsCollected} />
      </div>

      {/* Overlays */}
      {state.phase === 'battle' && state.battleResult && (
        <BattleAnimation
          monsterEmoji={state.battleResult.monsterEmoji}
          monsterName={state.battleResult.monsterName}
          damage={state.battleResult.damage}
          defeated={state.battleResult.defeated}
          onComplete={handleBattleEnd}
        />
      )}

      {state.phase === 'floor-clear' && (
        <FloorClearModal
          floor={state.floor}
          score={state.score}
          monstersDefeated={state.monstersDefeated}
          onNext={handleNextFloor}
        />
      )}

      {state.phase === 'game-over' && (
        <ResultModal
          state={state}
          bestFloor={bestFloor}
          onRestart={handleRestart}
          onTitle={handleTitle}
        />
      )}
    </div>
  );
}

function useBestFloor(): [number, (f: number) => void] {
  const ref = useRef(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        ref.current = data.floor || 1;
      }
    } catch {
      // ignore
    }
  }, []);

  const set = (f: number) => {
    if (f > ref.current) ref.current = f;
  };

  return [ref.current, set];
}

function saveBestRecord(floor: number, attack: number, defense: number, score: number) {
  try {
    const saved = localStorage.getItem(BEST_KEY);
    const prev = saved ? JSON.parse(saved) : { floor: 0, score: 0 };
    if (floor > prev.floor || (floor === prev.floor && score > prev.score)) {
      localStorage.setItem(BEST_KEY, JSON.stringify({ floor, attack, defense, score }));
    }
  } catch {
    // ignore
  }
}

function saveEncyclopedia(state: { monstersDefeated: number; itemsCollected: string[]; grid: { type: string; monster?: { id: string } }[][] }) {
  try {
    const saved = localStorage.getItem(ENCYCLOPEDIA_KEY);
    const data = saved ? JSON.parse(saved) : { monsters: [], items: [] };

    // Add encountered monsters from the grid
    for (const row of state.grid) {
      for (const cell of row) {
        if (cell.type === 'monster' && cell.monster && !data.monsters.includes(cell.monster.id)) {
          // Monster was on the board; check if visited (encountered)
        }
      }
    }

    // Add all collected items
    for (const itemId of state.itemsCollected) {
      if (!data.items.includes(itemId)) {
        data.items.push(itemId);
      }
    }

    localStorage.setItem(ENCYCLOPEDIA_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function saveDailyRecord(state: { floor: number; score: number }) {
  try {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    localStorage.setItem(DAILY_KEY, JSON.stringify({
      date: today,
      clearedFloors: state.floor,
      score: state.score,
    }));
  } catch {
    // ignore
  }
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    }>
      <PlayContent />
    </Suspense>
  );
}
