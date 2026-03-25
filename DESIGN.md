# 一筆書きダンジョン（One Stroke Dungeon） 詳細設計書

## 概要
NxNグリッドのダンジョンを一筆書きで全マス踏破し、モンスターを倒しながら階層を進む。
一筆書きパズル + ローグライクRPG要素。

---

## 1. 技術スタック

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- DOM ベース描画（CSS Grid）
- localStorage でハイスコア+デイリー状態+図鑑データ永続化
- Web Audio API で効果音
- @vercel/og でOGP動的生成

---

## 2. 画面遷移

```
タイトル画面 → [冒険開始] → ゲームプレイ画面 → [ゲームオーバー] → 結果画面 → [もう1回/タイトルへ]
              → [デイリー] → デイリーダンジョン画面 → 結果画面（シェアボタン付き）
              → [図鑑] → モンスター/装備図鑑画面
```

---

## 3. ファイル構成

```
一筆書きダンジョン/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # タイトル画面
│   ├── globals.css
│   ├── play/page.tsx         # ゲーム本体（?mode=daily|normal）
│   ├── encyclopedia/page.tsx # 図鑑画面
│   └── api/og/route.tsx      # OGP動的生成
├── components/
│   ├── GameBoard.tsx         # NxNグリッド描画
│   ├── Cell.tsx              # 個別マス描画
│   ├── StatusBar.tsx         # HP/攻撃/防御/階層/スコア
│   ├── EquipmentList.tsx     # 獲得装備リスト（横スクロール）
│   ├── BattleAnimation.tsx   # 戦闘エフェクト
│   ├── FloorClearModal.tsx   # フロアクリア演出
│   ├── ResultModal.tsx       # ゲームオーバー画面
│   ├── ShareButton.tsx       # シェアボタン
│   └── EncyclopediaGrid.tsx  # 図鑑グリッド
├── lib/
│   ├── gameReducer.ts        # useReducer用reducer
│   ├── dungeon.ts            # ダンジョン生成
│   ├── pathCheck.ts          # 一筆書き可能性検証（ハミルトン路）
│   ├── combat.ts             # 戦闘計算
│   ├── data.ts               # モンスター/装備定義
│   ├── seededRandom.ts       # シード付きランダム
│   ├── sound.ts              # 効果音
│   └── share.ts              # シェアテキスト生成
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── DESIGN.md
```

---

## 4. 型定義

```typescript
// lib/types.ts

/** セルの種類 */
type CellType = 'empty' | 'hero' | 'monster' | 'chest' | 'trap' | 'stairs';

/** モンスター定義 */
interface MonsterDef {
  id: string;
  name: string;
  hp: number;
  reward: number;
  minFloor: number;   // 出現開始階層
  emoji: string;
}

/** 装備定義 */
interface ItemDef {
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
interface Cell {
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
interface HeroStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

/** ゲーム全体の状態 */
interface GameState {
  phase: 'title' | 'playing' | 'battle' | 'floor-clear' | 'game-over' | 'daily-result';
  floor: number;
  grid: Cell[][];
  gridSize: number;            // 5, 6, or 7
  heroPos: { row: number; col: number };
  heroStats: HeroStats;
  path: { row: number; col: number }[];  // 移動履歴（undo用）
  visitedCount: number;
  totalCells: number;
  score: number;
  monstersDefeated: number;
  itemsCollected: string[];    // 装備IDリスト
  isDaily: boolean;
  dailySeed: string;
  canDescend: boolean;         // 全マス踏破で階段使用可
  battleResult: {              // 戦闘アニメーション用
    monsterName: string;
    monsterEmoji: string;
    damage: number;
    defeated: boolean;
  } | null;
}

/** アクション */
type GameAction =
  | { type: 'MOVE'; dir: 'up' | 'down' | 'left' | 'right' }
  | { type: 'UNDO' }
  | { type: 'NEXT_FLOOR' }
  | { type: 'BATTLE_END' }
  | { type: 'START'; mode: 'normal' | 'daily' }
  | { type: 'RESTART' };
```

---

## 5. コンポーネント詳細設計

### 5.1 app/page.tsx（タイトル画面）

