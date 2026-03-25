'use client';

import { ITEMS } from '@/lib/data';

interface EquipmentListProps {
  itemsCollected: string[];
}

export default function EquipmentList({ itemsCollected }: EquipmentListProps) {
  if (itemsCollected.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-1">
      {itemsCollected.map((id, idx) => {
        const item = ITEMS.find(i => i.id === id);
        if (!item) return null;
        return (
          <span
            key={`${id}-${idx}`}
            className="text-lg flex-shrink-0"
            title={item.name}
          >
            {item.emoji}
          </span>
        );
      })}
    </div>
  );
}
