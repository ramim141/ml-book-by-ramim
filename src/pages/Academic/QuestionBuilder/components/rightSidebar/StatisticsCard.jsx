import React from 'react';
import { BarChart3 } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

const StatisticsCard = React.memo(({ stats }) => {
  const items = [
    { label: 'মোট প্রশ্ন', value: enToBn(stats.totalQuestions || 0) },
    { label: 'আনুমানিক নম্বর', value: enToBn(stats.estimatedMarks || 0) },
    { label: 'কঠিনতার ধরন', value: stats.averageDifficulty || 'মিশ্র' },
    { label: 'অধ্যায়', value: enToBn(stats.uniqueChapters || 0) },
    { label: 'টপিক', value: enToBn(stats.uniqueTopics || 0) },
  ];

  return (
    <section className="animate-[fade-up_200ms_ease-out] rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 shadow-xl shadow-slate-950/20 transition duration-150 hover:border-slate-600 hover:bg-slate-800/45">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-100">সংক্ষিপ্ত হিসাব</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">নির্বাচিত প্রশ্ন অনুযায়ী</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-300">
          <BarChart3 className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/40 bg-slate-900/45 px-3 py-2.5">
            <span className="text-xs font-bold text-slate-500">{item.label}</span>
            <span className="text-sm font-black text-slate-100">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
});

StatisticsCard.displayName = 'StatisticsCard';

export default StatisticsCard;
