import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { QK, STALE } from '../lib/queryConfig';

export const DEFAULT_ACADEMIC_SUBJECTS = [
  {
    id: 'hsc-ict',
    label: 'HSC ICT',
    level: 'HSC',
    emoji: '💻',
    color: 'from-indigo-500 to-purple-500',
    chapters: [
      { id: 'chapter-1', title: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', name: 'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত' },
      { id: 'chapter-2', title: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', name: 'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং' },
      { id: 'chapter-3', title: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', name: 'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস' },
      { id: 'chapter-4', title: 'ওয়েব ডিজাইন পরিচিতি এবং HTML', name: 'ওয়েব ডিজাইন পরিচিতি এবং HTML' },
      { id: 'chapter-5', title: 'প্রোগ্রামিং ভাষা (C)', name: 'প্রোগ্রামিং ভাষা (C)' },
      { id: 'chapter-6', title: 'ডাটাবেজ ম্যানেজমেন্ট সিস্টেম', name: 'ডাটাবেজ ম্যানেজমেন্ট সিস্টেম' },
    ]
  },
  {
    id: 'hsc-chemistry-1',
    label: 'রসায়ন ১ম পত্র',
    level: 'HSC',
    emoji: '🧪',
    color: 'from-emerald-500 to-teal-500',
    chapters: [
      { id: 'chapter-1', title: 'ল্যাবরেটরির নিরাপদ ব্যবহার', name: 'ল্যাবরেটরির নিরাপদ ব্যবহার' },
      { id: 'chapter-2', title: 'গুণগত রসায়ন', name: 'গুণগত রসায়ন' },
      { id: 'chapter-3', title: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', name: 'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন' },
      { id: 'chapter-4', title: 'রাসায়নিক পরিবর্তন', name: 'রাসায়নিক পরিবর্তন' },
      { id: 'chapter-5', title: 'কর্মমুখী রসায়ন', name: 'কর্মমুখী রসায়ন' },
    ]
  },
  {
    id: 'hsc-chemistry-2',
    label: 'রসায়ন ২য় পত্র',
    level: 'HSC',
    emoji: '⚗️',
    color: 'from-emerald-500 to-teal-500',
    chapters: [
      { id: 'chapter-1', title: 'পরিবেশ রসায়ন', name: 'পরিবেশ রসায়ন' },
      { id: 'chapter-2', title: 'জৈব রসায়ন', name: 'জৈব রসায়ন' },
      { id: 'chapter-3', title: 'পরিমাণগত রসায়ন', name: 'পরিমাণগত রসায়ন' },
      { id: 'chapter-4', title: 'তড়িৎ রসায়ন', name: 'তড়িৎ রসায়ন' },
      { id: 'chapter-5', title: 'অর্থনৈতিক রসায়ন', name: 'অর্থনৈতিক রসায়ন' },
    ]
  },
  {
    id: 'hsc-physics-1',
    label: 'পদার্থবিজ্ঞান ১ম পত্র',
    level: 'HSC',
    emoji: '⚛️',
    color: 'from-sky-500 to-blue-600',
    chapters: [
      { id: 'chapter-1', title: 'ভৌতজগৎ ও পরিমাপ', name: 'ভৌতজগৎ ও পরিমাপ' },
      { id: 'chapter-2', title: 'ভেক্টর', name: 'ভেক্টর' },
      { id: 'chapter-3', title: 'গতিবিদ্যা', name: 'গতিবিদ্যা' },
      { id: 'chapter-4', title: 'নিউটনিয়ান বলবিদ্যা', name: 'নিউটনিয়ান বলবিদ্যা' },
      { id: 'chapter-5', title: 'কাজ, শক্তি ও ক্ষমতা', name: 'কাজ, শক্তি ও ক্ষমতা' },
      { id: 'chapter-6', title: 'মহাকর্ষ ও অভিকর্ষ', name: 'মহাকর্ষ ও অভিকর্ষ' },
      { id: 'chapter-7', title: 'পদার্থের গাঠনিক ধর্ম', name: 'পদার্থের গাঠনিক ধর্ম' },
      { id: 'chapter-8', title: 'পর্যায়বৃত্ত গতি', name: 'পর্যায়বৃত্ত গতি' },
      { id: 'chapter-9', title: 'তরঙ্গ', name: 'তরঙ্গ' },
      { id: 'chapter-10', title: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', name: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব' },
    ]
  },
  {
    id: 'hsc-physics-2',
    label: 'পদার্থবিজ্ঞান ২য় পত্র',
    level: 'HSC',
    emoji: '🔭',
    color: 'from-sky-500 to-blue-600',
    chapters: [
      { id: 'chapter-1', title: 'তাপগতিবিদ্যা', name: 'তাপগতিবিদ্যা' },
      { id: 'chapter-2', title: 'স্থির তড়িৎ', name: 'স্থির তড়িৎ' },
      { id: 'chapter-3', title: 'চল তড়িৎ', name: 'চল তড়িৎ' },
      { id: 'chapter-4', title: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', name: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব' },
      { id: 'chapter-5', title: 'তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ', name: 'তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ' },
      { id: 'chapter-6', title: 'জ্যামিতিক আলোকবিজ্ঞান', name: 'জ্যামিতিক আলোকবিজ্ঞান' },
      { id: 'chapter-7', title: 'ভৌত আলোকবিজ্ঞান', name: 'ভৌত আলোকবিজ্ঞান' },
      { id: 'chapter-8', title: 'আধুনিক পদার্থবিজ্ঞানের সূচনা', name: 'আধুনিক পদার্থবিজ্ঞানের সূচনা' },
      { id: 'chapter-9', title: 'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান', name: 'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান' },
      { id: 'chapter-10', title: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', name: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স' },
      { id: 'chapter-11', title: 'জ্যোতির্বিজ্ঞান', name: 'জ্যোতির্বিজ্ঞান' },
    ]
  },
  {
    id: 'hsc-biology-1',
    label: 'জীববিজ্ঞান ১ম পত্র',
    level: 'HSC',
    emoji: '🧬',
    color: 'from-green-500 to-lime-600',
    chapters: [
      { id: 'chapter-1', title: 'কোষ ও এর গঠন', name: 'কোষ ও এর গঠন' },
      { id: 'chapter-2', title: 'কোষ বিভাজন', name: 'কোষ বিভাজন' },
      { id: 'chapter-3', title: 'কোষ রসায়ন', name: 'কোষ রসায়ন' },
      { id: 'chapter-4', title: 'অণুজীব', name: 'অণুজীব' },
      { id: 'chapter-5', title: 'শৈবাল ও ছত্রাক', name: 'শৈবাল ও ছত্রাক' },
      { id: 'chapter-6', title: 'ব্রায়োফাইটা ও টেরিডোফাইটা', name: 'ব্রায়োফাইটা ও টেরিডোফাইটা' },
      { id: 'chapter-7', title: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', name: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ' },
      { id: 'chapter-8', title: 'টিস্যু ও টিস্যুতন্ত্র', name: 'টিস্যু ও টিস্যুতন্ত্র' },
      { id: 'chapter-9', title: 'উদ্ভিদ শারীরতত্ত্ব', name: 'উদ্ভিদ শারীরতত্ত্ব' },
      { id: 'chapter-10', title: 'উদ্ভিদ প্রজনন', name: 'উদ্ভিদ প্রজনন' },
      { id: 'chapter-11', title: 'জীবপ্রযুক্তি', name: 'জীবপ্রযুক্তি' },
      { id: 'chapter-12', title: 'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ', name: 'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ' },
    ]
  },
  {
    id: 'hsc-biology-2',
    label: 'জীববিজ্ঞান ২য় পত্র',
    level: 'HSC',
    emoji: '🌿',
    color: 'from-green-500 to-lime-600',
    chapters: [
      { id: 'chapter-1', title: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', name: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস' },
      { id: 'chapter-2', title: 'প্রাণীর পরিচিতি', name: 'প্রাণীর পরিচিতি' },
      { id: 'chapter-3', title: 'মানব শারীরতত্ত্ব: পরিপাক ও শোষণ', name: 'মানব শারীরতত্ত্ব: পরিপাক ও শোষণ' },
      { id: 'chapter-4', title: 'মানব শারীরতত্ত্ব: রক্ত ও সংবহন', name: 'মানব শারীরতত্ত্ব: রক্ত ও সংবহন' },
      { id: 'chapter-5', title: 'মানব শারীরতত্ত্ব: শ্বাসক্রিয়া ও শ্বসন', name: 'মানব শারীরতত্ত্ব: শ্বাসক্রিয়া ও শ্বসন' },
      { id: 'chapter-6', title: 'মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন', name: 'মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন' },
      { id: 'chapter-7', title: 'মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা', name: 'মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা' },
      { id: 'chapter-8', title: 'মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ', name: 'মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ' },
      { id: 'chapter-9', title: 'মানব জীবনের ধারাবাহিকতা', name: 'মানব জীবনের ধারাবাহিকতা' },
      { id: 'chapter-10', title: 'মানবদেহের প্রতিরক্ষা (ইমিউনিটি)', name: 'মানবদেহের প্রতিরক্ষা (ইমিউনিটি)' },
      { id: 'chapter-11', title: 'জিনতত্ত্ব ও বিবর্তন', name: 'জিনতত্ত্ব ও বিবর্তন' },
      { id: 'chapter-12', title: 'প্রাণীর আচরণ', name: 'প্রাণীর আচরণ' },
    ]
  },
  {
    id: 'hsc-math-1',
    label: 'উচ্চতর গণিত ১ম পত্র',
    level: 'HSC',
    emoji: '📐',
    color: 'from-yellow-500 to-orange-500',
    chapters: [
      { id: 'chapter-1', title: 'ম্যাট্রিক্স ও নির্ণায়ক', name: 'ম্যাট্রিক্স ও নির্ণায়ক' },
      { id: 'chapter-2', title: 'ভেক্টর', name: 'ভেক্টর' },
      { id: 'chapter-3', title: 'সরলরেখা', name: 'সরলরেখা' },
      { id: 'chapter-4', title: 'বৃত্ত', name: 'বৃত্ত' },
      { id: 'chapter-5', title: 'বিন্যাস ও সমাবেশ', name: 'বিন্যাস ও সমাবেশ' },
      { id: 'chapter-6', title: 'ত্রিকোণমিতিক অনুপাত', name: 'ত্রিকোণমিতিক অনুপাত' },
      { id: 'chapter-7', title: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', name: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত' },
      { id: 'chapter-8', title: 'ফাংশন ও ফাংশনের লেখচিত্র', name: 'ফাংশন ও ফাংশনের লেখচিত্র' },
      { id: 'chapter-9', title: 'অন্তরীকরণ', name: 'অন্তরীকরণ' },
      { id: 'chapter-10', title: 'যোগজীকরণ', name: 'যোগজীকরণ' },
    ]
  },
  {
    id: 'hsc-math-2',
    label: 'উচ্চতর গণিত ২য় পত্র',
    level: 'HSC',
    emoji: '📊',
    color: 'from-yellow-500 to-orange-500',
    chapters: [
      { id: 'chapter-1', title: 'বাস্তব সংখ্যা ও অসমতা', name: 'বাস্তব সংখ্যা ও অসমতা' },
      { id: 'chapter-2', title: 'যোগাশ্রয়ী প্রোগ্রাম', name: 'যোগাশ্রয়ী প্রোগ্রাম' },
      { id: 'chapter-3', title: 'জটিল সংখ্যা', name: 'জটিল সংখ্যা' },
      { id: 'chapter-4', title: 'বহুপদী ও বহুপদী সমীকরণ', name: 'বহুপদী ও বহুপদী সমীকরণ' },
      { id: 'chapter-5', title: 'দ্বিপদী বিস্তার', name: 'দ্বিপদী বিস্তার' },
      { id: 'chapter-6', title: 'কণিক', name: 'কণিক' },
      { id: 'chapter-7', title: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ', name: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ' },
      { id: 'chapter-8', title: 'স্থিতিবিদ্যা', name: 'স্থিতিবিদ্যা' },
      { id: 'chapter-9', title: 'সমতলে বস্তুকণার গতি', name: 'সমতলে বস্তুকণার গতি' },
      { id: 'chapter-10', title: 'বিস্তার পরিমাপ ও সম্ভাবনা', name: 'বিস্তার পরিমাপ ও সম্ভাবনা' },
    ]
  },
  {
    id: 'hsc-bangla-1',
    label: 'বাংলা ১ম পত্র',
    level: 'HSC',
    emoji: '📖',
    color: 'from-rose-500 to-pink-600',
    chapters: [
      { id: 'chapter-1', title: 'গদ্য', name: 'গদ্য' },
      { id: 'chapter-2', title: 'পদ্য', name: 'পদ্য' },
      { id: 'chapter-3', title: 'সহপাঠ (উপন্যাস ও নাটক)', name: 'সহপাঠ (উপন্যাস ও নাটক)' },
    ]
  },
  {
    id: 'hsc-english-1',
    label: 'English 1st Paper',
    level: 'HSC',
    emoji: '🇬🇧',
    color: 'from-violet-500 to-purple-600',
    chapters: [
      { id: 'chapter-1', title: 'Reading Comprehension', name: 'Reading Comprehension' },
      { id: 'chapter-2', title: 'Vocabulary & Grammar', name: 'Vocabulary & Grammar' },
    ]
  },
];

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
  const pool = Array.isArray(subjects) && subjects.length > 0 ? subjects : DEFAULT_ACADEMIC_SUBJECTS;

  let found = pool.find((subject) => {
    const subjectLevel = normalizeAcademicLevel(subject.level);
    if (subjectLevel !== level) return false;

    const id = String(subject.id || '').toLowerCase();
    return id === `${level}-${slug}` || id === slug || getSubjectSlug(subject) === slug;
  });

  if (!found && pool !== DEFAULT_ACADEMIC_SUBJECTS) {
    found = DEFAULT_ACADEMIC_SUBJECTS.find((subject) => {
      const subjectLevel = normalizeAcademicLevel(subject.level);
      if (subjectLevel !== level) return false;

      const id = String(subject.id || '').toLowerCase();
      return id === `${level}-${slug}` || id === slug || getSubjectSlug(subject) === slug;
    });
  }

  return found || null;
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
      const list = snap.exists() ? snap.data().list || [] : [];
      return list.length > 0 ? list : DEFAULT_ACADEMIC_SUBJECTS;
    },
    staleTime: STALE.CONFIG,
    select: (list) => resolveSubjectFromRoute(list, educationLevel, subjectSlug),
  });
};
