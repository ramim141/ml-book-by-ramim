import { useState, useEffect, useMemo } from 'react';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';
import { parseCustomQuestions, QUESTION_TEMPLATE } from '../../lib/liveExamQuestions';
import { 
  CalendarClock, Plus, Edit, Trash2, Loader2, Save, X, Settings2, 
  Users, AlertTriangle, Copy, Check, Database, Code2, Sparkles,
  GraduationCap, Stethoscope, Cpu, BookOpen, Clock, Trophy, Eye
} from 'lucide-react';
import { toBn } from '../../lib/format';

/** `chapter_1` ও `chapter-1` — দুই রূপ ডেটাতেই আছে, তাই মেলানোর আগে এক করি */
const normalizeChapter = (id) => {
  if (!id) return '';
  const m = String(id).match(/^chapter[_-](\d+)$/i);
  return m ? `chapter-${Number(m[1])}` : String(id);
};

const ALL_LEVELS = [
  { id: 'SSC', label: '🎒 মাধ্যমিক (SSC)' },
  { id: 'HSC', label: '🎓 উচ্চ মাধ্যমিক (HSC)' },
  { id: 'Admission', label: '🩺 ভর্তি পরীক্ষা (Admission)' },
];

const ADMISSION_TRACK_OPTIONS = [
  { id: 'medical', label: '🩺 মেডিকেল ও ডেন্টাল (MBBS / BDS)' },
  { id: 'engineering', label: '⚙️ ইঞ্জিনিয়ারিং ও বুয়েট (BUET / CKREU)' },
  { id: 'varsity-a', label: '🧪 ঢাকা বিশ্ববিদ্যালয় ক-ইউনিট ও বিজ্ঞান অনুষদ' },
  { id: 'nursing', label: '🏥 নার্সিং (BSc & Diploma)' },
  { id: 'gst', label: '🔬 GST বিজ্ঞান ও প্রযুক্তি গুচ্ছ' },
  { id: 'varsity-others', label: '🏛️ অন্যান্য বিশ্ববিদ্যালয় ও ইউনিট' },
];

