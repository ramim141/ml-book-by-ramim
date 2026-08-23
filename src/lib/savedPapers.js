import {
  collection, doc, getDocs, setDoc, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * তৈরি করা প্রশ্নপত্র সংরক্ষণ।
 *
 * আগে Question Builder এর কাজ শুধু localStorage এ একটামাত্র খসড়া হিসেবে
 * থাকত — শিক্ষক ৫০টা প্রশ্ন বেছে কাগজ বানিয়ে প্রিন্ট করার পর সেটা আর
 * ফেরত পেতেন না, পরের সপ্তাহে আবার শূন্য থেকে শুরু করতে হতো।
 *
 * প্রতিটি কাগজ নিজের অ্যাকাউন্টের নিচে থাকে (users/{uid}/question_papers),
 * তাই অন্য কারো কাগজ কেউ দেখতে পায় না।
 */

const papersRef = (uid) => collection(db, 'users', uid, 'question_papers');

/** কাগজের তালিকা — নতুনটা আগে */
export async function listPapers(uid) {
  if (!uid) return [];
  // updatedAt না থাকা পুরনো ডকও যেন বাদ না পড়ে, তাই orderBy ছাড়াই এনে
  // ক্লায়েন্টে সাজাই (Firestore এ orderBy ফিল্ড অনুপস্থিত হলে ডক বাদ পড়ে)
  const snap = await getDocs(papersRef(uid));
  const rows = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      updatedAt: data.updatedAt?.toDate?.() || null,
    };
  });
  rows.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  return rows;
}

/**
 * কাগজ সেভ / হালনাগাদ।
 * @param {string} uid
 * @param {object} paper { id?, name, cart, headerInfo, marksConfig, printSettings }
 * @returns {Promise<string>} সেভ হওয়া কাগজের id
 */
export async function savePaper(uid, paper) {
  if (!uid) throw new Error('লগইন প্রয়োজন');
  const id = paper.id || String(Date.now());
  const isTemplate = Boolean(paper.isTemplate);
  // টেমপ্লেটে প্রশ্ন থাকে না — শুধু হেডার/নম্বর/প্রিন্ট সেটআপের বিন্যাস
  const cart = isTemplate ? [] : (paper.cart || []);

  await setDoc(doc(papersRef(uid), id), {
    name: (paper.name || '').trim() || (isTemplate ? 'নামহীন টেমপ্লেট' : 'নামহীন প্রশ্নপত্র'),
    // তালিকায় দেখানোর জন্য — পুরো cart না খুলেই সারসংক্ষেপ দেখা যায়
    questionCount: cart.length,
    subject: paper.headerInfo?.subject || '',
    isTemplate,
    cart,
    headerInfo: paper.headerInfo || {},
    marksConfig: paper.marksConfig || {},
    printSettings: paper.printSettings || {},
    updatedAt: Timestamp.now(),
  });

  return id;
}

export async function deletePaper(uid, paperId) {
  if (!uid || !paperId) return;
  await deleteDoc(doc(papersRef(uid), paperId));
}

/** Firestore ডকুমেন্টের সীমা ১MB — বড় কাগজে আগেই সতর্ক করি */
export function estimatePaperSize(cart = []) {
  try {
    return new Blob([JSON.stringify(cart)]).size;
  } catch {
    return JSON.stringify(cart).length;
  }
}

export const PAPER_SIZE_LIMIT = 900 * 1024; // ১MB এর কিছু আগেই থামি
