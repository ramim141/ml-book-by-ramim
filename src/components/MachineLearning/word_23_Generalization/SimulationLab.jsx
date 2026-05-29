import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [strategy, setStrategy] = useState('generalize'); 
  const [examState, setExamState] = useState('idle'); 
  const [knownScore, setKnownScore] = useState(0);
  const [unseenScore, setUnseenScore] = useState(0);
  const [walkthroughMsg, setWalkthroughMsg] = useState("শুরু করতে বাম পাশের প্যানেল থেকে যেকোনো একটি স্টাডি স্ট্র্যাটেজি সিলেক্ট করে 'ট্রেনিং ও পরীক্ষা শুরু করুন' বাটনে চাপ দিন।");

  const strategySpecs = {
    underfit: {
      label: "অলস শিক্ষার্থী (Underfitting)",
      studyAction: "বই স্পর্শই করেনি! 💤",
      desc: "মডেলটি অত্যন্ত অলস বা সরল। সে ট্রেইনিং ডেটা থেকে কোনো প্যাটার্নই শিখতে পারেনি।"
    },
    overfit: {
      label: "মুখস্থবিদ শিক্ষার্থী (Overfitting)",
      studyAction: "বিগত বছরের প্রশ্নব্যাংক সম্পূর্ণ মুখস্থ করেছে! 🧠📖",
      desc: "মডেলটি ডেটা বোঝার বদলে পুরো মুখস্থ করে ফেলেছে। চেনা প্রশ্নে ১০০ পেলেও নতুন প্রশ্নে সে সম্পূর্ণ ব্যর্থ!"
    },
    generalize: {
      label: "স্মার্ট শিক্ষার্থী (Generalized)",
      studyAction: "গভীরভাবে মূল সূত্র ও কনসেপ্ট বুঝে পড়েছে! 💡✨",
      desc: "আদর্শমডেল! সে ডেটার ভেতরের মূল নিয়মটি শিখেছে। তাই পরিচিত ও অপরিচিত যেকোনো নতুন ডেটাতেই সে দারুণ পারফর্ম করে।"
    }
  };

  const runExamSimulation = () => {
    setExamState('studying');
    setKnownScore(0);
    setUnseenScore(0);
    setWalkthroughMsg(`📖 ধাপ ১: এআই মডলটি নির্বাচিত "${strategySpecs[strategy].label}" পলিসি অনুযায়ী ট্রেনিং ডেটা প্রসেস করে পড়াশোনা করছে...`);

    setTimeout(() => {
      setExamState('exam_known');
      setWalkthroughMsg(`📝 ধাপ ২: চেনা তথ্যের পরীক্ষা (Training Exam)। হুবহু ক্লাসের অনুশীলনীর প্রশ্ন দেওয়া হয়েছে। মডেলটি উত্তর মেলাচ্ছে...`);
      const targetKnown = strategy === 'underfit' ? 30 : strategy === 'overfit' ? 100 : 88;
      let currentK = 0;
      const kInterval = setInterval(() => {
        if (currentK >= targetKnown) clearInterval(kInterval);
        else { currentK += 2; setKnownScore(Math.min(targetKnown, currentK)); }
      }, 15);
    }, 2000);

    setTimeout(() => {
      setExamState('exam_new');
      setWalkthroughMsg(`❓ ধাপ ৩: নতুন ও অপরিচিত তথ্যের পরীক্ষা (Testing on Unseen Data)। সম্পূর্ণ ঘুরিয়ে দেওয়া সৃজনশীল প্রশ্ন হাজির করা হয়েছে!`);
      const targetUnseen = strategy === 'underfit' ? 25 : strategy === 'overfit' ? 18 : 85;
      let currentU = 0;
      const uInterval = setInterval(() => {
        if (currentU >= targetUnseen) clearInterval(uInterval);
        else { currentU += 2; setUnseenScore(Math.min(targetUnseen, currentU)); }
      }, 15);
    }, 4500);

    setTimeout(() => {
      setExamState('results');
      if (strategy === 'underfit') setWalkthroughMsg(`❌ আন্ডারফিটিং বিশ্লেষণ: মডেলটি অলস হওয়ার কারণে চেনা ও অচেনা দুই পরীক্ষাতেই ফেল করেছে। এআই-এর ক্যাপাসিটি বৃদ্ধি করতে হবে।`);
      else if (strategy === 'overfit') setWalkthroughMsg(`⚠️ ওভারফিটিং বিশ্লেষণ: ચেনা প্রশ্নে ১০০ পেলেও নতুন ক্রিয়েটিভ প্রশ্নে সে মাত্র ১৮ পেয়েছে! এটিই হলো মুখস্থ করার বা অতিরিক্ত ফিট হয়ে যাওয়ার মাশুল।`);
      else setWalkthroughMsg(`🎯 জেনারেলাইজেশন সফল! পরিচিত প্রশ্নে ৮৮% এবং নতুন সৃজনশীল প্রশ্নে ৮৫%! মডেলটি চমৎকার জেনারেল জ্ঞান অর্জন করেছে। এটাই এআই-এর পরম আকাঙ্ক্ষা!`);
    }, 7000);
  };

  const handleReset = () => {
    setExamState('idle');
    setKnownScore(0);
    setUnseenScore(0);
    setWalkthroughMsg("শুরু করতে বাম পাশের প্যানেল থেকে যেকোনো একটি স্টাডি স্ট্র্যাটেজি সিলেক্ট করে 'ট্রেনিং ও পরীক্ষা শুরু করুন' বাটনে চাপ দিন।");
  };

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২৩</span>
          এআই স্টুডেন্ট অ্যারেনা
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          মডেলের পরিচিত ডাটার সীমানা পেরিয়ে সম্পূর্ণ নতুন এবং অপরিচিত পরিস্থিতিতে সঠিক ও সুসংগত সিদ্ধান্ত নেওয়ার দক্ষতাই হলো জেনারেলাইজেশন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
          <div className="absolute top-4 right-4 text-indigo-500/30"><Sparkles size={24} /></div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
              <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
              এই ল্যাবে আপনি একজন এআই স্টুডেন্টকে ভিন্ন ভিন্ন পলিসিতে পড়িয়ে পরীক্ষা করে দেখতে পারবেন সে নতুন পরিস্থিতিতে (Unseen Data) কেমন পারফর্ম করে।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm">
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-amber-500/30 transition-all duration-300">
                  <span className="font-bold text-amber-400 flex items-center gap-2">
                      <span className="text-lg">🥚</span> আন্ডারফিটিং (অলস)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      মডেলটি ট্রেইনিং ডেটা থেকেই কিছু শেখেনি। ফলে সে চেনা (Training) এবং নতুন (Testing) উভয় পরীক্ষাতেই চরমভাবে ব্যর্থ হয়।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-rose-500/30 transition-all duration-300">
                  <span className="font-bold text-rose-400 flex items-center gap-2">
                      <span className="text-lg">🧠</span> ওভারফিটিং (মুখস্থবিদ)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      মডেলটি ডেটা অন্ধের মতো মুখস্থ করে ফেলে। চেনা প্রশ্নে সে ১০০ পেলেও নতুন বা সৃজনশীল প্রশ্নে সে সম্পূর্ণ অসহায় হয়ে যায়।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="text-lg">✨</span> জেনারেলাইজেশন (স্মার্ট)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      মডেলটি ডেটার মূল কনসেপ্ট বুঝতে পেরেছে। তাই সে চেনা ডেটার পাশাপাশি সম্পূর্ণ নতুন ডেটা আসলেও অত্যন্ত দারুণ পারফর্ম করে।
                  </p>
              </div>
          </div>
      </div>

      <div className="bg-[#0b111b] border border-white/5 p-5 md:p-6 rounded-[2.5rem] flex items-start gap-4 z-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
        <span className="text-2xl animate-bounce relative z-10">💡</span>
        <div className="text-left relative z-10">
          <span className="font-bold text-indigo-400 block text-sm md:text-base mb-1">অ্যাক্টিভ এআই লার্নিং ওয়াকথ্রু:</span>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">{walkthroughMsg}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10">
        
        {/* COLUMN 1: STRATEGY SELECTOR */}
        <div className="lg:col-span-4 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base md:text-lg font-bold text-indigo-400 mb-4 border-b border-white/10 pb-3 flex justify-between items-center">
              <span>১. পড়াশোনার পলিসি</span>
            </h3>

            <div className="space-y-4">
              {[
                { id: 'underfit', label: '🥚 আন্ডারফিটিং (Underfit)', desc: 'ফাঁকিবাজ! পড়াশোনা করেনি বললেই চলে।' },
                { id: 'overfit', label: '🧠 ওভারফিটিং (Overfit)', desc: 'বিগত প্রশ্নব্যাংক অন্ধের মতো মুখস্থ করেছে!' },
                { id: 'generalize', label: '✨ জেনারেলাইজেশন (Good Fit)', desc: 'মূল তত্ত্ব ও গাণিতিক কনসেপ্ট বুঝে পড়েছে।' }
              ].map(item => (
                <button
                  key={item.id}
                  disabled={examState !== 'idle' && examState !== 'results'}
                  onClick={() => { setStrategy(item.id); handleReset(); }}
                  className={`w-full p-4 md:p-5 rounded-2xl border text-sm md:text-base font-bold text-left flex flex-col transition-all active:scale-95 ${
                    strategy === item.id 
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-300'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-xs md:text-sm font-normal text-slate-500 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <button
              onClick={runExamSimulation}
              disabled={examState !== 'idle' && examState !== 'results'}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm md:text-base transition-transform active:scale-95 shadow-lg disabled:opacity-40"
            >
              {examState === 'studying' ? '📖 পড়াশোনা চলছে...' : '📝 ট্রেনিং ও পরীক্ষা শুরু করুন'}
            </button>
            {(examState !== 'idle' && examState !== 'studying') && (
              <button
                onClick={handleReset}
                disabled={examState === 'exam_known' || examState === 'exam_new'}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-sm md:text-base font-bold text-slate-300 rounded-xl transition-colors disabled:opacity-40"
              >
                রিসেট করুন 🔄
              </button>
            )}
          </div>
        </div>

        {/* COLUMN 2: THE EXAM CLASSROOM */}
        <div className="lg:col-span-4 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden">
          <div className="w-full relative z-10">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base md:text-lg font-bold text-white tracking-wider">২. নিউরাল ব্রেন অ্যানিমেশন</h3>
            </div>
          </div>

          <div className="w-full bg-[#030712] p-6 md:p-8 rounded-2xl border border-white/5 h-56 md:h-64 relative overflow-hidden flex flex-col justify-center items-center shadow-inner z-10">
            
            {examState === 'idle' && (
              <div className="space-y-4 text-slate-600">
                <span className="text-7xl block animate-pulse">🎓</span>
                <p className="text-sm md:text-base font-bold text-slate-400">পরীক্ষার হল প্রস্তুত!</p>
              </div>
            )}

            {examState === 'studying' && (
              <div className="space-y-5 text-amber-400">
                <span className="text-7xl block animate-bounce">📖💡</span>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-xl">Training neural weights...</p>
              </div>
            )}

            {(examState === 'exam_known' || examState === 'exam_new') && (
              <div className="space-y-5 w-full">
                <div className="flex gap-5 justify-center items-center">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping"></div>
                  <span className="text-7xl">✍️🧠</span>
                  <div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping"></div>
                </div>
                <p className="text-sm md:text-base text-indigo-400 font-bold bg-indigo-500/10 px-4 py-2 rounded-xl inline-block">
                  {examState === 'exam_known' ? '📝 চেনা প্রশ্ন স্ক্যান হচ্ছে' : '❓ নতুন প্রশ্ন স্ক্যান হচ্ছে'}
                </p>
              </div>
            )}

            {examState === 'results' && (
              <div className="space-y-5 animate-fade-in">
                <span className="text-8xl block">
                  {strategy === 'generalize' ? '🏆👑' : strategy === 'overfit' ? '🤦‍♂️💔' : '🥱💤'}
                </span>
                <h4 className={`text-base md:text-lg font-black ${strategy === 'generalize' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {strategy === 'generalize' ? 'মহাবিপ্লব! জেনারেলাইজেশন সফল!' : strategy === 'overfit' ? 'ওভারফিটিং ট্র্যাজেডি!' : 'আন্ডারফিটিং ফেইলিউর!'}
                </h4>
              </div>
            )}
          </div>

          <div className="w-full mt-6 bg-white/5 p-5 md:p-6 rounded-2xl border border-white/10 grid grid-cols-2 gap-4 text-center text-sm font-mono z-10">
            <div className="border-r border-white/10 pr-2">
              <span className="text-slate-400 block mb-2 text-xs md:text-sm">চেনা প্রশ্ন (Training):</span>
              <span className="text-2xl font-bold text-white">{knownScore}%</span>
              <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all" style={{ width: `${knownScore}%` }}></div>
              </div>
            </div>
            <div className="pl-2">
              <span className="text-slate-400 block mb-2 text-xs md:text-sm">নতুন প্রশ্ন (Testing):</span>
              <span className={`text-2xl font-bold ${strategy === 'overfit' && examState === 'results' ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{unseenScore}%</span>
              <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${unseenScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: SWEET SPOT PLOT */}
        <div className="lg:col-span-4 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base md:text-lg font-bold text-white tracking-wider">৩. এআই-এর সুইট স্পট গ্রাফ</h3>
            </div>

            <div className="bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 flex items-center justify-center h-56 md:h-64 relative shadow-inner mt-6">
              <svg viewBox="0 0 200 120" className="w-full h-full">
                <line x1="20" y1="10" x2="20" y2="105" stroke="#475569" strokeWidth="1.5" />
                <line x1="20" y1="105" x2="190" y2="105" stroke="#475569" strokeWidth="1.5" />
                
                <text x="145" y="115" fill="#94a3b8" fontSize="6">Capacity ➔</text>
                <text x="5" y="15" fill="#94a3b8" fontSize="6" transform="rotate(-90, 5, 15)">Error ➔</text>

                {/* Train Error */}
                <path d="M 30,20 Q 90,80 180,95" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                <text x="140" y="80" fill="#6366f1" fontSize="5" fontWeight="bold">Train Error</text>

                {/* Test Error */}
                <path d="M 30,45 Q 100,5 180,90" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="135" y="35" fill="#f43f5e" fontSize="5" fontWeight="bold">Test Error</text>

                <g>
                  <line x1="96" y1="15" x2="96" y2="105" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2,2" />
                  <circle cx="96" cy="31" r="3.5" fill="#10b981" />
                  <text x="100" y="24" fill="#10b981" fontSize="6" fontWeight="bold">Sweet Spot</text>
                  
                  {strategy === 'underfit' && (
                    <g>
                      <circle cx="45" cy="41" r="5" fill="#eab308" />
                      <text x="45" y="52" fill="#eab308" fontSize="5" fontWeight="bold" textAnchor="middle">Underfit</text>
                    </g>
                  )}
                  {strategy === 'overfit' && (
                    <g>
                      <circle cx="165" cy="74" r="5" fill="#ef4444" />
                      <text x="165" y="65" fill="#ef4444" fontSize="5" fontWeight="bold" textAnchor="middle">Overfit</text>
                    </g>
                  )}
                  {strategy === 'generalize' && (
                    <g>
                      <circle cx="96" cy="31" r="5.5" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
                      <text x="96" y="44" fill="#10b981" fontSize="5" fontWeight="bold" textAnchor="middle">Generalized ✨</text>
                    </g>
                  )}
                </g>
              </svg>
            </div>
          </div>

          <div className="bg-white/5 p-5 md:p-6 rounded-2xl border border-white/10 text-xs md:text-sm text-slate-300 leading-relaxed text-center mt-6 z-10">
            <strong>গাণিতিক সত্য:</strong> ট্রেনিং এরর এবং টেস্ট এররের মধ্যকার ভারসাম্যপূর্ণ মিলনস্থলই হলো জেনারেলাইজেশনের আলটিমেট সুইট স্পট।
          </div>
        </div>

      </div>
    </div>
  );
}