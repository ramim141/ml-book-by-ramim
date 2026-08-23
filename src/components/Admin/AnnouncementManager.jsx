import { useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Megaphone, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';

export default function AnnouncementManager() {
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [saving, setSaving] = useState(false);

  const { data: announcements, isLoading, isError } = useQuery({
    queryKey: ['admin_announcements'],
    queryFn: async () => {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const addMutation = useMutation({
    mutationFn: async (newDoc) => {
      return await addDoc(collection(db, 'announcements'), newDoc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_announcements'] });
      setTitle(''); setMessage(''); setType('info');
      setSaving(false);
    },
    onError: (e) => {
      console.error(e);
      toast.error('নোটিশ পাবলিশ করা যায়নি।');
      setSaving(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await deleteDoc(doc(db, 'announcements', id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_announcements'] })
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, currentStatus }) => await updateDoc(doc(db, 'announcements', id), { active: !currentStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_announcements'] })
  });

  const handlePost = () => {
    if (!title || !message) return toast.error('শিরোনাম ও মেসেজ দুটোই দিন।');
    setSaving(true);
    const newDoc = { title, message, type, createdAt: new Date(), active: true };
    addMutation.mutate(newDoc);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: 'নোটিশ মুছে ফেলবেন?', message: 'মুছে ফেললে এটি আর ফিরে পাওয়া যাবে না।' }))) return;
    deleteMutation.mutate(id);
  };

  const toggleStatus = (id, currentStatus) => {
    toggleMutation.mutate({ id, currentStatus });
  };

  const typeStyles = {
    info: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="max-w-3xl">
      {confirmDialog}
      {/* শিরোনাম প্যানেল হেডারেই আছে — এখানে রাখলে ডেস্কটপে দুবার দেখাত */}

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl mb-8 space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">নোটিশের ধরন</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm focus:border-indigo-500 outline-none">
            <option value="info">Info (সাধারণ নোটিশ)</option>
            <option value="warning">Warning (সতর্কতা / গুরুত্বপূর্ণ)</option>
            <option value="success">Success (সাফল্য / অফার)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">শিরোনাম (Title)</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. কালকে নতুন মডেল টেস্ট" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">মেসেজ (Message)</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="বিস্তারিত..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm min-h-[80px] focus:border-indigo-500 outline-none" />
        </div>
        <button onClick={handlePost} disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />} নোটিশ পাবলিশ করুন
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
      ) : isError ? (
        <div className="flex justify-center p-8 text-rose-500"><AlertTriangle className="w-6 h-6" /></div>
      ) : (
        <div className="space-y-3">
          {announcements.length === 0 && <p className="text-slate-500 text-center">কোনো নোটিশ নেই।</p>}
          {announcements.map(a => (
            <div key={a.id} className={`flex items-start justify-between gap-4 p-4 rounded-xl border ${a.active ? typeStyles[a.type] : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${a.active ? 'bg-black/30' : 'bg-slate-800 text-slate-400'}`}>{a.type}</span>
                  <p className="font-bold text-sm">{a.title}</p>
                </div>
                <p className={`text-xs ${a.active ? 'opacity-80' : 'text-slate-500'}`}>{a.message}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => toggleStatus(a.id, a.active)} className={`p-1.5 rounded-lg text-xs font-bold ${a.active ? 'bg-black/20 hover:bg-black/40' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                  {a.active ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 bg-black/20 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
