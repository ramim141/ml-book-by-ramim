import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, writeBatch, query, where, limit, startAfter } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Database, Search, Edit2, Trash2, X, Check, Loader2, UploadCloud, Eye, Download, FileDown, AlertTriangle, CheckCircle2, Copy, RotateCcw, ListChecks, Code2, ChevronDown, Stethoscope, Layers, Replace, Video, FileText, BookOpen, Brain, Zap } from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useQueryClient } from '@tanstack/react-query';
import { SkeletonList } from '../UI/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import { logAdminAction, AUDIT } from '../../lib/adminAudit';
import { downloadJSON, downloadCSV, dateStamp } from '../../lib/adminExport';

const BULK_TYPES = ['mcq', 'cq', 'knowledge', 'shortcut'];

/** টাইপ অনুযায়ী নমুনা ডেটা — খালি বক্স থেকে শুরু করার বদলে এটা ডাউনলোড করে বদলে নেওয়া সহজ */
function getSampleItems(type) {
  if (type === 'mcq') {
    return [{
      question: 'নিচের কোনটি সঠিক?',
      options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
      answer: 0,
      explanation: 'ব্যাখ্যা (ঐচ্ছিক)',
      topic: 'টপিকের নাম (ঐচ্ছিক)',
      institutions: [{ name: 'Dhaka Board', year: '2023' }],
    }];
  }
  if (type === 'cq') {
    return [{
      stem: 'উদ্দীপকের টেক্সট এখানে লিখুন',
      questions: { ka: 'ক নং প্রশ্ন', kha: 'খ নং প্রশ্ন', ga: 'গ নং প্রশ্ন', gha: 'ঘ নং প্রশ্ন' },
      answers: { ka: '', kha: '', ga: '', gha: '' },
      topic: 'টপিকের নাম (ঐচ্ছিক)',
    }];
  }
  if (type === 'knowledge') {
    return [{
      question: 'প্রশ্নের টেক্সট এখানে লিখুন',
      explanation: 'উত্তর / ব্যাখ্যা',
      topic: 'টপিকের নাম (ঐচ্ছিক)',
    }];
  }
  if (type === 'shortcut') {
    return [{
      title: 'শর্টকাট শিরোনাম',
      content: 'মার্কডাউন কন্টেন্ট / সূত্র',
      type: 'formula',
    }];
  }
  return [];
}

/**
 * প্রতিটি আইটেমে বাধ্যতামূলক ফিল্ড আছে কিনা যাচাই — আগে ভুল/অসম্পূর্ণ ডেটা
 * সরাসরি Firestore এ চলে যেত, ধরা পড়ত অনেক পরে ছাত্রদের অভিযোগে।
 */
function validateItem(type, item) {
  const errors = [];
  if (type === 'mcq') {
    if (!String(item.question || item.text || '').trim()) errors.push('প্রশ্ন খালি');
    const opts = Array.isArray(item.options)
      ? item.options
      : (item.options && typeof item.options === 'object' ? Object.values(item.options) : []);
    if (opts.filter(o => String(o || '').trim()).length < 2) errors.push('অন্তত ২টি অপশন দরকার');
  } else if (type === 'cq') {
    const q = item.questions || {};
    if (!String(item.stem || item.question || '').trim()) errors.push('উদ্দীপক খালি');
    if (!q.ka && !q.kha && !q.ga && !q.gha) errors.push('অন্তত একটি প্রশ্ন (ক/খ/গ/ঘ) দরকার');
  } else if (type === 'knowledge') {
    if (!String(item.question || item.text || '').trim()) errors.push('প্রশ্ন খালি');
  } else if (type === 'shortcut') {
    if (!String(item.title || '').trim()) errors.push('শিরোনাম খালি');
  }
  return errors;
}

