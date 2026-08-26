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

function getSafeQuestionId(q) {
  if (q.firebaseId) return String(q.firebaseId);
  if (q.id !== undefined && q.id !== null) return String(q.id);
  const text = q.question || q.title || '';
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return `q_${Math.abs(hash)}`;
}

const mistakeRef = (uid, questionId) => doc(db, 'users', uid, 'mistakes', questionId);

// Helper to save mistake locally
function saveMistakeLocally(uid, mistakeObj) {
  try {
    const key = uid && uid !== 'guest' ? `academic_mistakes_${uid}` : 'academic_guest_mistakes';
    const existingRaw = localStorage.getItem(key);
    let list = existingRaw ? JSON.parse(existingRaw) : [];
    const idx = list.findIndex(m => m.questionId === mistakeObj.questionId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...mistakeObj, timesWrong: (list[idx].timesWrong || 1) + 1 };
    } else {
      list.unshift({ ...mistakeObj, timesWrong: 1, createdAt: Date.now() });
    }
    localStorage.setItem(key, JSON.stringify(list.slice(0, 500)));
  } catch (e) {
    console.warn('Failed to save mistake locally:', e);
  }
}

/**
 * একটা ভুল উত্তর রেকর্ড করে। q তে থাকা `firebaseId`/`id`, `question`,
 * `options`, `answer`, `chapterId`, `chapterName` ব্যবহার করে।
 */
export async function recordMistake(uid, q, { subjectId, subjectTitle, userAnswer, program } = {}) {
  const questionId = getSafeQuestionId(q);
  if (!questionId) return;

  const targetUid = uid || 'guest';

  const base = {
    questionId,
    question: q.question || q.title || '',
    options: q.options || null,
    answer: q.answer ?? null,
    userAnswer: userAnswer ?? null,
    subjectId: subjectId || q.subject || '',
    subjectTitle: subjectTitle || q.subjectTitle || q.subject || '',
    program: program || q.program || '',
    chapterId: q.chapterId || null,
    chapterName: q.chapterName || 'অন্যান্য',
    explanation: q.explanation || null,
    imageUrl: q.imageUrl || q.image || q.image_url || null,
    intervalIndex: 0,
    mastered: false,
    masteredAt: null,
    // localStorage এ JSON.stringify হয় বলে এখানে সাধারণ সংখ্যাই রাখতে হবে —
    // আগে `{ toMillis: () => ... }` রাখা হতো, যেটা সেভ হয়ে `{}` হয়ে যেত।
    // ফলে পুনরালোচনার সময়সূচি কখনো কাজ করত না আর তালিকায় "Invalid Date" দেখাত।
    nextReviewAtMs: Date.now(),
    lastWrongAt: Date.now(),
  };

  // Always save to localStorage immediately for instant offline/online availability
  saveMistakeLocally(targetUid, base);

  if (targetUid === 'guest') return;

  try {
    const ref = mistakeRef(targetUid, questionId);
    const snap = await getDoc(ref);

    const { nextReviewAtMs, ...firestoreFields } = base;
    const firestoreBase = {
      ...firestoreFields,
      nextReviewAt: Timestamp.now(),
      lastWrongAt: serverTimestamp(),
    };

    if (snap.exists()) {
      await setDoc(ref, { ...firestoreBase, timesWrong: increment(1) }, { merge: true });
    } else {
      await setDoc(ref, { ...firestoreBase, timesWrong: 1, createdAt: serverTimestamp() });
    }
  } catch (err) {
    if (err?.code === 'permission-denied') {
      console.warn('ভুলের খাতায় সেভ permission-denied, লোকাল স্টোরেজে সংরক্ষিত হয়েছে।', err);
    } else {
      console.error('Failed to record mistake in firestore:', err);
    }
  }
}

/** পুনরালোচনার সময় একটা প্রশ্নে ঠিক/ভুল উত্তর দেওয়ার পর কল হয়। */
export async function recordReviewResult(uid, mistakeDoc, wasCorrect) {
  const targetUid = uid || 'guest';
  const qId = mistakeDoc.questionId || mistakeDoc.id;

  // Local update
  try {
    const key = targetUid && targetUid !== 'guest' ? `academic_mistakes_${targetUid}` : 'academic_guest_mistakes';
    const existingRaw = localStorage.getItem(key);
    if (existingRaw) {
      let list = JSON.parse(existingRaw);
      list = list.map(m => {
        if (m.questionId === qId || m.id === qId) {
          if (!wasCorrect) {
            return {
              ...m,
              intervalIndex: 0,
              mastered: false,
              nextReviewAtMs: Date.now(),
              timesWrong: (m.timesWrong || 1) + 1,
            };
          }
          const nextIdx = (m.intervalIndex || 0) + 1;
          const mastered = nextIdx >= REVIEW_INTERVAL_DAYS.length;
          const days = REVIEW_INTERVAL_DAYS[Math.min(nextIdx, REVIEW_INTERVAL_DAYS.length - 1)];
          return {
            ...m,
            intervalIndex: nextIdx,
            mastered,
            masteredAt: mastered ? Date.now() : null,
            nextReviewAtMs: Date.now() + days * 86400000,
          };
        }
        return m;
      });
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Local update mistake review failed:', e);
  }

  if (targetUid === 'guest') return;

  try {
    const ref = mistakeRef(targetUid, qId);

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
  } catch (e) {
    console.error('Firestore recordReviewResult error:', e);
  }
}

/** কোনো প্রশ্ন খাতা থেকে পুরোপুরি সরিয়ে ফেলে (ভুলবশত যোগ হলে বা আর দরকার না হলে)। */
export async function dismissMistake(uid, questionId) {
  const targetUid = uid || 'guest';
  try {
    const key = targetUid && targetUid !== 'guest' ? `academic_mistakes_${targetUid}` : 'academic_guest_mistakes';
    const existingRaw = localStorage.getItem(key);
    if (existingRaw) {
      let list = JSON.parse(existingRaw);
      list = list.filter(m => m.questionId !== questionId && m.id !== questionId);
      localStorage.setItem(key, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Local dismiss mistake error:', e);
  }

  if (targetUid === 'guest') return;

  try {
    await deleteDoc(mistakeRef(targetUid, questionId));
  } catch (e) {
    console.error('Firestore dismissMistake error:', e);
  }
}
