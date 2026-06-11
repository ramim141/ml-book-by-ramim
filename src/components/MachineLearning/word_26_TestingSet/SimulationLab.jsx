import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertTriangle, ShieldCheck, CheckCircle2, FlaskConical, Target, Brain, Search, RefreshCw, Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [examStatus, setExamStatus] = useState('idle'); // 'idle', 'evaluating', 'completed'
  const [dataLeakage, setDataLeakage] = useState(false); // Testing set exposed to training
  
  const [trainScore, setTrainScore] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [leakageWarning, setLeakageWarning] = useState("");

  const startEvaluation = useCallback(() => {
    if (examStatus === 'evaluating') return;
    setExamStatus('evaluating');
    setTrainScore(0);
    setTestScore(0);

    // Simulate Processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      
      // Update scores dynamically
      setTrainScore(Math.min(99, progress + (Math.random() * 10)));
      
      if (dataLeakage) {
        // Data Leakage: Test score artificially high because it memorized the answers
        setTestScore(Math.min(100, progress + 15));
      } else {
        // Normal generalization drop
        setTestScore(Math.min(88, progress - (Math.random() * 5)));
      }

      if (progress >= 100) {
        clearInterval(interval);
        setExamStatus('completed');
        
        if (dataLeakage) {
          setLeakageWarning("🚨 ভয়াবহ ডেটা লিকেজ শনাক্ত! মডেলটি পরীক্ষার আগেই টেস্টিং সেটের প্রশ্নগুলো মুখস্থ করে ফেলেছে। তাই সে ১০০% স্কোর দেখাচ্ছে। বাস্তব দুনিয়ায় এই মডেল চরমভাবে ব্যর্থ হবে (ওভারফিটিং)!");
        } else {
          setLeakageWarning("✅ চমৎকার মূল্যায়ন! টেস্টিং সেটটি লকড থাকায় মডেলটি তার সত্যিকারের মেধা (Generalization) দিয়ে ৮৮% স্কোর করেছে। মডেলটি বাস্তব দুনিয়ায় কাজ করার জন্য প্রস্তুত।");
        }
      }
    }, 500);
  }, [examStatus, dataLeakage]);

  const resetLab = useCallback(() => {
    setExamStatus('idle');
    setTrainScore(0);
    setTestScore(0);
    setLeakageWarning("");
  }, []);

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      {/* --- Header Area --- */}
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২৬</span>
          অদেখা পরীক্ষার হল (Testing Arena)
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          ট্রেনিং শেষে ড্রয়ারে লুকিয়ে রাখা অজানা ডেটা দিয়ে মডেলের আসল যোগ্যতা যাচাই করুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md mb-8">
          <div className="absolute top-4 right-4 text-rose-500/30"><Sparkles size={24} /></div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
              <span className="text-rose-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
              এই ল্যাবে আপনি টেস্টিং সেটের গুরুত্ব এবং 'ডেটা লিকেজ' এর ভয়াবহতা সম্পর্কে পরিষ্কার ধারণা পাবেন। 
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="text-lg">🔒</span> Testing Set Secured (সুরক্ষিত)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      মডেলটি টেস্টিং সেটের প্রশ্নগুলো আগে থেকে দেখেনি। এটি অজানা ডেটায় মডেলের সত্যিকারের জেনারেলিজেশন (Generalization) ক্ষমতা যাচাই করে।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-rose-500/30 transition-all duration-300">
                  <span className="font-bold text-rose-400 flex items-center gap-2">
                      <span className="text-lg">🔓</span> Testing Set Exposed (ডেটা লিকেজ)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      মডেলটি পরীক্ষার আগেই প্রশ্নগুলো মুখস্থ করে ফেলেছে! ফলে সে ১০০% স্কোর দেখাচ্ছে, কিন্তু বাস্তব দুনিয়ায় সে চরমভাবে ব্যর্থ হবে (ওভারফিটিং)।
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        
        {/* Left Column: Data Leakage Control Panel */}
        <div className="lg:col-span-5 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-rose-400 mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span>🔒</span> টেস্টিং সেট সিকিউরিটি
            </h3>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              মডেলটি যেন পরীক্ষার আগে প্রশ্ন দেখতে না পায়, সেজন্য ড্রয়ারটি লক করে রাখুন। আপনি চাইলে ড্রয়ার খুলে দিয়ে (Data Leakage) দেখতে পারেন ফলাফল কেমন হয়!
            </p>

            {/* Lock/Unlock Toggle */}
            <div className="bg-[#12161f] p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center space-y-4">
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                  dataLeakage 
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                    : 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                }`}
              >
                {dataLeakage ? <Unlock size={32} /> : <Lock size={32} />}
              </div>
              <div>
                <span className={`text-sm font-black uppercase tracking-widest ${dataLeakage ? 'text-red-400' : 'text-emerald-400'}`}>
                  {dataLeakage ? "Testing Set Exposed" : "Testing Set Secured"}
                </span>
                <p className="text-[10px] text-gray-500 mt-1">
                  {dataLeakage ? "মডেল পরীক্ষার আগেই প্রশ্ন দেখে ফেলেছে!" : "ড্রয়ারটি সিল করা আছে। প্রশ্নপত্র সুরক্ষিত।"}
                </p>
              </div>
              
              <button 
                onClick={() => { setDataLeakage(!dataLeakage); resetLab(); }}
                disabled={examStatus === 'evaluating'}
                className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white rounded-lg transition-colors border border-gray-600 disabled:opacity-50"
              >
                {dataLeakage ? "লক করুন (Secure Data)" : "লিকেজ তৈরি করুন (Expose Data)"}
              </button>
            </div>
          </div>

          <button 
            onClick={startEvaluation} disabled={examStatus === 'evaluating'}
            className="w-full py-4 rounded-xl font-bold transition-all text-sm tracking-wide flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] active:scale-95 disabled:opacity-50"
          >
            {examStatus === 'evaluating' ? <><RefreshCw className="animate-spin" size={18}/> মূল্যায়ন চলছে...</> : <><span>📝</span> ফাইনাল পরীক্ষা শুরু করুন</>}
          </button>
        </div>

        {/* Right Column: Visual Dashboard */}
        <div className="lg:col-span-7 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-800">
            <h3 className="font-bold text-white text-md">
              📊 মডেল পারফরম্যান্স মনিটর
            </h3>
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-800 rounded">Evaluation State</span>
          </div>

          <div className="grid grid-cols-2 gap-4 h-48 mb-6">
            {/* Training Result Box */}
            <div className="bg-[#12161f] p-4 rounded-2xl border border-gray-800 flex flex-col justify-center items-center shadow-inner relative">
              <span className="absolute top-3 left-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Training Score</span>
              <div className="text-4xl font-black font-mono text-indigo-400 my-2">
                {Math.round(trainScore)}%
              </div>
              <p className="text-[9px] text-gray-500 text-center">পরিচিত ডেটার ওপর মডেলের আত্মবিশ্বাস।</p>
            </div>

            {/* Testing Result Box */}
            <div className={`bg-[#12161f] p-4 rounded-2xl border flex flex-col justify-center items-center shadow-inner relative transition-colors duration-500 ${
              examStatus === 'completed' 
                ? (dataLeakage ? 'border-red-500/50 bg-red-950/20' : 'border-emerald-500/50 bg-emerald-950/20')
                : 'border-gray-800'
            }`}>
              <span className="absolute top-3 right-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider">Testing Score</span>
              <div className={`text-5xl font-black font-mono my-2 ${dataLeakage && examStatus === 'completed' ? 'text-red-400' : 'text-emerald-400'}`}>
                {Math.round(testScore)}%
              </div>
              <p className="text-[9px] text-gray-500 text-center">অজানা ডেটার ওপর মডেলের আসল মেধা।</p>
            </div>
          </div>

          {/* Alert / Feedback Box */}
          <div className={`p-4 rounded-xl border min-h-[90px] flex items-center gap-4 transition-all duration-500 ${
            examStatus === 'completed' 
              ? (dataLeakage ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30')
              : 'bg-[#12161f] border-gray-800 opacity-60'
          }`}>
            <div className="shrink-0 text-3xl">
              {examStatus === 'completed' ? (dataLeakage ? '🚨' : '✅') : '🔍'}
            </div>
            <p className={`text-xs md:text-sm font-medium leading-relaxed ${
              examStatus === 'completed' 
                ? (dataLeakage ? 'text-red-300' : 'text-emerald-300')
                : 'text-gray-500'
            }`}>
              {examStatus === 'completed' ? leakageWarning : "মডেলের আসল যোগ্যতা যাচাই করতে 'ফাইনাল পরীক্ষা শুরু করুন' বাটনে চাপ দিন।"}
            </p>
          </div>
          
          {examStatus === 'completed' && (
            <button onClick={resetLab} className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-300 rounded-lg transition-colors">
              ল্যাব রিস্টার্ট করুন 🔄
            </button>
          )}

        </div>

      </div>
    </div>
  );
}