import { useState, useMemo, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Zap, Sparkles, Brain, Copy, Check, ChevronDown,
  Layers, ListChecks, Calculator, BookOpen, Search
} from 'lucide-react';
import { useAdmissionShortcuts, DEFAULT_ADMISSION_SHORTCUTS } from '../../../hooks/useAdmissionData';
import { NURSING_MNEMONICS, NURSING_SUBJECTS_CONFIG } from '../../../data/academic/nursingConfig';
import { MEDICAL_SUBJECTS_DETAILED } from '../../../data/academic/medicalConfig';
import SubjectWorkspace from '../../../components/Academic/SubjectWorkspace';
import toast from 'react-hot-toast';

// ── Program configuration ────────────────────────────────────────────────────
const PROGRAM_META = {
  medical: {
    name: 'মেডিকেল ও ডেন্টাল', shortName: 'মেডিকেল', accent: 'rose',
    backPath: '/academic/admission/medical', backLabel: 'মেডিকেল ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['medical', 'hand_calc']
  },
  nursing: {
    name: 'নার্সিং ভর্তি পরীক্ষা', shortName: 'নার্সিং', accent: 'emerald',
    backPath: '/academic/admission/nursing', backLabel: 'নার্সিং ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['nursing', 'medical', 'gk_english']
  },
  engineering: {
    name: 'ইঞ্জিনিয়ারিং ভর্তি পরীক্ষা', shortName: 'ইঞ্জিনিয়ারিং', accent: 'blue',
    backPath: '/academic/admission/engineering', backLabel: 'ইঞ্জিনিয়ারিং ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['engineering', 'varsity_a']
  },
  'varsity-a': {
    name: 'ভার্সিটি ক-ইউনিট', shortName: 'ভার্সিটি ক', accent: 'amber',
    backPath: '/academic/admission/varsity-a', backLabel: 'ভার্সিটি ক ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['varsity_a', 'hand_calc']
  },
  gst: {
    name: 'জিএসটি গুচ্ছ (GST)', shortName: 'GST', accent: 'fuchsia',
    backPath: '/academic/admission/gst', backLabel: 'গুচ্ছ ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['varsity_a', 'medical', 'hand_calc']
  },
  agri: {
    name: 'কৃষি গুচ্ছ', shortName: 'কৃষি', accent: 'lime',
    backPath: '/academic/admission/agri', backLabel: 'কৃষি ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['medical', 'varsity_a', 'hand_calc']
  },
  'varsity-others': {
    name: 'ভার্সিটি অন্যান্য ইউনিট', shortName: 'ভার্সিটি B/C/D', accent: 'indigo',
    backPath: '/academic/admission/varsity-others', backLabel: 'ড্যাশবোর্ডে ফিরে যান',
    targetTracks: ['varsity_a', 'gk_english', 'hand_calc']
  }
};

const GENERAL_CHAPTER = 'সাধারণ ও মিশ্র';

const norm = (v) => String(v || '').trim();

/**
 * Mnemonic records carry no chapter field (neither the seed data nor the admin
 * form has one), so the middle level of বিষয় → অধ্যায় → ছন্দ is derived:
 *
 *   1. an explicit `chapter` if the record ever gains one
 *   2. otherwise the real chapter whose distinctive keywords appear in the
 *      mnemonic's title — same fuzzy match the subject pages already use
 *   3. otherwise the record's `category`
 *   4. otherwise a shared "general" bucket
 *
 * Adding a chapter field in the admin panel would make step 2 unnecessary.
 */
function buildChapterResolver(subjectConfigs) {
  const chapterKeywords = [];
  subjectConfigs.forEach((sub) => {
    (sub.chapters || []).forEach((ch) => {
      const name = norm(ch.name);
      if (!name) return;
      const words = name
        .replace(/\(.*?\)/g, ' ')
        .split(/[\s,:\-–—/]+/)
        .filter(w => w.length > 3);
      if (words.length > 0) chapterKeywords.push({ name, words });
    });
  });

  return (item) => {
    const explicit = norm(item.chapter);
    if (explicit) return explicit;

    const haystack = `${norm(item.title)} ${norm(item.topic)}`.toLowerCase();
    if (haystack) {
      for (const { name, words } of chapterKeywords) {
        if (words.some(w => haystack.includes(w.toLowerCase()))) return name;
      }
    }

    const category = norm(item.category);
    if (category) return category;
    return GENERAL_CHAPTER;
  };
}

