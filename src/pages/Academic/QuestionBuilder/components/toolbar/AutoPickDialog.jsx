import React, { useEffect, useMemo, useState } from 'react';
import { X, Wand2, Shuffle, Target, ListChecks } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';
import { TYPE_LABELS, DEFAULT_MARKS, markOf } from '../../marks.js';
import { shuffleArray } from '../../setUtils.js';

const PICK_TYPES = ['cq', 'mcq', 'k', 'kh'];

/**
 * একটা টার্গেট মোট নম্বর (ও চাইলে প্রতি ধরনের সর্বোচ্চ সংখ্যার সীমা) মিলিয়ে
 * প্রশ্ন বাছাই — এটা নিখুঁত সমাধান (exact knapsack) নয়, "যতটা সম্ভব কাছাকাছি"
 * পদ্ধতি: প্রতি ধরনের পুল শাফল করে, পালাক্রমে (round-robin) একটা একটা করে
 * প্রশ্ন যোগ করে যতক্ষণ না টার্গেটের কাছাকাছি পৌঁছায়।
 */
function pickForTargetMarks({ available, marksConfig, targetMarks, perTypeCap }) {
  const shuffled = {};
  PICK_TYPES.forEach((type) => { shuffled[type] = shuffleArray(available[type]); });

  const pickedIdx = { cq: 0, mcq: 0, k: 0, kh: 0 };
  const picked = [];
  let total = 0;

  const canTakeMore = (type) => {
    const cap = perTypeCap[type];
    const capOk = !Number.isFinite(cap) || cap <= 0 || pickedIdx[type] < cap;
    return capOk && pickedIdx[type] < shuffled[type].length;
  };

  // যতক্ষণ টার্গেটে না পৌঁছায় বা আর কোনো ধরন থেকে নেওয়ার থাকে
  while (total < targetMarks && PICK_TYPES.some(canTakeMore)) {
    let progressed = false;
    for (const type of PICK_TYPES) {
      if (total >= targetMarks) break;
      if (!canTakeMore(type)) continue;
      const q = shuffled[type][pickedIdx[type]];
      const mark = markOf(q, marksConfig);
      // ওভারশুট করলেও একবারের জন্য নেওয়া হয় — একদম কাছাকাছি পৌঁছানোর জন্য,
      // তারপর লুপ এমনিতেই total >= targetMarks এ থেমে যাবে
      pickedIdx[type] += 1;
      picked.push(q);
      total += mark;
      progressed = true;
    }
    if (!progressed) break;
  }

  return { picked, total };
}

/**
 * "৩ নম্বর অধ্যায় থেকে ২৫টা MCQ দাও" — শিক্ষকের সবচেয়ে সাধারণ চাওয়া।
 * আগে সেটার জন্য ২৫ বার আলাদা ক্লিক করতে হতো। এখন বর্তমান ফিল্টারের পুল
 * থেকে ধরন-ভিত্তিক সংখ্যা বসিয়ে একবারেই বাছাই করা যায়।
 *
 * "মোট ৭০ নম্বরের কাগজ চাই" — দ্বিতীয় মোড। নির্দিষ্ট সংখ্যার বদলে মোট নম্বর
 * (ও চাইলে বোর্ড-প্যাটার্ন অনুযায়ী প্রতি ধরনের সর্বোচ্চ সীমা) দিলে কাছাকাছি
 * পৌঁছানোর মতো প্রশ্ন বেছে দেয়।
 */
