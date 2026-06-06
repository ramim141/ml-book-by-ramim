import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Icons
const LockIcon = () => (
  <svg className="w-5 h-5 text-rose-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const SparklesIcon = () => (
  <svg className="w-5 h-5 text-amber-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default function SimulationLab() {
  const [trainSplit, setTrainSplit] = useState(80); 
  const [dataQuality, setDataQuality] = useState(90); 
  const [epochs, setEpochs] = useState(3); 
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [currentStepText, setCurrentStepText] = useState('প্রশিক্ষণ শুরু করতে নিচের বাটনে চাপুন।');
  
  const [showResults, setShowResults] = useState(false);
  const [trainAccuracy, setTrainAccuracy] = useState(0);
  const [testAccuracy, setTestAccuracy] = useState(0);
  const [examGrade, setExamGrade] = useState('');
  
  const totalBooks = 10;
  const trainingBooksCount = Math.round((trainSplit / 100) * totalBooks);
  const testingBooksCount = totalBooks - trainingBooksCount;

  const calculateFinalResults = () => {
    const basePotential = dataQuality;
    const calculatedTrainAcc = Math.round(Math.min(100, basePotential * (0.7 + (epochs * 0.1))));

    let calculatedTestAcc = 0;
    if (trainingBooksCount === 0 || testingBooksCount === 0) {
      calculatedTestAcc = 0; 
    } else {
      const splitMultiplier = 1 - Math.abs(trainSplit - 80) / 100;
      calculatedTestAcc = Math.round(calculatedTrainAcc * splitMultiplier * (dataQuality / 100));
    }

    setTrainAccuracy(calculatedTrainAcc);
    setTestAccuracy(testingBooksCount === 0 ? "N/A (টেস্ট সেট নেই!)" : `${calculatedTestAcc}%`);

    if (testingBooksCount === 0) {
      setExamGrade("ফলাফল অনিশ্চিত! (লুকানো ড্রয়ারে কোনো প্রশ্ন ছিল না, তাই পরীক্ষার আগেই নিজেকে যাচাই করতে পারেননি।)");
    } else {
      const score = calculatedTestAcc;
      if (score >= 85) setExamGrade("🏆 ঢাকা বিশ্ববিদ্যালয়ে ১ম স্থান অর্জন! (অসাধারণ প্রস্তুতি ও সঠিক অনুপাত)");
      else if (score >= 70) setExamGrade("🥈 মেধা তালিকায় চান্স হয়েছে! (ভালো প্রস্তুতি, আরেকটু রিভিশন দিলে টপ করা যেত)");
      else if (score >= 50) setExamGrade("🥉 ওয়েটিং লিস্টে সুযোগ! (সাধারণ পাস, ডেটা কোয়ালিটি বা রিভিশন বাড়ানো দরকার ছিল)");
      else setExamGrade("❌ এবার সুযোগ হয়নি! (আন্ডারফিটিং বা নিম্নমানের প্রশ্নপত্র পড়ার কুফল!)");
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setShowResults(false);
    setTrainingProgress(0);
    setTrainingLogs([]);
    setCurrentStepText('রিমিশা প্রশ্নপত্রগুলো নিয়ে টেবিলে বসছে...');

    const logs = [];
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      setTrainingProgress(progress);

      if (progress === 20) {
        logs.push(`📊 মোট ডেটার ${trainSplit}% অর্থাৎ ${trainingBooksCount} বছরের প্রশ্ন টেবিলে রাখা হলো (Training Set)।`);
        setTrainingLogs([...logs]);
        setCurrentStepText('১ম রাউন্ডের পড়াশোনা শুরু হচ্ছে...');
      } else if (progress === 40) {
        logs.push(`🔍 প্রশ্নপত্রের মান যাচাই করা হচ্ছে: ${dataQuality >= 80 ? 'চমৎকার কোয়ালিটি!' : dataQuality >= 40 ? 'কিছু প্রশ্ন ভুল ও আবর্জনাযুক্ত (Noise)।' : '⚠️ অত্যন্ত নিম্নমানের গাইডবই! ভুল তথ্যে ভরা!'}`);
        setTrainingLogs([...logs]);
        setCurrentStepText('প্যাটার্ন খোঁজা ও ভুল সংশোধন করা হচ্ছে...');
      } else if (progress === 60) {
        logs.push(`🧠 সূত্র ও নিয়মগুলো মগজে গেঁথে নেওয়া হচ্ছে... (রিভিশন চলছে: ${epochs} বার)`);
        setTrainingLogs([...logs]);
        setCurrentStepText('মডেলের গাণিতিক সূত্র বা ওজন (Weights) আপডেট হচ্ছে...');
      } else if (progress === 80) {
        logs.push(`🔒 ড্রয়ারে লক করা ${testingBooksCount} বছরের প্রশ্ন (Testing Set) এখনও সুরক্ষিত ও অদৃশ্য রাখা হয়েছে।`);
        setTrainingLogs([...logs]);
        setCurrentStepText('চূড়ান্ত টেস্ট পরীক্ষার প্রস্তুতি নেওয়া হচ্ছে...');
      } else if (progress === 100) {
        clearInterval(interval);
        calculateFinalResults();
        setIsTraining(false);
        setShowResults(true);
        setCurrentStepText('প্রশিক্ষণ সম্পন্ন! পরীক্ষার ফলাফল নিচে দেখুন।');
      }
    }, 450);
  };

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      {/* Header Area */}
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২৫</span>
          এআই স্টুডেন্ট অ্যারেনা
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          মেশিন লার্নিং মডেলকে শেখানোর জন্য ডেটাসেটের যে বড় অংশটি (সাধারণত ৮০%) পড়তে দেওয়া হয়। রিমিশার পড়ার টেবিল বনাম বন্ধ ড্রয়ারের জাদুকরী সিমুলেশন!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10">
        
        {/* Left Column: Settings Panel */}
        <div className="lg:col-span-5 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              <span>⚙️</span> প্যারামিটার নিয়ন্ত্রণ প্যানেল
            </h3>
            
            <div className="space-y-6">
              {/* Data Split Slider */}
              <div>
                <div className="flex justify-between mb-2 text-xs font-bold text-gray-300">
                  <span>📊 ডেটা ভাগ (Data Split):</span>
                  <span className="font-mono text-indigo-400">{trainSplit}% Train / {100 - trainSplit}% Test</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="10" value={trainSplit} 
                  onChange={(e) => { setTrainSplit(parseInt(e.target.value)); setShowResults(false); }}
                  disabled={isTraining} className="w-full accent-indigo-500 cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold">
                  <span className="text-rose-400">কম পড়া (১০%)</span>
                  <span className="text-emerald-400">আদর্শ (৮০%)</span>
                  <span className="text-amber-400">সব মুখস্থ (১০০%)</span>
                </div>
              </div>

              {/* Data Quality Slider */}
              <div>
                <div className="flex justify-between mb-2 text-xs font-bold text-gray-300">
                  <span>📚 প্রশ্নপত্রের মান (Data Quality):</span>
                  <span className={`${dataQuality >= 80 ? 'text-emerald-400' : dataQuality >= 50 ? 'text-amber-400' : 'text-rose-400'} font-mono`}>{dataQuality}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="10" value={dataQuality} 
                  onChange={(e) => { setDataQuality(parseInt(e.target.value)); setShowResults(false); }}
                  disabled={isTraining} className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-700 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold">
                  <span className="text-rose-400">আবর্জনা ডেটা (১০%)</span>
                  <span className="text-emerald-400">নির্ভুল ডেটা (১০০%)</span>
                </div>
              </div>

              {/* Revision Epochs */}
              <div>
                <div className="flex justify-between mb-2 text-xs font-bold text-gray-300">
                  <span>🔄 রিভিশন সংখ্যা (Epochs):</span>
                  <span className="font-mono text-indigo-400">{epochs} বার</span>
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => { setEpochs(num); setShowResults(false); }}
                      disabled={isTraining}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${epochs === num ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md' : 'bg-[#12161f] border-gray-800 text-gray-400 hover:border-gray-700 disabled:opacity-50'}`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStartTraining} disabled={isTraining}
            className={`w-full py-4 rounded-xl font-bold transition-all text-sm tracking-wide flex items-center justify-center gap-2 ${isTraining ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-700/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'}`}
          >
            {isTraining ? <><div className="w-4 h-4 border-2 border-indigo-400 rounded-full border-t-transparent animate-spin"></div> রিমিশা পড়াশোনা করছে... ({trainingProgress}%)</> : <><span>📖</span> রিমিশার পরীক্ষা প্রস্তুতি শুরু করুন</>}
          </button>
        </div>

        {/* Right Column: Visual Shelf & Terminal */}
        <div className="lg:col-span-7 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 border-b border-gray-700 pb-2">
            🏫 রিয়েল-টাইম ডেটা স্প্লিটিং ভিজ্যুয়ালাইজার
          </h3>

          <div className="space-y-6">
            {/* Training Set Table */}
            <div className="bg-[#12161f] p-5 rounded-2xl border border-indigo-500/20 relative shadow-inner">
              <div className="absolute -top-3 left-4 bg-indigo-950/80 border border-indigo-500/40 text-[10px] px-3 py-1 rounded-full font-bold text-indigo-300 uppercase tracking-widest">
                রিমিশার পড়ার টেবিল (Training Set) — {trainSplit}%
              </div>
              <div className="mt-4 min-h-[90px] flex flex-wrap gap-2 items-center justify-start">
                {Array.from({ length: trainingBooksCount }).map((_, idx) => (
                  <div key={idx} className="bg-indigo-900/20 border border-indigo-500/30 p-2.5 rounded-xl flex flex-col items-center justify-center w-[4.5rem] text-center shadow-sm transition-transform hover:-translate-y-1">
                    <span className="text-2xl">📘</span>
                    <span className="text-[9px] font-mono text-indigo-300 mt-1 font-bold">বছর {idx + 1}</span>
                  </div>
                ))}
                {trainingBooksCount === 0 && <div className="py-2 text-xs italic text-rose-400 font-bold">টেবিলে কোনো বই রাখা হয়নি! পড়ার কোনো সিলেবাস নেই।</div>}
              </div>
            </div>

            {/* Testing Set Drawer */}
            <div className="bg-[#12161f] p-5 rounded-2xl border border-rose-900/40 relative shadow-inner">
              <div className="absolute -top-3 left-4 bg-rose-950/80 border border-rose-500/30 text-[10px] px-3 py-1 rounded-full font-bold text-rose-300 uppercase tracking-widest">
                লুকানো বন্ধ ড্রয়ার (Testing Set) — {100 - trainSplit}%
              </div>
              <div className="mt-4 min-h-[90px] flex flex-wrap gap-2 items-center justify-start">
                {Array.from({ length: testingBooksCount }).map((_, idx) => (
                  <div key={idx} className="bg-rose-950/20 border border-rose-900/30 p-2.5 rounded-xl flex flex-col items-center justify-center w-[4.5rem] text-center shadow-sm relative opacity-60 grayscale hover:grayscale-0 transition-all">
                    <span className="text-2xl">📕</span>
                    <span className="text-[9px] font-mono text-rose-300 mt-1 font-bold">বছর {trainingBooksCount + idx + 1}</span>
                    <div className="absolute top-1 right-1"><LockIcon /></div>
                  </div>
                ))}
                {testingBooksCount === 0 && <div className="py-2 text-xs italic text-amber-400 font-bold">⚠️ ড্রয়ার ফাঁকা! পরীক্ষা নেওয়ার জন্য কোনো প্রশ্ন অবশিষ্ট নেই! (Overfitting Risk)</div>}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[#0b0f19] rounded-2xl border border-gray-800 p-5 font-mono text-[11px] shadow-inner">
            <div className="text-gray-500 mb-3 border-b border-gray-800 pb-2 flex justify-between font-bold uppercase tracking-widest">
              <span>🤖 এআই ক্লাসরুম মনিটর</span>
              <span className={isTraining ? 'text-indigo-400 animate-pulse' : 'text-gray-600'}>{isTraining ? 'প্রশিক্ষণ চলছে...' : 'অপেক্ষা করছে'}</span>
            </div>
            <p className="flex items-center gap-2 mb-4 font-sans text-xs text-gray-300 font-bold">
              <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              {currentStepText}
            </p>
            <div className="space-y-2 h-20 overflow-y-auto pr-2 custom-scrollbar">
              {trainingLogs.map((log, i) => <p key={i} className="leading-relaxed text-indigo-300/80">❯ {log}</p>)}
            </div>
          </div>
        </div>
      </div>

      {showResults && (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="w-full bg-[#1e2430] rounded-3xl border border-indigo-500/30 p-6 md:p-8 shadow-2xl mt-6">
          <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white border-b border-gray-700 pb-3">
            🎓 ভর্তি পরীক্ষার চূড়ান্ত ফলাফল
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-[#12161f] p-5 rounded-2xl border border-gray-800 text-center flex flex-col justify-between shadow-inner">
              <div>
                <span className="block mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">পড়ার টেবিলে দক্ষতা (Training Accuracy)</span>
                <p className="my-3 font-mono text-5xl font-extrabold text-indigo-400">{trainAccuracy}%</p>
              </div>
              <p className="pt-3 text-[10px] leading-relaxed text-gray-400 border-t border-gray-800/80">
                রিমিশা পড়ার টেবিলে যে প্রশ্ন সলভ করেছে, তার ভেতর নির্ভুলতা।
              </p>
            </div>
            <div className="bg-[#12161f] p-5 rounded-2xl border border-gray-800 text-center flex flex-col justify-between shadow-inner">
              <div>
                <span className="block mb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">লুকানো ড্রয়ার টেস্ট (Testing Accuracy)</span>
                <p className="my-3 font-mono text-5xl font-extrabold text-emerald-400">{testAccuracy}</p>
              </div>
              <p className="pt-3 text-[10px] leading-relaxed text-gray-400 border-t border-gray-800/80">
                অদেখা ও অজানা প্রশ্নপত্রে নেওয়া পরীক্ষা। এটিই প্রমাণ করে মডেলটি মুখস্থ করেছে নাকি শিখেছে!
              </p>
            </div>
            <div className="bg-[#12161f] p-5 rounded-2xl border border-indigo-900/50 text-center flex flex-col justify-between shadow-inner">
              <div>
                <span className="block mb-2 text-[10px] font-bold tracking-widest text-indigo-400 uppercase">ভর্তি পরীক্ষার ফলাফল (Generalization)</span>
                <p className="my-4 text-sm font-bold leading-relaxed text-amber-300">{examGrade}</p>
              </div>
              <div className="text-[10px] text-gray-500 border-t border-gray-800/80 pt-3 italic">
                {trainSplit === 80 && dataQuality >= 80 ? '🎯 অভিনন্দন! ৮০:২০ সঠিক স্প্লিট এবং নিখুঁত ডেটা থাকার কারণে আপনি বিজয়ী!' : '💡 ডেটা ভাগ ৮০:২০ করে এবং ডেটা কোয়ালিটি ১০০% করে দেখুন কীভাবে রেজাল্ট ম্যাজিকের মতো বাড়ে!'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}