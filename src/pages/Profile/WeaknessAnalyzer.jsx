import React, { useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function WeaknessAnalyzer({ chapterStats }) {
  const analysis = useMemo(() => {
    if (!chapterStats || Object.keys(chapterStats).length === 0) {
      return null;
    }

    const chapters = Object.entries(chapterStats).map(([name, stats]) => {
      const { attempted, correct, wrong } = stats;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      
      let status = 'average';
      if (accuracy >= 80) status = 'strong';
      else if (accuracy < 50) status = 'weak';

      return {
        name,
        attempted,
        correct,
        wrong,
        accuracy,
        status
      };
    });

    // Sort by accuracy (lowest first to show weaknesses)
    chapters.sort((a, b) => a.accuracy - b.accuracy);

    const weak = chapters.filter(c => c.status === 'weak');
    const strong = chapters.filter(c => c.status === 'strong');
    const average = chapters.filter(c => c.status === 'average');

    return { chapters, weak, strong, average };
  }, [chapterStats]);

  if (!analysis) {
    return (
      <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-700/50 text-center">
        <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-300 mb-2">ডেটা পাওয়া যায়নি</h3>
        <p className="text-slate-400 text-sm">
          তুমি এখনও কোনো মডেল টেস্ট দেওনি অথবা কোনো প্রশ্ন এটেম্পট করোনি। মডেল টেস্ট দিলে এখানে তোমার পারফরম্যান্স অ্যানালাইসিস দেখতে পাবে।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Weaknesses Section */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h3 className="text-lg font-bold text-red-400">দুর্বলতা (Weaknesses)</h3>
        </div>
        
        {analysis.weak.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.weak.map(chapter => (
              <div key={chapter.name} className="bg-slate-900/60 border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-1 bg-red-500" />
                <h4 className="text-slate-200 font-bold text-sm mb-2 pr-4">{chapter.name}</h4>
                <div className="flex justify-between items-end">
                  <div className="text-xs text-slate-400">
                    <div>সঠিক: <span className="text-emerald-400 font-bold">{chapter.correct}</span></div>
                    <div>ভুল: <span className="text-red-400 font-bold">{chapter.wrong}</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-red-400">{chapter.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">খুব ভালো! তোমার কোনো অধ্যায়ে বড় ধরনের দুর্বলতা নেই।</p>
        )}
      </div>

      {/* Strengths Section */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <h3 className="text-lg font-bold text-emerald-400">শক্তিশালী দিক (Strengths)</h3>
        </div>
        
        {analysis.strong.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analysis.strong.map(chapter => (
              <div key={chapter.name} className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-1 bg-emerald-500" />
                <h4 className="text-slate-200 font-bold text-sm mb-2 pr-4">{chapter.name}</h4>
                <div className="flex justify-between items-end">
                  <div className="text-xs text-slate-400">
                    <div>সঠিক: <span className="text-emerald-400 font-bold">{chapter.correct}</span></div>
                    <div>ভুল: <span className="text-red-400 font-bold">{chapter.wrong}</span></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400">{chapter.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">এখনও কোনো অধ্যায়ে ৮০% এর উপরে একিউরেসি নেই। প্র্যাকটিস চালিয়ে যাও!</p>
        )}
      </div>

      {/* All Chapters Overview */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">সকল অধ্যায়ের পারফরম্যান্স</h3>
        </div>
        
        <div className="space-y-4 mt-6">
          {analysis.chapters.map(chapter => {
            const barColor = chapter.status === 'weak' ? 'bg-red-500' : 
                             chapter.status === 'strong' ? 'bg-emerald-500' : 'bg-amber-500';
            
            return (
              <div key={chapter.name} className="flex flex-col">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-semibold text-slate-300 max-w-[70%] truncate" title={chapter.name}>
                    {chapter.name}
                  </span>
                  <span className={`text-xs font-bold ${
                    chapter.status === 'weak' ? 'text-red-400' : 
                    chapter.status === 'strong' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {chapter.accuracy}%
                  </span>
                </div>
                
                <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden w-full flex">
                  <div 
                    className={`h-full ${barColor} rounded-full transition-all duration-700`} 
                    style={{ width: `${chapter.accuracy}%` }}
                  />
                </div>
                
                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                  <span>মোট চেষ্টা: {chapter.attempted}</span>
                  <span>সঠিক: {chapter.correct} | ভুল: {chapter.wrong}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
