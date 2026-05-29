import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Landmark, Activity, CheckCircle2, XCircle, RefreshCcw, Info, Brain } from 'lucide-react';

export default function SimulationLab() {
    const [activeTab, setActiveTab] = useState('classification');

    // Classification Logic
    const [mailIndex, setMailIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null);

    const mails = [
        { text: "🚨 WIN $50,000 CASH NOW!!! Click the link.", isSpam: true },
        { text: "🗓️ Meeting at 10 AM regarding Project AI.", isSpam: false },
        { text: "🎁 90% Discount on all Rolex watches!", isSpam: true }
    ];

    const handleClassify = (choice) => {
        const correct = mails[mailIndex].isSpam === choice;
        if (correct) setScore(s => s + 10);
        setFeedback(correct ? 'correct' : 'wrong');
        setTimeout(() => {
            setFeedback(null);
            if (mailIndex < mails.length - 1) setMailIndex(mailIndex + 1);
            else setMailIndex(0);
        }, 1500);
    };

    // Regression Logic
    const [houseSize, setHouseSize] = useState(1500);
    const predictedPrice = (houseSize * 250).toLocaleString();

    return (
        <div className="w-full space-y-8 font-sans text-slate-200">

            <div className="pb-4 space-y-3 text-center">
                <h2 className="flex items-center justify-center gap-3 text-xl font-bold text-white sm:text-2xl md:text-3xl">
                    <span className="px-3 py-1 text-xs text-white rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/20">ল্যাব-১৬</span>
                    সুপারভাইজড ট্রেনিং সেন্টার
                </h2>
                <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
                    সঠিক উত্তরের (Label) সাহায্যে মেশিনকে দক্ষ করে তোলার গাণিতিক অভিজ্ঞতা নিন।
                </p>
            </div>

            {/* Simulation Guide Card */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 md:p-6 shadow-md font-sans">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
                    <span className="text-indigo-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
                    এই সিমুলেটরের মাধ্যমে আপনি সুপারভাইজড লার্নিংয়ের প্রধান দুটি কাজ—ক্লাসিফিকেশন (Classification) এবং রিগ্রেশন (Regression) নিজে চালিয়ে দেখতে পারবেন।
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                            <span className="text-base">🏷️</span> ১. ক্লাসিফিকেশন (Classification)
                        </span>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            ইমেইলটি পড়ে সেটি স্প্যাম (Spam) নাকি সাধারণ ইনবক্সের মেইল (Normal) তা লেবেল দিন। আপনার সঠিক/ভুল চিহ্নিতকরণের ওপর ভিত্তি করে এআই-এর ট্রেনিং স্কোর বা Accuracy কীভাবে পরিবর্তিত হচ্ছে তা লক্ষ্য করুন।
                        </p>
                    </div>
                    <div className="bg-[#0b0f19]/60 border border-white/5 p-4 rounded-xl space-y-2">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                            <span className="text-base">📈</span> ২. রিগ্রেশন (Regression)
                        </span>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            স্লাইডার ব্যবহার করে ফ্ল্যাটের আয়তন (sqft) পরিবর্তন করুন। আগে থেকে শিখিয়ে রাখা গাণিতিক প্যাটার্ন বা সূত্র ($Y = f(X)$) অনুসরণ করে মডেলটি কীভাবে রিয়েল-টাইমে ফ্ল্যাটের আনুমানিক মূল্য নির্ধারণ করছে তা দেখুন।
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center bg-white/[0.02] p-1.5 rounded-xl border border-white/5 max-w-xl mx-auto w-full gap-2 shadow-lg">
                <button onClick={() => setActiveTab('classification')} className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'classification' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>🏷️ ক্লাসিফিকেশন</button>
                <button onClick={() => setActiveTab('regression')} className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'regression' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>📈 রিগ্রেশন</button>
            </div>

            <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'classification' ? (
                        <motion.div key="class" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-[#1e2430] p-6 sm:p-10 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl space-y-8">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">ইমেইল স্প্যাম ট্রেইনার</h3>
                                    <p className="text-xs text-slate-500 mt-1">মডেলকে লেবেল দিয়ে শেখান কোনটি স্প্যাম</p>
                                </div>
                                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-indigo-400 font-mono font-bold text-xs sm:text-sm">Accuracy: {score}%</div>
                            </div>

                            <div className="relative p-8 bg-[#12161f] rounded-3xl border border-white/5 shadow-inner text-center">
                                <Mail size={40} className="mx-auto mb-4 text-slate-600 opacity-50" />
                                <p className="text-base sm:text-lg font-bold text-slate-200 leading-relaxed italic">"{mails[mailIndex].text}"</p>

                                <div className="flex justify-center gap-4 mt-10">
                                    <button onClick={() => handleClassify(true)} className="px-6 py-2.5 sm:px-8 sm:py-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-2xl font-bold text-sm sm:text-base hover:bg-rose-500 hover:text-white transition-all active:scale-95">স্প্যাম (Spam)</button>
                                    <button onClick={() => handleClassify(false)} className="px-6 py-2.5 sm:px-8 sm:py-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl font-bold text-sm sm:text-base hover:bg-emerald-500 hover:text-white transition-all active:scale-95">নরমাল (Inbox)</button>
                                </div>

                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`absolute inset-x-0 bottom-[-1.5rem] p-3 rounded-xl font-bold mx-8 sm:mx-20 text-xs sm:text-sm ${feedback === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                            {feedback === 'correct' ? '✨ সঠিক লেবেলিং!' : '❌ ভুল হয়েছে বস!'}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="reg" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-[#1e2430] p-6 sm:p-10 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl space-y-8">
                            <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4">ফ্ল্যাটের দাম ক্যালকুলেটর</h3>

                            <div className="space-y-10">
                                <div className="p-6 bg-[#12161f] rounded-3xl border border-white/5 shadow-inner">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">সাইজ (X)</span>
                                        <span className="text-xl font-black text-indigo-400 font-mono">{houseSize} sqft</span>
                                    </div>
                                    <input type="range" min="500" max="4000" step="50" value={houseSize} onChange={(e) => setHouseSize(parseInt(e.target.value))} className="w-full accent-indigo-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                                </div>

                                <div className="text-center p-8 bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/30 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">প্রেডিকশন রেজাল্ট (Predicted Y)</p>
                                    <h4 className="text-5xl font-black text-white tracking-tighter">৳ {predictedPrice}</h4>
                                    <p className="text-xs text-indigo-400 mt-4 font-bold flex items-center justify-center gap-1"><Brain size={12} /> এই গণনাটি শিখানো প্যাটার্ন (Pattern) থেকে প্রাপ্ত।</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Info size={20} /></div>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        <strong className="text-white">বড় চ্যালেঞ্জ:</strong> সুপারভাইজড লার্নিংয়ে প্রতিটি ডেটার গায়ে সঠিক উত্তর বসানো (যেমন স্প্যাম মেইল বাছাই করা) অনেক সময়সাপেক্ষ এবং ব্যয়বহুল কাজ।
                    </p>
                </div>
            </div>
        </div>
    );
}