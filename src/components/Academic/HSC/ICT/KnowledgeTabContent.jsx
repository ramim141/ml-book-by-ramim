import { useState, memo } from 'react';
import { BookOpen, ChevronDown, ChevronUp, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

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
    <div className="overflow-hidden transition-all duration-300 border bg-slate-800/20 border-slate-700/50 rounded-2xl hover:border-slate-600/50 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

export default function KnowledgeTabContent({ chapter }) {
  const kQs = chapter?.kQs || [];
  const [displayCount, setDisplayCount] = useState(10);

  if (kQs.length === 0) {
    return (
      <div className="text-center py-20 border border-slate-700/30 rounded-3xl bg-slate-800/10">
        <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400 font-semibold">এই অধ্যায়ের জ্ঞান ও অনুধাবনমূলক প্রশ্ন পাওয়া যায়নি</p>
        <p className="text-slate-500 text-xs mt-1">শীঘ্রই আপডেট করা হবে</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col">
        {kQs.slice(0, displayCount).map((kq, idx) => (
          <KQAccordion key={`${kq.id || idx}`} kq={kq} />
        ))}
      </div>
      
      {displayCount < kQs.length && (
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
}
