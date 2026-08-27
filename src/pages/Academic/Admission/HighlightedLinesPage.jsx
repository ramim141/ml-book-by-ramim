import { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  BookOpen, Sparkles, ChevronDown, Play, BookCheck, Layers,
  Dna, FlaskConical, Zap, Globe, Stethoscope, Cpu, HeartPulse,
  Check, Copy, Leaf, Highlighter, Tag, Target, ListChecks, Clock
} from 'lucide-react';
import { MEDICAL_SUBJECTS_DETAILED } from '../../../data/academic/medicalConfig';
import { NURSING_SUBJECTS_CONFIG, NURSING_TRACKS } from '../../../data/academic/nursingConfig';
import { useAdmissionProgramSubjects } from '../../../hooks/useAdmissionData';
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { normalizeChapterKey } from '../QuestionBuilder/useBuilderQuestions';
import MarkdownRenderer from '../../../components/UI/MarkdownRenderer';
import SubjectWorkspace from '../../../components/Academic/SubjectWorkspace';
import toast from 'react-hot-toast';

// ─── Program Themes ──────────────────────────────────────────────────────────

const PROGRAM_THEMES = {
  medical: {
    name: 'মেডিকেল ও ডেন্টাল', shortName: 'মেডিকেল',
    backPath: '/academic/admission/medical', icon: Stethoscope, accent: 'rose',
    defaultExamType: 'MBBS', defaultSession: '2023-2024'
  },
  nursing: {
    name: 'নার্সিং ও মিডওয়াইফারি', shortName: 'নার্সিং',
    backPath: '/academic/admission/nursing', icon: HeartPulse, accent: 'emerald',
    defaultExamType: 'BSc Nursing', defaultSession: '2023-2024'
  },
  engineering: {
    name: 'ইঞ্জিনিয়ারিং', shortName: 'ইঞ্জিনিয়ারিং',
    backPath: '/academic/admission/engineering', icon: Cpu, accent: 'blue',
    defaultExamType: 'BUET', defaultSession: '2023-2024'
  },
  'varsity-a': {
    name: 'ভার্সিটি ক-ইউনিট', shortName: 'ভার্সিটি ক',
    backPath: '/academic/admission/varsity-a', icon: BookCheck, accent: 'indigo',
    defaultExamType: 'DU-A', defaultSession: '2023-2024'
  },
  gst: {
    name: 'GST গুচ্ছ', shortName: 'GST',
    backPath: '/academic/admission/gst', icon: FlaskConical, accent: 'fuchsia',
    defaultExamType: 'GST', defaultSession: '2023-2024'
  },
  agri: {
    name: 'কৃষি বিশ্ববিদ্যালয়', shortName: 'কৃষি',
    backPath: '/academic/admission/agri', icon: Leaf, accent: 'lime',
    defaultExamType: 'BAU', defaultSession: '2023-2024'
  },
  'varsity-others': {
    name: 'ভার্সিটি অন্যান্য ইউনিট', shortName: 'ভার্সিটি B/C/D',
    backPath: '/academic/admission/varsity-others', icon: Globe, accent: 'amber',
    defaultExamType: 'DU-B', defaultSession: '2023-2024'
  }
};

const SUBJECT_ICONS = { Dna, FlaskConical, Zap, BookOpen, Globe };

/**
 * Parses a chapter into a Topic -> important lines hierarchy.
 */
