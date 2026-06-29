import React, { useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';

const GlobalSearch = React.memo(({
  value,
  onChange,
  isLoading = false,
  recentSearches = [],
  placeholder = 'প্রশ্ন, অধ্যায়, টপিক বা বোর্ড খুঁজুন...',
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const searchValue = value ?? localValue;

  const visibleRecentSearches = useMemo(
    () => recentSearches.filter(Boolean).slice(0, 3),
    [recentSearches]
  );

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setLocalValue(nextValue);
    onChange?.(nextValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <div className="group relative w-full md:max-w-[540px]">
      <label className="relative block">
        <span className="sr-only">প্রশ্ন সার্চ</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="প্রশ্ন সার্চ"
          className="h-11 w-full rounded-2xl border border-indigo-500/20 bg-slate-900/40 py-2.5 pl-10 pr-12 text-sm font-semibold text-slate-100 shadow-inner transition duration-200 placeholder:text-slate-500 hover:border-indigo-500/40 hover:bg-slate-900/60 focus:border-indigo-500/50 focus:bg-slate-900/80 focus:outline-none"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-hidden="true" />}
          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              title="সার্চ মুছুন"
              aria-label="সার্চ মুছুন"
              className="rounded-lg p-1.5 text-slate-400 transition duration-150 hover:bg-slate-800 hover:text-slate-100 focus:outline-none "
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </label>

      {visibleRecentSearches.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 hidden rounded-xl border border-slate-700/60 bg-slate-900 p-2 shadow-2xl shadow-slate-950/40 group-focus-within:block">
          {visibleRecentSearches.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => {
                setLocalValue(item);
                onChange?.(item);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-300 transition duration-150 hover:bg-slate-800 hover:text-white focus:outline-none "
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

GlobalSearch.displayName = 'GlobalSearch';

export default GlobalSearch;
