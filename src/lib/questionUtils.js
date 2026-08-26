/**
 * প্রশ্ন সংক্রান্ত সাধারণ হেল্পার — React/Firebase নিরপেক্ষ।
 *
 * দুটো সমস্যা বারবার ফিরে আসছিল বলে এক জায়গায় আনা হলো:
 *
 * ১) `options` কখনো অ্যারে, কখনো `{a: ..., b: ...}` অবজেক্ট হয়ে আসে
 *    (অ্যাডমিন JSON ইমপোর্ট বা পুরনো ডকুমেন্ট)। সরাসরি `.map()` করলে
 *    "options.map is not a function" এ পুরো পেজ সাদা হয়ে যেত।
 *
 * ২) `[...list].sort(() => 0.5 - Math.random())` আসলে সুষম শাফল নয়
 *    (কম্পারেটর অসামঞ্জস্যপূর্ণ), আর প্রতি রেন্ডারে নতুন ফল দেয়।
 *    ইনডেক্স ধরে উত্তর সংরক্ষণ হয় এমন জায়গায় (লাইভ এক্সাম) এটি
 *    সংরক্ষিত উত্তরকে ভুল প্রশ্নের সাথে মিলিয়ে দিত।
 */

/** options যে রূপেই আসুক, সবসময় একটি অ্যারে ফেরত দেয়। */
export function optionsOf(source) {
  const options = source && typeof source === 'object' && 'options' in source
    ? source.options
    : source;
  if (Array.isArray(options)) return options;
  if (options && typeof options === 'object') return Object.values(options);
  return [];
}

/** স্ট্রিং থেকে ৩২-বিট সিড — একই ইনপুটে সবসময় একই সংখ্যা। */
export function seedFromString(str) {
  let hash = 2166136261;
  const text = String(str ?? '');
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — ছোট, দ্রুত, সিড দেওয়া যায় এমন র‍্যান্ডম জেনারেটর। */
export function createRandom(seed) {
  let state = (typeof seed === 'number' ? seed : seedFromString(seed)) >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher–Yates শাফল — মূল অ্যারে বদলায় না।
 * `seed` দিলে ফল নির্ণেয় (একই সিডে একই ক্রম), না দিলে সাধারণ র‍্যান্ডম।
 */
export function shuffle(list, seed) {
  const bag = Array.isArray(list) ? [...list] : [];
  const random = seed === undefined ? Math.random : createRandom(seed);
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}
