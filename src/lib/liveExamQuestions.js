/**
 * লাইভ এক্সামের কাস্টম প্রশ্ন — JSON দিয়ে সরাসরি দেওয়ার সুবিধা।
 *
 * প্রশ্নব্যাংকে নেই এমন প্রশ্ন দিয়েও পরীক্ষা নেওয়া যায়। ফরম্যাটটা ঠিক সেই
 * আকৃতিরই যা LiveExamEngine ও recordExamProgress আশা করে — `answer` হলো
 * options অ্যারের ইনডেক্স (০ = প্রথম অপশন)।
 */

/** অ্যাডমিন যেটা কপি করে শুরু করবেন */
export const QUESTION_TEMPLATE = JSON.stringify(
  [
    {
      question: 'বাংলাদেশের প্রথম কম্পিউটারের নাম কী?',
      options: ['IBM 1620', 'UNIVAC', 'ENIAC', 'PDP-11'],
      answer: 0,
      explanation: 'IBM 1620 ১৯৬৪ সালে পরমাণু শক্তি কেন্দ্রে স্থাপন করা হয়।',
      chapterName: 'বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
    },
    {
      question: 'নিচের কোনটি সঠিক? $E = mc^2$',
      options: ['শক্তি ও ভরের সম্পর্ক', 'বলের সূত্র', 'গতির সূত্র', 'কোনোটিই নয়'],
      answer: 0,
    },
  ],
  null,
  2
);

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * JSON টেক্সট থেকে প্রশ্ন বের করা ও যাচাই।
 *
 * ভুল থাকলে কোন প্রশ্নে কী ভুল তা আলাদা করে বলি — শুধু "invalid JSON"
 * বললে ৫০টা প্রশ্নের মধ্যে কোনটায় সমস্যা তা খুঁজে বের করা যেত না।
 *
 * @returns {{questions: Array, errors: string[]}}
 */
export function parseCustomQuestions(text) {
  const raw = (text || '').trim();
  if (!raw) return { questions: [], errors: [] };

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return { questions: [], errors: [`JSON পড়া যায়নি — ${err.message}`] };
  }

  if (!Array.isArray(data)) {
    return { questions: [], errors: ['সবচেয়ে বাইরে একটি অ্যারে ([ ... ]) থাকতে হবে।'] };
  }
  if (data.length === 0) {
    return { questions: [], errors: ['অ্যারেটি খালি — অন্তত একটি প্রশ্ন দিন।'] };
  }

  const errors = [];
  const questions = [];

  data.forEach((item, i) => {
    const at = `প্রশ্ন ${i + 1}:`;

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${at} প্রতিটি আইটেম একটি অবজেক্ট ({ ... }) হতে হবে।`);
      return;
    }
    if (!isNonEmptyString(item.question)) {
      errors.push(`${at} "question" ফাঁকা রাখা যাবে না।`);
      return;
    }
    if (!Array.isArray(item.options) || item.options.length < 2) {
      errors.push(`${at} "options" এ অন্তত ২টি অপশন থাকতে হবে।`);
      return;
    }
    if (item.options.some((o) => !isNonEmptyString(o))) {
      errors.push(`${at} কোনো অপশন ফাঁকা রাখা যাবে না।`);
      return;
    }

    // answer হয় ইনডেক্স (০-ভিত্তিক), নয়তো হুবহু অপশনের লেখা
    let answer = item.answer;
    if (typeof answer === 'string') {
      const idx = item.options.findIndex((o) => o.trim() === answer.trim());
      if (idx === -1) {
        errors.push(`${at} "answer" এর লেখা কোনো অপশনের সাথে মেলেনি।`);
        return;
      }
      answer = idx;
    }
    if (!Number.isInteger(answer) || answer < 0 || answer >= item.options.length) {
      errors.push(
        `${at} "answer" হতে হবে ০ থেকে ${item.options.length - 1} এর মধ্যে একটি সংখ্যা (০ = প্রথম অপশন)।`
      );
      return;
    }

    questions.push({
      // uniqueId না দিলে ভুলের খাতায় জমা পড়ার সময় সমস্যা হয়
      id: `custom-${i + 1}`,
      question: item.question.trim(),
      options: item.options.map((o) => o.trim()),
      answer,
      ...(isNonEmptyString(item.explanation) ? { explanation: item.explanation.trim() } : {}),
      ...(isNonEmptyString(item.chapterName) ? { chapterName: item.chapterName.trim() } : {}),
      ...(isNonEmptyString(item.chapterId) ? { chapterId: item.chapterId.trim() } : {}),
    });
  });

  return { questions, errors };
}