**レイアウト:**
```
┌──────────────────────────┐
│   一筆書きダンジョン       │  ← ドット絵風フォント
│   One Stroke Dungeon     │
│   全マスを一筆で踏破して  │
│   ダンジョンを攻略せよ    │
│                          │
│  ┌────────────────────┐  │
│  │  ⚔️ 冒険開始        │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  📅 デイリーダンジョン│  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  📖 図鑑            │  │
│  └────────────────────┘  │
│                          │
│  最高到達: B12F ⚔️8 🛡️4  │
└──────────────────────────┘
```

### 5.2 app/play/page.tsx

**レイアウト:**
```
┌──────────────────────────┐
│ ❤️×5  ⚔️3  🛡️2  B3F  120pt│  ← StatusBar
├──────────────────────────┤
│ ┌─┬─┬─┬─┬─┐             │
│ │🟡│ │💀│ │ │             │  ← GameBoard (5x5)
│ ├─┼─┼─┼─┼─┤             │
│ │ │🟢│ │📦│ │             │  勇者🟡、スライム🟢、宝箱📦
│ ├─┼─┼─┼─┼─┤             │  訪問済み=薄青、罠=赤点滅
│ │ │ │ │ │🔴│             │  階段🔽（全踏破後に光る）
│ ├─┼─┼─┼─┼─┤             │
│ │🔽│ │ │🔴│ │             │
│ ├─┼─┼─┼─┼─┤             │
│ │ │ │🦇│ │ │             │
│ └─┴─┴─┴─┴─┘             │
├──────────────────────────┤
│ [↩️ 戻す]  🗡️木の剣 🛡️盾 │  ← Footer
└──────────────────────────┘
```

**スワイプ操作実装:**
```typescript
// play/page.tsx
const touchStartRef = useRef<{ x: number; y: number } | null>(null);

function handleTouchStart(e: TouchEvent) {
  touchStartRef.current = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
  };
}

function handleTouchEnd(e: TouchEvent) {
  if (!touchStartRef.current) return;
  const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
  const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
  const threshold = 30;

  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

  let dir: 'up' | 'down' | 'left' | 'right';
  if (Math.abs(dx) > Math.abs(dy)) {
    dir = dx > 0 ? 'right' : 'left';
  } else {
    dir = dy > 0 ? 'down' : 'up';
  }
  dispatch({ type: 'MOVE', dir });
}
```

### 5.3 GameBoard.tsx
```typescript
interface GameBoardProps {
  grid: Cell[][];
  gridSize: number;
  heroPos: { row: number; col: number };
  path: { row: number; col: number }[];
  canDescend: boolean;
}
```

**描画:**
- CSS Grid: `grid-template-columns: repeat(${gridSize}, 1fr)`
- セルサイズ: `calc((100vw - 32px) / ${gridSize})`、最大60px
- 訪問済みセル間を接続する軌跡ライン: SVGオーバーレイで path の各点を結ぶ
- 全マス踏破時: 階段セルに `animate-pulse` + 金色ボーダー

### 5.4 Cell.tsx
```typescript
interface CellProps {
  cell: Cell;
  isHero: boolean;
  canDescend: boolean;
  size: number;        // px
}
```

**CSS状態別:**
| 状態 | 背景色 | ボーダー | 追加表示 |
|---|---|---|---|
| 未訪問・空 | `#374151`(石畳) | `1px solid #4B5563` | なし |
| 訪問済み | `#1E3A5F`(薄青) | `1px solid #2563EB` | 光る軌跡 |
| 勇者 | `#FCD34D`(黄) | `2px solid #F59E0B` | 勇者アイコン |
| モンスター | 元の色 | なし | 絵文字 + HPバッジ |
| 宝箱 | `#FEF3C7`(金淡) | `2px solid #D97706` | 📦 |
| 罠 | `#7F1D1D`(暗赤) | なし | `animate-pulse` |
| 階段(未開放) | `#374151` | なし | 🔽(暗い) |
| 階段(開放) | `#FCD34D` | `2px solid #F59E0B` | 🔽(光る)+pulse |
| 移動不可フィードバック | `#EF4444` | なし | 0.3s shake |

### 5.5 BattleAnimation.tsx
```typescript
interface BattleAnimationProps {
  monsterEmoji: string;
  monsterName: string;
  damage: number;
  defeated: boolean;
  onComplete: () => void;
}
```

