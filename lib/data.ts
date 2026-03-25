import { MonsterDef, ItemDef } from './types';

/** モンスター定義（10種） */
export const MONSTERS: MonsterDef[] = [
  { id: 'slime',    name: 'スライム',   hp: 2,  reward: 10,  minFloor: 1,  emoji: '🟢' },
  { id: 'bat',      name: 'コウモリ',   hp: 3,  reward: 15,  minFloor: 1,  emoji: '🦇' },
  { id: 'skeleton', name: 'スケルトン', hp: 4,  reward: 25,  minFloor: 2,  emoji: '💀' },
  { id: 'goblin',   name: 'ゴブリン',   hp: 5,  reward: 30,  minFloor: 3,  emoji: '👺' },
  { id: 'ghost',    name: 'ゴースト',   hp: 6,  reward: 40,  minFloor: 4,  emoji: '👻' },
  { id: 'wolf',     name: 'ウルフ',     hp: 7,  reward: 50,  minFloor: 5,  emoji: '🐺' },
  { id: 'golem',    name: 'ゴーレム',   hp: 9,  reward: 70,  minFloor: 6,  emoji: '🗿' },
  { id: 'demon',    name: 'デーモン',   hp: 11, reward: 90,  minFloor: 8,  emoji: '😈' },
  { id: 'dragon',   name: 'ドラゴン',   hp: 14, reward: 120, minFloor: 10, emoji: '🐉' },
  { id: 'reaper',   name: '死神',       hp: 18, reward: 200, minFloor: 12, emoji: '☠️' },
];

/** 装備定義（8種） */
export const ITEMS: ItemDef[] = [
  { id: 'sword1',  name: '木の剣',     effect: { attack: 1 },              minFloor: 1, emoji: '🗡️' },
  { id: 'sword2',  name: '鉄の剣',     effect: { attack: 2 },              minFloor: 3, emoji: '⚔️' },
  { id: 'sword3',  name: '聖剣',       effect: { attack: 4 },              minFloor: 7, emoji: '🔱' },
  { id: 'shield1', name: '木の盾',     effect: { defense: 1 },             minFloor: 1, emoji: '🛡️' },
  { id: 'shield2', name: '鉄の盾',     effect: { defense: 2 },             minFloor: 4, emoji: '🛡️' },
  { id: 'potion',  name: '薬草',       effect: { hp: 3 },                  minFloor: 1, emoji: '🧪' },
  { id: 'elixir',  name: 'エリクサー', effect: { hp: 5 },                  minFloor: 5, emoji: '✨' },
  { id: 'ring',    name: '力の指輪',   effect: { attack: 3, defense: 1 },  minFloor: 8, emoji: '💍' },
];

/**
 * 指定階層で出現可能なモンスターを返す
 */
export function getAvailableMonsters(floor: number): MonsterDef[] {
  return MONSTERS.filter(m => m.minFloor <= floor);
}

/**
 * 指定階層で出現可能な装備を返す
 */
export function getAvailableItems(floor: number): ItemDef[] {
  return ITEMS.filter(i => i.minFloor <= floor);
}
