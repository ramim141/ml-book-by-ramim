import { useState, useEffect, useMemo, memo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, BookOpenCheck, ArrowLeft, Loader2, Search, SlidersHorizontal, LayoutGrid } from 'lucide-react';
import FilterSelect from '../../../components/UI/FilterSelect';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

// Import chapters lists
import chaptersIct from '../../../components/Academic/HSC/ICT/ICT_data/chapters.json';
import chaptersChemistry from '../../../components/Academic/HSC/Chemistry/Chemistry_data/chapters.json';

const subjectConfigs = {
  'hsc-ict': {
    title: 'এইচএসসি আইসিটি (ICT)',
    chapters: chaptersIct.chapters,
    cqs: import.meta.glob('../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_CQs.json'),
  },
  'hsc-chemistry': {
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    chapters: chaptersChemistry.chapters,
    cqs: import.meta.glob('../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_CQs.json'),
  }
};

const enToBnNumber = (numStr) => {
  if (!numStr) return numStr;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const normalizeYear = (yearStr) => {
  if (!yearStr) return yearStr;
  const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  let enYear = String(yearStr).replace(/[০-৯]/g, w => bnToEn[w]);
  if (enYear.length === 2) {
    enYear = "20" + enYear;
  }
  return enYear;
};

const MarkdownRenderer = ({ content }) => (
  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        table: ({ node, ...props }) => (
          <div className="w-full pb-4 overflow-x-auto">
            <table className="w-full min-w-max" {...props} />
          </div>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const CQAccordion = memo(({ cq }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="overflow-hidden transition-all duration-300 border bg-slate-800/20 border-slate-700/50 rounded-2xl hover:border-slate-600/50">
      {/* Header (Clickable to Expand) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 p-4 transition-colors cursor-pointer sm:p-5 hover:bg-slate-800/40 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="hidden p-2 sm:block bg-emerald-500/10 sm:p-2.5 rounded-xl text-emerald-400 shrink-0">
            <HelpCircle className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md mb-1.5 inline-block">
              {cq.chapterName}
            </span>
            <h3 className="text-sm font-bold text-white sm:text-base truncate">
              {cq.title}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs font-medium text-slate-500 flex-wrap">
              {cq.boards && cq.boards.map((b, idx) => (
                <span key={idx} className="bg-slate-900/60 px-1.5 py-0.5 rounded-md border border-slate-800 whitespace-nowrap">
                  {b.name} - {b.year}
                </span>
              ))}
              {cq.topic && (
                <span className="text-slate-400 font-semibold">• {cq.topic}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-slate-500 shrink-0">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expandable Content (Questions & Answers) */}
      {isOpen && (
        <div className="px-4 pt-2 pb-4 sm:px-5 sm:pb-5 sm:pt-3 border-t border-slate-700/30">
          {/* Stem / Uddipok */}
          {(cq.image || cq.image_url || cq.stem) && (
            <div className="p-4 mb-5 text-xs leading-relaxed whitespace-pre-wrap border bg-slate-900/40 rounded-xl sm:p-5 border-slate-800/80 text-slate-300 sm:text-base">
              {(cq.image || cq.image_url) && (
                <div className="flex justify-center mb-4">
                  <img src={cq.image || cq.image_url} alt="উদ্দীপকের চিত্র" className="object-contain h-auto max-w-full p-1 border rounded-lg max-h-64 border-slate-700/50 bg-slate-800/50" />
                </div>
              )}

              {cq.stem && (cq.stem.trim().startsWith('http://') || cq.stem.trim().startsWith('https://') || cq.stem.trim().startsWith('/') || cq.stem.trim().startsWith('./')) ? (
                <div className="flex justify-center">
                  <img src={cq.stem.trim()} alt="উদ্দীপকের চিত্র" className="object-contain h-auto max-w-full p-1 border rounded-lg max-h-64 border-slate-700/50 bg-slate-800/50" />
                </div>
              ) : (
                cq.stem && <MarkdownRenderer content={cq.stem} />
              )}
            </div>
          )}

          {/* Questions Stack */}
          <div className="flex flex-col gap-3 mb-5">
            {cq.questions && Object.entries(cq.questions).map(([key, content]) => {
              if (!content) return null;
              const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
              return (
                <div key={key} className="p-3 border rounded-lg bg-slate-900/20 border-slate-800/50 flex items-start gap-2.5">
                  <span className="font-bold text-indigo-400">{labels[key] || key}.</span>
                  <div className="flex-1 min-w-0">
                    <MarkdownRenderer content={content.replace(/^(\*\*গ\.\*\*|\*\*ঘ\.\*\*|\*\*ক\.\*\*|\*\*খ\.\*\*)\s*/, '')} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Answer Toggle Button */}
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-950/20 w-full sm:w-auto mx-auto"
          >
            <BookOpenCheck className="w-4 h-4" />
            {showAnswer ? "উত্তর লুকাও" : "উত্তর দেখুন"}
          </button>

          {/* Answers Section */}
          {showAnswer && (
            <div className="mt-5 space-y-4 duration-500 animate-in fade-in slide-in-from-top-4">
              {cq.answers && Object.entries(cq.answers).map(([key, content]) => {
                if (!content) return null;
                const labels = { ka: 'ক', kha: 'খ', ga: 'গ', gha: 'ঘ' };
                return (
                  <div key={key} className="p-4 border bg-emerald-950/5 rounded-xl border-emerald-500/10">
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-emerald-400">{labels[key] || key} এর উত্তর:</span>
                      <div className="flex-1 min-w-0">
                        <MarkdownRenderer content={content.replace(/^(\*\*উত্তর\s*\(ক\):\*\*|\*\*উত্তর\s*\(খ\):\*\*|\*\*উত্তর\s*\(গ\):\*\*|\*\*উত্তর\s*\(ঘ\):\*\*)\s*/, '')} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
CQAccordion.displayName = 'CQAccordion';

export default function CQQuestionViewer({ educationLevel: propEdu, subject: propSub } = {}) {
  const { educationLevel: paramEdu, subject: paramSub } = useParams();
  const educationLevel = propEdu || paramEdu;
  const subject = propSub || paramSub;
  const configKey = `${educationLevel}-${subject}`;
  const config = subjectConfigs[configKey];

  if (!config) {
    return <Navigate to="/academic/question-bank" replace />;
  }

  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic]);

  // Load all CQs
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadAll = async () => {
      try {
        const promises = Object.entries(config.cqs).map(async ([path, loader]) => {
          const match = path.match(/chapter_(\d+)/);
          const num = match ? parseInt(match[1]) : 1;
          const chapterId = `chapter-${num}`;

          const module = await loader();
          const data = module.default ?? module ?? [];

          return data.map(cq => ({
            ...cq,
            chapterId,
            chapterName: config.chapters.find(c => c.id === chapterId)?.title || `অধ্যায় ${num}`
          }));
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          setAllQuestions(results.flat().filter(Boolean));
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading questions:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadAll();
    return () => { isMounted = false; };
  }, [config]);

  // Extract filter options dynamically
  const filterOptions = useMemo(() => {
    const chapters = config.chapters.map(c => ({ value: c.id, label: c.title }));

    const boardsSet = new Set();
    const yearsSet = new Set();
    const topicsSet = new Set();

    allQuestions.forEach(cq => {
      if (cq.boards) {
        cq.boards.forEach(b => {
          if (b.name) boardsSet.add(b.name);
          if (b.year) yearsSet.add(normalizeYear(b.year));
        });
      }
      if (cq.topic) {
        topicsSet.add(cq.topic);
      }
    });

    const boards = Array.from(boardsSet).map(b => ({ value: b, label: b }));
    const years = Array.from(yearsSet)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(y => ({ value: y, label: enToBnNumber(y) }));
    const topics = Array.from(topicsSet).map(t => ({ value: t, label: t }));

    return { chapters, boards, years, topics };
  }, [allQuestions, config]);

  // Apply filters & search
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(cq => {
      const matchesSearch = searchQuery === '' ||
        cq.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cq.stem?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cq.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(cq.questions || {}).some(q => q.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChapter = selectedChapter === 'all' || cq.chapterId === selectedChapter;
      const matchesBoard = selectedBoard === 'all' || cq.boards?.some(b => b.name === selectedBoard);
      const matchesYear = selectedYear === 'all' || cq.boards?.some(b => normalizeYear(b.year) === selectedYear);
      const matchesTopic = selectedTopic === 'all' || cq.topic === selectedTopic;

      return matchesSearch && matchesChapter && matchesBoard && matchesYear && matchesTopic;
    });
  }, [allQuestions, searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic]);

  return (
    <div className="min-h-screen bg-[#0b0f19] py-6 sm:py-8 text-slate-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <Link
          to="/academic/question-bank"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {config.title} সৃজনশীল (CQ) প্রশ্নব্যাংক
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              সকল অধ্যায়ের বিগত সালের গুরুত্বপূর্ণ বোর্ড প্রশ্ন ও উত্তর একসাথে।
            </p>
          </div>
          <div className="text-xs sm:text-sm bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-300 font-bold shrink-0 self-start md:self-center">
            মোট প্রশ্ন: {enToBnNumber(filteredQuestions.length)} টি
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border shadow-xl bg-slate-800/20 backdrop-blur-xl border-slate-700/50 rounded-3xl relative z-40">
          <div className="flex items-center gap-3 relative w-full">
            {/* Search Box */}
            <div className="flex-grow flex items-center bg-slate-900/50 border border-slate-700/50 rounded-full p-1.5 shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all min-w-0">
              <div className="pl-4 pr-2 flex items-center pointer-events-none shrink-0">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="প্রশ্ন বা টপিক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow w-full min-w-0 bg-transparent border-none text-slate-100 text-sm sm:text-base focus:outline-none focus:ring-0 py-2 sm:py-2.5"
              />
            </div>

            {/* Advance Filter Toggle */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
                className={`p-3 sm:p-3.5 rounded-2xl sm:rounded-[1.25rem] border transition-all flex items-center justify-center ${showAdvanceFilters
                  ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border-slate-700/50'
                  }`}
              >
                <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Expanded Filters Popup */}
              {showAdvanceFilters && (
                <div className="absolute right-0 top-full mt-3 w-[260px] sm:w-[320px] p-4 rounded-2xl bg-slate-800/95 border border-slate-700/70 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">অধ্যায়</label>
                    <FilterSelect
                      value={selectedChapter}
                      onChange={setSelectedChapter}
                      options={[{ value: 'all', label: 'সব অধ্যায়' }, ...filterOptions.chapters]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">বোর্ড</label>
                    <FilterSelect
                      value={selectedBoard}
                      onChange={setSelectedBoard}
                      options={[{ value: 'all', label: 'সব বোর্ড' }, ...filterOptions.boards]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">সাল</label>
                    <FilterSelect
                      value={selectedYear}
                      onChange={setSelectedYear}
                      options={[{ value: 'all', label: 'সব সাল' }, ...filterOptions.years]}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">টপিক</label>
                    <FilterSelect
                      value={selectedTopic}
                      onChange={setSelectedTopic}
                      options={[{ value: 'all', label: 'সব টপিক' }, ...filterOptions.topics]}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loader or Questions Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 pb-8">
            {filteredQuestions.slice(0, visibleCount).map((cq) => (
              <CQAccordion key={cq.id} cq={cq} />
            ))}
            
            {visibleCount < filteredQuestions.length && (
              <div className="flex justify-center mt-4 mb-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 15)}
                  className="px-6 py-2.5 bg-indigo-500/20 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                >
                  আরও দেখুন
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 border border-slate-700/30 rounded-3xl bg-slate-800/10">
            <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">কোনো প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-slate-500 text-xs mt-1">অনুগ্রহ করে ফিল্টার পরিবর্তন করে চেষ্টা করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
}
