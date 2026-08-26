import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { STALE } from '../lib/queryConfig';
import { MEDICAL_SUBJECTS_DETAILED, MEDICAL_MNEMONICS } from '../data/academic/medicalConfig';
import { DEFAULT_ADMISSION_EXAM_SCHEDULES } from '../data/academic/admissionExamSchedules';

export const DEFAULT_ADMISSION_PROGRAMS = [
  {
    id: 'medical',
    title: 'মেডিকেল ও ডেন্টাল (MBBS & BDS)',
    subtitle: 'মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষার বিগত ২৫+ বছরের প্রশ্নব্যাংক ও প্রস্তুতি',
    path: '/academic/admission/medical',
    emoji: '🩺',
    badge: '১০০ MCQ / ৬০ মিনিট',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-500/15',
    iconBg: 'from-rose-500 to-pink-600',
    tags: ['MBBS', 'BDS', 'জীববিজ্ঞান ৩০', 'রসায়ন ২৫', 'পদার্থ ২০', 'ইংরেজি ১৫', 'জিকে ১০'],
    active: true,
    order: 1
  },
  {
    id: 'nursing',
    title: 'নার্সিং ভর্তি প্রস্তুতি (BSc & Diploma)',
    subtitle: 'বিএসসি ও ডিপ্লোমা নার্সিং ভর্তি পরীক্ষার প্রশ্নব্যাংক ও প্রস্তুতি',
    path: '/academic/admission/nursing',
    emoji: '🏥',
    badge: '১০০ নম্বর পরীক্ষা',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/15',
    iconBg: 'from-emerald-500 to-teal-600',
    tags: ['BSc Nursing', 'Diploma in Nursing', 'Midwifery'],
    active: true,
    order: 2
  },
  {
    id: 'engineering',
    title: 'ইঞ্জিনিয়ারিং (BUET, CKET, BUTEX)',
    subtitle: 'বুয়েট, চুয়েট, রুয়েট, কুয়েট, বুটেক্স ও প্রকৌশল বিশ্ববিদ্যালয় প্রস্তুতি',
    path: '/academic/admission/engineering',
    emoji: '⚙️',
    badge: 'MCQ + Written',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/15',
    iconBg: 'from-blue-500 to-indigo-600',
    tags: ['BUET', 'CKET (RUET, KUET, CUET)', 'BUTEX', 'MIST', 'IUT'],
    active: true,
    order: 3
  },
  {
    id: 'varsity-a',
    title: 'ভার্সিটি ক ইউনিট / বিজ্ঞান (DU A, JU, RU, SUST)',
    subtitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট, সাস্ট ও পাবলিক বিশ্ববিদ্যালয় বিজ্ঞান অনুষদ',
    path: '/academic/admission/varsity-a',
    emoji: '🔬',
    badge: 'MCQ + Written',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/15',
    iconBg: 'from-indigo-500 to-purple-600',
    tags: ['DU A Unit', 'SUST', 'JU A/D', 'RU', 'CU'],
    active: true,
    order: 4
  },
  {
    id: 'varsity-b',
    title: 'ভার্সিটি খ ইউনিট / মানবিক (DU B, Arts)',
    subtitle: 'ঢাকা বিশ্ববিদ্যালয় ‘খ’ ইউনিট, বাংলা, ইংরেজি ও সাধারণ জ্ঞান প্রস্তুতি',
    path: '/academic/admission/varsity-b',
    emoji: '📚',
    badge: 'মানবিক ও বিভাগ পরিবর্তন',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/15',
    iconBg: 'from-amber-500 to-orange-600',
    tags: ['DU B Unit', 'JU B/C', 'বাংলা', 'English', 'General Knowledge'],
    active: true,
    order: 5
  },
  {
    id: 'varsity-c',
    title: 'ভার্সিটি গ ইউনিট / বাণিজ্য (DU C, Commerce)',
    subtitle: 'ঢাকা বিশ্ববিদ্যালয় ‘গ’ ইউনিট, হিসাববিজ্ঞান ও ব্যবসায় শিক্ষা অনুষদ',
    path: '/academic/admission/varsity-c',
    emoji: '💼',
    badge: 'ব্যবসায় শিক্ষা',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/15',
    iconBg: 'from-cyan-500 to-blue-600',
    tags: ['DU C Unit', 'হিসাববিজ্ঞান', 'ব্যবসায় সংগঠন', 'ফিন্যান্স'],
    active: true,
    order: 6
  },
  {
    id: 'gst',
    title: 'GST গুচ্ছ (২৪টি সাধারণ ও বিজ্ঞান প্রযুক্তি)',
    subtitle: 'সমন্বিত সাধারণ, বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় ভর্তি পরীক্ষা',
    path: '/academic/admission/gst',
    emoji: '🏛️',
    badge: '২৪ বিশ্ববিদ্যালয় ক্লাস্টার',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-500/15',
    iconBg: 'from-purple-500 to-fuchsia-600',
    tags: ['GST Science', 'GST Humanities', 'GST Business'],
    active: true,
    order: 7
  },
  {
    id: 'agri',
    title: 'কৃষি গুচ্ছ (Agri Cluster)',
    subtitle: '৮টি কৃষি বিশ্ববিদ্যালয়ের সমন্বিত কৃষি গুচ্ছ ভর্তি পরীক্ষা',
    path: '/academic/admission/agri',
    emoji: '🌾',
    badge: 'কৃষি বিশ্ববিদ্যালয় গুচ্ছ',
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    color: 'bg-lime-500/10 text-lime-400 border-lime-500/20 hover:border-lime-500/50 hover:bg-lime-500/15',
    iconBg: 'from-lime-500 to-green-600',
    tags: ['BAU', 'BSMRAU', 'SAU', 'CVASU', 'SAU Sylhet'],
    active: true,
    order: 8
  },
  {
    id: 'iba-bup',
    title: 'IBA ও BUP (Business & General)',
    subtitle: 'ঢাবি আইবিএ ও বাংলাদেশ ইউনিভার্সিটি অব প্রফেশনালস ভর্তি প্রস্তুতি',
    path: '/academic/admission/iba-bup',
    emoji: '🎯',
    badge: 'English & Analytical Math',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/15',
    iconBg: 'from-fuchsia-500 to-pink-600',
    tags: ['DU IBA', 'JU IBA', 'BUP FBS', 'BUP FASS', 'BUP FST'],
    active: true,
    order: 9
  }
];

