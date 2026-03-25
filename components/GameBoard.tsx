'use client';

import { Cell as CellType } from '@/lib/types';
import Cell from './Cell';

interface GameBoardProps {
  grid: CellType[][];
  gridSize: number;
  heroPos: { row: number; col: number };
  path: { row: number; col: number }[];
  canDescend: boolean;
}

export default function GameBoard({ grid, gridSize, heroPos, path, canDescend }: GameBoardProps) {
  // セルサイズ計算: calc((100vw - 32px) / gridSize) 最大60px
  // CSR only, use a reasonable default
  const maxCellSize = 60;
  const cellSize = typeof window !== 'undefined'
    ? Math.min((window.innerWidth - 32) / gridSize, maxCellSize)
    : maxCellSize;

  const boardSize = cellSize * gridSize;

  return (
    <div className="relative" style={{ touchAction: 'none' }}>
      {/* SVG overlay for path trace */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: boardSize, height: boardSize, zIndex: 10 }}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
      >
        {path.length > 1 && (
          <polyline
            points={path.map(p =>
              `${p.col * cellSize + cellSize / 2},${p.row * cellSize + cellSize / 2}`
            ).join(' ')}
            fill="none"
            stroke="rgba(96, 165, 250, 0.6)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: 0,
          width: boardSize,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              cell={cell}
              isHero={r === heroPos.row && c === heroPos.col}
              canDescend={canDescend}
              size={cellSize}
            />
          ))
        )}
      </div>
    </div>
  );
}
