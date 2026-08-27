import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, writeBatch, query, where, limit 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Search, Plus, Trash2, Edit, Save, UploadCloud, 
  Check, X, Sparkles, Filter, Database, BookOpen, 
  CheckCircle2, AlertTriangle, Copy, RotateCcw, 
  Loader2, Tag, Calendar, Layers, Eye, Code2, FileText, ChevronRight
} from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useMedicalConfig } from '../../hooks/useAdmissionData';

// ─── 1st Paper & 2nd Paper Separated Subject Options ─────────────────────────────
export const SUBJECT_OPTIONS = [
  { id: 'biology-1', rawSubject: 'biology', paperName: 'উদ্ভিদবিজ্ঞান', name: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)' },
  { id: 'biology-2', rawSubject: 'biology', paperName: 'প্রাণিবিজ্ঞান', name: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)' },
  { id: 'chemistry-1', rawSubject: 'chemistry', paperName: '১ম পত্র', name: 'রসায়ন ১ম পত্র' },
  { id: 'chemistry-2', rawSubject: 'chemistry', paperName: '২য় পত্র', name: 'রসায়ন ২য় পত্র' },
  { id: 'physics-1', rawSubject: 'physics', paperName: '১ম পত্র', name: 'পদার্থবিজ্ঞান ১ম পত্র' },
  { id: 'physics-2', rawSubject: 'physics', paperName: '২য় পত্র', name: 'পদার্থবিজ্ঞান ২য় পত্র' },
  { id: 'math-1', rawSubject: 'math', paperName: '১ম পত্র', name: 'উচ্চতর গণিত ১ম পত্র' },
  { id: 'math-2', rawSubject: 'math', paperName: '২য় পত্র', name: 'উচ্চতর গণিত ২য় পত্র' },
  { id: 'english', rawSubject: 'english', paperName: 'জেনারেল', name: 'ইংরেজি (English)' },
  { id: 'gk', rawSubject: 'gk', paperName: 'সাধারণ জ্ঞান', name: 'সাধারণ জ্ঞান (General Knowledge)' }
];

const EXAM_TYPE_OPTIONS = ['MBBS & BDS', 'BUET', 'CKET', 'DU A', 'GST', 'Agri', 'Nursing', 'Varsity', 'Main Book (বইয়ের অনুশীলনী)', 'অন্যান্য'];

/**
 * Smart LaTeX Sanitizer:
 * Fixes unescaped LaTeX backslashes (\frac, \sqrt, \alpha, \text, etc.)
 * in raw pasted strings so JSON.parse does not throw "Bad escaped character" errors.
 */
function sanitizeLatexJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return rawText;

  // List of common LaTeX macros to safely escape
  const latexMacros = [
    'frac', 'sqrt', 'text', 'alpha', 'beta', 'gamma', 'delta', 'theta',
    'lambda', 'mu', 'pi', 'rho', 'sigma', 'tau', 'phi', 'chi', 'psi',
    'omega', 'Delta', 'Sigma', 'Omega', 'times', 'div', 'pm', 'mp',
    'cdot', 'circ', 'degree', 'leq', 'geq', 'neq', 'approx', 'equiv',
    'propto', 'infty', 'to', 'leftarrow', 'rightarrow', 'Rightarrow',
    'int', 'iint', 'sum', 'prod', 'lim', 'partial', 'nabla', 'hbar',
    'left', 'right', 'vec', 'hat', 'bar', 'dot', 'ddot', 'underline',
    'mathbf', 'mathrm', 'mathit', 'mathbb', 'mathcal', 'sin', 'cos',
    'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'exp', 'max', 'min'
  ];

  let text = rawText;

  // 1. Auto-remove trailing commas before closing brackets ] or } (e.g. ["a", "b",] -> ["a", "b"])
  text = text.replace(/,\s*([\]}])/g, '$1');
  
  // 2. Replace single backslash before known LaTeX macros with double backslash
  latexMacros.forEach(macro => {
    const regex = new RegExp(`(?<!\\\\)\\\\(${macro})(?=[^a-zA-Z]|$)`, 'g');
    text = text.replace(regex, '\\\\$1');
  });

  return text;
}

function normalizeExamTags(item, defaultExamType = 'MBBS & BDS') {
  let tags = [];

  if (Array.isArray(item.examTags) && item.examTags.length > 0) {
    tags = item.examTags.map(t => {
      if (typeof t === 'string') return { type: t, session: item.year || '' };
      return {
        type: t.type || t.name || t.exam || defaultExamType,
        session: t.session || t.year || item.year || ''
      };
    });
  } else if (Array.isArray(item.institutions) && item.institutions.length > 0) {
    tags = item.institutions.map(i => ({
      type: i.name || i.type || defaultExamType,
      session: i.year || i.session || item.year || ''
    }));
  } else if (Array.isArray(item.tags) && item.tags.length > 0) {
    tags = item.tags.map(t => {
      if (typeof t === 'object') return { type: t.type || t.name || defaultExamType, session: t.session || t.year || '' };
      return { type: t, session: item.year || '' };
    });
  } else if (Array.isArray(item.years) && item.years.length > 0) {
    tags = item.years.map(y => ({
      type: item.examType || defaultExamType,
      session: String(y)
    }));
  } else if (typeof item.year === 'string' && item.year.includes(',')) {
    tags = item.year.split(',').map(y => ({
      type: item.examType || defaultExamType,
      session: y.trim()
    }));
  } else if (item.year || item.examType) {
    tags = [{
      type: item.examType || defaultExamType,
      session: item.year || ''
    }];
  }

  return tags.filter(t => t.type || t.session);
}

