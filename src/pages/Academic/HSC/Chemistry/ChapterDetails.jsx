import { useState, lazy, Suspense, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight, PlayCircle, FileText, HelpCircle, CheckCircle, ArrowLeft, Timer, Loader2, BookOpen, Menu, X, Zap } from 'lucide-react';
import chaptersData from '../../../../components/Academic/HSC/Chemistry/Chemistry_data/chapters.json';
import videosData from '../../../../components/Academic/HSC/Chemistry/Chemistry_data/videos.json';
import notesData from '../../../../components/Academic/HSC/Chemistry/Chemistry_data/notes.json';

const VideoTabContent = lazy(() => import('../../../../components/Academic/HSC/Chemistry/VideoTabContent'));
const NotesTabContent = lazy(() => import('../../../../components/Academic/HSC/Chemistry/NotesTabContent'));
const CQTabContent = lazy(() => import('../../../../components/Academic/HSC/Chemistry/CQTabContent'));
const MCQTabContent = lazy(() => import('../../../../components/Academic/HSC/Chemistry/MCQTabContent'));
const ModelTestTabContent = lazy(() => import('../../../../components/Academic/HSC/Chemistry/ModelTestTabContent'));
const KnowledgeTabContent = lazy(() => import('../../../../components/Academic/HSC/Chemistry/KnowledgeTabContent'));

// Cache + lazy loader map to avoid re-downloads.
const chapterDataCache = new Map();
const cqsLoaders = import.meta.glob(
  '../../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_CQs.json'
);
const mcqLoaders = import.meta.glob(
  '../../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_MCQs.json'
);
const kqLoaders = import.meta.glob(
  '../../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_k_kh.json'
);

const getLoaders = (chapterId) => {
  const m = chapterId.match(/chapter-(\d+)/);
  if (!m) return { cqs: null, mcqs: null, kqs: null };
  const num = m[1].padStart(2, '0');
  const cqsKey = Object.keys(cqsLoaders).find((p) => p.includes(`chapter_${num}`));
  const mcqKey = Object.keys(mcqLoaders).find((p) => p.includes(`chapter_${num}`));
  const kqKey = Object.keys(kqLoaders).find((p) => p.includes(`chapter_${num}`));
  return {
    cqs: cqsKey ? cqsLoaders[cqsKey] : null,
    mcqs: mcqKey ? mcqLoaders[mcqKey] : null,
    kqs: kqKey ? kqLoaders[kqKey] : null,
  };
};

const fetchChapterData = (chapterId) => {
  if (chapterDataCache.has(chapterId)) return chapterDataCache.get(chapterId);
  const { cqs, mcqs, kqs } = getLoaders(chapterId);
  const promise = Promise.all([
    cqs ? cqs() : Promise.resolve(null),
    mcqs ? mcqs() : Promise.resolve(null),
    kqs ? kqs() : Promise.resolve(null),
  ]).then(([cqsRes, mcqsRes, kqsRes]) => ({
    cqs: cqsRes?.default ?? cqsRes ?? [],
    mcqs: mcqsRes?.default ?? mcqsRes ?? [],
    kQs: kqsRes?.default ?? kqsRes ?? [],
  })).catch((err) => {
    console.error('Error loading chapter data:', err);
    chapterDataCache.delete(chapterId);
    return { cqs: [], mcqs: [], kQs: [] };
  });
  chapterDataCache.set(chapterId, promise);
  return promise;
};

if (typeof window !== 'undefined') {
  window.__prefetchChapter = (chapterId) => fetchChapterData(chapterId);
}

