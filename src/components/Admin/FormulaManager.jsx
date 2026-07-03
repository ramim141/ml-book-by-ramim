import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Sigma, Plus, Trash2, Loader2, Edit2 } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function FormulaManager() {
  const [formulas, setFormulas] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState(''); // Chapter name
  const [title, setTitle] = useState('');
  const [latexCode, setLatexCode] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subjects configuration
      const subSnap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      let loadedSubjects = [];
      if (subSnap.exists() && subSnap.data().list) {
        loadedSubjects = subSnap.data().list;
        setAvailableSubjects(loadedSubjects);
      }

      // Fetch formulas
      const snapshot = await getDocs(collection(db, 'smart_formulas'));
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setFormulas(list);
      
      // Set default subject if available
      if (loadedSubjects.length > 0) {
          setSubjectId(loadedSubjects[0].id);
      }

    } catch (e) {
      console.error('Error fetching data:', e);
    }
    setLoading(false);
  };

  const formatDescription = (text) => {
    if (!text) return text;
    if (text.includes('$')) return text;
    const hasBengali = /[\u0980-\u09FF]/.test(text);
    if (!hasBengali && (text.includes('\\') || text.includes('_') || text.includes('^') || text.includes('='))) {
      return `$${text}$`;
    }
    return text;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !latexCode.trim() || !category.trim() || !subjectId) return;
    
    // Find subject label
    const selectedSub = availableSubjects.find(s => s.id === subjectId);
    if (!selectedSub) return;

    setSaving(true);
    const formulaData = {
      subject: selectedSub.label, // Storing human-readable label
      subjectId: subjectId,       // Also storing ID for reference
      category,                   // Selected chapter
      title,
      latexCode,
      description,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'smart_formulas', editingId), formulaData);
      } else {
        formulaData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'smart_formulas'), formulaData);
      }
      resetForm();
      fetchFormulas();
    } catch (error) {
      console.error('Error saving formula:', error);
      alert('ফর্মুলা সেভ করতে সমস্যা হয়েছে!');
    }
    setSaving(false);
  };
  
  const fetchFormulas = async () => {
      try {
          const snapshot = await getDocs(collection(db, 'smart_formulas'));
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          setFormulas(list);
      } catch (e) {
          console.error('Error refetching formulas', e);
      }
  }

  const handleEdit = (formula) => {
    setEditingId(formula.id);
    setSubjectId(formula.subjectId || ''); // Fallback for old data
    setCategory(formula.category);
    setTitle(formula.title);
    setLatexCode(formula.latexCode);
    setDescription(formula.description || '');
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত?')) return;
    try {
      await deleteDoc(doc(db, 'smart_formulas', id));
      fetchFormulas();
    } catch (e) {
      console.error(e);
      alert('ডিলিট করতে সমস্যা হয়েছে!');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setLatexCode('');
    setDescription('');
    // keep subject and category as they are usually repeated
  };

  // Derive chapters based on selected subject
  const currentSubjectObj = availableSubjects.find(s => s.id === subjectId);
  const currentChapters = currentSubjectObj ? (currentSubjectObj.chapters || []) : [];

  // When subject changes, reset category if the new subject doesn't have it
  useEffect(() => {
    if (currentChapters.length > 0) {
      if (!currentChapters.find(ch => ch.name === category)) {
        setCategory(currentChapters[0].name);
      }
    } else {
      setCategory('');
    }
  }, [subjectId, currentChapters, category]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Sigma className="text-indigo-400" /> স্মার্ট ফর্মুলা ম্যানেজমেন্ট
      </h2>

      {/* Add / Edit Form */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
        <h3 className="font-bold text-lg mb-4">{editingId ? 'ফর্মুলা এডিট করুন' : 'নতুন ফর্মুলা যোগ করুন'}</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">বিষয় (Subject)</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            >
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.level} - {sub.label}</option>
              ))}
              {availableSubjects.length === 0 && <option value="">কোনো বিষয় নেই</option>}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">ক্যাটাগরি / অধ্যায়</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            >
              {currentChapters.length > 0 ? (
                currentChapters.map(ch => (
                  <option key={ch.id} value={ch.name}>{ch.name}</option>
                ))
              ) : (
                <option value="">প্রথমে সাবজেক্টে চ্যাপ্টার যোগ করুন</option>
              )}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">ফর্মুলার নাম</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Newton's Second Law"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">LaTeX কোড (Math Equation)</label>
            <textarea
              value={latexCode}
              onChange={(e) => setLatexCode(e.target.value)}
              placeholder="e.g. F = m \\cdot a"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-24 font-mono"
              required
            />
          </div>
          
          {/* Live Preview */}
          {latexCode.trim() && (
            <div className="md:col-span-2 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-500 block mb-2">প্রিভিউ:</span>
              <div className="overflow-x-auto">
                <BlockMath math={latexCode} />
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">ব্যাখ্যা (Description) - Optional</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Here $m$ = mass, $a$ = acceleration"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-20"
            />
          </div>

          {/* Description Live Preview */}
          {description.trim() && (
            <div className="md:col-span-2 p-4 bg-slate-900 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-500 block mb-2">ব্যাখ্যা প্রিভিউ:</span>
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-indigo-400">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {formatDescription(description)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving || currentChapters.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors font-bold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
              {editingId ? 'আপডেট করুন' : 'যুক্ত করুন'}
            </button>
          </div>
        </form>
      </div>

      {/* Formula List */}
      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">যুক্ত করা ফর্মুলাসমূহ ({formulas.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formulas.map(formula => (
              <div key={formula.id} className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700 relative group flex flex-col">
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(formula)} className="p-1.5 bg-slate-700 hover:bg-indigo-500 text-slate-300 hover:text-white rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(formula.id)} className="p-1.5 bg-slate-700 hover:bg-rose-500 text-slate-300 hover:text-white rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">{formula.subject}</span>
                  <span className="text-xs px-2 py-0.5 bg-fuchsia-500/20 text-fuchsia-300 rounded-md">{formula.category}</span>
                </div>
                
                <h4 className="font-bold text-white mb-3">{formula.title}</h4>
                
                <div className="bg-slate-900 rounded-xl p-3 overflow-x-auto min-h-[60px] flex items-center justify-center flex-grow">
                  <BlockMath math={formula.latexCode} />
                </div>
                
                {formula.description && (
                  <div className="mt-4 text-xs text-slate-300 border-t border-slate-700/50 pt-3 prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {formula.description}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            
            {formulas.length === 0 && (
              <div className="col-span-full text-center p-8 text-slate-500">কোনো ফর্মুলা পাওয়া যায়নি।</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