export const DEFAULT_ADMISSION_SHORTCUTS = [
  ...MEDICAL_MNEMONICS.map(m => ({
    id: m.id,
    track: 'medical',
    trackLabel: 'মেডিকেল ও ডেন্টাল',
    title: m.topic,
    technique: m.technique,
    category: 'ছন্দ ও মেমোরাইজেশন',
    subject: m.subject,
    details: m.explanation,
    reference: m.reference
  })),
  {
    id: 'hc-1',
    track: 'hand_calc',
    trackLabel: 'হ্যান্ড ক্যালকুলেশন (মেডিকেল ও ঢাবি ক)',
    title: 'pH ও pOH নির্ণয়ের সুপার শর্টকাট (ক্যালকুলেটর ছাড়া)',
    technique: 'শর্টকাট সূত্র: [H+] = a × 10^-b হলে, pH = b - log(a)',
    category: 'রসায়ন হ্যান্ড ক্যালকুলেশন',
    subject: 'Chemistry',
    details: [
      'লগ মানগুলো মুখস্থ রাখুন: log 2 = 0.3, log 3 = 0.48, log 4 = 0.6, log 5 = 0.7, log 7 = 0.85',
      'উদাহরণ ১: [H+] = 2 × 10^-4 M হলে, pH = 4 - log 2 = 4 - 0.3 = 3.7',
      'উদাহরণ ২: [H+] = 3 × 10^-5 M হলে, pH = 5 - log 3 = 5 - 0.48 = 4.52',
      'উদাহরণ ৩: [OH-] = 5 × 10^-3 M হলে, pOH = 3 - log 5 = 3 - 0.7 = 2.3 ➔ pH = 14 - 2.3 = 11.7'
    ],
    reference: 'মেডিকেল ও ঢাবি ক-ইউনিট স্পেশাল'
  },
  {
    id: 'hc-2',
    track: 'hand_calc',
    trackLabel: 'হ্যান্ড ক্যালকুলেশন (মেডিকেল ও ঢাবি ক)',
    title: 'তেজস্ক্রিয় অর্ধায়ু ও অবশিষ্ট পরিমাণ বের করার ট্রিকস',
    technique: 'শর্টকাট সূত্র: N = N0 / (2^n), যেখানে n = মোট সময় / অর্ধায়ু',
    category: 'পদার্থবিজ্ঞান শর্টকাট',
    subject: 'Physics',
    details: [
      'n = 1 হলে অবশিষ্ট থাকে 1/2 বা 50%',
      'n = 2 হলে অবশিষ্ট থাকে 1/4 বা 25%',
      'n = 3 হলে অবশিষ্ট থাকে 1/8 বা 12.5%',
      'n = 4 হলে অবশিষ্ট থাকে 1/16 বা 6.25%',
      'উদাহরণ: কোনো পদার্থের অর্ধায়ু ৫ দিন হলে ২০ দিন পর অবশিষ্ট থাকবে: n = 20/5 = 4 ➔ N = N0 / 2^4 = N0 / 16 (৬.২৫%)'
    ],
    reference: 'পদার্থবিজ্ঞান ২য় পত্র (নিউক্লিয়ার ফিজিক্স)'
  },
  {
    id: 'eng-1',
    track: 'engineering',
    trackLabel: 'ইঞ্জিনিয়ারিং ক্যালকুলেটর হ্যাকস',
    title: 'fx-991EX / CW দিয়ে নির্দিষ্ট ইন্টিগ্রেশন ও ম্যাট্রিক্স সমাধান',
    technique: 'ক্যালকুলেটরে সরাসরি ∫(f(x), a, b) ইনপুট দিয়ে ৫ সেকেন্ডে উত্তর বের করা',
    category: 'গণিত ক্যালকুলেটর ট্রিকস',
    subject: 'Higher Math',
    details: [
      'ত্রিকোণমিতিক ইন্টিগ্রেশন থাকলে ক্যালকুলেটর অবশ্যই RAD (Radian) মোডে নিতে হবে: Shift + Menu ➔ 2: Angle Unit ➔ 2: Radian।',
      'অসীম লিমিট থাকলে (∞) এর জায়গায় 9999 বা 10^5 ইনপুট দিন।',
      'ম্যাট্রিক্সের ইনভার্স ও ডিটারমিন্যান্ট: Menu ➔ 4: Matrix ➔ Define MatA ➔ OPTN ➔ MatA^-1।'
    ],
    reference: 'বুয়েট ও সিকেয়েট প্রিলিমিনারি'
  },
  {
    id: 'eng-2',
    track: 'engineering',
    trackLabel: 'ইঞ্জিনিয়ারিং ক্যালকুলেটর হ্যাকস',
    title: 'জটিল সংখ্যা (Complex Numbers) মডুলাস, আর্গুমেন্ট ও পোলার রূপান্তর',
    technique: 'Menu ➔ 2: Complex মোডে সমীকরণ সমাধান',
    category: 'গণিত ক্যালকুলেটর ট্রিকস',
    subject: 'Higher Math',
    details: [
      'যেকোনো জটিল সংখ্যা (যেমন: 1 + √3 i) লিখে OPTN ➔ 1: r∠θ চাপলে সরাসরি মডুলাস ও মুখ্য আর্গুমেন্ট বের হয়ে যাবে।',
      'i এর ঘাত: i^n এর জন্য ঘাতকে ৪ দিয়ে ভাগ করে ভাগশেষ নিন (i^1 = i, i^2 = -1, i^3 = -i, i^4 = 1)।'
    ],
    reference: 'বুয়েট, রুয়েট, কুয়েট, চুয়েট'
  },
  {
    id: 'va-1',
    track: 'varsity_a',
    trackLabel: 'ভার্সিটি ক ইউনিট (DU A Unit)',
    title: 'সরলরেখার লম্ব ও সমান্তরাল দূরত্বের শর্টকাট',
    technique: 'দুটি সমান্তরাল সরলরেখা Ax + By + C1 = 0 এবং Ax + By + C2 = 0 এর মধ্যবর্তী দূরত্ব d = |C1 - C2| / √(A^2 + B^2)',
    category: 'গণিত শর্টকাট',
    subject: 'Higher Math',
    details: [
      'প্রথমে দুই সমীকরণের x ও y এর সহগ সমান করে নিতে হবে।',
      'বিন্দু (x1, y1) থেকে রেখার লম্ব দূরত্ব = |A x1 + B y1 + C| / √(A^2 + B^2)।'
    ],
    reference: 'ঢাবি ক-ইউনিট ও সাস্ট'
  },
  {
    id: 'gk-eng-1',
    track: 'gk_english',
    trackLabel: 'মেডিকেল ও ভার্সিটি ইংলিশ/জিকে',
    title: 'মুক্তিযুদ্ধের ১১টি সেক্টর ও সেক্টর কমান্ডার মনে রাখার ছন্দ',
    technique: 'ছন্দ: "জিয়া খালেদ শফিউল্লাহ, সি আর দত্ত শওকত আলী, ওসমানীর নেতৃত্বে দেশ স্বাধীন হলো খালি"',
    category: 'সাধারণ জ্ঞান শর্টকাট',
    subject: 'General Knowledge',
    details: [
      'সেক্টর ১: মেজর জিয়াউর রহমান / মেজর রফিকুল ইসলাম (চট্টগ্রাম)',
      'সেক্টর ২: মেজর খালেদ মোশাররফ (ঢাকা, কুমিল্লা, ফরিদপুর)',
      'সেক্টর ৩: মেজর কে এম শফিউল্লাহ (ময়মনসিংহ, কিশোরগঞ্জ)',
      'সেক্টর ৪: মেজর সি আর দত্ত (সিলেট)',
      'সেক্টর ৮: মেজর এম এ মঞ্জুর ও মেজর আবু ওসমান চৌধুরী (কুষ্টিয়া, যশোর, খুলনা)',
      '১০ নং সেক্টর: নৌ সেক্টর (কোনো নিয়মিত কমান্ডার ছিল না, কম্যান্ডোদের নিয়ন্ত্রণাধীন)'
    ],
    reference: 'মেডিকেল ও ভার্সিটি জিকে'
  }
];

