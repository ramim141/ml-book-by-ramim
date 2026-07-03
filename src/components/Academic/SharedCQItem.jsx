import React, { useState, memo } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpenCheck, Flag, Bookmark } from 'lucide-react';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import FeedbackModal from './FeedbackModal';
import { useBookmark } from '../../hooks/useBookmark';

const SharedCQItem = memo(({ cq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { isBookmarked, toggleBookmark, isLoading } = useBookmark(cq.id, { ...cq, type: 'cq' });

  return (
    <div className="overflow-hidden transition-all duration-300 border bg-slate-800/20 border-slate-700/50 rounded-2xl hover:border-slate-600/50">
      {/* Header (Clickable to Expand) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 p-4 transition-colors cursor-pointer sm:p-5 hover:bg-slate-800/40 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="hidden p-2 sm:block bg-emerald-500/10 sm:p-2.5 rounded-xl text-emerald-400 shrink-0">
            <HelpCircle className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md mb-1.5 inline-block">
              {cq.chapterName || `সৃজনশীল ${index + 1}`}
            </span>
            <h3 className="text-sm font-bold text-white sm:text-base truncate">
              {cq.title || "সৃজনশীল প্রশ্ন"}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs font-medium text-slate-500 flex-wrap">
              {cq.boards && cq.boards.map((b, idx) => (
                <span key={idx} className="bg-slate-900/60 px-1.5 py-0.5 rounded-md border border-slate-800 whitespace-nowrap">
                  {b.name} - {b.year}
                </span>
              ))}
              {cq.topic && (
                <span className="text-slate-400 font-semibold">• {cq.topic}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-slate-500 shrink-0">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
            disabled={isLoading}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked 
                ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' 
                : 'hover:text-amber-400 hover:bg-amber-400/10'
            }`}
            title={isBookmarked ? "বুকমার্ক রিমুভ করুন" : "বুকমার্ক করুন"}
          >
            <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsReportModalOpen(true); }}
            className="p-1.5 rounded-lg hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="রিপোর্ট করুন"
          >
            <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expandable Content (Questions & Answers) */}
      {isOpen && (
        <div className="px-4 pt-2 pb-4 sm:px-5 sm:pb-5 sm:pt-3 border-t border-slate-700/30">
          {/* Stem / Uddipok */}
          {(cq.image || cq.image_url || cq.stem) && (
            <div className="p-4 mb-5 text-xs leading-relaxed whitespace-pre-wrap border bg-slate-900/40 rounded-xl sm:p-5 border-slate-800/80 text-slate-300 sm:text-base">
              {(cq.image || cq.image_url) && (
                <div className="flex justify-center mb-4">
                  <img src={cq.image || cq.image_url} alt="উদ্দীপকের চিত্র" className="object-contain h-auto max-w-full p-1 border rounded-lg max-h-64 border-slate-700/50 bg-slate-800/50" />
                </div>
              )}

              {cq.stem && (cq.stem.trim().startsWith('http://') || cq.stem.trim().startsWith('https://') || cq.stem.trim().startsWith('/') || cq.stem.trim().startsWith('./')) ? (
                <div className="flex justify-center">
                  <img src={cq.stem.trim()} alt="উদ্দীপকের চিত্র" className="object-contain h-auto max-w-full p-1 border rounded-lg max-h-64 border-slate-700/50 bg-slate-800/50" />
                </div>
              ) : (
                cq.stem && <MarkdownRenderer content={cq.stem} />
              )}
            </div>
          )}

          {/* Questions Stack */}
          <div className="flex flex-col gap-3 mb-5">
            {cq.questions && Object.entries(cq.questions).map(([key, content]) => {
              if (!content || !content.trim()) return null;
              const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
              return (
                <div key={key} className="p-3 border rounded-lg bg-slate-900/20 border-slate-800/50">
                  <div className="flex items-start gap-2">
                    <div className="font-bold text-indigo-400 shrink-0 mt-[1px]">{labels[key] || key}.</div>
                    <div className="flex-1 min-w-0">
                      <MarkdownRenderer content={content.replace(/^(?:[\*\s]*(?:\([কখগঘ]\)|[কখগঘ]\.)[\*\s]*)+/, '')} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answer Toggle Button */}
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-950/20 w-full sm:w-auto mx-auto"
          >
            <BookOpenCheck className="w-4 h-4" />
            {showAnswer ? "উত্তর লুকাও" : "উত্তর দেখুন"}
          </button>

          {/* Answers Section */}
          {showAnswer && (
            <div className="mt-5 space-y-4 duration-500 animate-in fade-in slide-in-from-top-4">
              {cq.answers && Object.entries(cq.answers).map(([key, content]) => {
                if (!content || !content.trim()) return null;
                const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
                return (
                  <div key={key} className="p-4 border bg-emerald-950/5 rounded-xl border-emerald-500/10">
                    <div className="flex flex-col gap-2">
                      <div className="font-bold text-emerald-400">{labels[key] || key} এর উত্তর:</div>
                      <div className="min-w-0 text-slate-200">
                        <MarkdownRenderer content={content.replace(/^(?:[\*\s]*(?:উত্তর\s*\([কখগঘ]\)\s*[:\-]?|উত্তর\s*[কখগঘ]\s*[:\-]?|উত্তর\s*[:\-]?|\([কখগঘ]\)\s*উত্তর\s*[:\-]?|[কখগঘ]\.\s*উত্তর\s*[:\-]?|\([কখগঘ]\)|[কখগঘ]\.)[\*\s]*)+/i, '')} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <FeedbackModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        questionId={cq.firebaseId || cq.id}
        questionType="cq"
        chapterId={cq.chapterId || cq.chapterName}
        subjectId={cq.subject || 'Unknown'}
        questionData={{ ...cq, type: 'cq' }}
      />
    </div>
  );
});
SharedCQItem.displayName = 'SharedCQItem';
export default SharedCQItem;
