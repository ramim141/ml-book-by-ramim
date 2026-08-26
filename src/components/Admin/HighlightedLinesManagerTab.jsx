import React, { useState, useMemo, useEffect } from 'react';
import {
  Upload, FileText, Download, CheckCircle2, AlertCircle, 
  Trash2, Play, Loader2, Sparkles, Layers, Eye, RefreshCw, 
  Copy, Check, BookOpen, Tag, Code, HelpCircle, Save, Plus, 
  ArrowRight, Edit3, ArrowUp, ArrowDown, Search, X, SlidersHorizontal
} from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import { DEFAULT_ADMISSION_PROGRAMS } from '../../hooks/useAdmissionData';
import { MEDICAL_SUBJECTS_DETAILED } from '../../data/academic/medicalConfig';
import { NURSING_SUBJECTS_CONFIG } from '../../data/academic/nursingConfig';
import toast from 'react-hot-toast';

const SAMPLE_JSON_DATA = [
  {
    "topic": "প্লাজমামেমব্রেনের ফ্লুইড মোজাইক মডেল",
    "lines": [
      "ফ্লুইড মোজাইক মডেল প্রস্তাব করেন সিঙ্গার ও নিকলসন ($1972$)। এটিকে আইসবার্গ মডেলও বলা হয়।",
      "ফসফোলিপিড বাইলেয়ারের রাসায়নিক অনুপাত: $\\text{Lipid} + \\text{Protein}$।",
      "ফসফোলিপিড অণুর মাথা হলো হাইড্রোফিলিক (পানির প্রতি আকৃষ্ট) এবং লেজ হলো হাইড্রোফোবিক।"
    ]
  },
  {
    "topic": "DNA ও RNA এর রাসায়নিক গঠন",
    "lines": [
      "DNA ডাবল হেলিক্সের ব্যাস $2\\text{ nm}$ এবং এক প্যাঁচের দৈর্ঘ্য $3.4\\text{ nm}$।",
      "পিউরিন বেস হলো এডিনিন ($A$) ও গুয়ানিন ($G$); পিরিমিডিন হলো সাইটোসিন ($C$) ও থাইমিন ($T$)।",
      "নাইট্রোজেনাস বেসের হাইড্রোজেন বন্ধন: $A = T$ (২টি) এবং $G \\equiv C$ (৩টি)।"
    ]
  },
  {
    "topic": "মাইটোকন্ড্রিয়া ও কোষীয় শ্বসন",
    "lines": [
      "মাইটোকন্ড্রিয়াকে কোষের পাওয়ার হাউজ বলা হয় (এটিপি উৎপন্ন হয়)।",
      "ক্রেবস চক্র ও ইলেকট্রন ট্রান্সপোর্ট চেইন মাইটোকন্ড্রিয়ায় ঘটে।"
    ]
  }
];

