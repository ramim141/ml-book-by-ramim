import React, { useCallback, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronDown, ChevronLeft, Search, SlidersHorizontal, X } from 'lucide-react';

const FilterCard = React.memo(({ title, count, isOpen = true, onToggle, children }) => (
  <section className="mb-6">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 text-left focus:outline-none"
      title={isOpen ? `Collapse ${title}` : `Expand ${title}`}
      aria-expanded={isOpen}
    >
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-bold text-slate-100">{title}</span>
        {count && <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{count}</span>}
      </span>
      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`grid transition-all duration-200 ${isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  </section>
));

const FilterSearch = React.memo(({ value, onChange, placeholder }) => (
  <label className="relative block">
    <span className="sr-only">{placeholder}</span>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl bg-slate-950/40 py-2 pl-9 pr-3 text-xs font-semibold text-slate-100 transition duration-150 placeholder:text-slate-500 hover:bg-slate-900/70 focus:bg-slate-900 focus:outline-none "
    />
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
  </label>
));

const FilterCheckboxRow = React.memo(({ checked, label, meta, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition duration-150 focus:outline-none ${checked
        ? 'bg-indigo-500/15 text-indigo-100'
        : 'bg-slate-950/25 text-slate-300 hover:bg-slate-800/70'
      } ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}
  >
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition duration-150 ${checked ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600 bg-slate-900 group-hover:border-indigo-400'
      }`}>
      {checked && <Check className="h-3.5 w-3.5" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] font-bold">{label}</span>
      {meta && <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-400">{meta}</span>}
    </span>
  </button>
));

