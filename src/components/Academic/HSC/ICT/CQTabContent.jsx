import { useState, useMemo, memo, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpenCheck, Filter } from 'lucide-react';
import FilterSelect from '../../../UI/FilterSelect';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

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
  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:my-2 prose-li:my-0 prose-ul:my-2 prose-ol:my-2 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
    <ReactMarkdown 
      remarkPlugins={[remarkMath, remarkGfm]} 
      rehypePlugins={[rehypeKatex]}
      components={{
        table: ({node, ...props}) => (
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
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header (Clickable to Expand) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-6 cursor-pointer hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3 sm:gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block bg-emerald-500/10 p-2 sm:p-3 rounded-xl text-emerald-400 shrink-0">
            <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-lg">
              {cq.title}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-2 text-[10px] sm:text-xs font-medium text-slate-500 flex-wrap">
              {cq.boards && cq.boards.map((b, idx) => (
                <span key={idx} className="bg-slate-900 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border border-slate-700 whitespace-nowrap">
                  {b.name} - {b.year}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="text-slate-500">
          {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {/* Expandable Content (Questions & Answers) */}
      {isOpen && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-2 sm:pt-4">
          {/* Stem / Uddipok */}
          {(cq.image || cq.stem) && (
            <div className="bg-slate-900/50 rounded-xl p-4 sm:p-5 mb-6 border border-slate-800 text-slate-300 text-xs sm:text-base whitespace-pre-wrap leading-relaxed">
              {/* If cq.image is provided explicitly */}
              {cq.image && (
                <div className="mb-4 flex justify-center">
                  <img src={cq.image} alt="উদ্দীপকের চিত্র" className="max-w-full h-auto max-h-64 object-contain rounded-lg border border-slate-700/50 bg-slate-800/50 p-1" />
                </div>
              )}
              
              {/* If cq.stem is directly a URL */}
              {cq.stem && (cq.stem.trim().startsWith('http://') || cq.stem.trim().startsWith('https://')) ? (
                <div className="flex justify-center">
                  <img src={cq.stem.trim()} alt="উদ্দীপকের চিত্র" className="max-w-full h-auto max-h-64 object-contain rounded-lg border border-slate-700/50 bg-slate-800/50 p-1" />
                </div>
              ) : (
                /* Otherwise treat cq.stem as markdown text */
                cq.stem && <MarkdownRenderer content={cq.stem} />
              )}
            </div>
          )}

          {/* Questions Stack */}
          <div className="flex flex-col gap-3 mb-6">
            {cq.questions && Object.entries(cq.questions).map(([key, content]) => {
              if (!content || !content.trim()) return null;
              return (
                <div key={key} className="p-3 border rounded-lg bg-slate-800/30 border-slate-700/30">
                  <MarkdownRenderer content={content} />
                </div>
              );
            })}
          </div>

          {/* Answer Toggle Button */}
          <button 
            onClick={() => setShowAnswer(!showAnswer)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-6 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20 w-full sm:w-auto mx-auto"
          >
            <BookOpenCheck className="w-4 h-4" /> 
            {showAnswer ? "উত্তর লুকাও" : "উত্তর মেলাও"}
          </button>

          {/* Answers Section */}
          {showAnswer && (
            <div className="mt-6 space-y-4 duration-500 animate-in fade-in slide-in-from-top-4">
              {cq.answers && Object.entries(cq.answers).map(([key, content]) => {
                if (!content || !content.trim()) return null;
                return (
                  <div key={key} className="p-5 border bg-emerald-900/10 rounded-xl border-emerald-500/20">
                    <MarkdownRenderer content={content} />
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

const CQTabContent = ({ chapter }) => {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [displayCount, setDisplayCount] = useState(10);

  const cqs = chapter.cqs || [];

  useEffect(() => {
    setDisplayCount(10);
  }, [selectedTopic, selectedBoard, selectedYear]);

  // Extract unique topics, boards, and years for filter options
  const allTopics = useMemo(() => [...new Set(cqs.map(cq => cq.topic || "অন্যান্য"))], [cqs]);
  const allBoards = useMemo(() => [...new Set(cqs.flatMap(cq => cq.boards?.map(b => b.name) || []))], [cqs]);
  const allYears = useMemo(() => [...new Set(cqs.flatMap(cq => cq.boards?.map(b => normalizeYear(b.year)) || []))].sort((a, b) => parseInt(b) - parseInt(a)), [cqs]);

  // Apply filters
  const filteredCQs = useMemo(() => {
    return cqs.filter(cq => {
      const topicMatch = selectedTopic === 'all' || (cq.topic || "অন্যান্য") === selectedTopic;
      const boardMatch = selectedBoard === 'all' || cq.boards?.some(b => b.name === selectedBoard);
      const yearMatch = selectedYear === 'all' || cq.boards?.some(b => normalizeYear(b.year) === selectedYear);
      return topicMatch && boardMatch && yearMatch;
    });
  }, [cqs, selectedTopic, selectedBoard, selectedYear]);

  const displayedCQs = useMemo(() => filteredCQs.slice(0, displayCount), [filteredCQs, displayCount]);

  const groupedCQs = useMemo(() => {
    return displayedCQs.reduce((acc, cq) => {
      const topic = cq.topic || "অন্যান্য";
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(cq);
      return acc;
    }, {});
  }, [displayedCQs]);

  return (
    <div className="space-y-6">
      {cqs.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-5 sm:p-6 rounded-2xl shadow-xl shadow-slate-900/20">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Filter className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm uppercase tracking-wider">প্রশ্ন ফিল্টার করুন</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <FilterSelect
              value={selectedTopic}
              onChange={setSelectedTopic}
              options={[{ value: 'all', label: 'সব টপিক' }, ...allTopics.map(t => ({ value: t, label: t }))]}
            />

            <FilterSelect
              value={selectedBoard}
              onChange={setSelectedBoard}
              options={[{ value: 'all', label: 'সব বোর্ড' }, ...allBoards.map(b => ({ value: b, label: b }))]}
            />

            <div className="sm:col-span-2 md:col-span-1">
              <FilterSelect
                value={selectedYear}
                onChange={setSelectedYear}
                options={[{ value: 'all', label: 'সব সাল' }, ...allYears.map(y => ({ value: y, label: enToBnNumber(y) }))]}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {filteredCQs.length > 0 ? (
          Object.entries(groupedCQs).map(([topic, cqsList]) => (
            <div key={topic} className="space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-1.5 h-5 sm:h-6 bg-indigo-500 rounded-full shrink-0"></div>
                <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white leading-tight">{topic}</h3>
                <span className="bg-slate-800 text-slate-400 text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md ml-1 sm:ml-2 border border-slate-700/50 whitespace-nowrap shrink-0">
                  {cqsList.length} টি প্রশ্ন
                </span>
              </div>
              {cqsList.map((cq) => (
                <CQAccordion key={cq.id} cq={cq} />
              ))}
            </div>
          ))
        ) : (
          cqs.length > 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">আপনার ফিল্টার অনুযায়ী কোনো সৃজনশীল প্রশ্ন পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">এই অধ্যায়ের কোনো সৃজনশীল প্রশ্ন পাওয়া যায়নি।</p>
            </div>
          )
        )}
      </div>

      {displayCount < filteredCQs.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700/50 shadow-lg"
          >
            আরও দেখুন
          </button>
        </div>
      )}
    </div>
  );
};

export { CQAccordion, MarkdownRenderer };
export default CQTabContent;
