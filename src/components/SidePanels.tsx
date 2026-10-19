import React from 'react';
import { Brain, Sparkles, Undo2, Lightbulb, Target, Flame } from 'lucide-react';
import { BrainMission, DifficultyMode, TetrominoType } from '../types/tetris';
import { TETROMINO_COLORS, TETROMINO_SHAPES } from '../utils/tetrisLogic';

// Mini preview grid for a single tetromino
export const PieceMiniPreview: React.FC<{ type: TetrominoType | null; size?: number }> = ({
  type,
  size = 18,
}) => {
  if (!type) {
    return (
      <div className="w-20 h-20 flex items-center justify-center text-xs text-slate-500">
        비어있음
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type];
  const info = TETROMINO_COLORS[type];
  const rows = shape.length;
  const cols = shape[0].length;

  return (
    <div
      className="grid gap-[2px] items-center justify-center p-2"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      }}
    >
      {shape.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className="rounded-[2px] transition-all"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: cell ? info.bg : 'transparent',
              borderColor: cell ? info.border : 'transparent',
              borderWidth: cell ? '1px' : '0px',
              boxShadow: cell ? `inset 0 1px 1px rgba(255,255,255,0.4), 0 0 4px ${info.glow}` : undefined,
            }}
          />
        ))
      )}
    </div>
  );
};

interface LeftPanelProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
  onHold: () => void;
  undoRemaining: number;
  onUndo: () => void;
  onHint: () => void;
  hintActive: boolean;
  vitalityScore: number;
  rotations: number;
  timePlayed: number;
  mode: DifficultyMode;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  holdPiece,
  canHold,
  onHold,
  undoRemaining,
  onUndo,
  onHint,
  hintActive,
  vitalityScore,
  rotations,
  timePlayed,
  mode,
}) => {
  const modeLabels: Record<DifficultyMode, { name: string; desc: string }> = {
    gentle: { name: '두뇌 힐링', desc: '여유로운 템포' },
    active: { name: '인지 활력', desc: '표준 두뇌 자극' },
    challenge: { name: '두뇌 챌린지', desc: '미션 집중 모드' },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs < 10 ? '0' : ''}${secs}초`;
  };

  return (
    <div className="w-full lg:w-64 flex flex-col gap-4">
      {/* Hold Piece Box */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col items-center">
        <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
          <span>블록 보관함 (Hold)</span>
          <span className="text-slate-400 font-mono text-[11px]">[C / Shift]</span>
        </div>
        <div className="my-2 min-h-[84px] flex items-center justify-center">
          <PieceMiniPreview type={holdPiece} />
        </div>
        <button
          type="button"
          onClick={onHold}
          disabled={!canHold}
          className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            canHold
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 active:scale-95'
              : 'bg-slate-900 text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          <span>보관 교체하기</span>
        </button>
      </div>

      {/* Brain Vitality Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-emerald-900/40 shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 pb-2 border-b border-slate-800">
          <Brain className="w-4 h-4 text-emerald-400" />
          <span>두뇌 활력 지표</span>
        </div>

        <div className="mt-3 space-y-2.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-slate-300">인지 활력 점수</span>
            <span className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
              {vitalityScore.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>두뇌 회전 횟수</span>
            <span className="font-mono text-cyan-300 font-semibold tabular-nums">{rotations} 회</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300">
            <span>인지 훈련 시간</span>
            <span className="font-mono text-slate-200 tabular-nums">{formatTime(timePlayed)}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-300 pt-1">
            <span>선택 훈련 모드</span>
            <span className="text-emerald-400 font-semibold">{modeLabels[mode].name}</span>
          </div>
        </div>
      </div>

      {/* Senior Assist Features: Undo & Hint */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={undoRemaining <= 0}
          className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            undoRemaining > 0
              ? 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-600/50 text-amber-200 active:scale-95'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 cursor-not-allowed opacity-50'
          }`}
          title="직전 실수를 1회 되돌립니다"
        >
          <Undo2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold">실수 되돌리기</span>
          <span className="text-[10px] text-amber-400/80 font-mono">남은 횟수: {undoRemaining}회</span>
        </button>

        <button
          type="button"
          onClick={onHint}
          className={`py-3 px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
            hintActive
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm shadow-emerald-500/20'
              : 'bg-cyan-950/30 hover:bg-cyan-900/40 border-cyan-700/50 text-cyan-200 active:scale-95'
          }`}
          title="어디에 놓으면 좋을지 최적 추천 위치를 알려줍니다"
        >
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold">인지 가이드 힌트</span>
          <span className="text-[10px] text-cyan-400/80">{hintActive ? '힌트 표시 중' : '추천 위치 확인'}</span>
        </button>
      </div>
    </div>
  );
};

interface RightPanelProps {
  nextQueue: TetrominoType[];
  level: number;
  lines: number;
  score: number;
  combo: number;
  missions: BrainMission[];
}

export const RightPanel: React.FC<RightPanelProps> = ({
  nextQueue,
  level,
  lines,
  score,
  combo,
  missions,
}) => {
  return (
    <div className="w-full lg:w-64 flex flex-col gap-4">
      {/* Next Pieces Queue (Next 3) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
          <span>다음 블록 예측 (Next 3)</span>
          <span className="text-[11px] text-cyan-400 font-medium">작업기억 자극</span>
        </div>
        <div className="flex flex-row lg:flex-col items-center justify-around gap-2 pt-2">
          {nextQueue.slice(0, 3).map((type, idx) => (
            <div
              key={`${type}-${idx}`}
              className="flex items-center justify-center p-1 rounded-xl bg-slate-950/40 w-full"
            >
              <PieceMiniPreview type={type} size={15} />
            </div>
          ))}
        </div>
      </div>

      {/* Score & Lines Meter */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[11px] text-slate-400 mb-0.5">점수</span>
            <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="block text-[11px] text-slate-400 mb-0.5">완성한 줄</span>
            <span className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
              {lines} 줄
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between px-1 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span>난이도 단계:</span>
            <span className="text-white font-bold font-mono">Lv.{level}</span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1 text-amber-400 font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>{combo} 연속 콤보!</span>
            </div>
          )}
        </div>
      </div>

      {/* Brain Missions (Daily/Active Challenges) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Target className="w-3.5 h-3.5" />
            <span>오늘의 두뇌 미션</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {missions.filter((m) => m.completed).length} / {missions.length} 완료
          </span>
        </div>

        <div className="mt-3 space-y-2.5">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`p-2.5 rounded-xl border text-xs transition-colors ${
                mission.completed
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-[13px]">{mission.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    mission.completed
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {mission.cognitiveArea}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2 leading-tight">
                {mission.description}
              </p>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    mission.completed ? 'bg-emerald-400' : 'bg-cyan-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (mission.current / mission.target) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
