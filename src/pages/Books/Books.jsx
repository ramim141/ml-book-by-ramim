import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ShoppingBag, Star, ShieldCheck,
  Package, X, Loader2, BrainCircuit,
  Users, PenTool, LayoutList, FlaskConical, MousePointer2, Play,
  ArrowRight, BookOpen, Zap, Quote, ChevronDown,
  Code2, BarChart3, Network, Lightbulb, GraduationCap, Cpu, Layers, Database
} from 'lucide-react';
import { bookStructure } from '../../data/wordsIndex';
import bookCover from '../../assets/images/book-cover.jpeg';

// ════════════════════════════════════════════════════════════════════════════
// 1. PAGE DATA (Dynamic Configuration)
// ════════════════════════════════════════════════════════════════════════════
const pageData = {
  book: {
    title: "শব্দে শব্দে মেশিন লার্নিং",
    subtitle: "মেশিন লার্নিং এর খটমটে শব্দের সহজ গল্প",
    fullName: "শব্দে শব্দে মেশিন লার্নিং",
    description: "কম্পিউটার সায়েন্স বা স্ট্যাটিস্টিক্স এর বাইরে সবার জন্য সহজেই AI/ML শেখার জন্য লেখা এই বই। এই বইতে সহজ ও বাস্তব উদাহরণ দিয়ে ML কনসেপ্টগুলো এমন ভাবে বুঝানো হয়েছে যা একজন ছাত্র বা চাকরিজীবী নিজের কাজেও ব্যবহার করতে পারবেন।",
    price: { current: "৪০০", old: "৫৫০" },
    releaseStatus: "ফ্রি প্রি-অর্ডার চলছে",
    releaseDate: "প্রকাশিত হবে জুন ২০২৬",
    discountTag: { top: "12%", bottom: "OFF" }
  },
  heroHighlights: [
    { icon: <Lightbulb size={26} />, text: 'প্রাথমিক জ্ঞান' },
    { icon: <Code2 size={26} />, text: 'বাস্তব প্রজেক্ট' },
    { icon: <BarChart3 size={26} />, text: 'ইন্ডাস্ট্রি কেস' },
    { icon: <BrainCircuit size={26} />, text: 'মেশিন লার্নিং ল্যাব' },
  ],
  whatsInside: {
    title: "বইয়ে কি কি আছে?",
    subtitle: "শুধু তত্ত্ব নয় — প্রতিটি বিষয় সহজ ভাষায়, রঙিন চিত্র এবং বাস্তব উদাহরণ দিয়ে বোঝানো হয়েছে।",
    items: [
      { icon: <GraduationCap size={22}/>, title: "ML-এর মূল ধারণা", desc: "সুপারভাইজড, আনসুপারভাইজড এবং রিইনফোর্সমেন্ট লার্নিং — সহজ বাংলায় পুরো ফ্রেমওয়ার্ক।", accent: "indigo" },
      { icon: <BarChart3 size={22}/>, title: "ডেটা অ্যানালাইসিস", desc: "ডেটা কীভাবে পরিষ্কার করতে হয়, বিশ্লেষণ করতে হয় এবং ভিজ্যুয়ালাইজ করতে হয়।", accent: "violet" },
      { icon: <Network size={22}/>, title: "নিউরাল নেটওয়ার্ক", desc: "ডিপ লার্নিং, CNN, RNN — জটিল বিষয়গুলো চিত্র ও উদাহরণ দিয়ে বোঝানো।", accent: "fuchsia" },
      { icon: <Code2 size={22}/>, title: "প্র্যাক্টিক্যাল কোড", desc: "Python ও বাস্তব প্রজেক্টের মাধ্যমে প্রতিটি অ্যালগরিদম হাতে-কলমে শেখা।", accent: "emerald" },
      { icon: <Database size={22}/>, title: "ML শব্দভাণ্ডার", desc: "২০০+ টেকনিক্যাল শব্দের সহজ বাংলা ব্যাখ্যা — রেফারেন্স হিসেবে সবসময় কাজে আসবে।", accent: "cyan" },
      { icon: <Cpu size={22}/>, title: "ইন্টারঅ্যাক্টিভ ল্যাব", desc: "QR কোড স্ক্যান করে সরাসরি অনলাইন সিমুলেশনে প্রতিটি কনসেপ্ট পরীক্ষা করুন।", accent: "amber" },
    ]
  },
  audience: {
    title: "কারা এই বইটি পড়বে?",
    subtitle: "বাংলায় AI শেখার সুযোগ এখন তিনটি শ্রেণির মানুষের জন্য",
    items: [
      { icon: <Users size={22}/>, title: "শুরুয়াতি শিক্ষার্থী", desc: "যারা এআই নিয়ে ক্যারিয়ার শুরু করতে চান কিন্তু কঠিন ম্যাথ ভয় পান।", gradient: "bg-gradient-to-b from-teal-400/6 to-transparent" },
      { icon: <BrainCircuit size={22}/>, title: "কৌতূহলী মানুষ", desc: "প্রযুক্তি প্রেমী সাধারণ মানুষ যারা জানতে চান আধুনিক বিশ্ব কীভাবে চলে।", gradient: "bg-gradient-to-b from-cyan-400/6 to-transparent" },
      { icon: <PenTool size={22}/>, title: "একাডেমিক রিসার্চার", desc: "যারা বাংলায় ডেটা সায়েন্স এবং এমএল নিয়ে রেফারেন্স বই খুঁজছেন।", gradient: "bg-gradient-to-b from-emerald-400/6 to-transparent" },
    ]
  },
  lab: {
    title: "পড়ুন এবং\nল্যাবে পরীক্ষা করুন",
    description: "বইটির প্রতিটি শব্দের সাথে একটি QR কোড দেওয়া আছে। ফোনে স্ক্যান করলেই আপনি আমাদের অনলাইন সিমুলেশন ল্যাবে প্রবেশ করবেন।",
    features: [
      { icon: <Zap size={16}/>, text: 'রিয়েল-টাইম ডেটা ম্যাসাজিং' },
      { icon: <BrainCircuit size={16}/>, text: 'ভিজ্যুয়াল অ্যালগরিদম টেস্টিং' },
      { icon: <MousePointer2 size={16}/>, text: 'ইন্টারেক্টিভ কুইজ ও গেমস' },
    ]
  },
  author: {
    name: "রামীম আহমেদ",
    role: "লেখক ও এআই রিসার্চার",
    quote: "আমি বিশ্বাস করি, জ্ঞান যখন নিজের ভাষায় পাওয়া যায়, তখন তা অন্তরে গেঁথে থাকে। এই বইটি আমার তিন বছরের গবেষণার নির্যাস যা আমি প্রতিটি বাঙালির হাতে পৌঁছে দিতে চাই।",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramim&backgroundColor=transparent",
  }
};