const CATEGORY_TABS = [
  { key: 'all', label: 'সব ছন্দ', icon: ListChecks },
  { key: 'mnemonic', label: 'ছন্দ ও মেমোরি', icon: Brain },
  { key: 'calc', label: 'হ্যান্ড ক্যালকুলেশন', icon: Calculator },
  { key: 'other', label: 'অন্যান্য টেকনিক', icon: Sparkles }
];

function categoryOf(item) {
  const blob = `${norm(item.category)} ${norm(item.track)}`.toLowerCase();
  if (blob.includes('hand_calc') || blob.includes('ক্যালকুলেশন') || blob.includes('calc')) return 'calc';
  if (blob.includes('ছন্দ') || blob.includes('মেমোরাইজেশন') || blob.includes('mnemonic')) return 'mnemonic';
  return 'other';
}

export default function MnemonicsPage() {
  const location = useLocation();
  const params = useParams();

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

  const meta = PROGRAM_META[programKey] || PROGRAM_META.medical;
  const trackId = params.trackId;

  const backPath = useMemo(() => {
    if (programKey === 'nursing' && trackId) return `/academic/admission/nursing/${trackId}`;
    return meta.backPath;
  }, [programKey, trackId, meta.backPath]);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState(new Set());
  const [collapsedChapters, setCollapsedChapters] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  const { data: serverShortcuts = DEFAULT_ADMISSION_SHORTCUTS } = useAdmissionShortcuts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const resolveChapter = useMemo(() => {
    const configs = programKey === 'nursing' ? NURSING_SUBJECTS_CONFIG : MEDICAL_SUBJECTS_DETAILED;
    return buildChapterResolver(configs);
  }, [programKey]);

  // Every mnemonic available to this program
  const programMnemonics = useMemo(() => {
    const list = [...(Array.isArray(serverShortcuts) ? serverShortcuts : [])];

    if (programKey === 'nursing') {
      NURSING_MNEMONICS.forEach((nm) => {
        if (!list.some(s => s.id === nm.id)) {
          list.push({
            id: nm.id,
            track: 'nursing',
            trackLabel: 'নার্সিং স্পেশাল',
            title: nm.topic,
            technique: nm.technique,
            category: 'ছন্দ ও মেমোরাইজেশন',
            subject: nm.subject,
            details: nm.explanation,
            reference: nm.reference
          });
        }
      });
    }

    return list
      .filter((item) => {
        if (!meta.targetTracks?.length) return true;
        if (!item.track || item.track === 'all') return true;
        return meta.targetTracks.includes(item.track);
      })
      .map((item, idx) => ({
        ...item,
        id: item.id || `mn-${idx}`,
        subjectName: norm(item.subject) || 'সাধারণ',
        chapterName: resolveChapter(item),
        categoryKey: categoryOf(item)
      }));
  }, [serverShortcuts, programKey, meta, resolveChapter]);

  // Subjects derived from the data, so no empty tabs are ever shown
  const subjects = useMemo(() => {
    const map = new Map();
    programMnemonics.forEach((m) => {
      map.set(m.subjectName, (map.get(m.subjectName) || 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ id: name, name, badge: String(count) }));
  }, [programMnemonics]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(s => s.id === selectedSubject)) {
      setSelectedSubject(subjects[0].id);
    }
  }, [subjects, selectedSubject]);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const matchesQuery = (item) => {
    if (!isSearching) return true;
    const details = Array.isArray(item.details) ? item.details.join(' ') : norm(item.details);
    const blob = [
      item.title, item.topic, item.technique, item.subjectName,
      item.chapterName, item.reference, item.category, details
    ].map(norm).join(' ').toLowerCase();
    return blob.includes(query);
  };

  const matchesCategory = (item) => activeCategory === 'all' || item.categoryKey === activeCategory;

  // While searching we look across every subject — that is the whole point of
  // the search box when the hub holds hundreds of mnemonics.
  const visibleMnemonics = useMemo(() => {
    return programMnemonics.filter((item) => {
      if (!matchesCategory(item)) return false;
      if (isSearching) return matchesQuery(item);
      return item.subjectName === selectedSubject;
    });
  }, [programMnemonics, selectedSubject, activeCategory, query]);

  // Group into বিষয় → অধ্যায় → ছন্দ
  const grouped = useMemo(() => {
    const bySubject = new Map();
    visibleMnemonics.forEach((item) => {
      if (!bySubject.has(item.subjectName)) bySubject.set(item.subjectName, new Map());
      const chapters = bySubject.get(item.subjectName);
      if (!chapters.has(item.chapterName)) chapters.set(item.chapterName, []);
      chapters.get(item.chapterName).push(item);
    });

    return [...bySubject.entries()].map(([subjectName, chapters]) => ({
      subjectName,
      chapters: [...chapters.entries()]
        .sort((a, b) => (a[0] === GENERAL_CHAPTER ? 1 : b[0] === GENERAL_CHAPTER ? -1 : 0))
        .map(([chapterName, items]) => ({ chapterName, items }))
    }));
  }, [visibleMnemonics]);

  const categoryCounts = useMemo(() => {
    const base = isSearching
      ? programMnemonics.filter(matchesQuery)
      : programMnemonics.filter(m => m.subjectName === selectedSubject);
    return {
      all: base.length,
      mnemonic: base.filter(m => m.categoryKey === 'mnemonic').length,
      calc: base.filter(m => m.categoryKey === 'calc').length,
      other: base.filter(m => m.categoryKey === 'other').length
    };
  }, [programMnemonics, selectedSubject, query]);

  const toggleOpen = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleChapter = (key) => {
    setCollapsedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('ছন্দ / টেকনিক কপি হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalChapters = useMemo(() => {
    const set = new Set(programMnemonics.map(m => `${m.subjectName}|${m.chapterName}`));
    return set.size;
  }, [programMnemonics]);

  return (
    <SubjectWorkspace
      accent={meta.accent}
      storageKey={`mnemonics_${programKey}`}
      chapterLabel="বিষয়"
      breadcrumbs={[
        { label: 'একাডেমিক', to: '/academic' },
        { label: 'ভর্তি প্রস্তুতি', to: '/academic/admission' },
        { label: meta.shortName, to: backPath },
        { label: 'ছন্দ ও ট্রিকস' }
      ]}
      backLink={{ to: backPath, label: meta.backLabel }}
      hero={{
        icon: Brain,
        title: 'ছন্দ ও স্পেশাল ট্রিকস',
        subtitle: 'কনফিউজিং তথ্য দ্রুত মনে রাখা ও জটিল ক্যালকুলেশন সেকেন্ডে সমাধানের প্রমাণিত ছন্দ। বিষয় বেছে নিন, অথবা সার্চ করলে সব বিষয় থেকে খুঁজে দেবে।',
        chips: [
          { label: meta.shortName, tone: 'accent' },
          { label: 'High-yield Mnemonics' }
        ]
      }}
      stats={[
        { label: 'মোট ছন্দ', value: `${programMnemonics.length}টি`, icon: Sparkles },
        { label: 'বিষয়', value: `${subjects.length}টি`, icon: BookOpen },
        { label: 'অধ্যায়', value: `${totalChapters}টি`, icon: Layers },
        { label: 'এই তালিকায়', value: `${visibleMnemonics.length}টি`, icon: ListChecks }
      ]}
      chapters={subjects}
      selectedChapterId={selectedSubject}
      onSelectChapter={(id) => {
        setSelectedSubject(id);
        setSearchQuery('');
      }}
      chapterHeading={isSearching ? `"${searchQuery}" — সব বিষয়ে ফলাফল` : selectedSubject}
      chapterBadge={isSearching ? 'সার্চ' : meta.shortName}
      chapterAction={(
        <span className="text-[11px] text-slate-400 font-medium">
          <strong className="text-white font-mono">{visibleMnemonics.length}</strong>টি ছন্দ
        </span>
      )}
      tabs={CATEGORY_TABS.map(t => ({ ...t, count: categoryCounts[t.key] }))}
      activeTab={activeCategory}
      onSelectTab={setActiveCategory}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: 'ছন্দ, সূত্র, টপিক বা অধ্যায়ের নাম দিয়ে খুঁজুন...'
      }}
      onResetFilters={() => {
        setSearchQuery('');
        setActiveCategory('all');
      }}
      hasActiveFilter={isSearching || activeCategory !== 'all'}
      emptyState={(
        <div className="py-16 text-center space-y-2">
          <Brain className="w-9 h-9 text-slate-700 mx-auto" />
          <p className="text-sm text-slate-300 font-bold">এই প্রোগ্রামের ছন্দ যুক্ত হচ্ছে</p>
        </div>
      )}
    >
      {isSearching && (
        <div className="flex items-center gap-2 text-[11.5px] text-slate-400">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>
            সব বিষয় থেকে <strong className="text-white font-mono">{visibleMnemonics.length}</strong>টি ফলাফল
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="font-bold text-slate-300 hover:text-white underline underline-offset-2"
          >
            সার্চ মুছুন
          </button>
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <Brain className="w-9 h-9 text-slate-700 mx-auto" />
          <p className="text-sm text-slate-300 font-bold">কোনো ছন্দ খুঁজে পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500">সার্চ কি-ওয়ার্ড বা ক্যাটাগরি বদলে দেখুন</p>
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map((subjectGroup) => (
            <div key={subjectGroup.subjectName} className="space-y-5">

              {/* Subject heading only matters while searching across subjects */}
              {isSearching && (
                <h2 className="text-[12px] font-black text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {subjectGroup.subjectName}
                </h2>
              )}

              {subjectGroup.chapters.map((chapterGroup) => {
                const chapterKey = `${subjectGroup.subjectName}|${chapterGroup.chapterName}`;
                const isChapterCollapsed = collapsedChapters.has(chapterKey);

                return (
                  <section key={chapterKey}>
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapterKey)}
                      className="w-full flex items-baseline justify-between gap-3 pb-2 border-b border-white/[0.09] text-left group"
                    >
                      <h3 className="text-[11px] sm:text-[11.5px] font-bold text-slate-500 tracking-wide leading-snug min-w-0 group-hover:text-slate-300 transition">
                        {chapterGroup.chapterName}
                      </h3>
                      <span className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-slate-500">
                        <span>{chapterGroup.items.length}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isChapterCollapsed ? '' : 'rotate-180'}`} />
                      </span>
                    </button>

                    {!isChapterCollapsed && (
                      <div className="divide-y divide-white/[0.05]">
                        {chapterGroup.items.map((item) => {
                          const isOpen = openIds.has(item.id);
                          const isCopied = copiedId === item.id;
                          const details = Array.isArray(item.details)
                            ? item.details
                            : item.details ? [item.details] : [];

                          return (
                            <div key={item.id}>
                              {/* One row per mnemonic — expands in place */}
                              <button
                                type="button"
                                onClick={() => toggleOpen(item.id)}
                                aria-expanded={isOpen}
                                className="w-full flex items-start justify-between gap-3 py-3 text-left group"
                              >
                                <span className="flex items-start gap-2.5 min-w-0">
                                  <Zap className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isOpen ? 'text-amber-400' : 'text-slate-600'}`} />
                                  <span className="min-w-0">
                                    <span className="block text-[13.5px] sm:text-[15px] font-bold leading-snug text-white">
                                      {item.title || item.topic}
                                    </span>
                                    {!isOpen && item.technique && (
                                      <span className="block text-[11.5px] text-amber-300/75 font-mono truncate mt-1">
                                        {item.technique}
                                      </span>
                                    )}
                                  </span>
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 mt-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                              </button>

                              {isOpen && (
                                <div className="pb-4 pl-6 space-y-3">
                                  {item.technique && (
                                    <div className="rounded-xl bg-amber-500/[0.07] border border-amber-500/20 p-3 flex items-start justify-between gap-3">
                                      <p className="text-[12.5px] sm:text-sm font-mono font-bold text-amber-200 leading-relaxed min-w-0 break-words">
                                        {item.technique}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => handleCopy(item.technique, item.id)}
                                        className="p-1 rounded text-amber-500/70 hover:text-amber-200 transition shrink-0"
                                        title="কপি করুন"
                                      >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                  )}

                                  {details.length > 0 && (
                                    <ul className="space-y-1.5">
                                      {details.map((line, lIdx) => (
                                        <li key={lIdx} className="text-[12px] sm:text-[13px] text-slate-300 leading-relaxed flex items-start gap-2">
                                          <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                                          <span className="min-w-0 break-words">{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {item.reference && (
                                    <p className="text-[11px] text-slate-500 italic">{item.reference}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </SubjectWorkspace>
  );
}
