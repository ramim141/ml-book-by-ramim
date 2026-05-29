import { useState, useEffect, useRef } from 'react';

export default function SimulationLab() {
  const [expertNode, setExpertNode] = useState('q1');
  const [expertHistory, setExpertHistory] = useState(['q1']);
  const [expertLogs, setExpertLogs] = useState([{ type: 'bot', text: 'আপনার কি জ্বর আছে?' }]);
  
  const scrollRef = useRef(null);

  // অটো-স্ক্রল করার জন্য
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [expertLogs]);

  const expertTree = {
    q1: { text: 'আপনার কি জ্বর আছে?', rule: 'IF (Fever == True)', yes: 'q2', no: 'q3', unknown: 'error' },
    q2: { text: 'জ্বর কি ১০১ ডিগ্রির বেশি এবং সাথে কাশি আছে?', rule: 'IF (Temp > 101) AND (Cough == True)', yes: 'r_flu', no: 'r_cold', unknown: 'error' },
    q3: { text: 'আপনার কি তীব্র মাথা ব্যথা আছে?', rule: 'IF (Headache == True)', yes: 'r_stress', no: 'r_healthy', unknown: 'error' },
    r_flu: { text: 'রোগ নির্ণয়: ফ্লু (Flu)', isResult: true, color: 'text-rose-400' },
    r_cold: { text: 'রোগ নির্ণয়: সাধারণ সর্দি', isResult: true, color: 'text-amber-400' },
    r_stress: { text: 'রোগ নির্ণয়: মানসিক চাপ (Stress)', isResult: true, color: 'text-[#00daf3]' },
    r_healthy: { text: 'রোগ নির্ণয়: আপনি সুস্থ আছেন!', isResult: true, color: 'text-emerald-400' },
    error: { text: "সিস্টেম ফেইল! আমার কাছে এই লক্ষণের কোনো রুল (Rule) নেই।", isResult: true, isError: true, color: 'text-red-500' }
  };

  const handleExpertAnswer = (answerType, answerText) => {
    setExpertLogs(prev => [...prev, { type: 'user', text: answerText }]);
    const nextNodeKey = expertTree[expertNode][answerType];
    setExpertNode(nextNodeKey);
    setExpertHistory(prev => [...prev, nextNodeKey]);
    
    setTimeout(() => { 
      setExpertLogs(prev => [...prev, { 
        type: 'bot', 
        text: expertTree[nextNodeKey].text, 
        isResult: expertTree[nextNodeKey].isResult, 
        isError: expertTree[nextNodeKey].isError 
      }]); 
    }, 600);
  };

  const resetExpertSystem = () => { 
    setExpertNode('q1'); 
    setExpertHistory(['q1']); 
    setExpertLogs([{ type: 'bot', text: 'আপনার কি জ্বর আছে?' }]); 
  };

  return (
    <div className="w-full space-y-6 font-sans md:space-y-8 text-slate-200">
      {/* Header Area */}
      <div className="pb-3 space-y-3 text-center sm:pb-4">
        <div className="flex flex-col items-center gap-2">
          <span className="px-2.5 py-1 text-xs text-teal-400 border rounded-full bg-teal-500/20 border-teal-500/30 sm:px-3 sm:text-sm">
            ল্যাব-০৩
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
            এক্সপার্ট সিস্টেম (Expert System)
          </h2>
        </div>
        <p className="max-w-2xl mx-auto px-2 text-sm sm:text-base md:text-lg text-slate-400 sm:px-0">
          রুল-ভিত্তিক এক্সপার্ট সিস্টেমের লাইভ ইন্টারেক্টিভ ডেমো এবং গ্লাস বক্স ভিউ।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-teal-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরটি দিয়ে আপনি বুঝতে পারবেন কীভাবে মানুষের তৈরি করা বিভিন্ন নিয়ম (Rules) বা সিদ্ধান্ত গাছের (Decision Tree) ওপর ভিত্তি করে একটি "এক্সপার্ট সিস্টেম" কাজ করে। এখানে আপনি রোগী সেজে ডাক্তারের প্রশ্নের উত্তর দেবেন এবং সিস্টেমটি কোন নিয়মের ওপর ভিত্তি করে সিদ্ধান্ত নিচ্ছে তা সরাসরি দেখতে পাবেন!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-teal-300 flex items-center gap-1.5">
              <span className="text-base">🩺</span> ১. এআই ডাক্তারের সাথে চ্যাট
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              বাম পাশের চ্যাটবট আপনাকে জ্বর বা অন্যান্য উপসর্গের ব্যাপারে প্রশ্ন করবে। নিচে থাকা "হ্যাঁ", "না" অথবা "অন্য লক্ষণ" বাটনে ক্লিক করে উত্তর দিন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">🔍</span> ২. দ্য গ্লাস বক্স (ভেতরের নিয়ম)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              চ্যাটের সাথে সাথে ডান পাশে লক্ষ্য করুন। যেই নিয়মটি বর্তমানে প্রসেস হচ্ছে সেটি সবুজ রঙে হাইলাইট হবে এবং আগের সম্পন্ন হওয়া ধাপগুলো চিহ্নিত হয়ে থাকবে।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">🚨</span> ৩. ভঙ্গুর আচরণ (Brittle)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              যদি আপনি "অন্য লক্ষণ" সিলেক্ট করেন, তবে সিস্টেমটি ফেইল করবে কারণ এই এক্সপার্ট সিস্টেমের নলেজ বেসে এর বাইরে কোনো নিয়ম নেই। একেই বলা হয় ব্রাইটল বা ভঙ্গুর আচরণ!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 md:gap-6">
        {/* Left Side: Medical Chat Simulator */}
        <div className="space-y-5 md:space-y-6">
          <div className="flex flex-col h-auto overflow-hidden shadow-lg rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent lg:h-[520px]">
            <div className="w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            
            <div className="flex flex-col gap-3 p-4 border-b border-white/5 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-teal-400 sm:text-lg">
                <span>🩺</span> এআই ডাক্তার সিমুলেটর
              </h3>
              <button onClick={resetExpertSystem} className="self-start px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-300 transition-colors bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 sm:self-auto">
                🔄 রিস্টার্ট
              </button>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-y-auto sm:p-5 scrollbar-thin">
              {expertLogs.map((log, idx) => (
                <div key={idx} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm sm:px-4 sm:py-3 sm:text-base shadow-sm ${
                    log.type === 'user' 
                      ? 'bg-teal-500/20 border border-teal-500/30 text-teal-100 rounded-tr-none' 
                      : log.isError 
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-tl-none font-bold' 
                        : log.isResult 
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-tl-none font-bold' 
                          : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef}></div>
            </div>

            {/* User Input Area */}
            <div className="p-3.5 border-t border-white/5 bg-black/20 sm:p-4">
              {!expertTree[expertNode]?.isResult ? (
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleExpertAnswer('yes', 'হ্যাঁ')} className="px-2 py-3 text-xs sm:text-sm md:text-base font-bold text-teal-300 transition-colors border rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/40">
                    হ্যাঁ
                  </button>
                  <button onClick={() => handleExpertAnswer('no', 'না')} className="px-2 py-3 text-xs sm:text-sm md:text-base font-bold transition-colors border rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border-white/10">
                    না
                  </button>
                  <button onClick={() => handleExpertAnswer('unknown', 'অন্য কিছু')} className="py-3 px-2 text-xs sm:text-sm md:text-base font-bold transition-colors border rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30">
                    অন্য লক্ষণ
                  </button>
                </div>
              ) : (
                <div className="p-2 text-sm sm:text-base text-center border rounded-lg bg-white/[0.02] text-slate-400 border-white/5">
                  রোগ নির্ণয় সম্পন্ন হয়েছে। আবার পরীক্ষা করতে রিস্টার্ট চাপুন।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: The Glass Box View */}
        <div className="self-start space-y-5 md:space-y-6 lg:sticky lg:top-6">
          <div className="flex flex-col h-auto overflow-hidden shadow-lg rounded-2xl border border-white/5 bg-white/[0.02] lg:h-[520px]">
            <div className="p-4 border-b border-white/5 sm:p-4">
              <h3 className="flex items-center justify-between text-base font-bold text-white sm:text-lg">
                <span>🔍 দ্য গ্লাস বক্স</span>
              </h3>
              <p className="mt-1 text-xs font-bold tracking-wider uppercase text-slate-400 sm:text-sm">
                Knowledge Base & Inference Rules
              </p>
            </div>
            
            <div className="flex-1 p-4 space-y-3 overflow-y-auto font-mono text-xs sm:p-5 sm:text-sm scrollbar-thin">
              {Object.keys(expertTree).map((key) => {
                const node = expertTree[key];
                const isActive = expertNode === key;
                const isPassed = expertHistory.includes(key);
                
                if (!node.rule) return null; // Only show rules, not results
                
                return (
                  <div key={key} className={`p-3 rounded-lg border transition-all duration-500 ${
                    isActive 
                      ? `bg-teal-500/10 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.15)] scale-[1.02] ml-2` 
                      : isPassed 
                        ? 'bg-white/5 border-white/10 text-slate-500 ml-2' 
                        : 'bg-transparent border-white/5 text-slate-600'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isActive && <span className="text-teal-400 animate-pulse">▶</span>}
                      {isPassed && !isActive && <span className="text-teal-600">✓</span>}
                      <span className="font-bold">{node.rule}</span>
                    </div>
                  </div>
                )
              })}

              <div className="mt-8 p-4 bg-white/[0.03] border-l-2 border-teal-500 rounded text-slate-400 text-xs sm:text-sm leading-relaxed">
                <span className="block mb-1 font-bold text-teal-400">ব্যাখ্যা (Explainability):</span>
                ইনফারেন্স ইঞ্জিন আপনার উত্তরের সাথে রুল মিলিয়ে সিদ্ধান্ত নিচ্ছে। আপনি যদি 'অন্য কিছু' অপশন চাপেন, তবে সিস্টেম ফেইল করবে কারণ এর নলেজ বেসে নতুন কোনো রুল নেই। একেই বলা হয় <strong className="text-white">Brittle Behavior</strong>।
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
