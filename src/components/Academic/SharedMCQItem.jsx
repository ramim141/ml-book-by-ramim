import React, { useState, memo } from 'react';
import { Circle, CheckCircle2, Flag, Bookmark } from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import FeedbackModal from './FeedbackModal';
import { useBookmark } from '../../hooks/useBookmark';

const enToBnNumber = (numStr) => {
  if (!numStr && numStr !== 0) return numStr;
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return numStr.toString().replace(/\d/g, (d) => bnDigits[d]);
};

const SharedMCQItem = memo(({ mcq, index, chapterName }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { isBookmarked, toggleBookmark, isLoading } = useBookmark(mcq.id, { ...mcq, type: 'mcq' });

  const handleOptionClick = (optIdx) => {
    if (showAnswer) return;
    setSelectedOption(optIdx);
    setShowAnswer(true);
  };

  const handleRetry = () => {
    setShowAnswer(false);
    setSelectedOption(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 transition-all duration-300">
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className="font-bold w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 text-sm bg-indigo-500/10 text-indigo-400">
          {enToBnNumber(index + 1)}
        </div>
        <div className="flex-1 mt-1 min-w-0">
          <div className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed mb-2.5 pr-10 relative">
            <MarkdownRenderer content={mcq.question} />
            {(mcq.imageUrl || mcq.image || mcq.image_url) && (
              <div className="mt-4 mb-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 inline-block">
                <img src={mcq.imageUrl || mcq.image || mcq.image_url} alt="Question Diagram" className="max-w-full h-auto max-h-64 object-contain" loading="lazy" />
              </div>
            )}
            <div className="absolute top-0 -right-2 flex flex-col items-center gap-1">
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors group"
                title="রিপোর্ট করুন"
              >
                <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={toggleBookmark}
                disabled={isLoading}
                className={`p-1.5 rounded-lg transition-colors group ${
                  isBookmarked 
                    ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' 
                    : 'text-slate-500 hover:text-amber-400 hover:bg-amber-400/10'
                }`}
                title={isBookmarked ? "বুকমার্ক রিমুভ করুন" : "বুকমার্ক করুন"}
              >
                <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {chapterName || mcq.chapterName || (mcq.chapterId ? `অধ্যায় ${mcq.chapterId.replace('ch_', '')}` : 'Unknown')}
            </span>
            {mcq.boards?.map((board, idx) => (
              <span key={"board-"+idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {board.name} {board.year}
              </span>
            ))}
            {mcq.institutions?.map((inst, idx) => (
              <span key={"inst-"+idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {inst.name} {inst.year}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 sm:ml-12">
        {(Array.isArray(mcq.options) ? mcq.options : (typeof mcq.options === 'object' && mcq.options !== null ? Object.values(mcq.options) : [])).map((option, optIdx) => {
          let optionClass = "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-600 text-slate-300 cursor-pointer";
          let Icon = Circle;

          if (showAnswer) {
            if (optIdx === mcq.answer) {
              optionClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
              Icon = CheckCircle2;
            } else if (optIdx === selectedOption) {
              optionClass = "border-red-500/50 bg-red-500/10 text-red-400";
            }
          } else if (selectedOption === optIdx) {
            optionClass = "border-indigo-500 bg-indigo-500/10 text-indigo-300";
            Icon = CheckCircle2;
          }

          return (
            <div
              key={optIdx}
              onClick={() => handleOptionClick(optIdx)}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all ${optionClass} ${showAnswer && optIdx !== mcq.answer && optIdx !== selectedOption ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm"><MarkdownRenderer content={option} /></span>
            </div>
          );
        })}
      </div>

      {showAnswer && (
        <div className="sm:ml-12 space-y-3">
          {mcq.explanation && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h4 className="text-indigo-400 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> ব্যাখ্যা:
              </h4>
              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                <MarkdownRenderer content={mcq.explanation} />
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-700/50 pt-3">
            <button
              onClick={handleRetry}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        </div>
      )}
      <FeedbackModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        questionId={mcq.firebaseId || mcq.id}
        questionType="mcq"
        chapterId={mcq.chapterId || mcq.chapterName}
        subjectId={mcq.subject || 'Unknown'}
        questionData={{ ...mcq, type: 'mcq' }}
      />
    </div>
  );
});

SharedMCQItem.displayName = 'SharedMCQItem';
export default SharedMCQItem;
