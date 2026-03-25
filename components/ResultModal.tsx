'use client';

import { GameState } from '@/lib/types';
import { generateShareText } from '@/lib/share';
import ShareButton from './ShareButton';

interface ResultModalProps {
  state: GameState;
  bestFloor: number;
  onRestart: () => void;
  onTitle: () => void;
}

export default function ResultModal({ state, bestFloor, onRestart, onTitle }: ResultModalProps) {
  const shareText = generateShareText(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">GAME OVER</h2>

        <div className="space-y-2 text-white mb-6">
          <p className="text-lg">B{state.floor}F到達</p>
          <p>スコア: <span className="text-yellow-400 font-bold">{state.score}pt</span></p>
          <p>討伐数: {state.monstersDefeated}体</p>
          <p className="text-sm text-gray-400">最高到達: B{bestFloor}F</p>
        </div>

        <div className="flex justify-center mb-4">
          <ShareButton text={shareText} />
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            もう1回
          </button>
          <button
            onClick={onTitle}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            タイトルへ
          </button>
        </div>
      </div>
    </div>
  );
}