export default function LiveExamManager() {
  const [confirm, confirmDialog] = useConfirm();
  const { data: allSubjects = [] } = useAcademicSubjects();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [adminFilterLevel, setAdminFilterLevel] = useState('ALL');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'HSC',
    admissionTrack: 'medical',
    subject: '',
    subjectLabel: '',
    chapters: [],
    questionSource: 'bank',
    startTime: '',
    endTime: '',
    duration: 30,
    totalQuestions: 25,
    marksPerQuestion: 1,
    negativeMarking: 0.25,
  });

  const [countResult, setCountResult] = useState({ key: null, value: null });
  const [customJson, setCustomJson] = useState('');
  const [copied, setCopied] = useState(false);

  const [participantsFor, setParticipantsFor] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const openParticipants = async (exam) => {
    setParticipantsFor(exam);
    setParticipants([]);
    setLoadingParticipants(true);
    try {
      const snap = await getDocs(collection(db, 'live_exams', exam.id, 'submissions'));
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, submittedAt: data.submittedAt?.toDate?.() || null };
      });
      rows.sort((a, b) =>
        (b.totalScore || 0) - (a.totalScore || 0)
        || (a.submittedAt?.getTime() || 0) - (b.submittedAt?.getTime() || 0)
      );
      setParticipants(rows);
    } catch (err) {
      console.error('অংশগ্রহণকারী আনা যায়নি', err);
      toast.error('অংশগ্রহণকারীদের তালিকা আনা যায়নি।');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const parsedCustom = useMemo(() => parseCustomQuestions(customJson), [customJson]);

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(QUESTION_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCustomJson(QUESTION_TEMPLATE);
      toast('ক্লিপবোর্ড পাওয়া যায়নি — নমুনাটি নিচে বসিয়ে দেওয়া হলো।');
    }
  };

  // Filter subjects for selected level
  const subjectsForLevel = useMemo(() => {
    return allSubjects.filter((s) => {
      const sLevel = (s.level || '').toUpperCase();
      if (formData.level === 'SSC') return sLevel.includes('SSC');
      if (formData.level === 'Admission') return sLevel.includes('ADMISSION');
      return sLevel.includes('HSC') || (!sLevel.includes('SSC') && !sLevel.includes('ADMISSION'));
    });
  }, [allSubjects, formData.level]);

  const selectedSubject = useMemo(
    () => allSubjects.find((s) => s.id === formData.subject) || null,
    [allSubjects, formData.subject]
  );

  const subjectLabelOf = (exam) =>
    allSubjects.find((s) => s.id === exam.subject)?.label || exam.subjectLabel || exam.subject;

  useEffect(() => {
    fetchExams();
  }, []);

  const countKey = `${formData.subject}::${[...formData.chapters].sort().join(',')}`;
  const countingQuestions = Boolean(formData.subject) && countResult.key !== countKey;
  const availableCount = countResult.key === countKey ? countResult.value : null;

  // Question count auto-check
  useEffect(() => {
    if (!formData.subject) return;
    let cancelled = false;

    getDocs(query(
      collection(db, 'academic_content'),
      where('subject', '==', formData.subject),
      where('type', '==', 'mcq')
    ))
      .then((snap) => {
        if (cancelled) return;
        const wanted = countKey.split('::')[1];
        const picked = wanted
          ? snap.docs.filter((d) => wanted.split(',').includes(normalizeChapter(d.data().chapterId)))
          : snap.docs;
        setCountResult({ key: countKey, value: picked.length });
      })
      .catch(() => {
        if (!cancelled) setCountResult({ key: countKey, value: null });
      });

    return () => { cancelled = true; };
  }, [countKey, formData.subject]);

  const fetchExams = async () => {
    try {
      const q = query(collection(db, 'live_exams'), orderBy('startTime', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          startTime: d.startTime?.toDate(),
          endTime: d.endTime?.toDate(),
        };
      });
      setExams(data);
    } catch (err) {
      console.error('Error fetching live exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.questionSource === 'custom') {
      if (parsedCustom.errors.length > 0) {
        toast.error('JSON এ ভুল আছে — নিচের বার্তাগুলো ঠিক করে আবার চেষ্টা করুন।');
        return;
      }
      if (parsedCustom.questions.length === 0) {
        toast.error('অন্তত একটি প্রশ্ন দিন।');
        return;
      }
    }

    setSaving(true);
    try {
      const isCustom = formData.questionSource === 'custom';
      const payload = {
        ...formData,
        startTime: Timestamp.fromDate(new Date(formData.startTime)),
        endTime: Timestamp.fromDate(new Date(formData.endTime)),
        duration: Number(formData.duration),
        totalQuestions: isCustom ? parsedCustom.questions.length : Number(formData.totalQuestions),
        marksPerQuestion: Number(formData.marksPerQuestion),
        negativeMarking: Number(formData.negativeMarking),
        customQuestions: isCustom ? parsedCustom.questions : [],
        updatedAt: Timestamp.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'live_exams', editingId), payload);
        toast.success('লাইভ পরীক্ষা সফলভাবে আপডেট হয়েছে! 🎉');
      } else {
        payload.createdAt = Timestamp.now();
        await addDoc(collection(db, 'live_exams'), payload);
        toast.success('নতুন লাইভ পরীক্ষা তৈরি হয়েছে! 🚀');
      }
      
      setShowForm(false);
      setEditingId(null);
      fetchExams();
    } catch (err) {
      console.error('Error saving exam:', err);
      toast.error('পরীক্ষা সেভ করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const formatForInput = (d) => {
    if (!d || !(d instanceof Date) || isNaN(d)) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleEdit = (exam) => {
    const known = allSubjects.find((s) => s.id === exam.subject);

    setFormData({
      title: exam.title || '',
      description: exam.description || '',
      level: exam.level || known?.level || 'HSC',
      admissionTrack: exam.admissionTrack || 'medical',
      subject: exam.subject || '',
      subjectLabel: exam.subjectLabel || known?.label || '',
      chapters: (exam.chapters || []).map(normalizeChapter),
      questionSource: exam.questionSource || (exam.customQuestions?.length ? 'custom' : 'bank'),
      startTime: formatForInput(exam.startTime),
      endTime: formatForInput(exam.endTime),
      duration: exam.duration || 30,
      totalQuestions: exam.totalQuestions || 25,
      marksPerQuestion: exam.marksPerQuestion || 1,
      negativeMarking: exam.negativeMarking || 0.25,
    });

    setCustomJson(
      exam.customQuestions?.length
        ? JSON.stringify(
            exam.customQuestions.map((q) => {
              const copy = { ...q };
              delete copy.id;
              return copy;
            }),
            null,
            2
          )
        : ''
    );
    setEditingId(exam.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: 'লাইভ পরীক্ষা মুছে ফেলবেন?', message: 'পরীক্ষাটি ও এর সব তথ্য মুছে যাবে।' }))) return;
    try {
      await deleteDoc(doc(db, 'live_exams', id));
      setExams(prev => prev.filter(e => e.id !== id));
      toast.success('পরীক্ষা মুছে ফেলা হয়েছে।');
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  // Quick Preset Helper
  const applyPreset = (type) => {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const end = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours later

    if (type === 'hsc-ict') {
      setFormData(prev => ({
        ...prev,
        title: 'এইচএসসি আইসিটি বিশেষ লাইভ মডেল টেস্ট',
        description: 'অধ্যায় ১ ও ২ এর গুরুত্বপূর্ণ বোর্ড স্ট্যান্ডার্ড প্রশ্ন',
        level: 'HSC',
        duration: 25,
        totalQuestions: 25,
        marksPerQuestion: 1,
        negativeMarking: 0.25,
        startTime: formatForInput(start),
        endTime: formatForInput(end),
      }));
    } else if (type === 'ssc-phy') {
      setFormData(prev => ({
        ...prev,
        title: 'এসএসসি পদার্থবিজ্ঞান গ্র্যান্ড লাইভ মক টেস্ট',
        description: 'গতির সমীকরণ, বল ও কাজ ক্ষমতা শক্তির সমন্বিত পরীক্ষা',
        level: 'SSC',
        duration: 30,
        totalQuestions: 25,
        marksPerQuestion: 1,
        negativeMarking: 0.25,
        startTime: formatForInput(start),
        endTime: formatForInput(end),
      }));
    } else if (type === 'medical') {
      setFormData(prev => ({
        ...prev,
        title: 'মেডিকেল ভর্তি স্পেশাল মেগা লাইভ এক্সাম (MBBS Mock)',
        description: 'জীববিজ্ঞান ও রসায়ন সম্পূর্ণ সিলেবাস মক টেস্ট',
        level: 'Admission',
        admissionTrack: 'medical',
        duration: 45,
        totalQuestions: 50,
        marksPerQuestion: 1,
        negativeMarking: 0.25,
        startTime: formatForInput(start),
        endTime: formatForInput(end),
      }));
    }
    toast.success('প্রিসেট সফলভাবে লোড হয়েছে!');
  };

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < start) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">আসন্ন (Upcoming)</span>;
    if (now >= start && now <= end) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">🔴 লাইভ চলছে</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">সমাপ্ত (Completed)</span>;
  };

  const filteredExams = useMemo(() => {
    if (adminFilterLevel === 'ALL') return exams;
    return exams.filter(e => (e.level || 'HSC').toUpperCase().includes(adminFilterLevel));
  }, [exams, adminFilterLevel]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 font-bangla">
      {confirmDialog}
      
      {/* ── Top Header & Stats ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <CalendarClock className="h-7 w-7 text-indigo-400" />
            <span>লাইভ এক্সাম ও মডেল টেস্ট কন্ট্রোল হাব</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            এসএসসি, এইচএসসি এবং এডমিশন (মেডিকেল/ইঞ্জিনিয়ারিং/ভার্সিটি) শিক্ষার্থীদের জন্য লাইভ পরীক্ষা পরিচালনা করুন।
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              const now = new Date();
              const start = new Date(now.getTime() + 60 * 60 * 1000);
              const end = new Date(now.getTime() + 25 * 60 * 60 * 1000);
              setFormData({
                title: '', description: '', level: 'HSC', admissionTrack: 'medical', subject: '', subjectLabel: '',
                chapters: [], questionSource: 'bank', startTime: formatForInput(start), endTime: formatForInput(end), 
                duration: 30, totalQuestions: 25, marksPerQuestion: 1, negativeMarking: 0.25,
              });
              setCustomJson('');
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="h-5 w-5" /> 
            <span>নতুন লাইভ এক্সাম তৈরি করুন</span>
          </button>
        )}
      </div>

      {/* ── Create / Edit Form Modal ─────────────────────────────────────── */}
      {showForm ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-black text-white">
                {editingId ? 'পরীক্ষা এডিট করুন' : 'নতুন লাইভ এক্সাম সিডিউল করুন'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">সবগুলো ফিল্ড সঠিকভাবে পূরণ করে সেভ করুন</p>
            </div>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Presets Bar */}
          {!editingId && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>কুইক প্রিসেট লোড করুন:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('ssc-phy')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  🎒 SSC পদার্থবিজ্ঞান মক
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('hsc-ict')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  🎓 HSC আইসিটি লাইভ টেস্ট
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('medical')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  🩺 মেডিকেল MBBS ৫০ প্রশ্ন মক
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">পরীক্ষার নাম (Exam Title) *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm shadow-inner" 
                  placeholder="যেমন: এইচএসসি রসায়ন ১ম পত্র স্পেশাল গ্র্যান্ড মক টেস্ট" 
                />
              </div>

              {/* Level / Category */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">শিক্ষাস্তর (Program / Level) *</label>
                <select
                  value={formData.level}
                  onChange={e => setFormData({ 
                    ...formData, 
                    level: e.target.value, 
                    subject: '', 
                    subjectLabel: '', 
                    chapters: [] 
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                >
                  {ALL_LEVELS.map(l => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Admission Track (If Admission is selected) */}
              {formData.level === 'Admission' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">এডমিশন ট্র্যাক (Admission Track) *</label>
                  <select
                    value={formData.admissionTrack || 'medical'}
                    onChange={e => setFormData({ ...formData, admissionTrack: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    {ADMISSION_TRACK_OPTIONS.map(track => (
                      <option key={track.id} value={track.id}>{track.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">বিষয় (Subject) *</label>
                  <select
                    required={formData.questionSource === 'bank'}
                    value={formData.subject}
                    onChange={e => {
                      const sub = subjectsForLevel.find(s => s.id === e.target.value);
                      setFormData({ ...formData, subject: e.target.value, subjectLabel: sub?.label || '', chapters: [] });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">— বিষয় বেছে নিন —</option>
                    {subjectsForLevel.map(s => (
                      <option key={s.id} value={s.id}>{s.emoji ? `${s.emoji} ` : ''}{s.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description / Syllabus */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">সিলেবাস / বর্ণনা (Description & Syllabus)</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm shadow-inner" 
                  placeholder="যেমন: পদার্থবিজ্ঞান ১ম পত্র - অধ্যায় ০১, ০২ এবং ০৩" 
                />
              </div>

              {/* Start Time & End Time */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">পরীক্ষা শুরুর সময় (Start Date & Time) *</label>
                <input 
                  required 
                  type="datetime-local" 
                  value={formData.startTime} 
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">পরীক্ষা সমাপ্তির সময় (End Date & Time) *</label>
                <input 
                  required 
                  type="datetime-local" 
                  value={formData.endTime} 
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm" 
                />
              </div>

              {/* Duration & Questions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">পরীক্ষার সময়সীমা (মিনিট) *</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  value={formData.duration} 
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  মোট প্রশ্ন সংখ্যা (Total Questions) *
                  {formData.questionSource === 'custom' && (
                    <span className="ml-1.5 font-normal text-indigo-400">(JSON থেকে স্বয়ংক্রিয়)</span>
                  )}
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  disabled={formData.questionSource === 'custom'}
                  value={formData.questionSource === 'custom' ? parsedCustom.questions.length : formData.totalQuestions}
                  onChange={e => setFormData({...formData, totalQuestions: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm disabled:opacity-50"
                />
              </div>

              {/* Marks per Question & Negative Marking */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">প্রতি প্রশ্নের মান (Marks per Question) *</label>
                <input 
                  required 
                  type="number" 
                  min="0.1" 
                  step="0.1" 
                  value={formData.marksPerQuestion} 
                  onChange={e => setFormData({...formData, marksPerQuestion: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">নেগেটিভ মার্কিং (ভুল উত্তরের জন্য কর্তন) *</label>
                <input 
                  required 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.negativeMarking} 
                  onChange={e => setFormData({...formData, negativeMarking: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 text-sm" 
                />
              </div>

            </div>

            {/* Question Source Selection */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-white font-bold text-sm flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-indigo-400" /> 
                <span>প্রশ্ন নির্বাচনের উৎস (Question Source)</span>
              </h4>

              <div className="flex gap-2">
                {[
                  { id: 'bank', label: 'প্রশ্নব্যাংক থেকে অটো সিলেক্ট', icon: Database },
                  { id: 'custom', label: 'কাস্টম JSON / প্রশ্ন আপলোড', icon: Code2 },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, questionSource: opt.id })}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                      formData.questionSource === opt.id
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-200'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <opt.icon className="h-4 w-4" /> {opt.label}
                  </button>
                ))}
              </div>

              {formData.questionSource === 'custom' ? (
                <>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-slate-400">
                      নিচে প্রশ্নগুলো JSON অ্যারে হিসেবে পেস্ট করুন। <span className="text-slate-500">answer = সঠিক অপশনের ইনডেক্স (০ = ক, ১ = খ)।</span>
                    </p>
                    <button
                      type="button"
                      onClick={copyTemplate}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-indigo-500"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'কপি হয়েছে' : 'নমুনা ফরম্যাট কপি'}</span>
                    </button>
                  </div>

                  <textarea
                    value={customJson}
                    onChange={(e) => setCustomJson(e.target.value)}
                    rows={8}
                    spellCheck={false}
                    placeholder={QUESTION_TEMPLATE}
                    className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />

                  {parsedCustom.errors.length > 0 && (
                    <div className="space-y-1 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3">
                      {parsedCustom.errors.map((msg, i) => (
                        <p key={i} className="flex items-start gap-2 text-xs font-semibold text-rose-300">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {msg}
                        </p>
                      ))}
                    </div>
                  )}

                  {parsedCustom.questions.length > 0 && (
                    <p className="text-xs font-bold text-emerald-400">
                      ✓ {parsedCustom.questions.length} টি প্রশ্ন প্রস্তুত হয়েছে
                    </p>
                  )}
                </>
              ) : !formData.subject ? (
                <p className="text-xs text-slate-400">প্রথমে উপরের ড্রপডাউন থেকে একটি বিষয় বেছে নিন।</p>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-400">
                    অধ্যায় নির্বাচন (কিছু না বাছলে ঐ বিষয়ের সব অধ্যায় থেকে আসবে):
                  </p>

                  {(selectedSubject?.chapters || []).length === 0 ? (
                    <p className="text-xs text-slate-500">এই বিষয়ে কোনো অধ্যায় যুক্ত করা হয়নি।</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject.chapters.map((ch) => {
                        const cid = normalizeChapter(ch.id);
                        const on = formData.chapters.includes(cid);
                        return (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              chapters: on
                                ? formData.chapters.filter((c) => c !== cid)
                                : [...formData.chapters, cid],
                            })}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                              on
                                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {ch.name || ch.title || ch.id}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs pt-2">
                    {countingQuestions ? (
                      <span className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> প্রশ্নসংখ্যা যাচাই হচ্ছে…
                      </span>
                    ) : availableCount !== null && (
                      <span className={availableCount < Number(formData.totalQuestions || 0) ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        ডাটাবেজে মোট পাওয়া গেছে {toBn(availableCount)} টি MCQ প্রশ্ন
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Save/Cancel Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button 
                type="submit" 
                disabled={saving} 
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                <span>{editingId ? 'পরিবর্তন সংরক্ষণ করুন' : 'পরীক্ষা প্রকাশ করুন'}</span>
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition"
              >
                বাতিল
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── Admin Exam List Section ─────────────────────────────────────── */
        <div className="space-y-4">
          
          {/* Level Filter Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'ALL', label: 'সকল পরীক্ষা' },
              { id: 'SSC', label: '🎒 এসএসসি' },
              { id: 'HSC', label: '🎓 এইচএসসি' },
              { id: 'ADMISSION', label: '🩺 এডমিশন' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdminFilterLevel(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  adminFilterLevel === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredExams.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
              <CalendarClock className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">কোনো লাইভ পরীক্ষা পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExams.map(exam => (
                <div key={exam.id} className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-xl">
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      {getStatus(exam.startTime, exam.endTime)}
                      <div className="flex items-center gap-1">
                        <button 
                          type="button"
                          onClick={() => handleEdit(exam)} 
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition"
                          title="এডিট করুন"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(exam.id)} 
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                          {exam.level || 'HSC'}
                        </span>
                        {exam.admissionTrack && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/20">
                            {exam.admissionTrack}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white line-clamp-1">{exam.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{exam.description || 'লাইভ মডেল টেস্ট'}</p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">বিষয়:</span>
                        <strong className="text-slate-200">{subjectLabelOf(exam)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">প্রশ্ন ও সময়:</span>
                        <strong className="text-slate-200">{toBn(exam.totalQuestions || 25)}টি ({toBn(exam.duration || 30)} মিনিট)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">শুরুর সময়:</span>
                        <span className="text-indigo-400 font-mono text-[11px]">
                          {exam.startTime?.toLocaleString('bn-BD', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => openParticipants(exam)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      <Users className="h-3.5 w-3.5 text-indigo-400" /> 
                      <span>অংশগ্রহণকারী ও স্কোর দেখুন</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Participants & Leaderboard Drawer Modal ──────────────────────── */}
      {participantsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>অংশগ্রহণকারী ও লাইভ স্কোর</span>
                </h3>
                <p className="text-xs text-slate-400">{participantsFor.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setParticipantsFor(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingParticipants ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
              ) : participants.length === 0 ? (
                <p className="text-center py-12 text-slate-500 text-sm">এখনো কেউ পরীক্ষা জমা দেয়নি।</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((p, rank) => (
                    <div key={p.id || rank} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold font-mono ${
                          rank === 0 ? 'bg-amber-400 text-slate-950' : rank === 1 ? 'bg-slate-300 text-slate-950' : rank === 2 ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {rank + 1}
                        </span>
                        <div>
                          <strong className="text-slate-200 block">{p.userName || 'শিক্ষার্থী'}</strong>
                          <span className="text-[10px] text-slate-500">{p.email || 'গোপনীয়'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-emerald-400 text-sm block font-mono">
                          {toBn(p.totalScore || 0)} নম্বর
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          সঠিক: {toBn(p.correct || 0)} | ভুল: {toBn(p.wrong || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
