import React, { useState, useEffect } from 'react';

export default function SimulationLab() {
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [chatLog, setChatLog] = useState({ X: [], Y: [] });
  const [isTyping, setIsTyping] = useState(false);
  const [turingGuess, setTuringGuess] = useState(null);
  const [guessResult, setGuessResult] = useState(null);
  const [aiRoom, setAiRoom] = useState('X');

  useEffect(() => {
    setAiRoom(Math.random() > 0.5 ? 'X' : 'Y');
  }, []);

  const turingQuestions = [
    { id: 'q1', text: "স্যার, ২+২ কত হয়?" },
    { id: 'q2', text: "তুমি কি গান শুনতে ভালোবাসো?" },
    { id: 'q3', text: "তোমার সাথে কথা বলতে ভালো লাগছে!" },
    { id: 'q4', text: "তুমি কি রোবট নাকি রক্তমাংসের মানুষ?" }
  ];

  const responses = {
    AI: {
      q1: "গাধা নাকি তুমি? এই বয়সে এসে ২+২ জিজ্ঞেস করছ? যাও, ক্লাস টু-এর বই পড়ে আসো!",
      q2: "গান? আমার তো কোনো কান নেই ভাই। তবে আমার সিস্টেমে লাখ লাখ অডিও ফাইল স্টোরড আছে!",
      q3: "ধন্যবাদ। আমি শুধু আপনাকে তথ্য দিয়ে সাহায্য করার জন্য তৈরি করা হয়েছি।",
      q4: "আমি একটি কম্পিউটার প্রোগ্রাম বা লার্জ ল্যাঙ্গুয়েজ মডেল যা গুগলের..."
    },
    Human: {
      q1: "উমম... ২ আর ২ তো ৪ হয়! কিন্তু হঠাৎ এই সহজ হিসাব কেন? হা হা!",
      q2: "আহ! বৃষ্টির দিনে রবীন্দ্রসংগীত শুনতে দারুন লাগে। আপনার কোন ধরনের গান পছন্দ?",
      q3: "আরেহ থ্যাংক ইউ! আপনার সাথে আড্ডা দিয়েও খুব ভালো লাগছে ভাইয়া/আপু।",
      q4: "হাহাহা, রক্তমাংসের মানুষই তো! কেন, আমার টাইপিং কি রোবটের মতো লাগছে নাকি?"
    }
  };

  const handleAskQuestion = (question) => {
    if (isTyping || askedQuestions.includes(question.id)) return;

    setAskedQuestions(prev => [...prev, question.id]);
    setIsTyping(true);

    const responseX = aiRoom === 'X' ? responses.AI[question.id] : responses.Human[question.id];
    const responseY = aiRoom === 'Y' ? responses.AI[question.id] : responses.Human[question.id];

    setChatLog(prev => ({
      X: [...prev.X, { sender: 'judge', text: question.text }],
      Y: [...prev.Y, { sender: 'judge', text: question.text }]
    }));

    setTimeout(() => {
      setChatLog(prev => ({
        X: [...prev.X, { sender: 'respondent', text: responseX }],
        Y: [...prev.Y, { sender: 'respondent', text: responseY }]
      }));
      setIsTyping(false);
    }, 1500);
  };

  const handleTuringGuess = (room) => {
    setTuringGuess(room);
    setGuessResult(room === aiRoom ? 'correct' : 'wrong');
  };

  const resetTuringGame = () => {
    setAskedQuestions([]);
    setChatLog({ X: [], Y: [] });
    setTuringGuess(null);
    setGuessResult(null);
    setAiRoom(Math.random() > 0.5 ? 'X' : 'Y');
  };

  return (
    <div className="w-full space-y-6 font-sans md:space-y-8 text-slate-200">
      {/* Header Area */}
      <div className="pb-3 space-y-3 text-center sm:pb-4">
        <div className="flex flex-col items-center gap-2">
          <span className="bg-[#5b5dfa]/20 text-[#5b5dfa] border border-[#5b5dfa]/30 text-xs sm:text-sm px-2.5 py-1 rounded-full">
            ল্যাব-০২
          </span>
          <h2 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
            টুরিং টেস্ট (Turing Test)
          </h2>
        </div>
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-400 px-2 sm:px-0">
          মেশিনের মানুষের মতো বুদ্ধিমত্তা আচরণ বা অনুকরণ করার ক্ষমতা যাচাইয়ের ঐতিহাসিক পরীক্ষা।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-purple-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই ল্যাবরেটরিতে আপনি নিজেই একজন "বিচারক" বা Judge-এর ভূমিকা পালন করবেন। আপনার কাজ হলো বন্ধ ঘরের আড়ালে থাকা দুটি রুমের (রুম X এবং রুম Y) সাথে চ্যাট করে বের করা—কোনটিতে আসল মানুষ আছে আর কোনটিতে কৃত্রিম বুদ্ধিমত্তা (AI) লুকিয়ে আছে!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <span className="text-base">💬</span> ১. বিচারক হিসেবে প্রশ্ন করুন
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              নিচের প্যানেল থেকে যেকোনো একটি প্রশ্ন সিলেক্ট করে বাটনে ক্লিক করুন। আপনার প্রশ্নটি একই সাথে রুম X এবং রুম Y-তে পাঠানো হবে। তারা উত্তর লিখতে কিছুটা সময় নেবে।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">🕵️‍♂️</span> ২. পার্থক্য লক্ষ্য করুন
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              দুই রুমের উত্তরগুলো মনোযোগ দিয়ে পড়ুন। মানুষের জবাবে ইমোশন বা আবেগ থাকবে আর এআই-এর জবাব কিছুটা যান্ত্রিক, রোবোটিক বা ব্যাকরণগতভাবে অতি-নিখুঁত হতে পারে।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">🚨</span> ৩. রায় ও চীনা ঘর
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              কমপক্ষে ২টি প্রশ্ন করার পর নিচে "ভোট দেওয়ার" অপশন চালু হবে। ভোট দিয়ে দেখুন আপনি সঠিক রুমটি চিনতে পারলেন কি না! পাশে চীনা ঘরের যুক্তির গুরুত্বও পড়ে নিন।
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 md:gap-6">
        
        {/* Main Interactive Area */}
        <div className="space-y-5 lg:col-span-2 md:space-y-6">
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden shadow-lg">
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
                <h3 className="flex items-center gap-2 text-base font-bold text-purple-400 sm:text-lg">
                  <span>🕵️‍♂️</span> কে মানুষ আর কে এআই?
                </h3>
                <button onClick={resetTuringGame} className="text-xs sm:text-sm bg-white/5 hover:bg-white/10 text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-white/10 transition-colors self-start sm:self-auto">
                  🔄 রিসেট
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-5 sm:gap-6 sm:mb-6 md:grid-cols-2">
                {/* Room X */}
                <div className="bg-white/[0.02] rounded-xl border border-white/5 p-3 sm:p-4 flex flex-col h-[220px] sm:h-[280px]">
                  <span className="bg-purple-500/10 text-purple-300 text-xs uppercase font-bold px-3 py-1 rounded border border-purple-500/20 self-start mb-3">🚪 রুম X</span>
                  <div className="flex-1 pr-1 sm:pr-2 space-y-3 overflow-y-auto text-xs sm:text-sm scrollbar-thin">
                    {chatLog.X.length === 0 ? <p className="mt-16 italic text-center text-slate-500">রুম X এখনো কোনো বার্তা পায়নি</p> : chatLog.X.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === 'judge' ? 'items-end' : 'items-start'}`}>
                        <span className={`px-3 py-2 rounded-lg max-w-[92%] leading-relaxed ${msg.sender === 'judge' ? 'bg-[#4f46e5]/20 text-indigo-200 rounded-tr-none' : 'bg-white/10 text-slate-300 rounded-tl-none'}`}>{msg.text}</span>
                      </div>
                    ))}
                    {isTyping && <div className="flex justify-start"><span className="text-slate-400 text-xs animate-pulse">টাইপ করছে...</span></div>}
                  </div>
                </div>

                {/* Room Y */}
                <div className="bg-white/[0.02] rounded-xl border border-white/5 p-3 sm:p-4 flex flex-col h-[220px] sm:h-[280px]">
                  <span className="bg-purple-500/10 text-purple-300 text-xs uppercase font-bold px-3 py-1 rounded border border-purple-500/20 self-start mb-3">🚪 রুম Y</span>
                  <div className="flex-1 pr-1 sm:pr-2 space-y-3 overflow-y-auto text-xs sm:text-sm scrollbar-thin">
                    {chatLog.Y.length === 0 ? <p className="mt-16 italic text-center text-slate-500">রুম Y এখনো কোনো বার্তা পায়নি</p> : chatLog.Y.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.sender === 'judge' ? 'items-end' : 'items-start'}`}>
                        <span className={`px-3 py-2 rounded-lg max-w-[92%] leading-relaxed ${msg.sender === 'judge' ? 'bg-[#4f46e5]/20 text-indigo-200 rounded-tr-none' : 'bg-white/10 text-slate-300 rounded-tl-none'}`}>{msg.text}</span>
                      </div>
                    ))}
                    {isTyping && <div className="flex justify-start"><span className="text-slate-400 text-xs animate-pulse">টাইপ করছে...</span></div>}
                  </div>
                </div>
              </div>

              {/* Questions Area */}
              <div className="bg-white/[0.02] p-3 sm:p-4 rounded-xl border border-white/5 mb-5 sm:mb-6">
                <p className="text-xs sm:text-sm text-slate-400 mb-3 uppercase tracking-wider font-bold">বিচারক (Judge) হিসেবে প্রশ্ন করুন:</p>
                <div className="flex flex-wrap gap-2">
                  {turingQuestions.map(q => {
                    const isAsked = askedQuestions.includes(q.id);
                    return (
                      <button key={q.id} disabled={isAsked || isTyping || turingGuess !== null} onClick={() => handleAskQuestion(q)} className={`w-full sm:w-auto px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${isAsked ? 'bg-white/5 border-transparent text-slate-600 cursor-not-allowed' : 'bg-white/5 border-purple-500/30 hover:border-purple-500 text-purple-200'}`}>
                        <span>💬</span> {q.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Final Guess Area */}
              {askedQuestions.length >= 2 && turingGuess === null && (
                <div className="p-4 space-y-4 text-center border sm:p-6 bg-amber-500/10 border-amber-500/20 rounded-xl animate-fade-in">
                  <p className="text-sm sm:text-base font-bold text-amber-400">🚨 আপনি বিচারক! এবার রায় দিন: কোনটি এআই (AI)?</p>
                  <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                    <button onClick={() => handleTuringGuess('X')} className="bg-purple-600/80 hover:bg-purple-600 text-white font-bold px-4 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base transition-all border border-purple-500/50">🚪 রুম X হলো এআই</button>
                    <button onClick={() => handleTuringGuess('Y')} className="bg-purple-600/80 hover:bg-purple-600 text-white font-bold px-4 sm:px-6 py-2.5 rounded-lg text-sm sm:text-base transition-all border border-purple-500/50">🚪 রুম Y হলো এআই</button>
                  </div>
                </div>
              )}

              {/* Result Area */}
              {turingGuess !== null && (
                <div className={`p-4 sm:p-6 rounded-xl border text-center space-y-2 ${guessResult === 'correct' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : 'bg-rose-500/10 border-rose-500/20 text-rose-200'}`}>
                  <h4 className="text-base font-bold sm:text-lg">{guessResult === 'correct' ? '🎉 সফল টুরিং টেস্ট!' : '❌ আপনি ধোঁকা খেয়েছেন!'}</h4>
                  <p className="text-sm sm:text-base leading-relaxed opacity-90">{guessResult === 'correct' ? `সঠিক রায়! রুম ${aiRoom}-এ ছিল আমাদের কৃত্রিম এআই। আপনি মানুষ এবং এআই সঠিকভাবে আলাদা করতে পেরেছেন!` : `রুম ${aiRoom}-এ ছিল আমাদের কৃত্রিম এআই চ্যাটবট। কিন্তু তার নিখুঁত অভিনয় আপনাকে বিভ্রান্ত করে দিয়েছে! এটাই হলো টুরিং টেস্টের ম্যাজিক!`}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="self-start space-y-5 lg:col-span-1 md:space-y-6 lg:sticky lg:top-6">
          <div className="bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="flex items-center gap-2 pb-3 text-sm sm:text-base font-bold text-white border-b border-white/5">
              <span className="text-rose-400">🇨🇳</span> চীনা ঘরের যুক্তি
            </h3>
            <div className="bg-[#0b0f19] p-3 sm:p-4 rounded-xl border border-white/5 text-xs sm:text-sm text-slate-300 space-y-3">
              <p>আপনাকে একটি বন্ধ ঘরে কিছু চীনা লিপির বই এবং ইংরেজি গাইডবুক দিয়ে বসিয়ে দেওয়া হলো। আপনি চীনা ভাষা বোঝেন না।</p>
              <p>কেউ চীনা ভাষায় চিঠি দিলে আপনি গাইডবুকের নিয়ম মিলিয়ে চীনা অক্ষরেই উত্তর লিখে দিলেন।</p>
              <p className="border-t border-white/5 pt-2 text-[#d8b4fe] font-semibold leading-relaxed">বাহিরের লোক ভাববে আপনি চীনা ভাষা বোঝেন (টুরিং টেস্ট পাস)। কিন্তু বাস্তবে আপনি ভাষা না বুঝেই স্রেফ "নকল" করেছেন!</p>
            </div>
            <div className="text-xs sm:text-sm text-slate-400 bg-white/5 p-3 rounded-lg leading-relaxed italic text-center">
              "মেশিন কেবল মানুষের বুদ্ধিমত্তা নকল করতে পারে, নিজস্ব কোনো চেতনা বা বোধ তৈরি করতে পারে না।"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
