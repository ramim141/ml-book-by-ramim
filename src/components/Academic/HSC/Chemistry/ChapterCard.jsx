import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, PlayCircle, FileText, CheckCircle } from 'lucide-react';

const ChapterCard = ({ chapter }) => {
  const [counts, setCounts] = useState({ cqs: null, mcqs: null });
  const cardRef = useRef(null);
  const loaderTriggered = useRef(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const loadCounts = async () => {
      if (loaderTriggered.current) return;
      loaderTriggered.current = true;
      try {
        const results = await Promise.all([
          chapter.cqsLoader ? chapter.cqsLoader() : Promise.resolve(null),
          chapter.mcqsLoader ? chapter.mcqsLoader() : Promise.resolve(null),
        ]);
        setCounts({
          cqs: Array.isArray(results[0]?.default) ? results[0].default.length : Array.isArray(results[0]) ? results[0].length : 0,
          mcqs: Array.isArray(results[1]?.default) ? results[1].default.length : Array.isArray(results[1]) ? results[1].length : 0,
        });
      } catch {
        setCounts({ cqs: 0, mcqs: 0 });
      }
    };

    if (!('IntersectionObserver' in window)) {
      loadCounts();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadCounts();
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [chapter.cqsLoader, chapter.mcqsLoader]);

  const prefetch = () => {
    if (chapter.cqsLoader) chapter.cqsLoader().catch(() => {});
    if (chapter.mcqsLoader) chapter.mcqsLoader().catch(() => {});
    if (typeof window !== 'undefined' && window.__prefetchChapter) {
      window.__prefetchChapter(chapter.id, 'chemistry');
    }
  };

  const videosCount = chapter.videos?.length || 0;
  const notesCount = chapter.notes?.length || 0;
  const mcqCount = counts.mcqs ?? 0;

  return (
    <Link
      ref={cardRef}
      to={`/academic/hsc/chemistry/${chapter.id}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      className="block h-full bg-slate-800/40 border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:bg-slate-800 hover:border-indigo-500/30 sm:hover:-translate-y-1 active:scale-[0.98] group"
    >
      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
        <span className="text-xs sm:text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-indigo-500/20 shrink-0">
          {chapter.chapterNo}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 text-slate-500 flex-wrap justify-end">
          {videosCount > 0 && (
            <span className="flex items-center gap-1 text-xs" title="Videos">
              <PlayCircle className="w-4 h-4" /> {videosCount}
            </span>
          )}
          {notesCount > 0 && (
            <span className="flex items-center gap-1 text-xs" title="Notes">
              <FileText className="w-4 h-4" /> {notesCount}
            </span>
          )}
          {mcqCount > 0 && (
            <span className="flex items-center gap-1 text-xs" title="MCQs">
              <CheckCircle className="w-4 h-4" /> {mcqCount}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-indigo-300 transition-colors leading-snug">
        {chapter.title}
      </h3>
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
        {chapter.description}
      </p>

      <div className="mt-5 sm:mt-6 flex items-center text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
        চ্যাপ্টার শুরু করুন <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default ChapterCard;
