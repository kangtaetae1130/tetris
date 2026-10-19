/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActivePiece,
  BrainMission,
  CognitiveStats,
  DailyTrainingRecord,
  DifficultyMode,
  GameSettings,
  GameStatus,
  Grid,
  TetrominoType,
} from './types/tetris';
import {
  BOARD_COLS,
  BOARD_ROWS,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  TetrominoBag,
  calculateLineScore,
  calculateVitalityScore,
  checkCollision,
  createEmptyGrid,
  findBestPlacement,
  getDropInterval,
  getGhostY,
  rotateMatrix,
  INITIAL_BRAIN_MISSIONS,
} from './utils/tetrisLogic';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { LeftPanel, RightPanel } from './components/SidePanels';
import { TouchControls } from './components/TouchControls';
import { CognitiveReportModal } from './components/CognitiveReportModal';
import { BrainTipsGuide } from './components/BrainTipsGuide';
import { SettingsModal } from './components/SettingsModal';
import { Play, Sparkles, Brain, Shield, Award } from 'lucide-react';

const HERO_BANNER_SRC = '/src/assets/images/brain_vitality_banner_1792379608666.jpg';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'gentle',
  theme: 'slate',
  fontSize: 'normal',
  soundEnabled: true,
  soundVolume: 0.6,
  showGhost: true,
  showHints: false,
  autoSaveReport: true,
};

const DEFAULT_STATS: CognitiveStats = {
  timePlayedSeconds: 0,
  piecesPlaced: 0,
  rotationsPerformed: 0,
  linesCleared: 0,
  singles: 0,
  doubles: 0,
  triples: 0,
  tetrises: 0,
  maxCombo: 0,
  currentCombo: 0,
  brainVitalityScore: 0,
  undoCountRemaining: 1, // 1 free undo per session for stress-free brain training
  hintsUsed: 0,
  missionsCompleted: 0,
};

interface GameSnapshot {
  grid: Grid;
  score: number;
  lines: number;
  level: number;
  stats: CognitiveStats;
}

