/**
 * Nursing Admission Portal Configuration & Data
 * Covers:
 * 1. BSc in Nursing (Basic)
 * 2. Diploma in Nursing Science & Midwifery
 * 3. Diploma in Midwifery
 */

export const NURSING_TRACKS = [
  {
    id: 'bsc',
    name: 'বিএসসি ইন নার্সিং (BSc in Nursing)',
    shortName: 'BSc Nursing',
    badge: '৪ বছর মেয়াদী অনার্স কোর্স',
    eligibility: 'এইচএসসি বিজ্ঞান বিভাগ (ন্যূনতম জিপিএ ৭.০০ ও জীববিজ্ঞানে জিপিএ ৩.০০)',
    targetColleges: 'ঢাকা নার্সিং কলেজ, চট্টগ্রাম, রাজশাহী সহ সরকারি ও বেসরকারি নার্সিং কলেজসমূহ',
    examDuration: '১ ঘণ্টা (৬০ মিনিট)',
    totalMarks: 100,
    marksDistribution: [
      { subject: 'বাংলা', marks: 20, color: 'text-amber-400' },
      { subject: 'ইংরেজি', marks: 20, color: 'text-sky-400' },
      { subject: 'পদার্থবিজ্ঞান', marks: 10, color: 'text-purple-400' },
      { subject: 'রসায়ন', marks: 10, color: 'text-rose-400' },
      { subject: 'জীববিজ্ঞান', marks: 10, color: 'text-emerald-400' },
      { subject: 'সাধারণ গণিত', marks: 10, color: 'text-indigo-400' },
      { subject: 'সাধারণ জ্ঞান', marks: 20, color: 'text-teal-400' }
    ]
  },
  {
    id: 'diploma',
    name: 'ডিপ্লোমা ইন নার্সিং সায়েন্স (Diploma in Nursing)',
    shortName: 'Diploma Nursing',
    badge: '৩ বছর মেয়াদী ডিপ্লোমা কোর্স',
    eligibility: 'যেকোনো বিভাগ (বিজ্ঞান/মানবিক/বাণিজ্য) থেকে ন্যূনতম জিপিএ ৬.০০',
    targetColleges: 'সকল সরকারি ও বেসরকারি নার্সিং ইনস্টিটিউট (নারী ও পুরুষ উভয়ই আবেদনযোগ্য)',
    examDuration: '১ ঘণ্টা (৬০ মিনিট)',
    totalMarks: 100,
    marksDistribution: [
      { subject: 'বাংলা', marks: 20, color: 'text-amber-400' },
      { subject: 'ইংরেজি', marks: 20, color: 'text-sky-400' },
      { subject: 'সাধারণ বিজ্ঞান', marks: 25, color: 'text-emerald-400' },
      { subject: 'সাধারণ গণিত', marks: 15, color: 'text-indigo-400' },
      { subject: 'সাধারণ জ্ঞান', marks: 20, color: 'text-teal-400' }
    ]
  },
  {
    id: 'midwifery',
    name: 'ডিপ্লোমা ইন মিডওয়াইফারি (Diploma in Midwifery)',
    shortName: 'Diploma Midwifery',
    badge: '৩ বছর মেয়াদী বিশেষায়িত কোর্স',
    eligibility: 'যেকোনো বিভাগ থেকে নারী প্রার্থীদের জন্য ন্যূনতম জিপিএ ৬.০০',
    targetColleges: 'সরকারি ও অনুমোদিত মিডওয়াইফারি ইনস্টিটিউটসমূহ (শুধু নারী প্রার্থীরা)',
    examDuration: '১ ঘণ্টা (৬০ মিনিট)',
    totalMarks: 100,
    marksDistribution: [
      { subject: 'বাংলা', marks: 20, color: 'text-amber-400' },
      { subject: 'ইংরেজি', marks: 20, color: 'text-sky-400' },
      { subject: 'সাধারণ বিজ্ঞান', marks: 25, color: 'text-emerald-400' },
      { subject: 'সাধারণ গণিত', marks: 15, color: 'text-indigo-400' },
      { subject: 'সাধারণ জ্ঞান', marks: 20, color: 'text-teal-400' }
    ]
  }
];

