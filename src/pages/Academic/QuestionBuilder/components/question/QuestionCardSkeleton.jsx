import React from 'react';

/** আসল ProfessionalQuestionCard এখন ফ্ল্যাট (বর্ডার/বক্স ছাড়া) — স্কেলিটনও
 * তার সাথে মিলিয়ে রাখা, না হলে লোড হওয়ার মুহূর্তে হঠাৎ ডিজাইন বদলে যেত */
const QuestionCardSkeleton = React.memo(() => (
  <div className="flex animate-pulse items-start gap-3 rounded-xl p-3.5 sm:p-4">
    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-md bg-white/[0.06]" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-2.5 w-28 rounded bg-white/[0.06]" />
      <div className="h-4 w-full rounded bg-white/[0.06]" />
      <div className="h-4 w-8/12 rounded bg-white/[0.06]" />
    </div>
    <div className="mt-0.5 h-3.5 w-10 shrink-0 rounded bg-white/[0.06]" />
  </div>
));

export default QuestionCardSkeleton;
