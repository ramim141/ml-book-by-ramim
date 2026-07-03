import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, ArrowRight, RotateCcw, AlertTriangle, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment, collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase'; // Added db import

const enToBnNumber = (numStr) => {
  if (!numStr) return numStr;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const MarkdownRenderer = ({ content }) => (
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed">
    <ReactMarkdown 
      remarkPlugins={[remarkMath, remarkGfm]} 
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  </span>
);

export default function ModelTestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { questions, answers, totalTime, timeTaken, subjectTitle } = location.state || {};
  const [reportingQ, setReportingQ] = useState(null);
  const [reportType, setReportType] = useState('wrong_answer');
  const [reportMsg, setReportMsg] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportedSet, setReportedSet] = useState(new Set());

  if (!questions) {
    return <Navigate to="/academic/model-test" replace />;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${enToBnNumber(m)} মিনিট ${enToBnNumber(s)} সেকেন্ড`;
  };

  // Calculate score
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  questions.forEach((q, idx) => {
    if (answers[idx] === undefined) {
      skippedCount++;
    } else if (answers[idx] === q.correctAnswer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);

  // Save result to Firestore
  useEffect(() => {
    if (!currentUser || !questions) return;
    const saveResult = async () => {
      const result = {
        id: Date.now(),
        subjectTitle: subjectTitle || 'মডেল টেস্ট',
        date: new Date().toISOString(),
        totalQuestions: questions.length,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        percentage,
        timeTaken: timeTaken || 0,
      };

      // Detect subject key for progress tracking
      const title = (subjectTitle || '').toLowerCase();
      let subjectKey = 'other';
      if (title.includes('পদার্থ') || title.includes('physics')) subjectKey = 'physics';
      else if (title.includes('রসায়') || title.includes('chemistry')) subjectKey = 'chemistry';
      else if (title.includes('জীব') || title.includes('biology')) subjectKey = 'biology';
      else if (title.includes('গণিত') || title.includes('math')) subjectKey = 'math';
      else if (title.includes('তথ্য') || title.includes('ict')) subjectKey = 'ict';

      // Fetch dynamic gamification settings
      let baseXp = 10;
      let xpPerCorrect = 2;
      try {
        const settingsSnap = await getDoc(doc(db, 'admin_settings', 'gamification'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.baseXp !== undefined) baseXp = Number(data.baseXp);
          if (data.xpPerCorrect !== undefined) xpPerCorrect = Number(data.xpPerCorrect);
        }
      } catch (err) {
        console.error("Failed to fetch gamification settings", err);
      }

      // XP earned dynamically
      const xpEarned = baseXp + (correctCount * xpPerCorrect);

      // Calculate Chapter Stats for Weakness Analyzer
      const chapterUpdates = {};
      questions.forEach((q, idx) => {
        const chapter = q.chapterName || 'অন্যান্য';
        if (!chapterUpdates[chapter]) {
          chapterUpdates[chapter] = { attempted: 0, correct: 0, wrong: 0 };
        }
        
        if (answers[idx] !== undefined) {
          chapterUpdates[chapter].attempted += 1;
          if (answers[idx] === q.correctAnswer) {
            chapterUpdates[chapter].correct += 1;
          } else {
            chapterUpdates[chapter].wrong += 1;
          }
        }
      });

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const existingData = snap.data();
          const existingChapterStats = existingData.chapterStats || {};
          
          const mergedChapterStats = { ...existingChapterStats };
          Object.keys(chapterUpdates).forEach(chapter => {
            if (!mergedChapterStats[chapter]) {
              mergedChapterStats[chapter] = { attempted: 0, correct: 0, wrong: 0 };
            }
            mergedChapterStats[chapter].attempted += chapterUpdates[chapter].attempted;
            mergedChapterStats[chapter].correct += chapterUpdates[chapter].correct;
            mergedChapterStats[chapter].wrong += chapterUpdates[chapter].wrong;
          });

          await updateDoc(docRef, {
            examHistory: arrayUnion(result),
            xp: increment(xpEarned),
            [`questionsBySubject.${subjectKey}`]: increment(correctCount),
            chapterStats: mergedChapterStats
          });
        } else {
          await setDoc(docRef, {
            examHistory: [result],
            xp: xpEarned,
            questionsBySubject: { [subjectKey]: correctCount },
            chapterStats: chapterUpdates
          }, { merge: true });
        }
      } catch (err) {
        console.error('Failed to save exam result', err);
      }
    };
    saveResult();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReportSubmit = async (q, qIdx) => {
    if (!currentUser) return alert('লগইন প্রয়োজন!');
    setReportLoading(true);
    try {
      await addDoc(collection(db, 'feedback_reports'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Unknown',
        questionText: q.question,
        subject: subjectTitle,
        chapter: q.chapterName || '',
        reportType,
        message: reportMsg,
        status: 'pending',
        date: new Date().toISOString()
      });
      setReportedSet(new Set([...reportedSet, qIdx]));
      setReportingQ(null);
      setReportMsg('');
    } catch (err) {
      console.error(err);
      alert('রিপোর্ট সাবমিট করতে সমস্যা হয়েছে।');
    }
    setReportLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] pt-16 sm:pt-24 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 font-bangla selection:bg-fuchsia-500/30">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Score Card */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
            {/* Circular Progress */}
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="stroke-slate-700" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="45" 
                  className={`${percentage >= 80 ? 'stroke-emerald-500' : percentage >= 50 ? 'stroke-amber-500' : 'stroke-rose-500'}`}
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={`${(percentage / 100) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">{enToBnNumber(percentage)}%</span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 sm:mt-1">সঠিক</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 w-full">
              <h2 className="text-xl sm:text-3xl font-black text-white mb-1.5 sm:mb-2 text-center md:text-left">পরীক্ষার ফলাফল</h2>
              <p className="text-sm sm:text-base text-slate-400 font-medium mb-5 sm:mb-6 text-center md:text-left">{subjectTitle}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-700/50 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white">{enToBnNumber(questions.length)}</div>
                  <div className="text-[10px] sm:text-xs font-medium text-slate-400 mt-1">মোট প্রশ্ন</div>
                </div>
                <div className="bg-emerald-500/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-500/20 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-emerald-400">{enToBnNumber(correctCount)}</div>
                  <div className="text-[10px] sm:text-xs font-medium text-emerald-500 mt-1">সঠিক উত্তর</div>
                </div>
                <div className="bg-rose-500/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-rose-500/20 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-rose-400">{enToBnNumber(wrongCount)}</div>
                  <div className="text-[10px] sm:text-xs font-medium text-rose-500 mt-1">ভুল উত্তর</div>
                </div>
                <div className="bg-slate-900/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-700/50 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-slate-300">{enToBnNumber(skippedCount)}</div>
                  <div className="text-[10px] sm:text-xs font-medium text-slate-400 mt-1">বাদ দেওয়া</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-sm sm:text-base text-slate-400 font-medium bg-slate-900/50 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400" />
              সময় লেগেছে: {formatTime(timeTaken)}
            </div>
            <div className="flex-1 w-full sm:w-auto"></div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate('/academic/model-test')}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white transition-colors w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4" /> পুনরায় পরীক্ষা দিন
              </button>
              <button
                onClick={() => navigate('/academic')}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors w-full sm:w-auto"
              >
                হোমে ফিরে যান <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Answer Review Section */}
        <div className="pt-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-fuchsia-400" /> উত্তরপত্র বিশ্লেষণ
          </h3>
          
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              const isSkipped = userAnswer === undefined;
              
              let statusBorder = isSkipped ? 'border-slate-700' : (isCorrect ? 'border-emerald-500/50' : 'border-rose-500/50');
              let statusBg = isSkipped ? 'bg-slate-800/40' : (isCorrect ? 'bg-emerald-500/5' : 'bg-rose-500/5');

              return (
                <div key={idx} className={`p-5 sm:p-6 rounded-2xl border ${statusBorder} ${statusBg} transition-all`}>
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center justify-between w-full sm:w-auto">
                      <div className="font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm bg-slate-900 text-slate-300">
                        {enToBnNumber(idx + 1)}
                      </div>
                      <div className="sm:hidden">
                        {isCorrect && !isSkipped && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                        {!isCorrect && !isSkipped && <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                      </div>
                    </div>
                    <div className="flex-1 mt-1 sm:mt-0 w-full">
                      <div className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed mb-1">
                        <MarkdownRenderer content={q.question} />
                        {q.imageUrl && (
                          <div className="mt-3 mb-2 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 flex justify-center max-h-[300px]">
                            <img src={q.imageUrl} alt="Question figure" className="max-w-full h-auto object-contain" />
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-500">{q.chapterName}</div>
                    </div>
                    <div className="hidden sm:block">
                      {isCorrect && !isSkipped && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                      {!isCorrect && !isSkipped && <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                    </div>
                  </div>

                  <div className="space-y-2 sm:ml-12 mt-4 sm:mt-0">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctAnswer;
                      const isOptionSelected = optIdx === userAnswer;
                      
                      let optClass = "border-slate-700/50 bg-slate-900/30 text-slate-400";
                      
                      if (isOptionCorrect) {
                        optClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold";
                      } else if (isOptionSelected && !isOptionCorrect) {
                        optClass = "border-rose-500/50 bg-rose-500/10 text-rose-400";
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border text-sm sm:text-base flex items-center gap-3 ${optClass}`}>
                          <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-current">
                            {isOptionSelected && !isOptionCorrect && <XCircle className="w-3 h-3" />}
                            {isOptionCorrect && <CheckCircle2 className="w-3 h-3" />}
                          </div>
                          <MarkdownRenderer content={opt} />
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="sm:ml-12 mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                      <div className="text-indigo-400 text-xs font-bold mb-1 uppercase tracking-wider">ব্যাখ্যা</div>
                      <div className="text-indigo-200 text-sm">
                        <MarkdownRenderer content={q.explanation} />
                      </div>
                    </div>
                  )}

                  <div className="sm:ml-12 mt-4 flex justify-end">
                    {reportedSet.has(idx) ? (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> রিপোর্ট সাবমিট হয়েছে</span>
                    ) : (
                      reportingQ === idx ? (
                        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl w-full max-w-sm">
                          <h4 className="text-slate-200 font-bold text-sm mb-3">সমস্যাটি রিপোর্ট করুন</h4>
                          <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-slate-200 mb-3 outline-none focus:border-amber-500">
                            <option value="wrong_answer">ভুল উত্তর দেওয়া আছে</option>
                            <option value="typo">বানান ভুল / টাইপো</option>
                            <option value="out_of_syllabus">সিলেবাসের বাইরের প্রশ্ন</option>
                            <option value="other">অন্যান্য</option>
                          </select>
                          <textarea 
                            placeholder="বিস্তারিত লিখুন (অপশনাল)..." 
                            value={reportMsg} onChange={e => setReportMsg(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-sm text-slate-200 mb-3 outline-none focus:border-amber-500 resize-none h-20"
                          />
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setReportingQ(null)} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-300">বাতিল</button>
                            <button onClick={() => handleReportSubmit(q, idx)} disabled={reportLoading} className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50">
                              {reportLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} সাবমিট
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReportingQ(idx); setReportType('wrong_answer'); setReportMsg(''); }} className="text-slate-500 hover:text-amber-400 text-xs font-bold flex items-center gap-1 transition-colors">
                          <AlertTriangle className="w-4 h-4" /> প্রশ্নে ভুল আছে?
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
