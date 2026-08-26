import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Sparkles, Search, ChevronDown, ChevronRight,
  Play, BookCheck, Layers, Dna, FlaskConical, Zap, Globe, Stethoscope,
  Cpu, HeartPulse, Check, Bookmark, Filter, BookMarked, Award, Copy,
  CheckCircle2, BookmarkCheck, Eye, Compass, Leaf, RotateCcw,
  CheckCheck, FileText, CheckCircle, Highlighter, SlidersHorizontal, X, Menu,
  Maximize2, Minimize2, ChevronUp, Flame, CheckSquare, Square, Share2,
  Book, Hash, ListOrdered, Tag, Target, LayoutGrid
} from 'lucide-react';
import { MEDICAL_SUBJECTS_DETAILED } from '../../../data/academic/medicalConfig';
import { NURSING_SUBJECTS_CONFIG, NURSING_TRACKS } from '../../../data/academic/nursingConfig';
import { useMedicalConfig } from '../../../hooks/useAdmissionData';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { normalizeChapterKey } from '../QuestionBuilder/useBuilderQuestions';
import MarkdownRenderer from '../../../components/UI/MarkdownRenderer';
import toast from 'react-hot-toast';

// ─── Program Themes & Configuration ──────────────────────────────────────────

const PROGRAM_THEMES = {
  medical: {
    name: 'মেডিকেল ও ডেন্টাল',
    shortName: 'মেডিকেল',
    backPath: '/academic/admission/medical',
    icon: Stethoscope,
    accent: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      from: 'from-rose-500',
      to: 'to-pink-600',
      activeTab: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    defaultExamType: 'MBBS',
    defaultSession: '2023-2024',
  },
  nursing: {
    name: 'নার্সিং ও মিডওয়াইফারি',
    shortName: 'নার্সিং',
    backPath: '/academic/admission/nursing',
    icon: HeartPulse,
    accent: {
      text: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30',
      from: 'from-teal-500',
      to: 'to-emerald-600',
      activeTab: 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/25',
      badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    },
    defaultExamType: 'BSc Nursing',
    defaultSession: '2023-2024',
  },
  engineering: {
    name: 'ইঞ্জিনিয়ারিং',
    shortName: 'ইঞ্জিনিয়ারিং',
    backPath: '/academic/admission/engineering',
    icon: Cpu,
    accent: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      from: 'from-blue-500',
      to: 'to-indigo-600',
      activeTab: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    },
    defaultExamType: 'BUET',
    defaultSession: '2023-2024',
  },
  'varsity-a': {
    name: 'ভার্সিটি ক-ইউনিট',
    shortName: 'ভার্সিটি ক',
    backPath: '/academic/admission/varsity-a',
    icon: BookCheck,
    accent: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
      from: 'from-indigo-500',
      to: 'to-purple-600',
      activeTab: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    defaultExamType: 'DU-A',
    defaultSession: '2023-2024',
  },
  gst: {
    name: 'GST গুচ্ছ',
    shortName: 'GST',
    backPath: '/academic/admission/gst',
    icon: FlaskConical,
    accent: {
      text: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/30',
      from: 'from-fuchsia-500',
      to: 'to-pink-600',
      activeTab: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-500/25',
      badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    },
    defaultExamType: 'GST',
    defaultSession: '2023-2024',
  },
  agri: {
    name: 'কৃষি বিশ্ববিদ্যালয়',
    shortName: 'কৃষি',
    backPath: '/academic/admission/agri',
    icon: Leaf,
    accent: {
      text: 'text-lime-400',
      bg: 'bg-lime-500/10',
      border: 'border-lime-500/30',
      from: 'from-lime-500',
      to: 'to-green-600',
      activeTab: 'bg-gradient-to-r from-lime-600 to-green-600 text-white shadow-md shadow-lime-500/25',
      badge: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
    },
    defaultExamType: 'BAU',
    defaultSession: '2023-2024',
  },
  'varsity-others': {
    name: 'ভার্সিটি অন্যান্য ইউনিট',
    shortName: 'ভার্সিটি B/C/D',
    backPath: '/academic/admission/varsity-others',
    icon: Globe,
    accent: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      from: 'from-amber-500',
      to: 'to-orange-600',
      activeTab: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    defaultExamType: 'DU-B',
    defaultSession: '2023-2024',
  },
};

/**
 * Intelligent Helper to parse Chapter into Topic -> Important Lines Hierarchy
 */
