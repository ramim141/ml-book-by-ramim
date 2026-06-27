import React, { useState, useEffect, useMemo, memo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, Video, FileQuestion, BookOpen, Search,
  Lightbulb, Calculator, Image as ImageIcon, Zap, CheckCircle2,
  MousePointer2, Sparkles, Filter
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

// Import chapter lists
import chaptersIct from '../../../components/Academic/HSC/ICT/ICT_data/chapters.json';
import chaptersChemistry from '../../../components/Academic/HSC/Chemistry/Chemistry_data/chapters.json';

const subjectConfigs = {
  'hsc-ict': {
    title: 'এইচএসসি আইসিটি (ICT)',
    chapters: chaptersIct.chapters,
    shortcuts: import.meta.glob('../../../components/Academic/ShortcutsData/HSC/ICT/chapter_*_shortcuts.json'),
  },
  'hsc-chemistry': {
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    chapters: chaptersChemistry.chapters,
    shortcuts: import.meta.glob('../../../components/Academic/ShortcutsData/HSC/Chemistry/chapter_*_shortcuts.json'),
  }
};

const MarkdownRenderer = ({ content }) => (
  <div className="prose-sm prose prose-invert sm:prose-base max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-700/50 prose-pre:shadow-lg prose-pre:rounded-xl prose-ul:my-2 prose-li:my-1 prose-p:my-2">
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  </div>
);

// Individual Shortcut Card
const ShortcutCard = memo(({ item }) => {
  const [flipped, setFlipped] = useState(false);

  let icon = <Lightbulb className="w-6 h-6 text-amber-400" />;
  let themeColor = "amber";
  let gradientStr = "from-amber-500/20 to-orange-500/5";
  let borderStr = "group-hover:border-amber-500/40";
  let textHighlight = "text-amber-400";
  let blobColor = "bg-amber-500";

  if (item.type === 'mnemonic') {
    icon = <Brain className="w-6 h-6 text-fuchsia-400" />;
    themeColor = "fuchsia";
    gradientStr = "from-fuchsia-500/20 to-purple-500/5";
    borderStr = "group-hover:border-fuchsia-500/40";
    textHighlight = "text-fuchsia-400";
    blobColor = "bg-fuchsia-500";
  } else if (item.type === 'video') {
    icon = <Video className="w-6 h-6 text-rose-400" />;
    themeColor = "rose";
    gradientStr = "from-rose-500/20 to-red-500/5";
    borderStr = "group-hover:border-rose-500/40";
    textHighlight = "text-rose-400";
    blobColor = "bg-rose-500";
  } else if (item.type === 'formula') {
    icon = <Calculator className="w-6 h-6 text-cyan-400" />;
    themeColor = "cyan";
    gradientStr = "from-cyan-500/20 to-blue-500/5";
    borderStr = "group-hover:border-cyan-500/40";
    textHighlight = "text-cyan-400";
    blobColor = "bg-cyan-500";
  } else if (item.type === 'mindmap') {
    icon = <ImageIcon className="w-6 h-6 text-emerald-400" />;
    themeColor = "emerald";
    gradientStr = "from-emerald-500/20 to-teal-500/5";
    borderStr = "group-hover:border-emerald-500/40";
    textHighlight = "text-emerald-400";
    blobColor = "bg-emerald-500";
  }

  // Handle flashcard layout
  if (item.type === 'flashcard') {
    return (
      <div
        onClick={() => setFlipped(!flipped)}
        className="relative w-full h-[280px] sm:h-[320px] rounded-2xl sm:rounded-[2rem] cursor-pointer group perspective-1000"
      >
        <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-900/60 to-slate-900/90 border border-indigo-500/30 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 flex flex-col items-center justify-center text-center shadow-xl hover:border-indigo-400/50 transition-colors">
            <div className="relative flex items-center justify-center mb-4 rounded-full shadow-inner w-14 h-14 sm:w-20 sm:h-20 bg-indigo-500/10 sm:mb-6">
               <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
               <FileQuestion className="relative z-10 text-indigo-400 h-7 w-7 sm:h-10 sm:w-10" />
            </div>
            <h3 className="px-1 mb-4 text-base font-bold leading-tight text-white sm:text-2xl sm:mb-6">{item.title}</h3>
            <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-md hover:bg-indigo-500/30 transition">
              <MousePointer2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> ট্যাপ করে উত্তর দেখুন
            </div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-bl from-emerald-900/80 to-slate-900/90 border border-emerald-500/40 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b sm:gap-3 sm:mb-5 sm:pb-5 border-emerald-500/20 shrink-0">
              <div className="bg-emerald-500/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-sm shadow-inner">
                <CheckCircle2 className="w-5 h-5 sm:h-6 sm:w-6 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-emerald-400 sm:text-lg">উত্তর</h4>
            </div>
            <div className="flex-1 pr-2 overflow-y-auto custom-scrollbar">
              <div className="text-base text-slate-100">
                 <MarkdownRenderer content={item.content} />
              </div>
              {item.image && (
                <div className="p-2 mb-4 overflow-hidden border shadow-xl rounded-2xl border-slate-700/50 sm:mb-6 bg-slate-950">
                  <img src={item.image} alt={item.title} className="w-full rounded-xl object-contain max-h-[200px] sm:max-h-[300px] mx-auto" />
                </div>
              )}
              {item.description && (
                <div className="pt-4 mt-5 text-sm border-t text-emerald-200/80 border-emerald-500/20">
                  <MarkdownRenderer content={item.description} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Card Layout
  return (
    <div className={`group bg-slate-900/50 backdrop-blur-xl border border-slate-700/60 ${borderStr} rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden relative`}>
      {/* Dynamic Glow Blob */}
      <div className={`absolute -top-10 -right-10 w-40 h-40 ${blobColor} rounded-full blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`}></div>
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradientStr}`}></div>

      <div className="relative z-10 flex items-start gap-3 mb-4 sm:gap-4 sm:mb-6">
        <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-${themeColor}-500/10 shadow-inner border border-${themeColor}-500/20 shrink-0`}>
           {icon}
        </div>
        <h3 className="text-white font-bold text-base sm:text-lg md:text-xl leading-snug pt-0.5 sm:pt-1">{item.title}</h3>
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        {item.type === 'video' ? (
          <div className="relative w-full mb-4 overflow-hidden border shadow-xl rounded-2xl sm:mb-6 border-slate-700/50" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={item.content}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
            />
          </div>
        ) : item.type === 'mindmap' ? (
           <div className="p-2 mb-4 overflow-hidden border shadow-xl rounded-2xl border-slate-700/50 sm:mb-6 bg-slate-950 sm:p-3">
             <img src={item.content} alt={item.title} className="object-contain w-full rounded-xl" />
           </div>
        ) : item.content ? (
          <div className={`relative p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 rounded-2xl bg-white/5 border border-white/5 shadow-inner backdrop-blur-sm`}>
             <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 sm:h-12 ${blobColor} rounded-r-full opacity-60`}></div>
             <div className="pl-2 text-slate-100">
               <MarkdownRenderer content={item.content} />
             </div>
          </div>
        ) : null}

        {item.image && item.type !== 'mindmap' && (
           <div className="p-2 mb-6 overflow-hidden border shadow-xl rounded-2xl border-slate-700/50 bg-slate-950">
             <img src={item.image} alt={item.title} className="w-full rounded-xl object-contain max-h-[300px] mx-auto" />
           </div>
        )}
      </div>

      {item.description && (
        <div className="relative z-10 pt-5 mt-auto text-sm border-t text-slate-400 border-slate-800">
          <MarkdownRenderer content={item.description} />
        </div>
      )}
    </div>
  );
});
ShortcutCard.displayName = 'ShortcutCard';

export default function ChapterShortcutViewer({ educationLevel: propEdu, subject: propSub } = {}) {
  const { educationLevel: paramEdu, subject: paramSub, chapterId } = useParams();
  const educationLevel = propEdu || paramEdu;
  const subject = propSub || paramSub;
  const isGlobalAll = educationLevel === 'all' && subject === 'all';
  const configKey = `${educationLevel}-${subject}`;
  const config = subjectConfigs[configKey];

  const [shortcuts, setShortcuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isGlobalAll && !config) return <Navigate to="/academic/shortcut" />;
  const currentChapter = !isGlobalAll ? config.chapters.find(c => c.id === chapterId) : null;
  const isAllChapters = chapterId === 'all';

  useEffect(() => {
    const loadShortcuts = async () => {
      setLoading(true);
      try {
        let loadedData = [];
        const configsToLoad = isGlobalAll ? Object.values(subjectConfigs) : [config];
        for (const c of configsToLoad) {
          const files = c.shortcuts;
          for (const path in files) {
            const match = path.match(/chapter_(\d+)_shortcuts\.json/);
            if (match) {
              const chapNum = match[1].replace(/^0+/, '');
              if (isGlobalAll || isAllChapters || chapNum === currentChapter?.id) {
                const module = await files[path]();
                loadedData = [...loadedData, ...(module.default || [])];
              }
            }
          }
        }
        setShortcuts(loadedData);
      } catch (error) {
        console.error("Error loading shortcuts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadShortcuts();
  }, [configKey, chapterId]);

  const tabs = [
    { id: 'all', label: 'সব শর্টকাট', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'mnemonic', label: 'ছন্দ ও টেকনিক', icon: <Brain className="w-4 h-4" /> },
    { id: 'formula', label: 'সূত্রাবলি', icon: <Calculator className="w-4 h-4" /> },
    { id: 'mindmap', label: 'চিত্র ও ম্যাপ', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'video', label: 'শর্ট ভিডিও', icon: <Video className="w-4 h-4" /> },
    { id: 'flashcard', label: 'ফ্ল্যাশকার্ড', icon: <FileQuestion className="w-4 h-4" /> },
  ];

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(s => {
      const matchTab = activeTab === 'all' || s.type === activeTab;
      const matchSearch = (s.title + (s.content||'') + (s.description||'')).toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [shortcuts, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#050914] font-bangla pb-24 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Premium Header */}
      <div className="relative z-20 bg-[#050914] border-b border-slate-800 shadow-xl">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center min-w-0 gap-3 sm:gap-4">
              <Link
                to="/academic/shortcut"
                className="flex items-center justify-center w-10 h-10 transition-all border shadow-inner sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 border-slate-700/50 group shrink-0"
              >
                <ArrowLeft className="w-4 h-4 transition-transform sm:h-5 sm:w-5 group-hover:-translate-x-1" />
              </Link>
              <div className="flex-1 min-w-0">
                <h1 className="flex items-center gap-2 text-lg font-black text-transparent sm:text-2xl md:text-3xl bg-clip-text bg-gradient-to-r from-white to-slate-400 sm:gap-3">
                  <Zap className="w-5 h-5 sm:h-7 sm:w-7 text-amber-400 shrink-0 drop-shadow-md" />
                  <span className="truncate">{isGlobalAll ? 'সকল বিষয়ের শর্টকাট' : (isAllChapters ? 'সকল অধ্যায়ের শর্টকাট' : currentChapter?.name)}</span>
                </h1>
                <p className="text-indigo-400/80 text-xs sm:text-sm font-semibold tracking-wide mt-0.5 sm:mt-1 truncate">
                  {isGlobalAll ? 'সকল একাডেমিক বিষয় একসাথে' : config.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Mobile Search */}
        <div className="relative mb-6 sm:hidden group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-4 h-4 transition-colors text-slate-400 group-focus-within:text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder="যেকোনো শর্টকাট বা টেকনিক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-full text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner placeholder:text-slate-500 text-sm"
          />
        </div>

        {/* Filter Section */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-2 px-1 mb-3 sm:mb-4">
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            <h3 className="text-xs font-semibold tracking-wide text-slate-300 sm:text-sm">ফিল্টার করুন</h3>
          </div>
          <div className="flex gap-2 px-4 pb-3 -mx-4 overflow-x-auto sm:pb-4 sm:mx-0 sm:px-0 custom-scrollbar sm:gap-3 hide-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 border shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 transform scale-105'
                      : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-200 hover:border-slate-600 shadow-sm'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-500'}`}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-slate-800/40 h-[280px] sm:h-[350px] rounded-2xl sm:rounded-[2rem] border border-slate-700/30"></div>
            ))}
          </div>
        ) : filteredShortcuts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
            {filteredShortcuts.map(item => (
              <ShortcutCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 sm:py-32 px-4 sm:px-6 text-center border-2 border-slate-800/60 border-dashed rounded-2xl sm:rounded-[3rem] bg-slate-900/20 backdrop-blur-sm">
            <div className="flex items-center justify-center w-16 h-16 mb-5 border rounded-full shadow-inner sm:w-24 sm:h-24 bg-slate-900 sm:mb-6 border-slate-800">
              <Search className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600" />
            </div>
            <h3 className="px-2 mb-2 text-lg font-bold leading-tight sm:text-2xl text-slate-300 sm:mb-3">কোনো শর্টকাট পাওয়া যায়নি!</h3>
            <p className="max-w-md px-2 text-sm leading-relaxed sm:text-base text-slate-500">এই ক্যাটাগরি বা সার্চের সাথে মিলে এমন কোনো শর্টকাট এখনো যোগ করা হয়নি। অন্য কিছু লিখে খুঁজুন।</p>
            <button
              onClick={() => {setSearchQuery(''); setActiveTab('all');}}
              className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              সব শর্টকাট দেখুন
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

