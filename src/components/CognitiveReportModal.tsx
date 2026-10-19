import React from 'react';
import { X, Award, Brain, Clock, Zap, Target, CheckCircle2, Calendar } from 'lucide-react';
import { CognitiveStats, DailyTrainingRecord, DifficultyMode } from '../types/tetris';

interface CognitiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CognitiveStats;
  mode: DifficultyMode;
  history: DailyTrainingRecord[];
}

export const CognitiveReportModal: React.FC<CognitiveReportModalProps> = ({
  isOpen,
  onClose,
  stats,
  mode,
  history,
}) => {
  if (!isOpen) return null;

  const modeKorean = {
    gentle: '두뇌 힐링 모드',
    active: '인지 활력 모드',
    challenge: '두뇌 챌린지 모드',
  }[mode];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}분 ${s}초`;
  };

  // Evaluation remarks based on vitality score
  const getCognitiveEvaluation = () => {
    if (stats.brainVitalityScore >= 3000) {
      return {
        level: '최상급 두뇌 활성',
        comment: '공간 지각력과 전두엽 집중력이 매우 뛰어납니다. 뇌 신경망이 매우 유연하게 활성화되고 있습니다!',
      };
    } else if (stats.brainVitalityScore >= 1500) {
      return {
        level: '우수 인지 유지',
        comment: '안정적인 블록 회전과 라인 완성으로 뇌의 작업 기억력을 훌륭히 자극하고 있습니다.',
      };
    } else {
      return {
        level: '두뇌 워밍업 완료',
        comment: '꾸준히 하루 10분씩 블록을 맞추면 인지 노화를 예방하고 뇌 세포 회복에 큰 도움이 됩니다.',
      };
    }
  };

  const evaluation = getCognitiveEvaluation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">두뇌 인지 훈련 분석 리포트</h2>
              <p className="text-xs text-slate-300">치매 예방을 위한 일일 뇌 인지 영역 자극 지표</p>
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

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Vitality Score Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/40 border border-emerald-600/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-400 font-semibold tracking-wide">
                  뇌 활력 종합 지수 (Brain Vitality Index)
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-300 mt-1 tabular-nums">
                  {stats.brainVitalityScore.toLocaleString()}
                  <span className="text-sm font-normal text-emerald-400/80 ml-2">점</span>
                </div>
              </div>
              <div className="bg-slate-900/80 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
                <span className="block text-[11px] text-slate-400">평가 등급</span>
                <span className="text-sm font-bold text-emerald-300">{evaluation.level}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2.5">
              {evaluation.comment}
            </p>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>훈련 시간</span>
              </div>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {formatTime(stats.timePlayedSeconds)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>공간 회전</span>
              </div>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {stats.rotationsPerformed} 회
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>완성한 줄</span>
              </div>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {stats.linesCleared} 줄
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>최대 콤보</span>
              </div>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {stats.maxCombo} 콤보
              </span>
            </div>
          </div>

          {/* Line Clears Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>줄 완성 세부 분석 (작업 기억 & 공간 예측)</span>
              <span className="text-slate-400">{modeKorean}</span>
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-[11px] text-slate-400">1줄 완성</span>
                <span className="text-sm font-bold font-mono text-white tabular-nums">
                  {stats.singles}회
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-[11px] text-slate-400">더블 (2줄)</span>
                <span className="text-sm font-bold font-mono text-cyan-300 tabular-nums">
                  {stats.doubles}회
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-[11px] text-slate-400">트리플 (3줄)</span>
                <span className="text-sm font-bold font-mono text-purple-300 tabular-nums">
                  {stats.triples}회
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-[11px] text-emerald-400 font-semibold">테트리스 (4줄)</span>
                <span className="text-sm font-bold font-mono text-emerald-300 tabular-nums">
                  {stats.tetrises}회
                </span>
              </div>
            </div>
          </div>

          {/* Dementia Prevention Clinical Insight */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>치매 예방 의학 상식</span>
            </div>
            <p className="text-slate-400">
              블록의 모양을 회전하고 비어있는 홈을 찾아 맞추는 활동은 시각-공간 처리(Visuospatial Processing)를
              담당하는 뇌의 <span className="text-emerald-300 font-medium">두정엽 피질</span>을 직접적으로 자극합니다.
              주 3회 15분 이상 지속하면 인지 기능 유지와 뇌혈류 활성화에 매우 긍정적입니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm cursor-pointer transition-all active:scale-95"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
