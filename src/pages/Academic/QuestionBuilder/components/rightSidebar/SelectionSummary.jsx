import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

const summaryItems = [
  { key: 'mcq', label: 'MCQ', className: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  { key: 'k', label: 'জ্ঞান', className: 'bg-violet-500/10 text-violet-300 border-violet-500/20' },
  { key: 'kh', label: 'অনুধাবন', className: 'bg-orange-500/10 text-orange-300 border-orange-500/20' },
  { key: 'cq', label: 'সৃজনশীল', className: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' },
  { key: 'short', label: 'সংক্ষিপ্ত', className: 'bg-slate-800/60 text-slate-300 border-slate-700/60' },
];

const SelectionSummary = React.memo(({ counts }) => (
  <section className="animate-[fade-up_200ms_ease-out] rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl shadow-slate-950/20 transition duration-150 hover:border-slate-600 hover:bg-slate-800/45">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-extrabold text-slate-100">প্রশ্নের ধরন</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500">লাইভ আপডেট</p>
      </div>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {summaryItems.map((item) => (
        <div key={item.key} className={`rounded-xl border p-3 ${item.className}`}>
          <div className="text-xl font-black tabular-nums transition-all duration-200">{enToBn(counts[item.key] || 0)}</div>
          <div className="mt-1 truncate text-[10px] font-extrabold uppercase tracking-wide">{item.label}</div>
        </div>
      ))}
    </div>
  </section>
));

SelectionSummary.displayName = 'SelectionSummary';

export default SelectionSummary;
