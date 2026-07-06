import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, addDoc, query, where, limit, startAfter } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Database, Search, Edit2, Trash2, X, Check, Loader2, UploadCloud, Eye } from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function QuestionBankManager() {
  const [mode, setMode] = useState('manage'); // 'manage' | 'upload'
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Database className="text-indigo-400" /> কন্টেন্ট ও কোশ্চেন ব্যাংক</h2>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button onClick={() => setMode('manage')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${mode === 'manage' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>ম্যানেজ করুন</button>
          <button onClick={() => setMode('upload')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>আপলোড</button>
        </div>
      </div>
      {mode === 'upload' ? <QuestionBankUpload /> : <QuestionBankList />}
    </div>
  );
}

function QuestionBankUpload() {
  const queryClient = useQueryClient();
  const [jsonText, setJsonText] = useState('');
  const [level, setLevel] = useState('HSC');
  const [subject, setSubject] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [type, setType] = useState('mcq');
  const [loading, setLoading] = useState(false);
  const [existingCount, setExistingCount] = useState(null); 
  const [checkingCount, setCheckingCount] = useState(false);
  
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (file.name.endsWith('.json')) {
        setJsonText(content);
        toast.success('JSON ফাইল লোড হয়েছে! নিচের বক্সে ডাটা চেক করে সেভ করুন ক্লিক করুন।');
      } else if (file.name.endsWith('.csv')) {
        try {
          const jsonArr = parseCSV(content);
          setJsonText(JSON.stringify(jsonArr, null, 2));
          toast.success('CSV ফাইল কনভার্ট হয়ে JSON বক্সে লোড হয়েছে! এবার সেভ করুন ক্লিক করুন।');
        } catch (err) {
          toast.error('CSV পার্স করতে সমস্যা হয়েছে: ' + err.message);
        }
      } else {
        toast.error('শুধুমাত্র .json এবং .csv ফাইল সাপোর্ট করে।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
      try {
        docsToAdd = JSON.parse(jsonText);
        if (!Array.isArray(docsToAdd)) return toast.error('JSON ডেটা অবশ্যই একটি Array হতে হবে');
      } catch (e) {
        return toast.error('JSON ফরম্যাট সঠিক নয়।');
      }
    }

    setLoading(true);
    let successCount = 0;
    let duplicateCount = 0;
    try {
      const colRef = collection(db, "academic_content");
      
      // Fetch existing docs to prevent duplicates
      const q = query(colRef, where("level", "==", level), where("subject", "==", subject), where("chapterId", "==", chapterId), where("type", "==", type));
      const querySnapshot = await getDocs(q);
      const existingItems = querySnapshot.docs.map(doc => doc.data());
      
      for (const item of docsToAdd) {
        let isDuplicate = false;
        
        // Normalize 'text' to 'question' if uploaded JSON uses legacy format
        if (item.text && !item.question) {
          item.question = item.text;
          delete item.text;
        }
        // Normalize string 'answer' to index
        if (item.options && typeof item.answer === 'string') {
          const idx = item.options.indexOf(item.answer);
          if (idx !== -1) item.answer = idx;
        }

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

        await addDoc(colRef, {
          ...item,
          level,
          subject,
          chapterId,
          type,
          createdAt: new Date()
        });
        successCount++;
        existingItems.push(item);
      }
      const prevCount = existingCount ?? 0;
      const newTotal = prevCount + successCount;
      
      queryClient.invalidateQueries();
      toast.success(`সফলভাবে আপলোড হয়েছে!\nনতুন যোগ করা হয়েছে: ${successCount}টি\nডুপ্লিকেট স্কিপ করা হয়েছে: ${duplicateCount}টি`);
      setExistingCount(newTotal);
      setJsonText('');
      setTitle(''); setUrl(''); setContent('');
    } catch (error) {
      toast.error('আপলোড করার সময় একটি সমস্যা হয়েছে।');
    }
    setLoading(false);
  };

  return (
    <div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm outline-none">
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="Admission">Admission</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
            <select value={subject} onChange={e => {setSubject(e.target.value); setChapterId('');}} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm outline-none">
              <option value="">সিলেক্ট বিষয়</option>
              {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Chapter</label>
            <select value={chapterId} onChange={e => setChapterId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm outline-none">
              <option value="">সিলেক্ট অধ্যায়</option>
              {availableChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-sm outline-none">
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
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. লেকচার ১: ভূমিকা" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">YouTube / Vimeo URL</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {type === 'note' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Note Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. লেকচার ১ এর নোটস" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Markdown Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="# নোটের শিরোনাম..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono outline-none focus:border-indigo-500" />
            </div>
          </div>
        )}

        {['mcq', 'cq', 'knowledge', 'shortcut'].includes(type) && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-dashed border-indigo-500/50">
              <label className="block text-sm font-bold text-slate-300 mb-2">১. ফাইল আপলোড করুন (.json, .csv)</label>
              <p className="text-xs text-slate-500 mb-4">
                MCQ এর ক্ষেত্রে CSV ফাইলের কলামগুলো এই ক্রমানুসারে থাকতে হবে: <br/>
                <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">question, option1, option2, option3, option4, answer_index(0-3), explanation, imageUrl (optional)</span>
              </p>
              <input 
                type="file" 
                accept=".json,.csv" 
                onChange={handleFileUpload} 
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">২. ডেটা ভেরিফাই করুন (JSON)</label>
              <p className="text-xs text-slate-500 mb-3">ফাইল আপলোড করলে ডেটা এখানে দেখাবে, অথবা আপনি সরাসরি JSON কপি-পেস্ট করতে পারেন।</p>
              <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} placeholder="[ { ... } ]" className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm font-mono outline-none focus:border-indigo-500 shadow-inner" />
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={loading} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />} ডেটা সেভ করুন
        </button>
      </div>
    </div>
  );
}

function QuestionBankList() {
  const queryClient = useQueryClient();
  const [level, setLevel] = useState('HSC');
  const [subject, setSubject] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [type, setType] = useState('video');
  
  const [dbSubjects, setDbSubjects] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Pagination states
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

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

  const handleSearch = async () => {
    if (!subject) return alert("বিষয় সিলেক্ট করুন");
    setLoading(true);
    setHasMore(true);
    try {
      let conditions = [
        where('subject', '==', subject),
        where('type', '==', type)
      ];
      if (chapterId) conditions.push(where('chapterId', '==', chapterId));

      const qRef = query(
        collection(db, 'academic_content'),
        ...conditions,
        limit(ITEMS_PER_PAGE)
      );
      
      const snap = await getDocs(qRef); 
      setItems(snap.docs.map(d => ({ ...d.data(), id: d.id })));

      if (snap.docs.length > 0) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
      }
      if (snap.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      alert("Error loading content");
    }
    setLoading(false);
  };

  const loadMoreItems = async () => {
    if (!lastVisible || loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    try {
      let conditions = [
        where('subject', '==', subject),
        where('type', '==', type)
      ];
      if (chapterId) conditions.push(where('chapterId', '==', chapterId));

      const qRef = query(
        collection(db, 'academic_content'),
        ...conditions,
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      );
      
      const snap = await getDocs(qRef); 
      
      if (snap.docs.length > 0) {
        setLastVisible(snap.docs[snap.docs.length - 1]);
        setItems(prev => [...prev, ...snap.docs.map(d => ({ ...d.data(), id: d.id }))]);
      }
      if (snap.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'academic_content', id));
      setItems(items.filter(q => q.id !== id));
      queryClient.invalidateQueries();
    } catch(e) {
      console.error(e);
    }
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
        alert('Image upload failed: ' + data.error.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
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
      alert("Error saving: " + e.message);
    }
  };

  return (
    <div>
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div>
          <select value={level} onChange={e => {setLevel(e.target.value); setSubject('');}} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
            <option value="SSC">SSC</option>
            <option value="HSC">HSC</option>
            <option value="Admission">Admission</option>
          </select>
        </div>
        <div>
          <select value={subject} onChange={e => {setSubject(e.target.value); setChapterId('');}} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
            <option value="">সিলেক্ট বিষয়</option>
            {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <select value={chapterId} onChange={e => setChapterId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
            <option value="">সব অধ্যায়</option>
            {availableChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm">
            {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 text-sm">
          <Search className="w-4 h-4" /> খুঁজুন
        </button>
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> : (
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-10 text-slate-500">কোনো ডাটা পাওয়া যায়নি।</div>
          ) : (
            <p className="text-sm font-bold text-slate-400 mb-2">এই পেজে {items.length} টি আইটেম দেখাচ্ছে</p>
          )}
          
          {items.map((q, idx) => (
            <div key={q.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 items-center mb-2">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-xs font-bold">#{idx+1}</span>
                    <span className="text-slate-500 text-xs">{q.chapterId}</span>
                  </div>
                  
                  {type === 'video' && (
                    <div>
                      <p className="text-sm text-slate-200 font-bold mb-1">{q.title}</p>
                      <a href={q.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">{q.url}</a>
                    </div>
                  )}

                  {type === 'note' && (
                    <div>
                      <p className="text-sm text-slate-200 font-bold mb-1">{q.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{q.content}</p>
                    </div>
                  )}

                  {['mcq', 'cq', 'knowledge', 'shortcut'].includes(type) && (
                    <div>
                      {type === 'cq' ? (
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
                      {type === 'mcq' && q.options && (
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
                  <button onClick={() => setEditingQ(q)} className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}

          {hasMore && items.length > 0 && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={loadMoreItems} 
                disabled={loadingMore}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                আরও প্রশ্ন লোড করুন (Load More)
              </button>
            </div>
          )}
        </div>
      )}

      {editingQ && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">এডিট করুন</h3>
              <button onClick={() => setEditingQ(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              {editingQ.type === 'video' && (
                <>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Video Title</label>
                    <input type="text" value={editingQ.title || ''} onChange={e => setEditingQ({...editingQ, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Video URL</label>
                    <input type="text" value={editingQ.url || ''} onChange={e => setEditingQ({...editingQ, url: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </>
              )}

              {editingQ.type === 'note' && (
                <>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Note Title</label>
                    <input type="text" value={editingQ.title || ''} onChange={e => setEditingQ({...editingQ, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Markdown Content</label>
                    <textarea value={editingQ.content || ''} onChange={e => setEditingQ({...editingQ, content: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm min-h-[150px]" />
                  </div>
                </>
              )}

              {['mcq', 'cq', 'knowledge', 'shortcut'].includes(editingQ.type) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                        <span>{editingQ.type === 'cq' ? 'উদ্দীপক (Stem - Markdown/LaTeX)' : 'প্রশ্ন (Markdown/LaTeX)'}</span>
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-indigo-500" 
                      />
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <label className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> প্রিভিউ</label>
                      <div className="text-sm text-slate-200">
                        <MarkdownRenderer content={editingQ.type === 'cq' ? (editingQ.stem || '...') : (editingQ.question || '...')} />
                      </div>
                    </div>
                  </div>
                  {editingQ.type === 'cq' && (
                    <div className="mt-4 space-y-6">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-400 mb-3 border-b border-slate-700 pb-2">প্রশ্নসমূহ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['ka', 'kha', 'ga', 'gha'].map(k => (
                            <div key={k}>
                              <label className="text-xs text-slate-400 mb-1 block">প্রশ্ন ({k === 'ka' ? 'ক' : k === 'kha' ? 'খ' : k === 'ga' ? 'গ' : 'ঘ'})</label>
                              <textarea 
                                value={editingQ.questions?.[k] || ''} 
                                onChange={e => setEditingQ({
                                  ...editingQ, 
                                  questions: { ...(editingQ.questions || {}), [k]: e.target.value }
                                })} 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm min-h-[60px]" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2">উত্তরসমূহ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {['ka', 'kha', 'ga', 'gha'].map(k => (
                            <div key={k}>
                              <label className="text-xs text-slate-400 mb-1 block">উত্তর ({k === 'ka' ? 'ক' : k === 'kha' ? 'খ' : k === 'ga' ? 'গ' : 'ঘ'})</label>
                              <textarea 
                                value={editingQ.answers?.[k] || ''} 
                                onChange={e => setEditingQ({
                                  ...editingQ, 
                                  answers: { ...(editingQ.answers || {}), [k]: e.target.value }
                                })} 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm min-h-[100px]" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-slate-400 block">ইমেজ (ঐচ্ছিক)</label>
                      <label className="cursor-pointer bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5">
                        {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                        {uploadingImage ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                        <input type="file" accept="image/*" className="hidden" onChange={uploadToImgBB} disabled={uploadingImage} />
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={editingQ.imageUrl || ''} 
                      onChange={e => handleImageUrlChange(e.target.value)} 
                      placeholder="অথবা Google Drive / ImgBB এর লিংক পেস্ট করুন..." 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none" 
                    />
                    <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-500">
                      <p>💡 <b>Upload Image</b> বাটনে ক্লিক করে সরাসরি পিসি থেকে ছবি যুক্ত করতে পারেন।</p>
                    </div>
                    {editingQ.imageUrl && (
                      <div className="mt-2 flex items-center gap-3 bg-slate-900/50 border border-slate-700 p-2 rounded-lg">
                        <div className="relative inline-block bg-slate-950 p-1 rounded">
                          <img src={editingQ.imageUrl} alt="preview" className="h-16 object-contain rounded" onError={e => e.target.style.display='none'} />
                          <button onClick={() => setEditingQ({...editingQ, imageUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-slate-400 mb-1">যেকোনো টেক্সটবক্সে (যেমন: উত্তর) ছবি দিতে এই মার্কডাউনটি কপি করে পেস্ট করুন:</p>
                          <div className="flex items-center gap-2">
                            <code className="text-[11px] bg-slate-950 px-2 py-1.5 rounded border border-slate-800 flex-1 truncate text-indigo-300">
                              ![image]({editingQ.imageUrl})
                            </code>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`![image](${editingQ.imageUrl})`);
                                toast.success("Markdown কপি হয়েছে! যেকোনো টেক্সটবক্সে পেস্ট করুন।");
                              }}
                              className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded text-xs font-bold transition-colors border border-indigo-500/30 whitespace-nowrap"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingQ.type === 'mcq' && (
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">অপশন সমূহ</label>
                      <div className="space-y-3">
                        {(editingQ.options || ['', '', '', '']).map((opt, i) => (
                          <div key={i} className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <div className="flex gap-3 items-center">
                              <input type="radio" checked={editingQ.answer === i} onChange={() => setEditingQ({...editingQ, answer: i})} className="w-4 h-4 accent-emerald-500" />
                              <input type="text" value={opt} onChange={e => {
                                const newOpts = [...(editingQ.options || [])];
                                newOpts[i] = e.target.value;
                                setEditingQ({...editingQ, options: newOpts});
                              }} placeholder="অপশনের টেক্সট বা LaTeX লিখুন..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                            </div>
                            <div className="ml-7 text-xs text-slate-300">
                              <span className="text-indigo-400/70 mr-2 text-[10px]">প্রিভিউ:</span>
                              <MarkdownRenderer content={opt || '...'} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">ব্যাখ্যা (ঐচ্ছিক)</label>
                      <textarea value={editingQ.explanation || ''} onChange={e => setEditingQ({...editingQ, explanation: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-indigo-500" />
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <label className="text-xs text-indigo-400 mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> প্রিভিউ</label>
                      <div className="text-sm text-slate-200">
                        <MarkdownRenderer content={editingQ.explanation || '...'} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                <button onClick={() => setEditingQ(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold">বাতিল</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex gap-2 items-center"><Check className="w-4 h-4" /> সেভ করুন</button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
