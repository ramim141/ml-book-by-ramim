import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import chaptersData from '../../../../components/Academic/SSC/Chemistry/Chemistry_data/chapters.json';
import videosData from '../../../../components/Academic/SSC/Chemistry/Chemistry_data/videos.json';
import notesData from '../../../../components/Academic/SSC/Chemistry/Chemistry_data/notes.json';
import SSCChapterCard from '../../../../components/Academic/SSC/Shared/SSCChapterCard';

const cqsLoaders = import.meta.glob(
  '../../../../components/Academic/SSC/Chemistry/Chemistry_data/chapter_*_Json/*_CQs.json'
);
const mcqsLoaders = import.meta.glob(
  '../../../../components/Academic/SSC/Chemistry/Chemistry_data/chapter_*_Json/*_MCQs.json'
);

const loaderFor = (loaders, chapterId) => {
  const m = chapterId.match(/chapter-(\d+)/);
  if (!m) return null;
  const num = m[1].padStart(2, '0');
  const key = Object.keys(loaders).find((p) => p.includes(`chapter_${num}`));
  return key ? loaders[key] : null;
};

const ChemistrySubjectHome = () => {
  useEffect(() => {}, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/ssc" className="hover:text-white transition-colors whitespace-nowrap">এসএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400 whitespace-nowrap">রসায়ন</span>
      </nav>

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
            return <SSCChapterCard key={chapterId} chapter={fullChapter} basePath="/academic/ssc/chemistry" />;
          })}
        </div>
      </div>
    </div>
  );
};

export default ChemistrySubjectHome;
