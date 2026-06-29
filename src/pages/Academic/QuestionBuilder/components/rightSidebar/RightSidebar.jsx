import React from 'react';
import { Trash2, X } from 'lucide-react';
import EmptySelection from './EmptySelection.jsx';
import ProgressCard from './ProgressCard.jsx';
import QuickActionCard from './QuickActionCard.jsx';
import SelectionSummary from './SelectionSummary.jsx';
import StatisticsCard from './StatisticsCard.jsx';

const SidebarHeader = React.memo(({ total, onClear, onClose }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <div>
      <h2 className="text-base font-black tracking-tight text-slate-100">নির্বাচিত প্রশ্ন</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">{total} টি নির্বাচিত</p>
    </div>
    <div className="flex items-center gap-1.5">
      {total > 0 && (
        <button
          type="button"
          onClick={onClear}
          title="Clear selection"
          aria-label="Clear selection"
          className="rounded-xl p-2 text-slate-400 transition duration-150 hover:bg-red-500/10 hover:text-red-300 focus:outline-none "
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          title="Close dashboard"
          aria-label="Close dashboard"
          className="rounded-xl p-2 text-slate-400 transition duration-150 hover:bg-slate-800 hover:text-white focus:outline-none "
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  </div>
));

SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.memo(({
  cart,
  counts,
  stats,
  progressTarget,
  clearCart,
  onPreview,
  onGenerate,
  onBrowse,
}) => (
  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
    {cart.length === 0 ? (
      <EmptySelection onBrowse={onBrowse} />
    ) : (
      <>
        <SelectionSummary counts={counts} />
        <StatisticsCard stats={stats} />
        <ProgressCard selected={cart.length} target={progressTarget} />
        <QuickActionCard
          canPreview={cart.length > 0}
          canGenerateAnswer={counts.mcq > 0}
          onPreview={onPreview}
          onGenerate={onGenerate}
        />
      </>
    )}
  </div>
));

SidebarContent.displayName = 'SidebarContent';

const RightSidebar = React.memo(({
  cart,
  counts,
  stats,
  progressTarget = 25,
  clearCart,
  onPreview,
  onGenerate,
  onBrowse,
  isOpen = false,
  onClose,
}) => (
  <>
    <aside className="qb-right-sidebar-desktop w-full shrink-0 flex-col">
      <SidebarHeader total={cart.length} onClear={clearCart} />
      <SidebarContent
        cart={cart}
        counts={counts}
        stats={stats}
        progressTarget={progressTarget}
        clearCart={clearCart}
        onPreview={onPreview}
        onGenerate={onGenerate}
        onBrowse={onBrowse}
      />
    </aside>

    <div className={`qb-right-sidebar-drawer fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <aside className={`absolute bottom-0 right-0 flex max-h-[86vh] w-full max-w-[420px] flex-col rounded-t-3xl border border-slate-800 bg-slate-950 p-5 shadow-2xl transition-transform duration-300 sm:bottom-4 sm:right-4 sm:top-4 sm:max-h-none sm:rounded-2xl ${isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}`}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-700 sm:hidden" />
        <SidebarHeader total={cart.length} onClear={clearCart} onClose={onClose} />
        <SidebarContent
          cart={cart}
          counts={counts}
          stats={stats}
          progressTarget={progressTarget}
          clearCart={clearCart}
          onPreview={onPreview}
          onGenerate={onGenerate}
          onBrowse={onBrowse}
        />
      </aside>
    </div>
  </>
));

RightSidebar.displayName = 'RightSidebar';

export default RightSidebar;
