// ভর্তি প্রশ্নব্যাংকের ফিল্টার ম্যাচিং — অ্যাডমিন প্যানেল ও ছাত্র দুই পাশেই
// একই নিয়ম যেন চলে, তাই এক জায়গায় রাখা হলো।

/** 'bio-bot-4' ও 'bio-1-4' একই অধ্যায় — তুলনার আগে দুটোকে এক রূপে আনা হয়। */
export const normalizeChapterKey = (id = '') => {
  return String(id || '')
    .toLowerCase()
    .trim()
    .replace('bio-bot-', 'bio-1-')
    .replace('bio-zoo-', 'bio-2-')
    .replace('bio-bot', 'bio-1')
    .replace('bio-zoo', 'bio-2')
    .replace('bot-', 'bio-1-')
    .replace('zoo-', 'bio-2-');
};

// ─── 1st Paper & 2nd Paper Separated Subject Options ─────────────────────────────
export const SUBJECT_OPTIONS = [
  { id: 'biology-1', rawSubject: 'biology', paperName: 'উদ্ভিদবিজ্ঞান', name: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)' },
  { id: 'biology-2', rawSubject: 'biology', paperName: 'প্রাণিবিজ্ঞান', name: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)' },
  { id: 'chemistry-1', rawSubject: 'chemistry', paperName: '১ম পত্র', name: 'রসায়ন ১ম পত্র' },
  { id: 'chemistry-2', rawSubject: 'chemistry', paperName: '২য় পত্র', name: 'রসায়ন ২য় পত্র' },
  { id: 'physics-1', rawSubject: 'physics', paperName: '১ম পত্র', name: 'পদার্থবিজ্ঞান ১ম পত্র' },
  { id: 'physics-2', rawSubject: 'physics', paperName: '২য় পত্র', name: 'পদার্থবিজ্ঞান ২য় পত্র' },
  { id: 'math-1', rawSubject: 'math', paperName: '১ম পত্র', name: 'উচ্চতর গণিত ১ম পত্র' },
  { id: 'math-2', rawSubject: 'math', paperName: '২য় পত্র', name: 'উচ্চতর গণিত ২য় পত্র' },
  { id: 'english', rawSubject: 'english', paperName: 'জেনারেল', name: 'ইংরেজি (English)' },
  { id: 'gk', rawSubject: 'gk', paperName: 'সাধারণ জ্ঞান', name: 'সাধারণ জ্ঞান (General Knowledge)' }
];

// ─── ফিল্টার ম্যাচিং হেল্পার ──────────────────────────────
// আগে এগুলো কম্পোনেন্টের ভেতরে ছিল আর substring মিলিয়ে চলত, ফলে chapterId
// 'chem-1-2' একই সাথে ১ম পত্র (includes('-1')) ও ২য় পত্র (includes('-2')) —
// দুই ফিল্টারেই ধরা পড়ত। এখন প্রশ্নের নিজস্ব ফিল্ড ধাপে ধাপে দেখা হয়:
// subjectOptionId → paper → chapterId।

/**
 * বাংলায় 'য়' দুইভাবে লেখা যায় (একক U+09DF, বা য + ়) — দেখতে এক, কোডে আলাদা।
 * তুলনার আগে দুটোকেই NFD রূপে এনে নেওয়া হয়, নইলে 'রসায়ন' বা '২য় পত্র'
 * ডাটাবেসের লেখার সাথে মিলত না।
 */
export function bnNorm(value) {
  return String(value || '').normalize('NFD').toLowerCase().trim();
}

/** ফিল্টার ও তালিকায় মূল বইয়ের প্রশ্নের যে নামটা দেখানো হয় */
export const MAIN_BOOK_EXAM_TYPE = 'Main Book (বইয়ের অনুশীলনী)';

/**
 * একই জিনিস নানা নামে জমা পড়েছে — 'Textbook', 'Main Book', 'অনুশীলনী'।
 * সবগুলোকেই মূল বই ধরা হয়, তাই ফিল্টারে আর আলাদা হয়ে যায় না।
 */
const MAIN_BOOK_ALIASES = [
  'main book', 'mainbook', 'main_book', 'textbook', 'text book', 'book exercise',
  'মূল বই', 'বইয়ের অনুশীলনী', 'অনুশীলনী', 'পাঠ্যবই', 'বোর্ড বই'
].map(bnNorm);

/** কোনো লেখা (examType/ট্যাগ) মূল বই বোঝাচ্ছে কি না */
export function isMainBookLabel(value) {
  const v = bnNorm(value);
  return Boolean(v) && MAIN_BOOK_ALIASES.some(a => v.includes(a));
}

/** প্রশ্নটা মূল বইয়ের কি না — ফ্ল্যাগ, নাম, ট্যাগ সব মিলিয়ে */
export function isMainBookQuestion(q) {
  if (q.isMainBook || q.category === 'main_book' || q.source === 'main_book') return true;
  if (q.bookName || q.writer || q.author) return true;
  if (isMainBookLabel(q.examType)) return true;
  const tags = Array.isArray(q.examTags) ? q.examTags : [];
  return tags.some(t => isMainBookLabel(typeof t === 'string' ? t : (t?.type || t?.name)));
}