export default function App() {
  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('brain_tetris_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Game Status
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [grid, setGrid] = useState<Grid>(createEmptyGrid);
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);

  // Score & Level
  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);

  // Cognitive metrics & Missions
  const [stats, setStats] = useState<CognitiveStats>(DEFAULT_STATS);
  const [missions, setMissions] = useState<BrainMission[]>(() =>
    INITIAL_BRAIN_MISSIONS.map((m) => ({ ...m, current: 0, completed: false }))
  );
  const [history, setHistory] = useState<DailyTrainingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('brain_tetris_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Visual effects & AI guide
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [floatingText, setFloatingText] = useState<string | null>(null);
  const [hintPlacement, setHintPlacement] = useState<{
    x: number;
    y: number;
    rotation: number;
    shape: number[][];
  } | null>(null);

  // Undo safety snapshot
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for loop management
  const bagRef = useRef<TetrominoBag>(new TetrominoBag());
  const dropTimerRef = useRef<number | null>(null);
  const clockTimerRef = useRef<number | null>(null);

  // Sync audio with settings
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
    try {
      localStorage.setItem('brain_tetris_settings', JSON.stringify(settings));
    } catch {
      // Ignore storage error
    }
  }, [settings]);

  // Floating text timer
  const showNotification = (text: string) => {
    setFloatingText(text);
    setTimeout(() => {
      setFloatingText(null);
    }, 1400);
  };

  // Generate new piece
  const spawnPiece = useCallback(
    (typeToSpawn?: TetrominoType): ActivePiece => {
      let pieceType = typeToSpawn;
      let updatedQueue = [...nextQueue];

      // Ensure next queue has at least 5 pieces
      while (updatedQueue.length < 5) {
        updatedQueue.push(bagRef.current.getNext());
      }

      if (!pieceType) {
        pieceType = updatedQueue.shift()!;
      }

      setNextQueue(updatedQueue);

      const shape = TETROMINO_SHAPES[pieceType].map((row) => [...row]);
      const startX = Math.floor((BOARD_COLS - shape[0].length) / 2);
      const startY = 0;

      return {
        type: pieceType,
        shape,
        x: startX,
        y: startY,
        color: TETROMINO_COLORS[pieceType].bg,
        rotation: 0,
      };
    },
    [nextQueue]
  );

  // Start or restart a game
  const startGame = useCallback(
    (customMode?: DifficultyMode) => {
      const modeToUse = customMode || settings.mode;
      bagRef.current = new TetrominoBag();

      const initialQueue: TetrominoType[] = [];
      for (let i = 0; i < 5; i++) {
        initialQueue.push(bagRef.current.getNext());
      }

      const firstPieceType = initialQueue.shift()!;
      const firstShape = TETROMINO_SHAPES[firstPieceType].map((row) => [...row]);
      const initialActive: ActivePiece = {
        type: firstPieceType,
        shape: firstShape,
        x: Math.floor((BOARD_COLS - firstShape[0].length) / 2),
        y: 0,
        color: TETROMINO_COLORS[firstPieceType].bg,
        rotation: 0,
      };

      setGrid(createEmptyGrid());
      setActivePiece(initialActive);
      setNextQueue(initialQueue);
      setHoldPiece(null);
      setCanHold(true);
      setScore(0);
      setLines(0);
      setLevel(1);
      setCombo(0);
      setClearingRows([]);
      setHintPlacement(null);
      setSnapshot(null);

      const resetStats: CognitiveStats = {
        ...DEFAULT_STATS,
        timePlayedSeconds: 0,
      };
      setStats(resetStats);

      setMissions(
        INITIAL_BRAIN_MISSIONS.map((m) => ({ ...m, current: 0, completed: false }))
      );

      setStatus('PLAYING');
      showNotification('두뇌 훈련 시작!');
    },
    [settings.mode]
  );

  // Pause / Resume toggle
  const togglePause = useCallback(() => {
    if (status === 'PLAYING') {
      setStatus('PAUSED');
    } else if (status === 'PAUSED') {
      setStatus('PLAYING');
    }
  }, [status]);

  // Lock the active piece into grid and clear completed lines
  const lockPiece = useCallback(
    (pieceToLock: ActivePiece) => {
      sound.playLock();

      // Save snapshot for potential Undo
      setSnapshot({
        grid: grid.map((row) => row.map((cell) => ({ ...cell }))),
        score,
        lines,
        level,
        stats: { ...stats },
      });

      // Merge piece into grid
      const newGrid: Grid = grid.map((row) => row.map((cell) => ({ ...cell })));
      for (let r = 0; r < pieceToLock.shape.length; r++) {
        for (let c = 0; c < pieceToLock.shape[r].length; c++) {
          if (pieceToLock.shape[r][c]) {
            const gy = pieceToLock.y + r;
            const gx = pieceToLock.x + c;
            if (gy >= 0 && gy < BOARD_ROWS && gx >= 0 && gx < BOARD_COLS) {
              newGrid[gy][gx] = {
                filled: true,
                type: pieceToLock.type,
                color: pieceToLock.color,
              };
            }
          }
        }
      }

      // Check for completed rows
      const rowsToClear: number[] = [];
      for (let r = 0; r < BOARD_ROWS; r++) {
        if (newGrid[r].every((cell) => cell.filled)) {
          rowsToClear.push(r);
        }
      }

      // Update basic placed count
      const newPiecesPlaced = stats.piecesPlaced + 1;

      if (rowsToClear.length > 0) {
        // Trigger clearing flash animation
        setClearingRows(rowsToClear);

        if (rowsToClear.length >= 4) {
          sound.playTetris();
        } else {
          sound.playLineClear(rowsToClear.length);
        }

        setTimeout(() => {
          // Remove cleared rows and insert fresh empty rows at top
          const filteredGrid = newGrid.filter((_, idx) => !rowsToClear.includes(idx));
          const emptyRowsToAdd: Grid = Array.from({ length: rowsToClear.length }, () =>
            Array.from({ length: BOARD_COLS }, () => ({ filled: false }))
          );
          const finalGrid = [...emptyRowsToAdd, ...filteredGrid];
          setGrid(finalGrid);
          setClearingRows([]);

          // Update Score, Lines, Level, Combo
          const newCombo = combo + 1;
          const { score: addedScore, label } = calculateLineScore(
            rowsToClear.length,
            level,
            newCombo
          );

          const newTotalScore = score + addedScore;
          const newTotalLines = lines + rowsToClear.length;
          const newLevel = Math.floor(newTotalLines / 10) + 1;

          setScore(newTotalScore);
          setLines(newTotalLines);
          setLevel(newLevel);
          setCombo(newCombo);

          if (label) {
            showNotification(label);
          }

          // Update stats
          setStats((prev) => {
            const singles = prev.singles + (rowsToClear.length === 1 ? 1 : 0);
            const doubles = prev.doubles + (rowsToClear.length === 2 ? 1 : 0);
            const triples = prev.triples + (rowsToClear.length === 3 ? 1 : 0);
            const tetrises = prev.tetrises + (rowsToClear.length === 4 ? 1 : 0);

            const vScore = calculateVitalityScore(
              newTotalLines,
              prev.rotationsPerformed,
              newPiecesPlaced,
              prev.timePlayedSeconds,
              prev.missionsCompleted
            );

            return {
              ...prev,
              piecesPlaced: newPiecesPlaced,
              linesCleared: newTotalLines,
              singles,
              doubles,
              triples,
              tetrises,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              currentCombo: newCombo,
              brainVitalityScore: vScore,
            };
          });

          // Check mission updates
          setMissions((prevMissions) =>
            prevMissions.map((m) => {
              let updatedCurrent = m.current;
              if (m.id === 'mission_lines') {
                updatedCurrent = newTotalLines;
              } else if (m.id === 'mission_double' && rowsToClear.length >= 2) {
                updatedCurrent += 1;
              }

              const isNowCompleted = updatedCurrent >= m.target;
              if (isNowCompleted && !m.completed) {
                sound.playMissionComplete();
                showNotification(`미션 달성! [${m.title}]`);
                setScore((s) => s + m.rewardScore);
                setStats((s) => ({
                  ...s,
                  missionsCompleted: s.missionsCompleted + 1,
                  brainVitalityScore: s.brainVitalityScore + m.rewardScore,
                }));
              }

              return {
                ...m,
                current: updatedCurrent,
                completed: isNowCompleted,
              };
            })
          );

          // Spawn next piece
          const nextP = spawnPiece();
          if (checkCollision(finalGrid, nextP.shape, nextP.x, nextP.y)) {
            // Game Over
            handleGameOver();
          } else {
            setActivePiece(nextP);
            setCanHold(true);
            setHintPlacement(null);
          }
        }, 160);
      } else {
        // No lines cleared
        setGrid(newGrid);
        setCombo(0);

        setStats((prev) => ({
          ...prev,
          piecesPlaced: newPiecesPlaced,
          brainVitalityScore: calculateVitalityScore(
            lines,
            prev.rotationsPerformed,
            newPiecesPlaced,
            prev.timePlayedSeconds,
            prev.missionsCompleted
          ),
        }));

        // Spawn next piece
        const nextP = spawnPiece();
        if (checkCollision(newGrid, nextP.shape, nextP.x, nextP.y)) {
          handleGameOver();
        } else {
          setActivePiece(nextP);
          setCanHold(true);
          setHintPlacement(null);
        }
      }
    },
    [grid, score, lines, level, combo, stats, spawnPiece]
  );

  // Handle Game Over
  const handleGameOver = useCallback(() => {
    sound.playGameOver();
    setStatus('GAME_OVER');

    // Save record to local training history
    const record: DailyTrainingRecord = {
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      totalDurationSeconds: stats.timePlayedSeconds,
      highScore: score,
      linesCleared: lines,
      vitalityScore: stats.brainVitalityScore,
      mode: settings.mode,
    };

    setHistory((prev) => {
      const updated = [record, ...prev].slice(0, 30);
      try {
        localStorage.setItem('brain_tetris_history', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });

    setIsReportOpen(true);
  }, [score, lines, stats, settings.mode]);

  // Movement: Left
  const moveLeft = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    if (!checkCollision(grid, activePiece.shape, activePiece.x - 1, activePiece.y)) {
      setActivePiece((prev) => (prev ? { ...prev, x: prev.x - 1 } : null));
      sound.playMove();
    }
  }, [activePiece, grid, status]);

  // Movement: Right
  const moveRight = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    if (!checkCollision(grid, activePiece.shape, activePiece.x + 1, activePiece.y)) {
      setActivePiece((prev) => (prev ? { ...prev, x: prev.x + 1 } : null));
      sound.playMove();
    }
  }, [activePiece, grid, status]);

  // Movement: Soft Drop
  const softDrop = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    if (!checkCollision(grid, activePiece.shape, activePiece.x, activePiece.y + 1)) {
      setActivePiece((prev) => (prev ? { ...prev, y: prev.y + 1 } : null));
      setScore((s) => s + 1); // Soft drop bonus
    } else {
      lockPiece(activePiece);
    }
  }, [activePiece, grid, status, lockPiece]);

  // Movement: Hard Drop (Instant drop)
  const hardDrop = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    sound.playHardDrop();
    const targetY = getGhostY(grid, activePiece);
    const dropDistance = targetY - activePiece.y;
    setScore((s) => s + dropDistance * 2);

    const droppedPiece = { ...activePiece, y: targetY };
    lockPiece(droppedPiece);
  }, [activePiece, grid, status, lockPiece]);

  // Movement: Rotate Clockwise
  const rotateCW = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    const rotated = rotateMatrix(activePiece.shape, true);

    // Wall kick offsets check
    const kickOffsets = [0, 1, -1, 2, -2];
    for (const offset of kickOffsets) {
      if (!checkCollision(grid, rotated, activePiece.x + offset, activePiece.y)) {
        setActivePiece((prev) =>
          prev
            ? {
                ...prev,
                shape: rotated,
                x: prev.x + offset,
                rotation: (prev.rotation + 1) % 4,
              }
            : null
        );
        sound.playRotate();

        // Increment rotation stat
        setStats((s) => {
          const nextRot = s.rotationsPerformed + 1;
          return {
            ...s,
            rotationsPerformed: nextRot,
            brainVitalityScore: calculateVitalityScore(
              lines,
              nextRot,
              s.piecesPlaced,
              s.timePlayedSeconds,
              s.missionsCompleted
            ),
          };
        });

        // Update spatial rotation mission
        setMissions((prevMissions) =>
          prevMissions.map((m) => {
            if (m.id === 'mission_rotations') {
              const current = m.current + 1;
              const isCompleted = current >= m.target;
              if (isCompleted && !m.completed) {
                sound.playMissionComplete();
                showNotification(`미션 달성! [${m.title}]`);
                setScore((sc) => sc + m.rewardScore);
              }
              return { ...m, current, completed: isCompleted };
            }
            return m;
          })
        );
        return;
      }
    }
  }, [activePiece, grid, status, lines]);

  // Movement: Rotate Counter-Clockwise
  const rotateCCW = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    const rotated = rotateMatrix(activePiece.shape, false);

    const kickOffsets = [0, 1, -1, 2, -2];
    for (const offset of kickOffsets) {
      if (!checkCollision(grid, rotated, activePiece.x + offset, activePiece.y)) {
        setActivePiece((prev) =>
          prev
            ? {
                ...prev,
                shape: rotated,
                x: prev.x + offset,
                rotation: (prev.rotation + 3) % 4,
              }
            : null
        );
        sound.playRotate();
        setStats((s) => ({ ...s, rotationsPerformed: s.rotationsPerformed + 1 }));
        return;
      }
    }
  }, [activePiece, grid, status]);

  // Action: Hold piece
  const holdCurrentPiece = useCallback(() => {
    if (!activePiece || !canHold || status !== 'PLAYING') return;
    sound.playHold();

    const currentType = activePiece.type;
    setCanHold(false);

    if (holdPiece === null) {
      setHoldPiece(currentType);
      setActivePiece(spawnPiece());
    } else {
      setHoldPiece(currentType);
      setActivePiece(spawnPiece(holdPiece));
    }
    setHintPlacement(null);
  }, [activePiece, canHold, holdPiece, status, spawnPiece]);

  // Senior Support Action: Undo 1 piece lock
  const undoLastMove = useCallback(() => {
    if (!snapshot || stats.undoCountRemaining <= 0 || status !== 'PLAYING') return;
    sound.playUndo();

    setGrid(snapshot.grid);
    setScore(snapshot.score);
    setLines(snapshot.lines);
    setLevel(snapshot.level);
    setStats((prev) => ({
      ...snapshot.stats,
      undoCountRemaining: prev.undoCountRemaining - 1,
    }));
    setSnapshot(null);
    showNotification('실수 되돌리기 완료!');
  }, [snapshot, stats.undoCountRemaining, status]);

  // Cognitive Guide Action: Hint calculation
  const toggleHint = useCallback(() => {
    if (!activePiece || status !== 'PLAYING') return;
    if (hintPlacement) {
      setHintPlacement(null);
    } else {
      const best = findBestPlacement(grid, activePiece);
      if (best) {
        setHintPlacement(best);
        sound.playMove();
        setStats((s) => ({ ...s, hintsUsed: s.hintsUsed + 1 }));
        showNotification('추천 위치가 점선으로 표시됩니다');
      }
    }
  }, [activePiece, grid, status, hintPlacement]);

  // Game Loop: Gravity drop timer
  useEffect(() => {
    if (status !== 'PLAYING') {
      if (dropTimerRef.current) clearInterval(dropTimerRef.current);
      return;
    }

    const interval = getDropInterval(settings.mode, level);
    dropTimerRef.current = window.setInterval(() => {
      softDrop();
    }, interval);

    return () => {
      if (dropTimerRef.current) clearInterval(dropTimerRef.current);
    };
  }, [status, level, settings.mode, softDrop]);

  // Clock Timer: Track training duration & sustained attention
  useEffect(() => {
    if (status !== 'PLAYING') {
      if (clockTimerRef.current) clearInterval(clockTimerRef.current);
      return;
    }

    clockTimerRef.current = window.setInterval(() => {
      setStats((prev) => {
        const nextTime = prev.timePlayedSeconds + 1;
        const nextVScore = calculateVitalityScore(
          lines,
          prev.rotationsPerformed,
          prev.piecesPlaced,
          nextTime,
          prev.missionsCompleted
        );
        return {
          ...prev,
          timePlayedSeconds: nextTime,
          brainVitalityScore: nextVScore,
        };
      });
    }, 1000);

    return () => {
      if (clockTimerRef.current) clearInterval(clockTimerRef.current);
    };
  }, [status, lines]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scroll on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (status !== 'PLAYING') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          togglePause();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          softDrop();
          break;
        case 'ArrowUp':
        case 'x':
        case 'X':
          rotateCW();
          break;
        case 'z':
        case 'Z':
          rotateCCW();
          break;
        case ' ':
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          holdCurrentPiece();
          break;
        case 'h':
        case 'H':
          toggleHint();
          break;
        case 'u':
        case 'U':
        case 'Backspace':
          undoLastMove();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          togglePause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    status,
    moveLeft,
    moveRight,
    softDrop,
    rotateCW,
    rotateCCW,
    hardDrop,
    holdCurrentPiece,
    toggleHint,
    undoLastMove,
    togglePause,
  ]);

  const ghostY = activePiece ? getGhostY(grid, activePiece) : 0;

  // Theme wrapper styling
  const themeContainerStyles = {
    slate: 'bg-slate-950 text-slate-100',
    emerald: 'bg-[#061e14] text-emerald-50',
    warm: 'bg-[#1c1917] text-stone-100',
  }[settings.theme];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${themeContainerStyles} ${
        settings.fontSize === 'large' ? 'text-base' : 'text-sm'
      }`}
    >
      {/* 3-Zone Header Contract */}
      <Header
        status={status}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onOpenReport={() => setIsReportOpen(true)}
        onOpenTips={() => setIsTipsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onStartOrRestart={() => startGame()}
        vitalityScore={stats.brainVitalityScore}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-center items-center">
        {status === 'MENU' ? (
          /* Title & Welcome Screen for Dementia Prevention */
          <div className="w-full max-w-3xl flex flex-col items-center text-center py-6 sm:py-10 animate-fade-in">
            {/* Hero Visual Card */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-8 bg-slate-900 max-h-72">
              <img
                src={HERO_BANNER_SRC}
                alt="치매 예방 두뇌 인지 활력"
                className="w-full h-72 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                  <span>시니어 인지 건강</span>
                  <span aria-hidden="true">·</span>
                  <span>시공간 자극 훈련</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  즐겁게 맞추고 활짝 깨어나는 두뇌
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
                  조급함 없이 편안하게 공간을 회전하고 다음 블록을 예측하며 뇌 신경망의 활력을 유지하세요.
                </p>
              </div>
            </div>

            {/* Quick 3 Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 font-bold">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">공간 지각력 훈련</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  블록 회전과 맞춤을 통해 뇌의 두정엽 영역을 자극하고 신경가소성을 유도합니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">여유로운 힐링 템포</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  쫓기지 않는 편안한 속도로 어르신들도 스트레스 없이 깊은 몰입감을 즐깁니다.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">실수 되돌리기 & 힌트</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  잘못 놓아도 당황하지 않도록 되돌리기 기능과 AI 인지 가이드 힌트를 제공합니다.
                </p>
              </div>
            </div>

            {/* Mode selection buttons before launch */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={() => startGame('gentle')}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-base transition-all shadow-xl shadow-emerald-500/20 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>두뇌 힐링 모드로 시작</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTipsOpen(true)}
                className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
              >
                치매 예방 가이드 읽기
              </button>
            </div>
          </div>
        ) : (
          /* Active Game Arena: 3-Column Balanced Layout */
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
              {/* Left Column: Hold, Vitality Stats, Undo/Hint */}
              <LeftPanel
                holdPiece={holdPiece}
                canHold={canHold}
                onHold={holdCurrentPiece}
                undoRemaining={stats.undoCountRemaining}
                onUndo={undoLastMove}
                onHint={toggleHint}
                hintActive={!!hintPlacement}
                vitalityScore={stats.brainVitalityScore}
                rotations={stats.rotationsPerformed}
                timePlayed={stats.timePlayedSeconds}
                mode={settings.mode}
              />

              {/* Center Column: The Game Arena */}
              <GameBoard
                grid={grid}
                activePiece={activePiece}
                ghostY={ghostY}
                showGhost={settings.showGhost}
                hintPlacement={hintPlacement}
                clearingRows={clearingRows}
                theme={settings.theme}
                paused={status === 'PAUSED'}
                gameOver={status === 'GAME_OVER'}
                floatingText={floatingText}
                onResume={() => setStatus('PLAYING')}
                onRestart={() => startGame()}
              />

              {/* Right Column: Next 3 Queue, Level, Lines, Missions */}
              <RightPanel
                nextQueue={nextQueue}
                level={level}
                lines={lines}
                score={score}
                combo={combo}
                missions={missions}
              />
            </div>

            {/* Senior Large Touch & Mobile Control Cluster */}
            <TouchControls
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onRotateCW={rotateCW}
              onRotateCCW={rotateCCW}
              onSoftDrop={softDrop}
              onHardDrop={hardDrop}
              onHold={holdCurrentPiece}
              onUndo={undoLastMove}
              onTogglePause={togglePause}
              paused={status === 'PAUSED'}
              disabled={status !== 'PLAYING'}
              undoRemaining={stats.undoCountRemaining}
            />
          </div>
        )}
      </main>

      {/* Quiet Footer without mechanical tags or telemetry */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/40 px-6 py-4 mt-auto text-center text-xs text-slate-300">
        <p className="leading-relaxed">
          두뇌 활력 테트리스 · 어르신과 온 가족의 건강한 뇌 건강과 신경가소성 자극을 위해 설계되었습니다
        </p>
      </footer>

      {/* Modals */}
      <CognitiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        stats={stats}
        mode={settings.mode}
        history={history}
      />

      <BrainTipsGuide
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onRestartWithMode={(newMode) => {
          setSettings((prev) => ({ ...prev, mode: newMode }));
          startGame(newMode);
        }}
      />
    </div>
  );
}
