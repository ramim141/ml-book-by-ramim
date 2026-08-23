import { doc, getDoc, setDoc, updateDoc, increment, collection } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * পরীক্ষার ফল থেকে ছাত্রের অগ্রগতি লেখা — মডেল টেস্ট ও লাইভ এক্সাম দুটোরই
 * একমাত্র পথ।
 *
 * আগে এই লজিক শুধু ModelTestResult.jsx এ ছিল; LiveExamEngine কেবল সাবমিশন
 * আর ভুলের খাতা লিখত। ফলে কেউ শুধু লাইভ এক্সাম দিলে তার সাবজেক্ট প্রগ্রেস
 * ০%, অ্যানালাইজার খালি আর XP শূন্য থেকে যেত। দুই জায়গায় আলাদা কপি রাখলে
 * আবার এমন ফারাক তৈরি হতো, তাই একটাই ফাংশন।
 */

/**
 * অধ্যায়ের আইডি একই রূপে আনা।
 *
 * ModelTestConfig `chapter_1` কে `chapter-1` বানিয়ে পাঠায়, কিন্তু লাইভ
 * এক্সাম প্রশ্ন সরাসরি academic_content থেকে আসে — সেখানে দুই রকমই থাকতে
 * পারে। এক না করলে একই অধ্যায় দুই কী-তে ভাগ হয়ে যেত (ঠিক যে বাগটা
 * questionsBySubject এ ছিল)।
 */
export function normalizeChapterId(chapterId) {
  if (!chapterId) return 'uncategorized';
  const match = String(chapterId).match(/^chapter[_-](\d+)$/i);
  return match ? `chapter-${Number(match[1])}` : String(chapterId);
}

/** অ্যাডমিনের ঠিক করে দেওয়া XP হার — না পেলে ডিফল্ট */
async function fetchXpRates() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'gamification'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        baseXp: Number(data.baseXp ?? 10),
        xpPerCorrect: Number(data.xpPerCorrect ?? 2),
      };
    }
  } catch (err) {
    console.error('XP সেটিংস পড়া যায়নি', err);
  }
  return { baseXp: 10, xpPerCorrect: 2 };
}

/**
 * প্রতিটি অধ্যায়ে কয়টা চেষ্টা/সঠিক/ভুল — subjectId এর নিচে নেস্ট করে।
 * শুধু অধ্যায়ের নামে রাখলে ভিন্ন বিষয়ের একই নামের অধ্যায় মিশে যেত।
 */
function buildChapterUpdates(questions, answers) {
  const updates = {};
  questions.forEach((q, idx) => {
    const chapterId = normalizeChapterId(q.chapterId);
    if (!updates[chapterId]) updates[chapterId] = { attempted: 0, correct: 0, wrong: 0 };
    if (answers[idx] === undefined) return;
    updates[chapterId].attempted += 1;
    if (answers[idx] === q.answer) updates[chapterId].correct += 1;
    else updates[chapterId].wrong += 1;
  });
  return updates;
}

/**
 * @param {object} params
 * @param {string} params.uid
 * @param {Array}  params.questions   পরীক্ষায় আসা প্রশ্ন
 * @param {object} params.answers     index → বেছে নেওয়া অপশন
 * @param {string} params.subjectId   admin_settings/subjects এর আসল id
 * @param {string} params.subjectTitle
 * @param {number} params.timeTaken   সেকেন্ড
 * @param {string} params.source      'model-test' | 'live-exam'
 * @returns {Promise<{xpEarned:number}>}
 */
export async function recordExamProgress({
  uid,
  questions = [],
  answers = {},
  subjectId,
  subjectTitle,
  timeTaken = 0,
  source = 'model-test',
}) {
  if (!uid || questions.length === 0) return { xpEarned: 0 };

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  questions.forEach((q, idx) => {
    if (answers[idx] === undefined) skipped += 1;
    else if (answers[idx] === q.answer) correct += 1;
    else wrong += 1;
  });

  const percentage = Math.round((correct / questions.length) * 100);
  const { baseXp, xpPerCorrect } = await fetchXpRates();
  const xpEarned = baseXp + correct * xpPerCorrect;

  // প্রগ্রেস ট্যাব admin_settings/subjects এর id ধরে হিসাব করে, তাই এখানে
  // অনুমান করা কোনো কী নয় — আসল subjectId ই বসে
  const subjectKey = subjectId || 'other';
  const chapterUpdates = buildChapterUpdates(questions, answers);

  const result = {
    id: Date.now(),
    subjectTitle: subjectTitle || 'পরীক্ষা',
    subjectId: subjectKey,
    date: new Date().toISOString(),
    totalQuestions: questions.length,
    correct,
    wrong,
    skipped,
    percentage,
    timeTaken,
    source,
  };

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  // পুরনো পরিসংখ্যানের সাথে যোগ — increment() নেস্টেড ম্যাপে ব্যবহার করা
  // যায় না বলে হাতে মার্জ করতে হয়
  const existing = snap.exists() ? (snap.data().chapterStats?.[subjectKey] || {}) : {};
  const mergedChapterStats = { ...existing };
  Object.keys(chapterUpdates).forEach((chapterId) => {
    const prev = mergedChapterStats[chapterId] || { attempted: 0, correct: 0, wrong: 0 };
    mergedChapterStats[chapterId] = {
      attempted: prev.attempted + chapterUpdates[chapterId].attempted,
      correct: prev.correct + chapterUpdates[chapterId].correct,
      wrong: prev.wrong + chapterUpdates[chapterId].wrong,
    };
  });

  // examCount আলাদা করে রাখি — অ্যাডমিন প্যানেল সব ব্যবহারকারীর তালিকায়
  // "কয়টা পরীক্ষা" দেখায় ও সাজায়। ইতিহাস সাবকালেকশনে চলে যাওয়ায় প্রত্যেকের
  // জন্য আলাদা কোয়েরি করতে হতো; এই একটা সংখ্যা রাখলে সেটা লাগে না।
  if (snap.exists()) {
    await updateDoc(userRef, {
      xp: increment(xpEarned),
      examCount: increment(1),
      [`questionsBySubject.${subjectKey}`]: increment(correct),
      [`chapterStats.${subjectKey}`]: mergedChapterStats,
    });
  } else {
    await setDoc(userRef, {
      xp: xpEarned,
      examCount: 1,
      questionsBySubject: { [subjectKey]: correct },
      chapterStats: { [subjectKey]: mergedChapterStats },
    }, { merge: true });
  }

  // ফলাফল সাবকালেকশনে — আগে users ডকের একটা অ্যারেতে জমত, ফলে প্রোফাইল
  // খুললেই সব পরীক্ষার ইতিহাস নামত (৩টা দেখাতেও) এবং ডকুমেন্টটা অসীম বাড়ত
  await setDoc(doc(collection(db, 'users', uid, 'exam_history'), String(result.id)), result);

  return { xpEarned, result, correct, wrong, skipped, percentage };
}

/**
 * পুরনো (users ডকের অ্যারে) ও নতুন (সাবকালেকশন) — দুই জায়গার ইতিহাস মিলিয়ে
 * একটাই তালিকা। মাইগ্রেশন ছাড়াই পুরনো ডেটা দেখা যায়।
 */
export function mergeExamHistory(legacyArray = [], subcollectionDocs = []) {
  const seen = new Set();
  const all = [...(legacyArray || []), ...(subcollectionDocs || [])].filter((entry) => {
    if (!entry) return false;
    const key = String(entry.id ?? `${entry.date}-${entry.subjectTitle}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return all.sort((a, b) => new Date(a.date) - new Date(b.date));
}
