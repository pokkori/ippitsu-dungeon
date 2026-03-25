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
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-wider" style={{ color: '#FCD34D' }}>
          一筆書き
          <br />
          ダンジョン
        </h1>
        <p className="text-sm mt-2 opacity-70">One Stroke Dungeon</p>
        <p className="text-sm mt-4 opacity-80 leading-relaxed">
          全マスを一筆で踏破して
          <br />
          ダンジョンを攻略せよ
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/play?mode=normal"
          aria-label="通常モードで冒険を開始する"
          className="block w-full text-center py-4 px-6 rounded-xl text-lg font-bold transition-transform active:scale-95 min-h-[56px] flex items-center justify-center"
          style={{ backgroundColor: '#F59E0B', color: '#1a1a2e' }}
        >
          冒険開始
        </Link>

        <Link
          href="/play?mode=daily"
          aria-label="デイリーダンジョンをプレイする"
          className="block w-full text-center py-4 px-6 rounded-xl text-lg font-bold transition-transform active:scale-95 min-h-[56px] flex items-center justify-center"
          style={{ backgroundColor: '#3B82F6', color: '#fff' }}
        >
          デイリーダンジョン
        </Link>

        <Link
          href="/encyclopedia"
          aria-label="モンスター図鑑を見る"
          className="block w-full text-center py-4 px-6 rounded-xl text-lg font-bold transition-transform active:scale-95 min-h-[56px] flex items-center justify-center"
          style={{ backgroundColor: '#374151', color: '#e0e0e0', border: '1px solid #4B5563' }}
        >
          図鑑
        </Link>
      </div>

      {/* Best record */}
      {best && (
        <div className="text-center text-sm opacity-70">
          <p>
            最高到達: B{best.floor}F ATK:{best.attack} DEF:{best.defense}
          </p>
          <p>Score: {best.score}</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 pb-6 text-center text-xs opacity-50 space-y-2">
        <div className="flex justify-center gap-4">
          <Link href="/legal" className="hover:opacity-80">特定商取引法</Link>
          <Link href="/privacy" className="hover:opacity-80">プライバシー</Link>
          <Link href="/terms" className="hover:opacity-80">利用規約</Link>
        </div>
        <p>© 2026 ポッコリラボ</p>
      </footer>
    </div>
  );
}
