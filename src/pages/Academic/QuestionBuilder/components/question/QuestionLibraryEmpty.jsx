import React from 'react';
import { BookOpen, Layers, SearchX, SlidersHorizontal } from 'lucide-react';

/**
 * খালি অবস্থার কারণ অনুযায়ী আলাদা বার্তা — আগে সব ক্ষেত্রেই
 * "প্রশ্ন পাওয়া যায়নি" দেখাত, যদিও আসল কারণ ছিল বিষয় বাছাই না করা।
 */
const VARIANTS = {
  subject: {
    icon: BookOpen,
    title: 'প্রথমে একটি বিষয় বেছে নিন',
    hint: 'বাম পাশের ফিল্টার থেকে বিষয় নির্বাচন করলে অধ্যায়গুলো দেখা যাবে।',
    action: 'বিষয় বাছাই করুন',
  },
  chapter: {
    icon: Layers,
    title: 'অধ্যায় নির্বাচন করুন',
    hint: 'এক বা একাধিক অধ্যায় বাছাই করলে সেগুলোর প্রশ্ন এখানে আসবে।',
    action: 'অধ্যায় বাছাই করুন',
  },
  empty: {
    icon: SearchX,
    title: 'এই ফিল্টারে কোনো প্রশ্ন নেই',
    hint: 'সার্চ শব্দ বা প্রশ্নের ধরন বদলে আবার দেখুন।',
    action: 'ফিল্টার বদলান',
  },
};

const QuestionLibraryEmpty = React.memo(({ reason = 'empty', onAction }) => {
  const variant = VARIANTS[reason] || VARIANTS.empty;
  const Icon = variant.icon;

  return (
    <div className="animate-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-800/60 text-slate-400">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-extrabold text-slate-100">{variant.title}</h3>
      <p className="mt-1.5 max-w-xs text-xs font-medium leading-relaxed text-slate-500">{variant.hint}</p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="qb-empty-action mt-4 items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-4 py-2 text-xs font-extrabold text-indigo-200 transition hover:bg-indigo-500/25 active:scale-95"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {variant.action}
        </button>
      )}
    </div>
  );
});

QuestionLibraryEmpty.displayName = 'QuestionLibraryEmpty';

export default QuestionLibraryEmpty;
