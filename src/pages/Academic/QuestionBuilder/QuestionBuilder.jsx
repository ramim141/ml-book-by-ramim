import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { academicSubjects } from '../../../data/academic/subjectsConfig';
import PrintableView from './PrintableView.jsx';
import AnswerSheetView from './components/preview/AnswerSheetView.jsx';
import FilterSidebar from './components/filters/FilterSidebar.jsx';
import RightSidebar from './components/rightSidebar/RightSidebar.jsx';
import QuestionCard from './components/question/QuestionCard.jsx';
import ProfessionalQuestionCard from './components/question/ProfessionalQuestionCard.jsx';
import QuestionCardSkeleton from './components/question/QuestionCardSkeleton.jsx';
import QuestionLibraryEmpty from './components/question/QuestionLibraryEmpty.jsx';
import Toolbar from './components/toolbar/Toolbar.jsx';
import {
  Loader2, Settings, BookOpen, FileText, Trash2, Printer, Download,
  ArrowRight, Check, SlidersHorizontal, ChevronRight,
  BookOpenCheck, ChevronDown, HelpCircle,
  Circle, ChevronLeft, ShoppingCart, X, Sparkles, LayoutList,
  Plus, Search, Bell, SunMoon, UserCircle, Grid3X3, List, RefreshCw,
  Bookmark, MoreVertical, Image as ImageIcon, Eye,
} from 'lucide-react';
import {
  enToBn,
  cleanPrefix,
  MarkdownRenderer,
  PrintMarkdownRenderer,
} from "./helpers.jsx";


