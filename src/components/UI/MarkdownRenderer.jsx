import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;
  return (
    <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto w-full pb-4 block my-4">
              <table className="min-w-max w-full border-collapse border border-slate-700" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-slate-700 bg-slate-800/50 px-4 py-2 font-bold text-slate-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-slate-700 px-4 py-2 text-slate-300" {...props} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  );
};

export default MarkdownRenderer;
