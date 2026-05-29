import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, CheckCircle, XCircle, Smartphone, Landmark, Activity, ChevronRight, RefreshCcw } from 'lucide-react';

export default function SimulationLab() {
  const [activeTab, setActiveTab] = useState('loan');
  
  // --- Loan States ---
  const [income, setIncome] = useState(45000);
  const [debt, setDebt] = useState(20000);
  const [credit, setCredit] = useState('good');
  const [animStep, setAnimStep] = useState(0); // 0:idle, 1:income, 2:debt, 3:final
  const [loanResult, setLoanResult] = useState(null);

  // --- Phone States ---
  const [budget, setBudget] = useState(60000);
  const [camera, setCamera] = useState(48);
  const phonePool = Array.from({length: 40}, (_, i) => ({
    id: i,
    price: 20000 + (i * 2000),
    cam: [12, 48, 64, 108][i % 4]
  }));
  const filtered = phonePool.filter(p => p.price <= budget && p.cam >= camera);

  const startLoanProcess = () => {
    setAnimStep(1);
    setLoanResult(null);
    setTimeout(() => setAnimStep(2), 1000);
    setTimeout(() => {
      setAnimStep(3);
      if (income > 30000 && debt < 50000 && credit === 'good') setLoanResult('APPROVED');
      else setLoanResult('REJECTED');
    }, 2000);
  };

  return (
    <div className="w-full space-y-8 font-sans text-slate-200">
      
      {/* Header Area */}
      <div className="pb-4 space-y-3 text-center">
        <h2 className="flex items-center justify-center gap-3 text-xl font-bold text-white sm:text-2xl md:text-3xl">
          <span className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-full shadow-lg">ল্যাব-১৪</span>
          ডিসিশন প্রসেস ল্যাব
        </h2>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
          তথ্য যাচাই করে ধাপে ধাপে গাণিতিক সিদ্ধান্তে পৌঁছানোর প্রক্রিয়াটি লাইভ দেখুন।
        </p>
      </div>

      {/* Simulation Guide Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 md:p-6 shadow-md font-sans">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
          <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          এই সিমুলেটরের মাধ্যমে আপনি সিদ্ধান্ত গ্রহণ প্রক্রিয়া (Decision Process)-এর কাজ এবং বিভিন্ন ইনপুট ফিল্টারের লাইভ লজিক্যাল প্রভাব পরীক্ষা করতে পারবেন।
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span className="text-base">🏦</span> ১. লোন গোলকধাঁধা (Loan Decision)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              স্লাইডার ব্যবহার করে মাসিক আয় এবং বকেয়া ঋণ পরিবর্তন করুন। ক্রেডিট রেকর্ড নির্বাচন করে "সিদ্ধান্ত প্রক্রিয়া শুরু করুন" ক্লিক করুন। দেখুন কীভাবে গাণিতিক শর্ত অনুযায়ী এআই লোন অনুমোদন বা বাতিল করে।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#d8b4fe] flex items-center gap-1.5">
              <span className="text-base">🌳</span> ২. ডিসিশন পাথ ভিজ্যুয়ালাইজার
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              লোন প্রসেস চলাকালে প্রতিটি ধাপের (যেমন: আয় কি ৳৩০,০০০ এর বেশি?) লজিক কীভাবে ধাপে ধাপে যাচাই করা হচ্ছে, তার লাইভ অ্যানিমেটেড ট্র্যাক ও সবুজ হাইলাইট পথ দেখুন।
            </p>
          </div>
          <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="font-bold text-[#fbcfe8] flex items-center gap-1.5">
              <span className="text-base">📱</span> ৩. ফোন ক্রয়ের ছাঁকনি (Phone Elimination)
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              "ফোন এলিমিনেশন" ট্যাবে যান। বাজেট এবং ন্যূনতম ক্যামেরা সেটিংস পরিবর্তন করুন। শর্ত পরিবর্তন করার সাথে সাথে গ্রিডে থাকা ৪০টি ফোনের মধ্যে কোনগুলো বাদ পড়ছে এবং কোনগুলো অবশিষ্ট থাকছে, তা সরাসরি দেখুন।
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex justify-center bg-white/[0.02] p-1.5 rounded-xl border border-white/5 max-w-md mx-auto w-full gap-2 shadow-lg">
        <button onClick={() => setActiveTab('loan')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${activeTab === 'loan' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>🏦 লোন গোলকধাঁধা</button>
        <button onClick={() => setActiveTab('phone')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all ${activeTab === 'phone' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>📱 ফোন এলিমিনেশন</button>
      </div>

      <div className="grid items-stretch grid-cols-1 gap-8 lg:grid-cols-12">
        {activeTab === 'loan' ? (
          <>
            <div className="lg:col-span-5 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl space-y-6">
              <h3 className="flex items-center gap-2 pb-3 text-base sm:text-lg font-bold text-indigo-400 border-b border-gray-700"><span>📊</span> লোন ইনপুট সেটিংস</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 text-xs sm:text-sm font-bold"><span>💰 মাসিক আয়:</span><span className="text-indigo-400 font-bold">৳{income.toLocaleString()}</span></div>
                  <input type="range" min="10000" max="100000" step="5000" value={income} onChange={(e)=>setIncome(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none accent-indigo-500" />
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-xs sm:text-sm font-bold"><span>💸 বকেয়া লোন:</span><span className="text-rose-400 font-bold">৳{debt.toLocaleString()}</span></div>
                  <input type="range" min="0" max="100000" step="5000" value={debt} onChange={(e)=>setDebt(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none accent-rose-500" />
                </div>
                <div>
                  <span className="block mb-2 text-xs sm:text-sm font-bold">💳 ক্রেডিট রেকর্ড:</span>
                  <div className="flex gap-2">
                    <button onClick={()=>setCredit('good')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-all ${credit==='good'?'bg-emerald-500/20 border-emerald-500 text-emerald-300':'bg-black/20 border-gray-700 text-slate-500'}`}>ভালো</button>
                    <button onClick={()=>setCredit('bad')} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-all ${credit==='bad'?'bg-rose-500/20 border-rose-500 text-rose-300':'bg-black/20 border-gray-700 text-slate-500'}`}>খারাপ</button>
                  </div>
                </div>
              </div>
              <button onClick={startLoanProcess} disabled={animStep > 0 && animStep < 3} className="flex items-center justify-center w-full gap-2 py-4 font-black text-white transition-all bg-indigo-600 shadow-lg hover:bg-indigo-500 rounded-xl">
                {animStep > 0 && animStep < 3 ? <Activity className="animate-spin" size={20}/> : <GitFork size={20}/>}
                {animStep > 0 && animStep < 3 ? 'প্রসেসিং হচ্ছে...' : 'সিদ্ধান্ত প্রক্রিয়া শুরু করুন'}
              </button>
            </div>

            <div className="lg:col-span-7 bg-[#1e2430] p-4 sm:p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col justify-between min-h-[350px]">
              <h3 className="pb-3 mb-6 text-base sm:text-lg font-bold text-white border-b border-gray-700">🌳 ডিসিশন পাথ ভিজ্যুয়ালাইজার</h3>
              <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                 <div className={`p-4 rounded-xl border transition-all duration-500 ${animStep >= 1 ? 'border-indigo-500 bg-indigo-500/10 shadow-lg font-bold' : 'border-gray-800 opacity-40'}`}>
                    <p className="text-xs sm:text-sm font-bold">Step 1: আয় কি ৳৩০,০০০ এর বেশি?</p>
                    <p className="text-xs sm:text-sm text-indigo-400 mt-1 font-bold">{income > 30000 ? '➔ হ্যাঁ (Yes)' : '➔ না (No)'}</p>
                 </div>
                 <div className={`w-0.5 h-8 bg-gray-700 ${animStep >= 2 ? 'bg-indigo-500' : ''}`} />
                 <div className={`p-4 rounded-xl border transition-all duration-500 ${animStep >= 2 ? 'border-indigo-500 bg-indigo-500/10 shadow-lg font-bold' : 'border-gray-800 opacity-40'}`}>
                    <p className="text-xs sm:text-sm font-bold">Step 2: বকেয়া কি ৳৫০,০০০ এর কম?</p>
                    <p className="text-xs sm:text-sm text-indigo-400 mt-1 font-bold">{debt < 50000 ? '➔ হ্যাঁ (Yes)' : '➔ না (No)'}</p>
                 </div>
                 <div className={`w-0.5 h-8 bg-gray-700 ${animStep >= 3 ? 'bg-indigo-500' : ''}`} />
                 <AnimatePresence>
                   {animStep === 3 && (
                     <motion.div initial={{scale:0}} animate={{scale:1}} className={`p-6 rounded-2xl border-2 text-center shadow-2xl ${loanResult==='APPROVED' ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'}`}>
                        <div className="mb-2 text-3xl">{loanResult==='APPROVED' ? '✅' : '❌'}</div>
                        <h4 className="text-xl font-black">{loanResult==='APPROVED' ? 'লোন অনুমোদিত!' : 'লোন বাতিল'}</h4>
                        <button onClick={()=>setAnimStep(0)} className="mt-4 text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 mx-auto"><RefreshCcw size={12}/> রিসেট</button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#1e2430] p-4 sm:p-8 rounded-2xl border border-gray-700 shadow-xl">
             <div className="space-y-6">
                <h3 className="flex items-center gap-2 pb-3 text-base sm:text-lg font-bold text-indigo-400 border-b border-gray-700"><span>🛒</span> ফোন ক্রয়ের ছাঁকনি</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2 text-xs sm:text-sm font-bold"><span>💰 সর্বোচ্চ বাজেট:</span><span className="text-indigo-400 font-bold">৳{budget.toLocaleString()}</span></div>
                    <input type="range" min="15000" max="100000" step="5000" value={budget} onChange={(e)=>setBudget(parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none accent-indigo-500" />
                  </div>
                  <div>
                    <span className="block mb-3 text-xs sm:text-sm font-bold">📸 ন্যূনতম ক্যামেরা (MP):</span>
                    <div className="flex gap-2">
                       {[12, 48, 64, 108].map(m => (
                          <button key={m} onClick={()=>setCamera(m)} className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold border transition-all ${camera===m ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md':'bg-black/20 border-gray-700 text-slate-500'}`}>{m}MP</button>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border bg-black/20 rounded-xl border-white/5">
                   <p className="text-sm sm:text-base font-bold text-white">ডিসিশন প্রসেস ফলাফল:</p>
                   <p className="mt-1 text-xs sm:text-sm text-slate-400 font-bold">১০০টি ফোনের মধ্যে আপনার শর্ত পূরণ করেছে <span className="text-lg font-black text-indigo-400">{filtered.length}</span> টি ফোন!</p>
                </div>
             </div>
             <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 shadow-inner overflow-y-auto max-h-[300px] scrollbar-thin">
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                   {phonePool.map(p => {
                     const isMatched = p.price <= budget && p.cam >= camera;
                     return (
                       <div key={p.id} className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-500 ${isMatched ? 'bg-indigo-500/20 border border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] opacity-100' : 'bg-white/5 opacity-10 grayscale scale-90'}`}>
                          📱
                       </div>
                     );
                   })}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}