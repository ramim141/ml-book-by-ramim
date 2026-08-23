/**
 * প্রিন্ট কপির পেজ সেটআপ কনফিগারেশন।
 */

/** মিলিমিটারে — প্রস্থ × উচ্চতা (পোর্ট্রেট) */
export const PAGE_SIZES = {
  A4: { label: 'A4 (210×297 mm)', width: 210, height: 297 },
  Letter: { label: 'Letter (216×279 mm)', width: 216, height: 279 },
  Legal: { label: 'Legal (216×356 mm)', width: 216, height: 356 },
  A5: { label: 'A5 (148×210 mm)', width: 148, height: 210 },
};

export const MARGIN_PRESETS = {
  compact: { label: 'কমপ্যাক্ট (ঘন)', top: 8, right: 8, bottom: 8, left: 8 },
  normal: { label: 'স্বাভাবিক', top: 12, right: 10, bottom: 12, left: 10 },
  wide: { label: 'প্রশস্ত', top: 18, right: 16, bottom: 18, left: 16 },
};

export const FONT_OPTIONS = [
  { id: 'kalpurush', label: 'কালপুরুষ (Kalpurush)', stack: "'Kalpurush', 'SolaimanLipi', sans-serif" },
  { id: 'solaiman', label: 'সোলাইমান লিপি (SolaimanLipi)', stack: "'SolaimanLipi', 'Kalpurush', sans-serif" },
  { id: 'notoserif', label: 'নোটো সেরিফ (Noto Serif)', stack: "'Noto Serif Bengali', 'Kalpurush', serif" },
  { id: 'notosans', label: 'নোটো সান্স (Noto Sans)', stack: "'Noto Sans Bengali', 'Kalpurush', sans-serif" },
];

export const OPTION_LABELS = {
  bn: ['ক', 'খ', 'গ', 'ঘ'],
  en: ['A', 'B', 'C', 'D'],
  roman: ['i', 'ii', 'iii', 'iv'],
};

/** MCQ অপশনের লেবেল (ক/A/i...) + বুলেট স্টাইল (বৃত্ত/ব্র্যাকেট/ডট) একসাথে ফরম্যাট করা */
export function optionLabelFor(settings, idx) {
  const labelList = OPTION_LABELS[settings.mcqOptionLabelType] || OPTION_LABELS.bn;
  const raw = labelList[idx] || `${idx + 1}`;
  if (settings.mcqOptionBulletStyle === 'bracket') return `(${raw})`;
  if (settings.mcqOptionBulletStyle === 'dot') return `${raw}.`;
  return raw;
}

export const SECTION_META = {
  cq: { id: 'cq', label: 'সৃজনশীল প্রশ্ন' },
  kkh: { id: 'kkh', label: 'জ্ঞান ও অনুধাবনমূলক প্রশ্ন' },
  mcq: { id: 'mcq', label: 'বহুনির্বাচনী প্রশ্ন' },
};

export const INSTRUCTION_PRESETS = [
  'ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক।',
  'সকল প্রশ্নের উত্তর আবশ্যক। প্রতিটি প্রশ্নের মান সমান।',
  'যেকোনো ৫টি প্রশ্নের উত্তর দাও।',
  'ক্যালকুলেটর ব্যবহার নিষিদ্ধ। ওএমআর শিট পূরণ কর।',
];

export const DEFAULT_PRINT_SETTINGS = {
  // কাগজ
  pageSize: 'A4',
  orientation: 'portrait', // portrait | landscape
  marginPreset: 'normal',
  margin: { ...MARGIN_PRESETS.normal },

  // লেখা
  fontId: 'kalpurush',
  fontSize: 13.5,
  lineHeight: 1.4,
  spacingPreset: 'normal', // compact | normal | relaxed

  // হেডার ও শিক্ষার্থী তথ্য
  headerBorderStyle: 'double', // double | single | boxed | none
  showStudentInfo: false, // নাম, রোল, শাখা, তারিখ বক্স
  studentInfoStyle: 'line', // line | box

  // কলাম বিন্যাস
  mcqColumns: 2,
  cqColumns: 1,
  kkhColumns: 1,

  // MCQ অপশন সেটিংস
  mcqOptionLayout: 'auto', // auto | 4col | 2col | 1col
  mcqOptionLabelType: 'bn', // bn (ক,খ) | en (A,B) | roman (i,ii)
  mcqOptionBulletStyle: 'circle', // circle (ⓐ) | bracket ((ক)) | dot (ক.)

  // সেকশন ক্রম ও দৃশ্যমানতা
  sectionOrder: ['cq', 'kkh', 'mcq'],
  hiddenSections: [],

  // বিশেষ চিহ্ন, বোর্ড, টাইপ ও উত্তর
  showMarks: true,
  showBoardNames: false, // প্রশ্নের পাশে বোর্ডের নাম ও সাল
  showQuestionType: false, // প্রশ্নের ধরন বা টপিক
  showAnswersInline: false, // প্রশ্নপত্রে সরাসরি উত্তর/সমাধান দেখান (মাস্টার কপি)
  showExplanation: true, // উত্তরের সাথে ব্যাখ্যা থাকলে তা দেখান

  showSectionNote: true,
  showPageNumber: true,
  showAnswerLines: 0,
  omrColumns: 2,

  // নির্দেশনা ও সমাপনী বার্তা
  instructions: '',
  showFooter: true,
  footerText: '— সমাপ্ত —',

  // জলছাপ / Watermark
  showWatermark: false,
  watermarkText: '',
  watermarkOpacity: 12, // 5% to 30%
};

/** কাগজের কার্যকর মাপ — orientation ধরে */
export function resolvePage(settings) {
  const size = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.A4;
  const landscape = settings.orientation === 'landscape';
  const width = landscape ? size.height : size.width;
  const height = landscape ? size.width : size.height;
  const m = settings.margin || MARGIN_PRESETS.normal;
  return {
    width,
    height,
    margin: m,
    contentWidth: Math.max(50, width - m.left - m.right),
    contentHeight: Math.max(50, height - m.top - m.bottom),
  };
}

export const fontStackOf = (fontId) =>
  (FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[0]).stack;
