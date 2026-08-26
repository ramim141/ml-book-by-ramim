import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Dna, FlaskConical, Zap, BookOpen, Globe, 
  Target, Clock, Award, ShieldAlert, Sparkles, CheckCircle2, 
  ChevronRight, Play, BookMarked, Layers, HelpCircle, FileText,
  Search, Bookmark, RotateCcw, Check, XCircle, Highlighter,
  SlidersHorizontal, Flame, Lightbulb, Compass, Filter,
  ChevronDown, BookCheck, ArrowUpRight, GraduationCap, CheckCheck,
  ChevronLeft, LayoutDashboard, ListFilter, CheckSquare,
  PanelLeftClose, PanelLeftOpen, Eye, EyeOff, Database, ChevronRight as ChevronIcon,
  Library, Flag
} from 'lucide-react';
import { MEDICAL_SUBJECTS_DETAILED, MEDICAL_MNEMONICS } from '../../../../data/academic/medicalConfig';
import { useMedicalConfig, useAdmissionShortcuts } from '../../../../hooks/useAdmissionData';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import MarkdownRenderer from '../../../../components/UI/MarkdownRenderer';
import { SkeletonQuestionCard } from '../../../../components/UI/Skeleton';
import FeedbackModal from '../../../../components/Academic/FeedbackModal';
import { getMainBookWriterName } from '../../../../utils/academicWriterResolver';
import toast from 'react-hot-toast';

