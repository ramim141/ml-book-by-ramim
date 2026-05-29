import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Database, Layers, Play } from 'lucide-react';
import { getAllWords, bookStructure } from '../../data/wordsIndex';

function StatBox({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-100">{value}</p>
    </div>
  );
}

function PartPanel({ part }) {
  const [isOpen, setIsOpen] = useState(part.partNo === '০১');

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.01] p-3 transition-colors duration-200">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <ChevronDown 
            size={16} 
            className={`transform transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-180' : ''}`} 
          />
          পর্ব {part.partNo}: {part.partTitle}
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {part.words.length} শব্দ
        </span>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      }`}>
        <div className="overflow-hidden">
          <div className="grid gap-2 pt-3 sm:grid-cols-2">
            {part.words.map((word) => (
              <Link
                key={word.id}
                to={`/word/${word.path}`}
                className="rounded-lg border border-white/10 bg-[#070b12] px-4 py-3 text-sm font-medium leading-relaxed text-slate-300 transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-slate-100"
              >
                {word.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterPanel({ chapter }) {
  const [isOpen, setIsOpen] = useState(chapter.chapterNo === '০১');
  const words = chapter.parts.flatMap((part) => part.words);
  const firstWordPath = words[0]?.path;

  return (
    <section className="rounded-xl border border-white/10 bg-[#0b111b] p-5">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between cursor-pointer select-none border-b transition-all duration-300 ${
          isOpen ? 'border-white/10 pb-4' : 'border-transparent pb-0'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 text-slate-400 shrink-0">
            <ChevronDown 
              size={20} 
              className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              অধ্যায় {chapter.chapterNo}
            </p>
            <h2 className="mt-1 text-xl font-bold leading-snug text-slate-100">
              {chapter.chapterTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {chapter.parts.length} পর্ব · {words.length} শব্দ
            </p>
          </div>
        </div>

        <Link
          to={firstWordPath ? `/word/${firstWordPath}` : '/start'}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.07] self-start sm:self-auto"
        >
          শুরু করুন
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      }`}>
        <div className="overflow-hidden space-y-4">
          {chapter.parts.map((part) => (
            <PartPanel key={part.partId} part={part} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const allWords = getAllWords();
  const totalParts = bookStructure.reduce((count, chapter) => count + chapter.parts.length, 0);
  const firstWordPath = bookStructure[0]?.parts[0]?.words[0]?.path;

  return (
    <div className="h-screen flex-1 overflow-y-auto bg-[#070b12] p-4 font-sans text-slate-200 custom-scrollbar sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl border border-white/10 bg-[#0b111b] p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                <BookOpen size={15} />
                বইয়ের ড্যাশবোর্ড
              </div>
              <h1 className="text-3xl font-bold leading-tight text-slate-100 sm:text-4xl">
                শব্দে শব্দে মেশিন লার্নিং
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                এখানে বইয়ের অধ্যায়, পর্ব এবং শব্দগুলো এক জায়গায় সাজানো আছে। শান্তভাবে পড়ুন,
                প্রয়োজন হলে পাশের সাইডবার থেকে অন্য lesson খুলুন।
              </p>
            </div>

            <Link
              to={firstWordPath ? `/word/${firstWordPath}` : '/start'}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f3a46] px-5 py-3 text-sm font-bold text-slate-100 transition-colors hover:bg-[#294957]"
            >
              <Play size={16} className="fill-current" />
              পড়া শুরু করুন
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatBox label="অধ্যায়" value={bookStructure.length} />
          <StatBox label="পর্ব" value={totalParts} />
          <StatBox label="শব্দ" value={allWords.length} />
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">সূচিপত্র</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-100">অধ্যায়গুলো</h2>
            </div>
          </div>

          <div className="space-y-5">
            {bookStructure.map((chapter) => (
              <ChapterPanel key={chapter.chapterId} chapter={chapter} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 pb-8 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-white/10 bg-[#0b111b] p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Layers size={17} className="text-slate-400" />
              পড়ার সহজ নিয়ম
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              {[
                'প্রথমে গল্প/ব্যাখ্যা পড়ুন',
                'তারপর লগবুকের পয়েন্টগুলো দেখুন',
                'শেষে ল্যাব থাকলে নিজে পরীক্ষা করুন',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-slate-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0b111b] p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Database size={17} className="text-slate-400" />
              বর্তমান বইয়ের ফোকাস
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              AI/ML-এর গুরুত্বপূর্ণ শব্দগুলো বাংলায় পরিষ্কার করা। এই dashboard শুধু পথ দেখাবে,
              মূল শেখা হবে প্রতিটি lesson-এর ভিতরে।
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
