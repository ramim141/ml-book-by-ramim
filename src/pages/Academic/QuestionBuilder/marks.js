/**
 * নম্বর হিসাবের একমাত্র উৎস।
 *
 * আগে তিন জায়গায় তিন রকম হিসাব ছিল — সাইডবারে হার্ডকোড করা markByType,
 * প্রিন্ট কপিতে সৃজনশীলের ১/২/৩/৪ আলাদাভাবে লেখা, আর হেডারের "পূর্ণমান"
 * একটা ফ্রি-টেক্সট ফিল্ড যেটা কার্টের সাথে কোনোভাবেই মিলত না। ফলে শিক্ষক
 * সাইডবারে "নম্বর ৪৭" দেখে প্রিন্ট করলে কাগজে "পূর্ণমান: ১০০" ছাপা হতো।
 */

/** বোর্ডের প্রচলিত বণ্টন — সৃজনশীল ক/খ/গ/ঘ = ১+২+৩+৪ = ১০ */
export const CQ_PART_MARKS = { ka: 1, kha: 2, ga: 3, gha: 4 };

export const DEFAULT_MARKS = {
  mcq: 1,
  k: 1,
  kh: 2,
  cq: 10,
  short: 2,
};

export const TYPE_LABELS = {
  cq: 'সৃজনশীল',
  mcq: 'বহুনির্বাচনি',
  k: 'জ্ঞানমূলক',
  kh: 'অনুধাবনমূলক',
  short: 'সংক্ষিপ্ত',
};

/** প্রশ্নে নিজস্ব marks বসানো থাকলে সেটাই আগে, না হলে ধরন অনুযায়ী ডিফল্ট। */
export const markOf = (q, marksConfig = DEFAULT_MARKS) => {
  const own = Number(q.marks ?? q.mark);
  if (Number.isFinite(own) && own > 0) return own;
  return Number(marksConfig[q.type] ?? DEFAULT_MARKS[q.type] ?? 1);
};

/**
 * কার্টের পূর্ণ পরিসংখ্যান — সংখ্যা, নম্বর, ধরনভিত্তিক ভাগ, অধ্যায়/টপিক কাভারেজ।
 * সাইডবার, হেডার আর প্রিন্ট — তিন জায়গাতেই এই একটাই ফল ব্যবহার হয়।
 */
export function summarizeCart(cart, marksConfig = DEFAULT_MARKS) {
  const byType = {};
  const chapters = new Set();
  const topics = new Set();
  let totalMarks = 0;

  cart.forEach((q) => {
    const mark = markOf(q, marksConfig);
    totalMarks += mark;

    if (!byType[q.type]) byType[q.type] = { count: 0, marks: 0 };
    byType[q.type].count += 1;
    byType[q.type].marks += mark;

    if (q.chapterId || q.chapterName) chapters.add(q.chapterId || q.chapterName);
    if (q.topic) topics.add(q.topic);
  });

  return {
    totalQuestions: cart.length,
    totalMarks,
    byType,
    uniqueChapters: chapters.size,
    uniqueTopics: topics.size,
  };
}
