import { doc, getDoc, setDoc, updateDoc, deleteDoc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * "ভুলের খাতা" — মডেল টেস্ট বা লাইভ এক্সামে ভুল হওয়া MCQ প্রশ্ন
 * users/{uid}/mistakes/{questionId} এ জমা হয়। questionId হলো
 * academic_content কালেকশনের আসল ডকুমেন্ট আইডি, তাই একই প্রশ্ন
 * মডেল টেস্ট ও লাইভ এক্সাম — দুই জায়গায় ভুল হলেও একটাই রেকর্ড থাকে।
 *
 * পুনরালোচনার সময়সূচি সহজ রাখা হয়েছে (Cloud Function ছাড়া চলার মতো):
 * ঠিক করলে ১ → ৩ → ৭ দিন পর আবার দেখানো হয়, তৃতীয়বার ঠিক করলে মাস্টার্ড।
 * ভুল করলেই আবার শূন্য থেকে শুরু, তখনই আবার দেখানো হয়।
 */
export const REVIEW_INTERVAL_DAYS = [1, 3, 7];

const mistakeRef = (uid, questionId) => doc(db, 'users', uid, 'mistakes', questionId);

/**
 * একটা ভুল উত্তর রেকর্ড করে। q তে থাকা `firebaseId`/`id`, `question`,
 * `options`, `answer`, `chapterId`, `chapterName` ব্যবহার করে।
 */
export async function recordMistake(uid, q, { subjectId, subjectTitle, userAnswer } = {}) {
  const questionId = q.firebaseId || q.id;
  if (!uid || !questionId) return;

  try {
    const ref = mistakeRef(uid, questionId);
    const snap = await getDoc(ref);

    const base = {
      questionId,
      question: q.question || q.title || '',
      options: q.options || null,
      answer: q.answer ?? null,
      userAnswer: userAnswer ?? null,
      subjectId: subjectId || q.subject || '',
      subjectTitle: subjectTitle || '',
      chapterId: q.chapterId || null,
      chapterName: q.chapterName || 'অন্যান্য',
      explanation: q.explanation || null,
      imageUrl: q.imageUrl || q.image || q.image_url || null,
      // আবার ভুল হলে অগ্রগতি রিসেট, এখনই আবার দেখানো হবে
      intervalIndex: 0,
      mastered: false,
      masteredAt: null,
      nextReviewAt: Timestamp.now(),
      lastWrongAt: serverTimestamp(),
    };

    if (snap.exists()) {
      await setDoc(ref, { ...base, timesWrong: increment(1) }, { merge: true });
    } else {
      await setDoc(ref, { ...base, timesWrong: 1, createdAt: serverTimestamp() });
    }
  } catch (err) {
    // ভুলের খাতা একটা বাড়তি ফিচার — এটা ব্যর্থ হলেও মূল পরীক্ষা জমা
    // দেওয়া আটকে যাওয়া উচিত নয়, তাই এখানেই ধরে নেওয়া হলো।
    if (err?.code === 'permission-denied') {
      console.error(
        'ভুলের খাতায় সেভ ব্যর্থ: permission-denied। firestore.rules এ mistakes ' +
        'সাবকালেকশনের নিয়ম আছে কিন্তু ডিপ্লয় করা হয়নি হয়তো — ' +
        '`firebase deploy --only firestore:rules` চালান।',
        err,
      );
    } else {
      console.error('Failed to record mistake:', err);
    }
  }
}

/** পুনরালোচনার সময় একটা প্রশ্নে ঠিক/ভুল উত্তর দেওয়ার পর কল হয়। */
export async function recordReviewResult(uid, mistakeDoc, wasCorrect) {
  const ref = mistakeRef(uid, mistakeDoc.questionId);

  if (!wasCorrect) {
    await updateDoc(ref, {
      intervalIndex: 0,
      mastered: false,
      timesWrong: increment(1),
      nextReviewAt: Timestamp.now(),
      lastWrongAt: serverTimestamp(),
    });
    return;
  }

  const nextIndex = (mistakeDoc.intervalIndex || 0) + 1;
  const mastered = nextIndex >= REVIEW_INTERVAL_DAYS.length;
  const days = REVIEW_INTERVAL_DAYS[Math.min(nextIndex, REVIEW_INTERVAL_DAYS.length - 1)];

  await updateDoc(ref, {
    intervalIndex: nextIndex,
    mastered,
    masteredAt: mastered ? serverTimestamp() : null,
    nextReviewAt: Timestamp.fromMillis(Date.now() + days * 86400000),
  });
}

/** কোনো প্রশ্ন খাতা থেকে পুরোপুরি সরিয়ে ফেলে (ভুলবশত যোগ হলে বা আর দরকার না হলে)। */
export async function dismissMistake(uid, questionId) {
  await deleteDoc(mistakeRef(uid, questionId));
}
