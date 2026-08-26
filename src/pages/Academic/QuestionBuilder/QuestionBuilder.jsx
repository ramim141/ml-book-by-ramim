import { useState, useEffect, useMemo, useCallback, useDeferredValue, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import PrintableView from './PrintableView.jsx';
import AnswerSheetView from './components/preview/AnswerSheetView.jsx';
import OmrAnswerSheet from './components/preview/OmrAnswerSheet.jsx';
import FilterSidebar from './components/filters/FilterSidebar.jsx';
import RightSidebar from './components/rightSidebar/RightSidebar.jsx';
import ProfessionalQuestionCard from './components/question/ProfessionalQuestionCard.jsx';
import QuestionCardSkeleton from './components/question/QuestionCardSkeleton.jsx';
import QuestionLibraryEmpty from './components/question/QuestionLibraryEmpty.jsx';
import Toolbar from './components/toolbar/Toolbar.jsx';
import AutoPickDialog from './components/toolbar/AutoPickDialog.jsx';
import BuilderHeader from './components/shell/BuilderHeader.jsx';
import PaperInfoPanel from './components/shell/PaperInfoPanel.jsx';
import PrintSettingsPanel from './components/preview/PrintSettingsPanel.jsx';
import SavedPapersPanel from './components/shell/SavedPapersPanel.jsx';
import CompleteCQModal from './components/question/CompleteCQModal.jsx';
import { DEFAULT_PRINT_SETTINGS, resolvePage } from './printSettings.js';
import { useAcademicSubjects } from '../../../hooks/useAcademicSubjects';
import { ADMISSION_BUILDER_SUBJECTS, ADMISSION_PROGRAMS } from '../../../data/academic/admissionBuilderConfig';
import { useAuth } from '../../../contexts/AuthContext';
import { useConfirm } from '../../../hooks/useConfirm';
import { useBuilderQuestions, normalizeChapterKey } from './useBuilderQuestions.js';
import { DEFAULT_MARKS, summarizeCart, markOf } from './marks.js';
import { listPapers } from '../../../lib/savedPapers';
import { buildUsageIndex } from './duplicateCheck.js';
import { readImageAsDataUrl } from './logoUpload.js';
import { estimatePageCount } from './pageEstimate.js';
import { materializeEdits, shuffleSetVariant } from './setUtils.js';
import { Download, ChevronDown, ChevronLeft, FileText, Wand2, CheckCheck, History, X, Settings2, Pencil, Printer, Layers, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { enToBn } from './helpers.jsx';

// ── localStorage keys ─────────────────────────────────────────────────
const CART_STORAGE_KEY = 'qb-cart-v2';
const HEADER_STORAGE_KEY = 'qb-header-v1';
const MARKS_STORAGE_KEY = 'qb-marks-v1';
const DRAFT_SAVED_AT_KEY = 'qb-draft-saved-at-v1';
const PRINT_SETTINGS_KEY = 'qb-print-settings-v1';
const EDITS_STORAGE_KEY = 'qb-edits-v1';

/** খসড়া কতক্ষণ আগের — "পুরোনো কাজ রয়ে গেছে" বোঝাতে এটাই সবচেয়ে কাজে দেয় */
const relativeTime = (timestamp) => {
  if (!timestamp) return '';
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'এইমাত্র';
  if (minutes < 60) return `${enToBn(minutes)} মিনিট আগের`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${enToBn(hours)} ঘণ্টা আগের`;
  return `${enToBn(Math.floor(hours / 24))} দিন আগের`;
};

const readStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // কোটা শেষ হলে চুপচাপ ছেড়ে দিই — persist না হলেও অ্যাপ চলবে
  }
};

const DEFAULT_HEADER_INFO = {
  schoolName: '',
  examName: '',
  subject: '',
  time: '২ ঘন্টা ৩০ মিনিট',
  totalMarks: '',
  subjectCode: '',
  logoUrl: '',
  logoPath: '',
};

const SET_LABELS = ['A', 'B', 'C', 'D'];

// ── CategoryTab ───────────────────────────────────────────────────────
const CategoryTab = ({ active, onClick, label, mobileLabel, count }) => (
  <button
    onClick={onClick}
    className={`group relative flex min-w-0 flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-2.5 sm:py-2 text-xs font-bold transition-all duration-200 active:scale-[0.97] ${active
        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
      }`}
  >
    <span className="sm:hidden whitespace-nowrap">{mobileLabel || label}</span>
    <span className="hidden sm:inline truncate">{label}</span>
    <span
      className={`hidden sm:flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-black transition-colors ${active
          ? 'bg-white/20 text-white'
          : 'bg-white/[0.06] text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'
        }`}
    >
      {count}
    </span>
  </button>
);

// পুরো বিল্ডারের লেআউট: ডেস্কটপে পেজ স্ক্রল করে না, শুধু প্রশ্নের তালিকা স্ক্রল করে
const BUILDER_CSS = `
  /* body-তে বসানো, .qb-root-এর ভেতরে নয় — কারণ nav.academic-navbar এই
     কম্পোনেন্টের বাইরে (DOM-এ .qb-root-এর sibling-এর মতো অবস্থানে), তাই
     .qb-root-স্কোপড ভ্যারিয়েবল সেখান থেকে দেখা যেত না */
  body { --qb-nav-h: 64px; }
  @media (min-width: 640px) { body { --qb-nav-h: 80px; } }

  /* এই পুরো কোলাপ্স-লজিক শুধু ডেস্কটপের জন্য — ওখানে পুরো পাতা স্ক্রল হয় না,
     শুধু মাঝের প্রশ্নের তালিকা (.qb-list-pane) নিজের ভেতরে স্ক্রল হয়, তাই মূল
     সাইট নেভবার (এই কম্পোনেন্টের বাইরে) সাধারণ CSS sticky দিয়ে সরানো যায় না।
     বদলে তালিকা স্ক্রল হলে body-তে ক্লাস বসিয়ে নেভবারকে height-collapse করি —
     তখন নিচের সবকিছু (এই হেডারসহ) স্বাভাবিক flow-তেই উপরে উঠে আসে।

     মোবাইলে পুরো পাতাই স্বাভাবিকভাবে স্ক্রল হয় (নেভবার নিজেই sticky), তাই এই
     লজিকের দরকার নেই — বরং max-height বেস-রুলটা মোবাইলেও বসে গেলে নেভবারের
     আসল উচ্চতা --qb-nav-h-এর অনুমানের চেয়ে সামান্য বেশি হলেই কনটেন্ট কেটে
     (ক্লিপ হয়ে) গ্লিচের মতো দেখাচ্ছিল — তাই পুরোটাই ≥1024px-এ আটকে রাখা হলো */
  @media (min-width: 1024px) {
    nav.academic-navbar {
      max-height: var(--qb-nav-h);
      overflow: visible;
      transition: max-height 0.3s ease, opacity 0.2s ease;
    }
    body.qb-nav-collapsed nav.academic-navbar {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
      border-color: transparent;
      pointer-events: none;
    }
    body.qb-nav-collapsed .qb-app { height: 100dvh; }
  }

  .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); border-radius: 9999px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.3); border-radius: 9999px; transition: background 0.2s ease; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.7); }

  @keyframes fade-up { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .animate-in { animation: fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1); }

  /* sticky দিলে মোবাইলে মূল নেভবারও (নিজেই sticky top:0) একই জায়গায় আটকে
     থেকে এই হেডারের সাথে ওভারল্যাপ করে গ্লিচের মতো দেখাচ্ছিল — আর ডেস্কটপে
     .qb-app নিজে স্ক্রলই হয় না বলে sticky-র কোনো কাজও ছিল না। তাই স্বাভাবিক
     position-এই রাখা হলো; ডেস্কটপের "উপরে ওঠা" পুরোপুরি nav.academic-navbar
     কোলাপ্স হয়ে জায়গা ছেড়ে দেওয়ার (flow reflow) ওপর নির্ভর করে। */
  .qb-step-header { position: static; }
  .qb-cart-button { display: inline-flex; }
  .qb-empty-action { display: none; }
  .qb-filter-toggle { display: none; }

  .qb-app { display: flex; flex-direction: column; height: calc(100dvh - var(--qb-nav-h)); }
  .qb-panes {
    display: grid;
    grid-template-columns: 295px minmax(0, 1fr) 345px;
    gap: 16px;
    flex: 1;
    min-height: 0;
    padding-top: 14px;
    padding-bottom: 14px;
  }
  .qb-list-pane { min-height: 0; overflow-y: auto; scroll-behavior: smooth; }

  .qb-list-sticky {
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(11, 15, 25, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    margin-bottom: 12px;
  }

  .qb-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .qb-clamp-2 .prose { display: inline; }
  .qb-clamp-2 p { display: inline; margin: 0 !important; }

  .qb-card {
    content-visibility: auto;
    contain-intrinsic-size: auto 88px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (min-width: 1024px) {
    footer { display: none; }
  }

  button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid #8b5cf6; outline-offset: 2px; }

  @media (max-width: 1279px) {
    .qb-panes { grid-template-columns: minmax(0, 1fr) 320px; }
    .qb-filter-pane { display: none; }
    .qb-filter-toggle { display: inline-flex; }
    .qb-empty-action { display: inline-flex; }
  }

  @media (max-width: 1023px) {
    .qb-app { height: auto; }
    .qb-panes { grid-template-columns: minmax(0, 1fr); padding-bottom: 24px; }
    .qb-cart-pane { display: none; }
    .qb-list-pane { overflow: visible; }
  }

  @media (min-width: 1280px) {
    .qb-cart-button { display: none; }
  }
`;

export default function QuestionBuilder() {
  const { currentUser, loading: authLoading } = useAuth();

  // আগে চার ধাপের উইজার্ড ছিল; এখন বিল্ডারই মূল পর্দা, বাকি দুটো আউটপুট ভিউ
  const [view, setView] = useState('build'); // 'build' | 'preview' | 'answers' | 'omr'

  // ডেস্কটপে পাতা নিজে স্ক্রল হয় না, শুধু প্রশ্নের তালিকা (.qb-list-pane) হয় —
  // তালিকা একটু স্ক্রল হলেই মূল নেভবার কোলাপ্স করে এই হেডারকে ওই জায়গায় তুলে আনি
  const listPaneRef = useRef(null);
  const [listScrolled, setListScrolled] = useState(false);
  useEffect(() => {
    const el = listPaneRef.current;
    if (!el) return undefined;
    // স্ক্রল ইভেন্ট খুব ঘনঘন আসে — প্রতিটাতেই সরাসরি setState চালালে স্ক্রলের
    // সাথে রেন্ডার প্রতিযোগিতা করে খসখসে লাগে, তাই ফ্রেম-প্রতি একবারই চেক করি
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setListScrolled((prev) => {
          const next = el.scrollTop > 4;
          return prev === next ? prev : next;
        });
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [view]);
  useEffect(() => {
    document.body.classList.toggle('qb-nav-collapsed', listScrolled);
    return () => document.body.classList.remove('qb-nav-collapsed');
  }, [listScrolled]);
  const [cart, setCart] = useState(() => {
    const stored = readStored(CART_STORAGE_KEY, []);
    return Array.isArray(stored) ? stored : [];
  });
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [confirm, confirmDialog] = useConfirm();
  const [savedPapersOpen, setSavedPapersOpen] = useState(false);

  // "এই প্রশ্নটা কি আগে অন্য কোনো কাগজে ব্যবহার হয়েছে?" — সেশনে একবারই
  // সংরক্ষিত কাগজের তালিকা আনি, প্রতিটা প্রশ্ন-কার্ডে আলাদা করে হিসাব করতে হয় না
  const [usageIndex, setUsageIndex] = useState(null);
  useEffect(() => {
    if (!currentUser?.uid) return undefined;
    let cancelled = false;
    listPapers(currentUser.uid)
      .then((rows) => { if (!cancelled) setUsageIndex(buildUsageIndex(rows)); })
      .catch((err) => console.error(err));
    return () => { cancelled = true; };
  }, [currentUser?.uid]);

  // পেজ খোলার সময় আগের খসড়া ফিরে এলে সেটা জানিয়ে দিই — না হলে নতুন কাগজ
  // বানাতে বসে হঠাৎ আগের প্রশ্নগুলো দেখে বিভ্রান্তি হয়
  const [restoredDraft, setRestoredDraft] = useState(() => {
    const stored = readStored(CART_STORAGE_KEY, []);
    if (!Array.isArray(stored) || stored.length === 0) return null;
    return { count: stored.length, savedAt: readStored(DRAFT_SAVED_AT_KEY, null) };
  });

  const [headerInfo, setHeaderInfo] = useState(() => ({
    ...DEFAULT_HEADER_INFO,
    ...readStored(HEADER_STORAGE_KEY, {}),
  }));
  const [marksConfig, setMarksConfig] = useState(() => ({
    ...DEFAULT_MARKS,
    ...readStored(MARKS_STORAGE_KEY, {}),
  }));

  // ── প্রিন্ট সেটআপ ও প্রশ্ন সম্পাদনা ──────────────────────────────
  const [printSettings, setPrintSettings] = useState(() => ({
    ...DEFAULT_PRINT_SETTINGS,
    ...readStored(PRINT_SETTINGS_KEY, {}),
  }));
  const [printPanelOpen, setPrintPanelOpen] = useState(false);
  // প্রিন্টে আনুমানিক কত পৃষ্ঠা লাগবে — PrintableView রিয়েল উচ্চতা রিপোর্ট করে,
  // হিসাবটা এখানেই হয় (component-টা নিজে পাতাসংখ্যা নিয়ে ভাবে না)
  const [contentHeightPx, setContentHeightPx] = useState(0);
  const estimatedPages = useMemo(
    () => estimatePageCount({ contentHeightPx, page: resolvePage(printSettings) }),
    [contentHeightPx, printSettings],
  );
  const [editing, setEditing] = useState(false);
  // প্রশ্নের সম্পাদিত লেখা — মূল প্রশ্ন অক্ষত রেখে uniqueId ধরে আলাদা রাখা হয়,
  // তাই যেকোনো সময় আসল লেখায় ফেরা যায়
  const [edits, setEdits] = useState(() => readStored(EDITS_STORAGE_KEY, {}) || {});

  // ── একাধিক সেট (A/B/C...) — MCQ-এর ক্রম ও অপশনের ক্রম শাফল করা প্রতিটি
  // সেট শুধু এই সেশনেই থাকে (localStorage/সংরক্ষিত কাগজে যায় না), কারণ
  // মূল cart-ই একমাত্র সত্য উৎস — সেট শুধু তারই একটা রেন্ডার-টাইম রূপ
  const [setCount, setSetCount] = useState(1);
  const [activeSetIndex, setActiveSetIndex] = useState(0);

  const materializedCart = useMemo(() => materializeEdits(cart, edits), [cart, edits]);
  const shuffledSets = useMemo(
    () => Array.from({ length: setCount }, (_, i) => (i === 0 ? materializedCart : shuffleSetVariant(materializedCart))),
    [materializedCart, setCount],
  );
  const activeCart = shuffledSets[activeSetIndex] || materializedCart;
  // সেট A (মূল ক্রম) ছাড়া বাকি সেটগুলোতে ইনলাইন এডিট বন্ধ — কারণ এডিট
  // পজিশনভিত্তিক (opt_2 ইত্যাদি), অপশন শাফলের পর সেই পজিশন আর একই অপশনকে
  // নির্দেশ করে না। শাফলের আগেই এডিট materializeEdits দিয়ে পাকা করা হয়,
  // তাই সেট A-তেই শুধু এডিট চালু রাখা নিরাপদ।
  const canEditActiveSet = activeSetIndex === 0;

  const [selectedLevel, setSelectedLevel] = useState('HSC');
  const [selectedProgram, setSelectedProgram] = useState('medical');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(['adm-biology', 'adm-chemistry', 'adm-physics', 'adm-english', 'adm-gk']);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectTab, setSelectedSubjectTab] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [paperInfoOpen, setPaperInfoOpen] = useState(false);
  const [autoPickOpen, setAutoPickOpen] = useState(false);
  const [completingCq, setCompletingCq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [navHeight, setNavHeight] = useState(null);

  // একাডেমিক ন্যাভবারের আসল উচ্চতা মেপে নিই — হার্ডকোড করলে ১-২px গরমিলেও
  // পুরো পেজে বাড়তি স্ক্রলবার চলে আসে
  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector('nav');
      if (nav) setNavHeight(nav.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const rootStyle = navHeight ? { '--qb-nav-h': `${navHeight}px` } : undefined;

  // ── data: বাকি অ্যাপের মতোই admin_settings/subjects + academic_content + Admission ──
  const { data: allSubjects = [], isLoading: subjectsLoading } = useAcademicSubjects();

  const combinedSubjects = useMemo(() => {
    const list = [...allSubjects];
    ADMISSION_BUILDER_SUBJECTS.forEach((admSub) => {
      if (!list.some((s) => s.id === admSub.id)) {
        list.push(admSub);
      }
    });
    return list;
  }, [allSubjects]);

  const levels = useMemo(() => {
    const seen = [];
    combinedSubjects.forEach((s) => { if (s.level && !seen.includes(s.level)) seen.push(s.level); });
    return seen;
  }, [combinedSubjects]);

  // selectedLevel এর প্রাথমিক মান 'HSC'; অ্যাডমিনের তালিকায় সেটা না থাকলে
  // ইফেক্ট দিয়ে সংশোধন না করে সরাসরি প্রথম স্তরটাই ধরে নিই — এতে বাড়তি
  // রেন্ডার-চক্র তৈরি হয় না
  const effectiveLevel = levels.includes(selectedLevel) ? selectedLevel : (levels[0] || selectedLevel);
  const isAdmission = effectiveLevel === 'Admission';

  const currentProgramConfig = useMemo(() => {
    return ADMISSION_PROGRAMS.find((p) => p.id === selectedProgram) || ADMISSION_PROGRAMS[0];
  }, [selectedProgram]);

  const availableSubjects = useMemo(() => {
    if (isAdmission) {
      return ADMISSION_BUILDER_SUBJECTS.filter((s) =>
        currentProgramConfig.subjectIds.includes(s.id)
      );
    }
    return combinedSubjects.filter((s) => s.level === effectiveLevel);
  }, [isAdmission, currentProgramConfig, combinedSubjects, effectiveLevel]);

  const activeSubjects = useMemo(() => {
    if (isAdmission) {
      return availableSubjects.filter((s) => selectedSubjectIds.includes(s.id));
    }
    return availableSubjects.filter((s) => s.id === selectedSubjectId);
  }, [isAdmission, availableSubjects, selectedSubjectIds, selectedSubjectId]);

  const toggleSubjectId = useCallback((id) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAllSubjects = useCallback(() => {
    setSelectedSubjectIds(availableSubjects.map((s) => s.id));
  }, [availableSubjects]);

  const unselectAllSubjects = useCallback(() => {
    setSelectedSubjectIds([]);
  }, []);

  // প্রোগ্রাম বদলালে স্বয়ংক্রিয়ভাবে সেই প্রোগ্রামের সব বিষয় নির্বাচন করা
  useEffect(() => {
    if (isAdmission) {
      setSelectedSubjectIds(availableSubjects.map((s) => s.id));
      setSelectedSubjectTab('all');
    }
  }, [isAdmission, selectedProgram]);

  const { questions: subjectQuestions, isLoading: questionsLoading } = useBuilderQuestions(activeSubjects);

  const chapters = useMemo(() => {
    const list = activeSubjects.flatMap((s) =>
      (s.chapters || []).map((c) => ({
        ...c,
        subjectId: s.id,
        subjectName: s.name || s.label,
      }))
    );

    // Auto-discover any custom chapters present in Firestore questions
    const knownIds = new Set(list.map((c) => c.id));
    const knownNorm = new Set(list.map((c) => normalizeChapterKey(c.id)));

    subjectQuestions.forEach((q) => {
      if (!q.chapterId) return;
      const qNorm = normalizeChapterKey(q.chapterId);
      if (!knownIds.has(q.chapterId) && !knownNorm.has(qNorm)) {
        const extraCh = {
          id: q.chapterId,
          name: q.chapterName || q.chapterId,
          title: q.chapterName || q.chapterId,
          subjectId: activeSubjects[0]?.id || 'adm-biology',
          subjectName: activeSubjects[0]?.name || activeSubjects[0]?.label || 'বিষয়',
        };
        list.push(extraCh);
        knownIds.add(q.chapterId);
        knownNorm.add(qNorm);
      }
    });

    return list;
  }, [activeSubjects, subjectQuestions]);

  // যখন বিষয় বা চ্যাপ্টার লোড হয়, প্রথমবার অধ্যায়গুলো সক্রিয় করা
  useEffect(() => {
    if (chapters.length > 0 && selectedChapters.length === 0) {
      setSelectedChapters(chapters.map((c) => c.id));
    }
  }, [chapters]);

  // বিষয়ের ভিতরে অধ্যায় বদলালে আর নেটওয়ার্ক কল যায় না — কাটাকুটি ক্লায়েন্টেই
  const scopedQuestions = useMemo(() => {
    if (selectedChapters.length === 0) return [];
    const set = new Set(selectedChapters);
    const normSet = new Set(selectedChapters.map(normalizeChapterKey));

    return subjectQuestions.filter((q) => {
      if (set.has(q.chapterId)) return true;
      if (normSet.has(normalizeChapterKey(q.chapterId))) return true;
      return false;
    });
  }, [subjectQuestions, selectedChapters]);

  const deferredQuestions = useDeferredValue(scopedQuestions);
  const loading = subjectsLoading || questionsLoading;

  // ── effect: persist so a refresh does not wipe the work ──
  useEffect(() => {
    writeStored(CART_STORAGE_KEY, cart);
    writeStored(DRAFT_SAVED_AT_KEY, cart.length > 0 ? Date.now() : null);
  }, [cart]);
  useEffect(() => { writeStored(HEADER_STORAGE_KEY, headerInfo); }, [headerInfo]);
  useEffect(() => { writeStored(MARKS_STORAGE_KEY, marksConfig); }, [marksConfig]);
  useEffect(() => { writeStored(PRINT_SETTINGS_KEY, printSettings); }, [printSettings]);
  useEffect(() => { writeStored(EDITS_STORAGE_KEY, edits); }, [edits]);

  // ── effect: reset when subject changes ────────────────────────────
  useEffect(() => {
    setSelectedChapters([]);
    setSelectedTopics([]);
    setSelectedBoards([]);
    setSelectedYears([]);
    setSelectedType('all');
    setSearchQuery('');
    if (activeSubjects.length > 0) {
      setHeaderInfo((prev) => ({
        ...prev,
        subject:
          activeSubjects.length > 1
            ? `${activeSubjects.map((s) => s.name || s.label).join(' + ')}`
            : activeSubjects[0]?.label || activeSubjects[0]?.name || prev.subject,
      }));
    }
  }, [activeSubjects]);

  // ── derived: topics ───────────────────────────────────────────────
  const availableTopics = useMemo(() => {
    const set = new Set();
    deferredQuestions.forEach((q) => { if (q.topic) set.add(q.topic.trim()); });
    return Array.from(set).map((t) => ({ id: t, name: t }));
  }, [deferredQuestions]);

  useEffect(() => {
    setSelectedTopics((prev) => prev.filter((t) => availableTopics.some((at) => at.id === t)));
  }, [availableTopics]);

  // ── derived: boards ও বছর — প্রশ্নের q.boards (নতুন) ও q.board (পুরোনো)
  const boardEntriesOf = useCallback((q) => {
    const list = [];
    if (Array.isArray(q.boards)) {
      q.boards.forEach((b) => {
        if (typeof b === 'object' && b !== null) {
          const n = (b.name || b.type || '').toString().trim();
          const y = (b.year || b.session || '').toString().trim();
          if (n && n !== '[object Object]') list.push({ name: n, year: y });
        } else if (typeof b === 'string' && b.trim() && b !== '[object Object]') {
          list.push({ name: b.trim(), year: '' });
        }
      });
    } else if (Array.isArray(q.board)) {
      q.board.forEach((b) => {
        if (typeof b === 'object' && b !== null) {
          const n = (b.name || b.type || '').toString().trim();
          const y = (b.year || b.session || '').toString().trim();
          if (n && n !== '[object Object]') list.push({ name: n, year: y });
        } else if (typeof b === 'string' && b.trim() && b !== '[object Object]') {
          list.push({ name: b.trim(), year: '' });
        }
      });
    }
    return list;
  }, []);

  const { availableBoards, availableYears } = useMemo(() => {
    const boardMap = new Map();
    const yearMap = new Map();
    deferredQuestions.forEach((q) => {
      boardEntriesOf(q).forEach((b) => {
        const name = (b?.name || '').toString().trim();
        const year = (b?.year || '').toString().trim();
        if (name && name !== '[object Object]') boardMap.set(name, (boardMap.get(name) || 0) + 1);
        if (year && year !== '[object Object]') yearMap.set(year, (yearMap.get(year) || 0) + 1);
      });
    });
    return {
      availableBoards: Array.from(boardMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ id: name, name, count })),
      availableYears: Array.from(yearMap.entries())
        .sort((a, b) => Number(b[0]) - Number(a[0]))
        .map(([year, count]) => ({ id: year, name: year, count })),
    };
  }, [deferredQuestions, boardEntriesOf]);

  useEffect(() => {
    setSelectedBoards((prev) => prev.filter((b) => availableBoards.some((ab) => ab.id === b)));
  }, [availableBoards]);
  useEffect(() => {
    setSelectedYears((prev) => prev.filter((y) => availableYears.some((ay) => ay.id === y)));
  }, [availableYears]);

  // ── derived: filtered questions ───────────────────────────────────
  const filteredQuestions = useMemo(() => {
    let qs = deferredQuestions;
    if (selectedTopics.length > 0) qs = qs.filter((q) => q.topic && selectedTopics.includes(q.topic.trim()));
    if (selectedBoards.length > 0 || selectedYears.length > 0) {
      qs = qs.filter((q) => {
        const entries = boardEntriesOf(q);
        if (entries.length === 0) return false;
        return entries.some((b) => {
          const name = (b?.name || '').toString().trim();
          const year = (b?.year || '').toString().trim();
          const boardOk = selectedBoards.length === 0 || selectedBoards.includes(name);
          const yearOk = selectedYears.length === 0 || selectedYears.includes(year);
          return boardOk && yearOk;
        });
      });
    }
    if (isAdmission) {
      if (selectedSubjectTab !== 'all') {
        qs = qs.filter(
          (q) =>
            q.subject === selectedSubjectTab ||
            q.subjectId === selectedSubjectTab ||
            activeSubjects.find((s) => s.id === selectedSubjectTab)?.chapters?.some((c) => c.id === q.chapterId)
        );
      }
    } else {
      if (selectedType === 'cq') qs = qs.filter((q) => q.type === 'cq');
      else if (selectedType === 'mcq') qs = qs.filter((q) => q.type === 'mcq');
      else if (selectedType === 'k_kh') qs = qs.filter((q) => q.type === 'k' || q.type === 'kh');
    }
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
    return qs;
  }, [deferredQuestions, selectedTopics, selectedBoards, selectedYears, boardEntriesOf, isAdmission, selectedSubjectTab, activeSubjects, selectedType, searchQuery]);

  // ফিল্টার বদলালে তালিকা আবার প্রথম ১০টি থেকে শুরু হবে
  const filterSignature = `${selectedTopics.join('|')}::${selectedBoards.join('|')}::${selectedYears.join('|')}::${selectedType}::${selectedSubjectTab}::${searchQuery}::${deferredQuestions.length}`;
  useEffect(() => {
    setVisibleCount(20);
  }, [filterSignature]);

  const questionCounts = useMemo(() => scopedQuestions.reduce((a, q) => {
    a.all += 1;
    if (q.type === 'cq') a.cq += 1;
    if (q.type === 'mcq') a.mcq += 1;
    if (q.type === 'k' || q.type === 'kh') a.kKh += 1;
    return a;
  }, { all: 0, cq: 0, mcq: 0, kKh: 0 }), [scopedQuestions]);

  const chapterCounts = useMemo(() => {
    const counts = {};
    subjectQuestions.forEach((q) => {
      if (!q.chapterId) return;
      const rawId = q.chapterId;
      const normKey = normalizeChapterKey(rawId);
      counts[rawId] = (counts[rawId] || 0) + 1;
      if (normKey && normKey !== rawId) {
        counts[normKey] = (counts[normKey] || 0) + 1;
      }
    });
    return counts;
  }, [subjectQuestions]);

  const cartIdSet = useMemo(() => new Set(cart.map((q) => q.uniqueId)), [cart]);
  const isQuestionLibraryFiltered = selectedChapters.length > 0 || selectedTopics.length > 0 || selectedBoards.length > 0 || selectedYears.length > 0 || selectedType !== 'all' || selectedSubjectTab !== 'all' || Boolean(searchQuery.trim());
  const questionLibrarySummary = useMemo(() => {
    const subjectName = isAdmission
      ? activeSubjects.length > 1
        ? `${enToBn(activeSubjects.length)} টি বিষয়`
        : activeSubjects[0]?.name || activeSubjects[0]?.label
      : activeSubjects[0]?.label || activeSubjects[0]?.name;

    const selectedChapterLabels = selectedChapters
      .map((id) => {
        const chapter = chapters.find((c) => c.id === id);
        return chapter?.name || chapter?.title;
      })
      .filter(Boolean);
    const typeLabel = isAdmission
      ? selectedSubjectTab !== 'all'
        ? activeSubjects.find((s) => s.id === selectedSubjectTab)?.name
        : null
      : selectedType === 'all'
      ? null
      : selectedType === 'k_kh'
      ? 'জ্ঞান/অনু.'
      : selectedType.toUpperCase();

    return [
      subjectName,
      selectedChapterLabels.length > 1 ? `${enToBn(selectedChapterLabels.length)} অধ্যায়` : selectedChapterLabels[0],
      selectedTopics.length > 1 ? `${enToBn(selectedTopics.length)} টপিক` : selectedTopics[0],
      selectedBoards.length > 1 ? `${enToBn(selectedBoards.length)} বোর্ড` : selectedBoards[0],
      selectedYears.length > 1 ? `${enToBn(selectedYears.length)} সাল` : (selectedYears[0] ? enToBn(selectedYears[0]) : null),
      typeLabel,
      searchQuery.trim() ? `সার্চ: ${searchQuery.trim()}` : null,
    ].filter(Boolean);
  }, [isAdmission, activeSubjects, chapters, selectedChapters, selectedTopics, selectedBoards, selectedYears, selectedType, selectedSubjectTab, searchQuery]);

  // ── callbacks ─────────────────────────────────────────────────────
  const handleHeaderChange = useCallback((e) => {
    const { name, value } = e.target;
    setHeaderInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  const [logoUploading, setLogoUploading] = useState(false);
  const handleLogoUpload = async (file) => {
    setLogoUploading(true);
    try {
      // ক্লায়েন্ট-সাইডে DataURL — প্রিভিউ, প্রিন্ট ও সেভ সবই এটা দিয়েই চলে।
      // আগের Firebase Storage ব্যাকআপটা সরানো হয়েছে: এই প্রজেক্টে Storage
      // প্রভিশনই করা নেই, তাই কলটা সবসময় ব্যর্থ হতো।
      const dataUrl = await readImageAsDataUrl(file);
      setHeaderInfo((prev) => ({ ...prev, logoUrl: dataUrl, logoPath: '' }));
      toast.success('প্রতিষ্ঠানের লোগো যুক্ত হয়েছে!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'লোগো লোড করা যায়নি।');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = () => {
    // logoPath আগের সেভ করা প্রশ্নপত্রে থাকতে পারে, তাই ফিল্ডটা খালি করে রাখি
    setHeaderInfo((prev) => ({ ...prev, logoUrl: '', logoPath: '' }));
    toast.success('লোগো মুছে ফেলা হয়েছে');
  };

  const handleMarksChange = useCallback((type, value) => {
    setMarksConfig((prev) => ({ ...prev, [type]: Math.max(0, Number(value) || 0) }));
  }, []);
  const addToCart = useCallback((q) => setCart((prev) => prev.some((x) => x.uniqueId === q.uniqueId) ? prev : [...prev, q]), []);
  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((q) => q.uniqueId !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);

  /**
   * সংরক্ষিত কাগজ খোলা — প্রশ্ন, শিরোনাম, নম্বর ও পেজ সেটআপ সবই ফিরে আসে।
   * টেমপ্লেট হলে শুধু বিন্যাস (হেডার/নম্বর/প্রিন্ট সেটআপ) প্রয়োগ হয় — বর্তমান
   * কার্টের প্রশ্নগুলো অক্ষত থাকে, কারণ টেমপ্লেটে আদৌ কোনো প্রশ্ন থাকে না।
   */
  const loadSavedPaper = useCallback((paper) => {
    if (!paper.isTemplate) {
      setCart(Array.isArray(paper.cart) ? paper.cart : []);
    }
    if (paper.headerInfo) setHeaderInfo({ ...DEFAULT_HEADER_INFO, ...paper.headerInfo });
    if (paper.marksConfig) setMarksConfig({ ...DEFAULT_MARKS, ...paper.marksConfig });
    if (paper.printSettings) setPrintSettings({ ...DEFAULT_PRINT_SETTINGS, ...paper.printSettings });
    setRestoredDraft(null);
    toast.success(paper.isTemplate ? `"${paper.name}" টেমপ্লেট প্রয়োগ হয়েছে` : `"${paper.name}" খোলা হয়েছে`);
  }, []);

  /** null পাঠালে ওই ফিল্ডের সম্পাদনা মুছে মূল লেখা ফিরে আসে */
  const handleEdit = useCallback((uniqueId, field, value) => {
    setEdits((prev) => {
      const forQuestion = { ...(prev[uniqueId] || {}) };
      if (value === null) delete forQuestion[field];
      else forQuestion[field] = value;

      const next = { ...prev };
      if (Object.keys(forQuestion).length === 0) delete next[uniqueId];
      else next[uniqueId] = forQuestion;
      return next;
    });
  }, []);

  /**
   * নতুন প্রশ্নপত্র — শুধু কার্ট নয়, কাগজের তথ্য ও নম্বরের হারও ডিফল্টে ফেরে।
   * আগে একমাত্র উপায় ছিল কার্টের ট্র্যাশ বাটন, যেটা প্রতিষ্ঠান/পরীক্ষার নাম
   * রেখে দিত — ফলে নতুন কাগজে পুরোনো শিরোনামই ছাপা হতো।
   */
  const startNewPaper = useCallback(async () => {
    const ok = await confirm({
      title: 'নতুন প্রশ্নপত্র শুরু করবেন?',
      message: 'নির্বাচিত সব প্রশ্ন ও কাগজের তথ্য মুছে যাবে। এটি ফেরানো যাবে না।',
      confirmLabel: 'হ্যাঁ, নতুন শুরু করি',
    });
    if (!ok) return;

    setCart([]);
    setHeaderInfo({
      ...DEFAULT_HEADER_INFO,
      // বিষয় বাছাই করা থাকলে নামটা রেখে দিই — না হলে ফাঁকা থেকে যেত, কারণ
      // অটো-ফিল ইফেক্টটা কেবল বিষয় বদলালেই চলে
      subject:
        activeSubjects.length > 1
          ? `${activeSubjects.map((s) => s.name || s.label).join(' + ')}`
          : activeSubjects[0]?.label || activeSubjects[0]?.name || '',
    });
    setMarksConfig({ ...DEFAULT_MARKS });
    setEdits({});
    setEditing(false);
    setRestoredDraft(null);
    setPaperInfoOpen(false);
    setMobileCartOpen(false);
  }, [confirm, activeSubjects]);

  /** একবারে অনেকগুলো — স্বয়ংক্রিয় বাছাই ও "সব যোগ করুন" দুটোই এটাই ব্যবহার করে */
  const addManyToCart = useCallback((items) => {
    setCart((prev) => {
      const seen = new Set(prev.map((q) => q.uniqueId));
      const fresh = items.filter((q) => !seen.has(q.uniqueId));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, []);

  const moveCartItem = useCallback((index, offset) => {
    setCart((prev) => {
      const target = index + offset;
      if (index < 0 || target < 0 || index >= prev.length || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);
  const moveCartItemUp = useCallback((index) => moveCartItem(index, -1), [moveCartItem]);
  const moveCartItemDown = useCallback((index) => moveCartItem(index, 1), [moveCartItem]);
  const toggleChapter = useCallback((id) => setSelectedChapters((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]), []);
  const toggleTopic = useCallback((id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]), []);
  const toggleBoard = useCallback((id) => setSelectedBoards((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]), []);
  const toggleYear = useCallback((id) => setSelectedYears((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]), []);
  // "রিসেট" — চ্যাপ্টার/বিষয় অক্ষত রেখে শুধু সংকীর্ণ ফিল্টারগুলো (টপিক/বোর্ড/সাল) সাফ করে
  const resetNarrowFilters = useCallback(() => {
    setSelectedTopics([]);
    setSelectedBoards([]);
    setSelectedYears([]);
  }, []);

  const knowledgePool = useMemo(
    () => subjectQuestions.filter((q) => q.type === 'k' || q.type === 'kh'),
    [subjectQuestions]
  );

  const handleSaveCompletedCq = useCallback((updatedCq) => {
    setCart((prev) => {
      const exists = prev.some((x) => x.uniqueId === updatedCq.uniqueId);
      if (exists) {
        return prev.map((x) => (x.uniqueId === updatedCq.uniqueId ? updatedCq : x));
      }
      return [...prev, updatedCq];
    });

    setEdits((prev) => ({
      ...prev,
      [updatedCq.uniqueId]: {
        ...(prev[updatedCq.uniqueId] || {}),
        q_ka: updatedCq.questions?.ka || '',
        q_kha: updatedCq.questions?.kha || '',
        q_ga: updatedCq.questions?.ga || '',
        q_gha: updatedCq.questions?.gha || '',
      },
    }));

    toast.success('পূর্ণ CQ (ক, খ, গ, ঘ) সংরক্ষিত হয়েছে!');
  }, []);

  // এক জায়গায় হিসাব — হেডার, সাইডবার, প্রিন্ট সবাই এটাই পড়ে
  const summary = useMemo(() => summarizeCart(cart, marksConfig), [cart, marksConfig]);
  const canOutput = cart.length > 0;

  const visibleUnadded = useMemo(
    () => filteredQuestions.slice(0, visibleCount).filter((q) => !cartIdSet.has(q.uniqueId)),
    [filteredQuestions, visibleCount, cartIdSet]
  );

  /**
   * PDF তৈরি এখন ব্রাউজারের নিজের প্রিন্ট ইঞ্জিন দিয়ে।
   *
   * আগে html2pdf (html2canvas) ব্যবহার হতো — সেটা পুরো পাতাকে একটা ছবিতে
   * রূপান্তর করে টুকরো করে। html2canvas 1.4.1 `column-count`, `break-inside`
   * বা `flex` — কোনোটাই পড়ে না (dist ফাইলে এই প্রোপার্টিগুলোর অস্তিত্বই নেই)।
   * ফলে বহুনির্বাচনীর দুই কলাম ও অপশনের বৃত্ত-লেখার সারি ভেঙে যেত, প্রশ্ন
   * মাঝখান থেকে কাটা পড়ত, আর মার্জিন মিলত না।
   *
   * ব্রাউজারের প্রিন্ট ইঞ্জিন এই তিনটাই ঠিকঠাক মানে, লেখা ভেক্টর থাকে
   * (ঝাপসা হয় না, সিলেক্ট করা যায়) এবং ফাইলও অনেক ছোট হয়।
   */
  const handleDownloadPdf = useCallback(() => {
    if (isDownloadingPdf) return;
    // ফাইলের নাম প্রিন্ট ডায়ালগে document.title থেকেই আসে
    const subject = (headerInfo.subject || 'question-paper')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-');
    const suffix = view === 'answers' ? 'answer-sheet' : view === 'omr' ? 'omr-sheet' : 'questions';
    const setSuffix = setCount > 1 && view !== 'omr' ? `-set-${SET_LABELS[activeSetIndex]}` : '';
    const previousTitle = document.title;
    document.title = `${subject || 'question-paper'}-${suffix}${setSuffix}`;

    setIsDownloadingPdf(true);
    const restore = () => {
      document.title = previousTitle;
      setIsDownloadingPdf(false);
    };
    window.addEventListener('afterprint', restore, { once: true });

    // লেআউট স্থির হওয়ার সুযোগ দিয়ে তবেই ডায়ালগ
    requestAnimationFrame(() => {
      window.print();
      // কিছু ব্রাউজারে afterprint আসে না — তাই নিরাপত্তা হিসেবে
      setTimeout(restore, 1000);
    });
  }, [headerInfo.subject, isDownloadingPdf, view, setCount, activeSetIndex]);


  // ── Authentication Check ──────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-violet-400" />
          <p className="text-xs font-bold text-slate-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: '/academic/question-builder' }} replace />;
  }

  // ── Output views: print preview / answer key / OMR sheet ──────────
  if (view === 'preview' || view === 'answers' || view === 'omr') {
    return (
      <div className="relative z-50 min-h-screen bg-slate-100">
        {/* Hide Navbar and Footer in Print Preview Mode */}
        <style>{`
          nav, footer { display: none !important; }
          body { background-color: #f1f5f9 !important; }
          @media print {
            /* @page এর মার্জিন এখানে নয় — প্রতিটি ডকুমেন্ট (প্রশ্নপত্র ও
               উত্তরপত্র) নিজের পেজ সেটআপ অনুযায়ী সেটা ঠিক করে। এখানে
               margin:0 থাকায় সেগুলোর সাথে দ্বন্দ্ব বাধত। */
            body, html, #root { margin: 0; background-color: white !important; }
            /* Force the dark layout background to be white during print to prevent black bars */
            .bg-\\[\\#0b0f19\\] { background-color: white !important; }
            .bg-\\[\\#020617\\] { background-color: white !important; }
          }
        `}</style>

        {/* PDF Viewer Header */}
        <div className="sticky top-0 z-40 w-full border-b shadow-sm print:hidden border-slate-300/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
            <button onClick={() => setView('build')} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              <ChevronLeft className="w-4 h-4" /> এডিটে ফিরে যান
            </button>

            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {[
                { id: 'preview', label: 'প্রশ্নপত্র' },
                { id: 'answers', label: 'উত্তরপত্র' },
                { id: 'omr', label: 'OMR শীট' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${view === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {(view === 'preview' || view === 'answers') && (
                <div className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5">
                  <Layers className="h-4 w-4 text-slate-500" />
                  <select
                    value={setCount}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setSetCount(n);
                      if (activeSetIndex >= n) setActiveSetIndex(0);
                    }}
                    title="কয়টি আলাদা সেট বানাতে চান (প্রতিটিতে MCQ ও অপশনের ক্রম আলাদা)"
                    className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n === 1 ? '১টি সেট' : `${enToBn(n)}টি সেট`}</option>)}
                  </select>
                  {setCount > 1 && (
                    <div className="flex gap-1 border-l border-slate-200 pl-1.5">
                      {SET_LABELS.slice(0, setCount).map((label, i) => (
                        <button
                          key={label}
                          onClick={() => setActiveSetIndex(i)}
                          title={i === 0 ? 'মূল ক্রম — এডিট করা যায়' : 'MCQ ও অপশনের ক্রম এলোমেলো'}
                          className={`h-6 w-6 rounded-md text-[11px] font-black transition ${activeSetIndex === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  {view === 'preview' && setCount > 1 && !canEditActiveSet && (
                    <span className="hidden border-l border-slate-200 pl-1.5 text-[11px] font-semibold text-slate-500 md:inline">
                      এলোমেলো — এডিট শুধু A-তে
                    </span>
                  )}
                </div>
              )}

              {view === 'preview' && (
                <>
                  <button
                    onClick={() => canEditActiveSet && setEditing((v) => !v)}
                    disabled={!canEditActiveSet}
                    title={canEditActiveSet ? 'প্রশ্নের লেখায় ক্লিক করে সম্পাদনা করুন' : 'শুধু সেট A-তে সম্পাদনা করা যায়'}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${editing && canEditActiveSet
                        ? 'border-amber-300 bg-amber-100 text-amber-800'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="hidden sm:inline">{editing && canEditActiveSet ? 'এডিট চালু' : 'এডিট'}</span>
                  </button>

                  <button
                    onClick={() => setPrintPanelOpen(true)}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
                  >
                    <Settings2 className="w-4 h-4" />
                    <span className="hidden sm:inline">পেজ সেটআপ</span>
                  </button>

                  <span
                    title="আনুমানিক — প্রকৃত প্রিন্টে সামান্য বেশি হতে পারে"
                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500"
                  >
                    <FileText className="w-4 h-4" />
                    ≈ {enToBn(estimatedPages)} পৃষ্ঠা
                  </span>
                </>
              )}

              <button
                onClick={() => window.print()}
                title="ব্রাউজারের প্রিন্ট — পৃষ্ঠা নম্বর ও পেজ ব্রেক সবচেয়ে নিখুঁত হয়"
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">প্রিন্ট</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                title="প্রিন্ট উইন্ডোতে গন্তব্য হিসেবে “Save as PDF” বেছে নিন"
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
              >
                <Download className="w-4 h-4" /> {isDownloadingPdf ? 'অপেক্ষা করুন...' : 'PDF সেভ করুন'}
              </button>
            </div>
          </div>

          {view === 'preview' && editing && canEditActiveSet && (
            <div className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-center">
              <p className="text-sm font-medium text-amber-800">
                ✏️ যে লেখা বদলাতে চান তাতে ক্লিক করুন। <strong>Esc</strong> বাতিল, <strong>Ctrl+Enter</strong> সেভ।
                {Object.keys(edits).length > 0 && (
                  <> · <button onClick={() => setEdits({})} className="underline font-bold">সব সম্পাদনা মুছুন</button></>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-8 print:p-0" id="pdf-content">
          {view === 'preview' ? (
            <PrintableView
              headerInfo={headerInfo}
              cart={activeCart}
              summary={summary}
              marksConfig={marksConfig}
              settings={printSettings}
              edits={{}}
              editing={editing && canEditActiveSet}
              onEdit={canEditActiveSet ? handleEdit : undefined}
              onContentHeightChange={setContentHeightPx}
              setLabel={setCount > 1 ? SET_LABELS[activeSetIndex] : null}
            />
          ) : view === 'omr' ? (
            <OmrAnswerSheet headerInfo={headerInfo} cart={cart} settings={printSettings} />
          ) : (
            <AnswerSheetView
              headerInfo={headerInfo}
              cart={activeCart}
              page={resolvePage(printSettings)}
              setLabel={setCount > 1 ? SET_LABELS[activeSetIndex] : null}
            />
          )}
        </div>

        <PrintSettingsPanel
          isOpen={printPanelOpen}
          onClose={() => setPrintPanelOpen(false)}
          settings={printSettings}
          onChange={setPrintSettings}
          onReset={() => setPrintSettings({ ...DEFAULT_PRINT_SETTINGS })}
        />
      </div>
    );
  }

  // ── Build view: question library ──────────────────────────────────
  const libraryEmptyReason = !selectedSubjectId
    ? 'subject'
    : selectedChapters.length === 0
      ? 'chapter'
      : 'empty';

  return (
    <div className="qb-root bg-[#0b0f19] font-sans text-slate-200 selection:bg-indigo-500/35" style={rootStyle}>
      <style dangerouslySetInnerHTML={{ __html: BUILDER_CSS }} />

      <div className="qb-app mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <BuilderHeader
          paperTitle={headerInfo.examName || headerInfo.schoolName}
          totalQuestions={summary.totalQuestions}
          totalMarks={summary.totalMarks}
          canOutput={canOutput}
          onOpenPaperInfo={() => setPaperInfoOpen(true)}
          onOpenCart={() => setMobileCartOpen(true)}
          onPreview={() => setView('preview')}
          onNewPaper={startNewPaper}
          onOpenSaved={() => setSavedPapersOpen(true)}
        />

        {restoredDraft && cart.length > 0 && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5">
            <History className="h-4 w-4 shrink-0 text-amber-400" />
            <p className="min-w-0 flex-1 text-[12px] font-semibold text-amber-100">
              {relativeTime(restoredDraft.savedAt)} খসড়া ফিরিয়ে আনা হয়েছে — <span className="font-black">{enToBn(restoredDraft.count)}</span> টি প্রশ্ন আগে থেকেই নির্বাচিত।
            </p>
            <button
              type="button"
              onClick={startNewPaper}
              className="shrink-0 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-[11px] font-extrabold text-amber-100 transition hover:bg-amber-500/30"
            >
              নতুন শুরু করুন
            </button>
            <button
              type="button"
              onClick={() => setRestoredDraft(null)}
              aria-label="বার্তাটি বন্ধ করুন"
              className="shrink-0 rounded-lg p-1 text-amber-300/70 transition hover:bg-amber-500/20 hover:text-amber-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="qb-panes">
          <FilterSidebar
            isMobileOpen={mobileFilterOpen}
            onMobileClose={() => setMobileFilterOpen(false)}
            levels={levels}
            selectedLevel={effectiveLevel}
            setSelectedLevel={setSelectedLevel}
            selectedProgram={selectedProgram}
            setSelectedProgram={setSelectedProgram}
            selectedSubjectIds={selectedSubjectIds}
            toggleSubjectId={toggleSubjectId}
            selectAllSubjects={selectAllSubjects}
            unselectAllSubjects={unselectAllSubjects}
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            availableSubjects={availableSubjects}
            activeSubjects={activeSubjects}
            chapters={chapters}
            chapterCounts={chapterCounts}
            selectedChapters={selectedChapters}
            toggleChapter={toggleChapter}
            availableTopics={availableTopics}
            selectedTopics={selectedTopics}
            toggleTopic={toggleTopic}
            availableBoards={availableBoards}
            selectedBoards={selectedBoards}
            toggleBoard={toggleBoard}
            availableYears={availableYears}
            selectedYears={selectedYears}
            toggleYear={toggleYear}
            onResetFilters={resetNarrowFilters}
          />

          <section ref={listPaneRef} className="qb-list-pane custom-scrollbar pr-0.5">
            <div className="qb-list-sticky">
              <Toolbar
                total={filteredQuestions.length}
                isFiltered={isQuestionLibraryFiltered}
                filterSummary={questionLibrarySummary}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenFilters={() => setMobileFilterOpen(true)}
              />

              {selectedChapters.length > 0 && (
                /* এডমিশনে বিষয়ের নাম অনুসারে ট্যাব, অন্যথায় CQ/MCQ */
                <div className="flex flex-wrap items-center gap-2">
                  {isAdmission ? (
                    <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto custom-scrollbar rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 shadow-inner shadow-black/20">
                      <CategoryTab
                        active={selectedSubjectTab === 'all'}
                        onClick={() => setSelectedSubjectTab('all')}
                        label="সব বিষয়"
                        mobileLabel="সব"
                        count={enToBn(scopedQuestions.length)}
                      />
                      {activeSubjects.map((sub) => {
                        const count = scopedQuestions.filter(
                          (q) =>
                            q.subject === sub.id ||
                            q.subjectId === sub.id ||
                            sub.chapters?.some((c) => c.id === q.chapterId)
                        ).length;
                        return (
                          <CategoryTab
                            key={sub.id}
                            active={selectedSubjectTab === sub.id}
                            onClick={() => setSelectedSubjectTab(sub.id)}
                            label={`${sub.emoji ? `${sub.emoji} ` : ''}${sub.name || sub.label}`}
                            mobileLabel={sub.name || sub.label}
                            count={enToBn(count)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex min-w-0 flex-1 gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 shadow-inner shadow-black/20">
                      <CategoryTab active={selectedType === 'all'} onClick={() => setSelectedType('all')} label="সব" mobileLabel="সব" count={enToBn(questionCounts.all)} />
                      <CategoryTab active={selectedType === 'cq'} onClick={() => setSelectedType('cq')} label="সৃজনশীল" mobileLabel="CQ" count={enToBn(questionCounts.cq)} />
                      <CategoryTab active={selectedType === 'mcq'} onClick={() => setSelectedType('mcq')} label="MCQ" mobileLabel="MCQ" count={enToBn(questionCounts.mcq)} />
                      <CategoryTab active={selectedType === 'k_kh'} onClick={() => setSelectedType('k_kh')} label="জ্ঞান/অনু." mobileLabel="ক/খ" count={enToBn(questionCounts.kKh)} />
                    </div>
                  )}

                  <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 shadow-inner shadow-black/20">
                    <button
                      type="button"
                      onClick={() => setAutoPickOpen(true)}
                      disabled={filteredQuestions.length === 0}
                      title="ফিল্টার থেকে এলোমেলোভাবে নির্দিষ্ট সংখ্যক প্রশ্ন নিন"
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 sm:py-2 text-[11px] font-extrabold text-violet-300 transition hover:bg-violet-500/15 hover:text-violet-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">স্বয়ংক্রিয়</span>
                    </button>
                    <span className="h-4 w-px shrink-0 bg-white/10" />
                    <button
                      type="button"
                      onClick={() => addManyToCart(visibleUnadded)}
                      disabled={visibleUnadded.length === 0}
                      title="তালিকায় এখন দেখা যাচ্ছে এমন সব প্রশ্ন যোগ করুন"
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2.5 sm:py-2 text-[11px] font-extrabold text-slate-300 transition hover:bg-white/[0.06] hover:text-white active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                      +{enToBn(visibleUnadded.length)}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pb-5">
              {loading && Array.from({ length: 4 }, (_, index) => <QuestionCardSkeleton key={index} />)}

              {!loading && filteredQuestions.length === 0 && (
                <QuestionLibraryEmpty
                  reason={libraryEmptyReason}
                  onAction={() => setMobileFilterOpen(true)}
                />
              )}

              {!loading && filteredQuestions.slice(0, visibleCount).map((q) => (
                <ProfessionalQuestionCard
                  key={q.uniqueId}
                  q={q}
                  mark={markOf(q, marksConfig)}
                  isAdded={cartIdSet.has(q.uniqueId)}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  usageIndex={usageIndex}
                  onCompleteCq={(cq) => setCompletingCq(cq)}
                />
              ))}

              {!loading && filteredQuestions.length > visibleCount && (
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + 20)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 py-3 text-xs font-extrabold text-slate-400 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-200"
                >
                  <ChevronDown className="h-4 w-4" />
                  আরো {enToBn(Math.min(20, filteredQuestions.length - visibleCount))} টি দেখান
                  <span className="text-slate-600">({enToBn(filteredQuestions.length - visibleCount)} টি বাকি)</span>
                </button>
              )}
            </div>
          </section>

          <RightSidebar
            cart={cart}
            summary={summary}
            clearCart={clearCart}
            onPreview={() => setView('preview')}
            onGenerate={() => setView('answers')}
            onBrowse={() => setMobileFilterOpen(true)}
            isOpen={mobileCartOpen}
            onClose={() => setMobileCartOpen(false)}
            onRemove={removeFromCart}
            onMoveUp={moveCartItemUp}
            onMoveDown={moveCartItemDown}
            usageIndex={usageIndex}
            onCompleteCq={(cq) => setCompletingCq(cq)}
          />
        </div>
      </div>

      <PaperInfoPanel
        isOpen={paperInfoOpen}
        onClose={() => setPaperInfoOpen(false)}
        headerInfo={headerInfo}
        onHeaderChange={handleHeaderChange}
        marksConfig={marksConfig}
        onMarksChange={handleMarksChange}
        summary={summary}
        onLogoUpload={handleLogoUpload}
        onLogoRemove={handleLogoRemove}
        logoUploading={logoUploading}
      />

      <AutoPickDialog
        isOpen={autoPickOpen}
        onClose={() => setAutoPickOpen(false)}
        pool={filteredQuestions}
        cartIdSet={cartIdSet}
        marksConfig={marksConfig}
        onConfirm={addManyToCart}
      />

      <SavedPapersPanel
        isOpen={savedPapersOpen}
        onClose={() => setSavedPapersOpen(false)}
        uid={currentUser?.uid}
        cart={cart}
        headerInfo={headerInfo}
        marksConfig={marksConfig}
        printSettings={printSettings}
        onLoad={loadSavedPaper}
        confirm={confirm}
      />

      <CompleteCQModal
        isOpen={Boolean(completingCq)}
        onClose={() => setCompletingCq(null)}
        cq={completingCq}
        knowledgePool={knowledgePool}
        onSave={handleSaveCompletedCq}
      />

      {confirmDialog}
    </div>
  );
}
