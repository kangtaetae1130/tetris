import { ActivePiece, DifficultyMode, Grid, Position, TetrominoType } from '../types/tetris';

export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;

// High contrast, clear, easily distinguishable colors with accessible contrast
export const TETROMINO_COLORS: Record<TetrominoType, { bg: string; border: string; glow: string; name: string }> = {
  I: { bg: '#06B6D4', border: '#0891B2', glow: 'rgba(6, 182, 212, 0.4)', name: '일자형' },      // Cyan
  J: { bg: '#3B82F6', border: '#2563EB', glow: 'rgba(59, 130, 246, 0.4)', name: '왼쪽 고리형' }, // Blue
  L: { bg: '#F97316', border: '#EA580C', glow: 'rgba(249, 115, 22, 0.4)', name: '오른쪽 고리형' },// Orange
  O: { bg: '#EAB308', border: '#CA8A04', glow: 'rgba(234, 179, 8, 0.4)', name: '정사각형' },    // Yellow
  S: { bg: '#10B981', border: '#059669', glow: 'rgba(16, 185, 129, 0.4)', name: '지그재그 우' }, // Green
  T: { bg: '#A855F7', border: '#9333EA', glow: 'rgba(168, 85, 247, 0.4)', name: 'T자형' },      // Purple
  Z: { bg: '#EF4444', border: '#DC2626', glow: 'rgba(239, 68, 68, 0.4)', name: '지그재그 좌' },   // Red
};

export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export function createEmptyGrid(rows = BOARD_ROWS, cols = BOARD_COLS): Grid {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      filled: false,
    }))
  );
}

// 7-Bag Randomizer ensures fair, varied pieces
export class TetrominoBag {
  private bag: TetrominoType[] = [];

  public getNext(): TetrominoType {
    if (this.bag.length === 0) {
      this.bag = (['I', 'J', 'L', 'O', 'S', 'T', 'Z'] as TetrominoType[]).sort(
        () => Math.random() - 0.5
      );
    }
    return this.bag.pop()!;
  }
}

export function rotateMatrix(matrix: number[][], clockwise = true): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (clockwise) {
        result[c][n - 1 - r] = matrix[r][c];
      } else {
        result[n - 1 - c][r] = matrix[r][c];
      }
    }
  }
  return result;
}

export function checkCollision(
  grid: Grid,
  pieceShape: number[][],
  posX: number,
  posY: number
): boolean {
  for (let r = 0; r < pieceShape.length; r++) {
    for (let c = 0; c < pieceShape[r].length; c++) {
      if (pieceShape[r][c]) {
        const targetX = posX + c;
        const targetY = posY + r;

        // Wall collisions
        if (targetX < 0 || targetX >= BOARD_COLS || targetY >= BOARD_ROWS) {
          return true;
        }

        // Cell occupied (only if targetY >= 0, above board is okay)
        if (targetY >= 0 && grid[targetY][targetX]?.filled) {
          return true;
        }
      }
    }
  }
  return false;
}

export function getGhostY(grid: Grid, piece: ActivePiece): number {
  let ghostY = piece.y;
  while (!checkCollision(grid, piece.shape, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Cognitive AI placement evaluator to suggest the best position
export function findBestPlacement(
  grid: Grid,
  piece: ActivePiece
): { x: number; y: number; rotation: number; shape: number[][] } | null {
  let bestScore = -Infinity;
  let bestCandidate: { x: number; y: number; rotation: number; shape: number[][] } | null = null;

  let currentShape = piece.shape;
  for (let rot = 0; rot < 4; rot++) {
    if (rot > 0) {
      currentShape = rotateMatrix(currentShape, true);
    }

    // Try all possible X positions
    for (let x = -2; x < BOARD_COLS; x++) {
      // Check if valid start
      if (checkCollision(grid, currentShape, x, 0)) {
        continue;
      }

      // Drop down
      let y = 0;
      while (!checkCollision(grid, currentShape, x, y + 1)) {
        y++;
      }

      // Final check
      if (checkCollision(grid, currentShape, x, y)) {
        continue;
      }

      // Evaluate simulated board
      const score = evaluateSimulatedBoard(grid, currentShape, x, y);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = {
          x,
          y,
          rotation: (piece.rotation + rot) % 4,
          shape: currentShape,
        };
      }
    }
  }

  return bestCandidate;
}

function evaluateSimulatedBoard(
  grid: Grid,
  shape: number[][],
  posX: number,
  posY: number
): number {
  // Create a lightweight simulated grid
  const simGrid = grid.map((row) => row.map((cell) => cell.filled));

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const ny = posY + r;
        const nx = posX + c;
        if (ny >= 0 && ny < BOARD_ROWS && nx >= 0 && nx < BOARD_COLS) {
          simGrid[ny][nx] = true;
        }
      }
    }
  }

  // Count cleared lines
  let linesCleared = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    if (simGrid[r].every((v) => v)) {
      linesCleared++;
    }
  }

  // Count holes (empty cells with at least one filled cell above)
  let holes = 0;
  for (let c = 0; c < BOARD_COLS; c++) {
    let blockSeen = false;
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (simGrid[r][c]) {
        blockSeen = true;
      } else if (blockSeen) {
        holes++;
      }
    }
  }

  // Calculate heights & bumpiness
  const columnHeights: number[] = [];
  for (let c = 0; c < BOARD_COLS; c++) {
    let h = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (simGrid[r][c]) {
        h = BOARD_ROWS - r;
        break;
      }
    }
    columnHeights.push(h);
  }

  const aggregateHeight = columnHeights.reduce((a, b) => a + b, 0);
  let bumpiness = 0;
  for (let c = 0; c < BOARD_COLS - 1; c++) {
    bumpiness += Math.abs(columnHeights[c] - columnHeights[c + 1]);
  }

  // Heuristic weighting
  // Reward clearing lines heavily, penalize holes and high stack
  return (
    linesCleared * 120 -
    holes * 35 -
    aggregateHeight * 3.5 -
    bumpiness * 2.0 +
    posY * 2 // prefer lower placements
  );
}

