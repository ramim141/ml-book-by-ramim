import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QK, STALE } from '../lib/queryConfig';

export const normalizeAcademicLevel = (level = '') => String(level).trim().toLowerCase();

export const getSubjectSlug = (subject = {}) => {
  const level = normalizeAcademicLevel(subject.level);
  const id = String(subject.id || '').toLowerCase();

  if (id === 'hsc-chemistry-1') return 'chemistry';
  if (level && id.startsWith(`${level}-`)) {
    const sliced = id.slice(level.length + 1);
    if (sliced) return sliced;
  }
  return id;
};

export const getSubjectPath = (subject = {}) => {
  const level = normalizeAcademicLevel(subject.level);
  const slug = getSubjectSlug(subject);

  if (!level || !slug) return '/academic';
  return `/academic/${level}/${slug}`;
};

export const resolveSubjectFromRoute = (subjects = [], levelParam = '', subjectSlug = '') => {
  const level = normalizeAcademicLevel(levelParam);
  const slug = decodeURIComponent(String(subjectSlug || '')).toLowerCase();

  return subjects.find((subject) => {
    const subjectLevel = normalizeAcademicLevel(subject.level);
    if (subjectLevel !== level) return false;

    const id = String(subject.id || '').toLowerCase();
    return id === `${level}-${slug}` || id === slug || getSubjectSlug(subject) === slug;
  }) || null;
};

/**
 * বিষয়ের তালিকাটা এখানে আলাদা key-তে ক্যাশ করা হতো, ফলে একই ডকুমেন্টের
 * দুইটা কপি ক্যাশে থাকত এবং রুট বদলালেই আবার পড়া হতো। এখন সবাই একই
 * `QK.subjects()` ক্যাশ এন্ট্রি ভাগ করে; রুট অনুযায়ী বাছাইটা শুধু derive করা হয়।
 */
export const useResolvedSubject = (educationLevel, subjectSlug) => {
  return useQuery({
    queryKey: QK.subjects(),
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      return snap.exists() ? snap.data().list || [] : [];
    },
    staleTime: STALE.CONFIG,
    select: (list) => resolveSubjectFromRoute(list, educationLevel, subjectSlug),
  });
};
