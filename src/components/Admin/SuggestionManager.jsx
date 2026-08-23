import { useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { Lightbulb, Trash2, Loader2, AlertTriangle, Eye, EyeOff, Pencil, X } from 'lucide-react';
import { db } from '../../config/firebase';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';

const LEVELS = ['SSC', 'HSC', 'Admission'];
const EMPTY_FORM = { title: '', level: 'HSC', subjectId: '', year: '', content: '' };

export default function SuggestionManager() {
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const { data: allSubjects = [] } = useAcademicSubjects();
  const subjectsForLevel = allSubjects.filter((s) => s.level === form.level);

  const { data: suggestions = [], isLoading, isError } = useQuery({
    queryKey: ['admin_suggestions'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'suggestions'), orderBy('createdAt', 'desc')));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin_suggestions'] });
  const resetForm = () => { setForm(EMPTY_FORM); setEditingId(null); };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const subject = allSubjects.find((s) => s.id === payload.subjectId);
      const body = {
        title: payload.title.trim(),
        level: payload.level,
        subjectId: payload.subjectId,
        subjectLabel: subject?.label || '',
        year: payload.year.trim(),
        content: payload.content.trim(),
      };
      if (editingId) {
        return updateDoc(doc(db, 'suggestions', editingId), { ...body, updatedAt: serverTimestamp() });
      }
      return addDoc(collection(db, 'suggestions'), { ...body, published: false, createdAt: serverTimestamp() });
    },
    onSuccess: () => {
      invalidate();
      toast.success(editingId ? 'সাজেশন আপডেট হয়েছে।' : 'সাজেশন সেভ হয়েছে।');
      resetForm();
    },
    onError: (e) => { console.error(e); toast.error('সেভ করা যায়নি।'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDoc(doc(db, 'suggestions', id)),
    onSuccess: () => { invalidate(); toast.success('মুছে ফেলা হয়েছে।'); },
    onError: (e) => { console.error(e); toast.error('মুছে ফেলা যায়নি।'); },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }) => updateDoc(doc(db, 'suggestions', id), { published: !published }),
    onSuccess: invalidate,
    onError: (e) => { console.error(e); toast.error('স্ট্যাটাস বদলানো যায়নি।'); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('শিরোনাম দিন।');
    if (!form.subjectId) return toast.error('বিষয় বাছাই করুন।');
    if (!form.content.trim()) return toast.error('সাজেশনের বিষয়বস্তু লিখুন।');
    saveMutation.mutate(form);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      level: item.level || 'HSC',
      subjectId: item.subjectId || '',
      year: item.year || '',
      content: item.content || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputCls = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm focus:border-indigo-500 outline-none';

  return (
    <div className="max-w-3xl">
      {confirmDialog}
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
        <Lightbulb className="text-amber-400" /> সাজেশন ম্যানেজমেন্ট
      </h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-5">
        {editingId && (
          <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2">
            <span className="text-xs font-bold text-indigo-300">এডিট করা হচ্ছে</span>
            <button type="button" onClick={resetForm} className="text-slate-400 transition hover:text-white" title="এডিট বাতিল">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs text-slate-400">শিরোনাম</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="যেমন: এইচএসসি ২০২৬ রসায়ন ১ম পত্র ফাইনাল সাজেশন"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400">শিক্ষাস্তর</label>
            <select
              value={form.level}
              // স্তর বদলালে আগের বিষয়টি আর প্রযোজ্য থাকে না
              onChange={(e) => setForm({ ...form, level: e.target.value, subjectId: '' })}
              className={inputCls}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">বিষয়</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className={inputCls}
            >
              <option value="">— বাছাই করুন —</option>
              {subjectsForLevel.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            {subjectsForLevel.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-400/80">এই স্তরে কোনো বিষয় যোগ করা নেই।</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-400">সাল (ঐচ্ছিক)</label>
            <input
              type="text"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="২০২৬"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-400">সাজেশন (প্রতি লাইনে একটি অধ্যায়/টপিক)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder={'অধ্যায় ১: গুণগত রসায়ন — শিখন ফল ১.২, ১.৪\nঅধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম'}
            className={`${inputCls} min-h-[160px] font-mono leading-relaxed`}
          />
        </div>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
          {editingId ? 'আপডেট করুন' : 'সাজেশন সেভ করুন'}
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-500" /></div>
      ) : isError ? (
        <div className="flex items-center justify-center gap-2 p-8 text-rose-500">
          <AlertTriangle className="h-6 w-6" /> লোড করা যায়নি
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-center text-slate-500">এখনো কোনো সাজেশন যোগ করা হয়নি।</p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 ${item.published ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {item.published ? 'প্রকাশিত' : 'ড্রাফট'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {item.level}{item.subjectLabel ? ` · ${item.subjectLabel}` : ''}{item.year ? ` · ${item.year}` : ''}
                    </span>
                  </div>
                  <p className="truncate text-sm font-bold text-slate-100">{item.title}</p>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-slate-400">{item.content}</p>
                </div>

                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    onClick={() => publishMutation.mutate({ id: item.id, published: item.published })}
                    title={item.published ? 'ড্রাফটে নিন' : 'প্রকাশ করুন'}
                    className="rounded-lg bg-black/20 p-1.5 transition-colors hover:bg-indigo-500/20 hover:text-indigo-300"
                  >
                    {item.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    title="এডিট করুন"
                    className="rounded-lg bg-black/20 p-1.5 transition-colors hover:bg-amber-500/20 hover:text-amber-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => { if (await confirm({ title: 'সাজেশন মুছে ফেলবেন?', message: 'মুছে ফেললে এটি আর ফিরে পাওয়া যাবে না।' })) deleteMutation.mutate(item.id); }}
                    title="মুছে ফেলুন"
                    className="rounded-lg bg-black/20 p-1.5 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
