import React from 'react';
import { Trash2, X, Printer, KeyRound, ListChecks, Layers } from 'lucide-react';
import EmptySelection from './EmptySelection.jsx';
import CartItem from '../cart/CartItem.jsx';
import { enToBn } from '../../helpers.jsx';

const SHORT_TYPE_LABELS = {
  mcq: { label: 'MCQ', color: 'text-indigo-300' },
  cq: { label: 'সৃজনশীল', color: 'text-emerald-300' },
  k: { label: 'জ্ঞানমূলক (ক)', color: 'text-violet-300' },
  kh: { label: 'অনুধাবনমূলক (খ)', color: 'text-orange-300' },
  short: { label: 'সংক্ষিপ্ত', color: 'text-slate-400' },
};

const TypeBreakdown = React.memo(({ byType }) => {
  const active = Object.entries(SHORT_TYPE_LABELS)
    .filter(([key]) => (byType[key]?.count || 0) > 0);

  if (active.length === 0) return null;

  return (
    <div className="space-y-1">
      {active.map(([key, meta]) => (
        <div key={key} className="flex items-center gap-2 px-1 py-1">
          <span className={`text-[11px] font-bold ${meta.color}`}>{meta.label}</span>
          <span className="min-w-0 flex-1 truncate" />
          <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-500">
            {enToBn(byType[key].count)} টি
          </span>
          <span className="shrink-0 text-[11px] font-black tabular-nums text-emerald-300">
            {enToBn(byType[key].marks)} নম্বর
          </span>
        </div>
      ))}
    </div>
  );
});

TypeBreakdown.displayName = 'TypeBreakdown';

const PanelBody = React.memo(({
  cart, summary, onPreview, onGenerate, onBrowse, onRemove, onMoveUp, onMoveDown, usageIndex, onCompleteCq,
}) => {
  if (cart.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <EmptySelection onBrowse={onBrowse} />
      </div>
    );
  }

  return (
    <>
      <div className="shrink-0 border-t border-white/[0.06] pb-3 pt-3">
        <TypeBreakdown byType={summary.byType} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col border-t border-white/[0.06]">
        <div className="flex shrink-0 items-center justify-between px-1 py-2.5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-black text-slate-300">প্রশ্নপত্র সাজানোর ক্রম</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            {enToBn(cart.length)} টি প্রশ্ন
          </span>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-white/[0.05] overflow-y-auto pr-0.5 custom-scrollbar">
          {cart.map((q, index) => (
            <CartItem
              key={q.uniqueId}
              q={q}
              index={index}
              onRemove={onRemove}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={index === 0}
              isLast={index === cart.length - 1}
              usageIndex={usageIndex}
              onCompleteCq={onCompleteCq}
            />
          ))}
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 pt-3">
        <button
          type="button"
          onClick={onPreview}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 px-3 py-2.5 text-xs font-black text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/20 transition-all hover:from-violet-500 hover:to-indigo-600 active:scale-95"
        >
          <Printer className="h-4 w-4" />
          প্রিভিউ
        </button>
        <button
          type="button"
          onClick={onGenerate}
          title="উত্তরপত্র দেখুন"
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-xs font-black text-slate-200 transition-all hover:border-amber-400/40 hover:bg-slate-800 hover:text-amber-200 active:scale-95 shadow-sm"
        >
          <KeyRound className="h-4 w-4 text-amber-400" />
          উত্তরপত্র
        </button>
      </div>
    </>
  );
});

PanelBody.displayName = 'PanelBody';

const PanelHeader = React.memo(({ total, marks, onClear, onClose }) => (
  <div className="flex shrink-0 items-center justify-between gap-3 pb-3 border-b border-white/[0.08] mb-3">
    <div className="min-w-0">
      <h2 className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-emerald-400" /> নির্বাচিত প্রশ্নপত্র
      </h2>
      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
        মোট <span className="font-bold text-white">{enToBn(total)}</span> টি প্রশ্ন · <span className="font-black text-emerald-300">{enToBn(marks)}</span> নম্বর
      </p>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      {total > 0 && (
        <button
          type="button"
          onClick={onClear}
          title="সব প্রশ্ন বাদ দিন"
          aria-label="সব বাদ দিন"
          className="rounded-xl p-1.5 text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-300 active:scale-95"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          title="বন্ধ করুন"
          aria-label="বন্ধ করুন"
          className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  </div>
));

PanelHeader.displayName = 'PanelHeader';

const RightSidebar = React.memo(({
  cart, summary, clearCart,
  onPreview, onGenerate, onBrowse,
  isOpen = false, onClose,
  onRemove, onMoveUp, onMoveDown,
  usageIndex,
  onCompleteCq,
}) => {
  const body = (
    <PanelBody
      cart={cart}
      summary={summary}
      onPreview={onPreview}
      onGenerate={onGenerate}
      onBrowse={onBrowse}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      usageIndex={usageIndex}
      onCompleteCq={onCompleteCq}
    />
  );

  return (
    <>
      <aside className="qb-cart-pane flex min-h-0 w-full flex-col rounded-2xl border border-white/[0.06] bg-slate-900/30 backdrop-blur-xl p-3.5">
        <PanelHeader total={cart.length} marks={summary.totalMarks} onClear={clearCart} />
        {body}
      </aside>

      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
        <aside className={`absolute bottom-0 right-0 flex max-h-[88vh] w-full max-w-[420px] flex-col rounded-t-3xl border border-white/10 bg-[#0b0f19] p-4 shadow-2xl transition-transform duration-300 sm:bottom-4 sm:right-4 sm:top-4 sm:max-h-none sm:rounded-3xl ${isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}`}>
          <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-700 sm:hidden" />
          <PanelHeader total={cart.length} marks={summary.totalMarks} onClear={clearCart} onClose={onClose} />
          {body}
        </aside>
      </div>
    </>
  );
});

RightSidebar.displayName = 'RightSidebar';

export default RightSidebar;
