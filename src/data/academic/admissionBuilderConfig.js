/**
 * Admission Subjects and Question Bank Configuration for QuestionBuilder & Practice
 */

export const ADMISSION_PROGRAMS = [
  {
    id: 'all',
    name: 'সকল বিষয় (All Subjects)',
    shortName: 'সকল প্রোগ্রাম',
    emoji: '🌐',
    subjectIds: ['adm-biology', 'adm-chemistry', 'adm-physics', 'adm-math', 'adm-english', 'adm-gk', 'adm-nursing-science']
  },
  {
    id: 'medical',
    name: 'মেডিকেল ও ডেন্টাল (MBBS / BDS)',
    shortName: 'মেডিকেল',
    emoji: '🩺',
    subjectIds: ['adm-biology', 'adm-chemistry', 'adm-physics', 'adm-english', 'adm-gk']
  },
  {
    id: 'nursing',
    name: 'নার্সিং ও মিডওয়াইফারি (BSc / Diploma)',
    shortName: 'নার্সিং',
    emoji: '🏥',
    subjectIds: ['adm-nursing-science', 'adm-biology', 'adm-english', 'adm-gk', 'adm-math']
  },
  {
    id: 'engineering',
    name: 'বুয়েট ও ইঞ্জিনিয়ারিং (BUET & CK-RUET)',
    shortName: 'ইঞ্জিনিয়ারিং',
    emoji: '⚙️',
    subjectIds: ['adm-math', 'adm-physics', 'adm-chemistry', 'adm-english']
  },
  {
    id: 'varsity-a',
    name: 'ঢাবি ‘ক’ ও GST গুচ্ছ (DU-A / GST)',
    shortName: 'ভার্সিটি ‘ক’',
    emoji: '🔬',
    subjectIds: ['adm-physics', 'adm-chemistry', 'adm-math', 'adm-biology', 'adm-english', 'adm-gk']
  }
];

