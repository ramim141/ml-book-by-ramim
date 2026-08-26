import React, { useState } from 'react';
import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { enToBn, MarkdownRenderer, cleanPrefix } from '../../helpers.jsx';
import { getQuestionTypeMeta } from './QuestionCardParts.jsx';
import { optionsOf } from '../../../../../lib/questionUtils';

const CQ_PARTS = [
  { key: 'ka', label: '(ক)' },
  { key: 'kha', label: '(খ)' },
  { key: 'ga', label: '(গ)' },
  { key: 'gha', label: '(ঘ)' },
];

const ProfessionalQuestionCard = React.memo(({ q, isAdded, onAdd, onRemove, mark, usageIndex, onCompleteCq }) => {
  // CQ-এর উদ্দীপক প্রায়ই লম্বা — সব প্রশ্নের জন্য সবসময় পুরোটা দেখালে তালিকা
  // অনেক ভারী হয়ে যায়, তাই সংক্ষিপ্ত প্রিভিউ + ইচ্ছেমতো "সম্পূর্ণ দেখুন" টগল
  const [expanded, setExpanded] = useState(false);
  const typeMeta = getQuestionTypeMeta(q.type);
  const imageSrc = q.imageUrl || q.image || q.image_url;

  const heading = q.type === 'cq'
    ? (q.title || 'সৃজনশীল প্রশ্ন')
    : (q.question || q.title || '');

  const boards = [
    ...(Array.isArray(q.boards)
      ? q.boards.map((b) =>
          typeof b === 'object' && b !== null
            ? `${b.name || b.type || ''}${b.year || b.session ? ` ${b.year || b.session}` : ''}`.trim()
            : String(b).trim()
        )
      : []),
    ...(Array.isArray(q.board) && !Array.isArray(q.boards)
      ? q.board.map((b) =>
          typeof b === 'object' && b !== null
            ? `${b.name || b.type || ''}${b.year || b.session ? ` ${b.year || b.session}` : ''}`.trim()
            : String(b).trim()
        )
      : []),
  ].filter((str) => Boolean(str) && str !== '[object Object]');

  const toggleSelect = () => (isAdded ? onRemove(q.uniqueId) : onAdd(q));
  const usedIn = usageIndex?.get(q.uniqueId);

  // চ্যাপ্টার/টপিক/বোর্ড আলাদা আলাদা বর্ডার-বক্সে না দেখিয়ে একটাই হালকা লাইনে —
  // আগে প্রতিটা কার্ডে ৪-৫টা বর্ডারযুক্ত ব্যাজ থাকায় পুরো লিস্টটা ভারী দেখাত
  const metaBits = [q.chapterName, q.topic, boards.length > 0 ? boards.slice(0, 2).join(', ') : null].filter(Boolean);

  const isMissingKaKha = q.type === 'cq' && (!q.questions?.ka?.trim() || !q.questions?.kha?.trim());

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={isAdded}
      onClick={toggleSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSelect(); }
      }}
      className={`qb-card group flex cursor-pointer items-start gap-3 rounded-xl p-3.5 sm:p-4 ${
        isAdded ? 'bg-violet-500/[0.07] ring-1 ring-inset ring-violet-500/40' : 'hover:bg-white/[0.03]'
      }`}
    >
      {/* Checkbox */}
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
          isAdded
            ? 'border-violet-500 bg-violet-600 text-white'
            : 'border-slate-600 text-transparent group-hover:border-violet-400/60'
        }`}
      >
        <Check className="h-3 w-3 stroke-[3.5]" />
      </span>

      <div className="min-w-0 flex-1">
        {/* Metadata — একটাই হালকা লাইন, বক্স/বর্ডার ছাড়া */}
        <div className="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10.5px] font-semibold text-slate-500">
          <span className={`font-bold ${typeMeta.textClassName}`}>{typeMeta.label}</span>
          {metaBits.map((bit, i) => (
            <React.Fragment key={i}>
              <span className="text-slate-700">·</span>
              <span className="truncate">{bit}</span>
            </React.Fragment>
          ))}

          {q.type === 'cq' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCompleteCq?.(q);
              }}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-extrabold transition active:scale-95 ${
                isMissingKaKha
                  ? 'border border-amber-500/35 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 shadow-sm'
                  : 'border border-violet-500/25 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20'
              }`}
              title={isMissingKaKha ? 'ক ও খ প্রশ্ন যুক্ত করে পূর্ণ CQ তৈরি করুন' : 'ক ও খ এডিট বা পরিবর্তন করুন'}
            >
              <Sparkles className={`h-3 w-3 ${isMissingKaKha ? 'text-amber-400' : 'text-violet-400'}`} />
              {isMissingKaKha ? 'ক, খ যোগ করুন (পূর্ণ CQ)' : 'ক/খ কাস্টমাইজ'}
            </button>
          )}
        </div>

        {/* Question Text */}
        <div className="qb-clamp-2 text-xs sm:text-sm font-semibold leading-relaxed text-slate-100">
          <MarkdownRenderer content={heading} />
        </div>

        {/* CQ উদ্দীপক (Stem) — সংক্ষিপ্তে সবসময় দেখা যায়, "সম্পূর্ণ দেখুন" চাপলে পুরোটা */}
        {q.type === 'cq' && q.stem && (
          expanded ? (
            <div className="mt-1.5 space-y-2 text-[13px] leading-relaxed text-slate-300">
              {imageSrc && (
                <img src={imageSrc} alt="Question figure" loading="lazy" className="max-h-52 rounded-lg object-contain" />
              )}
              <MarkdownRenderer content={q.stem} className="prose-p:my-1.5 text-slate-300 text-[13px]" />
            </div>
          ) : (
            <div className="qb-clamp-2 mt-1 text-[13px] text-slate-300">
              <MarkdownRenderer content={q.stem} className="prose-p:my-0 text-slate-300 text-[13px]" />
            </div>
          )
        )}

        {/* CQ উপ-প্রশ্ন (ক/খ/গ/ঘ) — সংক্ষিপ্ত অবস্থাতেও দেখা যায়, expand করলে পুরো লেখা */}
        {q.type === 'cq' && q.questions && (
          <div className="mt-1.5 space-y-1">
            {CQ_PARTS.map(({ key, label }) => {
              const text = q.questions[key];
              if (!text?.trim()) return null;
              return (
                <div key={key} className="flex gap-1.5">
                  <span className="shrink-0 text-[13px] font-bold text-slate-500">{label}</span>
                  <div className={`min-w-0 flex-1 text-[13px] text-slate-300 ${expanded ? '' : 'qb-clamp-2'}`}>
                    <MarkdownRenderer content={cleanPrefix(text)} className="prose-p:my-0 text-slate-300 text-[13px]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MCQ Options — সবসময় দেখা যায়, ক্লিক করে খুলতে হয় না */}
        {q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 && (
          <div className="mt-1.5 grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2">
            {optionsOf(q).map((opt, idx) => (
              <div key={idx} className="flex gap-1.5">
                <span className="shrink-0 text-[11.5px] font-bold text-slate-600">
                  {['ক', 'খ', 'গ', 'ঘ'][idx] || idx + 1}.
                </span>
                <div className="qb-clamp-2 min-w-0 flex-1 text-[11.5px] text-slate-400">
                  <MarkdownRenderer content={opt} className="prose-p:my-0 text-slate-400 text-[11.5px]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {usedIn?.length > 0 && (
          <p
            title={usedIn.map((u) => u.paperName).join(', ')}
            className="mt-1 truncate text-[10.5px] font-semibold text-amber-400"
          >
            ইতিমধ্যে &apos;{usedIn[0].paperName}&apos;-এ ব্যবহৃত{usedIn.length > 1 ? ` +${usedIn.length - 1}` : ''}
          </p>
        )}
      </div>

      {/* Mark + (শুধু CQ-এর জন্য) সম্পূর্ণ দেখার টগল */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {mark ? (
          <span className="text-[11px] font-black tabular-nums text-emerald-300">
            {enToBn(mark)} নম্বর
          </span>
        ) : null}
        {q.type === 'cq' && (q.stem || q.questions) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            aria-expanded={expanded}
            aria-label={expanded ? 'সংক্ষিপ্ত করুন' : 'সম্পূর্ণ দেখুন'}
            title={expanded ? 'সংক্ষিপ্ত করুন' : 'সম্পূর্ণ দেখুন'}
            className="rounded-md p-1 text-slate-500 transition-colors duration-150 hover:bg-white/10 hover:text-slate-300"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180 text-violet-400' : ''}`} />
          </button>
        )}
      </div>
    </article>
  );
});

ProfessionalQuestionCard.displayName = 'ProfessionalQuestionCard';

export default ProfessionalQuestionCard;
