/** セルの種類 */
export type CellType = 'empty' | 'hero' | 'monster' | 'chest' | 'trap' | 'stairs';

/** モンスター定義 */
export interface MonsterDef {
  id: string;
  name: string;
  hp: number;
  reward: number;
  minFloor: number;
  emoji: string;
}

/** 装備定義 */
export interface ItemDef {
  id: string;
  name: string;
  effect: {
    attack?: number;
    defense?: number;
    hp?: number;
  };
  minFloor: number;
  emoji: string;
}

/** グリッド上のセル */
export interface Cell {
  type: CellType;
  visited: boolean;
  monster?: {
    id: string;
    hp: number;
    reward: number;
    emoji: string;
    name: string;
  };
  item?: {
    id: string;
    name: string;
    effect: Record<string, number>;
    emoji: string;
  };
}

/** 勇者のステータス */
export interface HeroStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

/** ゲーム全体の状態 */
export interface GameState {
  phase: 'title' | 'playing' | 'battle' | 'floor-clear' | 'game-over' | 'daily-result';
  floor: number;
  grid: Cell[][];
  gridSize: number;
  heroPos: { row: number; col: number };
  heroStats: HeroStats;
  path: { row: number; col: number }[];
  visitedCount: number;
  totalCells: number;
  score: number;
  monstersDefeated: number;
  itemsCollected: string[];
  isDaily: boolean;
  dailySeed: string;
  canDescend: boolean;
  battleResult: {
    monsterName: string;
    monsterEmoji: string;
    damage: number;
    defeated: boolean;
  } | null;
}

/** アクション */
export type GameAction =
  | { type: 'MOVE'; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'UNDO' }
  | { type: 'NEXT_FLOOR' }
  | { type: 'BATTLE_END' }
  | { type: 'START'; mode: 'normal' | 'daily' }
  | { type: 'RESTART' };

/** localStorage用 */
export interface DailyRecord {
  date: string;
  clearedFloors: number;
  score: number;
}

export interface EncyclopediaData {
  monsters: string[];
  items: string[];
}
