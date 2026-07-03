import { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Swords, Save, Loader2 } from 'lucide-react';

export default function DailyChallengeManager() {
  const [level, setLevel] = useState('HSC');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    getDoc(doc(db, 'admin_settings', 'subjects')).then(snap => {
      if (snap.exists()) setSubjects(snap.data().list || []);
    });
  }, []);

  const handleOptionChange = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  const handleSave = async () => {
    if (!subject || !question || options.some(o => !o)) return alert('Subject, Question, and 4 Options are required');
    setSaving(true);
    setMsg('');
    try {
      await addDoc(collection(db, 'daily_challenges'), {
        level, subject, question, options,
        answer: Number(answer), explanation,
        createdAt: new Date(),
      });
      setMsg('প্রশ্ন সফলভাবে যোগ করা হয়েছে!');
      setQuestion(''); setOptions(['', '', '', '']); setExplanation('');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setMsg('সমস্যা হয়েছে: ' + e.message);
    }
    setSaving(false);
  };

  const availableSubjects = subjects.filter(s => s.level === level);

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Swords className="text-amber-400" /> ডেইলি চ্যালেঞ্জ ম্যানেজমেন্ট</h2>

      {msg && <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-sm">{msg}</div>}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Academic Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500">
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Admission">Admission</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500">
              <option value="">সিলেক্ট বিষয়</option>
              {availableSubjects.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">প্রশ্ন</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500" rows={2} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-400 mb-2">৪টি অপশন (সঠিক উত্তরটি রেডিও বাটন দিয়ে সিলেক্ট করুন)</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input type="radio" name="correct_answer" checked={answer === idx} onChange={() => setAnswer(idx)} className="w-4 h-4 accent-indigo-500" />
              <input type="text" value={opt} onChange={e => handleOptionChange(idx, e.target.value)} placeholder={`Option ${idx + 1}`} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500" />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">ব্যাখ্যা (ঐচ্ছিক)</label>
          <textarea value={explanation} onChange={e => setExplanation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-indigo-500" rows={2} />
        </div>

        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} প্রশ্ন সেভ করুন
        </button>
      </div>
    </div>
  );
}
