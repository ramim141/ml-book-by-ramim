const MAX_LOGO_BYTES = 5 * 1024 * 1024; // ৫MB

/**
 * ক্লায়েন্ট-সাইডে ছবিকে অপ্টিমাইজড Base64 Data URL-এ রূপান্তর করে।
 *
 * এটাই লোগোর একমাত্র পথ। আগে এর পাশাপাশি Firebase Storage-এ একটা "ক্লাউড
 * ব্যাকআপ"ও রাখা হতো, কিন্তু এই প্রজেক্টে Storage কখনো প্রভিশনই করা হয়নি —
 * অর্থাৎ ওই কলটা সবসময় ব্যর্থ হয়ে console warning ছাড়া কিছুই করত না।
 * লোগো ImgBB-তে পাঠানো হয়নি ইচ্ছে করেই: প্রশ্নপত্র ব্যক্তিগত, আর ImgBB-র
 * লিংক পাবলিক হয়। DataURL-এ প্রিন্ট ও সেভ — দুটোই নির্ভরযোগ্যভাবে চলে।
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
