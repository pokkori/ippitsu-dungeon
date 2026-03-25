'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EncyclopediaGrid from '@/components/EncyclopediaGrid';
import { EncyclopediaData } from '@/lib/types';

const ENCYCLOPEDIA_KEY = 'osd-encyclopedia';

export default function EncyclopediaPage() {
  const [data, setData] = useState<EncyclopediaData>({ monsters: [], items: [] });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ENCYCLOPEDIA_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold text-yellow-400">図鑑</h1>
      </div>

      <EncyclopediaGrid
        encounteredMonsters={data.monsters}
        obtainedItems={data.items}
      />
    </div>
  );
}
