'use client';

import { useEffect } from 'react';

interface FloorClearModalProps {
  floor: number;
  score: number;
  monstersDefeated: number;
  onNext: () => void;
}

export default function FloorClearModal({
  floor,
  score,
  monstersDefeated,
  onNext,
}: FloorClearModalProps) {
  useEffect(() => {
    const timer = setTimeout(onNext, 1500);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="text-center animate-bounce">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">
          B{floor}F クリア！
        </h2>
        <div className="text-white space-y-1">
          <p>スコア: {score}pt</p>
          <p>討伐数: {monstersDefeated}体</p>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="text-2xl animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              ✨
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