export const ADMISSION_BUILDER_SUBJECTS = [
  {
    id: 'adm-biology',
    label: 'জীববিজ্ঞান (Medical & Admission)',
    name: 'জীববিজ্ঞান',
    level: 'Admission',
    emoji: '🧬',
    category: 'Science',
    chapters: [
      // উদ্ভিদবিজ্ঞান (Botany / ১ম পত্র)
      { id: 'bio-bot-1', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ১: কোষ ও এর গঠন', title: 'কোষ ও এর গঠন' },
      { id: 'bio-bot-2', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ২: কোষ বিভাজন', title: 'কোষ বিভাজন' },
      { id: 'bio-bot-3', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৩: কোষ রসায়ন', title: 'কোষ রসায়ন' },
      { id: 'bio-bot-4', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৪: অণুজীব', title: 'অণুজীব' },
      { id: 'bio-bot-5', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৫: শৈবাল ও ছত্রাক', title: 'শৈবাল ও ছত্রাক' },
      { id: 'bio-bot-6', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৬: ব্রায়োফাইটা ও টেরিডোফাইটা', title: 'ব্রায়োফাইটা ও টেরিডোফাইটা' },
      { id: 'bio-bot-7', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৭: নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', title: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ' },
      { id: 'bio-bot-8', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৮: টিস্যু ও টিস্যুতন্ত্র', title: 'টিস্যু ও টিস্যুতন্ত্র' },
      { id: 'bio-bot-9', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব', title: 'উদ্ভিদ শারীরতত্ত্ব' },
      { id: 'bio-bot-10', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ১০: উদ্ভিদ প্রজনন', title: 'উদ্ভিদ প্রজনন' },
      { id: 'bio-bot-11', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ১১: জীবপ্রযুক্তি', title: 'জীবপ্রযুক্তি' },
      { id: 'bio-bot-12', name: 'উদ্ভিদবিজ্ঞান - অধ্যায় ১২: জীবের পরিবেশ, বিস্তার ও সংরক্ষণ', title: 'পরিবেশ ও সংরক্ষণ' },
      // প্রাণিবিজ্ঞান (Zoology / ২য় পত্র)
      { id: 'bio-zoo-1', name: 'প্রাণিবিজ্ঞান - অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', title: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস' },
      { id: 'bio-zoo-2', name: 'প্রাণিবিজ্ঞান - অধ্যায় ২: প্রাণীর পরিচিতি', title: 'প্রাণীর পরিচিতি' },
      { id: 'bio-zoo-3', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৩: মানব শারীরতত্ত্ব: পরিপাক ও শোষণ', title: 'পরিপাক ও শোষণ' },
      { id: 'bio-zoo-4', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৪: মানব শারীরতত্ত্ব: রক্ত ও সংবহন', title: 'রক্ত ও সংবহন' },
      { id: 'bio-zoo-5', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৫: মানব শারীরতত্ত্ব: শ্বাসক্রিয়া ও শ্বসন', title: 'শ্বাসক্রিয়া ও শ্বসন' },
      { id: 'bio-zoo-6', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৬: মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন', title: 'বর্জ্য ও নিষ্কাশন' },
      { id: 'bio-zoo-7', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৭: মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা', title: 'চলন ও অঙ্গচালনা' },
      { id: 'bio-zoo-8', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৮: মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ', title: 'সমন্বয় ও নিয়ন্ত্রণ' },
      { id: 'bio-zoo-9', name: 'প্রাণিবিজ্ঞান - অধ্যায় ৯: মানব জীবনের ধারাবাহিকতা', title: 'মানব জীবনের ধারাবাহিকতা' },
      { id: 'bio-zoo-10', name: 'প্রাণিবিজ্ঞান - অধ্যায় ১০: মানবদেহের প্রতিরক্ষা (ইমিউনিটি)', title: 'মানবদেহের প্রতিরক্ষা' },
      { id: 'bio-zoo-11', name: 'প্রাণিবিজ্ঞান - অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন', title: 'জিনতত্ত্ব ও বিবর্তন' },
      { id: 'bio-zoo-12', name: 'প্রাণিবিজ্ঞান - অধ্যায় ১২: প্রাণীর আচরণ', title: 'প্রাণীর আচরণ' }
    ]
  },
  {
    id: 'adm-chemistry',
    label: 'রসায়ন (Medical, Eng & Varsity)',
    name: 'রসায়ন',
    level: 'Admission',
    emoji: '🧪',
    category: 'Science',
    chapters: [
      // রসায়ন ১ম পত্র
      { id: 'chem-1-1', name: 'রসায়ন ১ম - অধ্যায় ১: ল্যাবরেটরির নিরাপদ ব্যবহার', title: 'ল্যাবরেটরির নিরাপদ ব্যবহার' },
      { id: 'chem-1-2', name: 'রসায়ন ১ম - অধ্যায় ২: গুণগত রসায়ন', title: 'গুণগত রসায়ন' },
      { id: 'chem-1-3', name: 'রসায়ন ১ম - অধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম ও বন্ধন', title: 'মৌলের পর্যায়বৃত্ত ধর্ম' },
      { id: 'chem-1-4', name: 'রসায়ন ১ম - অধ্যায় ৪: রাসায়নিক পরিবর্তন', title: 'রাসায়নিক পরিবর্তন' },
      { id: 'chem-1-5', name: 'রসায়ন ১ম - অধ্যায় ৫: কর্মমুখী রসায়ন', title: 'কর্মমুখী রসায়ন' },
      // রসায়ন ২য় পত্র
      { id: 'chem-2-1', name: 'রসায়ন ২য় - অধ্যায় ১: পরিবেশ রসায়ন', title: 'পরিবেশ রসায়ন' },
      { id: 'chem-2-2', name: 'রসায়ন ২য় - অধ্যায় ২: জৈব রসায়ন', title: 'জৈব রসায়ন' },
      { id: 'chem-2-3', name: 'রসায়ন ২য় - অধ্যায় ৩: পরিমাণগত রসায়ন', title: 'পরিমাণগত রসায়ন' },
      { id: 'chem-2-4', name: 'রসায়ন ২য় - অধ্যায় ৪: তড়িৎ রসায়ন', title: 'তড়িৎ রসায়ন' },
      { id: 'chem-2-5', name: 'রসায়ন ২য় - অধ্যায় ৫: অর্থনৈতিক রসায়ন', title: 'অর্থনৈতিক রসায়ন' }
    ]
  },
  {
    id: 'adm-physics',
    label: 'পদার্থবিজ্ঞান (Medical, Eng & Varsity)',
    name: 'পদার্থবিজ্ঞান',
    level: 'Admission',
    emoji: '⚡',
    category: 'Science',
    chapters: [
      // পদার্থ ১ম পত্র
      { id: 'phy-1-1', name: 'পদার্থ ১ম - অধ্যায় ১: ভৌতজগত ও পরিমাপ', title: 'ভৌতজগত ও পরিমাপ' },
      { id: 'phy-1-2', name: 'পদার্থ ১ম - অধ্যায় ২: ভেক্টর', title: 'ভেক্টর' },
      { id: 'phy-1-3', name: 'পদার্থ ১ম - অধ্যায় ৩: গতিবিদ্যা', title: 'গতিবিদ্যা' },
      { id: 'phy-1-4', name: 'পদার্থ ১ম - অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা', title: 'নিউটনিয়ান বলবিদ্যা' },
      { id: 'phy-1-5', name: 'পদার্থ ১ম - অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা', title: 'কাজ, শক্তি ও ক্ষমতা' },
      { id: 'phy-1-6', name: 'পদার্থ ১ম - অধ্যায় ৬: মহাকর্ষ ও অভিকর্ষ', title: 'মহাকর্ষ ও অভিকর্ষ' },
      { id: 'phy-1-7', name: 'পদার্থ ১ম - অধ্যায় ৭: পদার্থের গাঠনিক ধর্ম', title: 'পদার্থের গাঠনিক ধর্ম' },
      { id: 'phy-1-8', name: 'পদার্থ ১ম - অধ্যায় ৮: পর্যায়বৃত্ত গতি', title: 'পর্যায়বৃত্ত গতি' },
      { id: 'phy-1-9', name: 'পদার্থ ১ম - অধ্যায় ৯: তরঙ্গ', title: 'তরঙ্গ' },
      { id: 'phy-1-10', name: 'পদার্থ ১ম - অধ্যায় ১০: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', title: 'আদর্শ গ্যাস' },
      // পদার্থ ২য় পত্র
      { id: 'phy-2-1', name: 'পদার্থ ২য় - অধ্যায় ১: তাপগতিবিদ্যা', title: 'তাপগতিবিদ্যা' },
      { id: 'phy-2-2', name: 'পদার্থ ২য় - অধ্যায় ২: স্থির তড়িৎ', title: 'স্থির তড়িৎ' },
      { id: 'phy-2-3', name: 'পদার্থ ২য় - অধ্যায় ৩: চলতড়িৎ', title: 'চলতড়িৎ' },
      { id: 'phy-2-4', name: 'পদার্থ ২য় - অধ্যায় ৪: তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', title: 'চুম্বকত্ব' },
      { id: 'phy-2-5', name: 'পদার্থ ২য় - অধ্যায় ৫: তাড়িতচৌম্বকীয় আবেশ ও পরিবর্তী প্রবাহ', title: 'তাড়িতচৌম্বকীয় আবেশ' },
      { id: 'phy-2-6', name: 'পদার্থ ২য় - অধ্যায় ৬: জ্যামিতিক আলোকবিজ্ঞান', title: 'জ্যামিতিক আলোকবিজ্ঞান' },
      { id: 'phy-2-7', name: 'পদার্থ ২য় - অধ্যায় ৭: ভৌত আলোকবিজ্ঞান', title: 'ভৌত আলোকবিজ্ঞান' },
      { id: 'phy-2-8', name: 'পদার্থ ২য় - অধ্যায় ৮: আধুনিক পদার্থবিজ্ঞানের সূচনা', title: 'আধুনিক পদার্থবিজ্ঞান' },
      { id: 'phy-2-9', name: 'পদার্থ ২য় - অধ্যায় ৯: পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান', title: 'পরমাণুর মডেল' },
      { id: 'phy-2-10', name: 'পদার্থ ২য় - অধ্যায় ১০: সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', title: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স' },
      { id: 'phy-2-11', name: 'পদার্থ ২য় - অধ্যায় ১১: জ্যোতির্বিজ্ঞান', title: 'জ্যোতির্বিজ্ঞান' }
    ]
  },
  {
    id: 'adm-math',
    label: 'উচ্চতর গণিত (Engineering & Varsity A)',
    name: 'উচ্চতর গণিত',
    level: 'Admission',
    emoji: '📐',
    category: 'Engineering',
    chapters: [
      // গণিত ১ম পত্র
      { id: 'math-1-1', name: 'গণিত ১ম - অধ্যায় ১: ম্যাট্রিক্স ও নির্ণায়ক', title: 'ম্যাট্রিক্স ও নির্ণায়ক' },
      { id: 'math-1-2', name: 'গণিত ১ম - অধ্যায় ২: ভেক্টর', title: 'ভেক্টর' },
      { id: 'math-1-3', name: 'গণিত ১ম - অধ্যায় ৩: সরলরেখা', title: 'সরলরেখা' },
      { id: 'math-1-4', name: 'গণিত ১ম - অধ্যায় ৪: বৃত্ত', title: 'বৃত্ত' },
      { id: 'math-1-5', name: 'গণিত ১ম - অধ্যায় ৫: বিন্যাস ও সমাবেশ', title: 'বিন্যাস ও সমাবেশ' },
      { id: 'math-1-6', name: 'গণিত ১ম - অধ্যায় ৬: ত্রিকোণমিতিক অনুপাত', title: 'ত্রিকোণমিতিক অনুপাত' },
      { id: 'math-1-7', name: 'গণিত ১ম - অধ্যায় ৭: সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', title: 'সংযুক্ত কোণ' },
      { id: 'math-1-8', name: 'গণিত ১ম - অধ্যায় ৮: ফাংশন ও ফাংশনের লেখচিত্র', title: 'ফাংশন' },
      { id: 'math-1-9', name: 'গণিত ১ম - অধ্যায় ৯: অন্তরীকরণ (Differentiation)', title: 'অন্তরীকরণ' },
      { id: 'math-1-10', name: 'গণিত ১ম - অধ্যায় ১০: যোগজীকরণ (Integration)', title: 'যোগজীকরণ' },
      // গণিত ২য় পত্র
      { id: 'math-2-1', name: 'গণিত ২য় - অধ্যায় ১: বাস্তব সংখ্যা ও অসমতা', title: 'বাস্তব সংখ্যা' },
      { id: 'math-2-2', name: 'গণিত ২য় - অধ্যায় ২: যোগাশ্রয়ী প্রোগ্রাম', title: 'যোগাশ্রয়ী প্রোগ্রাম' },
      { id: 'math-2-3', name: 'গণিত ২য় - অধ্যায় ৩: জটিল সংখ্যা', title: 'জটিল সংখ্যা' },
      { id: 'math-2-4', name: 'গণিত ২য় - অধ্যায় ৪: বহুপদী ও বহুপদী সমীকরণ', title: 'বহুপদী' },
      { id: 'math-2-5', name: 'গণিত ২য় - অধ্যায় ৫: দ্বিপদী বিস্তার', title: 'দ্বিপদী বিস্তার' },
      { id: 'math-2-6', name: 'গণিত ২য় - অধ্যায় ৬: কনিক (Conics)', title: 'কনিক' },
      { id: 'math-2-7', name: 'গণিত ২য় - অধ্যায় ৭: বিপরীত ত্রিকোণমিতিক ফাংশন', title: 'বিপরীত ত্রিকোণমিতি' },
      { id: 'math-2-8', name: 'গণিত ২য় - অধ্যায় ৮: স্থিতিবিদ্যা (Statics)', title: 'স্থিতিবিদ্যা' },
      { id: 'math-2-9', name: 'গণিত ২য় - অধ্যায় ৯: সমতলে বস্তুকণার গতি (Dynamics)', title: 'গতিবিদ্যা' },
      { id: 'math-2-10', name: 'গণিত ২য় - অধ্যায় ১০: বিস্তার পরিমাপ ও সম্ভাবনা', title: 'সম্ভাবনা' }
    ]
  },
  {
    id: 'adm-english',
    label: 'ইংরেজি (Medical, Nursing & Varsity)',
    name: 'ইংরেজি',
    level: 'Admission',
    emoji: '📚',
    category: 'Language',
    chapters: [
      { id: 'eng-vocab', name: 'Synonyms, Antonyms & Medical Vocab', title: 'Vocabulary' },
      { id: 'eng-prep', name: 'Appropriate Prepositions & Idioms', title: 'Prepositions' },
      { id: 'eng-grammar', name: 'Subject-Verb Agreement, Voice & Right Forms of Verbs', title: 'Grammar' },
      { id: 'eng-spelling', name: 'Spelling, Corrections & Narration', title: 'Spelling & Correction' }
    ]
  },
  {
    id: 'adm-gk',
    label: 'সাধারণ জ্ঞান (Medical, Nursing & Varsity)',
    name: 'সাধারণ জ্ঞান',
    level: 'Admission',
    emoji: '🌍',
    category: 'General',
    chapters: [
      { id: 'gk-liberation', name: 'ইতিহাস, ভাষা আন্দোলন ও মহান মুক্তিযুদ্ধ (১৯৪৭-১৯৭১)', title: 'মুক্তিযুদ্ধ' },
      { id: 'gk-bangladesh', name: 'সংবিধান, মেগা প্রজেক্ট ও জাতীয় অর্জন', title: 'বাংলাদেশ বিষয়াবলী' },
      { id: 'gk-international', name: 'আন্তর্জাতিক বিষয়াবলী ও সাম্প্রতিক ঘটনাবলী', title: 'আন্তর্জাতিক' }
    ]
  },
  {
    id: 'adm-nursing-science',
    label: 'নার্সিং সাধারণ বিজ্ঞান ও স্বাস্থ্য',
    name: 'সাধারণ বিজ্ঞান ও স্বাস্থ্য',
    level: 'Admission',
    emoji: '🏥',
    category: 'Nursing',
    chapters: [
      { id: 'nur-sci-1', name: 'মানবদেহ, পুষ্টি ও ভিটামিন', title: 'পুষ্টি ও ভিটামিন' },
      { id: 'nur-sci-2', name: 'সংক্রামক রোগ, টিকা ও প্রাথমিক চিকিৎসা', title: 'রোগ ও চিকিৎসা' },
      { id: 'nur-sci-3', name: 'দৈনন্দিন বিজ্ঞান ও পরিবেশ', title: 'দৈনন্দিন বিজ্ঞান' }
    ]
  }
];

export const ADMISSION_BUILDER_QUESTIONS = [
  // ── Biology ──────────────────────────────────────────────────────────
  {
    id: 'adm-bio-01',
    subject: 'adm-biology',
    chapterId: 'bio-bot-1',
    chapterName: 'উদ্ভিদবিজ্ঞান - অধ্যায় ১: কোষ ও এর গঠন',
    type: 'mcq',
    question: 'প্লাজমামেমব্রেনের সবচেয়ে গ্রহণযোগ্য ‘ফ্লুইড মোজাইক মডেল’ কত সালে এবং কে প্রস্তাব করেন?',
    options: ['সিঙ্গার ও নিকলসন (১৯৭২)', 'ড্যানিয়েলি ও ড্যাভসন (১৯৩৫)', 'রবার্টসন (১৯৫৯)', 'ওয়াটসন ও ক্রিক (১৯৫৩)'],
    answer: 0,
    explanation: '১৯৭২ সালে বিজ্ঞানী এস. জে. সিঙ্গার এবং জি. এল. নিকলসন কোষঝিল্লির গঠন ব্যাখ্যার জন্য বহুল প্রচলিত ফ্লুইড মোজাইক মডেল প্রস্তাব করেন।',
    examType: 'মেডিকেল (MBBS)',
    year: '2023-2024',
    topic: 'কোষ ও এর গঠন'
  },
  {
    id: 'adm-bio-02',
    subject: 'adm-biology',
    chapterId: 'bio-bot-2',
    chapterName: 'উদ্ভিদবিজ্ঞান - অধ্যায় ২: কোষ বিভাজন',
    type: 'mcq',
    question: 'মায়োসিস-১ এর কোন উপপর্যায়ে হোমোলোগাস ক্রোমোজোমের মধ্যে কায়াজমা ও ক্রসিং ওভার ঘটে?',
    options: ['লেপ্টোটিন', 'জাইগোটিন', 'প্যাকাইটিন', 'ডিপ্লোটিন'],
    answer: 2,
    explanation: 'মায়োসিস-১ এর প্রফেজ-১ এর প্যাকাইটিন দশায় নন-সিস্টার ক্রোমাটিডের মধ্যে খণ্ডবিনিময় বা ক্রসিং ওভার সংঘটিত হয়।',
    examType: 'মেডিকেল (MBBS)',
    year: '2022-2023',
    topic: 'কোষ বিভাজন'
  },
  {
    id: 'adm-bio-03',
    subject: 'adm-biology',
    chapterId: 'bio-zoo-4',
    chapterName: 'প্রাণিবিজ্ঞান - অধ্যায় ৪: মানব শারীরতত্ত্ব: রক্ত ও সংবহন',
    type: 'mcq',
    question: 'হৃৎপিণ্ডের কোন অংশকে প্রাকৃতিক পেসমেকার (Natural Pacemaker) বলা হয়?',
    options: ['AV Node', 'SA Node', 'Bundle of His', 'Purkinje Fibres'],
    answer: 1,
    explanation: 'সাইনো-অ্যাট্রিয়াল নোড (SA Node) প্রতি মিনিটে স্বয়ংক্রিয়ভাবে ৭০-৮০ বার ছন্দময় উদ্দীপনা সৃষ্টি করতে পারে, তাই একে প্রাকৃতিক পেসমেকার বলা হয়।',
    examType: 'মেডিকেল (MBBS)',
    year: '2023-2024',
    topic: 'রক্ত ও সংবহন'
  },
  {
    id: 'adm-bio-04',
    subject: 'adm-biology',
    chapterId: 'bio-zoo-1',
    chapterName: 'প্রাণিবিজ্ঞান - অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
    type: 'mcq',
    question: 'শিখা কোষ (Flame Cell) নিচের কোন পর্বের প্রাণীদের প্রধান রেচন অঙ্গ?',
    options: ['Cnidaria', 'Platyhelminthes', 'Nematoda', 'Annelida'],
    answer: 1,
    explanation: 'Platyhelminthes বা চ্যাপ্টাকৃমি পর্বের প্রাণীদের বিশেষ রেচন অঙ্গ হলো শিখা কোষ (Flame Cell)।',
    examType: 'ডেন্টাল (BDS)',
    year: '2022-2023',
    topic: 'প্রাণীর বিভিন্নতা'
  },
  {
    id: 'adm-bio-05',
    subject: 'adm-biology',
    chapterId: 'bio-zoo-11',
    chapterName: 'প্রাণিবিজ্ঞান - অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন',
    type: 'mcq',
    question: 'মেন্ডেলের ১ম সূত্রের ব্যতিক্রম—পরিপূরক জিনের (Complementary Gene) ফিনোটাইপিক অনুপাত কোনটি?',
    options: ['৩:১', '৯:৩:৩:১', '৯:৭', '১৩:৩'],
    answer: 2,
    explanation: 'দুটি ভিন্ন লোকাসে অবস্থিত প্রকট জিনের উপস্থিতিতে কাঙ্ক্ষিত বৈশিষ্ট্য প্রকাশ পেলে তাকে পরিপূরক জিন বলে, যার অনুপাত ৯:৭।',
    examType: 'ভার্সিটি (DU-A)',
    year: '2023-2024',
    topic: 'জিনতত্ত্ব'
  },

  // ── Chemistry ────────────────────────────────────────────────────────
  {
    id: 'adm-chem-01',
    subject: 'adm-chemistry',
    chapterId: 'chem-1-2',
    chapterName: 'রসায়ন ১ম - অধ্যায় ২: গুণগত রসায়ন',
    type: 'mcq',
    question: 'শিখা পরীক্ষায় পটাসিয়াম (K) আয়ন বুনসেন শিখায় কী বর্ণ প্রদর্শন করে?',
    options: ['সোনালী হলুদ', 'ইটের মতো লাল', 'হালকা বেগুনি (Lilac)', 'নীলাভ সবুজ'],
    answer: 2,
    explanation: 'পটাশিয়াম (K+) আয়ন শিখা পরীক্ষায় হালকা বেগুনি বা ল্যাভেন্ডার বর্ণ দেয়। সোডিয়াম দেয় সোনালী হলুদ এবং ক্যালসিয়াম দেয় ইটের মতো লাল।',
    examType: 'মেডিকেল (MBBS)',
    year: '2023-2024',
    topic: 'গুণগত রসায়ন'
  },
  {
    id: 'adm-chem-02',
    subject: 'adm-chemistry',
    chapterId: 'chem-1-3',
    chapterName: 'রসায়ন ১ম - অধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম',
    type: 'mcq',
    question: 'নিচের কোন মৌলটির ইলেকট্রন আসক্তি (Electron Affinity) সবচেয়ে বেশি?',
    options: ['Fluorine (F)', 'Chlorine (Cl)', 'Bromine (Br)', 'Iodine (I)'],
    answer: 1,
    explanation: 'ক্ষুদ্র আকারের কারণে ফ্লোরিনের ২p অরবিটালে ইলেকট্রন মেঘের ঘনত্বের আন্তঃইলেকট্রনীয় বিকর্ষণ বেশি থাকে, তাই ক্লোরিনের (Cl) ইলেকট্রন আসক্তি সর্বাধিক (-349 kJ/mol)।',
    examType: 'বুয়েট ও ইঞ্জিনিয়ারিং (BUET)',
    year: '2022-2023',
    topic: 'পর্যায়বৃত্ত ধর্ম'
  },
  {
    id: 'adm-chem-03',
    subject: 'adm-chemistry',
    chapterId: 'chem-2-2',
    chapterName: 'রসায়ন ২য় - অধ্যায় ২: জৈব রসায়ন',
    type: 'mcq',
    question: 'লুকাস বিকারক (Lucas Reagent) বলতে কী বোঝায়?',
    options: ['অনলেইক এসিড ও বেনজিন', 'গাঢ় HCl ও অনার্দ্র ZnCl2', 'ক্ষারীয় KMnO4 দ্রবণ', 'অ্যামোনিয়াম সালফেট দ্রবণ'],
    answer: 1,
    explanation: 'গাঢ় হাইড্রোক্লোরিক এসিড (HCl) এবং অনার্দ্র জিংক ক্লোরাইড (anhydrous ZnCl2) এর মিশ্রণকে লুকাস বিকারক বলে, যা ১°, ২° ও ৩° অ্যালকোহল শনাক্তকরণে ব্যবহৃত হয়।',
    examType: 'মেডিকেল (MBBS)',
    year: '2022-2023',
    topic: 'জৈব রসায়ন'
  },
  {
    id: 'adm-chem-04',
    subject: 'adm-chemistry',
    chapterId: 'chem-2-3',
    chapterName: 'রসায়ন ২য় - অধ্যায় ৩: পরিমাণগত রসায়ন',
    type: 'mcq',
    question: 'প্রমাণ তাপমাত্রা ও চাপে (STP) ১ মোল যেকোনো গ্যাসের মোলার আয়তন কত লিটার?',
    options: ['২২.৪ L', '২৪.৭৮৯ L', '২২.৭১ L', '২০.০ L'],
    answer: 0,
    explanation: 'STP (0°C ও 1 atm চাপে) ১ মোল আদর্শ গ্যাসের আয়তন ২২.৪১৪ লিটার। SATP তে ২৪.৭৮৯ লিটার।',
    examType: 'GST গুচ্ছ',
    year: '2023-2024',
    topic: 'পরিমাণগত রসায়ন'
  },

  // ── Physics ──────────────────────────────────────────────────────────
  {
    id: 'adm-phy-01',
    subject: 'adm-physics',
    chapterId: 'phy-1-2',
    chapterName: 'পদার্থ ১ম - অধ্যায় ২: ভেক্টর',
    type: 'mcq',
    question: 'দুটি ভেক্টরের ডট গুণন (Dot Product) শূন্য হলে ভেক্টরদ্বয়ের মধ্যবর্তী কোণ কত?',
    options: ['0°', '45°', '90°', '180°'],
    answer: 2,
    explanation: 'A · B = AB cosθ। যদি A · B = 0 হয়, তবে cosθ = 0 => θ = 90°। অর্থাৎ ভেক্টরদ্বয় পরস্পর লম্ব।',
    examType: 'বুয়েট (BUET)',
    year: '2023-2024',
    topic: 'ভেক্টর'
  },
  {
    id: 'adm-phy-02',
    subject: 'adm-physics',
    chapterId: 'phy-1-5',
    chapterName: 'পদার্থ ১ম - অধ্যায় ৫: কাজ, শক্তি ও ক্ষমতা',
    type: 'mcq',
    question: '১ অশ্বক্ষমতা (1 Horse Power) সমান কত ওয়াট?',
    options: ['৫০০ ওয়াট', '৭৪৬ ওয়াট', '১০০০ ওয়াট', '৭৫০ ওয়াট'],
    answer: 1,
    explanation: '১ অশ্বক্ষমতা (1 HP) = ৭৪৬ ওয়াট (746 Watts)।',
    examType: 'মেডিকেল (MBBS)',
    year: '2023-2024',
    topic: 'কাজ ও শক্তি'
  },
  {
    id: 'adm-phy-03',
    subject: 'adm-physics',
    chapterId: 'phy-2-1',
    chapterName: 'পদার্থ ২য় - অধ্যায় ১: তাপগতিবিদ্যা',
    type: 'mcq',
    question: 'রূদ্ধতাপীয় প্রক্রিয়ায় (Adiabatic Process) নিচের কোন রাশিটি স্থির থাকে?',
    options: ['তাপমাত্রা (T)', 'চাপ (P)', 'এনট্রপি (S)', 'আয়তন (V)'],
    answer: 2,
    explanation: 'রূদ্ধতাপীয় প্রত্যাবর্তী প্রক্রিয়ায় পরিবেশের সাথে সিস্টেমের কোনো তাপের আদান-প্রদান হয় না (dQ = 0), তাই এনট্রপি স্থির থাকে (dS = dQ/T = 0)।',
    examType: 'ভার্সিটি (DU-A)',
    year: '2022-2023',
    topic: 'তাপগতিবিদ্যা'
  },

  // ── English ──────────────────────────────────────────────────────────
  {
    id: 'adm-eng-01',
    subject: 'adm-english',
    chapterId: 'eng-vocab',
    chapterName: 'Synonyms, Antonyms & Medical Vocab',
    type: 'mcq',
    question: 'Choose the correct synonym of the word "BENEVOLENT":',
    options: ['Cruel', 'Generous', 'Hostile', 'Reluctant'],
    answer: 1,
    explanation: 'Benevolent অর্থ পরোপকারী, দয়ালু বা হিতৈষী। এর সঠিক Synonym হলো Generous বা Kindhearted।',
    examType: 'মেডিকেল (MBBS)',
    year: '2023-2024',
    topic: 'Synonyms'
  },
  {
    id: 'adm-eng-02',
    subject: 'adm-english',
    chapterId: 'eng-prep',
    chapterName: 'Appropriate Prepositions & Idioms',
    type: 'mcq',
    question: 'He died ________ cancer after fighting for two years.',
    options: ['of', 'from', 'by', 'for'],
    answer: 0,
    explanation: 'কোনো নির্দিষ্ট রোগে মৃত্যুবরণ করলে Preposition হিসেবে "die of" ব্যবহৃত হয়। যেমন: Die of cancer/cholera/malaria।',
    examType: 'নার্সিং (BSc & Diploma)',
    year: '2023-2024',
    topic: 'Prepositions'
  },
  {
    id: 'adm-eng-03',
    subject: 'adm-english',
    chapterId: 'eng-grammar',
    chapterName: 'Subject-Verb Agreement, Voice & Right Forms of Verbs',
    type: 'mcq',
    question: 'Neither the teacher nor the students ________ present in the auditorium.',
    options: ['was', 'were', 'is', 'has been'],
    answer: 1,
    explanation: 'Neither... nor এর ক্ষেত্রে দ্বিতীয় সাবজেক্ট অনুযায়ী verb নির্ধারিত হয়। এখানে "students" প্লুরাল হওয়ায় verb হবে "were"।',
    examType: 'ভার্সিটি (DU)',
    year: '2023-2024',
    topic: 'Subject-Verb Agreement'
  },

  // ── GK ───────────────────────────────────────────────────────────────
  {
    id: 'adm-gk-01',
    subject: 'adm-gk',
    chapterId: 'gk-liberation',
    chapterName: 'ইতিহাস, ভাষা আন্দোলন ও মহান মুক্তিযুদ্ধ (১৯৪৭-১৯৭১)',
    type: 'mcq',
    question: '১৯৭১ সালে মুক্তিযুদ্ধের সময় ঢাকা কোন সেক্টরের অধীনে ছিল?',
    options: ['১ নং সেক্টর', '২ নং সেক্টর', '৩ নং সেক্টর', '১১ নং সেক্টর'],
    answer: 1,
    explanation: 'ঢাকা ছিল ২ নং সেক্টরের অধীনে। এই সেক্টরের কমান্ডার ছিলেন মেজর খালেদ মোশাররফ (পরবর্তীতে মেজর এ টি এম হায়দার)।',
    examType: 'মেডিকেল (MBBS)',
    year: '2023-2024',
    topic: 'মুক্তিযুদ্ধ'
  },
  {
    id: 'adm-gk-02',
    subject: 'adm-gk',
    chapterId: 'gk-bangladesh',
    chapterName: 'সংবিধান, মেগা প্রজেক্ট ও জাতীয় অর্জন',
    type: 'mcq',
    question: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান কার্যকর হয় কত তারিখে?',
    options: ['২৬ মার্চ ১৯৭১', '১৬ ডিসেম্বর ১৯৭২', '৪ নভেম্বর ১৯৭২', '১০ জানুয়ারি ১৯৭২'],
    answer: 1,
    explanation: '১৯৭২ সালের ৪ নভেম্বর গণপরিষদে সংবিধান গৃহীত হয় এবং ১৯৭২ সালের ১৬ ডিসেম্বর বিজয় দিবসে এটি কার্যকর হয়।',
    examType: 'নার্সিং ও মেডিকেল',
    year: '2022-2023',
    topic: 'সংবিধান'
  },

  // ── Nursing Science ───────────────────────────────────────────────────
  {
    id: 'adm-nur-01',
    subject: 'adm-nursing-science',
    chapterId: 'nur-sci-1',
    chapterName: 'মানবদেহ, পুষ্টি ও ভিটামিন',
    type: 'mcq',
    question: 'পানিতে দ্রবণীয় ভিটামিন নিচের কোনটি?',
    options: ['ভিটামিন A', 'ভিটামিন D', 'ভিটামিন C', 'ভিটামিন K'],
    answer: 2,
    explanation: 'ভিটামিন B-কমপ্লেক্স এবং ভিটামিন C হলো পানিতে দ্রবণীয় ভিটামিন। ভিটামিন A, D, E, K হলো স্নেহ বা চর্বিতে দ্রবণীয়।',
    examType: 'নার্সিং (BSc & Diploma)',
    year: '2023-2024',
    topic: 'ভিটামিন ও পুষ্টি'
  },
  {
    id: 'adm-nur-02',
    subject: 'adm-nursing-science',
    chapterId: 'nur-sci-2',
    chapterName: 'সংক্রামক রোগ, টিকা ও প্রাথমিক চিকিৎসা',
    type: 'mcq',
    question: 'যক্ষ্মা (TB) রোগের প্রতিষেধক টিকার নাম কী?',
    options: ['BCG', 'DPT', 'OPV', 'MMR'],
    answer: 0,
    explanation: 'যক্ষ্মা (Tuberculosis) রোগের প্রতিষেধক টিকার নাম বিসিজি (BCG - Bacillus Calmette-Guérin)।',
    examType: 'নার্সিং (BSc & Diploma)',
    year: '2022-2023',
    topic: 'টিকা ও প্রতিরোধ'
  }
];
