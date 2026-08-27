import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { recordMistake } from '../../../lib/mistakes';
import { recordExamProgress, normalizeChapterId } from '../../../lib/examProgress';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Clock, Loader2, CheckCircle2, AlertTriangle, ArrowLeft, WifiOff, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Skeleton, SkeletonList } from '../../../components/UI/Skeleton';
import { optionsOf, shuffle } from '../../../lib/questionUtils';

const enToBnNumber = (numStr) => {
  if (numStr === null || numStr === undefined || numStr === '') return numStr;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const MarkdownRenderer = ({ content }) => (
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed">
    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{content}</ReactMarkdown>
  </span>
);

export default function LiveExamEngine() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [examConfig, setExamConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // উত্তরগুলো প্রতিবার বদলালেই লোকালি রাখি। মোবাইল ডেটা কেটে গেলে বা
  // ভুল করে ট্যাব বন্ধ হলে পুরো পরিশ্রম নষ্ট হওয়ার কথা নয় — ফিরে এলে
  // যেখানে ছিল সেখান থেকেই শুরু হবে।
  const answersKey = `live-exam-answers:${examId}:${currentUser?.uid || 'guest'}`;
  const [answers, setAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem(answersKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [restoredAnswers] = useState(() => {
    try { return Object.keys(JSON.parse(localStorage.getItem(answersKey) || '{}')).length; }
    catch { return 0; }
  });
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [timeLeft, setTimeLeft] = useState(0);
  // কত সময় লাগল তা হিসাব করতে — state এ রাখলে handleSubmit প্রতি সেকেন্ডে
  // নতুন করে তৈরি হতো, আর তাতে টাইমারের ইফেক্টও বারবার রিসেট হতো
  const startedAtRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // alert() পুরো ট্যাব আটকে রাখে আর কারণটাও বোঝায় না — বদলে পেজেই দেখাই
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  // উত্তর বদলালেই লোকালি সংরক্ষণ (বাইরের সিস্টেমে লেখা — ইফেক্টের সঠিক কাজ)
  useEffect(() => {
    try { localStorage.setItem(answersKey, JSON.stringify(answers)); } catch { /* কোটা শেষ হলে চুপচাপ চলুক */ }
  }, [answers, answersKey]);

  // সংযোগ আছে কি না — জমা দেওয়ার আগে জানা দরকার
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const fetchExamData = async () => {
    try {
      const examDoc = await getDoc(doc(db, 'live_exams', examId));
      if (!examDoc.exists()) {
        setError('Exam not found');
        setLoading(false);
        return;
      }

      const examData = examDoc.data();
      const now = new Date();
      const startTime = examData.startTime?.toDate();
      const endTime = examData.endTime?.toDate();

      // সময়সূচি না থাকলে নিচে endTime.getTime() এ ক্র‍্যাশ করত — আগেই ধরি
      if (!startTime || !endTime) {
        setError('এই পরীক্ষার সময়সূচি ঠিকভাবে সেট করা হয়নি। অ্যাডমিনকে জানান।');
        setLoading(false);
        return;
      }
      if (now < startTime) {
        setError('Exam has not started yet');
        setLoading(false);
        return;
      }
      if (now > endTime) {
        setError('Exam has already ended');
        setLoading(false);
        return;
      }

      // Check if user already submitted
      const submissionRef = doc(db, 'live_exams', examId, 'submissions', currentUser.uid);
      const submissionSnap = await getDoc(submissionRef);
      if (submissionSnap.exists()) {
        navigate(`/academic/live-exam/${examId}/result`, { replace: true });
        return;
      }

      setExamConfig({ id: examDoc.id, ...examData, endTime });

      // অ্যাডমিন সরাসরি JSON দিয়ে প্রশ্ন দিলে প্রশ্নব্যাংকে যাওয়ার দরকার নেই
      const custom = examData.customQuestions || [];
      let fetchedQuestions;

      if (custom.length > 0) {
        fetchedQuestions = custom.map((item, i) => ({ id: item.id || `custom-${i + 1}`, ...item }));
      } else {
        const q = query(
          collection(db, 'academic_content'),
          where('subject', '==', examData.subject),
          where('type', '==', 'mcq')
        );
        const snapshot = await getDocs(q);
        fetchedQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // অধ্যায় ফিল্টার শুধু প্রশ্নব্যাংকের ক্ষেত্রে। কাস্টম প্রশ্নে chapterId
      // ঐচ্ছিক — সেখানেও ফিল্টার চালালে অধ্যায়হীন প্রশ্নগুলো বাদ পড়ে
      // পরীক্ষা শূন্য হয়ে যেত।
      const wantedChapters = custom.length > 0
        ? []
        : (examData.chapters || []).map(normalizeChapterId);
      if (wantedChapters.length > 0) {
        fetchedQuestions = fetchedQuestions.filter(
          (item) => wantedChapters.includes(normalizeChapterId(item.chapterId))
        );
      }

      if (fetchedQuestions.length === 0) {
        setError('এই পরীক্ষার জন্য কোনো প্রশ্ন পাওয়া যায়নি। অ্যাডমিনকে জানান।');
        setLoading(false);
        return;
      }

      // Shuffle and slice to totalQuestions
      fetchedQuestions = shuffle(fetchedQuestions, `${examId}:${currentUser.uid}`)
        .slice(0, examData.totalQuestions || 25);

      setQuestions(fetchedQuestions);
      startedAtRef.current = Date.now();

      // Calculate time left: minimum of duration or time until end time
      const secondsUntilEnd = Math.floor((endTime.getTime() - now.getTime()) / 1000);
      const durationSeconds = (examData.duration || 30) * 60;
      setTimeLeft(Math.min(secondsUntilEnd, durationSeconds));

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load exam data');
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const submissionRef = doc(db, 'live_exams', examId, 'submissions', currentUser.uid);
      
      // Calculate basic scores
      let correct = 0;
      let wrong = 0;
      let unanswered = 0;

      questions.forEach((q, idx) => {
        if (answers[idx] === undefined) {
          unanswered++;
        } else if (answers[idx] === q.answer) {
          correct++;
        } else {
          wrong++;
        }
      });

      const marksPerQ = examConfig.marksPerQuestion || 1;
      const negativeMark = examConfig.negativeMarking || 0;
      const totalScore = (correct * marksPerQ) - (wrong * negativeMark);

      // লিডারবোর্ড ও রেজাল্ট পেজের জন্য যতটুকু দরকার ততটুকুই এখানে।
      // `answers` ও `email` আগে এই ডকেই থাকত, অথচ নিয়ম অনুযায়ী লগইন করা
      // যে কেউ অন্যের সাবমিশন পড়তে পারে — অর্থাৎ অন্যের উত্তর ও ইমেইল
      // দেখা যেত। ওগুলো এখন self-only সাবডকুমেন্টে।
      const submissionData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Student',
        correct,
        wrong,
        unanswered,
        totalScore,
        submittedAt: Timestamp.now(),
      };

      // ── অপরিহার্য: পরীক্ষা জমা ─────────────────────────────────
      // এটি সফল হলেই ছাত্রের পরীক্ষা জমা হয়ে গেছে। এর পরের লেখাগুলো
      // (উত্তরপত্র, প্রগ্রেস, ইতিহাস) সহায়ক — কোনোটা ব্যর্থ হলেও জমা
      // দেওয়া আটকানো যাবে না। আগে private/data লেখাটা এই একই try তে ছিল,
      // ফলে ওটা permission-denied হলে জমা সফল হওয়া সত্ত্বেও ছাত্র এরর
      // দেখে আটকে থাকত।
      await setDoc(submissionRef, submissionData);

      // ── সহায়ক লেখা: প্রতিটি আলাদা, ব্যর্থ হলেও এগিয়ে যাই ──────────
      const optional = [];

      // নিজের উত্তরপত্র (শুধু নিজে পড়তে পারবে)
      optional.push(
        setDoc(doc(submissionRef, 'private', 'data'), {
          email: currentUser.email,
          answers,
          submittedAt: Timestamp.now(),
        }).catch((err) => console.error('উত্তরপত্র সেভ হয়নি', err))
      );

      // রেজাল্ট পেজ প্রশ্নগুলো এখান থেকেই দেখায়
      optional.push(
        setDoc(doc(db, 'users', currentUser.uid, 'live_exam_history', examId), {
          examId,
          title: examConfig.title,
          subject: examConfig.subject,
          submittedAt: Timestamp.now(),
          totalScore,
          questionsSnapshot: questions,
        }).catch((err) => console.error('পরীক্ষার স্ন্যাপশট সেভ হয়নি', err))
      );

      // প্রগ্রেস/XP — মডেল টেস্টের সাথে একই হেল্পার, তাই দুটো একইভাবে গোনা হয়
      optional.push(
        recordExamProgress({
          uid: currentUser.uid,
          questions,
          answers,
          subjectId: examConfig.subject,
          subjectTitle: examConfig.title || 'লাইভ এক্সাম',
          timeTaken: startedAtRef.current
            ? Math.round((Date.now() - startedAtRef.current) / 1000)
            : 0,
          source: 'live-exam',
        }).catch((err) => console.error('প্রগ্রেস সেভ হয়নি', err))
      );

      // ভুলের খাতা — আগে থেকেই fire-and-forget
      questions.forEach((q, idx) => {
        if (answers[idx] !== undefined && answers[idx] !== q.answer) {
          recordMistake(currentUser.uid, q, {
            subjectId: examConfig.subject,
            subjectTitle: examConfig.title || 'লাইভ এক্সাম',
            userAnswer: answers[idx],
            program: String(
              examConfig.level === 'Admission' ? (examConfig.admissionTrack || '') : (examConfig.level || '')
            ).toLowerCase(),
          }).catch((err) => console.error('ভুলের খাতায় জমা হয়নি', err));
        }
      });

      await Promise.allSettled(optional);

      // জমা হয়ে গেছে — লোকাল কপির আর দরকার নেই
      try { localStorage.removeItem(answersKey); } catch { /* উপেক্ষা */ }

      navigate(`/academic/live-exam/${examId}/result`, { replace: true });
    } catch (err) {
      console.error('Error submitting exam:', err);

      // নিয়ম অনুযায়ী একবার জমা দিলে আর বদলানো যায় না (create হ্যাঁ, update না)।
      // তাই আগেই জমা হয়ে থাকলে এই লেখাটা permission-denied হয় — সেটা আসলে
      // ভুল নয়, ছাত্রের পরীক্ষা জমা হয়েই আছে। এরর না দেখিয়ে ফলাফলে পাঠাই।
      try {
        const existing = await getDoc(
          doc(db, 'live_exams', examId, 'submissions', currentUser.uid)
        );
        if (existing.exists()) {
          navigate(`/academic/live-exam/${examId}/result`, { replace: true });
          return;
        }
      } catch (checkErr) {
        console.error('আগের জমা যাচাই করা যায়নি', checkErr);
      }

      setSubmitError(
        err?.code === 'permission-denied'
          ? 'জমা দেওয়ার অনুমতি পাওয়া যায়নি। শিক্ষক/অ্যাডমিনকে জানান — সার্ভারের নিয়ম (Firestore rules) হালনাগাদ করা প্রয়োজন।'
          : 'পরীক্ষা জমা দেওয়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।'
      );
      setIsSubmitting(false);
    }
  }, [answers, answersKey, currentUser, examConfig, examId, isSubmitting, navigate, questions]);

  // handleSubmit প্রতিবার উত্তর বদলালেই নতুন করে তৈরি হয়। ওটা সরাসরি
  // ডিপেন্ডেন্সিতে থাকায় ছাত্র একটা অপশন বাছলেই interval ভেঙে আবার তৈরি হতো,
  // অর্থাৎ দ্রুত উত্তর দিলে ঘড়ি সেকেন্ডই গুনত না। তাই ref এ ধরে রাখি।
  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (!examConfig || loading || error) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [examConfig, loading, error]);

  // সময় শেষ হলে জমা — setState আপডেটারের ভেতরে জমা দেওয়া হতো, যেটা রেন্ডার
  // ফেজে সাইড-ইফেক্ট (React দুইবার চালালে দুইবার জমা পড়ার ঝুঁকি)।
  // startedAtRef ছাড়া গার্ড দিলে লোড শেষ হওয়ার আগেই timeLeft=0 দেখে
  // খালি পরীক্ষা জমা পড়ে যেতে পারত।
  useEffect(() => {
    if (!examConfig || loading || error || !startedAtRef.current) return;
    if (timeLeft > 0) return;
    handleSubmitRef.current();
  }, [timeLeft, examConfig, loading, error]);

  const formatTime = (seconds) => {
    if (seconds < 0) return '০০:০০';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${enToBnNumber(m.toString().padStart(2, '0'))}:${enToBnNumber(s.toString().padStart(2, '0'))}`;
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] pt-16 sm:pt-20 pb-24 px-3 sm:px-6 lg:px-8 font-bangla">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center pt-20 px-4">
        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#0a0f1c] pt-16 sm:pt-20 pb-24 px-3 sm:px-6 lg:px-8 font-bangla selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Bar: Timer & Progress */}
        <div className="sticky top-16 sm:top-20 z-40 bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-slate-800 pb-3 sm:pb-4 mb-4 sm:mb-6 pt-2 sm:pt-4 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
            <h2 className="text-slate-300 font-bold text-sm sm:text-base hidden sm:block">
              {examConfig.title}
            </h2>
            <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold font-mono text-base sm:text-lg shrink-0 ${
              timeLeft < 60 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse' : 'bg-slate-800 border border-slate-700 text-amber-400'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-800/40 border border-slate-700/50 text-xs sm:text-sm font-bold text-slate-300">
              <span className="hidden sm:inline">উত্তর দিয়েছেন:</span>
              <span className="sm:hidden">উত্তর:</span>
              <span><span className="text-emerald-400">{enToBnNumber(answeredCount)}</span> / {enToBnNumber(questions.length)}</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2">
            <div 
              className="bg-emerald-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6 sm:space-y-8">
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl sm:shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-emerald-500/20 text-emerald-400 font-bold text-lg sm:text-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shrink-0">
                  {enToBnNumber(qIdx + 1)}
                </div>
                <div className="text-base sm:text-xl font-medium text-slate-200 mt-0.5 sm:mt-1 leading-relaxed w-full">
                  <MarkdownRenderer content={q.question} />
                  {q.imageUrl && (
                    <div className="mt-4 mb-2 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50 flex justify-center max-h-[300px]">
                      <img src={q.imageUrl} alt="Question figure" loading="lazy" className="max-w-full h-auto object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* 2 Options Per Row Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {optionsOf(q).map((option, optIdx) => {
                  const isSelected = answers[qIdx] === optIdx;
                  const prefix = ['(ক)', '(খ)', '(গ)', '(ঘ)', '(ঙ)', '(চ)'][optIdx] || `(${optIdx + 1})`;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleOptionSelect(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-start gap-3 group relative cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500/15 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/40 text-white' 
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200 border border-slate-700/60'
                      }`}>
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : prefix}
                      </div>
                      <div className={`text-sm sm:text-base leading-relaxed flex-1 ${
                        isSelected ? 'font-bold text-white' : 'font-normal text-slate-300'
                      }`}>
                        <MarkdownRenderer content={option} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to exit? Your progress will not be saved.')) {
                navigate(-1);
              }
            }}
            className="flex-1 py-3 sm:py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" /> Cancel Exam
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure you want to submit your exam now?')) {
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
            className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> Submit Live Exam</>
            )}
          </button>
        </div>

        {/* আগের উত্তর ফিরিয়ে আনা হয়েছে — না জানালে ছাত্র ভাববে সে আগেই দিয়েছিল কি না */}
        {restoredAnswers > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5">
            <RotateCcw className="h-4 w-4 shrink-0 text-indigo-400" />
            <p className="text-xs font-semibold text-indigo-200">
              আগের {enToBnNumber(restoredAnswers)} টি উত্তর ফিরিয়ে আনা হয়েছে।
            </p>
          </div>
        )}

        {/* সংযোগ নেই — জমা দেওয়ার আগেই জানা দরকার */}
        {!isOnline && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-amber-200">ইন্টারনেট সংযোগ নেই</p>
              <p className="mt-1 text-xs text-amber-300/80">
                তোমার উত্তরগুলো এই ডিভাইসে সংরক্ষিত আছে। সংযোগ ফিরলে জমা দাও —
                পাতা বন্ধ করলেও উত্তর হারাবে না।
              </p>
            </div>
          </div>
        )}

        {/* জমা দিতে সমস্যা হলে কারণটা এখানেই দেখাই — উত্তরগুলো পাতায় থেকে
            যায়, তাই ছাত্র আবার চেষ্টা করতে পারে */}
        {submitError && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-rose-200">{submitError}</p>
              <p className="mt-1 text-xs text-rose-300/80">
                তোমার উত্তরগুলো এখনো এই পাতায় আছে — পাতা বন্ধ কোরো না।
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