function parseChapterTopics(chapter) {
  if (!chapter) return [];

  // Case 1: Chapter already has explicit topics structure
  if (Array.isArray(chapter.topics) && chapter.topics.length > 0) {
    return chapter.topics.map((t, idx) => ({
      id: t.id || `topic-${idx}`,
      name: t.name || t.title || `টপিক ${idx + 1}`,
      lines: Array.isArray(t.lines) ? t.lines : Array.isArray(t.keyFacts) ? t.keyFacts : []
    }));
  }

  const rawFacts = Array.isArray(chapter.keyFacts)
    ? chapter.keyFacts
    : typeof chapter.keyFacts === 'string'
      ? chapter.keyFacts.split('\n').filter(Boolean)
      : [];

  const highYieldTopics = Array.isArray(chapter.highYieldTopics)
    ? chapter.highYieldTopics
    : typeof chapter.highYieldTopics === 'string'
      ? chapter.highYieldTopics.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  const topicMap = new Map();
  const unassignedLines = [];

  rawFacts.forEach((fact) => {
    const trimmed = (fact || '').trim();
    if (!trimmed) return;

    // Pattern 1: [টপিক নাম] গুরুত্বপূর্ণ তথ্য
    const bracketMatch = trimmed.match(/^\[(.*?)\]\s*(.*)$/);
    if (bracketMatch) {
      const topicName = bracketMatch[1].trim();
      const content = bracketMatch[2].trim();
      if (!topicMap.has(topicName)) topicMap.set(topicName, []);
      topicMap.get(topicName).push(content || trimmed);
      return;
    }

    // Pattern 2: টপিক নাম: গুরুত্বপূর্ণ তথ্য
    const colonMatch = trimmed.match(/^([^:\n]{3,35}):\s*(.*)$/);
    if (colonMatch && highYieldTopics.some(t => t.toLowerCase().includes(colonMatch[1].toLowerCase()) || colonMatch[1].toLowerCase().includes(t.toLowerCase()))) {
      const topicName = colonMatch[1].trim();
      const content = colonMatch[2].trim();
      if (!topicMap.has(topicName)) topicMap.set(topicName, []);
      topicMap.get(topicName).push(content || trimmed);
      return;
    }

    // Pattern 3: Fuzzy keyword match with highYieldTopics
    let matchedTopic = null;
    for (const t of highYieldTopics) {
      const keywords = t.split(/[\s,()\-]+/).filter(w => w.length > 2);
      if (keywords.some(k => trimmed.toLowerCase().includes(k.toLowerCase()))) {
        matchedTopic = t;
        break;
      }
    }

    if (matchedTopic) {
      if (!topicMap.has(matchedTopic)) topicMap.set(matchedTopic, []);
      topicMap.get(matchedTopic).push(trimmed);
    } else {
      unassignedLines.push(trimmed);
    }
  });

  const parsedTopics = [];

  // Add matched topics
  topicMap.forEach((lines, name) => {
    parsedTopics.push({
      id: `topic-${parsedTopics.length}`,
      name,
      lines
    });
  });

  // Check remaining highYieldTopics
  highYieldTopics.forEach((t) => {
    if (!topicMap.has(t)) {
      const linesForThis = [];
      const remaining = [];
      unassignedLines.forEach((l) => {
        const keywords = t.split(/[\s,()\-]+/).filter(w => w.length > 2);
        if (keywords.some(k => l.toLowerCase().includes(k.toLowerCase()))) {
          linesForThis.push(l);
        } else {
          remaining.push(l);
        }
      });
      if (linesForThis.length > 0) {
        parsedTopics.push({
          id: `topic-${parsedTopics.length}`,
          name: t,
          lines: linesForThis
        });
      }
    }
  });

  // Remaining unassigned lines
  if (unassignedLines.length > 0) {
    parsedTopics.push({
      id: `topic-general`,
      name: parsedTopics.length === 0 ? 'গুরুত্বপূর্ণ দাগানো তথ্য' : 'অন্যান্য হাই-ইয়েল্ড পয়েন্ট',
      lines: unassignedLines
    });
  }

  // If no lines at all, still return high-yield topics as guide
  if (parsedTopics.length === 0 && highYieldTopics.length > 0) {
    return highYieldTopics.map((t, idx) => ({
      id: `topic-${idx}`,
      name: t,
      lines: []
    }));
  }

  return parsedTopics;
}

