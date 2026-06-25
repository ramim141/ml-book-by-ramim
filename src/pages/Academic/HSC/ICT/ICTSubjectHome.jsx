import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import chaptersData from '../../../../components/Academic/HSC/ICT/ICT_data/chapters.json';
import videosData from '../../../../components/Academic/HSC/ICT/ICT_data/videos.json';
import notesData from '../../../../components/Academic/HSC/ICT/ICT_data/notes.json';
import ChapterCard from '../../../../components/Academic/HSC/ICT/ChapterCard';

const cqsModules = import.meta.glob('../../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/*_CQs.json', { eager: true });
const mcqsModules = import.meta.glob('../../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/*_MCQs.json', { eager: true });

const getChapterData = (modules, chapterId) => {
  const chapterNumMatch = chapterId.match(/chapter-(\d+)/);
  if (chapterNumMatch) {
    const num = chapterNumMatch[1].padStart(2, '0');
    const key = Object.keys(modules).find(path => path.includes(`chapter_${num}`));
    if (key && modules[key]) {
      return modules[key].default || modules[key];
    }
  }
  return [];
};

const ICTSubjectHome = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-8 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc" className="hover:text-white transition-colors whitespace-nowrap">এইচএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400 whitespace-nowrap">আইসিটি</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-500/20 text-indigo-300 font-bold px-3 py-1 rounded-md text-sm border border-indigo-500/30">
              বিষয় কোড: {chaptersData.subjectCode}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            {chaptersData.subjectName}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            {chaptersData.description}
          </p>
        </div>
      </div>

      {/* Board Questions Banner */}
      <Link to="/academic/hsc/ict/board-questions" className="block mb-12">
        <div className="bg-gradient-to-r from-emerald-900/30 to-slate-800/50 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl p-6 sm:p-8 flex items-center justify-between group transition-all">
          <div className="flex items-center gap-5">
            <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">সম্পূর্ণ বোর্ড প্রশ্নাবলি</h3>
              <p className="text-slate-400 text-sm sm:text-base">বিগত বছরের সকল বোর্ডের প্রশ্নপত্র ও সমাধান একত্রে দেখুন</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
            <span>আর্কাইভ দেখুন</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>

      {/* Chapters Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          সকল অধ্যায় <span className="text-slate-500 text-lg font-medium">({chaptersData.chapters.length})</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chaptersData.chapters.map((baseChapter) => {
            const chapterId = baseChapter.id;
            const fullChapter = {
              ...baseChapter,
              videos: videosData[chapterId] || [],
              notes: notesData[chapterId] || [],
              cqs: getChapterData(cqsModules, chapterId),
              mcqs: getChapterData(mcqsModules, chapterId)
            };
            return <ChapterCard key={chapterId} chapter={fullChapter} />;
          })}
        </div>
      </div>

    </div>
  );
};

export default ICTSubjectHome;
