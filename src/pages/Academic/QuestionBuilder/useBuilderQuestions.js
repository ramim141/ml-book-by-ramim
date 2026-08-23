import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { STALE } from '../../../lib/queryConfig';

/**
 * প্রশ্নপত্র নির্মাতার ডেটা উৎস।
 *
 * আগে এই পেজটা `src/data/academic/subjectsConfig.js` এর স্ট্যাটিক JSON পড়ত —
 * পুরো অ্যাপে একমাত্র সে-ই। ফলে অ্যাডমিন প্যানেল থেকে আপলোড করা কোনো প্রশ্নই
 * এখানে দেখা যেত না, আর মাত্র দুটো বিষয় (ICT, রসায়ন ১ম) হার্ডকোড করা ছিল।
 * এখন বাকি অ্যাপের মতোই `academic_content` কালেকশন থেকে পড়ে।
 *
 * বিষয় প্রতি একবারই পড়া হয় (অধ্যায় ধরে ধরে নয়) — অধ্যায় টিক/আনটিক করলে
 * তাই আর নেটওয়ার্ক কল যায় না, ফিল্টারিং পুরোটাই ক্লায়েন্টে।
 */

/** Firestore এ জ্ঞান/অনুধাবন দুটোই `type: 'knowledge'`, আসল ভাগটা ভিতরের ফিল্ডে। */
const normalizeType = (docType, raw) => {
  if (docType !== 'knowledge') return docType;
  return raw.type === 'k' ? 'k' : 'kh';
};

const buildNormalizer = (docType, chapters) => (docSnap) => {
  const raw = docSnap.data();
  const chapter = chapters.find((item) => item.id === raw.chapterId);
  const type = normalizeType(docType, raw);

  return {
    ...raw,
    id: docSnap.id,
    firebaseId: docSnap.id,
    type,
    uniqueId: `${type}-${docSnap.id}`,
    chapterId: raw.chapterId,
    chapterName: chapter?.title || chapter?.name || raw.chapterName || raw.chapterId,
  };
};

async function fetchSubjectQuestions(subject) {
  const chapters = subject.chapters || [];

  // তিনটি ধরন সমান্তরালে — Firestore এ `in` কোয়েরি করা যেত, কিন্তু তাতে
  // প্রতি ধরনের আলাদা নরমালাইজেশন হারিয়ে যায়।
  const [mcqSnap, cqSnap, knowledgeSnap] = await Promise.all(
    ['mcq', 'cq', 'knowledge'].map((docType) => getDocs(query(
      collection(db, 'academic_content'),
      where('subject', '==', subject.id),
      where('type', '==', docType),
    )))
  );

  return [
    ...mcqSnap.docs.map(buildNormalizer('mcq', chapters)),
    ...cqSnap.docs.map(buildNormalizer('cq', chapters)),
    ...knowledgeSnap.docs.map(buildNormalizer('knowledge', chapters)),
  ];
}

/**
 * @param subject  admin_settings/subjects এর একটি এন্ট্রি (null হলে কিছু পড়ে না)
 * @returns { questions, isLoading, isError }  বিষয়ের সব প্রশ্ন, নরমালাইজড
 */
export function useBuilderQuestions(subject) {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['builderQuestions', subject?.id],
    enabled: Boolean(subject?.id),
    staleTime: STALE.CONTENT,
    queryFn: () => fetchSubjectQuestions(subject),
  });

  return { questions: data, isLoading: Boolean(subject?.id) && isLoading, isError };
}

export default useBuilderQuestions;