**アニメーションシーケンス（計1.2秒）:**
1. 0-0.3s: 勇者がモンスターに向かって突進（translateX）
2. 0.3-0.5s: 衝突エフェクト（💥表示 + 画面シェイク）
3. 0.5-0.8s: ダメージ数値がフロート表示（-{damage} 赤テキスト上昇）
4. 0.8-1.2s: モンスターが消滅（scale(0) + opacity(0)）
5. 1.2s: `onComplete` コールバック

### 5.6 FloorClearModal.tsx
- 「B{N}F クリア！」テキスト + 金色パーティクル
- 獲得スコア、討伐数を表示
- 1.5秒後に自動で次のフロアへ

### 5.7 EncyclopediaGrid.tsx（図鑑）
- モンスター図鑑: 10種を2列5行のグリッドで表示
  - 遭遇済み: 絵文字+名前+HP
  - 未遭遇: 「???」(シルエット)
- 装備図鑑: 8種を2列4行で表示
  - 入手済み: 絵文字+名前+効果
  - 未入手: 「???」

---

## 6. ロジック詳細設計

### 6.1 lib/dungeon.ts（ダンジョン生成）

```typescript
/**
 * ダンジョン生成メインフロー
 */
function generateDungeon(
  floor: number,
  rng: () => number  // seededRandom or Math.random
): { grid: Cell[][]; gridSize: number } {
  const gridSize = Math.min(5 + Math.floor(floor / 4), 7);
  const totalCells = gridSize * gridSize;

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
          effect: itemDef.effect,
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
```

### 6.2 lib/pathCheck.ts（一筆書き可能性検証）

```typescript
/**
 * DFSバックトラッキングでハミルトン路の存在を判定
 * gridSize 5x5(25マス) → 高速（<10ms）
 * gridSize 6x6(36マス) → やや遅い（<100ms）
 * gridSize 7x7(49マス) → 重い可能性あり → 500ms制限
 */
function canSolve(
  grid: Cell[][],
  gridSize: number,
  start: { row: number; col: number }
): boolean {
  const totalCells = gridSize * gridSize;
  const visited: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  const startTime = performance.now();
  const TIMEOUT_MS = 500;

  function dfs(row: number, col: number, count: number): boolean {
    // タイムアウトチェック（7x7のみ）
    if (gridSize >= 7 && performance.now() - startTime > TIMEOUT_MS) {
      return false;
    }

    if (count === totalCells) return true;

    visited[row][col] = true;

    // 4方向を試行
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;
      if (visited[nr][nc]) continue;

      if (dfs(nr, nc, count + 1)) {
        visited[row][col] = false;
        return true;
      }
    }

    visited[row][col] = false;
    return false;
  }

  return dfs(start.row, start.col, 1);
}

/**
 * 「宝箱を先に取ってからモンスターに挑める」パスが存在するか検証
 * 完全な検証は計算量的に困難なため、ヒューリスティックで判定:
 * - 宝箱が勇者から近い位置にあるか
 * - モンスターが宝箱より遠い位置にあるか
 */
function hasViablePath(
  grid: Cell[][],
  gridSize: number,
  heroPos: { row: number; col: number }
): boolean {
  // 宝箱の位置を取得
  const chests: { row: number; col: number }[] = [];
  const monsters: { row: number; col: number }[] = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c].type === 'chest') chests.push({ row: r, col: c });
      if (grid[r][c].type === 'monster') monsters.push({ row: r, col: c });
    }
  }

  // 宝箱がなければ検証不要
  if (chests.length === 0) return true;

  // ヒューリスティック: 少なくとも1つの宝箱が
  // 少なくとも1つのモンスターより勇者に近い
  const heroDist = (pos: { row: number; col: number }) =>
    Math.abs(pos.row - heroPos.row) + Math.abs(pos.col - heroPos.col);

  const minChestDist = Math.min(...chests.map(heroDist));
  const hasCloserChest = monsters.some(m => heroDist(m) > minChestDist);

  return hasCloserChest || monsters.length === 0;
}
```

### 6.3 lib/combat.ts

```typescript
/**
 * 戦闘ダメージ計算
 * ダメージ = max(1, モンスターHP - 勇者攻撃力)
 */
function calculateDamage(monsterHp: number, heroAttack: number): number {
  return Math.max(1, monsterHp - heroAttack);
}

/**
 * 装備効果を適用
 */
function applyItemEffect(
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
```

