import React, { useCallback, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronDown, Search, SlidersHorizontal, X, Layers, Tag, GraduationCap } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';

/** স্তরের তালিকা এখন Firestore থেকেই আসে; শুধু নামটা বাংলায় দেখাই */
const LEVEL_LABELS = {
  HSC: 'এইচএসসি (HSC)',
  SSC: 'এসএসসি (SSC)',
  Admission: 'এডমিশন (Admission)',
};

const chapterLabel = (chapter) => chapter?.name || chapter?.title || chapter?.id || '';

const FilterCard = React.memo(({ title, count, isOpen = true, onToggle, icon: Icon, children }) => (
  <section>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 text-left focus:outline-none"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-violet-400" />}
        <div className="min-w-0">
          <span className="block truncate text-xs font-black text-slate-200">{title}</span>
          {count && <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">{count}</span>}
        </div>
      </div>
      <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-300' : ''}`} />
    </button>
    <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  </section>
));

FilterCard.displayName = 'FilterCard';

const FilterSearch = React.memo(({ value, onChange, placeholder }) => (
  <label className="relative block">
    <span className="sr-only">{placeholder}</span>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-8 w-full rounded-xl border border-slate-700/60 bg-slate-950/60 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-200 transition-all placeholder:text-slate-500 hover:border-slate-600 focus:border-violet-500/60 focus:bg-slate-950 focus:outline-none"
    />
    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
  </label>
));

FilterSearch.displayName = 'FilterSearch';

