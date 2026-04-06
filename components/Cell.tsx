'use client';

import React from 'react';
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
        content = '__chest__';
        break;
      case 'trap':
        bgColor = '#7F1D1D';
        extraClass = 'animate-pulse';
        content = '__lightning__';
        break;
      case 'stairs':
        if (canDescend) {
          bgColor = '#FCD34D';
          borderStyle = '2px solid #F59E0B';
          extraClass = 'animate-pulse';
          content = '__stairs__';
        } else {
          content = '__stairs__';
          extraClass = 'opacity-40';
        }
        break;
      default:
        break;
    }
  }

  const svgSize = size * 0.55;

  let inner: React.ReactNode = content === '__chest__' || content === '__lightning__' || content === '__stairs__' ? null : content;
  if (content === '__chest__') {
    inner = (
      <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* lid */}
        <rect x="2" y="4" width="20" height="7" rx="2" fill="#92400E" stroke="#D97706" strokeWidth="1.5" />
        {/* body */}
        <rect x="2" y="11" width="20" height="9" rx="2" fill="#78350F" stroke="#D97706" strokeWidth="1.5" />
        {/* lock */}
        <rect x="10" y="9" width="4" height="4" rx="1" fill="#FCD34D" />
      </svg>
    );
  } else if (content === '__lightning__') {
    inner = (
      <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" strokeLinejoin="round" />
      </svg>
    );
  } else if (content === '__stairs__') {
    inner = (
      <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,18 4,8 20,8" fill="#374151" stroke="#9CA3AF" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
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
      {inner}
    </div>
  );
}
