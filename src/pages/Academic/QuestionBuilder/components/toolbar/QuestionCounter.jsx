import React from 'react';
import { enToBn } from '../../helpers.jsx';

const QuestionCounter = React.memo(({ total = 0, filtered = false }) => (
  <div className="min-w-0">
    <div className="flex items-center gap-2">
      {filtered && (
        <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-[10px] font-extrabold tracking-wide text-indigo-300">
          ফিল্টারড
        </span>
      )}
      <p className="truncate text-base font-extrabold tracking-tight text-slate-100 sm:text-lg">
        {enToBn(total)} টি প্রশ্ন
      </p>
    </div>
  </div>
));

QuestionCounter.displayName = 'QuestionCounter';

export default QuestionCounter;
