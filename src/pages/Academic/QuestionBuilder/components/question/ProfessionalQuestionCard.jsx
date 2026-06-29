import React, { useState } from 'react';
import { Check, Eye, Plus, X, HelpCircle, Trash2, ChevronDown, Circle, BookOpen } from 'lucide-react';
import { enToBn, MarkdownRenderer } from '../../helpers.jsx';
import {
  ExpandedQuestionDetails,
  getDifficultyMeta,
  getQuestionTypeMeta,
  QuestionBadge,
  QuestionMetaBadge,
} from './QuestionCardParts.jsx';

const ProfessionalQuestionCard = React.memo(({ q, qIndex, isAdded, onAdd, onRemove }) => {
  const [showMore, setShowMore] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const typeMeta = getQuestionTypeMeta(q.type);
  const difficulty = getDifficultyMeta(q.difficulty);
  const imageSrc = q.image || q.image_url;
  const previewContent = q.type === 'cq' ? (q.stem || q.title || 'সৃজনশীল প্রশ্ন') : (q.question || q.title || '');
  const questionId = q.id || q.uniqueId;

  if (q.type === 'cq') {
    return (
      <article
        className={`group overflow-hidden rounded-2xl transition duration-200 hover:bg-slate-800/40 ${
          isAdded ? 'bg-indigo-950/30' : 'bg-[#0f172a]'
        }`}
      >
        <div
          onClick={() => setShowMore((prev) => !prev)}
          className="flex cursor-pointer items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-800/30 sm:p-5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <div className="hidden shrink-0 items-center justify-center rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-2.5 text-emerald-400 sm:flex">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              {q.chapterName && (
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="rounded-md bg-indigo-900/50 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    {q.chapterName}
                  </span>
                </div>
              )}
              <h3 className="truncate text-sm font-bold text-white sm:text-base">
                {q.title || `সৃজনশীল প্রশ্ন ${enToBn(qIndex + 1)}`}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400">
                {q.boards && q.boards[0] && (
                  <span className="rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5">
                    {q.boards[0].name} {q.boards[0].year ? `- ${enToBn(q.boards[0].year)}` : ''}
                  </span>
                )}
                {q.boards && q.boards[0] && q.topic && <span>•</span>}
                {q.topic && <span>{q.topic}</span>}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (isAdded) onRemove(q.uniqueId);
                else onAdd(q);
              }}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 active:scale-95 ${
                isAdded 
                  ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]' 
                  : 'border-slate-600 bg-transparent text-transparent hover:border-slate-500 hover:bg-slate-800/50'
              }`}
              title={isAdded ? "Remove" : "Add"}
            >
              <Check className="h-4 w-4" strokeWidth={3.5} />
            </button>
            <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {showMore && (
          <div className="border-t border-slate-800/80 bg-slate-950/30 px-4 pb-5 pt-2 sm:px-5">
            <div className="mt-3">
              <ExpandedQuestionDetails q={q} />
            </div>
          </div>
        )}
      </article>
    );
  }

  if (q.type === 'mcq') {
    return (
      <article
        onClick={() => {
          if (isAdded) onRemove(q.uniqueId);
          else onAdd(q);
        }}
        className={`group cursor-pointer overflow-hidden rounded-2xl border transition duration-200 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20 ${
          isAdded ? 'border-indigo-400/70 bg-indigo-950/20 ring-1 ring-indigo-400/20' : 'border-slate-800/80 bg-[#0f172a]'
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-xs sm:text-[13px] font-black text-indigo-300">
              {enToBn(qIndex + 1)}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white sm:text-base leading-relaxed">
                <MarkdownRenderer content={previewContent} />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {q.chapterName && (
                  <span className="rounded-md bg-indigo-900/50 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    {q.chapterName}
                  </span>
                )}
                {q.boards && q.boards[0] && (
                  <span className="rounded-md bg-emerald-900/30 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                    {q.boards[0].name} {q.boards[0].year ? enToBn(q.boards[0].year.toString().slice(-2)) : ''}
                  </span>
                )}
                {q.topic && (
                  <span className="rounded-md bg-cyan-900/30 border border-cyan-800/50 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                    {q.topic}
                  </span>
                )}
              </div>

              {imageSrc && (
                <div className="mt-3 mb-2">
                  <img src={imageSrc} alt="Question visual" className="max-h-48 rounded-lg object-contain" />
                </div>
              )}

              {q.options?.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {q.options.slice(0, 4).map((option, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                        isAdded 
                          ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-100' 
                          : 'border-slate-700/60 bg-slate-800/30 text-slate-300 group-hover:border-slate-600/60'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="h-4 w-4 shrink-0 text-indigo-400" strokeWidth={3} />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-slate-500" />
                      )}
                      <div className="min-w-0 flex-1">
                        <MarkdownRenderer content={option} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={() => {
        if (isAdded) onRemove(q.uniqueId);
        else onAdd(q);
      }}
      className={`group cursor-pointer overflow-hidden rounded-2xl border transition duration-200 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20 ${
        isAdded ? 'border-indigo-400/70 bg-indigo-950/20 ring-1 ring-indigo-400/20' : 'border-slate-800/80 bg-[#0f172a]'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${
              isAdded 
                ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400 shadow-inner group-hover:border-indigo-500/40'
            }`}>
              {isAdded ? <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} /> : <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />}
            </div>
            
            <div className="min-w-0 flex-1">
              {q.chapterName && (
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="rounded-md bg-indigo-900/50 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    {q.chapterName}
                  </span>
                </div>
              )}
              <div className="text-sm font-bold text-white sm:text-base leading-relaxed">
                <MarkdownRenderer content={previewContent} />
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  {typeMeta.label}
                </span>
                
                {q.board && Array.isArray(q.board) && q.board.map((bStr, bIdx) => (
                  <span key={`bstr-${bIdx}`} className="rounded-md border border-slate-700/80 bg-slate-800/40 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {bStr}
                  </span>
                ))}

                {q.boards && Array.isArray(q.boards) && q.boards.map((board, bIdx) => (
                  <span key={bIdx} className="rounded-md border border-slate-700/80 bg-slate-800/40 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                    {board.name}{board.year ? `-${enToBn(board.year)}` : ''}
                  </span>
                ))}
                
                {q.topic && (
                  <span className="ml-1 text-[11px] font-medium text-slate-400">
                    • {q.topic}
                  </span>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {imageSrc && (
        <div className="px-4 pb-4 sm:px-5">
          <img src={imageSrc} alt="Question visual" className="max-h-48 rounded-lg object-contain" />
        </div>
      )}
    </article>
  );
});

export default ProfessionalQuestionCard;

