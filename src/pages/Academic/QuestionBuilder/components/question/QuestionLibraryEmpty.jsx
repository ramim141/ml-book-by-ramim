import React from 'react';
import { Search } from 'lucide-react';

const QuestionLibraryEmpty = React.memo(() => (
  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-12 text-center">
    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-700/70 bg-slate-800/60 text-slate-400">
      <Search className="h-9 w-9" />
    </div>
    <h3 className="text-lg font-extrabold text-slate-100">প্রশ্ন পাওয়া যায়নি</h3>
    <p className="mt-2 max-w-sm text-sm font-medium text-slate-400">বিষয়, অধ্যায় বা প্রশ্নের ধরন পরিবর্তন করে আবার দেখুন।</p>
  </div>
));

export default QuestionLibraryEmpty;
