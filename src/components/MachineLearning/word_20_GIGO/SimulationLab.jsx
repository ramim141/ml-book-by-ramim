import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, Loader2, RefreshCcw, AlertTriangle, CheckCircle2, FlaskConical, Info, Sparkles, Target } from 'lucide-react';

const basket = [
    { id: 'apple', icon: '🍎', name: 'তাজা আপেল', type: 'clean', ml: 'Clean Data' },
    { id: 'orange', icon: '🍊', name: 'তাজা কমলা', type: 'clean', ml: 'Labeled Data' },
    { id: 'fish', icon: '🐟', name: 'পচা মাছ', type: 'garbage', ml: 'Noise/Outlier' },
    { id: 'shoe', icon: '👞', name: 'ছেঁড়া জুতা', type: 'garbage', ml: 'Irrelevant Data' },
    { id: 'nail', icon: '🔩', name: 'মরিচা পেরেক', type: 'corrupt', ml: 'Corrupt File' }
];

export default function SimulationLab() {
    const [hopper, setHopper] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, blending, done
    const [result, setResult] = useState(null);

    const blend = () => {
        if (hopper.length === 0) return;
        setStatus('blending');
        setTimeout(() => {
            const hasCorrupt = hopper.some(i => i.type === 'corrupt');
            const hasGarbage = hopper.some(i => i.type === 'garbage');

            if (hasCorrupt) {
                setResult({ title: 'সিস্টেম ক্র্যাশ!', icon: '💥', acc: 0, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30', desc: 'মরিচা ধরা পেরেকের মতো করাপ্ট ফাইল ইঞ্জিন লক করে দিয়েছে!' });
            } else if (hasGarbage) {
                setResult({ title: 'বিষাক্ত গার্বেজ জুস!', icon: '🤢', acc: 12, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30', desc: 'পচা মাছ বা জুতা ব্লেন্ড করায় আউটপুটও গার্বেজ বের হয়েছে (GIGO)!' });
            } else {
                setResult({ title: 'নিখুঁত এআই জুস!', icon: '🍹', acc: 98, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', desc: 'শুধুমাত্র তাজা ও পরিষ্কার ডেটাসেট ব্যবহার করায় মডেলটি ১০০% সফল।' });
            }
            setStatus('done');
        }, 2000);
    };

    return (
        <div className="w-full font-sans text-slate-200 space-y-8">
            <div className="text-center space-y-3 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
                    <span className="bg-rose-600 text-white text-xs px-3 py-1 rounded-full shadow-lg">ল্যাব-২০</span>
                    জুস ফ্যাক্টরি আর্কেড (GIGO)
                </h2>
                <p className="text-slate-400 text-sm max-w-2xl mx-auto">ব্লেন্ডারে আপনি যা ছুঁড়ে দেবেন, আউটপুট ঠিক সেই কোয়ালিটিরই বের হবে।</p>
            </div>

            {/* Simulation Guide Card */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-950/20 p-5 md:p-6 shadow-xl relative backdrop-blur-md">
                <div className="absolute top-4 right-4 text-rose-500/30"><Sparkles size={24} /></div>
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 sm:text-lg mb-3">
                    <span className="text-rose-400 animate-pulse">💡</span> ল্যাব সিমুলেটর গাইড
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-5">
                    এই সিমুলেটরের মাধ্যমে আপনি GIGO (Garbage In, Garbage Out) নীতিটি হাতে-কলমে পরীক্ষা করে দেখতে পারবেন।
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm">
                    <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-all duration-300">
                        <span className="font-bold text-emerald-400 flex items-center gap-2">
                            <span className="text-lg">🍎</span> ক্লিন ডেটা (তাজা ফল)
                        </span>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            কাঁচামাল বাস্কেট থেকে শুধু তাজা আপেল ও কমলা (Clean Data) ব্লেন্ডারে দিয়ে দেখুন। মডেলটি ১০০% সফলতার সাথে নিখুঁত আউটপুট (এআই জুস) তৈরি করবে।
                        </p>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-rose-500/30 transition-all duration-300">
                        <span className="font-bold text-rose-400 flex items-center gap-2">
                            <span className="text-lg">🐟</span> গার্বেজ ডেটা (পচা মাছ/জুতা)
                        </span>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            তাজা ফলের সাথে পচা মাছ বা ছেঁড়া জুতা (Noise/Outlier) মিশিয়ে ব্লেন্ড করুন। ইনপুট গার্বেজ হওয়ায় এআই মডেল কনফিউজড হয়ে বিষাক্ত গার্বেজ জুস বানাবে। আর মরিচা পেরেক (Corrupt Data) দিলে তো সিস্টেমই ক্র্যাশ করবে!
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative rounded-[2.5rem] bg-[#0b111b] border border-white/5 p-6 md:p-8 lg:p-10 shadow-2xl overflow-hidden">
                {/* Background Grid Pattern for Factory Vibe */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative z-10">
                    {/* Left: Input Basket */}
                    <div className="bg-gradient-to-b from-[#1e2430] to-[#121620] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl space-y-6 flex flex-col">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><ShoppingBag size={20} /></div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">১. কাঁচামাল বাস্কেট</h3>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {basket.map(item => (
                                <button
                                    key={item.id}
                                    disabled={status === 'blending' || hopper.length >= 5}
                                    onClick={() => setHopper([...hopper, item])}
                                    className="group w-full flex items-center justify-between p-3 md:p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all duration-300 disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:bg-white/[0.03] hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-black/40 text-2xl shadow-inner group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-slate-200 group-hover:text-white">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 tracking-wider uppercase mt-1 font-mono">{item.ml}</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-rose-500 font-bold group-hover:bg-rose-500 group-hover:text-white transition-colors">+</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Center: The Blender */}
                    <div className="bg-gradient-to-b from-[#1e2430] to-[#121620] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-32 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none" />
                        
                        <div className="w-full flex items-center gap-3 border-b border-white/5 pb-4 mb-6 z-10">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><RefreshCcw size={20} /></div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">২. ব্লেন্ডার হপার</h3>
                        </div>

                        <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full">
                            {/* Machine Top */}
                            <div className="w-24 h-4 bg-slate-700 rounded-t-xl border-t border-x border-slate-500 shadow-inner z-20"></div>
                            
                            {/* Glass Hopper */}
                            <div className={`w-40 h-56 bg-black/50 rounded-b-[2.5rem] rounded-t-sm border-4 border-slate-700 relative overflow-hidden flex flex-col-reverse p-3 gap-2 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-sm transition-all duration-300 ${status === 'blending' ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : ''}`}>
                                
                                {status === 'blending' ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-rose-600/20 backdrop-blur-md z-10"
                                    >
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}>
                                            <Loader2 className="text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" size={48} />
                                        </motion.div>
                                        <p className="text-[10px] font-black mt-4 text-rose-300 tracking-[0.2em] animate-pulse">PROCESSING...</p>
                                    </motion.div>
                                ) : (
                                    <AnimatePresence>
                                        {hopper.map((i, idx) => (
                                            <motion.div 
                                                initial={{ y: -50, opacity: 0, rotate: Math.random() * 45 }} 
                                                animate={{ y: 0, opacity: 1, rotate: 0 }} 
                                                key={idx} 
                                                className="text-4xl text-center drop-shadow-2xl"
                                            >
                                                {i.icon}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                                
                                {hopper.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
                                        <div className="w-12 h-12 border-2 border-dashed border-slate-500 rounded-full flex items-center justify-center mb-2"><span className="text-slate-500 text-xl">+</span></div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">খালি</p>
                                    </div>
                                )}
                                
                                {/* Base Glow */}
                                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
                            </div>
                            
                            {/* Machine Base */}
                            <div className="w-48 h-8 bg-slate-800 rounded-b-2xl rounded-t-sm border-b-4 border-slate-900 mt-1 shadow-2xl relative">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-rose-500/50 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                            </div>
                        </div>

                        <div className="flex gap-3 w-full mt-8 z-10">
                            <button 
                                onClick={blend} 
                                disabled={hopper.length === 0 || status === 'blending'} 
                                className="group flex-1 relative overflow-hidden bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_10px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_30px_rgba(244,63,94,0.4)] hover:-translate-y-1 active:translate-y-1 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all text-xs"
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                {status === 'blending' ? 'ব্লেন্ডিং...' : 'ব্লেন্ড করুন'}
                            </button>
                            <button 
                                onClick={() => { setHopper([]); setStatus('idle'); setResult(null); }} 
                                className="p-4 bg-slate-800 rounded-xl border border-white/5 hover:bg-slate-700 hover:border-white/20 shadow-lg hover:-translate-y-1 active:translate-y-1 transition-all text-slate-300 hover:text-white"
                                title="রিসেট"
                            >
                                <RefreshCcw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Right: Receiver Glass */}
                    <div className="bg-gradient-to-b from-[#1e2430] to-[#121620] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-xl flex flex-col justify-between relative overflow-hidden">
                        <div className="w-full flex items-center gap-3 border-b border-white/5 pb-4 z-10">
                            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><FlaskConical size={20} /></div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">৩. এআই রিসিভার</h3>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center py-8 z-10">
                            {status === 'done' && result ? (
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0 }} 
                                    animate={{ scale: 1, opacity: 1 }} 
                                    transition={{ type: "spring", bounce: 0.5 }}
                                    className="w-full flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <div className={`absolute inset-0 blur-3xl opacity-20 ${result.bg.split(' ')[0]}`}></div>
                                        <div className="text-8xl mb-6 relative z-10 filter drop-shadow-2xl animate-bounce">{result.icon}</div>
                                    </div>
                                    <h4 className={`text-xl font-black ${result.color} mb-3 text-center`}>{result.title}</h4>
                                    
                                    <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10 mb-6 shadow-inner">
                                        <Target size={14} className={result.color} />
                                        <span className="text-xs font-mono font-bold text-slate-300">Accuracy: <span className={result.color}>{result.acc}%</span></span>
                                    </div>
                                    
                                    <div className={`w-full p-5 rounded-2xl border backdrop-blur-md text-sm leading-relaxed text-center font-medium shadow-xl ${result.bg}`}>
                                        {result.desc}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-slate-500 text-center space-y-4 flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center relative">
                                        <div className="absolute inset-0 rounded-full border-t-2 border-rose-500/30 animate-[spin_3s_linear_infinite]"></div>
                                        <FlaskConical size={48} className="opacity-20" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">ফলাফলের জন্য ব্লেন্ড করুন</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500"><Info size={20} /></div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed italic">
                    <strong className="text-white font-bold">রিমিশার উপলব্ধি:</strong> একটি মডেল তৈরির জন্য ডেটা বা উপকরণ যদি ভেজাল হয়, তবে নকশা (Algorithm) যত ভালোই হোক না কেন, চূড়ান্ত আউটপুট সবসময় ভেজাল বা গার্বেজই হবে।
                </p>
            </div>
        </div>
    );
}