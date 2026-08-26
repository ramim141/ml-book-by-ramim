import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { STALE } from '../../../lib/queryConfig';
import { ADMISSION_BUILDER_QUESTIONS } from '../../../data/academic/admissionBuilderConfig';

/** Firestore এ জ্ঞান/অনুধাবন দুটোই `type: 'knowledge'`, আসল ভাগটা ভিতরের ফিল্ডে। */
const normalizeType = (docType, raw) => {
  if (docType !== 'knowledge') return docType;
  return raw.type === 'k' ? 'k' : 'kh';
};

export const normalizeChapterKey = (id = '') => {
  return String(id || '')
    .toLowerCase()
    .trim()
    .replace('bio-bot-', 'bio-1-')
    .replace('bio-zoo-', 'bio-2-')
    .replace('bio-bot', 'bio-1')
    .replace('bio-zoo', 'bio-2')
    .replace('bot-', 'bio-1-')
    .replace('zoo-', 'bio-2-');
};

export const findMatchingChapter = (chapters, raw) => {
  if (!Array.isArray(chapters) || chapters.length === 0) return null;
  const rawId = raw.chapterId || raw.chapter || '';
  const normRaw = normalizeChapterKey(rawId);

  // 1. Direct match or normalized key match
  let found = chapters.find(
    (c) => c.id === rawId || normalizeChapterKey(c.id) === normRaw
  );
  if (found) return found;

  // 2. Cross-matching aliases (e.g. bio-1-1 <-> bio-bot-1)
  found = chapters.find((c) => {
    const cNorm = normalizeChapterKey(c.id);
    return cNorm === normRaw || (normRaw && cNorm.endsWith(normRaw.split('-').pop()));
  });
  if (found) return found;

  // 3. Name or Title match
  if (raw.chapterName || raw.topic) {
    const text = String(raw.chapterName || raw.topic || '').toLowerCase();
    found = chapters.find(
      (c) =>
        (c.title && text.includes(String(c.title).toLowerCase())) ||
        (c.name && text.includes(String(c.name).toLowerCase()))
    );
  }

  return found || null;
};

const buildNormalizer = (docType, chapters) => (docSnap) => {
  const raw = docSnap.data();
  const chapter = findMatchingChapter(chapters, raw);
  const type = normalizeType(docType, raw);

  const boards = Array.isArray(raw.boards) && raw.boards.length > 0
    ? raw.boards
    : Array.isArray(raw.examTags) && raw.examTags.length > 0
    ? raw.examTags.map((t) => ({
        name: t.type || t.name || raw.examType || 'ভর্তি পরীক্ষা',
        year: t.session || t.year || raw.year || '2023-2024'
      }))
    : raw.examType
    ? [{ name: raw.examType, year: raw.year || '2023-2024' }]
    : [];

  const boardStrings = boards.map((b) =>
    typeof b === 'object' && b !== null
      ? `${b.name || b.type || ''}${b.year || b.session ? `-${b.year || b.session}` : ''}`
      : String(b)
  ).filter(Boolean);

  return {
    ...raw,
    id: docSnap.id,
    firebaseId: docSnap.id,
    type,
    uniqueId: `${type}-${docSnap.id}`,
    chapterId: chapter?.id || raw.chapterId || '',
    chapterName: chapter?.title || chapter?.name || raw.chapterName || raw.chapterId || 'সাধারণ',
    boards,
    board: boardStrings,
  };
};