export default function HighlightedLinesManagerTab({
  programId = 'medical',
  programSubjectsMap = {},
  onDataUpdated
}) {
  const queryClient = useQueryClient();

  // Selection states
  const [selectedProgram, setSelectedProgram] = useState(programId || 'medical');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [isCreatingNewChapter, setIsCreatingNewChapter] = useState(false);

  // View Mode: 'crud' (Interactive Visual CRUD) | 'json' (Raw JSON Code) | 'preview' (Live Client Preview)
  const [activeTab, setActiveTab] = useState('crud');

  // Input states & data
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
  const [topicsList, setTopicsList] = useState(SAMPLE_JSON_DATA);
  const [saving, setSaving] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Interactive CRUD state (Editing or Adding Topics / Lines)
  const [editingTopicIdx, setEditingTopicIdx] = useState(null);
  const [editingTopicName, setEditingTopicName] = useState('');

  const [editingLineKey, setEditingLineKey] = useState(null); // `${topicIdx}-${lineIdx}`
  const [editingLineText, setEditingLineText] = useState('');

  const [addingLineToTopicIdx, setAddingLineToTopicIdx] = useState(null);
  const [newLineText, setNewLineText] = useState('');

  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicInitialLine, setNewTopicInitialLine] = useState('');

  // Sync program if passed from parent workspace
  useEffect(() => {
    if (programId) setSelectedProgram(programId);
  }, [programId]);

  // Available subjects
  const availableSubjects = useMemo(() => {
    if (programSubjectsMap && programSubjectsMap[selectedProgram]?.length) {
      return programSubjectsMap[selectedProgram];
    }
    if (selectedProgram === 'medical') return MEDICAL_SUBJECTS_DETAILED;
    if (selectedProgram === 'nursing') return NURSING_SUBJECTS_CONFIG;
    return MEDICAL_SUBJECTS_DETAILED;
  }, [selectedProgram, programSubjectsMap]);

  // Default subject
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const exists = availableSubjects.some(s => s.id === selectedSubject);
      if (!exists) {
        setSelectedSubject(availableSubjects[0].id);
      }
    }
  }, [availableSubjects, selectedSubject]);

  const currentSubjectObj = useMemo(() => {
    return availableSubjects.find(s => s.id === selectedSubject) || availableSubjects[0] || null;
  }, [availableSubjects, selectedSubject]);

  const availablePapers = useMemo(() => {
    if (!currentSubjectObj?.chapters) return [];
    return [...new Set(currentSubjectObj.chapters.map(c => c.paper).filter(Boolean))];
  }, [currentSubjectObj]);

  const availableChapters = useMemo(() => {
    if (!currentSubjectObj?.chapters) return [];
    if (selectedPaper === 'all') return currentSubjectObj.chapters;
    return currentSubjectObj.chapters.filter(c => c.paper === selectedPaper);
  }, [currentSubjectObj, selectedPaper]);

  useEffect(() => {
    if (availableChapters.length > 0 && !isCreatingNewChapter) {
      const exists = availableChapters.some(c => c.id === selectedChapter);
      if (!exists) {
        setSelectedChapter(availableChapters[0].id);
      }
    }
  }, [availableChapters, selectedChapter, isCreatingNewChapter]);

  const currentChapterObj = useMemo(() => {
    return availableChapters.find(c => c.id === selectedChapter) || availableChapters[0] || null;
  }, [availableChapters, selectedChapter]);

  // Load existing topics when active chapter changes
  useEffect(() => {
    if (currentChapterObj && !isCreatingNewChapter) {
      let loadedTopics = [];
      if (Array.isArray(currentChapterObj.topics) && currentChapterObj.topics.length > 0) {
        loadedTopics = currentChapterObj.topics.map((t, idx) => ({
          topic: t.topic || t.name || t.title || `টপিক ${idx + 1}`,
          lines: Array.isArray(t.lines) ? t.lines : Array.isArray(t.keyFacts) ? t.keyFacts : []
        }));
      } else if (Array.isArray(currentChapterObj.keyFacts) && currentChapterObj.keyFacts.length > 0) {
        loadedTopics = [
          {
            topic: (currentChapterObj.highYieldTopics && currentChapterObj.highYieldTopics[0]) || 'দাগানো গুরুত্বপূর্ণ তথ্য',
            lines: currentChapterObj.keyFacts
          }
        ];
      } else {
        loadedTopics = [];
      }

      setTopicsList(loadedTopics);
      setJsonText(JSON.stringify(loadedTopics, null, 2));
    }
  }, [selectedChapter, currentChapterObj, isCreatingNewChapter]);

  // Update JSON text whenever topicsList changes via CRUD actions
  const syncJsonFromTopics = (updatedTopics) => {
    setTopicsList(updatedTopics);
    setJsonText(JSON.stringify(updatedTopics, null, 2));
  };

  // Sync topicsList when jsonText changes in JSON tab
  const handleJsonChange = (newText) => {
    setJsonText(newText);
    try {
      const data = JSON.parse(newText);
      let parsed = [];
      if (Array.isArray(data)) {
        if (data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
          parsed = data.map((item, idx) => ({
            topic: item.topic || item.name || item.title || `টপিক ${idx + 1}`,
            lines: Array.isArray(item.lines) ? item.lines : Array.isArray(item.keyFacts) ? item.keyFacts : []
          }));
        } else if (data.length > 0 && typeof data[0] === 'string') {
          parsed = [{ topic: 'দাগানো তথ্য', lines: data }];
        }
      } else if (typeof data === 'object' && Array.isArray(data.topics)) {
        parsed = data.topics.map((t, idx) => ({
          topic: t.topic || t.name || t.title || `টপিক ${idx + 1}`,
          lines: Array.isArray(t.lines) ? t.lines : []
        }));
      }
      setTopicsList(parsed);
    } catch {
      // Invalid JSON typing in progress
    }
  };

  // Parsing error validator
  const { parseError, totalLinesCount } = useMemo(() => {
    try {
      JSON.parse(jsonText);
      const total = topicsList.reduce((acc, t) => acc + (t.lines?.length || 0), 0);
      return { parseError: null, totalLinesCount: total };
    } catch (err) {
      return { parseError: err.message, totalLinesCount: 0 };
    }
  }, [jsonText, topicsList]);

  // ─── CRUD ACTIONS: TOPICS ────────────────────────────────────────────────
  const handleCreateTopic = () => {
    if (!newTopicName.trim()) {
      toast.error('টপিকের নাম লিখুন!');
      return;
    }
    const lines = newTopicInitialLine.trim() 
      ? newTopicInitialLine.split('\n').map(l => l.trim()).filter(Boolean)
      : [];

    const updated = [...topicsList, { topic: newTopicName.trim(), lines }];
    syncJsonFromTopics(updated);
    setNewTopicName('');
    setNewTopicInitialLine('');
    setIsAddingNewTopic(false);
    toast.success('নতুন টপিক যোগ করা হয়েছে! 🎯');
  };

  const handleStartEditTopic = (idx) => {
    setEditingTopicIdx(idx);
    setEditingTopicName(topicsList[idx]?.topic || '');
  };

  const handleSaveTopicName = (idx) => {
    if (!editingTopicName.trim()) {
      toast.error('টপিকের নাম খালি রাখা যাবে না');
      return;
    }
    const updated = topicsList.map((t, i) => i === idx ? { ...t, topic: editingTopicName.trim() } : t);
    syncJsonFromTopics(updated);
    setEditingTopicIdx(null);
    toast.success('টপিকের নাম আপডেট হয়েছে!');
  };

  const handleDeleteTopic = (idx) => {
    const topicToDelete = topicsList[idx];
    if (window.confirm(`আপনি কি নিশ্চিত যে '${topicToDelete.topic}' টপিক এবং এর সকল লাইন ডিলিট করতে চান?`)) {
      const updated = topicsList.filter((_, i) => i !== idx);
      syncJsonFromTopics(updated);
      toast.success('টপিক ডিলিট হয়েছে!');
    }
  };

  // ─── CRUD ACTIONS: LINES ─────────────────────────────────────────────────
  const handleAddLineToTopic = (topicIdx) => {
    if (!newLineText.trim()) {
      toast.error('দাগানো লাইনের বিবরণ লিখুন');
      return;
    }
    const linesToAdd = newLineText.split('\n').map(l => l.trim()).filter(Boolean);
    const updated = topicsList.map((t, i) => {
      if (i !== topicIdx) return t;
      return {
        ...t,
        lines: [...(t.lines || []), ...linesToAdd]
      };
    });
    syncJsonFromTopics(updated);
    setNewLineText('');
    setAddingLineToTopicIdx(null);
    toast.success(`${linesToAdd.length}টি দাগানো লাইন যোগ হয়েছে! 🚀`);
  };

  const handleStartEditLine = (topicIdx, lineIdx) => {
    setEditingLineKey(`${topicIdx}-${lineIdx}`);
    setEditingLineText(topicsList[topicIdx]?.lines?.[lineIdx] || '');
  };

  const handleSaveEditedLine = (topicIdx, lineIdx) => {
    if (!editingLineText.trim()) {
      toast.error('লাইনের তথ্য খালি রাখা যাবে না');
      return;
    }
    const updated = topicsList.map((t, tI) => {
      if (tI !== topicIdx) return t;
      const newLines = [...(t.lines || [])];
      newLines[lineIdx] = editingLineText.trim();
      return { ...t, lines: newLines };
    });
    syncJsonFromTopics(updated);
    setEditingLineKey(null);
    toast.success('লাইন আপডেট হয়েছে!');
  };

  const handleDeleteLine = (topicIdx, lineIdx) => {
    const updated = topicsList.map((t, tI) => {
      if (tI !== topicIdx) return t;
      return {
        ...t,
        lines: (t.lines || []).filter((_, lI) => lI !== lineIdx)
      };
    });
    syncJsonFromTopics(updated);
    toast.success('লাইন ডিলিট হয়েছে');
  };

  const handleMoveLine = (topicIdx, lineIdx, direction) => {
    const topic = topicsList[topicIdx];
    if (!topic || !topic.lines) return;
    const targetIdx = direction === 'up' ? lineIdx - 1 : lineIdx + 1;
    if (targetIdx < 0 || targetIdx >= topic.lines.length) return;

    const newLines = [...topic.lines];
    const temp = newLines[lineIdx];
    newLines[lineIdx] = newLines[targetIdx];
    newLines[targetIdx] = temp;

    const updated = topicsList.map((t, tI) => tI === topicIdx ? { ...t, lines: newLines } : t);
    syncJsonFromTopics(updated);
  };

  // Helper snippet inserter into active textarea
  const insertSnippet = (snippet, targetStateSetter, currentState) => {
    targetStateSetter(currentState ? `${currentState} ${snippet}` : snippet);
  };

  // ─── FILE EXPORT / IMPORT ────────────────────────────────────────────────
  const handleExportJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highlighted_lines_${selectedProgram}_${selectedSubject}_${selectedChapter || 'chapter'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON ব্যাকআপ ডাউনলোড হয়েছে! 📥');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        handleJsonChange(text);
        toast.success(`'${file.name}' ফাইল থেকে লোড হয়েছে!`);
      } catch {
        toast.error('ফাইল পড়তে সমস্যা হয়েছে');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    syncJsonFromTopics(SAMPLE_JSON_DATA);
    toast.success('নমুনা JSON লোড হয়েছে! 🎉');
  };

  const handleClearChapter = () => {
    if (window.confirm('আপনি কি এই অধ্যায়ের সকল টপিক ও দাগানো লাইন ক্লিয়ার করতে চান?')) {
      syncJsonFromTopics([]);
      toast.success('সকল টপিক ক্লিয়ার করা হয়েছে');
    }
  };

  // ─── SAVE TO FIRESTORE ────────────────────────────────────────────────────
  const handleSaveToFirestore = async () => {
    if (topicsList.length === 0) {
      toast.error('কমপক্ষে ১টি টপিক ও দাগানো লাইন যোগ করুন!');
      return;
    }

    if (isCreatingNewChapter && !newChapterName.trim()) {
      toast.error('নতুন অধ্যায়ের নাম লিখুন!');
      return;
    }

    if (!isCreatingNewChapter && !currentChapterObj) {
      toast.error('অনুগ্রহ করে একটি অধ্যায় নির্বাচন করুন!');
      return;
    }

    setSaving(true);
    try {
      const targetChapterId = isCreatingNewChapter 
        ? `${selectedSubject}-ch-${Date.now().toString().slice(-5)}`
        : currentChapterObj.id;

      const targetChapterName = isCreatingNewChapter
        ? newChapterName.trim()
        : currentChapterObj.name;

      const paperVal = (selectedPaper !== 'all' ? selectedPaper : (availablePapers[0] || '১ম পত্র'));

      const highYieldTopicsList = topicsList.map(t => t.topic);
      const allFactsFlat = [];
      topicsList.forEach(t => {
        (t.lines || []).forEach(line => {
          allFactsFlat.push(`[${t.topic}] ${line}`);
        });
      });

      // 1. Update program subjects config in Firestore
      const docName = selectedProgram === 'medical' ? 'medical_config' : `${selectedProgram}_config`;
      const configRef = doc(db, 'admin_settings', docName);
      const snap = await getDoc(configRef);

      let currentSubjectsList = availableSubjects;
      if (snap.exists() && snap.data().subjects) {
        currentSubjectsList = snap.data().subjects;
      }

      const updatedSubjects = currentSubjectsList.map(subj => {
        if (subj.id !== selectedSubject) return subj;

        const existingChaps = subj.chapters || [];
        const chapIndex = existingChaps.findIndex(c => c.id === targetChapterId);

        const newChapData = {
          id: targetChapterId,
          paper: paperVal,
          name: targetChapterName,
          highYieldTopics: highYieldTopicsList,
          topics: topicsList.map(t => ({ name: t.topic, lines: t.lines })),
          keyFacts: allFactsFlat,
          repeatedQuestionsCount: currentChapterObj?.repeatedQuestionsCount || 0
        };

        let updatedChaps = [];
        if (chapIndex >= 0) {
          updatedChaps = [...existingChaps];
          updatedChaps[chapIndex] = { ...updatedChaps[chapIndex], ...newChapData };
        } else {
          updatedChaps = [...existingChaps, newChapData];
        }

        return {
          ...subj,
          chapters: updatedChaps
        };
      });

      await setDoc(configRef, {
        subjects: updatedSubjects,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Also write dedicated document to highlighted_lines collection
      const lineDocId = `${selectedProgram}_${selectedSubject}_${targetChapterId}`;
      await setDoc(doc(db, 'highlighted_lines', lineDocId), {
        programId: selectedProgram,
        subjectId: selectedSubject,
        chapterId: targetChapterId,
        chapterName: targetChapterName,
        paper: paperVal,
        topics: topicsList.map(t => ({ name: t.topic, lines: t.lines })),
        totalLines: totalLinesCount,
        updatedAt: new Date().toISOString()
      });

      // Invalidate queries so client UI updates in real-time
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'medical_config'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'nursing_config'] });
      queryClient.invalidateQueries({ queryKey: ['highlighted_lines_questions'] });

      toast.success('হাইলাইটেড টপিক ও দাগানো লাইন সফলভাবে পাবলিশ হয়েছে! 🚀');
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error('Error saving highlighted lines:', err);
      toast.error('আপলোড ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered topics for search
  const filteredTopics = useMemo(() => {
    if (!searchFilter.trim()) return topicsList;
    const query = searchFilter.toLowerCase();
    return topicsList.filter(t => 
      t.topic.toLowerCase().includes(query) || 
      (t.lines || []).some(l => l.toLowerCase().includes(query))
    );
  }, [topicsList, searchFilter]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* ── Top Header Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>বুক হাইলাইটেড লাইনস ও টপিক CRUD ম্যানেজার</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                LaTeX Enabled
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              অধ্যায় নির্বাচন করে সরাসরি টপিক ও দাগানো লাইনস তৈরি (Create), সম্পাদনা (Edit), ডিলিট (Delete) বা JSON এডিট করুন।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportJson}
            disabled={topicsList.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            title="JSON এক্সপোর্ট করুন"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>এক্সপোর্ট</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>নমুনা</span>
          </button>

          <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-rose-400" />
            <span>আপলোড</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleSaveToFirestore}
            disabled={saving || topicsList.length === 0 || !!parseError}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>সংরক্ষণ...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>পাবলিশ করুন ({totalLinesCount}টি লাইন)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Cascading Selectors: Track ➔ Subject ➔ Paper ➔ Chapter ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-white/[0.08] shadow-lg">
        
        {/* 1. Exam Track */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            পরীক্ষার ট্র্যাক:
          </label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500 transition"
          >
            {DEFAULT_ADMISSION_PROGRAMS.map(p => (
              <option key={p.id} value={p.id}>{p.emoji} {p.title.split(' (')[0]}</option>
            ))}
          </select>
        </div>

        {/* 2. Subject */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            বিষয়:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500 transition"
          >
            {availableSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.name?.split(' (')[0]}</option>
            ))}
          </select>
        </div>

        {/* 3. Paper */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
            পত্র:
          </label>
          <select
            value={selectedPaper}
            onChange={(e) => setSelectedPaper(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500 transition"
          >
            <option value="all">সকল পত্র</option>
            {availablePapers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 4. Chapter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              অধ্যায়:
            </label>
            <button
              type="button"
              onClick={() => setIsCreatingNewChapter(!isCreatingNewChapter)}
              className="text-[10.5px] text-rose-400 hover:underline font-bold"
            >
              {isCreatingNewChapter ? 'তালিকা থেকে' : '+ নতুন অধ্যায়'}
            </button>
          </div>

          {isCreatingNewChapter ? (
            <input
              type="text"
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              placeholder="যেমন: অধ্যায় ১: কোষ ও এর গঠন"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/50 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          ) : (
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500 transition"
            >
              {availableChapters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

      </div>

      {/* ── 3. Tabs Bar: [Interactive Visual CRUD] | [JSON Code Mode] | [Live Student Preview] ── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('crud')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'crud'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ইন্টারঅ্যাক্টিভ CRUD এডিটর</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-mono">
              {topicsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'json'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>সরাসরি JSON কোড</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'preview'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>শিক্ষার্থী ভিউ প্রিভিউ</span>
          </button>
        </div>

        {activeTab === 'crud' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNewTopic(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন টপিক যোগ করুন</span>
            </button>

            {topicsList.length > 0 && (
              <button
                type="button"
                onClick={handleClearChapter}
                className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition flex items-center gap-1"
                title="সকল লাইন ক্লিয়ার করুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 4. TAB CONTENT: INTERACTIVE VISUAL CRUD ───────────────────────── */}
      {activeTab === 'crud' && (
        <div className="space-y-4">
          
          {/* Quick Search & Summary */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="টপিক বা কোনো দাগানো লাইন খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 justify-between sm:justify-end">
              <span>মোট টপিক: <strong className="text-white">{topicsList.length}টি</strong></span>
              <span>•</span>
              <span>মোট দাগানো লাইন: <strong className="text-rose-400">{totalLinesCount}টি</strong></span>
            </div>
          </div>

          {/* New Topic Creation Modal / Drawer Form */}
          {isAddingNewTopic && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                  <Plus className="w-4 h-4" />
                  <span>নতুন টপিক ও প্রাথমিক দাগানো লাইন যুক্ত করুন</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNewTopic(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  টপিকের নাম:*
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="যেমন: সাইটোপ্লাজমীয় অঙ্গাণু ও তাদের কাজ"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    দাগানো লাইনসমূহ (প্রতি লাইনে ১টি):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">LaTeX শর্টকাট:</span>
                    <button
                      type="button"
                      onClick={() => insertSnippet('$\\text{}$', setNewTopicInitialLine, newTopicInitialLine)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      \text
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet('$\\frac{a}{b}$', setNewTopicInitialLine, newTopicInitialLine)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      \frac
                    </button>
                  </div>
                </div>

                <textarea
                  value={newTopicInitialLine}
                  onChange={(e) => setNewTopicInitialLine(e.target.value)}
                  placeholder="দাগানো লাইন ১ $LaTeX$\nদাগানো লাইন ২\nদাগানো লাইন ৩"
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-sans placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNewTopic(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleCreateTopic}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>টপিক তৈরি সম্পন্ন করুন</span>
                </button>
              </div>
            </div>
          )}

          {/* Topics List with Interactive Lines CRUD */}
          {filteredTopics.length > 0 ? (
            <div className="space-y-4">
              {filteredTopics.map((topic, tIdx) => {
                const actualTopicIdx = topicsList.indexOf(topic);
                const isEditingThisTopic = editingTopicIdx === actualTopicIdx;
                const isAddingLineHere = addingLineToTopicIdx === actualTopicIdx;

                return (
                  <div
                    key={actualTopicIdx}
                    className="rounded-2xl border border-slate-800/90 bg-slate-900/80 shadow-lg overflow-hidden transition-all hover:border-slate-700/80"
                  >
                    {/* Topic Header */}
                    <div className="p-3.5 sm:p-4 bg-slate-950/70 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      
                      {/* Topic Title (or Edit Form) */}
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>

                        {isEditingThisTopic ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingTopicName}
                              onChange={(e) => setEditingTopicName(e.target.value)}
                              className="px-3 py-1 rounded-lg bg-slate-900 border border-rose-500 text-xs font-bold text-white flex-1 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveTopicName(actualTopicIdx)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> সেভ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTopicIdx(null)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-sm font-black text-rose-200 truncate">
                              {actualTopicIdx + 1}. {topic.topic}
                            </h3>
                            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono shrink-0">
                              {(topic.lines || []).length}টি লাইন
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Topic Actions */}
                      {!isEditingThisTopic && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setAddingLineToTopicIdx(actualTopicIdx);
                              setNewLineText('');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 transition"
                            title="এই টপিকে নতুন দাগানো লাইন যোগ করুন"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ লাইন</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditTopic(actualTopicIdx)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                            title="টপিকের নাম সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTopic(actualTopicIdx)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition"
                            title="সম্পূর্ণ টপিক ডিলিট করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Inline Add Line Form */}
                    {isAddingLineHere && (
                      <div className="p-3.5 bg-slate-950 border-b border-emerald-500/30 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            <span>টপিক: {topic.topic}-এ নতুন দাগানো লাইন যুক্ত করুন</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">LaTeX:</span>
                            <button
                              type="button"
                              onClick={() => insertSnippet('$\\text{}$', setNewLineText, newLineText)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              \text
                            </button>
                            <button
                              type="button"
                              onClick={() => insertSnippet('$\\frac{a}{b}$', setNewLineText, newLineText)}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              \frac
                            </button>
                          </div>
                        </div>

                        <textarea
                          value={newLineText}
                          onChange={(e) => setNewLineText(e.target.value)}
                          placeholder="দাগানো তথ্য এখানে লিখুন... LaTeX সূত্রের জন্য $...$ ব্যবহার করুন। একাধিক লাইন লিখলে প্রতি লাইন আলাদা তথ্য হিসেবে যুক্ত হবে।"
                          rows={3}
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-xs text-white focus:outline-none"
                          autoFocus
                        />

                        {newLineText.trim() && (
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                            <span className="text-[10px] text-slate-500 block mb-1">লাইভ LaTeX প্রিভিউ:</span>
                            <MarkdownRenderer content={newLineText} />
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAddingLineToTopicIdx(null)}
                            className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddLineToTopic(actualTopicIdx)}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>যোগ করুন</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lines List */}
                    <div className="p-3.5 sm:p-4 space-y-2">
                      {topic.lines && topic.lines.length > 0 ? (
                        topic.lines.map((line, lIdx) => {
                          const isEditingThisLine = editingLineKey === `${actualTopicIdx}-${lIdx}`;

                          return (
                            <div
                              key={lIdx}
                              className={`p-3 rounded-xl border transition-all ${
                                isEditingThisLine
                                  ? 'bg-slate-950 border-rose-500/50 space-y-2'
                                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3'
                              }`}
                            >
                              {isEditingThisLine ? (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-rose-300">লাইন সম্পাদনা ({lIdx + 1})</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => insertSnippet('$\\text{}$', setEditingLineText, editingLineText)}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                                      >
                                        \text
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => insertSnippet('$\\frac{a}{b}$', setEditingLineText, editingLineText)}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                                      >
                                        \frac
                                      </button>
                                    </div>
                                  </div>

                                  <textarea
                                    value={editingLineText}
                                    onChange={(e) => setEditingLineText(e.target.value)}
                                    rows={3}
                                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
                                    autoFocus
                                  />

                                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                                    <span className="text-[10px] text-slate-500 block mb-0.5">প্রিভিউ:</span>
                                    <MarkdownRenderer content={editingLineText} />
                                  </div>

                                  <div className="flex items-center justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingLineKey(null)}
                                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                                    >
                                      বাতিল
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditedLine(actualTopicIdx, lIdx)}
                                      className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>আপডেট করুন</span>
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10.5px] flex items-center justify-center shrink-0 mt-0.5">
                                      {lIdx + 1}
                                    </span>
                                    <div className="text-xs text-slate-200 leading-relaxed min-w-0 flex-1">
                                      <MarkdownRenderer content={line} />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveLine(actualTopicIdx, lIdx, 'up')}
                                      disabled={lIdx === 0}
                                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                                      title="উপরে নিন"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveLine(actualTopicIdx, lIdx, 'down')}
                                      disabled={lIdx === topic.lines.length - 1}
                                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                                      title="নিচে নিন"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditLine(actualTopicIdx, lIdx)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                                      title="সম্পাদনা করুন"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLine(actualTopicIdx, lIdx)}
                                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs transition"
                                      title="লাইন মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                          এই টপিকে কোনো দাগানো লাইন নেই। "+ লাইন" বাটনে ক্লিক করে তথ্য যোগ করুন।
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 rounded-2xl bg-slate-950/50 border border-slate-800/80">
              <BookOpen className="w-10 h-10 mx-auto text-slate-600" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-300">কোনো টপিক পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchFilter ? 'অনুসন্ধানের সাথে মিল রেখে কোনো টপিক বা লাইন পাওয়া যায়নি।' : 'উপরে "+ নতুন টপিক যোগ করুন" বাটনে ক্লিক করে টপিক ও দাগানো লাইন যুক্ত করুন।'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewTopic(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>প্রথম টপিক তৈরি করুন</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* ── 5. TAB CONTENT: RAW JSON CODE EDITOR ─────────────────────────── */}
      {activeTab === 'json' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: JSON Editor */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Code className="w-4 h-4 text-rose-400" />
                <span>JSON ডেটা ইনপুট এরিয়া</span>
              </div>

              {parseError ? (
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>JSON সিনট্যাক্স ত্রুটি</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{topicsList.length}টি টপিক • {totalLinesCount}টি লাইন</span>
                </span>
              )}
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder={`[\n  {\n    "topic": "টপিক নাম",\n    "lines": [\n      "দাগানো লাইন ১ $LaTeX$",\n      "দাগানো লাইন ২"\n    ]\n  }\n]`}
              rows={18}
              className={`w-full p-4 rounded-2xl bg-slate-950 border font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition leading-relaxed shadow-inner ${
                parseError ? 'border-red-500/70 focus:border-red-500' : 'border-slate-800 focus:border-rose-500'
              }`}
            />

            {parseError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>ত্রুটির বিবরণ: {parseError}</span>
              </div>
            )}
          </div>

          {/* Right: Live Parser Preview */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Eye className="w-4 h-4 text-rose-400" />
                <span>লাইভ স্ট্রাকচার প্রিভিউ</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                অধ্যায়: {currentChapterObj?.name || 'সিলেক্টেড নেই'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-[440px] overflow-y-auto space-y-3.5 custom-scrollbar shadow-inner">
              {topicsList.length > 0 ? (
                topicsList.map((topic, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-black text-rose-300 truncate">{topic.topic}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{topic.lines?.length || 0}টি লাইন</span>
                    </div>

                    <div className="space-y-1.5">
                      {(topic.lines || []).map((line, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60 text-xs text-slate-200 leading-relaxed">
                          <MarkdownRenderer content={line} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center space-y-2 text-slate-500 text-xs">
                  <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
                  <p>বামে JSON ইনপুট দিলে এখানে লাইভ KaTeX প্রিভিউ প্রদর্শিত হবে</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── 6. TAB CONTENT: LIVE STUDENT PREVIEW ─────────────────────────── */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold text-white">
                {currentChapterObj?.name || 'সিলেক্টেড অধ্যায়'} — শিক্ষার্থী ভিউ
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {totalLinesCount}টি দাগানো লাইন
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {topicsList.map((topic, tIdx) => (
              <div key={tIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-white">{topic.topic}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {(topic.lines || []).length}টি তথ্য
                  </span>
                </div>

                <div className="space-y-2">
                  {(topic.lines || []).map((line, lIdx) => (
                    <div key={lIdx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-[13px] text-slate-200 leading-relaxed flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {lIdx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <MarkdownRenderer content={line} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
