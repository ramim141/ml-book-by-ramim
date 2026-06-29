import React from 'react';
import { Check, Circle, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { enToBn, MarkdownRenderer } from '../../helpers.jsx';

const QuestionCard = ({ q, qIndex, isAdded, onAdd, onRemove, expandedCQs, setExpandedCQs }) => {
  if (q.type === 'cq') {
    const isExpanded = expandedCQs.includes(q.uniqueId);
    return (
      <div className="overflow-hidden transition-all duration-300 border group bg-slate-900/60 border-slate-800 rounded-2xl hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-950/20">
        <div
          onClick={() => setExpandedCQs((prev) => prev.includes(q.uniqueId) ? prev.filter((id) => id !== q.uniqueId) : [...prev, q.uniqueId])}
          className="flex items-center justify-between gap-3 p-4 transition-colors cursor-pointer sm:p-5 hover:bg-slate-800/30"
        >
          <div className="flex items-center flex-1 min-w-0 gap-3 sm:gap-4">
            <div className="hidden sm:flex p-2.5 bg-[#8b5cf6]/10 rounded-xl text-indigo-400 shrink-0 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md inline-block border border-indigo-500/20">
                  {q.chapterName}
                </span>
                <span className="text-[10px] font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md inline-block border border-violet-500/20">
                  CQ
                </span>
                {q.topic && (
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md inline-block border border-cyan-500/20">
                    {q.topic}
                  </span>
                )}
              </div>
              <h3 className="text-[13px] font-bold text-white sm:text-sm truncate">{q.title || 'Creative question'}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdded ? (
              <button onClick={(e) => { e.stopPropagation(); onRemove(q.uniqueId); }} className="flex items-center justify-center p-2 text-red-400 transition-all border bg-red-500/10 border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl active:scale-95" title="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); onAdd(q); }} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white p-2 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center" title="Add">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pt-2 pb-5 border-t sm:px-5 border-slate-800/80 bg-slate-950/30">
            <div className="mt-3 mb-4 space-y-2">
              {(q.image || q.image_url || q.stem) && (
                <div className="text-slate-300">
                  {(q.image || q.image_url) && (
                    <div className="flex justify-center mb-4">
                      <img src={q.image || q.image_url} alt="Question visual" className="object-contain max-w-full rounded-lg max-h-64" />
                    </div>
                  )}
                  {q.stem && <MarkdownRenderer content={q.stem} />}
                </div>
              )}
              <div className="flex flex-col gap-2.5">
                {q.questions && Object.entries(q.questions).map(([key, content]) => {
                  if (!content?.trim()) return null;
                  const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
                  return (
                    <div key={key} className="py-2 flex gap-2.5">
                      <div className="font-extrabold text-indigo-400 shrink-0 mt-0.5">{labels[key] || key}.</div>
                      <div className="flex-1 text-slate-300">
                        <MarkdownRenderer content={content.replace(/^\*\*[কখগঘ][.)]\*\*\s*/, '')} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (q.type === 'mcq') {
    return (
      <div className="p-4 transition-all duration-300 border shadow-lg group bg-slate-900/60 sm:p-5 rounded-2xl border-slate-800 hover:border-indigo-500/30">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start flex-1 min-w-0 gap-3">
            <div className="font-bold w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs bg-[#8b5cf6]/20 text-indigo-300 border border-indigo-500/30">
              {enToBn(qIndex + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-[13px] sm:text-sm font-semibold leading-relaxed mb-2">
                <MarkdownRenderer content={q.question} />
              </div>
            </div>
          </div>
          <div className="shrink-0">
            {isAdded ? (
              <button onClick={() => onRemove(q.uniqueId)} className="flex items-center justify-center p-2 text-red-400 transition-all border bg-red-500/10 border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl active:scale-95" title="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => onAdd(q)} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white p-2 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center" title="Add">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:ml-12">
          {q.options?.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-700/50 bg-slate-900/40 text-slate-300 text-xs sm:text-sm hover:border-slate-600 transition">
              <Circle className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="flex-1"><MarkdownRenderer content={opt} /></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 transition-all duration-300 border shadow-lg group bg-slate-900/60 sm:p-5 rounded-2xl border-slate-800 hover:border-indigo-500/30">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 font-extrabold shrink-0 mt-0.5 text-[13px]">{q.type === 'k' ? 'ক.' : 'খ.'}</span>
            <div className="text-slate-200 text-[13px] sm:text-sm font-semibold leading-relaxed">
              <MarkdownRenderer content={q.question} />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          {isAdded ? (
            <button onClick={() => onRemove(q.uniqueId)} className="flex items-center justify-center p-2 text-red-400 transition-all border bg-red-500/10 border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl active:scale-95" title="Remove">
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => onAdd(q)} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white p-2 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center" title="Add">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
