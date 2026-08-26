import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Sparkles, Target, Clock, ShieldAlert, 
  Award, CheckCircle2, XCircle, ChevronRight, Bookmark, RotateCcw,
  Zap, FileText, Check, HelpCircle, Eye, EyeOff, Layers, Play,
  ChevronDown, Search, Flag, CheckCheck, Lightbulb, GraduationCap,
  Flame, Dna, FlaskConical, Stethoscope, Compass, LayoutGrid, Highlighter
} from 'lucide-react';
import { MEDICAL_SUBJECTS_DETAILED, MEDICAL_MNEMONICS } from '../../../../data/academic/medicalConfig';
import MarkdownRenderer from '../../../../components/UI/MarkdownRenderer';
import { useMedicalConfig, useAdmissionShortcuts } from '../../../../hooks/useAdmissionData';
import { useAuth } from '../../../../contexts/AuthContext';
import { recordMistake } from '../../../../lib/mistakes';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { SkeletonQuestionCard } from '../../../../components/UI/Skeleton';
import FeedbackModal from '../../../../components/Academic/FeedbackModal';
import { normalizeChapterKey } from '../../QuestionBuilder/useBuilderQuestions';
import { getMainBookWriterName } from '../../../../utils/academicWriterResolver';
import toast from 'react-hot-toast';

