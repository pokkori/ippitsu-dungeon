'use client';

import { MONSTERS, ITEMS } from '@/lib/data';

interface EncyclopediaGridProps {
  encounteredMonsters: string[];
  obtainedItems: string[];
}

export default function EncyclopediaGrid({
  encounteredMonsters,
  obtainedItems,
}: EncyclopediaGridProps) {
  return (
    <div className="space-y-6">
      {/* モンスター図鑑 */}
      <div>
        <h2 className="text-lg font-bold text-yellow-400 mb-3">モンスター図鑑</h2>
        <div className="grid grid-cols-2 gap-2">
          {MONSTERS.map((monster) => {
            const encountered = encounteredMonsters.includes(monster.id);
            return (
              <div
                key={monster.id}
                className={`p-3 rounded-lg border ${
                  encountered
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                {encountered ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{monster.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-bold">{monster.name}</p>
                      <p className="text-gray-400 text-xs">HP: {monster.hp}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl opacity-30">❓</span>
                    <p className="text-gray-600 text-sm">???</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 装備図鑑 */}
      <div>
        <h2 className="text-lg font-bold text-yellow-400 mb-3">装備図鑑</h2>
        <div className="grid grid-cols-2 gap-2">
          {ITEMS.map((item) => {
            const obtained = obtainedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${
                  obtained
                    ? 'bg-gray-800 border-gray-600'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                {obtained ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className="text-white text-sm font-bold">{item.name}</p>
                      <p className="text-gray-400 text-xs">
                        {Object.entries(item.effect)
                          .map(([k, v]) => `${k}+${v}`)
                          .join(' ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl opacity-30">❓</span>
                    <p className="text-gray-600 text-sm">???</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
