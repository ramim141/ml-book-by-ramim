const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * ইংরেজি সংখ্যাকে বাংলা সংখ্যায় বদলায়।
 *
 * প্রজেক্টের অনেক ফাইলে এই একই ফাংশন আলাদা আলাদা করে লেখা ছিল
 * (`enToBnNumber`)। নতুন কোডে এটাই ব্যবহার করা উচিত।
 */
export const toBn = (value) => {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[d]);
};

export default toBn;