export default function HighlightedLinesPage() {
  const { trackId } = useParams();
  const location = useLocation();

  // 1. Program Auto-Detection
  const programKey = useMemo(() => {
    const p = location.pathname;
    if (p.includes('/medical')) return 'medical';
    if (p.includes('/nursing')) return 'nursing';
    if (p.includes('/engineering')) return 'engineering';
    if (p.includes('/varsity-a')) return 'varsity-a';
    if (p.includes('/gst')) return 'gst';
    if (p.includes('/agri')) return 'agri';
    if (p.includes('/varsity-others')) return 'varsity-others';
    return 'medical';
  }, [location.pathname]);

  const theme = PROGRAM_THEMES[programKey] || PROGRAM_THEMES.medical;

  // Nursing track resolution
  const activeNursingTrack = useMemo(() => {
    if (programKey !== 'nursing') return null;
    return NURSING_TRACKS.find(t => t.id === trackId) || NURSING_TRACKS[0];
  }, [programKey, trackId]);

  const backPath = useMemo(() => {
    if (programKey === 'nursing' && trackId) {
      return `/academic/admission/nursing/${trackId}`;
    }
    return theme.backPath;
  }, [programKey, trackId, theme.backPath]);

  // 2. Fetch live subject data from Firestore
  const { data: dynamicMedicalSubjects } = useMedicalConfig();

  const subjectsList = useMemo(() => {
    if (programKey === 'medical') {
      return dynamicMedicalSubjects && dynamicMedicalSubjects.length > 0
        ? dynamicMedicalSubjects
        : MEDICAL_SUBJECTS_DETAILED;
    }
    if (programKey === 'nursing') {
      if (activeNursingTrack) {
        return NURSING_SUBJECTS_CONFIG.filter(s =>
          s.applicableTracks?.includes(activeNursingTrack.id)
        );
      }
      return NURSING_SUBJECTS_CONFIG;
    }
    return MEDICAL_SUBJECTS_DETAILED;
  }, [programKey, dynamicMedicalSubjects, activeNursingTrack]);

  // 3. UI States
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedPaperFilter, setSelectedPaperFilter] = useState('all');
  const [selectedChapterId, setSelectedChapterId] = useState(''); // active selected chapter ID
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set()); // Set of selected topic IDs
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('book'); // 'book' | 'grid' | 'accordion'
  const [fontSize, setFontSize] = useState('normal'); // 'small' | 'normal' | 'large'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'unmastered' | 'mastered'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Collapse / Expand states
  const [collapsedTopics, setCollapsedTopics] = useState(new Set());

  // Mastered lines tracker (Stored in localStorage)
  const [masteredLines, setMasteredLines] = useState(() => {
    try {
      const saved = localStorage.getItem(`mastered_lines_${programKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleMasteredLine = (lineKey) => {
    setMasteredLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineKey)) {
        next.delete(lineKey);
        toast('পড়া বাকি হিসেবে চিহ্নিত করা হয়েছে', { icon: '⏳' });
      } else {
        next.add(lineKey);
        toast.success('পড়া সম্পন্ন হয়েছে! 🎉', { icon: '✅' });
      }
      try {
        localStorage.setItem(`mastered_lines_${programKey}`, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const handleCopyLine = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('তথ্যটি কপি করা হয়েছে!', { icon: '📋', duration: 2000 });
  };

  const toggleTopicCollapse = (topicKey) => {
    setCollapsedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicKey)) {
        next.delete(topicKey);
      } else {
        next.add(topicKey);
      }
      return next;
    });
  };

  // Set default subject on load
  useEffect(() => {
    if (subjectsList.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjectsList[0].id);
    }
  }, [subjectsList, selectedSubjectId]);

  // Active Subject
  const currentSubject = useMemo(() => {
    return subjectsList.find(s => s.id === selectedSubjectId) || subjectsList[0] || null;
  }, [subjectsList, selectedSubjectId]);

  // Papers in current subject
  const availablePapers = useMemo(() => {
    if (!currentSubject?.chapters) return [];
    return [...new Set(currentSubject.chapters.map(c => c.paper).filter(Boolean))];
  }, [currentSubject]);

  // Available chapters in current subject & selected paper
  const currentPaperChapters = useMemo(() => {
    if (!currentSubject?.chapters) return [];
    if (selectedPaperFilter === 'all') return currentSubject.chapters;
    return currentSubject.chapters.filter(c => c.paper === selectedPaperFilter);
  }, [currentSubject, selectedPaperFilter]);

  // Auto-sync selected chapter when paper or subject changes
  useEffect(() => {
    if (currentPaperChapters.length > 0) {
      const exists = currentPaperChapters.some(c => c.id === selectedChapterId);
      if (!exists) {
        setSelectedChapterId(currentPaperChapters[0].id);
      }
    } else {
      setSelectedChapterId('');
    }
  }, [currentPaperChapters, selectedChapterId]);

  // Active Chapter Object
  const currentChapter = useMemo(() => {
    return currentPaperChapters.find(c => c.id === selectedChapterId) || currentPaperChapters[0] || null;
  }, [currentPaperChapters, selectedChapterId]);

  // Fetch subject questions dynamically from Firestore question_bank
  const { data: allSubjectQuestions = [] } = useQuery({
    queryKey: ['highlighted_lines_questions', currentSubject?.id],
    queryFn: async () => {
      try {
        const snap = await getDocs(collection(db, 'question_bank'));
        if (!snap.empty) {
          const allDocs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return allDocs.filter(q => {
            const subStr = (q.subject || '').toLowerCase();
            const targetSub = (currentSubject?.id || '').toLowerCase();
            const targetName = (currentSubject?.name || '').toLowerCase();

            const matchSub = subStr === targetSub ||
              subStr.includes(targetSub) ||
              targetName.includes(subStr) ||
              (targetSub === 'biology' && (subStr.includes('bio') || subStr.includes('bot') || subStr.includes('zoo')));
            
            return matchSub;
          });
        }
      } catch (err) {
        console.warn('Firestore question_bank fetch failed:', err);
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!currentSubject?.id
  });

  // Dynamic Live Question Counter for a Chapter
  const getLiveChapterQuestionsCount = (chapterObj) => {
    if (!chapterObj) return 0;
    const cId = (chapterObj.id || '').toLowerCase();
    const cName = (chapterObj.name || '').toLowerCase();
    const cleanTitle = cName.split(':')[1]?.trim().toLowerCase() || cName;

    const matched = allSubjectQuestions.filter(q => {
      const qChapterId = (q.chapterId || '').toLowerCase();
      const qChapter = (q.chapter || '').toLowerCase();
      const qTopic = (q.topic || '').toLowerCase();

      return (
        qChapterId === cId ||
        qChapter === cName ||
        qChapter.includes(cleanTitle) ||
        qTopic.includes(cleanTitle) ||
        (cId && normalizeChapterKey(qChapterId) === normalizeChapterKey(cId))
      );
    });

    return matched.length > 0 ? matched.length : (chapterObj.repeatedQuestionsCount || 0);
  };

  // Parsed Topics for the Active Chapter
  const chapterTopics = useMemo(() => {
    if (!currentChapter) return [];
    return parseChapterTopics(currentChapter);
  }, [currentChapter]);

  // Auto-check all topics when active chapter changes
  useEffect(() => {
    if (chapterTopics.length > 0) {
      const allTopicIds = new Set(chapterTopics.map(t => t.id));
      setSelectedTopicIds(allTopicIds);
    } else {
      setSelectedTopicIds(new Set());
    }
  }, [chapterTopics]);

  // Checkbox Toggle handlers
  const handleToggleTopic = (topicId) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleSelectAllTopics = () => {
    if (selectedTopicIds.size === chapterTopics.length) {
      setSelectedTopicIds(new Set());
    } else {
      setSelectedTopicIds(new Set(chapterTopics.map(t => t.id)));
    }
  };

  // Filtered Topics based on search query and checkbox selection
  const displayedTopics = useMemo(() => {
    return chapterTopics.filter(t => {
      // Must be checked in the checkbox list
      if (!selectedTopicIds.has(t.id)) return false;

      // Search query matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = t.name.toLowerCase().includes(q);
        const matchesLines = (t.lines || []).some(l => l.toLowerCase().includes(q));
        if (!matchesTopic && !matchesLines) return false;
      }

      return true;
    });
  }, [chapterTopics, selectedTopicIds, searchQuery]);

  // Flattened all lines of current filtered chapter & checked topics for Speed Cards Grid
  const allHighlightedItems = useMemo(() => {
    const items = [];
    if (!currentChapter) return [];

    displayedTopics.forEach((topic) => {
      (topic.lines || []).forEach((fact, idx) => {
        // Search filter on individual lines if search is active
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!fact.toLowerCase().includes(q) && !topic.name.toLowerCase().includes(q)) return;
        }

        const key = `${currentChapter.id}-${topic.id}-${idx}`;
        const isMastered = masteredLines.has(key) || masteredLines.has(`${currentChapter.id}-${idx}`);
        if (filterType === 'mastered' && !isMastered) return;
        if (filterType === 'unmastered' && isMastered) return;

        items.push({
          key,
          fact,
          chapterId: currentChapter.id,
          chapterName: currentChapter.name,
          topicName: topic.name,
          paper: currentChapter.paper,
          isMastered,
          index: items.length + 1
        });
      });
    });
    return items;
  }, [currentChapter, displayedTopics, masteredLines, filterType, searchQuery]);

  // Subject Stats & Progress
  const subjectProgress = useMemo(() => {
    let totalLines = 0;
    let completed = 0;
    if (currentSubject?.chapters) {
      currentSubject.chapters.forEach(chap => {
        const topics = parseChapterTopics(chap);
        topics.forEach(top => {
          (top.lines || []).forEach((_, idx) => {
            totalLines++;
            if (masteredLines.has(`${chap.id}-${top.id}-${idx}`) || masteredLines.has(`${chap.id}-${idx}`)) {
              completed++;
            }
          });
        });
      });
    }
    const percent = totalLines > 0 ? Math.round((completed / totalLines) * 100) : 0;
    return { totalLines, completed, percent };
  }, [currentSubject, masteredLines]);

  const getSubjectIcon = (iconName) => {
    switch (iconName) {
      case 'Dna': return Dna;
      case 'FlaskConical': return FlaskConical;
      case 'Zap': return Zap;
      case 'BookOpen': return BookOpen;
      case 'Globe': return Globe;
      default: return BookOpen;
    }
  };

  const fontSizeClass = {
    small: 'text-xs sm:text-sm leading-relaxed',
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-loose'
  }[fontSize];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 pb-28 lg:pb-16 font-bangla selection:bg-rose-500/30">
      
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-rose-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[450px] h-[450px] bg-indigo-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] bg-teal-600/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">

        {/* ── 1. Unified Sticky Top Header Bar ─────────────────────────────── */}
        <div className="rounded-2xl bg-slate-900/90 border border-white/[0.08] p-3 sm:p-4 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          
          {/* Left: Back Link & Page Title */}
          <div className="flex items-center gap-3">
            <Link
              to={backPath}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-rose-400 hover:text-white hover:border-rose-500/40 text-xs font-bold transition shadow-sm group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>{theme.name}</span>
            </Link>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Highlighter className="w-4 h-4 text-rose-400 shrink-0" />
              <h1 className="text-sm sm:text-base font-black text-white">
                দাগানো লাইনস (অধ্যায় ➔ টপিক ➔ গুরুত্বপূর্ণ লাইন)
              </h1>
            </div>
          </div>

          {/* Right: Live Subject Progress & Quick Action */}
          <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/[0.06] text-xs font-bold">
              <span className="text-slate-400">পড়া সম্পন্ন:</span>
              <span className="text-rose-400 font-mono font-black">{subjectProgress.completed}/{subjectProgress.totalLines}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">
                {subjectProgress.percent}%
              </span>
            </div>

            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold shadow-md active:scale-95 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ফিল্টার ও কন্ট্রোলস</span>
            </button>
          </div>
        </div>

        {/* ── 2. Main 2-Column Grid Workspace (Sidebar + Canvas) ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ────────────────────────────────────────────────────────────────────── */}
          {/* 📌 LEFT SIDEBAR (All Filters, Subjects, Dropdowns & View Controls)    */}
          {/* ────────────────────────────────────────────────────────────────────── */}
          <aside className={`
            lg:col-span-4 xl:col-span-3 space-y-4 lg:sticky lg:top-5 z-30 transition-all duration-300
            ${isMobileSidebarOpen ? 'fixed inset-0 top-16 bg-[#060913]/98 p-5 overflow-y-auto z-50 block' : 'hidden lg:block'}
          `}>
            
            {/* Mobile Header Close */}
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Filter className="w-4 h-4" />
                <span>ফিল্টার ও ভিউ কন্ট্রোলস</span>
              </div>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Container */}
            <div className="rounded-3xl bg-slate-900/90 border border-white/[0.08] p-4 sm:p-5 space-y-4 shadow-xl backdrop-blur-xl">
              
              {/* 1. 📚 SUBJECT DROPDOWN */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>বিষয় নির্বাচন:</span>
                  <span className="text-rose-400 font-mono text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    {subjectsList.length}টি বিষয়
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      setSelectedSubjectId(e.target.value);
                      setSelectedPaperFilter('all');
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500/50 transition cursor-pointer shadow-inner"
                  >
                    {subjectsList.map((sub) => {
                      let subTotal = 0;
                      let subMastered = 0;
                      if (sub.chapters) {
                        sub.chapters.forEach(c => {
                          const topics = parseChapterTopics(c);
                          topics.forEach(top => {
                            (top.lines || []).forEach((_, idx) => {
                              subTotal++;
                              if (masteredLines.has(`${c.id}-${top.id}-${idx}`) || masteredLines.has(`${c.id}-${idx}`)) {
                                subMastered++;
                              }
                            });
                          });
                        });
                      }
                      const subPercent = subTotal > 0 ? Math.round((subMastered / subTotal) * 100) : 0;
                      
                      const cleanName = (sub.shortName || sub.name || '')
                        .split(' (')[0]
                        .replace(' ভাষা ও সাহিত্য', '')
                        .replace(' ভাষা ও গ্রামার', '')
                        .replace(' ও মুক্তিযুদ্ধ', '')
                        .trim();

                      return (
                        <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">
                          {cleanName} ({subPercent}% পড়া হয়েছে)
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Search Bar */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>অনুসন্ধান</span>
                  <span className="text-rose-400 font-mono text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    {chapterTopics.length} টপিক
                  </span>
                </label>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="টপিক বা তথ্য খুঁজুন..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 transition shadow-inner"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs hover:text-slate-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Paper Selector (Dropdown / Pills) */}
              {availablePapers.length > 1 && (
                <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                    পত্র নির্বাচন:
                  </label>
                  <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => {
                        setSelectedPaperFilter('all');
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-center transition flex-1 min-w-[60px] ${
                        selectedPaperFilter === 'all'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      সকল
                    </button>
                    {availablePapers.map((paper) => (
                      <button
                        key={paper}
                        onClick={() => {
                          setSelectedPaperFilter(paper);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-center transition flex-1 min-w-[80px] ${
                          selectedPaperFilter === paper
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {paper}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. 🎯 CHAPTER DROPDOWN */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  অধ্যায় নির্বাচন:
                </label>
                <div className="relative">
                  <select
                    value={selectedChapterId}
                    onChange={(e) => {
                      setSelectedChapterId(e.target.value);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold text-slate-100 focus:outline-none focus:border-rose-500/50 transition cursor-pointer shadow-inner"
                  >
                    {currentPaperChapters.map((ch, idx) => {
                      const cTopics = parseChapterTopics(ch);
                      const totalLines = cTopics.reduce((acc, t) => acc + (t.lines?.length || 0), 0);
                      const liveQs = getLiveChapterQuestionsCount(ch);
                      return (
                        <option key={ch.id || idx} value={ch.id} className="bg-slate-900 text-slate-100">
                          {idx + 1}. {ch.name} ({liveQs > 0 ? `${liveQs}টি প্রশ্ন` : `${totalLines}টি তথ্য`})
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 4. 🎯 TOPIC CHECKBOXES */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-rose-400" />
                    <span>টপিক নির্বাচন ({selectedTopicIds.size}/{chapterTopics.length})</span>
                  </label>
                  <button
                    onClick={handleSelectAllTopics}
                    className="text-[10.5px] text-rose-400 hover:text-rose-300 font-bold"
                  >
                    {selectedTopicIds.size === chapterTopics.length ? 'সব বাদ' : 'সব সিলেক্ট'}
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {chapterTopics.map((topic) => {
                    const isChecked = selectedTopicIds.has(topic.id);
                    const lineCount = (topic.lines || []).length;

                    return (
                      <label
                        key={topic.id}
                        onClick={() => handleToggleTopic(topic.id)}
                        className={`flex items-center justify-between gap-2.5 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                            : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-950/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                            isChecked 
                              ? 'bg-rose-600 border-rose-500 text-white' 
                              : 'bg-slate-900 border-slate-700 text-transparent'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="truncate">{topic.name}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-70 shrink-0">
                          {lineCount}টি
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. 🎯 VIEW MODES & DISPLAY CONTROLS (MOVED TO SIDEBAR AS REQUESTED) */}
              <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  ভিউ মোড:
                </label>
                
                {/* 3 View Mode Switches */}
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold text-center">
                  <button
                    onClick={() => setViewMode('book')}
                    className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                      viewMode === 'book'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>বুক ভিউ</span>
                  </button>

                  <button
                    onClick={() => setViewMode('grid')}
                    className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                      viewMode === 'grid'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>স্পিড কার্ড</span>
                  </button>

                  <button
                    onClick={() => setViewMode('accordion')}
                    className={`py-1.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                      viewMode === 'accordion'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>টপিক বিস্তার</span>
                  </button>
                </div>

                {/* Controls Row: Expand/Collapse + Font Size */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  
                  {/* Expand / Collapse All Topics */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 flex-1 justify-center">
                    <button
                      onClick={() => setCollapsedTopics(new Set())}
                      className="px-1.5 py-0.5 rounded hover:text-rose-400 transition"
                      title="সব খুলুন"
                    >
                      সব খুলুন
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      onClick={() => setCollapsedTopics(new Set(displayedTopics.map(t => `${currentChapter?.id}-${t.id}`)))}
                      className="px-1.5 py-0.5 rounded hover:text-amber-400 transition"
                      title="সব গুটান"
                    >
                      সব গুটান
                    </button>
                  </div>

                  {/* Font Size Controls */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-400">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`px-1.5 py-0.5 rounded ${fontSize === 'small' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                      title="ছোট ফন্ট"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`px-1.5 py-0.5 rounded ${fontSize === 'normal' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                      title="স্বাভাবিক ফন্ট"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-1.5 py-0.5 rounded ${fontSize === 'large' ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                      title="বড় ফন্ট"
                    >
                      A+
                    </button>
                  </div>

                </div>
              </div>

              {/* 6. Mastery Progress Sub-Tabs */}
              <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  পড়ার স্থিতি:
                </label>
                <div className="flex flex-col gap-1 text-xs font-bold">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                      filterType === 'all' 
                        ? 'bg-slate-800 text-white border border-slate-700' 
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <span>📌 সবগুলো তথ্য</span>
                    <span className="font-mono text-slate-400">{subjectProgress.totalLines}</span>
                  </button>

                  <button
                    onClick={() => setFilterType('unmastered')}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                      filterType === 'unmastered' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <span>⏳ পড়া বাকি</span>
                    <span className="font-mono text-amber-400">{subjectProgress.totalLines - subjectProgress.completed}</span>
                  </button>

                  <button
                    onClick={() => setFilterType('mastered')}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between ${
                      filterType === 'mastered' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <span>✅ পড়া শেষ</span>
                    <span className="font-mono text-emerald-400">{subjectProgress.completed}</span>
                  </button>
                </div>
              </div>

            </div>
          </aside>

          {/* ────────────────────────────────────────────────────────────────────── */}
          {/* 📖 RIGHT MAIN CONTENT CANVAS (Clean & Focused on Content)              */}
          {/* ────────────────────────────────────────────────────────────────────── */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-4">

            {currentChapter ? (
              <>
                {/* ── Active Chapter Header Bar ────────────────────────────────── */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-900/95 via-[#0d1424]/95 to-slate-950/95 border border-white/[0.08] p-4 sm:p-5 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${currentSubject?.color || 'from-rose-500 to-pink-600'} text-white shadow-md shrink-0`}>
                      {React.createElement(getSubjectIcon(currentSubject?.icon), { className: "w-5 h-5" })}
                    </div>
                    <div className="space-y-1 min-w-0">
                      {/* Row 1: Subject / Paper Badge & Previous Questions Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold px-2.5 py-0.5 rounded-md text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {currentChapter.paper || currentSubject?.name}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700">
                          বিগত প্রশ্ন: {getLiveChapterQuestionsCount(currentChapter)}টি
                        </span>
                      </div>

                      {/* Row 2: Chapter Title (Prominent) */}
                      <h2 className="text-base sm:text-lg lg:text-xl font-black text-white leading-snug">
                        {currentChapter.name}
                      </h2>

                      {/* Row 3: Topic & Highlighted Lines Counts */}
                      <p className="text-xs text-slate-400">
                        সিলেক্টেড টপিক: <strong className="text-rose-300">{displayedTopics.length}টি</strong> • দাগানো লাইন: <strong className="text-amber-300">{allHighlightedItems.length}টি</strong>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/academic/admission/medical/exam/${encodeURIComponent(theme.defaultExamType)}/${theme.defaultSession}?mode=practice&count=10&subjects=${currentSubject?.id}`}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-md shadow-rose-600/20 active:scale-95 transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>১০-প্রশ্ন টেস্ট</span>
                  </Link>
                </div>

                {/* ── Mode 1: Smart Highlighter Book View (Topic Cards) ────────── */}
                {viewMode === 'book' && (
                  <div className="space-y-4">
                    {displayedTopics.length > 0 ? (
                      displayedTopics.map((topic, topIdx) => {
                        const topicKey = `${currentChapter.id}-${topic.id}`;
                        const isTopicCollapsed = collapsedTopics.has(topicKey);
                        const topicLines = Array.isArray(topic.lines) ? topic.lines : [];

                        const validLines = topicLines.filter((fact, idx) => {
                          if (searchQuery.trim()) {
                            const q = searchQuery.toLowerCase();
                            if (!fact.toLowerCase().includes(q) && !topic.name.toLowerCase().includes(q)) return false;
                          }
                          const lineKey = `${currentChapter.id}-${topic.id}-${idx}`;
                          const isMastered = masteredLines.has(lineKey) || masteredLines.has(`${currentChapter.id}-${idx}`);
                          if (filterType === 'mastered') return isMastered;
                          if (filterType === 'unmastered') return !isMastered;
                          return true;
                        });

                        if (validLines.length === 0 && filterType !== 'all') return null;

                        let topicMasteredCount = 0;
                        topicLines.forEach((_, idx) => {
                          if (masteredLines.has(`${currentChapter.id}-${topic.id}-${idx}`) || masteredLines.has(`${currentChapter.id}-${idx}`)) {
                            topicMasteredCount++;
                          }
                        });

                        return (
                          <div
                            key={topic.id || topIdx}
                            className="rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#0d1424] to-slate-900/95 border border-white/[0.08] shadow-xl p-4 sm:p-5 space-y-4 relative overflow-hidden transition-all duration-200"
                          >
                            {/* Topic Header */}
                            <div 
                              onClick={() => toggleTopicCollapse(topicKey)}
                              className="flex items-center justify-between gap-3 cursor-pointer select-none pb-3 border-b border-white/[0.06] group"
                            >
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/50" />
                                <h3 className="text-base sm:text-lg font-black text-rose-300 group-hover:text-rose-200 transition">
                                  {topic.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-mono text-slate-400">
                                  {topicMasteredCount}/{topicLines.length} শেষ
                                </span>
                                <div className={`p-1.5 rounded-xl bg-slate-800 text-slate-300 transition-transform duration-200 ${isTopicCollapsed ? '' : 'rotate-180 text-rose-400'}`}>
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              </div>
                            </div>

                            {/* Topic Lines */}
                            {!isTopicCollapsed && (
                              <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
                                {topicLines.map((fact, fIdx) => {
                                  if (searchQuery.trim()) {
                                    const q = searchQuery.toLowerCase();
                                    if (!fact.toLowerCase().includes(q) && !topic.name.toLowerCase().includes(q)) return null;
                                  }

                                  const lineKey = `${currentChapter.id}-${topic.id}-${fIdx}`;
                                  const isMastered = masteredLines.has(lineKey) || masteredLines.has(`${currentChapter.id}-${fIdx}`);

                                  if (filterType === 'mastered' && !isMastered) return null;
                                  if (filterType === 'unmastered' && isMastered) return null;

                                  return (
                                    <div
                                      key={fIdx}
                                      className={`rounded-xl p-3.5 sm:p-4 border transition-all duration-200 flex items-start justify-between gap-3 group shadow-sm ${
                                        isMastered 
                                          ? 'bg-slate-950/40 border-emerald-500/30 opacity-75' 
                                          : 'bg-slate-950/60 border-white/[0.07] hover:border-rose-500/30 hover:bg-slate-900/90'
                                      }`}
                                    >
                                      <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <button
                                          onClick={() => toggleMasteredLine(lineKey)}
                                          className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                                            isMastered
                                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                                              : 'bg-slate-900/80 border-slate-700 text-transparent hover:border-rose-400 hover:text-rose-400'
                                          }`}
                                          title={isMastered ? 'পড়া সম্পন্ন' : 'পড়া শেষ করতে ক্লিক করুন'}
                                        >
                                          <Check className="w-3 h-3 stroke-[3]" />
                                        </button>

                                        <MarkdownRenderer
                                          content={fact}
                                          className={`${fontSizeClass} font-medium text-slate-100 leading-relaxed select-text ${isMastered ? 'line-through text-slate-400 opacity-60' : ''}`}
                                        />
                                      </div>

                                      <button
                                        onClick={() => handleCopyLine(fact)}
                                        className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition active:scale-95 shrink-0 opacity-70 group-hover:opacity-100"
                                        title="কপি করুন"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-14 text-center space-y-2 bg-slate-900/40 rounded-2xl border border-white/[0.08]">
                        <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-sm text-slate-300 font-bold">কোনো টপিক নির্বাচন করা হয়নি</p>
                        <p className="text-xs text-slate-500">বামের ফিল্টার থেকে অন্তত একটি টপিক চেক করুন</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Mode 2: Speed Cards Grid ─────────────────────────────────── */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {allHighlightedItems.length > 0 ? (
                      allHighlightedItems.map((item) => (
                        <div
                          key={item.key}
                          className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between gap-3.5 group shadow-lg ${
                            item.isMastered
                              ? 'bg-slate-950/40 border-emerald-500/30 opacity-70'
                              : 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-white/[0.07] hover:border-rose-500/40'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-rose-300 border border-slate-700 text-[10.5px] font-bold">
                                {item.chapterName}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-950 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                                {item.topicName}
                              </span>
                            </div>

                            <MarkdownRenderer
                              content={item.fact}
                              className={`${fontSizeClass} font-medium text-slate-100 leading-relaxed ${item.isMastered ? 'line-through text-slate-400 opacity-60' : ''}`}
                            />
                          </div>

                          <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                            <button
                              onClick={() => toggleMasteredLine(item.key)}
                              className={`px-3 py-1 rounded-xl border font-bold flex items-center gap-1.5 transition text-xs ${
                                item.isMastered
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{item.isMastered ? 'সম্পন্ন' : 'পড়া শেষ চিহ্নিত করুন'}</span>
                            </button>

                            <button
                              onClick={() => handleCopyLine(item.fact)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition active:scale-95"
                              title="কপি করুন"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-14 text-center space-y-2 bg-slate-900/40 rounded-2xl border border-white/[0.08]">
                        <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-sm text-slate-300 font-bold">কোনো দাগানো লাইন পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Mode 3: Traditional Topic Accordion View ─────────────────── */}
                {viewMode === 'accordion' && (
                  <div className="space-y-2.5">
                    {displayedTopics.map((topic, tIdx) => {
                      const topicKey = `${currentChapter.id}-${topic.id}`;
                      const isCollapsed = collapsedTopics.has(topicKey);
                      const topicLines = Array.isArray(topic.lines) ? topic.lines : [];

                      return (
                        <div
                          key={tIdx}
                          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                            !isCollapsed
                              ? 'bg-slate-950/90 border-rose-500/40 shadow-lg'
                              : 'bg-slate-900/60 border-white/[0.07] hover:border-slate-700 hover:bg-slate-850'
                          }`}
                        >
                          <div
                            onClick={() => toggleTopicCollapse(topicKey)}
                            className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer select-none gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-100 text-sm sm:text-base truncate">{topic.name}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  দাগানো লাইন: <strong className="text-amber-400">{topicLines.length}টি</strong>
                                </p>
                              </div>
                            </div>

                            <div className={`p-1.5 rounded-lg bg-slate-800 text-slate-400 transition-transform duration-200 ${!isCollapsed ? 'rotate-180 text-rose-400' : ''}`}>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>

                          {!isCollapsed && (
                            <div className="p-3.5 sm:p-4 border-t border-white/[0.06] bg-slate-950/70 space-y-2">
                              {topicLines.map((fact, fIdx) => (
                                <div key={fIdx} className="text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.06]">
                                  <span className="w-4 h-4 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                                    ✓
                                  </span>
                                  <MarkdownRenderer content={fact} className="flex-1" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </>
            ) : (
              <div className="py-20 text-center space-y-3 bg-slate-900/40 rounded-3xl border border-white/[0.08]">
                <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-base text-slate-300 font-bold">অনুগ্রহ করে একটি অধ্যায় নির্বাচন করুন</p>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
