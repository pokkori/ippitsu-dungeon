import { GameState } from './types';
import { ITEMS } from './data';

export function generateShareText(state: GameState): string {
  const items = state.itemsCollected
    .map(id => ITEMS.find(i => i.id === id)?.emoji || '')
    .join('');

  if (state.isDaily) {
    return `一筆書きダンジョン デイリー\n` +
      `B${state.floor}F到達 ${state.score}pt\n` +
      `討伐${state.monstersDefeated}体 ${items}\n` +
      `#一筆書きダンジョン`;
  }

  return `一筆書きダンジョン B${state.floor}F到達！\n` +
    `討伐${state.monstersDefeated}体 ${items}\n` +
    `Score: ${state.score}\n` +
    `#一筆書きダンジョン`;
}