export default function MedicalSubjectHome() {
  const { subjectSlug } = useParams();
  const navigate = useNavigate();
  const { data: dynamicMedicalSubjects = MEDICAL_SUBJECTS_DETAILED } = useMedicalConfig();
  const { data: allShortcuts = [] } = useAdmissionShortcuts();

  const subject = useMemo(() => {
    return dynamicMedicalSubjects.find(
      s => s.id.toLowerCase() === (subjectSlug || '').toLowerCase()
    );
  }, [dynamicMedicalSubjects, subjectSlug]);

  // Distinct papers in this subject
  const availablePapers = useMemo(() => {
    if (!subject?.chapters) return [];
    const list = [];
    const seen = new Set();
    subject.chapters.forEach(c => {
      const p = c.paper || 'সাধারণ';
      if (!seen.has(p)) {
        seen.add(p);
        list.push(p);
      }
    });
    return list;
  }, [subject]);

  // Active Paper (defaults to 1st paper if available)
  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [activeContentTab, setActiveContentTab] = useState('mcq'); // 'mcq' | 'main_book_mcq' | 'lines' | 'mnemonics'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Set default paper when subject loads
  useEffect(() => {
    if (availablePapers.length > 0 && (!selectedPaper || !availablePapers.includes(selectedPaper))) {
      setSelectedPaper(availablePapers[0]);
    }
  }, [availablePapers, selectedPaper]);

  // MCQ Practice State
  const [userAnswers, setUserAnswers] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [searchTopicQuery, setSearchTopicQuery] = useState('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedChapterId, selectedPaper, activeContentTab, searchTopicQuery]);

  const handleOpenFeedback = (q) => {
    setReportingQuestion(q);
    setFeedbackModalOpen(true);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [subjectSlug]);

  // Fetch subject questions from Firestore question_bank
  const { data: allSubjectQuestions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['medical_subject_questions', subject?.id],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'question_bank'));
        if (!snap.empty) {
          const allDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return allDocs.filter(q => {
            const subStr = (q.subject || '').toLowerCase();
            const targetSub = (subject?.id || '').toLowerCase();
            const targetName = (subject?.name || '').toLowerCase();

            const matchSub = subStr === targetSub ||
              subStr.includes(targetSub) ||
              targetName.includes(subStr) ||
              (targetSub === 'biology' && (subStr.includes('bio') || subStr.includes('bot') || subStr.includes('zoo')));
            
            return matchSub;
          });
        }
      } catch (err) {
        console.warn('Firestore question_bank fetch failed:', err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!subject?.id
  });

  // Chapters of the selected paper
  const currentPaperChapters = useMemo(() => {
    if (!subject?.chapters) return [];
    if (!selectedPaper) return subject.chapters;
    return subject.chapters.filter(c => c.paper === selectedPaper);
  }, [subject, selectedPaper]);

  // Auto-sync selected chapter when paper changes
  useEffect(() => {
    if (currentPaperChapters.length > 0) {
      const exists = currentPaperChapters.some(c => c.id === selectedChapterId);
      if (!exists) {
        setSelectedChapterId(currentPaperChapters[0].id);
      }
    }
  }, [currentPaperChapters, selectedChapterId]);

  // Active Chapter Object
  const currentChapter = useMemo(() => {
    return currentPaperChapters.find(c => c.id === selectedChapterId) || currentPaperChapters[0] || null;
  }, [currentPaperChapters, selectedChapterId]);

  // Live Firestore Question Matcher for a Chapter
  const getLiveChapterQuestions = (chapterObj) => {
    if (!chapterObj) return [];
    const cId = (chapterObj.id || '').toLowerCase();
    const cName = (chapterObj.name || '').toLowerCase();
    const cleanTitle = cName.split(':')[1]?.trim().toLowerCase() || cName;

    return allSubjectQuestions.filter(q => {
      const qChapterId = (q.chapterId || '').toLowerCase();
      const qChapter = (q.chapter || '').toLowerCase();
      const qTopic = (q.topic || '').toLowerCase();

      return (
        qChapterId === cId ||
        qChapter === cName ||
        qChapter.includes(cleanTitle) ||
        qTopic.includes(cleanTitle)
      );
    });
  };

  // Helper to check if question belongs to Main Book Exercise
  const isQuestionMainBook = (q) => {
    if (q.isMainBook || q.category === 'main_book' || q.source === 'main_book') return true;
    const typeStr = (q.examType || '').toLowerCase();
    if (typeStr.includes('main book') || typeStr.includes('বই') || typeStr.includes('অনুশীলনী')) return true;
    
    return q.examTags?.some(t => {
      const tagType = (t.type || t.name || '').toLowerCase();
      return tagType.includes('book') || tagType.includes('বই') || tagType.includes('অনুশীলনী') ||
        tagType.includes('হাসান') || tagType.includes('আজমল') || tagType.includes('হাজারী') || tagType.includes('ইসহাক');
    });
  };

  // All matching questions for active chapter (with search filter)
  const baseChapterQuestions = useMemo(() => {
    if (!currentChapter) return [];
    const baseMatched = getLiveChapterQuestions(currentChapter);
    
    if (!searchTopicQuery.trim()) {
      return baseMatched;
    }

    const query = searchTopicQuery.toLowerCase();
    return baseMatched.filter(q => 
      (q.question || '').toLowerCase().includes(query) ||
      (q.topic || '').toLowerCase().includes(query) ||
      (q.explanation || '').toLowerCase().includes(query)
    );
  }, [allSubjectQuestions, currentChapter, searchTopicQuery]);

  // 1. Admission MCQ (MAT, DAT, DU A, GST etc.)
  const admissionQuestions = useMemo(() => {
    return baseChapterQuestions.filter(q => !isQuestionMainBook(q));
  }, [baseChapterQuestions]);

  // 2. Main Book MCQ (Textbook practice questions)
  const mainBookQuestions = useMemo(() => {
    return baseChapterQuestions.filter(q => isQuestionMainBook(q));
  }, [baseChapterQuestions]);

  // Questions to display based on active tab
  const displayedQuestions = useMemo(() => {
    if (activeContentTab === 'main_book_mcq') return mainBookQuestions;
    return admissionQuestions.length > 0 ? admissionQuestions : baseChapterQuestions;
  }, [activeContentTab, mainBookQuestions, admissionQuestions, baseChapterQuestions]);

  // Mnemonics related to this chapter/subject
  const chapterMnemonics = useMemo(() => {
    const medShortcuts = allShortcuts.filter(s => s.track === 'medical');
    const sourceList = medShortcuts.length ? medShortcuts : MEDICAL_MNEMONICS;
    return sourceList.filter(m => {
      const matchSub = (m.subject || '').toLowerCase().includes(subject?.name?.toLowerCase().split(' ')[0] || '') ||
        (m.subject || '').toLowerCase().includes(subject?.id?.toLowerCase() || '');
      const matchChap = !currentChapter || 
        (m.chapter || '').toLowerCase().includes(currentChapter.name?.toLowerCase() || '') ||
        (m.topic || '').toLowerCase().includes(currentChapter.name?.toLowerCase() || '');
      return matchSub && matchChap;
    });
  }, [allShortcuts, subject, currentChapter]);

  // সব hook কল হওয়ার পরেই early return — নইলে subject async ভাবে বদলালে
  // (অ্যাডমিন প্যানেল থেকে medical config এডিট করলে) রেন্ডারে hook সংখ্যা
  // বদলে যেত এবং React "Rendered more hooks than during the previous render" এ ক্র্যাশ করত
  if (!subject) {
    return <Navigate to="/academic/admission/medical" replace />;
  }

  const handleSelectOption = (qId, optionIdx) => {
    if (userAnswers[qId] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
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

  const getSubjectIcon = (iconName) => {
    switch (iconName) {
      case 'Dna': return Dna;
      case 'FlaskConical': return FlaskConical;
      case 'Zap': return Zap;
      case 'BookOpen': return BookOpen;
      case 'Globe': return Globe;
      default: return BookOpen;
    }
  };

  const Icon = getSubjectIcon(subject.icon);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-bangla selection:bg-rose-500/30 pb-20">
      
      {/* ── 1. UNIFIED SLIM TOP BAR ────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#0c1220]/95 backdrop-blur-md border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Left: Breadcrumbs & Subject Title */}
            <div className="flex items-center gap-3">
              <Link 
                to="/academic/admission/medical" 
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700/60 shrink-0"
                title="মেডিকেল ড্যাশবোর্ডে ফিরে যান"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${subject.color} text-white shadow-sm shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-black text-white">{subject.name}</h1>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {subject.marks} নম্বর
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {subject.recommendedBooks?.join(' ও ') || 'মূল পাঠ্যবই'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Paper Selector Pills & Speed Test */}
            <div className="flex items-center gap-2.5 flex-wrap">
              
              {/* Paper Selection Pills */}
              {availablePapers.length > 0 && (
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {availablePapers.map((p) => {
                    const isSelected = selectedPaper === p;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setSelectedPaper(p);
                          setUserAnswers({});
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-rose-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        <span>{p}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Special Exam Button */}
              <Link
                to={`/academic/admission/medical/exam/MBBS/2023-2024?mode=practice&count=20&subjects=${subject.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>স্পেশাল টেস্ট</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── 2. MAIN 2-COLUMN WORKSPACE ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT SIDEBAR (STICKY FILTER & CHAPTER SELECTOR) ────────────── */}
          {isSidebarOpen ? (
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
              
              {/* Filter Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
                
                {/* Header with Minimize Toggle */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Filter className="w-3.5 h-3.5 text-rose-400" />
                    <span>ফিল্টার ও অধ্যায়</span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                    title="ফিল্টার সাইডবার লুকান"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>

                {/* 1. Paper Dropdown */}
                {availablePapers.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">পত্র নির্বাচন:</label>
                    <div className="relative">
                      <select
                        value={selectedPaper}
                        onChange={(e) => {
                          setSelectedPaper(e.target.value);
                          setUserAnswers({});
                        }}
                        className="w-full appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500 transition cursor-pointer"
                      >
                        {availablePapers.map((p) => (
                          <option key={p} value={p} className="bg-slate-900 text-slate-100">
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* 2. Chapter Dropdown */}
                {currentPaperChapters.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400">অধ্যায় নির্বাচন:</label>
                    <div className="relative">
                      <select
                        value={selectedChapterId}
                        onChange={(e) => {
                          setSelectedChapterId(e.target.value);
                          setUserAnswers({});
                        }}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500 transition cursor-pointer"
                      >
                        {currentPaperChapters.map((ch, idx) => {
                          const liveQs = getLiveChapterQuestions(ch).length;
                          return (
                            <option key={ch.id || idx} value={ch.id} className="bg-slate-900 text-slate-100">
                              {idx + 1}. {ch.name} ({liveQs}টি প্রশ্ন)
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* 3. Content Type Selector Buttons */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">কন্টেন্ট ক্যাটাগরি:</label>
                  <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                    
                    {/* Tab 1: Admission Past Questions */}
                    <button
                      onClick={() => setActiveContentTab('mcq')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        activeContentTab === 'mcq'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> অধ্যায় প্রশ্নব্যাংক (MCQ)
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeContentTab === 'mcq' ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>
                        {admissionQuestions.length}
                      </span>
                    </button>

                    {/* Tab 2: Main Book MCQs (NEW FEATURE) */}
                    <button
                      onClick={() => setActiveContentTab('main_book_mcq')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        activeContentTab === 'main_book_mcq'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Library className="w-3.5 h-3.5 text-amber-400" /> মূল বইয়ের অনুশীলনী MCQ
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeContentTab === 'main_book_mcq' ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>
                        {mainBookQuestions.length}
                      </span>
                    </button>

                    {/* Tab 3: Highlighted Lines */}
                    <button
                      onClick={() => setActiveContentTab('lines')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        activeContentTab === 'lines'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Highlighter className="w-3.5 h-3.5" /> মূল বইয়ের দাগানো লাইন
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeContentTab === 'lines' ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>
                        {currentChapter?.keyFacts?.length || 0}
                      </span>
                    </button>

                    {/* Tab 4: Shortcuts / Mnemonics */}
                    <button
                      onClick={() => setActiveContentTab('mnemonics')}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                        activeContentTab === 'mnemonics'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> শর্টকাট ও ট্রিকস
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${activeContentTab === 'mnemonics' ? 'bg-white/20' : 'bg-slate-700 text-slate-400'}`}>
                        {chapterMnemonics.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4. Live Search Input */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-400">টপিক বা প্রশ্ন সার্চ:</label>
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTopicQuery}
                      onChange={(e) => setSearchTopicQuery(e.target.value)}
                      placeholder="কী-ওয়ার্ড দিয়ে খুঁজুন..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* Collapsed Sidebar Trigger */
            <div className="lg:col-span-1">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-rose-400 hover:bg-slate-800 transition shadow-lg flex items-center gap-2 text-xs font-bold"
                title="ফিল্টার সাইডবার খুলুন"
              >
                <PanelLeftOpen className="w-4 h-4" />
                <span className="hidden sm:inline">ফিল্টার</span>
              </button>
            </div>
          )}

          {/* ── RIGHT MAIN WORKSPACE (DIRECT CONTENT) ──────────────────────── */}
          <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-11'} space-y-4 min-w-0 transition-all duration-300`}>
            {currentChapter ? (
              <>
                {/* Clean Chapter Title Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/20">
                      {currentChapter.paper}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-white">
                      {currentChapter.name}
                    </h2>
                    {activeContentTab === 'main_book_mcq' && (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Library className="w-3 h-3" /> মূল বইয়ের অনুশীলনী
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSidebarOpen && (
                      <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
                      >
                        <PanelLeftOpen className="w-3.5 h-3.5" />
                        <span>ফিল্টার</span>
                      </button>
                    )}
                    <Link
                      to={`/academic/admission/medical/${subject.id}/${currentChapter.id}`}
                      className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>ফুল স্ক্রিন</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* ── TAB 1 & TAB 2: MCQS (ADMISSION OR MAIN BOOK) ─────────── */}
                {(activeContentTab === 'mcq' || activeContentTab === 'main_book_mcq') && (
                  <div className="space-y-4">
                    {isQuestionsLoading ? (
                      <SkeletonQuestionCard count={3} />
                    ) : displayedQuestions.length > 0 ? (
                      <div className="space-y-4">
                        {displayedQuestions.slice(0, visibleCount).map((q, idx) => {
                          const selectedOpt = userAnswers[q.id];
                          const isAnswered = selectedOpt !== undefined;
                          const isCorrect = isAnswered && selectedOpt === q.answer;
                          const isBookmarked = bookmarkedIds.has(q.id);
                          const isMainBookQ = isQuestionMainBook(q);

                          return (
                            <div 
                              key={q.id || idx}
                              className={`bg-slate-900/70 border rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                                isAnswered 
                                  ? isCorrect 
                                    ? 'border-emerald-500/40 bg-emerald-950/10' 
                                    : 'border-red-500/40 bg-red-950/10'
                                  : 'border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-black flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <div>
                                    <div className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                                      <MarkdownRenderer content={q.question} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {isMainBookQ ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                          <BookOpen className="w-3 h-3" />
                                          {getMainBookWriterName(q, subject, currentChapter)}
                                        </span>
                                      ) : q.examTags?.length > 0 ? (
                                        q.examTags.map((tag, tIdx) => (
                                          <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                            {tag.type || tag.name} {tag.session || tag.year}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[11px] font-bold text-rose-400">
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
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                    title="প্রশ্নে ভুল থাকলে রিপোর্ট করুন"
                                  >
                                    <Flag className="h-4 w-4" />
                                  </button>

                                  <button
                                    onClick={() => handleToggleBookmark(q.id)}
                                    className={`p-1.5 rounded-lg transition ${isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    title="বুকমার্ক করুন"
                                  >
                                    <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                                  </button>
                                </div>
                              </div>

                              {/* Options Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                {q.options?.map((opt, optIdx) => {
                                  const isSelected = selectedOpt === optIdx;
                                  const isTargetAnswer = q.answer === optIdx;
                                  
                                  let btnStyle = 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800';
                                  
                                  if (isAnswered) {
                                    if (isTargetAnswer) {
                                      btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold';
                                    } else if (isSelected && !isTargetAnswer) {
                                      btnStyle = 'bg-red-500/20 border-red-500/60 text-red-300 font-bold';
                                    }
                                  }

                                  const optLabels = ['ক', 'খ', 'গ', 'ঘ'];

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectOption(q.id, optIdx)}
                                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all ${btnStyle}`}
                                    >
                                      <span className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                        isAnswered && isTargetAnswer
                                          ? 'bg-emerald-500 text-white'
                                          : isAnswered && isSelected && !isTargetAnswer
                                            ? 'bg-red-500 text-white'
                                            : 'bg-slate-700 text-slate-300'
                                      }`}>
                                        {optLabels[optIdx]}
                                      </span>
                                      <div className="flex-grow min-w-0">
                                        <MarkdownRenderer content={opt} />
                                      </div>
                                      {isAnswered && isTargetAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                                      {isAnswered && isSelected && !isTargetAnswer && <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {isAnswered && q.explanation && (
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-xs text-slate-300 space-y-1">
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

                        {displayedQuestions.length > visibleCount && (
                          <button
                            type="button"
                            onClick={() => setVisibleCount((v) => v + 20)}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-rose-500/40 py-3.5 text-xs sm:text-sm font-bold text-slate-300 transition hover:text-rose-200 shadow-sm"
                          >
                            <ChevronDown className="h-4 w-4 text-rose-400" />
                            আরো ২০ টি প্রশ্ন দেখুন
                            <span className="text-slate-500 font-normal">({displayedQuestions.length - visibleCount} টি বাকি)</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
                        <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-300">
                          {activeContentTab === 'main_book_mcq' 
                            ? 'এই অধ্যায়ের কোনো মূল বইয়ের অনুশীলনী প্রশ্ন পাওয়া যায়নি' 
                            : 'এই অধ্যায়ের কোনো ভর্তি পরীক্ষার প্রশ্ন পাওয়া যায়নি'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {activeContentTab === 'main_book_mcq'
                            ? 'অ্যাডমিন প্যানেল থেকে "Main Book MCQ" হিসেবে প্রশ্ন আপলোড করুন।'
                            : 'অ্যাডমিন প্যানেল থেকে JSON ফাইলের মাধ্যমে এই অধ্যায়ের প্রশ্ন আপলোড করুন।'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 3: HIGHLIGHTED LINES ─────────────────────────────── */}
                {activeContentTab === 'lines' && (
                  <div className="space-y-3">
                    {currentChapter.keyFacts?.length > 0 ? (
                      currentChapter.keyFacts.map((fact, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 shadow-sm"
                        >
                          <span className="w-5 h-5 rounded-md bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {fIdx + 1}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-rose-400 block mb-0.5">
                              মূল বইয়ের দাগানো তথ্য
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed">{fact}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                        <Highlighter className="w-8 h-8 text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-300">দাগানো লাইন লোড হচ্ছে</h4>
                        <p className="text-xs text-slate-500">শীঘ্রই এই অধ্যায়ের দাগানো লাইন যুক্ত করা হবে।</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 4: MNEMONICS & SHORTCUTS ─────────────────────────── */}
                {activeContentTab === 'mnemonics' && (
                  <div className="space-y-4">
                    {chapterMnemonics.length > 0 ? (
                      chapterMnemonics.map((mnem, idx) => (
                        <div
                          key={mnem.id || idx}
                          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              {mnem.topic || currentChapter.name}
                            </span>
                            <span className="text-[11px] text-slate-400">{mnem.chapter || ''}</span>
                          </div>

                          <h4 className="font-bold text-white text-sm sm:text-base leading-snug">{mnem.title}</h4>

                          {mnem.mnemonic && (
                            <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 to-slate-900 border border-rose-500/30">
                              <span className="text-[10px] font-black text-rose-400 block mb-0.5">মনে রাখার ছন্দ:</span>
                              <p className="text-xs sm:text-sm font-bold text-rose-200 tracking-wide">{mnem.mnemonic}</p>
                            </div>
                          )}

                          <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                            <span className="font-bold text-slate-400 block mb-0.5">ব্যাখ্যা:</span>
                            <p>{mnem.explanation || mnem.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                        <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-300">এই অধ্যায়ের শর্টকাট পাওয়া যায়নি</h4>
                        <p className="text-xs text-slate-500">সকল বিষয়ের শর্টকাট দেখতে শর্টকাট হাব ভিজিট করুন।</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>

        </div>
      </div>

      {/* Question Error Feedback Modal */}
      {feedbackModalOpen && reportingQuestion && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setReportingQuestion(null);
          }}
          questionId={reportingQuestion.id}
          questionType="admission_mcq"
          chapterId={reportingQuestion.chapterId || currentChapter?.id}
          subjectId={subject.id}
          questionData={reportingQuestion}
        />
      )}

    </div>
  );
}
