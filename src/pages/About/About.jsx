import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  Compass,
  GraduationCap,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const principles = [
  {
    icon: BookOpenCheck,
    title: 'গল্প দিয়ে শেখা',
    text: 'জটিল সংজ্ঞা মুখস্থ নয়, বাস্তব দৃশ্য আর সহজ ব্যাখ্যার মাধ্যমে প্রতিটি ধারণা পরিষ্কার করা হয়।',
  },
  {
    icon: BrainCircuit,
    title: 'ল্যাব-ভিত্তিক বোঝাপড়া',
    text: 'কনসেপ্ট শেখার পর ইন্টারেক্টিভ ল্যাবে সেটি হাতে-কলমে পরীক্ষা করার জায়গা রাখা হয়েছে।',
  },
  {
    icon: ShieldCheck,
    title: 'বাংলা-first design',
    text: 'ভাষা, উদাহরণ, UI এবং শেখার গতি এমনভাবে সাজানো যেন বাংলা শিক্ষার্থী স্বচ্ছন্দ থাকে।',
  },
];

const stats = [
  { value: '২০০+', label: 'AI/ML শব্দ' },
  { value: '৫০+', label: 'ল্যাব ধারণা' },
  { value: '৬', label: 'গাইডেড অধ্যায়' },
  { value: '১০০%', label: 'বাংলা ব্যাখ্যা' },
];

const timeline = [
  'কঠিন শব্দকে আগে গল্পে বসানো',
  'তারপর সহজ ভাষায় মূল ধারণা ভাঙা',
  'শেষে ল্যাবে ফলাফল দেখে শেখা পোক্ত করা',
];

export default function About() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050b12] text-slate-200">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
      >
        <motion.div variants={fadeUp} className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-300">
            <Sparkles size={14} />
            About The Project
          </div>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            সহজ বাংলায় মেশিন লার্নিং শেখার একটি বাস্তব পথ।
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            শব্দে শব্দে মেশিন লার্নিং তৈরি হয়েছে এমন শিক্ষার্থীদের জন্য, যারা AI/ML বুঝতে চায় কিন্তু ইংরেজি textbook, ভারী equation আর কঠিন শব্দে আটকে যায়।
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-300 px-5 py-3 text-sm font-black text-[#06111d] transition hover:bg-teal-200"
            >
              শেখা শুরু করুন
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-100/15 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-teal-300/40 hover:text-teal-200"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5">
              <p className="text-3xl font-black text-white">{item.value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      <section className="border-y border-cyan-100/[0.06] bg-[#06111d]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp}>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md border border-teal-300/20 bg-teal-300/10 text-teal-300">
              <Target size={22} />
            </div>
            <h2 className="text-3xl font-black text-white md:text-4xl">আমাদের মিশন</h2>
            <p className="mt-4 text-sm leading-8 text-slate-400 md:text-base">
              বাংলা ভাষাভাষী শিক্ষার্থীদের জন্য এমন একটি learning space তৈরি করা, যেখানে machine learning শুধু পড়া নয়, দেখা, বোঝা এবং ব্যবহার করার মতো সহজ হয়ে ওঠে।
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid gap-4 md:grid-cols-3"
          >
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <motion.article key={item.title} variants={fadeUp} className="rounded-lg border border-cyan-100/[0.08] bg-[#050b12] p-5">
                  <Icon size={22} className="text-teal-300" />
                  <h3 className="mt-4 font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-6 md:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/10 text-cyan-300">
            <Compass size={22} />
          </div>
          <h2 className="text-2xl font-black text-white md:text-3xl">কীভাবে শেখানো হয়</h2>
          <div className="mt-7 space-y-5">
            {timeline.map((text, index) => (
              <div key={text} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-teal-300/20 bg-teal-300/10 text-xs font-black text-teal-300">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm font-semibold leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp} className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-6 md:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300">
            <Rocket size={22} />
          </div>
          <h2 className="text-2xl font-black text-white md:text-3xl">ভিশন</h2>
          <p className="mt-4 text-sm leading-8 text-slate-400 md:text-base">
            বাংলা ভাষায় AI education-কে আরও accessible, practical এবং আনন্দদায়ক করা। লক্ষ্য হলো এমন learner তৈরি করা, যারা কঠিন topic দেখলেই ভয় না পেয়ে প্রশ্ন করতে, পরীক্ষা করতে এবং বানাতে শুরু করে।
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <MiniPoint icon={Users} text="শিক্ষার্থী বান্ধব" />
            <MiniPoint icon={GraduationCap} text="ধাপে ধাপে শেখা" />
            <MiniPoint icon={MessageCircle} text="সহজ ভাষা" />
            <MiniPoint icon={CheckCircle2} text="প্র্যাকটিক্যাল ফোকাস" />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function MiniPoint({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-cyan-100/[0.08] bg-[#050b12] px-4 py-3 text-sm font-bold text-slate-300">
      <Icon size={16} className="text-teal-300" />
      {text}
    </div>
  );
}
