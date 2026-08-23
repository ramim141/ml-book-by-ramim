import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Star, Plus, Trash2, Loader2, Award, Zap, Trophy } from 'lucide-react';
import { SkeletonList } from '../UI/Skeleton';

export default function GamificationManager() {
  const [levels, setLevels] = useState([]);
  const [baseXp, setBaseXp] = useState(10);
  const [xpPerCorrect, setXpPerCorrect] = useState(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const DEFAULT_LEVELS = [
    { id: 'level_1', icon: '🌱', label: 'Novice', minXp: 0, desc: 'নতুন শুরু করেছ' },
    { id: 'level_2', icon: '🔥', label: 'Learner', minXp: 100, desc: 'Level 2 Learner অর্জন করেছ' },
    { id: 'level_3', icon: '⭐', label: 'Scholar', minXp: 300, desc: 'Level 3 Scholar অর্জন করেছ' },
    { id: 'level_4', icon: '🎓', label: 'Master', minXp: 600, desc: 'Level 4 Master অর্জন করেছ' },
    { id: 'level_5', icon: '👑', label: 'Legend', minXp: 1000, desc: 'সর্বোচ্চ লেভেল অর্জন করেছ!' },
  ];

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', 'gamification'));
        if (snap.exists()) {
          const data = snap.data();
          setLevels(data.levels || DEFAULT_LEVELS);
          setBaseXp(data.baseXp ?? 10);
          setXpPerCorrect(data.xpPerCorrect ?? 2);
        } else {
          setLevels(DEFAULT_LEVELS);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await setDoc(doc(db, 'admin_settings', 'gamification'), { 
        levels, 
        baseXp: Number(baseXp), 
        xpPerCorrect: Number(xpPerCorrect) 
      });
      setMessage({ text: 'গেমিফিকেশন সেটিংস সেভ হয়েছে!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'সেভ করতে সমস্যা হয়েছে।', type: 'error' });
    }
    setSaving(false);
  };

  const updateLevel = (idx, field, value) => {
    const updated = [...levels];
    updated[idx] = { ...updated[idx], [field]: field === 'minXp' ? Number(value) : value };
    setLevels(updated);
  };

  const addLevel = () => {
    setLevels([...levels, { id: `level_${Date.now()}`, icon: '🏅', label: 'New Level', minXp: 0, desc: '' }]);
  };

  const removeLevel = (idx) => {
    setLevels(levels.filter((_, i) => i !== idx));
  };

  if (loading) return <div className="p-4"><SkeletonList count={5} /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Star className="text-yellow-400" /> গেমিফিকেশন ও পয়েন্ট সেটিংস</h2>
        <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} সেভ করুন
        </button>
      </div>

      {message.text && (
        <div className={`mb-5 p-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
          {message.text}
        </div>
      )}

      {/* Point Rules Settings */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 mb-8">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Zap className="text-amber-400 w-5 h-5" /> গ্লোবাল পয়েন্ট (XP) রুলস</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Base XP (পরীক্ষা দিলেই পাবে)</label>
            <div className="relative">
              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input type="number" value={baseXp} onChange={e => setBaseXp(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white font-bold outline-none focus:border-indigo-500 text-base sm:text-sm" />
            </div>
            <p className="text-xs text-slate-500 mt-2">যেকোনো মডেল টেস্টে অংশগ্রহণ করলেই স্টুডেন্ট এই পয়েন্টটি পাবে।</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">XP Per Correct Answer (সঠিক উত্তরের পয়েন্ট)</label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input type="number" value={xpPerCorrect} onChange={e => setXpPerCorrect(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white font-bold outline-none focus:border-emerald-500 text-base sm:text-sm" />
            </div>
            <p className="text-xs text-slate-500 mt-2">প্রতিটি সঠিক উত্তরের জন্য কত পয়েন্ট যোগ হবে। (যেমন: ১০টি সঠিক উত্তর = ১০ x ২ = ২০)</p>
          </div>
        </div>
      </div>

      {/* Levels Settings */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white flex items-center gap-2"><Trophy className="text-amber-400 w-5 h-5" /> লেভেল আপ করার শর্ত (Thresholds)</h3>
      </div>
      <div className="space-y-4 mb-6">
        {levels.map((lvl, idx) => (
          <div key={lvl.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="w-16 shrink-0">
              <label className="block text-xs font-bold text-slate-500 mb-1">Emoji</label>
              <input type="text" value={lvl.icon} onChange={e => updateLevel(idx, 'icon', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-xl text-base sm:text-sm" />
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-slate-500 mb-1">লেভেলের নাম</label>
              <input type="text" value={lvl.label} onChange={e => updateLevel(idx, 'label', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-200" />
            </div>
            <div className="w-full md:w-32 shrink-0">
              <label className="block text-xs font-bold text-slate-500 mb-1">প্রয়োজনীয় XP</label>
              <input type="number" value={lvl.minXp} onChange={e => updateLevel(idx, 'minXp', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm font-bold text-indigo-400" />
            </div>
            <div className="w-full md:flex-1">
              <label className="block text-xs font-bold text-slate-500 mb-1">বর্ণনা</label>
              <input type="text" value={lvl.desc} onChange={e => updateLevel(idx, 'desc', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base sm:text-sm text-slate-200" />
            </div>
            <button onClick={() => removeLevel(idx)} className="mt-5 md:mt-0 p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors shrink-0">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button onClick={addLevel} className="w-full py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl border border-dashed border-slate-600 hover:border-slate-500 font-bold transition-all flex items-center justify-center gap-2">
        <Plus className="w-5 h-5" /> নতুন লেভেল যুক্ত করুন
      </button>
    </div>
  );
}
