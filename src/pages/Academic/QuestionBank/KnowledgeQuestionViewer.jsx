import { useState, useEffect, useMemo, memo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, ArrowLeft, Loader2, Search, SlidersHorizontal, LayoutGrid } from 'lucide-react';
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
    kQs: import.meta.glob('../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_k_kh.json'),
  },
  'hsc-chemistry': {
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    chapters: chaptersChemistry.chapters,
    kQs: import.meta.glob('../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_k_kh.json'),
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

const KQAccordion = memo(({ kq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="overflow-hidden transition-all duration-300 border bg-slate-800/20 border-slate-700/50 rounded-2xl hover:border-slate-600/50">
      {/* Header (Clickable to Expand) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 p-4 transition-colors cursor-pointer sm:p-5 hover:bg-slate-800/40 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className={`hidden p-2 sm:block sm:p-2.5 rounded-xl shrink-0 ${kq.type === 'k' ? 'bg-purple-500/10 text-purple-400' : 'bg-fuchsia-500/10 text-fuchsia-400'}`}>
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md mb-1.5 inline-block">
              {kq.chapterName}
            </span>
            <h3 className="text-sm font-bold text-white sm:text-base">
              {kq.question}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 text-[10px] sm:text-xs font-medium text-slate-500 flex-wrap">
              <span className={`px-1.5 py-0.5 rounded-md border whitespace-nowrap ${kq.type === 'k' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400'}`}>
                {kq.type === 'k' ? 'জ্ঞানমূলক (ক)' : 'অনুধাবনমূলক (খ)'}
              </span>
              {kq.board && kq.board.map((b, idx) => (
                <span key={idx} className="bg-slate-900/60 px-1.5 py-0.5 rounded-md border border-slate-800 whitespace-nowrap">
                  {b}
                </span>
              ))}
              {kq.topic && (
                <span className="text-slate-400 font-semibold">• {kq.topic}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-slate-500 shrink-0">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 pt-0 sm:p-5 sm:pt-0">
          <div className="w-full h-px mb-4 sm:mb-5 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
          
          <div className="space-y-4 duration-500 animate-in fade-in slide-in-from-top-4">
            <div className={`p-4 border rounded-xl ${kq.type === 'k' ? 'bg-purple-950/5 border-purple-500/10' : 'bg-fuchsia-950/5 border-fuchsia-500/10'}`}>
              <div className="block sm:flex sm:items-start sm:gap-2.5 text-justify sm:text-left">
                <span className={`font-bold ${kq.type === 'k' ? 'text-purple-400' : 'text-fuchsia-400'} float-left mr-1.5 sm:float-none sm:mr-0`}>উত্তর:</span>
                <div className="min-w-0">
                  <MarkdownRenderer content={kq.answer} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
KQAccordion.displayName = 'KQAccordion';

export default function KnowledgeQuestionViewer({ educationLevel: propEdu, subject: propSub } = {}) {
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
  const [visibleCount, setVisibleCount] = useState(15);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic]);
  const [selectedType, setSelectedType] = useState('all');
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  // Load all KQs
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadAll = async () => {
      try {
        const promises = Object.entries(config.kQs).map(async ([path, loader]) => {
          const match = path.match(/chapter_(\d+)/);
          const num = match ? parseInt(match[1]) : 1;
          const chapterId = `chapter-${num}`;

          const module = await loader();
          const data = module.default ?? module ?? [];

          return data.map(kq => ({
            ...kq,
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

    allQuestions.forEach(kq => {
      if (kq.board) {
        kq.board.forEach(b => {
          // Board is like "ঢাকা বোর্ড ২০২৩"
          const parts = b.split(' ');
          if (parts.length >= 2) {
            const yearStr = parts[parts.length - 1];
            const boardName = parts.slice(0, parts.length - 1).join(' ');
            if (boardName) boardsSet.add(boardName);
            if (yearStr && /[০-৯0-9]/.test(yearStr)) yearsSet.add(normalizeYear(yearStr));
          } else {
            boardsSet.add(b);
          }
        });
      }
      if (kq.topic) {
        topicsSet.add(kq.topic);
      }
    });

    return {
      chapters,
      boards: Array.from(boardsSet).map(b => ({ value: b, label: b })).sort((a, b) => a.label.localeCompare(b.label)),
      years: Array.from(yearsSet).map(y => ({ value: y, label: enToBnNumber(y) })).sort((a, b) => b.value.localeCompare(a.value)),
      topics: Array.from(topicsSet).map(t => ({ value: t, label: t })).sort((a, b) => a.label.localeCompare(b.label)),
      types: [
        { value: 'k', label: 'জ্ঞানমূলক (ক)' },
        { value: 'kh', label: 'অনুধাবনমূলক (খ)' }
      ]
    };
  }, [allQuestions, config]);

  // Apply filters & search
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(kq => {
      const matchesSearch = searchQuery === '' ||
        kq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kq.answer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kq.topic?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChapter = selectedChapter === 'all' || kq.chapterId === selectedChapter;
      
      const matchesBoard = selectedBoard === 'all' || kq.board?.some(b => b.includes(selectedBoard));
      const matchesYear = selectedYear === 'all' || kq.board?.some(b => normalizeYear(b).includes(selectedYear));
      
      const matchesTopic = selectedTopic === 'all' || kq.topic === selectedTopic;
      const matchesType = selectedType === 'all' || kq.type === selectedType;

      return matchesSearch && matchesChapter && matchesBoard && matchesYear && matchesTopic && matchesType;
    });
  }, [allQuestions, searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic, selectedType]);

  const renderFilters = () => (
    <>
      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">অধ্যায়</label>
        <FilterSelect
          value={selectedChapter}
          onChange={setSelectedChapter}
          options={[{ value: 'all', label: 'সকল অধ্যায়' }, ...filterOptions.chapters]}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">প্রশ্নের ধরন</label>
        <FilterSelect
          value={selectedType}
          onChange={setSelectedType}
          options={[{ value: 'all', label: 'সকল ধরন' }, ...filterOptions.types]}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">বোর্ড</label>
        <FilterSelect
          value={selectedBoard}
          onChange={setSelectedBoard}
          options={[{ value: 'all', label: 'সকল বোর্ড' }, ...filterOptions.boards]}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">সাল</label>
        <FilterSelect
          value={selectedYear}
          onChange={setSelectedYear}
          options={[{ value: 'all', label: 'সকল সাল' }, ...filterOptions.years]}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">টপিক</label>
        <FilterSelect
          value={selectedTopic}
          onChange={setSelectedTopic}
          options={[{ value: 'all', label: 'সকল টপিক' }, ...filterOptions.topics]}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] py-6 sm:py-8 text-slate-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <Link
          to="/academic/question-bank"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          প্রশ্নব্যাংক ড্যাশবোর্ডে ফিরুন
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {config.title} জ্ঞান ও অনুধাবন
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              সকল অধ্যায়ের বিগত সালের গুরুত্বপূর্ণ জ্ঞানমূলক (ক) ও অনুধাবনমূলক (খ) প্রশ্ন ও উত্তর।
            </p>
          </div>
          <div className="text-xs sm:text-sm bg-purple-500/10 border border-purple-500/20 px-3.5 py-1.5 rounded-full text-purple-300 font-bold shrink-0 self-start md:self-center">
            মোট প্রশ্ন: {enToBnNumber(filteredQuestions.length)} টি
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 border shadow-xl bg-slate-800/20 backdrop-blur-xl border-slate-700/50 rounded-3xl relative z-40">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 relative w-full">
            <div className="flex items-end gap-3 w-full lg:w-auto lg:max-w-xs xl:max-w-sm shrink-0">
              {/* Search Box */}
              <div className="flex-grow w-full">
                <label className="hidden lg:block text-[10px] font-bold text-transparent mb-1.5 select-none">Search</label>
                <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-full p-1.5 shadow-inner focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all min-w-0">
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
              </div>

              {/* Advance Filter Toggle (Mobile Only) */}
              <div className="lg:hidden relative shrink-0">
                <button
                  onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
                  className={`p-3 sm:p-3.5 rounded-2xl sm:rounded-[1.25rem] border transition-all flex items-center justify-center ${showAdvanceFilters
                    ? 'bg-purple-500/30 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border-slate-700/50'
                    }`}
                >
                  <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* Expanded Filters Popup */}
                {showAdvanceFilters && (
                  <div className="absolute right-0 top-full mt-3 w-[260px] sm:w-[320px] p-4 rounded-2xl bg-slate-800/95 border border-slate-700/70 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {renderFilters()}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Filters Row (Hidden on mobile) */}
            <div className="hidden lg:flex flex-row flex-wrap items-center gap-3 w-full flex-1 [&>div]:flex-1 [&>div]:min-w-[100px]">
              {renderFilters()}
            </div>
          </div>
        </div>

        {/* Loader or Questions Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-slate-400 text-sm">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 pb-8">
            {filteredQuestions.slice(0, visibleCount).map((kq, idx) => (
              <KQAccordion key={`${kq.id}-${idx}`} kq={kq} />
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
            <p className="text-slate-500 text-xs mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        )}
      </div>
    </div>
  );
}
