import React, { useCallback, useMemo, useState } from 'react';
import { BookOpen, Check, ChevronDown, Search, SlidersHorizontal, X, Layers, Tag, GraduationCap, Landmark, CalendarDays, RotateCcw, Stethoscope, HeartPulse, Cpu, Globe } from 'lucide-react';
import { enToBn } from '../../helpers.jsx';
import { normalizeChapterKey } from '../../useBuilderQuestions.js';
import { ADMISSION_PROGRAMS } from '../../../../../data/academic/admissionBuilderConfig';

/** স্তরের তালিকা এখন Firestore থেকেই আসে; শুধু নামটা বাংলায় দেখাই */
const LEVEL_LABELS = {
  HSC: 'এইচএসসি (HSC)',
  SSC: 'এসএসসি (SSC)',
  Admission: 'এডমিশন (Admission)',
};

const PROGRAM_ICONS = {
  all: Globe,
  medical: Stethoscope,
  nursing: HeartPulse,
  engineering: Cpu,
  'varsity-a': GraduationCap
};

const chapterLabel = (chapter) => chapter?.name || chapter?.title || chapter?.id || '';

const FilterCard = React.memo(({ title, count, isOpen = true, onToggle, icon: Icon, children }) => (
  <section>
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 text-left focus:outline-none py-0.5"
      aria-expanded={isOpen}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-violet-400" />}
        <div className="min-w-0">
          <span className="block truncate text-[13.5px] sm:text-sm font-black text-slate-100">{title}</span>
          {count && <span className="mt-0.5 block truncate text-[11.5px] font-bold text-slate-400">{count}</span>}
        </div>
      </div>
      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-300' : ''}`} />
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
      className="h-9 w-full rounded-xl border border-slate-700/60 bg-slate-950/60 py-1.5 pl-9 pr-3 text-xs sm:text-[13px] font-medium text-slate-100 transition-all placeholder:text-slate-500 hover:border-slate-600 focus:border-violet-500/60 focus:bg-slate-950 focus:outline-none"
    />
    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
  </label>
));

FilterSearch.displayName = 'FilterSearch';

const FilterCheckboxRow = React.memo(({ checked, label, meta, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-all duration-150 focus:outline-none active:scale-[0.99] ${
      checked ? 'bg-violet-500/15 text-violet-50 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
    }`}
  >
    <span
      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all ${
        checked
          ? 'border-violet-500 bg-violet-500 text-white shadow-sm shadow-violet-500/20'
          : 'border-slate-600 group-hover:border-violet-400/60 bg-slate-900/60'
      }`}
    >
      {checked && <Check className="h-3.5 w-3.5 stroke-[3.5]" />}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-[13px] sm:text-[13.5px] font-bold text-slate-200">{label}</span>
      {meta && <span className="mt-0.5 block truncate text-[11px] sm:text-[11.5px] font-medium text-slate-400">{meta}</span>}
    </span>
  </button>
));

FilterCheckboxRow.displayName = 'FilterCheckboxRow';

