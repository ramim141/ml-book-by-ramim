import React from 'react';
import { Trash2, X } from 'lucide-react';

const getCartQuestionType = (type) => {
  if (type === 'cq') return 'CQ';
  if (type === 'mcq') return 'MCQ';
  return 'K/KH';
};

const getCartQuestionText = (q) => (
  q.type === 'cq'
    ? q.title || 'Creative question'
    : q.question?.replace(/<[^>]*>/gm, '')
);

const CartItem = React.memo(({ q, index, onRemove, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-start justify-between gap-2 p-3 border bg-black/30 rounded-xl border-white/5">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-slate-400">Q{index + 1} · </span>
          <span className="text-xs text-slate-300 line-clamp-2">{getCartQuestionText(q)}</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(q.uniqueId)}
          className="p-1 transition text-slate-500 hover:text-red-400 shrink-0"
          title="Remove question"
          aria-label="Remove question"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative bg-black/30 p-3.5 rounded-xl border border-white/5 hover:bg-black/50 hover:border-white/10 transition-all duration-200">
      <div className="flex-1 min-w-0 pr-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-bold text-slate-300">Q{index + 1}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{getCartQuestionType(q.type)}</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-300 line-clamp-2">{getCartQuestionText(q)}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(q.uniqueId)}
        className="absolute right-3 top-3.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none "
        title="Remove question"
        aria-label="Remove question"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

export default CartItem;
