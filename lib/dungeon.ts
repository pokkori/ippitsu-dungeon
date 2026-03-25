import { Cell, CellType } from './types';
import { getAvailableMonsters, getAvailableItems } from './data';
import { canSolve, hasViablePath } from './pathCheck';

/**
 * 勇者から最も遠いセルを返す
 */
function getFarthestCell(
  gridSize: number,
  heroPos: { row: number; col: number }
): { row: number; col: number } {
  let maxDist = 0;
  let farthest = { row: gridSize - 1, col: gridSize - 1 };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const dist = Math.abs(r - heroPos.row) + Math.abs(c - heroPos.col);
      if (dist > maxDist) {
        maxDist = dist;
        farthest = { row: r, col: c };
      }
    }
  }

  return farthest;
}

/**
 * グリッド上の空マス座標リストを返す
 */
function getEmptyPositions(
  grid: Cell[][],
  gridSize: number
): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].type === 'empty' && !grid[r][c].visited) {
        positions.push({ row: r, col: c });
      }
    }
  }
  return positions;
}

/**
 * Fisher-Yatesシャッフル
 */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * ダンジョン生成メインフロー
 */
export function generateDungeon(
  floor: number,
  rng: () => number
): { grid: Cell[][]; gridSize: number } {
  const gridSize = Math.min(5 + Math.floor(floor / 4), 7);

  let attempts = 0;
  const MAX_ATTEMPTS = 20;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    // 1. 空グリッド初期化
    const grid: Cell[][] = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        type: 'empty' as CellType,
        visited: false,
      }))
    );

    // 2. 勇者を(0,0)に配置
    grid[0][0] = { type: 'hero', visited: true };

    // 3. エンティティ数計算
    const monsterCount = Math.min(2 + Math.floor(floor / 2), gridSize);
    const chestCount = 1 + (floor % 3 === 0 ? 1 : 0);
    const trapCount = Math.floor(floor / 3);

    // 4. 階段を勇者から最遠マスに配置
    const stairsPos = getFarthestCell(gridSize, { row: 0, col: 0 });
    grid[stairsPos.row][stairsPos.col] = { type: 'stairs', visited: false };

    // 5. エンティティ配置（空マスにランダム）
    const emptyPositions = getEmptyPositions(grid, gridSize);
    shuffle(emptyPositions, rng);

    let placedIdx = 0;

    // モンスター配置
    const availableMonsters = getAvailableMonsters(floor);
    for (let i = 0; i < monsterCount && placedIdx < emptyPositions.length; i++) {
      const pos = emptyPositions[placedIdx++];
      const monsterDef = availableMonsters[Math.floor(rng() * availableMonsters.length)];
      grid[pos.row][pos.col] = {
        type: 'monster',
        visited: false,
        monster: {
          id: monsterDef.id,
          hp: monsterDef.hp,
          reward: monsterDef.reward,
          emoji: monsterDef.emoji,
          name: monsterDef.name,
        },
      };
    }

    // 宝箱配置
    const availableItems = getAvailableItems(floor);
    for (let i = 0; i < chestCount && placedIdx < emptyPositions.length; i++) {
      const pos = emptyPositions[placedIdx++];
      const itemDef = availableItems[Math.floor(rng() * availableItems.length)];
      grid[pos.row][pos.col] = {
        type: 'chest',
        visited: false,
        item: {
          id: itemDef.id,
          name: itemDef.name,
          effect: itemDef.effect as Record<string, number>,
          emoji: itemDef.emoji,
        },
      };
    }

    // 罠配置
    for (let i = 0; i < trapCount && placedIdx < emptyPositions.length; i++) {
      const pos = emptyPositions[placedIdx++];
      grid[pos.row][pos.col] = { type: 'trap', visited: false };
    }

    // 6. 一筆書き可能性検証
    if (canSolve(grid, gridSize, { row: 0, col: 0 })) {
      // 7. 「装備→モンスター」順の到達可能パス検証
      if (hasViablePath(grid, gridSize, { row: 0, col: 0 })) {
        return { grid, gridSize };
      }
    }
  }

  // MAX_ATTEMPTS到達: よりシンプルな盤面を生成（モンスター・罠を減らす）
  return generateSimpleDungeon(floor, rng);
}

/**
 * シンプルなダンジョン生成（フォールバック用）
 * モンスター・罠を減らして一筆書き可能な盤面を確実に生成
 */
function generateSimpleDungeon(
  floor: number,
  rng: () => number
): { grid: Cell[][]; gridSize: number } {
  const gridSize = Math.min(5 + Math.floor(floor / 4), 7);

  const grid: Cell[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
      type: 'empty' as CellType,
      visited: false,
    }))
  );

  // 勇者を(0,0)に配置
  grid[0][0] = { type: 'hero', visited: true };

  // 階段を最遠に配置
  const stairsPos = getFarthestCell(gridSize, { row: 0, col: 0 });
  grid[stairsPos.row][stairsPos.col] = { type: 'stairs', visited: false };

  // モンスター1体、宝箱1個のみ
  const emptyPositions = getEmptyPositions(grid, gridSize);
  shuffle(emptyPositions, rng);

  if (emptyPositions.length > 0) {
    const pos = emptyPositions[0];
    const availableMonsters = getAvailableMonsters(floor);
    const monsterDef = availableMonsters[Math.floor(rng() * availableMonsters.length)];
    grid[pos.row][pos.col] = {
      type: 'monster',
      visited: false,
      monster: {
        id: monsterDef.id,
        hp: monsterDef.hp,
        reward: monsterDef.reward,
        emoji: monsterDef.emoji,
        name: monsterDef.name,
      },
    };
  }

  if (emptyPositions.length > 1) {
    const pos = emptyPositions[1];
    const availableItems = getAvailableItems(floor);
    const itemDef = availableItems[Math.floor(rng() * availableItems.length)];
    grid[pos.row][pos.col] = {
      type: 'chest',
      visited: false,
      item: {
        id: itemDef.id,
        name: itemDef.name,
        effect: itemDef.effect as Record<string, number>,
        emoji: itemDef.emoji,
      },
    };
  }

  return { grid, gridSize };
}