// ════════════════════════════════════════════════════════════════════════════
// 2. ANIMATION VARIANTS
// ════════════════════════════════════════════════════════════════════════════
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  }),
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

// ════════════════════════════════════════════════════════════════════════════
// 3. UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

function Pill({ children, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-teal-400/10 border-teal-300/25 text-teal-300',
    emerald: 'bg-emerald-400/10 border-emerald-300/25 text-emerald-300',
    fuchsia: 'bg-cyan-400/10 border-cyan-300/25 text-cyan-300',
    amber:  'bg-amber-400/10 border-amber-300/25 text-amber-300',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wider uppercase ${colors[color]}`}>
      {children}
    </span>
  );
}

function InsideCard({ icon, title, desc, accent }) {
  const accents = {
    indigo:  { bg: 'bg-teal-400/10',    border: 'border-teal-300/20',    text: 'text-teal-300',    glow: 'group-hover:shadow-[0_0_50px_-8px_rgba(45,212,191,0.28)]'  },
    violet:  { bg: 'bg-cyan-400/10',    border: 'border-cyan-300/20',    text: 'text-cyan-300',    glow: 'group-hover:shadow-[0_0_50px_-8px_rgba(34,211,238,0.25)]'  },
    fuchsia: { bg: 'bg-sky-400/10',     border: 'border-sky-300/20',     text: 'text-sky-300',     glow: 'group-hover:shadow-[0_0_50px_-8px_rgba(56,189,248,0.24)]' },
    emerald: { bg: 'bg-emerald-400/10', border: 'border-emerald-300/20', text: 'text-emerald-300', glow: 'group-hover:shadow-[0_0_50px_-8px_rgba(52,211,153,0.24)]' },
    cyan:    { bg: 'bg-cyan-400/10',    border: 'border-cyan-300/20',    text: 'text-cyan-300',    glow: 'group-hover:shadow-[0_0_50px_-8px_rgba(34,211,238,0.25)]'   },
    amber:   { bg: 'bg-amber-400/10',   border: 'border-amber-300/20',   text: 'text-amber-300',   glow: 'group-hover:shadow-[0_0_50px_-8px_rgba(251,191,36,0.22)]'  },
  };
  const a = accents[accent] || accents.indigo;
  return (
    <motion.div variants={fadeUp}
      className={`relative p-6 rounded-2xl bg-[#071521] border border-cyan-100/[0.07] hover:border-cyan-200/[0.16] transition-all duration-400 group ${a.glow} hover:-translate-y-0.5`}>
      <div className={`w-12 h-12 rounded-2xl ${a.bg} ${a.border} border flex items-center justify-center ${a.text} mb-5`}>
        {icon}
      </div>
      <h4 className="mb-2 text-base font-bold text-white">{title}</h4>
      <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
    </motion.div>
  );
}

function AudienceCard({ icon, title, desc, gradient }) {
  return (
    <motion.div variants={fadeUp}
      className="relative p-8 rounded-3xl bg-[#071521] border border-cyan-100/[0.07] overflow-hidden group hover:-translate-y-1 transition-all duration-500 hover:border-teal-300/25 hover:shadow-[0_0_60px_-10px_rgba(45,212,191,0.18)]">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#06111d] border border-cyan-100/[0.08] flex items-center justify-center mx-auto mb-6 text-teal-300 shadow-lg group-hover:border-teal-300/30 transition-all duration-300">
          {icon}
        </div>
        <h4 className="mb-3 text-lg font-bold text-white">{title}</h4>
        <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </motion.div>
  );
}

function ChapterRow({ chapter, index }) {
  return (
    <motion.div variants={fadeUp} custom={index}
      className="flex items-center justify-between p-5 rounded-2xl bg-[#071521] border border-cyan-100/[0.06] hover:border-teal-300/30 hover:bg-teal-300/[0.04] transition-all duration-300 group cursor-default">
      <div className="flex items-center gap-5">
        <span className="flex items-center justify-center text-sm font-bold border text-teal-300 w-9 h-9 rounded-xl bg-teal-400/10 border-teal-300/20">
          {String(chapter.chapterNo).padStart(2, '0')}
        </span>
        <h3 className="font-semibold transition-colors text-slate-200 group-hover:text-white">{chapter.chapterTitle}</h3>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-slate-600">{chapter.parts.length} পার্ট</span>
        <ArrowRight size={14} className="text-slate-700 group-hover:text-teal-300 group-hover:translate-x-0.5 transition-all duration-300" />
      </div>
    </motion.div>
  );
}

function SocialLink({ icon }) {
  return (
    <a href="#" className="w-11 h-11 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300">
      {icon}
    </a>
  );
}

function FormGroup({ label, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500">{label}</label>
      <input
        required
        className="w-full bg-[#071521] border border-cyan-100/[0.08] rounded-2xl px-5 py-4 text-slate-200 placeholder-slate-700 focus:outline-none focus:border-teal-300/50 focus:ring-1 focus:ring-teal-300/20 transition-all duration-200"
        {...props}
      />
    </div>
  );
}

// SVG Icons
function GitHubIcon({ className }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.33-1.78-1.33-1.78-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.25 1.84 1.25 1.08 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.48-1.36-5.48-6.03 0-1.33.47-2.41 1.24-3.27-.13-.31-.54-1.56.12-3.24 0 0 1.01-.33 3.3 1.25A11.34 11.34 0 0 1 12 6.22a11.3 11.3 0 0 1 3 .41c2.29-1.58 3.29-1.25 3.29-1.25.66 1.68.25 2.93.12 3.24.78.86 1.24 1.94 1.24 3.27 0 4.68-2.82 5.71-5.51 6.02.43.38.82 1.11.82 2.25v3.34c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>;
}
function LinkedInIcon({ className }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.82-2.06 3.74-2.06 4 0 4.74 2.63 4.74 6.05V21h-4v-5.72c0-1.36-.03-3.1-1.89-3.1-1.89 0-2.18 1.48-2.18 3V21h-4V9Z" /></svg>;
}
function YouTubeIcon({ className }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.58A3 3 0 0 0 .5 6.2 31.8 31.8 0 0 0 0 12a31.8 31.8 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.9.58 9.4.58 9.4.58s7.5 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.8 31.8 0 0 0 24 12a31.8 31.8 0 0 0-.5-5.8ZM9.75 15.52V8.48L16 12l-6.25 3.52Z" /></svg>;
}

// ════════════════════════════════════════════════════════════════════════════
// 4. MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function Books() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus]           = useState('idle');
  const [orderData, setOrderData]     = useState({ name: '', phone: '', address: '', quantity: '1' });
  const [tocOpen, setTocOpen]         = useState(false);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleOrder = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => setStatus('success'), 2000);
  };

  const visibleChapters = tocOpen ? bookStructure : bookStructure.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#050b12] text-slate-200 selection:bg-teal-400/30">

      {/* Ambient glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-teal-500/[0.08] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">

        {/* ── HERO SECTION ── */}
        <section className="relative px-4 py-10 overflow-hidden md:px-6 lg:py-14">
          <div className="absolute inset-0 bg-[#061421]" />
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_18%_48%,rgba(20,184,166,0.34),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(45,212,191,0.16),transparent_28%),linear-gradient(90deg,rgba(6,20,33,0.25),rgba(5,15,27,0.96)_58%)]" />
          <div className="absolute inset-0 opacity-25 bg-[linear-gradient(115deg,transparent_0_14%,rgba(45,212,191,0.28)_14.2%,transparent_14.5%_29%,rgba(45,212,191,0.18)_29.2%,transparent_29.5%_100%)]" />
          <div className="absolute left-0 right-0 h-px top-12 bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#050b12] to-transparent" />

          <div className="relative grid items-center max-w-6xl grid-cols-1 gap-8 mx-auto lg:min-h-[520px] lg:grid-cols-[1.05fr_1fr] lg:gap-10">
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex min-h-[430px] items-end justify-center lg:min-h-[500px]"
            >
              <div className="absolute left-1/2 top-14 h-64 w-[86%] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[90px]" />
              <div className="absolute left-[8%] top-[18%] hidden h-40 w-64 -skew-y-6 rounded-full border border-cyan-300/20 bg-cyan-300/[0.03] blur-sm md:block" />
              <div className="absolute bottom-2 h-24 w-[84%] rounded-[45%] bg-black/45 blur-2xl" />
              <div className="absolute bottom-8 h-28 w-[88%] max-w-[500px] -skew-x-12 rounded-lg border border-cyan-100/10 bg-gradient-to-br from-cyan-50/12 via-slate-900/70 to-black shadow-[0_28px_80px_rgba(0,0,0,0.55)]" />

              <div className="absolute bottom-24 left-[8%] hidden h-20 w-16 rounded-b-full rounded-t-lg border border-amber-100/30 bg-gradient-to-br from-white via-amber-100 to-amber-300 shadow-[0_14px_30px_rgba(0,0,0,0.35)] sm:block">
                <div className="absolute -right-5 top-5 h-8 w-7 rounded-r-full border-[7px] border-l-0 border-amber-100/75" />
                <div className="absolute w-2 rounded-full -top-7 left-5 h-9 bg-cyan-100/30 blur-sm" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.42, duration: 0.45 }}
                className="absolute right-[11%] top-[30%] z-30 flex h-24 w-24 items-center justify-center rounded-full border border-white/35 bg-gradient-to-br from-teal-200 via-teal-500 to-fuchsia-500 text-center shadow-[0_0_35px_rgba(45,212,191,0.45)] md:h-28 md:w-28"
              >
                <span className="text-2xl font-black leading-none text-white md:text-3xl">
                  {pageData.book.discountTag.top}<br/>
                  <span className="text-base md:text-lg">{pageData.book.discountTag.bottom}</span>
                </span>
              </motion.div>

              <div className="relative z-20 w-[260px] origin-bottom -rotate-6 rounded-xl border border-white/20 bg-[#091422] p-2 shadow-[24px_34px_70px_rgba(0,0,0,0.58)] sm:w-[310px] lg:w-[340px]">
                <img
                  src={bookCover}
                  alt={`${pageData.book.title} বইয়ের কভার`}
                  className="aspect-[3/4] w-full rounded-lg object-cover object-[46%_50%]"
                />
                <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-tr from-white/10 via-transparent to-cyan-200/10" />
              </div>

              <div className="absolute bottom-14 left-[26%] z-30 hidden h-20 w-28 rotate-3 rounded border border-amber-100/20 bg-amber-100/80 p-2 text-[9px] font-bold leading-tight text-slate-800 shadow-2xl sm:block">
                সহজ ভাষা<br/>বাস্তব উদাহরণ<br/>বাংলায় ব্যাখ্যা
              </div>
              <div className="absolute bottom-14 right-[18%] z-30 hidden space-y-1 sm:block">
                <div className="h-8 w-16 -rotate-6 rounded bg-rose-300 px-2 py-1 text-[8px] font-black leading-tight text-slate-900 shadow-xl">Overfitting<br/>সহজ গল্পে</div>
                <div className="h-8 w-16 rotate-3 rounded bg-lime-300 px-2 py-1 text-[8px] font-black leading-tight text-slate-900 shadow-xl">Gradient<br/>ভিজ্যুয়াল</div>
              </div>
            </motion.div>

            <Section className="relative z-20 text-center lg:text-left">
              <motion.div variants={fadeUp} className="space-y-3">
                <h1 className="text-4xl font-black leading-[1.08] text-teal-300 sm:text-5xl lg:text-6xl">
                  {pageData.book.title}
                </h1>
                <p className="text-3xl font-bold leading-tight text-slate-300 sm:text-4xl">{pageData.book.subtitle}</p>
              </motion.div>

              <motion.p variants={fadeUp} className="max-w-xl mx-auto mt-6 text-sm leading-7 text-slate-300/95 sm:text-base lg:mx-0">
                {pageData.book.description}
              </motion.p>

              <motion.div variants={stagger} className="grid max-w-xl grid-cols-1 gap-4 mx-auto mt-8 sm:grid-cols-2 lg:mx-0">
                {pageData.heroHighlights.map((item, index) => (
                  <motion.div key={index} variants={fadeUp} className="flex items-center justify-center gap-3 text-teal-200 lg:justify-start">
                    <span className="flex items-center justify-center text-teal-300 h-11 w-11">{item.icon}</span>
                    <span className="text-lg font-black text-slate-100">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="mx-auto mt-8 max-w-xl rounded-xl border border-cyan-100/45 bg-[#061421]/85 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur lg:mx-0">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-300">বর্তমান মূল্য</p>
                    <div className="flex items-baseline justify-center gap-3 sm:justify-start">
                      <span className="text-3xl font-black leading-none text-teal-300">৳{pageData.book.price.current}</span>
                      <span className="text-xs font-semibold text-slate-400">পূর্ব মূল্য <span className="line-through text-rose-300">৳{pageData.book.price.old}</span></span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-7 py-3 text-base font-black text-[#061421] transition-all duration-300 hover:bg-teal-200 hover:shadow-[0_0_28px_rgba(94,234,212,0.35)]"
                  >
                    অর্ডার করুন
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <a href="#toc" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-black text-white transition-all duration-300 border rounded-lg border-white/65 hover:bg-white/10">
                    <BookOpen size={17} />
                    চেক করুন
                  </a>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-white/10 pt-2 text-[11px] font-semibold text-slate-300 sm:justify-end">
                  <span className="inline-flex items-center gap-1"><ShieldCheck size={13} /> {pageData.book.releaseStatus}</span>
                  <span>{pageData.book.releaseDate}</span>
                </div>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── WHAT'S INSIDE ── */}
        <section className="px-6 py-24 bg-[#06111d] border-y border-cyan-100/[0.06]">
          <div className="mx-auto max-w-7xl">
            <Section className="space-y-4 text-center mb-14">
              <motion.div variants={fadeUp}><Pill color="amber"><Lightbulb size={12}/> বইয়ের ভেতরে</Pill></motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">{pageData.whatsInside.title}</motion.h2>
              <motion.p variants={fadeUp} className="max-w-xl mx-auto leading-relaxed text-slate-500">
                {pageData.whatsInside.subtitle}
              </motion.p>
            </Section>

            <Section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageData.whatsInside.items.map((item, index) => (
                <InsideCard key={index} {...item} />
              ))}
            </Section>

            {/* Highlight strip */}
            <Section className="mt-10">
              <motion.div variants={fadeUp}
                className="flex flex-col md:flex-row items-center justify-between gap-6 p-7 rounded-2xl bg-gradient-to-r from-teal-400/[0.10] to-cyan-400/[0.08] border border-teal-300/20">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 border text-teal-300 rounded-2xl bg-teal-400/15 border-teal-300/25">
                    <Layers size={22}/>
                  </div>
                  <div>
                    <p className="font-bold text-white">সম্পূর্ণ বাংলায় লেখা</p>
                    <p className="text-sm text-slate-500">কোনো ইংরেজি জার্গন ছাড়াই পুরো বিষয়টি বুঝতে পারবেন</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                  className="flex-shrink-0 flex items-center gap-2 bg-teal-300 text-[#06111d] px-7 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all duration-300 hover:bg-teal-200 shadow-[0_0_24px_rgba(45,212,191,0.18)]">
                  <ShoppingBag size={16}/> এখনই অর্ডার করুন
                </button>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── AUDIENCE ── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <Section className="space-y-4 text-center mb-14">
              <motion.div variants={fadeUp}><Pill color="fuchsia"><Users size={12}/> পাঠক পরিচিতি</Pill></motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">{pageData.audience.title}</motion.h2>
              <motion.p variants={fadeUp} className="max-w-md mx-auto text-slate-500">{pageData.audience.subtitle}</motion.p>
            </Section>
            <Section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pageData.audience.items.map((item, index) => (
                <AudienceCard key={index} {...item} />
              ))}
            </Section>
          </div>
        </section>

        {/* ── INTERACTIVE LAB ── */}
        <section className="px-6 py-24 bg-[#06111d] border-y border-cyan-100/[0.06]">
          <div className="grid items-center grid-cols-1 gap-16 mx-auto max-w-7xl lg:grid-cols-2">
            <Section>
              <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden border border-cyan-100/[0.08] bg-[#071521] shadow-2xl group">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-cyan-100/[0.06] bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  <span className="ml-4 font-mono text-xs text-slate-600">simulation-lab.dev</span>
                </div>
                <div className="relative flex items-center justify-center aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5" />
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="flex items-center justify-center w-20 h-20 transition-transform duration-500 border rounded-full bg-emerald-500/10 border-emerald-500/20 group-hover:scale-110">
                        <div className="flex items-center justify-center w-12 h-12 border rounded-full bg-emerald-500/20 border-emerald-500/30 animate-pulse">
                          <Play size={20} className="fill-emerald-400 text-emerald-400 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute border rounded-full -inset-4 border-emerald-500/10 animate-ping" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">Live Lab Preview</p>
                    <span className="px-3 py-1 font-mono text-xs border rounded-full text-emerald-500 bg-emerald-500/10 border-emerald-500/20">● সিমুলেশন চলছে</span>
                  </div>
                </div>
              </motion.div>
            </Section>
            <Section className="space-y-8">
              <motion.div variants={fadeUp}><Pill color="emerald"><FlaskConical size={12}/> ইন্টারঅ্যাক্টিভ</Pill></motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-black leading-tight text-white whitespace-pre-line sm:text-4xl lg:text-5xl">
                {pageData.lab.title}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg leading-relaxed text-slate-400">
                {pageData.lab.description}
              </motion.p>
              <motion.ul variants={stagger} className="space-y-4">
                {pageData.lab.features.map((item, i) => (
                  <motion.li key={i} variants={fadeUp} className="flex items-center gap-4 text-slate-300">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 border rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </Section>
          </div>
        </section>

        {/* ── TABLE OF CONTENTS ── */}
        <section id="toc" className="px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <Section className="space-y-4 text-center mb-14">
              <motion.div variants={fadeUp}><Pill color="indigo"><LayoutList size={12}/> সূচিপত্র</Pill></motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">বইয়ের সূচিপত্র</motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500">মোট {bookStructure.length}টি অধ্যায় এবং ২০০+ শব্দ কভার করা হয়েছে</motion.p>
            </Section>
            <Section className="space-y-3">
              {visibleChapters.map((chapter, i) => (
                <ChapterRow key={chapter.chapterId} chapter={chapter} index={i} />
              ))}
            </Section>
            {bookStructure.length > 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 text-center">
                <button onClick={() => setTocOpen(!tocOpen)}
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white border border-white/[0.08] hover:border-white/20 px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-white/[0.03]">
                  {tocOpen ? 'কম দেখুন' : `আরও ${bookStructure.length - 5}টি অধ্যায় দেখুন`}
                  <ChevronDown size={15} className={`transition-transform duration-300 ${tocOpen ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* ── AUTHOR ── */}
        <section className="px-6 py-24 bg-[#06111d] border-t border-cyan-100/[0.06]">
          <div className="max-w-5xl mx-auto">
            <Section>
              <motion.div variants={fadeUp}
                className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-b from-[#0b1b2b] to-[#071521] border border-cyan-100/[0.08] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-400/10 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-cyan-400/8 blur-[80px]" />
                <div className="relative z-10 flex flex-col items-center gap-10 md:flex-row md:items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-teal-300 to-cyan-500 p-[2px] shadow-2xl shadow-teal-500/20">
                      <div className="w-full h-full bg-[#071521] rounded-[calc(1.5rem-2px)] overflow-hidden">
                        <img src={pageData.author.avatarUrl} alt={pageData.author.name} className="object-cover w-full h-full" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-teal-400 text-[#06111d] p-2.5 rounded-2xl shadow-xl border-2 border-[#071521]">
                      <PenTool size={16} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-5 text-center md:text-left">
                    <div>
                      <Pill color="indigo"><Star size={12}/> লেখক পরিচিতি</Pill>
                      <h3 className="mt-4 text-3xl font-black text-white">{pageData.author.name}</h3>
                      <p className="mt-1 font-semibold text-teal-300">{pageData.author.role}</p>
                    </div>
                    <div className="relative pl-5">
                      <Quote size={16} className="absolute top-0 left-0 text-teal-300/60" />
                      <p className="italic leading-relaxed text-slate-400">
                        {pageData.author.quote}
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 md:justify-start">
                      <SocialLink icon={<GitHubIcon className="w-4 h-4" />} />
                      <SocialLink icon={<LinkedInIcon className="w-4 h-4" />} />
                      <SocialLink icon={<YouTubeIcon className="w-4 h-4" />} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="px-6 pt-16 pb-24">
          <div className="max-w-4xl mx-auto">
            <Section>
              <motion.div variants={fadeUp}
                className="relative p-10 overflow-hidden text-center border md:p-14 rounded-3xl bg-gradient-to-br from-teal-400/18 via-cyan-400/10 to-emerald-400/10 border-teal-300/20">
                <div className="relative z-10 space-y-6">
                  <h2 className="text-3xl font-black text-white sm:text-4xl">এখনই শুরু করুন আপনার AI যাত্রা</h2>
                  <p className="max-w-md mx-auto text-slate-400">মাত্র ৳ {pageData.book.price.current} তে পেয়ে যান ৩০০+ পেজের কালারড গাইডবুক।</p>
                  <div className="flex justify-center">
                    <button onClick={() => setIsModalOpen(true)}
                      className="group inline-flex items-center gap-2.5 bg-teal-300 text-[#06111d] px-10 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:bg-teal-200 hover:shadow-[0_0_40px_rgba(45,212,191,0.28)]">
                      <ShoppingBag size={18} />
                      অর্ডার করুন — ৳ {pageData.book.price.current}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">ক্যাশ অন ডেলিভারি • ৭ দিনের মানি-ব্যাক গ্যারান্টি</p>
                </div>
              </motion.div>
            </Section>
          </div>
        </section>

      </div>

      {/* ── ORDER MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl bg-[#071521] border border-cyan-100/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => { setIsModalOpen(false); setStatus('idle'); }}
                className="absolute top-5 right-5 p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl text-slate-500 hover:text-white transition-all duration-200">
                <X size={18} />
              </button>
              {status === 'success' ? (
                <div className="py-10 space-y-6 text-center">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto border rounded-full bg-emerald-500/10 border-emerald-500/20">
                    <Package size={36} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="mb-2 text-2xl font-black text-white">অর্ডার সফল হয়েছে!</h2>
                    <p className="text-slate-500">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। ধন্যবাদ।</p>
                  </div>
                  <button onClick={() => { setIsModalOpen(false); setStatus('idle'); }}
                    className="px-10 py-3 font-bold transition-all duration-200 border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 rounded-2xl hover:bg-emerald-500/20">
                    বন্ধ করুন
                  </button>
                </div>
              ) : (
                <form onSubmit={handleOrder} className="space-y-6">
                  <div className="mb-8">
                    <h2 className="mb-1 text-2xl font-black text-white">অর্ডার নিশ্চিত করুন</h2>
                    <p className="text-sm text-slate-500">আমরা কল করে ঠিকানা ভেরিফাই করব</p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormGroup label="আপনার নাম" placeholder={pageData.author.name} value={orderData.name} onChange={e => setOrderData({...orderData, name: e.target.value})} />
                    <FormGroup label="মোবাইল নম্বর" placeholder="০১XXXXXXXXX" value={orderData.phone} onChange={e => setOrderData({...orderData, phone: e.target.value})} />
                  </div>
                  <FormGroup label="পুরো ঠিকানা" placeholder="বাসা, রোড, এলাকা, জেলা" value={orderData.address} onChange={e => setOrderData({...orderData, address: e.target.value})} />
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-500">{pageData.book.fullName} × ১</span>
                      <span className="font-semibold text-slate-300">৳ {pageData.book.price.current}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-white/[0.06]">
                      <span className="text-slate-500">ডেলিভারি চার্জ</span>
                      <span className="font-semibold text-emerald-400">ক্যাশ অন ডেলিভারি</span>
                    </div>
                  </div>
                  <button type="submit" disabled={status === 'sending'}
                    className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-[#06111d] font-bold py-4 rounded-2xl flex justify-center items-center gap-3 transition-all duration-300 hover:shadow-[0_0_40px_rgba(45,212,191,0.28)] disabled:opacity-70 disabled:cursor-not-allowed">
                    {status === 'sending'
                      ? <><Loader2 size={18} className="animate-spin"/> অর্ডার নেওয়া হচ্ছে...</>
                      : <><ShoppingBag size={18}/> কনফার্ম অর্ডার করুন</>
                    }
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
