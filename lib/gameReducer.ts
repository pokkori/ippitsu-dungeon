import { GameState, GameAction } from './types';
import { generateDungeon } from './dungeon';
import { calculateDamage, applyItemEffect } from './combat';
import { seededRandom, dateToSeed, getTodayDateString } from './seededRandom';

export const initialState: GameState = {
  phase: 'title',
  floor: 1,
  grid: [],
  gridSize: 5,
  heroPos: { row: 0, col: 0 },
  heroStats: { hp: 5, maxHp: 5, attack: 1, defense: 0 },
  path: [],
  visitedCount: 0,
  totalCells: 25,
  score: 0,
  monstersDefeated: 0,
  itemsCollected: [],
  isDaily: false,
  dailySeed: '',
  canDescend: false,
  battleResult: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      const rng = action.mode === 'daily'
        ? seededRandom(dateToSeed(getTodayDateString()))
        : () => Math.random();
      const { grid, gridSize } = generateDungeon(1, rng);
      const totalCells = gridSize * gridSize;

      return {
        ...state,
        phase: 'playing',
        floor: 1,
        grid,
        gridSize,
        heroPos: { row: 0, col: 0 },
        heroStats: { hp: 5, maxHp: 5, attack: 1, defense: 0 },
        path: [{ row: 0, col: 0 }],
        visitedCount: 1,
        totalCells,
        score: 0,
        monstersDefeated: 0,
        itemsCollected: [],
        isDaily: action.mode === 'daily',
        dailySeed: getTodayDateString(),
        canDescend: false,
        battleResult: null,
      };
    }

    case 'MOVE': {
      if (state.phase !== 'playing') return state;

      // 方向から移動先計算
      const dirMap = {
        up: { row: -1, col: 0 },
        down: { row: 1, col: 0 },
        left: { row: 0, col: -1 },
        right: { row: 0, col: 1 },
      };
      const delta = dirMap[action.dir];
      const newRow = state.heroPos.row + delta.row;
      const newCol = state.heroPos.col + delta.col;

      // 範囲外チェック
      if (newRow < 0 || newRow >= state.gridSize ||
          newCol < 0 || newCol >= state.gridSize) {
        return state;
      }

      const targetCell = state.grid[newRow][newCol];

      // 訪問済みチェック
      if (targetCell.visited) return state;

      // 階段チェック
      if (targetCell.type === 'stairs' && !state.canDescend) {
        return state;
      }

      // --- 移動実行 ---
      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[state.heroPos.row][state.heroPos.col] = {
        ...newGrid[state.heroPos.row][state.heroPos.col],
        type: 'empty',
      };
      newGrid[newRow][newCol] = {
        ...newGrid[newRow][newCol],
        visited: true,
      };

      let newStats = { ...state.heroStats };
      let newScore = state.score;
      let newMonstersDefeated = state.monstersDefeated;
      let newItemsCollected = [...state.itemsCollected];
      let newPhase: GameState['phase'] = 'playing';
      let battleResult: GameState['battleResult'] = null;

      // セルタイプ別処理
      switch (targetCell.type) {
        case 'monster': {
          const damage = calculateDamage(targetCell.monster!.hp, newStats.attack);
          newStats.hp -= damage;
          newScore += targetCell.monster!.reward;
          newMonstersDefeated++;
          battleResult = {
            monsterName: targetCell.monster!.name,
            monsterEmoji: targetCell.monster!.emoji,
            damage,
            defeated: true,
          };
          newPhase = 'battle';

          if (newStats.hp <= 0) {
            newPhase = 'game-over';
          }
          break;
        }

        case 'chest': {
          newStats = applyItemEffect(newStats, targetCell.item!.effect);
          newItemsCollected.push(targetCell.item!.id);
          newScore += 20;
          break;
        }

        case 'trap': {
          newStats.hp -= 1;
          if (newStats.hp <= 0) {
            newPhase = 'game-over';
          }
          break;
        }

        case 'stairs': {
          newPhase = 'floor-clear';
          newScore += 50 * state.floor;
          break;
        }
      }

      // 勇者を新位置に配置
      newGrid[newRow][newCol].type = 'hero';

      const newVisitedCount = state.visitedCount + 1;
      const canDescend = newVisitedCount >= state.totalCells - 1;

      return {
        ...state,
        phase: newPhase,
        grid: newGrid,
        heroPos: { row: newRow, col: newCol },
        heroStats: newStats,
        path: [...state.path, { row: newRow, col: newCol }],
        visitedCount: newVisitedCount,
        score: newScore,
        monstersDefeated: newMonstersDefeated,
        itemsCollected: newItemsCollected,
        canDescend,
        battleResult,
      };
    }

    case 'UNDO': {
      if (state.path.length <= 1) return state;

      const newPath = [...state.path];
      const undonePos = newPath.pop()!;
      const prevPos = newPath[newPath.length - 1];

      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell })));

      // 元のセルを未訪問に戻す（ただしモンスター・宝箱は復元しない）
      newGrid[undonePos.row][undonePos.col] = {
        type: 'empty',
        visited: false,
      };

      // 勇者を前の位置に戻す
      newGrid[prevPos.row][prevPos.col] = {
        ...newGrid[prevPos.row][prevPos.col],
        type: 'hero',
      };

      return {
        ...state,
        grid: newGrid,
        heroPos: prevPos,
        path: newPath,
        visitedCount: state.visitedCount - 1,
        canDescend: false,
      };
    }

    case 'BATTLE_END':
      return {
        ...state,
        phase: state.heroStats.hp <= 0 ? 'game-over' : 'playing',
        battleResult: null,
      };

    case 'NEXT_FLOOR': {
      const newFloor = state.floor + 1;
      const rng = state.isDaily
        ? seededRandom(dateToSeed(state.dailySeed + newFloor))
        : () => Math.random();
      const { grid, gridSize } = generateDungeon(newFloor, rng);

      return {
        ...state,
        phase: 'playing',
        floor: newFloor,
        grid,
        gridSize,
        heroPos: { row: 0, col: 0 },
        path: [{ row: 0, col: 0 }],
        visitedCount: 1,
        totalCells: gridSize * gridSize,
        canDescend: false,
        battleResult: null,
      };
    }

    case 'RESTART':
      return { ...state, phase: 'title' };

    default:
      return state;
  }
}