const FilterChip = React.memo(({ checked, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3.5 py-1.5 text-xs sm:text-[12.5px] font-bold transition-all duration-150 active:scale-95 ${
      checked
        ? 'border-violet-500 bg-violet-500/20 text-violet-200 shadow-sm shadow-violet-500/10 font-black'
        : 'border-slate-700/60 text-slate-300 hover:border-slate-600 hover:text-white bg-slate-950/40'
    }`}
  >
    {label}
  </button>
));

FilterChip.displayName = 'FilterChip';

const FilterSidebar = React.memo(({
  isMobileOpen, onMobileClose,
  levels = [],
  selectedLevel, setSelectedLevel,
  selectedProgram = 'all', setSelectedProgram,
  selectedSubjectIds = [], toggleSubjectId, selectAllSubjects, unselectAllSubjects,
  selectedSubjectId, setSelectedSubjectId,
  availableSubjects = [], activeSubjects = [],
  chapters = [], chapterCounts = {}, selectedChapters = [], toggleChapter,
  availableTopics = [], selectedTopics = [], toggleTopic,
  availableBoards = [], selectedBoards = [], toggleBoard,
  availableYears = [], selectedYears = [], toggleYear,
  onResetFilters,
}) => {
  const isAdmission = selectedLevel === 'Admission';
  const [chapterSearch, setChapterSearch] = useState('');
  const [topicSearch, setTopicSearch] = useState('');
  const [openCards, setOpenCards] = useState({
    level: true,
    program: true,
    subject: true,
    chapter: true,
    board: true,
    topic: false,
  });

  const [collapsedSubjects, setCollapsedSubjects] = useState({});

  const toggleSubjectCollapse = useCallback((subName) => {
    setCollapsedSubjects((prev) => ({ ...prev, [subName]: !prev[subName] }));
  }, []);

  const narrowFilterCount = selectedTopics.length + selectedBoards.length + selectedYears.length;

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

  // Group chapters by subject if multiple subjects are selected
  const chaptersGroupedBySubject = useMemo(() => {
    const map = new Map();
    filteredChapters.forEach((ch) => {
      const subKey = ch.subjectName || ch.subjectLabel || 'সাধারণ অধ্যায়';
      if (!map.has(subKey)) map.set(subKey, []);
      map.get(subKey).push(ch);
    });
    return map;
  }, [filteredChapters]);

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
      {/* 1. Education Level */}
      <FilterCard
        title="শিক্ষা স্তর"
        icon={GraduationCap}
        isOpen={openCards.level}
        onToggle={() => toggleCard('level')}
      >
        <div className="grid grid-cols-1 gap-1.5">
          {levels.length === 0 && (
            <p className="px-2 py-3 text-center text-xs font-semibold text-slate-500">লোড হচ্ছে…</p>
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
                className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] sm:text-sm font-bold transition-all duration-200 focus:outline-none active:scale-[0.98] ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 font-black'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white bg-slate-950/40 border border-slate-800/50'
                }`}
              >
                <span>{LEVEL_LABELS[level] || level}</span>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      </FilterCard>

      {/* 2. Admission Program Selection (Only in Admission Mode) */}
      {isAdmission && (
        <FilterCard
          title="প্রোগ্রাম (Program)"
          icon={GraduationCap}
          count={ADMISSION_PROGRAMS.find((p) => p.id === selectedProgram)?.shortName || 'বাছাই করুন'}
          isOpen={openCards.program}
          onToggle={() => toggleCard('program')}
        >
          <div className="grid grid-cols-1 gap-1.5">
            {ADMISSION_PROGRAMS.map((prog) => {
              const isSelected = selectedProgram === prog.id;
              const Icon = PROGRAM_ICONS[prog.id] || Globe;
              return (
                <button
                  key={prog.id}
                  type="button"
                  onClick={() => setSelectedProgram(prog.id)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] sm:text-[13.5px] font-bold transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-teal-500/20 border border-teal-500/50 text-teal-200 shadow-sm font-black'
                      : 'border border-slate-800/60 bg-slate-950/40 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{prog.emoji}</span>
                    <span className="truncate">{prog.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </FilterCard>
      )}

      {/* 3. Subject Selection */}
      <FilterCard
        title="বিষয় (Subject)"
        icon={BookOpen}
        count={
          isAdmission
            ? `${selectedSubjectIds.length} / ${availableSubjects.length} টি`
            : activeSubjects[0]?.label || activeSubjects[0]?.name || 'বাছাই করুন'
        }
        isOpen={openCards.subject}
        onToggle={() => toggleCard('subject')}
      >
        {isAdmission ? (
          /* Multi-Subject Checkbox List for Admission */
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] sm:text-xs text-slate-400 font-bold">এক বা একাধিক বিষয়:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllSubjects}
                  className="text-xs font-black text-teal-400 transition hover:text-teal-300 active:scale-95"
                >
                  সব
                </button>
                <span className="text-slate-700">·</span>
                <button
                  type="button"
                  onClick={unselectAllSubjects}
                  className="text-xs font-bold text-slate-500 transition hover:text-slate-300 active:scale-95"
                >
                  ক্লিয়ার
                </button>
              </div>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
              {availableSubjects.map((sub) => {
                const checked = selectedSubjectIds.includes(sub.id);
                return (
                  <FilterCheckboxRow
                    key={sub.id}
                    checked={checked}
                    label={`${sub.emoji ? `${sub.emoji} ` : ''}${sub.name || sub.label}`}
                    meta={`${sub.chapters?.length || 0} টি অধ্যায়`}
                    onClick={() => toggleSubjectId(sub.id)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* Single Select Dropdown for HSC/SSC */
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700/60 bg-slate-950/70 py-2.5 pl-10 pr-9 text-[13px] sm:text-sm font-bold text-slate-100 transition-all hover:border-slate-600 focus:border-violet-500/60 focus:bg-slate-950 focus:outline-none"
            >
              <option value="">-- বিষয় নির্বাচন করুন --</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-100">
                  {sub.emoji ? `${sub.emoji} ` : ''}{sub.label || sub.name}
                </option>
              ))}
            </select>
            <BookOpen className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-300" />
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        )}
      </FilterCard>

      {/* 4. Chapters Selection */}
      {chapters.length > 0 && (
        <FilterCard
          title="অধ্যায় (Chapters)"
          icon={Layers}
          count={`${selectedChapters.length} / ${chapters.length} টি`}
          isOpen={openCards.chapter}
          onToggle={() => toggleCard('chapter')}
        >
          <div className="space-y-2">
            {chapters.length > 5 && (
              <FilterSearch value={chapterSearch} onChange={setChapterSearch} placeholder="অধ্যায় খুঁজুন..." />
            )}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] sm:text-xs text-slate-400 font-bold">অধ্যায় সিলেক্ট করুন:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllChapters}
                  className="text-xs font-black text-violet-300 transition hover:text-violet-200 active:scale-95"
                >
                  সব সিলেক্ট
                </button>
                <span className="text-slate-700">·</span>
                <button
                  type="button"
                  onClick={unselectAllChapters}
                  className="text-xs font-bold text-slate-500 transition hover:text-slate-300 active:scale-95"
                >
                  ক্লিয়ার
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
              {Array.from(chaptersGroupedBySubject.entries()).map(([subName, chList]) => {
                const isCollapsed = Boolean(collapsedSubjects[subName]);
                const selectedInSub = chList.filter((c) => selectedChapters.includes(c.id)).length;

                return (
                  <div key={subName} className="rounded-xl border border-slate-800/80 bg-slate-950/40 overflow-hidden shadow-sm">
                    {chaptersGroupedBySubject.size > 1 && (
                      <button
                        type="button"
                        onClick={() => toggleSubjectCollapse(subName)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 hover:bg-slate-850 border-b border-slate-800/70 transition text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs sm:text-[12.5px] font-black text-teal-300 truncate">{subName}</span>
                          <span className={`text-[10.5px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded ${selectedInSub > 0 ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-800 text-slate-400'}`}>
                            {selectedInSub}/{chList.length}
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90 text-slate-500' : 'rotate-0 text-teal-400'}`} />
                      </button>
                    )}

                    {!isCollapsed && (
                      <div className="p-1 space-y-1">
                        {chList.map((c) => {
                          const count = chapterCounts[c.id] || chapterCounts[normalizeChapterKey(c.id)] || 0;
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
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredChapters.length === 0 && (
                <p className="px-2 py-3 text-center text-xs font-semibold text-slate-500">কোনো অধ্যায় মেলেনি</p>
              )}
            </div>
          </div>
        </FilterCard>
      )}

      {/* 5. Board & Year */}
      {selectedChapters.length > 0 && (availableBoards.length > 0 || availableYears.length > 0) && (
        <FilterCard
          title="বোর্ড ও সাল"
          icon={Landmark}
          count={selectedBoards.length + selectedYears.length > 0 ? `${enToBn(selectedBoards.length + selectedYears.length)} টি বাছাই করা` : null}
          isOpen={openCards.board}
          onToggle={() => toggleCard('board')}
        >
          <div className="space-y-3.5">
            {availableBoards.length > 0 && (
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 px-0.5 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  <Landmark className="h-3.5 w-3.5" /> শিক্ষা বোর্ড / পরীক্ষা
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableBoards
                    .filter((b) => b.name && b.name !== '[object Object]')
                    .map((b) => (
                      <FilterChip
                        key={b.id}
                        checked={selectedBoards.includes(b.id)}
                        label={b.name}
                        onClick={() => toggleBoard(b.id)}
                      />
                    ))}
                </div>
              </div>
            )}
            {availableYears.length > 0 && (
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 px-0.5 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> সাল
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableYears
                    .filter((y) => y.name && y.name !== '[object Object]')
                    .map((y) => (
                      <FilterChip
                        key={y.id}
                        checked={selectedYears.includes(y.id)}
                        label={y.name}
                        onClick={() => toggleYear(y.id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </FilterCard>
      )}

      {/* 6. Topics */}
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
                <p className="px-2 py-3 text-center text-xs font-semibold text-slate-500">কোনো টপিক মেলেনি</p>
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
            <div className="flex items-center gap-1">
              {narrowFilterCount > 0 && onResetFilters && (
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> রিসেট
                </button>
              )}
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="ফিল্টার বন্ধ করুন"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">{body}</div>
          <div className="shrink-0 border-t border-white/10 p-4">
            <button
              type="button"
              onClick={onMobileClose}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              ফিল্টার প্রয়োগ করুন
            </button>
          </div>
        </aside>
      </div>

      {/* Desktop Sidebar Pane */}
      <aside className="qb-filter-pane flex min-h-0 w-full flex-col rounded-2xl border border-white/[0.06] bg-slate-900/30 backdrop-blur-xl">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-violet-400" />
            <h2 className="text-xs sm:text-sm font-black tracking-wide text-white">ফিল্টার সেটিংস</h2>
          </div>
          {narrowFilterCount > 0 && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="টপিক, বোর্ড ও সালের বাছাই সাফ করুন"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
            >
              <RotateCcw className="h-3 w-3" /> রিসেট
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3.5 custom-scrollbar">{body}</div>
      </aside>
    </>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