const FilterCheckboxRow = React.memo(({ checked, label, meta, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center gap-2.5 rounded-lg p-2.5 sm:p-2 text-left transition-all duration-150 focus:outline-none active:scale-[0.99] ${
      checked ? 'bg-violet-500/10 text-violet-100' : 'text-slate-300 hover:bg-slate-800/50'
    }`}
  >
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all ${
        checked
          ? 'border-violet-500 bg-violet-500 text-white'
          : 'border-slate-600 group-hover:border-violet-400/60'
      }`}
    >
      {checked && <Check className="h-3 w-3 stroke-[3.5]" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-xs font-bold">{label}</span>
      {meta && <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">{meta}</span>}
    </span>
  </button>
));

FilterCheckboxRow.displayName = 'FilterCheckboxRow';

const FilterSidebar = React.memo(({
  isMobileOpen, onMobileClose,
  levels = [],
  selectedLevel, setSelectedLevel,
  selectedSubjectId, setSelectedSubjectId,
  availableSubjects, activeSubjectConfig,
  chapters, chapterCounts = {}, selectedChapters, toggleChapter,
  availableTopics, selectedTopics, toggleTopic,
}) => {
  const [chapterSearch, setChapterSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [openCards, setOpenCards] = useState({
    level: true,
    subject: true,
    chapter: true,
    topic: false,
  });

  const toggleCard = useCallback((key) => {
    setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filteredChapters = useMemo(
    () => chapters.filter((c) => chapterLabel(c).toLowerCase().includes(chapterSearch.toLowerCase())),
    [chapters, chapterSearch]
  );
  const filteredTopics = useMemo(
    () => availableTopics.filter((t) => (t.name || '').toLowerCase().includes(topicSearch.toLowerCase())),
    [availableTopics, topicSearch]
  );

  const selectAllChapters = useCallback(() => {
    chapters.forEach((chapter) => {
      if (!selectedChapters.includes(chapter.id)) toggleChapter(chapter.id);
    });
  }, [chapters, selectedChapters, toggleChapter]);

  const unselectAllChapters = useCallback(() => {
    selectedChapters.forEach((id) => toggleChapter(id));
  }, [selectedChapters, toggleChapter]);

  const body = (
    <div className="flex w-full flex-col gap-4">
      {/* Education Level */}
      <FilterCard
        title="শিক্ষা স্তর"
        icon={GraduationCap}
        isOpen={openCards.level}
        onToggle={() => toggleCard('level')}
      >
        <div className="grid grid-cols-1 gap-1.5">
          {levels.length === 0 && (
            <p className="px-2 py-3 text-center text-[11px] font-semibold text-slate-600">লোড হচ্ছে…</p>
          )}
          {levels.map((level) => {
            const isSelected = selectedLevel === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  setSelectedLevel(level);
                  setSelectedSubjectId('');
                }}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 sm:py-2 text-xs font-bold transition-all duration-200 focus:outline-none active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <span>{LEVEL_LABELS[level] || level}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </FilterCard>

      {/* Subject */}
      <FilterCard
        title="বিষয়"
        icon={BookOpen}
        count={activeSubjectConfig ? (activeSubjectConfig.label || activeSubjectConfig.name) : 'বাছাই করুন'}
        isOpen={openCards.subject}
        onToggle={() => toggleCard('subject')}
      >
        <div className="relative">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-700/60 bg-slate-950/70 py-2.5 pl-9 pr-9 text-xs font-bold text-slate-100 transition-all hover:border-slate-600 focus:border-violet-500/60 focus:bg-slate-950 focus:outline-none"
          >
            <option value="">-- বিষয় নির্বাচন করুন --</option>
            {availableSubjects.map((sub) => (
              <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">
                {sub.emoji ? `${sub.emoji} ` : ''}{sub.label || sub.name}
              </option>
            ))}
          </select>
          <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-300" />
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>
      </FilterCard>

      {/* Chapters */}
      {activeSubjectConfig && chapters.length > 0 && (
        <FilterCard
          title="অধ্যায়"
          icon={Layers}
          count={`${selectedChapters.length} / ${chapters.length} টি`}
          isOpen={openCards.chapter}
          onToggle={() => toggleCard('chapter')}
        >
          <div className="space-y-2">
            {chapters.length > 5 && (
              <FilterSearch value={chapterSearch} onChange={setChapterSearch} placeholder="অধ্যায় খুঁজুন..." />
            )}
            <div className="flex items-center gap-3 px-1">
              <button
                type="button"
                onClick={selectAllChapters}
                className="text-[11px] font-bold text-violet-300 transition hover:text-violet-200 active:scale-95"
              >
                সব সিলেক্ট
              </button>
              <span className="text-slate-700">·</span>
              <button
                type="button"
                onClick={unselectAllChapters}
                className="text-[11px] font-bold text-slate-500 transition hover:text-slate-300 active:scale-95"
              >
                ক্লিয়ার
              </button>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
              {filteredChapters.map((c) => {
                const count = chapterCounts[c.id] || 0;
                return (
                  <FilterCheckboxRow
                    key={c.id}
                    checked={selectedChapters.includes(c.id)}
                    label={chapterLabel(c)}
                    meta={count > 0 ? `${enToBn(count)} টি প্রশ্ন` : 'প্রশ্ন নেই'}
                    onClick={() => toggleChapter(c.id)}
                  />
                );
              })}
              {filteredChapters.length === 0 && (
                <p className="px-2 py-3 text-center text-[11px] font-semibold text-slate-500">কোনো অধ্যায় মেলেনি</p>
              )}
            </div>
          </div>
        </FilterCard>
      )}

      {/* Topics */}
      {selectedChapters.length > 0 && availableTopics.length > 0 && (
        <FilterCard
          title="টপিক"
          icon={Tag}
          count={`${selectedTopics.length} / ${availableTopics.length} টি`}
          isOpen={openCards.topic}
          onToggle={() => toggleCard('topic')}
        >
          <div className="space-y-2">
            {availableTopics.length > 5 && (
              <FilterSearch value={topicSearch} onChange={setTopicSearch} placeholder="টপিক খুঁজুন..." />
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
              {filteredTopics.map((t) => (
                <FilterCheckboxRow
                  key={t.id}
                  checked={selectedTopics.includes(t.id)}
                  label={t.name}
                  onClick={() => toggleTopic(t.id)}
                />
              ))}
              {filteredTopics.length === 0 && (
                <p className="px-2 py-3 text-center text-[11px] font-semibold text-slate-500">কোনো টপিক মেলেনি</p>
              )}
            </div>
          </div>
        </FilterCard>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onMobileClose} />
        <aside className={`absolute bottom-0 left-0 top-0 flex w-[88%] max-w-sm transform flex-col border-r border-white/10 bg-[#0b0f19] shadow-2xl transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="rounded-xl bg-violet-500/15 p-2 text-violet-300">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-black text-white">প্রশ্ন ফিল্টার</h2>
            </div>
            <button
              type="button"
              onClick={onMobileClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="ফিল্টার বন্ধ করুন"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">{body}</div>
          <div className="shrink-0 border-t border-white/10 p-4">
            <button
              type="button"
              onClick={onMobileClose}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-black text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              ফিল্টার প্রয়োগ করুন
            </button>
          </div>
        </aside>
      </div>

      {/* Desktop Sidebar Pane */}
      <aside className="qb-filter-pane flex min-h-0 w-full flex-col rounded-2xl border border-white/[0.06] bg-slate-900/30 backdrop-blur-xl">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <SlidersHorizontal className="h-3.5 w-3.5 text-violet-400" />
          <h2 className="text-xs font-black tracking-wide text-white">ফিল্টার সেটিংস</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3.5 custom-scrollbar">{body}</div>
      </aside>
    </>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
