import React from 'react';
import { X, BookOpen, ShieldCheck, Activity, Heart, Sparkles, Brain, CheckCircle2 } from 'lucide-react';
import { DEMENTIA_PREVENTION_INSIGHTS } from '../utils/tetrisLogic';

// Generated assets
const HERO_BANNER_SRC = '/src/assets/images/brain_vitality_banner_1792379608666.jpg';
const BRAIN_ICON_SRC = '/src/assets/images/brain_exercise_icon_1792379609441.jpg';

interface BrainTipsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrainTipsGuide: React.FC<BrainTipsGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">치매 예방과 두뇌 인지 과학 가이드</h2>
              <p className="text-xs text-slate-300">테트리스가 어떻게 뇌의 신경가소성을 활성화하는가</p>
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
          {/* Hero Banner with Fallback */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-56">
            <img
              src={HERO_BANNER_SRC}
              alt="두뇌 인지 활력과 신경가소성"
              className="w-full h-56 object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Graceful fallback to styled gradient container
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                인지 과학 연구 기반
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                하루 15분, 즐겁게 깨우는 두뇌 신경망
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                단순 암기보다 시공간 회전과 예측을 결합한 퍼즐이 뇌의 여러 영역을 복합적으로 자극합니다.
              </p>
            </div>
          </div>

          {/* 3 Core Brain Stimulation Areas */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>테트리스가 자극하는 3대 두뇌 핵심 영역</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-cyan-400 block mb-1">01. 두정엽 (Parietal Lobe)</span>
                <span className="text-sm font-semibold text-white block mb-1">공간 지각 및 멘탈 로테이션</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  낙하하는 블록을 머릿속에서 미리 90도 회전시키고 빈 공간과 일치시키는 과정은 공간 탐색 능력을 강화합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 block mb-1">02. 전두엽 (Frontal Lobe)</span>
                <span className="text-sm font-semibold text-white block mb-1">작업 기억과 집행 기능</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  다음에 나올 3개의 블록을 기억하고, 현재 블록을 보관(Hold)하거나 배치할 전략을 수립하여 집행력을 단련합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-bold text-amber-400 block mb-1">03. 뇌 신경가소성 (Plasticity)</span>
                <span className="text-sm font-semibold text-white block mb-1">새로운 시냅스 연결 형성</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  새로운 배치 패턴을 고민하고 해결할 때 뇌 신경세포 간의 연결 회로가 활발해져 인지 저하를 억제합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 6 Dementia Prevention Lifestyle Tips */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>일상 속 치매 예방을 위한 6대 생활 수칙</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMENTIA_PREVENTION_INSIGHTS.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{tip.title}</span>
                    <span className="text-[10px] text-emerald-400/90 font-medium">{tip.tag}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Senior friendly play tips */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-slate-300">
            <span className="font-bold text-emerald-300 block mb-1">
              시니어 어르신을 위한 건강한 게임 팁:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>조급하게 서두르지 말고 <span className="text-emerald-400 font-medium">‘두뇌 힐링 모드’</span>에서 충분히 생각하며 블록을 놓으세요.</li>
              <li>실수로 잘못 놓았을 때는 언제든 <span className="text-amber-300 font-medium">‘실수 되돌리기’</span> 버튼을 누르세요.</li>
              <li>화면 글씨가 작게 느껴지실 경우 상단 [훈련 설정]에서 <span className="text-cyan-300 font-medium">‘큰 글씨 모드’</span>로 변경하실 수 있습니다.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm cursor-pointer transition-all active:scale-95"
          >
            이해했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
