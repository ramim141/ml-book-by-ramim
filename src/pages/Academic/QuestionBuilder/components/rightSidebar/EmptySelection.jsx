import React from 'react';
import { BookOpenCheck } from 'lucide-react';

const EmptySelection = React.memo(({ onBrowse }) => (
  <section className="animate-[fade-up_200ms_ease-out] rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 text-center transition duration-150">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500">
      <BookOpenCheck className="h-8 w-8" />
    </div>
    <h2 className="mt-4 text-sm font-extrabold text-slate-100">এখনো প্রশ্ন যোগ করা হয়নি</h2>
    <p className="mx-auto mt-2 max-w-[220px] text-xs font-semibold leading-relaxed text-slate-500">
      বাম পাশ থেকে বিষয় ও অধ্যায় বেছে মাঝের তালিকা থেকে প্রশ্ন যোগ করুন।
    </p>
    <button
      type="button"
      onClick={onBrowse}
      title="Browse questions"
      aria-label="Browse questions"
      className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 px-4 py-2 text-sm font-extrabold text-indigo-100 transition duration-150 hover:bg-indigo-500/30 focus:outline-none "
    >
      প্রশ্ন দেখুন
    </button>
  </section>
));

EmptySelection.displayName = 'EmptySelection';

export default EmptySelection;
