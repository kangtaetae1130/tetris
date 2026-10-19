import React from 'react';
import { Volume2, VolumeX, BarChart3, Settings2, BookOpen, RotateCcw } from 'lucide-react';
import { GameStatus } from '../types/tetris';

interface HeaderProps {
  status: GameStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenReport: () => void;
  onOpenTips: () => void;
  onOpenSettings: () => void;
  onStartOrRestart: () => void;
  vitalityScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  soundEnabled,
  onToggleSound,
  onOpenReport,
  onOpenTips,
  onOpenSettings,
  onStartOrRestart,
  vitalityScore,
}) => {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element, no badges) */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans whitespace-nowrap">
            두뇌활력 테트리스
          </span>
          <span className="hidden md:inline-block text-xs text-emerald-400 font-medium tracking-wide">
            치매 예방 인지 훈련
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation links with hover underlines */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={onOpenTips}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>두뇌 건강 가이드</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>인지 훈련 리포트</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span>훈련 설정</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="hover:text-emerald-300 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            title={soundEnabled ? '소리 끄기' : '소리 켜기'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>소리 켬</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>소리 끔</span>
              </>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartOrRestart}
            className="px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all rounded-lg whitespace-nowrap shadow-sm shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
          >
            {status === 'PLAYING' ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>새 게임 시작</span>
              </>
            ) : (
              <span>게임 시작</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
