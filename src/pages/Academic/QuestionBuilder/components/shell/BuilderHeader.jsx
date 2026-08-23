import React from 'react';
import { BookOpenCheck, FileCog, ListChecks, Printer, FilePlus2, FolderOpen, Sparkles } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

const BuilderHeader = React.memo(({
  paperTitle,
  totalQuestions,
  totalMarks,
  onOpenPaperInfo,
  onOpenCart,
  onPreview,
  onNewPaper,
  onOpenSaved,
  canOutput,
}) => (
  <header className="qb-step-header -mx-4 border-b border-white/[0.08] bg-[#0b0f19]/90 px-4 py-3.5 backdrop-blur-2xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3">

      {/* Brand & Document Name */}
      <div className="hidden sm:flex min-w-0 items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/20 via-indigo-600/20 to-purple-600/20 border border-violet-500/30 shadow-inner shadow-violet-500/10">
          <BookOpenCheck className="h-5 w-5 text-violet-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-black tracking-tight text-white sm:text-lg">
              প্রশ্নপত্র নির্মাতা
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-extrabold text-violet-300">
              <Sparkles className="w-2.5 h-2.5" /> ফ্রি
            </span>
          </div>
          <p className="hidden truncate text-xs font-semibold text-slate-400 sm:block">
            {paperTitle || 'নতুন প্রশ্নপত্র'}
          </p>
        </div>
      </div>

      {/* Live Question & Mark Counter Pill */}
      <div className="ml-auto hidden shrink-0 items-center gap-2 rounded-2xl border border-white/[0.08] bg-slate-900/60 px-3.5 py-1.5 backdrop-blur-md shadow-sm lg:flex">
        <span className="text-[11px] font-bold text-slate-400">প্রশ্ন</span>
        <span className="text-sm font-black tabular-nums text-white bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/50">
          {enToBn(totalQuestions)}
        </span>
        <span className="mx-0.5 h-4 w-px bg-white/10" />
        <span className="text-[11px] font-bold text-slate-400">মোট নম্বর</span>
        <span className="text-sm font-black tabular-nums text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/25">
          {enToBn(totalMarks)}
        </span>
      </div>

      {/* Header Actions */}
      <div className="flex w-full min-w-0 items-center justify-between gap-1.5 sm:w-auto sm:justify-end sm:gap-2 sm:ml-auto lg:ml-3">
        <button
          type="button"
          onClick={onOpenSaved}
          title="সংরক্ষিত প্রশ্নপত্র"
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition-all duration-200 hover:border-violet-400/40 hover:bg-slate-800 hover:text-violet-200 active:scale-95 shadow-sm"
        >
          <FolderOpen className="h-4 w-4 text-violet-400" />
          <span className="hidden lg:inline">সংরক্ষিত</span>
        </button>

        <button
          type="button"
          onClick={onNewPaper}
          disabled={!canOutput}
          title="নতুন প্রশ্নপত্র শুরু করুন"
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition-all duration-200 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
        >
          <FilePlus2 className="h-4 w-4 text-slate-400" />
          <span className="hidden lg:inline">নতুন</span>
        </button>

        <button
          type="button"
          onClick={onOpenPaperInfo}
          title="কাগজের তথ্য ও সেটিংস"
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition-all duration-200 hover:border-indigo-400/40 hover:bg-slate-800 hover:text-indigo-200 active:scale-95 shadow-sm"
        >
          <FileCog className="h-4 w-4 text-indigo-400" />
          <span className="hidden sm:inline">কাগজের তথ্য</span>
        </button>

        <button
          type="button"
          onClick={onOpenCart}
          className="qb-cart-button relative items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-300 transition-all duration-200 hover:border-emerald-400/40 hover:bg-slate-800 active:scale-95 shadow-sm"
        >
          <ListChecks className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline">নির্বাচিত</span>
          <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-black tabular-nums ${totalQuestions > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}>
            {enToBn(totalQuestions)}
          </span>
        </button>

        <button
          type="button"
          onClick={onPreview}
          disabled={!canOutput}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 px-4 py-2 text-xs font-black text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/20 transition-all duration-200 hover:from-violet-500 hover:to-indigo-600 hover:shadow-violet-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Printer className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">প্রিভিউ</span>
        </button>
      </div>
    </div>
  </header>
));

BuilderHeader.displayName = 'BuilderHeader';

export default BuilderHeader;