function parseChapterTopics(chapter) {
  if (!chapter) return [];

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

    // Pattern 3: fuzzy keyword match with highYieldTopics
    let matchedTopic = null;
    for (const t of highYieldTopics) {
      const keywords = t.split(/[\s,()-]+/).filter(w => w.length > 2);
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

  topicMap.forEach((lines, name) => {
    parsedTopics.push({ id: `topic-${parsedTopics.length}`, name, lines });
  });

  highYieldTopics.forEach((t) => {
    if (!topicMap.has(t)) {
      const linesForThis = [];
      unassignedLines.forEach((l) => {
        const keywords = t.split(/[\s,()-]+/).filter(w => w.length > 2);
        if (keywords.some(k => l.toLowerCase().includes(k.toLowerCase()))) {
          linesForThis.push(l);
        }
      });
      if (linesForThis.length > 0) {
        parsedTopics.push({ id: `topic-${parsedTopics.length}`, name: t, lines: linesForThis });
      }
    }
  });

  if (unassignedLines.length > 0) {
    parsedTopics.push({
      id: 'topic-general',
      name: parsedTopics.length === 0 ? 'গুরুত্বপূর্ণ দাগানো তথ্য' : 'অন্যান্য হাই-ইয়েল্ড পয়েন্ট',
      lines: unassignedLines
    });
  }

  if (parsedTopics.length === 0 && highYieldTopics.length > 0) {
    return highYieldTopics.map((t, idx) => ({ id: `topic-${idx}`, name: t, lines: [] }));
  }

  return parsedTopics;
}

export default function HighlightedLinesPage() {
  const { trackId } = useParams();
  const location = useLocation();

  const programKey = useMemo(() => {
    const p = location.pathname;
    if (p.includes('/nursing')) return 'nursing';
    if (p.includes('/engineering')) return 'engineering';
    if (p.includes('/varsity-a')) return 'varsity-a';
    if (p.includes('/gst')) return 'gst';
    if (p.includes('/agri')) return 'agri';
    if (p.includes('/varsity-others')) return 'varsity-others';
    return 'medical';
  }, [location.pathname]);

  const theme = PROGRAM_THEMES[programKey] || PROGRAM_THEMES.medical;

  const activeNursingTrack = useMemo(() => {
    if (programKey !== 'nursing') return null;
    return NURSING_TRACKS.find(t => t.id === trackId) || NURSING_TRACKS[0];
  }, [programKey, trackId]);

  const backPath = useMemo(() => {
    if (programKey === 'nursing' && trackId) return `/academic/admission/nursing/${trackId}`;
    return theme.backPath;
  }, [programKey, trackId, theme.backPath]);

  const { data: dynamicProgramSubjects } = useAdmissionProgramSubjects(programKey);

  const subjectsList = useMemo(() => {
    if (dynamicProgramSubjects?.length > 0) {
      if (programKey === 'nursing' && activeNursingTrack) {
        return dynamicProgramSubjects.filter(s => !s.applicableTracks || s.applicableTracks.includes(activeNursingTrack.id));
      }
      return dynamicProgramSubjects;
    }
    if (programKey === 'medical') return MEDICAL_SUBJECTS_DETAILED;
    if (programKey === 'nursing') {
      if (activeNursingTrack) {
        return NURSING_SUBJECTS_CONFIG.filter(s => !s.applicableTracks || s.applicableTracks.includes(activeNursingTrack.id));
      }
      return NURSING_SUBJECTS_CONFIG;
    }
    return MEDICAL_SUBJECTS_DETAILED;
  }, [programKey, dynamicProgramSubjects, activeNursingTrack]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedPaperFilter, setSelectedPaperFilter] = useState('all');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('book');
  const [fontSize, setFontSize] = useState('normal');
  const [filterType, setFilterType] = useState('all');
  const [collapsedTopics, setCollapsedTopics] = useState(new Set());

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
        toast('পড়া বাকি হিসেবে চিহ্নিত করা হয়েছে', { icon: '⏳' });
      } else {
        next.add(lineKey);
        toast.success('পড়া সম্পন্ন হয়েছে!', { icon: '✅' });
      }
      try {
        localStorage.setItem(`mastered_lines_${programKey}`, JSON.stringify([...next]));
      } catch {
        /* storage unavailable — progress just won't persist */
      }
      return next;
    });
  };

  const handleCopyLine = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('তথ্যটি কপি করা হয়েছে!', { icon: '📋', duration: 2000 });
  };

  const toggleTopicCollapse = (topicKey) => {
    setCollapsedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicKey)) next.delete(topicKey);
      else next.add(topicKey);
      return next;
    });
  };

  // Default subject from ?subject= / ?chapter=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const querySub = params.get('subject');
    const queryChap = params.get('chapter');

    if (querySub && subjectsList.length > 0) {
      const match = subjectsList.find(s =>
        s.id?.toLowerCase() === querySub.toLowerCase() ||
        s.name?.toLowerCase().includes(querySub.toLowerCase())
      );
      if (match) {
        setSelectedSubjectId(match.id);
        if (queryChap) setSelectedChapterId(queryChap);
        return;
      }
    }

    if (subjectsList.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjectsList[0].id);
    }
  }, [subjectsList, selectedSubjectId, location.search]);

  const currentSubject = useMemo(
    () => subjectsList.find(s => s.id === selectedSubjectId) || subjectsList[0] || null,
    [subjectsList, selectedSubjectId]
  );

  const availablePapers = useMemo(() => {
    if (!currentSubject?.chapters) return [];
    return [...new Set(currentSubject.chapters.map(c => c.paper).filter(Boolean))];
  }, [currentSubject]);

  const currentPaperChapters = useMemo(() => {
    if (!currentSubject?.chapters) return [];
    if (selectedPaperFilter === 'all') return currentSubject.chapters;
    return currentSubject.chapters.filter(c => c.paper === selectedPaperFilter);
  }, [currentSubject, selectedPaperFilter]);

  useEffect(() => {
    if (currentPaperChapters.length > 0) {
      const exists = currentPaperChapters.some(c => c.id === selectedChapterId);
      if (!exists) setSelectedChapterId(currentPaperChapters[0].id);
    } else {
      setSelectedChapterId('');
    }
  }, [currentPaperChapters, selectedChapterId]);

  const currentChapter = useMemo(
    () => currentPaperChapters.find(c => c.id === selectedChapterId) || currentPaperChapters[0] || null,
    [currentPaperChapters, selectedChapterId]
  );

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

            return subStr === targetSub ||
              subStr.includes(targetSub) ||
              targetName.includes(subStr) ||
              (targetSub === 'biology' && (subStr.includes('bio') || subStr.includes('bot') || subStr.includes('zoo')));
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

  const chapterTopics = useMemo(
    () => (currentChapter ? parseChapterTopics(currentChapter) : []),
    [currentChapter]
  );

  useEffect(() => {
    setSelectedTopicIds(new Set(chapterTopics.map(t => t.id)));
  }, [chapterTopics]);

  const handleToggleTopic = (topicId) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleSelectAllTopics = () => {
    if (selectedTopicIds.size === chapterTopics.length) setSelectedTopicIds(new Set());
    else setSelectedTopicIds(new Set(chapterTopics.map(t => t.id)));
  };

  const matchesSearch = (fact, topicName) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return fact.toLowerCase().includes(q) || topicName.toLowerCase().includes(q);
  };

  const isLineMastered = (topicId, idx) =>
    masteredLines.has(`${currentChapter?.id}-${topicId}-${idx}`) ||
    masteredLines.has(`${currentChapter?.id}-${idx}`);

  const displayedTopics = useMemo(() => {
    return chapterTopics.filter(t => {
      if (!selectedTopicIds.has(t.id)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTopic = t.name.toLowerCase().includes(q);
        const matchesLines = (t.lines || []).some(l => l.toLowerCase().includes(q));
        if (!matchesTopic && !matchesLines) return false;
      }
      return true;
    });
  }, [chapterTopics, selectedTopicIds, searchQuery]);

  const allHighlightedItems = useMemo(() => {
    const items = [];
    if (!currentChapter) return items;

    displayedTopics.forEach((topic) => {
      (topic.lines || []).forEach((fact, idx) => {
        if (!matchesSearch(fact, topic.name)) return;

        const key = `${currentChapter.id}-${topic.id}-${idx}`;
        const isMastered = masteredLines.has(key) || masteredLines.has(`${currentChapter.id}-${idx}`);
        if (filterType === 'mastered' && !isMastered) return;
        if (filterType === 'unmastered' && isMastered) return;

        items.push({
          key, fact,
          chapterName: currentChapter.name,
          topicName: topic.name,
          isMastered
        });
      });
    });
    return items;
  }, [currentChapter, displayedTopics, masteredLines, filterType, searchQuery]);

  // Progress across the whole subject
  const subjectProgress = useMemo(() => {
    let totalLines = 0;
    let completed = 0;
    if (currentSubject?.chapters) {
      currentSubject.chapters.forEach(chap => {
        parseChapterTopics(chap).forEach(top => {
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

  // Counts for the chapter's own quick filters
  const chapterCounts = useMemo(() => {
    let total = 0;
    let done = 0;
    chapterTopics.forEach(t => {
      (t.lines || []).forEach((_, idx) => {
        total++;
        if (isLineMastered(t.id, idx)) done++;
      });
    });
    return { total, done, left: total - done };
  }, [chapterTopics, masteredLines, currentChapter]);

  const fontSizeClass = {
    small: 'text-xs sm:text-sm leading-relaxed',
    normal: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-loose'
  }[fontSize];

  const Icon = SUBJECT_ICONS[currentSubject?.icon] || Highlighter;
  const accent = theme.accent;

  const VIEW_TABS = [
    { key: 'book', label: 'বুক ভিউ', icon: BookOpen, count: displayedTopics.length },
    { key: 'grid', label: 'স্পিড কার্ড', icon: Sparkles, count: allHighlightedItems.length },
    { key: 'accordion', label: 'টপিক বিস্তার', icon: Layers, count: displayedTopics.length }
  ];

  const QUICK_FILTERS = [
    { key: 'all', label: 'সবগুলো', icon: ListChecks, count: chapterCounts.total, tone: 'sky' },
    { key: 'unmastered', label: 'পড়া বাকি', icon: Clock, count: chapterCounts.left, tone: 'amber' },
    { key: 'mastered', label: 'পড়া শেষ', icon: Check, count: chapterCounts.done, tone: 'emerald' }
  ];

  return (
    <SubjectWorkspace
      accent={accent}
      storageKey={`highlighted_lines_${programKey}`}
      breadcrumbs={[
        { label: 'একাডেমিক', to: '/academic' },
        { label: 'ভর্তি প্রস্তুতি', to: '/academic/admission' },
        { label: theme.shortName, to: backPath },
        { label: 'দাগানো লাইন' }
      ]}
      backLink={{ to: backPath, label: `${theme.name}-এ ফিরে যান` }}
      primaryAction={currentSubject ? {
        to: `/academic/admission/medical/exam/${encodeURIComponent(theme.defaultExamType)}/${theme.defaultSession}?mode=practice&count=10&subjects=${currentSubject.id}`,
        label: '১০-প্রশ্ন টেস্ট',
        icon: Play
      } : null}
      hero={{
        icon: Icon,
        iconGradient: currentSubject?.color,
        title: currentSubject?.name || 'দাগানো লাইন',
        subtitle: 'অধ্যায় → টপিক → গুরুত্বপূর্ণ দাগানো লাইন। পড়া শেষ হলে টিক দিন, অগ্রগতি নিজে থেকেই সেভ হবে।',
        chips: [
          { label: 'দাগানো লাইন', tone: 'accent' },
          { label: theme.shortName },
          ...(activeNursingTrack ? [{ label: activeNursingTrack.shortName }] : [])
        ],
        footnote: subjectProgress.totalLines > 0 ? (
          <div className="pt-1 max-w-md space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>এই বিষয়ে পড়া সম্পন্ন</span>
              <span className="font-mono text-white">
                {subjectProgress.completed}/{subjectProgress.totalLines} ({subjectProgress.percent}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${subjectProgress.percent}%` }}
              />
            </div>
          </div>
        ) : null
      }}
      stats={[
        { label: 'মোট অধ্যায়', value: `${currentSubject?.chapters?.length || 0}টি`, icon: Layers },
        { label: 'মোট লাইন', value: `${subjectProgress.totalLines}টি`, icon: Highlighter },
        { label: 'পড়া শেষ', value: `${subjectProgress.completed}টি`, icon: Check, tone: 'text-emerald-300' },
        { label: 'বাকি', value: `${subjectProgress.totalLines - subjectProgress.completed}টি`, icon: Clock, tone: 'text-amber-300' }
      ]}
      papers={availablePapers.length > 1 ? ['সকল', ...availablePapers] : []}
      selectedPaper={selectedPaperFilter === 'all' ? 'সকল' : selectedPaperFilter}
      onSelectPaper={(p) => setSelectedPaperFilter(p === 'সকল' ? 'all' : p)}
      chapters={currentPaperChapters.map(ch => {
        const lines = parseChapterTopics(ch).reduce((acc, t) => acc + (t.lines?.length || 0), 0);
        return { id: ch.id, name: ch.name, badge: `${lines}` };
      })}
      selectedChapterId={currentChapter?.id || ''}
      onSelectChapter={setSelectedChapterId}
      chapterBadge={currentChapter?.paper || currentSubject?.shortName}
      chapterAction={currentChapter && (
        <span className="text-[11px] text-slate-400 font-medium">
          বিগত প্রশ্ন <strong className="text-white font-mono">{getLiveChapterQuestionsCount(currentChapter)}</strong>টি
        </span>
      )}
      tabs={VIEW_TABS}
      activeTab={viewMode}
      onSelectTab={setViewMode}
      quickFilters={QUICK_FILTERS}
      activeQuickFilter={filterType}
      onSelectQuickFilter={setFilterType}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: 'টপিক বা দাগানো তথ্য খুঁজুন...'
      }}
      onResetFilters={() => {
        setSearchQuery('');
        setFilterType('all');
        setSelectedTopicIds(new Set(chapterTopics.map(t => t.id)));
      }}
      hasActiveFilter={filterType !== 'all' || !!searchQuery.trim() || selectedTopicIds.size !== chapterTopics.length}

      /* Subject picker sits above everything else in the filter panel */
      filterHeader={(
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">বিষয়</span>
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedPaperFilter('all');
              }}
              className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[12px] font-bold text-slate-100 focus:outline-none cursor-pointer"
            >
              {subjectsList.map((sub) => {
                const cleanName = (sub.shortName || sub.name || '')
                  .split(' (')[0]
                  .replace(' ভাষা ও সাহিত্য', '')
                  .replace(' ভাষা ও গ্রামার', '')
                  .replace(' ও মুক্তিযুদ্ধ', '')
                  .trim();
                return (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">
                    {cleanName}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      )}

      /* Topic checkboxes + reading controls sit below the chapter list */
      filterFooter={chapterTopics.length > 0 && (
        <div className="space-y-3.5 pt-3.5 border-t border-slate-800">

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                টপিক ({selectedTopicIds.size}/{chapterTopics.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAllTopics}
                className="text-[10.5px] text-slate-400 hover:text-white font-bold transition"
              >
                {selectedTopicIds.size === chapterTopics.length ? 'সব বাদ' : 'সব সিলেক্ট'}
              </button>
            </div>

            <div className="max-h-[180px] overflow-y-auto no-scrollbar pr-0.5 divide-y divide-white/[0.05]">
              {chapterTopics.map((topic) => {
                const isChecked = selectedTopicIds.has(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleToggleTopic(topic.id)}
                    className={`w-full flex items-center justify-between gap-2.5 py-2 text-[11.5px] font-semibold transition text-left ${
                      isChecked ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                        isChecked ? 'bg-slate-200 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-transparent'
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                      <span className="truncate">{topic.name}</span>
                    </span>
                    <span className="text-[10px] font-mono opacity-70 shrink-0">{(topic.lines || []).length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">পড়ার সেটিংস</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-300 flex-1 justify-center">
                <button type="button" onClick={() => setCollapsedTopics(new Set())} className="px-2 py-1 rounded-lg hover:text-white transition">
                  সব খুলুন
                </button>
                <span className="text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => setCollapsedTopics(new Set(displayedTopics.map(t => `${currentChapter?.id}-${t.id}`)))}
                  className="px-2 py-1 rounded-lg hover:text-white transition"
                >
                  সব গুটান
                </button>
              </div>

              <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-[11px] font-bold text-slate-400">
                {[['small', 'A-'], ['normal', 'A'], ['large', 'A+']].map(([size, label]) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`px-2 py-1 rounded-lg transition ${fontSize === size ? 'bg-slate-800 text-white' : 'hover:text-slate-200'}`}
                    title={`${label} ফন্ট`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      emptyState={(
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-3">
          <Highlighter className="w-9 h-9 text-slate-600 mx-auto" />
          <h4 className="text-sm sm:text-base font-bold text-slate-200">এই বিষয়ের অধ্যায় যুক্ত হচ্ছে</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            মূল বই থেকে দাগানো গুরুত্বপূর্ণ লাইনগুলো শীঘ্রই যোগ করা হবে।
          </p>
        </div>
      )}
    >
      {/* ── Mode 1: Book view — plain sections, hairline rules, no nested boxes ── */}
      {viewMode === 'book' && (
        displayedTopics.length > 0 ? (
          <div className="space-y-7">
            {displayedTopics.map((topic, topIdx) => {
              const topicKey = `${currentChapter.id}-${topic.id}`;
              const isCollapsed = collapsedTopics.has(topicKey);
              const topicLines = Array.isArray(topic.lines) ? topic.lines : [];

              const visibleLines = topicLines
                .map((fact, idx) => ({ fact, idx }))
                .filter(({ fact, idx }) => {
                  if (!matchesSearch(fact, topic.name)) return false;
                  const isMastered = isLineMastered(topic.id, idx);
                  if (filterType === 'mastered') return isMastered;
                  if (filterType === 'unmastered') return !isMastered;
                  return true;
                });

              if (visibleLines.length === 0 && filterType !== 'all') return null;

              const doneCount = topicLines.filter((_, idx) => isLineMastered(topic.id, idx)).length;

              return (
                <section key={topic.id || topIdx}>
                  <button
                    type="button"
                    onClick={() => toggleTopicCollapse(topicKey)}
                    className="w-full flex items-baseline justify-between gap-3 pb-2 border-b border-white/[0.09] text-left group"
                  >
                    <h3 className="text-[13.5px] sm:text-[15px] font-black text-white leading-snug min-w-0 group-hover:text-slate-300 transition">
                      {topic.name}
                    </h3>
                    <span className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-500">
                      <span>{doneCount}/{topicLines.length}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                    </span>
                  </button>

                  {!isCollapsed && (
                    <ul className="divide-y divide-white/[0.05]">
                      {visibleLines.map(({ fact, idx }) => {
                        const lineKey = `${currentChapter.id}-${topic.id}-${idx}`;
                        const isMastered = isLineMastered(topic.id, idx);

                        return (
                          <li key={idx} className="flex items-start gap-3 py-3 group">
                            <button
                              type="button"
                              onClick={() => toggleMasteredLine(lineKey)}
                              className={`mt-0.5 w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition ${
                                isMastered
                                  ? 'bg-emerald-500 border-emerald-400 text-white'
                                  : 'border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500/60'
                              }`}
                              title={isMastered ? 'পড়া সম্পন্ন' : 'পড়া শেষ চিহ্নিত করুন'}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                            </button>

                            <MarkdownRenderer
                              content={fact}
                              className={`${fontSizeClass} flex-1 min-w-0 break-words select-text ${
                                isMastered ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() => handleCopyLine(fact)}
                              className="p-1 -mr-1 rounded text-slate-600 hover:text-white transition shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="কপি করুন"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <Target className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm text-slate-300 font-bold">কোনো টপিক নির্বাচন করা হয়নি</p>
            <p className="text-xs text-slate-500">স্মার্ট ফিল্টার থেকে অন্তত একটি টপিক সিলেক্ট করুন</p>
          </div>
        )
      )}

      {/* ── Mode 2: Speed cards — hairline grid instead of floating boxes ── */}
      {viewMode === 'grid' && (
        allHighlightedItems.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/[0.07] rounded-2xl overflow-hidden border border-white/[0.07]">
            {allHighlightedItems.map((item) => (
              <div key={item.key} className="bg-[#070b14] p-4 flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate block">
                    {item.topicName}
                  </span>
                  <MarkdownRenderer
                    content={item.fact}
                    className={`${fontSizeClass} break-words ${
                      item.isMastered ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMasteredLine(item.key)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold transition ${
                      item.isMastered ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center transition ${
                      item.isMastered ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span>{item.isMastered ? 'সম্পন্ন' : 'পড়া শেষ'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLine(item.fact)}
                    className="p-1 rounded text-slate-600 hover:text-white transition"
                    title="কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm text-slate-300 font-bold">কোনো দাগানো লাইন পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">ফিল্টার বা সার্চ পরিবর্তন করে দেখুন</p>
          </div>
        )
      )}

      {/* ── Mode 3: Compact topic accordion ──────────────────────────────── */}
      {viewMode === 'accordion' && (
        displayedTopics.length > 0 ? (
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {displayedTopics.map((topic, tIdx) => {
              const topicKey = `${currentChapter.id}-${topic.id}`;
              const isCollapsed = collapsedTopics.has(topicKey);
              const topicLines = Array.isArray(topic.lines) ? topic.lines : [];

              return (
                <div key={topic.id || tIdx}>
                  <button
                    type="button"
                    onClick={() => toggleTopicCollapse(topicKey)}
                    className="w-full py-3 flex items-center justify-between gap-3 text-left group"
                  >
                    <span className="min-w-0">
                      <span className="block font-bold text-slate-100 text-[13px] sm:text-sm truncate group-hover:text-white">
                        {topic.name}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{topicLines.length}টি দাগানো লাইন</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                  </button>

                  {!isCollapsed && (
                    <ul className="pb-3.5 space-y-2">
                      {topicLines.map((fact, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-slate-300">
                          <span className="mt-2 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                          <MarkdownRenderer content={fact} className={`${fontSizeClass} min-w-0 break-words`} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm text-slate-300 font-bold">কোনো টপিক নেই</p>
          </div>
        )
      )}

    </SubjectWorkspace>
  );
}
