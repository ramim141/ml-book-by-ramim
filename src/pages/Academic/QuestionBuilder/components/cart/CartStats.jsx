import React from 'react';
import { enToBn } from '../../helpers.jsx';

const CartStats = React.memo(({ cartCounts }) => {
  const stats = [
    { label: 'CQ', val: cartCounts.cq, color: 'text-indigo-400' },
    { label: 'MCQ', val: cartCounts.mcq, color: 'text-amber-400' },
    { label: 'K/KH', val: cartCounts.kKh, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {stats.map((stat) => (
        <div key={stat.label} className="p-2 text-center border rounded-lg bg-black/30 border-white/5">
          <div className={`text-xl font-black ${stat.color}`}>{enToBn(stat.val)}</div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 mt-1 font-bold">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});

export default CartStats;
