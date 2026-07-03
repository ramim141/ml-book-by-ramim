import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Quote, Plus, Trash2, Loader2 } from 'lucide-react';

export default function QuotesManager() {
  const [quotes, setQuotes] = useState([]);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchQuotes(); }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'admin_settings', 'quotes'));
      if (snap.exists()) setQuotes(snap.data().list || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveQuotes = async (updatedQuotes) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'quotes'), { list: updatedQuotes }, { merge: true });
      setQuotes(updatedQuotes);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleAdd = () => {
    if (!newQuoteText.trim()) return;
    const updated = [...quotes, { id: Date.now(), text: newQuoteText, author: newQuoteAuthor || 'অজানা' }];
    saveQuotes(updated);
    setNewQuoteText(''); setNewQuoteAuthor('');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) saveQuotes(quotes.filter(q => q.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Quote className="text-fuchsia-400" /> ডেইলি কোট ম্যানেজমেন্ট</h2>

      <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl mb-8 flex flex-col sm:flex-row gap-3">
        <input type="text" value={newQuoteText} onChange={e => setNewQuoteText(e.target.value)} placeholder="বাণী লিখুন..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
        <input type="text" value={newQuoteAuthor} onChange={e => setNewQuoteAuthor(e.target.value)} placeholder="লেখকের নাম (ঐচ্ছিক)"
          className="w-full sm:w-48 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none" />
        <button onClick={handleAdd} disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex justify-center items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} যোগ করুন
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
      ) : (
        <div className="space-y-3">
          {quotes.length === 0 && <p className="text-slate-500 text-center">কোনো কোট নেই।</p>}
          {quotes.map(q => (
            <div key={q.id} className="flex items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-200 font-medium text-sm">"{q.text}"</p>
                <p className="text-slate-500 text-xs mt-1">— {q.author}</p>
              </div>
              <button onClick={() => handleDelete(q.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
