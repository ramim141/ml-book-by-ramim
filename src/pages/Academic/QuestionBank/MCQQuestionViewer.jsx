import { useState, useEffect, useMemo, memo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, Circle, ArrowLeft, Loader2, Search, SlidersHorizontal, LayoutGrid, Filter } from 'lucide-react';
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
    mcqs: import.meta.glob('../../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_MCQs.json'),
  },
  'hsc-chemistry': {
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    chapters: chaptersChemistry.chapters,
    mcqs: import.meta.glob('../../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_MCQs.json'),
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
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed">
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto w-full pb-4 block my-4">
            <table className="min-w-max w-full" {...props} />
          </div>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  </span>
);

const MCQItem = memo(({ mcq, index }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionClick = (optIdx) => {
    if (showAnswer) return;
    setSelectedOption(optIdx);
    setShowAnswer(true); // Instantly show correct/wrong
  };

  const handleRetry = () => {
    setShowAnswer(false);
    setSelectedOption(null);
  };

  return (
    <div className={`bg-slate-850/40 border border-slate-700/40 rounded-2xl p-4 sm:p-5 transition-all duration-300`}>
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <div className={`font-bold w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 text-sm bg-indigo-500/10 text-indigo-400`}>
          {enToBnNumber(index + 1)}
        </div>
        <div className="flex-1 mt-1 min-w-0">
          <div className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed mb-2.5">
            <MarkdownRenderer content={mcq.question} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {mcq.chapterName}
            </span>
            {mcq.boards?.map((board, idx) => (
              <span key={`board-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {board.name} {board.year}
              </span>
            ))}
            {mcq.institutions?.map((inst, idx) => (
              <span key={`inst-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {inst.name} {inst.year}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 sm:ml-12">
        {mcq.options.map((option, optIdx) => {
          let optionClass = "border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-600 text-slate-300 cursor-pointer";
          let Icon = Circle;

          if (showAnswer) {
            if (optIdx === mcq.answer) {
              optionClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
              Icon = CheckCircle2;
            } else if (optIdx === selectedOption) {
              optionClass = "border-red-500/50 bg-red-500/10 text-red-400";
            }
          } else if (selectedOption === optIdx) {
            optionClass = "border-indigo-500 bg-indigo-500/10 text-indigo-300";
            Icon = CheckCircle2;
          }

          return (
            <div
              key={optIdx}
              onClick={() => handleOptionClick(optIdx)}
              className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border transition-all ${optionClass} ${showAnswer && optIdx !== mcq.answer && optIdx !== selectedOption ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm"><MarkdownRenderer content={option} /></span>
            </div>
          );
        })}
      </div>

      {showAnswer && (
        <div className="sm:ml-12 space-y-3">
          {mcq.explanation && (
            <div className="bg-slate-900/30 border border-slate-800 p-3.5 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h4 className="text-emerald-400 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> ব্যাখ্যা:
              </h4>
              <div className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                <MarkdownRenderer content={mcq.explanation} />
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-slate-700/20 pt-3">
            <button
              onClick={handleRetry}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
MCQItem.displayName = 'MCQItem';

export default function MCQQuestionViewer({ educationLevel: propEdu, subject: propSub } = {}) {
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
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(15);
  }, [searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic, selectedInstitution]);

  // Load all MCQs
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadAll = async () => {
      try {
        const promises = Object.entries(config.mcqs).map(async ([path, loader]) => {
          const match = path.match(/chapter_(\d+)/);
          const num = match ? parseInt(match[1]) : 1;
          const chapterId = `chapter-${num}`;

          const module = await loader();
          const data = module.default ?? module ?? [];

          return data.map(mcq => ({
            ...mcq,
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
        console.error("Error loading MCQ questions:", err);
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
    const institutionsSet = new Set();

    allQuestions.forEach(mcq => {
      if (mcq.boards) {
        mcq.boards.forEach(b => {
          if (b.name) boardsSet.add(b.name);
          if (b.year) yearsSet.add(normalizeYear(b.year));
        });
      }
      if (mcq.institutions) {
        mcq.institutions.forEach(i => {
          if (i.name) institutionsSet.add(i.name);
          if (i.year) yearsSet.add(normalizeYear(i.year));
        });
      }
      if (mcq.topic) {
        topicsSet.add(mcq.topic);
      }
    });

    const boards = Array.from(boardsSet).map(b => ({ value: b, label: b }));
    const years = Array.from(yearsSet)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(y => ({ value: y, label: enToBnNumber(y) }));
    const topics = Array.from(topicsSet).map(t => ({ value: t, label: t }));
    const institutions = Array.from(institutionsSet).map(i => ({ value: i, label: i }));

    return { chapters, boards, years, topics, institutions };
  }, [allQuestions, config]);

  // Apply filters & search
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(mcq => {
      const matchesSearch = searchQuery === '' ||
        mcq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mcq.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mcq.options?.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChapter = selectedChapter === 'all' || mcq.chapterId === selectedChapter;
      const matchesBoard = selectedBoard === 'all' || mcq.boards?.some(b => b.name === selectedBoard);
      const matchesInstitution = selectedInstitution === 'all' || mcq.institutions?.some(i => i.name === selectedInstitution);
      const matchesYear = selectedYear === 'all' ||
        mcq.boards?.some(b => normalizeYear(b.year) === selectedYear) ||
        mcq.institutions?.some(i => normalizeYear(i.year) === selectedYear);
      const matchesTopic = selectedTopic === 'all' || mcq.topic === selectedTopic;

      return matchesSearch && matchesChapter && matchesBoard && matchesYear && matchesTopic && matchesInstitution;
    });
  }, [allQuestions, searchQuery, selectedChapter, selectedBoard, selectedYear, selectedTopic, selectedInstitution]);

  const renderFilters = () => (
    <>
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

      {filterOptions.institutions.length > 0 && (
        <div>
          <label className="text-[10px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider">স্কুল/কলেজ</label>
          <FilterSelect
            value={selectedInstitution}
            onChange={setSelectedInstitution}
            options={[{ value: 'all', label: 'সব কলেজ' }, ...filterOptions.institutions]}
          />
        </div>
      )}

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
          ড্যাশবোর্ডে ফিরুন
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {config.title} বহুনির্বাচনী (MCQ) প্রশ্নব্যাংক
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              সকল অধ্যায়ের বিগত সালের গুরুত্বপূর্ণ বোর্ড ও কলেজ প্রশ্ন সমাধান একসাথে।
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
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 relative w-full">
            <div className="flex items-end gap-3 w-full lg:w-auto lg:max-w-xs xl:max-w-sm shrink-0">
              {/* Search Box */}
              <div className="flex-grow w-full">
                <label className="hidden lg:block text-[10px] font-bold text-transparent mb-1.5 select-none">Search</label>
                <div className="flex items-center bg-slate-900/50 border border-slate-700/50 rounded-full p-1.5 shadow-inner focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all min-w-0">
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
                    ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
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
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">প্রশ্ন লোড হচ্ছে...</p>
          </div>
        ) : filteredQuestions.length > 0 ? (
          <div className="flex flex-col gap-4 pb-8">
            {filteredQuestions.slice(0, visibleCount).map((mcq, idx) => (
              <MCQItem key={mcq.id} mcq={mcq} index={idx} />
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