async function fetchSubjectQuestions(subject) {
  if (!subject) return [];
  const chapters = subject.chapters || [];
  const results = [];

  // ১. Firestore academic_content থেকে সমান্তরালে আনা
  try {
    const [mcqSnap, cqSnap, knowledgeSnap] = await Promise.all(
      ['mcq', 'cq', 'knowledge'].map((docType) =>
        getDocs(
          query(
            collection(db, 'academic_content'),
            where('subject', '==', subject.id),
            where('type', '==', docType)
          )
        )
      )
    );

    results.push(
      ...mcqSnap.docs.map(buildNormalizer('mcq', chapters)),
      ...cqSnap.docs.map(buildNormalizer('cq', chapters)),
      ...knowledgeSnap.docs.map(buildNormalizer('knowledge', chapters))
    );
  } catch (err) {
    console.warn('Firestore academic_content fetch skipped or error:', err);
  }

  // ২. যদি অ্যাডমিশন বিষয় হয়, তবে অ্যাডমিশন question_bank ও ফলব্যাক প্রশ্ন যুক্ত করা
  if (subject.level === 'Admission' || subject.id?.startsWith('adm-')) {
    const rawSub = subject.id.replace('adm-', '').toLowerCase();
    
    // Firestore question_bank থেকে প্রশ্ন ফেচ ও ফিল্টারিং
    try {
      const qbRef = collection(db, 'question_bank');
      const snap = await getDocs(qbRef);
      if (!snap.empty) {
        const matchingDocs = snap.docs.filter((docSnap) => {
          const d = docSnap.data();
          const dSub = (d.subject || '').toLowerCase();
          const dSubOpt = (d.subjectOptionId || '').toLowerCase();
          return (
            dSub === subject.id.toLowerCase() ||
            dSub === rawSub ||
            dSub === (subject.name || '').toLowerCase() ||
            dSubOpt.includes(rawSub) ||
            (rawSub === 'biology' && (dSub.includes('জীব') || dSub.includes('bio'))) ||
            (rawSub === 'chemistry' && (dSub.includes('রসায়ন') || dSub.includes('chem'))) ||
            (rawSub === 'physics' && (dSub.includes('পদার্থ') || dSub.includes('phy'))) ||
            (rawSub === 'math' && (dSub.includes('গণিত') || dSub.includes('math'))) ||
            (rawSub === 'english' && (dSub.includes('ইংরেজি') || dSub.includes('eng'))) ||
            (rawSub === 'gk' && (dSub.includes('জ্ঞান') || dSub.includes('gk')))
          );
        });

        const normalizedQb = matchingDocs.map(buildNormalizer('mcq', chapters));
        normalizedQb.forEach((qbItem) => {
          if (!results.some((r) => r.id === qbItem.id)) {
            results.push(qbItem);
          }
        });
      }
    } catch (err) {
      console.warn('Firestore question_bank fetch error in useBuilderQuestions:', err);
    }

    // লোকাল ফলব্যাক অ্যাডমিশন প্রশ্নাবলী
    const localAdmQs = ADMISSION_BUILDER_QUESTIONS.filter(
      (q) => q.subject === subject.id || subject.id.includes(q.subject.replace('adm-', ''))
    ).map((q) => {
      const chapter = chapters.find((c) => c.id === q.chapterId);
      const boards = [{ name: q.examType || 'ভর্তি পরীক্ষা', year: q.year || '2023-2024' }];
      return {
        ...q,
        firebaseId: q.id,
        uniqueId: `mcq-${q.id}`,
        chapterName: chapter?.name || chapter?.title || q.chapterName || 'সাধারণ',
        boards,
        board: boards,
      };
    });

    // ডুপ্লিকেট এড়াতে id দিয়ে মার্জ
    localAdmQs.forEach((localQ) => {
      if (!results.some((r) => r.id === localQ.id)) {
        results.push(localQ);
      }
    });
  }

  return results;
}

/**
 * @param subjects  admin_settings/subjects বা ADMISSION_BUILDER_SUBJECTS এর একটি বা একাধিক এন্ট্রি
 * @returns { questions, isLoading, isError }  বিষয়ের সব প্রশ্ন, নরমালাইজড
 */
export function useBuilderQuestions(subjects) {
  const subjectList = Array.isArray(subjects)
    ? subjects.filter(Boolean)
    : subjects
    ? [subjects]
    : [];

  const subjectIds = subjectList.map((s) => s.id).sort().join(',');

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['builderQuestions', subjectIds],
    enabled: subjectList.length > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      const allResults = await Promise.all(
        subjectList.map((s) => fetchSubjectQuestions(s))
      );
      return allResults.flat();
    },
  });

  return { questions: data, isLoading: subjectList.length > 0 && isLoading, isError };
}

export default useBuilderQuestions;
