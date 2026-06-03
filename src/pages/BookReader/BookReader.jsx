import { useParams, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAllWords } from '../../data/wordsIndex';
import { useProgress } from '../../context/ProgressContext';
import { CheckCircle2, Circle } from 'lucide-react';

export default function BookReader() {
  const { wordPath } = useParams();
  const { isCompleted, toggleComplete } = useProgress();

  // ইউআরএল থেকে নির্দিষ্ট শব্দটি খোঁজা
  const allWords = getAllWords();
  const currentWord = allWords.find(w => w.path === wordPath);

  // যদি ইউআরএল ভুল হয় বা শব্দ না থাকে, হোমে পাঠিয়ে দেবে
  if (!currentWord) {
    return <Navigate to="/" replace />;
  }

  // wordsIndex থেকে সরাসরি কম্পোনেন্টটি নিয়ে নিচ্ছি
  const WordComponent = currentWord.Component;

  return (
    <div data-reader-scroll className="flex-1 min-h-full bg-[#0b0f19] scroll-smooth overscroll-contain">
      
      {/* এসইও এবং মেটা ট্যাগ ম্যানেজার */}
      <Helmet>
        <title>{`${currentWord.title} | শব্দে শব্দে মেশিন লার্নিং`}</title>
        <meta name="description" content={currentWord.summary} />
        <link rel="canonical" href={`https://yourdomain.com/word/${currentWord.path}`} />
        <meta property="og:title" content={`${currentWord.title} - শব্দে শব্দে মেশিন লার্নিং`} />
        <meta property="og:description" content={currentWord.summary} />
      </Helmet>

      {/* সরাসরি কম্পোনেন্ট রেন্ডার করা হলো (কোনো লোডিং টাইম ছাড়াই) */}
      <Suspense fallback={null}>
        <WordComponent />
      </Suspense>

      {/* Mark as Complete Button */}
      <div className="max-w-[750px] mx-auto px-5 pb-20 pt-10">
        <div className="flex justify-center border-t border-white/[0.05] pt-10">
          <button
            onClick={() => toggleComplete(wordPath)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 transform active:scale-95 ${
              isCompleted(wordPath)
                ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/20'
                : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isCompleted(wordPath) ? (
              <>
                <CheckCircle2 size={20} className="text-[#10b981]" />
                <span>পড়া সম্পন্ন হয়েছে</span>
              </>
            ) : (
              <>
                <Circle size={20} className="text-slate-400" />
                <span>পড়া শেষ হিসেবে মার্ক করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
