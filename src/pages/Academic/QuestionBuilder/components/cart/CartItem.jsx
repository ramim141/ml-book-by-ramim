import React from 'react';
import { Trash2, X, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

const getCartQuestionType = (type) => {
  if (type === 'cq') return 'CQ';
  if (type === 'mcq') return 'MCQ';
  return 'K/KH';
};

const getCartQuestionText = (q) => (
  q.type === 'cq'
    ? q.title || q.stem || 'সৃজনশীল প্রশ্ন'
    : (q.question || q.stem || '').replace(/<[^>]*>/gm, '')
);

const MoveButton = ({ label, disabled, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="rounded-md p-1.5 sm:p-1 text-slate-500 transition-all hover:bg-white/10 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-slate-500"
  >
    {children}
  </button>
);

const CartItem = React.memo(({
  q,
  index,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  compact = false,
  usageIndex,
  onCompleteCq,
}) => {
  const usedIn = usageIndex?.get(q.uniqueId);
  const isMissingKaKha = q.type === 'cq' && (!q.questions?.ka?.trim() || !q.questions?.kha?.trim());

  if (compact) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-lg p-2.5 hover:bg-white/[0.03]">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-slate-500">প্রশ্ন {enToBn(index + 1)} · </span>
          <span className="text-xs text-slate-300 line-clamp-2">{getCartQuestionText(q)}</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(q.uniqueId)}
          className="p-1 transition text-slate-500 hover:text-red-400 shrink-0"
          title="প্রশ্নটি বাদ দিন"
          aria-label="প্রশ্নটি বাদ দিন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg p-2.5 transition-colors duration-150 hover:bg-white/[0.03]">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500">{enToBn(index + 1)}.</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {getCartQuestionType(q.type)}
        </span>

        {q.type === 'cq' && (
          <button
            type="button"
            onClick={() => onCompleteCq?.(q)}
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-extrabold transition ${
              isMissingKaKha
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
            }`}
            title={isMissingKaKha ? 'ক ও খ যুক্ত করে পূর্ণ CQ বানান' : 'ক ও খ এডিট করুন'}
          >
            <Sparkles className="h-2.5 w-2.5" />
            {isMissingKaKha ? 'ক, খ যোগ করুন' : 'ক/খ এডিট'}
          </button>
        )}

        <div className="ml-auto flex items-center gap-0.5 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:focus-within:opacity-100 sm:group-hover:opacity-100">
          <MoveButton label="উপরে নিন" disabled={isFirst} onClick={() => onMoveUp?.(index)}>
            <ChevronUp className="h-3.5 w-3.5" />
          </MoveButton>
          <MoveButton label="নিচে নিন" disabled={isLast} onClick={() => onMoveDown?.(index)}>
            <ChevronDown className="h-3.5 w-3.5" />
          </MoveButton>
          <button
            type="button"
            onClick={() => onRemove(q.uniqueId)}
            className="rounded-md p-1.5 sm:p-1 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
            title="প্রশ্নটি বাদ দিন"
            aria-label="প্রশ্নটি বাদ দিন"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-300 line-clamp-2">{getCartQuestionText(q)}</p>

      {q.chapterName && (
        <p className="mt-1 truncate text-[10px] font-semibold text-slate-600">{q.chapterName}</p>
      )}

      {usedIn?.length > 0 && (
        <p
          title={usedIn.map((u) => u.paperName).join(', ')}
          className="mt-1 truncate text-[10px] font-semibold text-amber-400"
        >
          ইতিমধ্যে &apos;{usedIn[0].paperName}&apos;-এ ব্যবহৃত{usedIn.length > 1 ? ` +${usedIn.length - 1}` : ''}
        </p>
      )}
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