### 6.4 lib/gameReducer.ts

```typescript
function gameReducer(state: GameState, action: GameAction): GameState {
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

      // 訪問済みチェック（階段は全踏破後のみ通過可）
      if (targetCell.visited) return state; // → UI側でshakeフィードバック

      // 階段チェック
      if (targetCell.type === 'stairs' && !state.canDescend) {
        return state; // まだ全マス踏破していない
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
          // 全マス踏破済み → フロアクリア
          newPhase = 'floor-clear';
          newScore += 50 * state.floor;
          break;
        }
      }

      // 勇者を新位置に配置
      newGrid[newRow][newCol].type = 'hero';

      const newVisitedCount = state.visitedCount + 1;
      const canDescend = newVisitedCount >= state.totalCells - 1;
      // totalCells-1: 階段マスを除く全マスを訪問済みにすれば階段使用可

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
      if (state.path.length <= 1) return state; // 初期位置では戻せない

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

      // 注意: UNDO ではモンスター討伐・宝箱取得・罠ダメージは戻さない
      // （一筆書きパズルの「戻す」は移動の取り消しのみ）

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
```

### 6.5 lib/data.ts

```typescript
/** モンスター定義（10種） */
const MONSTERS: MonsterDef[] = [
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
const ITEMS: ItemDef[] = [
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
function getAvailableMonsters(floor: number): MonsterDef[] {
  return MONSTERS.filter(m => m.minFloor <= floor);
}

/**
 * 指定階層で出現可能な装備を返す
 */
function getAvailableItems(floor: number): ItemDef[] {
  return ITEMS.filter(i => i.minFloor <= floor);
}
```

---

## 7. デイリーダンジョン仕様

- 日付文字列(YYYYMMDD)をシードにした `seededRandom`
- 全5フロア固定（全プレイヤー同一盤面）
- 1日1回制限（localStorage）
- フロアN のシードは `dateStr + N` を結合してハッシュ化

**localStorage:**
```typescript
const DAILY_KEY = 'osd-daily';
const BEST_KEY = 'osd-best-floor';
const ENCYCLOPEDIA_KEY = 'osd-encyclopedia';

interface DailyRecord {
  date: string;
  clearedFloors: number;
  score: number;
}

interface EncyclopediaData {
  monsters: string[];   // 遭遇済みモンスターIDリスト
  items: string[];      // 入手済み装備IDリスト
}
```

---

## 8. シェアテキスト

```typescript
function generateShareText(state: GameState): string {
  const items = state.itemsCollected
    .map(id => ITEMS.find(i => i.id === id)?.emoji || '')
    .join('');

  if (state.isDaily) {
    // Wordle風グリッド: フロアごとの結果
    // ⚔️=戦闘あり、💎=宝箱あり、💀=ゲームオーバー
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
```

---

## 9. 効果音

| イベント | 音の特徴 | 周波数 | 長さ |
|---|---|---|---|
| 移動 | 足音 | 300Hz短パルス | 0.05s |
| モンスター遭遇 | 不穏な音 | 200→150Hz | 0.15s |
| 戦闘ヒット | 衝撃音 | 600Hz+ノイズ | 0.1s |
| モンスター撃破 | 消滅音 | 800→1200Hz | 0.2s |
| 宝箱取得 | ファンファーレ | ド→ミ→ソ | 0.3s |
| 罠発動 | ダメージ音 | 300→100Hz | 0.15s |
| 階段開放 | 輝く音 | 523→1047Hz | 0.3s |
| フロアクリア | 達成音 | ドミソド(高) | 0.5s |
| ゲームオーバー | 低い崩壊音 | 400→50Hz | 0.5s |
| 移動不可 | ブッ | 150Hz矩形波 | 0.1s |

---

## 10. パフォーマンス注意事項

1. **一筆書き検証のタイムアウト**: 7x7盤面は500msで打ち切り。打ち切った場合は再生成。20回失敗したらモンスター・罠を減らしたシンプル盤面を生成。
2. **DFS最適化**: gridSize <= 6 なら問題なし。7x7では枝刈り（Warnsdorffのヒューリスティック: 隣接未訪問マスが少ない方を優先探索）を導入。
3. **スワイプとスクロール干渉防止**: ゲームボード領域で `touch-action: none` を設定。
