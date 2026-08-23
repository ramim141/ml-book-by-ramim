import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Trophy, Clock, Target, CheckCircle2, XCircle, AlertCircle, Loader2, ArrowRight, BookOpen, Crown, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Skeleton, SkeletonList } from '../../../components/UI/Skeleton';

const enToBnNumber = (numStr) => {
  if (!numStr) return numStr;
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numStr).replace(/[0-9]/g, w => bn[w]);
};

const MarkdownRenderer = ({ content }) => (
  <span className="prose prose-invert max-w-none prose-p:inline prose-p:leading-relaxed">
    <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>{content}</ReactMarkdown>
  </span>
);

export default function LiveExamResult() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [examFinished, setExamFinished] = useState(false);
  const [examConfig, setExamConfig] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchResultData();
  }, [examId]);

  const fetchResultData = async () => {
    try {
      // 1. Fetch Exam Config
      const examDoc = await getDoc(doc(db, 'live_exams', examId));
      if (!examDoc.exists()) {
        navigate('/academic/live-exams');
        return;
      }
      
      const configData = examDoc.data();
      const endTime = configData.endTime?.toDate();
      const now = new Date();
      setExamConfig({ id: examDoc.id, ...configData, endTime });
      
      const isFinished = now > endTime;
      setExamFinished(isFinished);

      // 2. Fetch User's Submission
      const submissionDoc = await getDoc(doc(db, 'live_exams', examId, 'submissions', currentUser.uid));
      if (!submissionDoc.exists()) {
        // User didn't submit anything
        setLoading(false);
        return;
      }
      // নিজের উত্তরগুলো এখন self-only সাবডকে (অন্যরা যেন পড়তে না পারে),
      // তাই মূল সাবমিশনের সাথে সেটাও এনে জোড়া লাগাই। পুরনো সাবমিশনে
      // answers মূল ডকেই আছে, তাই সেটাও fallback হিসেবে থাকে।
      const privateSnap = await getDoc(
        doc(db, 'live_exams', examId, 'submissions', currentUser.uid, 'private', 'data')
      ).catch(() => null);

      setSubmission({
        ...submissionDoc.data(),
        answers: privateSnap?.exists()
          ? (privateSnap.data().answers || {})
          : (submissionDoc.data().answers || {}),
      });

      // 3. Fetch Snapshot Questions from User's History
      const historyDoc = await getDoc(doc(db, 'users', currentUser.uid, 'live_exam_history', examId));
      if (historyDoc.exists() && historyDoc.data().questionsSnapshot) {
        setQuestions(historyDoc.data().questionsSnapshot);
      }

      // 4. Calculate Rank if Finished
      if (isFinished) {
        const q = query(
          collection(db, 'live_exams', examId, 'submissions'),
          orderBy('totalScore', 'desc'),
          orderBy('submittedAt', 'asc') // tie breaker
        );
        const snapshot = await getDocs(q);
        
        let rank = 1;
        for (const docSnap of snapshot.docs) {
          if (docSnap.id === currentUser.uid) {
            setUserRank(rank);
            break;
          }
          rank++;
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-bangla">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center pt-20">
        <div className="bg-slate-900/80 p-8 rounded-3xl border border-slate-700/50 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Submission Found</h2>
          <p className="text-slate-400 mb-6">You did not participate or submit this live exam.</p>
          <button onClick={() => navigate('/academic/live-exams')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors">
            View Live Exams
          </button>
        </div>
      </div>
    );
  }

  if (!examFinished) {
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900/80 p-8 sm:p-12 rounded-3xl border border-slate-700/50 max-w-xl w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clock className="w-32 h-32" />
          </div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">Exam Submitted Successfully!</h2>
            <p className="text-slate-400 text-lg mb-8">
              Your answers have been securely recorded. Detailed results and the global leaderboard will be available once the exam time officially concludes.
            </p>
            
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-8 inline-block w-full max-w-sm">
              <p className="text-slate-400 text-sm font-semibold mb-1">Exam Ends At:</p>
              <p className="text-2xl font-bold text-indigo-400 font-mono">
                {examConfig.endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors">
                Refresh Page
              </button>
              <button onClick={() => navigate('/academic/live-exams')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                Back to Exams
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-bangla">
      <div className="max-w-4xl mx-auto">
        
        {/* Result Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-10 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trophy className="w-48 h-48" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold border border-indigo-500/30 mb-6">
              <Trophy className="h-4 w-4" /> Live Exam Result
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{examConfig.title}</h1>
            <p className="text-slate-400 mb-8">Subject: <span className="capitalize text-slate-300 font-semibold">{examConfig.subject}</span></p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8">
              <div className="bg-slate-800/80 px-6 py-4 rounded-2xl border border-slate-700/50 text-center min-w-[140px]">
                <p className="text-slate-400 text-sm font-bold mb-1">Your Score</p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {enToBnNumber(submission.totalScore.toFixed(2))}
                </p>
              </div>
              <div className="bg-slate-800/80 px-6 py-4 rounded-2xl border border-slate-700/50 text-center min-w-[140px]">
                <p className="text-slate-400 text-sm font-bold mb-1">Your Rank</p>
                <p className="text-3xl sm:text-4xl font-black text-amber-400 flex items-center justify-center gap-2">
                  <Crown className="h-6 w-6" /> {enToBnNumber(userRank)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 sm:p-4 text-center">
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-300 text-lg sm:text-2xl font-bold">{enToBnNumber(submission.correct)}</p>
                <p className="text-[10px] sm:text-xs text-emerald-500/70 font-semibold uppercase mt-1">Correct</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 sm:p-4 text-center">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400 mx-auto mb-2" />
                <p className="text-rose-300 text-lg sm:text-2xl font-bold">{enToBnNumber(submission.wrong)}</p>
                <p className="text-[10px] sm:text-xs text-rose-500/70 font-semibold uppercase mt-1">Wrong</p>
              </div>
              <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 sm:p-4 text-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-300 text-lg sm:text-2xl font-bold">{enToBnNumber(submission.unanswered)}</p>
                <p className="text-[10px] sm:text-xs text-slate-500/70 font-semibold uppercase mt-1">Skipped</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={() => navigate(`/academic/live-exam/${examId}/leaderboard`)} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                <Crown className="w-5 h-5" /> Global Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Solution */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            Detailed Solution
          </h2>
        </div>

        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const userAnswer = submission.answers[qIdx];
            const isCorrect = userAnswer === q.answer;
            const isUnanswered = userAnswer === undefined;
            
            return (
              <div key={qIdx} className={`bg-slate-900/60 border rounded-2xl p-5 sm:p-8 
                ${isCorrect ? 'border-emerald-500/30' : isUnanswered ? 'border-slate-700/50' : 'border-rose-500/30'}
              `}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`px-3 py-1.5 rounded-lg font-bold text-lg shrink-0
                    ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : isUnanswered ? 'bg-slate-700 text-slate-300' : 'bg-rose-500/20 text-rose-400'}
                  `}>
                    {enToBnNumber(qIdx + 1)}
                  </div>
                  <div className="text-slate-200 text-base sm:text-lg font-medium pt-1">
                    <MarkdownRenderer content={q.question} />
                    {q.imageUrl && (
                      <div className="mt-4 mb-2 rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 flex justify-center max-h-[300px]">
                        <img src={q.imageUrl} alt="Question figure" className="max-w-full h-auto object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pl-0 sm:pl-16">
                  {(Array.isArray(q.options) ? q.options : (typeof q.options === 'object' && q.options !== null ? Object.values(q.options) : [])).map((opt, optIdx) => {
                    const isSelected = optIdx === userAnswer;
                    const isRightAnswer = optIdx === q.answer;
                    
                    let bgClass = "bg-slate-800/50 border-slate-700/50";
                    let icon = <Circle className="w-5 h-5 text-slate-600" />;
                    
                    if (isRightAnswer) {
                      bgClass = "bg-emerald-500/10 border-emerald-500/50";
                      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                    } else if (isSelected && !isRightAnswer) {
                      bgClass = "bg-rose-500/10 border-rose-500/50";
                      icon = <XCircle className="w-5 h-5 text-rose-500" />;
                    }

                    return (
                      <div key={optIdx} className={`p-4 rounded-xl border flex items-center gap-3 ${bgClass}`}>
                        <div className="shrink-0">{icon}</div>
                        <div className={`text-sm sm:text-base ${isRightAnswer ? 'text-emerald-300 font-medium' : isSelected ? 'text-rose-300' : 'text-slate-400'}`}>
                          <MarkdownRenderer content={opt} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-6 pl-0 sm:pl-16">
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50"></div>
                      <h4 className="text-indigo-300 font-bold text-sm mb-2 uppercase tracking-wider">Explanation</h4>
                      <div className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        <MarkdownRenderer content={q.explanation} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
