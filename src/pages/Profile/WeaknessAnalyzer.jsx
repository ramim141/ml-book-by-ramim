import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Target, AlertTriangle, ShieldCheck, Activity, Play } from 'lucide-react';

/** দুর্বল অধ্যায় থেকে সরাসরি সেই অধ্যায়ের মডেল টেস্টে নিয়ে যায় */
const practiceHref = (row) =>
  `/academic/model-test?subject=${encodeURIComponent(row.subjectId)}&chapter=${encodeURIComponent(row.chapterId)}`;

const PracticeButton = ({ row, tone = 'rose' }) => {
  if (!row.practiceable) return null;
  const tones = {
    rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
    slate: 'border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-800',
  };
  return (
    <Link
      to={practiceHref(row)}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${tones[tone]}`}
    >
      <Play className="h-3 w-3" /> অনুশীলন
    </Link>
  );
};

/**
 * শুধু দুর্বলতা দেখিয়ে থেমে গেলে ছাত্র জানে "কোথায় খারাপ", কিন্তু
 * "এখন কী করব" জানে না। তাই প্রতিটি অধ্যায়ের পাশে সরাসরি সেই অধ্যায়ের
 * মডেল টেস্টে যাওয়ার বোতাম — পরীক্ষা → দুর্বলতা → অনুশীলন → আবার মাপা,
 * চক্রটা এখানেই সম্পূর্ণ হয়।
 */
export default function WeaknessAnalyzer({ chapterRows = [] }) {
  const analysis = useMemo(() => {
    if (!Array.isArray(chapterRows) || chapterRows.length === 0) return null;

    const chapters = chapterRows.map((row) => {
      const attempted = row.attempted || 0;
      const correct = row.correct || 0;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      let status = 'average';
      if (accuracy >= 80) status = 'strong';
      else if (accuracy < 50) status = 'weak';

      return { ...row, attempted, correct, wrong: row.wrong || 0, accuracy, status };
    });

    chapters.sort((a, b) => a.accuracy - b.accuracy);

    const weak = chapters.filter((c) => c.status === 'weak');
    const strong = chapters.filter((c) => c.status === 'strong');
    const average = chapters.filter((c) => c.status === 'average');

    const totalAttempted = chapters.reduce((sum, c) => sum + c.attempted, 0);
    const totalCorrect = chapters.reduce((sum, c) => sum + c.correct, 0);
    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    return { chapters, weak, strong, average, totalAttempted, totalCorrect, overallAccuracy };
  }, [chapterRows]);

  if (!analysis) {
    return (
      <div className="rounded-2xl bg-white/[0.02] p-8 text-center">
        <Activity className="mx-auto mb-4 h-12 w-12 text-slate-600" />
        <h3 className="mb-2 text-lg font-bold text-slate-300">ডেটা পাওয়া যায়নি</h3>
        <p className="text-sm text-slate-400">
          তুমি এখনও কোনো মডেল টেস্ট দেওনি। পরীক্ষা দিলে এখানে অধ্যায়ভিত্তিক বিশ্লেষণ দেখতে পাবে।
        </p>
      </div>
    );
  }

  const accuracyTone =
    analysis.overallAccuracy >= 80 ? 'text-emerald-400'
      : analysis.overallAccuracy >= 50 ? 'text-amber-400'
        : 'text-red-400';

  // সবচেয়ে দুর্বল কয়েকটা — এখান থেকেই পড়া শুরু করা উচিত
  const focus = analysis.weak.slice(0, 3);

  return (
    <div className="space-y-5">

      {/* এক নজরে */}
      <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: 'গড় একিউরেসি', value: `${analysis.overallAccuracy}%`, tone: accuracyTone },
          { label: 'মোট চেষ্টা', value: analysis.totalAttempted, tone: 'text-slate-100' },
          { label: 'দুর্বল অধ্যায়', value: analysis.weak.length, tone: 'text-red-400' },
          { label: 'শক্তিশালী', value: analysis.strong.length, tone: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 text-center">
            <p className={`text-xl font-black sm:text-2xl ${stat.tone}`}>{stat.value}</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-slate-500 sm:text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* এখন কী করব — সবচেয়ে জরুরি অংশটা সবার উপরে */}
      {focus.length > 0 && (
        <div className="rounded-2xl border border-indigo-400/25 bg-gradient-to-b from-indigo-500/10 to-transparent p-5">
          <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-white">
            <Target className="h-4 w-4 text-indigo-300" /> এখন এগুলো অনুশীলন করো
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            সবচেয়ে কম নম্বর পাওয়া অধ্যায়গুলো — এখান থেকে শুরু করলে দ্রুত উন্নতি হবে।
          </p>
          <div className="space-y-2">
            {focus.map((c) => (
              <div key={`${c.subjectId}-${c.chapterId}`} className="flex items-center gap-3 rounded-xl bg-slate-950/40 p-3">
                <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-xs font-black text-red-400">
                  {c.accuracy}%
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-200">{c.name}</span>
                <PracticeButton row={c} tone="rose" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* দুর্বলতা */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <h3 className="text-base font-bold text-red-400">দুর্বলতা</h3>
        </div>

        {analysis.weak.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {analysis.weak.map((chapter) => (
              <div key={`${chapter.subjectId}-${chapter.chapterId}`} className="rounded-xl border border-red-500/25 bg-slate-950/50 p-3.5">
                <h4 className="mb-2 text-sm font-bold text-slate-200">{chapter.name}</h4>
                <div className="flex items-end justify-between gap-2">
                  <div className="text-xs text-slate-400">
                    <div>সঠিক: <span className="font-bold text-emerald-400">{chapter.correct}</span></div>
                    <div>ভুল: <span className="font-bold text-red-400">{chapter.wrong}</span></div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-xl font-black text-red-400">{chapter.accuracy}%</span>
                    <PracticeButton row={chapter} tone="rose" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">খুব ভালো! তোমার কোনো অধ্যায়ে বড় দুর্বলতা নেই।</p>
        )}
      </div>

      {/* শক্তিশালী দিক */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-bold text-emerald-400">শক্তিশালী দিক</h3>
        </div>

        {analysis.strong.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {analysis.strong.map((chapter) => (
              <div key={`${chapter.subjectId}-${chapter.chapterId}`} className="rounded-xl border border-emerald-500/25 bg-slate-950/50 p-3.5">
                <h4 className="mb-2 text-sm font-bold text-slate-200">{chapter.name}</h4>
                <div className="flex items-end justify-between">
                  <div className="text-xs text-slate-400">
                    <div>সঠিক: <span className="font-bold text-emerald-400">{chapter.correct}</span></div>
                    <div>ভুল: <span className="font-bold text-red-400">{chapter.wrong}</span></div>
                  </div>
                  <span className="text-xl font-black text-emerald-400">{chapter.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-slate-400">এখনও কোনো অধ্যায়ে ৮০%+ নেই। অনুশীলন চালিয়ে যাও!</p>
        )}
      </div>

      {/* সব অধ্যায় */}
      <div className="rounded-2xl bg-white/[0.02] p-5">
        <div className="mb-5 flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">সকল অধ্যায়ের পারফরম্যান্স</h3>
        </div>

        <div className="space-y-4">
          {analysis.chapters.map((chapter) => {
            const barColor = chapter.status === 'weak' ? 'bg-red-500'
              : chapter.status === 'strong' ? 'bg-emerald-500' : 'bg-amber-500';
            const textColor = chapter.status === 'weak' ? 'text-red-400'
              : chapter.status === 'strong' ? 'text-emerald-400' : 'text-amber-400';

            return (
              <div key={`${chapter.subjectId}-${chapter.chapterId}`}>
                <div className="mb-1.5 flex items-end justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-300" title={chapter.name}>
                    {chapter.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`text-xs font-bold ${textColor}`}>{chapter.accuracy}%</span>
                    {chapter.status !== 'strong' && (
                      <PracticeButton row={chapter} tone={chapter.status === 'weak' ? 'rose' : 'amber'} />
                    )}
                  </div>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${chapter.accuracy}%` }} />
                </div>

                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
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
