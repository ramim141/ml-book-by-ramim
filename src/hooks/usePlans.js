import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DEFAULT_PLANS } from '../config/plans';
import { STALE } from '../lib/queryConfig';

/**
 * প্ল্যানের তালিকা — অ্যাডমিন প্যানেল থেকে নিয়ন্ত্রিত।
 *
 * আগে `src/config/plans.js` এ হার্ডকোড ছিল, অর্থাৎ দাম বদলাতে হলে কোড
 * বদলে নতুন করে ডিপ্লয় করতে হতো। এখন Firestore এ, তাই অ্যাডমিন নিজেই
 * দাম/মেয়াদ বদলাতে বা নতুন প্ল্যান যোগ করতে পারেন।
 */

export const PLANS_DOC = ['admin_settings', 'plans'];

export async function fetchPlans() {
  const snap = await getDoc(doc(db, ...PLANS_DOC));
  const list = snap.exists() ? snap.data().list : null;
  // অ্যাডমিন এখনো কিছু সেট না করলে ডিফল্ট দেখাই — পাতা যেন ফাঁকা না থাকে
  return Array.isArray(list) && list.length > 0 ? list : DEFAULT_PLANS;
}

export async function savePlans(list) {
  await setDoc(doc(db, ...PLANS_DOC), { list }, { merge: true });
}

export function usePlans({ activeOnly = true } = {}) {
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: fetchPlans,
    staleTime: STALE.CONFIG,
  });

  const plans = activeOnly ? data.filter((p) => p.active !== false) : data;
  return { plans, loading: isLoading, refresh: refetch };
}

export const planById = (plans, id) => plans.find((p) => p.id === id) || null;

export default usePlans;
