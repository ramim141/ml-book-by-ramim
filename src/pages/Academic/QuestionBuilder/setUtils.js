/**
 * কার্ট শাফলিং ও অটো-জেনারেশনের জন্য সাধারণ, React/Firebase-নিরপেক্ষ ফাংশন।
 * AutoPickDialog আগে নিজের ভেতরেই Fisher–Yates লিখত — এখন এখান থেকেই ব্যবহার
 * করে, যাতে "একাধিক সেট" ফিচারও একই র‍্যান্ডমাইজেশন লজিক শেয়ার করতে পারে।
 */

/** Fisher–Yates শাফল — মূল অ্যারে বদলায় না, নতুন অ্যারে ফেরত দেয়। */
export function shuffleArray(arr) {
  const bag = [...arr];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

const EDITABLE_FIELDS = ['question', 'stem', 'q_ka', 'q_kha', 'q_ga', 'q_gha', 'opt_0', 'opt_1', 'opt_2', 'opt_3'];

/**
 * প্রিভিউতে করা ইনলাইন এডিট (edits[uniqueId].field) কার্টের প্রশ্নগুলোর
 * ভেতরে সরাসরি বসিয়ে দেয় — শাফল করার আগেই। কারণ edits পজিশনভিত্তিক
 * (যেমন opt_2 মানে "options[2]-এর লেখা"); অপশন শাফল করার পর সেই পজিশন
 * আর একই অপশনকে নির্দেশ করবে না, তাই শাফলের আগেই এডিট পাকাপাকি করে নিতে হয়।
 */
export function materializeEdits(cart, edits = {}) {
  return cart.map((q) => {
    const uid = q.uniqueId || q.id;
    const fieldEdits = edits[uid];
    if (!fieldEdits) return q;

    const next = { ...q };
    let touched = false;

    EDITABLE_FIELDS.forEach((field) => {
      const value = fieldEdits[field];
      if (value === undefined) return;
      touched = true;
      if (field === 'question' || field === 'stem') {
        next[field] = value;
      } else if (field.startsWith('q_')) {
        const key = field.slice(2);
        next.questions = { ...(next.questions || {}), [key]: value };
      } else if (field.startsWith('opt_')) {
        const idx = Number(field.slice(4));
        const options = Array.isArray(next.options) ? [...next.options] : [];
        options[idx] = value;
        next.options = options;
      }
    });

    return touched ? next : q;
  });
}

/**
 * একটি MCQ-এর অপশনগুলো শাফল করে সঠিক উত্তরের ইনডেক্স ঠিক জায়গায় নতুন করে বসায়,
 * যাতে অপশনের ক্রম বদলালেও "সঠিক উত্তর" প্রশ্নের সাথে লেগে থাকে (টেক্সট না)।
 */
export function shuffleMcqOptions(question) {
  const options = Array.isArray(question.options) ? question.options : [];
  if (options.length < 2) return question;

  const answerIdx = typeof question.answer === 'string' ? Number(question.answer) : question.answer;
  const order = shuffleArray(options.map((_, i) => i));
  const shuffledOptions = order.map((i) => options[i]);
  const newAnswerIdx = Number.isFinite(answerIdx) ? order.indexOf(answerIdx) : answerIdx;

  return {
    ...question,
    options: shuffledOptions,
    answer: newAnswerIdx,
  };
}

/**
 * একটি প্রশ্নপত্রের একটি "সেট" (A/B/C...) তৈরি করে — MCQ-এর ক্রম ও প্রতিটি
 * MCQ-এর অপশনের ক্রম শাফল করে, কিন্তু সৃজনশীল/জ্ঞান-অনুধাবনের ক্রম অপরিবর্তিত
 * রাখে (v1-এ শুধু MCQ শাফল যথেষ্ট — পরীক্ষার হলে নকল ঠেকানোর মূল দরকারটা এখানেই)।
 */
export function shuffleSetVariant(cart) {
  const mcqs = shuffleArray(cart.filter((q) => q.type === 'mcq').map(shuffleMcqOptions));
  let mcqPtr = 0;
  return cart.map((q) => (q.type === 'mcq' ? mcqs[mcqPtr++] : q));
}