export const DEFAULT_ADMISSION_SESSIONS = [
  // MBBS
  { id: 'mbbs-23-24', examType: 'MBBS', session: '2023-2024', shortYear: '23-24', totalQuestions: 100, examDate: '০৯ ফেব্রুয়ারি ২০২৪', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-22-23', examType: 'MBBS', session: '2022-2023', shortYear: '22-23', totalQuestions: 100, examDate: '১০ মার্চ ২০২৩', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-21-22', examType: 'MBBS', session: '2021-2022', shortYear: '21-22', totalQuestions: 100, examDate: '০১ এপ্রিল ২০২২', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-20-21', examType: 'MBBS', session: '2020-2021', shortYear: '20-21', totalQuestions: 100, examDate: '০২ এপ্রিল ২০২১', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-19-20', examType: 'MBBS', session: '2019-2020', shortYear: '19-20', totalQuestions: 100, examDate: '১১ অক্টোবর ২০১৯', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-18-19', examType: 'MBBS', session: '2018-2019', shortYear: '18-19', totalQuestions: 100, examDate: '০৫ অক্টোবর ২০১৮', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-17-18', examType: 'MBBS', session: '2017-2018', shortYear: '17-18', totalQuestions: 100, examDate: '০৬ অক্টোবর ২০১৭', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'mbbs-16-17', examType: 'MBBS', session: '2016-2017', shortYear: '16-17', totalQuestions: 100, examDate: '০৭ অক্টোবর ২০১৬', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  // BDS
  { id: 'bds-23-24', examType: 'BDS', session: '2023-2024', shortYear: '23-24', totalQuestions: 100, examDate: '০৮ মার্চ ২০২৪', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'bds-22-23', examType: 'BDS', session: '2022-2023', shortYear: '22-23', totalQuestions: 100, examDate: '২১ এপ্রিল ২০২৩', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'bds-21-22', examType: 'BDS', session: '2021-2022', shortYear: '21-22', totalQuestions: 100, examDate: '২২ এপ্রিল ২০২২', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'bds-20-21', examType: 'BDS', session: '2020-2021', shortYear: '20-21', totalQuestions: 100, examDate: '১০ সেপ্টেম্বর ২০২১', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
  { id: 'bds-19-20', examType: 'BDS', session: '2019-2020', shortYear: '19-20', totalQuestions: 100, examDate: '০১ নভেম্বর ২০১৯', status: 'সম্পূর্ণ প্রশ্নব্যাংক', active: true },
];

/**
 * Fetch Admission Programs from Firestore admin_settings/admission
 */
async function fetchAdmissionPrograms() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'admission'));
    if (!snap.exists() || !snap.data().programs?.length) {
      return DEFAULT_ADMISSION_PROGRAMS;
    }
    return snap.data().programs;
  } catch (error) {
    console.error('Error fetching admission programs:', error);
    return DEFAULT_ADMISSION_PROGRAMS;
  }
}

