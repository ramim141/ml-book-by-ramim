import React, { useState, useCallback, useMemo } from 'react';
import { Play, RefreshCcw, Compass, Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('simulator'); 
  const [kFolds, setKFolds] = useState(5); 
  const [dataBias, setDataBias] = useState(60); 
  const [modelQuality, setModelQuality] = useState(75); 
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); 
  const [foldScores, setFoldScores] = useState([]); 
  const [logs, setLogs] = useState(['🚦 একাডেমি কন্ট্রোল প্যানেল প্রস্তুত। রোটেশনাল ক্রস-ভ্যালিডেশন রান করতে প্লে করুন।']);
  const [showChallengeAnswer, setShowChallengeAnswer] = useState(false);

  const foldDetails = useMemo(() => [
    { name: 'হাইওয়ে (Pitched Highway)', emoji: '🛣️', baseDiff: 0.95 },
    { name: 'কাদা রাস্তা (Muddy Road)', emoji: '🚜', baseDiff: 0.70 },
    { name: 'পাহাড়ি খাড়া বাঁক (Mountain Pass)', emoji: '⛰️', baseDiff: 0.45 },
    { name: 'বালুময় মরুভূমি (Sandy Desert)', emoji: '🏜️', baseDiff: 0.60 },
    { name: 'কুয়াশাচ্ছন্ন সেতু (Foggy Bridge)', emoji: '🌉', baseDiff: 0.80 },
    { name: 'শহরের জ্যাম (City Grid)', emoji: '🚦', baseDiff: 0.65 },
    { name: 'পাথুরে ট্রেইল (Rocky Trail)', emoji: '🪨', baseDiff: 0.50 },
    { name: 'বরফাবৃত পথ (Icy Highway)', emoji: '❄️', baseDiff: 0.35 },
    { name: 'ঘন জঙ্গল (Forest Track)', emoji: '🌲', baseDiff: 0.75 },
    { name: 'রাতের হাইওয়ে (Night Run)', emoji: '🌌', baseDiff: 0.85 }
  ], []);

  const calculateFoldScore = useCallback((foldIndex) => {
    const detail = foldDetails[foldIndex % foldDetails.length];
    const biasFactor = (dataBias / 100); 
    const modifiedDifficulty = 1 - ((1 - detail.baseDiff) * (0.3 + biasFactor * 1.4));
    const finalDiff = Math.max(0.2, Math.min(1.0, modifiedDifficulty));
    const calculatedScore = modelQuality * finalDiff + (Math.random() * 4 - 2); 
    return Math.max(10, Math.min(100, Math.round(calculatedScore)));
  }, [foldDetails, dataBias, modelQuality]);

  const runCrossValidation = useCallback(() => {
    if (isSimulating) return;

    setIsSimulating(true);
    setCurrentStep(0);
    setFoldScores([]);
    setLogs([`🚀 ${kFolds}-Fold ক্রস-ভ্যালিডেশন শুরু হলো! মোট ডেটা সমান ${kFolds} ভাগে বিভক্ত।`]);

    let step = 0;
    const tempScores = [];

    const interval = setInterval(() => {
      const score = calculateFoldScore(step);
      tempScores.push(score);
      setFoldScores([...tempScores]);
      
      const currentRoad = foldDetails[step % foldDetails.length];
      setLogs(prev => [
        `🔄 রাউন্ড ${step + 1}: ফোল্ড-${step + 1} (${currentRoad.emoji} ${currentRoad.name}) কে Validation সেট বানানো হয়েছে। বাকি ${kFolds - 1}টি ফোল্ড দিয়ে ট্রেন হচ্ছে।`,
        `📈 এই রাউন্ডের ভ্যালিডেশন স্কোর: ${score}%`,
        ...prev
      ]);
      
      step++;
      setCurrentStep(step);

      if (step >= kFolds) {
        clearInterval(interval);
        setIsSimulating(false);
        
        const averageCV = Math.round(tempScores.reduce((a, b) => a + b, 0) / kFolds);
        const maxScore = Math.max(...tempScores);
        const minScore = Math.min(...tempScores);
        
        setLogs(prev => [
          `🏆 পরীক্ষা সম্পন্ন! গড় ক্রস-ভ্যালিডেশন (Average CV) স্কোর: ${averageCV}%`,
          `📊 পরিসংখ্যান: সর্বোচ্চ ভালো ফল = ${maxScore}% (লাকি কন্ডিশন), সর্বনিম্ন ফল = ${minScore}% (কঠিন কন্ডিশন)`,
          `💡 সিদ্ধান্ত: যেকোনো একটি একক পরীক্ষার পরিবর্তে এই ${averageCV}% স্কোরটিই আপনার এআই কারের বাস্তব দক্ষতা নির্দেশ করে।`,
          ...prev
        ]);
      }
    }, 1200); 
  }, [isSimulating, kFolds, foldDetails, calculateFoldScore]);

  const handleReset = useCallback(() => {
    if (isSimulating) return;
    setFoldScores([]);
    setCurrentStep(-1);
    setLogs(['🚦 রিসেট সফল হয়েছে। নতুন ফোল্ড সাইজ বা বায়াস পরিবর্তন করে পরীক্ষা করতে পারেন।']);
  }, [isSimulating]);

  const currentAverage = foldScores.length > 0 
    ? Math.round(foldScores.reduce((a, b) => a + b, 0) / foldScores.length) 
    : 0;

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২৮</span>
          ক্রস-ভ্যালিডেশন (Cross-Validation)
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          ভাগ্যের খেলা এড়াতে ঘুরিয়ে-ফিরিয়ে ডেটা পরীক্ষা করার বৈজ্ঞানিক পদ্ধতি। কোনো বিশেষ ট্র্যাকে তুখোড় ফলাফল করার পরিবর্তে সব রাস্তায় গাড়িটি কতটা পারদর্শী তা এক ক্লিকে যাচাই করুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md mb-8">
          <div className="absolute top-4 right-4 text-emerald-500/30"><Sparkles size={24} /></div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
              <span className="text-emerald-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
              এই ল্যাবে আপনি দেখতে পারবেন কীভাবে ক্রস-ভ্যালিডেশন ব্যবহার করে মডেলের আসল দক্ষতা পরিমাপ করা যায়। এটি শুধুমাত্র একটি স্প্লিটের ওপর নির্ভরশীল থাকার ঝুঁকি দূর করে।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="text-lg">🏎️</span> একাডেমি সিমুলেটর
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      K এর মান পরিবর্তন করে দেখুন কীভাবে ডেটাসেট ভিন্ন ভিন্ন ভাগে ভাগ হয়ে বারবার মডেলের পরীক্ষা নেয় এবং পরিশেষে একটি রিয়েলিস্টিক গড় স্কোর বের করে আনে।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-indigo-500/30 transition-all duration-300">
                  <span className="font-bold text-indigo-400 flex items-center gap-2">
                      <span className="text-lg">📊</span> স্প্লিটিং ম্যাপ
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      কীভাবে ডেটাসেটের প্রতিটি অংশ অন্তত একবার টেস্টিং সেট হিসেবে ব্যবহৃত হয় তার ভিজ্যুয়াল ডায়াগ্রাম এবং থিওরি দেখুন।
                  </p>
              </div>
          </div>
      </div>

      <div className="flex justify-center bg-[#1e2430] p-1.5 rounded-xl border border-gray-700 max-w-md mx-auto w-full gap-2 shadow-lg">
        <button 
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'simulator' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🏎️ একাডেমি সিমুলেটর (CV Arena)
        </button>
        <button 
          onClick={() => setActiveTab('theory')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'theory' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📊 স্প্লিটিং ম্যাপ ও ডায়াগ্রাম
        </button>
      </div>

      {activeTab === 'simulator' && (
        <div className="grid items-stretch grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column: Controlling Parameters */}
          <div className="lg:col-span-4 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between gap-5 shadow-xl">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-emerald-400 border-b border-gray-700 pb-2">
                <Compass size={18} /> একাডেমির ল্যাব কনসোল
              </h3>

              <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800">
                <label className="block mb-2 text-xs font-bold text-gray-300">
                  🎯 ফোল্ডের সংখ্যা (Value of K):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      disabled={isSimulating}
                      onClick={() => setKFolds(num)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                        kFolds === num 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm' 
                          : 'bg-[#1e2430] border-gray-800 text-gray-400 hover:text-white disabled:opacity-50'
                      }`}
                    >
                      K = {num}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                  ডেটা সমান {kFolds} ভাগে বিভক্ত হবে। পরীক্ষা চলবে {kFolds} বার।
                </p>
              </div>

              <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>🏔️ রাস্তার অসমতা (Variance):</span>
                  <span className="font-mono text-xs text-emerald-400">{dataBias}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="10" value={dataBias} 
                  onChange={(e) => setDataBias(parseInt(e.target.value))}
                  disabled={isSimulating} className="w-full cursor-pointer accent-emerald-500 disabled:opacity-50 h-2 bg-gray-700 rounded-lg appearance-none"
                />
              </div>

              <div className="bg-[#12161f] p-4 rounded-xl border border-gray-800">
                <div className="flex justify-between text-xs font-bold mb-2 text-gray-300">
                  <span>🧠 গাড়ির বুদ্ধিমত্তা (Model):</span>
                  <span className="font-mono text-xs text-sky-400">{modelQuality}%</span>
                </div>
                <input 
                  type="range" min="50" max="95" step="5" value={modelQuality} 
                  onChange={(e) => setModelQuality(parseInt(e.target.value))}
                  disabled={isSimulating} className="w-full cursor-pointer accent-sky-500 disabled:opacity-50 h-2 bg-gray-700 rounded-lg appearance-none"
                />
              </div>
            </div>

            <div className="pt-4 space-y-2 border-t border-gray-700">
              <button
                onClick={runCrossValidation}
                disabled={isSimulating}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} /> {isSimulating ? 'ক্রস-ভ্যালিডেশন চলছে...' : 'ক্রস-ভ্যালিডেশন শুরু করুন'}
              </button>
              <button
                onClick={handleReset}
                disabled={isSimulating}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-bold rounded-xl border border-gray-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCcw size={16} /> রিসেট একাডেমি
              </button>
            </div>
          </div>

          {/* Right Column: Rotational Validation Grid Map */}
          <div className="lg:col-span-8 bg-[#1e2430] p-6 rounded-3xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
              <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                🚥 রোটেশনাল ড্রাইভিং গ্রিড
              </span>
              <span className="text-[10px] bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded font-bold">
                K = {kFolds} Folds Active
              </span>
            </div>

            {/* Interactive Rotating Grid */}
            <div className="bg-[#12161f] p-4 rounded-2xl border border-gray-800 overflow-x-auto shadow-inner">
              <div className="min-w-[480px] space-y-3">
                
                <div className="grid grid-cols-12 gap-1.5 text-[10px] text-gray-500 font-bold border-b border-gray-800 pb-2">
                  <div className="col-span-2">পরীক্ষার রাউন্ড</div>
                  <div className="grid col-span-10" style={{ gridTemplateColumns: `repeat(${kFolds}, minmax(0, 1fr))` }}>
                    {Array.from({ length: kFolds }).map((_, fIdx) => (
                      <div key={fIdx} className="text-center truncate" title={foldDetails[fIdx % foldDetails.length].name}>
                        {foldDetails[fIdx % foldDetails.length].emoji} ফোল্ড-{fIdx+1}
                      </div>
                    ))}
                  </div>
                </div>

                {Array.from({ length: kFolds }).map((_, rIdx) => {
                  const isActiveRow = currentStep === rIdx;
                  const isCompletedRow = currentStep > rIdx;
                  
                  return (
                    <div 
                      key={rIdx} 
                      className={`grid grid-cols-12 gap-1.5 items-center p-2 rounded-lg transition-all ${
                        isActiveRow 
                          ? 'bg-emerald-950/30 border-l-4 border-emerald-500 pl-2' 
                          : isCompletedRow 
                            ? 'bg-[#1e2430]/50 border-l-4 border-gray-700 pl-2 opacity-70' 
                            : 'border-l-4 border-transparent pl-2'
                      }`}
                    >
                      <div className="col-span-2 text-[10px] font-mono font-bold text-gray-400 flex items-center gap-1">
                        রাউন্ড {rIdx+1} {isActiveRow && <span className="animate-bounce">🏎️</span>}
                      </div>

                      <div className="col-span-10 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${kFolds}, minmax(0, 1fr))` }}>
                        {Array.from({ length: kFolds }).map((_, fIdx) => {
                          const isValidation = fIdx === rIdx;
                          return (
                            <div 
                              key={fIdx}
                              className={`py-2 rounded-md text-center text-[10px] font-bold transition-all flex flex-col items-center justify-center relative ${
                                isValidation 
                                  ? 'bg-amber-500/20 border border-amber-500 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                                  : 'bg-indigo-950/20 border border-indigo-900/50 text-indigo-400'
                              }`}
                            >
                              <span>{isValidation ? '🧪 Test' : '🛠️ Train'}</span>
                              {isValidation && isActiveRow && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Live Telemetry Console Logs */}
            <div className="bg-[#0b0f19] rounded-xl border border-gray-800 p-4 font-mono text-xs shadow-inner">
              <div className="text-gray-500 mb-2 border-b border-gray-800/60 pb-2 flex justify-between">
                <span>📟 একাডেমি টেলিমেট্রি লগ</span>
                <span className="font-bold text-emerald-500 animate-pulse">{isSimulating ? '• ভ্যালিডেশন সচল' : '• রেডি'}</span>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto text-[10px] custom-scrollbar pr-2">
                {logs.map((log, i) => (
                  <p key={i} className="leading-relaxed text-emerald-400/90">🤖 &gt; {log}</p>
                ))}
              </div>
            </div>

            {/* Cross-Validation Score Analysis Dashcard */}
            {foldScores.length > 0 && (
              <div className="bg-[#12161f] rounded-2xl border border-emerald-500/20 p-5 animate-fade-in space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  📈 ভ্যালিডেশন রাউন্ড পারফরমেন্স
                </h3>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {foldScores.map((score, idx) => (
                    <div key={idx} className="bg-[#1e2430] p-3 rounded-xl border border-gray-800 text-center relative overflow-hidden shadow-inner">
                      <span className="text-[9px] text-gray-500 font-mono block">রাউন্ড {idx+1} ({foldDetails[idx % foldDetails.length].emoji})</span>
                      <p className="mt-1 font-mono text-xl font-extrabold text-amber-400">{score}%</p>
                      <span className="text-[8px] text-gray-400 truncate block mt-0.5">
                        {foldDetails[idx % foldDetails.length].name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
                  <div className="bg-[#1f1616]/40 p-4 rounded-xl border border-red-950/50 flex items-start gap-3">
                    <div className="bg-red-950/40 p-2.5 rounded-lg border border-red-900/30 shrink-0 text-xl">🎲</div>
                    <div>
                      <h4 className="text-xs font-bold text-red-400">সিঙ্গেল স্প্লিট (ভাগ্যের খেলা)</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        আপনি যদি কেবল ১টি পরীক্ষা নিতেন, তবে পাহাড়ি খাড়া বাঁকে (রাউন্ড ৩) গাড়ি চালিয়ে পেতেন মাত্র <strong className="text-red-400">{foldScores[2] || '??'}%</strong> স্কোর। আবার শুধুমাত্র হাইওয়েতে পরীক্ষা নিয়ে বোকার মতো ভাবতেন গাড়িটি <strong className="text-emerald-400">{foldScores[0] || '??'}%</strong> দক্ষ! দুটোই ভুল মূল্যায়ন।
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#111f19]/40 p-4 rounded-xl border border-emerald-950/50 flex items-start gap-3">
                    <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/30 shrink-0 text-xl">🏆</div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-400">ক্রস-ভ্যালিডেশন গড় স্কোর (বাস্তব চিত্র)</h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-mono text-2xl font-extrabold text-emerald-400">{currentAverage}%</span>
                        <span className="text-[10px] text-gray-400 font-medium">নিখুঁত জেনারেলাইজেশন</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        সবগুলো ফোল্ডের ফলাফলের গড় মান নেওয়া হয়েছে। এটিই হচ্ছে গাড়িটির বাস্তব ও নিরপেক্ষ ড্রাইভিং যোগ্যতা।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

        {/* ==================== TAB 2: DETAILED DATA SPLITTING MAP ==================== */}
        {activeTab === 'theory' && (
          <div className="lg:col-span-12 space-y-6 bg-[#1e2430] p-8 rounded-3xl border border-gray-700 shadow-xl animate-fade-in text-sm">
            <h3 className="flex items-center gap-2 mb-2 text-lg font-bold text-white border-b border-gray-700 pb-3">
              📊 K-Fold ক্রস-ভ্যালিডেশন মানচিত্র
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              K-Fold ক্রস-ভ্যালিডেশন এ আমরা কোনো ডাটা ফেলে দিই না, বরং পুরো তথ্যকে সমান ভাগে ভাগ করে আবর্তনশীলভাবে ট্রেনিং ও ভ্যালিডেশন চালাই।
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">১. ফোল্ড কী? (Folds)</span>
                    <span className="bg-indigo-950 text-indigo-400 px-2 py-1 rounded font-mono text-[10px] font-bold">K সমান অংশ</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-xs mb-4">
                    ক্রস-ভ্যালিডেশন শুরুতেই পুরো ডেটাসেটকে সমান K সংখ্যক উপাদানে বা ব্লকে ভাগ করে নেয়। K=৫ হলে ডেটা ৫ ভাগে ভাগ হয়। একেকটি ভাগকে বলা হয় "ফোল্ড (Fold)"।
                  </p>
                </div>
                <div className="border-t border-gray-800/80 pt-3 text-[11px] text-indigo-400 italic font-mono">
                  উপমা: একটি মোটা বই ৫টি ভিন্ন অধ্যায়ে ভাগ করার মতো।
                </div>
              </div>

              <div className="bg-[#12161f] p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">২. আবর্তন বা পরীক্ষা</span>
                    <span className="bg-amber-950 text-amber-400 px-2 py-1 rounded font-mono text-[10px] font-bold">K বার পুনরাবৃত্তি</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-xs mb-4">
                    আমরা K বার মডেলটি আলাদা করে স্ক্র্যাচ থেকে ডিজাইন বা রি-ট্রেন করি। প্রতিবার একটি ভিন্ন ফোল্ডকে Validation (পরীক্ষা) ও বাকি সব ফোল্ডকে Training (পড়ালেখা) হিসেবে ব্যবহার করা হয়।
                  </p>
                </div>
                <div className="border-t border-gray-800/80 pt-3 text-[11px] text-amber-400 italic font-mono">
                  উপমা: রোটেশনাল গ্রুপ স্টাডি ও পালাবদল পরীক্ষা।
                </div>
              </div>

              <div className="bg-[#12161f] p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">৩. গড় হিসাব</span>
                    <span className="bg-emerald-950 text-emerald-400 px-2 py-1 rounded font-mono text-[10px] font-bold">চুড়ান্ত জাজমেন্ট</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-xs mb-4">
                    সবগুলো রান সম্পন্ন হওয়ার পর, প্রতিটি রান থেকে পাওয়া স্কোরের গড় বের করা হয়। এই গড় ফলটিই এআই সিস্টেমের প্রকৃত ক্ষমতা নির্দেশ করে। এটি একক কোনো ট্র্যাকের খামখেয়ালিপনা মুক্ত।
                  </p>
                </div>
                <div className="border-t border-gray-800/80 pt-3 text-[11px] text-emerald-400 italic font-mono">
                  উপমা: ৫ জন নিরপেক্ষ রেফারির সম্মিলিত স্কোর।
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 text-gray-400 border border-gray-700 bg-slate-800/40 rounded-xl mt-6 shadow-inner">
              <span className="text-lg">⚠️</span>
              <p className="text-xs leading-relaxed">
                <strong>মনে রাখার বিষয়:</strong> ভ্যালিডেশন ল্যাপের ওপর ভিত্তি করে গাড়ির সমস্ত সেটিংস সংশোধন বা টিউনিং করা যাবে। কিন্তু টেস্টিং ট্র্যাক বা ফাইনাল রেস একবার হয়ে গেলে এর ওপর ভিত্তি করে আর কোনো প্যারামিটার সংশোধন করা যাবে না। যদি টেস্টিং দেখে আপনি ভুল সংশোধন করেন, তবে সেটি আর নিরপেক্ষ পরীক্ষা থাকবে না—তাকে বলা হয় <strong>ডেটা লিকেজ (Data Leakage)</strong>!
              </p>
            </div>
          </div>
        )}

    </div>
  );
}