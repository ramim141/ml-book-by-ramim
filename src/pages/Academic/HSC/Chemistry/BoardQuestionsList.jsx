import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowLeft, Download, Eye, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useRef } from 'react';

const cqsLoaders = import.meta.glob(
  '../../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/*_CQs.json'
);
const loaderMap = Object.entries(cqsLoaders).map(([path, loader]) => {
  const match = path.match(/chapter_(\d+)/i);
  const chapter = match ? parseInt(match[1], 10) : null;
  return { chapter, loader };
});

const enToBnNumber = (numStr) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const ScrollableFilter = ({ label, children }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 2);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
    };
  }, [children]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full md:w-auto flex items-center gap-1.5 sm:gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 relative overflow-hidden">
      <span className="text-xs sm:text-sm text-slate-400 px-1 sm:px-2 font-medium shrink-0">{label}:</span>

      <div className="relative flex-1 md:flex-none flex items-center overflow-hidden">
        {showLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/90 to-transparent flex items-center justify-start pointer-events-none z-10">
            <button
              onClick={() => handleScroll('left')}
              className="p-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-full border border-slate-750 shadow-md transition-all duration-200 pointer-events-auto focus:outline-none"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto py-0.5 -my-0.5 scroll-smooth"
        >
          {children}
        </div>

        {showRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/90 to-transparent flex items-center justify-end pointer-events-none z-10">
            <button
              onClick={() => handleScroll('right')}
              className="p-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-full border border-slate-750 shadow-md transition-all duration-200 pointer-events-auto focus:outline-none"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BoardQuestionsList = () => {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [cqsDataWithChapter, setCqsDataWithChapter] = useState([]);
  const [loadingCqs, setLoadingCqs] = useState(true);
  const navigate = useNavigate();

  // Lazy-load chapter CQ JSONs on mount.
  useEffect(() => {
    let cancelled = false;
    setLoadingCqs(true);
    Promise.all(
      loaderMap.map(async ({ chapter, loader }) => {
        try {
          const mod = await loader();
          return { chapter, cqs: mod.default || mod || [] };
        } catch {
          return { chapter, cqs: [] };
        }
      })
    ).then((rows) => {
      if (!cancelled) {
        setCqsDataWithChapter(rows);
        setLoadingCqs(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Extract unique boards and years from cqsData
  const boardSet = useMemo(() => {
    const m = new Map();
    cqsDataWithChapter.forEach(({ chapter, cqs }) => {
      if (selectedChapter !== 'all' && chapter !== selectedChapter) return;
      cqs.forEach(cq => {
        if (cq.boards) {
          cq.boards.forEach(board => {
            const key = `${board.name}-${board.year}`;
            if (!m.has(key)) {
              m.set(key, {
                id: key,
                boardName: board.name,
                year: board.year,
                status: 'available',
                cqCount: 1
              });
            } else {
              m.get(key).cqCount += 1;
            }
          });
        }
      });
    });
    return m;
  }, [cqsDataWithChapter, selectedChapter]);

  const boards = Array.from(boardSet.values()).sort((a, b) => b.year.localeCompare(a.year));
  const allYears = [...new Set(boards.map(b => b.year))].sort().reverse();
  const allBoards = [...new Set(boards.map(b => b.boardName))].sort();
  const allChapters = [...new Set(cqsDataWithChapter.map(d => d.chapter))].filter(c => c !== null).sort((a, b) => a - b);

  const filteredBoards = boards.filter(b => {
    const matchYear = selectedYear === 'all' || b.year === selectedYear;
    const matchBoard = selectedBoard === 'all' || b.boardName === selectedBoard;
    return matchYear && matchBoard;
  });

  const handleViewQuestions = (boardName, year) => {
    let url = `/academic/hsc/chemistry/board-questions/${encodeURIComponent(boardName)}/${year}`;
    if (selectedChapter !== 'all') {
      url += `?chapter=${selectedChapter}`;
    }
    navigate(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc" className="hover:text-white transition-colors whitespace-nowrap">এইচএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc/chemistry" className="hover:text-white transition-colors whitespace-nowrap">রসায়ন</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400 whitespace-nowrap">বোর্ড প্রশ্নাবলি</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6 mb-8 sm:mb-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/academic/hsc/chemistry" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> আর্কাইভ
            </span>
          </div>
          <h1 className="text-xl sm:text-4xl font-extrabold text-white leading-tight">
            সম্পূর্ণ বোর্ড প্রশ্নাবলি
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base leading-relaxed">
            বিগত বছরের সকল বোর্ডের প্রশ্নপত্র ও সমাধান একত্রে
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
          {/* Board Filter */}
          <ScrollableFilter label="বোর্ড">
            <button
              onClick={() => setSelectedBoard('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedBoard === 'all'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
            >
              সব বোর্ড
            </button>
            {allBoards.map(board => (
              <button
                key={board}
                onClick={() => setSelectedBoard(board)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedBoard === board
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
              >
                {board}
              </button>
            ))}
          </ScrollableFilter>

          {/* Year Filter */}
          <ScrollableFilter label="সাল">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedYear === 'all'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
            >
              সব সাল
            </button>
            {allYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedYear === year
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
              >
                {enToBnNumber(year)}
              </button>
            ))}
          </ScrollableFilter>

          {/* Chapter Filter */}
          <ScrollableFilter label="অধ্যায়">
            <button
              onClick={() => setSelectedChapter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedChapter === 'all'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
            >
              সব অধ্যায়
            </button>
            {allChapters.map(chapter => (
              <button
                key={chapter}
                onClick={() => setSelectedChapter(chapter)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shrink-0 ${selectedChapter === chapter
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
              >
                অধ্যায় {enToBnNumber(chapter)}
              </button>
            ))}
          </ScrollableFilter>
        </div>
      </div>

      {/* Grid */}
      {loadingCqs ? (
        <div className="flex items-center justify-center py-12 sm:py-20 text-slate-400 gap-3">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-indigo-400" />
          <span className="text-sm sm:text-base">প্রশ্নব্যাংক লোড হচ্ছে…</span>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredBoards.map((board) => (
          <div key={board.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <FileText className="w-24 h-24 text-indigo-400" />
            </div>

            <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
              <div>
                <h3 className="text-base sm:text-xl font-bold text-white mb-2 leading-snug flex items-center gap-1.5 flex-wrap">
                  <span>{board.boardName.trim()}</span>
                  <span className="text-indigo-400">- {enToBnNumber(board.year)}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-slate-400 text-xs px-2 py-0.5 rounded-md border border-slate-700">
                    {board.cqCount} টি প্রশ্ন
                  </span>
                </div>
              </div>
              {board.status === 'available' ? (
                <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg shrink-0" title="সমাধান উপলব্ধ">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              ) : (
                <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-500/20 shrink-0">
                  শীঘ্রই আসছে
                </span>
              )}
            </div>

            <div className="flex flex-col min-[380px]:flex-row gap-2 sm:gap-3 relative z-10 mt-auto">
              <button
                onClick={() => handleViewQuestions(board.boardName, board.year)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-600/50"
                disabled={board.status !== 'available'}
              >
                <Eye className="w-4 h-4" /> প্রশ্ন দেখুন
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-2.5 rounded-xl text-sm font-medium transition-colors border border-indigo-500/20"
                disabled={board.status !== 'available'}
              >
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {!loadingCqs && filteredBoards.length === 0 && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 sm:p-16 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base sm:text-xl font-bold text-slate-300 mb-2">কোনো প্রশ্নপত্র পাওয়া যায়নি</h3>
          <p className="text-slate-500">আপনার সিলেক্ট করা সালের জন্য কোনো বোর্ডের প্রশ্ন এখনো আপলোড করা হয়নি।</p>
        </div>
      )}
    </div>
  );
};

export default BoardQuestionsList;
