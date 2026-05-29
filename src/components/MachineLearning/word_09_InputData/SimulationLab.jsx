import React, { useState } from 'react';

const ingredients = [
  { id: 'mango', name: 'তাজা আম', type: 'good', icon: '🥭', mlExplain: 'উচ্চ মানের ইনপুট (Clean Feature)' },
  { id: 'orange', name: 'তাজা কমলা', type: 'good', icon: '🍊', mlExplain: 'সঠিক ডেটা (Correct Input)' },
  { id: 'milk_sugar', name: 'দুধ ও চিনি', type: 'good', icon: '🥛', mlExplain: 'প্রয়োজনীয় প্যারামিটার (Scaling)' },
  { id: 'rotten_apple', name: 'পচা আপেল', type: 'garbage', icon: '🤢', mlExplain: 'পক্ষপাতদুষ্ট ডেটা (Biased Data)' },
  { id: 'stone', name: 'পাথর / নয়েজ', type: 'noise', icon: '🪨', mlExplain: 'আউটলায়ার / নয়েজ (Outliers)' },
];

export default function SimulationLab() {
  const [blenderIngredients, setBlenderIngredients] = useState([]);
  const [blenderStatus, setBlenderStatus] = useState('idle');
  
  const [dataTypeView, setDataTypeView] = useState('image');
  const [drawGrid, setDrawGrid] = useState(Array(25).fill(0));
  const [inputText, setInputText] = useState('I love AI');

  const handleAddIngredient = (item) => {
    if (blenderIngredients.length >= 3 || blenderIngredients.find((ingredient) => ingredient.id === item.id)) return;
    setBlenderIngredients([...blenderIngredients, item]);
    setBlenderStatus('idle');
  };

  const handleRemoveIngredient = (id) => {
    setBlenderIngredients(blenderIngredients.filter((ingredient) => ingredient.id !== id));
    setBlenderStatus('idle');
  };

  const runBlender = () => {
    if (blenderIngredients.length === 0) return;

    setBlenderStatus('blending');
    setTimeout(() => {
      const hasNoise = blenderIngredients.some((i) => i.type === 'noise');
      const hasGarbage = blenderIngredients.some((i) => i.type === 'garbage');

      if (hasNoise) setBlenderStatus('broken');
      else if (hasGarbage) setBlenderStatus('ready_garbage');
      else setBlenderStatus('ready_good');
    }, 1600);
  };

  const clearBlender = () => {
    setBlenderIngredients([]);
    setBlenderStatus('idle');
  };

  const togglePixel = (idx) => {
    const newGrid = [...drawGrid];
    newGrid[idx] = newGrid[idx] === 0 ? 255 : 0;
    setDrawGrid(newGrid);
  };

  const textToTokens = (str) => str.split('').map((char) => char.charCodeAt(0));

  return (
    <div className="w-full space-y-8 font-sans text-slate-200">
      
      {/* Header Area */}
      <div className="pb-4 space-y-3 text-center">
        <h2 className="flex items-center justify-center gap-3 text-xl font-bold text-white sm:text-2xl md:text-3xl">
          <span className="px-3 py-1 text-xs text-teal-400 border rounded-full bg-teal-500/20 border-teal-500/30 sm:px-3">ল্যাব-০৯</span>
          ইনপুট ডেটা (Input Data)
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-400">
          ডেটাসেট হলো বিশাল ভাঁড়ারঘর, আর ইনপুট ডেটা হলো সেই ভাঁড়ারঘর থেকে প্রসেস করার জন্য নির্দিষ্ট মুহূর্তে ব্লেন্ডারে দেওয়া ফলের টুকরো।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-teal-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি দেখতে পাবেন কীভাবে ডেটাসেট থেকে ইনপুট ডেটা (Input Data) সংগ্রহ করে এআই প্রসেস করে এবং মানুষ বনাম মেশিনের ডেটা দেখার পদ্ধতির পার্থক্য কী।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-teal-300 flex items-center gap-1.5">
              <span className="text-base">🧺</span> ১. ভাঁড়ারঘর বনাম ব্লেন্ডার
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ব্লেন্ডারে ৩টি ফলের ইনপুট দিন। তাজা আম, দুধ-চিনির মতো সঠিক ডেটা দিলে সুস্বাদু জুস (সফল আউটপুট) পাবেন। কিন্তু পচা ফল (Biased Data) বা পাথর (Noise) দিলে জুস নষ্ট হবে অথবা সিস্টেম ক্র্যাশ করবে!
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">👁️</span> ২. মানুষের ডেটা পারসেপশন
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              ডান পাশের "মানুষ যা দেখে" অংশে গ্রিডে ছবি আঁকুন অথবা ইনপুট বক্সে টেক্সট লিখুন। মানুষ হিসেবে আমরা সরাসরি ইমেজ, ভাষা বা শরীরের তাপমাত্রা সরাসরি পড়তে ও বুঝতে পারি।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">🧠</span> ৩. মেশিনের ডিজিটাল রিপ্রেজেন্টেশন
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              "মেশিনে যা পৌঁছায়" অংশে লাইভ পরিবর্তন লক্ষ্য করুন। ছবিকে মেশিন দেখবে বাইনারি পিক্সেল ম্যাট্রিক্স হিসেবে, টেক্সটকে দেখবে ASCII কোড বা টোকেন আইডি হিসেবে আর অডিওকে দেখবে ফ্রিকোয়েন্সি ডেটা হিসেবে।
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-stretch grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Side: Blender Simulation */}
        <div className="lg:col-span-5 bg-white/[0.02] p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between gap-3 pb-2 mb-4 border-b border-white/5">
              <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-teal-400">
                <span>🧺</span> ভাঁড়ারঘর বনাম ব্লেন্ডার
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              নিচের উপাদানগুলোতে ক্লিক করে ব্লেন্ডারে ইনপুট ডেটা হিসেবে ৩টি উপাদান ভরুন এবং প্রসেস করে দেখুন কী আউটপুট বের হয়।
            </p>

            <div className="flex flex-col gap-2 mb-6">
              {ingredients.map((item) => {
                const isAdded = blenderIngredients.find((i) => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    disabled={isAdded || blenderStatus === 'blending'}
                    onClick={() => handleAddIngredient(item)}
                    className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between ${
                      isAdded
                        ? 'bg-black/40 border-black/40 text-slate-600 cursor-not-allowed shadow-inner'
                        : 'bg-black/20 border-white/5 hover:border-teal-500/50 text-slate-300 hover:text-white shadow-sm'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-left">
                      <span className="text-lg bg-black/40 px-1.5 py-1 rounded-lg shadow-inner">{item.icon}</span>
                      <span>
                        <span className="block text-xs sm:text-sm font-bold">{item.name}</span>
                        <span className="block text-xs text-teal-400/80 font-normal mt-0.5">{item.mlExplain}</span>
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500 font-normal">যোগ করুন +</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0b0f19] p-5 rounded-2xl border border-white/5 text-center relative h-52 flex flex-col justify-center items-center shadow-inner">
            {blenderStatus === 'idle' && (
              <div className="space-y-3">
                <div className="text-5xl animate-bounce opacity-80">🥛</div>
                <p className="text-xs sm:text-sm text-slate-400">ব্লেন্ডার খালি। ইনপুট ডেটা যোগ করুন।</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {blenderIngredients.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleRemoveIngredient(item.id)}
                      className="bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded-lg text-xs text-teal-300 font-bold hover:bg-rose-500/20 hover:border-rose-500/30 hover:text-rose-400 flex items-center gap-1 transition-colors"
                    >
                      {item.icon} {item.name} ×
                    </button>
                  ))}
                </div>
              </div>
            )}

            {blenderStatus === 'blending' && (
              <div className="space-y-3">
                <div className="inline-block text-5xl animate-spin">🌀</div>
                <p className="text-xs sm:text-sm text-teal-400 font-bold tracking-widest uppercase">প্রসেসিং চলছে...</p>
              </div>
            )}

            {blenderStatus === 'ready_good' && (
              <div className="space-y-2 animate-fade-in">
                <div className="text-6xl">🍹✨</div>
                <p className="text-base sm:text-lg font-bold text-emerald-400">সফল আউটপুট: সুস্বাদু জুস!</p>
                <p className="text-xs sm:text-sm text-slate-400">সঠিক ও পরিষ্কার ইনপুট ডেটা ব্যবহার করা হয়েছে।</p>
              </div>
            )}

            {blenderStatus === 'ready_garbage' && (
              <div className="space-y-2 animate-fade-in">
                <div className="text-6xl">🤢🤮</div>
                <p className="text-base sm:text-lg font-bold text-rose-400">GIGO এফেক্ট: পচা নোংরা জুস!</p>
                <p className="text-xs sm:text-sm text-rose-300/80">পচা ফল ইনপুট দেওয়ায় আউটপুটও নষ্ট হয়েছে।</p>
              </div>
            )}

            {blenderStatus === 'broken' && (
              <div className="space-y-2 animate-fade-in">
                <div className="text-6xl">💥🪨</div>
                <p className="text-base sm:text-lg font-bold text-red-500">সিস্টেম ক্র্যাশ! ব্লেন্ডার ভেঙে গেছে।</p>
                <p className="text-xs sm:text-sm text-slate-400">কারণ ইনপুটে পাথর বা নয়েজ দেওয়া হয়েছে।</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={runBlender}
              disabled={blenderIngredients.length === 0 || blenderStatus === 'blending'}
              className="flex-[2] py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 text-xs sm:text-sm font-bold text-white rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              🚀 ব্লেন্ডার চালান (Process)
            </button>
            <button
              onClick={clearBlender}
              className="flex-1 py-3 text-xs sm:text-sm font-bold transition-colors border bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 rounded-xl"
            >
              রিসেট
            </button>
          </div>
        </div>

        {/* Right Side: How Machine sees data */}
        <div className="lg:col-span-7 bg-white/[0.02] p-4 sm:p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-6 shadow-lg">
          <div>
            <h3 className="flex items-center gap-2 pb-2 mb-2 text-base sm:text-lg font-bold text-white border-b border-white/5">
              <span className="text-teal-400">🧠</span> মেশিন ইনপুটকে কীভাবে দেখে?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
              মানুষ ছবি দেখে বা কথা শোনে, কিন্তু মেশিন সেই ডেটাকে গাণিতিক বা ডিজিটাল ফর্মে ইনপুট হিসেবে নেয়।
            </p>

            <div className="grid grid-cols-2 gap-2 mb-6 text-center sm:grid-cols-4">
              {[
                { id: 'image', label: 'ইমেজ', icon: '🖼️' },
                { id: 'text', label: 'টেক্সট', icon: '🔤' },
                { id: 'numeric', label: 'নিউমেরিক', icon: '📈' },
                { id: 'audio', label: 'অডিও', icon: '🎵' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDataTypeView(type.id)}
                  className={`p-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                    dataTypeView === type.id
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 shadow-md scale-[1.02]'
                      : 'bg-black/20 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="block mb-1 text-lg">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Human View */}
              <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 text-center min-h-52 flex flex-col justify-center items-center overflow-hidden shadow-inner">
                <span className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-4 border-b border-white/5 pb-1">মানুষ যা দেখে</span>

                {dataTypeView === 'image' && (
                  <div className="flex flex-col items-center w-full space-y-3">
                    <div className="grid w-24 grid-cols-5 gap-1">
                      {drawGrid.map((pixel, idx) => (
                        <button
                          key={idx}
                          onClick={() => togglePixel(idx)}
                          className={`aspect-square rounded ${pixel === 255 ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-white/5'} border border-white/10 transition-colors`}
                        />
                      ))}
                    </div>
                    <button onClick={() => setDrawGrid(Array(25).fill(0))} className="text-xs text-teal-400 hover:text-teal-200 font-bold">
                      গ্রিড পরিষ্কার করুন
                    </button>
                  </div>
                )}

                {dataTypeView === 'text' && (
                  <div className="w-full px-4 space-y-3 text-center">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(event) => setInputText(event.target.value)}
                      className="w-full bg-white/5 border border-white/10 p-2.5 rounded-lg text-xs font-bold text-center text-teal-300 focus:outline-none focus:border-teal-500 transition-colors"
                    />
                    <p className="text-xs text-slate-500">লেখা পরিবর্তন করে ডানে লাইভ টোকেন দেখুন।</p>
                  </div>
                )}

                {dataTypeView === 'numeric' && (
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-emerald-400">৩৮.৫°<span className="text-lg">C</span></p>
                    <p className="text-xs text-slate-400">মানুষের দেহের তাপমাত্রা</p>
                  </div>
                )}

                {dataTypeView === 'audio' && (
                  <div className="space-y-2">
                    <div className="text-5xl animate-pulse">🗣️</div>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium">"Siri, weather update please!"</p>
                  </div>
                )}
              </div>

              {/* Machine View */}
              <div className="bg-[#0b0f19] p-4 rounded-xl border border-white/5 text-center min-h-52 flex flex-col justify-center items-center font-mono overflow-hidden shadow-inner relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
                <span className="text-xs uppercase tracking-widest font-bold text-teal-500 mb-4 border-b border-teal-500/20 pb-1 z-10">মেশিনে যা পৌঁছায়</span>

                {dataTypeView === 'image' && (
                  <div className="text-xs text-teal-300 bg-teal-500/5 p-2 rounded-lg border border-teal-500/20 w-full leading-relaxed z-10">
                    [<br />
                    <span className="opacity-70">&nbsp;&nbsp;[{drawGrid.slice(0, 5).join(', ')}],</span><br />
                    <span className="opacity-70">&nbsp;&nbsp;[{drawGrid.slice(5, 10).join(', ')}],</span><br />
                    <span className="opacity-70">&nbsp;&nbsp;[{drawGrid.slice(10, 15).join(', ')}],</span><br />
                    <span className="opacity-70">&nbsp;&nbsp;[{drawGrid.slice(15, 20).join(', ')}],</span><br />
                    <span className="opacity-70">&nbsp;&nbsp;[{drawGrid.slice(20, 25).join(', ')}]</span><br />
                    ]<span className="text-[10px] text-teal-500/60 font-sans block mt-1 uppercase tracking-widest text-center">Pixel Matrix</span>
                  </div>
                )}

                {dataTypeView === 'text' && (
                  <div className="z-10 w-full p-4 text-xs text-teal-300 border rounded-lg bg-teal-500/5 border-teal-500/20">
                    <p className="mb-2 text-xs text-teal-500 font-sans uppercase tracking-widest">ASCII Character ID:</p>
                    <p className="font-bold leading-relaxed tracking-widest text-white break-words text-xs">[ {textToTokens(inputText).join(', ')} ]</p>
                  </div>
                )}

                {dataTypeView === 'numeric' && (
                  <div className="z-10 p-4 text-xs text-teal-300 border rounded-lg bg-teal-500/5 border-teal-500/20">
                    <p className="text-2xl font-bold tracking-widest text-white">38.50000</p>
                    <span className="text-xs text-teal-500 font-sans block mt-2 uppercase tracking-widest">Float Value</span>
                  </div>
                )}

                {dataTypeView === 'audio' && (
                  <div className="text-xs text-teal-300 bg-teal-500/5 p-3 rounded-lg border border-teal-500/20 w-full z-10">
                    <div className="flex items-center justify-center gap-1.5 mb-3 h-8">
                      <span className="w-1 h-full bg-teal-500 rounded-full animate-pulse" />
                      <span className="h-3/4 w-1 bg-teal-500 animate-pulse [animation-delay:0.2s] rounded-full" />
                      <span className="h-full w-1 bg-teal-400 animate-pulse [animation-delay:0.4s] rounded-full" />
                      <span className="h-1/2 w-1 bg-teal-500 animate-pulse [animation-delay:0.1s] rounded-full" />
                      <span className="h-1/4 w-1 bg-teal-600 animate-pulse [animation-delay:0.3s] rounded-full" />
                    </div>
                    <p className="text-white text-xs font-bold">[44.1 kHz, Amp: 0.88]</p>
                    <span className="text-[10px] text-teal-500/70 font-sans block mt-1 uppercase tracking-widest">Sound Frequency Data</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-teal-500/10 p-4 rounded-xl text-xs sm:text-sm text-teal-200 leading-relaxed border border-teal-500/20">
            <strong>রিমিশার টেক-ইনসাইট:</strong> মানুষের কাছে যেটা অভিজ্ঞতা, কম্পিউটারের কাছে সেটাই হলো ডেটা। ডেটা ছাড়া মেশিন লার্নিংয়ের গাড়ি একদম নিথর হয়ে দাঁড়িয়ে থাকবে।
          </div>
        </div>
      </div>
    </div>
  );
}
