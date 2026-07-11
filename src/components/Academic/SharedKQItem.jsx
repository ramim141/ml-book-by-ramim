import React, { useState, memo } from 'react';
import { BookOpen, Flag, Bookmark, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import MarkdownRenderer from '../UI/MarkdownRenderer';
import FeedbackModal from './FeedbackModal';
import { useBookmark } from '../../hooks/useBookmark';

const SharedKQItem = memo(({ kq, chapterName }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { isBookmarked, toggleBookmark, isLoading } = useBookmark(kq.id, { ...kq, type: 'kq' });

  const isKnowledge = kq.type === 'k';
  const colorStyles = isKnowledge 
    ? {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20'
      }
    : {
        bg: 'bg-fuchsia-500/10',
        text: 'text-fuchsia-400',
        border: 'border-fuchsia-500/20'
      };

  const handleFlip = (e) => {
    // prevent flip if clicking on buttons
    if (e.target.closest('button')) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="perspective-1000 w-full mb-4">
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="preserve-3d relative w-full cursor-pointer"
        onClick={handleFlip}
      >
        {/* ========================================================
            FRONT SIDE (Question)
            ======================================================== */}
        <div 
          className={`backface-hidden w-full transition-shadow duration-300 border border-slate-700/50 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 shadow-lg hover:shadow-xl ${
            isFlipped ? 'absolute top-0 left-0' : 'relative'
          }`}
        >
          <div className="p-5 sm:p-6 flex flex-col min-h-[160px]">
            {/* Top row: tags & actions */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border} border flex items-center gap-1.5`}>
                  <BookOpen className="w-3.5 h-3.5" />
                  {isKnowledge ? 'জ্ঞানমূলক (ক)' : 'অনুধাবনমূলক (খ)'}
                </span>
                {(chapterName || kq.chapterName || kq.chapterId) && (
                  <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                    {chapterName || kq.chapterName || (kq.chapterId ? `অধ্যায় ${kq.chapterId.replace('ch_', '')}` : '')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-slate-500 shrink-0 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
                  disabled={isLoading}
                  className={`p-2 rounded-xl transition-colors ${
                    isBookmarked 
                      ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' 
                      : 'hover:text-amber-400 hover:bg-amber-400/10 bg-slate-900/50'
                  }`}
                  title={isBookmarked ? "বুকমার্ক রিমুভ করুন" : "বুকমার্ক করুন"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsReportModalOpen(true); }}
                  className="p-2 rounded-xl hover:text-rose-400 hover:bg-rose-500/10 transition-colors bg-slate-900/50"
                  title="রিপোর্ট করুন"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Text & Image */}
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              {kq.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 inline-block">
                  <img src={kq.imageUrl} alt="Question Image" className="max-w-full h-auto max-h-48 object-contain" loading="lazy" />
                </div>
              )}
              <div className="text-lg sm:text-xl font-bold text-slate-100 leading-relaxed">
                <MarkdownRenderer content={kq.question || "প্রশ্ন"} />
              </div>
            </div>

            {/* Bottom Row: Metadata & Hint */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                {kq.board && kq.board.map((b, idx) => (
                  <span key={idx} className="bg-slate-900/60 px-2 py-1 rounded-md border border-slate-700/50">
                    {b}
                  </span>
                ))}
                {kq.topic && <span className="font-semibold text-slate-500">• {kq.topic}</span>}
              </div>
              
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full animate-pulse">
                <RotateCw className="w-3.5 h-3.5" /> উত্তর দেখতে ক্লিক করুন
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            BACK SIDE (Answer)
            ======================================================== */}
        <div 
          className={`backface-hidden rotate-y-180 w-full transition-shadow duration-300 border border-slate-700/50 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90 shadow-xl ${
            !isFlipped ? 'absolute top-0 left-0' : 'relative'
          }`}
        >
          <div className="p-5 sm:p-6 flex flex-col min-h-[160px]">
             {/* Top row: tags & actions (same as front for consistency, or simpler) */}
             <div className="flex items-start justify-between gap-4 mb-4">
              <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border} border`}>
                উত্তর
              </span>
              
              <div className="flex items-center gap-1 text-slate-500 shrink-0 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
                  disabled={isLoading}
                  className={`p-2 rounded-xl transition-colors ${
                    isBookmarked 
                      ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' 
                      : 'hover:text-amber-400 hover:bg-amber-400/10 bg-slate-900/50'
                  }`}
                  title={isBookmarked ? "বুকমার্ক রিমুভ করুন" : "বুকমার্ক করুন"}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Answer Text */}
            <div className={`flex-1 text-justify sm:text-left text-slate-200 text-sm sm:text-base leading-relaxed ${isKnowledge ? 'prose-purple' : 'prose-fuchsia'}`}>
              <MarkdownRenderer content={kq.answer?.replace(/^(?:[\*\s]*(?:উত্তর\s*[:\-]?|উত্তর)[\*\s]*)+/i, '') || ''} />
            </div>

            {/* Bottom Row */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors">
                <RotateCw className="w-3.5 h-3.5" /> প্রশ্নে ফিরে যান
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Report Modal */}
      <FeedbackModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        questionId={kq.firebaseId || kq.id}
        questionType="knowledge"
        chapterId={kq.chapterId || kq.chapterName}
        subjectId={kq.subject || 'Unknown'}
        questionData={{ ...kq, type: 'knowledge' }}
      />
    </div>
  );
});

SharedKQItem.displayName = 'SharedKQItem';
export default SharedKQItem;
