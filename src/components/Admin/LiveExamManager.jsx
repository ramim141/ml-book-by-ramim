import { useState, useEffect, useMemo } from 'react';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';
import { parseCustomQuestions, QUESTION_TEMPLATE } from '../../lib/liveExamQuestions';
import { CalendarClock, Plus, Edit, Trash2, Loader2, Save, X, Settings2, Users, AlertTriangle, Copy, Check, Database, Code2 } from 'lucide-react';

/** `chapter_1` ও `chapter-1` — দুই রূপ ডেটাতেই আছে, তাই মেলানোর আগে এক করি */
const normalizeChapter = (id) => {
  if (!id) return '';
  const m = String(id).match(/^chapter[_-](\d+)$/i);
  return m ? `chapter-${Number(m[1])}` : String(id);
};

export default function LiveExamManager() {
  const [confirm, confirmDialog] = useConfirm();
  // বিষয়ের তালিকা আগে এখানে হার্ডকোড ছিল ('physics', 'chemistry'…), অথচ
  // প্রশ্ন সেভ হয় admin_settings/subjects এর আসল id দিয়ে ('hsc-physics-1')।
  // ফলে LiveExamEngine এর where('subject','==','physics') কোনো প্রশ্নই
  // খুঁজে পেত না — পরীক্ষা শূন্য প্রশ্ন নিয়ে চালু হতো।
  const { data: allSubjects = [] } = useAcademicSubjects();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'HSC',
    subject: '',
    subjectLabel: '',
    chapters: [], // খালি = ঐ বিষয়ের সব অধ্যায়
    questionSource: 'bank', // 'bank' | 'custom'
    startTime: '',
    endTime: '',
    duration: 30,
    totalQuestions: 25,
    marksPerQuestion: 1,
    negativeMarking: 0.25,
  });

  // নির্বাচিত বিষয়ে আসলে কতগুলো MCQ আছে — না জানলে অ্যাডমিন ২৫টা প্রশ্নের
  // পরীক্ষা বানিয়ে ফেলতেন যেখানে হয়তো ৮টাই আছে।
  //
  // ফলাফলটা কোন বাছাইয়ের জন্য গোনা হয়েছে সেটাও সাথে রাখি — তাহলে "গোনা
  // হচ্ছে" অবস্থাটা আলাদা state না রেখেই বের করা যায়, আর ইফেক্টের ভিতরে
  // সরাসরি setState করতে হয় না (তাতে বাড়তি রেন্ডার-চক্র হতো)।
  const [countResult, setCountResult] = useState({ key: null, value: null });

  // কাস্টম প্রশ্নের কাঁচা JSON — প্রতিবার টাইপে পার্স করে সাথে সাথে ফল দেখাই
  const [customJson, setCustomJson] = useState('');
  const [copied, setCopied] = useState(false);

  // কারা পরীক্ষা দিয়েছে — বাটনটা এতদিন নিষ্ক্রিয় ছিল (কোনো onClick ছিল না)
  const [participantsFor, setParticipantsFor] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const openParticipants = async (exam) => {
    setParticipantsFor(exam);
    setParticipants([]);
    setLoadingParticipants(true);
    try {
      // orderBy দিয়ে আনি না — Firestore এ যে ডকুমেন্টে ঐ ফিল্ডটা নেই সেটা
      // ফলাফল থেকেই বাদ পড়ে, ফলে কোনো অংশগ্রহণকারী চুপচাপ হারিয়ে যেতে পারত।
      // তালিকা ছোট, তাই সব এনে এখানেই সাজাই।
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
      // ক্লিপবোর্ড অনুমতি না পেলে অন্তত টেক্সট-এরিয়ায় বসিয়ে দিই
      setCustomJson(QUESTION_TEMPLATE);
      toast('ক্লিপবোর্ড পাওয়া যায়নি — নমুনাটি নিচে বসিয়ে দেওয়া হলো।');
    }
  };

  const levels = useMemo(
    () => [...new Set(allSubjects.map((s) => s.level).filter(Boolean))],
    [allSubjects]
  );
  const subjectsForLevel = useMemo(
    () => allSubjects.filter((s) => s.level === formData.level),
    [allSubjects, formData.level]
  );
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

  // বিষয়/অধ্যায় বদলালে প্রশ্নসংখ্যা আবার গুনি
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
    // কাস্টম মোডে ভুল JSON নিয়ে সেভ হলে পরীক্ষার দিন প্রশ্নই আসত না
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
        // কাস্টম মোডে যতগুলো প্রশ্ন দেওয়া হয়েছে ততগুলোই — আলাদা সংখ্যা
        // লিখলে দুটোয় গরমিল হতো
        totalQuestions: isCustom ? parsedCustom.questions.length : Number(formData.totalQuestions),
        marksPerQuestion: Number(formData.marksPerQuestion),
        negativeMarking: Number(formData.negativeMarking),
        customQuestions: isCustom ? parsedCustom.questions : [],
        updatedAt: Timestamp.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'live_exams', editingId), payload);
      } else {
        payload.createdAt = Timestamp.now();
        await addDoc(collection(db, 'live_exams'), payload);
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

  const handleEdit = (exam) => {
    // format dates for input type="datetime-local"
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const formatForInput = (dateObj) => {
      if (!dateObj) return '';
      const localISOTime = (new Date(dateObj - tzoffset)).toISOString().slice(0,16);
      return localISOTime;
    };

    // পুরনো পরীক্ষায় level সেভ করা নেই — বিষয়ের id থেকে বের করে নিই
    const known = allSubjects.find((s) => s.id === exam.subject);

    setFormData({
      title: exam.title || '',
      description: exam.description || '',
      level: exam.level || known?.level || 'HSC',
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
    // সেভ করা প্রশ্নগুলো আবার JSON আকারে দেখাই, যাতে এডিট করা যায়
    setCustomJson(
      exam.customQuestions?.length
        ? JSON.stringify(
            // ভিতরে বসানো `id` বাদ দিয়ে দেখাই — ওটা সেভের সময় নিজেই তৈরি হয়
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
    } catch (err) {
      console.error('Error deleting exam:', err);
    }
  };

  const getStatus = (start, end) => {
    const now = new Date();
    if (now < start) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Upcoming</span>;
    if (now >= start && now <= end) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">Ongoing</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Completed</span>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {confirmDialog}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-fuchsia-400" />
            লাইভ এক্সাম ম্যানেজমেন্ট
          </h2>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage live mock tests for students.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setFormData({
                title: '', description: '', level: levels[0] || 'HSC', subject: '', subjectLabel: '',
                chapters: [], questionSource: 'bank', startTime: '', endTime: '', duration: 30,
                totalQuestions: 25, marksPerQuestion: 1, negativeMarking: 0.25,
              });
              setCustomJson('');
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
          >
            <Plus className="h-5 w-5" /> Create Exam
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Exam' : 'Create New Exam'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Exam Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" placeholder="e.g. Physics Grand Mock Test" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">শিক্ষাস্তর</label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({ ...formData, level: e.target.value, subject: '', subjectLabel: '', chapters: [] })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
                  >
                    {levels.length === 0 && <option value={formData.level}>{formData.level}</option>}
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">বিষয়</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={e => {
                      const sub = subjectsForLevel.find(s => s.id === e.target.value);
                      setFormData({ ...formData, subject: e.target.value, subjectLabel: sub?.label || '', chapters: [] });
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm"
                  >
                    <option value="">— বেছে নিন —</option>
                    {subjectsForLevel.map(s => (
                      <option key={s.id} value={s.id}>{s.emoji ? `${s.emoji} ` : ''}{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Description / Syllabus</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" placeholder="e.g. Chapter 1 to 4" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Start Time</label>
                <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">End Time</label>
                <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Duration (minutes)</label>
                <input required type="number" min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Total Questions
                  {formData.questionSource === 'custom' && (
                    <span className="ml-1.5 font-normal text-slate-500">(JSON থেকে স্বয়ংক্রিয়)</span>
                  )}
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  disabled={formData.questionSource === 'custom'}
                  value={formData.questionSource === 'custom' ? parsedCustom.questions.length : formData.totalQuestions}
                  onChange={e => setFormData({...formData, totalQuestions: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Marks per Question</label>
                <input required type="number" min="0.1" step="0.1" value={formData.marksPerQuestion} onChange={e => setFormData({...formData, marksPerQuestion: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Negative Marking</label>
                <input required type="number" min="0" step="0.01" value={formData.negativeMarking} onChange={e => setFormData({...formData, negativeMarking: e.target.value})}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-base sm:text-sm" />
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Settings2 className="h-4 w-4" /> প্রশ্ন নির্বাচন
              </h4>

              {/* প্রশ্নব্যাংক নাকি নিজের দেওয়া JSON */}
              <div className="mb-4 flex gap-2">
                {[
                  { id: 'bank', label: 'প্রশ্নব্যাংক থেকে', icon: Database },
                  { id: 'custom', label: 'কাস্টম JSON', icon: Code2 },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, questionSource: opt.id })}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                      formData.questionSource === opt.id
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                  </button>
                ))}
              </div>

              {formData.questionSource === 'custom' ? (
                <>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-400">
                      প্রশ্নগুলো JSON অ্যারে হিসেবে দিন। <span className="text-slate-500">answer = অপশনের ক্রম, ০ = প্রথম।</span>
                    </p>
                    <button
                      type="button"
                      onClick={copyTemplate}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-indigo-500/50 hover:text-indigo-200"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'কপি হয়েছে' : 'ফরম্যাট কপি করুন'}
                    </button>
                  </div>

                  <textarea
                    value={customJson}
                    onChange={(e) => setCustomJson(e.target.value)}
                    rows={10}
                    spellCheck={false}
                    placeholder={QUESTION_TEMPLATE}
                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-200 outline-none focus:border-indigo-500 placeholder:text-slate-700"
                  />

                  {/* ভুল থাকলে কোন প্রশ্নে তা আলাদা করে বলি */}
                  {parsedCustom.errors.length > 0 && (
                    <div className="mt-2 space-y-1 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3">
                      {parsedCustom.errors.map((msg, i) => (
                        <p key={i} className="flex items-start gap-2 text-[11.5px] font-semibold text-rose-200">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {msg}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* পার্স হওয়া প্রশ্ন ও কোনটি সঠিক তা দেখাই — ইনডেক্স এক ঘর
                      এদিক-ওদিক হলে এখানেই চোখে পড়বে, পরীক্ষার পরে নয় */}
                  {parsedCustom.questions.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-bold text-emerald-400">
                        ✓ {parsedCustom.questions.length} টি প্রশ্ন প্রস্তুত — সঠিক উত্তর মিলিয়ে নিন
                      </p>
                      <div className="max-h-64 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                        {parsedCustom.questions.map((q, i) => (
                          <div key={i} className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                            <p className="mb-1.5 text-[12px] font-semibold text-slate-200">
                              {i + 1}. {q.question}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {q.options.map((opt, oi) => (
                                <span
                                  key={oi}
                                  className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                                    oi === q.answer
                                      ? 'bg-emerald-500/20 font-bold text-emerald-300'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {oi === q.answer ? '✓ ' : ''}{opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : !formData.subject ? (
                <p className="text-sm text-slate-400">প্রথমে একটি বিষয় বেছে নিন।</p>
              ) : (
                <>
                  <p className="mb-2 text-xs font-semibold text-slate-400">
                    অধ্যায় (কিছু না বাছলে ঐ বিষয়ের সব অধ্যায় থেকে আসবে)
                  </p>

                  {(selectedSubject?.chapters || []).length === 0 ? (
                    <p className="text-sm text-slate-500">এই বিষয়ে কোনো অধ্যায় যুক্ত করা হয়নি।</p>
                  ) : (
                    <div className="mb-4 flex flex-wrap gap-2">
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
                            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                              on
                                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-200'
                                : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {ch.name || ch.title || ch.id}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* প্রশ্ন যথেষ্ট আছে কি না — সেভ করার আগেই জানা দরকার */}
                  <div className="flex items-center gap-2 text-sm">
                    {countingQuestions ? (
                      <span className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> প্রশ্ন গোনা হচ্ছে…
                      </span>
                    ) : availableCount === null ? (
                      <span className="text-slate-500">প্রশ্নসংখ্যা জানা যায়নি।</span>
                    ) : (
                      <span className={availableCount < Number(formData.totalQuestions || 0) ? 'text-amber-400' : 'text-emerald-400'}>
                        {availableCount < Number(formData.totalQuestions || 0) && (
                          <AlertTriangle className="mr-1.5 inline h-4 w-4 align-text-bottom" />
                        )}
                        পাওয়া যাচ্ছে <strong>{availableCount}</strong> টি MCQ
                        {availableCount < Number(formData.totalQuestions || 0)
                          ? ` — কিন্তু ${formData.totalQuestions} টি চাওয়া হয়েছে, পরীক্ষায় ${availableCount} টিই আসবে।`
                          : ' ✓'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {editingId ? 'Update Exam' : 'Save Exam'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
              <CalendarClock className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No live exams scheduled yet.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam.id} className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  {getStatus(exam.startTime, exam.endTime)}
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(exam)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{exam.title}</h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-1">{exam.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400">Subject:</span>
                    <span className="text-white font-medium">{subjectLabelOf(exam)}</span>
                  </div>
                  {exam.customQuestions?.length > 0 && (
                    <div className="flex justify-between border-b border-slate-700/50 pb-2">
                      <span className="text-slate-400">প্রশ্নের উৎস:</span>
                      <span className="font-medium text-fuchsia-300">কাস্টম JSON</span>
                    </div>
                  )}
                  {/* পুরনো পরীক্ষাগুলোর subject কোনো আসল বিষয়ের সাথে মেলে না —
                      ওগুলো চালালে শূন্য প্রশ্ন আসবে, তাই স্পষ্ট সতর্কতা।
                      কাস্টম প্রশ্ন থাকলে প্রশ্নব্যাংকে যাওয়াই লাগে না। */}
                  {allSubjects.length > 0 && !exam.customQuestions?.length
                    && !allSubjects.some((s) => s.id === exam.subject) && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <p className="text-[11px] font-semibold leading-snug text-amber-200">
                        এই বিষয়টি ({exam.subject}) প্রশ্নব্যাংকে নেই — পরীক্ষায় কোনো প্রশ্ন আসবে না।
                        এডিট করে বিষয় আবার বেছে দিন।
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400">Questions:</span>
                    <span className="text-white font-medium">{exam.totalQuestions} ({exam.duration} mins)</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400 text-xs">Starts:</span>
                    <span className="text-indigo-300 text-xs font-bold">
                      {exam.startTime?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openParticipants(exam)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Users className="h-3.5 w-3.5" /> অংশগ্রহণকারী
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── অংশগ্রহণকারীদের তালিকা ───────────────────────────────────── */}
      {participantsFor && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setParticipantsFor(null)} />

          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 p-5">
              <div className="min-w-0">
                <h3 className="truncate text-[17px] font-semibold tracking-tight text-white">{participantsFor.title}</h3>
                <p className="mt-0.5 text-xs font-semibold text-slate-400">
                  {loadingParticipants
                    ? 'তালিকা আনা হচ্ছে…'
                    : `${participants.length} জন অংশ নিয়েছে`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setParticipantsFor(null)}
                aria-label="বন্ধ করুন"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 custom-scrollbar">
              {loadingParticipants ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                </div>
              ) : participants.length === 0 ? (
                <div className="py-12 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-slate-600" />
                  <p className="font-medium text-slate-400">এখনো কেউ এই পরীক্ষা দেয়নি।</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-2 py-2 font-bold">#</th>
                        <th className="px-2 py-2 font-bold">নাম</th>
                        <th className="px-2 py-2 text-center font-bold">সঠিক</th>
                        <th className="px-2 py-2 text-center font-bold">ভুল</th>
                        <th className="px-2 py-2 text-center font-bold">বাদ</th>
                        <th className="px-2 py-2 text-right font-bold">নম্বর</th>
                        <th className="px-2 py-2 text-right font-bold">জমা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {participants.map((p, i) => (
                        <tr key={p.id} className="transition-colors hover:bg-slate-800/40">
                          <td className="px-2 py-2.5 font-bold text-slate-500">{i + 1}</td>
                          <td className="px-2 py-2.5 font-semibold text-slate-200">
                            {p.userName || 'নামহীন'}
                          </td>
                          <td className="px-2 py-2.5 text-center font-bold text-emerald-400">{p.correct ?? 0}</td>
                          <td className="px-2 py-2.5 text-center font-bold text-rose-400">{p.wrong ?? 0}</td>
                          <td className="px-2 py-2.5 text-center text-slate-500">{p.unanswered ?? 0}</td>
                          <td className="px-2 py-2.5 text-right font-black text-indigo-300">{p.totalScore ?? 0}</td>
                          <td className="px-2 py-2.5 text-right text-[11px] text-slate-500">
                            {p.submittedAt ? p.submittedAt.toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