const AutoPickDialog = React.memo(({ isOpen, onClose, pool, cartIdSet, marksConfig, onConfirm }) => {
  const [mode, setMode] = useState('count');
  const [counts, setCounts] = useState({ cq: 0, mcq: 0, k: 0, kh: 0 });
  const [caps, setCaps] = useState({ cq: 0, mcq: 0, k: 0, kh: 0 });
  const [targetMarks, setTargetMarks] = useState(50);

  // পুলে যেগুলো আগে থেকেই কার্টে আছে সেগুলো বাদ — একই প্রশ্ন দুবার বসবে না
  const available = useMemo(() => {
    const groups = { cq: [], mcq: [], k: [], kh: [] };
    pool.forEach((q) => {
      if (cartIdSet.has(q.uniqueId)) return;
      if (groups[q.type]) groups[q.type].push(q);
    });
    return groups;
  }, [pool, cartIdSet]);

  // ডায়ালগ খুললে প্রতিবার শূন্য থেকে শুরু — আগের সংখ্যা রয়ে গেলে ভুল করে দ্বিগুণ যোগ হতো
  useEffect(() => {
    if (isOpen) {
      setCounts({ cq: 0, mcq: 0, k: 0, kh: 0 });
      setCaps({ cq: 0, mcq: 0, k: 0, kh: 0 });
    }
  }, [isOpen]);

  const plannedCount = useMemo(() => {
    let questions = 0;
    let marks = 0;
    PICK_TYPES.forEach((type) => {
      const n = Math.min(counts[type] || 0, available[type].length);
      questions += n;
      marks += n * Number(marksConfig[type] ?? DEFAULT_MARKS[type] ?? 1);
    });
    return { questions, marks };
  }, [counts, available, marksConfig]);

  // টার্গেট-মার্কস মোডে প্রতিবার re-render এ নতুন করে শাফল করলে বাটন চাপার
  // আগেই পরিকল্পনা বদলে যেত — তাই শুধু preview-এর জন্য একবার হিসাব করি
  const plannedTarget = useMemo(() => {
    if (mode !== 'target') return { questions: 0, marks: 0 };
    const { picked, total } = pickForTargetMarks({ available, marksConfig, targetMarks, perTypeCap: caps });
    return { questions: picked.length, marks: total };
  }, [mode, available, marksConfig, targetMarks, caps]);

  const planned = mode === 'target' ? plannedTarget : plannedCount;

  const setCount = (type, value) => {
    const n = Math.max(0, Math.min(Number(value) || 0, available[type].length));
    setCounts((prev) => ({ ...prev, [type]: n }));
  };

  const setCap = (type, value) => {
    const n = Math.max(0, Math.min(Number(value) || 0, available[type].length));
    setCaps((prev) => ({ ...prev, [type]: n }));
  };

  const handleConfirm = () => {
    if (mode === 'target') {
      const { picked } = pickForTargetMarks({ available, marksConfig, targetMarks, perTypeCap: caps });
      onConfirm(picked);
      onClose();
      return;
    }

    const picked = [];
    PICK_TYPES.forEach((type) => {
      const n = Math.min(counts[type] || 0, available[type].length);
      if (n === 0) return;
      picked.push(...shuffleArray(available[type]).slice(0, n));
    });
    onConfirm(picked);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex w-full max-w-md flex-col rounded-t-3xl border border-slate-800 bg-slate-950 shadow-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-violet-500/15 p-2 text-violet-300">
              <Wand2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-100">স্বয়ংক্রিয় বাছাই</h2>
              <p className="text-[11px] font-semibold text-slate-500">বর্তমান ফিল্টার থেকে এলোমেলোভাবে</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="বন্ধ করুন" className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-slate-800 bg-slate-900/40 p-2">
          {[
            { id: 'count', label: 'সংখ্যা দিয়ে', icon: ListChecks },
            { id: 'target', label: 'মোট নম্বর দিয়ে', icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  mode === tab.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {mode === 'count' ? (
          <div className="space-y-2 p-4">
            {PICK_TYPES.map((type) => {
              const max = available[type].length;
              return (
                <div key={type} className={`flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2.5 ${max === 0 ? 'opacity-40' : ''}`}>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-slate-200">{TYPE_LABELS[type]}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-slate-500">{enToBn(max)} টি আছে</span>
                  <input
                    type="number"
                    min="0"
                    max={max}
                    disabled={max === 0}
                    value={counts[type] || 0}
                    onChange={(e) => setCount(type, e.target.value)}
                    className="h-9 w-16 shrink-0 rounded-lg border border-slate-800 bg-slate-950/60 px-2 text-center text-sm font-bold text-white focus:border-indigo-500/50 focus:outline-none disabled:cursor-not-allowed"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 p-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold text-slate-400">লক্ষ্য মোট নম্বর</span>
              <input
                type="number"
                min="1"
                value={targetMarks}
                onChange={(e) => setTargetMarks(Math.max(1, Number(e.target.value) || 1))}
                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 text-center text-base font-black text-white focus:border-indigo-500/50 focus:outline-none"
              />
            </label>

            <div>
              <p className="mb-1.5 text-[11px] font-bold text-slate-400">প্রতি ধরনের সর্বোচ্চ সংখ্যা (ঐচ্ছিক — বোর্ড প্যাটার্ন)</p>
              <div className="space-y-1.5">
                {PICK_TYPES.map((type) => {
                  const max = available[type].length;
                  return (
                    <div key={type} className={`flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 ${max === 0 ? 'opacity-40' : ''}`}>
                      <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-slate-200">{TYPE_LABELS[type]}</span>
                      <span className="shrink-0 text-[10.5px] font-semibold text-slate-500">{enToBn(max)} টি আছে</span>
                      <input
                        type="number"
                        min="0"
                        max={max}
                        disabled={max === 0}
                        placeholder="সীমাহীন"
                        value={caps[type] || ''}
                        onChange={(e) => setCap(type, e.target.value)}
                        className="h-8 w-16 shrink-0 rounded-lg border border-slate-800 bg-slate-950/60 px-2 text-center text-xs font-bold text-white placeholder:text-[9px] placeholder:font-semibold focus:border-indigo-500/50 focus:outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {planned.marks !== targetMarks && planned.questions > 0 && (
              <p className="text-[11px] font-semibold text-amber-400">
                ≈ কাছাকাছি পৌঁছানো গেছে — {enToBn(planned.marks)} নম্বর (লক্ষ্য {enToBn(targetMarks)})।
                {planned.marks < targetMarks && ' পুলে পর্যাপ্ত প্রশ্ন নেই।'}
              </p>
            )}
          </div>
        )}

        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-2.5">
            <span className="text-[12px] font-bold text-slate-400">যোগ হবে</span>
            <span className="text-sm font-black text-slate-100">
              {enToBn(planned.questions)} টি · <span className="text-emerald-300">{enToBn(planned.marks)}</span> নম্বর
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={planned.questions === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] py-3 text-sm font-extrabold text-white transition hover:bg-[#7c3aed] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Shuffle className="h-4 w-4" /> বাছাই করে যোগ করুন
          </button>
        </div>
      </div>
    </div>
  );
});

AutoPickDialog.displayName = 'AutoPickDialog';

export default AutoPickDialog;
