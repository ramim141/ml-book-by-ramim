import { Link } from 'react-router-dom';
import { ChevronRight, PlayCircle, FileText, CheckCircle } from 'lucide-react';

const ChapterCard = ({ chapter }) => {
  return (
    <Link 
      to={`/academic/hsc/ict/${chapter.id}`}
      className="block bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/30 hover:-translate-y-1 group"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          {chapter.chapterNo}
        </span>
        <div className="flex items-center gap-3 text-slate-500">
          {chapter.videos.length > 0 && (
            <span className="flex items-center gap-1 text-xs" title="Videos">
              <PlayCircle className="w-4 h-4" /> {chapter.videos.length}
            </span>
          )}
          {chapter.notes.length > 0 && (
            <span className="flex items-center gap-1 text-xs" title="Notes">
              <FileText className="w-4 h-4" /> {chapter.notes.length}
            </span>
          )}
          {chapter.mcqs.length > 0 && (
            <span className="flex items-center gap-1 text-xs" title="MCQs">
              <CheckCircle className="w-4 h-4" /> {chapter.mcqs.length}
            </span>
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
        {chapter.title}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2">
        {chapter.description}
      </p>
      
      <div className="mt-6 flex items-center text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
        চ্যাপ্টার শুরু করুন <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default ChapterCard;
