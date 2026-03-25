import { HeroStats } from './types';

/**
 * 戦闘ダメージ計算
 * ダメージ = max(1, モンスターHP - 勇者攻撃力)
 */
export function calculateDamage(monsterHp: number, heroAttack: number): number {
  return Math.max(1, monsterHp - heroAttack);
}

/**
 * 装備効果を適用
 */
export function applyItemEffect(
  stats: HeroStats,
  effect: Record<string, number>
): HeroStats {
  const newStats = { ...stats };
  if (effect.attack) newStats.attack += effect.attack;
  if (effect.defense) newStats.defense += effect.defense;
  if (effect.hp) {
    newStats.hp = Math.min(newStats.hp + effect.hp, newStats.maxHp + (effect.hp > 3 ? 2 : 0));
    // エリクサーはmaxHpも少し上げる
    if (effect.hp >= 5) newStats.maxHp += 2;
  }
  return newStats;
}
