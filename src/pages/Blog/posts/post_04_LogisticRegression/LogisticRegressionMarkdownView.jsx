import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Link } from 'react-router-dom';
import { allBlogs } from '../../../../data/blogIndex';

import BlogHeader from '../../../../components/BlogUI/BlogHeader';
import BlogAuthor from '../../../../components/BlogUI/BlogAuthor';
import markdownSource from './LogisticRegression.md?raw';

function MarkdownTitle({ children, level = 1 }) {
  const Tag = `h${level}`;
  return (
    <Tag
      className={
        level === 1
          ? 'text-3xl font-black text-white md:text-4xl'
          : level === 2
          ? 'mt-12 text-2xl font-black text-white md:text-3xl'
          : 'mt-8 text-xl font-bold text-white md:text-2xl'
      }
    >
      {children}
    </Tag>
  );
}

function MarkdownBlockquote({ children }) {
  return (
    <blockquote className="my-8 border-l-4 border-[#00daf3] pl-5 text-lg leading-[1.9] text-slate-300 md:text-xl">
      {children}
    </blockquote>
  );
}

// Block code wrapper — handles ```fenced``` blocks
function MarkdownPre({ children }) {
  // Extract language from the nested <code> className
  const codeEl = React.Children.toArray(children).find(
    (c) => c?.props?.className?.startsWith('language-')
  );
  const match = /language-(\w+)/.exec(codeEl?.props?.className || '');
  const lang = match?.[1] || 'code';

  return (
    <pre className="my-6 overflow-x-auto rounded-2xl border border-white/5 bg-[#070b13] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 bg-[#121622] px-4 py-2">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          {lang}
        </span>
      </div>
      <div className="p-5 overflow-x-auto">
        <code className="block font-mono text-sm leading-relaxed text-sky-200">
          {codeEl?.props?.children ?? children}
        </code>
      </div>
    </pre>
  );
}

// Inline code — handles `backtick` spans inside paragraphs
function MarkdownInlineCode({ children }) {
  return (
    <code className="rounded bg-white/5 px-1.5 py-0.5 text-[0.95em] text-[#00daf3]">
      {children}
    </code>
  );
}

export default function LogisticRegressionMarkdownView() {
  const meta = {
    title: 'লজিস্টিক রিগ্রেশন (Logistic Regression): দ্য ক্লাসিফিকেশন মাস্টার',
    category: 'Algorithm',
    date: '১ জুন, ২০২৬',
    readTime: '১২ মিনিট',
    author: 'রামীম আহমেদ',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=1200',
  };

  return (
    <article className="w-full min-h-screen pb-20 font-sans text-slate-300" data-blog-page>
      <BlogHeader
        title={meta.title}
        category={meta.category}
        date={meta.date}
        readTime={meta.readTime}
        image={meta.image}
        author={meta.author}
        titleClassName="text-3xl md:text-4xl lg:text-5xl"
      />

      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <section className="prose prose-invert prose-slate max-w-none mt-2 prose-headings:scroll-mt-28 prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-a:text-[#8c8dff] hover:prose-a:text-[#00daf3] prose-blockquote:border-l-[#00daf3] prose-blockquote:text-slate-300 prose-code:text-[#00daf3] prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => <MarkdownTitle level={1}>{children}</MarkdownTitle>,
              h2: ({ children }) => <MarkdownTitle level={2}>{children}</MarkdownTitle>,
              h3: ({ children }) => <MarkdownTitle level={3}>{children}</MarkdownTitle>,
              blockquote: MarkdownBlockquote,
              pre: MarkdownPre,
              code: MarkdownInlineCode,
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto border rounded-2xl border-slate-800">
                  <table className="w-full text-sm text-left border-collapse md:text-base">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#121826] text-xs uppercase tracking-widest text-slate-500">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 font-bold text-white border-b border-slate-800">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 align-top border-b border-slate-800 text-slate-300">{children}</td>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="my-6 border rounded-2xl border-white/5" />
              ),
              hr: () => <hr className="my-12 border-slate-800" />,
              ul: ({ children }) => <ul className="pl-6 my-4 space-y-2 list-disc text-justify">{children}</ul>,
              ol: ({ children }) => <ol className="pl-6 my-4 space-y-2 list-decimal text-justify">{children}</ol>,
              p: ({ children }) => <p className="mb-4 leading-[1.9] text-slate-300 text-justify">{children}</p>,
            }}
          >
            {markdownSource}
          </ReactMarkdown>
        </section>

        {/* Recommended / Read Next */}
        <div className="py-16 mt-20 font-sans border-t border-slate-800">
          <div className="px-5 mx-auto max-w-7xl md:px-12">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="mb-2 text-xs font-bold tracking-widest uppercase text-slate-500">পড়া চালিয়ে যান</p>
                <h3 className="text-2xl font-bold text-white md:text-3xl">আপনি এগুলোও পছন্দ করতে পারেন</h3>
              </div>
              <Link to="/blog" className="text-sm font-bold text-[#5b5dfa] border-b border-[#5b5dfa] pb-1 hidden sm:block">সব আর্টিকেল দেখুন</Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {allBlogs
                .filter((blog) => blog.category === meta.category && blog.title !== meta.title)
                .slice(0, 3)
                .map((post) => (
                  <Link to={`/blog/${post.slug}`} key={post.id} className="cursor-pointer group block">
                    <div className="w-full h-48 mb-4 overflow-hidden border rounded-2xl border-slate-800">
                      <img src={post.image} alt={post.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="text-xs text-[#00daf3] font-bold uppercase tracking-widest mb-2">{post.category}</p>
                    <h4 className="text-lg font-bold text-white group-hover:text-[#5b5dfa] transition-colors line-clamp-2 leading-snug mb-2">
                      {post.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt}</p>
                  </Link>
                ))}
              {allBlogs.filter((blog) => blog.category === meta.category && blog.title !== meta.title).length === 0 && (
                <p className="text-sm text-slate-500 col-span-3">এই ক্যাটাগরিতে আর কোনো আর্টিকেল নেই।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
