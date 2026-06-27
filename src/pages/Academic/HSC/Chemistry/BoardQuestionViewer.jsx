import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ChevronRight, ArrowLeft, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { CQAccordion } from '../../../../components/Academic/HSC/Chemistry/CQTabContent';

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

const normalizeYear = (yearStr) => {
  const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  let enYear = String(yearStr).replace(/[০-৯]/g, w => bnToEn[w]);
  if (enYear.length === 2) {
    enYear = "20" + enYear;
  }
  return enYear;
};

const BoardQuestionViewer = () => {
  const { boardName, year } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const chapterParam = searchParams.get('chapter');
  const selectedChapter = chapterParam ? parseInt(chapterParam, 10) : 'all';

  const [cqsDataWithChapter, setCqsDataWithChapter] = useState([]);
  const [loadingCqs, setLoadingCqs] = useState(true);

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

  // Find all CQs matching this board and year, and optionally chapter
  const matchedCQs = useMemo(() => {
    const out = [];
    cqsDataWithChapter.forEach(({ chapter, cqs }) => {
      if (selectedChapter !== 'all' && chapter !== selectedChapter) return;
      cqs.forEach(cq => {
        if (cq.boards && cq.boards.some(b => b.name.trim() === boardName.trim() && normalizeYear(b.year) === normalizeYear(year))) {
          out.push(cq);
        }
      });
    });
    return out;
  }, [cqsDataWithChapter, selectedChapter, boardName, year]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc" className="hover:text-white transition-colors whitespace-nowrap">এইচএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc/chemistry" className="hover:text-white transition-colors whitespace-nowrap">রসায়ন</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc/chemistry/board-questions" className="hover:text-white transition-colors whitespace-nowrap">বোর্ড প্রশ্নাবলি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400">{boardName.trim()} {enToBnNumber(year)}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 mb-8 sm:mb-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/academic/hsc/chemistry/board-questions" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> প্রশ্নপত্র
            </span>
          </div>
          <h1 className="text-xl sm:text-4xl font-extrabold text-white flex items-center gap-2 flex-wrap leading-tight">
            <span>{boardName.trim()}</span>
            <span className="text-indigo-400">- {enToBnNumber(year)}</span>
          </h1>
          {selectedChapter !== 'all' && (
            <p className="text-slate-400 mt-2">
              অধ্যায়: {enToBnNumber(selectedChapter)}
            </p>
          )}
        </div>
      </div>

      {/* Questions List */}
      {loadingCqs ? (
        <div className="flex items-center justify-center py-12 sm:py-20 text-slate-400 gap-3">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-indigo-400" />
          <span className="text-sm sm:text-base">প্রশ্নপত্র লোড হচ্ছে…</span>
        </div>
      ) : matchedCQs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-slate-800 text-slate-400 text-sm px-3 py-1.5 rounded-lg border border-slate-700/50">
              মোট প্রশ্ন: <strong>{matchedCQs.length} টি</strong>
            </span>
          </div>
          {matchedCQs.map((cq) => (
            <CQAccordion key={cq.id} cq={cq} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 sm:p-16 text-center">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base sm:text-xl font-bold text-slate-300 mb-2">কোনো প্রশ্ন পাওয়া যায়নি</h3>
          <p className="text-slate-500">এই বোর্ডের জন্য কোনো সৃজনশীল প্রশ্ন আপলোড করা হয়নি।</p>
        </div>
      )}
    </div>
  );
};

export default BoardQuestionViewer;
