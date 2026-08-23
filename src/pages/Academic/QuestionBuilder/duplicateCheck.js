/**
 * "এই প্রশ্নটা কি আগে অন্য কোনো কাগজে ব্যবহার করা হয়েছে?" — সংরক্ষিত কাগজের
 * তালিকা থেকে একবারই একটা লুকআপ তৈরি করে রাখি, যাতে প্রতিটি প্রশ্ন-কার্ডে
 * আলাদা করে হিসাব করতে না হয়।
 */

/**
 * @param {Array<{id:string, name:string, cart?:Array<{uniqueId?:string,id?:string}>}>} papers
 * @returns {Map<string, {paperId:string, paperName:string}[]>}
 */
export function buildUsageIndex(papers = []) {
  const index = new Map();

  papers.forEach((paper) => {
    if (paper.isTemplate) return; // টেমপ্লেটে কোনো প্রশ্ন থাকে না
    (paper.cart || []).forEach((q) => {
      const uid = q.uniqueId || q.id;
      if (!uid) return;
      const entry = { paperId: paper.id, paperName: paper.name || 'নামহীন প্রশ্নপত্র' };
      if (index.has(uid)) {
        index.get(uid).push(entry);
      } else {
        index.set(uid, [entry]);
      }
    });
  });

  return index;
}
