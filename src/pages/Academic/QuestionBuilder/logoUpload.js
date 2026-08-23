import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../config/firebase';

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // ২MB

/**
 * প্রশ্নপত্রের হেডারে বসানোর জন্য প্রতিষ্ঠানের লোগো আপলোড।
 * টাইমস্ট্যাম্প-যুক্ত পাথ, কারণ প্রোফাইল ছবির মতো একটাই স্থায়ী পাথ হলে
 * ভিন্ন ভিন্ন কাগজের জন্য ভিন্ন লোগো রাখা যেত না।
 */
export async function uploadPaperLogo(uid, file) {
  if (!uid) throw new Error('লগইন প্রয়োজন');
  if (!file.type?.startsWith('image/')) throw new Error('শুধু ছবি ফাইল আপলোড করা যাবে।');
  if (file.size > MAX_LOGO_BYTES) throw new Error('ছবিটি ২MB এর বেশি — ছোট ছবি ব্যবহার করুন।');

  const path = `question_paper_logos/${uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

/** লোগো বদলানো/মুছে ফেলার সময় পুরনোটা স্টোরেজ থেকে সরিয়ে ফেলা — না হলে অব্যবহৃত ফাইল জমে থাকত। */
export async function deletePaperLogo(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    // আগে থেকে মোছা বা অস্তিত্বহীন ফাইল হলে চুপচাপ উপেক্ষা — এটা কোনো ব্লকিং এরর নয়
    console.error(err);
  }
}
