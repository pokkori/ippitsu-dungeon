'use client';

import { HeroStats } from '@/lib/types';

interface StatusBarProps {
  stats: HeroStats;
  floor: number;
  score: number;
  visitedCount: number;
  totalCells: number;
}

export default function StatusBar({ stats, floor, score, visitedCount, totalCells }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 text-white text-sm rounded-lg">
      <span>
        {'❤️'.repeat(Math.max(0, stats.hp))}
        {'🖤'.repeat(Math.max(0, stats.maxHp - stats.hp))}
      </span>
      <span>⚔️{stats.attack}</span>
      <span>🛡️{stats.defense}</span>
      <span>B{floor}F</span>
      <span>{score}pt</span>
      <span className="text-xs text-gray-400">{visitedCount}/{totalCells}</span>
    </div>
  );
}
