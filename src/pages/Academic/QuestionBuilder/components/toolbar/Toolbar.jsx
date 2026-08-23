import React from 'react';
import { SlidersHorizontal, Tag } from 'lucide-react';
import GlobalSearch from './GlobalSearch.jsx';
import QuestionCounter from './QuestionCounter.jsx';

const Toolbar = React.memo(({
  total,
  isFiltered = false,
  filterSummary = [],
  searchValue,
  onSearchChange,
  searchLoading = false,
  recentSearches = [],
  onOpenFilters,
}) => {
  const visibleSummary = filterSummary.filter(Boolean);

  return (
    <div className="mb-4 flex w-full flex-col gap-3">
      <div className="flex w-full min-w-0 items-center gap-2">
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="qb-filter-toggle shrink-0 items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2.5 text-xs font-extrabold text-indigo-200 transition hover:bg-indigo-500/20 active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">ফিল্টার</span>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <GlobalSearch
            value={searchValue}
            onChange={onSearchChange}
            isLoading={searchLoading}
            recentSearches={recentSearches}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <QuestionCounter total={total} filtered={isFiltered} />

        {visibleSummary.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[10.5px] font-bold text-slate-500">
            <Tag className="h-3 w-3 shrink-0 text-slate-600" />
            {visibleSummary.map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span className="text-slate-700">·</span>}
                <span className="max-w-[180px] truncate" title={label}>{label}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;
