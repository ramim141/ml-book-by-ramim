import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, FileText, HelpCircle } from 'lucide-react';
import cqsData from '../../../../components/Academic/HSC/ICT/ICT_data/cqs.json';
import { CQAccordion } from '../../../../components/Academic/HSC/ICT/CQTabContent';

const enToBnNumber = (numStr) => {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const BoardQuestionViewer = () => {
  const { boardName, year } = useParams();

  // Find all CQs matching this board and year
  const matchedCQs = [];
  Object.values(cqsData).forEach(chapterCqs => {
    chapterCqs.forEach(cq => {
      if (cq.boards && cq.boards.some(b => b.name === boardName && b.year === year)) {
        matchedCQs.push(cq);
      }
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium flex-wrap">
        <Link to="/academic" className="hover:text-white transition-colors whitespace-nowrap">একাডেমিক</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc" className="hover:text-white transition-colors whitespace-nowrap">এইচএসসি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc/ict" className="hover:text-white transition-colors whitespace-nowrap">আইসিটি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <Link to="/academic/hsc/ict/board-questions" className="hover:text-white transition-colors whitespace-nowrap">বোর্ড প্রশ্নাবলি</Link>
        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-indigo-400">{boardName.trim()} {enToBnNumber(year)}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/academic/hsc/ict/board-questions" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> প্রশ্নপত্র
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-2 flex-wrap">
            <span>{boardName.trim()}</span>
            <span className="text-indigo-400">- {enToBnNumber(year)}</span>
          </h1>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {matchedCQs.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-slate-800 text-slate-400 text-sm px-3 py-1.5 rounded-lg border border-slate-700/50">
                মোট প্রশ্ন: <strong>{matchedCQs.length} টি</strong>
              </span>
            </div>
            {matchedCQs.map((cq) => (
              <CQAccordion key={cq.id} cq={cq} />
            ))}
          </>
        ) : (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-16 text-center">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">কোনো প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-slate-500">এই বোর্ডের জন্য কোনো সৃজনশীল প্রশ্ন আপলোড করা হয়নি।</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default BoardQuestionViewer;
