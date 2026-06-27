import React, { useState, useEffect, useMemo, memo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Video, FileQuestion, BookOpen, Search, 
  Lightbulb, Calculator, Image as ImageIcon, Zap, CheckCircle2 
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
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    chapters: chaptersChemistry.chapters,
    shortcuts: import.meta.glob('../../../components/Academic/ShortcutsData/HSC/Chemistry/chapter_*_shortcuts.json'),
  }
};

const MarkdownRenderer = ({ content }) => (
  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
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

  let icon = <Lightbulb className="h-5 w-5 text-amber-400" />;
  let typeLabel = "শর্টকাট";
  let color = "from-amber-500/10 to-amber-500/5 border-amber-500/20";
  
  if (item.type === 'mnemonic') {
    icon = <Brain className="h-5 w-5 text-fuchsia-400" />;
    typeLabel = "ছন্দ/টেকনিক";
    color = "from-fuchsia-500/10 to-fuchsia-500/5 border-fuchsia-500/20";
  } else if (item.type === 'video') {
    icon = <Video className="h-5 w-5 text-rose-400" />;
    typeLabel = "ভিডিও";
    color = "from-rose-500/10 to-rose-500/5 border-rose-500/20";
  } else if (item.type === 'formula') {
    icon = <Calculator className="h-5 w-5 text-cyan-400" />;
    typeLabel = "সূত্র";
    color = "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20";
  } else if (item.type === 'mindmap') {
    icon = <ImageIcon className="h-5 w-5 text-emerald-400" />;
    typeLabel = "ম্যাপ/চিত্র";
    color = "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20";
  } else if (item.type === 'flashcard') {
    icon = <FileQuestion className="h-5 w-5 text-indigo-400" />;
    typeLabel = "ফ্ল্যাশকার্ড";
    color = "from-indigo-500/10 to-indigo-500/5 border-indigo-500/20";
  }

  // Handle flashcard layout
  if (item.type === 'flashcard') {
    return (
      <div 
        onClick={() => setFlipped(!flipped)}
        className={`relative w-full rounded-2xl cursor-pointer transition-all duration-500 preserve-3d h-64 ${flipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-900/40 to-slate-900/80 border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg shadow-indigo-500/10">
          <FileQuestion className="h-10 w-10 text-indigo-400 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-100">{item.title}</h3>
          <p className="text-indigo-300 text-sm mt-4 font-medium flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1 rounded-full">
            ট্যাপ করে উত্তর দেখুন
          </p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-900/40 to-slate-900/80 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-center overflow-y-auto custom-scrollbar shadow-lg shadow-emerald-500/10">
          <div className="text-emerald-400 text-sm font-bold flex justify-center mb-2">উত্তর:</div>
          <div className="text-slate-200 text-center text-sm">
             <MarkdownRenderer content={item.content} />
          </div>
          {item.image && (
             <img src={item.image} alt={item.title} className="w-full rounded-xl mt-4 border border-emerald-500/30 object-contain max-h-48 bg-slate-900/50" />
          )}
          {item.description && (
            <div className="text-slate-400 text-xs text-center mt-3 pt-3 border-t border-emerald-500/20">
              {item.description}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular Card Layout
  return (
    <div className={`bg-slate-800/40 border ${color} bg-gradient-to-br rounded-2xl p-5 shadow-lg flex flex-col h-full`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-100 font-bold text-base sm:text-lg pr-4">{item.title}</h3>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/50 border border-slate-700/50 shrink-0">
          {icon} <span className="hidden sm:inline">{typeLabel}</span>
        </span>
      </div>

      <div className="flex-grow">
        {item.type === 'video' ? (
          <div className="relative w-full rounded-xl overflow-hidden mb-4" style={{ paddingBottom: '56.25%' }}>
            <iframe 
              src={item.content} 
              className="absolute inset-0 w-full h-full border-0" 
              allowFullScreen
            />
          </div>
        ) : item.type === 'mindmap' ? (
           <img src={item.content} alt={item.title} className="w-full rounded-xl mb-4 border border-slate-700/50 bg-slate-900" />
        ) : (
          <div className="text-slate-200 text-sm sm:text-base font-medium mb-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 shadow-inner">
             <MarkdownRenderer content={item.content} />
          </div>
        )}
        
        {item.image && item.type !== 'mindmap' && (
           <img src={item.image} alt={item.title} className="w-full rounded-xl mb-4 border border-slate-700/50 bg-slate-900/50 object-contain max-h-60" />
        )}
      </div>

      {item.description && (
        <div className="text-slate-400 text-xs sm:text-sm mt-auto pt-3 border-t border-slate-700/50">
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

  // Validate route
  if (!isGlobalAll && !config) {
    return <Navigate to="/academic/shortcut" />;
  }

  // Check if chapter exists
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
    { id: 'all', label: 'সব শর্টকাট' },
    { id: 'mnemonic', label: 'ছন্দ ও টেকনিক' },
    { id: 'formula', label: 'সূত্রাবলি' },
    { id: 'mindmap', label: 'চিত্র ও ম্যাপ' },
    { id: 'video', label: 'শর্ট ভিডিও' },
    { id: 'flashcard', label: 'ফ্ল্যাশকার্ড' },
  ];

  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter(s => {
      const matchTab = activeTab === 'all' || s.type === activeTab;
      const matchSearch = (s.title + s.content + s.description).toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [shortcuts, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-bangla pb-20">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 sticky top-[60px] sm:top-20 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link 
              to="/academic/shortcut" 
              className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition border border-slate-700/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                {isGlobalAll ? 'সকল বিষয়ের শর্টকাট' : (isAllChapters ? 'সকল অধ্যায়ের শর্টকাট' : currentChapter?.name)}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                {isGlobalAll ? 'সকল একাডেমিক বিষয় একসাথে' : config.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        
        {/* Search & Tabs */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center bg-slate-800/40 border border-slate-700/50 rounded-2xl p-1.5 shadow-inner backdrop-blur-md focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 max-w-xl">
            <div className="pl-4 pr-2">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="যেকোনো শর্টকাট, সূত্র বা টেকনিক খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-transparent border-none text-slate-100 text-sm focus:outline-none focus:ring-0 py-2 sm:py-2.5 placeholder:text-slate-500"
            />
          </div>

          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-slate-800/40 h-64 rounded-2xl border border-slate-700/50"></div>
            ))}
          </div>
        ) : filteredShortcuts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {filteredShortcuts.map(item => (
              <ShortcutCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-slate-800 border-dashed rounded-3xl bg-slate-900/20">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <Lightbulb className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-2">কোনো শর্টকাট পাওয়া যায়নি!</h3>
            <p className="text-sm text-slate-500 max-w-sm">এই ক্যাটাগরি বা সার্চের সাথে মিলে এমন কোনো শর্টকাট এখনো যোগ করা হয়নি।</p>
          </div>
        )}
      </div>
    </div>
  );
}
