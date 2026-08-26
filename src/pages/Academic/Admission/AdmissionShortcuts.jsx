import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Sparkles, Brain, Calculator, Search, 
  BookOpen, Dna, FlaskConical, Globe, Stethoscope, Copy, Check, MousePointer2
} from 'lucide-react';
import { useAdmissionShortcuts, DEFAULT_ADMISSION_SHORTCUTS } from '../../../hooks/useAdmissionData';
import toast from 'react-hot-toast';

export const ADMISSION_SHORTCUTS = DEFAULT_ADMISSION_SHORTCUTS;

export default function AdmissionShortcuts() {
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const { data: shortcutsList = DEFAULT_ADMISSION_SHORTCUTS } = useAdmissionShortcuts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tracks = [
    { id: 'all', label: 'সকল শর্টকাট' },
    { id: 'medical', label: '🩺 মেডিকেল ছন্দ' },
    { id: 'hand_calc', label: '⚡ হ্যান্ড ক্যালকুলেশন' },
    { id: 'engineering', label: '⚙️ ইঞ্জিনিয়ারিং ট্রিকস' },
    { id: 'varsity_a', label: '🔬 ভার্সিটি ক ম্যাথ' },
    { id: 'gk_english', label: '🇧🇩 ইংলিশ ও জিকে' }
  ];

  const filteredShortcuts = useMemo(() => {
    return shortcutsList.filter(item => {
      const matchTrack = selectedTrack === 'all' || item.track === selectedTrack;
      const matchSearch = !searchQuery.trim() ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.technique?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTrack && matchSearch;
    });
  }, [shortcutsList, selectedTrack, searchQuery]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('শর্টকাট কপি হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-12 pt-8 font-bangla selection:bg-rose-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Header Breadcrumb */}
        <div>
          <Link 
            to="/academic/admission" 
            className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-semibold transition mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            অ্যাডমিশন সেন্টারে ফিরে যান
          </Link>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
                <Zap className="w-4 h-4" />
                <span>ADMISSION SHORTCUTS & HACKS</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                অ্যাডমিশন স্পেশাল <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">শর্টকাট ও ট্রিকস</span>
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                মেডিকেল ছন্দ, নন-ক্যালকুলেটর হ্যান্ড ক্যালকুলেশন, ইঞ্জিনিয়ারিং ক্যালকুলেটর হ্যাকস 
                এবং ভার্সিটি ভর্তি পরীক্ষার জন্য দ্রুত সমাধানের সেরা কৌশলসমূহ।
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Search Bar & Track Filter Tabs Parallel in a Single Sleek Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800/80 p-2.5 sm:p-3 rounded-2xl backdrop-blur-md">
          {/* Left: Search Input */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="শর্টকাট, সূত্র বা টপিক খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Right: Parallel Track Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar min-w-0 flex-1 lg:justify-end">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {tracks.map(t => {
                const active = selectedTrack === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrack(t.id)}
                    className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      active 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shortcuts Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredShortcuts.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 space-y-4 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {item.trackLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{item.reference}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mb-1">
                    {item.category} ({item.subject})
                  </span>
                  <h3 className="font-bold text-slate-100 text-base sm:text-lg leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Highlighted Technique / Formula */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-semibold text-xs sm:text-sm relative group">
                  <p>{item.technique}</p>
                </div>

                {/* Explanation Details */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  {item.details.map((line, idx) => (
                    <p key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">➔</span>
                      <span>{line}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(`${item.title}\n${item.technique}`, item.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
                <span className="text-[11px] text-slate-500">অ্যাডমিশন ট্রিক</span>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