export const NURSING_SUBJECTS_CONFIG = [
  // 1. Biology (BSc Special)
  {
    id: 'nur-biology',
    name: 'জীববিজ্ঞান (Biology - BSc Special)',
    subTitle: 'কোষ, মানব শারীরতত্ত্ব, বংশগতি, জিনতত্ত্ব ও বাস্তুতন্ত্র',
    marks: '১০ নম্বর',
    marksText: '১০ নম্বর (বিএসসি নার্সিং)',
    icon: 'Dna',
    color: 'from-emerald-500 to-teal-600',
    applicableTracks: ['bsc'],
    recommendedBooks: ['গাজী আজমল স্যারের প্রাণিবিজ্ঞান', 'আবুল হাসান স্যারের উদ্ভিদবিজ্ঞান'],
    chapters: [
      {
        id: 'nur-bio-1',
        paper: 'প্রাণিবিজ্ঞান',
        name: 'রক্ত ও রক্ত সংবহন (Blood & Circulation)',
        repeatedQuestionsCount: 18,
        highYieldTopics: ['রক্তের উপাদান ও রক্তকণিকা', 'হৃদপিণ্ডের গঠন ও রক্তপ্রবাহ', 'রক্তচাপ ও ব্যারোরিসেপ্টর'],
        keyFacts: [
          'রক্তের সার্বজনীন দাতা হলো O Negative (O-) এবং সার্বজনীন গ্রহীতা হলো AB Positive (AB+)।',
          'লোহিত রক্তকণিকার (RBC) গড় আয়ুষ্কাল ১২০ দিন।',
          'মানুষের হৃদপিণ্ডের প্রাকৃতিক পেসমেকার হলো সাইনো-অ্যাট্রিয়াল নোড (SAN)।',
          'রক্ত জমাট বাঁধতে সাহায্য করে রক্তপ্লাটিলেট (অণুচক্রিকা) এবং ভিটামিন K।'
        ]
      },
      {
        id: 'nur-bio-2',
        paper: 'প্রাণিবিজ্ঞান',
        name: 'পরিপাক ও শোষণ (Digestion & Nutrition)',
        repeatedQuestionsCount: 16,
        highYieldTopics: ['পাচক রস ও এনজাইম', 'যকৃতের সঞ্চয়ী ও বিপাকীয় ভূমিকা', 'ভিটামিন ও খনিজ লবণ'],
        keyFacts: [
          'মানবদেহের সবচেয়ে বড় গ্রন্থি হলো যকৃত (Liver)।',
          'পাকস্থলীতে গ্যাস্ট্রিক জুস ক্ষরিত হয় যার প্রধান উপাদান হাইড্রোক্লোরিক এসিড (HCl) ও পেপসিন।',
          'ইনসুলিন ও গ্লুকাগন হরমোন ক্ষরিত হয় অগ্ন্যাশয়ের আইলেটস অব ল্যাঙ্গারহ্যান্স থেকে।'
        ]
      },
      {
        id: 'nur-bio-3',
        paper: 'উদ্ভিদবিজ্ঞান',
        name: 'কোষ ও বংশগতি (Cell & Genetics)',
        repeatedQuestionsCount: 14,
        highYieldTopics: ['মাইটোকন্ড্রিয়া ও প্লাস্টিড', 'মেন্ডেলের সূত্র', 'ডিএনএ ও আরএনএ'],
        keyFacts: [
          'কোষের পাওয়ার হাউস (Power House) বলা হয় মাইটোকন্ড্রিয়াকে।',
          'প্রোটিন তৈরির কারখানা বলা হয় রাইবোজোমকে।',
          'মেন্ডেলের ১ম সূত্রের ফিনোটাইপিক অনুপাত ৩:১ এবং ২য় সূত্রের অনুপাত ৯:৩:৩:১।'
        ]
      }
    ]
  },

  // 2. General Science (Diploma & Midwifery Special)
  {
    id: 'nur-science',
    name: 'সাধারণ বিজ্ঞান (General Science - Diploma)',
    subTitle: 'মানবদেহ, পুষ্টি, ভিটামিন, রোগব্যাধি, টিকা ও পরিবেশ বিজ্ঞান',
    marks: '২৫ নম্বর',
    marksText: '২৫ নম্বর (ডিপ্লোমা নার্সিং ও মিডওয়াইফারি)',
    icon: 'Dna',
    color: 'from-emerald-500 to-cyan-600',
    applicableTracks: ['diploma', 'midwifery'],
    recommendedBooks: ['৯ম-১০ম শ্রেণির সাধারণ বিজ্ঞান', 'নার্সিং প্রশ্নব্যাংক ও গাইড'],
    chapters: [
      {
        id: 'nur-sci-1',
        paper: 'জীববিজ্ঞান ও স্বাস্থ্য',
        name: 'মানবদেহ, রক্ত সংবহন ও হৃদপিণ্ড',
        repeatedQuestionsCount: 24,
        highYieldTopics: ['রক্তের গ্রুপ ও অ্যান্টিবডি', 'হৃদপিণ্ডের কপাটিকা', 'রক্তচাপ ও পালস রেট'],
        keyFacts: [
          'একজন সুস্থ প্রাপ্তবয়স্ক মানুষের স্বাভাবিক রক্তচাপ ১২০/৮০ mmHg।',
          'লোহিত রক্তকণিকা প্লীহা ও লাল অস্থিমজ্জায় তৈরি হয়।',
          'দেহে অ্যান্টিবডি তৈরি করে শ্বেত রক্তকণিকা (WBC) বা লিম্ফোসাইট।'
        ]
      },
      {
        id: 'nur-sci-2',
        paper: 'খাদ্য ও পুষ্টি',
        name: 'খাদ্য, ভিটামিন ও অভাবজনিত রোগ',
        repeatedQuestionsCount: 28,
        highYieldTopics: ['পানিতে ও চর্বিতে দ্রবণীয় ভিটামিন', 'ভিটামিনের অভাবজনিত রোগ', 'দৈনিক ক্যালোরি চাহিদা'],
        keyFacts: [
          'চর্বিতে দ্রবণীয় ভিটামিনগুলো হলো: A, D, E, K।',
          'পানিতে দ্রবণীয় ভিটামিনগুলো হলো: B-Complex ও C।',
          'ভিটামিন A এর অভাবে রাতকানা এবং ভিটামিন D এর অভাবে শিশুদের রিকেটস রোগ হয়।'
        ]
      },
      {
        id: 'nur-sci-3',
        paper: 'জীবাণু ও চিকিৎসা',
        name: 'জীবাণু, রোগব্যাধি ও টিকা (Vaccines & Diseases)',
        repeatedQuestionsCount: 25,
        highYieldTopics: ['ভাইরাস ও ব্যাকটেরিয়া ঘটিত রোগ', 'ইপিআই (EPI) টিকা শিডিউল', 'অ্যান্টিবায়োটিক'],
        keyFacts: [
          'বিসিজি (BCG) টিকা যক্ষ্মা (Tuberculosis) প্রতিরোধের জন্য দেওয়া হয়।',
          'পোলিও, এইডস, হেপাটাইটিস, ডেঙ্গু, জলাতঙ্ক হলো ভাইরাসজনিত রোগ।',
          'কলেরা, টাইফয়েড, নিউমোনিয়া হলো ব্যাকটেরিয়াজনিত রোগ।'
        ]
      }
    ]
  },

  // 3. Physics (BSc Special)
  {
    id: 'nur-physics',
    name: 'পদার্থবিজ্ঞান (Physics - BSc Special)',
    subTitle: 'গতিবিদ্যা, নিউটনীয় বলবিদ্যা, কাজ-শক্তি, শব্দ ও তরঙ্গ, আলো ও চলতড়িৎ',
    marks: '১০ নম্বর',
    marksText: '১০ নম্বর (বিএসসি নার্সিং)',
    icon: 'Zap',
    color: 'from-purple-500 to-indigo-600',
    applicableTracks: ['bsc'],
    recommendedBooks: ['ড. শাহজাহান তপন স্যারের পদার্থবিজ্ঞান ১ম ও ২য় পত্র'],
    chapters: [
      {
        id: 'nur-phy-1',
        paper: '১ম পত্র',
        name: 'কাজ, ক্ষমতা, শক্তি ও বলবিদ্যা',
        repeatedQuestionsCount: 15,
        highYieldTopics: ['কাজের সমীকরণ W = Fs cosθ', 'গতিশক্তি ও স্থিতিশক্তি', 'মহাকর্ষ বল'],
        keyFacts: [
          'কাজের একক জুল (Joule) এবং ক্ষমতার একক ওয়াট (Watt)।',
          'অভিকর্ষজ ত্বরণ g এর মান ভূপৃষ্ঠে আদর্শ হিসেবে ৯.৮ m/s² ধরা হয়।',
          '১ অশ্বক্ষমতা (1 Horse Power) = ৭৪৬ ওয়াট।'
        ]
      },
      {
        id: 'nur-phy-2',
        paper: '২য় পত্র',
        name: 'আলোর প্রতিফলন, প্রতিসরণ ও চলতড়িৎ',
        repeatedQuestionsCount: 14,
        highYieldTopics: ['লেন্সের ক্ষমতা P = 1/f', 'ওহমের সূত্র V = IR', 'বিদ্যুৎ বিল হিসাব'],
        keyFacts: [
          'লেন্সের ক্ষমতার একক ডায়োপ্টার (Dioptre, D)।',
          'ওহমের সূত্রানুসারে V = IR (বিভব পার্থক্য = তড়িৎ প্রবাহ × রোধ)।',
          '১ ইউনিট বিদ্যুৎ খরচ = ১ কিলোওয়াট-ঘণ্টা (1 kWh) = ৩.৬ × ১০⁶ জুল।'
        ]
      }
    ]
  },

  // 4. Chemistry (BSc Special)
  {
    id: 'nur-chemistry',
    name: 'রসায়ন (Chemistry - BSc Special)',
    subTitle: 'পর্যায় সারণি, রাসায়নিক বন্ধন, এসিড-ক্ষারক ও জৈব রসায়ন বেসিকস',
    marks: '১০ নম্বর',
    marksText: '১০ নম্বর (বিএসসি নার্সিং)',
    icon: 'FlaskConical',
    color: 'from-rose-500 to-pink-600',
    applicableTracks: ['bsc'],
    recommendedBooks: ['সঞ্জিত কুমার গুহ স্যারের রসায়ন ১ম ও ২য় পত্র'],
    chapters: [
      {
        id: 'nur-chem-1',
        paper: '১ম পত্র',
        name: 'গুণগত রসায়ন, পর্যায় সারণি ও রাসায়নিক বন্ধন',
        repeatedQuestionsCount: 16,
        highYieldTopics: ['ইলেকট্রন বিন্যাস', 'পর্যায়বৃত্ত ধর্ম (আয়নাইজেশন বিভব)', 'pH মান ও বাফার দ্রবণ'],
        keyFacts: [
          'মানুষের রক্তের স্বাভাবিক pH মান ৭.৩৫ থেকে ৭.৪৫ (হালকা ক্ষারীয়)।',
          'পর্যায় সারণির সবচেয়ে সক্রিয় অধাতু হলো ফ্লোরিন (F)।',
          'আইসোটোপে প্রোটন সংখ্যা সমান কিন্তু ভর সংখ্যা ভিন্ন থাকে।'
        ]
      }
    ]
  },

  // 5. Bangla Language & Literature (Common)
  {
    id: 'nur-bangla',
    name: 'বাংলা ভাষা ও সাহিত্য (Bangla Language & Literature)',
    subTitle: 'ধ্বনি, সন্ধি, ণ-ত্ব/ষ-ত্ব বিধান, সমাস, কারক, এককথায় প্রকাশ ও সাহিত্য',
    marks: '২০ নম্বর',
    marksText: '২০ নম্বর (সকল ট্র্যাক)',
    icon: 'BookOpen',
    color: 'from-amber-500 to-orange-600',
    applicableTracks: ['bsc', 'diploma', 'midwifery'],
    recommendedBooks: ['৯ম-১০ম শ্রেণির বাংলা ভাষার ব্যাকরণ ও নির্মিতি', 'নার্সিং প্রশ্নব্যাংক'],
    chapters: [
      {
        id: 'nur-ban-1',
        paper: 'ব্যাকরণ',
        name: 'ধ্বনি, বর্ণ, সন্ধি ও ণ-ত্ব/ষ-ত্ব বিধান',
        repeatedQuestionsCount: 22,
        highYieldTopics: ['স্বরসন্ধি ও ব্যঞ্জনসন্ধি', 'ণ-ত্ব বিধানের নিয়ম', 'বানান শুদ্ধি'],
        keyFacts: [
          'বাংলা বর্ণমালায় মোট ৫০টি বর্ণ রয়েছে (স্বরবর্ণ ১১টি, ব্যঞ্জনবর্ণ ৩৯টি)।',
          'মাত্রাহীন বর্ণ ১০টি, অর্ধমাত্রা ৮টি এবং পূর্ণমাত্রার বর্ণ ৩২টি।',
          'স্বভাবতই ‘ণ’ হয় এমন কয়েকটি শব্দ: চাণক্য, মাণিক্য, বাণিজ্য, লবণ, পুণ্য।'
        ]
      },
      {
        id: 'nur-ban-2',
        paper: 'ব্যাকরণ ও নির্মিতি',
        name: 'সমাস, কারক ও বিভক্তি, এককথায় প্রকাশ',
        repeatedQuestionsCount: 24,
        highYieldTopics: ['তৎপুরুষ ও বহুব্রীহি সমাস', 'অপাদান ও অধিকরণ কারক', 'গুরুত্বপূর্ণ বাগধারা'],
        keyFacts: [
          '‘যা পূর্বে দেখা যায়নি’ — অদৃষ্টপূর্ব।',
          '‘যে জমিতে ফসল জন্মায় না’ — ঊষর।',
          '‘গাছে কাঁঠাল গোঁফে তেল’ — প্রাপ্তির পূর্বেই ভোগের আয়োজন।'
        ]
      }
    ]
  },

  // 6. English (Common)
  {
    id: 'nur-english',
    name: 'ইংরেজি ভাষা ও গ্রামার (General English)',
    subTitle: 'Parts of Speech, Prepositions, Tense, Voice, Synonyms & Antonyms',
    marks: '২০ নম্বর',
    marksText: '২০ নম্বর (সকল ট্র্যাক)',
    icon: 'Globe',
    color: 'from-sky-500 to-blue-600',
    applicableTracks: ['bsc', 'diploma', 'midwifery'],
    recommendedBooks: ['English for Competitive Exams', 'Master English Guide'],
    chapters: [
      {
        id: 'nur-eng-1',
        paper: 'Grammar',
        name: 'Parts of Speech & Appropriate Prepositions',
        repeatedQuestionsCount: 26,
        highYieldTopics: ['Prepositions of Place/Time', 'Noun/Adjective identification'],
        keyFacts: [
          'Abide by = মেনে চলা (You must abide by the rules).',
          'Accustomed to = অভ্যস্ত (He is accustomed to hard work).',
          'Look after = দেখাশোনা করা (Nurses look after patients).'
        ]
      },
      {
        id: 'nur-eng-2',
        paper: 'Grammar & Vocabulary',
        name: 'Tense, Subject-Verb Agreement, Synonyms',
        repeatedQuestionsCount: 22,
        highYieldTopics: ['Right form of verbs', 'Frequent Medical Vocabulary'],
        keyFacts: [
          'One of my friends (is/are) a nurse ➔ Correct: "is".',
          'Synonym of "Immunity" is "Resistance".',
          'Antonym of "Chronic" is "Acute".'
        ]
      }
    ]
  },

  // 7. General Knowledge (Common)
  {
    id: 'nur-gk',
    name: 'সাধারণ জ্ঞান ও মুক্তিযুদ্ধ (General Knowledge)',
    subTitle: 'মুক্তিযুদ্ধ, সংবিধান, জাতীয় অর্জন, স্বাস্থ্য খাত ও সাম্প্রতিক বিষয়াবলী',
    marks: '২০ নম্বর',
    marksText: '২০ নম্বর (সকল ট্র্যাক)',
    icon: 'Globe',
    color: 'from-teal-500 to-emerald-600',
    applicableTracks: ['bsc', 'diploma', 'midwifery'],
    recommendedBooks: ['আজকের বিশ্ব', 'নার্সিং জিকে ডাইজেস্ট'],
    chapters: [
      {
        id: 'nur-gk-1',
        paper: 'বাংলাদেশ বিষয়াবলী',
        name: 'বাংলাদেশের মুক্তিযুদ্ধ ও জাতীয় অর্জন',
        repeatedQuestionsCount: 30,
        highYieldTopics: ['৭ই মার্চের ভাষণ', '১১টি সেক্টর ও সেক্টর কমান্ডার', 'বীরশ্রেষ্ঠ ৭ জন'],
        keyFacts: [
          'মুক্তিযুদ্ধের সময় সমগ্র বাংলাদেশকে ১১টি সেক্টরে এবং ৬৪টি সাব-সেক্টরে ভাগ করা হয়েছিল।',
          'বীরশ্রেষ্ঠ খেতাবপ্রাপ্ত শহীদদের সংখ্যা ৭ জন।',
          'ফ্লোরেন্স নাইটিঙ্গেলকে আধুনিক নার্সিং সেবার অগ্রদূত বলা হয় (লেডি উইথ দ্য ল্যাম্প)।'
        ]
      }
    ]
  },

  // 8. General Mathematics (Common)
  {
    id: 'nur-math',
    name: 'সাধারণ গণিত (General Mathematics)',
    subTitle: 'শতকরা, লাভ-ক্ষতি, অনুপাত, ঐকিক নিয়ম ও বীজগণিত বেসিক',
    marks: '১০-১৫ নম্বর',
    marksText: 'বিএসসি: ১০ / ডিপ্লোমা: ১৫',
    icon: 'Zap',
    color: 'from-indigo-500 to-violet-600',
    applicableTracks: ['bsc', 'diploma', 'midwifery'],
    recommendedBooks: ['৮ম ও ৯ম শ্রেণির সাধারণ গণিত'],
    chapters: [
      {
        id: 'nur-mat-1',
        paper: 'পাটিগণিত',
        name: 'শতকরা, লাভ-ক্ষতি ও সরল সুদ',
        repeatedQuestionsCount: 18,
        highYieldTopics: ['শতকরা হিসাব', 'সুদকষা সূত্র I = Pnr'],
        keyFacts: [
          'লাভ = বিক্রয়মূল্য - ক্রয়মূল্য, ক্ষতি = ক্রয়মূল্য - বিক্রয়মূল্য।',
          'সরল সুদ I = Pnr (P = আসল, n = সময়, r = সুদের হার)।'
        ]
      }
    ]
  }
];

