import React from 'react';
import { ActivePiece, Grid, Position } from '../types/tetris';
import { BOARD_COLS, BOARD_ROWS, TETROMINO_COLORS } from '../utils/tetrisLogic';

interface GameBoardProps {
  grid: Grid;
  activePiece: ActivePiece | null;
  ghostY: number;
  showGhost: boolean;
  hintPlacement: { x: number; y: number; rotation: number; shape: number[][] } | null;
  clearingRows: number[];
  theme: 'slate' | 'emerald' | 'warm';
  paused: boolean;
  gameOver: boolean;
  floatingText: string | null;
  onResume: () => void;
  onRestart: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  grid,
  activePiece,
  ghostY,
  showGhost,
  hintPlacement,
  clearingRows,
  theme,
  paused,
  gameOver,
  floatingText,
  onResume,
  onRestart,
}) => {
  // Theme backgrounds
  const themeBgMap = {
    slate: 'bg-slate-900/90 border-slate-700/80 shadow-2xl shadow-cyan-950/20',
    emerald: 'bg-emerald-950/80 border-emerald-800/80 shadow-2xl shadow-emerald-950/30',
    warm: 'bg-stone-900/90 border-stone-700/80 shadow-2xl shadow-amber-950/20',
  };

  const gridLineMap = {
    slate: 'border-slate-800/40',
    emerald: 'border-emerald-900/30',
    warm: 'border-stone-800/40',
  };

  // Build the visual board matrix with active piece and ghost overlays
  const renderBoard = () => {
    // Deep clone grid cells
    const displayGrid: {
      filled: boolean;
      color?: string;
      border?: string;
      glow?: string;
      isGhost?: boolean;
      isHint?: boolean;
      isClearing?: boolean;
    }[][] = grid.map((row, rIdx) =>
      row.map((cell) => ({
        filled: cell.filled,
        color: cell.color,
        border: cell.type ? TETROMINO_COLORS[cell.type]?.border : undefined,
        glow: cell.type ? TETROMINO_COLORS[cell.type]?.glow : undefined,
        isClearing: clearingRows.includes(rIdx),
      }))
    );

    // Overlay Hint (AI Cognitive Guide)
    if (hintPlacement && activePiece) {
      const { shape, x, y } = hintPlacement;
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const targetY = y + r;
            const targetX = x + c;
            if (
              targetY >= 0 &&
              targetY < BOARD_ROWS &&
              targetX >= 0 &&
              targetX < BOARD_COLS &&
              !displayGrid[targetY][targetX].filled
            ) {
              displayGrid[targetY][targetX] = {
                ...displayGrid[targetY][targetX],
                isHint: true,
              };
            }
          }
        }
      }
    }

    // Overlay Ghost Piece
    if (showGhost && activePiece && ghostY !== activePiece.y) {
      const pieceInfo = TETROMINO_COLORS[activePiece.type];
      for (let r = 0; r < activePiece.shape.length; r++) {
        for (let c = 0; c < activePiece.shape[r].length; c++) {
          if (activePiece.shape[r][c]) {
            const gy = ghostY + r;
            const gx = activePiece.x + c;
            if (
              gy >= 0 &&
              gy < BOARD_ROWS &&
              gx >= 0 &&
              gx < BOARD_COLS &&
              !displayGrid[gy][gx].filled
            ) {
              displayGrid[gy][gx] = {
                ...displayGrid[gy][gx],
                isGhost: true,
                color: pieceInfo.bg,
                border: pieceInfo.border,
              };
            }
          }
        }
      }
    }

    // Overlay Active Piece
    if (activePiece) {
      const pieceInfo = TETROMINO_COLORS[activePiece.type];
      for (let r = 0; r < activePiece.shape.length; r++) {
        for (let c = 0; c < activePiece.shape[r].length; c++) {
          if (activePiece.shape[r][c]) {
            const py = activePiece.y + r;
            const px = activePiece.x + c;
            if (py >= 0 && py < BOARD_ROWS && px >= 0 && px < BOARD_COLS) {
              displayGrid[py][px] = {
                filled: true,
                color: pieceInfo.bg,
                border: pieceInfo.border,
                glow: pieceInfo.glow,
                isGhost: false,
                isHint: false,
              };
            }
          }
        }
      }
    }

    return displayGrid;
  };

  const renderedBoard = renderBoard();

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Floating Combo / Clear text indicator */}
      {floatingText && (
        <div className="absolute top-12 z-30 pointer-events-none animate-bounce">
          <div className="px-4 py-1.5 rounded-lg bg-emerald-500/90 text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/30 whitespace-nowrap">
            {floatingText}
          </div>
        </div>
      )}

      {/* Main Board Frame */}
      <div
        className={`relative p-2 sm:p-3 rounded-2xl border ${themeBgMap[theme]} transition-colors duration-300`}
      >
        {/* Top guide line */}
        <div className="w-full flex justify-between items-center px-1 pb-1.5 text-[11px] font-medium text-slate-400">
          <span>경기장</span>
          <span>10 × 20</span>
        </div>

        {/* The Grid Canvas */}
        <div
          className="grid gap-[1px] bg-slate-950/70 p-1 rounded-xl overflow-hidden border border-slate-800"
          style={{
            gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
            width: 'min(78vw, 320px)',
            height: 'min(156vw, 640px)',
          }}
        >
          {renderedBoard.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              let cellContent = null;
              let bgStyle = 'bg-slate-900/60';
              let borderStyle = gridLineMap[theme];

              if (cell.isClearing) {
                bgStyle = 'bg-white animate-pulse scale-95 shadow-[0_0_12px_#fff]';
              } else if (cell.filled) {
                bgStyle = 'shadow-inner';
              } else if (cell.isGhost) {
                bgStyle = 'bg-white/5';
              } else if (cell.isHint) {
                bgStyle = 'bg-emerald-500/10 border-emerald-400/80 border-dashed animate-pulse';
              }

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`relative w-full h-full rounded-[3px] transition-all duration-75 flex items-center justify-center border ${borderStyle} ${bgStyle}`}
                  style={
                    cell.filled && !cell.isClearing && cell.color
                      ? {
                          backgroundColor: cell.color,
                          borderColor: cell.border || 'transparent',
                          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.4), 0 0 6px ${cell.glow || 'rgba(0,0,0,0.2)'}`,
                        }
                      : cell.isGhost && cell.color
                      ? {
                          border: `1.5px dashed ${cell.color}`,
                          boxShadow: `inset 0 0 4px ${cell.color}40`,
                        }
                      : undefined
                  }
                >
                  {/* Subtle 3D highlight bevel for solid blocks */}
                  {cell.filled && !cell.isClearing && (
                    <div className="absolute top-[2px] left-[2px] right-[2px] h-[30%] bg-gradient-to-b from-white/35 to-transparent rounded-t-[2px] pointer-events-none" />
                  )}

                  {/* Hint indicator spark */}
                  {cell.isHint && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pause Overlay */}
        {paused && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">훈련 일시 정지</h3>
            <p className="text-sm text-slate-300 mb-6 max-w-xs">
              잠시 눈과 호흡을 고르고 뇌를 편안하게 이완시켜 주세요.
            </p>
            <button
              type="button"
              onClick={onResume}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              계속 진행하기
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 text-xl font-bold">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white mb-1">오늘의 인지 훈련 완료</h3>
            <p className="text-xs text-slate-300 mb-5">
              공간 지각과 작업 기억 훈련을 훌륭하게 마치셨습니다.
            </p>
            <button
              type="button"
              onClick={onRestart}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              다시 도전하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
