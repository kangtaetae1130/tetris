import React from 'react';
import { X, Settings, Volume2, Eye, Sliders, Type, Palette } from 'lucide-react';
import { GameSettings, DifficultyMode } from '../types/tetris';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onRestartWithMode: (mode: DifficultyMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRestartWithMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">두뇌 훈련 및 게임 설정</h2>
              <p className="text-xs text-slate-300">개인 인지 템포와 시각 편의에 맞춘 최적화</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Difficulty & Speed Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>인지 훈련 모드 (낙하 속도 & 템포)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ mode: 'gentle' });
                  onRestartWithMode('gentle');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.mode === 'gentle'
                    ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1 text-emerald-300">두뇌 힐링</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  여유롭고 천천히 생각하는 시니어 맞춤 모드
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ mode: 'active' });
                  onRestartWithMode('active');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.mode === 'active'
                    ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1 text-cyan-300">인지 활력</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  표준 템포로 반응성과 집중력을 골고루 자극
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({ mode: 'challenge' });
                  onRestartWithMode('challenge');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.mode === 'challenge'
                    ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1 text-amber-300">두뇌 챌린지</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  미션 완수를 통한 고도 집중력 훈련
                </div>
              </button>
            </div>
          </div>

          {/* Theme selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>눈이 편안한 색상 테마</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'slate' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  settings.theme === 'slate'
                    ? 'bg-slate-800 border-cyan-400 text-white ring-1 ring-cyan-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs">다크 슬레이트</div>
                <div className="text-[10px] text-slate-400 mt-0.5">현대적 차콜</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'emerald' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  settings.theme === 'emerald'
                    ? 'bg-emerald-950/60 border-emerald-400 text-white ring-1 ring-emerald-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs">포레스트 힐링</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">안정적인 녹음</div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'warm' })}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  settings.theme === 'warm'
                    ? 'bg-stone-900 border-amber-400 text-white ring-1 ring-amber-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs">따뜻한 아이케어</div>
                <div className="text-[10px] text-amber-400 mt-0.5">고대비 웜톤</div>
              </button>
            </div>
          </div>

          {/* Font Size Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Type className="w-4 h-4 text-purple-400" />
              <span>글자 크기 (시니어 가독성)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: 'normal' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                  settings.fontSize === 'normal'
                    ? 'bg-slate-800 border-emerald-400 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                보통 크기
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: 'large' })}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-sm font-bold ${
                  settings.fontSize === 'large'
                    ? 'bg-slate-800 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                크게 보기 (시니어 추천)
              </button>
            </div>
          </div>

          {/* Assistance options */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>시각 보조 및 사운드</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-white block">착지 그림자 표시 (Ghost Piece)</span>
                  <span className="text-[11px] text-slate-400">블록이 떨어질 위치를 미리 윤곽선으로 보여줍니다.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showGhost}
                  onChange={(e) => onUpdateSettings({ showGhost: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-white block">효과음 (온화한 실로폰/차임음)</span>
                  <span className="text-[11px] text-slate-400">블록 회전 및 완성 시 청명한 음향을 재생합니다.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm cursor-pointer transition-all active:scale-95"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
