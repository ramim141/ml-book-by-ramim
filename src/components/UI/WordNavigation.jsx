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
      <div className="flex items-center justify-center gap-3 sm:gap-5 w-full max-w-xl border-t border-white/10 pt-6">
        
        {/* পূর্ববর্তী শব্দ (Previous Word) বাটন */}
        {previousWord && (
          <Link
            to={`/word/${previousWord.path}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0b111b] text-slate-300 text-xs sm:text-sm font-bold hover:bg-white/5 hover:text-white transition-all duration-300 active:scale-95 group shadow-sm max-w-[220px]"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1 shrink-0" />
            <span className="truncate">
              {previousWord.title.split(' (')[0]}
            </span>
          </Link>
        )}

        {/* পরবর্তী শব্দ (Next Word) বাটন */}
        {nextWord && (
          <Link
            to={`/word/${nextWord.path}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00daf3] text-[#04111b] text-xs sm:text-sm font-black hover:bg-[#35e4f7] transition-all duration-300 active:scale-95 shadow-[0_0_12px_rgba(0,218,243,0.12)] group max-w-[220px]"
          >
            <span className="truncate">
              {nextWord.title.split(' (')[0]}
            </span>
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1 shrink-0" />
          </Link>
        )}

      </div>
    </div>
  );
}