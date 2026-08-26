/**
 * Admission Requirements & Historical Cut-Off Marks Database
 * Covers Medical (MBBS/BDS), Engineering, Public Universities, GST, Agri, and Nursing.
 */

export const ADMISSION_UNIVERSITIES = [
  {
    id: 'medical-mbbs',
    name: 'মেডিকেল ও ডেন্টাল (MBBS & BDS)',
    category: 'Medical',
    badge: 'স্বাস্থ্য শিক্ষা অধিদপ্তর',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    totalMarks: 300, // 100 MCQ + 200 GPA
    examMarks: 100,
    gpaMarks: 200, // SSC GPA * 15 + HSC GPA * 25 (or current formula)
    minCombinedGpa: 9.00,
    minIndividualGpa: 4.00,
    minBioGrade: 4.00, // Bio min A- (GP 4.0) or GP 3.5
    allowsSecondTime: true,
    secondTimePenalty: 5.00, // 5 marks deduction
    seatsCount: '৫,৩৮০ (MBBS) + ৫৪৫ (BDS)',
    examPattern: '১০০ নম্বরের MCQ (বায়োলজি ৩০, কেমিস্ট্রি ২৫, ফিজিক্স ২০, ইংরেজি ১৫, জিকে ১০)। নেগেটিভ মার্কিং ০.২৫।',
    cutOffHistory: [
      { year: '2023-24', examScore: 68.5, totalScore: 268.5, topCollege: 'DMC: 78.5+' },
      { year: '2022-23', examScore: 67.0, totalScore: 267.0, topCollege: 'DMC: 77.0+' },
      { year: '2021-22', examScore: 70.0, totalScore: 270.0, topCollege: 'DMC: 80.0+' },
      { year: '2020-21', examScore: 65.5, totalScore: 265.5, topCollege: 'DMC: 75.5+' },
    ],
    safeExamScore: 72,
    moderateExamScore: 66,
    checkEligibility: ({ sscGpa, hscGpa, bioGrade, isSecondTime }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (sscGpa < 4.0) reasons.push('SSC-তে ন্যূনতম GPA 4.00 প্রয়োজন (বর্তমান: ' + sscGpa + ')');
      if (hscGpa < 4.0) reasons.push('HSC-তে ন্যূনতম GPA 4.00 প্রয়োজন (বর্তমান: ' + hscGpa + ')');
      if (combined < 9.0) reasons.push('SSC ও HSC মিলিয়ে মোট GPA 9.00 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');
      if (bioGrade < 4.0) reasons.push('HSC জীববিজ্ঞানে ন্যূনতম GPA 4.00 (A Grade) প্রয়োজন (বর্তমান: ' + bioGrade + ')');

      return {
        eligible: reasons.length === 0,
        reasons,
        note: isSecondTime ? 'সেকেন্ড টাইমার হিসেবে ৫ নম্বর কর্তন প্রযোজ্য।' : null,
      };
    }
  },
  {
    id: 'buet',
    name: 'বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)',
    category: 'Engineering',
    badge: 'বুয়েট ইঞ্জিনিয়ারিং',
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-500/30',
    totalMarks: 400, // Preli 100 + Written 400
    examMarks: 400,
    minCombinedGpa: 10.00,
    minIndividualGpa: 5.00,
    requiresTopGradePhyChemMath: true,
    allowsSecondTime: false,
    secondTimePenalty: 0,
    seatsCount: '১,৩০৯টি আসন',
    examPattern: 'প্রিলিমিনারি ১০০ নম্বরের MCQ + মূল লিখিত ৪০০ নম্বরের পরীক্ষা (পদার্থ, রসায়ন, গণিত)।',
    cutOffHistory: [
      { year: '2023-24', examScore: 240, totalScore: 240, topCollege: 'CSE/EEE: 285+' },
      { year: '2022-23', examScore: 230, totalScore: 230, topCollege: 'CSE/EEE: 275+' },
      { year: '2021-22', examScore: 245, totalScore: 245, topCollege: 'CSE/EEE: 290+' },
    ],
    safeExamScore: 260,
    moderateExamScore: 225,
    checkEligibility: ({ sscGpa, hscGpa, phyGrade, chemGrade, mathGrade, isSecondTime }) => {
      const reasons = [];
      if (isSecondTime) reasons.push('বুয়েটে সেকেন্ড টাইম পরীক্ষার সুযোগ নেই।');
      if (sscGpa < 4.0) reasons.push('SSC-তে ন্যূনতম GPA 4.00 প্রয়োজন।');
      if (hscGpa < 5.0) reasons.push('HSC-তে মোট GPA 5.00 (Golden/A+) প্রয়োজন (বর্তমান: ' + hscGpa + ')');
      if (phyGrade < 5.0 || chemGrade < 5.0 || mathGrade < 5.0) {
        reasons.push('HSC পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিত প্রতিটিতে GPA 5.00 (A+) প্রয়োজন।');
      }

      return {
        eligible: reasons.length === 0,
        reasons,
        note: 'শর্টলিস্টে শীর্ষ ২৪,০০০ প্রিলিমিনারি দেওয়ার সুযোগ পায়।',
      };
    }
  },
  {
    id: 'ckruet',
    name: 'প্রকৌশল গুচ্ছ (RUET, KUET, CUET)',
    category: 'Engineering',
    badge: 'ইঞ্জিনিয়ারিং গুচ্ছ',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/30',
    totalMarks: 500,
    examMarks: 500,
    minCombinedGpa: 9.50,
    minIndividualGpa: 4.50,
    allowsSecondTime: true,
    secondTimePenalty: 0,
    seatsCount: '৩,২৩১টি আসন',
    examPattern: '৫০০ নম্বরের লিখিত/MCQ সমন্বিত পরীক্ষা (পদার্থ, রসায়ন, গণিত ও ইংরেজি)।',
    cutOffHistory: [
      { year: '2023-24', examScore: 260, totalScore: 260, topCollege: 'CSE: 330+' },
      { year: '2022-23', examScore: 250, totalScore: 250, topCollege: 'CSE: 315+' },
      { year: '2021-22', examScore: 270, totalScore: 270, topCollege: 'CSE: 340+' },
    ],
    safeExamScore: 290,
    moderateExamScore: 245,
    checkEligibility: ({ sscGpa, hscGpa, phyGrade, chemGrade, mathGrade }) => {
      const reasons = [];
      if (sscGpa < 4.0) reasons.push('SSC-তে ন্যূনতম GPA 4.00 প্রয়োজন।');
      if (hscGpa < 4.5) reasons.push('HSC-তে ন্যূনতম GPA 4.50 প্রয়োজন।');
      if (phyGrade < 4.0 || chemGrade < 4.0 || mathGrade < 4.0) {
        reasons.push('পদার্থ, রসায়ন ও গণিত প্রতিটিতে ন্যূনতম GPA 4.00 প্রয়োজন।');
      }
      return { eligible: reasons.length === 0, reasons, note: 'সেকেন্ড টাইমারদের জন্য আলাদা সুযোগ রয়েছে।' };
    }
  },
  {
    id: 'du-ka',
    name: 'ঢাকা বিশ্ববিদ্যালয় (বিজ্ঞান অনুষদ - ‘ক’ ইউনিট)',
    category: 'Varsity',
    badge: 'ঢাবি ‘ক’ ইউনিট',
    color: 'from-violet-500 to-purple-600',
    border: 'border-violet-500/30',
    totalMarks: 120, // 100 Exam (60 MCQ + 40 Written) + 20 GPA
    examMarks: 100,
    gpaMarks: 20,
    minCombinedGpa: 8.00,
    minIndividualGpa: 3.50,
    allowsSecondTime: false,
    secondTimePenalty: 0,
    seatsCount: '১,৮৫১টি আসন',
    examPattern: '৬০ নম্বরের MCQ (৪৫ মিনিট) + ৪০ নম্বরের লিখিত (৪৫ মিনিট)। মোট ১০০ নম্বর। GPA ২০।',
    cutOffHistory: [
      { year: '2023-24', examScore: 64.5, totalScore: 84.5, topCollege: 'CSE/SWE: 92+' },
      { year: '2022-23', examScore: 62.0, totalScore: 82.0, topCollege: 'CSE/SWE: 89+' },
      { year: '2021-22', examScore: 65.0, totalScore: 85.0, topCollege: 'CSE/SWE: 93+' },
    ],
    safeExamScore: 72,
    moderateExamScore: 61,
    checkEligibility: ({ sscGpa, hscGpa, isSecondTime }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (isSecondTime) reasons.push('ঢাকা বিশ্ববিদ্যালয়ে সেকেন্ড টাইম পরীক্ষার সুযোগ নেই।');
      if (sscGpa < 3.5) reasons.push('SSC-তে ন্যূনতম GPA 3.50 প্রয়োজন (বর্তমান: ' + sscGpa + ')');
      if (hscGpa < 3.5) reasons.push('HSC-তে ন্যূনতম GPA 3.50 প্রয়োজন (বর্তমান: ' + hscGpa + ')');
      if (combined < 8.0) reasons.push('SSC ও HSC মিলিয়ে মোট GPA 8.00 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');

      return { eligible: reasons.length === 0, reasons, note: 'বিজ্ঞান বিভাগ থেকে উত্তীর্ণ শিক্ষার্থীদের জন্য।' };
    }
  },
  {
    id: 'du-kha',
    name: 'ঢাকা বিশ্ববিদ্যালয় (কলা, আইন ও সামাজিক বিজ্ঞান - ‘খ’ ইউনিট)',
    category: 'Varsity',
    badge: 'ঢাবি ‘খ’ ইউনিট',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/30',
    totalMarks: 120,
    examMarks: 100,
    gpaMarks: 20,
    minCombinedGpa: 7.50,
    minIndividualGpa: 3.00,
    allowsSecondTime: false,
    secondTimePenalty: 0,
    seatsCount: '২,৯৩৪টি আসন',
    examPattern: '৬০ MCQ + ৪০ লিখিত (বাংলা, ইংরেজি, সাধারণ জ্ঞান)।',
    cutOffHistory: [
      { year: '2023-24', examScore: 60.5, totalScore: 80.5, topCollege: 'Law: 88+' },
      { year: '2022-23', examScore: 59.0, totalScore: 79.0, topCollege: 'Law: 86+' },
    ],
    safeExamScore: 68,
    moderateExamScore: 58,
    checkEligibility: ({ sscGpa, hscGpa, isSecondTime }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (isSecondTime) reasons.push('ঢাকা বিশ্ববিদ্যালয়ে সেকেন্ড টাইম সুযোগ নেই।');
      if (sscGpa < 3.0) reasons.push('SSC-তে ন্যূনতম GPA 3.00 প্রয়োজন।');
      if (hscGpa < 3.0) reasons.push('HSC-তে ন্যূনতম GPA 3.00 প্রয়োজন।');
      if (combined < 7.5) reasons.push('মোট GPA 7.50 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');
      return { eligible: reasons.length === 0, reasons };
    }
  },
  {
    id: 'gst-science',
    name: 'জিএসটি গুচ্ছ ২৪ বিশ্ববিদ্যালয় (বিজ্ঞান অনুষদ - ‘A’ ইউনিট)',
    category: 'GST',
    badge: 'গুচ্ছ ২৪ ভার্সিটি',
    color: 'from-rose-500 to-pink-600',
    border: 'border-rose-500/30',
    totalMarks: 100,
    examMarks: 100,
    minCombinedGpa: 8.00,
    minIndividualGpa: 3.50,
    allowsSecondTime: true,
    secondTimePenalty: 0,
    seatsCount: '১২,০০০+ আসন (২৪টি বিশ্ববিদ্যালয়)',
    examPattern: '১০০ নম্বরের পূর্ণাঙ্গ MCQ (পদার্থ ২৫, রসায়ন ২৫, বায়োলজি/গণিত ২৫, বাংলা/ইংরেজি ২৫)। নেগেটিভ মার্কিং ০.২৫।',
    cutOffHistory: [
      { year: '2023-24', examScore: 51.5, totalScore: 51.5, topCollege: 'SUST/JUST CSE: 68+' },
      { year: '2022-23', examScore: 49.0, totalScore: 49.0, topCollege: 'SUST/JUST CSE: 65+' },
      { year: '2021-22', examScore: 53.0, totalScore: 53.0, topCollege: 'SUST/JUST CSE: 70+' },
    ],
    safeExamScore: 58,
    moderateExamScore: 48,
    checkEligibility: ({ sscGpa, hscGpa }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (sscGpa < 3.5) reasons.push('SSC-তে ন্যূনতম GPA 3.50 প্রয়োজন।');
      if (hscGpa < 3.5) reasons.push('HSC-তে ন্যূনতম GPA 3.50 প্রয়োজন।');
      if (combined < 8.0) reasons.push('মোট GPA 8.00 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');
      return { eligible: reasons.length === 0, reasons, note: 'সেকেন্ড টাইমাররা আবেদন করতে পারবে।' };
    }
  },
  {
    id: 'agri-cluster',
    name: 'কৃষি গুচ্ছ ৮ বিশ্ববিদ্যালয় (Agricultural Cluster)',
    category: 'Agri',
    badge: 'কৃষি গুচ্ছ',
    color: 'from-lime-500 to-emerald-600',
    border: 'border-lime-500/30',
    totalMarks: 150, // 100 MCQ + 50 GPA
    examMarks: 100,
    gpaMarks: 50,
    minCombinedGpa: 8.50,
    minIndividualGpa: 4.00,
    minBioGrade: 3.50,
    allowsSecondTime: true,
    secondTimePenalty: 0,
    seatsCount: '৩,৮৬৮টি আসন (৮টি কৃষি বিশ্ববিদ্যালয়)',
    examPattern: '১০০ MCQ (ইংরেজি ১০, উদ্ভিদবিজ্ঞান ১৫, প্রাণিবিজ্ঞান ১৫, পদার্থ ২০, রসায়ন ২০, গণিত ২০)। GPA ৫০।',
    cutOffHistory: [
      { year: '2023-24', examScore: 61.5, totalScore: 111.5, topCollege: 'BAU Vet/Agri: 74+' },
      { year: '2022-23', examScore: 59.0, totalScore: 108.5, topCollege: 'BAU Vet/Agri: 71+' },
      { year: '2021-22', examScore: 63.5, totalScore: 113.0, topCollege: 'BAU Vet/Agri: 76+' },
    ],
    safeExamScore: 68,
    moderateExamScore: 57,
    checkEligibility: ({ sscGpa, hscGpa, bioGrade }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (sscGpa < 4.0) reasons.push('SSC-তে ন্যূনতম GPA 4.00 প্রয়োজন।');
      if (hscGpa < 4.0) reasons.push('HSC-তে ন্যূনতম GPA 4.00 প্রয়োজন।');
      if (combined < 8.5) reasons.push('মোট GPA 8.50 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');
      if (bioGrade < 3.5) reasons.push('HSC বায়োলজিতে ন্যূনতম GPA 3.50 (B Grade) প্রয়োজন।');
      return { eligible: reasons.length === 0, reasons, note: 'কৃষি গুচ্ছে সেকেন্ড টাইম অনুমোদিত।' };
    }
  },
  {
    id: 'nursing-bsc',
    name: 'বিএসসি ইন নার্সিং (B.Sc. in Nursing)',
    category: 'Nursing',
    badge: 'নার্সিং কাউন্সিল',
    color: 'from-pink-500 to-rose-600',
    border: 'border-pink-500/30',
    totalMarks: 150, // 100 MCQ + 50 GPA
    examMarks: 100,
    gpaMarks: 50,
    minCombinedGpa: 7.00,
    minIndividualGpa: 3.00,
    minBioGrade: 3.00,
    allowsSecondTime: true,
    secondTimePenalty: 0,
    seatsCount: 'সরকারি ৩,০০০+ আসন',
    examPattern: '১০০ নম্বরের MCQ (বাংলা ২০, ইংরেজি ২০, গণিত ১০, পদার্থ ১০, রসায়ন ১০, জীববিজ্ঞান ২০, সাধারণ জ্ঞান ১০)।',
    cutOffHistory: [
      { year: '2023-24', examScore: 64.0, totalScore: 114.0, topCollege: 'Dhaka Nursing College: 72+' },
      { year: '2022-23', examScore: 62.5, totalScore: 112.0, topCollege: 'Dhaka Nursing College: 70+' },
    ],
    safeExamScore: 69,
    moderateExamScore: 60,
    checkEligibility: ({ sscGpa, hscGpa, bioGrade }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (sscGpa < 3.0) reasons.push('SSC-তে ন্যূনতম GPA 3.00 (বিজ্ঞান বিভাগ) প্রয়োজন।');
      if (hscGpa < 3.0) reasons.push('HSC-তে ন্যূনতম GPA 3.00 (বিজ্ঞান বিভাগ) প্রয়োজন।');
      if (combined < 7.0) reasons.push('মোট GPA 7.00 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');
      if (bioGrade < 3.0) reasons.push('HSC বায়োলজিতে ন্যূনতম GPA 3.00 প্রয়োজন।');
      return { eligible: reasons.length === 0, reasons };
    }
  },
  {
    id: 'nursing-diploma',
    name: 'ডিপ্লোমা ইন নার্সিং সায়েন্স অ্যান্ড মিডওয়াইফারি',
    category: 'Nursing',
    badge: 'ডিপ্লোমা নার্সিং (সকল বিভাগ)',
    color: 'from-teal-500 to-cyan-600',
    border: 'border-teal-500/30',
    totalMarks: 150,
    examMarks: 100,
    gpaMarks: 50,
    minCombinedGpa: 6.00,
    minIndividualGpa: 2.50,
    allowsSecondTime: true,
    secondTimePenalty: 0,
    seatsCount: 'সরকারি ৬,০০০+ আসন',
    examPattern: '১০০ MCQ (বাংলা ২০, ইংরেজি ২০, সাধারণ গণিত ১০, সাধারণ বিজ্ঞান ২৫, সাধারণ জ্ঞান ২৫)।',
    cutOffHistory: [
      { year: '2023-24', examScore: 58.0, totalScore: 108.0, topCollege: 'Mitford Nursing: 66+' },
      { year: '2022-23', examScore: 56.5, totalScore: 106.0, topCollege: 'Mitford Nursing: 64+' },
    ],
    safeExamScore: 63,
    moderateExamScore: 54,
    checkEligibility: ({ sscGpa, hscGpa }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (sscGpa < 2.5) reasons.push('SSC-তে ন্যূনতম GPA 2.50 প্রয়োজন।');
      if (hscGpa < 2.5) reasons.push('HSC-তে ন্যূনতম GPA 2.50 প্রয়োজন।');
      if (combined < 6.0) reasons.push('মোট GPA 6.00 প্রয়োজন (বর্তমান: ' + combined.toFixed(2) + ')');
      return { eligible: reasons.length === 0, reasons, note: 'বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা সকল বিভাগের জন্য প্রযোজ্য।' };
    }
  },
  {
    id: 'ju-a',
    name: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয় (‘A’ ইউনিট - গাণিতিক ও পদার্থবিজ্ঞান)',
    category: 'Varsity',
    badge: 'জাবি ‘A’ ইউনিট',
    color: 'from-amber-500 to-yellow-600',
    border: 'border-amber-500/30',
    totalMarks: 100, // 80 MCQ + 20 GPA
    examMarks: 80,
    gpaMarks: 20,
    minCombinedGpa: 8.50,
    minIndividualGpa: 4.00,
    allowsSecondTime: true,
    secondTimePenalty: 0,
    seatsCount: '৪১০টি আসন',
    examPattern: '৮০ নম্বরের MCQ (গণিত ২২, পদার্থ ২২, রসায়ন ২২, বাংলা ৩, ইংরেজি ৩, আইসিটি ৮)।',
    cutOffHistory: [
      { year: '2023-24', examScore: 56.0, totalScore: 76.0, topCollege: 'CSE: 66+' },
      { year: '2022-23', examScore: 54.5, totalScore: 74.5, topCollege: 'CSE: 64+' },
    ],
    safeExamScore: 62,
    moderateExamScore: 53,
    checkEligibility: ({ sscGpa, hscGpa }) => {
      const reasons = [];
      const combined = sscGpa + hscGpa;
      if (sscGpa < 4.0) reasons.push('SSC-তে ন্যূনতম GPA 4.00 প্রয়োজন।');
      if (hscGpa < 4.0) reasons.push('HSC-তে ন্যূনতম GPA 4.00 প্রয়োজন।');
      if (combined < 8.5) reasons.push('মোট GPA 8.50 প্রয়োজন।');
      return { eligible: reasons.length === 0, reasons, note: 'জাবিতে সেকেন্ড টাইম সুবিধা আছে।' };
    }
  },
];
