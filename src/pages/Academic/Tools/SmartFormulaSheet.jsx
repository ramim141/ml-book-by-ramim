import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { collection, getDocs } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../config/firebase';
import { useAcademicSubjects } from '../../../hooks/useAcademicSubjects';
import { QK, STALE } from '../../../lib/queryConfig';
import { SkeletonList } from '../../../components/UI/Skeleton';
import { BookOpen, Search, BookA, Calculator, Atom, Code } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function SmartFormulaSheet() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [selectedFormula, setSelectedFormula] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  const dynamicSubjects = useMemo(() => {
    return ['All', ...availableSubjects.map(s => s.label)];
  }, [availableSubjects]);

  const dynamicChapters = useMemo(() => {
    if (selectedSubject === 'All') return ['All'];
    const s = availableSubjects.find(x => x.label === selectedSubject);
    if (s && s.chapters) {
      return ['All', ...s.chapters.map(c => c.name)];
    }
    return ['All'];
  }, [availableSubjects, selectedSubject]);

  const dynamicFormulasTitles = useMemo(() => {
    let filtered = formulas;
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(f => f.subject === selectedSubject);
    }
    if (selectedChapter !== 'All') {
      filtered = filtered.filter(f => f.category === selectedChapter);
    }
    // ensure unique titles
    const uniqueTitles = [...new Set(filtered.map(f => f.title))];
    return ['All', ...uniqueTitles];
  }, [formulas, selectedSubject, selectedChapter]);
  
  const getSubjectIcon = (subLabel) => {
    const s = availableSubjects.find(x => x.label === subLabel);
    if (s && s.emoji) {
      return <span className="text-sm">{s.emoji}</span>;
    }
    return <BookOpen className="w-4 h-4" />;
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

  const filteredFormulas = useMemo(() => {
    return formulas.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = selectedSubject === 'All' || f.subject === selectedSubject;
      const matchesChapter = selectedChapter === 'All' || f.category === selectedChapter;
      const matchesFormula = selectedFormula === 'All' || f.title === selectedFormula;
      return matchesSearch && matchesSubject && matchesChapter && matchesFormula;
    });
  }, [formulas, searchQuery, selectedSubject, selectedChapter, selectedFormula]);

  // Group by Subject, then Category
  const groupedFormulas = useMemo(() => {
    return filteredFormulas.reduce((acc, curr) => {
      if (!acc[curr.subject]) acc[curr.subject] = {};
      if (!acc[curr.subject][curr.category]) acc[curr.subject][curr.category] = [];
      acc[curr.subject][curr.category].push(curr);
      return acc;
    }, {});
  }, [filteredFormulas]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white pt-24 pb-16 font-bangla">
      <Helmet>
        <title>স্মার্ট ফর্মুলা শিট (Smart Formula Sheet) | একাডেমিক হাব</title>
        <meta name="description" content="এইচএসসি (HSC) এবং এসএসসি (SSC) এর পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত এর সকল প্রয়োজনীয় সূত্র একসাথে। স্মার্ট ফর্মুলা শিটের মাধ্যমে খুব সহজেই সূত্র খুঁজে বের করুন এবং মুখস্থ করুন।" />
        <meta name="keywords" content="hsc formula sheet, ssc formula, physics formula, chemistry formula, higher math formula, এইচএসসি সূত্র, স্মার্ট ফর্মুলা শিট" />
        <meta property="og:title" content="স্মার্ট ফর্মুলা শিট | একাডেমিক হাব" />
        <meta property="og:description" content="এইচএসসি এবং এসএসসি শিক্ষার্থীদের জন্য পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিতের গুরুত্বপূর্ণ সব সূত্র একসাথে।" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-emerald-500/10 rounded-2xl mb-4 border border-emerald-500/20 shadow-inner">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-emerald-400 drop-shadow-sm mb-4">
            স্মার্ট ফর্মুলা শিট
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-lg mx-auto">
            ফিজিক্স, ম্যাথ ও কেমিস্ট্রির সকল গুরুত্বপূর্ণ সূত্র এক জায়গায়। সহজেই সার্চ করে খুঁজে নিন।
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800/80 backdrop-blur-sm p-4 sm:p-6 mb-8 flex flex-col md:flex-row gap-4 justify-between md:items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-[100px] pointer-events-none bg-gradient-to-br from-emerald-500 to-teal-500"></div>
           
           {/* Mobile Search & Filter Toggle Row */}
           <div className="flex gap-2 w-full md:hidden relative z-10">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ফর্মুলা বা অধ্যায় খুঁজুন..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
                />
                <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${showMobileFilters ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
           </div>

           {/* Filter Dropdowns */}
           <div className={`flex-col md:flex-row gap-4 flex-1 md:items-center ${showMobileFilters ? 'flex' : 'hidden md:flex'}`}>
             <div className="relative w-full md:w-64 relative z-10">
               <select
                 value={selectedSubject}
                 onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter('All'); setSelectedFormula('All'); }}
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer"
               >
                 {dynamicSubjects.map(sub => (
                   <option key={sub} value={sub}>
                     {sub === 'All' ? 'সব বিষয়' : sub}
                   </option>
                 ))}
               </select>
               <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                   <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                 </svg>
               </div>
             </div>

             <div className="relative w-full md:w-64 relative z-10">
               <select
                 value={selectedChapter}
                 onChange={e => { setSelectedChapter(e.target.value); setSelectedFormula('All'); }}
                 disabled={selectedSubject === 'All'}
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer disabled:opacity-50"
               >
                 {dynamicChapters.map(chap => (
                   <option key={chap} value={chap}>
                     {chap === 'All' ? 'সব অধ্যায়' : chap}
                   </option>
                 ))}
               </select>
               <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                   <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                 </svg>
               </div>
             </div>

             <div className="relative w-full md:w-64 relative z-10">
               <select
                 value={selectedFormula}
                 onChange={e => setSelectedFormula(e.target.value)}
                 disabled={selectedChapter === 'All'}
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-white font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none cursor-pointer disabled:opacity-50"
               >
                 {dynamicFormulasTitles.map(formTitle => (
                   <option key={formTitle} value={formTitle}>
                     {formTitle === 'All' ? 'সকল সূত্র সমূহ' : formTitle}
                   </option>
                 ))}
               </select>
               <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                   <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                 </svg>
               </div>
             </div>
           </div>

           {/* Desktop Search Bar */}
           <div className="relative w-full md:w-64 relative z-10 hidden md:block">
              <input
                type="text"
                placeholder="ফর্মুলা বা অধ্যায় খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
           </div>
        </div>

        {/* Formulas Display */}
        {loading ? (
          <SkeletonList count={6} />
        ) : Object.keys(groupedFormulas).length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">কোনো ফর্মুলা পাওয়া যায়নি</h3>
            <p className="text-slate-500 text-sm">অন্য কিছু লিখে সার্চ করুন অথবা বিষয় পরিবর্তন করুন।</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedFormulas).map(([subject, categories]) => (
              <div key={subject} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{subject}</h2>
                </div>
                
                <div className="space-y-12 pl-0 sm:pl-4">
                  {Object.entries(categories).map(([category, catFormulas]) => (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-5 bg-slate-600 rounded-full"></div>
                        <h3 className="text-xl font-bold text-slate-300">{category}</h3>
                        <span className="text-xs text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded-md ml-2 font-medium">
                          {catFormulas.length} টি সূত্র
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {catFormulas.map(formula => (
                          <div key={formula.id} className="bg-slate-800/20 hover:bg-slate-800/40 rounded-[2rem] p-6 transition-all duration-300 group relative flex flex-col">
                            
                            <div className="mb-4 flex justify-between items-start">
                              <h4 className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors text-lg">{formula.title}</h4>
                            </div>

                            <div className="bg-[#050810]/50 rounded-2xl p-5 min-h-[100px] flex items-center justify-center overflow-x-auto flex-grow relative">
                              <BlockMath math={formula.latexCode} />
                            </div>

                            {formula.description && (
                              <div className="mt-5 text-sm text-slate-400/80 prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-emerald-400">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                  {formatDescription(formula.description)}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
