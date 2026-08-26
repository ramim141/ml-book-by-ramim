import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Search, X, RotateCcw, SlidersHorizontal,
  PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2
} from 'lucide-react';

/**
 * Shared subject workspace shell used by every program's subject dashboard
 * (Nursing, Medical, and the generic SSC/HSC/dynamic subjects).
 *
 * Owns the chrome only — breadcrumb, hero, smart filter panel, chapter list,
 * tab bar, search and full-screen mode. The caller owns the data and renders
 * the active tab's content as `children`.
 */

const ACCENTS = {
  emerald: {
    text: 'text-emerald-400',
    hover: 'hover:text-emerald-300',
    enabledHover: 'enabled:hover:text-emerald-300',
    chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    soft: 'bg-emerald-500/15 border-emerald-500/30',
    grad: 'from-emerald-600 to-teal-600',
    gradHover: 'hover:from-emerald-500 hover:to-teal-500',
    gradSoft: 'from-emerald-600/90 to-teal-600/90',
    border: 'border-emerald-500/80',
    hoverBorder: 'hover:border-emerald-500/40',
    focus: 'focus:border-emerald-500/60',
    shadow: 'shadow-emerald-600/25',
    dot: 'bg-emerald-400',
    glowA: 'bg-emerald-600/10',
    glowB: 'bg-teal-600/10',
    selection: 'selection:bg-emerald-500/30'
  },
  rose: {
    text: 'text-rose-400',
    hover: 'hover:text-rose-300',
    enabledHover: 'enabled:hover:text-rose-300',
    chip: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    soft: 'bg-rose-500/15 border-rose-500/30',
    grad: 'from-rose-600 to-pink-600',
    gradHover: 'hover:from-rose-500 hover:to-pink-500',
    gradSoft: 'from-rose-600/90 to-pink-600/90',
    border: 'border-rose-500/80',
    hoverBorder: 'hover:border-rose-500/40',
    focus: 'focus:border-rose-500/60',
    shadow: 'shadow-rose-600/25',
    dot: 'bg-rose-400',
    glowA: 'bg-rose-600/10',
    glowB: 'bg-indigo-600/10',
    selection: 'selection:bg-rose-500/30'
  },
  blue: {
    text: 'text-blue-400',
    hover: 'hover:text-blue-300',
    enabledHover: 'enabled:hover:text-blue-300',
    chip: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    soft: 'bg-blue-500/15 border-blue-500/30',
    grad: 'from-blue-600 to-indigo-600',
    gradHover: 'hover:from-blue-500 hover:to-indigo-500',
    gradSoft: 'from-blue-600/90 to-indigo-600/90',
    border: 'border-blue-500/80',
    hoverBorder: 'hover:border-blue-500/40',
    focus: 'focus:border-blue-500/60',
    shadow: 'shadow-blue-600/25',
    dot: 'bg-blue-400',
    glowA: 'bg-blue-600/10',
    glowB: 'bg-indigo-600/10',
    selection: 'selection:bg-blue-500/30'
  },
  fuchsia: {
    text: 'text-fuchsia-400',
    hover: 'hover:text-fuchsia-300',
    enabledHover: 'enabled:hover:text-fuchsia-300',
    chip: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    soft: 'bg-fuchsia-500/15 border-fuchsia-500/30',
    grad: 'from-fuchsia-600 to-pink-600',
    gradHover: 'hover:from-fuchsia-500 hover:to-pink-500',
    gradSoft: 'from-fuchsia-600/90 to-pink-600/90',
    border: 'border-fuchsia-500/80',
    hoverBorder: 'hover:border-fuchsia-500/40',
    focus: 'focus:border-fuchsia-500/60',
    shadow: 'shadow-fuchsia-600/25',
    dot: 'bg-fuchsia-400',
    glowA: 'bg-fuchsia-600/10',
    glowB: 'bg-pink-600/10',
    selection: 'selection:bg-fuchsia-500/30'
  },
  lime: {
    text: 'text-lime-400',
    hover: 'hover:text-lime-300',
    enabledHover: 'enabled:hover:text-lime-300',
    chip: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    soft: 'bg-lime-500/15 border-lime-500/30',
    grad: 'from-lime-600 to-green-600',
    gradHover: 'hover:from-lime-500 hover:to-green-500',
    gradSoft: 'from-lime-600/90 to-green-600/90',
    border: 'border-lime-500/80',
    hoverBorder: 'hover:border-lime-500/40',
    focus: 'focus:border-lime-500/60',
    shadow: 'shadow-lime-600/25',
    dot: 'bg-lime-400',
    glowA: 'bg-lime-600/10',
    glowB: 'bg-green-600/10',
    selection: 'selection:bg-lime-500/30'
  },
  amber: {
    text: 'text-amber-400',
    hover: 'hover:text-amber-300',
    enabledHover: 'enabled:hover:text-amber-300',
    chip: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    soft: 'bg-amber-500/15 border-amber-500/30',
    grad: 'from-amber-600 to-orange-600',
    gradHover: 'hover:from-amber-500 hover:to-orange-500',
    gradSoft: 'from-amber-600/90 to-orange-600/90',
    border: 'border-amber-500/80',
    hoverBorder: 'hover:border-amber-500/40',
    focus: 'focus:border-amber-500/60',
    shadow: 'shadow-amber-600/25',
    dot: 'bg-amber-400',
    glowA: 'bg-amber-600/10',
    glowB: 'bg-orange-600/10',
    selection: 'selection:bg-amber-500/30'
  },
  indigo: {
    text: 'text-indigo-400',
    hover: 'hover:text-indigo-300',
    enabledHover: 'enabled:hover:text-indigo-300',
    chip: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    soft: 'bg-indigo-500/15 border-indigo-500/30',
    grad: 'from-indigo-600 to-violet-600',
    gradHover: 'hover:from-indigo-500 hover:to-violet-500',
    gradSoft: 'from-indigo-600/90 to-violet-600/90',
    border: 'border-indigo-500/80',
    hoverBorder: 'hover:border-indigo-500/40',
    focus: 'focus:border-indigo-500/60',
    shadow: 'shadow-indigo-600/25',
    dot: 'bg-indigo-400',
    glowA: 'bg-indigo-600/10',
    glowB: 'bg-sky-600/10',
    selection: 'selection:bg-indigo-500/30'
  }
};

