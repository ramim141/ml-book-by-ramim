import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where,
  Timestamp, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * সাবস্ক্রিপশন — ম্যানুয়াল বিকাশ ভিত্তিক।
 *
 * নিরাপত্তার মূল কথা: `plan` ও `planExpiry` ক্লায়েন্ট কখনো লিখতে পারে না
 * (firestore.rules এ আটকানো)। ছাত্র শুধু একটা *অনুরোধ* জমা দিতে পারে;
 * অ্যাডমিন অনুমোদন করলে তবেই প্ল্যান বসে।
 */

/** Firestore Timestamp, Date বা মিলিসেকেন্ড — সব রূপ থেকে Date */
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * এই ব্যবহারকারী কি এখন প্রিমিয়াম?
 * মেয়াদ পেরিয়ে গেলে `plan` ফিল্ড 'premium' থাকলেও মিথ্যা ফেরে — তাই
 * মেয়াদোত্তীর্ণ অ্যাকাউন্ট আলাদা করে পরিষ্কার করার দরকার হয় না।
 */
export function isPremium(userData) {
  if (!userData || userData.plan !== 'premium') return false;
  const expiry = toDate(userData.planExpiry);
  if (!expiry) return false;
  return expiry.getTime() > Date.now();
}

/** আর কত দিন বাকি (মেয়াদ শেষ বা প্ল্যান না থাকলে ০) */
export function daysRemaining(userData) {
  const expiry = toDate(userData?.planExpiry);
  if (!expiry) return 0;
  return Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86400000));
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

/**
 * ছাত্রের পেমেন্ট অনুরোধ জমা।
 * `status` জোর করে 'pending' বসানো হয় — rules এও একই শর্ত আছে, যাতে কেউ
 * সরাসরি 'approved' লিখে নিজেকে প্রিমিয়াম বানাতে না পারে।
 */
export async function submitPaymentRequest({
  uid, userName, email, planId, trxId, senderNumber, couponCode = null, finalAmount = null,
}) {
  if (!planId) throw new Error('প্ল্যান বেছে নিন');
  if (!trxId?.trim()) throw new Error('ট্রানজেকশন আইডি দিন');

  // প্ল্যান এখন Firestore এ, তাই দাম/মেয়াদ ওখান থেকেই নিই — ক্লায়েন্টের
  // পাঠানো সংখ্যায় ভরসা করা যায় না
  const snap = await getDoc(doc(db, 'admin_settings', 'plans'));
  const list = snap.exists() ? (snap.data().list || []) : [];
  const plan = list.find((p) => p.id === planId);
  if (!plan) throw new Error('প্ল্যান পাওয়া যায়নি');

  return addDoc(collection(db, 'payment_requests'), {
    uid,
    userName: userName || '',
    email: email || '',
    planId: plan.id,
    planLabel: plan.label,
    // মূল দাম ও ছাড়ের পরের দাম — দুটোই রাখি, অ্যাডমিন যেন মিলিয়ে দেখতে পারেন
    listPrice: Number(plan.price) || 0,
    amount: finalAmount !== null ? Number(finalAmount) : Number(plan.price) || 0,
    couponCode: couponCode || null,
    days: Number(plan.days) || 30,
    trxId: trxId.trim().toUpperCase(),
    senderNumber: (senderNumber || '').trim(),
    status: PAYMENT_STATUS.PENDING,
    createdAt: serverTimestamp(),
  });
}

/** এই ব্যবহারকারীর অপেক্ষমাণ অনুরোধ আছে কি না — দুবার জমা দেওয়া ঠেকাতে */
export async function getPendingRequest(uid) {
  if (!uid) return null;
  const snap = await getDocs(query(
    collection(db, 'payment_requests'),
    where('uid', '==', uid),
    where('status', '==', PAYMENT_STATUS.PENDING)
  ));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/** একই ট্রানজেকশন আইডি আগে ব্যবহার হয়েছে কি না — জালিয়াতি ঠেকাতে */
export async function findByTrxId(trxId) {
  const snap = await getDocs(query(
    collection(db, 'payment_requests'),
    where('trxId', '==', (trxId || '').trim().toUpperCase())
  ));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * অ্যাডমিনের অনুমোদন — এখানেই আসল প্ল্যান বসে।
 *
 * মেয়াদ যোগ হয় *বর্তমান মেয়াদের শেষ থেকে*, আজ থেকে নয়। না হলে কেউ
 * মেয়াদ থাকতেই নবায়ন করলে বাকি দিনগুলো হারাতেন।
 */
export async function approvePayment({ requestId, request, adminEmail }) {
  const userRef = doc(db, 'users', request.uid);
  const snap = await getDoc(userRef);
  const existing = snap.exists() ? toDate(snap.data().planExpiry) : null;

  const startFrom = existing && existing.getTime() > Date.now() ? existing : new Date();
  const expiry = new Date(startFrom.getTime() + (request.days || 30) * 86400000);

  await updateDoc(userRef, {
    plan: 'premium',
    planExpiry: Timestamp.fromDate(expiry),
  });

  await updateDoc(doc(db, 'payment_requests', requestId), {
    status: PAYMENT_STATUS.APPROVED,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminEmail || null,
    grantedUntil: Timestamp.fromDate(expiry),
  });

  return expiry;
}

export async function rejectPayment({ requestId, adminEmail, note }) {
  await updateDoc(doc(db, 'payment_requests', requestId), {
    status: PAYMENT_STATUS.REJECTED,
    reviewedAt: serverTimestamp(),
    reviewedBy: adminEmail || null,
    note: note || '',
  });
}

/** অ্যাডমিন সরাসরি প্ল্যান দিতে/তুলে নিতে পারেন (টাকা হাতে পেলে) */
export async function setPlanManually({ uid, days }) {
  const userRef = doc(db, 'users', uid);
  if (!days) {
    await updateDoc(userRef, { plan: 'free', planExpiry: null });
    return null;
  }
  const expiry = new Date(Date.now() + days * 86400000);
  await updateDoc(userRef, { plan: 'premium', planExpiry: Timestamp.fromDate(expiry) });
  return expiry;
}
