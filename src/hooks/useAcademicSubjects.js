import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QK, STALE } from '../lib/queryConfig';
import { getSubjectPath } from '../utils/academicRoutes';

/**
 * `admin_settings/subjects` পুরো একাডেমিক হাবের মেরুদণ্ড — বিষয়, অধ্যায়, স্তর
 * সবই এখান থেকে আসে। আগে এই একটি ডকুমেন্ট ২০+ জায়গায় আলাদা করে পড়া হতো,
 * প্রতিবার নেভিগেট করলেই আবার। এখন একটাই ক্যাশড কোয়েরি সবাই ভাগ করে নেয়।
 */
async function fetchSubjects() {
  const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
  if (!snap.exists()) return [];
  return snap.data().list || [];
}

export function useAcademicSubjects() {
  return useQuery({
    queryKey: QK.subjects(),
    queryFn: fetchSubjects,
    staleTime: STALE.CONFIG,
  });
}

/** নির্দিষ্ট স্তরের (SSC / HSC / Admission) বিষয়গুলো */
export function useSubjectsByLevel(level) {
  const { data = [], ...rest } = useAcademicSubjects();
  const filtered = useMemo(
    () => (level ? data.filter((subject) => subject.level === level) : data),
    [data, level]
  );
  return { ...rest, data: filtered };
}

export const SUBJECT_COLOR_PRESETS = [
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
  'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  'bg-lime-500/10 text-lime-400 border-lime-500/20 hover:bg-lime-500/20',
  'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
];

/**
 * SSC / HSC / Admission — তিনটি ড্যাশবোর্ডই একই আকৃতির কার্ড দেখায়,
 * তাই ম্যাপিংটা এক জায়গায় রাখা হলো।
 */
export function useDashboardSubjects(level) {
  const { data, isLoading, isError } = useSubjectsByLevel(level);

  const subjects = useMemo(
    () => data.map((s, idx) => ({
      id: s.id,
      title: s.label,
      subtitle: s.chapters?.length ? `${s.chapters.length} টি অধ্যায়` : 'সকল অধ্যায়',
      emoji: s.emoji,
      path: getSubjectPath(s),
      color: SUBJECT_COLOR_PRESETS[idx % SUBJECT_COLOR_PRESETS.length],
    })),
    [data]
  );

  return { subjects, isLoading, isError };
}

export default useAcademicSubjects;
