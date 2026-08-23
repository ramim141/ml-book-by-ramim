import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * অ্যাডমিনের কাজের হিসাব রাখা।
 *
 * `admin_activity` কালেকশনটা আগে থেকেই ছিল, কিন্তু সেখানে লিখত কেবল
 * ছাত্রদের ঘটনা (লগইন, ফিডব্যাক) — অ্যাডমিন কী করল তার কোনো রেকর্ডই থাকত না।
 * ফলে কে কখন কোন প্রশ্ন মুছল, বা কার পরীক্ষার ইতিহাস রিসেট করল, তা জানার
 * উপায় ছিল না। ধ্বংসাত্মক কাজগুলোতে নিশ্চিতকরণ থাকলেও ভুল হয়ে গেলে
 * কী হারিয়েছে সেটুকু অন্তত জানা দরকার।
 *
 * নিয়ম: লগ লেখা কখনো মূল কাজ আটকাবে না — ব্যর্থ হলে চুপচাপ কনসোলে।
 */

/** কাজের ধরন — ফিডে আলাদা রঙ/আইকন দেখাতে ও ছাঁকতে কাজে লাগে */
export const AUDIT = {
  DELETE: 'delete',
  UPDATE: 'update',
  CREATE: 'create',
  RESET: 'reset',
  BULK_DELETE: 'bulk_delete',
};

/**
 * @param {object} entry
 * @param {string} entry.action   AUDIT.* এর একটি
 * @param {string} entry.area     কোন অংশে (যেমন 'প্রশ্নব্যাংক', 'ইউজার')
 * @param {string} entry.summary  এক লাইনে কী হয়েছে
 * @param {object} [entry.details] বাড়তি তথ্য (id, সংখ্যা ইত্যাদি)
 * @param {string} [entry.actorEmail] কে করল
 */
export async function logAdminAction({ action, area, summary, details = {}, actorEmail }) {
  try {
    await addDoc(collection(db, 'admin_activity'), {
      // ছাত্রদের ঘটনা থেকে আলাদা করে চেনার জন্য
      source: 'admin',
      type: action,
      area,
      message: summary,
      details,
      actorEmail: actorEmail || null,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // লগ না লেখা গেলেও আসল কাজটা যেন থেমে না যায়
    console.error('অ্যাডমিন লগ লেখা যায়নি', err);
  }
}

/** ফিডে দেখানোর জন্য বাংলা নাম */
export const AUDIT_LABELS = {
  [AUDIT.DELETE]: 'মুছে ফেলা',
  [AUDIT.UPDATE]: 'সম্পাদনা',
  [AUDIT.CREATE]: 'নতুন যোগ',
  [AUDIT.RESET]: 'রিসেট',
  [AUDIT.BULK_DELETE]: 'একসাথে মুছে ফেলা',
};
