import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import chaptersData from '../../../../components/Academic/HSC/ICT/ICT_data/chapters.json';
import videosData from '../../../../components/Academic/HSC/ICT/ICT_data/videos.json';
import notesData from '../../../../components/Academic/HSC/ICT/ICT_data/notes.json';
import ChapterCard from '../../../../components/Academic/HSC/ICT/ChapterCard';

// Lazy loaders for CQs/MCQs JSONs — fetches on-demand so heavy chapter data
// isn't bundled into this route's chunk.
const cqsLoaders = import.meta.glob(
  '../../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/*_CQs.json'
);
const mcqsLoaders = import.meta.glob(
  '../../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/*_MCQs.json'
);

const loaderFor = (loaders, chapterId) => {
  const m = chapterId.match(/chapter-(\d+)/);
  if (!m) return null;
  const num = m[1].padStart(2, '0');
  const key = Object.keys(loaders).find((p) => p.includes(`chapter_${num}`));
  return key ? loaders[key] : null;
};

const ICTSubjectHome = () => {
  // Pre-warming removed to avoid network congestion on mobile and slow networks.
  // The JSONs will now load on-demand when navigating to the specific chapter/question bank.
  useEffect(() => {
    // Empty effect to keep the hook signature, but no pre-fetching is done.
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-5 sm:mb-8 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc" className="hover:text-white transition-colors whitespace-nowrap">এইচএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400 whitespace-nowrap">আইসিটি</span>
      </nav>

      {/* Header */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 mb-7 sm:mb-10 lg:mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-28 h-28 sm:w-40 sm:h-40 lg:w-48 lg:h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm border border-indigo-500/30">
              বিষয় কোড: {chaptersData.subjectCode}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-5 lg:mb-6 leading-tight">
            {chaptersData.subjectName}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
            {chaptersData.description}
          </p>
        </div>
      </div>

      {/* Board Questions Banner */}
      <Link to="/academic/hsc/ict/board-questions" className="block mb-8 sm:mb-10 lg:mb-12">
        <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group transition-all active:scale-[0.99]">
          <div className="flex items-start sm:items-center gap-3 sm:gap-5 min-w-0">
            <div className="bg-emerald-500/10 p-3 sm:p-4 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-white mb-1">সম্পূর্ণ বোর্ড প্রশ্নাবলি</h3>
              <p className="text-slate-400 text-xs sm:text-sm lg:text-base">বিগত বছরের সকল বোর্ডের প্রশ্নপত্র ও সমাধান একত্রে দেখুন</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform self-end sm:self-auto">
            <span className="text-sm sm:text-base">আর্কাইভ দেখুন</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>

      {/* Chapters Grid */}
      <div className="mb-8">
        <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          সকল অধ্যায় <span className="text-slate-500 text-sm sm:text-lg font-medium">({chaptersData.chapters.length})</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {chaptersData.chapters.map((baseChapter) => {
            const chapterId = baseChapter.id;
            const fullChapter = {
              ...baseChapter,
              videos: videosData[chapterId] || [],
              notes: notesData[chapterId] || [],
              cqsLoader: loaderFor(cqsLoaders, chapterId),
              mcqsLoader: loaderFor(mcqsLoaders, chapterId),
            };
            return <ChapterCard key={chapterId} chapter={fullChapter} />;
          })}
        </div>
      </div>

    </div>
  );
};

export default ICTSubjectHome;
