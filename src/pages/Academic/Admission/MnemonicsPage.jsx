import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Sparkles, Brain, Search, 
  Copy, Check, Share2
} from 'lucide-react';
import { useAdmissionShortcuts, DEFAULT_ADMISSION_SHORTCUTS } from '../../../hooks/useAdmissionData';
import { NURSING_MNEMONICS } from '../../../data/academic/nursingConfig';
import toast from 'react-hot-toast';

// ── Program Configuration Lookup ──────────────────────────────────────────────
const PROGRAM_META = {
  medical: {
    id: 'medical',
    name: 'মেডিকেল ও ডেন্টাল',
    badge: 'MBBS & BDS Special',
    themeColor: 'from-rose-500 to-pink-600',
    accentText: 'text-rose-400',
    accentBorder: 'border-rose-500/30',
    accentBg: 'bg-rose-500/10',
    glowColor: 'bg-rose-500/10',
    backPath: '/academic/admission/medical',
    backLabel: 'মেডিকেল ড্যাশবোর্ড',
    targetTracks: ['medical', 'hand_calc'],
    subjects: ['সকল বিষয়', 'জীববিজ্ঞান', 'রসায়ন', 'পদার্থবিজ্ঞান', 'হ্যান্ড ক্যালকুলেশন', 'ইংরেজি', 'সাধারণ জ্ঞান']
  },
  nursing: {
    id: 'nursing',
    name: 'নার্সিং ভর্তি পরীক্ষা',
    badge: 'BSc & Diploma Nursing',
    themeColor: 'from-emerald-500 to-teal-600',
    accentText: 'text-emerald-400',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/10',
    glowColor: 'bg-emerald-500/10',
    backPath: '/academic/admission/nursing',
    backLabel: 'নার্সিং ড্যাশবোর্ড',
    targetTracks: ['nursing', 'medical', 'gk_english'],
    subjects: ['সকল বিষয়', 'সাধারণ বিজ্ঞান', 'জীববিজ্ঞান', 'বাংলা', 'ইংরেজি', 'সাধারণ গণিত', 'সাধারণ জ্ঞান']
  },
  engineering: {
    id: 'engineering',
    name: 'ইঞ্জিনিয়ারিং ভর্তি পরীক্ষা',
    badge: 'BUET & CKET Special',
    themeColor: 'from-blue-500 to-indigo-600',
    accentText: 'text-blue-400',
    accentBorder: 'border-blue-500/30',
    accentBg: 'bg-blue-500/10',
    glowColor: 'bg-blue-500/10',
    backPath: '/academic/admission/engineering',
    backLabel: 'ইঞ্জিনিয়ারিং ড্যাশবোর্ড',
    targetTracks: ['engineering', 'varsity_a'],
    subjects: ['সকল বিষয়', 'Higher Math', 'Physics', 'Chemistry', 'ক্যালকুলেটর হ্যাকস']
  },
  'varsity-a': {
    id: 'varsity-a',
    name: 'ভার্সিটি ক-ইউনিট',
    badge: 'DU A Unit & GST Special',
    themeColor: 'from-amber-500 to-orange-600',
    accentText: 'text-amber-400',
    accentBorder: 'border-amber-500/30',
    accentBg: 'bg-amber-500/10',
    glowColor: 'bg-amber-500/10',
    backPath: '/academic/admission/varsity-a',
    backLabel: 'ভার্সিটি ক ড্যাশবোর্ড',
    targetTracks: ['varsity_a', 'hand_calc'],
    subjects: ['সকল বিষয়', 'Higher Math', 'Physics', 'Chemistry', 'Biology', 'হ্যান্ড ক্যালকুলেশন']
  },
  gst: {
    id: 'gst',
    name: 'জিএসটি গুচ্ছ (GST)',
    badge: 'General Science & Tech',
    themeColor: 'from-cyan-500 to-blue-600',
    accentText: 'text-cyan-400',
    accentBorder: 'border-cyan-500/30',
    accentBg: 'bg-cyan-500/10',
    glowColor: 'bg-cyan-500/10',
    backPath: '/academic/admission/gst',
    backLabel: 'গুচ্ছ ড্যাশবোর্ড',
    targetTracks: ['varsity_a', 'medical', 'hand_calc'],
    subjects: ['সকল বিষয়', 'Higher Math', 'Physics', 'Chemistry', 'Biology', 'বাংলা', 'English']
  },
  agri: {
    id: 'agri',
    name: 'কৃষি গুচ্ছ (Agri Cluster)',
    badge: 'Agricultural Universities',
    themeColor: 'from-lime-500 to-emerald-600',
    accentText: 'text-lime-400',
    accentBorder: 'border-lime-500/30',
    accentBg: 'bg-lime-500/10',
    glowColor: 'bg-lime-500/10',
    backPath: '/academic/admission/agri',
    backLabel: 'কৃষি গুচ্ছ ড্যাশবোর্ড',
    targetTracks: ['varsity_a', 'medical'],
    subjects: ['সকল বিষয়', 'Biology', 'Chemistry', 'Physics', 'Higher Math', 'English']
  },
  'varsity-others': {
    id: 'varsity-others',
    name: 'ভার্সিটি খ ও গ ইউনিট',
    badge: 'Arts, Law & Business',
    themeColor: 'from-purple-500 to-pink-600',
    accentText: 'text-purple-400',
    accentBorder: 'border-purple-500/30',
    accentBg: 'bg-purple-500/10',
    glowColor: 'bg-purple-500/10',
    backPath: '/academic/admission/varsity-others',
    backLabel: 'ভার্সিটি ড্যাশবোর্ড',
    targetTracks: ['gk_english'],
    subjects: ['সকল বিষয়', 'বাংলা', 'English', 'সাধারণ জ্ঞান', 'আইসিটি']
  }
};

