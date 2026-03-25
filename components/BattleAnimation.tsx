'use client';

import { useEffect, useState } from 'react';

interface BattleAnimationProps {
  monsterEmoji: string;
  monsterName: string;
  damage: number;
  defeated: boolean;
  onComplete: () => void;
}

export default function BattleAnimation({
  monsterEmoji,
  monsterName,
  damage,
  defeated,
  onComplete,
}: BattleAnimationProps) {
  const [phase, setPhase] = useState(0);
  // 0: 突進 (0-0.3s)
  // 1: 衝突 (0.3-0.5s)
  // 2: ダメージ表示 (0.5-0.8s)
  // 3: 消滅 (0.8-1.2s)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 800),
      setTimeout(() => onComplete(), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={`relative ${phase === 1 ? 'animate-shake' : ''}`}>
        {/* 勇者 */}
        <span
          className="text-5xl absolute transition-transform duration-300"
          style={{
            left: -60,
            transform: phase >= 1 ? 'translateX(40px)' : 'translateX(0)',
          }}
        >
          🧙
        </span>

        {/* 衝突エフェクト */}
        {phase === 1 && (
          <span className="text-5xl absolute" style={{ left: -10, top: -10 }}>
            💥
          </span>
        )}

        {/* モンスター */}
        <span
          className="text-5xl transition-all duration-300"
          style={{
            opacity: phase >= 3 && defeated ? 0 : 1,
            transform: phase >= 3 && defeated ? 'scale(0)' : 'scale(1)',
          }}
        >
          {monsterEmoji}
        </span>

        {/* ダメージ数値 */}
        {phase >= 2 && (
          <span
            className="absolute text-2xl font-bold text-red-400 transition-all duration-300"
            style={{
              top: phase >= 2 ? -40 : 0,
              right: -30,
              opacity: phase >= 3 ? 0 : 1,
            }}
          >
            -{damage}
          </span>
        )}

        {/* モンスター名 */}
        <p className="text-white text-center mt-16 text-sm">{monsterName}</p>
      </div>
    </div>
  );
}
