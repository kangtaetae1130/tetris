export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Cell {
  filled: boolean;
  type?: TetrominoType;
  color?: string;
  isGhost?: boolean;
  isHint?: boolean;
  isClearing?: boolean;
  isSpecial?: boolean; // Brain mission highlight
}

export type Grid = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
  rotation: number; // 0, 1, 2, 3
}

export type DifficultyMode = 'gentle' | 'active' | 'challenge';

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface CognitiveStats {
  timePlayedSeconds: number;
  piecesPlaced: number;
  rotationsPerformed: number;
  linesCleared: number;
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
  maxCombo: number;
  currentCombo: number;
  brainVitalityScore: number;
  undoCountRemaining: number;
  hintsUsed: number;
  missionsCompleted: number;
}

export interface BrainMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  rewardScore: number;
  cognitiveArea: '공간 지각' | '작업 기억' | '집중력' | '인지 유연성';
}

export interface GameSettings {
  mode: DifficultyMode;
  theme: 'slate' | 'emerald' | 'warm';
  fontSize: 'normal' | 'large';
  soundEnabled: boolean;
  soundVolume: number;
  showGhost: boolean;
  showHints: boolean;
  autoSaveReport: boolean;
}

export interface DailyTrainingRecord {
  date: string; // YYYY-MM-DD
  timestamp: number;
  totalDurationSeconds: number;
  highScore: number;
  linesCleared: number;
  vitalityScore: number;
  mode: DifficultyMode;
}