const TAB_GRID_COLS = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6'
};

const QUICK_FILTER_TONES = {
  emerald: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
  sky: 'bg-sky-500/20 text-sky-200 border-sky-500/50',
  red: 'bg-red-500/20 text-red-200 border-red-500/50',
  amber: 'bg-amber-500/20 text-amber-200 border-amber-500/50',
  indigo: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/50'
};

export default function SubjectWorkspace({
  accent = 'emerald',
  storageKey = 'subject_workspace',
  breadcrumbs = [],
  backLink = null,
  primaryAction = null,
  hero = null,
  stats = [],
  papers = [],
  selectedPaper = '',
  onSelectPaper = () => {},
  chapters = [],
  selectedChapterId = '',
  onSelectChapter = () => {},
  chapterLabel = 'অধ্যায়',
  chapterHeading = null,
  chapterBadge = null,
  chapterAction = null,
  tabs = [],
  activeTab = '',
  onSelectTab = () => {},
  quickFilters = null,
  filterHeader = null,
  filterFooter = null,
  activeQuickFilter = 'all',
  onSelectQuickFilter = () => {},
  search = null,
  onResetFilters = null,
  hasActiveFilter = false,
  emptyState = null,
  children
}) {
  const a = ACCENTS[accent] || ACCENTS.emerald;
  const panelKey = `${storageKey}_filter_open`;

  const [isFilterOpen, setIsFilterOpen] = useState(() => {
    try {
      return localStorage.getItem(panelKey) !== 'closed';
    } catch {
      return true;
    }
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');

  // Lock background scroll while the mobile filter drawer is open
  useEffect(() => {
    if (!isMobileFilterOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isMobileFilterOpen]);

  // Esc leaves full-screen / closes the drawer
  useEffect(() => {
    if (!isFullScreen && !isMobileFilterOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (isMobileFilterOpen) setIsMobileFilterOpen(false);
      else setIsFullScreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullScreen, isMobileFilterOpen]);

  const toggleFilterPanel = useCallback(() => {
    setIsFilterOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem(panelKey, next ? 'open' : 'closed');
      } catch {
        /* storage unavailable — the panel state just won't persist */
      }
      return next;
    });
  }, [panelKey]);

  const filteredChapters = useMemo(() => {
    const q = chapterSearch.trim().toLowerCase();
    const withIndex = chapters.map((ch, idx) => ({ ch, idx }));
    if (!q) return withIndex;
    return withIndex.filter(({ ch }) => (ch.name || '').toLowerCase().includes(q));
  }, [chapters, chapterSearch]);

  const currentChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0] || null;
  const currentChapterIndex = chapters.findIndex(c => c.id === currentChapter?.id);

  const handleSelectChapter = (id) => {
    onSelectChapter(id);
    setIsMobileFilterOpen(false);
  };

  const handleResetFilters = () => {
    setChapterSearch('');
    if (onResetFilters) onResetFilters();
  };

  const panelDirty = hasActiveFilter || !!chapterSearch.trim();
  const activeTabMeta = tabs.find(t => t.key === activeTab) || tabs[0] || null;

  /* ── SMART FILTER PANEL (shared by the desktop sidebar and the mobile drawer) ── */
  const renderFilterPanel = (variant) => (
    <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-lg space-y-3.5">

      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
        <span className="text-[13px] font-black text-white flex items-center gap-1.5 min-w-0">
          <SlidersHorizontal className={`w-4 h-4 shrink-0 ${a.text}`} />
          <span className="truncate">স্মার্ট ফিল্টার</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {panelDirty && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10.5px] font-bold text-slate-300 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              ক্লিয়ার
            </button>
          )}
          {variant === 'drawer' ? (
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="ফিল্টার বন্ধ করুন"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleFilterPanel}
              aria-label="ফিল্টার প্যানেল লুকান"
              title="ফিল্টার প্যানেল লুকান"
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition ${a.hover}`}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* On phones the chapter actions live here instead of crowding the header row */}
      {variant === 'drawer' && (chapterAction || currentChapter) && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="flex items-center gap-3 min-w-0 text-xs font-bold">
            {chapterAction}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsFullScreen(v => !v);
              setIsMobileFilterOpen(false);
            }}
            aria-label={isFullScreen ? 'ফুল স্ক্রিন বন্ধ করুন' : 'ফুল স্ক্রিন মোড'}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition ${a.hover}`}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullScreen ? 'স্বাভাবিক' : 'ফুল স্ক্রিন'}</span>
          </button>
        </div>
      )}

      {/* Tabs live here on phones/tablets — the header row only carries them from lg up */}
      {variant === 'drawer' && tabs.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">বিভাগ</span>
          <div className="flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    onSelectTab(tab.key);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-all flex items-center justify-between gap-2 ${
                    isActive
                      ? (tab.activeClass || `bg-gradient-to-r ${a.grad} text-white shadow-md`)
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {TabIcon && <TabIcon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{tab.label}</span>
                  </span>
                  {tab.count != null && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/30 font-mono shrink-0">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {variant === 'drawer' && search && (
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">সার্চ</span>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || 'সার্চ করুন...'}
              className={`w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[12px] text-slate-200 placeholder-slate-500 focus:outline-none ${a.focus}`}
            />
            {search.value && (
              <button
                type="button"
                onClick={() => search.onChange('')}
                aria-label="সার্চ মুছুন"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {filterHeader}

      {papers.length > 1 && (
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">পত্র</span>
          <div className="flex gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {papers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onSelectPaper(p)}
                className={`flex-1 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all ${
                  selectedPaper === p
                    ? `bg-gradient-to-r ${a.grad} text-white shadow-sm`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {quickFilters?.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">দ্রুত ফিল্টার</span>
          <div className="grid grid-cols-2 gap-1.5">
            {quickFilters.map((f) => {
              const isActive = activeQuickFilter === f.key;
              const FilterIcon = f.icon;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    onSelectQuickFilter(f.key);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-xl border text-[11.5px] font-bold transition-all flex items-center justify-between gap-1.5 ${
                    isActive
                      ? (QUICK_FILTER_TONES[f.tone] || QUICK_FILTER_TONES.emerald)
                      : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    {FilterIcon && <FilterIcon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{f.label}</span>
                  </span>
                  <span className="font-mono text-[10px] shrink-0 opacity-80">{f.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wide">
            {chapterLabel} ({chapters.length}টি)
          </span>
          {selectedPaper && <span className="text-[10px] text-slate-600 font-mono truncate">{selectedPaper}</span>}
        </div>

        {chapters.length > 4 && (
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              placeholder={`${chapterLabel} খুঁজুন...`}
              className={`w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[12px] text-slate-200 placeholder-slate-500 focus:outline-none ${a.focus}`}
            />
            {chapterSearch && (
              <button
                type="button"
                onClick={() => setChapterSearch('')}
                aria-label="অধ্যায় সার্চ মুছুন"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <div className={`flex flex-col gap-2 overflow-y-auto no-scrollbar pr-0.5 ${
          variant === 'drawer' ? 'max-h-[46vh]' : 'max-h-[calc(100vh-24rem)]'
        }`}>
          {filteredChapters.length > 0 ? filteredChapters.map(({ ch, idx }) => {
            const isSelected = currentChapter?.id === ch.id;
            return (
              <button
                key={ch.id || idx}
                type="button"
                onClick={() => handleSelectChapter(ch.id)}
                className={`w-full p-3 rounded-xl text-left text-[13px] font-bold transition-all flex items-start justify-between gap-2.5 border ${
                  isSelected
                    ? `bg-gradient-to-r ${a.gradSoft} text-white ${a.border} shadow-md ${a.shadow}`
                    : 'bg-slate-950/60 text-slate-300 border-slate-800/80 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className="flex items-start gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-md text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="line-clamp-2 leading-snug">{ch.name}</span>
                </span>
                {ch.badge != null && (
                  <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-mono shrink-0 mt-0.5 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {ch.badge}
                  </span>
                )}
              </button>
            );
          }) : (
            <p className="text-xs text-slate-500 py-3 text-center">
              {chapterSearch.trim() ? `এই নামে কোনো ${chapterLabel} মেলেনি।` : `কোনো ${chapterLabel} পাওয়া যায়নি।`}
            </p>
          )}
        </div>
      </div>

      {filterFooter}
    </div>
  );

  const workspace = (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">

      {/* LEFT: smart filter — collapsible sidebar (desktop) */}
      {isFilterOpen ? (
        <aside className={`hidden lg:block w-[300px] xl:w-[330px] shrink-0 sticky ${isFullScreen ? 'top-2' : 'top-4'}`}>
          {renderFilterPanel('sidebar')}
        </aside>
      ) : (
        <button
          type="button"
          onClick={toggleFilterPanel}
          title="স্মার্ট ফিল্টার দেখান"
          aria-label="স্মার্ট ফিল্টার দেখান"
          className={`hidden lg:flex flex-col items-center gap-3 shrink-0 sticky ${isFullScreen ? 'top-2' : 'top-4'} px-2.5 py-4 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-lg text-slate-400 ${a.hover} ${a.hoverBorder} transition`}
        >
          <PanelLeftOpen className={`w-4 h-4 ${a.text}`} />
          <span className="[writing-mode:vertical-rl] text-[11px] font-black tracking-wide">স্মার্ট ফিল্টার</span>
          {panelDirty && <span className={`w-1.5 h-1.5 rounded-full ${a.dot}`} />}
        </button>
      )}

      {/* Mobile: smart filter trigger */}
      <button
        type="button"
        onClick={() => setIsMobileFilterOpen(true)}
        className="lg:hidden w-full p-3 rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-lg flex items-center justify-between gap-2.5 text-left active:scale-[0.99] transition"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className={`p-2 rounded-xl border shrink-0 relative ${a.soft}`}>
            <SlidersHorizontal className={`w-4 h-4 ${a.text}`} />
            {panelDirty && <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-900 ${a.dot}`} />}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-[10px] font-bold min-w-0">
              {chapterBadge && (
                <span className={`px-1.5 py-0.5 rounded border shrink-0 ${a.chip}`}>{chapterBadge}</span>
              )}
              <span className={`truncate ${activeTabMeta ? a.text : 'text-slate-500'}`}>
                {activeTabMeta ? activeTabMeta.label : 'স্মার্ট ফিল্টার'}
                {activeTabMeta?.count != null ? ` • ${activeTabMeta.count}` : ''}
              </span>
            </span>
            <span className="block text-[13px] font-bold text-white line-clamp-1 mt-0.5">
              {currentChapter ? currentChapter.name : 'অধ্যায় নির্বাচন করুন'}
            </span>
          </span>
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {/* RIGHT: content */}
      <main className="flex-1 w-full min-w-0 space-y-3.5 sm:space-y-4">
        {currentChapter ? (
          <>
            {/* Chapter header + tabs + search — one card, desktop only.
                On phones the trigger button below carries all of this. */}
            <div className="hidden lg:block rounded-2xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-xl shadow-lg overflow-hidden">

              <div className="px-4 py-3.5 flex items-center justify-between gap-3 border-b border-white/[0.06]">
                <div className="flex items-start gap-2 min-w-0">
                  {chapterBadge && (
                    <span className={`px-2.5 py-1 rounded-lg text-[10.5px] sm:text-xs font-bold border shrink-0 ${a.chip}`}>
                      {chapterBadge}
                    </span>
                  )}
                  <h2 className="text-[15px] sm:text-lg font-black text-white leading-snug line-clamp-2 min-w-0">
                    {chapterHeading || currentChapter.name}
                  </h2>
                </div>

                <div className="hidden lg:flex items-center gap-3 shrink-0">
                  {chapterAction}
                  <button
                    type="button"
                    onClick={() => setIsFullScreen(v => !v)}
                    title={isFullScreen ? 'ফুল স্ক্রিন বন্ধ করুন (Esc)' : 'ফুল স্ক্রিন মোড'}
                    aria-label={isFullScreen ? 'ফুল স্ক্রিন বন্ধ করুন' : 'ফুল স্ক্রিন মোড'}
                    className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition ${a.hover}`}
                  >
                    {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {tabs.length > 0 && (
                <div className={`hidden lg:grid p-1.5 gap-1.5 ${TAB_GRID_COLS[tabs.length] || 'lg:grid-cols-4'}`}>
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => onSelectTab(tab.key)}
                        className={`min-w-0 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                          isActive
                            ? (tab.activeClass || `bg-gradient-to-r ${a.grad} text-white shadow-md`)
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                        }`}
                      >
                        {TabIcon && <TabIcon className="w-3.5 h-3.5 shrink-0" />}
                        <span>{tab.label}</span>
                        {tab.count != null && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/30 font-mono">{tab.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {search && (
                <div className="relative border-t border-white/[0.06] hidden lg:block">
                  <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder={search.placeholder || 'সার্চ করুন...'}
                    className="w-full bg-transparent pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  {search.value && (
                    <button
                      type="button"
                      onClick={() => search.onChange('')}
                      aria-label="সার্চ মুছুন"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {children}

            {/* Prev / next chapter */}
            {chapters.length > 1 && (
              <div className="grid grid-cols-2 gap-3 pt-2 mt-1 border-t border-white/[0.06]">
                <button
                  type="button"
                  disabled={currentChapterIndex <= 0}
                  onClick={() => handleSelectChapter(chapters[currentChapterIndex - 1].id)}
                  className={`py-2.5 pr-2 text-left transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 ${a.enabledHover}`}
                >
                  <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> {`পূর্ববর্তী ${chapterLabel}`}
                  </span>
                  <span className="block text-[12px] sm:text-[13px] font-bold line-clamp-1 mt-0.5">
                    {chapters[currentChapterIndex - 1]?.name || '—'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={currentChapterIndex >= chapters.length - 1}
                  onClick={() => handleSelectChapter(chapters[currentChapterIndex + 1].id)}
                  className={`py-2.5 pl-2 text-right transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 ${a.enabledHover}`}
                >
                  <span className="text-[10px] text-slate-500 font-bold flex items-center justify-end gap-1">
                    {`পরবর্তী ${chapterLabel}`} <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="block text-[12px] sm:text-[13px] font-bold line-clamp-1 mt-0.5">
                    {chapters[currentChapterIndex + 1]?.name || '—'}
                  </span>
                </button>
              </div>
            )}
          </>
        ) : emptyState}
      </main>
    </div>
  );

  const shellClass = isFullScreen
    ? `fixed inset-0 z-50 overflow-y-auto bg-[#070b14] text-slate-100 font-bangla ${a.selection}`
    : `min-h-screen bg-[#070b14] text-slate-100 font-bangla ${a.selection} pb-16 sm:pb-20`;

  return (
    <div className={shellClass}>

      {!isFullScreen && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className={`absolute -top-[15%] left-[20%] w-[320px] h-[320px] sm:w-[500px] sm:h-[500px] blur-[140px] rounded-full ${a.glowA}`} />
          <div className={`absolute top-[35%] -right-[10%] w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] blur-[130px] rounded-full ${a.glowB}`} />
        </div>
      )}

      <div className={`relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-5 ${
        isFullScreen ? 'py-3' : 'pt-3 sm:pt-6'
      }`}>

        {!isFullScreen && (
          <>
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium overflow-x-auto no-scrollbar">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {idx > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                    {crumb.to ? (
                      <Link to={crumb.to} className="hover:text-white transition-colors whitespace-nowrap">{crumb.label}</Link>
                    ) : (
                      <span className={`whitespace-nowrap ${a.text}`}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            {(backLink || primaryAction) && (
              <div className="flex items-center justify-between gap-2.5">
                {backLink ? (
                  <Link
                    to={backLink.to}
                    title={backLink.label}
                    aria-label={backLink.label}
                    className={`inline-flex items-center gap-1.5 py-1 text-[13px] font-bold transition group min-w-0 hover:text-white ${a.text}`}
                  >
                    <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline truncate">{backLink.label}</span>
                  </Link>
                ) : <span />}

                {primaryAction && (
                  <Link
                    to={primaryAction.to}
                    className={`px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition flex items-center gap-1.5 shrink-0 ${a.grad} ${a.gradHover} ${a.shadow}`}
                  >
                    {primaryAction.icon && <primaryAction.icon className="w-3.5 h-3.5 fill-current" />}
                    <span>{primaryAction.label}</span>
                  </Link>
                )}
              </div>
            )}

            {hero && (
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900/95 via-[#0d1424]/95 to-slate-950/95 border border-white/[0.08] p-4 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-2xl">
                <div className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl pointer-events-none ${a.glowA}`} />

                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                    {hero.icon && (
                      <div className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg shrink-0 ${hero.iconGradient || a.grad}`}>
                        <hero.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                      </div>
                    )}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white leading-tight break-words">
                        {hero.title}
                      </h1>
                      {hero.chips?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {hero.chips.map((chip, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded-lg text-[10.5px] sm:text-[11px] font-bold border ${
                                chip.tone === 'accent' ? a.chip : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {chip.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prose sits full width so it does not get squeezed beside the icon */}
                  {hero.subtitle && (
                    <p className="text-[11.5px] sm:text-sm text-slate-400 leading-relaxed">{hero.subtitle}</p>
                  )}
                  {hero.footnote}
                </div>

                {stats.length > 0 && (
                  <div className="relative z-10 mt-4 pt-3.5 border-t border-white/[0.06] grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-x-4 sm:gap-x-5 gap-y-2.5">
                    {stats.map((stat) => (
                      <span key={stat.label} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 min-w-0">
                        {stat.icon && <stat.icon className={`w-3.5 h-3.5 shrink-0 ${stat.tone || a.text}`} />}
                        <span className="truncate">{stat.label}</span>
                        <strong className="text-white font-mono shrink-0">{stat.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {workspace}
      </div>

      {/* Mobile smart filter drawer */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm bg-[#070b14] border-r border-slate-800 shadow-2xl overflow-y-auto p-3">
            {renderFilterPanel('drawer')}
          </div>
        </div>
      )}
    </div>
  );
}