// Cart components live in ./components/cart
const BuilderHeader = React.memo(({ step, canPreview, setStep }) => {
  const steps = useMemo(() => [
    { num: 1, label: 'à¦¹à§‡à¦¡à¦¾à¦°', icon: Settings },
    { num: 2, label: 'à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨', icon: LayoutList },
    { num: 3, label: 'à¦ªà§à¦°à¦¿à¦­à¦¿à¦‰', icon: Printer },
    { num: 4, label: 'à¦‰à¦¤à§à¦¤à¦°à¦ªà¦¤à§à¦°', icon: Check },
  ], []);

  return (
    <header className="qb-header flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] xl:flex-row xl:items-center">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
          <BookOpenCheck className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          à¦¸à§à¦®à¦¾à¦°à§à¦Ÿ à¦ªà§à¦°à¦¶à§à¦¨à¦ªà¦¤à§à¦° à¦¨à¦¿à¦°à§à¦®à¦¾à¦¤à¦¾
        </h1>
      </div>
      <div className="flex w-full items-center justify-between gap-0.5 overflow-x-auto py-2 sm:justify-start sm:gap-1 xl:w-auto custom-scrollbar" aria-label="Question builder steps">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <button
              type="button"
              onClick={() => ((s.num !== 3 && s.num !== 4) || canPreview) ? setStep(s.num) : null}
              disabled={(s.num === 3 || s.num === 4) && !canPreview}
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-all duration-150 focus:outline-none sm:gap-1.5 sm:text-[13px] ${step === s.num ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30'
                }`}
            >
              <s.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
            {i < 3 && <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 sm:h-3.5 sm:w-3.5" />}
          </React.Fragment>
        ))}
      </div>
    </header>
  );
});

const HeaderIconButton = React.memo(({ label, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className="flex h-10 w-10 items-center justify-center rounded-[10px] text-slate-400 transition duration-150 hover:bg-white/10 hover:text-white focus:outline-none "
  >
    {children}
  </button>
));

const DashboardHeader = React.memo(() => (
  <header className="qb-header sticky top-0 z-40 -mx-5 flex h-[72px] shrink-0 items-center gap-4 bg-[#0f172a]/90 px-6 backdrop-blur-xl">
    <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-[0_0_300px]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 text-white">
        <BookOpenCheck className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-base font-extrabold tracking-tight text-slate-100 sm:text-lg">
          Smart Question Builder
        </h1>
        <p className="hidden truncate text-xs font-medium text-slate-400 lg:block">
          Professional Question Paper Generator
        </p>
      </div>
    </div>

    <div className="flex min-w-0 flex-[1.4] justify-center">
      <label className="relative hidden w-full max-w-[680px] sm:block">
        <span className="sr-only">Global search</span>
        <input
          type="search"
          placeholder="প্রশ্ন, অধ্যায়, টপিক অথবা বোর্ড অনুসন্ধান করুন..."
          className="h-11 w-full rounded-xl border border-slate-700/70 bg-slate-950/40 py-2.5 pl-4 pr-11 text-sm font-medium text-slate-100 transition duration-150 placeholder:text-slate-500 hover:border-indigo-400/50 hover:bg-slate-900/70 focus:bg-slate-900 focus:outline-none "
        />
        <Search className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      </label>
      <div className="sm:hidden">
        <HeaderIconButton label="Open global search">
          <Search className="h-5 w-5" />
        </HeaderIconButton>
      </div>
    </div>

    <div className="flex flex-1 items-center justify-end gap-1 md:flex-[0_0_210px]">
      <HeaderIconButton label="Notifications">
        <Bell className="h-5 w-5" />
      </HeaderIconButton>
      <HeaderIconButton label="Settings">
        <Settings className="h-5 w-5" />
      </HeaderIconButton>
      <HeaderIconButton label="Theme">
        <SunMoon className="h-5 w-5" />
      </HeaderIconButton>
      <HeaderIconButton label="User profile">
        <UserCircle className="h-5 w-5" />
      </HeaderIconButton>
    </div>
  </header>
));

const BuilderShell = React.memo(({ children }) => (
  <div className="qb-shell min-h-[calc(100vh-64px)] bg-[#0b0f19] pb-8 text-slate-200 selection:bg-indigo-500/35">
    <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-purple-900/10" />
    <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8 py-5">
      {children}
    </div>
  </div>
));

const ContentPanel = React.memo(({ children }) => (
  <main className="qb-content-panel flex min-w-0 flex-1 flex-col bg-transparent">
    {children}
  </main>
));

// ── CategoryTab ───────────────────────────────────────────────────────
const CategoryTab = ({ active, onClick, label, count }) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-center gap-1.5 rounded-full px-2 py-2 sm:py-2.5 text-[11px] sm:text-[13px] font-extrabold transition-all duration-300 ${active
        ? 'bg-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
      }`}
  >
    <span className="truncate">{label}</span>
    <span className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black shrink-0 transition-colors ${active ? 'bg-white/25 text-white' : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-700/80 group-hover:text-slate-200'
      }`}>
      {count}
    </span>
  </button>
);

// ── EmptyState ────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, hint, spinning }) => (
  <div className="flex flex-col items-center justify-center px-4 py-20 text-center text-slate-500">
    <div className="p-4 mb-4 border rounded-2xl bg-slate-900/60 border-slate-800">
      <Icon className={`w-10 h-10 ${spinning ? 'animate-spin text-indigo-500' : 'text-slate-600'}`} />
    </div>
    <p className="text-sm font-bold text-slate-400">{title}</p>
    {hint && <p className="text-xs text-slate-600 mt-1.5 max-w-xs">{hint}</p>}
  </div>
);

// ── FieldShell ────────────────────────────────────────────────────────
const FieldShell = ({ label, full, children }) => (
  <div className={full ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
    <label className="block pl-1 text-xs font-bold tracking-widest uppercase text-slate-400">{label}</label>
    {children}
  </div>
);

export default function QuestionBuilder() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [headerInfo, setHeaderInfo] = useState({
    schoolName: '',
    examName: '',
    subject: 'পদার্থবিজ্ঞান',
    time: '২ ঘন্টা ৩০ মিনিট',
    totalMarks: '১০০',
    subjectCode: '১৭৪',
  });

  const [selectedLevel, setSelectedLevel] = useState('hsc');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [expandedCQs, setExpandedCQs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const deferredQuestions = useDeferredValue(allQuestions);

  // ── derived: active subject config ─────────────────────────────────
  const activeSubjectConfig = useMemo(
    () => (academicSubjects[selectedLevel] || []).find((s) => s.id === selectedSubjectId) || null,
    [selectedLevel, selectedSubjectId]
  );

  // ── effect: reset when subject changes ────────────────────────────
  useEffect(() => {
    if (activeSubjectConfig) {
      setChapters(activeSubjectConfig.chapters || []);
      setHeaderInfo((prev) => ({ ...prev, subject: activeSubjectConfig.name.split(' (')[0] }));
    } else {
      setChapters([]);
    }
    setSelectedChapters([]);
    setSelectedTopics([]);
    setSelectedType('all');
    setAllQuestions([]);
    setSearchQuery('');
  }, [activeSubjectConfig]);

  // ── effect: load JSON questions dynamically ───────────────────────
  useEffect(() => {
    let isMounted = true;
    if (!activeSubjectConfig || selectedChapters.length === 0) {
      setAllQuestions([]);
      return;
    }
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          selectedChapters.map(async (chapterId) => {
            const match = chapterId.match(/chapter-?(\d+)/i);
            if (!match) return [];
            const num = parseInt(match[1]);
            const padded = num < 10 ? `0${num}` : `${num}`;
            const chapterName = chapters.find((c) => c.id === chapterId)?.title || `অধ্যায় ${num}`;

            const findKey = (obj, n, p) =>
              obj ? Object.keys(obj).find((k) => k.includes(`chapter_${p}_`) || k.includes(`chapter_${n}_`)) : undefined;

            const cqKey = findKey(activeSubjectConfig.cqs, num, padded);
            const mcqKey = findKey(activeSubjectConfig.mcqs, num, padded);
            const kKey = findKey(activeSubjectConfig.kQs, num, padded);

            const [cqData, mcqData, kData] = await Promise.all([
              cqKey ? activeSubjectConfig.cqs[cqKey]() : null,
              mcqKey ? activeSubjectConfig.mcqs[mcqKey]() : null,
              kKey ? activeSubjectConfig.kQs[kKey]() : null,
            ]);

            const cqs = (cqData?.default || cqData || []).map((q) => ({
              ...q, uniqueId: `cq-${chapterId}-${q.id}`, type: 'cq', chapterId, chapterName,
            }));
            const mcqs = (mcqData?.default || mcqData || []).map((q) => ({
              ...q, uniqueId: `mcq-${chapterId}-${q.id}`, type: 'mcq', chapterId, chapterName,
            }));
            const kQs = (kData?.default || kData || []).map((q) => {
              const t = q.type === 'k' ? 'k' : 'kh';
              return { ...q, uniqueId: `${t}-${chapterId}-${q.id}`, type: t, chapterId, chapterName };
            });

            return [...cqs, ...mcqs, ...kQs];
          })
        );
        if (isMounted) setAllQuestions(results.flat());
      } catch (err) {
        console.error('Error loading questions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadQuestions();
    return () => { isMounted = false; };
  }, [selectedChapters, activeSubjectConfig, chapters]);

  // ── derived: topics ───────────────────────────────────────────────
  const availableTopics = useMemo(() => {
    const set = new Set();
    deferredQuestions.forEach((q) => { if (q.topic) set.add(q.topic.trim()); });
    return Array.from(set).map((t) => ({ id: t, name: t }));
  }, [deferredQuestions]);

  useEffect(() => {
    setSelectedTopics((prev) => prev.filter((t) => availableTopics.some((at) => at.id === t)));
  }, [availableTopics]);

  // ── derived: filtered questions ───────────────────────────────────
  const filteredQuestions = useMemo(() => {
    let qs = deferredQuestions;
    if (selectedTopics.length > 0) qs = qs.filter((q) => q.topic && selectedTopics.includes(q.topic.trim()));
    if (selectedType === 'cq') qs = qs.filter((q) => q.type === 'cq');
    else if (selectedType === 'mcq') qs = qs.filter((q) => q.type === 'mcq');
    else if (selectedType === 'k_kh') qs = qs.filter((q) => q.type === 'k' || q.type === 'kh');
    const term = searchQuery.trim().toLowerCase();
    if (term) {
      qs = qs.filter((q) => [
        q.title,
        q.question,
        q.stem,
        q.chapterName,
        q.topic,
        q.type,
        q.boards?.map((board) => `${board.name || ''} ${board.year || ''}`).join(' '),
        q.institutions?.map((institution) => `${institution.name || ''} ${institution.year || ''}`).join(' '),
      ].filter(Boolean).join(' ').toLowerCase().includes(term));
    }
    setVisibleCount(10);
    return qs;
  }, [deferredQuestions, selectedTopics, selectedType, searchQuery]);

  const questionCounts = useMemo(() => allQuestions.reduce((a, q) => {
    a.all += 1;
    if (q.type === 'cq') a.cq += 1;
    if (q.type === 'mcq') a.mcq += 1;
    if (q.type === 'k' || q.type === 'kh') a.kKh += 1;
    return a;
  }, { all: 0, cq: 0, mcq: 0, kKh: 0 }), [allQuestions]);

  const cartCounts = useMemo(() => cart.reduce((a, q) => {
    if (q.type === 'cq') a.cq += 1;
    if (q.type === 'mcq') a.mcq += 1;
    if (q.type === 'k' || q.type === 'kh') a.kKh += 1;
    return a;
  }, { cq: 0, mcq: 0, kKh: 0 }), [cart]);

  const cartIdSet = useMemo(() => new Set(cart.map((q) => q.uniqueId)), [cart]);
  const isQuestionLibraryFiltered = selectedChapters.length > 0 || selectedTopics.length > 0 || selectedType !== 'all' || searchQuery.trim();
  const questionLibrarySummary = useMemo(() => {
    const subjectName = activeSubjectConfig?.name?.split(' (')[0];
    const selectedChapterLabels = selectedChapters
      .map((id) => chapters.find((chapter) => chapter.id === id)?.title)
      .filter(Boolean);
    const typeLabel = selectedType === 'all'
      ? null
      : selectedType === 'k_kh'
        ? 'জ্ঞান/অনু.'
        : selectedType.toUpperCase();
    return [
      subjectName,
      selectedChapterLabels.length > 1 ? `${enToBn(selectedChapterLabels.length)} অধ্যায়` : selectedChapterLabels[0],
      selectedTopics.length > 1 ? `${enToBn(selectedTopics.length)} টপিক` : selectedTopics[0],
      typeLabel,
      searchQuery.trim() ? `সার্চ: ${searchQuery.trim()}` : null,
    ].filter(Boolean);
  }, [activeSubjectConfig, chapters, selectedChapters, selectedTopics, selectedType, searchQuery]);

  // ── callbacks ─────────────────────────────────────────────────────
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderInfo((prev) => ({ ...prev, [name]: value }));
  };
  const addToCart = useCallback((q) => setCart((prev) => prev.some((x) => x.uniqueId === q.uniqueId) ? prev : [...prev, q]), []);
  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((q) => q.uniqueId !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleChapter = (id) => setSelectedChapters((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleTopic = (id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const availableSubjects = academicSubjects[selectedLevel] || [];
  const canPreview = cart.length > 0;
  const rightSidebarCounts = useMemo(() => cart.reduce((acc, q) => {
    acc.total += 1;
    if (q.type === 'mcq') acc.mcq += 1;
    else if (q.type === 'cq') acc.cq += 1;
    else if (q.type === 'k') acc.k += 1;
    else if (q.type === 'kh') acc.kh += 1;
    else if (q.type === 'short') acc.short += 1;
    return acc;
  }, { total: 0, mcq: 0, cq: 0, k: 0, kh: 0, short: 0 }), [cart]);
  const rightSidebarStats = useMemo(() => {
    const markByType = { mcq: 1, k: 1, kh: 2, cq: 10, short: 2 };
    const difficultyScore = { easy: 1, medium: 2, hard: 3 };
    const chaptersSet = new Set();
    const topicsSet = new Set();
    let estimatedMarks = 0;
    let difficultyTotal = 0;
    let difficultyCount = 0;

    cart.forEach((q) => {
      estimatedMarks += Number(q.marks || q.mark || markByType[q.type] || 1);
      if (q.chapterId || q.chapterName) chaptersSet.add(q.chapterId || q.chapterName);
      if (q.topic) topicsSet.add(q.topic);
      const difficultyKey = String(q.difficulty || '').toLowerCase();
      if (difficultyScore[difficultyKey]) {
        difficultyTotal += difficultyScore[difficultyKey];
        difficultyCount += 1;
      }
    });

    const averageScore = difficultyCount ? Math.round(difficultyTotal / difficultyCount) : 0;
    const averageDifficulty = averageScore === 1 ? 'Easy' : averageScore === 2 ? 'Medium' : averageScore === 3 ? 'Hard' : 'Mixed';

    return {
      totalQuestions: cart.length,
      estimatedMarks,
      averageDifficulty,
      uniqueChapters: chaptersSet.size,
      uniqueTopics: topicsSet.size,
    };
  }, [cart]);

  const handleDownloadPdf = useCallback(async () => {
    const content = step === 3
      ? document.querySelector('#pdf-content .printable-paper')
      : document.querySelector('#pdf-content > div');

    if (!content || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    try {
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      content.classList.add('pdf-export-mode');
      const subject = (headerInfo.subject || 'question-paper')
        .trim()
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, '-');

      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          filename: `${subject || 'question-paper'}-${step === 4 ? 'answer-sheet' : 'questions'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
          },
          pagebreak: {
            mode: ['css', 'legacy'],
            avoid: ['.mcq-item', '.question-row', '.sub-question-row'],
          },
        })
        .from(content)
        .save();
    } finally {
      content.classList.remove('pdf-export-mode');
      setIsDownloadingPdf(false);
    }
  }, [headerInfo.subject, isDownloadingPdf, step]);

  // ── Step 3: Print Preview ─────────────────────────────────────────
  if (step === 3 || step === 4) {
    return (
      <div className="relative z-50 min-h-screen bg-slate-100">
        {/* Hide Navbar and Footer in Print Preview Mode */}
        <style>{`
          nav, footer { display: none !important; }
          body { background-color: #f1f5f9 !important; }
          @media print {
            @page { margin: 0; }
            body, html, #root { margin: 0; background-color: white !important; }
            /* Force the dark layout background to be white during print to prevent black bars */
            .bg-\\[\\#0b0f19\\] { background-color: white !important; }
            .bg-\\[\\#020617\\] { background-color: white !important; }
          }
          .mcq-columns {
            column-count: 2;
            column-gap: 32px;
            column-rule: 1px solid #ccc;
          }
        `}</style>

        {/* PDF Viewer Header */}
        <div className="sticky top-0 z-40 w-full border-b shadow-sm print:hidden border-slate-300/80 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between max-w-5xl px-4 py-3 mx-auto sm:px-6 lg:px-8">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold transition rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ChevronLeft className="w-4 h-4" /> এডিটে ফিরে যান
            </button>
            <div className="flex items-center hidden gap-2 sm:flex">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold tracking-widest uppercase text-slate-800">PDF Preview {step === 4 ? '(Answer Sheet)' : ''}</span>
            </div>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Download className="w-4 h-4" /> {isDownloadingPdf ? 'তৈরি হচ্ছে...' : 'PDF ডাউনলোড'}
            </button>
          </div>
          {/* Edit Hint Banner */}
          {step === 3 && (
            <div className="px-4 py-2 text-center border-t bg-indigo-50/80 border-indigo-100/50 print:hidden">
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-700">
                <span className="animate-pulse">💡</span> <strong>টিপস:</strong> আপনি চাইলে প্রিভিউয়ের যেকোনো জায়গায় ক্লিক করে লেখাগুলো নিজের মতো এডিট করতে পারবেন!
              </p>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-8 print:p-0" id="pdf-content">
          {step === 3 ? (
            <PrintableView headerInfo={headerInfo} cart={cart} onDownloadPdf={handleDownloadPdf} />
          ) : (
            <AnswerSheetView headerInfo={headerInfo} cart={cart} />
          )}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <BuilderShell>
        <style dangerouslySetInnerHTML={{
          __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
          @keyframes fade-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
          .qb-header, .qb-dashboard, .qb-content-panel { animation: fade-up 200ms ease-out; }
          .qb-dashboard { display: grid; grid-template-columns: 260px minmax(0, 1fr) 280px; gap: 24px; align-items: start; transition: grid-template-columns 0.3s ease; }
          .qb-dashboard.qb-sidebar-minimized { grid-template-columns: 56px minmax(0, 1fr) 280px; }
          .qb-sidebar-desktop, .qb-right-sidebar-desktop { display: flex; height: calc(100vh - 110px); position: sticky; top: 90px; }
          .qb-sidebar-collapsed { display: flex; height: auto; position: sticky; top: 90px; z-index: 20; }
          .qb-content-head { position: sticky; top: 0; z-index: 10; background: rgba(15, 23, 42, 0.95); }
          .qb-content-panel .group { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background-color 200ms ease; }
          .qb-content-panel .group:hover { transform: scale(1.01); }
          .qb-tablet-toggle { display: none; }
          button { transition-duration: 150ms; }
          button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }
          @media (max-width: 1199px) {
            .qb-dashboard { grid-template-columns: minmax(0, 1fr) 320px; }
            .qb-sidebar-desktop, .qb-sidebar-collapsed { display: none; }
            .qb-tablet-toggle { display: inline-flex; }
          }
          @media (max-width: 991px) {
            .qb-dashboard { grid-template-columns: minmax(0, 1fr); padding-bottom: 78px; }
            .qb-right-sidebar-desktop { display: none; }
          }
          @media (max-width: 767px) {
            .qb-shell > div { padding: 12px; gap: 12px; }
            .qb-header { margin-left: -12px; margin-right: -12px; padding-left: 12px; padding-right: 12px; }
            .qb-content-panel { border-radius: 16px; }
            .qb-dashboard { gap: 12px; padding-bottom: 84px; }
          }
        `}} />

        <div className="qb-header flex flex-col gap-3 px-2 py-4 sm:flex-row sm:items-end sm:justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <BookOpenCheck className="h-4 w-4" />
              প্রশ্নপত্র তৈরি
            </div>
            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-100 sm:text-2xl">প্রশ্ন নির্বাচন করুন</h1>
            <p className="mt-1 text-sm font-medium text-slate-400">JSON ডেটা থেকে বিষয়, অধ্যায় ও প্রশ্নের ধরন বেছে প্রশ্নপত্র তৈরি করুন।</p>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {[
              { num: 1, label: 'তথ্য', icon: Settings },
              { num: 2, label: 'প্রশ্ন', icon: LayoutList },
              { num: 3, label: 'প্রিভিউ', icon: Printer },
              { num: 4, label: 'উত্তর', icon: Check },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => ((s.num !== 3 && s.num !== 4) || canPreview) ? setStep(s.num) : null}
                disabled={(s.num === 3 || s.num === 4) && !canPreview}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${step === s.num
                    ? 'bg-indigo-500/15 text-indigo-200'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                  }`}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`qb-dashboard ${isSidebarCollapsed ? 'qb-sidebar-minimized' : ''}`}>
          <FilterSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
            isMobileOpen={mobileFilterOpen}
            onMobileClose={() => setMobileFilterOpen(false)}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            availableSubjects={availableSubjects}
            activeSubjectConfig={activeSubjectConfig}
            chapters={chapters}
            selectedChapters={selectedChapters}
            toggleChapter={toggleChapter}
            availableTopics={availableTopics}
            selectedTopics={selectedTopics}
            toggleTopic={toggleTopic}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />

          <ContentPanel>
            <div className="qb-content-scroll flex-1 px-5 py-5 custom-scrollbar">
              <Toolbar
                total={filteredQuestions.length}
                isFiltered={isQuestionLibraryFiltered}
                filterSummary={questionLibrarySummary}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchLoading={false}
              />
              {selectedChapters.length > 0 && (
                <div className="mb-5 grid grid-cols-4 gap-1 rounded-full bg-[#0f172a] p-1.5">
                  <CategoryTab active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="সব" count={questionCounts.all} />
                  <CategoryTab active={selectedType === 'cq'} onClick={() => setSelectedType('cq')} label="সৃজনশীল" count={questionCounts.cq} />
                  <CategoryTab active={selectedType === 'mcq'} onClick={() => setSelectedType('mcq')} label="MCQ" count={questionCounts.mcq} />
                  <CategoryTab active={selectedType === 'k_kh'} onClick={() => setSelectedType('k_kh')} label="জ্ঞান/অনু." count={questionCounts.kKh} />
                </div>
              )}

              <div className="space-y-4">
                {loading && Array.from({ length: 5 }, (_, index) => <QuestionCardSkeleton key={index} />)}
                {!loading && (!selectedSubjectId || selectedChapters.length === 0 || filteredQuestions.length === 0) && <QuestionLibraryEmpty />}
                {!loading && filteredQuestions.slice(0, visibleCount).map((q, qi) => (
                  <ProfessionalQuestionCard key={q.uniqueId} q={q} qIndex={qi} isAdded={cartIdSet.has(q.uniqueId)} onAdd={addToCart} onRemove={removeFromCart} />
                ))}
                {!loading && filteredQuestions.length > visibleCount && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 10)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 py-3.5 text-[13px] font-extrabold text-slate-400 transition-all duration-150 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-200 focus:outline-none "
                  >
                    <ChevronDown className="w-4 h-4" />
                    আরো দেখান ({enToBn(filteredQuestions.length - visibleCount)} টি বাকি)
                  </button>
                )}
              </div>
            </div>
            {false && (
              <div>
                <div className="qb-content-head flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileFilterOpen(true)}
                      className="qb-tablet-toggle rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600 transition hover:bg-indigo-100 active:scale-95 focus:outline-none "
                      aria-label="Open filters"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <div className="hidden rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600 sm:flex">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 className="truncate text-sm font-extrabold text-slate-900 sm:text-base">à¦ªà§à¦°à¦¶à§à¦¨à¦¬à§à¦¯à¦¾à¦‚à¦•</h2>
                    {filteredQuestions.length > 0 && (
                      <span className="whitespace-nowrap rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
                        {filteredQuestions.length} à¦Ÿà¦¿ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦—à§‡à¦›à§‡
                      </span>
                    )}
                  </div>
                </div>

                <div className="qb-content-scroll flex-1 px-5 py-5 custom-scrollbar">
                  {selectedChapters.length > 0 && (
                    <div className="mb-5 grid grid-cols-4 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 shadow-inner">
                      <CategoryTab active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="সব" count={questionCounts.all} />
                      <CategoryTab active={selectedType === 'cq'} onClick={() => setSelectedType('cq')} label="সৃজনশীল" count={questionCounts.cq} />
                      <CategoryTab active={selectedType === 'mcq'} onClick={() => setSelectedType('mcq')} label="MCQ" count={questionCounts.mcq} />
                      <CategoryTab active={selectedType === 'k_kh'} onClick={() => setSelectedType('k_kh')} label="জ্ঞান/অনু." count={questionCounts.kKh} />
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    {loading && <EmptyState icon={Loader2} title="à¦ªà§à¦°à¦¶à§à¦¨à¦¸à¦®à§‚à¦¹ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡..." spinning />}
                    {!loading && !selectedSubjectId && <EmptyState icon={BookOpen} title="à¦¬à¦¿à¦·à¦¯à¦¼ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨" hint="à¦¬à¦¾à¦® à¦ªà¦¾à¦¶à§‡à¦° à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦¥à§‡à¦•à§‡ à¦à¦•à¦Ÿà¦¿ à¦¬à¦¿à¦·à¦¯à¦¼ à¦“ à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />}
                    {!loading && selectedSubjectId && selectedChapters.length === 0 && <EmptyState icon={SlidersHorizontal} title="à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨" hint="à¦¬à¦¾à¦® à¦ªà¦¾à¦¶ à¦¥à§‡à¦•à§‡ à¦à¦•à¦Ÿà¦¿ à¦¬à¦¾ à¦à¦•à¦¾à¦§à¦¿à¦• à¦…à¦§à§à¦¯à¦¾à¦¯à¦¼ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨à¥¤" />}
                    {!loading && selectedChapters.length > 0 && filteredQuestions.length === 0 && <EmptyState icon={HelpCircle} title="à¦à¦‡ à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦°à§‡ à¦•à§‹à¦¨à§‹ à¦ªà§à¦°à¦¶à§à¦¨ à¦ªà¦¾à¦“à¦¯à¦¼à¦¾ à¦¯à¦¾à¦¯à¦¼à¦¨à¦¿" hint="à¦«à¦¿à¦²à§à¦Ÿà¦¾à¦° à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à¦°à§‡ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨à¥¤" />}
                    {!loading && filteredQuestions.slice(0, visibleCount).map((q, qi) => (
                      <QuestionCard key={q.uniqueId} q={q} qIndex={qi} isAdded={cartIdSet.has(q.uniqueId)} onAdd={addToCart} onRemove={removeFromCart} expandedCQs={expandedCQs} setExpandedCQs={setExpandedCQs} />
                    ))}
                    {!loading && filteredQuestions.length > visibleCount && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount((v) => v + 10)}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-3.5 text-[13px] font-bold text-slate-500 transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none "
                      >
                        <ChevronDown className="w-4 h-4" />
                        à¦†à¦°à§‹ à¦¦à§‡à¦–à¦¾à¦¨ ({filteredQuestions.length - visibleCount} à¦Ÿà¦¿ à¦¬à¦¾à¦•à¦¿)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ContentPanel>

          <RightSidebar
            cart={cart}
            counts={rightSidebarCounts}
            stats={rightSidebarStats}
            progressTarget={25}
            clearCart={clearCart}
            onPreview={() => setStep(3)}
            onGenerate={() => setStep(4)}
            onBrowse={() => setMobileFilterOpen(true)}
            isOpen={mobileCartOpen}
            onClose={() => setMobileCartOpen(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/30 backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-[auto_1fr] gap-2 px-3 py-3 sm:gap-3">
              <button type="button" onClick={() => setMobileCartOpen(true)} className="relative flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white shadow-lg transition active:scale-95 focus:outline-none ">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-semibold tracking-wide">{cart.length === 0 ? 'à¦•à¦¾à¦°à§à¦Ÿ' : `${cart.length}à¦Ÿà¦¿`}</span>
              </button>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={cartCounts.mcq === 0}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-400/20 bg-indigo-600 px-2 py-2.5 text-[11px] font-medium text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                >
                  <Check className="w-3.5 h-3.5 shrink-0 opacity-90" />
                  <span className="truncate">à¦‰à¦¤à§à¦¤à¦°à¦ªà¦¤à§à¦°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canPreview}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-600 px-2 py-2.5 text-[11px] font-medium text-white shadow-lg transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0 opacity-90" />
                  <span className="truncate">à¦ªà§à¦°à¦¿à¦¨à§à¦Ÿ à¦ªà§à¦°à¦¿à¦­à¦¿à¦‰</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </BuilderShell>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0b0f19] pb-16 lg:pb-24 font-sans text-slate-200 selection:bg-indigo-500/35">
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6366f1; }
        @keyframes fade-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-in, .qb-header, .qb-dashboard, .qb-content-panel { animation: fade-up 200ms ease-out; }
        .qb-dashboard { display: grid; grid-template-columns: 320px minmax(0, 1fr) 360px; gap: 20px; min-height: 0; flex: 1; overflow: hidden; }
        .qb-sidebar-desktop, .qb-sidebar-collapsed, .qb-right-sidebar-desktop { display: flex; height: 100%; min-height: 0; position: sticky; top: 0; }
        .qb-content-panel { min-height: 0; }
        .qb-content-scroll { min-height: 0; overflow-y: auto; }
        .qb-content-head { position: sticky; top: 0; z-index: 10; background: rgba(15, 23, 42, 0.95); }
        .qb-content-panel .group:hover { transform: scale(1.01); }
        .qb-content-panel .group { transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease, background-color 200ms ease; }
        .qb-tablet-toggle { display: none; }
        @media (max-width: 1199px) {
          .qb-dashboard { grid-template-columns: minmax(0, 1fr) 360px; }
          .qb-sidebar-desktop, .qb-sidebar-collapsed { display: none; }
          .qb-tablet-toggle { display: inline-flex; }
        }
        @media (max-width: 991px) {
          .qb-dashboard { grid-template-columns: minmax(0, 1fr); padding-bottom: 78px; }
          .qb-right-sidebar-desktop { display: none; }
        }
        @media (max-width: 767px) {
          .qb-shell > div { padding: 12px; gap: 12px; }
          .qb-header, .qb-content-panel { border-radius: 16px; }
          .qb-dashboard { gap: 12px; padding-bottom: 84px; }
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">


        {/* ══════════════════════════════════════════════════════════ */}
        {/* STEP 1: Form */}
        {/* ══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto mt-4 sm:mt-6 animate-in">
            <div className="relative p-5 overflow-hidden border shadow-2xl bg-slate-900/60 backdrop-blur-xl border-white/10 rounded-3xl sm:p-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
              <div className="flex flex-col items-start gap-4 pb-5 mb-5 border-b sm:flex-row sm:items-center border-white/5">
                <div className="p-3 border bg-white/5 border-white/10 rounded-2xl">
                  <FileText className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">প্রশ্নপত্রের প্রাথমিক তথ্য</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-400">প্রিন্ট কপিতে প্রদর্শনের জন্য নিচের তথ্যগুলো পূরণ করুন।</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                <FieldShell label="শিক্ষা প্রতিষ্ঠানের নাম" full>
                  <input type="text" name="schoolName" value={headerInfo.schoolName} onChange={handleHeaderChange} placeholder="যেমন: ঢাকা রেসিডেনসিয়াল মডেল কলেজ"
                    className="w-full p-3 text-sm text-white transition-all border bg-black/40 border-white/10 rounded-xl focus:outline-none placeholder-slate-600" />
                </FieldShell>
                <FieldShell label="পরীক্ষার নাম" full>
                  <input type="text" name="examName" value={headerInfo.examName} onChange={handleHeaderChange} placeholder="যেমন: প্রাক-নির্বাচনি পরীক্ষা ২০২৪"
                    className="w-full p-3 text-sm text-white transition-all border bg-black/40 border-white/10 rounded-xl focus:outline-none placeholder-slate-600" />
                </FieldShell>
                <FieldShell label="বিষয়">
                  <input type="text" name="subject" value={headerInfo.subject} onChange={handleHeaderChange}
                    className="w-full p-3 text-sm text-white transition-all border bg-black/40 border-white/10 rounded-xl focus:outline-none " />
                </FieldShell>
                <FieldShell label="বিষয় কোড">
                  <input type="text" name="subjectCode" value={headerInfo.subjectCode} onChange={handleHeaderChange}
                    className="w-full p-3 text-sm text-white transition-all border bg-black/40 border-white/10 rounded-xl focus:outline-none " />
                </FieldShell>
                <FieldShell label="সময়">
                  <input type="text" name="time" value={headerInfo.time} onChange={handleHeaderChange}
                    className="w-full p-3 text-sm text-white transition-all border bg-black/40 border-white/10 rounded-xl focus:outline-none " />
                </FieldShell>
                <FieldShell label="পূর্ণমান">
                  <input type="text" name="totalMarks" value={headerInfo.totalMarks} onChange={handleHeaderChange}
                    className="w-full p-3 text-sm text-white transition-all border bg-black/40 border-white/10 rounded-xl focus:outline-none " />
                </FieldShell>
              </div>
              <div className="flex justify-end pt-4 mt-5 border-t border-white/5">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3 px-6 sm:py-3.5 sm:px-8 rounded-xl sm:rounded-2xl transition shadow-lg shadow-indigo-900/30 active:scale-[0.98]"
                >
                  <span>প্রশ্ন নির্বাচনে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* STEP 2: Question Bank */}
        {/* ══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="qb-shell">
            <div className="mx-auto flex h-full min-h-0 max-w-[1700px] flex-col gap-5 p-5">
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] xl:flex-row xl:items-center">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
                    <BookOpenCheck className="h-5 w-5" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    স্মার্ট প্রশ্নপত্র নির্মাতা
                  </h1>
                </div>
                <div className="flex w-full items-center justify-between gap-0.5 overflow-x-auto py-2 sm:justify-start sm:gap-1 xl:w-auto custom-scrollbar">
                  {[
                    { num: 1, label: 'হেডার', icon: Settings },
                    { num: 2, label: 'নির্বাচন', icon: LayoutList },
                    { num: 3, label: 'প্রিভিউ', icon: Printer },
                    { num: 4, label: 'উত্তরপত্র', icon: Check },
                  ].map((s, i) => (
                    <React.Fragment key={s.num}>
                      <button
                        onClick={() => ((s.num !== 3 && s.num !== 4) || canPreview) ? setStep(s.num) : null}
                        disabled={(s.num === 3 || s.num === 4) && !canPreview}
                        className={`flex items-center gap-1 px-1 py-1 text-[11px] font-bold transition-all duration-200 sm:gap-1.5 sm:px-2 sm:text-[13px] ${step === s.num ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30'
                          }`}
                      >
                        <s.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        <span className="whitespace-nowrap">{s.label}</span>
                      </button>
                      {i < 3 && <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 sm:h-3.5 sm:w-3.5" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="qb-dashboard">
                {/* Filter Sidebar */}
                <FilterSidebar
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
                  isMobileOpen={mobileFilterOpen}
                  onMobileClose={() => setMobileFilterOpen(false)}
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedSubjectId={selectedSubjectId}
                  setSelectedSubjectId={setSelectedSubjectId}
                  availableSubjects={availableSubjects}
                  activeSubjectConfig={activeSubjectConfig}
                  chapters={chapters}
                  selectedChapters={selectedChapters}
                  toggleChapter={toggleChapter}
                  availableTopics={availableTopics}
                  selectedTopics={selectedTopics}
                  toggleTopic={toggleTopic}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                />


                {/* Question Panel */}
                <div className="qb-content-panel flex-1 min-w-0">
                  {/* Panel Header */}
                  <div className="qb-content-head flex items-center justify-between gap-2">
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <button onClick={() => setMobileFilterOpen(true)} className="qb-tablet-toggle p-2 text-indigo-600 transition border border-indigo-100 bg-indigo-50 rounded-xl hover:bg-indigo-100 active:scale-95">
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                      <div className="hidden p-2 text-indigo-600 border sm:flex bg-indigo-50 border-indigo-100 rounded-xl">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-extrabold text-slate-900 truncate sm:text-base">প্রশ্নব্যাংক</h2>
                      {filteredQuestions.length > 0 && (
                        <span className="whitespace-nowrap rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
                          {filteredQuestions.length} টি পাওয়া গেছে
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Tabs */}
                  {selectedChapters.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 bg-[#090d16]/80 p-1.5 border border-slate-800/80 rounded-2xl mb-5 shadow-inner">
                      <CategoryTab active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="সব" count={questionCounts.all} />
                      <CategoryTab active={selectedType === 'cq'} onClick={() => setSelectedType('cq')} label="সৃজনশীল" count={questionCounts.cq} />
                      <CategoryTab active={selectedType === 'mcq'} onClick={() => setSelectedType('mcq')} label="MCQ" count={questionCounts.mcq} />
                      <CategoryTab active={selectedType === 'k_kh'} onClick={() => setSelectedType('k_kh')} label="জ্ঞান/অনু." count={questionCounts.kKh} />
                    </div>
                  )}

                  {/* Question List */}
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    {loading && <EmptyState icon={Loader2} title="প্রশ্নসমূহ লোড হচ্ছে..." spinning />}
                    {!loading && !selectedSubjectId && <EmptyState icon={BookOpen} title="বিষয় নির্বাচন করুন" hint="বাম পাশের ফিল্টার থেকে একটি বিষয় ও অধ্যায় বেছে নিন।" />}
                    {!loading && selectedSubjectId && selectedChapters.length === 0 && <EmptyState icon={SlidersHorizontal} title="অধ্যায় নির্বাচন করুন" hint="বাম পাশ থেকে একটি বা একাধিক অধ্যায় বেছে নিন।" />}
                    {!loading && selectedChapters.length > 0 && filteredQuestions.length === 0 && <EmptyState icon={HelpCircle} title="এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি" hint="ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।" />}
                    {!loading && filteredQuestions.slice(0, visibleCount).map((q, qi) => (
                      <QuestionCard key={q.uniqueId} q={q} qIndex={qi} isAdded={cartIdSet.has(q.uniqueId)} onAdd={addToCart} onRemove={removeFromCart} expandedCQs={expandedCQs} setExpandedCQs={setExpandedCQs} />
                    ))}
                    {!loading && filteredQuestions.length > visibleCount && (
                      <button
                        onClick={() => setVisibleCount((v) => v + 10)}
                        className="w-full py-3.5 mt-2 rounded-2xl border border-dashed border-slate-700 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all duration-200 text-[13px] font-bold flex items-center justify-center gap-2"
                      >
                        <ChevronDown className="w-4 h-4" />
                        আরো দেখান ({filteredQuestions.length - visibleCount} টি বাকি)
                      </button>
                    )}
                  </div>
                </div>

                {/* Right dashboard */}
                <RightSidebar
                  cart={cart}
                  counts={rightSidebarCounts}
                  stats={rightSidebarStats}
                  progressTarget={25}
                  clearCart={clearCart}
                  onPreview={() => setStep(3)}
                  onGenerate={() => setStep(4)}
                  onBrowse={() => setMobileFilterOpen(true)}
                  isOpen={mobileCartOpen}
                  onClose={() => setMobileCartOpen(false)}
                />

                {/* Mobile bottom bar */}
                <div className="fixed bottom-0 left-0 right-0 z-30 border-t shadow-2xl lg:hidden bg-slate-900/95 backdrop-blur-xl border-slate-800">
                  <div className="grid grid-cols-[auto_1fr] gap-2 sm:gap-3 px-3 py-3">
                    <button onClick={() => setMobileCartOpen(true)} className="relative flex items-center justify-center gap-1.5 bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-white/10 shadow-lg transition active:scale-95">
                      <ShoppingCart className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-semibold tracking-wide">{cart.length === 0 ? 'কার্ট' : `${cart.length}টি`}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => setStep(4)}
                        disabled={cartCounts.mcq === 0}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-2 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)] border border-indigo-400/20 text-[11px] sm:text-xs"
                      >
                        <Check className="w-3.5 h-3.5 shrink-0 opacity-90" />
                        <span className="truncate">উত্তরপত্র</span>
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!canPreview}
                        className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-2 rounded-xl transition-all shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] border border-emerald-400/20 text-[11px] sm:text-xs"
                      >
                        <Printer className="w-3.5 h-3.5 shrink-0 opacity-90" />
                        <span className="truncate">প্রিন্ট প্রিভিউ</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