export default function MedicalChapterDetails() {
  const { subjectSlug, chapterId } = useParams();
  const { currentUser } = useAuth();

  const { data: dynamicMedicalSubjects = MEDICAL_SUBJECTS_DETAILED } = useMedicalConfig();
  const { data: allShortcuts = [] } = useAdmissionShortcuts();

  const [activeTab, setActiveTab] = useState('mcq'); // 'mcq' | 'main_book_mcq' | 'lines' | 'mnemonics' | 'speed_test'
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testTimeLeft, setTestTimeLeft] = useState(600); // 10 minutes for chapter test
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [subjectSlug, chapterId]);

  const subject = useMemo(() => {
    return dynamicMedicalSubjects.find(
      s => s.id.toLowerCase() === (subjectSlug || '').toLowerCase()
    );
  }, [dynamicMedicalSubjects, subjectSlug]);

  const chapter = useMemo(() => {
    if (!subject?.chapters) return null;
    return subject.chapters.find(
      c => c.id.toLowerCase() === (chapterId || '').toLowerCase() ||
           normalizeChapterKey(c.id) === normalizeChapterKey(chapterId)
    );
  }, [subject, chapterId]);

  // Robust live question fetch from Firestore question_bank
  const { data: allFetchedQuestions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['medical_chapter_questions_v2', subjectSlug, chapterId],
    queryFn: async () => {
      try {
        const qRef = collection(db, 'question_bank');
        const snap = await getDocs(qRef);
        if (!snap.empty) {
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn('Failed to fetch chapter questions from firestore:', err);
      }
      return [];
    },
    staleTime: 1000 * 60,
    enabled: !!subject?.id
  });

  // Filter matching questions for active chapter
  const matchingChapterQuestions = useMemo(() => {
    if (!chapter || !subject) return [];
    const cId = (chapter.id || '').toLowerCase();
    const cNorm = normalizeChapterKey(cId);
    const cName = (chapter.name || '').toLowerCase();
    const cleanTitle = cName.split(':')[1]?.trim().toLowerCase() || cName;
    const rawSub = (subject.id || '').replace('adm-', '').toLowerCase();

    return allFetchedQuestions.filter(q => {
      const qSub = String(q.subject || '').toLowerCase().trim();
      const qSubOpt = String(q.subjectOptionId || '').toLowerCase().trim();
      const matchSub =
        !subject.id ||
        qSub === subject.id.toLowerCase() ||
        qSub === rawSub ||
        qSub.includes(rawSub) ||
        qSubOpt.includes(rawSub);

      if (!matchSub) return false;

      const qChapId = String(q.chapterId || '').toLowerCase().trim();
      const qChapNorm = normalizeChapterKey(qChapId);
      const qChapName = String(q.chapter || q.chapterName || '').toLowerCase().trim();
      const qTopic = String(q.topic || '').toLowerCase().trim();

      return (
        qChapId === cId ||
        qChapNorm === cNorm ||
        qChapName === cName ||
        qChapName.includes(cleanTitle) ||
        qTopic.includes(cleanTitle)
      );
    });
  }, [allFetchedQuestions, chapter, subject]);

  // Helper to check if question belongs to Main Book Exercise
  const isQuestionMainBook = (q) => {
    if (q.isMainBook || q.category === 'main_book' || q.source === 'main_book') return true;
    const typeStr = (q.examType || '').toLowerCase();
    if (typeStr.includes('main book') || typeStr.includes('বই') || typeStr.includes('অনুশীলনী')) return true;
    
    return (Array.isArray(q.examTags) ? q.examTags : []).some(t => {
      const tagType = (t.type || t.name || '').toLowerCase();
      return tagType.includes('book') || tagType.includes('বই') || tagType.includes('অনুশীলনী') ||
        tagType.includes('হাসান') || tagType.includes('আজমল') || tagType.includes('হাজারী') || tagType.includes('ইসহাক');
    });
  };

  // 1. Admission MCQ
  const admissionQuestions = useMemo(() => {
    return matchingChapterQuestions.filter(q => !isQuestionMainBook(q));
  }, [matchingChapterQuestions]);

  // 2. Main Book MCQ
  const mainBookQuestions = useMemo(() => {
    return matchingChapterQuestions.filter(q => isQuestionMainBook(q));
  }, [matchingChapterQuestions]);

  // Filter questions for active tab with search and bookmark filters
  const activeQuestionsList = useMemo(() => {
    let list = [];
    if (activeTab === 'main_book_mcq') {
      list = mainBookQuestions;
    } else {
      list = admissionQuestions.length > 0 ? admissionQuestions : matchingChapterQuestions;
    }

    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      list = list.filter(q => 
        (q.question || '').toLowerCase().includes(qLower) ||
        (q.topic || '').toLowerCase().includes(qLower) ||
        (q.explanation || '').toLowerCase().includes(qLower)
      );
    }

    if (onlyBookmarks) {
      list = list.filter(q => bookmarkedIds.has(q.id));
    }

    return list;
  }, [activeTab, admissionQuestions, mainBookQuestions, matchingChapterQuestions, searchQuery, onlyBookmarks, bookmarkedIds]);

  // Reset pagination on tab or search change
  useEffect(() => {
    setVisibleCount(20);
  }, [activeTab, searchQuery, onlyBookmarks]);

  // Mnemonics related to this subject / chapter
  const chapterMnemonics = useMemo(() => {
    const medShortcuts = (Array.isArray(allShortcuts) ? allShortcuts : []).filter(s => s.track === 'medical');
    const sourceList = medShortcuts.length ? medShortcuts : MEDICAL_MNEMONICS;
    return (Array.isArray(sourceList) ? sourceList : []).filter(m => {
      const matchSub = (m.subject || '').toLowerCase().includes(subject?.name?.toLowerCase().split(' ')[0] || '') ||
        (m.subject || '').toLowerCase().includes(subject?.id?.toLowerCase() || '');
      const matchChap = !chapter || 
        (m.chapter || '').toLowerCase().includes(chapter.name?.toLowerCase() || '') ||
        (m.topic || '').toLowerCase().includes(chapter.name?.toLowerCase() || '') ||
        (m.chapterId && (m.chapterId === chapter.id || normalizeChapterKey(m.chapterId) === normalizeChapterKey(chapter.id)));
      return matchSub && matchChap;
    });
  }, [allShortcuts, subject, chapter]);

  // সময় শেষে জমা দেওয়ার জন্য সর্বশেষ handleTestSubmit — টাইমারের ইফেক্ট যে
  // রেন্ডারে তৈরি হয়েছিল সেই রেন্ডারের ফাংশন ধরে রাখলে অটো-জমার সময়
  // `userAnswers` পুরনো (খালি) থেকে যেত, ফলে কোনো ভুলই খাতায় উঠত না।
  const submitRef = useRef(null);

  // Speed Test Timer
  useEffect(() => {
    if (activeTab !== 'speed_test' || testSubmitted) return undefined;
    timerRef.current = setInterval(() => {
      setTestTimeLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [activeTab, testSubmitted]);

  // সময় ফুরালে জমা — আগে setState আপডেটারের ভেতরে ডাকা হতো, যেটা রেন্ডার
  // ফেজে সাইড-ইফেক্ট
  useEffect(() => {
    if (activeTab !== 'speed_test' || testSubmitted || testTimeLeft > 0) return;
    submitRef.current?.();
  }, [activeTab, testSubmitted, testTimeLeft]);

  const handleSelectOption = (qId, optIdx) => {
    if (activeTab === 'speed_test' && testSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: prev[qId] === optIdx ? undefined : optIdx
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

  const handleOpenFeedback = (q) => {
    setReportingQuestion(q);
    setFeedbackModalOpen(true);
  };

  const handleTestSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTestSubmitted(true);
    toast.success('চ্যাপ্টার টেস্ট সম্পন্ন হয়েছে!');

    if (currentUser) {
      for (const q of activeQuestionsList) {
        const userAns = userAnswers[q.id];
        if (userAns !== undefined && userAns !== q.answer) {
          try {
            await recordMistake(currentUser.uid, q, {
              userAnswer: userAns,
              subjectId: subject.id,
              subjectTitle: `${subject.name} - ${chapter.name}`
            });
          } catch (e) {
            console.error('Failed to log mistake:', e);
          }
        }
      }
    }
  };

  useEffect(() => {
    submitRef.current = handleTestSubmit;
  });

  const handleResetTest = () => {
    setUserAnswers({});
    setTestSubmitted(false);
    setTestTimeLeft(600);
  };

  // Test Score Calculation
  const testStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    activeQuestionsList.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans === undefined) skipped++;
      else if (ans === q.answer) correct++;
      else wrong++;
    });

    const negativeMarks = wrong * 0.25;
    const netScore = Math.max(0, correct - negativeMarks);
    const accuracy = correct + wrong > 0 ? ((correct / (correct + wrong)) * 100).toFixed(1) : 0;

    return { correct, wrong, skipped, negativeMarks, netScore, accuracy, total: activeQuestionsList.length };
  }, [activeQuestionsList, userAnswers]);

  if (!subject || !chapter) {
    return <Navigate to="/academic/admission/medical" replace />;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count answered questions for progress bar
  const totalQuestionsInChapter = matchingChapterQuestions.length;
  const answeredCount = Object.keys(userAnswers).filter(id => matchingChapterQuestions.some(q => q.id === id)).length;
  const progressPercent = totalQuestionsInChapter > 0 ? Math.round((answeredCount / totalQuestionsInChapter) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-bangla selection:bg-rose-500/30 pb-24 pt-6">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-[20%] w-[500px] h-[500px] bg-rose-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -right-[10%] w-[450px] h-[450px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[5%] left-[5%] w-[400px] h-[400px] bg-teal-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── 1. Top Navigation Bar ───────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <Link 
            to={`/academic/admission/medical/${subject.id}`} 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-rose-400 hover:text-white hover:border-rose-500/40 hover:bg-rose-500/10 text-xs sm:text-sm font-bold transition shadow-sm group backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            <span>{subject.name}-এ ফিরে যান</span>
          </Link>

          {/* Quick Progress Indicator */}
          {totalQuestionsInChapter > 0 && (
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs font-bold text-slate-300">
              <span className="text-slate-400">প্র্যাকটিস প্রগ্রেস:</span>
              <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-rose-400 font-black">{progressPercent}%</span>
            </div>
          )}
        </div>

        {/* ── 2. Glassmorphism Hero Chapter Banner ────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#0d1424]/95 to-slate-950/95 border border-white/[0.08] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          {/* Subtle Decorative Pattern */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <Dna className="w-3.5 h-3.5" />
                {chapter.paper || '১ম পত্র'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                <Target className="w-3.5 h-3.5" />
                মোট {totalQuestionsInChapter}+ টি প্রশ্ন
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Flame className="w-3 h-3 text-amber-400" /> হাই-ইয়েল্ড অধ্যায়
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 leading-tight">
                {chapter.name}
              </h1>
              {subject.recommendedBooks && (
                <p className="mt-2 text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>মূল পাঠ্যবই: <strong className="text-slate-300">
                    {Array.isArray(subject.recommendedBooks) ? subject.recommendedBooks.join(' ও ') : subject.recommendedBooks}
                  </strong></span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. Interactive Floating Tabs Bar ────────────────────────────── */}
        <div className="space-y-4">
          <div className="p-1.5 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-lg flex flex-wrap gap-1.5">
            {/* Category 1: Chapter Question Bank */}
            <button
              onClick={() => setActiveTab('mcq')}
              className={`flex-1 min-w-[150px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'mcq' 
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>অধ্যায় প্রশ্নব্যাংক (MCQ)</span>
              <span className={`text-[10.5px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'mcq' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {admissionQuestions.length}
              </span>
            </button>

            {/* Category 2: Main Book MCQ */}
            <button
              onClick={() => setActiveTab('main_book_mcq')}
              className={`flex-1 min-w-[150px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'main_book_mcq' 
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>মূল বইয়ের অনুশীলনী MCQ</span>
              <span className={`text-[10.5px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'main_book_mcq' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {mainBookQuestions.length}
              </span>
            </button>

            {/* Category 3: Highlighted Lines */}
            <button
              onClick={() => setActiveTab('lines')}
              className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'lines' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Highlighter className="w-4 h-4" />
              <span>মূল বইয়ের দাগানো লাইন</span>
              <span className={`text-[10.5px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'lines' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {chapter.keyFacts?.length || 0}
              </span>
            </button>

            {/* Category 4: Shortcuts & Tricks */}
            <button
              onClick={() => setActiveTab('mnemonics')}
              className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'mnemonics' 
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>শর্টকাট ও ট্রিকস</span>
              <span className={`text-[10.5px] px-1.5 py-0.5 rounded-md font-mono ${activeTab === 'mnemonics' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {chapterMnemonics.length}
              </span>
            </button>

            {/* Category 5: Speed Test */}
            <button
              onClick={() => setActiveTab('speed_test')}
              className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'speed_test' 
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>চ্যাপ্টার স্পিড টেস্ট</span>
            </button>
          </div>

          {/* Search & Bookmark Filter Row (Only for MCQ tabs) */}
          {(activeTab === 'mcq' || activeTab === 'main_book_mcq') && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="প্রশ্ন বা টপিক দিয়ে খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                  >
                    ক্লিয়ার
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    onlyBookmarks
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={onlyBookmarks ? 'currentColor' : 'none'} />
                  <span>বুকমার্ক করা ({bookmarkedIds.size})</span>
                </button>

                {answeredCount > 0 && (
                  <button
                    onClick={() => setUserAnswers({})}
                    className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    title="সকল উত্তর রিসেট করুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>রিসেট</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 1 & 2: MCQS (ADMISSION OR MAIN BOOK) ──────────────────── */}
          {(activeTab === 'mcq' || activeTab === 'main_book_mcq') && (
            <div className="space-y-4">
              {isQuestionsLoading ? (
                <SkeletonQuestionCard count={3} />
              ) : activeQuestionsList.length === 0 ? (
                <div className="rounded-3xl border border-white/[0.06] bg-slate-900/40 p-12 text-center space-y-3 backdrop-blur-md">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-slate-300">
                    {onlyBookmarks 
                      ? 'কোনো বুকমার্ক করা প্রশ্ন পাওয়া যায়নি'
                      : activeTab === 'main_book_mcq' 
                        ? 'এই অধ্যায়ের কোনো মূল বইয়ের অনুশীলনী প্রশ্ন পাওয়া যায়নি' 
                        : 'এই অধ্যায়ের কোনো ভর্তি পরীক্ষার প্রশ্ন পাওয়া যায়নি'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {onlyBookmarks
                      ? 'প্রশ্নের পাশে বুকমার্ক আইকনে ক্লিক করে পছন্দের প্রশ্ন সেভ করে রাখুন।'
                      : 'অ্যাডমিন প্যানেল থেকে এই অধ্যায়ের প্রশ্ন আপলোড করা যাবে।'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeQuestionsList.slice(0, visibleCount).map((q, idx) => {
                    const selectedOpt = userAnswers[q.id];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = isAnswered && selectedOpt === q.answer;
                    const isBookmarked = bookmarkedIds.has(q.id);
                    const isMainBookQ = isQuestionMainBook(q);
                    const optionsList = Array.isArray(q.options) ? q.options : [];
                    const examTagsList = Array.isArray(q.examTags) ? q.examTags : [];

                    return (
                      <div 
                        key={q.id || idx}
                        className={`group relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all duration-200 backdrop-blur-md shadow-lg ${
                          isAnswered 
                            ? isCorrect 
                              ? 'border-emerald-500/40 bg-gradient-to-b from-slate-900/90 to-emerald-950/15 shadow-emerald-500/5' 
                              : 'border-rose-500/40 bg-gradient-to-b from-slate-900/90 to-rose-950/15 shadow-rose-500/5'
                            : 'border-white/[0.07] bg-slate-900/70 hover:border-rose-500/30 hover:bg-slate-900/90'
                        }`}
                      >
                        {/* Header: Index, Question Text, Tags, Actions */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 text-rose-300 text-xs font-black flex items-center justify-center shadow-inner">
                              #{idx + 1}
                            </span>
                            <div className="space-y-1.5 min-w-0">
                              <div className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                                <MarkdownRenderer content={q.question} />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {isMainBookQ ? (
                                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {getMainBookWriterName(q, subject, chapter)}
                                  </span>
                                ) : examTagsList.length > 0 ? (
                                  examTagsList.map((tag, tIdx) => (
                                    <span key={tIdx} className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/25">
                                      {tag.type || tag.name} {tag.session || tag.year}
                                    </span>
                                  ))
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/25">
                                    {q.examType || 'MAT'} {q.year || '2023-24'}
                                  </span>
                                )}
                                {q.topic && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    • {q.topic}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleOpenFeedback(q)}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="প্রশ্নে ভুল থাকলে রিপোর্ট করুন"
                            >
                              <Flag className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleToggleBookmark(q.id)}
                              className={`p-2 rounded-xl transition ${isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                              title="বুকমার্ক করুন"
                            >
                              <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>

                        {/* 4 Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                          {optionsList.map((opt, optIdx) => {
                            const isSelected = selectedOpt === optIdx;
                            const isTargetAnswer = q.answer === optIdx;
                            
                            let btnStyle = 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700 hover:text-white';
                            
                            if (isAnswered) {
                              if (isTargetAnswer) {
                                btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold shadow-md shadow-emerald-500/10';
                              } else if (isSelected && !isTargetAnswer) {
                                btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-200 font-bold shadow-md shadow-rose-500/10';
                              }
                            }

                            const optLabels = ['ক', 'খ', 'গ', 'ঘ'];

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all active:scale-[0.99] ${btnStyle}`}
                              >
                                <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border transition-colors ${
                                  isAnswered && isTargetAnswer 
                                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm' 
                                    : isAnswered && isSelected && !isTargetAnswer 
                                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm' 
                                      : 'bg-slate-800/90 text-slate-400 border-slate-700'
                                }`}>
                                  {optLabels[optIdx]}
                                </span>
                                <div className="flex-grow min-w-0">
                                  <MarkdownRenderer content={opt} />
                                </div>
                                {isAnswered && isTargetAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                                {isAnswered && isSelected && !isTargetAnswer && <XCircle className="h-4 w-4 text-rose-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {isAnswered && q.explanation && (
                          <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-3.5 text-xs text-slate-300 space-y-1.5 animate-in fade-in duration-300">
                            <div className="flex items-center gap-1.5 font-bold text-rose-400">
                              <Lightbulb className="h-4 w-4" />
                              <span>মূল বইয়ের রেফারেন্স ও ব্যাখ্যা:</span>
                            </div>
                            <div className="leading-relaxed pl-5 text-slate-300 text-[12.5px]">
                              <MarkdownRenderer content={q.explanation} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Load More Button */}
                  {activeQuestionsList.length > visibleCount && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(v => v + 20)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-rose-500/40 py-3.5 text-xs sm:text-sm font-bold text-slate-300 transition hover:text-rose-200 shadow-sm"
                    >
                      <ChevronDown className="h-4 w-4 text-rose-400" />
                      <span>আরো ২০ টি প্রশ্ন দেখুন</span>
                      <span className="text-slate-500 font-normal">({activeQuestionsList.length - visibleCount} টি বাকি)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: HIGHLIGHTED LINES ──────────────────────────────────── */}
          {activeTab === 'lines' && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/[0.07] bg-slate-900/80 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm sm:text-base">
                  <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                  <span>{chapter.name} - দাগানো হাই-ইয়েল্ড লাইনস</span>
                </div>

                <div className="space-y-3">
                  {(Array.isArray(chapter.keyFacts) ? chapter.keyFacts : []).map((fact, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3.5 bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 transition hover:border-rose-500/30 hover:bg-slate-900/60"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-rose-500/30">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>

                {Array.isArray(chapter.highYieldTopics) && chapter.highYieldTopics.length > 0 && (
                  <div className="pt-4 border-t border-slate-800/80">
                    <h4 className="text-xs sm:text-sm font-black text-slate-300 mb-2.5">এই অধ্যায়ের মূল ফোকাস টপিকসমূহ:</h4>
                    <div className="flex flex-wrap gap-2">
                      {chapter.highYieldTopics.map((topic, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-rose-300">
                          • {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 4: MNEMONICS & TRICKS ─────────────────────────────────── */}
          {activeTab === 'mnemonics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapterMnemonics.map((m) => {
                  const explanationLines = Array.isArray(m.explanation)
                    ? m.explanation
                    : typeof m.explanation === 'string'
                      ? m.explanation.split('\n').filter(Boolean)
                      : [];

                  return (
                    <div 
                      key={m.id}
                      className="rounded-2xl border border-white/[0.07] bg-slate-900/80 p-5 space-y-3.5 shadow-xl backdrop-blur-xl hover:border-teal-500/30 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {m.subject}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{m.reference}</span>
                      </div>

                      <h3 className="font-bold text-slate-100 text-sm sm:text-base">{m.topic}</h3>

                      {m.technique && (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-black text-xs sm:text-sm tracking-wide">
                          {m.technique}
                        </div>
                      )}

                      {explanationLines.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                          {explanationLines.map((line, idx) => (
                            <p key={idx} className="text-xs text-slate-300 leading-relaxed">
                              • {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 5: CHAPTER SPEED TEST ─────────────────────────────────── */}
          {activeTab === 'speed_test' && (
            <div className="space-y-6">
              
              {/* Test Header & Timer */}
              <div className="rounded-2xl border border-white/[0.08] bg-slate-900/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-400" />
                    <span>চ্যাপ্টার স্পিড টেস্ট</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">সময়: ১০ মিনিট | প্রতি ভুল উত্তরের জন্য -০.২৫ নেগেটিভ মার্কিং</p>
                </div>

                <div className="flex items-center gap-3">
                  {!testSubmitted && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-sm font-black animate-pulse">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(testTimeLeft)}</span>
                    </div>
                  )}

                  {!testSubmitted ? (
                    <button
                      onClick={handleTestSubmit}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition"
                    >
                      সাবমিট করুন
                    </button>
                  ) : (
                    <button
                      onClick={handleResetTest}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> পুনরায় দিন
                    </button>
                  )}
                </div>
              </div>

              {/* Result Summary */}
              {testSubmitted && (
                <div className="rounded-2xl border border-white/[0.08] bg-slate-900/90 p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center backdrop-blur-xl shadow-xl">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-bold">নেট স্কোর</span>
                    <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{testStats.netScore.toFixed(2)}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-xs text-emerald-400 font-bold">সঠিক উত্তর</span>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{testStats.correct}</p>
                  </div>
                  <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                    <span className="text-xs text-rose-400 font-bold">ভুল উত্তর</span>
                    <p className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">{testStats.wrong}</p>
                  </div>
                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <span className="text-xs text-indigo-400 font-bold">একুরেসি</span>
                    <p className="text-2xl sm:text-3xl font-black text-indigo-300 mt-1">{testStats.accuracy}%</p>
                  </div>
                </div>
              )}

              {/* Questions List for Test */}
              <div className="space-y-4">
                {activeQuestionsList.map((q, idx) => {
                  const selectedOpt = userAnswers[q.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = isAnswered && selectedOpt === q.answer;
                  const optionsList = Array.isArray(q.options) ? q.options : [];

                  return (
                    <div 
                      key={q.id || idx}
                      className={`rounded-2xl border p-5 transition-all backdrop-blur-md ${
                        testSubmitted && isAnswered 
                          ? isCorrect 
                            ? 'border-emerald-500/40 bg-emerald-950/15' 
                            : 'border-rose-500/40 bg-rose-950/15'
                          : 'border-white/[0.07] bg-slate-900/60'
                      }`}
                    >
                      <h3 className="text-sm sm:text-base font-bold text-slate-100 mb-3.5 leading-snug">
                        {idx + 1}. <MarkdownRenderer content={q.question} />
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {optionsList.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const isTargetAnswer = q.answer === optIdx;
                          
                          let btnStyle = 'bg-slate-950/50 border-slate-800 text-slate-300';
                          if (testSubmitted) {
                            if (isTargetAnswer) btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-bold';
                            else if (isSelected && !isTargetAnswer) btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-200 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={testSubmitted}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${btnStyle}`}
                            >
                              <MarkdownRenderer content={opt} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Feedback Modal for reporting errors ────────────────────────────── */}
      {feedbackModalOpen && reportingQuestion && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setReportingQuestion(null);
          }}
          questionId={reportingQuestion.id}
          questionType="admission_mcq"
          chapterId={chapter.id}
          subjectId={subject.id}
          questionData={reportingQuestion}
        />
      )}
    </div>
  );
}
