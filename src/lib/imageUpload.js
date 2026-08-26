/**
 * ছবি আপলোড — ImgBB দিয়ে।
 *
 * এই প্রজেক্টে Firebase Storage কখনো প্রভিশন করা হয়নি (`firebase deploy` করলে
 * "Firebase Storage has not been set up" বলে আটকে যেত), তাই প্রোফাইল ছবি
 * আপলোড শুরু থেকেই ব্যর্থ হতো। প্রশ্নের ছবি আগে থেকেই ImgBB-তে যায়
 * (Admin/QuestionBankManager), তাই একই পথ এখানে এনে দুই জায়গায় এক নিয়ম।
 *
 * ⚠️ ImgBB-র লিংক পাবলিক — যা সবাই দেখতে পারে কেবল সেটাই এখানে পাঠাবেন।
 * প্রোফাইল ছবি লিডারবোর্ড/আলোচনায় এমনিতেই সবাইকে দেখানো হয়, তাই সমস্যা নেই।
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // ৫MB

/**
 * ফাইলটি আপলোডযোগ্য কি না। সমস্যা থাকলে বাংলা বার্তা ফেরত দেয়, না থাকলে null।
 */
export function validateImageFile(file) {
  if (!file) return 'কোনো ফাইল নির্বাচন করা হয়নি।';
  if (!file.type?.startsWith('image/')) return 'শুধু ছবি ফাইল আপলোড করা যাবে।';
  if (file.size > MAX_IMAGE_BYTES) return 'ছবিটি ৫MB এর বেশি — ছোট ছবি ব্যবহার করুন।';
  return null;
}

/**
 * ছবি আপলোড করে পাবলিক URL ফেরত দেয়। ব্যর্থ হলে বাংলা বার্তাসহ throw করে,
 * যাতে কলার শুধু `toast.error(err.message)` করলেই চলে।
 *
 * @param {File} file
 * @returns {Promise<string>} ছবির URL
 */
export async function uploadImage(file) {
  const invalid = validateImageFile(file);
  if (invalid) throw new Error(invalid);

  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('ImgBB API কী কনফিগার করা নেই (.env এ VITE_IMGBB_API_KEY সেট করুন)।');
  }

  const formData = new FormData();
  formData.append('image', file);

  let data;
  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    data = await res.json();
  } catch (err) {
    console.error('ImgBB upload failed:', err);
    throw new Error('ছবি আপলোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।', { cause: err });
  }

  // `url` ই সরাসরি ছবির লিংক — Admin/QuestionBankManager আগে থেকেই এটাই ব্যবহার করে
  const url = data?.success ? (data.data?.url || data.data?.display_url) : null;
  if (!url) {
    throw new Error('ছবি আপলোড ব্যর্থ: ' + (data?.error?.message || 'অজানা সমস্যা'));
  }
  return url;
}
