import { useState, useMemo, memo, useEffect } from 'react';
import { HelpCircle, Filter, CheckCircle2, Circle } from 'lucide-react';
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
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed">
    <ReactMarkdown 
      remarkPlugins={[remarkMath, remarkGfm]} 
      rehypePlugins={[rehypeKatex]}
      components={{
        table: ({node, ...props}) => (
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

const MCQItem = memo(({ mcq, index, isQuizMode, quizSelectedOption, onQuizSelect, isQuizSubmitted }) => {
  const [localSelectedOption, setLocalSelectedOption] = useState(null);
  const [localShowAnswer, setLocalShowAnswer] = useState(false);

  const selectedOption = isQuizMode ? quizSelectedOption : localSelectedOption;
  const showAnswer = isQuizMode ? isQuizSubmitted : localShowAnswer;

  const handleOptionClick = (optIdx) => {
    if (showAnswer) return;
    if (isQuizMode) {
      if (onQuizSelect) onQuizSelect(mcq.id, optIdx);
    } else {
      setLocalSelectedOption(optIdx);
    }
  };

  const handleCheckAnswer = () => {
    if (!isQuizMode) {
      setLocalShowAnswer(true);
    }
  };

  return (
    <div className={`bg-slate-800/40 border ${isQuizMode && isQuizSubmitted ? (selectedOption === mcq.answer ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-slate-700/50'} rounded-2xl p-4 sm:p-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className="flex items-start gap-3 sm:gap-4 mb-5">
        <div className={`font-bold w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 text-sm sm:text-base ${isQuizMode && isQuizSubmitted ? (selectedOption === mcq.answer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400') : 'bg-indigo-500/10 text-indigo-400'}`}>
          {index + 1}
        </div>
        <div className="flex-1 mt-1 sm:mt-1.5 min-w-0">
          <div className="text-slate-200 text-sm sm:text-lg font-medium leading-relaxed mb-3">
            <MarkdownRenderer content={mcq.question} />
          </div>

          {mcq.image_url && (
            <div className="mb-4 rounded-xl overflow-hidden max-w-sm bg-white/5">
              <img 
                src={mcq.image_url.startsWith('./') ? mcq.image_url.slice(1) : mcq.image_url.startsWith('/') ? mcq.image_url : `/${mcq.image_url}`} 
                alt="Question Context" 
                className="w-full h-auto object-contain rounded-xl" 
              />
            </div>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {mcq.boards?.map((board, idx) => (
              <span key={`board-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {board.name} {board.year}
              </span>
            ))}
            {mcq.institutions?.map((inst, idx) => (
              <span key={`inst-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {inst.name} {inst.year}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 sm:ml-14">
        {mcq.options.map((option, optIdx) => {
          let optionClass = "border-slate-700/50 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600 text-slate-300 cursor-pointer";
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
              className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border transition-all ${optionClass} ${showAnswer && optIdx !== mcq.answer && optIdx !== selectedOption ? 'opacity-50' : ''}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="text-xs sm:text-base"><MarkdownRenderer content={option} /></span>
            </div>
          );
        })}
      </div>

      {showAnswer && mcq.explanation && (
        <div className="mb-5 sm:ml-14 bg-slate-800/60 border border-slate-700 p-4 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="text-emerald-400 font-bold text-sm mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> ব্যাখ্যা:
          </h4>
          <div className="text-slate-300 text-sm leading-relaxed">
            <MarkdownRenderer content={mcq.explanation} />
          </div>
        </div>
      )}

      {!isQuizMode && (
        <div className="flex justify-end mt-4">
          {!showAnswer ? (
            <button 
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                selectedOption === null 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
              }`}
            >
              উত্তর মেলাও
            </button>
          ) : (
            <button 
              onClick={() => {
                setLocalShowAnswer(false);
                setLocalSelectedOption(null);
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all"
            >
              পুনরায় চেষ্টা করুন
            </button>
          )}
        </div>
      )}
    </div>
  );
});
MCQItem.displayName = 'MCQItem';

export { MCQItem };

const MCQTabContent = ({ chapter }) => {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedBoard, setSelectedBoard] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [displayCount, setDisplayCount] = useState(10);

  const mcqs = chapter.mcqs || [];

  useEffect(() => {
    setDisplayCount(10);
  }, [selectedTopic, selectedBoard, selectedInstitution, selectedYear]);

  // Extract unique filter options
  const allTopics = useMemo(() => [...new Set(mcqs.map(mcq => mcq.topic || "অন্যান্য"))], [mcqs]);
  const allBoards = useMemo(() => [...new Set(mcqs.flatMap(mcq => mcq.boards?.map(b => b.name) || []))], [mcqs]);
  const allInstitutions = useMemo(() => [...new Set(mcqs.flatMap(mcq => mcq.institutions?.map(i => i.name) || []))], [mcqs]);
  const allYears = useMemo(() => [...new Set(mcqs.flatMap(mcq => [
    ...(mcq.boards?.map(b => normalizeYear(b.year)) || []),
    ...(mcq.institutions?.map(i => normalizeYear(i.year)) || [])
  ]))].sort().reverse(), [mcqs]);

  // Apply filters
  const filteredMCQs = useMemo(() => {
    return mcqs.filter(mcq => {
      const topicMatch = selectedTopic === 'all' || (mcq.topic || "অন্যান্য") === selectedTopic;
      const boardMatch = selectedBoard === 'all' || mcq.boards?.some(b => b.name === selectedBoard);
      const instMatch = selectedInstitution === 'all' || mcq.institutions?.some(i => i.name === selectedInstitution);
      const yearMatch = selectedYear === 'all' || 
        mcq.boards?.some(b => normalizeYear(b.year) === selectedYear) || 
        mcq.institutions?.some(i => normalizeYear(i.year) === selectedYear);

      return topicMatch && boardMatch && instMatch && yearMatch;
    });
  }, [mcqs, selectedTopic, selectedBoard, selectedInstitution, selectedYear]);

  const displayedMCQs = useMemo(() => filteredMCQs.slice(0, displayCount), [filteredMCQs, displayCount]);

  const groupedMCQs = useMemo(() => {
    return displayedMCQs.reduce((acc, mcq) => {
      const topic = mcq.topic || "অন্যান্য";
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(mcq);
      return acc;
    }, {});
  }, [displayedMCQs]);

  return (
    <div className="space-y-6">
      {mcqs.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 p-5 sm:p-6 rounded-2xl shadow-xl shadow-slate-900/20">
          <div className="flex items-center gap-2 text-slate-400 mb-4">
            <Filter className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold text-sm uppercase tracking-wider">প্রশ্ন ফিল্টার করুন</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Topic Filter */}
            <FilterSelect
              value={selectedTopic}
              onChange={setSelectedTopic}
              options={[{ value: 'all', label: 'সব টপিক' }, ...allTopics.map(t => ({ value: t, label: t }))]}
            />

            {/* Board Filter */}
            {allBoards.length > 0 && (
              <FilterSelect
                value={selectedBoard}
                onChange={setSelectedBoard}
                options={[{ value: 'all', label: 'সব বোর্ড' }, ...allBoards.map(b => ({ value: b, label: b }))]}
              />
            )}

            {/* Institution Filter */}
            {allInstitutions.length > 0 && (
              <FilterSelect
                value={selectedInstitution}
                onChange={setSelectedInstitution}
                options={[{ value: 'all', label: 'সব স্কুল/কলেজ' }, ...allInstitutions.map(i => ({ value: i, label: i }))]}
              />
            )}

            {/* Year Filter */}
            {allYears.length > 0 && (
              <FilterSelect
                value={selectedYear}
                onChange={setSelectedYear}
                options={[{ value: 'all', label: 'সব সাল' }, ...allYears.map(y => ({ value: y, label: enToBnNumber(y) }))]}
              />
            )}
          </div>
        </div>
      )}

      <div className="space-y-10">
        {filteredMCQs.length > 0 ? (
          Object.entries(groupedMCQs).map(([topic, mcqsList]) => (
            <div key={topic} className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0"></div>
                <h3 className="text-base sm:text-2xl font-bold text-white leading-tight">{topic}</h3>
                <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-md border border-slate-700/50 shrink-0">
                  {mcqsList.length} টি প্রশ্ন
                </span>
              </div>
              <div className="space-y-4">
                {mcqsList.map((mcq, idx) => (
                  <MCQItem 
                    key={mcq.id} 
                    mcq={mcq} 
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          mcqs.length > 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">আপনার ফিল্টার অনুযায়ী কোনো বহুনির্বাচনী প্রশ্ন পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">এই অধ্যায়ের কোনো বহুনির্বাচনী প্রশ্ন পাওয়া যায়নি।</p>
            </div>
          )
        )}
      </div>

      {displayCount < filteredMCQs.length && (
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

export default MCQTabContent;
