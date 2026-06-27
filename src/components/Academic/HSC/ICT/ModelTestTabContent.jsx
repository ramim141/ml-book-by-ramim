import { useState, useEffect, useCallback } from 'react';
import { Timer, Settings2, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { MCQItem } from './MCQTabContent';

const ModelTestTabContent = ({ mcqs }) => {
  const [phase, setPhase] = useState('setup'); // 'setup', 'running', 'completed'
  
  // Setup states
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedTime, setSelectedTime] = useState(10); // in minutes
  
  // Running states
  const [testMcqs, setTestMcqs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  
  // Results states
  const [score, setScore] = useState(0);

  // Shuffle and pick random questions
  const startTest = () => {
    const shuffled = [...mcqs].sort(() => 0.5 - Math.random());
    const selected = selectedCount === 'all' ? shuffled : shuffled.slice(0, selectedCount);
    
    setTestMcqs(selected);
    setAnswers({});
    setTimeLeft(selectedTime * 60);
    setScore(0);
    setPhase('running');
  };

  // Timer logic
  useEffect(() => {
    let timerId;
    if (phase === 'running' && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'running' && timeLeft === 0) {
      submitTest();
    }
    return () => clearInterval(timerId);
  }, [phase, timeLeft]);

  const handleSelectAnswer = useCallback((mcqId, optIdx) => {
    if (phase !== 'running') return;
    setAnswers(prev => ({ ...prev, [mcqId]: optIdx }));
  }, [phase]);

  const submitTest = useCallback(() => {
    let currentScore = 0;
    testMcqs.forEach(mcq => {
      if (answers[mcq.id] === mcq.answer) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setPhase('completed');
  }, [answers, testMcqs]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --------------------------------------------------------
  // Setup Phase UI
  // --------------------------------------------------------
  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
              <Settings2 className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
<h2 className="text-base sm:text-2xl font-bold text-white text-center mb-2 leading-tight">মডেল টেস্ট কনফিগারেশন</h2>
          <p className="text-xs sm:text-base text-slate-400 text-center mb-6 sm:mb-8 px-2 leading-relaxed">আপনার পছন্দমতো প্রশ্ন সংখ্যা এবং সময় নির্বাচন করে পরীক্ষা শুরু করুন।</p>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">কতগুলো প্রশ্ন চান?</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[10, 20, 25].map(count => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={`py-2.5 sm:py-3 px-1 rounded-xl border text-sm sm:text-base font-semibold transition-all ${
                      selectedCount === count 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {count} টি
                  </button>
                ))}
              </div>
            </div>

            <div>
<label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">কত সময় চান?</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[5, 15, 25].map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 sm:py-3 px-1 rounded-xl border text-sm sm:text-base font-semibold transition-all ${
                      selectedTime === time 
                        ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/20' 
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    {time} মি.
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startTest}
              disabled={mcqs.length === 0}
              className="w-full mt-4 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {mcqs.length > 0 ? 'পরীক্ষা শুরু করুন' : 'কোনো প্রশ্ন নেই'}
            </button>
            {mcqs.length > 0 && mcqs.length < selectedCount && (
               <p className="text-amber-400 text-xs text-center mt-2 flex items-center justify-center gap-1">
                 <AlertCircle className="w-3 h-3" />
                 মোট {mcqs.length} টি প্রশ্ন পাওয়া গেছে।
               </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // Running Phase UI
  // --------------------------------------------------------
  if (phase === 'running') {
    return (
      <div className="space-y-6 relative pb-20">
        <div className="sticky top-20 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-3 sm:p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div>
            <div className="text-xs sm:text-sm text-slate-400 font-medium mb-1">সময় বাকি</div>
            <div className={`text-lg sm:text-2xl font-extrabold flex items-center gap-2 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              <Timer className="w-5 h-5 sm:w-6 sm:h-6" />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm text-slate-400 font-medium mb-1">উত্তর দেওয়া হয়েছে</div>
            <div className="text-base sm:text-xl font-bold text-white">
              {Object.keys(answers).length} <span className="text-slate-500 text-sm sm:text-base font-medium">/ {testMcqs.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          {testMcqs.map((mcq, idx) => (
            <MCQItem 
              key={mcq.id} 
              mcq={mcq} 
              index={idx}
              isQuizMode={true}
              quizSelectedOption={answers[mcq.id]}
              onQuizSelect={handleSelectAnswer}
              isQuizSubmitted={false}
            />
          ))}
        </div>

        <div className="flex justify-center mt-8 pt-8 border-t border-slate-800">
          <button 
            onClick={submitTest}
            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl shadow-indigo-900/20 transform hover:-translate-y-1"
          >
            পরীক্ষা শেষ করুন
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // Completed Phase UI
  // --------------------------------------------------------
  if (phase === 'completed') {
    const percentage = Math.round((score / testMcqs.length) * 100);
    let message = 'ভালো চেষ্টা!';
    let messageColor = 'text-amber-400';
    if (percentage >= 80) {
      message = 'চমৎকার!';
      messageColor = 'text-emerald-400';
    } else if (percentage < 40) {
      message = 'আরও চর্চা প্রয়োজন!';
      messageColor = 'text-red-400';
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-slate-800/60 border border-slate-700/50 p-5 sm:p-10 rounded-2xl sm:rounded-3xl max-w-2xl mx-auto text-center shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">পরীক্ষা সম্পন্ন হয়েছে!</h2>
          <div className={`text-base sm:text-lg font-medium mb-6 ${messageColor}`}>{message}</div>
          
          <div className="flex justify-center items-center gap-4 sm:gap-8 mb-8 bg-slate-900/50 py-5 sm:py-6 px-4 sm:px-8 rounded-2xl border border-slate-800">
            <div>
              <div className="text-slate-400 text-sm font-medium mb-1">প্রাপ্ত নম্বর</div>
              <div className="text-2xl sm:text-4xl font-extrabold text-white">
                {score} <span className="text-base sm:text-xl text-slate-500 font-medium">/ {testMcqs.length}</span>
              </div>
            </div>
            <div className="w-px h-16 bg-slate-700"></div>
            <div>
              <div className="text-slate-400 text-sm font-medium mb-1">সঠিকতা</div>
              <div className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {percentage}%
              </div>
            </div>
          </div>

          <button 
            onClick={() => setPhase('setup')}
            className="flex items-center gap-2 mx-auto px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            আবার পরীক্ষা দিন
          </button>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <h3 className="text-base sm:text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            উত্তরপত্র বিশ্লেষণ
          </h3>
          <div className="space-y-4">
            {testMcqs.map((mcq, idx) => (
              <MCQItem 
                key={mcq.id} 
                mcq={mcq} 
                index={idx}
                isQuizMode={true}
                quizSelectedOption={answers[mcq.id]}
                isQuizSubmitted={true}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ModelTestTabContent;
