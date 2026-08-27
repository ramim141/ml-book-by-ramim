import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Clock, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2, 
  HelpCircle, Sparkles, LayoutGrid, Check, X, ShieldAlert, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

const enToBnNumber = (numStr) => {
  if (!numStr && numStr !== 0) return numStr;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const OPTION_PREFIXES = ['(ক)', '(খ)', '(গ)', '(ঘ)', '(ঙ)', '(চ)'];

const MarkdownRenderer = ({ content }) => (
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed text-slate-100">
    <ReactMarkdown 
      remarkPlugins={[remarkMath, remarkGfm]} 
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  </span>
);

export default function ModelTestExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, durationSeconds, subjectTitle, subjectId, program } = location.state || {};

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationSeconds || 600);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Auto-submit when time is up
  const handleSubmit = useCallback(() => {
    toast.success('🎉 মডেল টেস্ট সফলভাবে সাবমিট হয়েছে!', {
      duration: 3500,
      icon: '🏆',
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        fontWeight: 'bold',
        fontSize: '13px'
      }
    });

    navigate('/academic/model-test/result', {
      state: {
        questions,
        answers,
        totalTime: durationSeconds,
        timeTaken: durationSeconds - timeLeftRef.current,
        subjectTitle,
        subjectId,
        program
      },
      replace: true
    });
  }, [navigate, questions, answers, durationSeconds, subjectTitle, subjectId, program]);

  useEffect(() => {
    if (!questions) return;

    if (timeLeftRef.current <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, handleSubmit]);

  if (!questions) {
    return <Navigate to="/academic/model-test" replace />;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${enToBnNumber(m)}:${enToBnNumber(s.toString().padStart(2, '0'))}`;
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    setAnswers(prev => {
      // Toggle if already selected or pick new
      if (prev[qIdx] === optIdx) {
        const next = { ...prev };
        delete next[qIdx];
        return next;
      }
      return { ...prev, [qIdx]: optIdx };
    });
  };

  const handleClearAnswer = (qIdx) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qIdx];
      return next;
    });
  };

  const scrollToQuestion = (idx) => {
    const el = document.getElementById(`q-card-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setShowPalette(false);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pt-16 sm:pt-20 pb-28 font-bangla selection:bg-indigo-500/30">
      
      {/* ── Fixed Floating Top Exam Header ───────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0f1c]/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Exam Title & Subject Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center text-indigo-400 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] sm:text-xs font-bold shrink-0">
                  মডেল টেস্ট
                </span>
                <h1 className="text-sm sm:text-base font-bold text-white truncate">
                  {subjectTitle || 'একাডেমিক পরীক্ষা'}
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                মোট প্রশ্ন: {enToBnNumber(questions.length)} টি | সময়: {enToBnNumber(Math.round(durationSeconds / 60))} মিনিট
              </p>
            </div>
          </div>

          {/* Central Live Timer */}
          <div className={`flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl font-mono font-bold text-base sm:text-xl border shadow-lg transition-all ${
            timeLeft < 120 
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-rose-500/20 animate-pulse' 
              : 'bg-slate-900/90 border-slate-700 text-amber-300 shadow-amber-500/5'
          }`}>
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${timeLeft < 120 ? 'text-rose-400' : 'text-amber-400 animate-spin-slow'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* OMR Question Matrix Toggle */}
            <button
              type="button"
              onClick={() => setShowPalette(!showPalette)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition shadow-sm"
              title="প্রশ্ন তালিকা দেখুন"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">প্রশ্ন তালিকা</span>
              <span className="text-indigo-400 font-mono">({enToBnNumber(answeredCount)}/{enToBnNumber(questions.length)})</span>
            </button>

            {/* Quick Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>জমা দিন</span>
            </button>
          </div>

        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800/60 h-1 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* ── Main Layout Container ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left / Center Questions Feed (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {questions.map((q, qIdx) => {
              const selectedOpt = answers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const optionsList = Array.isArray(q.options) 
                ? q.options 
                : (typeof q.options === 'object' && q.options !== null ? Object.values(q.options) : []);

              return (
                <div 
                  key={qIdx} 
                  id={`q-card-${qIdx}`}
                  className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 p-5 sm:p-7 shadow-xl ${
                    isAnswered 
                      ? 'bg-slate-900/70 border-indigo-500/40 ring-1 ring-indigo-500/20' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  {/* Card Header & Question Prompt */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black transition-colors shrink-0 shadow-sm ${
                        isAnswered
                          ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {enToBnNumber(qIdx + 1)}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        প্রশ্ন #{enToBnNumber(qIdx + 1)}
                      </span>
                    </div>

                    {isAnswered && (
                      <button
                        type="button"
                        onClick={() => handleClearAnswer(qIdx)}
                        className="text-[11px] text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/20 transition flex items-center gap-1"
                        title="উত্তর মুছে ফেলুন"
                      >
                        <X className="w-3 h-3" />
                        <span>মুছুন</span>
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-6">
                    <MarkdownRenderer content={q.question} />
                    
                    {/* Optional Image */}
                    {q.imageUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 p-2 flex justify-center max-h-[300px]">
                        <img 
                          src={q.imageUrl} 
                          alt="Question Diagram" 
                          loading="lazy" 
                          className="max-w-full h-auto object-contain rounded-lg" 
                        />
                      </div>
                    )}
                  </div>

                  {/* 2 Options Per Row Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                    {optionsList.map((option, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const prefix = OPTION_PREFIXES[optIdx] || `(${optIdx + 1})`;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleOptionSelect(qIdx, optIdx)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-start gap-3 group relative cursor-pointer ${
                            isSelected 
                              ? 'bg-indigo-600/15 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/40 text-white' 
                              : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          {/* Option Badge */}
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200 border border-slate-700/60'
                          }`}>
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : prefix}
                          </div>

                          {/* Option Text */}
                          <div className={`text-sm sm:text-base leading-relaxed flex-1 ${
                            isSelected ? 'font-bold text-white' : 'font-normal text-slate-300'
                          }`}>
                            <MarkdownRenderer content={option} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}

            {/* Bottom Submit Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 text-center space-y-4 shadow-2xl">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                সবগুলো প্রশ্নের উত্তর দেওয়া শেষ?
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                আপনি <strong>{enToBnNumber(questions.length)}</strong> টির মধ্যে <strong>{enToBnNumber(answeredCount)}</strong> টি প্রশ্নের উত্তর দিয়েছেন। সময় শেষ হওয়ার আগেই খাতা জমা দিতে পারেন।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>পরীক্ষা সমাপ্ত ও ফলাফল দেখুন</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Sticky Question Matrix Palette (4 cols on lg) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-5">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  <span>প্রশ্ন নেভিগেটর</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {enToBnNumber(progressPercent)}% সম্পন্ন
                </span>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <span className="text-emerald-400 font-medium">উত্তর দেওয়া:</span>
                  <strong className="text-emerald-300 font-mono">{enToBnNumber(answeredCount)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">বাকি আছে:</span>
                  <strong className="text-slate-200 font-mono">{enToBnNumber(unansweredCount)}</strong>
                </div>
              </div>

              {/* Matrix Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1 select-none">
                {questions.map((_, idx) => {
                  const answered = answers[idx] !== undefined;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => scrollToQuestion(idx)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        answered
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {enToBnNumber(idx + 1)}
                    </button>
                  );
                })}
              </div>

              {/* Instant Submit Button */}
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>খাতা জমা দিন</span>
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* ── Mobile Question Palette Drawer Modal ─────────────────────────── */}
      {showPalette && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md lg:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-400" />
                <span>প্রশ্ন নেভিগেটর</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPalette(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((_, idx) => {
                const answered = answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToQuestion(idx)}
                    className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                      answered
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {enToBnNumber(idx + 1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirmation Modal ────────────────────────────────────── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">পরীক্ষা সমাপ্ত করতে চান?</h3>
              <p className="text-sm text-slate-400">
                একবার খাতা জমা দিলে আর কোনো উত্তর পরিবর্তন করা যাবে না।
              </p>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[11px] text-slate-400 block">মোট প্রশ্ন</span>
                <strong className="text-base font-bold text-white">{enToBnNumber(questions.length)}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[11px] text-emerald-400 block">উত্তর দিয়েছেন</span>
                <strong className="text-base font-bold text-emerald-300">{enToBnNumber(answeredCount)}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-[11px] text-rose-400 block">বাকি রয়েছে</span>
                <strong className="text-base font-bold text-rose-300">{enToBnNumber(unansweredCount)}</strong>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                আরেকটু দেখবো
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition"
              >
                হ্যাঁ, জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