/**
 * Fetch Admission Shortcuts from Firestore admin_settings/admission_shortcuts
 */
async function fetchAdmissionShortcuts() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'admission_shortcuts'));
    if (!snap.exists() || !snap.data().list?.length) {
      return DEFAULT_ADMISSION_SHORTCUTS;
    }
    return snap.data().list;
  } catch (error) {
    console.error('Error fetching admission shortcuts:', error);
    return DEFAULT_ADMISSION_SHORTCUTS;
  }
}

/**
 * Fetch Admission Sessions from Firestore admin_settings/admission_sessions
 */
async function fetchAdmissionSessions() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'admission_sessions'));
    if (!snap.exists() || !snap.data().list?.length) {
      return DEFAULT_ADMISSION_SESSIONS;
    }
    return snap.data().list;
  } catch (error) {
    console.error('Error fetching admission sessions:', error);
    return DEFAULT_ADMISSION_SESSIONS;
  }
}

/**
 * React Query hook for dynamic admission programs
 */
export function useAdmissionPrograms() {
  return useQuery({
    queryKey: ['academic', 'admission', 'programs'],
    queryFn: fetchAdmissionPrograms,
    staleTime: STALE?.CONFIG || 60 * 1000 * 60,
    initialData: DEFAULT_ADMISSION_PROGRAMS,
  });
}

