import React, { useState } from 'react';

export default function SimulationLab() {
  const [moisture, setMoisture] = useState(61); 
  const [weather, setWeather] = useState('sunny'); 
  const [time, setTime] = useState(20); // 20:00 (রাত ৮টা) 

  const isTimerPumpOn = time === 8;
  const isSmartPumpOn = time === 8 && moisture < 50 && weather !== 'raining';

  const getTimerAnalysis = () => {
    if (!isTimerPumpOn) return "পাম্প এখন বন্ধ (সকাল ৮টা বাজেনি)।";
    if (weather === 'raining') return "⚠️ অপচয়! বাইরে বৃষ্টি হচ্ছে, তাও পাম্প চলছে!";
    if (moisture >= 60) return "⚠️ অপচয়! মাটি অলরেডি ভেজা, তাও পাম্প চলছে!";
    return "✅ সঠিক সেচন! মাটির আর্দ্রতা কম এবং পাম্প পানি দিচ্ছে।";
  };

  const getSmartAnalysis = () => {
    if (time !== 8) return "পাম্প এখন বন্ধ (সকাল ৮টা বাজেনি)।";
    if (isSmartPumpOn) return "✅ আদেশ সেচন! পরিবেশ শুষ্ক হওয়ায় পাম্প পানি দিচ্ছে।";
    if (weather === 'raining') return "🍀 বুদ্ধিমান সাশ্রয়: বাইরে বৃষ্টি হচ্ছে, তাই পাম্প বন্ধ রাখা হয়েছে।";
    if (moisture >= 50) return "🍀 বুদ্ধিমান সাশ্রয়: মাটিতে পর্যাপ্ত রস আছে, তাই পাম্প চালানো হয়নি।";
    return "পাম্প বন্ধ।";
  };

  return (
    <div className="w-full space-y-6 md:space-y-8 font-sans text-gray-200">
      
      {/* Header Area */}
      <div className="pb-3 space-y-3 text-center sm:pb-4">
        <h2 className="flex flex-wrap items-center justify-center gap-2 text-xl font-bold text-white sm:text-2xl md:gap-3 md:text-3xl">
          <span className="bg-sky-600 text-white text-xs px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(2,132,199,0.5)] sm:px-3 sm:text-sm">ল্যাব-০৬</span>
          অটোমেশন (Automation)
        </h2>
        <p className="max-w-2xl mx-auto px-2 text-sm sm:text-base md:text-lg text-gray-400 sm:px-0">
          মানুষের সরাসরি হস্তক্ষেপ ছাড়া একটি একঘেয়ে কাজ বারবার এবং নির্ভুলভাবে হওয়ার ব্যবস্থা। সাধারণ টাইমার বনাম পরিবেশ সচেতন বুদ্ধিমত্তা!
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-sky-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি সাধারণ অটোমেশন (টাইমার পাম্প) এবং পরিবেশ সচেতন বুদ্ধিমত্তা সম্পন্ন অটোমেশন (এআই পাম্প) এর মধ্যকার বাস্তব পার্থক্য দেখতে পাবেন।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-sky-300 flex items-center gap-1.5">
              <span className="text-base">🌍</span> ১. পরিবেশ নিয়ন্ত্রণ করুন
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              বাম পাশের প্যানেল থেকে স্লাইডার ড্র্যাগ করে দিনের সময় পরিবর্তন করুন (টাইমার পাম্প সকাল ৮:০০ টায় চালু হওয়ার জন্য সেট করা)। মাটির আর্দ্রতা কম-বেশি করুন এবং মেঘলা বা বৃষ্টির আবহাওয়া সিলেক্ট করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">⚙️</span> ২. টাইমার পাম্পের প্রতিক্রিয়া
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ডান পাশে লক্ষ্য করুন, ঘড়িতে সকাল ৮:০০ বাজলেই এই পাম্পটি অন্ধের মতো চালু হবে, এমনকি মুষলধারে বৃষ্টি বা মাটি প্রচুর ভেজা থাকলেও এটি পানি ঢেলে সম্পদ অপচয় করবে।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">🧠</span> ৩. এআই পাম্পের প্রতিক্রিয়া
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ডান পাশের এআই পাম্পটি দেখুন। এটি সকাল ৮:০০ বাজলেও প্রথমে চেক করবে মাটি শুষ্ক কি না (&lt; ৫০%) এবং বাইরে বৃষ্টি হচ্ছে কি না। পরিবেশ সাশ্রয়ী হলে তবেই এটি চালু হবে!
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-stretch grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12">
        
        {/* Left: Environment Controls */}
        <div className="lg:col-span-4 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 flex flex-col justify-between gap-6 shadow-xl">
          <div>
            <h3 className="flex items-center gap-2 mb-6 text-base sm:text-lg font-bold text-sky-400">
              <span>🌍</span> পরিবেশ নিয়ন্ত্রণ প্যানেল (Environment)
            </h3>
            
            {/* Time Slider */}
            <div className="mb-6">
              <div className="flex flex-wrap justify-between gap-2 mb-3 text-sm sm:text-base font-bold text-white">
                <span className="flex items-center gap-1">⏰ দিনের সময় (Time of Day):</span>
                <span className="text-sky-400">
                  {time === 12 ? 'দুপুর ১২:০০' : time === 24 ? 'রাত ১২:০০' : time > 12 ? `রাত ${time-12}:০০` : `সকাল ${time}:০০`}
                </span>
              </div>
              <input 
                type="range" min="1" max="24" value={time} 
                onChange={(e) => setTime(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-2 font-bold">
                <span>সকাল ৬:০০</span>
                <span className="text-sky-400">সকাল ৮:০০ (টাইমার সময়)</span>
                <span>রাত ১২:০০</span>
              </div>
            </div>

            {/* Moisture Slider */}
            <div className="pt-4 mb-6 border-t border-gray-700">
              <div className="flex justify-between mb-3 text-sm sm:text-base font-bold text-white">
                <span className="flex items-center gap-1">🌱 মাটির আর্দ্রতা (Soil Moisture):</span>
                <span className="text-sky-400">{moisture}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={moisture} 
                onChange={(e) => setMoisture(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs sm:text-sm mt-2 font-bold">
                <span className="text-red-400">শুষ্ক (0%)</span>
                <span className="text-gray-500">আদর্শ (50%)</span>
                <span className="text-blue-400">ভেজা (100%)</span>
              </div>
            </div>

            {/* Weather Selector */}
            <div className="pt-4 border-t border-gray-700">
              <label className="block mb-3 text-sm sm:text-base font-bold text-white">☁️ আজকের আবহাওয়া (Weather Condition):</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sunny', label: 'রৌদ্রোজ্জ্বল', icon: '☀️' },
                  { id: 'cloudy', label: 'মেঘলা', icon: '☁️' },
                  { id: 'raining', label: 'বৃষ্টি হচ্ছে', icon: '🌧️' }
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id)}
                    className={`py-3 px-1 rounded-lg text-xs sm:text-sm font-bold transition-all border flex flex-col items-center gap-1.5 ${
                      weather === w.id 
                        ? 'bg-[#0f172a] border-sky-500 text-sky-400 shadow-md' 
                        : 'bg-[#161b22] border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xl">{w.icon}</span>
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setTime(8); setMoisture(61); setWeather('sunny'); }}
            className="w-full py-3 bg-[#161b22] hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs sm:text-sm font-bold rounded-lg transition-colors"
          >
            ডিফল্ট পরিবেশ সেট করুন (সকাল ৮:০০)
          </button>
        </div>

        {/* Right: Simulation Response of Both Pumps */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl">
          
          {/* Pump 1: Simple Automation */}
          <div className="bg-[#161b22] p-4 sm:p-5 rounded-xl border border-gray-700 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-300">⚙️ সাধারণ অটোমেশন<br/><span className="text-xs sm:text-sm font-normal text-gray-500">(টাইমার পাম্প)</span></span>
                <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded bg-[#1e2430] border border-gray-700 text-gray-500`}>
                  {isTimerPumpOn ? 'চলছে (ON)' : 'বন্ধ (OFF)'}
                </span>
              </div>
              
              <div className="flex justify-center my-8 text-center">
                {/* Visual Icon */}
                <div className="relative flex items-center justify-center w-16 h-16 text-3xl text-white bg-blue-500 shadow-lg rounded-xl">
                  🚰
                  {isTimerPumpOn && (
                    <div className="absolute flex gap-1 -translate-x-1/2 -bottom-4 left-1/2">
                      <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="mb-1 text-base sm:text-lg font-bold text-white">বিশ্লেষণ:</p>
                <p className="text-sm sm:text-base font-bold text-gray-300 leading-relaxed">{getTimerAnalysis()}</p>
              </div>
            </div>
            
            <p className="pt-4 mt-6 text-xs sm:text-sm leading-relaxed text-gray-500 border-t border-gray-800">
              <span className="text-gray-400">হুকুমের গোলাম:</span> এটি কেবল ঘড়িতে সকাল ৮টা বাজার নিয়ম মেনে অন্ধের মতো চালু হয়। মাটির আর্দ্রতা বেশি বা আকাশে মুষলধারে বৃষ্টি হলেও সে পানি ঢালতেই থাকে!
            </p>
          </div>

          {/* Pump 2: Intelligent Automation */}
          <div className="bg-[#161b22] p-4 sm:p-5 rounded-xl border border-gray-700 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-emerald-400">🧠 ইন্টেলিজেন্ট অটোমেশন<br/><span className="text-xs sm:text-sm font-normal text-emerald-600">(এআই পাম্প)</span></span>
                <span className={`text-xs sm:text-sm font-bold px-3 py-1 rounded bg-[#1e2430] border border-gray-700 text-gray-500`}>
                  {isSmartPumpOn ? 'চলছে (ON)' : 'বন্ধ (OFF)'}
                </span>
              </div>

              <div className="flex justify-center my-8 text-center">
                {/* Visual Icon */}
                <div className="relative flex items-center justify-center w-16 h-16 text-5xl">
                  🌳
                  {isSmartPumpOn && (
                    <div className="absolute flex gap-1 -translate-x-1/2 -bottom-2 left-1/2">
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-1 text-base sm:text-lg font-bold text-white">বিশ্লেষণ:</p>
                <p className="text-sm sm:text-base font-bold text-gray-300 leading-relaxed">{getSmartAnalysis()}</p>
              </div>
            </div>

            <p className="pt-4 mt-6 text-xs sm:text-sm leading-relaxed text-gray-500 border-t border-gray-800">
              <span className="text-gray-400">বুদ্ধিমত্তার ইঞ্জিন:</span> এটি সকাল ৮টা বাজলেও প্রথমে মাটির রস এবং বাইরের আকাশ মেঘলা কি না তা সেন্সর ও পূর্ব অভিজ্ঞতার লজিক দিয়ে বিশ্লেষণ করে। প্রয়োজন মনে করলেই কেবল চালু হয়!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
