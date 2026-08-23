/**
 * ক্যাশ নীতির কেন্দ্রীয় জায়গা।
 *
 * ডেটা কত ঘন ঘন বদলায় তার উপর ভিত্তি করে staleTime আলাদা রাখা হয় —
 * সব কিছুর জন্য একই সময় দিলে হয় বাসি ডেটা দেখায়, নয়তো অপ্রয়োজনে বারবার পড়ে।
 */
const MINUTE = 1000 * 60;

export const STALE = {
  /** অ্যাডমিন কনফিগ — বিষয়ের তালিকা, অধ্যায়, ফর্মুলা। দিনে দু-একবারও বদলায় না। */
  CONFIG: 60 * MINUTE,

  /** প্রশ্ন ও পাঠ্য বিষয়বস্তু — মাঝে মাঝে যোগ হয়। */
  CONTENT: 30 * MINUTE,

  /** গণনা/পরিসংখ্যান — সঠিক হওয়ার চেয়ে দ্রুত হওয়া বেশি জরুরি। */
  STATS: 60 * MINUTE,

  /** চলমান জিনিস — লাইভ এক্সামের তালিকা, লিডারবোর্ড। */
  LIVE: 1 * MINUTE,
};

export const QK = {
  subjects: () => ['academic', 'subjects'],
  academicStats: () => ['academic', 'stats'],
  liveExams: () => ['academic', 'live-exams'],
  formulas: (subjectId) => ['academic', 'formulas', subjectId ?? 'all'],
  knowledgeQuestions: (subjectId, chapterId) => ['academic', 'k-questions', subjectId ?? 'all', chapterId ?? 'all'],
};
