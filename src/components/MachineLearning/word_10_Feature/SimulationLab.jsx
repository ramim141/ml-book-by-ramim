import { useState } from 'react';

const featureScenarios = {
  spam: {
    title: '📩 স্প্যাম মেইল ফিল্টার',
    inputDesc: 'একটি সম্পূর্ণ ইমেইল (প্রেরক, বিষয়, বডি টেক্সট এবং ইমেজ)',
    features: [
      { id: 'word_free', text: "'Free' বা 'Discount' শব্দের উপস্থিতি", isUseful: true, reason: 'স্প্যাম মেইলে প্রায়ই এই লোভনীয় অফার শব্দগুলো থাকে।' },
      { id: 'exclamation', text: "সাবজেক্ট লাইনে অনেক '!!!' থাকা", isUseful: true, reason: 'জরুরি ভাব দেখানোর জন্য অতিরিক্ত বিস্ময়সূচক চিহ্ন স্প্যামাররা ব্যবহার করে।' },
      { id: 'sender_numbers', text: 'প্রেরকের আইডিতে হাবিজাবি সংখ্যা (bot_12948@)', isUseful: true, reason: 'অটো-জেনারেটেড অ্যাকাউন্ট বা বটের অন্যতম লক্ষণ।' },
      { id: 'font_size', text: 'ইমেইলের ফন্ট সাইজ (Font Size)', isUseful: false, reason: 'ফন্ট সাইজ সাধারণ মেইলেও যেকোনো হতে পারে, এটি কাজের ফিচার নয়।' },
      { id: 'day_sent', text: 'মেইলটি সপ্তাহের কী বারে পাঠানো হয়েছে', isUseful: false, reason: 'যেকোনো মেইল যেকোনো দিন আসতে পারে। এটি অপ্রাসঙ্গিক ফিচার বা নয়েজ।' },
    ],
  },
  house: {
    title: '🏠 বাড়ির দাম প্রেডিকশন',
    inputDesc: 'একটি আস্ত বাড়ির সমস্ত তথ্য ও চারপাশের পরিবেশ',
    features: [
      { id: 'area', text: 'বাড়ির মোট আয়তন (বর্গফুট)', isUseful: true, reason: 'আয়তনের সাথে ফ্ল্যাটের দামের সরাসরি ইতিবাচক সম্পর্ক রয়েছে।' },
      { id: 'bedrooms', text: 'বেডরুমের মোট সংখ্যা', isUseful: true, reason: 'বেশি রুম মানে বেশি উপযোগিতা, যা সরাসরি দাম বৃদ্ধি করে।' },
      { id: 'distance', text: 'মেইন রাস্তা থেকে বাড়ির দূরত্ব', isUseful: true, reason: 'যোগাযোগ ব্যবস্থার গুরুত্বের উপর ভিত্তি করে রিয়েল এস্টেটের দাম ঠিক হয়।' },
      { id: 'wall_color', text: 'ভেতরের দেয়ালের রঙের উজ্জ্বলতা', isUseful: false, reason: 'রঙ যেকোনো সময় বদলে নেওয়া যায়, এটি মূল্যের স্থায়ী নির্দেশক নয়।' },
      { id: 'guard_age', text: 'বিল্ডিংয়ের সিকিউরিটি গার্ডের বয়স', isUseful: false, reason: 'গার্ডের বয়সের সাথে বাড়ির মূল্যের কোনো গাণিতিক সম্পর্ক নেই।' },
    ],
  },
  heart: {
    title: '🫀 হার্ট অ্যাটাক প্রেডিকশন',
    inputDesc: 'একজন রোগীর আস্ত হেলথ হিস্ট্রি ও জীবনযাত্রার তথ্য',
    features: [
      { id: 'age', text: 'রোগীর বয়স', isUseful: true, reason: 'বয়স বাড়ার সাথে কার্ডিওভাসকুলার ঝুঁকির সরাসরি সম্পর্ক রয়েছে।' },
      { id: 'blood_pressure', text: 'রক্তচাপ (Blood Pressure)', isUseful: true, reason: 'উচ্চ রক্তচাপ হৃদপিণ্ডের ধমনীতে বড় ধরনের চাপ সৃষ্টি করে।' },
      { id: 'cholesterol', text: 'কোলেস্টেরলের মাত্রা', isUseful: true, reason: 'রক্তনালীতে ফ্যাট জমে ব্লক হওয়ার মূল নির্দেশক।' },
      { id: 'hair_style', text: 'রোগীর চুলের স্টাইল', isUseful: false, reason: 'চুলের ধরণ বা স্টাইলের সাথে হার্টের সুস্থতার কোনো সম্পর্ক নেই।' },
      { id: 'shoe_size', text: 'রোগীর জুতার সাইজ', isUseful: false, reason: 'পায়ের মাপের সাথে হার্ট অ্যাটাকের ঝুঁকির কোনো সম্পর্ক নেই।' },
    ],
  },
};

