import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, ArrowRight, RotateCcw, AlertTriangle, Send, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase'; // Added db import
import { recordMistake } from '../../../lib/mistakes';
import { recordExamProgress } from '../../../lib/examProgress';
import ExamPdfExportModal from '../../../components/Academic/ExamPdfExportModal';

const enToBnNumber = (numStr) => {
  if (numStr === null || numStr === undefined || numStr === '') return numStr;
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
  const { questions, answers, totalTime, timeTaken, subjectTitle, subjectId } = location.state || {};
  const [reportingQ, setReportingQ] = useState(null);
  const [reportType, setReportType] = useState('wrong_answer');
  const [reportMsg, setReportMsg] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportedSet, setReportedSet] = useState(new Set());
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const hasSaved = useRef(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${enToBnNumber(m)} মিনিট ${enToBnNumber(s)} সেকেন্ড`;
  };

  // Calculate score
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  (questions || []).forEach((q, idx) => {
    if (answers[idx] === undefined) {
      skippedCount++;
    } else if (answers[idx] === q.answer) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const percentage = questions?.length ? Math.round((correctCount / questions.length) * 100) : 0;

  // Save result to Firestore and Mistake Notebook
  useEffect(() => {
    if (!questions || hasSaved.current) return;
    hasSaved.current = true;
    
    const saveResult = async () => {
      // ভুল হওয়া প্রশ্নগুলো "ভুলের খাতা"য় জমা
      let mistakeCount = 0;
      questions.forEach((q, idx) => {
        const userAns = answers[idx] ?? answers[q.id] ?? answers[q.firebaseId];
        if (userAns !== undefined && userAns !== null && userAns !== q.answer) {
          mistakeCount++;
          recordMistake(currentUser?.uid || 'guest', q, {
            subjectId: subjectId || q.subject || '',
            subjectTitle: subjectTitle || q.subject || 'মডেল টেস্ট',
            userAnswer: userAns,
            program: q.program || ''
          }).catch(console.error);
        }
      });

      if (mistakeCount > 0) {
        toast.success(`${mistakeCount}টি ভুল প্রশ্ন ভুলের খাতায় (Mistake Book) যুক্ত হয়েছে।`, {
          icon: '📓',
          duration: 3500
        });
      }

      if (!currentUser) return;

      // XP, chapterStats, questionsBySubject ও পরীক্ষার ইতিহাস
      try {
        await recordExamProgress({
          uid: currentUser.uid,
          questions,
          answers,
          subjectId,
          subjectTitle: subjectTitle || 'মডেল টেস্ট',
          timeTaken: timeTaken || 0,
          source: 'model-test',
        });
      } catch (err) {
        console.error('Failed to save exam result', err);
        toast.error('ফলাফল সেভ করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।');
      }
    };
    saveResult();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // সব hook কল হওয়ার পরেই early return — hook ক্রম স্থির রাখতে
  if (!questions) {
    return <Navigate to="/academic/model-test" replace />;
  }

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
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
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
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-colors w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" /> প্রশ্ন ও উত্তরপত্র PDF
              </button>
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

        {/* Printable PDF Export Modal */}
        <ExamPdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          examTitle={subjectTitle || 'মডেল টেস্ট প্রশ্ন ও উত্তরপত্র'}
          questions={questions}
          examInfo={{
            totalMarks: questions.length,
            timeLimitMinutes: Math.round((totalTime || 3600) / 60),
            subject: subjectTitle || 'সাধারণ',
          }}
        />

        {/* Answer Review Section */}
        <div className="pt-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-fuchsia-400" /> উত্তরপত্র বিশ্লেষণ
          </h3>
          
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.answer;
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
                            <img src={q.imageUrl} alt="Question figure" loading="lazy" className="max-w-full h-auto object-contain" />
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
                    {(Array.isArray(q.options) ? q.options : (typeof q.options === 'object' && q.options !== null ? Object.values(q.options) : [])).map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.answer;
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
