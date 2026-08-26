import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../config/firebase';
import { useAcademicSubjects } from '../../../hooks/useAcademicSubjects';
import { QK, STALE } from '../../../lib/queryConfig';
import { SkeletonList } from '../../../components/UI/Skeleton';
import { 
  BookOpen, Search, Copy, Check, Sparkles, Filter, 
  Layers, Bookmark, Zap, Atom, Calculator, Code, X,
  ChevronRight, ArrowUpRight, Printer, FileText
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { toBn } from '../../../lib/format';
import toast from 'react-hot-toast';

const SUBJECT_THEMES = {
  'পদার্থবিজ্ঞান': {
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
  },
  'পদার্থবিজ্ঞান ১ম পত্র': {
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
  },
  'পদার্থবিজ্ঞান ২য় পত্র': {
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    borderGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/5',
  },
  'রসায়ন': {
    icon: Atom,
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
  },
  'রসায়ন ১ম পত্র': {
    icon: Atom,
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
  },
  'রসায়ন ২য় পত্র': {
    icon: Atom,
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    borderGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/5',
  },
  'উচ্চতর গণিত': {
    icon: Calculator,
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderGlow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/5',
  },
  'উচ্চতর গণিত ১ম পত্র': {
    icon: Calculator,
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderGlow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/5',
  },
  'উচ্চতর গণিত ২য় পত্র': {
    icon: Calculator,
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    borderGlow: 'hover:border-indigo-500/40 hover:shadow-indigo-500/5',
  },
  'আইসিটি': {
    icon: Code,
    gradient: 'from-fuchsia-500 to-pink-500',
    badge: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    borderGlow: 'hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/5',
  },
};

export default function SmartFormulaSheet() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarked_formulas') || '[]');
    } catch {
      return [];
    }
  });

  const { data: availableSubjects = [], isLoading: loadingSubjects } = useAcademicSubjects();

  const { data: formulas = [], isLoading: loadingFormulas } = useQuery({
    queryKey: QK.formulas(),
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'smart_formulas'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: STALE.CONFIG,
  });

  const loading = loadingSubjects || loadingFormulas;

  // Toggle Bookmark
  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('bookmarked_formulas', JSON.stringify(next));
      toast.success(prev.includes(id) ? 'বুকমার্ক সরানো হয়েছে' : 'সূত্রটি বুকমার্ক করা হয়েছে 🔖', { duration: 1500 });
      return next;
    });
  };

  // Copy LaTeX
  const handleCopyLatex = (formula) => {
    const textToCopy = formula.latexCode || formula.title;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(formula.id);
    toast.success('LaTeX সূত্র কপি হয়েছে! 📋', { duration: 1500 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dynamic Subjects List with counts
  const subjectList = useMemo(() => {
    const counts = {};
    formulas.forEach(f => {
      counts[f.subject] = (counts[f.subject] || 0) + 1;
    });

    const list = [{ id: 'All', label: 'সকল বিষয়', count: formulas.length }];
    
    // Group from available subjects or unique in database
    const dbSubjects = [...new Set(formulas.map(f => f.subject).filter(Boolean))];
    dbSubjects.forEach(sub => {
      list.push({
        id: sub,
        label: sub,
        count: counts[sub] || 0,
      });
    });

    return list;
  }, [formulas]);

  // Dynamic Chapters for current subject
  const chapterList = useMemo(() => {
    let filtered = formulas;
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(f => f.subject === selectedSubject);
    }
    const chapters = [...new Set(filtered.map(f => f.category).filter(Boolean))];
    return ['All', ...chapters];
  }, [formulas, selectedSubject]);

  const formatDescription = (text) => {
    if (!text) return text;
    if (text.includes('$')) return text;
    const hasBengali = /[\u0980-\u09FF]/.test(text);
    if (!hasBengali && (text.includes('\\') || text.includes('_') || text.includes('^') || text.includes('='))) {
      return `$${text}$`;
    }
    return text;
  };

  // Filtered Formulas
  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (f.title && f.title.toLowerCase().includes(q)) || 
        (f.category && f.category.toLowerCase().includes(q)) ||
        (f.subject && f.subject.toLowerCase().includes(q)) ||
        (f.description && f.description.toLowerCase().includes(q));

      const matchesSubject = selectedSubject === 'All' || f.subject === selectedSubject;
      const matchesChapter = selectedChapter === 'All' || f.category === selectedChapter;

      return matchesSearch && matchesSubject && matchesChapter;
    });
  }, [formulas, searchQuery, selectedSubject, selectedChapter]);

  // Group by Subject, then Category
  const groupedFormulas = useMemo(() => {
    return filteredFormulas.reduce((acc, curr) => {
      const sub = curr.subject || 'সাধারণ';
      const cat = curr.category || 'মূল সূত্রাবলী';
      if (!acc[sub]) acc[sub] = {};
      if (!acc[sub][cat]) acc[sub][cat] = [];
      acc[sub][cat].push(curr);
      return acc;
    }, {});
  }, [filteredFormulas]);

  return (
    <div className="relative min-h-screen bg-[#070b14] text-slate-100 pt-20 pb-24 font-bangla selection:bg-indigo-500/30">
      <Helmet>
        <title>স্মার্ট ফর্মুলা শিট (Smart Formula Vault) | একাডেমিক হাব</title>
        <meta name="description" content="এইচএসসি ও এসএসসি পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিতের গুরুত্বপূর্ণ সকল সূত্র, সমীকরণ ও ব্যাখ্যা একসাথে।" />
      </Helmet>

      {/* Atmospheric Ambient Glows */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-96 w-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-96 right-10 h-80 w-80 rounded-full bg-emerald-600/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>স্মার্ট সূত্রভাণ্ডার ও ইকুয়েশন ভল্ট</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            স্মার্ট <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">ফর্মুলা শিট</span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            পদার্থবিজ্ঞান, রসায়ন ও গণিতের জটিল সমীকরণসমূহ, চলকের ব্যাখ্যা ও নোট এক ক্লিকে খুঁজে নাও এবং রিভিশন দাও।
          </p>

          {/* Quick Stats & Action Pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
              📚 মোট সূত্র: <strong className="text-slate-200">{toBn(formulas.length)}টি</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">
              🔖 বুকমার্কড: <strong className="text-indigo-400">{toBn(bookmarkedIds.length)}টি</strong>
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF সেভ করুন</span>
            </button>
          </div>
        </div>

        {/* Subject Pills Segment */}
        <div className="flex items-center justify-start sm:justify-center gap-2 mb-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {subjectList.map(sub => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => {
                  setSelectedSubject(sub.id);
                  setSelectedChapter('All');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <span>{sub.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'}`}>
                  {toBn(sub.count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Chapter Quick Filter Ribbon */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-3 mb-10">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Box */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="সূত্র, চলক বা অধ্যায় দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Current Matching Count */}
            <span className="text-xs text-slate-400 font-medium">
              পাওয়া গেছে: <strong className="text-emerald-400 font-bold">{toBn(filteredFormulas.length)}টি</strong> সূত্র
            </span>

          </div>

          {/* Chapter Chips */}
          {chapterList.length > 1 && (
            <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">অধ্যায়:</span>
              {chapterList.map(chap => {
                const active = selectedChapter === chap;
                return (
                  <button
                    key={chap}
                    type="button"
                    onClick={() => setSelectedChapter(chap)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {chap === 'All' ? 'সকল অধ্যায়' : chap}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Formulas Grid Section */}
        {loading ? (
          <SkeletonList count={6} />
        ) : Object.keys(groupedFormulas).length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/60 max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-slate-300">কোনো সূত্র পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 mt-1">অন্য কোনো বিষয় নির্বাচন করুন বা বানান সঠিক করে সার্চ করুন।</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedFormulas).map(([subject, categories]) => {
              const theme = SUBJECT_THEMES[subject] || {
                icon: BookOpen,
                badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                borderGlow: 'hover:border-indigo-500/40',
              };
              const ThemeIcon = theme.icon;

              return (
                <div key={subject} className="space-y-6">
                  
                  {/* Subject Header Ribbon */}
                  <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                    <span className={`p-2 rounded-xl border ${theme.badge}`}>
                      <ThemeIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">{subject}</h2>
                    </div>
                  </div>

                  {/* Categories / Chapters */}
                  <div className="space-y-8 pl-0 sm:pl-2">
                    {Object.entries(categories).map(([category, catFormulas]) => (
                      <div key={category} className="space-y-4">
                        
                        {/* Chapter Title & Badge */}
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                          <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                          <span>{category}</span>
                          <span className="text-[11px] text-slate-500 font-normal">({toBn(catFormulas.length)}টি সূত্র)</span>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                          {catFormulas.map(formula => {
                            const isBookmarked = bookmarkedIds.includes(formula.id);
                            const isCopied = copiedId === formula.id;

                            return (
                              <div
                                key={formula.id}
                                className={`group relative p-5 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md transition-all duration-200 flex flex-col justify-between ${theme.borderGlow} hover:-translate-y-0.5`}
                              >
                                
                                <div>
                                  {/* Card Top: Title + Action Icons */}
                                  <div className="flex items-start justify-between gap-3 mb-3">
                                    <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
                                      {formula.title}
                                    </h4>

                                    <div className="flex items-center gap-1 shrink-0">
                                      {/* Copy LaTeX */}
                                      <button
                                        type="button"
                                        title="কপি করুন"
                                        onClick={() => handleCopyLatex(formula)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                                      >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                      </button>

                                      {/* Bookmark */}
                                      <button
                                        type="button"
                                        title="বুকমার্ক করুন"
                                        onClick={() => toggleBookmark(formula.id)}
                                        className={`p-1.5 rounded-lg transition ${
                                          isBookmarked 
                                            ? 'text-amber-400 bg-amber-500/10' 
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                      >
                                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Equation Showcase Box */}
                                  <div className="my-3 p-4 rounded-2xl bg-slate-950/80 border border-white/[0.04] flex items-center justify-center overflow-x-auto text-slate-100 font-serif min-h-[72px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-inner">
                                    <BlockMath math={formula.latexCode || formula.formula || 'E = mc^2'} />
                                  </div>

                                  {/* Description & Variable Glossary */}
                                  {formula.description && (
                                    <div className="mt-3 text-xs text-slate-400 prose prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1">
                                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                        {formatDescription(formula.description)}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>

                                {/* Card Footer: Category Tag */}
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                                  <span className="truncate">{formula.category}</span>
                                  <span className="text-[10px] text-indigo-400/80 font-bold">LaTeX Ready</span>
                                </div>

                              </div>
                            );
                          })}
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
