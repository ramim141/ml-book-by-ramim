/**
 * Medical & Dental Admission Configuration & High-Yield Data
 * Designed for MBBS & BDS Admission Preparation in Bangladesh.
 */

export const MEDICAL_SUBJECTS_DETAILED = [
  {
    id: 'biology',
    name: 'জীববিজ্ঞান (Biology)',
    subTitle: 'উদ্ভিদবিজ্ঞান (Botany) + প্রাণিবিজ্ঞান (Zoology)',
    marks: 30,
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: 'Dna',
    recommendedBooks: ['ড. আবুল হাসান (উদ্ভিদবিজ্ঞান)', 'গাজী আজমল ও গাজী আসমত (প্রাণিবিজ্ঞান)'],
    chapters: [
      {
        id: 'bio-bot-1',
        paper: 'উদ্ভিদবিজ্ঞান',
        name: 'অধ্যায় ১: কোষ ও এর গঠন',
        highYieldTopics: ['প্লাজমামেমব্রেনের ফ্লুইড মোজাইক মডেল', 'রাইবোজোম ও প্রোটিন ফ্যাক্টরি', 'ক্লোরোপ্লাস্ট ও মাইটোকন্ড্রিয়া', 'DNA ও RNA এর গঠন ও প্রকারভেদ'],
        repeatedQuestionsCount: 42,
        keyFacts: [
          'ফ্লুইড মোজাইক মডেল প্রস্তাব করেন সিঙ্গার ও নিকলসন (১৯৭২)। এটিকে আইসবার্গ মডেলও বলা হয়।',
          'কোষের প্রোটিন ফ্যাক্টরি হলো রাইবোজোম (70S ও 80S)।',
          'মাইটোকন্ড্রিয়াকে কোষের পাওয়ার হাউজ বলা হয়। অন্তঃপর্দায় ক্রিস্টি ও এটিপি সিন্থেসিস থাকে।'
        ]
      },
      {
        id: 'bio-bot-2',
        paper: 'উদ্ভিদবিজ্ঞান',
        name: 'অধ্যায় ২: কোষ বিভাজন',
        highYieldTopics: ['মিয়োসিস-১ এর প্রফেজ-১ উপপর্যায় (লেপ্টোটিন, জাইগোটিন, প্যাকাইটিন, ডিপ্লোটিন, ডায়াকাইনেসিস)', 'ক্রসিং ওভার ও কায়াজমা'],
        repeatedQuestionsCount: 35,
        keyFacts: [
          'ক্রসিং ওভার ঘটে প্যাকাইটিন উপপর্যায়ে (হোমোলোগাস ক্রোমোজোমের নন-সিস্টার ক্রোমাটিডের মধ্যে)।',
          'বাইভ্যালেন্ট তৈরি হয় জাইগোটিন উপপর্যায়ে (Synapsis)।'
        ]
      },
      {
        id: 'bio-bot-9',
        paper: 'উদ্ভিদবিজ্ঞান',
        name: 'অধ্যায় ৯: উদ্ভিদ শারীরতত্ত্ব',
        highYieldTopics: ['C3 ও C4 চক্র (হ্যাচ ও স্ল্যাক)', 'গ্লাইকোলাইসিস ও ক্রেবস চক্র', 'প্রস্বেদন ও পত্ররন্ধ্র'],
        repeatedQuestionsCount: 48,
        keyFacts: [
          'C4 উদ্ভিদের প্রথম স্থায়ী পদার্থ হলো অক্সালোঅ্যাসিটিক এসিড (৪ কার্বন)।',
          'গ্লাইকোলাইসিস সাইটোপ্লাজমে ঘটে, কোনো অক্সিজেনের প্রয়োজন হয় না।'
        ]
      },
      {
        id: 'bio-zoo-1',
        paper: 'প্রাণিবিজ্ঞান',
        name: 'অধ্যায় ১: প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
        highYieldTopics: ['প্রাণিজগতের ৯টি প্রধান পর্ব ও তাদের বৈশিষ্ট্য', 'নন-কর্ডাটা ও কর্ডাটা শ্রেণিবিভাগ', 'সিলোম ও প্রতিসাম্যতা'],
        repeatedQuestionsCount: 52,
        keyFacts: [
          'Cnidaria পর্বের বৈশিষ্ট্য: নিডোসাইট ও নেমাটোসিস্ট, সিলেন্টেরন বা গ্যাস্ট্রোভাস্কুলার গহ্বর।',
          'Platyhelminthes (চ্যাপ্টাকৃমি): শিখা কোষ (Flame cells) রেচন অঙ্গ, অ্যাসিলোমেট।',
          'Arthropoda: হিমোসিল, ট্রাকিয়া রেচন অঙ্গ ম্যালপিজিয়ান নালিকা।'
        ]
      },
      {
        id: 'bio-zoo-4',
        paper: 'প্রাণিবিজ্ঞান',
        name: 'অধ্যায় ৪: মানব শারীরতত্ত্ব: রক্ত ও সংবহন',
        highYieldTopics: ['রক্তকণিকা (RBC, WBC, অনুচক্রিকা)', 'রক্ত জমাট বাঁধার ১৩টি ফ্যাক্টর', 'হৃৎপিণ্ডের কপাটিকা ও মায়োজেনিক নিয়ন্ত্রণ (SA node, AV node)'],
        repeatedQuestionsCount: 65,
        keyFacts: [
          'SA Node হলো হৃৎপিণ্ডের পেসমেকার (Pace Maker)।',
          'রক্ত জমাট বাঁধার প্রধান ৪টি ফ্যাক্টর মনে রাখার ছন্দ: "ফুল পড়ে টুপ করে" (ফাইব্রিনোজেন, প্রোথ্রম্বিন, থ্রম্বোপ্লাস্টিন, ক্যালসিয়াম)।',
          'সর্বজনীন দাতা হলো O-ve এবং সর্বজনীন গ্রহীতা হলো AB+ve।'
        ]
      },
      {
        id: 'bio-zoo-11',
        paper: 'প্রাণিবিজ্ঞান',
        name: 'অধ্যায় ১১: জিনতত্ত্ব ও বিবর্তন',
        highYieldTopics: ['মেন্ডেলের সূত্র ও ব্যতিক্রমসমূহ (অসম্পূর্ণ প্রকটতা ১:২:১, পরিপূরক জিন ৯:৭, এপিস্ট্যাসিস ১৩:৩)', 'সেক্স লিংকড ডিজঅর্ডার (হিমোফিলিয়া, বর্ণান্ধতা)'],
        repeatedQuestionsCount: 58,
        keyFacts: [
          'মেন্ডেলের ১ম সূত্রের ফিনোটাইপিক অনুপাত ৩:১, ২য় সূত্রের ৯:৩:৩:১।',
          'পরিপূরক জিনের অনুপাত ৯:৭, ডুপ্লিকেট রিসেসিভ এপিস্ট্যাসিস।',
          'লাল-সবুজ বর্ণান্ধতা ও হিমোফিলিয়া হলো X-linked recessive রোগ।'
        ]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'রসায়ন (Chemistry)',
    subTitle: '১ম পত্র + ২য় পত্র',
    marks: 25,
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: 'FlaskConical',
    recommendedBooks: ['ড. সরোজ কান্তি সিংহ হাজারী ও প্রফেসর হরেকৃষ্ণ রায়', 'কবীর পাবলিকেশন্স'],
    chapters: [
      {
        id: 'chem-1-2',
        paper: '১ম পত্র',
        name: 'অধ্যায় ২: গুণগত রসায়ন',
        highYieldTopics: ['কোয়ান্টাম সংখ্যা (n, l, m, s)', 'শিখা পরীক্ষা ও বর্ণালী', 'দ্রাব্যতা ও দ্রাব্যতা গুণফল (Ksp)'],
        repeatedQuestionsCount: 55,
        keyFacts: [
          'হাইড্রোজেন পরমাণুর বর্ণালী সিরিজ: লাইমেন (UV), বামার (Visible), পbreakpoint (IR)।',
          'আউফবাউ নীতি অনুযায়ী শক্তির ক্রম: (n+l) যার কম তার শক্তি কম।'
        ]
      },
      {
        id: 'chem-1-3',
        paper: '১ম পত্র',
        name: 'অধ্যায় ৩: মৌলের পর্যায়বৃত্ত ধর্ম ও বন্ধন',
        highYieldTopics: ['আয়নন শক্তি ও ইলেকট্রন আসক্তির ব্যতিক্রম (N > O, Be > B)', 'সংকরায়ন (sp3, sp2, sp, sp3d) ও আকৃতি', 'হাইড্রোজেন বন্ধন'],
        repeatedQuestionsCount: 45,
        keyFacts: [
          'হ্যালোজেনদের ইলেকট্রন আসক্তির ক্রম: Cl > F > Br > I।',
          'NH3 এর সংকরায়ন sp3 কিন্তু মুক্তজোড় ইলেকট্রনের কারণে আকৃতি ত্রিকোণাকার পিরামিডীয় (১০৭°)।'
        ]
      },
      {
        id: 'chem-2-2',
        paper: '২য় পত্র',
        name: 'অধ্যায় ২: জৈব রসায়ন (Organic Chemistry)',
        highYieldTopics: ['নামীয় বিক্রিয়া (উর্টজ, ক্যানিজারো, অ্যালডল, ফ্রিডেল-ক্রাফটস)', 'অ্যারোমেটিসিটি ও হাকেল নীতি (4n+2)', 'আইসোমারিজম ও টটোমারিজম', 'অর্থো-প্যারা ও মেটা নির্দেশক গ্রুপ'],
        repeatedQuestionsCount: 75,
        keyFacts: [
          'ক্যানিজারো বিক্রিয়া দেয় আলফা-হাইড্রোজেনবিহীন অ্যালডিহাইড (HCHO, Benzaldehyde)।',
          'মেটা নির্দেশক গ্রুপ: -NO2, -COOH, -CHO, -SO3H, -CN (দ্বিবন্ধন বা ত্রিবন্ধনযুক্ত)।'
        ]
      },
      {
        id: 'chem-2-3',
        paper: '২য় পত্র',
        name: 'অধ্যায় ৩: পরিমাণগত রসায়ন',
        highYieldTopics: ['জারণ-বিজারণ সমতাকরণ ও নির্দেশক', 'মোলারিটি ও ডাইলুশন সূত্র (V1S1 = V2S2)', 'pH ও বাফার দ্রবণ'],
        repeatedQuestionsCount: 40,
        keyFacts: [
          'KMnO4 অম্লীয় মাধ্যমে ৫টি ইলেকট্রন গ্রহণ করে Mn2+ এ পরিণত হয়।',
          'রক্তের pH হলো ৭.৪০ (ক্ষারীয় বাফার দ্রবণ)।'
        ]
      }
    ]
  },
  {
    id: 'physics',
    name: 'পদার্থবিজ্ঞান (Physics)',
    subTitle: '১ম পত্র + ২য় পত্র',
    marks: 20,
    color: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: 'Zap',
    recommendedBooks: ['প্রফেসর ড. শাহজাহান তপন', 'প্রফেসর ড. আমির হোসেন খান ও প্রফেসর মোহাম্মদ ইসহাক'],
    chapters: [
      {
        id: 'phy-1-2',
        paper: '১ম পত্র',
        name: 'অধ্যায় ২: ভেক্টর',
        highYieldTopics: ['ডট ও ক্রস গুণনের শর্ত (লম্ব ও সমান্তরাল)', 'নৌকা-নদী ও বৃষ্টির ম্যাথ', 'গ্রেডিয়েন্ট, ডাইভারজেন্স ও কার্ল'],
        repeatedQuestionsCount: 38,
        keyFacts: [
          'দুটি ভেক্টর লম্ব হওয়ার শর্ত: A . B = 0।',
          'দুটি ভেক্টর সমান্তরাল হওয়ার শর্ত: A × B = 0।',
          'ডাইভারজেন্স শূন্য হলে ভেক্টরটি সলিনয়ডাল (Solenoidal) এবং কার্ল শূন্য হলে অঘূর্ণনশীল।'
        ]
      },
      {
        id: 'phy-1-4',
        paper: '১ম পত্র',
        name: 'অধ্যায় ৪: নিউটনিয়ান বলবিদ্যা',
        highYieldTopics: ['ঘর্ষণ ও ব্যাংকিং কোণ', 'জড়তার ভ্রামক ও কৌণিক ভরবেগ', 'স্থিতিস্থাপক ও অস্থিতিস্থাপক সংঘর্ষ'],
        repeatedQuestionsCount: 36,
        keyFacts: [
          'ব্যাংকিং কোণের সূত্র: tan θ = v^2 / (rg)।',
          'কৌণিক ভরবেগ L = Iω সংরক্ষিত থাকে যদি কোনো বাহ্যিক টর্ক প্রযুক্ত না হয়।'
        ]
      },
      {
        id: 'phy-2-1',
        paper: '২য় পত্র',
        name: 'অধ্যায় ১: তাপগতিবিদ্যা',
        highYieldTopics: ['তাপগতিবিদ্যার ১ম ও ২য় সূত্র', 'সমোষ্ণ ও রুদ্ধতাপীয় প্রক্রিয়া', 'কার্নো ইঞ্জিনের কর্মদক্ষতা'],
        repeatedQuestionsCount: 42,
        keyFacts: [
          'রুদ্ধতাপীয় প্রক্রিয়ায় এনট্রপি স্থির থাকে (আইসোএনট্রপিক)।',
          'কার্নো ইঞ্জিনের দক্ষতা: η = 1 - (T2/T1)।'
        ]
      },
      {
        id: 'phy-2-9',
        paper: '২য় পত্র',
        name: 'অধ্যায় ৯: পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান',
        highYieldTopics: ['বোর পরমাণু মডেল', 'তেজস্ক্রিয় ক্ষয় সূত্র ও অর্ধায়ু (T1/2 = 0.693 / λ)', 'ভর ত্রুটি ও বন্ধন শক্তি'],
        repeatedQuestionsCount: 46,
        keyFacts: [
          'তেজস্ক্রিয়তার এসআই একক হলো বেকেল (Bq), ব্যবহারিক একক কুরি (Ci)।',
          'অর্ধায়ু ও গড় আয়ুর সম্পর্ক: T_avg = 1.44 × T_1/2।'
        ]
      }
    ]
  },
  {
    id: 'english',
    name: 'মেডিকেল ইংরেজি (English)',
    subTitle: 'Grammar, Vocabulary & High-Frequency Topics',
    marks: 15,
    color: 'from-purple-500 to-pink-600',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: 'BookOpen',
    recommendedBooks: ['Master English / Cliff TOEFL', 'Medical English 25 Years QB'],
    chapters: [
      {
        id: 'eng-vocab',
        paper: 'Vocabulary',
        name: 'টপিক ১: Synonyms, Antonyms & Medical Vocab',
        highYieldTopics: ['বিগত ২৫ বছরের মেডিকেল প্রশ্ন', 'BCS ও IBA বারবার আসা শব্দসমূহ'],
        repeatedQuestionsCount: 60,
        keyFacts: [
          'Lucid = Clear / Understandable (Antonym: Obscure / Vague)',
          'Pragmatic = Practical / Realistic (Antonym: Idealistic / Theoretical)',
          'Meticulous = Extremely careful / Precise'
        ]
      },
      {
        id: 'eng-prep',
        paper: 'Grammar',
        name: 'টপিক ২: Appropriate Preposition & Idioms',
        highYieldTopics: ['Prepositions with Adjectives/Verbs', 'Phrasal Verbs & Idioms'],
        repeatedQuestionsCount: 50,
        keyFacts: [
          'Abide by = মেনে চলা, Abide in = বসবাস করা।',
          'Adhere to = লেগে থাকা, Blind to = দোষের প্রতি অন্ধ, Blind of = চোখে অন্ধ।',
          'Die of disease (রোগে মারা যাওয়া), Die from overwork (অতিরিক্ত পরিশ্রমে মারা যাওয়া)।'
        ]
      },
      {
        id: 'eng-grammar',
        paper: 'Grammar',
        name: 'টপিক ৩: Subject-Verb Agreement, Voice & Correction',
        highYieldTopics: ['Neither/Nor, Either/Or Rules', 'Inversion & Conditionals', 'One of the + Plural Noun + Singular Verb'],
        repeatedQuestionsCount: 45,
        keyFacts: [
          '"One of the boys is present" (One of the + Plural Noun + Singular Verb)।',
          '"No sooner had he seen the police than he ran away" (No sooner had... than)।'
        ]
      }
    ]
  },
  {
    id: 'gk',
    name: 'সাধারণ জ্ঞান (General Knowledge)',
    subTitle: 'বাংলাদেশ ও মুক্তিযুদ্ধ বিশেষ (Medical Syllabus)',
    marks: 10,
    color: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    icon: 'Globe',
    recommendedBooks: ['মেডিকেল জিকে স্পেশাল ও সমসাময়িক প্রকাশনা'],
    chapters: [
      {
        id: 'gk-liberation',
        paper: 'ইতিহাস ও মুক্তিযুদ্ধ',
        name: 'টপিক ১: ১৯৪৭ থেকে ১৯৭১ ও মহান মুক্তিযুদ্ধ',
        highYieldTopics: ['১৯৫২ ভাষা আন্দোলন ও শহীদগণ', '১৯৫৪ যুক্তফ্রন্ট ও ২১ দফা', '১৯৬৬ ছয় দফা ও ১৯৬৯ গণঅভ্যুত্থান', '১৯৭১ এর ১১টি সেক্টর ও সেক্টর কমান্ডারগণ', '৭ জন বীরশ্রেষ্ঠ ও তাদের সেক্টর'],
        repeatedQuestionsCount: 55,
        keyFacts: [
          'মুজিবনগর সরকার গঠিত হয়: ১০ এপ্রিল ১৯৭১, শপথ গ্রহণ করে: ১৭ এপ্রিল ১৯৭১ (মেহেরপুরের বৈদ্যনাথতলায়)।',
          'বীরশ্রেষ্ঠদের মধ্যে প্রথম শহীদ: ল্যান্স নায়েক মুন্সী আব্দুর রউফ (৮ এপ্রিল ১৯৭১), সর্বশেষ শহীদ: ক্যাপ্টেন মহিউদ্দীন জাহাঙ্গীর (১৪ ডিসেম্বর ১৯৭১)।',
          'ঢাকা ছিল ২ নং সেক্টরের অধীনে (সেক্টর কমান্ডার: মেজর খালেদ মোশাররফ)।'
        ]
      },
      {
        id: 'gk-bangladesh',
        paper: 'বাংলাদেশ বিষয়াবলী',
        name: 'টপিক ২: সংবিধান, জাতীয় অর্জন ও মেগা প্রজেক্ট',
        highYieldTopics: ['সংবিধানের মৌলিক বৈশিষ্ট্য ও অনুচ্ছেদ', 'পদ্মা সেতু, মেট্রোরেল, রূপপুর ও কর্ণফুলী টানেল', 'বিশ্ব ঐতিহ্য ও ইউনেস্কো স্বীকৃতি'],
        repeatedQuestionsCount: 35,
        keyFacts: [
          'বাংলাদেশের সংবিধান কার্যকর হয় ১৬ ডিসেম্বর ১৯৭২। এতে ১৫৩টি অনুচ্ছেদ ও ১১টি ভাগ রয়েছে।',
          'পদ্মা সেতুর দৈর্ঘ্য ৬.১৫ কিমি (৪১টি স্প্যান ও ৪২টি পিলার)।',
          'বঙ্গবন্ধু টানেল হলো দক্ষিণ এশিয়ার প্রথম নদী তলদেশের সড়ক টানেল।'
        ]
      }
    ]
  }
];

export const MEDICAL_MARKS_DISTRIBUTION = MEDICAL_SUBJECTS_DETAILED.map(s => ({
  id: s.id,
  name: s.name,
  botanyZoology: s.subTitle,
  marks: s.marks,
  color: s.color,
  badgeBg: s.badgeBg,
  icon: s.icon,
  topics: s.chapters.flatMap(c => c.highYieldTopics.slice(0, 2)),
  recommendedBooks: s.recommendedBooks,
  chaptersCount: s.chapters.length
}));

export const MBBS_YEARS = [
  { session: '2023-2024', totalQuestions: 100, examDate: '০৯ ফেব্রুয়ারি ২০২৪', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2022-2023', totalQuestions: 100, examDate: '১০ মার্চ ২০২৩', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2021-2022', totalQuestions: 100, examDate: '০১ এপ্রিল ২০২২', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2020-2021', totalQuestions: 100, examDate: '০২ এপ্রিল ২০২১', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2019-2020', totalQuestions: 100, examDate: '১১ অক্টোবর ২০১৯', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2018-2019', totalQuestions: 100, examDate: '০৫ অক্টোবর ২০১৮', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2017-2018', totalQuestions: 100, examDate: '০৬ অক্টোবর ২০১৭', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2016-2017', totalQuestions: 100, examDate: '০৭ অক্টোবর ২০১৬', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
];

export const BDS_YEARS = [
  { session: '2023-2024', totalQuestions: 100, examDate: '০৮ মার্চ ২০২৪', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2022-2023', totalQuestions: 100, examDate: '২১ এপ্রিল ২০২৩', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2021-2022', totalQuestions: 100, examDate: '২২ এপ্রিল ২০২২', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2020-2021', totalQuestions: 100, examDate: '১০ সেপ্টেম্বর ২০২১', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
  { session: '2019-2020', totalQuestions: 100, examDate: '০১ নভেম্বর ২০১৯', status: 'সম্পূর্ণ প্রশ্নব্যাংক' },
];

export const MEDICAL_MNEMONICS = [
  {
    id: 'm1',
    subject: 'Biology (Zoology)',
    topic: '১২ জোড়া করোটিক স্নায়ু (Cranial Nerves)',
    technique: 'ছন্দ: "ওগো ওগো ওগো তোমরা তারে আনলে ফিরে আবার যাবে কোথায়"',
    explanation: [
      '১. ওগো - Olfactory (অলফ্যাক্টরি - সংবেদী)',
      '২. ওগো - Optic (অপটিক - সংবেদী)',
      '৩. ওগো - Oculomotor (অকুলোমোটর - চেষ্টীয়)',
      '৪. তোমরা - Trochlear (ট্রকলিয়ার - চেষ্টীয়)',
      '৫. তারে - Trigeminal (ট্রাইজেমিনাল - মিশ্র)',
      '৬. আনলে - Abducens (অ্যাবডুসেন্স - চেষ্টীয়)',
      '৭. ফিরে - Facial (ফ্যাসিয়াল - মিশ্র)',
      '৮. আবার - Auditory / Vestibulocochlear (অডিটরি - সংবেদী)',
      '৯. যাবে - Glossopharyngeal (গ্লসোফ্যারিঞ্জিয়াল - মিশ্র)',
      '১০. কোথায় - Vagus (ভেগাস - মিশ্র)',
      '১১. স্পাইনাল অ্যাক্সেসরি (Spinal Accessory - চেষ্টীয়)',
      '১২. হাইপোগ্লোসাল (Hypoglossal - চেষ্টীয়)'
    ],
    reference: 'গাজী আজমল স্যার (স্নায়ুতন্ত্র অধ্যায়)'
  },
  {
    id: 'm2',
    subject: 'Biology (Botany)',
    topic: 'অপরিহার্য অ্যামিনো অ্যাসিড (Essential Amino Acids)',
    technique: 'ছন্দ: "PVT TIM HALL" (প্রাইভেট টিম হল)',
    explanation: [
      'P = Phenylalanine (ফিনাইলঅ্যালানিন)',
      'V = Valine (ভ্যালিন)',
      'T = Tryptophan (ট্রিপটোফ্যান)',
      'T = Threonine (থ্রিওনিন)',
      'I = Isoleucine (আইসোলিউসিন)',
      'M = Methionine (মিথিওনিন)',
      'H = Histidine (হিস্টিডিন - শিশুদের জন্য)',
      'A = Arginine (আরজিনিন - শিশুদের জন্য)',
      'L = Leucine (লিউসিন)',
      'L = Lysine (লাইসিন)'
    ],
    reference: 'আবুল হাসান স্যার (কোষ রসায়ন অধ্যায়)'
  },
  {
    id: 'm3',
    subject: 'Chemistry',
    topic: 'শিখা পরীক্ষায় ধাতুর বর্ণ (Flame Test Colors)',
    technique: 'ছন্দ: "কাশির সুর লালে লাল, সোনা হলুদ, কপার নীল-সবুজ আলো জ্বাল"',
    explanation: [
      'Ca (ক্যালসিয়াম) = ইটের মতো লাল (Brick Red)',
      'Sr (স্ট্রনসিয়াম) = টকটকে লাল / ক্রিমসন রেড',
      'Na (সোডিয়াম) = উজ্জ্বল সোনালী হলুদ (Golden Yellow)',
      'K (পটাশিয়াম) = হালকা বেগুনি (Lilac / Violet)',
      'Cu (কপার) = নীলাভ সবুজ (Bluish Green)',
      'Ba (বেরিয়াম) = কাঁচা আপেলের মতো সবুজ (Apple Green)'
    ],
    reference: 'হাজারী ও নাগ স্যার (গুণগত রসায়ন)'
  },
  {
    id: 'm4',
    subject: 'Biology (Zoology)',
    topic: 'শ্বেত রক্তকণিকার শতকরা হার',
    technique: 'ছন্দ: "Never Let Monkeys Eat Bananas" (বেশি থেকে কম অনুপাত)',
    explanation: [
      'N = Neutrophil (নিউট্রোফিল - ৬০-৭০%)',
      'L = Lymphocyte (লিম্ফোসাইট - ২০-২৫%)',
      'M = Monocyte (মনোসাইট - ২-৮%)',
      'E = Eosinophil (ইওসিনোফিল - ১-৪%)',
      'B = Basophil (বেসোফিল - ০.৫-১%)'
    ],
    reference: 'গাজী আজমল স্যার (রক্ত ও সংবহন)'
  }
];

export const SAMPLE_MEDICAL_QUESTIONS = [];