const ChapterDetails = () => {
  const { chapterId } = useParams();
  const baseChapter = chaptersData.chapters.find((c) => c.id === chapterId);

  const [cqsData, setCqsData] = useState([]);
  const [mcqsData, setMcqsData] = useState([]);
  const [kQsData, setKQsData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!baseChapter) return undefined;
    let cancelled = false;
    setLoadingData(true);
    fetchChapterData(chapterId).then((data) => {
      if (cancelled) return;
      setCqsData(data.cqs);
      setMcqsData(data.mcqs);
      setKQsData(data.kQs);
      setLoadingData(false);
    });
    return () => {
      cancelled = true;
    };
  }, [chapterId, baseChapter]);

  if (!baseChapter) {
    return <Navigate to="/academic/hsc/chemistry" replace />;
  }

  const chapter = {
    ...baseChapter,
    videos: videosData[chapterId] || [],
    notes: notesData[chapterId] || [],
    cqs: cqsData,
    mcqs: mcqsData,
    kQs: kQsData
  };

  const [activeTab, setActiveTab] = useState('videos');
  const [activeVideo, setActiveVideo] = useState(chapter.videos[0] || null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'videos', label: 'ভিডিও ক্লাস', icon: PlayCircle, count: chapter.videos.length },
    { id: 'notes', label: 'ক্লাস নোটস', icon: FileText, count: chapter.notes.length },
    { id: 'knowledge', label: 'জ্ঞান ও অনুধাবন', icon: BookOpen, count: chapter.kQs.length },
    { id: 'cqs', label: 'সৃজনশীল প্রশ্ন', icon: HelpCircle, count: chapter.cqs.length },
    { id: 'mcqs', label: 'বহুনির্বাচনী (MCQ)', icon: CheckCircle, count: chapter.mcqs.length },
    { id: 'modeltest', label: 'মডেল টেস্ট', icon: Timer, count: 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:py-12 relative">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-5 sm:mb-6 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc" className="hover:text-white transition-colors whitespace-nowrap">এইচএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc/chemistry" className="hover:text-white transition-colors whitespace-nowrap">রসায়ন</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400 whitespace-nowrap">{chapter.chapterNo}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Link to="/academic/hsc/chemistry" className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md border border-indigo-500/20 text-xs sm:text-sm">
              {chapter.chapterNo}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {chapter.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to={`/academic/shortcut/hsc/chemistry/${chapter.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" /> শর্টকাট ও ট্রিকস
          </Link>
        </div>
      </div>

      {/* Tabs - Desktop/Tablet Only */}
      <div className="hidden md:flex overflow-x-auto hide-scrollbar mb-8 border-b border-slate-800 sticky top-[80px] z-40 bg-[#0b0f19]/95 backdrop-blur-md pt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-5 lg:gap-8 min-w-max px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs - Mobile (Floating Menu) */}
      <div className="md:hidden fixed bottom-5 right-4 z-50">
        <div 
          className={`absolute bottom-16 right-0 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-[min(19rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto flex flex-col gap-1 p-2 transition-all duration-300 origin-bottom-right ${
            isMobileMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full shadow-[0_4px_20px_rgba(79,70,229,0.4)] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[420px] sm:min-h-[500px]">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        }>
          {activeTab === 'videos' && <VideoTabContent chapter={chapter} activeVideo={activeVideo} setActiveVideo={setActiveVideo} />}
          {activeTab === 'notes' && <NotesTabContent chapter={chapter} />}
          {activeTab === 'cqs' && <CQTabContent chapter={chapter} />}
          {activeTab === 'mcqs' && <MCQTabContent chapter={chapter} />}
          {activeTab === 'knowledge' && <KnowledgeTabContent chapter={chapter} />}
          {activeTab === 'modeltest' && <ModelTestTabContent mcqs={chapter.mcqs} />}

          {/* Other Tabs Placeholder */}
          {activeTab !== 'videos' && activeTab !== 'notes' && activeTab !== 'cqs' && activeTab !== 'mcqs' && activeTab !== 'knowledge' && activeTab !== 'modeltest' && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 sm:p-16 text-center">
              <h3 className="text-base sm:text-xl font-bold text-slate-300 mb-2">এই সেকশনটি তৈরি করা হচ্ছে</h3>
              <p className="text-slate-500">শীঘ্রই এখানে কন্টেন্ট যুক্ত করা হবে।</p>
            </div>
          )}
        </Suspense>
      </div>

    </div>
  );
};

export default ChapterDetails;