/**
 * React Query hook for dynamic admission shortcuts & tricks
 */
export function useAdmissionShortcuts() {
  return useQuery({
    queryKey: ['academic', 'admission', 'shortcuts'],
    queryFn: fetchAdmissionShortcuts,
    staleTime: STALE?.CONFIG || 60 * 1000 * 60,
    initialData: DEFAULT_ADMISSION_SHORTCUTS,
  });
}

/**
 * React Query hook for dynamic admission sessions
 */
export function useAdmissionSessions() {
  return useQuery({
    queryKey: ['academic', 'admission', 'sessions'],
    queryFn: fetchAdmissionSessions,
    staleTime: STALE?.CONFIG || 60 * 1000 * 60,
    initialData: DEFAULT_ADMISSION_SESSIONS,
  });
}

export const DEFAULT_MEDICAL_CONFIG = {
  subjects: MEDICAL_SUBJECTS_DETAILED,
  updatedAt: new Date().toISOString()
};

/**
 * Fetch Medical detailed subjects & chapters from Firestore admin_settings/medical_config
 */
async function fetchMedicalConfig() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'medical_config'));
    if (!snap.exists() || !snap.data().subjects?.length) {
      return MEDICAL_SUBJECTS_DETAILED;
    }
    return snap.data().subjects;
  } catch (error) {
    console.error('Error fetching medical config:', error);
    return MEDICAL_SUBJECTS_DETAILED;
  }
}

/**
 * React Query hook for dynamic medical detailed subjects & chapters
 */
export function useMedicalConfig() {
  return useQuery({
    queryKey: ['academic', 'admission', 'medical_config'],
    queryFn: fetchMedicalConfig,
    staleTime: STALE?.CONFIG || 60 * 1000 * 60,
    initialData: MEDICAL_SUBJECTS_DETAILED,
  });
}

export { DEFAULT_ADMISSION_EXAM_SCHEDULES };

/**
 * Fetch Admission Exam Schedules from Firestore admin_settings/admission_exam_schedules
 */
async function fetchAdmissionExamSchedules() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'admission_exam_schedules'));
    if (!snap.exists()) {
      return DEFAULT_ADMISSION_EXAM_SCHEDULES;
    }
    return snap.data().schedules || [];
  } catch (error) {
    console.error('Error fetching admission exam schedules:', error);
    return DEFAULT_ADMISSION_EXAM_SCHEDULES;
  }
}

/**
 * React Query hook for dynamic admission exam schedules
 */
export function useAdmissionExamSchedules() {
  return useQuery({
    queryKey: ['academic', 'admission', 'exam_schedules'],
    queryFn: fetchAdmissionExamSchedules,
    staleTime: STALE?.CONFIG || 60 * 1000 * 60,
    initialData: DEFAULT_ADMISSION_EXAM_SCHEDULES,
  });
}


