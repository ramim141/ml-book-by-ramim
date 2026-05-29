import { useParams, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAllWords } from '../../data/wordsIndex';

export default function BookReader() {
  const { wordPath } = useParams();

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

    </div>
  );
}
