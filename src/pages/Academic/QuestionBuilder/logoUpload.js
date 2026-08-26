import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../../config/firebase';

const MAX_LOGO_BYTES = 5 * 1024 * 1024; // ৫MB

/**
 * ক্লায়েন্ট-সাইডে ছবিকে অপ্টিমাইজড Base64 Data URL-এ রূপান্তর করে।
 * এতে কোনো নেটওয়ার্ক সমস্যা বা লগইন বাধ্যবাধকতা ছাড়াই যেকোনো ব্রাউজারে
 * লোগো তাৎক্ষণিকভাবে রেন্ডার ও প্রিন্ট হয়।
 */
export function readImageAsDataUrl(file, maxWidth = 300, maxHeight = 300) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      return reject(new Error('অনুগ্রহ করে শুধু ছবি (PNG, JPG, SVG, WebP) নির্বাচন করুন।'));
    }
    if (file.size > MAX_LOGO_BYTES) {
      return reject(new Error('ছবিটি ৫MB এর বেশি — অনুগ্রহ করে ছোট ফাইল ব্যবহার করুন।'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // SVG বা ছোট ছবির জন্য সরাসরি Data URL
      if (file.type === 'image/svg+xml' || file.size < 50 * 1024) {
        return resolve(e.target.result);
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // PNG স্বচ্ছতা বজায় রেখে DataURL আউটপুট
          const dataUrl = canvas.toDataURL('image/png', 0.92);
          resolve(dataUrl);
        } catch (canvasErr) {
          // ক্যানভাসে সমস্যা হলে মূল রেজাল্টই ফেরত দেই
          resolve(e.target.result);
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
    reader.readAsDataURL(file);
  });
}

/**
 * প্রশ্নপত্রের হেডারে বসানোর জন্য প্রতিষ্ঠানের লোগো ক্লাউডে আপলোড (ঐচ্ছিক ব্যাকআপ)।
 */
export async function uploadPaperLogo(uid, file) {
  if (!uid) throw new Error('লগইন প্রয়োজন');
  if (!file.type?.startsWith('image/')) throw new Error('শুধু ছবি ফাইল আপলোড করা যাবে।');
  if (file.size > MAX_LOGO_BYTES) throw new Error('ছবিটি ৫MB এর বেশি — ছোট ছবি ব্যবহার করুন।');

  const path = `question_paper_logos/${uid}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

/**
 * লোগো বদলানো/মুছে ফেলার সময় পুরনোটা স্টোরেজ থেকে সরিয়ে ফেলা।
 * আসল নিরাপত্তা storage.rules-এ, কিন্তু ভুল করে অন্য ব্যবহারকারীর পাথ চলে
 * এলে (কোনো ভবিষ্যৎ বাগে) যাতে ডিলিট কল-ই না হয়, তাই uid প্রিফিক্স যাচাই।
 */
export async function deletePaperLogo(path, uid) {
  if (!path) return;
  if (uid && !path.startsWith(`question_paper_logos/${uid}/`)) {
    console.error('Logo delete blocked: path does not belong to this user', path);
    return;
  }
  try {
    await deleteObject(ref(storage, path));
  } catch (err) {
    console.error('Logo delete ignored:', err);
  }
}
