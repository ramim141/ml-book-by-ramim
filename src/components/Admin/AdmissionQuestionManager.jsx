import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, writeBatch, query, where 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { 
  Search, Plus, Trash2, Edit, Save, UploadCloud, 
  Check, X, Sparkles, Filter, Database, BookOpen, 
  CheckCircle2, AlertTriangle, Copy, RotateCcw, 
  Loader2, Tag, Calendar, Layers, Eye, Code2, FileText, ChevronRight,
  ChevronDown, HelpCircle, CheckSquare
} from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useMedicalConfig } from '../../hooks/useAdmissionData';
import {
  SUBJECT_OPTIONS, isSubjectMatched, isChapterMatched,
  isQuestionMatchingExamType, isSessionMatched, isSearchMatched,
  isMainBookLabel, isMainBookQuestion, displayExamType, MAIN_BOOK_EXAM_TYPE
} from '../../lib/questionFilters';


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
  // ডুপ্লিকেট পেলে বাদ না দিয়ে বিদ্যমান প্রশ্নের মেটাডেটা ঠিক করার মোড
  const [updateDuplicates, setUpdateDuplicates] = useState(false);
  const [bulkBookName, setBulkBookName] = useState('');
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [markingMainBook, setMarkingMainBook] = useState(false);

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
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const qRef = collection(db, 'question_bank');
      const snap = await getDocs(qRef);
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
      
      // ফিঙ্গারপ্রিন্ট → বিদ্যমান ডকের আইডি, যাতে ডুপ্লিকেট পেলে সেটাকে আপডেটও করা যায়
      const existingByFp = new Map();
      if (!existingSnap.empty) {
        existingSnap.docs.forEach(docSnap => {
          const d = docSnap.data();
          const fp = generateQuestionFingerprint(d.question, d.options);
          if (fp && !existingByFp.has(fp)) existingByFp.set(fp, docSnap.id);
        });
      }

      // 2. কোনগুলো নতুন আর কোনগুলো আগে থেকেই আছে
      const uniqueToUpload = [];
      const duplicateTargets = [];
      parsedQuestions.forEach(qItem => {
        const fp = generateQuestionFingerprint(qItem.question, qItem.options);
        const existingId = fp ? existingByFp.get(fp) : null;
        if (existingId) duplicateTargets.push({ qItem, docId: existingId });
        else uniqueToUpload.push(qItem);
      });

      const dbDuplicatesCount = duplicateTargets.length;
      // আপডেট মোড চালু থাকলে ডুপ্লিকেটগুলো বাদ না দিয়ে তাদের মেটাডেটা (অধ্যায়,
      // পরীক্ষার ধরন, মূল বই ফ্ল্যাগ) ঠিক করা হয় — আগে একই প্রশ্ন আবার আপলোড
      // করে ভুল ট্যাগ শোধরানোর কোনো উপায়ই ছিল না।
      const toUpdate = updateDuplicates ? duplicateTargets : [];

      if (uniqueToUpload.length === 0 && toUpdate.length === 0) {
        toast.error(
          `আপলোড করা সকল (${parsedQuestions.length}টি) প্রশ্ন ইতিমধ্যে ডাটাবেসে আছে। ট্যাগ বা অধ্যায় ঠিক করতে চাইলে উপরের "ডুপ্লিকেট হলে মেটাডেটা আপডেট করো" টিক দিয়ে আবার চেষ্টা করুন।`,
          { duration: 6000 }
        );
        setUploading(false);
        return;
      }

      const batchSize = 100;
      const writeJobs = [
        ...uniqueToUpload.map(qItem => ({ qItem, existingId: null })),
        ...toUpdate.map(t => ({ qItem: t.qItem, existingId: t.docId }))
      ];

      for (let i = 0; i < writeJobs.length; i += batchSize) {
        const chunk = writeJobs.slice(i, i + batchSize);
        const batch = writeBatch(db);

        chunk.forEach(({ qItem, existingId }) => {
          const docId = existingId || qItem.id || `adm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          const docRef = doc(db, 'question_bank', docId);

          const finalExamTags = qItem.examTags?.length > 0 
            ? qItem.examTags 
            : normalizeExamTags(qItem, bulkExamType);

          const primaryExamType = finalExamTags[0]?.type || qItem.examType || bulkExamType || 'MBBS & BDS';
          const primaryYear = finalExamTags[0]?.session || qItem.year || '';
          // চেকবক্সে টিক থাকলে সেটাই ব্যাচের চূড়ান্ত সিদ্ধান্ত — আগে JSON এ
          // examTags থাকলে primaryExamType হয়ে যেত 'MAT'/'DU A', আর মূল বইয়ের
          // পরিচয়টা কেবল এই ফ্ল্যাগে টিকত; ফ্ল্যাগ না বসলে ফিল্টারে কিছুই আসত না।
          const isMainBookVal = Boolean(
            isBulkMainBook || qItem.isMainBook || isMainBookLabel(primaryExamType) ||
            (finalExamTags || []).some(t => isMainBookLabel(typeof t === 'string' ? t : (t?.type || t?.name)))
          );
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
            ...(existingId
              ? { updatedAt: new Date().toISOString() }
              : { createdAt: new Date().toISOString() })
          };

          batch.set(docRef, payload, { merge: true });
        });

        await batch.commit();
      }


      const skippedDups = (batchDuplicatesRemoved || 0) + (updateDuplicates ? 0 : dbDuplicatesCount);
      const parts = [];
      if (uniqueToUpload.length) parts.push(`${uniqueToUpload.length}টি নতুন প্রশ্ন সেভ`);
      if (toUpdate.length) parts.push(`${toUpdate.length}টি পুরনো প্রশ্নের তথ্য আপডেট`);
      if (skippedDups) parts.push(`${skippedDups}টি ডুপ্লিকেট বাদ`);
      toast.success(`${parts.join(', ')} হয়েছে!`, { duration: 5000 });

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

  const handleResetFilters = () => {
    setFilterSubjectOptionId('all');
    setFilterChapter('all');
    setFilterExamType('all');
    setFilterSession('all');
    setSearchQuery('');
  };

  // ফিল্টারে টিকে থাকা প্রশ্নগুলোতে মূল বইয়ের ফ্ল্যাগ বসায়। আগে যেসব প্রশ্ন
  // চেকবক্স ছাড়া আপলোড হয়েছে, সেগুলো "Main Book" ফিল্টারে আসত না — এটা তারই মেরামত।
  const handleMarkAsMainBook = async () => {
    const targets = stageInput.examType || [];
    if (!targets.length) return;

    const ok = await confirm({
      title: 'মূল বই হিসেবে চিহ্নিত করবেন?',
      message: `${targets.length}টি প্রশ্নে মূল বইয়ের ফ্ল্যাগ বসানো হবে। প্রশ্ন, অপশন বা উত্তর কিছুই বদলাবে না।`,
      confirmText: 'চিহ্নিত করুন'
    });
    if (!ok) return;

    setMarkingMainBook(true);
    try {
      for (let i = 0; i < targets.length; i += 100) {
        const batch = writeBatch(db);
        targets.slice(i, i + 100).forEach(q => {
          batch.set(
            doc(db, 'question_bank', q.id),
            { isMainBook: true, updatedAt: new Date().toISOString() },
            { merge: true }
          );
        });
        await batch.commit();
      }
      toast.success(`${targets.length}টি প্রশ্ন মূল বই হিসেবে চিহ্নিত হয়েছে।`);
      fetchQuestions();
    } catch (err) {
      console.error('Main book tagging failed:', err);
      toast.error('চিহ্নিত করা যায়নি।');
    } finally {
      setMarkingMainBook(false);
    }
  };

  const handleOpenBulkModal = () => {
    if (filterSubjectOptionId !== 'all') {
      setBulkSubjectOptionId(filterSubjectOptionId);
    }
    if (filterChapter !== 'all') {
      setBulkChapterId(filterChapter);
    }
    if (filterExamType.includes('Main Book') || filterExamType.includes('অনুশীলনী')) {
      setIsBulkMainBook(true);
      setBulkExamType('Main Book (বইয়ের অনুশীলনী)');
    } else if (filterExamType !== 'all') {
      setBulkExamType(filterExamType);
    }
    setShowBulkModal(true);
  };

  const handleOpenAddSingle = () => {
    const defaultSub = filterSubjectOptionId !== 'all' ? filterSubjectOptionId : 'physics-1';
    const defaultChap = filterChapter !== 'all' ? filterChapter : '';
    const defaultIsMainBook = filterExamType.includes('Main Book') || filterExamType.includes('অনুশীলনী');

    setSingleForm({
      id: '',
      subjectOptionId: defaultSub,
      chapterId: defaultChap,
      topic: '',
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: '',
      examType: defaultIsMainBook ? 'Main Book (বইয়ের অনুশীলনী)' : (filterExamType !== 'all' ? filterExamType : 'MBBS & BDS'),
      year: filterSession !== 'all' ? filterSession : '2023-2024',
      difficulty: 'medium',
      isHighYield: true,
      isMainBook: defaultIsMainBook,
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
      isMainBook: isMainBookQuestion(item),
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

  // ─── ফিল্টার ফানেল ──────────────────────────────────────────
  // শুধু ফলাফল নয়, প্রতিটি ধাপে কতটা প্রশ্ন টিকল সেটাও গোনা হয় — ০টা এলে
  // খালি স্টেটে দেখানো যায় কোন ফিল্টারটা সব বাদ দিয়েছে।
  const { filteredQuestions, funnel, stageInput } = useMemo(() => {
    const cleanSearch = searchQuery.toLowerCase().trim();
    const counts = { subject: 0, chapter: 0, examType: 0, session: 0, search: 0 };
    // কোন ধাপে কোন প্রশ্নগুলো ঢুকেছিল — বাদ পড়ার কারণ দেখাতে দরকার হয়
    const input = { subject: questions, chapter: [], examType: [], session: [], search: [] };
    const list = [];

    questions.forEach(q => {
      if (!isSubjectMatched(q, currentFilterSubjectOption)) return;
      counts.subject++;
      input.chapter.push(q);
      if (!isChapterMatched(q, filterChapter, availableChapters)) return;
      counts.chapter++;
      input.examType.push(q);
      if (!isQuestionMatchingExamType(q, filterExamType)) return;
      counts.examType++;
      input.session.push(q);
      if (!isSessionMatched(q, filterSession)) return;
      counts.session++;
      input.search.push(q);
      if (!isSearchMatched(q, cleanSearch)) return;
      counts.search++;
      list.push(q);
    });

    return { filteredQuestions: list, funnel: counts, stageInput: input };
  }, [questions, currentFilterSubjectOption, filterChapter, availableChapters, filterExamType, filterSession, searchQuery]);

  // Dynamic Exam Types from questions database
  // ডাটাবেসে একই জিনিস 'Textbook'/'Main Book'/'অনুশীলনী' — নানা নামে থাকতে পারে।
  // ড্রপডাউনে সেগুলো আলাদা অপশন হয়ে ভাগ হয়ে যেত, তাই এক নামে মিলিয়ে দেওয়া হয়।
  const examTypeOptions = useMemo(() => {
    const defaultTypes = ['MBBS & BDS', 'BUET', 'CKET', 'DU A', 'GST', 'Agri', 'Nursing', 'Varsity'];
    const found = new Set(defaultTypes);

    const addType = (raw) => {
      if (!raw || typeof raw !== 'string' || !raw.trim()) return;
      if (isMainBookLabel(raw)) return;   // মূল বইয়ের নামগুলো নিচে একবারেই যোগ হয়
      found.add(raw.trim());
    };

    questions.forEach(q => {
      addType(q.examType);
      if (Array.isArray(q.examTags)) {
        q.examTags.forEach(t => addType(typeof t === 'string' ? t : (t?.type || t?.name)));
      }
    });

    return [...Array.from(found), MAIN_BOOK_EXAM_TYPE];
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
  // প্রতিটি অপশনে কতটা প্রশ্ন পাওয়া যাবে — বাকি ফিল্টারগুলো ধরে রেখে হিসাব,
  // তাই ড্রপডাউন খুললেই বোঝা যায় কোন কম্বিনেশনে ০টা আসবে।
  const optionCounts = useMemo(() => {
    const cleanSearch = searchQuery.toLowerCase().trim();
    const passSubject = q => isSubjectMatched(q, currentFilterSubjectOption);
    const passChapter = q => isChapterMatched(q, filterChapter, availableChapters);
    const passExam = q => isQuestionMatchingExamType(q, filterExamType);
    const passSession = q => isSessionMatched(q, filterSession);
    const passSearch = q => isSearchMatched(q, cleanSearch);

    const forSubject = questions.filter(q => passExam(q) && passSession(q) && passSearch(q));
    const subject = { all: forSubject.length };
    SUBJECT_OPTIONS.forEach(opt => {
      subject[opt.id] = forSubject.filter(q => isSubjectMatched(q, opt)).length;
    });

    const forChapter = questions.filter(q => passSubject(q) && passExam(q) && passSession(q) && passSearch(q));
    const chapter = { all: forChapter.length };
    availableChapters.forEach(c => {
      chapter[c.id] = forChapter.filter(q => isChapterMatched(q, c.id, availableChapters)).length;
    });

    const forExam = questions.filter(q => passSubject(q) && passChapter(q) && passSession(q) && passSearch(q));
    const examType = { all: forExam.length };
    examTypeOptions.forEach(t => {
      examType[t] = forExam.filter(q => isQuestionMatchingExamType(q, t)).length;
    });

    const forSession = questions.filter(q => passSubject(q) && passChapter(q) && passExam(q) && passSearch(q));
    const session = { all: forSession.length };
    sessionOptions.forEach(y => {
      session[y] = forSession.filter(q => isSessionMatched(q, y)).length;
    });

    return { subject, chapter, examType, session };
  }, [questions, currentFilterSubjectOption, filterChapter, availableChapters, filterExamType, filterSession, searchQuery, examTypeOptions, sessionOptions]);

  // খালি ফলাফলের সময় কোন ধাপে বাদ পড়ল, তার তালিকা
  const filterStages = useMemo(() => {
    const stages = [
      {
        key: 'subject',
        label: 'বিষয় ও পত্র',
        value: currentFilterSubjectOption?.name || '',
        active: filterSubjectOptionId !== 'all',
        count: funnel.subject,
        clear: () => { setFilterSubjectOptionId('all'); setFilterChapter('all'); }
      },
      {
        key: 'chapter',
        label: 'অধ্যায়',
        value: availableChapters.find(c => c.id === filterChapter)?.name || '',
        active: filterChapter !== 'all',
        count: funnel.chapter,
        clear: () => setFilterChapter('all')
      },
      {
        key: 'examType',
        label: 'পরীক্ষার ধরন',
        value: filterExamType === 'all' ? '' : filterExamType,
        active: filterExamType !== 'all',
        count: funnel.examType,
        clear: () => setFilterExamType('all')
      },
      {
        key: 'session',
        label: 'সেশন সাল',
        value: filterSession === 'all' ? '' : filterSession,
        active: filterSession !== 'all',
        count: funnel.session,
        clear: () => setFilterSession('all')
      },
      {
        key: 'search',
        label: 'সার্চ',
        value: searchQuery.trim(),
        active: Boolean(searchQuery.trim()),
        count: funnel.search,
        clear: () => setSearchQuery('')
      }
    ];
    const culpritIdx = stages.findIndex(st => st.count === 0);
    return stages.map((st, i) => ({ ...st, isCulprit: i === culpritIdx && st.active }));
  }, [funnel, currentFilterSubjectOption, filterSubjectOptionId, filterChapter, availableChapters, filterExamType, filterSession, searchQuery]);

  // যে ফিল্টারটা সব বাদ দিল, তার আগের ধাপে টিকে থাকা প্রশ্নগুলোতে ওই ফিল্ডের
  // আসল মানগুলো কী কী — "মূল বইয়ের প্রশ্ন আপলোড দিয়েছি কিন্তু দেখায় না" ধরনের
  // সমস্যায় এটাই বলে দেয় প্রশ্নগুলো আসলে কোন ধরনে জমা পড়েছে।
  // দায়ী ফিল্টারটা কি "Main Book"? তাহলে এক ক্লিকে ঠিক করার পথ দেখানো হয়
  const isMainBookFilter = filterStages.some(st => st.isCulprit && st.key === 'examType') &&
    isMainBookLabel(filterExamType);

  const culpritBreakdown = useMemo(() => {
    const culprit = filterStages.find(st => st.isCulprit);
    if (!culprit || culprit.key === 'search') return null;

    const source = stageInput[culprit.key] || [];
    if (source.length === 0) return null;

    const labelOf = (q) => {
      if (culprit.key === 'subject') {
        const opt = SUBJECT_OPTIONS.find(o => o.id === q.subjectOptionId);
        return { value: opt?.id || '', text: opt?.name || q.subject || 'বিষয় লেখা নেই' };
      }
      if (culprit.key === 'chapter') {
        const chap = availableChapters.find(c => c.id === q.chapterId);
        return { value: q.chapterId || '', text: chap?.name || q.chapterId || q.chapter || 'অধ্যায় লেখা নেই' };
      }
      if (culprit.key === 'examType') {
        const shown = displayExamType(q);
        return { value: shown, text: shown || 'ধরন লেখা নেই' };
      }
      return { value: q.year || '', text: q.year || 'সাল লেখা নেই' };
    };

    const map = new Map();
    source.forEach(q => {
      const { value, text } = labelOf(q);
      const row = map.get(text) || { value, text, count: 0 };
      row.count++;
      map.set(text, row);
    });

    const apply = (value) => {
      if (!value) return null;
      if (culprit.key === 'subject') return () => { setFilterSubjectOptionId(value); setFilterChapter('all'); };
      if (culprit.key === 'chapter') return () => setFilterChapter(value);
      if (culprit.key === 'examType') return () => setFilterExamType(value);
      return () => setFilterSession(value);
    };

    const rows = Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(r => ({ ...r, apply: apply(r.value) }));

    return { label: culprit.label, rows };
  }, [filterStages, stageInput, availableChapters]);

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
              onClick={handleOpenBulkModal}
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
              <option value="all">সকল বিষয় ও পত্র ({optionCounts.subject.all})</option>
              {SUBJECT_OPTIONS.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({optionCounts.subject[s.id] || 0})</option>
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
              <option value="all">সকল অধ্যায় ({optionCounts.chapter.all})</option>
              {availableChapters.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({optionCounts.chapter[c.id] || 0})</option>
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
              <option value="all">সকল পরীক্ষা ({optionCounts.examType.all})</option>
              {examTypeOptions.map(e => (
                <option key={e} value={e}>{e} ({optionCounts.examType[e] || 0})</option>
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
              <option value="all">সকল সেশন ({optionCounts.session.all})</option>
              {sessionOptions.map(year => (
                <option key={year} value={year}>{year} ({optionCounts.session[year] || 0})</option>
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
          <span>মোট প্রশ্ন পাওয়া গেছে: <strong className="text-white">{filteredQuestions.length}</strong> টি {questions.length > 0 && <span className="text-slate-500">(ডাটাবেসে মোট {questions.length} টি)</span>}</span>
          <button onClick={fetchQuestions} className="hover:text-white flex items-center gap-1 transition-colors">
            <RotateCcw className="h-3 w-3" /> রিফ্রেশ
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mb-2" />
            <p className="text-slate-400 text-xs">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-8 sm:p-10 text-center space-y-4">
            <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-slate-200 text-sm font-medium">কোনো প্রশ্ন পাওয়া যায়নি</p>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                {questions.length > 0
                  ? `ডাটাবেসে মোট ${questions.length}টি প্রশ্ন রয়েছে, তবে আপনার নির্বাচিত বিষয়, অধ্যায় বা পরীক্ষার ধরনের সাথে কোনোটি মেলেনি।`
                  : 'ডাটাবেসে এখনো কোনো প্রশ্ন আপলোড করা হয়নি। নিচের বাটনে ক্লিক করে প্রশ্ন যুক্ত করুন।'}
              </p>
            </div>
            {/* কোন ফিল্টারে বাদ পড়ল — ধাপে ধাপে সংখ্যা, দায়ী ফিল্টারটা লাল */}
            {questions.length > 0 && (
              <div className="mx-auto max-w-sm rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-left">
                <p className="mb-2 text-[11px] font-semibold text-slate-300">ফিল্টার ধাপে কতটা প্রশ্ন টিকেছে</p>
                <ul className="space-y-1.5">
                  {filterStages.map(stage => (
                    <li key={stage.key} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className={`truncate ${stage.isCulprit ? 'text-rose-300 font-semibold' : 'text-slate-400'}`}>
                        {stage.label}{stage.value ? `: ${stage.value}` : ''}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className={`font-mono ${stage.isCulprit ? 'text-rose-300' : 'text-slate-300'}`}>{stage.count}</span>
                        {stage.isCulprit && (
                          <button
                            onClick={stage.clear}
                            className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300 transition hover:bg-rose-500/20"
                          >
                            সরান
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {isMainBookFilter && (stageInput.examType || []).length > 0 && (
                  <div className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] p-2.5">
                    <p className="mb-2 text-[11px] text-amber-200">
                      এই {(stageInput.examType || []).length}টি প্রশ্ন আপলোডের সময় মূল বইয়ের ফ্ল্যাগ পায়নি, তাই এই ফিল্টারে আসছে না।
                    </p>
                    <button
                      type="button"
                      onClick={handleMarkAsMainBook}
                      disabled={markingMainBook}
                      className="inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-amber-500 disabled:opacity-60"
                    >
                      {markingMainBook ? 'চিহ্নিত করা হচ্ছে...' : `এই ${(stageInput.examType || []).length}টিকে মূল বই হিসেবে চিহ্নিত করুন`}
                    </button>
                  </div>
                )}

                {culpritBreakdown && (
                  <div className="mt-3 border-t border-white/[0.07] pt-2.5">
                    <p className="mb-1.5 text-[11px] text-slate-400">
                      আগের ধাপের প্রশ্নগুলোতে <span className="text-slate-200">{culpritBreakdown.label}</span> আসলে যা আছে:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {culpritBreakdown.rows.map(row => (
                        <button
                          key={row.text}
                          type="button"
                          onClick={row.apply || undefined}
                          disabled={!row.apply}
                          className={`rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] text-slate-300 transition ${row.apply ? 'hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white' : 'cursor-default opacity-70'}`}
                        >
                          {row.text} <span className="font-mono text-slate-400">{row.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {(filterSubjectOptionId !== 'all' || filterChapter !== 'all' || filterExamType !== 'all' || filterSession !== 'all' || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition"
                >
                  সকল ফিল্টার রিসেট করুন
                </button>
              )}
              <button
                onClick={handleOpenAddSingle}
                className="px-3.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition"
              >
                + এই অধ্যায়ে প্রশ্ন যুক্ত করুন
              </button>
              <button
                onClick={handleOpenBulkModal}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition"
              >
                <UploadCloud className="h-3.5 w-3.5 inline mr-1" />
                বাল্ক JSON আপলোড
              </button>
            </div>
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
                          {displayExamType(q) || 'MBBS & BDS'} {q.year || ''}
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

            {/* ডুপ্লিকেট হলে কী করব */}
            <label className="flex items-start gap-2 text-xs bg-indigo-500/[0.07] p-2.5 rounded-xl border border-indigo-500/20 text-indigo-200 cursor-pointer">
              <input
                type="checkbox"
                checked={updateDuplicates}
                onChange={(e) => setUpdateDuplicates(e.target.checked)}
                className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-400 h-4 w-4"
              />
              <span>
                <span className="font-bold">ডুপ্লিকেট হলে মেটাডেটা আপডেট করো</span>
                <span className="block text-[11px] text-indigo-300/70">
                  একই প্রশ্ন আগে থেকে থাকলে বাদ না দিয়ে তার অধ্যায়, পরীক্ষার ধরন ও মূল বইয়ের ফ্ল্যাগ ঠিক করে দেবে।
                </span>
              </span>
            </label>

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