export function generateQuestionFingerprint(questionText, options = []) {
  if (!questionText) return '';
  const normQ = String(questionText)
    .trim()
    .toLowerCase()
    .replace(/\\/g, '')
    .replace(/[\$\s]+/g, '')
    .replace(/[।.,?!:;'"\-_()\[\]{}]/g, '');

  const normOpts = (options || [])
    .map(opt => String(opt).trim().toLowerCase().replace(/\\/g, '').replace(/[\$\s]+/g, '').replace(/[।.,?!:;'"\-_()\[\]{}]/g, ''))
    .sort()
    .join('|');

  return `${normQ}:::${normOpts}`;
}

const SAMPLE_TEMPLATE_JSON = `[
  {
    "question": "সরল ছন্দিত স্পন্দনে স্পন্দিত কণার বিস্তার $A$ এবং সর্বোচ্চ বেগ $v_{\\\\max}$ হলে এর পর্যায়কাল $T$ কত?",
    "options": [
      "$T = \\\\frac{2\\\\pi A}{v_{\\\\max}}$",
      "$T = \\\\frac{\\\\pi A}{2\\\\max}}$",
      "$T = \\\\frac{v_{\\\\max}}{2\\\\pi A}$",
      "$T = 2\\\\pi \\\\sqrt{\\\\frac{A}{v_{\\\\max}}}$"
    ],
    "answer": 0,
    "explanation": "সর্বোচ্চ বেগ $v_{\\\\max} = \\\\omega A = \\\\frac{2\\\\pi}{T} A \\\\implies T = \\\\frac{2\\\\pi A}{v_{\\\\max}}$। (রেফারেন্স: ইসহাক স্যার)",
    "topic": "পর্যায়বৃত্ত গতি",
    "examTags": [
      { "type": "MAT", "session": "2023-2024" },
      { "type": "DAT", "session": "2020-2021" },
      { "type": "DU A", "session": "2018-2019" }
    ],
    "difficulty": "medium",
    "isHighYield": true
  },
  {
    "question": "নিচের কোনটি $100\\\\text{ mL } 0.1\\\\text{ M } \\\\text{H}_2\\\\text{SO}_4$ দ্রবণকে সম্পূর্ণ প্রশমিত করতে পারবে?",
    "options": [
      "$100\\\\text{ mL } 0.1\\\\text{ M NaOH}$",
      "$100\\\\text{ mL } 0.2\\\\text{ M NaOH}$",
      "$50\\\\text{ mL } 0.1\\\\text{ M NaOH}$",
      "$200\\\\text{ mL } 0.2\\\\text{ M NaOH}$"
    ],
    "answer": 1,
    "explanation": "$\\\\text{H}_2\\\\text{SO}_4$ দ্বিক্ষারকীয় অম্ল। $V_a S_a e_a = V_b S_b e_b \\\\implies 100 \\\\times 0.1 \\\\times 2 = 100 \\\\times 0.2 \\\\times 1 = 20\\\\text{ mmol}$।",
    "topic": "পরিমাণগত রসায়ন",
    "examTags": [
      { "type": "MBBS & BDS", "session": "2023-2024" },
      { "type": "DU A", "session": "2021-2022" }
    ],
    "difficulty": "medium",
    "isHighYield": true
  }
]`;

export default function AdmissionQuestionManager() {
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();

  const { data: medicalSubjects = [] } = useMedicalConfig();

  // ─── Filter States ─────────────────────────────────────────────────────────
  const [filterSubjectOptionId, setFilterSubjectOptionId] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [filterExamType, setFilterExamType] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Question List State ───────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Bulk Upload Modal State ───────────────────────────────────────────────
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSubjectOptionId, setBulkSubjectOptionId] = useState('physics-1');
  const [bulkChapterId, setBulkChapterId] = useState('');
  const [bulkExamType, setBulkExamType] = useState('MBBS & BDS');
  const [isBulkMainBook, setIsBulkMainBook] = useState(false);
  const [bulkBookName, setBulkBookName] = useState('');
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);

  // ─── Single Question Modal State ───────────────────────────────────────────
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [singleForm, setSingleForm] = useState({
    id: '',
    subjectOptionId: 'physics-1',
    chapterId: '',
    topic: '',
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: '',
    examType: 'MBBS & BDS',
    year: '2023-2024',
    isMainBook: false,
    bookName: '',
    difficulty: 'medium',
    isHighYield: true
  });

  // Selected subject configuration helper
  const currentFilterSubjectOption = useMemo(() => {
    return SUBJECT_OPTIONS.find(s => s.id === filterSubjectOptionId);
  }, [filterSubjectOptionId]);

  const currentBulkSubjectOption = useMemo(() => {
    return SUBJECT_OPTIONS.find(s => s.id === bulkSubjectOptionId) || SUBJECT_OPTIONS[0];
  }, [bulkSubjectOptionId]);

  // Fetch Questions from Firestore
  // পরীক্ষার ধরন (examType) দিয়ে সার্ভার-সাইডে ফিল্টার করা হয় না ইচ্ছাকৃতভাবে —
  // একটা প্রশ্ন এখন একসাথে একাধিক পরীক্ষায় (MBBS & BDS, MAT, DU A...) থাকতে
  // পারে `examTags` অ্যারেতে, যেটা top-level `examType` ফিল্ডে ধরা পড়ে না।
  // তাই পরীক্ষার ধরন অনুযায়ী ফিল্টারিং হয় নিচে filteredQuestions মেমোতে, client-side এ।
  useEffect(() => {
    fetchQuestions();
  }, [filterSubjectOptionId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qRef = collection(db, 'question_bank');
      let qConstraints = [];

      if (currentFilterSubjectOption) {
        qConstraints.push(where('subject', '==', currentFilterSubjectOption.rawSubject));
      }

      const q = qConstraints.length > 0
        ? query(qRef, ...qConstraints, limit(300))
        : query(qRef, limit(300));

      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(items);
    } catch (err) {
      console.error('Error fetching questions:', err);
      toast.error('প্রশ্ন লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to resolve chapters strictly by Subject AND Paper
  const resolveChaptersForOption = (subjectOptionId) => {
    if (!subjectOptionId || subjectOptionId === 'all') {
      const all = [];
      medicalSubjects.forEach(s => {
        if (Array.isArray(s.chapters)) {
          s.chapters.forEach(ch => all.push({ ...ch, subjectName: s.name }));
        }
      });
      return all;
    }

    const option = SUBJECT_OPTIONS.find(s => s.id === subjectOptionId);
    if (!option) return [];

    const rawSubId = option.rawSubject;
    const medSub = medicalSubjects.find(
      s => s.id === rawSubId || s.id?.toLowerCase() === rawSubId?.toLowerCase()
    );
    if (!medSub || !Array.isArray(medSub.chapters)) return [];

    const filtered = medSub.chapters.filter(ch => {
      if (!ch.paper) return true;
      const p = ch.paper.toLowerCase();
      
      if (subjectOptionId === 'biology-1') {
        return p.includes('উদ্ভিদ') || p.includes('১ম') || p.includes('botany') || p.includes('1');
      }
      if (subjectOptionId === 'biology-2') {
        return p.includes('প্রাণি') || p.includes('২য়') || p.includes('zoology') || p.includes('2');
      }
      if (subjectOptionId.endsWith('-1')) {
        return p.includes('১ম') || p.includes('1st') || p.includes('1');
      }
      if (subjectOptionId.endsWith('-2')) {
        return p.includes('২য়') || p.includes('2nd') || p.includes('2');
      }
      return true;
    });

    return filtered.length > 0 ? filtered : medSub.chapters;
  };

  // Dedicated chapter lists for each UI context (Filter, Bulk Modal, Single Modal)
  const filterChapters = useMemo(() => resolveChaptersForOption(filterSubjectOptionId), [filterSubjectOptionId, medicalSubjects]);
  const bulkChapters = useMemo(() => resolveChaptersForOption(bulkSubjectOptionId), [bulkSubjectOptionId, medicalSubjects]);
  const singleChapters = useMemo(() => resolveChaptersForOption(singleForm.subjectOptionId), [singleForm.subjectOptionId, medicalSubjects]);

  // Backward-compatible alias
  const availableChapters = filterChapters;

  // Real-time JSON validation & LaTeX parser for Bulk Upload with Intra-Batch Deduplication
  const [batchDuplicatesRemoved, setBatchDuplicatesRemoved] = useState(0);

  useEffect(() => {
    if (!bulkJsonText.trim()) {
      setParsedQuestions([]);
      setParseError('');
      setBatchDuplicatesRemoved(0);
      return;
    }

    try {
      const sanitized = sanitizeLatexJson(bulkJsonText.trim());
      const parsed = JSON.parse(sanitized);

      if (!Array.isArray(parsed)) {
        setParseError('JSON অবশ্যই একটি Array [...] হতে হবে!');
        setParsedQuestions([]);
        setBatchDuplicatesRemoved(0);
        return;
      }

      // Validate each item and eliminate intra-batch exact duplicates
      const seenFp = new Set();
      let internalDups = 0;
      const validated = [];

      for (let idx = 0; idx < parsed.length; idx++) {
        const item = parsed[idx];
        if (!item.question || !item.options || !Array.isArray(item.options)) {
          throw new Error(`প্রশ্ন #${idx + 1} এ 'question' অথবা 'options' অপূর্ণ রয়েছে`);
        }
        
        const normTags = normalizeExamTags(item, bulkExamType);
        if (normTags.length === 0 && !item.year) {
          throw new Error(`প্রশ্ন #${idx + 1} এ 'year', 'examTags', বা 'institutions' কিছুই উল্লেখ নেই`);
        }

        const fp = generateQuestionFingerprint(item.question, item.options);
        if (seenFp.has(fp)) {
          internalDups++;
          continue; // Skip duplicate inside the same JSON
        }
        seenFp.add(fp);

        validated.push({
          ...item,
          examTags: normTags,
          answer: typeof item.answer === 'number' ? item.answer : 0,
          options: item.options.slice(0, 4)
        });
      }

      setParsedQuestions(validated);
      setBatchDuplicatesRemoved(internalDups);
      setParseError('');
    } catch (err) {
      setParseError(`JSON ফরম্যাট এরর: ${err.message}`);
      setParsedQuestions([]);
      setBatchDuplicatesRemoved(0);
    }
  }, [bulkJsonText, bulkExamType]);

  // ─── Bulk Upload Execution (with Database Deduplication) ────────────────────
  const handleExecuteBulkUpload = async () => {
    if (!parsedQuestions.length) {
      toast.error('আপলোড করার জন্য কোনো বৈধ প্রশ্ন নেই!');
      return;
    }

    setUploading(true);
    try {
      // 1. Fetch existing questions for this subject to detect database duplicates
      const qRef = collection(db, 'question_bank');
      const existingQuery = query(qRef, where('subject', '==', currentBulkSubjectOption.rawSubject));
      const existingSnap = await getDocs(existingQuery);
      
      const existingFpSet = new Set();
      if (!existingSnap.empty) {
        existingSnap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const fp = generateQuestionFingerprint(d.question, d.options);
          if (fp) existingFpSet.add(fp);
        });
      }

      // 2. Filter out questions that already exist in database
      const uniqueToUpload = parsedQuestions.filter(qItem => {
        const fp = generateQuestionFingerprint(qItem.question, qItem.options);
        return !existingFpSet.has(fp);
      });

      const dbDuplicatesCount = parsedQuestions.length - uniqueToUpload.length;

      if (uniqueToUpload.length === 0) {
        toast.error(`আপলোড করা সকল (${parsedQuestions.length}টি) প্রশ্ন ইতিমধ্যে ডাটাবেসে বিদ্যমান রয়েছে! কোনো ডুপ্লিকেট প্রশ্ন যুক্ত করা হয়নি।`, { duration: 5000 });
        setUploading(false);
        return;
      }

      const batchSize = 100;
      let totalSaved = 0;

      for (let i = 0; i < uniqueToUpload.length; i += batchSize) {
        const chunk = uniqueToUpload.slice(i, i + batchSize);
        const batch = writeBatch(db);

        chunk.forEach((qItem) => {
          const docId = qItem.id || `adm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          const docRef = doc(db, 'question_bank', docId);

          const finalExamTags = qItem.examTags?.length > 0 
            ? qItem.examTags 
            : normalizeExamTags(qItem, bulkExamType);

          const primaryExamType = finalExamTags[0]?.type || qItem.examType || bulkExamType || 'MBBS & BDS';
          const primaryYear = finalExamTags[0]?.session || qItem.year || '';
          const isMainBookVal = qItem.isMainBook ?? (isBulkMainBook || primaryExamType.includes('Main Book') || primaryExamType.includes('বইয়ের অনুশীলনী'));
          const bookNameVal = qItem.bookName || (isBulkMainBook ? bulkBookName : '') || '';

          const payload = {
            id: docId,
            category: 'admission',
            subject: currentBulkSubjectOption.rawSubject,
            paper: currentBulkSubjectOption.paperName,
            subjectOptionId: currentBulkSubjectOption.id,
            chapterId: bulkChapterId || qItem.chapterId || '',
            topic: qItem.topic || '',
            question: qItem.question,
            options: qItem.options,
            answer: qItem.answer ?? 0,
            explanation: qItem.explanation || '',
            examType: primaryExamType,
            year: primaryYear,
            examTags: finalExamTags,
            isMainBook: isMainBookVal,
            bookName: bookNameVal,
            tracks: qItem.tracks || [primaryExamType.toLowerCase().includes('mbbs') || primaryExamType.toLowerCase().includes('bds') || primaryExamType.toLowerCase().includes('mat') ? 'medical' : 'varsity'],
            difficulty: qItem.difficulty || 'medium',
            isHighYield: qItem.isHighYield ?? true,
            createdAt: new Date().toISOString()
          };

          batch.set(docRef, payload, { merge: true });
        });

        await batch.commit();
        totalSaved += chunk.length;
      }

      const totalDups = (batchDuplicatesRemoved || 0) + dbDuplicatesCount;
      if (totalDups > 0) {
        toast.success(`মোট ${totalSaved}টি নতুন প্রশ্ন সেভ হয়েছে (${totalDups}টি ডুপ্লিকেট বাদ দেওয়া হয়েছে)!`, { duration: 5000 });
      } else {
        toast.success(`${totalSaved}টি প্রশ্ন সফলভাবে আপলোড ও সেভ করা হয়েছে!`);
      }

      setShowBulkModal(false);
      setBulkJsonText('');
      setParsedQuestions([]);
      setBatchDuplicatesRemoved(0);
      fetchQuestions();

      // Invalidate relevant query caches across app
      queryClient.invalidateQueries({ queryKey: ['medical_questions'] });
      queryClient.invalidateQueries({ queryKey: ['medical_subject_questions'] });
    } catch (err) {
      console.error('Bulk upload failed:', err);
      toast.error(`আপলোড ব্যর্থ হয়েছে: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ─── Single Question Handlers ───────────────────────────────────────────────
  const handleOpenAddSingle = () => {
    setSingleForm({
      id: `adm-${Date.now()}`,
      subjectOptionId: filterSubjectOptionId !== 'all' ? filterSubjectOptionId : 'physics-1',
      chapterId: filterChapter !== 'all' ? filterChapter : '',
      topic: '',
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: '',
      examType: filterExamType !== 'all' ? filterExamType : 'MBBS & BDS',
      year: '2023-2024',
      difficulty: 'medium',
      isHighYield: true,
      isMainBook: isBulkMainBook || false,
      bookName: bulkBookName || ''
    });
    setEditingQuestion(null);
    setShowSingleModal(true);
  };

  const handleOpenEditQuestion = (item) => {
    // Find matched subjectOptionId
    const matchedOpt = SUBJECT_OPTIONS.find(s => s.id === item.subjectOptionId) ||
      SUBJECT_OPTIONS.find(s => s.rawSubject === item.subject) || SUBJECT_OPTIONS[0];

    setSingleForm({
      id: item.id,
      subjectOptionId: matchedOpt.id,
      chapterId: item.chapterId || '',
      topic: item.topic || '',
      question: item.question || '',
      options: Array.isArray(item.options) ? item.options : ['', '', '', ''],
      answer: typeof item.answer === 'number' ? item.answer : 0,
      explanation: item.explanation || '',
      examType: item.examType || 'MBBS & BDS',
      year: item.year || '2023-2024',
      difficulty: item.difficulty || 'medium',
      isHighYield: item.isHighYield ?? true,
      isMainBook: item.isMainBook || item.category === 'main_book' || item.source === 'main_book' || false,
      bookName: item.bookName || item.writer || item.author || ''
    });
    setEditingQuestion(item);
    setShowSingleModal(true);
  };

  const handleDeleteQuestion = async (item) => {
    const ok = await confirm({
      title: 'প্রশ্নটি মুছে ফেলবেন?',
      message: `"${item.question.slice(0, 50)}..." প্রশ্নটি ডাটাবেস থেকে মুছে ফেলা হবে।`,
      confirmText: 'মুছে ফেলুন',
      danger: true
    });
    if (!ok) return;

    try {
      await deleteDoc(doc(db, 'question_bank', item.id));
      setQuestions(prev => prev.filter(q => q.id !== item.id));
      toast.success('প্রশ্নটি মুছে ফেলা হয়েছে');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('প্রশ্ন ডিলিট করা যায়নি');
    }
  };

  const handleSaveSingleForm = async (e) => {
    e.preventDefault();
    if (!singleForm.question.trim()) {
      toast.error('প্রশ্নের টেক্সট আবশ্যক!');
      return;
    }

    try {
      const docId = singleForm.id || `adm-${Date.now()}`;
      const chosenSub = SUBJECT_OPTIONS.find(s => s.id === singleForm.subjectOptionId) || SUBJECT_OPTIONS[0];

      const payload = {
        ...singleForm,
        id: docId,
        category: 'admission',
        subject: chosenSub.rawSubject,
        paper: chosenSub.paperName,
        subjectOptionId: chosenSub.id,
        options: singleForm.options.map(opt => opt.trim()),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'question_bank', docId), payload, { merge: true });

      if (editingQuestion) {
        setQuestions(prev => prev.map(q => q.id === docId ? payload : q));
        toast.success('প্রশ্ন সফলভাবে আপডেট করা হয়েছে');
      } else {
        setQuestions(prev => [payload, ...prev]);
        toast.success('নতুন প্রশ্ন যুক্ত হয়েছে');
      }

      setShowSingleModal(false);
    } catch (err) {
      console.error('Error saving single question:', err);
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  // ─── Smart Exam Type Matching Helper ────────────────────────────────────────
  const isQuestionMatchingExamType = (q, filterType) => {
    if (!filterType || filterType === 'all') return true;

    const target = String(filterType).toLowerCase().trim();
    const qType = String(q.examType || '').toLowerCase().trim();
    const tags = Array.isArray(q.examTags) ? q.examTags : [];
    const tagTypes = tags.map(t => {
      if (typeof t === 'string') return t.toLowerCase().trim();
      return String(t?.type || t?.name || '').toLowerCase().trim();
    });
    const allExamStrings = [qType, ...tagTypes].filter(Boolean);

    // 1. Main Book matching
    if (target.includes('main book') || target.includes('অনুশীলনী') || target.includes('বই')) {
      if (q.isMainBook || q.category === 'main_book' || q.source === 'main_book') return true;
      return allExamStrings.some(s => s.includes('main book') || s.includes('বই') || s.includes('অনুশীলনী') || s.includes('হাজারী') || s.includes('আজমল') || s.includes('ইসহাক'));
    }

    // 2. Exact match against top-level or any tag
    if (allExamStrings.some(s => s === target)) return true;

    // 3. MBBS / BDS / Medical matching
    if (target === 'mbbs & bds' || target === 'mbbs' || target === 'bds' || target === 'medical' || target === 'মেডিকেল') {
      return allExamStrings.some(s =>
        s.includes('mbbs') || s.includes('bds') || s.includes('mat') || s.includes('dat') || s.includes('medical') || s.includes('dental') || s.includes('মেডিকেল') || s.includes('ডেন্টাল')
      );
    }

    // 4. BUET
    if (target === 'buet' || target === 'বুয়েট') {
      return allExamStrings.some(s => s.includes('buet') || s.includes('বুয়েট') || s.includes('বুয়েট'));
    }

    // 5. CKET / Engineering
    if (target === 'cket' || target === 'engineering' || target === 'ইঞ্জিনিয়ারিং' || target === 'ইঞ্জিনিয়ারিং') {
      return allExamStrings.some(s => s.includes('cket') || s.includes('ruet') || s.includes('kuet') || s.includes('cuet') || s.includes('butex') || s.includes('mist') || s.includes('engineering') || s.includes('ইঞ্জিনিয়ারিং') || s.includes('ইঞ্জিনিয়ারিং'));
    }

    // 6. DU A / DU / Dhaka University
    if (target === 'du a' || target === 'du-a' || target === 'du' || target === 'ঢাবি') {
      return allExamStrings.some(s => s.includes('du') || s.includes('ঢাবি') || s.includes('ঢাকা'));
    }

    // 7. GST / Gucche
    if (target === 'gst' || target === 'গুচ্ছ') {
      return allExamStrings.some(s => s.includes('gst') || s.includes('গুচ্ছ') || s.includes('cluster'));
    }

    // 8. Agri / Agriculture
    if (target === 'agri' || target === 'কৃষি') {
      return allExamStrings.some(s => s.includes('agri') || s.includes('কৃষি') || s.includes('bau') || s.includes('bsmrau'));
    }

    // 9. Nursing
    if (target === 'nursing' || target === 'নার্সিং') {
      return allExamStrings.some(s => s.includes('nursing') || s.includes('নার্সিং') || s.includes('bsc') || s.includes('diploma') || s.includes('midwifery'));
    }

    // 10. Varsity
    if (target === 'varsity' || target === 'ভার্সিটি') {
      return allExamStrings.some(s => s.includes('varsity') || s.includes('ভার্সিটি') || s.includes('ru') || s.includes('cu') || s.includes('ju') || s.includes('sust'));
    }

    // 11. Generic fallback substring match
    return allExamStrings.some(s => s.includes(target) || target.includes(s));
  };

  // ─── Filtered Questions Memo ────────────────────────────────────────────────
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Check paper/subject filter
      let matchSub = true;
      if (filterSubjectOptionId !== 'all') {
        const sel = currentFilterSubjectOption;
        if (sel) {
          if (q.subjectOptionId) {
            matchSub = q.subjectOptionId === sel.id;
          } else {
            matchSub = q.subject === sel.rawSubject;
            if (sel.id === 'biology-1') matchSub = matchSub && (q.paper?.includes('উদ্ভিদ') || q.paper?.includes('১ম'));
            else if (sel.id === 'biology-2') matchSub = matchSub && (q.paper?.includes('প্রাণি') || q.paper?.includes('২য়'));
            else if (sel.id.endsWith('-1')) matchSub = matchSub && q.paper?.includes('১ম');
            else if (sel.id.endsWith('-2')) matchSub = matchSub && q.paper?.includes('২য়');
          }
        }
      }

      const matchChapter = filterChapter === 'all' || q.chapterId === filterChapter;

      // Smart Exam Type match (top-level + examTags + isMainBook)
      const matchExamType = isQuestionMatchingExamType(q, filterExamType);

      // Session match (year + examTags)
      const tags = Array.isArray(q.examTags) ? q.examTags : [];
      const matchSession = filterSession === 'all' ||
        q.year === filterSession ||
        tags.some(t => {
          const s = typeof t === 'string' ? t : t?.session;
          return s === filterSession || (s && filterSession && s.includes(filterSession));
        });

      const matchSearch = !searchQuery.trim() ||
        q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSub && matchChapter && matchExamType && matchSession && matchSearch;
    });
  }, [questions, filterSubjectOptionId, currentFilterSubjectOption, filterChapter, filterExamType, filterSession, searchQuery]);

  // Dynamic Exam Types from questions database
  const examTypeOptions = useMemo(() => {
    const defaultTypes = ['MBBS & BDS', 'BUET', 'CKET', 'DU A', 'GST', 'Agri', 'Nursing', 'Varsity', 'Main Book (বইয়ের অনুশীলনী)'];
    const found = new Set(defaultTypes);

    questions.forEach(q => {
      if (q.examType && typeof q.examType === 'string' && q.examType.trim()) {
        found.add(q.examType.trim());
      }
      if (Array.isArray(q.examTags)) {
        q.examTags.forEach(t => {
          const typeName = typeof t === 'string' ? t : (t?.type || t?.name);
          if (typeName && typeof typeName === 'string' && typeName.trim()) {
            found.add(typeName.trim());
          }
        });
      }
    });

    return Array.from(found);
  }, [questions]);

  // সেশন সাল ড্রপডাউন প্রশ্নের `year` ফিল্ড ও `examTags[].session` — দুই জায়গা থেকেই বের করা হয়
  const sessionOptions = useMemo(() => {
    const years = new Set();
    questions.forEach(q => {
      if (q.year) years.add(q.year);
      if (Array.isArray(q.examTags)) {
        q.examTags.forEach(t => { if (t?.session) years.add(t.session); });
      }
    });
    return Array.from(years).sort().reverse();
  }, [questions]);

  // ২০টি করে পেজিনেশন
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSubjectOptionId, filterChapter, filterExamType, filterSession, searchQuery]);

  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  return (
    <div className="space-y-5 font-bangla text-slate-200">
      {confirmDialog}

      {/* ═══════════════════════════════════════════════════════════════════════════
          CONTROL & FILTER BAR (1st Paper & 2nd Paper Separated)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">
                অ্যাডমিশন প্রশ্নব্যাংক ও LaTeX আপলোডার
              </h3>
              <p className="text-slate-400 text-xs">
                ১ম পত্র ও ২য় পত্র অনুযায়ী আলাদা বিষয়ভিত্তিক প্রশ্ন ও সমীকরণ পরিচালনা
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleOpenAddSingle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/20 text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>একক প্রশ্ন</span>
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>বাল্ক JSON আপলোড</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Subject with 1st/2nd Paper */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-medium text-slate-400 mb-1">বিষয় ও পত্র</label>
            <select
              value={filterSubjectOptionId}
              onChange={(e) => {
                setFilterSubjectOptionId(e.target.value);
                setFilterChapter('all');
              }}
              className="w-full"
            >
              <option value="all">সকল বিষয় ও পত্র</option>
              {SUBJECT_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">অধ্যায় (Chapter)</label>
            <select
              value={filterChapter}
              onChange={(e) => setFilterChapter(e.target.value)}
              className="w-full"
            >
              <option value="all">সকল অধ্যায়</option>
              {availableChapters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">পরীক্ষার ধরন</label>
            <select
              value={filterExamType}
              onChange={(e) => setFilterExamType(e.target.value)}
              className="w-full"
            >
              <option value="all">সকল পরীক্ষা</option>
              {examTypeOptions.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">সেশন সাল</label>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full"
            >
              <option value="all">সকল সেশন</option>
              {sessionOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">প্রশ্ন খুঁজুন</label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শব্দ বা টপিক..."
                className="w-full !pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          QUESTIONS LIST (Live KaTeX & LaTeX rendered)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>মোট প্রশ্ন পাওয়া গেছে: {filteredQuestions.length} টি</span>
          <button onClick={fetchQuestions} className="hover:text-white flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> রিফ্রেশ
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mb-2" />
            <p className="text-slate-400 text-xs">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-10 text-center space-y-3">
            <BookOpen className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">কোনো প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-slate-500 text-xs">
              উপরের 'বাল্ক JSON আপলোড' বাটনে ক্লিক করে প্রশ্ন পেস্ট করুন।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedQuestions.map((q, idx) => {
              const globalIdx = (currentPage - 1) * pageSize + idx;
              return (
                <div
                  key={q.id || globalIdx}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.015] hover:border-white/10 p-4 transition-colors space-y-3"
                >
                  {/* Header: Number, Paper, Tags, Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        #{globalIdx + 1}
                      </span>
                      {Array.isArray(q.examTags) && q.examTags.length > 0 ? (
                        q.examTags.map((t, tIdx) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {t.type || t.name} {t.session || t.year || ''}
                          </span>
                        ))
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {q.examType || 'MBBS & BDS'} {q.year || ''}
                        </span>
                      )}
                      {q.paper && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-slate-300 border border-white/[0.06]">
                          {q.paper}
                        </span>
                      )}
                      {q.topic && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.03] text-slate-400 border border-white/[0.05]">
                          {q.topic}
                        </span>
                      )}
                      {q.isHighYield && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> High-Yield
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white"
                        title="সম্পাদনা"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q)}
                        className="p-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-rose-400"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Stem with KaTeX */}
                  <div className="text-slate-100 font-medium text-sm leading-relaxed">
                    <MarkdownRenderer content={q.question} />
                  </div>

                  {/* 4 Options Grid with KaTeX */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {q.options?.map((opt, optIdx) => {
                      const isCorrect = q.answer === optIdx;
                      const optLabels = ['ক', 'খ', 'গ', 'ঘ'];
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 font-medium'
                              : 'bg-white/[0.02] border-white/[0.04] text-slate-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 border ${
                            isCorrect
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                          }`}>
                            {optLabels[optIdx] || optIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <MarkdownRenderer content={opt} />
                          </div>
                          {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box with KaTeX */}
                  {q.explanation && (
                    <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 text-xs text-slate-300 space-y-1">
                      <span className="font-medium text-indigo-300 block text-[11px]">
                        💡 সমাধান ও ব্যাখ্যা:
                      </span>
                      <MarkdownRenderer content={q.explanation} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
                <span className="text-slate-400">
                  মোট <span className="font-mono text-white font-bold">{filteredQuestions.length}</span>টির মধ্যে{' '}
                  <span className="font-mono text-white font-bold">{((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredQuestions.length)}</span>টি দেখানো হচ্ছে
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] transition"
                  >
                    আগের পৃষ্ঠা
                  </button>
                  <span className="px-2 font-mono font-bold text-indigo-400">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.08] transition"
                  >
                    পরের পৃষ্ঠা
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BULK JSON UPLOADER MODAL (1st/2nd Paper Selector & LaTeX Sanitizer)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">
                  বাল্ক JSON প্রশ্ন আপলোডার (পত্রভিত্তিক ও LaTeX Auto-Sanitizer)
                </h3>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-1 rounded-md text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Assignment Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
              <div>
                <label className="block text-slate-400 font-medium mb-1">টার্গেট বিষয় ও পত্র</label>
                <select
                  value={bulkSubjectOptionId}
                  onChange={(e) => {
                    setBulkSubjectOptionId(e.target.value);
                    setBulkChapterId('');
                  }}
                  className="w-full"
                >
                  {SUBJECT_OPTIONS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">টার্গেট অধ্যায়</label>
                <select
                  value={bulkChapterId}
                  onChange={(e) => setBulkChapterId(e.target.value)}
                  className="w-full"
                >
                  <option value="">অধ্যায় সিলেক্ট করুন (ঐচ্ছিক)</option>
                  {bulkChapters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">পরীক্ষার ধরন</label>
                <select
                  value={bulkExamType}
                  onChange={(e) => setBulkExamType(e.target.value)}
                  className="w-full"
                >
                  {EXAM_TYPE_OPTIONS.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Main Book Checkbox & Author Input */}
            <div className="flex flex-wrap items-center gap-4 text-xs bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-200">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBulkMainBook}
                  onChange={(e) => setIsBulkMainBook(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <span>এটি মূল বইয়ের অনুশীলনী MCQ (Main Book Practice)</span>
              </label>

              {isBulkMainBook && (
                <div className="flex items-center gap-2">
                  <label className="text-slate-400">বই / লেখকের নাম:</label>
                  <input
                    type="text"
                    value={bulkBookName}
                    onChange={(e) => setBulkBookName(e.target.value)}
                    placeholder="যেমন: ড. আবুল হাসান / গাজী আজমল"
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 -mt-1.5">
              সেশন সাল আলাদা করে দিতে হবে না — নিচের JSON-এর প্রতিটা প্রশ্নের নিজস্ব <code className="text-indigo-300">"year"</code> ফিল্ড থেকে স্বয়ংক্রিয়ভাবে নেওয়া হবে।
            </p>

            {/* JSON Input Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">MCQ JSON ডেটা পেস্ট করুন:</span>
                <button
                  type="button"
                  onClick={() => setBulkJsonText(SAMPLE_TEMPLATE_JSON)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                >
                  <Copy className="h-3 w-3" /> নমুনা LaTeX JSON লোড করুন
                </button>
              </div>

              <textarea
                rows={8}
                value={bulkJsonText}
                onChange={(e) => setBulkJsonText(e.target.value)}
                placeholder="[ { question: '...', options: [...], answer: 0, explanation: '...' }, ... ]"
                className="w-full font-mono text-xs text-slate-200"
              />
            </div>

            {/* Live Parsing & Validation Status */}
            {parseError ? (
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{parseError}</span>
              </div>
            ) : parsedQuestions.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <span>মোট <strong>{parsedQuestions.length}টি</strong> ইউনিক প্রশ্ন প্রস্তুত ({currentBulkSubjectOption.name})</span>
                      {batchDuplicatesRemoved > 0 && (
                        <span className="block text-[11px] text-amber-300 font-medium mt-0.5">
                          ⚡ JSON থেকে {batchDuplicatesRemoved}টি হুবহু ডুপ্লিকেট প্রশ্ন স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়েছে
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">Ready</span>
                </div>

                {/* KaTeX Live Preview Carousel / Snippet */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2 max-h-48 overflow-y-auto">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    👁️ লাইভ সমীকরণ প্রিভিউ (১ম প্রশ্ন):
                  </span>
                  <div className="text-xs text-white">
                    <MarkdownRenderer content={parsedQuestions[0]?.question} />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300 pt-1">
                    {parsedQuestions[0]?.options?.map((opt, oIdx) => (
                      <div key={oIdx} className="bg-white/[0.03] p-1.5 rounded border border-white/[0.04]">
                        <MarkdownRenderer content={opt} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 font-medium text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkUpload}
                disabled={uploading || parsedQuestions.length === 0}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-sm flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>আপলোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>{parsedQuestions.length}টি প্রশ্ন ডাটাবেসে সেভ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SINGLE QUESTION CREATOR / EDITOR MODAL (Premium Modern UI)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/[0.08] bg-slate-900/90 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                    <span>{editingQuestion ? 'প্রশ্ন সম্পাদনা' : 'একক নতুন প্রশ্ন তৈরি'}</span>
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      LaTeX Enabled
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    বিষয়, অধ্যায়, সঠিক উত্তর ও সমীকরণসহ প্রশ্নের বিস্তারিত তথ্য আপডেট করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSingleModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveSingleForm} className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-xs">
              
              {/* 1. Metadata Card (Subject, Exam, Session, Chapter, Topic) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-4 shadow-sm">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>বেসিক মেটাডেটা ও শ্রেণিবিন্যাস</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Subject & Paper */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">বিষয় ও পত্র:*</label>
                    <div className="relative">
                      <select
                        value={singleForm.subjectOptionId}
                        onChange={(e) => setSingleForm({ ...singleForm, subjectOptionId: e.target.value, chapterId: '' })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        {SUBJECT_OPTIONS.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Exam Type */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">পরীক্ষার ধরন:*</label>
                    <div className="relative">
                      <select
                        value={singleForm.examType}
                        onChange={(e) => setSingleForm({ ...singleForm, examType: e.target.value })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        {EXAM_TYPE_OPTIONS.map(e => (
                          <option key={e} value={e} className="bg-slate-900">{e}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Session Year */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">সেশন / সাল:*</label>
                    <input
                      type="text"
                      value={singleForm.year}
                      onChange={(e) => setSingleForm({ ...singleForm, year: e.target.value })}
                      placeholder="যেমন: 2023-2024"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-slate-800/60">
                  {/* Chapter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">অধ্যায় (Chapter):</label>
                    <div className="relative">
                      <select
                        value={singleForm.chapterId}
                        onChange={(e) => setSingleForm({ ...singleForm, chapterId: e.target.value })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                      >
                        <option value="" className="bg-slate-900">অধ্যায় সিলেক্ট করুন (ঐচ্ছিক)</option>
                        {singleChapters.map(c => (
                          <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300 block">টপিক / বিষয়বস্তু:</label>
                    <input
                      type="text"
                      value={singleForm.topic || ''}
                      onChange={(e) => setSingleForm({ ...singleForm, topic: e.target.value })}
                      placeholder="যেমন: কোষ ও একটি আদর্শ উদ্ভিদ কোষ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Main Book Practice Settings */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 font-bold cursor-pointer text-amber-200 text-xs sm:text-sm select-none">
                    <input
                      type="checkbox"
                      checked={singleForm.isMainBook || false}
                      onChange={(e) => setSingleForm({ ...singleForm, isMainBook: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400 h-4 w-4 accent-amber-500 cursor-pointer"
                    />
                    <span>📖 এটি মূল বইয়ের অনুশীলনী প্রশ্ন (Main Book Practice MCQ)</span>
                  </label>

                  {singleForm.isMainBook && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 self-start sm:self-auto">
                      Textbook Mode Active
                    </span>
                  )}
                </div>

                {singleForm.isMainBook && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-2 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-slate-300 font-bold shrink-0">বই / লেখকের নাম:</label>
                      <input
                        type="text"
                        value={singleForm.bookName || ''}
                        onChange={(e) => setSingleForm({ ...singleForm, bookName: e.target.value })}
                        placeholder="যেমন: ড. আবুল হাসান / গাজী আজমল / হাজারী ও নাগ"
                        className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-950 border border-amber-500/40 text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Quick Author Preset Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10.5px] text-slate-400 font-medium">কুইক সিলেক্ট:</span>
                      {['ড. আবুল হাসান স্যার', 'গাজী আজমল স্যার', 'হাজারী ও নাগ স্যার', 'ড. শাহজাহান তপন ও ইসহাক স্যার'].map(author => (
                        <button
                          key={author}
                          type="button"
                          onClick={() => setSingleForm({ ...singleForm, bookName: author })}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/40 text-[10.5px] text-slate-300 hover:text-amber-200 transition"
                        >
                          {author}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Question Stem & Live KaTeX Preview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>প্রশ্নের বিবরণ:*</span>
                  </label>

                  {/* LaTeX Formula Toolbar */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400">LaTeX শর্টকাট:</span>
                    {[
                      { label: '\\text', code: '$\\text{}$' },
                      { label: '\\frac', code: '$\\frac{a}{b}$' },
                      { label: '\\times', code: '$\\times$' },
                      { label: '\\pm', code: '$\\pm$' },
                      { label: '^2', code: '$x^2$' },
                      { label: '_2', code: '$H_2O$' },
                      { label: '\\Delta', code: '$\\Delta$' },
                      { label: '\\alpha', code: '$\\alpha$' },
                      { label: '\\beta', code: '$\\beta$' }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSingleForm(prev => ({ ...prev, question: (prev.question ? `${prev.question} ${item.code}` : item.code) }))}
                        className="px-1.5 py-0.5 rounded-md bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700 text-slate-300 text-[10px] font-mono transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={singleForm.question}
                  onChange={(e) => setSingleForm({ ...singleForm, question: e.target.value })}
                  placeholder="যেমন: মানবদেহের দীর্ঘতম কোষ কোনটি? অথবা $E = mc^2$ সূত্রে আলোর বেগ কত?"
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs sm:text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                  required
                />

                {singleForm.question && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-slate-100 shadow-sm space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">
                      লাইভ KaTeX প্রিভিউ:
                    </span>
                    <div className="text-xs sm:text-sm leading-relaxed">
                      <MarkdownRenderer content={singleForm.question} />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Four Options & Answer Selector (2x2 Grid) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>৪টি অপশন ও সঠিক উত্তর নির্বাচন:*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    (সঠিক উত্তরের অপশনে টিক দিন)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {singleForm.options.map((opt, idx) => {
                    const isCorrect = singleForm.answer === idx;
                    const letters = ['ক', 'খ', 'গ', 'ঘ'];

                    return (
                      <div
                        key={idx}
                        onClick={() => setSingleForm({ ...singleForm, answer: idx })}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition ${
                              isCorrect
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {letters[idx]}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300">
                              অপশন {idx + 1}
                            </span>
                          </div>

                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-lg border transition ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}>
                            {isCorrect ? '✓ সঠিক উত্তর' : 'নির্বাচন করুন'}
                          </span>
                        </div>

                        <input
                          type="text"
                          value={opt}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const newOpts = [...singleForm.options];
                            newOpts[idx] = e.target.value;
                            setSingleForm({ ...singleForm, options: newOpts });
                          }}
                          placeholder={`অপশন ${letters[idx]} এর মান লিখুন ($...$ ফর্মুলা সহ)`}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                          required
                        />

                        {opt && opt.includes('$') && (
                          <div className="px-2 py-1 rounded bg-slate-950/60 text-[11px] text-slate-300">
                            <MarkdownRenderer content={opt} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Explanation & Reference */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-2.5">
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>বিস্তারিত ব্যাখ্যা ও শর্টকাট ($...$ সমীকরণ সাপোর্টেড):</span>
                </label>

                <textarea
                  rows={2}
                  value={singleForm.explanation}
                  onChange={(e) => setSingleForm({ ...singleForm, explanation: e.target.value })}
                  placeholder="ব্যাখ্যা বা রেফারেন্স নোট লিখুন (যেমন: নিউরনের অ্যাক্সন প্রায় ১ মিটার পর্যন্ত লম্বা হতে পারে)..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                />

                {singleForm.explanation && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 block mb-0.5">ব্যাখ্যা প্রিভিউ:</span>
                    <MarkdownRenderer content={singleForm.explanation} />
                  </div>
                )}
              </div>

              {/* Modal Sticky Footer Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08] sticky bottom-0 bg-slate-950/95 -mx-5 -mb-5 p-4 sm:px-6 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/[0.1] bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingQuestion ? 'প্রশ্ন আপডেট করুন' : 'প্রশ্ন সংরক্ষণ করুন'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

