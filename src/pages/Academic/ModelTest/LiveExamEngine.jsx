import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { Clock, Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

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

export default function LiveExamEngine() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [examConfig, setExamConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const examDoc = await getDoc(doc(db, 'live_exams', examId));
      if (!examDoc.exists()) {
        setError('Exam not found');
        return;
      }

      const examData = examDoc.data();
      const now = new Date();
      const startTime = examData.startTime?.toDate();
      const endTime = examData.endTime?.toDate();

      if (now < startTime) {
        setError('Exam has not started yet');
        return;
      }
      if (now > endTime) {
        setError('Exam has already ended');
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

      // Fetch questions (simplified: fetch by subject for now, ideally fetch by ID array)
      const q = query(
        collection(db, 'academic_content'),
        where('subject', '==', examData.subject),
        where('type', '==', 'mcq')
      );
      const snapshot = await getDocs(q);
      let fetchedQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Shuffle and slice to totalQuestions
      fetchedQuestions = fetchedQuestions.sort(() => 0.5 - Math.random()).slice(0, examData.totalQuestions || 25);
      
      setQuestions(fetchedQuestions);

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
        } else if (answers[idx] === q.correctOption) {
          correct++;
        } else {
          wrong++;
        }
      });

      const marksPerQ = examConfig.marksPerQuestion || 1;
      const negativeMark = examConfig.negativeMarking || 0;
      const totalScore = (correct * marksPerQ) - (wrong * negativeMark);

      const submissionData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Student',
        email: currentUser.email,
        answers,
        correct,
        wrong,
        unanswered,
        totalScore,
        submittedAt: Timestamp.now(),
      };

      await setDoc(submissionRef, submissionData);
      
      // Save exam snapshot in user's profile for result viewing
      await setDoc(doc(db, 'users', currentUser.uid, 'live_exam_history', examId), {
        examId,
        title: examConfig.title,
        subject: examConfig.subject,
        submittedAt: Timestamp.now(),
        totalScore,
        questionsSnapshot: questions // store snapshot so result page can render them
      });

      navigate(`/academic/live-exam/${examId}/result`, { replace: true });
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Error submitting exam. Please try again.');
      setIsSubmitting(false);
    }
  }, [answers, currentUser, examConfig, examId, isSubmitting, navigate, questions]);

  useEffect(() => {
    if (!examConfig || loading || error) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examConfig, loading, error, handleSubmit]);

  const formatTime = (seconds) => {
    if (seconds < 0) return '0০:0০';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${enToBnNumber(m.toString().padStart(2, '0'))}:${enToBnNumber(s.toString().padStart(2, '0'))}`;
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center pt-20">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-400 font-medium animate-pulse">Loading Live Exam Engine...</p>
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
                      <img src={q.imageUrl} alt="Question figure" className="max-w-full h-auto object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {q.options.map((option, optIdx) => {
                  const isSelected = answers[qIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(qIdx, optIdx)}
                      className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 flex items-center gap-3 sm:gap-4 group
                        ${isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                          : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                        ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                      </div>
                      <div className="text-sm sm:text-base text-slate-300">
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

      </div>
    </div>
  );
}
