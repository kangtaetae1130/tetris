import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  ChevronsDown,
  Pause,
  Play,
  Undo2,
  PackagePlus,
} from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onUndo: () => void;
  onTogglePause: () => void;
  paused: boolean;
  disabled: boolean;
  undoRemaining: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotateCW,
  onRotateCCW,
  onSoftDrop,
  onHardDrop,
  onHold,
  onUndo,
  onTogglePause,
  paused,
  disabled,
  undoRemaining,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto mt-4 px-2 select-none">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={onHold}
          disabled={disabled}
          className="flex-1 py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm transition-all"
        >
          <PackagePlus className="w-4 h-4 text-cyan-400" />
          <span>블록 보관</span>
        </button>

        <button
          type="button"
          onClick={onUndo}
          disabled={disabled || undoRemaining <= 0}
          className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
            undoRemaining > 0 && !disabled
              ? 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-600/50 text-amber-200 active:scale-95'
              : 'bg-slate-900 border-slate-800 text-slate-400 opacity-50 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4 text-amber-400" />
          <span>되돌리기 ({undoRemaining})</span>
        </button>

        <button
          type="button"
          onClick={onTogglePause}
          disabled={disabled}
          className="flex-1 py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm transition-all"
        >
          {paused ? (
            <>
              <Play className="w-4 h-4 text-emerald-400" />
              <span>재개</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 text-slate-400" />
              <span>일시정지</span>
            </>
          )}
        </button>
      </div>

      {/* Main direction & rotation control cluster */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {/* Left Move */}
        <button
          type="button"
          onClick={onMoveLeft}
          disabled={disabled || paused}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex flex-col items-center justify-center gap-1 border border-slate-700 cursor-pointer shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="왼쪽으로 이동"
        >
          <ArrowLeft className="w-5 h-5 text-slate-200" />
          <span className="text-[11px] font-semibold">왼쪽</span>
        </button>

        {/* Soft Drop */}
        <button
          type="button"
          onClick={onSoftDrop}
          disabled={disabled || paused}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex flex-col items-center justify-center gap-1 border border-slate-700 cursor-pointer shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="아래로 한 칸 내리기"
        >
          <ArrowDown className="w-5 h-5 text-cyan-400" />
          <span className="text-[11px] font-semibold">내리기</span>
        </button>

        {/* Right Move */}
        <button
          type="button"
          onClick={onMoveRight}
          disabled={disabled || paused}
          className="h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex flex-col items-center justify-center gap-1 border border-slate-700 cursor-pointer shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="오른쪽으로 이동"
        >
          <ArrowRight className="w-5 h-5 text-slate-200" />
          <span className="text-[11px] font-semibold">오른쪽</span>
        </button>

        {/* Rotate Clockwise (Primary) */}
        <button
          type="button"
          onClick={onRotateCW}
          disabled={disabled || paused}
          className="h-14 sm:h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex flex-col items-center justify-center gap-1 border border-emerald-500 cursor-pointer shadow-lg shadow-emerald-700/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="시계방향 회전"
        >
          <RotateCw className="w-5 h-5 text-emerald-100" />
          <span className="text-[11px] font-bold">회전</span>
        </button>

        {/* Hard Drop (Instant drop) */}
        <button
          type="button"
          onClick={onHardDrop}
          disabled={disabled || paused}
          className="h-14 sm:h-16 rounded-2xl bg-cyan-700 hover:bg-cyan-600 active:scale-95 text-white flex flex-col items-center justify-center gap-1 border border-cyan-600 cursor-pointer shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="즉시 바닥으로 착지"
        >
          <ChevronsDown className="w-5 h-5 text-cyan-100" />
          <span className="text-[11px] font-bold">즉시착지</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Helper Guide (Accessible for Desktop users) */}
      <div className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[11px] text-slate-400">
        <span>키보드 조작:</span>
        <span>이동 [←, →]</span>
        <span>회전 [↑ 또는 X]</span>
        <span>소프트드롭 [↓]</span>
        <span>즉시착지 [스페이스]</span>
        <span>보관 [C / Shift]</span>
        <span>힌트 [H]</span>
      </div>
    </div>
  );
};
