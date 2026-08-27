import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { normalizeChapterKey } from '../../pages/Academic/QuestionBuilder/useBuilderQuestions';
import { 
  GraduationCap, Zap, Plus, Trash2, Edit, Save, 
  RotateCcw, Check, X, Search, Sparkles, Layers,
  CheckCircle2, ArrowRight, Eye, ShieldAlert, Tag, 
  BookOpen, Clock, Loader2, ArrowUp, ArrowDown, Calendar, CalendarDays,
  SlidersHorizontal, CheckCircle, ArrowLeft, Stethoscope,
  Dna, FlaskConical, Globe, BookCheck, FileText, ChevronRight, ChevronDown, Filter, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  DEFAULT_ADMISSION_PROGRAMS, 
  DEFAULT_ADMISSION_SHORTCUTS,
  DEFAULT_ADMISSION_SESSIONS,
  DEFAULT_MEDICAL_CONFIG
} from '../../hooks/useAdmissionData';
import AdmissionQuestionManager from './AdmissionQuestionManager';
import ExamScheduleManager from './ExamScheduleManager';
import HighlightedLinesUploaderModal from './HighlightedLinesUploaderModal';
import HighlightedLinesManagerTab from './HighlightedLinesManagerTab';

// ─── Default Subjects for All Admission Programs ─────────────────────────────────
export const DEFAULT_PROGRAM_SUBJECTS = {
  medical: DEFAULT_MEDICAL_CONFIG.subjects,
  engineering: [
    {
      id: 'higher_math',
      name: 'উচ্চতর গণিত (Higher Math)',
      subTitle: 'বুয়েট, কুয়েট, রুয়েট, চুয়েট ইঞ্জিনিয়ারিং গণিত',
      marks: 40,
      recommendedBooks: ['এস ইউ আহাম্মদ', 'অক্ষরপত্র প্রকাশনী', 'কেতাব উদ্দিন'],
      chapters: [
        { id: 'eng-m-1', paper: '১ম পত্র', name: 'অধ্যায় ১: ম্যাট্রিক্স ও নির্ণায়ক', highYieldTopics: ['ক্রেমারের নিয়ম', 'বিপরীত ম্যাট্রিক্স'], repeatedQuestionsCount: 15, keyFacts: ['A^-1 = adj(A) / det(A)'] },
        { id: 'eng-m-3', paper: '১ম পত্র', name: 'অধ্যায় ৩: সরলরেখা', highYieldTopics: ['লম্ব দূরত্ব', 'ছেদবিন্দু'], repeatedQuestionsCount: 20, keyFacts: ['লম্ব দূরত্ব সূত্র d = |Ax1 + By1 + C| / √(A^2 + B^2)'] },
        { id: 'eng-m-9', paper: '১ম পত্র', name: 'অধ্যায় ৯: অন্তরীকরণ (Differentiation)', highYieldTopics: ['L\'Hospital Rule', 'চরমমান'], repeatedQuestionsCount: 28, keyFacts: ['0/0 ফর্মে L\'Hospital প্রয়োগ করা যায়'] },
        { id: 'eng-m-10', paper: '১ম পত্র', name: 'অধ্যায় ১০: যোগজীকরণ (Integration)', highYieldTopics: ['নির্দিষ্ট যৌগজ', 'ক্ষেত্রফল'], repeatedQuestionsCount: 25, keyFacts: ['∫ e^x [f(x) + f\'(x)] dx = e^x f(x) + C'] },
        { id: 'eng-m2-3', paper: '২য় পত্র', name: 'অধ্যায় ৩: জটিল সংখ্যা (Complex Numbers)', highYieldTopics: ['মডুলাস ও আর্গুমেন্ট', 'এককের ঘনমূল'], repeatedQuestionsCount: 18, keyFacts: ['1 + ω + ω^2 = 0'] },
        { id: 'eng-m2-4', paper: '২য় পত্র', name: 'অধ্যায় ৪: বহুপদী সমীকরণ', highYieldTopics: ['মূলের প্রকৃতি', 'নিশ্চায়ক'], repeatedQuestionsCount: 22, keyFacts: ['D = b^2 - 4ac'] }
      ]
    },
    {
      id: 'physics',
      name: 'পদার্থবিজ্ঞান (Physics)',
      subTitle: 'ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান ও কনসেপ্ট',
      marks: 40,
      recommendedBooks: ['ড. শাহজাহান তপন', 'ইসহাক স্যার'],
      chapters: [
        { id: 'eng-p-2', paper: '১ম পত্র', name: 'অধ্যায় ২: ভেক্টর', highYieldTopics: ['ডট ও ক্রস গুণন', 'নদী-নৌকা'], repeatedQuestionsCount: 20, keyFacts: ['A . B = 0 হলে পরস্পর লম্ব'] },
        { id: 'eng-p-4', paper: '১ম পত্র', name: 'অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা', highYieldTopics: ['ব্যাংকিং কোণ', 'জড়তার ভ্রামক'], repeatedQuestionsCount: 25, keyFacts: ['tan θ = v^2 / (rg)'] },
        { id: 'eng-p2-1', paper: '২য় পত্র', name: 'অধ্যায় ১: তাপগতিবিদ্যা', highYieldTopics: ['কার্নো ইঞ্জিনের দক্ষতা', 'এনট্রপি'], repeatedQuestionsCount: 22, keyFacts: ['η = 1 - T2/T1'] }
      ]
    },
    {
      id: 'chemistry',
      name: 'রসায়ন (Chemistry)',
      subTitle: 'ইঞ্জিনিয়ারিং রসায়ন ও রিয়্যাকশন',
      marks: 40,
      recommendedBooks: ['ড. সরোজ কান্তি সিংহ হাজারী', 'কবীর স্যার'],
      chapters: [
        { id: 'eng-c-2', paper: '১ম পত্র', name: 'অধ্যায় ২: গুণগত রসায়ন', highYieldTopics: ['কোয়ান্টাম সংখ্যা', 'দ্রাব্যতা গুণফল (Ksp)'], repeatedQuestionsCount: 22, keyFacts: ['Kip > Ksp হলে অধঃক্ষেপ পড়বে'] },
        { id: 'eng-c2-2', paper: '২য় পত্র', name: 'অধ্যায় ২: জৈব রসায়ন', highYieldTopics: ['মারকভনিকভ নীতি', 'বেনজিন প্রতিস্থাপন'], repeatedQuestionsCount: 30, keyFacts: ['লুকাস বিকারক = অনার্দ্র ZnCl2 + গাঢ় HCl'] }
      ]
    },
    {
      id: 'english',
      name: 'ইংরেজি (English)',
      subTitle: 'বুয়েট প্রিলিমিনারি ও বেসিক ইংলিশ',
      marks: 20,
      recommendedBooks: ['Master English', 'Cliffs TOEFL'],
      chapters: [
        { id: 'eng-e-1', paper: 'Grammar', name: 'Subject-Verb Agreement', highYieldTopics: ['Neither-Nor', 'One of the'], repeatedQuestionsCount: 15, keyFacts: ['One of the + Plural Noun + Singular Verb'] }
      ]
    }
  ],
  'varsity-a': [
    {
      id: 'physics',
      name: 'পদার্থবিজ্ঞান (Physics)',
      subTitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট পদার্থবিজ্ঞান',
      marks: 25,
      chapters: [
        { id: 'va-p-1', paper: '১ম পত্র', name: 'অধ্যায় ২: ভেক্টর', highYieldTopics: ['ডট গুণন', 'স্কেলার ট্রিপল প্রোডাক্ট'], repeatedQuestionsCount: 15, keyFacts: ['A . (B x C) = 0 হলে ভেক্টর তিনটি সমতলীয়'] },
        { id: 'va-p-4', paper: '১ম পত্র', name: 'অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা', highYieldTopics: ['ঘর্ষণ বল', 'কৌণিক ভরবেগ'], repeatedQuestionsCount: 18, keyFacts: ['L = Iω'] }
      ]
    },
    {
      id: 'chemistry',
      name: 'রসায়ন (Chemistry)',
      subTitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট রসায়ন',
      marks: 25,
      chapters: [
        { id: 'va-c-2', paper: '১ম পত্র', name: 'অধ্যায় ২: গুণগত রসায়ন', highYieldTopics: ['রিডবার্গ ধ্রুবক', 'দ্রাব্যতা'], repeatedQuestionsCount: 16, keyFacts: ['1/λ = Rh (1/n1^2 - 1/n2^2)'] }
      ]
    },
    {
      id: 'math',
      name: 'উচ্চতর গণিত (Higher Math)',
      subTitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট গণিত',
      marks: 25,
      chapters: [
        { id: 'va-m-1', paper: '১ম পত্র', name: 'অধ্যায় ৯: অন্তরীকরণ', highYieldTopics: ['লিমিট', 'চরমমান'], repeatedQuestionsCount: 20, keyFacts: ['lim x->0 (sin x / x) = 1'] }
      ]
    },
    {
      id: 'biology',
      name: 'জীববিজ্ঞান (Biology)',
      subTitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট জীববিজ্ঞান',
      marks: 25,
      chapters: [
        { id: 'va-b-1', paper: 'উদ্ভিদবিজ্ঞান', name: 'অধ্যায় ১: কোষ ও এর গঠন', highYieldTopics: ['DNA ও RNA', 'প্রোটিন সংশ্লেষণ'], repeatedQuestionsCount: 15, keyFacts: ['DNA ডাবল হেলিক্সের ব্যাস ২ nm'] }
      ]
    }
  ],
  nursing: [
    {
      id: 'biology',
      name: 'জীববিজ্ঞান ও সাধারণ বিজ্ঞান (Science)',
      subTitle: 'নার্সিং ভর্তি সাধারণ বিজ্ঞান ও জীববিজ্ঞান',
      marks: 30,
      chapters: [
        { id: 'nur-s-1', paper: 'সাধারণ বিজ্ঞান', name: 'মানবদেহ ও পুষ্টি', highYieldTopics: ['রক্ত সংবহন', 'ভিটামিন ও খনিজ'], repeatedQuestionsCount: 20, keyFacts: ['রক্তের সার্বজনীন দাতা O- এবং গ্রহীতা AB+'] }
      ]
    },
    {
      id: 'english',
      name: 'ইংরেজি (English)',
      subTitle: 'নার্সিং ভর্তি ইংরেজি প্রস্তুতি',
      marks: 20,
      chapters: [
        { id: 'nur-e-1', paper: 'Grammar', name: 'Parts of Speech & Preposition', highYieldTopics: ['Appropriate Preposition', 'Article'], repeatedQuestionsCount: 22, keyFacts: ['Abide by the rules'] }
      ]
    },
    {
      id: 'gk',
      name: 'সাধারণ জ্ঞান (General Knowledge)',
      subTitle: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী',
      marks: 20,
      chapters: [
        { id: 'nur-g-1', paper: 'বাংলাদেশ বিষয়াবলী', name: 'মুক্তিযুদ্ধ ও বঙ্গবন্ধু', highYieldTopics: ['৭ই মার্চের ভাষণ', '১১টি সেক্টর'], repeatedQuestionsCount: 25, keyFacts: ['মুক্তিযুদ্ধের প্রধান সেনাপতি ছিলেন এম এ জি ওসমানী'] }
      ]
    },
    {
      id: 'math',
      name: 'সাধারণ গণিত (General Math)',
      subTitle: 'নার্সিং ভর্তি পাটিগণিত ও বীজগণিত',
      marks: 10,
      chapters: [
        { id: 'nur-m-1', paper: 'পাটিগণিত', name: 'শতকরা ও লাভ-ক্ষতি', highYieldTopics: ['ঐকিক নিয়ম', 'সুদকষা'], repeatedQuestionsCount: 15, keyFacts: ['সরল সুদ I = Pnr'] }
      ]
    }
  ],
  gst: [
    {
      id: 'physics',
      name: 'পদার্থবিজ্ঞান (Physics)',
      subTitle: 'জিএসটি গুচ্ছ পদার্থবিজ্ঞান প্রস্তুতি',
      marks: 25,
      chapters: [
        { id: 'gst-p-1', paper: '১ম পত্র', name: 'ভেক্টর ও গতিবিদ্যা', highYieldTopics: ['প্রাস', 'আপেক্ষিক বেগ'], repeatedQuestionsCount: 15, keyFacts: ['H_max = v^2 sin^2 θ / 2g'] }
      ]
    },
    {
      id: 'chemistry',
      name: 'রসায়ন (Chemistry)',
      subTitle: 'জিএসটি গুচ্ছ রসায়ন প্রস্তুতি',
      marks: 25,
      chapters: [
        { id: 'gst-c-1', paper: '১ম পত্র', name: 'মৌলের পর্যায়বৃত্ত ধর্ম', highYieldTopics: ['আয়নীকরণ শক্তি', 'ইলেক্ট্রন আসক্তি'], repeatedQuestionsCount: 18, keyFacts: ['বাম থেকে ডানে পারমাণবিক ব্যাসার্ধ হ্রাস পায়'] }
      ]
    }
  ],
  agri: [
    {
      id: 'biology',
      name: 'জীববিজ্ঞান (Biology)',
      subTitle: 'কৃষি গুচ্ছ সমন্বিত জীববিজ্ঞান',
      marks: 30,
      chapters: [
        { id: 'ag-b-1', paper: 'উদ্ভিদবিজ্ঞান', name: 'উদ্ভিদ শারীরতত্ত্ব ও প্রজনন', highYieldTopics: ['সালোকসংশ্লেষণ', 'শ্বসন'], repeatedQuestionsCount: 25, keyFacts: ['C4 উদ্ভিদের প্রথম স্থায়ী পদার্থ অক্সালো অ্যাসিটিক এসিড'] }
      ]
    },
    {
      id: 'chemistry',
      name: 'রসায়ন (Chemistry)',
      subTitle: 'কৃষি গুচ্ছ রসায়ন প্রস্তুতি',
      marks: 20,
      chapters: [
        { id: 'ag-c-1', paper: '১ম পত্র', name: 'পরিবেশ রসায়ন ও দ্রবণ', highYieldTopics: ['বয়েল ও চার্লস সূত্র', 'আদর্শ গ্যাস'], repeatedQuestionsCount: 15, keyFacts: ['PV = nRT'] }
      ]
    }
  ]
};

