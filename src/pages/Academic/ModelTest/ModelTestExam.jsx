import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
    <ReactMarkdown 
      remarkPlugins={[remarkMath, remarkGfm]} 
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  </span>
);

export default function ModelTestExam() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, durationSeconds, subjectTitle } = location.state || {};

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(durationSeconds || 600);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Auto-submit when time is up
  const handleSubmit = useCallback(() => {
    navigate('/academic/model-test/result', {
      state: {
        questions,
        answers,
        totalTime: durationSeconds,
        timeTaken: durationSeconds - timeLeft,
        subjectTitle
      },
      replace: true
    });
  }, [navigate, questions, answers, durationSeconds, timeLeft, subjectTitle]);

  useEffect(() => {
    if (!questions) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions, handleSubmit]);

  if (!questions) {
    return <Navigate to="/academic/model-test" replace />;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${enToBnNumber(m)}:${enToBnNumber(s.toString().padStart(2, '0'))}`;
  };

  const handleOptionSelect = (optIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optIdx
    }));
  };

  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#0a0f1c] pt-20 pb-24 px-4 sm:px-6 lg:px-8 font-bangla selection:bg-fuchsia-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Bar: Timer & Progress */}
        <div className="sticky top-20 z-40 bg-[#0a0f1c]/90 backdrop-blur-md border-b border-slate-800 pb-4 mb-6 pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-300 font-bold text-sm sm:text-base hidden sm:block">
              {subjectTitle} - মডেল টেস্ট
            </h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold font-mono text-lg ${
              timeLeft < 60 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse' : 'bg-slate-800 border border-slate-700 text-amber-400'
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm font-bold text-slate-400">
              উত্তর দিয়েছেন: <span className="text-fuchsia-400">{enToBnNumber(answeredCount)}</span> / {enToBnNumber(questions.length)}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-fuchsia-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="bg-fuchsia-500/20 text-fuchsia-400 font-bold text-xl px-4 py-2 rounded-xl shrink-0">
              {enToBnNumber(currentQuestionIndex + 1)}
            </div>
            <div className="text-lg sm:text-xl font-medium text-slate-200 mt-1">
              <MarkdownRenderer content={currentQ.question} />
            </div>
          </div>

          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = answers[currentQuestionIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleOptionSelect(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 group
                    ${isSelected 
                      ? 'bg-fuchsia-500/10 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]' 
                      : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                    ${isSelected ? 'border-fuchsia-500 bg-fuchsia-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`text-sm sm:text-base ${isSelected ? 'text-fuchsia-100 font-bold' : 'text-slate-300 font-medium'}`}>
                    <MarkdownRenderer content={option} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
              currentQuestionIndex === 0 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95'
            }`}
          >
            <ArrowLeft className="w-5 h-5" /> পূর্ববর্তী
          </button>
          
          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              পরবর্তী <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-900 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              ফিনিশ <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#0a0f1c]/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-500/20 p-4 rounded-full">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-center text-white mb-2">খাতা জমা দিতে চান?</h3>
            <p className="text-center text-slate-400 mb-6">
              আপনি {enToBnNumber(questions.length)} টির মধ্যে {enToBnNumber(answeredCount)} টি প্রশ্নের উত্তর দিয়েছেন।
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                ফিরে যান
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl font-bold bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-colors"
              >
                হ্যাঁ, জমা দিন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
