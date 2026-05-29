import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Rocket, MousePointer2, 
  Sparkles, BrainCircuit, ArrowRight,
  ShieldCheck, Zap,
  LineChart, Target, Users, ChevronDown,
  Sliders, MonitorPlay, Activity
} from 'lucide-react';

function LandingPageContent() {
  const navigate = useNavigate();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  return (
    <div className="bg-[#050b14] text-slate-200 overflow-x-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-20">
        {/* Background Glowing Orbs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/20 blur-[130px] rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#5b5dfa]/5 blur-[150px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-bold mb-8 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <Sparkles size={16} /> নতুন যুগের ইন্টারেক্টিভ লার্নিং
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-5xl font-black leading-tight tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400 drop-shadow-sm"
          >
            শব্দে শব্দে <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              মেশিন লার্নিং
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mb-10 text-base leading-relaxed md:text-xl text-slate-400"
          >
            জটিল অ্যালগরিদম আর খটমটে সব সংজ্ঞা বাদ দিয়ে, গল্পের ছলে আর জাদুকরী সিমুলেশনের মাধ্যমে শিখুন ভবিষ্যতের প্রযুক্তি।
          </motion.p>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col items-center justify-center gap-5 sm:flex-row"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-black rounded-2xl flex items-center justify-center w-full sm:w-auto gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.3)] border border-white/10"
            >
              <BookOpen size={20} /> বই পড়া শুরু করুন <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            
            <button 
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center justify-center w-full gap-2 px-8 py-4 font-bold text-white transition-all border sm:w-auto bg-slate-800/50 border-slate-700/50 rounded-2xl hover:bg-slate-800 hover:border-slate-600 backdrop-blur-sm"
            >
              <BookOpen size={18} className="text-slate-400" /> বইটি কিনুন (Hardcopy)
            </button>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.button
              type="button"
              aria-label="Close modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-cyan-100/10 bg-[#071521] p-6 text-center shadow-2xl sm:p-8"
            >
              <div className="absolute left-[-15%] top-[-20%] h-44 w-44 rounded-full bg-cyan-400/10 blur-[90px]" />
              <div className="absolute bottom-[-20%] right-[-10%] h-44 w-44 rounded-full bg-indigo-400/10 blur-[90px]" />

              <div className="relative z-10 space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-100/10 bg-white/5 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                  <BookOpen size={28} />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white sm:text-3xl">শীঘ্রই আসছে</h2>
                  <p className="text-sm leading-7 text-slate-300 sm:text-base">
                    চোখ রাখুন নিচের ফেসবুক পেইজে
                  </p>
                </div>

                <a
                  href="https://www.facebook.com/profile.php?id=100069728434533"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black text-[#061421] transition-all duration-300 hover:bg-cyan-200 hover:shadow-[0_0_28px_rgba(34,211,238,0.28)]"
                >
                  Facebook পেইজ দেখুন
                </a>

                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="inline-flex items-center justify-center px-5 py-3 ml-3 text-sm font-bold transition-colors border rounded-2xl border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- FEATURES SECTION --- */}
      <section className="relative py-24 px-6 bg-[#0a0f1c]">
        {/* Top border gradient */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-5 text-3xl font-black text-white md:text-5xl">বইটির বিশেষত্ব কী?</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 mx-auto rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard 
              icon={<BrainCircuit size={28} className="text-indigo-400" />}
              title="গল্পের মাধ্যমে শেখা"
              desc="রিমিশা আর তার বাবার ল্যাবে ঘটে যাওয়া সব চমৎকার গল্পের মাধ্যমে শিখবেন প্রতিটি গাণিতিক বিষয়।"
              borderColor="hover:border-indigo-500/40"
              iconBg="bg-indigo-500/10"
              iconBorder="border-indigo-500/20"
            />
            <FeatureCard 
              icon={<Zap size={28} className="text-amber-400" />}
              title="ইন্টারেক্টিভ সিমুলেশন"
              desc="শুধু পড়লে হবে না! ল্যাব সিমুলেটর দিয়ে নিজেই ডেটা নিয়ে এক্সপেরিমেন্ট করে লাইভ ফলাফল দেখুন।"
              borderColor="hover:border-amber-500/40"
              iconBg="bg-amber-500/10"
              iconBorder="border-amber-500/20"
            />
            <FeatureCard 
              icon={<ShieldCheck size={28} className="text-emerald-400" />}
              title="সহজ বাংলা ভাষা"
              desc="কোনো কঠিন ইংরেজি সংজ্ঞা নয়, আমরা প্রতিটি শব্দকে আপনার দৈনন্দিন ভাষার সাথে মিলিয়ে বুঝিয়েছি।"
              borderColor="hover:border-emerald-500/40"
              iconBg="bg-emerald-500/10"
              iconBorder="border-emerald-500/20"
            />
            <FeatureCard 
              icon={<LineChart size={28} className="text-rose-400" />}
              title="গাণিতিক ভীতির অবসান"
              desc="কঠিন সব সমীকরণকে শুধু টেক্সট হিসেবে না রেখে, চমৎকার গ্রাফ আর অ্যানিমেশনের মাধ্যমে ভিজ্যুয়ালাইজ করা হয়েছে।"
              borderColor="hover:border-rose-500/40"
              iconBg="bg-rose-500/10"
              iconBorder="border-rose-500/20"
            />
            <FeatureCard 
              icon={<Target size={28} className="text-blue-400" />}
              title="রিয়েল-টাইম প্রোগ্রেস"
              desc="ড্যাশবোর্ডের মাধ্যমে আপনি কতটুকু শিখেছেন এবং কোন লেসনে আছেন, তা স্বয়ংক্রিয়ভাবে ট্র্যাক করতে পারবেন।"
              borderColor="hover:border-blue-500/40"
              iconBg="bg-blue-500/10"
              iconBorder="border-blue-500/20"
            />
            <FeatureCard 
              icon={<Users size={28} className="text-fuchsia-400" />}
              title="সবার জন্য এআই"
              desc="কৌতূহলী স্কুল শিক্ষার্থী থেকে শুরু করে সফটওয়্যার ইঞ্জিনিয়ার—সবার জন্য লেসনগুলো ধাপে ধাপে সাজানো।"
              borderColor="hover:border-fuchsia-500/40"
              iconBg="bg-fuchsia-500/10"
              iconBorder="border-fuchsia-500/20"
            />
          </div>
        </div>
      </section>

      {/* --- HOW TO USE SECTION --- */}
      <section className="relative px-6 py-24 overflow-hidden bg-gradient-to-b from-[#050b14] to-[#0a0f1c]">
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute left-0 bottom-1/4 w-64 h-64 bg-cyan-600/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="mb-5 text-3xl font-black text-white md:text-5xl">কীভাবে ব্যবহার করবেন?</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 mx-auto rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
          </div>
          
          <div className="space-y-12 md:space-y-16">
            <Step 
              number="01" 
              title="পছন্দের শব্দ বেছে নিন" 
              desc="ড্যাশবোর্ডের সাইডবার থেকে আপনার কাঙ্ক্ষিত মেশিন লার্নিং টার্মটি সিলেক্ট করুন এবং শেখা শুরু করুন।" 
              icon={<MousePointer2 className="text-cyan-400" size={24} />}
            />
            <Step 
              number="02" 
              title="গল্পটি পড়ুন" 
              desc="রিমিশার ল্যাব ডায়েরি আর গল্পের মাধ্যমে শব্দটির পেছনের আসল লজিকটি সহজভাবে বুঝে নিন।" 
              icon={<BookOpen className="text-indigo-400" size={24} />}
            />
            <Step 
              number="03" 
              title="সিমুলেটর চালান" 
              desc="ল্যাব সেকশনে গিয়ে নিজে কন্ট্রোল চেঞ্জ করে দেখুন এআই কীভাবে সিদ্ধান্ত নিচ্ছে।" 
              icon={<Rocket className="text-emerald-400" size={24} />}
            />
          </div>
        </div>
      </section>

      {/* --- SIMULATION SHOWCASE SECTION --- */}
      <section className="py-24 px-6 bg-[#0a0f1c] relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
            {/* Text Content */}
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <MonitorPlay size={16} /> হাতে-কলমে এক্সপেরিমেন্ট
              </div>
              <h2 className="mb-6 text-3xl font-black leading-tight text-white md:text-5xl">
                বইয়ের পাতায় নয়, শিখুন <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  লাইভ সিমুলেটরে
                </span>
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-slate-400">
                মেশিন লার্নিংয়ের অ্যালগরিদমগুলো কীভাবে কাজ করে তা শুধু পড়ে বোঝা কঠিন। তাই আমাদের প্রতিটি কনসেপ্টের সাথে রয়েছে একটি করে লাইভ সিমুলেটর। স্লাইডার টেনে আর বাটন ক্লিক করে নিজের চোখেই দেখুন এআই-এর জাদুকরী সিদ্ধান্ত গ্রহণ!
              </p>
              
              <div className="space-y-6">
                <SimFeature 
                  icon={<Sliders size={20} className="text-emerald-400" />}
                  title="প্যারামিটার টিউনিং" 
                  desc="লার্নিং রেট বা ব্যাচ সাইজ কমালে-বাড়ালে কী হয়, তা নিজেই স্লাইডার টেনে পরীক্ষা করুন।" 
                />
                <SimFeature 
                  icon={<LineChart size={20} className="text-cyan-400" />}
                  title="রিয়েল-টাইম গ্রাফ ও রেজাল্ট" 
                  desc="আপনার দেওয়া ইনপুটের ভিত্তিতে সাথে সাথেই তৈরি হবে ভিজ্যুয়াল গ্রাফ ও ফলাফল।" 
                />
                <SimFeature 
                  icon={<Activity size={20} className="text-rose-400" />}
                  title="নিরাপদ এক্সপেরিমেন্ট" 
                  desc="কম্পিউটার বা র‍্যাম ক্র্যাশ করার ভয় নেই! সরাসরি ব্রাউজারেই চলবে সব ভারী সিমুলেশন।" 
                />
              </div>
            </div>

            {/* Mock Simulator UI (Visual Graphic) */}
            <div className="w-full lg:w-1/2">
              <div className="bg-gradient-to-br from-[#0f172a] to-[#050b14] border border-slate-700/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative">
                {/* Fake window controls */}
                <div className="flex gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                
                <div className="bg-[#050b14]/80 rounded-2xl p-6 border border-slate-800 shadow-inner">
                  <h4 className="flex items-center gap-2 mb-6 font-bold text-slate-300">
                    <BrainCircuit size={18} className="text-cyan-400"/> বায়াস-ভ্যারিয়েন্স ট্রেডঅফ
                  </h4>
                  
                  {/* Fake Graph */}
                  <div className="relative w-full h-40 mb-8 border-b border-l bg-gradient-to-t from-emerald-500/5 to-transparent border-slate-700/50">
                    <svg viewBox="0 0 100 50" className="absolute bottom-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                      {/* Total Error Curve */}
                      <path d="M0,45 Q25,10 50,15 T100,40" fill="none" stroke="#34d399" strokeWidth="2.5" className="drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
                      {/* Bias Curve */}
                      <path d="M0,5 Q30,45 100,48" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                      {/* Variance Curve */}
                      <path d="M0,48 Q70,45 100,5" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                      
                      {/* Sweet Spot Marker */}
                      <circle cx="50" cy="15" r="2" fill="#fff" className="animate-pulse" />
                      <line x1="50" y1="15" x2="50" y2="50" stroke="#fff" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>
                  </div>

                  {/* Fake Controls */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-2 text-xs font-medium text-slate-400">
                        <span>মডেলের জটিলতা (Complexity)</span>
                        <span className="text-emerald-400">সুইট স্পট!</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                        <div className="relative w-1/2 h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500">
                           <div className="absolute right-0 w-3 h-3 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                       <div className="flex-1 py-2 text-center border bg-slate-800/40 rounded-xl border-slate-700/50">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">বায়াস</div>
                          <div className="font-mono text-sm text-rose-400">০.১৫</div>
                       </div>
                       <div className="flex-1 py-2 text-center border bg-slate-800/40 rounded-xl border-slate-700/50">
                          <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">ভ্যারিয়েন্স</div>
                          <div className="font-mono text-sm text-cyan-400">০.১৪</div>
                       </div>
                       <div className="flex-1 py-2 text-center border border-emerald-500/30 bg-emerald-500/10 rounded-xl">
                          <div className="text-[10px] text-emerald-500/70 uppercase font-bold mb-0.5">মোট ভুল</div>
                          <div className="font-mono text-sm font-bold text-emerald-400">০.২৯</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-[#0a0f1c] to-[#050b14]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-5 text-3xl font-black text-white md:text-5xl">সাধারণ জিজ্ঞাসা (FAQ)</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 mx-auto rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
          </div>

          <div className="space-y-4">
            <FAQItem 
              question="আমার কি কোডিং অভিজ্ঞতা থাকতে হবে?" 
              answer="একেবারেই না! বইটি এমনভাবে ডিজাইন করা হয়েছে যেন একজন সাধারণ মানুষও গল্পের ছলে এআই-এর লজিক বুঝতে পারেন। তবে যারা কোডিং জানেন, তাদের জন্য ভেতরে পাইথনের স্নিপেটও দেওয়া আছে।"
            />
            <FAQItem 
              question="সিমুলেটরগুলো কি মোবাইলেও কাজ করবে?" 
              answer="হ্যাঁ, আমাদের প্রতিটি লাইভ সিমুলেটর মোবাইল ফ্রেন্ডলি করে তৈরি করা হয়েছে। আপনি আপনার স্মার্টফোন থেকেই ল্যাব এক্সপেরিমেন্টগুলো চালিয়ে দেখতে পারবেন।"
            />
            <FAQItem 
              question="এই বইটি পড়লে কি আমি এআই বানাতে পারব?" 
              answer="এই বইটি মূলত এআই-এর পেছনের মূল গাণিতিক লজিক এবং ফাউন্ডেশন পরিষ্কার করার জন্য। এটি পড়ার পর আপনি এআই-এর যেকোনো অ্যাডভান্সড কোর্স বা প্রজেক্ট খুব সহজেই বুঝতে ও বানাতে পারবেন।"
            />
            <FAQItem 
              question="বইটির হার্ডকপি কি বাজারে পাওয়া যায়?" 
              answer="আপাতত আমরা এটি সম্পূর্ণ ডিজিটাল এবং ইন্টারঅ্যাকটিভ ফরম্যাটে ওয়েবসাইটের মাধ্যমে দিচ্ছি। তবে খুব শিগগিরই হার্ডকপি সংস্করণ বাজারে আনার পরিকল্পনা রয়েছে।"
            />
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA SECTION --- */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-10 overflow-hidden text-center border bg-gradient-to-r from-indigo-900/50 to-cyan-900/50 border-indigo-500/30 rounded-3xl md:p-16">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-black text-white md:text-5xl">এআই শেখার রোমাঞ্চকর যাত্রা শুরু করুন!</h2>
              <p className="max-w-2xl mx-auto mb-10 text-lg text-slate-300">
                ভবিষ্যতের প্রযুক্তিকে আর ভয় নয়, এবার জয় করার পালা। এখনই ড্যাশবোর্ডে প্রবেশ করুন এবং আপনার প্রথম লেসনটি পড়ে ফেলুন।
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-10 py-4 bg-white text-indigo-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] mx-auto"
              >
                <Rocket size={20} /> বিনামূল্যে পড়া শুরু করুন
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

// --- Helper Components ---
function FeatureCard({ icon, title, desc, borderColor, iconBg, iconBorder }) {
  return (
    <div className={`bg-[#0f172a]/60 backdrop-blur-md border border-slate-800/80 p-8 rounded-3xl transition-all duration-300 group shadow-xl ${borderColor}`}>
      <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform duration-300 shadow-inner border group-hover:scale-110 group-hover:-translate-y-1 ${iconBg} ${iconBorder}`}>
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-slate-200">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc, icon }) {
  return (
    <div className="relative flex items-start gap-6 group md:gap-10">
      <span className="absolute font-black leading-none text-transparent transition-colors select-none -left-4 -top-6 md:-left-8 md:-top-8 text-7xl md:text-9xl bg-clip-text bg-gradient-to-b from-slate-800/50 to-transparent group-hover:from-indigo-900/30">
        {number}
      </span>
      <div className="relative z-10 flex items-center justify-center shrink-0 w-12 h-12 md:w-16 md:h-16 mt-2 rounded-2xl bg-[#0f172a] border border-slate-700/50 shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:border-slate-600">
        {icon}
      </div>
      <div className="relative z-10 pt-2 md:pt-4">
        <h3 className="mb-3 text-xl font-bold text-white transition-colors md:text-2xl group-hover:text-cyan-400">{title}</h3>
        <p className="text-base leading-relaxed md:text-lg text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function SimFeature({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-4 transition-colors border rounded-2xl bg-slate-800/20 border-slate-700/50 hover:bg-slate-800/40">
      <div className="flex items-center justify-center p-3 border rounded-xl bg-slate-900 border-slate-700/50 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="mb-1 text-base font-bold text-white">{title}</h4>
        <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-800/80 rounded-2xl bg-[#0f172a]/50 overflow-hidden transition-all hover:border-slate-700">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between w-full p-6 text-left"
      >
        <span className="font-bold text-white md:text-lg">{question}</span>
        <ChevronDown 
          className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-6"
          >
            <p className="pt-4 text-sm leading-relaxed border-t text-slate-400 md:text-base border-slate-800/50">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return <LandingPageContent />;
}