export default function QuestionBankManager() {
  const [mode, setMode] = useState('manage'); // 'manage' | 'upload'
  return (
    <div className="max-w-4xl">
      {/* মোবাইলে শিরোনাম আর টগল পাশাপাশি রাখলে শিরোনামটা তিন লাইনে ভেঙে
          বাটনের গায়ে উঠে যেত — তাই ছোট পর্দায় ওপর-নিচে সাজানো হয় */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Database className="text-indigo-400 shrink-0" /> কন্টেন্ট ও কোশ্চেন ব্যাংক</h2>
        <div className="flex shrink-0 bg-slate-900 rounded-lg p-1 border border-slate-800 self-start sm:self-auto">
          <button onClick={() => setMode('manage')} className={`px-4 py-1.5 rounded-md text-sm font-bold whitespace-nowrap transition-colors ${mode === 'manage' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>ম্যানেজ করুন</button>
          <button onClick={() => setMode('upload')} className={`px-4 py-1.5 rounded-md text-sm font-bold whitespace-nowrap transition-colors ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>আপলোড</button>
        </div>
      </div>
      {mode === 'upload' ? <QuestionBankUpload /> : <QuestionBankList />}
    </div>
  );
}

/** এডিট মোডালের হেডারে টাইপ অনুযায়ী আইকন ও রঙ — কোন ধরনের আইটেম এডিট হচ্ছে সেটা এক নজরে বোঝাতে */
const EDIT_TYPE_META = {
  video: { label: 'ভিডিও ক্লাস', icon: Video, iconBg: 'bg-rose-500/10 text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  note: { label: 'ক্লাস নোটস', icon: FileText, iconBg: 'bg-sky-500/10 text-sky-400', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  mcq: { label: 'MCQ', icon: ListChecks, iconBg: 'bg-indigo-500/10 text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  cq: { label: 'CQ (সৃজনশীল)', icon: BookOpen, iconBg: 'bg-amber-500/10 text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  knowledge: { label: 'Knowledge', icon: Brain, iconBg: 'bg-emerald-500/10 text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  shortcut: { label: 'Shortcut', icon: Zap, iconBg: 'bg-fuchsia-500/10 text-fuchsia-400', badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
};

function QuestionBankUpload() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [jsonText, setJsonText] = useState('');
  const [level, setLevel] = useState('HSC');
  const [subject, setSubject] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [type, setType] = useState('mcq');
  const [loading, setLoading] = useState(false);
  const [existingCount, setExistingCount] = useState(null);
  const [checkingCount, setCheckingCount] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'raw'
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');

  const [dbSubjects, setDbSubjects] = useState([]);
  
  useEffect(() => {
    getDoc(doc(db, 'admin_settings', 'subjects')).then(snap => {
      if (snap.exists() && snap.data().list?.length > 0) {
        setDbSubjects(snap.data().list);
      } else {
        setDbSubjects([
          { id: 'hsc-ict', label: 'HSC ICT', level: 'HSC', emoji: '💻', chapters: [{id: '1', name: 'Chapter 1'}, {id: '2', name: 'Chapter 2'}] },
          { id: 'hsc-chemistry', label: 'HSC Chemistry', level: 'HSC', emoji: '🧪', chapters: [] },
          { id: 'hsc-physics', label: 'HSC Physics', level: 'HSC', emoji: '⚛️', chapters: [] }
        ]);
      }
    });
  }, []);

  const TYPES = [
    { id: 'video', label: 'ভিডিও ক্লাস (Video)' },
    { id: 'note', label: 'ক্লাস নোটস (Note)' },
    { id: 'mcq', label: 'MCQ (বহুনির্বাচনি)' },
    { id: 'cq', label: 'CQ (সৃজনশীল)' },
    { id: 'knowledge', label: 'Knowledge (জ্ঞান ও অনুধাবন)' },
    { id: 'shortcut', label: 'Shortcut (শর্টকাট)' }
  ];

  const availableSubjects = dbSubjects.filter(s => s.level === level);
  const selectedSub = dbSubjects.find(s => s.id === subject && s.level === level);
  const availableChapters = selectedSub?.chapters || [];

  useEffect(() => {
    if (!subject || !chapterId) { setExistingCount(null); return; }
    let cancelled = false;
    setCheckingCount(true);
    getDocs(query(
      collection(db, 'academic_content'),
      where('subject', '==', subject),
      where('chapterId', '==', chapterId),
      where('type', '==', type)
    )).then(snap => {
      if (!cancelled) { setExistingCount(snap.size); setCheckingCount(false); }
    }).catch(() => { if (!cancelled) { setExistingCount(null); setCheckingCount(false); } });
    return () => { cancelled = true; };
  }, [subject, chapterId, type]);

  const parseCSV = (strData) => {
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\,\\r\\n]*))"), "gi");
    let arrData = [[]];
    let arrMatches = null;
    while ((arrMatches = objPattern.exec(strData))) {
      let strMatchedDelimiter = arrMatches[1];
      if (strMatchedDelimiter.length && strMatchedDelimiter !== ",") arrData.push([]);
      let strMatchedValue;
      if (arrMatches[2]) strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
      else strMatchedValue = arrMatches[3];
      arrData[arrData.length - 1].push(strMatchedValue);
    }
    
    arrData = arrData.filter(row => row.length > 1 || (row.length === 1 && row[0] !== ''));
    if (arrData.length < 2) throw new Error("CSV ফাইলে যথেষ্ট ডেটা নেই");
    
    const result = [];
    const headers = arrData[0].map(h => h ? h.toLowerCase().trim() : '');
    
    for (let i = 1; i < arrData.length; i++) {
      const row = arrData[i];
      if (type === 'mcq') {
        const item = {
          question: row[0] || '',
          options: [row[1] || '', row[2] || '', row[3] || '', row[4] || ''],
          answer: Number(row[5]) || 0,
          explanation: row[6] || ''
        };
        if (row[7]) item.imageUrl = row[7].trim();
        result.push(item);
      } else {
        const obj = {};
        headers.forEach((h, idx) => { if (h) obj[h] = row[idx] || ''; });
        result.push(obj);
      }
    }
    return result;
  };

  // jsonText পরিবর্তনের সাথে সাথে পার্স ও ভ্যালিডেট করে প্রিভিউ তৈরি হয় — সেভ করার আগেই ভুল ধরা পড়ে
  const parsed = useMemo(() => {
    if (!BULK_TYPES.includes(type)) return { items: [], error: null, validCount: 0 };
    if (!jsonText.trim()) return { items: [], error: null, validCount: 0 };
    let arr;
    try {
      arr = JSON.parse(jsonText);
    } catch (e) {
      return { items: [], error: `JSON ফরম্যাট সঠিক নয়: ${e.message}`, validCount: 0 };
    }
    if (!Array.isArray(arr)) return { items: [], error: 'JSON ডেটা অবশ্যই একটি Array [ ] দিয়ে শুরু হতে হবে', validCount: 0 };
    const items = arr.map(item => ({ item, errors: validateItem(type, item) }));
    return { items, error: null, validCount: items.filter(i => i.errors.length === 0).length };
  }, [jsonText, type]);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      if (file.name.endsWith('.json')) {
        setJsonText(fileContent);
        setViewMode('preview');
        toast.success('JSON ফাইল লোড হয়েছে! নিচে প্রিভিউ চেক করে সেভ করুন।');
      } else if (file.name.endsWith('.csv')) {
        try {
          const jsonArr = parseCSV(fileContent);
          setJsonText(JSON.stringify(jsonArr, null, 2));
          setViewMode('preview');
          toast.success('CSV ফাইল কনভার্ট হয়ে প্রিভিউ দেখাচ্ছে! এবার চেক করে সেভ করুন।');
        } catch (err) {
          toast.error('CSV পার্স করতে সমস্যা হয়েছে: ' + err.message);
        }
      } else {
        toast.error('শুধুমাত্র .json এবং .csv ফাইল সাপোর্ট করে।');
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e) => {
    handleFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /** কোন ফরম্যাটে ডেটা দিতে হবে বোঝাতে রেডিমেড নমুনা ফাইল — আগে খালি হাতে শুরু করতে হতো */
  const downloadTemplate = (format) => {
    const sample = getSampleItems(type);
    if (format === 'json') {
      downloadJSON(sample, `template-${type}`);
    } else {
      downloadCSV(
        sample,
        [
          { key: 'question', label: 'question' },
          { label: 'option1', map: r => r.options?.[0] || '' },
          { label: 'option2', map: r => r.options?.[1] || '' },
          { label: 'option3', map: r => r.options?.[2] || '' },
          { label: 'option4', map: r => r.options?.[3] || '' },
          { key: 'answer', label: 'answer_index' },
          { key: 'explanation', label: 'explanation' },
          { label: 'imageUrl', map: () => '' },
        ],
        `template-${type}`
      );
    }
  };

  const handleUpload = async () => {
    if (!subject || !chapterId || !type) return toast.error('বিষয়, অধ্যায় এবং ধরন সিলেক্ট করুন।');

    let docsToAdd = [];

    if (type === 'video') {
      if (!title || !url) return toast.error('Title and URL are required.');
      docsToAdd.push({ title, url });
    } else if (type === 'note') {
      if (!title || !content) return toast.error('Title and Content are required.');
      docsToAdd.push({ title, content });
    } else {
      if (!jsonText.trim()) return toast.error('JSON ডেটা পেস্ট করুন।');
      if (parsed.error) return toast.error(parsed.error);
      docsToAdd = parsed.items.map(i => i.item);
      if (docsToAdd.length === 0) return toast.error('কোনো ডেটা পাওয়া যায়নি।');
    }

    setLoading(true);
    setProgress(null);
    let successCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;
    try {
      const colRef = collection(db, "academic_content");

      // Fetch existing docs to prevent duplicates
      const q = query(colRef, where("level", "==", level), where("subject", "==", subject), where("chapterId", "==", chapterId), where("type", "==", type));
      const querySnapshot = await getDocs(q);
      const existingItems = querySnapshot.docs.map(doc => doc.data());
      const readyDocs = [];

      for (const item of docsToAdd) {
        // Normalize 'text' to 'question' if uploaded JSON uses legacy format
        if (item.text && !item.question) {
          item.question = item.text;
          delete item.text;
        }
        // Normalize options object (e.g. {"0":"a","1":"b"}) to array
        if (item.options && !Array.isArray(item.options) && typeof item.options === 'object') {
          item.options = Object.values(item.options);
        }
        // Normalize string 'answer' to index
        if (item.options && typeof item.answer === 'string') {
          const idx = item.options.indexOf(item.answer);
          if (idx !== -1) item.answer = idx;
        }

        if (BULK_TYPES.includes(type) && validateItem(type, item).length > 0) {
          invalidCount++;
          continue;
        }

        let isDuplicate = false;

        if (type === 'cq') {
          isDuplicate = existingItems.some(ex => {
            const exQ = ex.questions || {};
            const itemQ = item.questions || {};
            const hasAnyQuestion = itemQ.ka || itemQ.kha || itemQ.ga || itemQ.gha;
            
            if (hasAnyQuestion) {
              const kaMatch = (exQ.ka || '').trim() === (itemQ.ka || '').trim();
              const khaMatch = (exQ.kha || '').trim() === (itemQ.kha || '').trim();
              const gaMatch = (exQ.ga || '').trim() === (itemQ.ga || '').trim();
              const ghaMatch = (exQ.gha || '').trim() === (itemQ.gha || '').trim();
              return kaMatch && khaMatch && gaMatch && ghaMatch;
            }
            return false;
          });
        } else if (type === 'mcq' || type === 'knowledge') {
          isDuplicate = existingItems.some(ex => {
            const exQ = (ex.question || '').trim();
            const itemQ = (item.question || '').trim();
            return exQ && itemQ && exQ === itemQ;
          });
        } else {
          // As requested, do not check duplicates for other types (like video, note, etc.)
          isDuplicate = false;
        }

        if (isDuplicate) {
          duplicateCount++;
          continue;
        }

        readyDocs.push(item);
        existingItems.push(item);
      }

      // ব্যাচে সেভ — বড় আপলোডে এক এক করে addDoc করলে খুব ধীর হতো
      const CHUNK = 400;
      for (let i = 0; i < readyDocs.length; i += CHUNK) {
        const chunk = readyDocs.slice(i, i + CHUNK);
        const batch = writeBatch(db);
        chunk.forEach(item => {
          const ref = doc(colRef);
          batch.set(ref, { ...item, level, subject, chapterId, type, createdAt: new Date() });
        });
        await batch.commit();
        successCount += chunk.length;
        setProgress({ done: successCount, total: readyDocs.length });
      }

      const prevCount = existingCount ?? 0;
      const newTotal = prevCount + successCount;

      queryClient.invalidateQueries();
      toast.success(`সফলভাবে আপলোড হয়েছে!\nনতুন যোগ করা হয়েছে: ${successCount}টি\nডুপ্লিকেট স্কিপ করা হয়েছে: ${duplicateCount}টি${invalidCount ? `\nSkipped (invalid): ${invalidCount}` : ''}`);
      setExistingCount(newTotal);
      if (successCount > 0) {
        logAdminAction({
          action: AUDIT.CREATE,
          area: 'প্রশ্নব্যাংক',
          summary: `${successCount} প্রশ্নব্যাংক item(s) uploaded (${subject})`,
          details: { count: successCount, duplicateCount, invalidCount, subject, chapterId, type },
          actorEmail: currentUser?.email,
        });
      }
      setJsonText('');
      setTitle(''); setUrl(''); setContent('');
    } catch (error) {
      console.error(error);
      toast.error('আপলোড করার সময় একটি সমস্যা হয়েছে।');
    }
    setLoading(false);
    setProgress(null);
  };

  return (
    <div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-base sm:text-sm outline-none">
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Admission">Admission</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
            <select value={subject} onChange={e => {setSubject(e.target.value); setChapterId('');}} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-base sm:text-sm outline-none">
              <option value="">সিলেক্ট বিষয়</option>
              {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Chapter</label>
            <select value={chapterId} onChange={e => setChapterId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-base sm:text-sm outline-none">
              <option value="">সিলেক্ট অধ্যায়</option>
              {availableChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-base sm:text-sm outline-none">
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {subject && chapterId && (
          <div className="flex items-center gap-2 py-2 px-4 bg-slate-950 border border-slate-800 rounded-xl">
            {checkingCount ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : (
              <span className={`w-2 h-2 rounded-full ${existingCount && existingCount > 0 ? 'bg-amber-400' : 'bg-slate-600'}`} />
            )}
            <span className="text-sm text-slate-400">
              {checkingCount ? 'যাচাই করছি...' : existingCount === null ? 'ডাটা লোড হয়নি' : existingCount === 0 ? 'এই ফিল্টারে এখনো কোনো ডাটা নেই — নতুন তৈরি হবে' : `আগে থেকেই আছে: ${existingCount}টি — নতুন ডাটা এর সাথে যোগ হবে (Append)`}
            </span>
          </div>
        )}

        {type === 'video' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Video Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. লেকচার ১: ভূমিকা" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">YouTube / Vimeo URL</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {type === 'note' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Note Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. লেকচার ১ এর নোটস" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Markdown Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="# নোটের শিরোনাম..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm font-mono outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {['mcq', 'cq', 'knowledge', 'shortcut'].includes(type) && (
          <div className="space-y-6">
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`bg-slate-900/50 p-5 rounded-xl border border-dashed transition-colors ${dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-indigo-500/50'}`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <label className="block text-sm font-bold text-slate-300">১. ফাইল আপলোড করুন (.json, .csv) — অথবা টেনে এনে এখানে ছাড়ুন</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => downloadTemplate('json')} className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                    <FileDown className="w-3.5 h-3.5" /> JSON টেমপ্লেট
                  </button>
                  {type === 'mcq' && (
                    <button type="button" onClick={() => downloadTemplate('csv')} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                      <FileDown className="w-3.5 h-3.5" /> CSV টেমপ্লেট
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                MCQ এর ক্ষেত্রে CSV ফাইলের কলামগুলো এই ক্রমানুসারে থাকতে হবে: <br/>
                <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">question, option1, option2, option3, option4, answer_index(0-3), explanation, imageUrl (optional)</span>
              </p>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="w-full text-base sm:text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <label className="block text-sm font-bold text-slate-300">২. ডেটা ভেরিফাই করুন</label>
                {jsonText.trim() && !parsed.error && (
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button type="button" onClick={() => setViewMode('preview')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                      <ListChecks className="w-3.5 h-3.5" /> প্রিভিউ ({parsed.items.length})
                    </button>
                    <button type="button" onClick={() => setViewMode('raw')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${viewMode === 'raw' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                      <Code2 className="w-3.5 h-3.5" /> Raw JSON
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">ফাইল আপলোড করলে ডেটা এখানে দেখাবে, অথবা আপনি সরাসরি JSON কপি-পেস্ট করতে পারেন।</p>

              {parsed.error && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg p-3 mb-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {parsed.error}
                </div>
              )}

              {jsonText.trim() && !parsed.error && (
                <div className="flex items-center gap-4 text-xs mb-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> {parsed.validCount}টি ঠিক আছে</span>
                  {parsed.items.length - parsed.validCount > 0 && (
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold"><AlertTriangle className="w-3.5 h-3.5" /> {parsed.items.length - parsed.validCount}টি অসম্পূর্ণ (সেভের সময় বাদ যাবে)</span>
                  )}
                </div>
              )}

              {(viewMode === 'raw' || parsed.error || !jsonText.trim()) ? (
                <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} placeholder="[ { ... } ]" className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm font-mono outline-none focus:border-indigo-500 shadow-inner" />
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950">
                  {parsed.items.map(({ item, errors }, idx) => (
                    <UploadPreviewCard key={idx} item={item} errors={errors} index={idx} type={type} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={loading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
          {loading && progress ? `সেভ হচ্ছে... ${progress.done}/${progress.total}` : 'ডেটা সেভ করুন'}
        </button>
      </div>
    </div>
  );
}

/** আপলোডের আগে প্রতিটি আইটেম দেখতে কেমন হবে তার প্রিভিউ কার্ড — ফাইল সেভ করার আগেই ভুল ধরা পড়ে */
function UploadPreviewCard({ item, errors, index, type }) {
  const ok = errors.length === 0;
  const options = Array.isArray(item.options)
    ? item.options
    : (item.options && typeof item.options === 'object' ? Object.values(item.options) : []);

  return (
    <div className={`p-3 rounded-lg border text-sm ${ok ? 'border-slate-800 bg-slate-900/50' : 'border-amber-500/40 bg-amber-500/[0.06]'}`}>
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0">#{index + 1}</span>
        {ok ? (
          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold"><CheckCircle2 className="w-3 h-3" /> ঠিক আছে</span>
        ) : (
          <span className="flex items-center gap-1 text-amber-400 text-[10px] font-bold"><AlertTriangle className="w-3 h-3" /> {errors.join(', ')}</span>
        )}
      </div>

      {type === 'cq' ? (
        <>
          <p className="text-slate-200 text-xs mb-1 line-clamp-2">{item.stem || item.question || '(খালি)'}</p>
          {item.questions && (
            <div className="pl-3 border-l-2 border-slate-700 space-y-0.5 text-[11px] text-slate-400">
              {Object.entries(item.questions).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="line-clamp-1"><span className="text-indigo-400 font-bold">{k}:</span> {String(v)}</div>
              ))}
            </div>
          )}
        </>
      ) : type === 'shortcut' ? (
        <p className="text-slate-200 text-xs font-bold">{item.title || '(শিরোনাম নেই)'}</p>
      ) : (
        <p className="text-slate-200 text-xs mb-1 line-clamp-2">{item.question || item.text || '(খালি)'}</p>
      )}

      {type === 'mcq' && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {options.map((opt, i) => (
            <span key={i} className={`px-1.5 py-0.5 rounded text-[10px] border ${i === Number(item.answer) ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
              {opt || '(খালি)'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionBankList() {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const [level, setLevel] = useState('HSC');
  const [subject, setSubject] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [type, setType] = useState('video');
  
  const [dbSubjects, setDbSubjects] = useState([]);
  const [items, setItems] = useState([]);
  const { currentUser } = useAuth();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [editingQ, setEditingQ] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searched, setSearched] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameField, setRenameField] = useState('topic');
  const [renameFrom, setRenameFrom] = useState('');
  const [renameTo, setRenameTo] = useState('');
  const [renamePreview, setRenamePreview] = useState(null);
  const [renaming, setRenaming] = useState(false);

  // Pagination states
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;
  const FULL_SCAN_PAGE_SIZE = 200; // "সব ধরন" মোডে পাতায় বড় পাতা
  const FULL_SCAN_SAFETY_CAP = 3000;

  useEffect(() => {
    getDoc(doc(db, 'admin_settings', 'subjects')).then(snap => {
      if (snap.exists() && snap.data().list?.length > 0) {
        setDbSubjects(snap.data().list);
      } else {
        setDbSubjects([
          { id: 'hsc-ict', label: 'HSC ICT', level: 'HSC', emoji: '💻', chapters: [{id: '1', name: 'Chapter 1'}, {id: '2', name: 'Chapter 2'}] },
          { id: 'hsc-chemistry', label: 'HSC Chemistry', level: 'HSC', emoji: '🧪', chapters: [] },
          { id: 'hsc-physics', label: 'HSC Physics', level: 'HSC', emoji: '⚛️', chapters: [] }
        ]);
      }
    });
  }, []);

  const TYPES = [
    { id: '', label: 'সব ধরন (Type)' },
    { id: 'video', label: 'ভিডিও ক্লাস (Video)' },
    { id: 'note', label: 'ক্লাস নোটস (Note)' },
    { id: 'mcq', label: 'MCQ (বহুনির্বাচনি)' },
    { id: 'cq', label: 'CQ (সৃজনশীল)' },
    { id: 'knowledge', label: 'Knowledge (জ্ঞান ও অনুধাবন)' },
    { id: 'shortcut', label: 'Shortcut (শর্টকাট)' }
  ];

  const availableSubjects = dbSubjects.filter(s => s.level === level);
  const selectedSub = dbSubjects.find(s => s.id === subject && s.level === level);
  const availableChapters = selectedSub?.chapters || [];

  const handleReset = () => {
    setSubject('');
    setChapterId('');
    setItems([]);
    setSelectedIds(new Set());
    setHasMore(true);
    setLastVisible(null);
    setSearched(false);
    setLocalSearch('');
  };

  const handleDuplicate = async (item) => {
    setDuplicatingId(item.id);
    try {
      const { id, ...rest } = item;
      const newRef = await addDoc(collection(db, 'academic_content'), { ...rest, createdAt: new Date() });
      const newItem = { ...rest, id: newRef.id };
      setItems(prev => [newItem, ...prev]);
      setEditingQ(newItem);
      toast.success('কপি তৈরি হয়েছে — এখন এডিট করে সেভ করুন।');
      logAdminAction({
        action: AUDIT.CREATE,
        area: 'প্রশ্নব্যাংক',
        summary: `একটি ${type} আইটেম কপি করা হয়েছে (${subject || 'বিষয় অজানা'})`,
        details: { sourceId: id, newId: newRef.id, subject, chapterId, type },
        actorEmail: currentUser?.email,
      });
      queryClient.invalidateQueries();
    } catch (e) {
      console.error(e);
      toast.error('কপি করা যায়নি।');
    }
    setDuplicatingId(null);
  };

  // subject-scoped query builder — chapter & type are both optional so the
  // admin can search a whole subject without pre-picking a chapter/type
  const buildQueryConditions = () => {
    const conditions = [where('subject', '==', subject)];
    if (chapterId) conditions.push(where('chapterId', '==', chapterId));
    if (type) conditions.push(where('type', '==', type));
    return conditions;
  };
  const currentPageSize = () => (type ? ITEMS_PER_PAGE : FULL_SCAN_PAGE_SIZE);

  const handleSearch = async () => {
    if (!subject) return toast.error('বিষয় সিলেক্ট করুন।');
    setLoading(true);
    setHasMore(true);
    setSearched(true);
    try {
      const pageSize = currentPageSize();
      const qRef = query(
        collection(db, 'academic_content'),
        ...buildQueryConditions(),
        limit(pageSize)
      );

      const snap = await getDocs(qRef);
      setItems(snap.docs.map(d => ({ ...d.data(), id: d.id })));

      if (snap.docs.length > 0) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }
      setHasMore(snap.docs.length >= pageSize);
    } catch (e) {
      console.error(e);
      toast.error('কন্টেন্ট লোড করা যায়নি।');
    }
    setLoading(false);
  };

  const loadMoreItems = async () => {
    if (!lastVisible || loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const pageSize = currentPageSize();
      const qRef = query(
        collection(db, 'academic_content'),
        ...buildQueryConditions(),
        startAfter(lastVisible),
        limit(pageSize)
      );

      const snap = await getDocs(qRef);

      if (snap.docs.length > 0) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
        setItems(prev => [...prev, ...snap.docs.map(d => ({ ...d.data(), id: d.id }))]);
      }
      setHasMore(snap.docs.length >= pageSize);
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  /**
   * পুরো সাবজেক্ট একসাথে লোড — হেলথ রিপোর্ট/ডুপ্লিকেট/রিনেম পুরো চিত্র দেখাতে পারে,
   * না হলে পাতায় পাতায় ২০টা করে অনেকবার ক্লিক করতে হতো।
   * (state এর উপর নির্ভর না করে লোকাল ভেরিয়েবল দিয়ে লুপ চালানো হয়েছে,
   * না হলে stale-closure বাগে থেমে যেত)
   */
  const handleLoadAll = async () => {
    if (!subject || loadingAll) return;
    setLoadingAll(true);
    let cursor = lastVisible;
    let combined = [...items];
    let more = hasMore;
    let guard = 0;
    try {
      while (more && combined.length < FULL_SCAN_SAFETY_CAP && guard < 30) {
        guard++;
        const pageSize = currentPageSize();
        const qRef = query(
          collection(db, 'academic_content'),
          ...buildQueryConditions(),
          ...(cursor ? [startAfter(cursor)] : []),
          limit(pageSize)
        );
        const snap = await getDocs(qRef);
        if (snap.docs.length > 0) {
          cursor = snap.docs[snap.docs.length - 1];
          combined = [...combined, ...snap.docs.map(d => ({ ...d.data(), id: d.id }))];
          setItems(combined);
          setLastVisible(cursor);
        }
        more = snap.docs.length >= pageSize;
      }
      setHasMore(more);
      if (combined.length >= FULL_SCAN_SAFETY_CAP) {
        toast(`নিরাপত্তার জন্য ${combined.length} টির পর থামানো হয়েছে।`, { icon: '⚠️' });
      } else {
        toast.success(`মোট ${combined.length} টি আইটেম লোড হয়েছে।`);
      }
    } catch (e) {
      console.error(e);
      toast.error('সব লোড করতে সমস্যা হয়েছে।');
    }
    setLoadingAll(false);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: 'মুছে ফেলবেন?', message: 'এই আইটেমটি স্থায়ীভাবে মুছে যাবে।' }))) return;
    try {
      await deleteDoc(doc(db, 'academic_content', id));
      setItems(items.filter(q => q.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      logAdminAction({
        action: AUDIT.DELETE,
        area: 'প্রশ্নব্যাংক',
        summary: `একটি ${type} আইটেম মুছে ফেলা হয়েছে (${subject || 'বিষয় অজানা'})`,
        details: { id, subject, chapterId, type },
        actorEmail: currentUser?.email,
      });
      queryClient.invalidateQueries();
    } catch(e) {
      console.error(e);
    }
  };

  const toggleSelected = (id) => setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  /**
   * একসাথে মুছে ফেলা — ভুল ফরম্যাটে ৫০টা প্রশ্ন আপলোড হলে আগে ৫০ বার
   * মুছতে হতো, প্রতিবার আলাদা নিশ্চিতকরণসহ।
   */
  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!(await confirm({
      title: `${ids.length} টি আইটেম মুছে ফেলবেন?`,
      message: 'নির্বাচিত সবগুলো স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যাবে না — মোছার আগে ব্যাকআপ নিয়ে রাখুন।',
      confirmLabel: 'হ্যাঁ, সবগুলো মুছুন',
    }))) return;

    setBulkDeleting(true);
    const failed = [];
    for (const id of ids) {
      try {
        await deleteDoc(doc(db, 'academic_content', id));
      } catch (err) {
        console.error(err);
        failed.push(id);
      }
    }

    const deleted = ids.filter((id) => !failed.includes(id));
    setItems((prev) => prev.filter((q) => !deleted.includes(q.id)));
    setSelectedIds(new Set(failed));
    setBulkDeleting(false);
    queryClient.invalidateQueries();

    logAdminAction({
      action: AUDIT.BULK_DELETE,
      area: 'প্রশ্নব্যাংক',
      summary: `${deleted.length} টি ${type} আইটেম একসাথে মুছে ফেলা হয়েছে (${subject || 'বিষয় অজানা'})`,
      details: { count: deleted.length, failed: failed.length, subject, chapterId, type },
      actorEmail: currentUser?.email,
    });

    if (failed.length) toast.error(`${failed.length} টি মুছে ফেলা যায়নি।`);
    else toast.success(`${deleted.length} টি মুছে ফেলা হয়েছে।`);
  };

  /** ব্যাকআপ — এতদিন প্রশ্নব্যাংকের কোনো কপি Firestore এর বাইরে ছিল না */
  const handleExportBackup = () => {
    if (items.length === 0) return;
    downloadJSON(
      items.map(({ id, ...rest }) => ({ _id: id, ...rest })),
      `questionbank-${subject || 'all'}-${type}-${dateStamp()}`
    );
    logAdminAction({
      action: AUDIT.UPDATE,
      area: 'প্রশ্নব্যাংক',
      summary: `${items.length} টি ${type} আইটেমের ব্যাকআপ নেওয়া হয়েছে (${subject || 'বিষয় অজানা'})`,
      actorEmail: currentUser?.email,
    });
  };

  const convertToDirectImageUrl = (url) => {
    if (!url) return url;
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (gdMatch) return `https://drive.google.com/uc?export=view&id=${gdMatch[1]}`;
    const gdOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (gdOpenMatch) return `https://drive.google.com/uc?export=view&id=${gdOpenMatch[1]}`;
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      const encoded = btoa(url).replace(/=$/, '').replace(/==$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      return `https://api.onedrive.com/v1.0/shares/u!${encoded}/root/content`;
    }
    return url;
  };

  const handleImageUrlChange = (rawUrl) => {
    const converted = convertToDirectImageUrl(rawUrl);
    setEditingQ(prev => ({ ...prev, imageUrl: converted }));
  };

  const uploadToImgBB = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    // User's provided ImgBB API key
    const apiKey = 'ea54470f19b3b5ded1f581dadf8e2c4b'; 

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setEditingQ(prev => ({ ...prev, imageUrl: data.data.url }));
      } else {
        toast.error('ছবি আপলোড ব্যর্থ: ' + data.error.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('ছবি আপলোড করা যায়নি।');
    }
    setUploadingImage(false);
  };

  const handleSaveEdit = async () => {
    try {
      const qRef = doc(db, 'academic_content', editingQ.id);
      const updateData = { ...editingQ };
      delete updateData.id; 
      await updateDoc(qRef, updateData);
      setItems(items.map(q => q.id === editingQ.id ? editingQ : q));
      setEditingQ(null);
      queryClient.invalidateQueries();
    } catch(e) {
      console.error(e);
      toast.error('সেভ করা যায়নি: ' + e.message);
    }
  };

  const uniqueFilters = useMemo(() => {
    const filters = new Set();
    items.forEach(q => {
      if (q.topic) filters.add(q.topic);
      const allBoards = [...(q.institutions || []), ...(q.boards || [])];
      allBoards.forEach(b => {
        if (b.name) filters.add(`${b.name} ${b.year || ''}`.trim());
      });
    });
    return Array.from(filters).sort();
  }, [items]);

  // একজন মানুষ সবকিছু দেখে রাখার জন্য তিনটি টুল — হেলথ, ডুপ্লিকেট, টপিক/বোর্ড কনসিস্টেন্সি —
  // সবকসি প্যাজ঱঱ এর ডেটা হতে (সার্চরে লোড বা সব লোড এর পর), নতুন করে ফেচ করে না।
  const healthIssues = useMemo(() => {
    const issues = { missingExplanation: [], fewOptions: [], cqIncomplete: [], emptyTopic: [], brokenImage: [] };
    items.forEach(q => {
      const t = q.type || type;
      if ((t === 'mcq' || t === 'knowledge') && !String(q.explanation || '').trim()) {
        issues.missingExplanation.push(q);
      }
      if (t === 'mcq') {
        const opts = Array.isArray(q.options) ? q.options : (q.options && typeof q.options === 'object' ? Object.values(q.options) : []);
        if (opts.filter(o => String(o || '').trim()).length < 4) issues.fewOptions.push(q);
      }
      if (t === 'cq') {
        const qs = q.questions || {};
        if (!String(q.stem || '').trim() || !qs.ka || !qs.kha || !qs.ga || !qs.gha) issues.cqIncomplete.push(q);
      }
      if (['mcq', 'cq', 'knowledge', 'shortcut'].includes(t) && !String(q.topic || '').trim()) {
        issues.emptyTopic.push(q);
      }
      if (q.imageUrl && !/^https?:\/\//.test(String(q.imageUrl).trim())) {
        issues.brokenImage.push(q);
      }
    });
    return issues;
  }, [items, type]);

  const healthIssueCount = useMemo(
    () => Object.values(healthIssues).reduce((sum, arr) => sum + arr.length, 0),
    [healthIssues]
  );

  const duplicateGroups = useMemo(() => {
    const normalize = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const map = new Map();
    items.forEach(q => {
      const t = q.type || type;
      const key = t === 'cq' ? normalize(q.stem || q.question) : normalize(q.question || q.text);
      if (!key) return;
      const mapKey = `${t}::${key}`;
      if (!map.has(mapKey)) map.set(mapKey, []);
      map.get(mapKey).push(q);
    });
    return Array.from(map.values()).filter(group => group.length > 1);
  }, [items, type]);

  const topicCounts = useMemo(() => {
    const counts = new Map();
    items.forEach(q => {
      const t = String(q.topic || '').trim();
      if (!t) return;
      counts.set(t, (counts.get(t) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const boardNameCounts = useMemo(() => {
    const counts = new Map();
    items.forEach(q => {
      [...(q.institutions || []), ...(q.boards || [])].forEach(b => {
        const n = String(b?.name || '').trim();
        if (!n) return;
        counts.set(n, (counts.get(n) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const renameValueOptions = renameField === 'topic' ? topicCounts : boardNameCounts;
  const editMeta = editingQ ? (EDIT_TYPE_META[editingQ.type] || EDIT_TYPE_META.mcq) : null;

  const handleRenamePreview = () => {
    const from = renameFrom.trim();
    if (!from) return toast.error('"থেকে" মান লিখুন।');
    const matches = items.filter(q => {
      if (renameField === 'topic') return String(q.topic || '').trim() === from;
      return [...(q.institutions || []), ...(q.boards || [])].some(b => String(b?.name || '').trim() === from);
    });
    setRenamePreview(matches);
    if (matches.length === 0) toast('এই মানের কোনো আইটেম পাওয়া যায়নি (বর্তমানে লোড করা তালিকায়)।', { icon: 'ℹ️' });
  };

  const handleRenameApply = async () => {
    const from = renameFrom.trim();
    const to = renameTo.trim();
    if (!renamePreview || renamePreview.length === 0) return toast.error('আগে প্রিভিউ করুন।');
    if (!to) return toast.error('"এতে" মান লিখুন।');
    if (!(await confirm({
      title: `${renamePreview.length} টি আইটেম বদলাবেন?`,
      message: `"${from}" থেকে "${to}"-তে বদলানো হবে (${renameField === 'topic' ? 'টপিক' : 'বোর্ড/প্রতিষ্ঠান'})।`,
      confirmLabel: 'হ্যাঁ, বদলান',
    }))) return;

    setRenaming(true);
    try {
      const CHUNK = 400;
      for (let i = 0; i < renamePreview.length; i += CHUNK) {
        const chunk = renamePreview.slice(i, i + CHUNK);
        const batch = writeBatch(db);
        chunk.forEach(q => {
          const ref = doc(db, 'academic_content', q.id);
          if (renameField === 'topic') {
            batch.update(ref, { topic: to });
          } else {
            const newInstitutions = (q.institutions || []).map(b => (String(b?.name || '').trim() === from ? { ...b, name: to } : b));
            const newBoards = (q.boards || []).map(b => (String(b?.name || '').trim() === from ? { ...b, name: to } : b));
            batch.update(ref, { institutions: newInstitutions, boards: newBoards });
          }
        });
        await batch.commit();
      }

      setItems(prev => prev.map(q => {
        const match = renamePreview.find(m => m.id === q.id);
        if (!match) return q;
        if (renameField === 'topic') return { ...q, topic: to };
        return {
          ...q,
          institutions: (q.institutions || []).map(b => (String(b?.name || '').trim() === from ? { ...b, name: to } : b)),
          boards: (q.boards || []).map(b => (String(b?.name || '').trim() === from ? { ...b, name: to } : b)),
        };
      }));

      toast.success(`${renamePreview.length} টি আইটেম বদলানো হয়েছে।`);
      logAdminAction({
        action: AUDIT.UPDATE,
        area: 'প্রশ্নব্যাংক',
        summary: `বাল্ক রিনেম: ${renameField === 'topic' ? 'টপিক' : 'বোর্ড'} "${from}" থেকে "${to}" (${renamePreview.length} টি)`,
        details: { field: renameField, from, to, count: renamePreview.length, subject, chapterId, type },
        actorEmail: currentUser?.email,
      });
      queryClient.invalidateQueries();
      setRenamePreview(null);
      setRenameFrom('');
      setRenameTo('');
    } catch (e) {
      console.error(e);
      toast.error('বদলানো যায়নি।');
    }
    setRenaming(false);
  };

  return (
    <div>
      {confirmDialog}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <select value={level} onChange={e => {setLevel(e.target.value); setSubject('');}} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-base sm:text-sm">
            <option value="SSC">SSC</option>
            <option value="HSC">HSC</option>
            <option value="Admission">Admission</option>
          </select>
        </div>
        <div>
          <select value={subject} onChange={e => {setSubject(e.target.value); setChapterId('');}} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-base sm:text-sm">
            <option value="">সিলেক্ট বিষয়</option>
            {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <select value={chapterId} onChange={e => setChapterId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-base sm:text-sm">
            <option value="">সব অধ্যায়</option>
            {availableChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-base sm:text-sm">
            {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-sm py-2">
            <Search className="w-4 h-4" /> খুঁজুন
          </button>
          <button onClick={handleReset} title="ফিল্টার রিসেট করুন" className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? <div className="py-4"><SkeletonList count={8} /></div> : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              {searched ? 'কোনো ডাটা পাওয়া যায়নি।' : 'উপরে বিষয় ও ধরন সিলেক্ট করে খুঁজুন বাটনে ক্লিক করুন।'}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-2">
              <p className="text-sm font-bold text-slate-400">এই পেজে {items.length} টি আইটেম দেখাচ্ছে</p>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  list="filter-options"
                  value={localSearch} 
                  onChange={e => setLocalSearch(e.target.value)} 
                  placeholder="প্রশ্ন, টপিক বা বোর্ড খুঁজুন..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-base sm:text-xs text-slate-200 focus:border-indigo-500 outline-none" 
                />
                <datalist id="filter-options">
                  {uniqueFilters.map((filter, i) => (
                    <option key={i} value={filter} />
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {/* ব্যাকআপ ও একসাথে মোছা */}
          {items.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2.5">
              <button
                type="button"
                onClick={() => setSelectedIds(selectedIds.size === items.length ? new Set() : new Set(items.map(q => q.id)))}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:text-white"
              >
                {selectedIds.size === items.length ? 'বাছাই বাতিল' : 'সব বাছুন'}
              </button>

              {selectedIds.size > 0 && (
                <>
                  <span className="text-xs font-bold text-indigo-300">{selectedIds.size} টি নির্বাচিত</span>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    নির্বাচিতগুলো মুছুন
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleExportBackup}
                title="এই তালিকার JSON ব্যাকআপ নামিয়ে রাখুন"
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
              >
                <Download className="h-3.5 w-3.5" /> ব্যাকআপ ({items.length})
              </button>
            </div>
          )}

          {items.length > 0 && (
          <div className="mb-4 space-y-2.5">
            {/* health report */}
            <div className="rounded-xl border border-amber-500/15 bg-slate-900/40 overflow-hidden">
              <button type="button" onClick={() => setShowHealth(v => !v)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors">
                <span className="flex items-center gap-3 min-w-0">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-200 truncate">হেলথ রিপোর্ট</span>
                  {healthIssueCount > 0 ? (
                    <span className="shrink-0 bg-amber-500/15 text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold">{healthIssueCount} টি সমস্যা</span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold"><CheckCircle2 className="w-3 h-3" /> ঠিক আছে</span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${showHealth ? 'rotate-180' : ''}`} />
              </button>
              {showHealth && (
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-slate-800/80">
                  {healthIssueCount === 0 ? (
                    <p className="text-xs text-slate-500 pt-2">লোড করা {items.length} টি আইটেমে কোনো সমস্যা পাওয়া যায়নি।</p>
                  ) : ([
                      ['missingExplanation', 'ব্যাখ্যা নেই (MCQ/Knowledge)'],
                      ['fewOptions', 'প্রয়োজনের চেয়ে কম অপশন (MCQ)'],
                      ['cqIncomplete', 'অসম্পূর্ণ (CQ: উদ্দীপক/প্রশ্ন)'],
                      ['emptyTopic', 'টপিক নেই'],
                      ['brokenImage', 'সন্দেহজনক ইমেজ লিংক'],
                    ]).filter(([key]) => healthIssues[key].length > 0).map(([key, label], catIdx) => (
                    <div key={key} className={catIdx > 0 ? 'pt-3 border-t border-slate-800/60' : 'pt-2'}>
                      <p className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {label} · {healthIssues[key].length}
                      </p>
                      <div className="space-y-1.5">
                        {healthIssues[key].map(q => (
                          <div key={q.id} className="flex items-center justify-between gap-3 bg-slate-950/60 hover:bg-slate-950 rounded-lg px-3 py-2 transition-colors">
                            <span className="text-xs text-slate-300 truncate">{q.question || q.text || q.stem || q.title || '(শিরোনামহীন)'}</span>
                            <button onClick={() => setEditingQ(q)} className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md transition-colors">
                              <Edit2 className="w-3 h-3" /> এডিট
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* duplicates */}
            <div className="rounded-xl border border-rose-500/15 bg-slate-900/40 overflow-hidden">
              <button type="button" onClick={() => setShowDuplicates(v => !v)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors">
                <span className="flex items-center gap-3 min-w-0">
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                    <Layers className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-200 truncate">ডুপ্লিকেট</span>
                  {duplicateGroups.length > 0 ? (
                    <span className="shrink-0 bg-rose-500/15 text-rose-300 border border-rose-500/25 px-2 py-0.5 rounded-full text-[10px] font-bold">{duplicateGroups.length} গ্রুপ</span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold"><CheckCircle2 className="w-3 h-3" /> ঠিক আছে</span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${showDuplicates ? 'rotate-180' : ''}`} />
              </button>
              {showDuplicates && (
                <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-slate-800/80">
                  {duplicateGroups.length === 0 ? (
                    <p className="text-xs text-slate-500 pt-2">লোড করা {items.length} টি আইটেমে ডুপ্লিকেট পাওয়া যায়নি।</p>
                  ) : duplicateGroups.map((group, gi) => (
                    <div key={gi} className="bg-slate-950/60 rounded-lg p-3 mt-2.5 first:mt-2">
                      <p className="text-[11px] font-bold text-rose-300/90 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> এই প্রশ্নটি {group.length} বার আছে
                      </p>
                      <div className="space-y-1.5">
                        {group.map(q => (
                          <div key={q.id} className="flex items-center justify-between gap-3 bg-slate-900/60 hover:bg-slate-900 rounded-lg px-3 py-2 transition-colors">
                            <span className="text-xs text-slate-300 truncate">{q.question || q.text || q.stem || '(শিরোনামহীন)'}</span>
                            <div className="flex gap-1.5 shrink-0">
                              <button onClick={() => setEditingQ(q)} className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md transition-colors">
                                <Edit2 className="w-3 h-3" /> এডিট
                              </button>
                              <button onClick={() => handleDelete(q.id)} className="flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-md transition-colors">
                                <Trash2 className="w-3 h-3" /> মুছুন
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* bulk rename */}
            <div className="rounded-xl border border-indigo-500/15 bg-slate-900/40 overflow-hidden">
              <button type="button" onClick={() => setShowRename(v => !v)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors">
                <span className="flex items-center gap-3 min-w-0">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Replace className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-200 truncate">বাল্ক রিনেম</span>
                  <span className="hidden sm:inline text-[11px] text-slate-500">টপিক / বোর্ড</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${showRename ? 'rotate-180' : ''}`} />
              </button>
              {showRename && (
                <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-slate-800/80">
                  <p className="text-[11px] text-slate-500 pt-2">এই মুহূর্তে লোড করা {items.length} টি আইটেমের মধ্যে বদলানো হবে। পুরো সাবজেক্ট কভার করতে আগে "সব লোড করুন" চাপুন।</p>

                  <div className="inline-flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                    <button type="button" onClick={() => { setRenameField('topic'); setRenameFrom(''); setRenamePreview(null); }} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${renameField === 'topic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>টপিক</button>
                    <button type="button" onClick={() => { setRenameField('board'); setRenameFrom(''); setRenamePreview(null); }} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${renameField === 'board' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>বোর্ড/প্রতিষ্ঠান</button>
                  </div>

                  {renameValueOptions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">বর্তমান মানগুলো — ক্লিক করে বাছুন</p>
                      <div className="flex flex-wrap gap-1.5">
                        {renameValueOptions.slice(0, 20).map(([val, count]) => (
                          <button key={val} type="button" onClick={() => { setRenameFrom(val); setRenamePreview(null); }} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${renameFrom === val ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>
                            {val} <span className="opacity-50">· {count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">থেকে (বর্তমান মান)</label>
                      <input value={renameFrom} onChange={e => { setRenameFrom(e.target.value); setRenamePreview(null); }} placeholder="মান লিখুন অথবা উপর থেকে বাছুন" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">এতে (নতুন মান)</label>
                      <input value={renameTo} onChange={e => setRenameTo(e.target.value)} placeholder="নতুন মান লিখুন" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={handleRenamePreview} className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors">
                      <Search className="w-3.5 h-3.5" /> প্রিভিউ
                    </button>
                    <button type="button" onClick={handleRenameApply} disabled={!renamePreview || renamePreview.length === 0 || renaming} className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-xs font-bold text-white transition-colors">
                      {renaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Replace className="w-3.5 h-3.5" />} প্রয়োগ করুন
                    </button>
                  </div>

                  {renamePreview && (
                    <div className="bg-slate-950/60 rounded-lg p-3">
                      <p className="text-[11px] font-bold text-indigo-300/90 uppercase tracking-wide mb-2">{renamePreview.length} টি আইটেম মিলেছে</p>
                      {renamePreview.length > 0 && (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {renamePreview.map(q => (
                            <p key={q.id} className="text-[11px] text-slate-400 truncate">{q.question || q.text || q.stem || q.title || q.id}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          {items.filter(q => {
            if (!localSearch) return true;
            const ls = localSearch.toLowerCase();
            const allBoards = [...(q.institutions || []), ...(q.boards || [])];
            const textToSearch = `${q.question || ''} ${q.text || ''} ${q.stem || ''} ${q.title || ''} ${q.topic || ''} ${allBoards.map(b => b.name + ' ' + b.year).join(' ')}`.toLowerCase();
            return textToSearch.includes(ls);
          }).map((q, idx) => {
            const itemType = q.type || type;
            return (
            <div key={q.id} className={`p-4 rounded-xl border transition-colors ${
              selectedIds.has(q.id) ? 'border-indigo-500/50 bg-indigo-500/[0.07]' : 'border-slate-800 bg-slate-900/50'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    {/* একসাথে বেছে নেওয়ার জন্য — আগে একটা একটা করে মুছতে হতো */}
                    <input
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={() => toggleSelected(q.id)}
                      aria-label="এই আইটেমটি বেছে নিন"
                      className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-500"
                    />
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-bold">#{idx+1}</span>
                    <span className="text-slate-500 text-xs">{q.chapterId}</span>
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{q.type || type}</span>
                    {q.topic && <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px]">{q.topic}</span>}
                    {[...(q.institutions || []), ...(q.boards || [])].map((b, i) => (
                      <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                        {b.name} {b.year}
                      </span>
                    ))}
                  </div>
                  
                  {itemType === 'video' && (
                    <div>
                      <p className="text-sm text-slate-200 font-bold mb-1">{q.title}</p>
                      <a href={q.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">{q.url}</a>
                    </div>
                  )}

                  {itemType === 'note' && (
                    <div>
                      <p className="text-sm text-slate-200 font-bold mb-1">{q.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{q.content}</p>
                    </div>
                  )}

                  {['mcq', 'cq', 'knowledge', 'shortcut'].includes(itemType) && (
                    <div>
                      {itemType === 'cq' ? (
                        <div className="mb-3">
                          <div className="text-sm text-slate-200 font-medium mb-2">
                            <MarkdownRenderer content={q.stem || q.question || q.text || 'No stem provided'} />
                          </div>
                          {q.questions && (
                            <div className="pl-4 border-l-2 border-slate-700 space-y-1">
                              {Object.entries(q.questions).map(([k, v]) => (
                                <div key={k} className="text-xs text-slate-300 flex items-start gap-2">
                                  <span className="text-indigo-400 font-bold shrink-0">{k}:</span> 
                                  <div className="flex-1 overflow-x-auto"><MarkdownRenderer content={v} /></div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-200 font-medium mb-3">
                          <MarkdownRenderer content={q.question || q.text || 'No question text provided'} />
                        </div>
                      )}
                      {itemType === 'mcq' && q.options && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`px-3 py-1.5 rounded-lg text-xs border ${i === q.answer ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                              {i+1}. {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-indigo-300 bg-indigo-500/10 p-2 rounded-lg mt-2">💡 {q.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setEditingQ(q)} title="এডিট করুন" className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDuplicate(q)} disabled={duplicatingId === q.id} title="কপি করে নতুন আইটেম তৈরি করুন" className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-colors disabled:opacity-50">
                    {duplicatingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(q.id)} title="মুছে ফেলুন" className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            );
          })}

          {hasMore && items.length > 0 && (
            <div className="flex justify-center gap-3 mt-6">
              <button 
                onClick={loadMoreItems} 
                disabled={loadingMore || loadingAll}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                আরও প্রশ্ন লোড করুন (Load More)
              </button>
              <button 
                onClick={handleLoadAll} 
                disabled={loadingMore || loadingAll}
                title="হেলথ রিপোর্ট/ডুপ্লিকেট/বাল্ক রিনেম এর জন্য পুরো সাবজেক্ট একসাথে লোড করুন"
                className="px-6 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold rounded-xl transition-colors flex items-center gap-2 border border-indigo-500/30"
              >
                {loadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                সব লোড করুন (Load All)
              </button>
            </div>
          )}
        </div>
      )}

      {editingQ && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`p-2.5 rounded-xl shrink-0 ${editMeta.iconBg}`}>
                  <editMeta.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-100">প্রশ্ন এডিট করুন</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${editMeta.badge}`}>{editMeta.label}</span>
                    {editingQ.chapterId && <span className="text-[11px] text-slate-500">{editingQ.chapterId}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setEditingQ(null)} className="shrink-0 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                {editingQ.type === 'video' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">ভিডিও শিরোনাম (Title)</label>
                      <input type="text" value={editingQ.title || ''} onChange={e => setEditingQ({...editingQ, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">ভিডিও লিংক (URL)</label>
                      <input type="text" value={editingQ.url || ''} onChange={e => setEditingQ({...editingQ, url: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-indigo-500" />
                    </div>
                  </>
                )}

                {editingQ.type === 'note' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">নোটের শিরোনাম (Title)</label>
                      <input type="text" value={editingQ.title || ''} onChange={e => setEditingQ({...editingQ, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-base sm:text-sm outline-none focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">মার্কডাউন কন্টেন্ট (Content)</label>
                      <textarea value={editingQ.content || ''} onChange={e => setEditingQ({...editingQ, content: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-base sm:text-sm min-h-[150px] outline-none focus:border-indigo-500" />
                    </div>
                  </>
                )}

                {['mcq', 'cq', 'knowledge', 'shortcut'].includes(editingQ.type) && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                          {editingQ.type === 'cq' ? 'উদ্দীপক (Stem)' : 'প্রশ্ন'} <span className="font-normal text-slate-600">— Markdown/LaTeX</span>
                        </label>
                        <textarea
                          value={editingQ.type === 'cq' ? (editingQ.stem || editingQ.question || '') : (editingQ.question || editingQ.text || '')}
                          onChange={e => {
                            if (editingQ.type === 'cq') {
                              setEditingQ({...editingQ, stem: e.target.value});
                            } else {
                              setEditingQ({...editingQ, question: e.target.value});
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-base sm:text-sm min-h-[90px] outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                        <p className="text-[11px] font-bold text-indigo-400 px-3 py-1.5 bg-indigo-500/5 border-b border-slate-800 flex items-center gap-1.5"><Eye className="w-3 h-3" /> প্রিভিউ</p>
                        <div className="text-sm text-slate-200 p-3">
                          <MarkdownRenderer content={editingQ.type === 'cq' ? (editingQ.stem || '...') : (editingQ.question || '...')} />
                        </div>
                      </div>
                    </div>

                    {editingQ.type === 'cq' && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide mb-2.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> প্রশ্নসমূহ</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['ka', 'kha', 'ga', 'gha'].map(k => (
                              <div key={k}>
                                <label className="text-[11px] text-slate-500 mb-1 block">{k === 'ka' ? 'ক' : k === 'kha' ? 'খ' : k === 'ga' ? 'গ' : 'ঘ'} প্রশ্ন</label>
                                <textarea
                                  value={editingQ.questions?.[k] || ''}
                                  onChange={e => setEditingQ({
                                    ...editingQ,
                                    questions: { ...(editingQ.questions || {}), [k]: e.target.value }
                                  })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-base sm:text-sm min-h-[60px] outline-none focus:border-indigo-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide mb-2.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> উত্তরসমূহ</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['ka', 'kha', 'ga', 'gha'].map(k => (
                              <div key={k}>
                                <label className="text-[11px] text-slate-500 mb-1 block">{k === 'ka' ? 'ক' : k === 'kha' ? 'খ' : k === 'ga' ? 'গ' : 'ঘ'} উত্তর</label>
                                <textarea
                                  value={editingQ.answers?.[k] || ''}
                                  onChange={e => setEditingQ({
                                    ...editingQ,
                                    answers: { ...(editingQ.answers || {}), [k]: e.target.value }
                                  })}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-base sm:text-sm min-h-[100px] outline-none focus:border-indigo-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1.5 block">টপিক (Topic)</label>
                        <input
                          type="text"
                          list="topic-datalist"
                          value={editingQ.topic || ''}
                          onChange={e => setEditingQ({...editingQ, topic: e.target.value})}
                          placeholder="যেমন: number-system"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-base sm:text-sm focus:border-indigo-500 outline-none"
                        />
                        <datalist id="topic-datalist">
                          {topicCounts.map(([t]) => <option key={t} value={t} />)}
                        </datalist>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1.5 flex justify-between items-center">
                          <span>বোর্ড / প্রতিষ্ঠান</span>
                          <button
                            onClick={() => setEditingQ({
                              ...editingQ,
                              institutions: [...(editingQ.institutions || []), ...(editingQ.boards || []), { name: '', year: '' }],
                              boards: []
                            })}
                            className="text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md text-indigo-400 transition-colors"
                          >+ যুক্ত করুন</button>
                        </label>
                        <div className="space-y-2">
                          {[...(editingQ.institutions || []), ...(editingQ.boards || [])].map((inst, idx) => (
                            <div key={idx} className="flex gap-2 bg-slate-900/40 border border-slate-800 rounded-lg p-1.5">
                              <input
                                type="text"
                                value={inst.name || ''}
                                onChange={e => {
                                  const newInsts = [...(editingQ.institutions || []), ...(editingQ.boards || [])];
                                  newInsts[idx] = { ...newInsts[idx], name: e.target.value };
                                  setEditingQ({...editingQ, institutions: newInsts, boards: []});
                                }}
                                placeholder="বোর্ডের নাম"
                                className="w-2/3 bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-base sm:text-xs focus:border-indigo-500 outline-none"
                              />
                              <input
                                type="text"
                                value={inst.year || ''}
                                onChange={e => {
                                  const newInsts = [...(editingQ.institutions || []), ...(editingQ.boards || [])];
                                  newInsts[idx] = { ...newInsts[idx], year: e.target.value };
                                  setEditingQ({...editingQ, institutions: newInsts, boards: []});
                                }}
                                placeholder="সাল"
                                className="w-1/3 bg-slate-950 border border-slate-800 rounded-md px-2 py-1.5 text-base sm:text-xs focus:border-indigo-500 outline-none"
                              />
                              <button
                                onClick={() => {
                                  const newInsts = [...(editingQ.institutions || []), ...(editingQ.boards || [])];
                                  newInsts.splice(idx, 1);
                                  setEditingQ({...editingQ, institutions: newInsts, boards: []});
                                }}
                                className="shrink-0 p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-md transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {[...(editingQ.institutions || []), ...(editingQ.boards || [])].length === 0 && (
                            <p className="text-[11px] text-slate-600 italic">কোনো বোর্ড যুক্ত করা নেই।</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-400">ইমেজ (ঐচ্ছিক)</label>
                        <label className="cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                          {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          {uploadingImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                          <input type="file" accept="image/*" className="hidden text-base sm:text-sm" onChange={uploadToImgBB} disabled={uploadingImage} />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={editingQ.imageUrl || ''}
                        onChange={e => handleImageUrlChange(e.target.value)}
                        placeholder="অথবা Google Drive / ImgBB এর লিংক পেস্ট করুন..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-base sm:text-sm focus:border-indigo-500 outline-none"
                      />
                      {editingQ.imageUrl ? (
                        <div className="mt-2 flex items-center gap-3 bg-slate-900/50 border border-slate-700 p-2 rounded-lg">
                          <div className="relative inline-block bg-slate-950 p-1 rounded shrink-0">
                            <img src={editingQ.imageUrl} alt="preview" className="h-16 object-contain rounded" onError={e => e.target.style.display='none'} />
                            <button onClick={() => setEditingQ({...editingQ, imageUrl: ''})} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 hover:bg-rose-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-400 mb-1">যেকোনো টেক্সটবক্সে (যেমন: উত্তর) ছবি দিতে এই মার্কডাউনটি কপি করে পেস্ট করুন:</p>
                            <div className="flex items-center gap-2">
                              <code className="text-[11px] bg-slate-950 px-2 py-1.5 rounded border border-slate-800 flex-1 truncate text-indigo-300">
                                ![image]({editingQ.imageUrl})
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`![image](${editingQ.imageUrl})`);
                                  toast.success("Markdown কপি হয়েছে! যেকোনো টেক্সটবক্সে পেস্ট করুন।");
                                }}
                                className="shrink-0 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded text-xs font-bold transition-colors border border-indigo-500/30 whitespace-nowrap"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-[11px] text-slate-600">💡 <b>ছবি আপলোড করুন</b> বাটনে ক্লিক করে সরাসরি পিসি থেকে ছবি যুক্ত করতে পারেন।</p>
                      )}
                    </div>

                    {editingQ.type === 'mcq' && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-2 block">অপশন সমূহ <span className="font-normal text-slate-600">— সঠিক উত্তর বেছে নিন</span></label>
                        <div className="space-y-2.5">
                          {(editingQ.options || ['', '', '', '']).map((opt, i) => {
                            const isCorrect = editingQ.answer === i;
                            return (
                              <div key={i} className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${isCorrect ? 'bg-emerald-500/[0.06] border-emerald-500/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
                                <div className="flex gap-3 items-center">
                                  <button
                                    type="button"
                                    onClick={() => setEditingQ({...editingQ, answer: i})}
                                    className={`shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center border-2 transition-colors ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 text-slate-500 hover:border-slate-500'}`}
                                  >
                                    {String.fromCharCode(65 + i)}
                                  </button>
                                  <input type="text" value={opt} onChange={e => {
                                    const newOpts = [...(editingQ.options || [])];
                                    newOpts[i] = e.target.value;
                                    setEditingQ({...editingQ, options: newOpts});
                                  }} placeholder="অপশনের টেক্সট বা LaTeX লিখুন..." className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base sm:text-sm outline-none focus:border-indigo-500" />
                                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                                </div>
                                <div className="ml-9 text-xs text-slate-300">
                                  <MarkdownRenderer content={opt || '...'} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 mb-1.5 block">ব্যাখ্যা (ঐচ্ছিক)</label>
                        <textarea value={editingQ.explanation || ''} onChange={e => setEditingQ({...editingQ, explanation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-base sm:text-sm min-h-[80px] outline-none focus:border-indigo-500" />
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                        <p className="text-[11px] font-bold text-indigo-400 px-3 py-1.5 bg-indigo-500/5 border-b border-slate-800 flex items-center gap-1.5"><Eye className="w-3 h-3" /> প্রিভিউ</p>
                        <div className="text-sm text-slate-200 p-3">
                          <MarkdownRenderer content={editingQ.explanation || '...'} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800 shrink-0">
              <button onClick={() => setEditingQ(null)} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">বাতিল</button>
              <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold flex gap-2 items-center transition-colors"><Check className="w-4 h-4" /> সেভ করুন</button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
