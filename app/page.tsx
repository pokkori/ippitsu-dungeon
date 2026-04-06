'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const BEST_KEY = 'osd-best-floor';

interface BestRecord {
  floor: number;
  attack: number;
  defense: number;
  score: number;
}

/* ---------- Inline SVG icons ---------- */
function DungeonIcon() {
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect x="12" y="8" width="48" height="56" rx="4" stroke="#FCD34D" strokeWidth="2" fill="none" />
      <path d="M24 64V44l12-16 12 16v20" stroke="#FCD34D" strokeWidth="2" fill="none" />
      <circle cx="36" cy="36" r="4" fill="#FCD34D" opacity={0.6} />
      <path d="M20 20h8M44 20h8M20 28h4M48 28h4" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />
    </svg>
  );
}

function SwordIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M8 20l12-12" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 5l6 6-3 3-6-6 3-3z" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <path d="M6 22l2-2M10 22l-2 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="20" height="18" rx="3" stroke="#3B82F6" strokeWidth="2" fill="none" />
      <line x1="4" y1="12" x2="24" y2="12" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="10" y1="4" x2="10" y2="8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="4" x2="18" y2="8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="18" r="2" fill="#3B82F6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M6 4h16v20H6z" stroke="#9CA3AF" strokeWidth="2" fill="none" />
      <path d="M10 4v20" stroke="#9CA3AF" strokeWidth="1.5" />
      <line x1="13" y1="10" x2="19" y2="10" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="14" x2="18" y2="14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Particle field ---------- */
function ParticleField() {
  const particles = [
    { top: "10%", left: "15%", size: 4, delay: "0s", dur: "7s", color: "rgba(252,211,77,0.35)" },
    { top: "25%", left: "80%", size: 5, delay: "1s", dur: "6s", color: "rgba(252,211,77,0.3)" },
    { top: "45%", left: "10%", size: 3, delay: "2s", dur: "8s", color: "rgba(59,130,246,0.3)" },
    { top: "60%", left: "70%", size: 6, delay: "0.5s", dur: "5s", color: "rgba(252,211,77,0.25)" },
    { top: "78%", left: "45%", size: 4, delay: "3s", dur: "7s", color: "rgba(59,130,246,0.25)" },
    { top: "15%", left: "55%", size: 3, delay: "1.5s", dur: "6.5s", color: "rgba(252,211,77,0.3)" },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `dfloat ${p.dur} ${p.delay} ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dfloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-18px) scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function TitlePage() {
  const [best, setBest] = useState<BestRecord | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BEST_KEY);
      if (saved) {
        setBest(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8 min-h-dvh relative"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(120,119,198,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(99,179,237,0.1) 0%, transparent 50%), #0F0F1A",
        color: "#e0e0e0",
      }}
    >
      <ParticleField />

      {/* Title */}
      <div className="text-center relative z-10">
        <div className="flex justify-center mb-4">
          <DungeonIcon />
        </div>
        <h1
          className="text-4xl font-bold tracking-wider"
          style={{
            background: "linear-gradient(135deg, #FFD93D, #FF6B6B, #EE5A24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 20px rgba(255,217,61,0.3))",
          }}
        >
          一筆書き
          <br />
          ダンジョン
        </h1>
        <p className="text-sm mt-2 text-gray-400">One Stroke Dungeon</p>
        <p className="text-sm mt-4 text-gray-300 leading-relaxed">
          全マスを一筆で踏破して
          <br />
          ダンジョンを攻略せよ
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        <Link
          href="/play?mode=normal"
          aria-label="通常モードで冒険を開始する"
          className="w-full text-center py-4 px-6 rounded-2xl text-lg font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] min-h-[52px] flex items-center justify-center gap-2 text-white"
          style={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
            boxShadow: "0 0 20px rgba(238,90,36,0.4)",
          }}
        >
          <SwordIcon />
          冒険開始
        </Link>

        <Link
          href="/play?mode=daily"
          aria-label="デイリーダンジョンをプレイする"
          className="w-full text-center py-4 px-6 rounded-xl text-lg font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] min-h-[52px] flex items-center justify-center gap-2 text-white"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <CalendarIcon />
          デイリーダンジョン
        </Link>

        <Link
          href="/encyclopedia"
          aria-label="モンスター図鑑を見る"
          className="w-full text-center py-4 px-6 rounded-xl text-lg font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] min-h-[52px] flex items-center justify-center gap-2 text-gray-300"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <BookIcon />
          図鑑
        </Link>
      </div>

      {/* Best record */}
      {best && (
        <div
          className="text-center text-sm relative z-10 px-6 py-3 rounded-[20px]"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="text-gray-300">
            最高到達: <span className="text-yellow-400 font-bold">B{best.floor}F</span> ATK:{best.attack} DEF:{best.defense}
          </p>
          <p className="text-gray-400 text-xs mt-1">Score: {best.score}</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pb-6 text-center text-xs text-gray-500 space-y-2 relative z-10">
        <div className="flex justify-center gap-4">
          <Link href="/legal" className="hover:text-gray-300 min-h-[44px] flex items-center">
            特定商取引法
          </Link>
          <Link href="/privacy" className="hover:text-gray-300 min-h-[44px] flex items-center">
            プライバシー
          </Link>
          <Link href="/terms" className="hover:text-gray-300 min-h-[44px] flex items-center">
            利用規約
          </Link>
        </div>
        <p>(C) 2026 ポッコリラボ</p>
      </footer>
    </div>
  );
}
