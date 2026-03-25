import { Cell } from './types';

/**
 * DFSバックトラッキングでハミルトン路の存在を判定
 * gridSize 5x5(25マス) → 高速（<10ms）
 * gridSize 6x6(36マス) → やや遅い（<100ms）
 * gridSize 7x7(49マス) → 重い可能性あり → 500ms制限
 */
export function canSolve(
  grid: Cell[][],
  gridSize: number,
  start: { row: number; col: number }
): boolean {
  const totalCells = gridSize * gridSize;
  const visited: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const TIMEOUT_MS = 500;

  // Warnsdorffのヒューリスティック用: 隣接未訪問マス数を返す
  function countUnvisitedNeighbors(row: number, col: number): number {
    let count = 0;
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited[nr][nc]) {
        count++;
      }
    }
    return count;
  }

  function dfs(row: number, col: number, count: number): boolean {
    // タイムアウトチェック（7x7のみ）
    if (gridSize >= 7) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - startTime > TIMEOUT_MS) {
        return false;
      }
    }

    if (count === totalCells) return true;

    visited[row][col] = true;

    // 4方向を試行（Warnsdorffのヒューリスティックで隣接未訪問が少ない順）
    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const neighbors: { dr: number; dc: number; score: number }[] = [];

    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;
      if (visited[nr][nc]) continue;
      neighbors.push({ dr, dc, score: countUnvisitedNeighbors(nr, nc) });
    }

    // Warnsdorffのヒューリスティック: 隣接未訪問マスが少ない方を優先
    neighbors.sort((a, b) => a.score - b.score);

    for (const { dr, dc } of neighbors) {
      const nr = row + dr;
      const nc = col + dc;
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
export function hasViablePath(
  grid: Cell[][],
  gridSize: number,
  heroPos: { row: number; col: number }
): boolean {
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
