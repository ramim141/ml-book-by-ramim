import React from 'react';

const QuestionCardSkeleton = React.memo(() => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 rounded bg-slate-800" />
        <div className="h-9 w-20 rounded-xl bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-11/12 rounded bg-slate-800" />
        <div className="h-4 w-8/12 rounded bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-slate-800" />
        <div className="h-6 w-20 rounded-full bg-slate-800" />
      </div>
    </div>
  </div>
));

export default QuestionCardSkeleton;
