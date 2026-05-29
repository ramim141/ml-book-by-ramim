import React, { useState } from 'react';

export default function SimulationLab() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [feedback, setFeedback] = useState(null);
  const [showLogbook, setShowLogbook] = useState(false);
  const [activeVenn, setActiveVenn] = useState('AI');

  const scenarios = [
    {
      id: 1,
      title: "শপিং মলের স্বয়ংক্রিয় দরজা",
      description: "আপনি শপিং মলের দরজার সামনে গেলে মোশন সেন্সরের সাহায্যে দরজাটি আপনাআপনি খুলে যায়।",
      isAI: false,
      explanation: "এটি সাধারণ সেন্সর এবং রুল-বেজড প্রোগ্রাম। এতে কোনো লার্নিং বা বুদ্ধিমত্তা নেই, সেন্সর সিগন্যাল পেলেই শুধু মোটর চালু হয়।"
    },
    {
      id: 2,
      title: "ইউটিউবের ভিডিও রেকমেন্ডেশন",
      description: "আপনি একটি কোডিং ভিডিও দেখার পর, ইউটিউব নিজে থেকেই আপনাকে আরও উন্নত কোডিং টিউটোরিয়াল সাজেস্ট করছে।",
      isAI: true,
      explanation: "এটি এআই। কারণ এটি আপনার দেখার অভ্যাস বিশ্লেষণ করে নিজে থেকে সিদ্ধান্ত নিয়েছে আপনার কী পছন্দ হতে পারে।"
    },
    {
      id: 3,
      title: "সায়েন্টিফিক ক্যালকুলেটর",
      description: "আপনি 250 x 874 টাইপ করলেন, এবং ক্যালকুলেটর মুহূর্তের মধ্যে সঠিক উত্তর (218500) দিয়ে দিল।",
      isAI: false,
      explanation: "এটি সাধারণ প্রোগ্রামিং। ক্যালকুলেটর শুধু সেট করা গাণিতিক সূত্র অনুসরণ করে, এটি নিজে থেকে কোনো নতুন গাণিতিক সূত্র আবিষ্কার করে না বা পরিস্থিতি বোঝে না।"
    },
    {
      id: 4,
      title: "স্মার্টফোনের ফেস আনলক",
      description: "আপনি চোখে চশমা পরার পরও ফোন আপনার চেহারা স্ক্যান করে আনলক হয়ে গেল।",
      isAI: true,
      explanation: "এটি এআই (কম্পিউটার ভিশন)। এটি স্থির ছবি মেলায় না, বরং চেহারার প্যাটার্ন শিখে নতুন পরিস্থিতিতেও আপনাকে চিনতে পারে।"
    }
  ];

  const handleGuess = (guessIsAI) => {
    const isCorrect = guessIsAI === scenarios[currentScenario].isAI;
    
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setFeedback({ type: 'success', text: `সঠিক উত্তর! 🎯 ${scenarios[currentScenario].explanation}` });
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setFeedback({ type: 'error', text: `ভুল হয়েছে! ❌ ${scenarios[currentScenario].explanation}` });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentScenario < scenarios.length - 1) {
        setCurrentScenario(prev => prev + 1);
      } else {
        setShowLogbook(true);
      }
    }, 4000);
  };

  const restartQuiz = () => {
    setCurrentScenario(0);
    setScore({ correct: 0, wrong: 0 });
    setShowLogbook(false);
  };

  const vennDescriptions = {
    AI: {
      title: "কৃত্রিম বুদ্ধিমত্তা (Artificial Intelligence)",
      color: "text-[#a5b4fc]",
      bgColor: "bg-[#4f46e5]/10 border-[#4f46e5]/20",
      desc: "এটি হলো আমাদের চূড়ান্ত লক্ষ্য বা 'ছাতা'। এর উদ্দেশ্য হলো কম্পিউটারকে এমনভাবে প্রোগ্রাম করা যেন সে মানুষের মতো চিন্তা করতে, শিখতে এবং সমস্যার সমাধান করতে পারে।"
    },
    ML: {
      title: "মেশিন লার্নিং (Machine Learning)",
      color: "text-[#d8b4fe]",
      bgColor: "bg-[#9333ea]/10 border-[#9333ea]/20",
      desc: "এআই অর্জনের সবথেকে আধুনিক পদ্ধতি। এখানে কোড লিখে সরাসরি নিয়ম না দিয়ে, বিশাল ডেটা ও অ্যালগরিদম ব্যবহার করে যন্ত্রকে নিজে থেকে প্যাটার্ন শিখতে দেওয়া হয়।"
    },
    DL: {
      title: "ডিপ লার্নিং (Deep Learning)",
      color: "text-[#fbcfe8]",
      bgColor: "bg-[#ec4899]/10 border-[#ec4899]/20",
      desc: "মেশিন লার্নিংয়ের একটি বিশেষ উপশাখা। এটি মানুষের মস্তিষ্কের গঠনের আদলে তৈরি 'কৃত্রিম নিউরাল নেটওয়ার্ক' ব্যবহার করে অত্যন্ত জটিল ডেটা বিশ্লেষণ করে।"
    }
  };

  return (
    <div className="w-full space-y-6 font-sans md:space-y-8 text-slate-200">
      
      {/* Header Area (No box, just flat text) */}
      <div className="pb-3 space-y-3 text-center md:pb-4">
        <h2 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-white md:gap-3 sm:text-2xl md:text-3xl">
          <span className="bg-[#5b5dfa]/20 text-[#5b5dfa] border border-[#5b5dfa]/30 text-xs sm:text-sm px-2.5 py-1 rounded-full">ল্যাব-০১</span>
          কৃত্রিম বুদ্ধিমত্তা (Artificial Intelligence)
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 px-2 sm:px-0">
          যন্ত্রের মানুষের মতো কোনো বিষয়কে 'শনাক্ত' করা, 'বিশ্লেষণ' করা বা 'সিদ্ধান্ত' নেওয়ার জাদুকরী ক্ষমতা।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-[#5b5dfa]/20 bg-[#5b5dfa]/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-[#5b5dfa] animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই ল্যাবরেটরি সিমুলেটরটি তৈরি করা হয়েছে এআই (Artificial Intelligence) এবং প্রথাগত সেন্সর/কম্পিউটার প্রোগ্রামের মধ্যকার সুক্ষ্ম পার্থক্য বাস্তবে বুঝতে সাহায্য করার জন্য। এখানে আপনি ৩টি গুরুত্বপূর্ণ বিষয় পরীক্ষা করতে পারবেন:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#a5b4fc] flex items-center gap-1.5">
              <span className="text-base">🎮</span> ১. এআই ডিটেক্টর টেস্ট
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              এখানে আপনার সামনে ৪টি বাস্তব দৃশ্যপট দেওয়া হবে। আপনাকে বিচার করতে হবে সেটি একটি 'স্বয়ংক্রিয় এআই' নাকি সাধারণ 'রুল-বেজড প্রোগ্রাম'। বাটন ক্লিক করে আপনার উত্তর সাবমিট করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">📊</span> ২. ইন্টারেক্টিভ ভেন ডায়াগ্রাম
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ডান পাশের ভেন ডায়াগ্রামের বিভিন্ন লেয়ারে (AI, ML, DL) ক্লিক করে জানুন কীভাবে মেশিন লার্নিং ও ডিপ লার্নিং আসলে কৃত্রিম বুদ্ধিমত্তার ভেতরেই একে অপরের ছায়া হয়ে অবস্থান করে।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">⚖️</span> ৩. বাস্তব তুলনা ও উদাহরণ
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              নিচের তুলনামূলক টেবিল ও কুইক ইনসাইটস থেকে সাধারণ বাধ্য প্রোগ্রাম ও এআই-এর চিন্তার ক্ষমতার বড় অমিলগুলো সহজে একনজরে ঝালিয়ে নিন।
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 md:gap-6">
        
        {/* Main Interactive Area (Left/Top) */}
        <div className="space-y-5 lg:col-span-2 md:space-y-6">
          
          {/* The Quiz Box (Clean, subtle gradient background) */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden shadow-lg">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#4f46e5] to-[#d846ef]"></div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#a5b4fc] flex items-center gap-2">
                  <span>🎮</span> এআই ডিটেক্টর টেস্ট
                </h3>
                <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-bold">
                  <span className="text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-500/20">সঠিক: {score.correct}</span>
                  <span className="text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded border border-rose-500/20">ভুল: {score.wrong}</span>
                </div>
              </div>

              {!showLogbook ? (
                <div className="space-y-5 md:space-y-6">
                  {/* Scenario Card (Flat design) */}
                  <div className="bg-white/[0.02] p-4 sm:p-6 rounded-xl border border-white/5 relative">
                    <span className="absolute -top-3 left-4 bg-[#0b0f19] text-slate-400 text-xs uppercase tracking-wider px-2 py-0.5 rounded border border-white/10 font-bold">
                      দৃশ্যপট {currentScenario + 1} / {scenarios.length}
                    </span>
                    <h4 className="mt-2 mb-2 text-lg font-bold text-white sm:text-xl">{scenarios[currentScenario].title}</h4>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-300">{scenarios[currentScenario].description}</p>
                  </div>

                  {/* Action Buttons (Glassmorphism) */}
                  <div className="flex flex-col justify-center gap-3 pt-1 sm:flex-row sm:gap-4">
                    <button 
                      onClick={() => handleGuess(true)}
                      disabled={feedback !== null}
                      className="flex-1 bg-gradient-to-r from-[#4f46e5]/80 to-[#d846ef]/80 hover:from-[#4f46e5] hover:to-[#d846ef] text-white font-bold py-3 px-4 sm:py-3.5 sm:px-6 rounded-xl transition-all disabled:opacity-50 text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <span>🧠</span> এটি কৃত্রিম বুদ্ধিমত্তা (AI)
                    </button>
                    
                    <button 
                      onClick={() => handleGuess(false)}
                      disabled={feedback !== null}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 sm:py-3.5 sm:px-6 rounded-xl transition-all disabled:opacity-50 border border-white/10 text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                      <span>⚙️</span> সাধারণ প্রোগ্রাম / যন্ত্র
                    </button>
                  </div>

                  {/* Feedback Popup */}
                  <div className={`transition-all duration-300 transform ${feedback ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-4 h-0 overflow-hidden'}`}>
                    {feedback && (
                      <div className={`p-4 rounded-xl border ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-200'}`}>
                        <p className="mb-1 font-bold text-sm sm:text-base">{feedback.type === 'success' ? 'সাবাশ!' : 'একটু ভুল হলো!'}</p>
                        <p className="text-sm sm:text-base leading-relaxed opacity-90">{feedback.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Quiz Completed State
                <div className="space-y-4 text-center py-7 sm:py-8 sm:space-y-5">
                  <div className="text-3xl sm:text-4xl">🏆</div>
                  <h4 className="text-lg font-bold text-white sm:text-xl">টেস্ট সম্পন্ন!</h4>
                  <p className="text-sm sm:text-base text-slate-400">আপনার স্কোর: {score.correct} / {scenarios.length}</p>
                  {score.correct === scenarios.length ? (
                    <p className="inline-block p-3 text-sm sm:text-base font-bold border rounded-lg text-emerald-400 bg-emerald-400/10 border-emerald-500/20">অসাধারণ! আপনি এআই এবং সাধারণ প্রোগ্রামের পার্থক্য পুরোপুরি বুঝে গেছেন।</p>
                  ) : (
                    <p className="inline-block p-3 text-sm sm:text-base font-bold border rounded-lg text-amber-400 bg-amber-400/10 border-amber-500/20">দারুণ চেষ্টা! নিচে রিমিশার লগবুক পড়ে কনসেপ্টটি আরও পরিষ্কার করে নিন।</p>
                  )}
                  <div>
                    <button onClick={restartQuiz} className="px-5 py-2 mt-3 text-sm sm:text-base font-bold text-white transition-colors border rounded-lg bg-white/10 hover:bg-white/20 border-white/20">
                      আবার খেলুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Table (Flat Style) */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="p-3 border-b sm:p-4 border-white/5">
              <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-white">
                <span className="text-[#00daf3]">⚖️</span> বাধ্য চাকর বনাম স্মার্ট অ্যাসিস্ট্যান্ট
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] sm:min-w-0 text-left text-slate-300">
                <thead className="text-xs sm:text-sm uppercase bg-white/[0.02] text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-bold sm:px-5">বৈশিষ্ট্য</th>
                    <th className="px-4 py-3 font-bold sm:px-5">সাধারণ কম্পিউটার</th>
                    <th className="px-4 sm:px-5 py-3 font-bold text-[#a5b4fc]">কৃত্রিম বুদ্ধিমত্তা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base font-bold text-white">কাজের ধরণ</td>
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base">"রুল-বেজড"। যা নির্দেশ দেওয়া হয়, তা-ই করে।</td>
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base text-[#a5b4fc] bg-[#4f46e5]/5 font-medium">"লজিক ও লার্নিং বেজড"। সিদ্ধান্ত নেয়।</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base font-bold text-white">সিদ্ধান্ত গ্রহণ</td>
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base">নিজে কোনো নতুন সিদ্ধান্ত নিতে পারে না।</td>
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base text-[#a5b4fc] bg-[#4f46e5]/5 font-medium">পরিস্থিতির ওপর ভিত্তি করে সিদ্ধান্ত নিতে পারে।</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base font-bold text-white">উদাহরণ</td>
                    <td className="px-4 sm:px-5 py-3.5 text-sm sm:text-base">মাইক্রোসফট ওয়ার্ড, ক্যালকুলেটর।</td>
                    <td className="px-4 sm:px-5 py-3.5 bg-[#4f46e5]/5 font-medium text-sm sm:text-base text-[#a5b4fc]">নেটফ্লিক্স, গুগল ম্যাপস, ফেস আনলক।</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side Panel (Interactive Venn Diagram & Insights) */}
        <div className="space-y-5 lg:col-span-1 md:space-y-6">
          
          {/* The Venn Diagram */}
          <div className="bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/5 h-fit">
            <h3 className="flex items-center justify-between pb-3 mb-4 text-sm sm:text-base font-bold text-white border-b border-white/5">
              <span className="flex items-center gap-2"><span className="text-[#d846ef]">📊</span> ভেন ডায়াগ্রাম</span>
              <span className="text-xs bg-[#d846ef]/20 border border-[#d846ef]/30 text-[#d846ef] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">ইন্টারেক্টিভ</span>
            </h3>
            
            <div className="flex flex-col items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full max-w-[180px] sm:max-w-[220px]">
                <g onClick={() => setActiveVenn('AI')} className="cursor-pointer group">
                  <circle cx="150" cy="150" r="135" fill={activeVenn === 'AI' ? 'rgba(79, 70, 229, 0.25)' : 'rgba(79, 70, 229, 0.08)'} stroke="#4f46e5" strokeWidth={activeVenn === 'AI' ? "2" : "1"} className="transition-all duration-300 group-hover:fill-[#4f46e5]/30" />
                  <text x="150" y="45" fill="#a5b4fc" fontSize="13" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">এআই (AI)</text>
                </g>

                <g onClick={() => setActiveVenn('ML')} className="cursor-pointer group">
                  <circle cx="150" cy="165" r="95" fill={activeVenn === 'ML' ? 'rgba(147, 51, 234, 0.35)' : 'rgba(147, 51, 234, 0.12)'} stroke="#9333ea" strokeWidth={activeVenn === 'ML' ? "2" : "1"} className="transition-all duration-300 group-hover:fill-[#9333ea]/30" />
                  <text x="150" y="100" fill="#d8b4fe" fontSize="11" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">মেশিন লার্নিং (ML)</text>
                </g>

                <g onClick={() => setActiveVenn('DL')} className="cursor-pointer group">
                  <circle cx="150" cy="190" r="55" fill={activeVenn === 'DL' ? 'rgba(236, 72, 153, 0.45)' : 'rgba(236, 72, 153, 0.18)'} stroke="#ec4899" strokeWidth={activeVenn === 'DL' ? "2" : "1"} className="transition-all duration-300 group-hover:fill-[#ec4899]/30" />
                  <text x="150" y="185" fill="#fbcfe8" fontSize="10" fontWeight="bold" textAnchor="middle" className="pointer-events-none select-none">ডিপ লার্নিং (DL)</text>
                </g>
              </svg>

              <div className={`w-full mt-4 p-3 rounded-xl border transition-all duration-300 text-xs sm:text-sm ${vennDescriptions[activeVenn].bgColor}`}>
                <h4 className={`font-bold mb-1 ${vennDescriptions[activeVenn].color}`}>{vennDescriptions[activeVenn].title}</h4>
                <p className="leading-relaxed text-slate-300 opacity-90">{vennDescriptions[activeVenn].desc}</p>
              </div>
            </div>
          </div>

          {/* Quick Insights (Flat Style) */}
          <div className="bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/5">
            <h3 className="flex items-center gap-2 pb-2 mb-4 text-sm sm:text-base font-bold text-white border-b border-white/5">
              <span className="text-amber-400">💡</span> কোথায় এআই ব্যবহার হচ্ছে?
            </h3>
            <ul className="space-y-3.5 sm:space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-1.5 rounded text-xs mt-0.5">🎬</div>
                <div>
                  <span className="block text-sm sm:text-base font-bold text-slate-200">রিকমেন্ডেশন ইঞ্জিন</span>
                  <span className="text-xs sm:text-sm text-slate-400">ইউটিউব, নেটফ্লিক্স বা নিউজফিড।</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-[#00daf3]/10 border border-[#00daf3]/20 text-[#00daf3] p-1.5 rounded text-xs mt-0.5">🤖</div>
                <div>
                  <span className="block text-sm sm:text-base font-bold text-slate-200">স্মার্ট অ্যাসিস্ট্যান্ট</span>
                  <span className="text-xs sm:text-sm text-slate-400">গুগল অ্যাসিস্ট্যান্ট বা চ্যাটজিপিটি।</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1.5 rounded text-xs mt-0.5">🗺️</div>
                <div>
                  <span className="block text-sm sm:text-base font-bold text-slate-200">নেভিগেশন</span>
                  <span className="text-xs sm:text-sm text-slate-400">গুগল ম্যাপসের ট্রাফিক আপডেট।</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