const TRACK_OPTIONS = [
  { id: 'medical', label: '🩺 মেডিকেল ও ডেন্টাল' },
  { id: 'hand_calc', label: '⚡ হ্যান্ড ক্যালকুলেশন' },
  { id: 'engineering', label: '⚙️ ইঞ্জিনিয়ারিং ট্রিকস' },
  { id: 'varsity_a', label: '🔬 ভার্সিটি ক ম্যাথ' },
  { id: 'gk_english', label: '🇧🇩 ইংলিশ ও জিকে' }
];

const EXAM_TYPE_OPTIONS = ['MBBS', 'BDS', 'BUET', 'CKET', 'DU A', 'GST', 'Agri', 'Nursing', 'Others'];

export default function AdmissionManager() {
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();

  // Navigation State
  const [selectedProgramId, setSelectedProgramId] = useState(null); // null = top level overview
  const [activeTab, setActiveTab] = useState('programs'); // 'programs' | 'shortcuts' | 'sessions' | 'questions'
  const [programSubTab, setProgramSubTab] = useState('subjects'); // 'subjects' | 'sessions' | 'shortcuts' | 'info'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Programs State ──────────────────────────────────────────────────────────
  const [programs, setPrograms] = useState(DEFAULT_ADMISSION_PROGRAMS);
  const [searchProgram, setSearchProgram] = useState('');
  const [programStatusFilter, setProgramStatusFilter] = useState('all');
  const [editingProgram, setEditingProgram] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [programForm, setProgramForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    path: '',
    emoji: '🎓',
    badge: '',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    iconBg: 'from-indigo-500 to-purple-600',
    tagsText: '',
    tags: [],
    active: true,
    order: 1
  });

  // ─── Shortcuts State ────────────────────────────────────────────────────────
  const [shortcuts, setShortcuts] = useState(DEFAULT_ADMISSION_SHORTCUTS);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchShortcut, setSearchShortcut] = useState('');
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [showShortcutModal, setShowShortcutModal] = useState(false);
  const [shortcutForm, setShortcutForm] = useState({
    id: '',
    track: 'medical',
    trackLabel: 'মেডিকেল ও ডেন্টাল',
    title: '',
    technique: '',
    category: '',
    subject: 'Biology',
    detailsText: '',
    reference: ''
  });

  // ─── Sessions State ─────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState(DEFAULT_ADMISSION_SESSIONS);
  const [sessionExamType, setSessionExamType] = useState('all');
  const [searchSession, setSearchSession] = useState('');
  const [editingSession, setEditingSession] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    id: '',
    examType: 'MBBS',
    session: '',
    shortYear: '',
    totalQuestions: 100,
    examDate: '',
    status: 'সম্পূর্ণ প্রশ্নব্যাংক',
    active: true
  });

  // ─── Program-Wise Subjects & Chapters State ─────────────────────────────────
  const [programSubjectsMap, setProgramSubjectsMap] = useState(DEFAULT_PROGRAM_SUBJECTS);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // Subject Modal State
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    name: '',
    marks: 25,
    subTitle: '',
    recommendedBooksText: ''
  });

  // Chapter Modal State (Clean & simplified)
  const [editingChapter, setEditingChapter] = useState(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({
    id: '',
    paper: '১ম পত্র',
    name: '',
    repeatedQuestionsCount: 30
  });

  const [showHighlightedLinesModal, setShowHighlightedLinesModal] = useState(false);
  const [highlightedModalTarget, setHighlightedModalTarget] = useState({ programId: 'medical', subjectId: '', chapterId: '' });
  
  // Live questions from Firestore question_bank collection
  const { data: allQuestionBankQuestions = [] } = useQuery({
    queryKey: ['admin_admission_question_bank_counts'],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'question_bank'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn('Failed to fetch question_bank counts in AdmissionManager:', err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 3
  });

  const getLiveChapterQuestionsCount = (subjectId, chapterObj) => {
    if (!chapterObj) return 0;
    const cId = String(chapterObj.id || '').toLowerCase().trim();
    const cNorm = normalizeChapterKey(cId);
    const cName = String(chapterObj.name || '').toLowerCase().trim();
    const cleanTitle = cName.split(':')[1]?.trim().toLowerCase() || cName;
    const targetSub = String(subjectId || '').replace('adm-', '').toLowerCase().trim();

    const matched = allQuestionBankQuestions.filter(q => {
      const qSub = String(q.subject || '').toLowerCase().trim();
      const qSubOpt = String(q.subjectOptionId || '').toLowerCase().trim();
      const matchSub =
        !targetSub ||
        qSub === targetSub ||
        qSub.includes(targetSub) ||
        targetSub.includes(qSub) ||
        qSubOpt.includes(targetSub) ||
        (targetSub === 'biology' && (qSub.includes('bio') || qSub.includes('bot') || qSub.includes('zoo'))) ||
        (targetSub === 'physics' && qSub.includes('phy')) ||
        (targetSub === 'chemistry' && qSub.includes('chem')) ||
        (targetSub === 'higher_math' && (qSub.includes('math') || qSub.includes('hm')));

      if (!matchSub) return false;

      const qChapId = String(q.chapterId || '').toLowerCase().trim();
      const qChapNorm = normalizeChapterKey(qChapId);
      const qChapName = String(q.chapter || q.chapterName || '').toLowerCase().trim();
      const qTopic = String(q.topic || '').toLowerCase().trim();

      return (
        (cId && qChapId === cId) ||
        (cNorm && qChapNorm === cNorm) ||
        (cName && qChapName === cName) ||
        (cleanTitle && qChapName.includes(cleanTitle)) ||
        (cleanTitle && qTopic.includes(cleanTitle))
      );
    });

    return matched.length > 0 ? matched.length : (chapterObj.repeatedQuestionsCount || 0);
  };

  const handleOpenHighlightedLinesUploader = (programId, subjectId, chapterId) => {
    setHighlightedModalTarget({
      programId: programId || selectedProgramId || 'medical',
      subjectId: subjectId || currentSelectedSubject?.id || '',
      chapterId: chapterId || ''
    });
    setShowHighlightedLinesModal(true);
  };

  useEffect(() => {
    fetchAdmissionData();
  }, []);

  const fetchAdmissionData = async () => {
    setLoading(true);
    try {
      // 1. Programs
      const progSnap = await getDoc(doc(db, 'admin_settings', 'admission'));
      const activePrograms = (progSnap.exists() && progSnap.data().programs?.length)
        ? progSnap.data().programs
        : DEFAULT_ADMISSION_PROGRAMS;
      setPrograms(activePrograms);

      // 2. Shortcuts
      const shortSnap = await getDoc(doc(db, 'admin_settings', 'admission_shortcuts'));
      if (shortSnap.exists() && shortSnap.data().list?.length) {
        setShortcuts(shortSnap.data().list);
      } else {
        setShortcuts(DEFAULT_ADMISSION_SHORTCUTS);
      }

      // 3. Sessions
      const sessSnap = await getDoc(doc(db, 'admin_settings', 'admission_sessions'));
      if (sessSnap.exists() && sessSnap.data().list?.length) {
        setSessions(sessSnap.data().list);
      } else {
        setSessions(DEFAULT_ADMISSION_SESSIONS);
      }

      // 4. Load program configs map dynamically for ALL programs
      const loadedMap = { ...DEFAULT_PROGRAM_SUBJECTS };
      const allProgIds = Array.from(new Set([
        ...activePrograms.map(p => p.id),
        ...Object.keys(DEFAULT_PROGRAM_SUBJECTS)
      ]));

      const programSnaps = await Promise.all(
        allProgIds.map(pId => {
          const docName = pId === 'medical' ? 'medical_config' : `program_config_${pId}`;
          return getDoc(doc(db, 'admin_settings', docName)).catch(() => null);
        })
      );

      allProgIds.forEach((pId, i) => {
        const pSnap = programSnaps[i];
        if (pSnap?.exists() && pSnap.data().subjects?.length) {
          loadedMap[pId] = pSnap.data().subjects;
        }
      });
      setProgramSubjectsMap(loadedMap);
    } catch (err) {
      console.error('Error fetching admission data:', err);
      toast.error('ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Current Selected Program
  const currentSelectedProgram = useMemo(() => {
    return programs.find(p => p.id === selectedProgramId) || null;
  }, [programs, selectedProgramId]);

  // Current Program Subjects
  const currentProgramSubjects = useMemo(() => {
    if (!selectedProgramId) return [];
    return programSubjectsMap[selectedProgramId] || DEFAULT_PROGRAM_SUBJECTS[selectedProgramId] || [];
  }, [programSubjectsMap, selectedProgramId]);

  // Current Subject inside selected Program
  const currentSelectedSubject = useMemo(() => {
    if (!currentProgramSubjects.length) return null;
    return currentProgramSubjects.find(s => s.id === selectedSubjectId) || currentProgramSubjects[0] || null;
  }, [currentProgramSubjects, selectedSubjectId]);

  // Update selectedSubjectId automatically when program or subject list changes
  useEffect(() => {
    if (currentProgramSubjects && currentProgramSubjects.length > 0) {
      if (!currentProgramSubjects.some(s => s.id === selectedSubjectId)) {
        setSelectedSubjectId(currentProgramSubjects[0].id);
      }
    } else {
      setSelectedSubjectId('');
    }
  }, [selectedProgramId, currentProgramSubjects, selectedSubjectId]);

  // ─── Save Handlers ──────────────────────────────────────────────────────────
  const savePrograms = async (updatedList) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'admission'), {
        programs: updatedList,
        updatedAt: new Date().toISOString()
      });
      setPrograms(updatedList);
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'programs'] });
      toast.success('প্রোগ্রামসমূহ সংরক্ষণ করা হয়েছে');
    } catch (err) {
      console.error('Error saving programs:', err);
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
      setShowProgramModal(false);
      setEditingProgram(null);
    }
  };

  const saveShortcuts = async (updatedList) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'admission_shortcuts'), {
        list: updatedList,
        updatedAt: new Date().toISOString()
      });
      setShortcuts(updatedList);
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'shortcuts'] });
      toast.success('শর্টকাটসমূহ সংরক্ষণ করা হয়েছে');
    } catch (err) {
      console.error('Error saving shortcuts:', err);
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
      setShowShortcutModal(false);
      setEditingShortcut(null);
    }
  };

  const saveSessions = async (updatedList) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'admission_sessions'), {
        list: updatedList,
        updatedAt: new Date().toISOString()
      });
      setSessions(updatedList);
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'sessions'] });
      toast.success('সেশনসমূহ সংরক্ষণ করা হয়েছে');
    } catch (err) {
      console.error('Error saving sessions:', err);
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
      setShowSessionModal(false);
      setEditingSession(null);
    }
  };

  const saveProgramSubjects = async (programId, updatedSubjects) => {
    setSaving(true);
    try {
      const docName = programId === 'medical' ? 'medical_config' : `program_config_${programId}`;
      await setDoc(doc(db, 'admin_settings', docName), {
        subjects: updatedSubjects,
        updatedAt: new Date().toISOString()
      });
      setProgramSubjectsMap(prev => ({
        ...prev,
        [programId]: updatedSubjects
      }));
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission'] });
      toast.success('বিষয় ও অধ্যায়সমূহ সংরক্ষণ করা হয়েছে');
    } catch (err) {
      console.error('Error saving program subjects:', err);
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
      setShowChapterModal(false);
      setEditingChapter(null);
    }
  };

  const handleSeedDefaults = async () => {
    const ok = await confirm({
      title: 'ডিফল্ট ডেটা সিংক করবেন?',
      message: 'এটি সকল প্রোগ্রামের ডিফল্ট বিষয় ও অধ্যায় ইনিশিয়ালাইজ করবে।',
      confirmText: 'সিংক করুন'
    });
    if (!ok) return;

    setSaving(true);
    try {
      await savePrograms(DEFAULT_ADMISSION_PROGRAMS);
      await saveShortcuts(DEFAULT_ADMISSION_SHORTCUTS);
      await saveSessions(DEFAULT_ADMISSION_SESSIONS);
      for (const [pId, pSubs] of Object.entries(DEFAULT_PROGRAM_SUBJECTS)) {
        await saveProgramSubjects(pId, pSubs);
      }
      toast.success('সকল ডিফল্ট ডেটা সফলভাবে সিংক হয়েছে!');
    } catch (err) {
      toast.error('সিংক করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // ─── Program CRUD Handlers ──────────────────────────────────────────────────
  const handleOpenAddProgram = () => {
    setProgramForm({
      id: `prog-${Date.now()}`,
      title: '',
      subtitle: '',
      path: '/academic/admission/',
      emoji: '🎓',
      badge: '',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      iconBg: 'from-indigo-500 to-purple-600',
      tagsText: '',
      tags: [],
      active: true,
      order: programs.length + 1
    });
    setEditingProgram(null);
    setShowProgramModal(true);
  };

  const handleOpenEditProgram = (prog) => {
    setProgramForm({
      ...prog,
      tagsText: prog.tags ? prog.tags.join(', ') : ''
    });
    setEditingProgram(prog);
    setShowProgramModal(true);
  };

  const handleDeleteProgram = async (prog) => {
    const ok = await confirm({
      title: 'প্রোগ্রামটি মুছে ফেলবেন?',
      message: `"${prog.title}" প্রোগ্রামটি ড্যাশবোর্ড থেকে মুছে ফেলা হবে।`,
      confirmText: 'মুছে ফেলুন',
      danger: true
    });
    if (!ok) return;

    const updated = programs.filter(p => p.id !== prog.id);
    savePrograms(updated);
  };

  const handleToggleProgramActive = (id) => {
    const updated = programs.map(p => p.id === id ? { ...p, active: !p.active } : p);
    savePrograms(updated);
  };

  const handleSaveProgramForm = (e) => {
    e.preventDefault();
    if (!programForm.title.trim()) {
      toast.error('প্রোগ্রামের নাম আবশ্যক!');
      return;
    }

    const tags = programForm.tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newProgramItem = {
      ...programForm,
      id: programForm.id || `prog-${Date.now()}`,
      tags
    };

    let updated;
    if (editingProgram) {
      updated = programs.map(p => p.id === editingProgram.id ? newProgramItem : p);
    } else {
      updated = [...programs, newProgramItem];
    }

    savePrograms(updated);
  };

  // ─── Shortcuts CRUD Handlers ────────────────────────────────────────────────
  const handleOpenAddShortcut = (defaultTrack = 'medical') => {
    const matchedTrack = TRACK_OPTIONS.find(t => t.id === defaultTrack) || TRACK_OPTIONS[0];
    setShortcutForm({
      id: `sc-${Date.now()}`,
      track: matchedTrack.id,
      trackLabel: matchedTrack.label,
      title: '',
      technique: '',
      category: '',
      subject: 'Biology',
      detailsText: '',
      reference: ''
    });
    setEditingShortcut(null);
    setShowShortcutModal(true);
  };

  const handleOpenEditShortcut = (item) => {
    setShortcutForm({
      ...item,
      detailsText: Array.isArray(item.details) ? item.details.join('\n') : (item.details || '')
    });
    setEditingShortcut(item);
    setShowShortcutModal(true);
  };

  const handleDeleteShortcut = async (item) => {
    const ok = await confirm({
      title: 'শর্টকাটটি মুছে ফেলবেন?',
      message: `"${item.title}" শর্টকাটটি মুছে ফেলা হবে।`,
      confirmText: 'মুছে ফেলুন',
      danger: true
    });
    if (!ok) return;

    const updated = shortcuts.filter(s => s.id !== item.id);
    saveShortcuts(updated);
  };

  const handleSaveShortcutForm = (e) => {
    e.preventDefault();
    if (!shortcutForm.title.trim() || !shortcutForm.technique.trim()) {
      toast.error('শিরোনাম ও টেকনিক আবশ্যক!');
      return;
    }

    const details = shortcutForm.detailsText
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);

    const newShortcutItem = {
      ...shortcutForm,
      details
    };

    let updated;
    if (editingShortcut) {
      updated = shortcuts.map(s => s.id === editingShortcut.id ? newShortcutItem : s);
    } else {
      updated = [newShortcutItem, ...shortcuts];
    }

    saveShortcuts(updated);
  };

  // ─── Sessions CRUD Handlers ─────────────────────────────────────────────────
  const handleOpenAddSession = (defaultExamType = 'MBBS') => {
    setSessionForm({
      id: `sess-${Date.now()}`,
      examType: defaultExamType,
      session: '2023-2024',
      shortYear: '23-24',
      totalQuestions: 100,
      examDate: '',
      status: 'সম্পূর্ণ প্রশ্নব্যাংক',
      active: true
    });
    setEditingSession(null);
    setShowSessionModal(true);
  };

  const handleOpenEditSession = (item) => {
    setSessionForm(item);
    setEditingSession(item);
    setShowSessionModal(true);
  };

  const handleDeleteSession = async (item) => {
    const ok = await confirm({
      title: 'সেশনটি মুছে ফেলবেন?',
      message: `"${item.examType} ${item.session}" সেশনটি মুছে ফেলা হবে।`,
      confirmText: 'মুছে ফেলুন',
      danger: true
    });
    if (!ok) return;

    const updated = sessions.filter(s => s.id !== item.id);
    saveSessions(updated);
  };

  const handleToggleSessionActive = (id) => {
    const updated = sessions.map(s => s.id === id ? { ...s, active: !s.active } : s);
    saveSessions(updated);
  };

  const handleSaveSessionForm = (e) => {
    e.preventDefault();
    if (!sessionForm.session.trim() || !sessionForm.examType) {
      toast.error('পরীক্ষার ধরন ও সেশন সাল আবশ্যক!');
      return;
    }

    const shortYear = sessionForm.shortYear || sessionForm.session.replace('20', '').replace('-20', '-');
    const newSessionItem = {
      ...sessionForm,
      shortYear,
      totalQuestions: Number(sessionForm.totalQuestions) || 100
    };

    let updated;
    if (editingSession) {
      updated = sessions.map(s => s.id === editingSession.id ? newSessionItem : s);
    } else {
      updated = [newSessionItem, ...sessions];
    }

    saveSessions(updated);
  };

  // ─── Subject CRUD Handlers ──────────────────────────────────────────────────
  const handleOpenAddSubject = () => {
    setSubjectForm({
      id: `subj-${Date.now().toString().slice(-5)}`,
      name: '',
      marks: 25,
      subTitle: '',
      recommendedBooksText: ''
    });
    setEditingSubject(null);
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (subj) => {
    setSubjectForm({
      id: subj.id,
      name: subj.name || '',
      marks: subj.marks || 0,
      subTitle: subj.subTitle || '',
      recommendedBooksText: subj.recommendedBooks ? subj.recommendedBooks.join(', ') : ''
    });
    setEditingSubject(subj);
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (subj) => {
    const ok = await confirm({
      title: 'বিষয়টি মুছে ফেলবেন?',
      message: `"${subj.name}" বিষয়টি এবং এর সকল অধ্যায় মুছে ফেলা হবে।`,
      confirmText: 'মুছে ফেলুন',
      danger: true
    });
    if (!ok) return;

    const updatedSubjects = currentProgramSubjects.filter(s => s.id !== subj.id);
    await saveProgramSubjects(selectedProgramId, updatedSubjects);
    if (selectedSubjectId === subj.id && updatedSubjects.length > 0) {
      setSelectedSubjectId(updatedSubjects[0].id);
    }
  };

  const handleSaveSubjectForm = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      toast.error('বিষয়ের নাম আবশ্যক!');
      return;
    }

    const subjId = (subjectForm.id && subjectForm.id.trim())
      ? subjectForm.id.trim().toLowerCase().replace(/\s+/g, '-')
      : `subj-${Date.now().toString().slice(-5)}`;

    const booksArray = subjectForm.recommendedBooksText
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    let updatedSubjects;
    if (editingSubject) {
      updatedSubjects = currentProgramSubjects.map(s => {
        if (s.id === editingSubject.id) {
          return {
            ...s,
            name: subjectForm.name.trim(),
            marks: Number(subjectForm.marks) || 0,
            subTitle: subjectForm.subTitle.trim(),
            recommendedBooks: booksArray
          };
        }
        return s;
      });
    } else {
      const newSubjItem = {
        id: subjId,
        name: subjectForm.name.trim(),
        marks: Number(subjectForm.marks) || 0,
        subTitle: subjectForm.subTitle.trim(),
        recommendedBooks: booksArray,
        chapters: []
      };
      updatedSubjects = [...currentProgramSubjects, newSubjItem];
      setSelectedSubjectId(subjId);
    }

    await saveProgramSubjects(selectedProgramId, updatedSubjects);
    setShowSubjectModal(false);
    setEditingSubject(null);
  };

  // ─── Simplified Chapter CRUD Handlers ───────────────────────────────────────
  const handleOpenAddChapter = () => {
    const isBio = currentSelectedSubject?.id === 'biology';
    setChapterForm({
      id: `${currentSelectedSubject?.id || 'chap'}-ch-${Date.now().toString().slice(-4)}`,
      paper: isBio ? 'উদ্ভিদবিজ্ঞান' : '১ম পত্র',
      name: '',
      repeatedQuestionsCount: 30
    });
    setEditingChapter(null);
    setShowChapterModal(true);
  };

  const handleOpenEditChapter = (chap) => {
    setChapterForm({
      id: chap.id,
      paper: chap.paper || '',
      name: chap.name || '',
      repeatedQuestionsCount: chap.repeatedQuestionsCount || 0
    });
    setEditingChapter(chap);
    setShowChapterModal(true);
  };

  const handleDeleteChapter = async (chap) => {
    const ok = await confirm({
      title: 'অধ্যায়টি মুছে ফেলবেন?',
      message: `"${chap.name}" অধ্যায়টি ${currentSelectedSubject?.name} থেকে মুছে ফেলা হবে।`,
      confirmText: 'মুছে ফেলুন',
      danger: true
    });
    if (!ok) return;

    const updatedSubjects = currentProgramSubjects.map(subj => {
      if (subj.id !== currentSelectedSubject.id) return subj;
      return {
        ...subj,
        chapters: (subj.chapters || []).filter(c => c.id !== chap.id)
      };
    });

    await saveProgramSubjects(selectedProgramId, updatedSubjects);
  };

  const handleSaveChapterForm = async (e) => {
    e.preventDefault();
    if (!chapterForm.name.trim()) {
      toast.error('অধ্যায়ের নাম আবশ্যক!');
      return;
    }

    const chapterId = (chapterForm.id && chapterForm.id.trim()) 
      ? chapterForm.id.trim() 
      : `${currentSelectedSubject?.id || 'chap'}-ch-${Date.now().toString().slice(-5)}`;

    const newChapterItem = {
      ...(editingChapter || {}),
      id: chapterId,
      paper: chapterForm.paper.trim(),
      name: chapterForm.name.trim(),
      repeatedQuestionsCount: Number(chapterForm.repeatedQuestionsCount) || 0
    };

    const updatedSubjects = currentProgramSubjects.map(subj => {
      if (subj.id !== currentSelectedSubject.id) return subj;
      let newChapters;
      if (editingChapter) {
        newChapters = (subj.chapters || []).map(c => c.id === editingChapter.id ? newChapterItem : c);
      } else {
        newChapters = [...(subj.chapters || []), newChapterItem];
      }
      return { ...subj, chapters: newChapters };
    });

    await saveProgramSubjects(selectedProgramId, updatedSubjects);
    setShowChapterModal(false);
    setEditingChapter(null);
  };

  // ─── Filtered Program & Session Memos ────────────────────────────────────────
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchStatus = 
        programStatusFilter === 'all' ? true :
        programStatusFilter === 'active' ? p.active : !p.active;
      const matchSearch = !searchProgram.trim() ||
        p.title?.toLowerCase().includes(searchProgram.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(searchProgram.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(searchProgram.toLowerCase())));
      return matchStatus && matchSearch;
    });
  }, [programs, programStatusFilter, searchProgram]);

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(s => {
      const matchTrack = selectedTrack === 'all' || s.track === selectedTrack;
      const matchQuery = !searchShortcut.trim() ||
        s.title?.toLowerCase().includes(searchShortcut.toLowerCase()) ||
        s.technique?.toLowerCase().includes(searchShortcut.toLowerCase()) ||
        s.subject?.toLowerCase().includes(searchShortcut.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchShortcut.toLowerCase());
      return matchTrack && matchQuery;
    });
  }, [shortcuts, selectedTrack, searchShortcut]);

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchExam = sessionExamType === 'all' || s.examType === sessionExamType;
      const matchSearch = !searchSession.trim() ||
        s.session?.toLowerCase().includes(searchSession.toLowerCase()) ||
        s.examType?.toLowerCase().includes(searchSession.toLowerCase()) ||
        s.examDate?.toLowerCase().includes(searchSession.toLowerCase());
      return matchExam && matchSearch;
    });
  }, [sessions, sessionExamType, searchSession]);

  // Program-specific Sessions
  const currentProgramSessions = useMemo(() => {
    if (!selectedProgramId) return sessions;
    const examMap = {
      medical: ['MBBS', 'BDS'],
      engineering: ['BUET', 'CKET', 'RUET', 'KUET', 'CUET', 'BUTEX', 'MIST'],
      'varsity-a': ['DU A', 'JU A', 'RU C', 'CU A'],
      'varsity-b': ['DU B', 'JU B'],
      'varsity-c': ['DU C'],
      nursing: ['BSc Nursing', 'Diploma in Nursing', 'Midwifery', 'Nursing'],
      gst: ['GST', 'GST Tech'],
      agri: ['Agri']
    };
    const targetExams = examMap[selectedProgramId];
    if (!targetExams) return sessions;
    return sessions.filter(s => targetExams.includes(s.examType));
  }, [sessions, selectedProgramId]);

  // Program-specific Shortcuts
  const currentProgramShortcuts = useMemo(() => {
    if (!selectedProgramId) return shortcuts;
    const trackMap = {
      medical: ['medical', 'hand_calc'],
      engineering: ['engineering', 'hand_calc'],
      'varsity-a': ['varsity_a', 'hand_calc'],
      nursing: ['medical', 'general', 'gk_english'],
      gst: ['varsity_a', 'hand_calc'],
      agri: ['varsity_a', 'medical']
    };
    const targetTracks = trackMap[selectedProgramId];
    if (!targetTracks) return shortcuts;
    return shortcuts.filter(s => targetTracks.includes(s.track));
  }, [shortcuts, selectedProgramId]);

  // Default Exam Type for new session button
  const defaultExamTypeForProgram = useMemo(() => {
    if (selectedProgramId === 'engineering') return 'BUET';
    if (selectedProgramId === 'varsity-a') return 'DU A';
    if (selectedProgramId === 'nursing') return 'BSc Nursing';
    if (selectedProgramId === 'gst') return 'GST';
    if (selectedProgramId === 'agri') return 'Agri';
    return 'MBBS';
  }, [selectedProgramId]);

  const defaultTrackForProgram = useMemo(() => {
    if (selectedProgramId === 'engineering') return 'engineering';
    if (selectedProgramId === 'varsity-a') return 'varsity_a';
    return 'medical';
  }, [selectedProgramId]);

  return (
    <div className="space-y-6 font-bangla text-slate-200">
      {confirmDialog}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TOP ACTION BAR (Seamless, no duplicate headers)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        {selectedProgramId ? (
          /* Breadcrumb navigation inside a program workspace */
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProgramId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/20 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>সকল প্রোগ্রাম</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-white">
                {currentSelectedProgram?.emoji} {currentSelectedProgram?.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Workspace
              </span>
            </div>
          </div>
        ) : (
          /* Segmented Tabs when at top-level */
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('programs')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'programs'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>প্রোগ্রাম ({programs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'shortcuts'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>শর্টকাট ({shortcuts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>সেশন ({sessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>প্রশ্নব্যাংক</span>
            </button>

            <button
              onClick={() => setActiveTab('exam_schedules')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'exam_schedules'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5 text-amber-400" />
              <span>শিডিউল</span>
            </button>

            <button
              onClick={() => setActiveTab('highlighted_lines')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'highlighted_lines'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>দাগানো লাইনস</span>
            </button>
          </div>
        )}

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleSeedDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-white/20 text-xs font-medium transition-colors"
            title="ডিফল্ট ডেটা সিংক"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>ডিফল্ট সিংক</span>
          </button>

          {!selectedProgramId && activeTab === 'programs' && (
            <button
              onClick={handleOpenAddProgram}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন প্রোগ্রাম</span>
            </button>
          )}

          {!selectedProgramId && activeTab === 'shortcuts' && (
            <button
              onClick={() => handleOpenAddShortcut('medical')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন শর্টকাট</span>
            </button>
          )}

          {!selectedProgramId && activeTab === 'sessions' && (
            <button
              onClick={() => handleOpenAddSession('MBBS')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন সেশন</span>
            </button>
          )}

          {/* Program Workspace Actions */}
          {selectedProgramId && programSubTab === 'subjects' && (
            <button
              onClick={handleOpenAddChapter}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>
                {currentSelectedSubject?.id === 'gk' || currentSelectedSubject?.id === 'english' ? 'নতুন টপিক' : 'নতুন অধ্যায়'}
              </span>
            </button>
          )}

          {selectedProgramId && programSubTab === 'sessions' && (
            <button
              onClick={() => handleOpenAddSession(defaultExamTypeForProgram)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন সেশন</span>
            </button>
          )}

          {selectedProgramId && programSubTab === 'shortcuts' && (
            <button
              onClick={() => handleOpenAddShortcut(defaultTrackForProgram)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>নতুন শর্টকাট</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mb-2" />
          <p className="text-slate-400 text-xs">অ্যাডমিশন ডেটা লোড হচ্ছে...</p>
        </div>
      ) : selectedProgramId ? (
        /* ═══════════════════════════════════════════════════════════════════════════
           UNIVERSAL PROGRAM WORKSPACE (Medical, Engineering, Varsity, Nursing, etc.)
           ═══════════════════════════════════════════════════════════════════════════ */
        <div className="space-y-6">
          {/* Program Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setProgramSubTab('subjects')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                programSubTab === 'subjects'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <BookCheck className="h-4 w-4 text-indigo-400" />
              <span>বিষয় ও অধ্যায়সমূহ ({currentProgramSubjects.reduce((acc, s) => acc + (s.chapters?.length || 0), 0)})</span>
            </button>

            <button
              onClick={() => setProgramSubTab('sessions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                programSubTab === 'sessions'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Calendar className="h-4 w-4 text-indigo-400" />
              <span>প্রশ্নব্যাংক সেশন ({currentProgramSessions.length})</span>
            </button>

            <button
              onClick={() => setProgramSubTab('shortcuts')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                programSubTab === 'shortcuts'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>শর্টকাট ও ট্রিকস ({currentProgramShortcuts.length})</span>
            </button>

            <button
              onClick={() => setProgramSubTab('questions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                programSubTab === 'questions'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Database className="h-4 w-4 text-indigo-400" />
              <span>প্রশ্নব্যাংক ও আপলোডার</span>
            </button>

            <button
              onClick={() => setProgramSubTab('highlighted_lines')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                programSubTab === 'highlighted_lines'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Sparkles className="h-4 w-4 text-rose-400" />
              <span>দাগানো লাইনস (JSON)</span>
            </button>

            <button
              onClick={() => setProgramSubTab('info')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                programSubTab === 'info'
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
              <span>নম্বর বণ্টন ও তথ্য</span>
            </button>
          </div>

          {/* ── Sub-Tab 1: SUBJECTS & CHAPTERS CRUD ─────────────────────────────── */}
          {programSubTab === 'subjects' && (
            <div className="space-y-5">
              {/* Subject Select Pills & Add Subject Button */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {currentProgramSubjects.map(subj => (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap border ${
                      currentSelectedSubject?.id === subj.id
                        ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                        : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span>{subj.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-mono">
                      {subj.chapters?.length || 0}
                    </span>
                  </button>
                ))}

                {/* Add New Subject Button */}
                <button
                  type="button"
                  onClick={handleOpenAddSubject}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-dashed border-zinc-700 bg-zinc-900/20 text-zinc-300 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/40 transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>নতুন বিষয় যোগ</span>
                </button>
              </div>

              {/* Current Subject Header */}
              {currentSelectedSubject ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>{currentSelectedSubject.name}</span>
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                        মার্কস: {currentSelectedSubject.marks}
                      </span>
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1 flex items-center gap-2 flex-wrap">
                      <span>মোট অধ্যায়: {currentSelectedSubject.chapters?.length || 0}টি</span>
                      <span>•</span>
                      <span>মোট বিগত প্রশ্ন: <strong className="text-zinc-200">{currentSelectedSubject.chapters?.reduce((sum, ch) => sum + getLiveChapterQuestionsCount(currentSelectedSubject.id, ch), 0) || 0}</strong>টি</span>
                      {currentSelectedSubject.subTitle && <span>• {currentSelectedSubject.subTitle}</span>}
                      {currentSelectedSubject.recommendedBooks?.length ? <span>• সহায়ক বই: {currentSelectedSubject.recommendedBooks.join(', ')}</span> : null}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                    <button
                      type="button"
                      onClick={handleOpenAddChapter}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold shadow transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>অধ্যায় যোগ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenHighlightedLinesUploader(selectedProgramId, currentSelectedSubject?.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
                      title="এই বিষয়ের অধ্যায়ে দাগানো লাইন JSON আপলোড করুন"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                      <span>JSON দাগানো লাইন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditSubject(currentSelectedSubject)}
                      className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                      title="বিষয় সম্পাদনা"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(currentSelectedSubject)}
                      className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                      title="বিষয় মুছে ফেলুন"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-400 text-xs">
                  এই প্রোগ্রামে এখনও কোনো বিষয় তৈরি করা হয়নি। উপরে <strong>"+ নতুন বিষয় যোগ"</strong> বাটনে ক্লিক করে প্রথম বিষয় যুক্ত করুন।
                </div>
              )}

              {/* Chapters List */}
              <div className="space-y-2.5">
                {currentSelectedSubject?.chapters && currentSelectedSubject.chapters.length > 0 ? (
                  currentSelectedSubject.chapters.map((chap) => (
                    <div
                      key={chap.id}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 p-3.5 sm:p-4 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/80">
                            {chap.paper || '১ম পত্র'}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            বিগত প্রশ্ন: <strong className="text-zinc-200">{getLiveChapterQuestionsCount(currentSelectedSubject?.id, chap)}</strong> টি
                          </span>
                          <span className="text-[10.5px] font-mono text-zinc-500">
                            ID: {chap.id}
                          </span>
                        </div>
                        <h4 className="font-semibold text-zinc-100 text-sm truncate">
                          {chap.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenHighlightedLinesUploader(selectedProgramId, currentSelectedSubject?.id, chap.id)}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
                          title="এই অধ্যায়ে JSON দাগানো লাইন আপলোড করুন"
                        >
                          <Sparkles className="h-3 w-3 text-zinc-400" />
                          <span className="hidden sm:inline">JSON</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditChapter(chap)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteChapter(chap)}
                          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  currentSelectedSubject && (
                    <div className="p-8 text-center rounded-2xl border border-zinc-800 bg-zinc-900/20 text-zinc-500 text-xs">
                      এই বিষয়ে কোনো অধ্যায় যুক্ত করা হয়নি। উপরে <strong>"+ অধ্যায় যোগ"</strong> বাটনে ক্লিক করে অধ্যায় যোগ করুন।
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* ── Sub-Tab 2: SESSIONS CRUD ────────────────────────────────────────── */}
          {programSubTab === 'sessions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentProgramSessions.map(sess => (
                  <div
                    key={sess.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {sess.examType} {sess.session}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSession(sess)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.03] text-slate-400 hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(sess)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.03] text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-white text-sm">
                        {sess.examType} সেশন প্রশ্নব্যাংক
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sess.totalQuestions || 100} MCQ {sess.examDate ? `• ${sess.examDate}` : ''}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">Short: {sess.shortYear}</span>
                      <button
                        onClick={() => handleToggleSessionActive(sess.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                          sess.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {sess.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sub-Tab 3: SHORTCUTS CRUD ───────────────────────────────────────── */}
          {programSubTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentProgramShortcuts.map(item => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10 p-4 flex flex-col justify-between space-y-2.5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {item.subject}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditShortcut(item)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.03] text-slate-400 hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShortcut(item)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.03] text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-white text-sm">
                        {item.title}
                      </h4>

                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 text-xs font-mono text-emerald-300">
                        {item.technique}
                      </div>

                      {Array.isArray(item.details) && item.details.length > 0 && (
                        <ul className="space-y-0.5 text-[11px] text-slate-400 list-disc list-inside">
                          {item.details.slice(0, 3).map((d, i) => (
                            <li key={i} className="line-clamp-1">{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-slate-500">
                      <span>{item.category}</span>
                      <span className="italic">{item.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sub-Tab 4: PROGRAM INFO ─────────────────────────────────────────── */}
          {programSubTab === 'info' && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 max-w-xl space-y-4">
              <h3 className="font-semibold text-white text-sm">প্রোগ্রাম বিবরণ ও কনফিগারেশন</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">প্রোগ্রাম টাইটেল</label>
                  <input
                    type="text"
                    value={currentSelectedProgram?.title || ''}
                    onChange={(e) => {
                      const updated = programs.map(p => p.id === selectedProgramId ? { ...p, title: e.target.value } : p);
                      setPrograms(updated);
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">সাবটাইটেল</label>
                  <textarea
                    rows={2}
                    value={currentSelectedProgram?.subtitle || ''}
                    onChange={(e) => {
                      const updated = programs.map(p => p.id === selectedProgramId ? { ...p, subtitle: e.target.value } : p);
                      setPrograms(updated);
                    }}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">হাইলাইট ব্যাজ</label>
                    <input
                      type="text"
                      value={currentSelectedProgram?.badge || ''}
                      onChange={(e) => {
                        const updated = programs.map(p => p.id === selectedProgramId ? { ...p, badge: e.target.value } : p);
                        setPrograms(updated);
                      }}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ইমোজি</label>
                    <input
                      type="text"
                      value={currentSelectedProgram?.emoji || ''}
                      onChange={(e) => {
                        const updated = programs.map(p => p.id === selectedProgramId ? { ...p, emoji: e.target.value } : p);
                        setPrograms(updated);
                      }}
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => savePrograms(programs)}
                  disabled={saving}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Sub-Tab 5: QUESTION BANK & LATEX UPLOADER ─────────────────────── */}
          {programSubTab === 'questions' && (
            <AdmissionQuestionManager />
          )}

          {/* ── Sub-Tab 6: HIGHLIGHTED LINES & TOPICS (JSON) ────────────────────── */}
          {programSubTab === 'highlighted_lines' && (
            <HighlightedLinesManagerTab
              programId={selectedProgramId}
              programSubjectsMap={programSubjectsMap}
              onDataUpdated={fetchAdmissionData}
            />
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════════════
           TOP-LEVEL ADMISSION DASHBOARD (Clean, professional card grid)
           ═══════════════════════════════════════════════════════════════════════════ */
        <div className="space-y-4">
          {activeTab === 'programs' && (
            <div className="space-y-4">
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchProgram}
                    onChange={(e) => setSearchProgram(e.target.value)}
                    placeholder="প্রোগ্রাম বা ট্যাগ খুঁজুন..."
                    className="w-full !pl-8"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setProgramStatusFilter('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      programStatusFilter === 'all' 
                        ? 'bg-white/[0.08] text-white border border-white/10' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    সকল ({programs.length})
                  </button>
                  <button
                    onClick={() => setProgramStatusFilter('active')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      programStatusFilter === 'active' 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    সক্রিয় ({programs.filter(p => p.active).length})
                  </button>
                  <button
                    onClick={() => setProgramStatusFilter('inactive')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      programStatusFilter === 'inactive' 
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    নিষ্ক্রিয় ({programs.filter(p => !p.active).length})
                  </button>
                </div>
              </div>

              {/* Programs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="group relative rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/10 p-4 transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      {/* Card Header: Emoji, Title, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0 p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            {prog.emoji || '🎓'}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white text-sm truncate">
                              {prog.title}
                            </h3>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {prog.path}
                            </span>
                          </div>
                        </div>

                        {/* Edit & Delete Quick Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditProgram(prog)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white transition-colors"
                            title="সম্পাদনা"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(prog)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-rose-400 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtitle */}
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {prog.subtitle}
                      </p>

                      {/* Tags */}
                      {prog.tags && prog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {prog.tags.slice(0, 4).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.03] text-slate-400 border border-white/[0.05]"
                            >
                              {tag}
                            </span>
                          ))}
                          {prog.tags.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500">
                              +{prog.tags.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleProgramActive(prog.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          prog.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-white/[0.06]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${prog.active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{prog.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProgramId(prog.id);
                          setProgramSubTab('subjects');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                      >
                        <span>সম্পূর্ণ ম্যানেজ করুন</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top-Level Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchShortcut}
                    onChange={(e) => setSearchShortcut(e.target.value)}
                    placeholder="শর্টকাট বা সূত্র খুঁজুন..."
                    className="w-full !pl-8"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  <button
                    onClick={() => setSelectedTrack('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedTrack === 'all' ? 'bg-white/[0.08] text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    সকল ({shortcuts.length})
                  </button>
                  {TRACK_OPTIONS.map(tr => (
                    <button
                      key={tr.id}
                      onClick={() => setSelectedTrack(tr.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        selectedTrack === tr.id ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredShortcuts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] p-4 flex flex-col justify-between space-y-3 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {item.subject} • {item.trackLabel || item.track}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditShortcut(item)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteShortcut(item)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-white text-sm">
                        {item.title}
                      </h4>

                      <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5 text-xs font-mono text-emerald-300 leading-relaxed">
                        {item.technique}
                      </div>

                      {Array.isArray(item.details) && item.details.length > 0 && (
                        <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                          {item.details.slice(0, 2).map((d, i) => (
                            <li key={i} className="line-clamp-1">{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.category}</span>
                      <span className="italic">{item.reference}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top-Level Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchSession}
                    onChange={(e) => setSearchSession(e.target.value)}
                    placeholder="সেশন বা সাল খুঁজুন..."
                    className="w-full !pl-8"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
                  <button
                    onClick={() => setSessionExamType('all')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      sessionExamType === 'all' ? 'bg-white/[0.08] text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    সকল ({sessions.length})
                  </button>
                  {EXAM_TYPE_OPTIONS.map(ex => (
                    <button
                      key={ex}
                      onClick={() => setSessionExamType(ex)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        sessionExamType === ex ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] p-4 flex flex-col justify-between space-y-3 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {sess.examType} {sess.session}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditSession(sess)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(sess)}
                            className="p-1 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-semibold text-white text-sm">
                        {sess.examType} সেশন প্রশ্নব্যাংক
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sess.totalQuestions || 100} MCQ {sess.examDate ? `• ${sess.examDate}` : ''}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-500 font-mono">Short: {sess.shortYear}</span>
                      <button
                        onClick={() => handleToggleSessionActive(sess.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                          sess.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {sess.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top-Level Universal Questions & LaTeX Uploader */}
          {activeTab === 'questions' && (
            <AdmissionQuestionManager />
          )}

          {/* Top-Level Exam Schedule Manager */}
          {activeTab === 'exam_schedules' && (
            <ExamScheduleManager />
          )}

          {/* Top-Level Dedicated Highlighted Lines (JSON) Tab */}
          {activeTab === 'highlighted_lines' && (
            <HighlightedLinesManagerTab
              programId="medical"
              programSubjectsMap={programSubjectsMap}
              onDataUpdated={fetchAdmissionData}
            />
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════════════════════ */}

      {/* ── 1. Program Modal ── */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-bangla">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingProgram ? 'প্রোগ্রাম সম্পাদনা' : 'নতুন ভর্তি প্রোগ্রাম তৈরি'}
                  </h3>
                  <p className="text-xs text-zinc-400">ভর্তি ট্র্যাক কনফিগারেশন</p>
                </div>
              </div>
              <button onClick={() => setShowProgramModal(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProgramForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-300 font-semibold mb-1">প্রোগ্রাম টাইটেল</label>
                  <input
                    type="text"
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    placeholder="যেমন: ডেন্টাল (BDS)"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">ইমোজি</label>
                  <input
                    type="text"
                    value={programForm.emoji}
                    onChange={(e) => setProgramForm({ ...programForm, emoji: e.target.value })}
                    placeholder="🦷"
                    className="w-full text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">সাবটাইটেল / বিবরণ</label>
                <textarea
                  rows={2}
                  value={programForm.subtitle}
                  onChange={(e) => setProgramForm({ ...programForm, subtitle: e.target.value })}
                  placeholder="প্রোগ্রামের সংক্ষিপ্ত বিবরণ..."
                  className="w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">রাউটিং পাথ (Path)</label>
                  <input
                    type="text"
                    value={programForm.path}
                    onChange={(e) => setProgramForm({ ...programForm, path: e.target.value })}
                    placeholder="/academic/admission/..."
                    className="w-full font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">হাইলাইট ব্যাজ</label>
                  <input
                    type="text"
                    value={programForm.badge}
                    onChange={(e) => setProgramForm({ ...programForm, badge: e.target.value })}
                    placeholder="যেমন: ১০০ MCQ / ৬০ মিনিট"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={programForm.tagsText}
                  onChange={(e) => setProgramForm({ ...programForm, tagsText: e.target.value })}
                  placeholder="BDS, ডেন্টাল, জীববিজ্ঞান ৩০..."
                  className="w-full"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-sm"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. Shortcut Modal ── */}
      {showShortcutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-bangla">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingShortcut ? 'শর্টকাট সম্পাদনা' : 'নতুন শর্টকাট যোগ'}
                  </h3>
                  <p className="text-xs text-zinc-400">শর্টকাট ও ট্রিকস ডেটা</p>
                </div>
              </div>
              <button onClick={() => setShowShortcutModal(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveShortcutForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">ট্র্যাক</label>
                  <select
                    value={shortcutForm.track}
                    onChange={(e) => {
                      const sel = TRACK_OPTIONS.find(t => t.id === e.target.value);
                      setShortcutForm({ ...shortcutForm, track: e.target.value, trackLabel: sel ? sel.label : '' });
                    }}
                    className="w-full"
                  >
                    {TRACK_OPTIONS.map(tr => (
                      <option key={tr.id} value={tr.id}>{tr.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">বিষয় (Subject)</label>
                  <input
                    type="text"
                    value={shortcutForm.subject}
                    onChange={(e) => setShortcutForm({ ...shortcutForm, subject: e.target.value })}
                    placeholder="যেমন: Biology / Math"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">টপিক শিরোনাম</label>
                <input
                  type="text"
                  value={shortcutForm.title}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, title: e.target.value })}
                  placeholder="যেমন: অম্লীয় বাফার দ্রবণের pH নির্ণয়"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">শর্টকাট টেকনিক / মূল ছন্দ</label>
                <input
                  type="text"
                  value={shortcutForm.technique}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, technique: e.target.value })}
                  placeholder="যেমন: pH = pKa + log([Salt]/[Acid])"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">ব্যাখ্যা ও নিয়মসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3}
                  value={shortcutForm.detailsText}
                  onChange={(e) => setShortcutForm({ ...shortcutForm, detailsText: e.target.value })}
                  placeholder="পদ্ধতির বিবরণ..."
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={shortcutForm.category}
                    onChange={(e) => setShortcutForm({ ...shortcutForm, category: e.target.value })}
                    placeholder="রসায়ন শর্টকাট"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">রেফারেন্স / বই</label>
                  <input
                    type="text"
                    value={shortcutForm.reference}
                    onChange={(e) => setShortcutForm({ ...shortcutForm, reference: e.target.value })}
                    placeholder="হাজারী স্যার"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowShortcutModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-sm"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. Session Modal ── */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-bangla">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingSession ? 'সেশন সম্পাদনা' : 'নতুন সেশন যোগ'}
                  </h3>
                  <p className="text-xs text-zinc-400">পরীক্ষার সেশন ও সাল</p>
                </div>
              </div>
              <button onClick={() => setShowSessionModal(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">পরীক্ষার ধরন</label>
                  <select
                    value={sessionForm.examType}
                    onChange={(e) => setSessionForm({ ...sessionForm, examType: e.target.value })}
                    className="w-full"
                  >
                    {EXAM_TYPE_OPTIONS.map(ex => (
                      <option key={ex} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">সেশন সাল</label>
                  <input
                    type="text"
                    value={sessionForm.session}
                    onChange={(e) => setSessionForm({ ...sessionForm, session: e.target.value })}
                    placeholder="যেমন: 2023-2024"
                    className="w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">সংক্ষিপ্ত সাল (Short Year)</label>
                  <input
                    type="text"
                    value={sessionForm.shortYear}
                    onChange={(e) => setSessionForm({ ...sessionForm, shortYear: e.target.value })}
                    placeholder="যেমন: 23-24"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">মোট প্রশ্ন সংখ্যা</label>
                  <input
                    type="number"
                    value={sessionForm.totalQuestions}
                    onChange={(e) => setSessionForm({ ...sessionForm, totalQuestions: e.target.value })}
                    className="w-full font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">পরীক্ষার তারিখ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={sessionForm.examDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, examDate: e.target.value })}
                  placeholder="যেমন: ৯ ফেব্রুয়ারি ২০২৪"
                  className="w-full"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-sm"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 4. Dynamic Subject Modal ── */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-bangla">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingSubject ? 'বিষয় সম্পাদনা' : 'নতুন বিষয় যোগ করুন'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    প্রোগ্রাম: <strong className="text-zinc-200">{currentSelectedProgram?.title}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSubjectModal(false)} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubjectForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">বিষয়ের নাম (বাংলা ও ইংরেজি)</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="যেমন: উচ্চতর গণিত (Higher Math)"
                  className="w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">মোট মার্কস (Marks)</label>
                  <input
                    type="number"
                    value={subjectForm.marks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, marks: e.target.value })}
                    placeholder="25"
                    className="w-full font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">বিষয় আইডি / Slug</label>
                  <input
                    type="text"
                    value={subjectForm.id}
                    onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                    placeholder="যেমন: math"
                    className="w-full font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">শাখা / পত্র বিবরণ (Sub-title)</label>
                <input
                  type="text"
                  value={subjectForm.subTitle}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subTitle: e.target.value })}
                  placeholder="যেমন: ১ম পত্র + ২য় পত্র"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">সহায়ক বইসমূহ (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={subjectForm.recommendedBooksText}
                  onChange={(e) => setSubjectForm({ ...subjectForm, recommendedBooksText: e.target.value })}
                  placeholder="যেমন: অসীম কুমার সাহা, এস ইউ আহাম্মদ"
                  className="w-full"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-sm"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. Simplified & Fast Chapter Modal ── */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto font-bangla">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {editingChapter ? 'অধ্যায় সম্পাদনা' : 'নতুন অধ্যায় যুক্ত করুন'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    বিষয়: <strong className="text-zinc-200">{currentSelectedSubject?.name}</strong> ({currentSelectedProgram?.title})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowChapterModal(false)} 
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChapterForm} className="space-y-4 text-xs">
              {/* Paper / Category Selector */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">
                  পেপার / শাখা নির্বাচন
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {['১ম পত্র', '২য় পত্র', 'উদ্ভিদবিজ্ঞান', 'প্রাণিবিজ্ঞান', 'সাধারণ', 'Grammar', 'Vocabulary'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setChapterForm({ ...chapterForm, paper: p })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                        chapterForm.paper === p
                          ? 'bg-zinc-800 text-white border-zinc-600 font-bold shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={chapterForm.paper}
                  onChange={(e) => setChapterForm({ ...chapterForm, paper: e.target.value })}
                  placeholder="বা কাস্টম পেপার লিখুন (যেমন: ১ম পত্র)"
                  className="w-full"
                  required
                />
              </div>

              {/* Chapter Name */}
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  অধ্যায়ের পুরো নাম
                </label>
                <input
                  type="text"
                  value={chapterForm.name}
                  onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                  placeholder="যেমন: অধ্যায় ১: ভৌত জগত ও পরিমাপ"
                  className="w-full text-sm font-medium"
                  required
                />
              </div>

              {/* Row: ID & Questions Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">অধ্যায় আইডি / Slug</label>
                  <input
                    type="text"
                    value={chapterForm.id}
                    onChange={(e) => setChapterForm({ ...chapterForm, id: e.target.value })}
                    placeholder="যেমন: phy-ch-1"
                    className="w-full font-mono"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-zinc-300 font-semibold">বিগত সালের প্রশ্ন সংখ্যা</label>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      (ডাটাবেজে প্রশ্ন: {getLiveChapterQuestionsCount(currentSelectedSubject?.id, editingChapter || chapterForm)}টি)
                    </span>
                  </div>
                  <input
                    type="number"
                    value={chapterForm.repeatedQuestionsCount}
                    onChange={(e) => setChapterForm({ ...chapterForm, repeatedQuestionsCount: e.target.value })}
                    className="w-full font-mono font-bold"
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 font-medium transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-sm flex items-center gap-1.5 transition"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>সংরক্ষণ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Highlighted Lines & Topics JSON Bulk Uploader Modal ── */}
      <HighlightedLinesUploaderModal
        isOpen={showHighlightedLinesModal}
        onClose={() => setShowHighlightedLinesModal(false)}
        initialProgramId={highlightedModalTarget.programId}
        initialSubjectId={highlightedModalTarget.subjectId}
        initialChapterId={highlightedModalTarget.chapterId}
        programSubjectsMap={programSubjectsMap}
        onSuccess={() => {
          fetchAdmissionData();
        }}
      />
    </div>
  );
}
