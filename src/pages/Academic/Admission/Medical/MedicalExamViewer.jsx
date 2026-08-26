import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { 
  ArrowLeft, Clock, Award, CheckCircle2, XCircle, AlertCircle, 
  RotateCcw, Bookmark, BookOpen, Dna, FlaskConical, Zap, Globe, 
  Sparkles, Check, ChevronRight, ChevronLeft, HelpCircle, Eye, EyeOff, Flag
} from 'lucide-react';
import { SAMPLE_MEDICAL_QUESTIONS, MEDICAL_MARKS_DISTRIBUTION } from '../../../../data/academic/medicalConfig';
import MarkdownRenderer from '../../../../components/UI/MarkdownRenderer';
import { useAuth } from '../../../../contexts/AuthContext';
import { recordMistake } from '../../../../lib/mistakes';
import { SkeletonQuestionCard } from '../../../../components/UI/Skeleton';
import FeedbackModal from '../../../../components/Academic/FeedbackModal';
import toast from 'react-hot-toast';

import { isQuestionInSession } from '../../../../utils/questionSessionMatcher';
import { optionsOf, shuffle } from '../../../../lib/questionUtils';

export default function MedicalExamViewer() {
  const { examType: rawExamType = 'MBBS', year: rawYear = '2023-2024' } = useParams();
  const examType = decodeURIComponent(rawExamType || 'MBBS');
  const year = decodeURIComponent(rawYear || '2023-2024');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Custom params from query
  const customMode = searchParams.get('mode'); // 'exam' or 'practice'
  const customDuration = searchParams.get('duration') ? Number(searchParams.get('duration')) * 60 : 3600;
  const customNegative = searchParams.get('negative') !== null ? Number(searchParams.get('negative')) : 0.25;
  const customCount = searchParams.get('count') ? Number(searchParams.get('count')) : null;

  // Mode: 'exam' (timed with negative marking) or 'practice' (instant solution)
  const [mode, setMode] = useState(customMode === 'exam' ? 'exam' : customMode === 'practice' ? 'practice' : 'practice');
  const [activeSubject, setActiveSubject] = useState('all');
  
  // State for user answers: { [questionId]: selectedOptionIndex }
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState({});
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);

  const handleOpenFeedback = (q) => {
    setReportingQuestion(q);
    setFeedbackModalOpen(true);
  };

  // Exam timer
  const [timeLeft, setTimeLeft] = useState(customDuration);
  const timerRef = useRef(null);

  // Fetch questions dynamically from Firestore question_bank
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['medical_questions', examType, year],
    queryFn: async () => {
      try {
        const qRef = collection(db, 'question_bank');
        const snap = await getDocs(qRef);
        if (!snap.empty) {
          const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const matched = allDocs.filter(q => isQuestionInSession(q, examType, year));
          return matched;
        }
      } catch (err) {
        console.warn('Firestore fetch failed:', err);
      }
      return [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const [drillSeed, setDrillSeed] = useState(() => Date.now());

  // Filtered by subject and randomly sampled if count is specified
  const filteredQuestions = useMemo(() => {
    let list = activeSubject === 'all' 
      ? [...questions] 
      : questions.filter(q => q.subject?.toLowerCase() === activeSubject.toLowerCase());

    if (customCount && customCount > 0 && list.length > 0) {
      // drillSeed ধরে শাফল — "নতুন প্রশ্ন" বোতামে সিড বদলালে তবেই ক্রম বদলায়,
      // রেন্ডারে Math.random() ডাকলে মাঝপথে প্রশ্ন বদলে যাওয়ার ঝুঁকি ছিল
      const shuffled = shuffle(list, `${drillSeed}:${activeSubject}`);
      return shuffled.slice(0, Math.min(customCount, shuffled.length));
    }
    return list;
  }, [questions, activeSubject, customCount, drillSeed]);

  // সময় শেষে জমা দেওয়ার জন্য সর্বশেষ handleExamSubmit — ইফেক্টের ক্লোজারে
  // ধরে রাখলে অটো-জমার সময় `userAnswers` পুরনো (খালি) থেকে যেত, ফলে ভুলের
  // খাতায় কিছুই উঠত না
  const submitRef = useRef(null);

  // Exam Timer Countdown (only runs when questions are loaded)
  useEffect(() => {
    if (mode !== 'exam' || isSubmitted || isLoading || filteredQuestions.length === 0) return undefined;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [mode, isSubmitted, isLoading, filteredQuestions.length]);

  // সময় ফুরালে জমা — setState আপডেটারের ভেতরে সাইড-ইফেক্ট রাখা হতো
  useEffect(() => {
    if (mode !== 'exam' || isSubmitted || isLoading || customDuration <= 0) return;
    if (timeLeft > 0 || filteredQuestions.length === 0) return;
    submitRef.current?.();
  }, [mode, isSubmitted, isLoading, timeLeft, customDuration, filteredQuestions.length]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (isSubmitted && mode === 'exam') return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: prev[qId] === optionIdx ? undefined : optionIdx
    }));
  };

  const handleToggleBookmark = (qId) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
        toast.success('বুকমার্ক থেকে সরানো হয়েছে');
      } else {
        next.add(qId);
        toast.success('প্রশ্নটি বুকমার্ক করা হয়েছে');
      }
      return next;
    });
  };

  const handleExamSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitted(true);
    
    // Rich Success Toast
    toast.success('🎉 মডেল টেস্ট সফলভাবে সাবমিট হয়েছে! ফলাফল দেখুন।', {
      duration: 4000,
      icon: '🏆',
      style: {
        background: '#0f172a',
        color: '#f8fafc',
        border: '1px solid rgba(244, 63, 94, 0.4)',
        fontWeight: 'bold',
        fontSize: '13px'
      }
    });

    // Scroll smoothly to top results
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save mistakes to mistake notebook
    const activeList = filteredQuestions.length > 0 ? filteredQuestions : questions;
    let mistakesLogged = 0;

    for (const q of activeList) {
      const qKey = q.id ?? q.firebaseId;
      const userAns = userAnswers[qKey];
      if (userAns !== undefined && userAns !== null && userAns !== q.answer) {
        try {
          await recordMistake(currentUser?.uid || 'guest', q, {
            userAnswer: userAns,
            subjectId: q.subject || 'medical',
            subjectTitle: q.subject || `${examType} (${year})`,
            program: 'medical'
          });
          mistakesLogged++;
        } catch (e) {
          console.error('Failed to log mistake:', e);
        }
      }
    }

    if (mistakesLogged > 0) {
      toast.success(`${mistakesLogged}টি ভুল প্রশ্ন ভুলের খাতায় (Mistake Book) যুক্ত হয়েছে।`, {
        icon: '📓',
        duration: 3500
      });
    }
  };

  useEffect(() => {
    submitRef.current = handleExamSubmit;
  });

  const handleResetExam = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setTimeLeft(customDuration);
    setShowExplanation({});
  };

  // Exam Score Statistics
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    // পর্দায় যে প্রশ্নগুলো আছে সেগুলোর ওপরেই হিসাব — আগে পুরো প্রশ্নব্যাংক
    // গোনা হতো, ফলে ১০-প্রশ্নের ড্রিলেও "মোট"/"বাদ" শত শত দেখাত
    filteredQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans === undefined) {
        skipped++;
      } else if (ans === q.answer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const negativeMarks = wrong * customNegative;
    const netScore = Math.max(0, correct - negativeMarks);
    const accuracy = correct + wrong > 0 ? ((correct / (correct + wrong)) * 100).toFixed(1) : 0;

    return { correct, wrong, skipped, negativeMarks, netScore, accuracy, total: filteredQuestions.length };
  }, [filteredQuestions, userAnswers, customNegative]);

  const handleShuffleNewQuestions = () => {
    setDrillSeed(Date.now());
    setUserAnswers({});
    setIsSubmitted(false);
    setShowExplanation({});
    setTimeLeft(customDuration);
    toast.success(`🎲 নতুন ${customCount || 10}টি র্যান্ডম প্রশ্ন লোড করা হয়েছে!`, { icon: '✨' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shortYear = year ? String(year).replace(/^20(\d{2})-20(\d{2})$/, '$1-$2').replace(/^20(\d{2})$/, '$1') : '';
  const displayTitle = customCount ? `ডেইলি ${customCount}-প্রশ্ন ড্রিল` : `${examType === 'MBBS' ? 'MAT' : examType} ${shortYear || year}`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 font-bangla selection:bg-rose-500/30">
      {/* Top Floating Control Bar (Aligns exactly with AcademicNavbar's max-w-7xl container) */}
      <header className="sticky top-[64px] sm:top-[80px] z-30 bg-[#090d18]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Left: Compact Exam Title Badge (e.g. MAT 22-23 or Daily Drill) */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 text-xs sm:text-sm font-black rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap tracking-wide">
              {displayTitle}
            </span>
          </div>

          {/* Middle: If Drill, show Shuffle button */}
          {customCount && (
            <button
              onClick={handleShuffleNewQuestions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition active:scale-95 shadow-sm"
              title="নতুন প্রশ্ন লোড করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>নতুন {customCount}টি প্রশ্ন</span>
            </button>
          )}

          {/* Right: Mode Switcher */}
          <div className="flex items-center shrink-0">
            <div className="flex bg-slate-900/90 p-0.5 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => { setMode('practice'); setIsSubmitted(false); }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'practice' 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                প্র্যাকটিস
              </button>
              <button
                onClick={() => { setMode('exam'); handleResetExam(); }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  mode === 'exam' 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                রিয়েল এক্সাম
              </button>
            </div>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        
        {/* Exam Result Dashboard (Shown when submitted in exam mode) */}
        {isSubmitted && mode === 'exam' && (
          <div className="bg-gradient-to-br from-slate-900 via-[#11192e] to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                  <span className="text-xs font-bold text-rose-400 tracking-wider uppercase">Exam Performance</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">ফলাফল ও পারফরম্যান্স রিপোর্ট</h2>
                </div>
                <button
                  onClick={handleResetExam}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition"
                >
                  <RotateCcw className="h-4 w-4" /> পুনরায় পরীক্ষা দিন
                </button>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl text-center">
                  <span className="text-xs font-bold text-slate-400">নেট স্কোর</span>
                  <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{stats.netScore.toFixed(2)}</p>
                  <span className="text-[10px] text-slate-500">মোট: {stats.total}</span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                  <span className="text-xs font-bold text-emerald-400">সঠিক উত্তর</span>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{stats.correct}</p>
                  <span className="text-[10px] text-emerald-500/80">+১ করে</span>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                  <span className="text-xs font-bold text-red-400">ভুল উত্তর</span>
                  <p className="text-2xl sm:text-3xl font-black text-red-300 mt-1">{stats.wrong}</p>
                  <span className="text-[10px] text-red-400">নেগেটিভ: -{stats.negativeMarks.toFixed(2)}</span>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-2xl text-center">
                  <span className="text-xs font-bold text-slate-400">অনুত্তরিত</span>
                  <p className="text-2xl sm:text-3xl font-black text-slate-300 mt-1">{stats.skipped}</p>
                  <span className="text-[10px] text-slate-500">স্কিপ করা</span>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-indigo-400">সঠিকতার হার</span>
                  <p className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">{stats.accuracy}%</p>
                  <span className="text-[10px] text-indigo-400">একুরেসি</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        {isLoading ? (
          <SkeletonQuestionCard count={5} />
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">কোনো প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-sm text-slate-400">
              এই সেশনের ({displayTitle}) প্রশ্ন এখনো আপলোড করা হয়নি। অ্যাডমিন প্যানেল থেকে এই সেশনের প্রশ্ন আপলোড করুন।
            </p>
            <Link
              to="/academic/admission/medical"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> ফিরে যান
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
            const selectedOpt = userAnswers[q.id];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = isAnswered && selectedOpt === q.answer;
            const showSolution = mode === 'practice' || isSubmitted;
            const isBookmarked = bookmarkedIds.has(q.id);

            return (
              <div 
                key={q.id || idx}
                className={`bg-slate-900/40 border rounded-2xl p-4 sm:p-5 transition-all ${
                  showSolution && isAnswered 
                    ? isCorrect 
                      ? 'border-emerald-500/40 bg-emerald-950/10' 
                      : 'border-red-500/40 bg-red-950/10'
                    : 'border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {/* Question Header: Authentic Clean Exam Style */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-rose-400 font-black text-base sm:text-lg shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="text-base sm:text-lg font-medium text-slate-100 leading-snug">
                      <MarkdownRenderer content={q.question} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenFeedback(q)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="প্রশ্নে ভুল থাকলে রিপোর্ট করুন"
                    >
                      <Flag className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-1.5 rounded-lg transition shrink-0 ${isBookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                      title="বুকমার্ক করুন"
                    >
                      <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {optionsOf(q).map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isTargetAnswer = q.answer === optIdx;
                    
                    let btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700';
                    
                    if (showSolution) {
                      if (isTargetAnswer) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold';
                      } else if (isSelected && !isTargetAnswer) {
                        btnStyle = 'bg-red-500/20 border-red-500/60 text-red-300 font-bold';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/20 border-rose-500/80 text-rose-200 font-bold shadow-sm';
                    }

                    const optLabels = ['ক', 'খ', 'গ', 'ঘ'];

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted && mode === 'exam'}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all ${btnStyle}`}
                      >
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center border shrink-0 transition-all ${
                          showSolution && isTargetAnswer 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                            : showSolution && isSelected && !isTargetAnswer 
                              ? 'bg-red-500 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                              : isSelected 
                                ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]' 
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {optLabels[optIdx] || optIdx + 1}
                        </span>
                        <div className="flex-grow min-w-0">
                          <MarkdownRenderer content={opt} />
                        </div>
                        {showSolution && isTargetAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                        {showSolution && isSelected && !isTargetAnswer && <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Book Reference */}
                {showSolution && q.explanation && (
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 text-xs text-slate-300 space-y-1 mt-3">
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>ব্যাখ্যা ও মূল বইয়ের রেফারেন্স:</span>
                    </div>
                    <div className="leading-relaxed pl-5 text-slate-300">
                      <MarkdownRenderer content={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Sleek Bottom-Right Floating Timer & Submit Bar */}
      {mode === 'exam' && !isSubmitted && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2 p-1.5 sm:p-2 pl-3 sm:pl-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-xs sm:text-sm font-black pr-1">
            <Clock className="h-3.5 w-3.5 animate-pulse text-amber-400" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          
          <button
            onClick={handleExamSubmit}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>সাবমিট করুন</span>
          </button>
        </div>
      )}

      {/* Question Error Feedback Modal */}
      {feedbackModalOpen && reportingQuestion && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setReportingQuestion(null);
          }}
          questionId={reportingQuestion.id}
          questionType="admission_exam_mcq"
          chapterId={reportingQuestion.chapterId || ''}
          subjectId={reportingQuestion.subject || ''}
          questionData={reportingQuestion}
        />
      )}
    </div>
  );
}

