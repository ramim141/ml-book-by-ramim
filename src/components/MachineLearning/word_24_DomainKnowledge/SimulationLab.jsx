import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function SimulationLab() {
  const [domain, setDomain] = useState('medical');
  const [expertMode, setExpertMode] = useState(false);
  const [examState, setExamState] = useState('idle'); // 'idle', 'reading_data', 'applying_math', 'expert_review', 'completed'
  const [confidence, setConfidence] = useState(0);
  const [walkthroughMsg, setWalkthroughMsg] = useState("শুরু করতে বাম পাশের প্যানেল থেকে একটি ডোমেন বেছে নিন এবং 'সিমুলেশন রান করুন' বাটনে চাপ দিন।");

  const domains = {
    medical: {
      title: "মেডিকেল ডায়াগনোসিস",
      dataPoint: "রক্তচাপ: ১৪০/৯০ mmHg, বয়স: ৭০",
      aiProcess: "ডাটাবেজ চেক: হাইপারটেনশনের হিস্ট্রি নেই। গাণিতিক ঝুঁকি: লো (Low)।",
      aiError: "এআই সিদ্ধান্ত: রোগী সম্পূর্ণ নিরাপদ (Stable)।",
      expertInsight: "ডোমেন নলেজ: ৭০ বছর বয়সে ১৪০/৯০ রক্তচাপ মানে এটি আর্টেরিওস্ক্লেরোসিস এবং হার্ট ফেইলিউরের ঝুঁকিপূর্ণ সংকেত! অবিলম্বে কার্ডিওলজিস্টের পরামর্শ জরুরি।",
      icon: "🩺"
    },
    finance: {
      title: "স্টক মার্কেট ফোরকাস্টিং",
      dataPoint: "শেয়ারের দাম: গত ৬ মাসে ১০% বেড়েছে।",
      aiProcess: "অ্যালগরিদম: পজিটিভ ট্রেন্ড রিগ্রেশন মডেল। ট্রেন্ড ভেক্টর: আপওয়ার্ড (Upward)।",
      aiError: "এআই সিদ্ধান্ত: বাই (Buy) করার পরামর্শ।",
      expertInsight: "ডোমেন নলেজ: এই ১০% বৃদ্ধি মূলত কৃত্রিম অডিট কারচুপির ফলাফল। অর্থনীতিবিদ জানেন, শীঘ্রই কোম্পানিটির বড় আর্থিক ধস ঘটবে। তাই এটি এখন বিক্রির সময়!",
      icon: "📈"
    },
    engineering: {
      title: "স্ট্রাকচারাল ইঞ্জিনিয়ারিং",
      dataPoint: "সেতুর ওপরের স্ট্যাটিক লোড: সহনক্ষমতার মধ্যে।",
      aiProcess: "ফিজিক্স সিমুলেশন: স্ট্যাটিক লোড টেস্ট পজিটিভ। কোনো ফাটল নেই।",
      aiError: "এআই সিদ্ধান্ত: সেতুটি সম্পূর্ণ নিরাপদ।",
      expertInsight: "ডোমেন নলেজ: ইঞ্জিনিয়ার জানেন এই নির্দিষ্ট অ্যালয় (Alloy) উচ্চ তাপমাত্রায় ধাতব ক্লান্তিতে (Fatigue) ভোগে। বর্তমানে তাপমাত্রা যা, তাতে সেতুর ভেতরে অদৃশ্য ফাটল তৈরি হওয়া অনিবার্য!",
      icon: "🏗️"
    }
  };

  const runSimulation = () => {
    setExamState('reading_data');
    setConfidence(0);
    setWalkthroughMsg(`🔍 ধাপ ১: এআই সেন্সরগুলো থেকে ইনপুট ডাটা "${domains[domain].dataPoint}" গ্রহণ করছে...`);

    setTimeout(() => {
      setExamState('applying_math');
      setWalkthroughMsg(`🧮 ধাপ ২: বিশুদ্ধ গাণিতিক অ্যালগরিদম প্রয়োগ করা হচ্ছে। এআই প্যাটার্ন খুঁজছে...`);
      setConfidence(35);
    }, 2000);

    setTimeout(() => {
      if (expertMode) {
        setExamState('expert_review');
        setWalkthroughMsg(`👨‍⚕️ ধাপ ৩: ডোমেন নলেজ ফিল্টার সক্রিয়! এআই-এর গাণিতিক সিদ্ধান্তকে বাস্তবের নিয়মে যাচাই করা হচ্ছে...`);
        setConfidence(70);
        
        setTimeout(() => {
          setExamState('completed');
          setWalkthroughMsg(`🎯 সিমুলেশন শেষ! এক্সপার্ট নলেজ প্রয়োগ করে এআই একটি বাস্তবসম্মত এবং শতভাগ নিরাপদ সিদ্ধান্ত নিয়েছে।`);
          setConfidence(98);
        }, 2500);
      } else {
        setExamState('completed');
        setWalkthroughMsg(`⚠️ সিমুলেশন শেষ! ডোমেন নলেজ না থাকায় এআই কেবল গাণিতিক প্যাটার্ন দেখে ভুল এবং অত্যন্ত ঝুঁকিপূর্ণ সিদ্ধান্ত নিয়েছে!`);
        setConfidence(35);
      }
    }, 4500);
  };

  const handleReset = () => {
    setExamState('idle');
    setConfidence(0);
    setWalkthroughMsg("শুরু করতে বাম পাশের প্যানেল থেকে একটি ডোমেন বেছে নিন এবং 'সিমুলেশন রান করুন' বাটনে চাপ দিন।");
  };

  return (
    <div className="w-full font-sans text-slate-200 space-y-8">
      
      <div className="text-center space-y-3 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
          <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২৪</span>
          এআই বনাম হিউম্যান এক্সপার্ট
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          গাণিতিক বুদ্ধির সাথে বাস্তব অভিজ্ঞতার (Domain Knowledge) যোগসূত্র কতটা জরুরি, তা নিচে পরীক্ষা করে দেখুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
          <div className="absolute top-4 right-4 text-indigo-500/30"><Sparkles size={24} /></div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
              <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
              এই ল্যাবে আপনি দেখতে পারবেন শুধুমাত্র গাণিতিক অ্যালগরিদম কীভাবে বিপজ্জনক সিদ্ধান্ত নিতে পারে এবং কেন রিয়েল-ওয়ার্ল্ড ডোমেন নলেজ (Domain Knowledge) প্রয়োগ করা জরুরি।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-rose-500/30 transition-all duration-300">
                  <span className="font-bold text-rose-400 flex items-center gap-2">
                      <span className="text-lg">🤖</span> ডোমেন নলেজ ছাড়া (বিশুদ্ধ অ্যালগরিদম)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      এআই শুধুমাত্র ডেটার গাণিতিক প্যাটার্ন দেখে। ফলে রিয়েল-ওয়ার্ল্ড কন্টেক্সট না বুঝার কারণে সে সম্পূর্ণ ভুল এবং অত্যন্ত ঝুঁকিপূর্ণ সিদ্ধান্ত নিয়ে ফেলে।
                  </p>
              </div>
              <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                  <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <span className="text-lg">👨‍⚕️</span> ডোমেন নলেজ সহ (এক্সপার্ট মোড)
                  </span>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      এআই তার গাণিতিক ফলাফলের সাথে একজন হিউম্যান এক্সপার্টের রিয়েল-ওয়ার্ল্ড অভিজ্ঞতা যুক্ত করে। ফলে সিদ্ধান্ত হয় শতভাগ নিরাপদ এবং বাস্তবসম্মত।
                  </p>
              </div>
          </div>
      </div>

      {/* Walkthrough panel */}
      <div className="bg-[#0b111b] border border-white/5 p-5 md:p-6 rounded-[2.5rem] flex items-start gap-4 z-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
        <span className="text-2xl animate-bounce relative z-10">💡</span>
        <div className="text-left relative z-10">
          <span className="font-bold text-indigo-400 block text-sm md:text-base mb-1">অ্যাক্টিভ অ্যানালাইসিস ওয়াকথ্রু:</span>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">{walkthroughMsg}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch z-10">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base md:text-lg font-bold text-indigo-400 mb-4 border-b border-white/10 pb-3 flex justify-between items-center">
              <span>১. এআই প্রজেক্ট ডোমেন</span>
            </h3>

            <div className="space-y-3">
              {Object.keys(domains).map(key => (
                <button 
                  key={key}
                  disabled={examState !== 'idle' && examState !== 'completed'}
                  onClick={() => { setDomain(key); handleReset(); }}
                  className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 ${
                    domain === key 
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 shadow-md' 
                      : 'bg-[#12161f] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <span className="text-2xl">{domains[key].icon}</span>
                  <span className="font-bold text-sm">{domains[key].title}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="flex items-center justify-between p-4 rounded-2xl cursor-pointer bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                <span className="text-sm font-bold text-slate-300 group-hover:text-white flex items-center gap-2">🎓 ডোমেন নলেজ (Expert Mode)</span>
                <input 
                  type="checkbox" 
                  checked={expertMode} 
                  disabled={examState !== 'idle' && examState !== 'completed'}
                  onChange={(e) => { setExpertMode(e.target.checked); handleReset(); }} 
                  className="w-5 h-5 accent-indigo-500 cursor-pointer disabled:opacity-50" 
                />
              </label>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <button 
              onClick={runSimulation}
              disabled={examState !== 'idle' && examState !== 'completed'}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm md:text-base transition-transform active:scale-95 shadow-lg disabled:opacity-40"
            >
              {examState === 'idle' || examState === 'completed' ? '▶️ সিমুলেশন রান করুন' : 'বিশ্লেষণ চলছে...'}
            </button>
            {(examState !== 'idle' && examState !== 'reading_data' && examState !== 'applying_math' && examState !== 'expert_review') && (
              <button
                onClick={handleReset}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-sm md:text-base font-bold text-slate-300 rounded-xl transition-colors disabled:opacity-40"
              >
                রিসেট করুন 🔄
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Simulation Area */}
        <div className="lg:col-span-8 bg-[#0b111b] p-6 md:p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden">
          <div className="w-full relative z-10">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base md:text-lg font-bold text-white tracking-wider">২. লাইভ মডেল অ্যানালাইসিস</h3>
            </div>
          </div>

          {/* Brain Animation Area */}
          <div className="w-full bg-[#030712] p-6 md:p-8 rounded-2xl border border-white/5 h-56 md:h-64 relative overflow-hidden flex flex-col justify-center items-center shadow-inner z-10">
             {examState === 'idle' && (
              <div className="space-y-4 text-slate-600">
                <span className="text-7xl block animate-pulse">⚙️</span>
                <p className="text-sm md:text-base font-bold text-slate-400">এআই সিস্টেম স্ট্যান্ডবাই মোডে আছে...</p>
              </div>
            )}
            {examState === 'reading_data' && (
              <div className="space-y-5 text-indigo-400">
                <span className="text-7xl block animate-bounce">📡</span>
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">{domains[domain].dataPoint}</p>
              </div>
            )}
            {examState === 'applying_math' && (
              <div className="space-y-5 w-full">
                <div className="flex gap-5 justify-center items-center text-amber-400">
                  <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping"></div>
                  <span className="text-7xl">🧮</span>
                  <div className="w-4 h-4 rounded-full bg-amber-500 animate-ping"></div>
                </div>
                <p className="text-xs md:text-sm text-amber-400 font-bold bg-amber-500/10 px-4 py-2 rounded-xl inline-block border border-amber-500/20">
                  {domains[domain].aiProcess}
                </p>
              </div>
            )}
            {examState === 'expert_review' && (
              <div className="space-y-5 w-full">
                 <div className="flex justify-center text-emerald-400">
                   <span className="text-7xl animate-pulse">👨‍⚕️</span>
                 </div>
                 <p className="text-xs md:text-sm text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl inline-block border border-emerald-500/20 animate-pulse">
                   Warning! Applying Contextual Domain Rules...
                 </p>
              </div>
            )}
            {examState === 'completed' && (
              <div className="space-y-5 animate-fade-in text-center">
                <span className="text-7xl block">
                  {expertMode ? '✅' : '❌'}
                </span>
                <h4 className={`text-base md:text-lg font-black ${expertMode ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {expertMode ? "সঠিক ও নিরাপদ সিদ্ধান্ত!" : "ভুল ও বিপজ্জনক সিদ্ধান্ত!"}
                </h4>
              </div>
            )}
          </div>

          <div className="w-full mt-6 space-y-4 text-left z-10">
            <div className="flex justify-between text-xs font-mono text-gray-400 mb-2 font-bold px-2">
              <span>এআই এক্যুরেসি কনফিডেন্স:</span>
              <span className={examState === 'completed' && expertMode ? 'text-emerald-400' : (examState === 'completed' ? 'text-rose-400' : 'text-indigo-400')}>{confidence}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${examState === 'completed' && expertMode ? 'bg-emerald-500' : (examState === 'completed' ? 'bg-rose-500' : 'bg-indigo-500')}`} 
                style={{ width: `${confidence}%` }}
              ></div>
            </div>

            {examState === 'completed' && (
              <div className={`mt-6 p-5 rounded-2xl border animate-fade-in shadow-lg ${expertMode ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
                <span className={`text-[11px] font-bold uppercase tracking-widest block mb-2 ${expertMode ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {expertMode ? "👨‍⚕️ বিশেষজ্ঞ মতামত (ডোমেন নলেজ সক্রিয়):" : "🤖 এআই বিশ্লেষণ (ডোমেন নলেজহীন):"}
                </span>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed font-serif italic">
                  {expertMode ? domains[domain].expertInsight : domains[domain].aiError}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}