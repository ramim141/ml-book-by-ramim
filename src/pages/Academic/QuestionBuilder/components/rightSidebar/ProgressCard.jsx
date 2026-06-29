import React from 'react';
import { Target } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

const ProgressCard = React.memo(({ selected = 0, target = 25 }) => {
  const safeTarget = target || 25;
  const percentage = Math.min(100, Math.round((selected / safeTarget) * 100));

  return (
    <section className="animate-[fade-up_200ms_ease-out] rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl shadow-slate-950/20 transition duration-150 hover:border-slate-600 hover:bg-slate-800/45">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-100">অগ্রগতি</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">প্রশ্ন নির্বাচন লক্ষ্য</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-300">
          <Target className="h-4 w-4" />
        </div>
      </div>

      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500">নির্বাচিত</p>
          <p className="text-2xl font-black text-slate-100">{enToBn(selected)} / {enToBn(safeTarget)}</p>
        </div>
        <p className="text-lg font-black text-indigo-300">{enToBn(percentage)}%</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-900/70" aria-label={`Selection progress ${percentage}%`}>
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
});

ProgressCard.displayName = 'ProgressCard';

export default ProgressCard;