const FilterSidebar = React.memo(({
  isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose,
  selectedLevel, setSelectedLevel,
  selectedSubjectId, setSelectedSubjectId,
  availableSubjects, activeSubjectConfig,
  chapters, selectedChapters, toggleChapter,
  availableTopics, selectedTopics, toggleTopic,
  selectedType, setSelectedType,
}) => {
  const [chapterSearch, setChapterSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [openCards, setOpenCards] = useState({
    level: true,
    subject: true,
    chapter: true,
    topic: true,
    type: true,
  });

  const toggleCard = useCallback((key) => {
    setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const levelOptions = useMemo(() => [
    { value: 'hsc', label: 'এইচএসসি' },
  ], []);
  const filteredChapters = useMemo(() => chapters.filter((c) => (c.title || '').toLowerCase().includes(chapterSearch.toLowerCase())), [chapters, chapterSearch]);
  const filteredTopics = useMemo(() => availableTopics.filter((t) => (t.name || '').toLowerCase().includes(topicSearch.toLowerCase())), [availableTopics, topicSearch]);

  const selectAllChapters = useCallback(() => {
    chapters.forEach((chapter) => {
      if (!selectedChapters.includes(chapter.id)) toggleChapter(chapter.id);
    });
  }, [chapters, selectedChapters, toggleChapter]);

  const unselectAllChapters = useCallback(() => {
    selectedChapters.forEach((id) => toggleChapter(id));
  }, [selectedChapters, toggleChapter]);

  const premiumBody = (
    <div className="flex w-full flex-col gap-5">
      <div className="flex items-center justify-between rounded-2xl border border-indigo-500/20 bg-[#0f172a]/70 p-4 shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/15 p-2 text-indigo-300">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-100">প্রশ্ন ফিল্টার</h2>
            <p className="text-[11px] font-semibold text-slate-400">বিষয় ও অধ্যায় বাছাই করুন</p>
          </div>
        </div>

        <button type="button" onClick={onMobileClose} className="rounded-[10px] p-2 text-slate-400 transition duration-150 hover:bg-white/10 hover:text-white focus:outline-none lg:hidden" title="Close filters" aria-label="Close filters">
          <X className="w-5 h-5" />
        </button>
      </div>

      <FilterCard title="শিক্ষা স্তর" count={levelOptions.find((item) => item.value === selectedLevel)?.label} isOpen={openCards.level} onToggle={() => toggleCard('level')}>
        <div className="grid grid-cols-2 gap-2">
          {levelOptions.map((level) => {
            const isAvailable = true;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => {
                  if (!isAvailable) return;
                  setSelectedLevel(level.value);
                  setSelectedSubjectId('');
                }}
                disabled={!isAvailable}
                className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold uppercase transition duration-150 focus:outline-none ${selectedLevel === level.value
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-950/30'
                    : 'border-slate-700/60 bg-slate-950/30 text-slate-300 hover:border-indigo-400/50 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-45'
                  }`}
                title={`${level.label} নির্বাচন করুন`}
              >
                {level.label}
              </button>
            );
          })}
        </div>
      </FilterCard>

      <FilterCard title="বিষয়" count={selectedSubjectId ? 'নির্বাচিত' : 'বিষয় নির্বাচন করুন'} isOpen={openCards.subject} onToggle={() => toggleCard('subject')}>
        <div className="relative">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-700/70 bg-slate-950/40 p-3.5 pl-10 text-[13px] font-bold text-slate-100 transition duration-150 hover:border-indigo-400/50 hover:bg-slate-900/70 focus:bg-slate-900 focus:outline-none "
          >
            <option value="">-- বিষয় নির্বাচন করুন --</option>
            {availableSubjects.map((sub) => (
              <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">{sub.name}</option>
            ))}
          </select>
          <BookOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-300" />
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </FilterCard>

      {activeSubjectConfig && chapters.length > 0 && (
        <FilterCard title="অধ্যায়" count={`${selectedChapters.length}/${chapters.length} নির্বাচিত`} isOpen={openCards.chapter} onToggle={() => toggleCard('chapter')}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={selectAllChapters} className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3 py-2 text-xs font-extrabold text-indigo-200 transition duration-150 hover:bg-indigo-500/25 focus:outline-none ">সব অধ্যায়</button>
              <button type="button" onClick={unselectAllChapters} className="rounded-xl border border-slate-700/60 bg-slate-950/30 px-3 py-2 text-xs font-extrabold text-slate-300 transition duration-150 hover:bg-slate-800/70 focus:outline-none ">বাদ দিন</button>
            </div>
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {filteredChapters.map((c) => (
                <FilterCheckboxRow key={c.id} checked={selectedChapters.includes(c.id)} label={c.title} onClick={() => toggleChapter(c.id)} />
              ))}
            </div>
          </div>
        </FilterCard>
      )}

      {selectedChapters.length > 0 && availableTopics.length > 0 && (
        <FilterCard title="টপিক" count={`${selectedTopics.length}/${availableTopics.length} নির্বাচিত`} isOpen={openCards.topic} onToggle={() => toggleCard('topic')}>
          <div className="space-y-3">
            <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {filteredTopics.map((t) => (
                <FilterCheckboxRow key={t.id} checked={selectedTopics.includes(t.id)} label={t.name} onClick={() => toggleTopic(t.id)} />
              ))}
            </div>
          </div>
        </FilterCard>
      )}

      <FilterCard title="প্রশ্নের ধরন" count="JSON ডেটা অনুযায়ী" isOpen={openCards.type} onToggle={() => toggleCard('type')}>
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: 'সব প্রশ্ন', value: 'all' },
            { label: 'বহুনির্বাচনি (MCQ)', value: 'mcq' },
            { label: 'সৃজনশীল (CQ)', value: 'cq' },
            { label: 'জ্ঞান ও অনুধাবন', value: 'k_kh' },
          ].map((type) => (
            <FilterCheckboxRow key={type.value} checked={selectedType === type.value} label={type.label} onClick={() => setSelectedType(type.value)} />
          ))}
        </div>
      </FilterCard>

      <div className="lg:hidden">
        <button type="button" onClick={onMobileClose} className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-950/30 transition duration-150 hover:bg-indigo-500 active:scale-[0.98] focus:outline-none ">
          ফিল্টার প্রয়োগ করুন
        </button>
      </div>
    </div>
  );

  if (isCollapsed) {
    return (
      <div className="qb-sidebar-collapsed flex w-14 shrink-0 flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 py-5 shadow-[0_14px_35px_rgba(0,0,0,0.22)] transition-all duration-250">
        <button onClick={onToggleCollapse} className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition border border-indigo-500/20" title="Expand filters">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`qb-sidebar-drawer fixed inset-0 z-40 transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
        <aside className={`absolute left-0 top-0 bottom-0 w-[88%] max-w-sm bg-slate-950 border-r border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {premiumBody}
        </aside>
      </div>
      <aside className="qb-sidebar-desktop w-full shrink-0 overflow-y-auto bg-slate-900/20 border border-slate-800/50 rounded-2xl p-4 flex-col gap-2 custom-scrollbar">
        {premiumBody}
      </aside>
    </>
  );
});

export default FilterSidebar;