// Calculate drop delay (in milliseconds) based on difficulty mode & level
export function getDropInterval(mode: DifficultyMode, level: number): number {
  switch (mode) {
    case 'gentle':
      // Very relaxed, generous thinking time for cognitive wellness
      return Math.max(700, 1400 - (level - 1) * 60);
    case 'challenge':
      // Moderate with focused brain targets
      return Math.max(350, 950 - (level - 1) * 55);
    case 'active':
    default:
      // Standard cognitive stimulation tempo
      return Math.max(250, 850 - (level - 1) * 65);
  }
}

// Cognitive score calculation
export function calculateLineScore(
  linesCleared: number,
  level: number,
  combo: number
): { score: number; label: string } {
  let baseScore = 0;
  let label = '';

  switch (linesCleared) {
    case 1:
      baseScore = 100;
      label = '1줄 완성 (+100)';
      break;
    case 2:
      baseScore = 300;
      label = '더블 완성 (+300)';
      break;
    case 3:
      baseScore = 600;
      label = '트리플 완성 (+600)';
      break;
    case 4:
      baseScore = 1200;
      label = '테트리스 대박! (+1200)';
      break;
    default:
      baseScore = 0;
      label = '';
  }

  const comboBonus = combo > 1 ? combo * 50 : 0;
  const total = (baseScore * level) + comboBonus;
  return { score: total, label };
}

// Brain Vitality Score (인지 활력 지수)
// Rewards spatial rotation, deliberate placement, multi-line clears, and cognitive missions
export function calculateVitalityScore(
  lines: number,
  rotations: number,
  pieces: number,
  durationSec: number,
  missionsCount: number
): number {
  const lineFactor = lines * 45;
  const rotationFactor = Math.min(rotations * 12, pieces * 18); // Rewards brain rotation effort
  const persistenceFactor = Math.floor(durationSec / 10) * 15; // Sustained focus
  const missionFactor = missionsCount * 250;
  return Math.max(0, lineFactor + rotationFactor + persistenceFactor + missionFactor);
}

// Dementia Prevention Tips & Scientific Insights
export const DEMENTIA_PREVENTION_INSIGHTS = [
  {
    category: '시공간 인지 훈련',
    title: '테트리스와 뇌 피질 두께 유지',
    content: '뇌과학 연구에 따르면 테트리스의 회전 및 공간 맞추기 훈련은 두정엽과 전두엽 피질을 자극하여 뇌 신경가소성(Neuroplasticity)을 활성화합니다.',
    tag: '두정엽 활성화'
  },
  {
    category: '작업 기억력 자극',
    title: '다음 블록 예측과 계획 능력',
    content: '다음 블록 3개를 미리 보고 머릿속으로 위치를 시뮬레이션하는 과정은 뇌의 전두엽 집행 기능(Executive Function)과 작업 기억력을 꾸준히 단련시킵니다.',
    tag: '전두엽 훈련'
  },
  {
    category: '스트레스 없는 편안한 몰입',
    title: '안정적인 플로우 상태와 뇌 휴식',
    content: '조급하지 않은 편안한 속도로 블록을 맞출 때 뇌는 잡념을 잊고 깊은 집중(Flow) 상태에 들어가 뇌 속 노폐물 배출과 인지 활력에 도움을 줍니다.',
    tag: '인지 힐링'
  },
  {
    category: '생활 속 인지 건강',
    title: '하루 20분 가벼운 유산소 산책',
    content: '주 3~4회 빠른 걸음 산책은 뇌 혈류량을 15% 이상 증가시켜 기억을 담당하는 해마(Hippocampus)의 신경 생성을 돕습니다.',
    tag: '신체 두뇌 연계'
  },
  {
    category: '영양과 뇌 건강',
    title: '오메가3와 항산화 채소 섭취',
    content: '등푸른생선, 호두, 들기름의 오메가3 지방산과 진한 녹황색 채소는 뇌세포막을 건강하게 보호하고 인지 저하를 늦춥니다.',
    tag: '두뇌 식습관'
  },
  {
    category: '사회적 뇌 활동',
    title: '대화와 호기심 유지하기',
    content: '새로운 취미를 배우고 가족, 친구와 즐겁게 대화하는 것은 뇌의 다양한 신경망을 동시에 연결하여 치매 예방의 가장 든든한 방패가 됩니다.',
    tag: '정서적 자극'
  }
];

export const INITIAL_BRAIN_MISSIONS: {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardScore: number;
  cognitiveArea: '공간 지각' | '작업 기억' | '집중력' | '인지 유연성';
}[] = [
  {
    id: 'mission_rotations',
    title: '공간 회전 15회 달성',
    description: '블록을 다양한 각도로 회전시켜 두뇌의 공간 지각력을 자극하세요.',
    target: 15,
    rewardScore: 300,
    cognitiveArea: '공간 지각',
  },
  {
    id: 'mission_lines',
    title: '가로줄 5줄 정리하기',
    description: '빈틈없이 블록을 채워 5줄을 완성하고 집중력을 발휘하세요.',
    target: 5,
    rewardScore: 500,
    cognitiveArea: '집중력',
  },
  {
    id: 'mission_double',
    title: '2줄 이상 동시 완성 1회',
    description: '작업 기억력을 활용하여 한 번에 2줄 이상을 동시에 지워보세요.',
    target: 1,
    rewardScore: 600,
    cognitiveArea: '작업 기억',
  },
];