export const NURSING_DEFAULT_SESSIONS = [
  { id: 'sess-nur-bsc-23', examType: 'BSc Nursing', session: '2023-2024', shortYear: '23-24', totalQuestions: 100, active: true, examDate: 'মে ২০২৪' },
  { id: 'sess-nur-bsc-22', examType: 'BSc Nursing', session: '2022-2023', shortYear: '22-23', totalQuestions: 100, active: true, examDate: 'মে ২০২৩' },
  { id: 'sess-nur-bsc-21', examType: 'BSc Nursing', session: '2021-2022', shortYear: '21-22', totalQuestions: 100, active: true, examDate: 'মে ২০২২' },
  { id: 'sess-nur-dip-23', examType: 'Diploma in Nursing', session: '2023-2024', shortYear: '23-24', totalQuestions: 100, active: true, examDate: 'মে ২০২৪' },
  { id: 'sess-nur-dip-22', examType: 'Diploma in Nursing', session: '2022-2023', shortYear: '22-23', totalQuestions: 100, active: true, examDate: 'মে ২০২৩' },
  { id: 'sess-nur-mid-23', examType: 'Midwifery', session: '2023-2024', shortYear: '23-24', totalQuestions: 100, active: true, examDate: 'মে ২০২৪' }
];

export const NURSING_MNEMONICS = [
  {
    id: 'nur-mne-1',
    subject: 'সাধারণ বিজ্ঞান',
    topic: 'চর্বিতে দ্রবণীয় ভিটামিন মনে রাখার ট্রিক',
    technique: 'DEKA (দেকা/দেখা) ➔ Vitamin D, E, K, A',
    explanation: 'চর্বিতে বা স্নেহে দ্রবণীয় ভিটামিন ৪টি: ভিটামিন ডি, ই, কে, এ। বাকি ভিটামিন বি-কমপ্লেক্স ও সি পানিতে দ্রবণীয়।',
    reference: 'সাধারণ বিজ্ঞান ও স্বাস্থ্য'
  },
  {
    id: 'nur-mne-2',
    subject: 'জীববিজ্ঞান',
    topic: 'রক্তের সার্বজনীন দাতা ও গ্রহীতা',
    technique: 'O = Open (সবাইকে দান করে - Universal Donor) | AB = All Buy (সবাই থেকে নেয় - Universal Acceptor)',
    explanation: 'O- হলো সার্বজনীন দাতা কারণ এতে কোনো A বা B অ্যান্টিজেন নেই। AB+ হলো সার্বজনীন গ্রহীতা কারণ এতে কোনো অ্যান্টিবডি নেই।',
    reference: 'প্রাণিবিজ্ঞান - রক্ত ও সংবহন'
  },
  {
    id: 'nur-mne-3',
    subject: 'সাধারণ জ্ঞান',
    topic: 'আধুনিক নার্সিং ও ফ্লোরেন্স নাইটিঙ্গেল',
    technique: '১২ই মে = আন্তর্জাতিক নার্সিং দিবস (ফ্লোরেন্স নাইটিঙ্গেলের জন্মদিন)',
    explanation: 'ক্রিমিয়ার যুদ্ধে রোগীদের সেবার জন্য তিনি বিখ্যাত হন এবং তাকে "The Lady with the Lamp" বলা হয়।',
    reference: 'নার্সিং জিকে'
  }
];