export default function MnemonicsPage() {
  const location = useLocation();
  const params = useParams();

  // Detect program
  const programKey = useMemo(() => {
    const p = location.pathname.toLowerCase();
    if (p.includes('/medical/')) return 'medical';
    if (p.includes('/nursing/')) return 'nursing';
    if (p.includes('/engineering/')) return 'engineering';
    if (p.includes('/varsity-a/')) return 'varsity-a';
    if (p.includes('/gst/')) return 'gst';
    if (p.includes('/agri/')) return 'agri';
    if (p.includes('/varsity-others/')) return 'varsity-others';
    return 'medical';
  }, [location.pathname]);

  const meta = PROGRAM_META[programKey] || PROGRAM_META.medical;
  const trackId = params.trackId;

  // If nursing with specific track, adjust back button
  const currentBackPath = useMemo(() => {
    if (programKey === 'nursing' && trackId) {
      return `/academic/admission/nursing/${trackId}`;
    }
    return meta.backPath;
  }, [programKey, trackId, meta.backPath]);

  const [selectedSubject, setSelectedSubject] = useState('সকল বিষয়');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const { data: serverShortcuts = DEFAULT_ADMISSION_SHORTCUTS } = useAdmissionShortcuts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Merge server shortcuts with nursing/medical specific lists
  const allAvailableMnemonics = useMemo(() => {
    const list = [...serverShortcuts];

    // Merge Nursing mnemonics if not already present
    if (programKey === 'nursing') {
      NURSING_MNEMONICS.forEach(nm => {
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

    return list;
  }, [serverShortcuts, programKey]);

  // Filter for this program
  const programShortcuts = useMemo(() => {
    return allAvailableMnemonics.filter(item => {
      if (meta.targetTracks && meta.targetTracks.length > 0) {
        if (item.track && !meta.targetTracks.includes(item.track) && item.track !== 'all') {
          const subMatch = meta.subjects.some(s => s !== 'সকল বিষয়' && item.subject?.toLowerCase().includes(s.toLowerCase()));
          if (!subMatch) return false;
        }
      }
      return true;
    });
  }, [allAvailableMnemonics, meta]);

  // Apply User UI Filters
  const filteredMnemonics = useMemo(() => {
    return programShortcuts.filter(item => {
      // Subject filter
      if (selectedSubject !== 'সকল বিষয়') {
        const sub = item.subject || '';
        if (!sub.toLowerCase().includes(selectedSubject.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchTech = item.technique?.toLowerCase().includes(query);
        const matchSub = item.subject?.toLowerCase().includes(query);
        const matchRef = item.reference?.toLowerCase().includes(query);
        const matchCat = item.category?.toLowerCase().includes(query);
        const matchDet = Array.isArray(item.details) 
          ? item.details.some(d => d.toLowerCase().includes(query))
          : item.details?.toLowerCase().includes(query);

        if (!matchTitle && !matchTech && !matchSub && !matchRef && !matchCat && !matchDet) {
          return false;
        }
      }

      return true;
    });
  }, [programShortcuts, selectedSubject, searchQuery]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('ছন্দ / টেকনিক কপি হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-bangla pb-24 selection:bg-rose-500/30">
      
      {/* ── Top Header & Hero Banner ────────────────────────────────────────── */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link
            to={currentBackPath}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{meta.backLabel}</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${meta.accentBg} ${meta.accentText} ${meta.accentBorder}`}>
              {meta.badge}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400 hidden sm:inline">
              মোট {filteredMnemonics.length}টি ছন্দ
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className={`absolute top-0 right-0 w-96 h-96 ${meta.glowColor} rounded-full blur-3xl pointer-events-none`} />

          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-300 text-xs font-black tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>HIGH-YIELD MNEMONICS & SHORTCUTS HUB</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {meta.name} <span className={`bg-clip-text text-transparent bg-gradient-to-r ${meta.themeColor}`}>ছন্দ ও স্পেশাল ট্রিকস</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ভর্তি পরীক্ষায় কনফিউজিং তথ্য দ্রুত মনে রাখা, জটিল ক্যালকুলেশন মাত্র ৫ সেকেন্ডে সমাধান এবং নির্ভুল উত্তর বের করার জন্য প্রমাণিত ছন্দ ও হ্যাকস।
            </p>
          </div>
        </div>

        {/* ── Subject Filter Tabs & Search Bar ─────────────────────────────── */}
        <div className="space-y-4">
          
          {/* Top Row: Live Search & Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="যেকোনো ছন্দ, সূত্র, বিষয়ের নাম বা টপিক খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-medium">
                ফলাফল: <strong className="text-white font-mono">{filteredMnemonics.length}</strong> টি ছন্দ
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-rose-400 hover:underline font-bold ml-2"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>

          {/* Subject Pills Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {meta.subjects.map((sub) => {
              const isSelected = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `bg-gradient-to-r ${meta.themeColor} text-white shadow-lg`
                      : 'bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Mnemonics Grid Feed ──────────────────────────────────────────── */}
        {filteredMnemonics.length === 0 ? (
          <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-12 text-center space-y-4">
            <Brain className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">কোনো ছন্দ খুঁজে পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার সার্চ কি-ওয়ার্ডটি পরিবর্তন করে পুনরায় চেষ্টা করুন অথবা অন্য বিষয়ে ফিল্টার করে দেখুন।
            </p>
            <button
              onClick={() => { setSelectedSubject('সকল বিষয়'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-bold hover:bg-slate-700 transition"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMnemonics.map((item, idx) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id || idx}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 p-6 flex flex-col justify-between space-y-4 transition shadow-xl group hover:-translate-y-1 duration-300"
                >
                  <div className="space-y-3.5">
                    {/* Header: Subject & Reference Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${meta.accentBg} ${meta.accentText} ${meta.accentBorder}`}>
                        {item.subject || 'সাধারণ'}
                      </span>
                      {item.reference && (
                        <span className="text-[11px] text-slate-500 font-medium italic truncate max-w-[150px]">
                          {item.reference}
                        </span>
                      )}
                    </div>

                    {/* Topic Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                      {item.title || item.topic}
                    </h3>

                    {/* Glowing Technique Box */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/20 p-4 space-y-1 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          ছন্দ / টেকনিক
                        </span>
                        <button
                          onClick={() => handleCopy(item.technique, item.id)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95"
                          title="কপি করুন"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm font-mono font-bold text-amber-200 leading-relaxed pt-1">
                        {item.technique}
                      </p>
                    </div>

                    {/* Explanation / Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      {Array.isArray(item.details) ? (
                        item.details.map((line, lIdx) => (
                          <p key={lIdx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{line}</span>
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.details || item.explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Quick Action Link */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleCopy(`${item.title}: ${item.technique}\n${Array.isArray(item.details) ? item.details.join('\n') : item.details || item.explanation}`, item.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition"
                    >
                      <Share2 className="w-3 h-3" />
                      সম্পূর্ণ কপি করুন
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}
