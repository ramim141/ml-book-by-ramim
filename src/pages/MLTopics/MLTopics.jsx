import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { bookStructure, getAllWords } from '../../data/wordsIndex';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function MLTopics() {
  const allWords = useMemo(() => getAllWords(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(9);

  const filteredWords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allWords.filter((word) => {
      const matchesSearch =
        query === '' ||
        word.title.toLowerCase().includes(query) ||
        word.summary.toLowerCase().includes(query) ||
        word.partTitle.toLowerCase().includes(query);
      const matchesChapter = selectedChapter === 'All' || word.chapterTitle === selectedChapter;

      return matchesSearch && matchesChapter;
    });
  }, [allWords, searchQuery, selectedChapter]);

  useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, selectedChapter, viewMode]);

  const wordsToShow = filteredWords.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#050b12] px-5 py-14 text-slate-200 sm:px-8 lg:px-12 lg:py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="mx-auto max-w-7xl"
      >
        <motion.header variants={fadeUp} className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-300">
              <Sparkles size={14} />
              ML Topics
            </div>
            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              সব মেশিন লার্নিং শব্দ এক জায়গায়।
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              বইয়ের প্রতিটি টপিক খুঁজুন, অধ্যায় অনুযায়ী ফিল্টার করুন, তারপর সরাসরি lesson খুলে পড়ুন।
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-4 text-center">
            <Stat value={allWords.length} label="শব্দ" />
            <Stat value={bookStructure.length} label="অধ্যায়" />
            <Stat value={filteredWords.length} label="ম্যাচ" />
          </div>
        </motion.header>

        <motion.section variants={fadeUp} className="mt-10 rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search Input */}
            <label className="relative block flex-1 group">
              <span className="sr-only">Search topics</span>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="যেকোনো শব্দ, অংশ বা ব্যাখ্যা খুঁজুন..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 w-full rounded-xl border border-cyan-100/[0.08] bg-[#050b12]/50 pl-12 pr-4 text-sm font-medium text-slate-200 outline-none transition-all placeholder:text-slate-600 hover:border-cyan-100/[0.15] hover:bg-[#050b12] focus:border-teal-400/50 focus:bg-[#050b12] focus:ring-4 focus:ring-teal-400/10"
              />
            </label>

            <div className="flex gap-3 sm:gap-4">
              {/* Category Filter */}
              <label className="relative block flex-1 md:w-60 lg:w-72 md:flex-none group">
                <span className="sr-only">Filter by chapter</span>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400">
                  <Filter size={17} strokeWidth={2.5} />
                </div>
                <select
                  value={selectedChapter}
                  onChange={(event) => setSelectedChapter(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-cyan-100/[0.08] bg-[#050b12]/50 pl-11 pr-10 text-sm font-medium text-slate-200 outline-none transition-all hover:border-cyan-100/[0.15] hover:bg-[#050b12] focus:border-teal-400/50 focus:bg-[#050b12] focus:ring-4 focus:ring-teal-400/10 cursor-pointer"
                >
                  <option value="All">সবগুলো অধ্যায়</option>
                  {bookStructure.map((chapter) => (
                    <option key={chapter.chapterId} value={chapter.chapterTitle}>
                      অধ্যায় {chapter.chapterNo}: {chapter.chapterTitle}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-teal-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </label>

              {/* View Toggles */}
              <div className="hidden h-12 w-[104px] shrink-0 items-center rounded-xl border border-cyan-100/[0.08] bg-[#050b12]/50 p-1 md:flex">
                <ViewButton active={viewMode === 'grid'} label="Grid view" onClick={() => setViewMode('grid')}>
                  <LayoutGrid size={18} strokeWidth={2.5} />
                </ViewButton>
                <ViewButton active={viewMode === 'list'} label="List view" onClick={() => setViewMode('list')}>
                  <List size={18} strokeWidth={2.5} />
                </ViewButton>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-8">
          <AnimatePresence mode="popLayout">
            {wordsToShow.length > 0 ? (
              <motion.div
                key={viewMode}
                layout
                className={viewMode === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}
              >
                {wordsToShow.map((word) => (
                  <TopicCard
                    key={word.id}
                    word={word}
                    index={allWords.findIndex((item) => item.id === word.id) + 1}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-lg border border-dashed border-cyan-100/[0.12] bg-[#071521] px-6 py-16 text-center"
              >
                <BookOpen size={34} className="mx-auto text-slate-600" />
                <h2 className="mt-4 text-xl font-black text-white">কোনো শব্দ খুঁজে পাওয়া যায়নি</h2>
                <p className="mt-2 text-sm text-slate-500">অন্য keyword বা chapter দিয়ে আবার চেষ্টা করুন।</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {filteredWords.length > visibleCount && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
              দেখানো হচ্ছে {Math.min(visibleCount, filteredWords.length)} / {filteredWords.length}
            </p>
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 9)}
              className="inline-flex items-center gap-2 rounded-md bg-teal-300 px-6 py-3 text-sm font-black text-[#06111d] transition hover:bg-teal-200"
            >
              <Plus size={17} />
              আরও লোড করুন
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </div>
  );
}

function ViewButton({ active, children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-full flex-1 items-center justify-center rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-teal-400 text-[#050b12] shadow-sm' 
          : 'text-slate-500 hover:bg-cyan-100/[0.04] hover:text-teal-300'
      }`}
    >
      {children}
    </button>
  );
}

function TopicCard({ word, index, viewMode }) {
  const isList = viewMode === 'list';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        to={`/word/${word.path}`}
        className={`group flex h-full rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5 transition hover:-translate-y-0.5 hover:border-teal-300/30 hover:bg-[#081927] ${
          isList ? 'flex-col gap-4 md:flex-row md:items-center md:justify-between' : 'flex-col'
        }`}
      >
        <div className={isList ? 'max-w-3xl' : ''}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-teal-300">
              Word {index}
            </span>
            <span className="rounded-md border border-cyan-100/[0.08] bg-[#050b12] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {word.partTitle}
            </span>
          </div>

          <h2 className="text-xl font-black leading-snug text-white transition group-hover:text-teal-200">
            {word.title}
          </h2>
          <p className={`mt-3 text-sm leading-7 text-slate-400 ${isList ? 'md:line-clamp-1' : 'line-clamp-3'}`}>
            {word.summary}
          </p>
        </div>

        <div className={`mt-6 flex items-center justify-between border-t border-cyan-100/[0.06] pt-4 ${isList ? 'md:mt-0 md:border-t-0 md:pt-0' : ''}`}>
          <span className="text-xs font-bold text-slate-600">{word.chapterTitle}</span>
          <span className="inline-flex items-center gap-2 text-sm font-black text-teal-300">
            পড়ুন
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
