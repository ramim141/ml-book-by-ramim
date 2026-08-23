import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, increment, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COUPON_TYPES } from '../config/plans';

/**
 * কুপন ও ছাড়।
 *
 * কুপনের কোডটাই ডকুমেন্টের আইডি (বড় হাতের অক্ষরে) — এতে দুটো লাভ:
 *  ১. একই কোড দুবার তৈরি হওয়া অসম্ভব, আলাদা করে যাচাই লাগে না
 *  ২. ছাত্র কোড লিখলে সরাসরি একটামাত্র ডক পড়া যায়, কোয়েরি লাগে না
 *
 * নিরাপত্তা: rules এ `get` সবার জন্য খোলা কিন্তু `list` কেবল অ্যাডমিনের।
 * অর্থাৎ কোড জানা থাকলে যাচাই করা যায়, কিন্তু সব কুপনের তালিকা কেউ
 * বের করতে পারে না।
 */

export const normalizeCode = (code) => (code || '').trim().toUpperCase().replace(/\s+/g, '');

/** Timestamp / Date / স্ট্রিং — সব রূপ থেকে Date */
function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * ছাড় বাদে চূড়ান্ত দাম।
 * শতাংশ বা নির্দিষ্ট টাকা — দুই রকমই চলে। কখনো ঋণাত্মক হয় না।
 */
export function applyDiscount(price, coupon) {
  const base = Number(price) || 0;
  if (!coupon) return { final: base, saved: 0 };

  const value = Number(coupon.value) || 0;
  const saved = coupon.type === COUPON_TYPES.PERCENT
    ? Math.round((base * value) / 100)
    : Math.round(value);

  const capped = Math.min(saved, base); // ছাড় কখনো দামের চেয়ে বেশি নয়
  return { final: Math.max(0, base - capped), saved: capped };
}

/**
 * কুপন যাচাই — কেন কাজ করছে না সেটাও বলি, শুধু "অবৈধ" নয়।
 * @returns {Promise<{ok:boolean, coupon?:object, reason?:string}>}
 */
export async function validateCoupon(rawCode, planId) {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, reason: 'কুপন কোড লিখুন' };

  let snap;
  try {
    snap = await getDoc(doc(db, 'coupons', code));
  } catch {
    return { ok: false, reason: 'কুপন যাচাই করা যায়নি' };
  }

  if (!snap.exists()) return { ok: false, reason: 'এই কোডটি পাওয়া যায়নি' };

  const c = { code, ...snap.data() };

  if (c.active === false) return { ok: false, reason: 'কুপনটি এখন বন্ধ আছে' };

  const expiry = toDate(c.expiresAt);
  if (expiry && expiry.getTime() < Date.now()) {
    return { ok: false, reason: 'কুপনের মেয়াদ শেষ' };
  }

  if (c.maxUses > 0 && (c.usedCount || 0) >= c.maxUses) {
    return { ok: false, reason: 'কুপনটি সর্বোচ্চবার ব্যবহৃত হয়ে গেছে' };
  }

  // নির্দিষ্ট প্ল্যানে সীমাবদ্ধ কুপন
  if (Array.isArray(c.planIds) && c.planIds.length > 0 && planId && !c.planIds.includes(planId)) {
    return { ok: false, reason: 'এই প্ল্যানে কুপনটি চলবে না' };
  }

  return { ok: true, coupon: c };
}

/** অনুমোদনের সময় ব্যবহারের গণনা বাড়াই — জমা দেওয়ার সময় নয়, কারণ
 *  অনুরোধ বাতিলও হতে পারে */
export async function markCouponUsed(code) {
  const id = normalizeCode(code);
  if (!id) return;
  try {
    await updateDoc(doc(db, 'coupons', id), { usedCount: increment(1) });
  } catch (err) {
    console.error('কুপনের গণনা বাড়ানো যায়নি', err);
  }
}

// ── অ্যাডমিন ──────────────────────────────────────────────────────────

export async function listCoupons() {
  const snap = await getDocs(collection(db, 'coupons'));
  return snap.docs.map((d) => ({ code: d.id, ...d.data() }));
}

export async function saveCoupon(data) {
  const code = normalizeCode(data.code);
  if (!code) throw new Error('কোড দিন');

  await setDoc(doc(db, 'coupons', code), {
    type: data.type || COUPON_TYPES.PERCENT,
    value: Number(data.value) || 0,
    maxUses: Number(data.maxUses) || 0, // ০ = সীমাহীন
    usedCount: Number(data.usedCount) || 0,
    planIds: Array.isArray(data.planIds) ? data.planIds : [],
    active: data.active !== false,
    expiresAt: data.expiresAt ? Timestamp.fromDate(new Date(data.expiresAt)) : null,
    note: data.note || '',
  }, { merge: true });

  return code;
}

export async function deleteCoupon(code) {
  await deleteDoc(doc(db, 'coupons', normalizeCode(code)));
}
