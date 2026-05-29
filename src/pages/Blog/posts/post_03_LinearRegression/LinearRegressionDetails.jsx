import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Settings, CheckCircle, AlertTriangle, 
  Zap, Code, ChevronRight, ChevronLeft, Info, Terminal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { allBlogs } from '../../../../data/blogIndex';
import BlogHeader from '../../../../components/BlogUI/BlogHeader';
import BlogAuthor from '../../../../components/BlogUI/BlogAuthor';
import blogData from './linear_regression.json';
// --- Reusable Content Renderers ---
const SubHeading = ({ children }) => (
  <h3 className="text-xl font-bold text-[#00daf3] mt-10 mb-4 flex items-center gap-2">
    <span className="w-1.5 h-6 bg-[#00daf3] rounded-full"></span>
    {children}
  </h3>
);

const CodeBlock = ({ code, language }) => (
  <div className="my-6 rounded-2xl overflow-hidden bg-[#070b13] border border-white/5 shadow-2xl">
    <div className="flex items-center justify-between px-4 py-2 bg-[#121622] border-b border-white/5">
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
      </div>
      <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{language}</span>
    </div>
    <div className="p-5 overflow-x-auto custom-scrollbar">
      <pre className="font-mono text-sm leading-relaxed whitespace-pre text-sky-200">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

const AsciiArt = ({ art }) => (
  <div className="my-6 p-6 bg-[#0b0f19] border border-white/5 rounded-2xl overflow-x-auto shadow-inner">
    <pre className="font-mono text-xs leading-relaxed whitespace-pre md:text-sm text-emerald-400">
      {art}
    </pre>
  </div>
);

const InfoBox = ({ title, children }) => (
  <div className="flex gap-4 p-5 my-6 border shadow-lg rounded-2xl bg-sky-500/10 border-sky-500/20 text-sky-200">
    <div className="flex-shrink-0"><Info className="w-5 h-5 text-sky-400 mt-0.5" /></div>
    <div>
      <h4 className="mb-1 font-bold">{title}</h4>
      <div className="text-sm leading-relaxed whitespace-pre-line md:text-base opacity-90">{children}</div>
    </div>
  </div>
);

// --- Dynamic Block Renderer ---
const renderBlock = (section, idx) => {
  return (
    <div key={idx}>
      {section.title && <SubHeading>{section.title}</SubHeading>}
      
      {section.type === 'text' && (
        <p className="leading-relaxed whitespace-pre-line text-slate-300">{section.content}</p>
      )}
      
      {section.type === 'infobox' && (
        <InfoBox title={section.title}>{section.content}</InfoBox>
      )}
      
      {section.type === 'ascii' && (
        <AsciiArt art={section.content} />
      )}
      
      {section.type === 'code' && (
        <CodeBlock language={section.language} code={section.content} />
      )}
    </div>
  );
};

export default function LinearRegressionDetails() {
  const [activePhase, setActivePhase] = useState(0);

  // আইকনগুলো ডাইনামিক করতে একটি ম্যাপ তৈরি করা হলো
  const phaseIcons = [
    <BookOpen size={18} />, 
    <Settings size={18} />, 
    <CheckCircle size={18} />, 
    <AlertTriangle size={18} />, 
    <Zap size={18} />, 
    <Code size={18} />
  ];

  const currentPhaseData = blogData.phases[activePhase];

  const goToPhase = (id) => {
    const el = document.getElementById(`phase-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActivePhase(id);
  };

  return (
    <article className="w-full min-h-screen pb-20 font-sans text-slate-300" data-blog-page>
      {/* Minimalist Header */}
      <BlogHeader
        title={blogData.title}
        category={blogData.category}
        date={blogData.date}
        readTime={blogData.readTime}
        image={blogData.image}
        author={blogData.author}
        titleClassName="text-3xl md:text-4xl lg:text-5xl"
      />

      <div className="relative max-w-5xl px-5 mx-auto">

        {/* Compact Phase Navigation (large screens) */}
        <div className="hidden xl:block absolute right-[-20%] top-24 w-64">
          <div className="sticky top-28 space-y-3">
            {blogData.phases.map((phase, idx) => (
              <button
                key={phase.id}
                onClick={() => goToPhase(phase.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                  activePhase === phase.id ? 'bg-[#5b5dfa]/12 border border-[#5b5dfa]/20 text-[#5b5dfa] font-semibold' : 'text-slate-400 hover:bg-white/3 hover:text-white'
                }`}
              >
                <div className={`${activePhase === phase.id ? 'text-[#00daf3]' : 'text-slate-500'}`}>{phaseIcons[idx]}</div>
                <div className="min-w-0">
                  <span className="block text-sm line-clamp-2">{phase.title}</span>
                  <span className="block text-[11px] text-slate-400 mt-1">{phase.summary || ''}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reading Area (all phases) */}
          <article className="space-y-12 text-lg md:text-xl leading-[1.9] text-slate-300 font-sans">
            {blogData.phases.map((phase) => (
              <section id={`phase-${phase.id}`} key={phase.id} className="space-y-6">
                <SectionTitle>{phase.heading}</SectionTitle>
                <p className="mb-4 text-lg leading-relaxed text-slate-400">{phase.intro}</p>

                <div className="space-y-6">
                  {phase.sections.map((sec, idx) => renderBlock(sec, `${phase.id}-${idx}`))}
                </div>

                {/* Per-phase navigation removed as requested */}
              </section>
            ))}

        </article>

        {/* Comments */}
        <section className="pt-10 mt-16 font-sans border-t border-slate-800">
          <h3 className="mb-6 text-sm font-bold tracking-widest uppercase text-slate-500">মন্তব্য (০)</h3>
          <div className="flex items-start gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0"></div>
            <div className="flex-1">
              <textarea
                placeholder="আপনার মতামত লিখুন..."
                className="w-full bg-transparent border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:border-[#5b5dfa] transition-colors resize-none h-24"
              />
              <div className="flex justify-end mt-2">
                <button className="px-6 py-2 text-xs font-bold text-black transition-colors bg-white rounded-lg hover:bg-slate-200">মন্তব্য করুন</button>
              </div>
            </div>
          </div>
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
                .filter((blog) => blog.category === blogData.category && blog.title !== blogData.title)
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
              {allBlogs.filter((blog) => blog.category === blogData.category && blog.title !== blogData.title).length === 0 && (
                <p className="text-sm text-slate-500 col-span-3">এই ক্যাটাগরিতে আর কোনো আর্টিকেল নেই।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="pb-4 mb-6 text-2xl font-black text-white border-b md:text-3xl border-white/10">
      {children}
    </h2>
  );
}