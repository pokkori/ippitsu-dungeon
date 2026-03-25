'use client';

import { Cell as CellType } from '@/lib/types';

interface CellProps {
  cell: CellType;
  isHero: boolean;
  canDescend: boolean;
  size: number;
}

export default function Cell({ cell, isHero, canDescend, size }: CellProps) {
  let bgColor = '#374151'; // 未訪問・空 (石畳)
  let borderStyle = '1px solid #4B5563';
  let content = '';
  let extraClass = '';

  if (isHero) {
    bgColor = '#FCD34D';
    borderStyle = '2px solid #F59E0B';
    content = '🧙';
  } else if (cell.visited) {
    bgColor = '#1E3A5F';
    borderStyle = '1px solid #2563EB';
  } else {
    switch (cell.type) {
      case 'monster':
        content = cell.monster?.emoji || '👹';
        break;
      case 'chest':
        bgColor = '#FEF3C7';
        borderStyle = '2px solid #D97706';
        content = '📦';
        break;
      case 'trap':
        bgColor = '#7F1D1D';
        extraClass = 'animate-pulse';
        content = '⚡';
        break;
      case 'stairs':
        if (canDescend) {
          bgColor = '#FCD34D';
          borderStyle = '2px solid #F59E0B';
          extraClass = 'animate-pulse';
          content = '🔽';
        } else {
          content = '🔽';
          extraClass = 'opacity-40';
        }
        break;
      default:
        break;
    }
  }

  return (
    <div
      className={`flex items-center justify-center select-none ${extraClass}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        border: borderStyle,
        borderRadius: 4,
        fontSize: size * 0.5,
        lineHeight: 1,
      }}
    >
      {content}
    </div>
  );
}
