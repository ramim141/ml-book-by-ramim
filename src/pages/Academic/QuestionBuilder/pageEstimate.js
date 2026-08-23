/**
 * প্রিন্টে কত পৃষ্ঠা লাগবে তার একটা আনুমানিক হিসাব — CSS-এর প্রকৃত পেজিনেশন
 * (break-inside: avoid, column reflow) সিমুলেট করা এখানে হচ্ছে না, শুধু
 * মোট কনটেন্টের উচ্চতা ভাগ করা হচ্ছে পাতার কার্যকর উচ্চতা দিয়ে। তাই এটা
 * "কাছাকাছি" — আসল প্রিন্টে সেকশনের কিনারায় সামান্য বেশি পাতা লাগতে পারে।
 */

// CSS স্পেক অনুযায়ী ধ্রুবক (1in = 96px = 25.4mm) — PrintableView.jsx-এর
// @page/width সরাসরি mm এককে লেখা থাকে, ব্রাউজার এই একই হিসাবে রেন্ডার করে
export const MM_TO_PX = 96 / 25.4;

/**
 * @param {{ contentHeightPx: number, page: { contentHeight: number } }} args
 * @returns {number} আনুমানিক পৃষ্ঠাসংখ্যা (কমপক্ষে ১)
 */
export function estimatePageCount({ contentHeightPx, page }) {
  if (!contentHeightPx || !page?.contentHeight) return 1;
  const pageContentHeightPx = page.contentHeight * MM_TO_PX;
  if (pageContentHeightPx <= 0) return 1;
  return Math.max(1, Math.ceil(contentHeightPx / pageContentHeightPx));
}