export default function SimulationLab() {
  const [activeScenario, setActiveScenario] = useState('spam');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [faceFeatures, setFaceFeatures] = useState({
    eyeDistance: 50,
    noseLength: 45,
    jawWidth: 65,
  });

  const handleFeatureChange = (type, val) => {
    setFaceFeatures((prev) => ({
      ...prev,
      [type]: parseInt(val, 10),
    }));
  };

  const handleToggleFeature = (featureId) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter((id) => id !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  const calculateFeatureMetrics = () => {
    const scenario = featureScenarios[activeScenario];
    const usefulCount = scenario.features.filter((f) => f.isUseful).length;

    let correctSelected = 0;
    let incorrectSelected = 0;

    selectedFeatures.forEach((id) => {
      const found = scenario.features.find((f) => f.id === id);
      if (!found) return;
      if (found.isUseful) correctSelected += 1;
      else incorrectSelected += 1;
    });

    let accuracy = (correctSelected / usefulCount) * 100;
    if (incorrectSelected > 0) {
      accuracy = Math.max(15, accuracy - incorrectSelected * 25);
    }

    let status = 'অপ্রস্তুত মডেল (Untrained)';
    let statusColor = 'text-slate-400';

    if (selectedFeatures.length === 0) {
      status = 'ফিল্টার খালি! (No Features)';
      statusColor = 'text-slate-500';
    } else if (incorrectSelected > 0 && correctSelected > 0) {
      status = 'গাণিতিক বদহজম! 🤢 (Confused)';
      statusColor = 'text-amber-400 animate-pulse';
    } else if (correctSelected === usefulCount && incorrectSelected === 0) {
      status = 'জিনিয়াস মডেল! 🎯 (Accurate)';
      statusColor = 'text-emerald-400 font-bold';
    } else if (correctSelected > 0 && incorrectSelected === 0) {
      status = 'মাঝারি মানের মডেল ⚠️ (Mediocre)';
      statusColor = 'text-sky-400';
    } else if (incorrectSelected > 0 && correctSelected === 0) {
      status = 'ভুল লজিক! ❌ (Hopeless)';
      statusColor = 'text-rose-400';
    }

    return { score: Math.round(accuracy), status, statusColor };
  };

  const metrics = calculateFeatureMetrics();
  const scenario = featureScenarios[activeScenario];

  return (
    <div className="w-full space-y-6 font-sans md:space-y-8 text-slate-200">
      
      {/* Header Area */}
      <div className="pb-3 space-y-3 text-center sm:pb-4">
        <h2 className="flex flex-col items-center justify-center gap-2 text-xl font-bold text-white sm:flex-row sm:flex-wrap sm:gap-2 sm:text-2xl md:gap-3 md:text-3xl">
          <span className="px-2.5 py-1 text-xs text-indigo-400 border rounded-full bg-indigo-500/20 border-indigo-500/30 sm:px-3">ল্যাব-১০</span>
          ফিচার (Feature Engineering)
        </h2>
        <p className="max-w-2xl mx-auto px-2 text-sm sm:text-base md:text-lg text-slate-400 sm:px-0">
          আস্ত ইনপুট ডেটা থেকে ছাঁকনি দিয়ে ছেঁকে বের করা সুনির্দিষ্ট, পরিমাপযোগ্য এবং সিদ্ধান্ত নেওয়ার জন্য সবচেয়ে প্রয়োজনীয় বৈশিষ্ট্যই হলো ফিচার।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি ফিচার ইঞ্জিনিয়ারিং (Feature Engineering) এর ধারণা, অপ্রয়োজনীয় নয়েজ ফিচারের ক্ষতিকর প্রভাব এবং ফেস আইডি (Face ID)-এর কাজ সরাসরি বুঝতে পারবেন।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span className="text-base">🌪️</span> ১. ফিচার ছাঁকনি টেস্ট
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              📩 স্প্যাম ফিল্টার, 🏠 বাড়ির দাম এবং 🫀 হার্টের ঝুঁকির সিনারিও সিলেক্ট করুন। ছাঁকনিতে কেবল সঠিক ও কাজের ফিচারগুলো (যেমন: মেইলে \'Free\' শব্দ থাকা বা রোগীর রক্তচাপ) টিক চিহ্ন দিয়ে অ্যাকুরেসি চেক করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">📉</span> ২. অ্যাকুরেসি স্ক্যানার
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ছাঁকনিতে ভুল বা অপ্রাসঙ্গিক নয়েজ ফিচার (যেমন: রোগীর জুতার মাপ বা দেয়ালের রঙ) যুক্ত করে দেখুন। অপ্রাসঙ্গিক ফিচার ডাটা বাড়ালেও এআই-এর অ্যাকুরেসি কীভাবে কমিয়ে দেয় তা লক্ষ্য করুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">📸</span> ৩. ফেস আইডি এক্সট্রাকশন
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ডান পাশের ফেস আইডি মডিউলে স্লাইডারগুলো ড্র্যাগ করুন। এআই কীভাবে চোখের দূরত্ব, নাকের দৈর্ঘ্য ও চোয়ালের মাপকে সংখ্যায় পরিমাপ করে চেহারা চেনার ফিচার তৈরি করে, তা লাইভ স্ক্যানার গ্রাফে দেখুন।
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-stretch grid-cols-1 gap-5 md:gap-6 lg:grid-cols-12">
        
        {/* Left Side: Feature Selector Simulator */}
        <div className="lg:col-span-7 bg-white/[0.02] p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-5 sm:gap-6 shadow-lg">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-indigo-400">
                <span>🌪️</span> ফিচার ছাঁকনি সিমুলেটর
              </h3>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Feature Selector
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 mb-5 sm:grid-cols-3 sm:mb-6">
              {[
                { id: 'spam', label: '📩 স্প্যাম ফিল্টার' },
                { id: 'house', label: '🏠 বাড়ির দাম' },
                { id: 'heart', label: '🫀 হার্টের ঝুঁকি' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveScenario(item.id); setSelectedFeatures([]); }}
                  className={`p-2.5 rounded-xl text-xs sm:text-sm md:text-base font-bold border transition-all ${
                    activeScenario === item.id
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-md scale-[1.02]'
                      : 'bg-black/20 border-white/5 hover:border-white/10 text-slate-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-4 mb-5 text-xs sm:text-sm border bg-black/20 rounded-xl border-white/5">
              <span className="block mb-1 font-bold tracking-wider uppercase text-slate-500 text-xs">Raw Input Data (গোটা ডেটা):</span>
              <p className="italic text-slate-300">{scenario.inputDesc}</p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs sm:text-sm font-bold text-slate-400 mb-2 leading-relaxed">
                🛠️ মডেলকে ট্রেইন করার জন্য কোন কোন বৈশিষ্ট্য (Feature) ছাঁকনিতে নেবেন?
              </label>
              {scenario.features.map((feature) => {
                const isChecked = selectedFeatures.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleToggleFeature(feature.id)}
                    className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left font-bold transition-all flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 shadow-sm'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-500 border-indigo-400' : 'border-slate-600'}`}>
                        {isChecked && <span className="text-[10px] text-white">✓</span>}
                      </span>
                      <span>{feature.text}</span>
                    </span>
                    <span className={`text-xs shrink-0 ${isChecked ? 'text-indigo-400' : 'text-slate-600'}`}>
                      {isChecked ? 'সংগৃহীত' : 'বাদ দেওয়া'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 text-xs sm:text-sm border bg-black/20 rounded-xl border-white/5">
            {selectedFeatures.length === 0 ? (
              <p className="py-2 leading-relaxed text-center text-slate-400">
                💡 <strong>টিউটোরিয়াল:</strong> প্রথমে কাজের ফিচারগুলো সিলেক্ট করুন, তারপর কোনো অকেজো ফিচার (নয়েজ) যোগ করে দেখুন মডেলের নির্ভুলতা কীভাবে ধসে পড়ে।
              </p>
            ) : (
              <div className="space-y-3">
                <p className="font-bold text-indigo-400 text-sm sm:text-base">🔍 নির্বাচিত ফিচারের গাণিতিক প্রভাব বিশ্লেষণ:</p>
                <div className="grid grid-cols-1 gap-3 max-h-[140px] overflow-y-auto pr-1 md:grid-cols-2 scrollbar-thin">
                  {selectedFeatures.map((id) => {
                    const feature = scenario.features.find((item) => item.id === id);
                    return (
                      <div key={id} className={`p-3 rounded-lg border ${feature.isUseful ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-xs font-bold uppercase">{feature.isUseful ? '✅ কাজের ফিচার' : '🚨 অকেজো নয়েজ'}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{feature.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Analysis and Face ID Demo */}
        <div className="flex flex-col justify-between space-y-5 lg:col-span-5 sm:space-y-6">
          <div className="bg-white/[0.02] p-4 sm:p-6 rounded-2xl border border-white/5 shadow-lg space-y-4">
            <h4 className="pb-2 text-sm sm:text-base font-bold border-b text-slate-300 border-white/5">
              🔮 মডেলের ইন্টেলিজেন্স ও ছাঁকনি স্ক্যানার
            </h4>

            <div className="grid items-center grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Sieve Visualizer */}
              <div className="relative flex flex-col items-center justify-center h-40 p-3 overflow-hidden text-center border shadow-inner rounded-xl border-white/5 bg-black/20 sm:h-44 sm:p-4">
                <span className="text-xs uppercase font-bold text-slate-500 absolute top-3">ছাঁকনি (The Sieve)</span>
                {selectedFeatures.length === 0 ? (
                  <div className="mt-4 space-y-2 text-slate-500">
                    <div className="text-4xl opacity-50 animate-bounce">⏳</div>
                    <p className="text-xs font-bold">ছাঁকনি সম্পূর্ণ খালি!</p>
                  </div>
                ) : (
                  <div className="w-full mt-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5 justify-center max-h-[80px] overflow-y-auto pr-1 scrollbar-thin">
                      {selectedFeatures.map((id) => {
                        const feature = scenario.features.find((item) => item.id === id);
                        return (
                          <span key={id} className={`px-2 py-1 rounded-md text-xs font-bold border ${feature.isUseful ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-rose-500/20 border-rose-500/30 text-rose-300 animate-pulse'}`}>
                            {feature.text.substring(0, 12)}...
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Accuracy Scanner */}
              <div className="relative flex flex-col items-center justify-center h-40 p-3 text-center border shadow-inner rounded-xl border-white/5 bg-black/20 sm:h-44 sm:p-4">
                <span className="text-xs uppercase font-bold text-slate-500 absolute top-3">অ্যাকুরেসি স্ক্যানার</span>
                <div className="w-full px-2 mt-4 space-y-3">
                  <p className={`text-xs sm:text-sm font-bold leading-tight ${metrics.statusColor}`}>{metrics.status}</p>
                  <p className="font-mono text-3xl font-bold tracking-tighter text-white">{metrics.score}%</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 mx-auto">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${metrics.score > 80 ? 'bg-emerald-500' : metrics.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${metrics.score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Face ID Feature Extraction */}
          <div className="bg-white/[0.02] p-4 sm:p-6 rounded-2xl border border-white/5 shadow-lg space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="flex flex-wrap justify-between gap-2 pb-2 text-sm sm:text-base font-bold border-b text-slate-300 border-white/5">
                <span>📸 ফেস আইডি এক্সট্রাকশন</span>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">Live Nodes</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
                স্থির মুখের ছবি থেকে এআই কীভাবে জ্যামিতিক বিন্দুর ফিচার পরিমাপ করে, তা স্লাইডার টেনে দেখুন।
              </p>

              <div className="relative flex items-center justify-center p-3 my-5 overflow-hidden border shadow-inner h-36 sm:h-40 sm:p-4 bg-black/20 rounded-xl border-white/5">
                <svg viewBox="0 0 160 140" className="w-24 h-24 sm:w-28 sm:h-28">
                  <path d="M 80,10 C 120,10 135,45 135,80 C 135,115 110,130 80,130 C 50,130 25,115 25,80 C 25,45 40,10 80,10 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  
                  {/* Eye Distance Feature */}
                  <line x1={80 - faceFeatures.eyeDistance / 2} y1="50" x2={80 + faceFeatures.eyeDistance / 2} y2="50" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx={80 - faceFeatures.eyeDistance / 2} cy="50" r="4" fill="#818cf8" />
                  <circle cx={80 + faceFeatures.eyeDistance / 2} cy="50" r="4" fill="#818cf8" />
                  <text x="80" y="42" fill="#818cf8" fontSize="8" textAnchor="middle" fontWeight="bold">D = {faceFeatures.eyeDistance} mm</text>

                  {/* Nose Length Feature */}
                  <line x1="80" y1="50" x2="80" y2={50 + faceFeatures.noseLength} stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx="80" cy={50 + faceFeatures.noseLength} r="4" fill="#34d399" />
                  <text x="86" y={55 + faceFeatures.noseLength / 2} fill="#34d399" fontSize="8" textAnchor="start" fontWeight="bold">L = {faceFeatures.noseLength}</text>

                  {/* Jaw Width Feature */}
                  <line x1={80 - faceFeatures.jawWidth / 2} y1="105" x2={80 + faceFeatures.jawWidth / 2} y2="105" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="2,2" />
                  <circle cx={80 - faceFeatures.jawWidth / 2} cy="105" r="4" fill="#f472b6" />
                  <circle cx={80 + faceFeatures.jawWidth / 2} cy="105" r="4" fill="#f472b6" />
                  <text x="80" y="117" fill="#f472b6" fontSize="8" textAnchor="middle" fontWeight="bold">W = {faceFeatures.jawWidth} mm</text>
                </svg>

                <div className="absolute left-0 w-full h-[2px] bg-indigo-500/50 shadow-[0_0_15px_#4f46e5] top-0 animate-[scan_3s_infinite]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm sm:grid-cols-3 sm:gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">👀 চোখের দূরত্ব:</label>
                <input type="range" min="30" max="80" value={faceFeatures.eyeDistance} onChange={(e) => handleFeatureChange('eyeDistance', e.target.value)} className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg appearance-none" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">👃 নাকের দৈর্ঘ্য:</label>
                <input type="range" min="25" max="70" value={faceFeatures.noseLength} onChange={(e) => handleFeatureChange('noseLength', e.target.value)} className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">👄 চোয়ালের প্রস্থ:</label>
                <input type="range" min="40" max="90" value={faceFeatures.jawWidth} onChange={(e) => handleFeatureChange('jawWidth', e.target.value)} className="w-full accent-pink-500 h-1.5 bg-white/10 rounded-lg appearance-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
