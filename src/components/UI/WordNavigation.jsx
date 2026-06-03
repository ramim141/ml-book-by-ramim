import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getAllWords } from '../../data/wordsIndex';

export default function WordNavigation({ fallbackPath }) {
  const { wordPath } = useParams();
  const allWords = getAllWords();
  const currentWordPath = wordPath || fallbackPath;
  const currentWordIndex = allWords.findIndex((word) => word.path === currentWordPath);

  const previousWord = currentWordIndex > 0 ? allWords[currentWordIndex - 1] : null;
  const nextWord = currentWordIndex >= 0 && currentWordIndex < allWords.length - 1 ? allWords[currentWordIndex + 1] : null;

  return (
    <div className="flex justify-center items-center py-6 w-full">
      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full max-w-3xl border-t border-white/[0.05] pt-10 mt-6">
        
        {/* পূর্ববর্তী শব্দ (Previous Word) বাটন */}
        {previousWord ? (
          <Link
            to={`/word/${previousWord.path}`}
            className="flex flex-1 items-center justify-start gap-4 px-5 py-4 rounded-2xl border border-white/[0.06] bg-[#0b111b] hover:bg-white/[0.03] hover:border-white/[0.15] transition-all duration-300 active:scale-[0.98] group shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-slate-200 transition-transform group-hover:-translate-x-1" />
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">পূর্ববর্তী</span>
              <span className="text-sm sm:text-base font-semibold truncate text-slate-300 group-hover:text-slate-100 transition-colors">
                {previousWord.title.split(' (')[0]}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex-1 hidden sm:block"></div>
        )}

        {/* পরবর্তী শব্দ (Next Word) বাটন */}
        {nextWord ? (
          <Link
            to={`/word/${nextWord.path}`}
            className="flex flex-1 items-center justify-end gap-4 px-5 py-4 rounded-2xl border border-[#1f3a46]/40 bg-[#1f3a46]/20 hover:bg-[#1f3a46]/40 hover:border-[#1f3a46]/80 transition-all duration-300 active:scale-[0.98] group shadow-[0_4px_20px_rgba(31,58,70,0.15)] backdrop-blur-sm"
          >
            <div className="flex flex-col text-right overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4da6cc] mb-1">পরবর্তী</span>
              <span className="text-sm sm:text-base font-semibold truncate text-slate-200 group-hover:text-white transition-colors">
                {nextWord.title.split(' (')[0]}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1f3a46]/50 flex items-center justify-center shrink-0 group-hover:bg-[#1f3a46] border border-white/5 transition-colors">
              <ChevronRight size={20} className="text-slate-200 group-hover:text-white transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ) : (
          <div className="flex-1 hidden sm:block"></div>
        )}

      </div>
    </div>
  );
}