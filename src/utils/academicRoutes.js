import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

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

export const useResolvedSubject = (educationLevel, subjectSlug) => {
  return useQuery({
    // Hook for resolving subject from route
    queryKey: ['resolveSubject', educationLevel, subjectSlug],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
      const list = snap.exists() ? snap.data().list || [] : [];
      return resolveSubjectFromRoute(list, educationLevel, subjectSlug);
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours caching
  });
};