/** তালিকায় দেখানোর জন্য পরীক্ষার ধরনের নাম — মূল বই হলে একটাই নাম */
export function displayExamType(q) {
  if (isMainBookQuestion(q)) return MAIN_BOOK_EXAM_TYPE;
  return q.examType || '';
}

const SUBJECT_OPTION_IDS = new Set(SUBJECT_OPTIONS.map(o => o.id));

const SUBJECT_KEYWORDS = {
  biology: ['bio', 'জীব', 'bot', 'zoo', 'উদ্ভিদ', 'প্রাণি'],
  chemistry: ['chem', 'রসায়ন'],
  physics: ['phy', 'পদার্থ'],
  math: ['math', 'গণিত', 'hm'],
  english: ['eng', 'ইংরেজি'],
  gk: ['gk', 'সাধারণ', 'জ্ঞান', 'general']
};

/** প্রশ্নটি কোন পত্রের — ১ম হলে 1, ২য় হলে 2, বোঝা না গেলে null */
export function detectPaperNo(q) {
  const paper = bnNorm(q.paper || q.paperName);
  if (paper) {
    if (paper.includes(bnNorm('উদ্ভিদ')) || paper.includes('bot')) return 1;
    if (paper.includes(bnNorm('প্রাণি')) || paper.includes('zoo')) return 2;
    if (paper.includes(bnNorm('১ম')) || paper.includes('1st') || paper === '1') return 1;
    if (paper.includes(bnNorm('২য়')) || paper.includes('2nd') || paper === '2') return 2;
  }
  // normalizeChapterKey: bio-bot-4 → bio-1-4, bio-zoo-4 → bio-2-4
  const seg = normalizeChapterKey(String(q.chapterId || '')).split('-')[1];
  if (seg === '1') return 1;
  if (seg === '2') return 2;
  return null;
}

export function isSubjectMatched(q, sel) {
  if (!sel || sel.id === 'all') return true;

  const qSubOpt = String(q.subjectOptionId || '').toLowerCase().trim();
  // আপলোডের সময় subjectOptionId লেখা হয় — থাকলে সেটাই চূড়ান্ত
  if (qSubOpt && SUBJECT_OPTION_IDS.has(qSubOpt)) return qSubOpt === sel.id;

  const qSub = bnNorm(q.subject || q.subjectId || q.subjectName);
  const qChapPrefix = normalizeChapterKey(String(q.chapterId || '')).split('-')[0];
  const haystack = `${qSub} ${qSubOpt} ${qChapPrefix}`;

  const keywords = SUBJECT_KEYWORDS[sel.rawSubject] || [String(sel.rawSubject || '')];
  if (!keywords.some(k => k && haystack.includes(bnNorm(k)))) return false;

  const wantPaper = sel.id.endsWith('-1') ? 1 : (sel.id.endsWith('-2') ? 2 : null);
  if (!wantPaper) return true;

  const gotPaper = detectPaperNo(q);
  // পত্র বোঝা না গেলে প্রশ্নটা লুকিয়ে ফেলার চেয়ে দেখানই নিরাপদ
  return gotPaper === null || gotPaper === wantPaper;
}

export function isChapterMatched(q, chapFilter, chapsList) {
  if (!chapFilter || chapFilter === 'all') return true;

  const selectedChap = (chapsList || []).find(c => c.id === chapFilter);
  const targetId = String(chapFilter).toLowerCase().trim();
  const targetNorm = normalizeChapterKey(targetId);
  const targetName = String(selectedChap?.name || selectedChap?.title || chapFilter).toLowerCase().trim();
  const cleanTitle = (targetName.split(':')[1] || targetName).trim();

  const qChapId = String(q.chapterId || '').toLowerCase().trim();
  const qChapName = String(q.chapter || q.chapterName || '').toLowerCase().trim();

  // প্রশ্নে chapterId থাকলে সেটাই চূড়ান্ত। আগে prefix+suffix মিলিয়ে
  // 'bio-bot-2' ফিল্টারে 'bio-zoo-2' (প্রাণিবিজ্ঞানের) প্রশ্নও ढুকে পড়ত।
  if (qChapId) {
    if (qChapId === targetId || normalizeChapterKey(qChapId) === targetNorm) return true;
    return Boolean(qChapName) && qChapName === targetName;
  }

  // পুরনো ডেটায় chapterId নেই — নাম, টপিক, শেষে প্রশ্নের ভেতরেও খোঁজা হয়
  if (qChapName && (qChapName === targetName || (cleanTitle.length > 2 && qChapName.includes(cleanTitle)))) return true;
  if (cleanTitle.length <= 2) return false;
  return String(q.topic || '').toLowerCase().includes(cleanTitle) ||
    String(q.question || '').toLowerCase().includes(cleanTitle);
}

