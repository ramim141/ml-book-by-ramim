import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { BookOpen, RotateCcw, Plus, Loader2, Trash2 } from 'lucide-react';

function LevelAccordion({ lvl, lvlSubjects, saving, handleDeleteSubject, handleAddChapter, handleDeleteChapter }) {
  const [expanded, setExpanded] = useState(lvl === 'HSC');

  return (
    <div className={`rounded-2xl border transition-all ${expanded ? 'border-indigo-500/30 bg-slate-900/40' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}`}>
      <div 
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-colors ${expanded ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            {lvl}
          </span>
          <div>
            <h3 className="font-bold text-slate-200">{lvl} Level</h3>
            <p className="text-xs text-slate-500 mt-0.5">{lvlSubjects.length}টি সাবজেক্ট</p>
          </div>
        </div>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expanded ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}
        >
          <span className="text-sm font-bold">{expanded ? '▲' : '▼'}</span>
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/60 mt-2">
          {lvlSubjects.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-4">এই লেভেলে এখনো কোনো সাবজেক্ট নেই।</p>
          ) : (
            <div className="space-y-3">
              {lvlSubjects.map(s => (
                <SubjectAccordion
                  key={s.id + s.level}
                  subject={s}
                  saving={saving}
                  onDelete={() => handleDeleteSubject(s.id, s.level)}
                  onAddChapter={name => handleAddChapter(s.id, name)}
                  onDeleteChapter={chId => handleDeleteChapter(s.id, chId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SubjectAccordion({ subject, saving, onDelete, onAddChapter, onDeleteChapter }) {
  const [expanded, setExpanded] = useState(false);
  const [newChapter, setNewChapter] = useState('');
  const chapters = subject.chapters || [];

  const submitChapter = () => {
    if (!newChapter.trim()) return;
    onAddChapter(newChapter);
    setNewChapter('');
  };

  return (
    <div className={`rounded-xl overflow-hidden border transition-all ${expanded ? 'border-indigo-500/40 bg-slate-900/80' : 'border-slate-700/50 bg-slate-900/40'}`}>
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpanded(!expanded)}>
          <span className="text-xl">{subject.emoji || '📚'}</span>
          <div>
            <p className="font-bold text-slate-100 text-sm">{subject.label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">ID: {subject.id} &nbsp;·&nbsp; {chapters.length}টি চ্যাপ্টার</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${expanded ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {expanded ? '▲ বন্ধ' : `▼ চ্যাপ্টার`}
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700/50 bg-slate-950/60 p-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newChapter}
              onChange={e => setNewChapter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitChapter()}
              placeholder="নতুন চ্যাপ্টারের নাম লিখুন (Enter চাপুন)..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none transition-colors"
            />
            <button
              onClick={submitChapter}
              disabled={saving || !newChapter.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-1 transition-colors disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} যুক্ত
            </button>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-6 text-slate-600 text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>এখনো কোনো চ্যাপ্টার নেই।</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {chapters.map((ch, idx) => (
                <div key={ch.id} className="flex items-center justify-between bg-slate-900 px-3 py-2.5 rounded-lg border border-slate-800 group">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold border border-indigo-500/30 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-300">{ch.name}</span>
                  </div>
                  <button onClick={() => onDeleteChapter(ch.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubjectsManager() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [level, setLevel] = useState('HSC');
  const [label, setLabel] = useState('');
  const [customId, setCustomId] = useState('');
  const [emoji, setEmoji] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const DEFAULT_SUBJECTS = [
    { id: 'hsc-ict', label: 'HSC ICT', level: 'HSC', emoji: '💻', color: 'from-indigo-500 to-purple-500', chapters: [
      { id: 'chapter-1', name: 'বিশ্ব ও বাংলাদেশ প্রেক্ষিত' },
      { id: 'chapter-2', name: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং' },
      { id: 'chapter-3', name: 'সংখ্যা পদ্ধতি ও ডিজিটাল লজিক ডিজাইন' },
      { id: 'chapter-4', name: 'ওয়েব ডিজাইন পরিচিতি' },
      { id: 'chapter-5', name: 'প্রোগ্রামিং ভাষা' },
      { id: 'chapter-6', name: 'ডেটাবেস ম্যানেজমেন্ট সিস্টেম' },
    ]},
    { id: 'hsc-chemistry-1', label: 'রসায়ন ১ম পত্র', level: 'HSC', emoji: '🧪', color: 'from-emerald-500 to-teal-500', chapters: [
      { id: 'chapter-2', name: 'গুণগত রসায়ন' },
      { id: 'chapter-3', name: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন' },
    ]},
    { id: 'hsc-chemistry-2', label: 'রসায়ন ২য় পত্র', level: 'HSC', emoji: '⚗️', color: 'from-emerald-500 to-teal-500', chapters: [] },
    { id: 'hsc-physics-1', label: 'পদার্থবিজ্ঞান ১ম পত্র', level: 'HSC', emoji: '⚛️', color: 'from-sky-500 to-blue-600', chapters: [] },
    { id: 'hsc-physics-2', label: 'পদার্থবিজ্ঞান ২য় পত্র', level: 'HSC', emoji: '🔭', color: 'from-sky-500 to-blue-600', chapters: [] },
    { id: 'hsc-biology-1', label: 'জীববিজ্ঞান ১ম পত্র', level: 'HSC', emoji: '🧬', color: 'from-green-500 to-lime-600', chapters: [] },
    { id: 'hsc-biology-2', label: 'জীববিজ্ঞান ২য় পত্র', level: 'HSC', emoji: '🌿', color: 'from-green-500 to-lime-600', chapters: [] },
    { id: 'hsc-math-1', label: 'উচ্চতর গণিত ১ম পত্র', level: 'HSC', emoji: '📐', color: 'from-yellow-500 to-orange-500', chapters: [] },
    { id: 'hsc-math-2', label: 'উচ্চতর গণিত ২য় পত্র', level: 'HSC', emoji: '📊', color: 'from-yellow-500 to-orange-500', chapters: [] },
    { id: 'hsc-bangla-1', label: 'বাংলা ১ম পত্র', level: 'HSC', emoji: '📖', color: 'from-rose-500 to-pink-600', chapters: [] },
    { id: 'hsc-english-1', label: 'English 1st Paper', level: 'HSC', emoji: '🇬🇧', color: 'from-violet-500 to-purple-600', chapters: [] },
  ];

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      if (snap.exists() && snap.data().list?.length > 0) {
        setSubjects(snap.data().list);
      } else {
        await setDoc(doc(db, 'admin_settings', 'subjects'), { list: DEFAULT_SUBJECTS }, { merge: true });
        setSubjects(DEFAULT_SUBJECTS);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveSubjects = async (updated, msg) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'subjects'), { list: updated }, { merge: true });
      setSubjects(updated);
      if (msg) { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleAdd = () => {
    if (!level || !label.trim()) return alert('Level ও সাবজেক্টের নাম দেওয়া আবশ্যিক');
    
    let baseId = customId.trim() ? customId.trim() : label.trim();
    let safeId = baseId.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0980-\u09FF-]/g, '');
    if (!safeId) safeId = Date.now().toString();
    
    const autoId = level.toLowerCase() + '-' + safeId;
    
    if (subjects.find(s => s.id === autoId && s.level === level)) return alert('এই নামে বা ID-তে সাবজেক্ট আগেই আছে!');
    
    const newSub = { id: autoId, level, label: label.trim(), emoji: emoji || '📚', color: 'from-indigo-500 to-purple-500', chapters: [] };
    saveSubjects([...subjects, newSub], label.trim() + ' সাবজেক্ট যোগ হয়েছে! ✅');
    setLabel(''); setEmoji(''); setCustomId('');
  };

  const handleDeleteSubject = (id, subLevel) => {
    if (!confirm('এই সাবজেক্ট ও এর সব চ্যাপ্টার মুছে ফেলতে চান?')) return;
    saveSubjects(subjects.filter(s => !(s.id === id && s.level === subLevel)), 'সাবজেক্ট মুছে ফেলা হয়েছে।');
  };

  const handleAddChapter = (sid, chapterName) => {
    const updated = subjects.map(s => {
      if (s.id === sid) {
        const chapters = s.chapters || [];
        return { ...s, chapters: [...chapters, { id: 'ch_' + Date.now(), name: chapterName.trim() }] };
      }
      return s;
    });
    saveSubjects(updated, 'চ্যাপ্টার যোগ হয়েছে! ✅');
  };

  const handleDeleteChapter = (sid, chapterId) => {
    const updated = subjects.map(s => {
      if (s.id === sid) {
        return { ...s, chapters: (s.chapters || []).filter(c => c.id !== chapterId) };
      }
      return s;
    });
    saveSubjects(updated, 'চ্যাপ্টার মুছে ফেলা হয়েছে।');
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="text-emerald-400" /> সাবজেক্ট ও চ্যাপ্টার ম্যানেজমেন্ট
        <button
          onClick={async () => {
            if (!confirm('ফায়ারস্টোর ডিফল্ট ডেটা দিয়ে রিসেট করতে চান? (চ্যাপ্টার আইডি মিল রাখতে এটা দরকার)')) return;
            setSaving(true);
            try {
              await setDoc(doc(db, 'admin_settings', 'subjects'), { list: DEFAULT_SUBJECTS }, { merge: false });
              setSubjects(DEFAULT_SUBJECTS);
              setSuccessMsg('✅ ডিফল্ট সাবজেক্ট+চ্যাপ্টার IDs দিয়ে রিসেট হয়েছে');
              setTimeout(() => setSuccessMsg(''), 4000);
            } catch(e) { console.error(e); }
            setSaving(false);
          }}
          className="ml-auto text-xs px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg font-bold transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3 h-3" /> ডিফল্ট রিসেট
        </button>
      </h2>

      {successMsg && (
        <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-sm">
          {successMsg}
        </div>
      )}

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl mb-8">
        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" /> নতুন সাবজেক্ট যুক্ত করুন
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">লেভেল</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none text-slate-200">
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Admission">Admission</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">সাবজেক্টের নাম</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="যেমন: রসায়ন ২য় পত্র" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none text-slate-200" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">URL Path (ঐচ্ছিক)</label>
            <input type="text" value={customId} onChange={e => setCustomId(e.target.value)} placeholder="যেমন: chemistry-2" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none text-slate-200" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Emoji (ঐচ্ছিক)</label>
            <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="⚡" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none text-slate-200" />
          </div>
        </div>
        <button onClick={handleAdd} disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} সাবজেক্ট যোগ করুন
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
      ) : (
        <div className="space-y-4">
          {['SSC', 'HSC', 'Admission'].map(lvl => {
            const lvlSubjects = subjects.filter(s => s.level === lvl);
            return (
              <LevelAccordion key={lvl} lvl={lvl} lvlSubjects={lvlSubjects} saving={saving} handleDeleteSubject={handleDeleteSubject} handleAddChapter={handleAddChapter} handleDeleteChapter={handleDeleteChapter} />
            );
          })}
        </div>
      )}
    </div>
  );
}

