import React from 'react';
import { Bookmark } from 'lucide-react';
import { MarkdownRenderer } from '../../helpers.jsx';

export const getQuestionTypeMeta = (type) => {
  if (type === 'mcq') return { label: 'MCQ', className: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/30' };
  if (type === 'cq') return { label: 'CQ', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' };
  if (type === 'k') return { label: 'জ্ঞানমূলক (ক)', className: 'bg-violet-500/15 text-violet-200 border-violet-400/30' };
  if (type === 'kh') return { label: 'অনুধাবনমূলক (খ)', className: 'bg-orange-500/15 text-orange-200 border-orange-400/30' };
  if (type === 'short') return { label: 'সংক্ষিপ্ত', className: 'bg-slate-800 text-slate-300 border-slate-700' };
  return { label: 'প্রশ্ন', className: 'bg-slate-800 text-slate-300 border-slate-700' };
};

const difficultyMeta = {
  easy: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
  medium: 'border-orange-400/30 bg-orange-500/15 text-orange-200',
  hard: 'border-red-400/30 bg-red-500/15 text-red-200',
  mixed: 'border-slate-700 bg-slate-800 text-slate-300',
};

export const getDifficultyMeta = (difficulty) => {
  const key = String(difficulty || 'mixed').toLowerCase();
  return {
    label: key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Mixed',
    className: difficultyMeta[key] || difficultyMeta.mixed,
  };
};

export const QuestionBadge = React.memo(({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${className}`}>
    {children}
  </span>
));

export const QuestionActionButton = React.memo(({ label, children, className = '', ...props }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition duration-150 focus:outline-none ${className}`}
    {...props}
  >
    {children || <Bookmark className="h-4 w-4" />}
  </button>
));

export const QuestionMetaBadge = React.memo(({ label, value, className = '' }) => {
  if (!value) return null;
  return (
    <span className={`inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${className}`}>
      <span className="text-slate-500">{label}</span>
      <span className="truncate">{value}</span>
    </span>
  );
});

export const ExpandedQuestionDetails = React.memo(({ q }) => {
  const imageSrc = q.image || q.image_url;
  const cqLabels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };

  if (q.type === 'mcq') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {q.options?.map((option, idx) => (
          <div key={idx} className="flex gap-2 rounded-xl border border-slate-700/70 bg-slate-950/30 px-3 py-2.5 text-sm text-slate-300">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-[11px] font-extrabold text-indigo-200">
              {['A', 'B', 'C', 'D'][idx] || idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <MarkdownRenderer content={option} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (q.type === 'cq') {
    return (
      <div className="space-y-3">
        {(q.stem || imageSrc) && (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Stimulus</div>
            {imageSrc && <img src={imageSrc} alt="Question visual" loading="lazy" className="mb-3 max-h-64 w-full rounded-xl object-contain" />}
            {q.stem && <MarkdownRenderer content={q.stem} />}
          </div>
        )}
        <div className="space-y-2">
          {q.questions && Object.entries(q.questions).map(([key, content]) => {
            if (!content?.trim()) return null;
            return (
              <div key={key} className="flex gap-3 rounded-xl border border-slate-700/70 bg-slate-950/30 p-3 text-slate-300">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-extrabold text-emerald-200">
                  {cqLabels[key] || key}
                </span>
                <div className="min-w-0 flex-1">
                  <MarkdownRenderer content={content.replace(/^\*\*[কখগঘ][.)]\*\*\s*/, '')} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4 text-slate-300">
      <MarkdownRenderer content={q.question || q.title || ''} />
    </div>
  );
});