export function isSessionMatched(q, filterSession) {
  if (!filterSession || filterSession === 'all') return true;
  if (q.year === filterSession) return true;
  const tags = Array.isArray(q.examTags) ? q.examTags : [];
  return tags.some(t => {
    const sess = typeof t === 'string' ? t : t?.session;
    return Boolean(sess) && (sess === filterSession || String(sess).includes(filterSession));
  });
}

export function isSearchMatched(q, cleanSearch) {
  if (!cleanSearch) return true;
  return String(q.question || '').toLowerCase().includes(cleanSearch) ||
    String(q.topic || '').toLowerCase().includes(cleanSearch) ||
    String(q.explanation || '').toLowerCase().includes(cleanSearch) ||
    String(q.chapter || q.chapterName || '').toLowerCase().includes(cleanSearch) ||
    (Array.isArray(q.options) && q.options.some(opt => String(opt).toLowerCase().includes(cleanSearch)));
}

export function isQuestionMatchingExamType(q, filterType) {
  if (!filterType || filterType === 'all') return true;

  const target = String(filterType).toLowerCase().trim();
  const qType = String(q.examType || '').toLowerCase().trim();
  const tags = Array.isArray(q.examTags) ? q.examTags : [];
  const tagTypes = tags.map(t => {
    if (typeof t === 'string') return t.toLowerCase().trim();
    return String(t?.type || t?.name || '').toLowerCase().trim();
  });
  const allExamStrings = [qType, ...tagTypes].filter(Boolean);

  // 1. মূল বই — নাম যা-ই হোক ('Textbook', 'Main Book', 'অনুশীলনী'), সবই এক
  if (isMainBookLabel(filterType)) {
    if (isMainBookQuestion(q)) return true;
    // পুরনো ডেটায় লেখকের নাম দিয়েই বোঝানো হতো
    const writerHints = ['হাসান', 'আজমল', 'হাজারী', 'ইসহাক', 'গিয়াস', 'প্রামাণিক'].map(bnNorm);
    const normStrings = allExamStrings.map(bnNorm);
    if (normStrings.some(str => writerHints.some(w => str.includes(w)))) return true;
    const qExp = bnNorm(q.explanation);
    return ['রেফারেন্স', 'স্যার', 'অনুশীলনী', 'বই'].map(bnNorm).some(w => qExp.includes(w));
  }

  // 2. Exact match against top-level or any tag
  if (allExamStrings.some(s => s === target)) return true;

  // 3. MBBS / BDS / Medical matching
  if (target === 'mbbs & bds' || target === 'mbbs' || target === 'bds' || target === 'medical' || target === 'মেডিকেল') {
    return allExamStrings.some(s =>
      s.includes('mbbs') || s.includes('bds') || s.includes('mat') || s.includes('dat') || s.includes('medical') || s.includes('dental') || s.includes('মেডিকেল') || s.includes('ডেন্টাল')
    );
  }

  // 4. BUET
  if (target === 'buet' || target === 'বুয়েট') {
    return allExamStrings.some(s => s.includes('buet') || s.includes('বুয়েট') || s.includes('বুয়েট'));
  }

  // 5. CKET / Engineering
  if (target === 'cket' || target === 'engineering' || target === 'ইঞ্জিনিয়ারিং' || target === 'ইঞ্জিনিয়ারিং') {
    return allExamStrings.some(s => s.includes('cket') || s.includes('ruet') || s.includes('kuet') || s.includes('cuet') || s.includes('butex') || s.includes('mist') || s.includes('engineering') || s.includes('ইঞ্জিনিয়ারিং') || s.includes('ইঞ্জিনিয়ারিং'));
  }

  // 6. DU A / DU / Dhaka University
  if (target === 'du a' || target === 'du-a' || target === 'du' || target === 'ঢাবি') {
    return allExamStrings.some(s => s.includes('du') || s.includes('ঢাবি') || s.includes('ঢাকা'));
  }

  // 7. GST / Gucche
  if (target === 'gst' || target === 'গুচ্ছ') {
    return allExamStrings.some(s => s.includes('gst') || s.includes('গুচ্ছ') || s.includes('cluster'));
  }

  // 8. Agri / Agriculture
  if (target === 'agri' || target === 'কৃষি') {
    return allExamStrings.some(s => s.includes('agri') || s.includes('কৃষি') || s.includes('bau') || s.includes('bsmrau'));
  }

  // 9. Nursing
  if (target === 'nursing' || target === 'নার্সিং') {
    return allExamStrings.some(s => s.includes('nursing') || s.includes('নার্সিং') || s.includes('bsc') || s.includes('diploma') || s.includes('midwifery'));
  }

  // 10. Varsity
  if (target === 'varsity' || target === 'ভার্সিটি') {
    return allExamStrings.some(s => s.includes('varsity') || s.includes('ভার্সিটি') || s.includes('ru') || s.includes('cu') || s.includes('ju') || s.includes('sust'));
  }

  // 11. Generic fallback substring match
  return allExamStrings.some(s => s.includes(target) || target.includes(s));
}
