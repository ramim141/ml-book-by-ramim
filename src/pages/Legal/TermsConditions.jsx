import { motion } from 'framer-motion';
import { BellRing, EyeOff, FileText, HelpCircle, Scale, ShieldCheck } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
};

const sections = [
  {
    icon: ShieldCheck,
    title: '১. সাধারণ শর্তাবলী',
    text: 'এই website ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে নিচ্ছেন বলে গণ্য হবে। যদি কোনো শর্তে একমত না হন, সাইট ব্যবহার থেকে বিরত থাকতে পারেন।',
  },
  {
    icon: FileText,
    title: '২. কনটেন্ট ব্যবহার',
    text: 'লেখা, ব্যাখ্যা, design, simulation logic এবং learning material ML Book by Ramim-এর নিজস্ব কনটেন্ট। অনুমতি ছাড়া commercial reuse, copy বা redistribution করা যাবে না।',
  },
  {
    icon: EyeOff,
    title: '৩. তথ্যের নির্ভুলতা',
    text: 'কনটেন্ট শিক্ষামূলক উদ্দেশ্যে তৈরি। আমরা নির্ভুলতা বজায় রাখার চেষ্টা করি, তবে academic বা professional সিদ্ধান্তের আগে নিজস্ব যাচাই করা উচিত।',
  },
  {
    icon: BellRing,
    title: '৪. third-party service',
    text: 'সাইটে external link, analytics বা advertisement service থাকতে পারে। third-party content বা policy-এর জন্য সংশ্লিষ্ট provider দায়ী।',
  },
  {
    icon: HelpCircle,
    title: '৫. সহায়তা ও যোগাযোগ',
    text: 'শর্তাবলী, কনটেন্ট ব্যবহার বা policy নিয়ে প্রশ্ন থাকলে Contact পেজের মাধ্যমে মেসেজ পাঠাতে পারেন।',
  },
];

export default function TermsConditions() {
  return (
    <main className="min-h-screen bg-[#050b12] px-5 py-14 text-slate-200 sm:px-8 lg:px-12 lg:py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="mx-auto max-w-5xl"
      >
        <motion.header variants={fadeUp} className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-300">
            <Scale size={14} />
            Legal Documents
          </div>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">ব্যবহারের শর্তাবলী</h1>
          <p className="mt-5 text-base leading-8 text-slate-400">
            এই learning platform ব্যবহার করার আগে প্রয়োজনীয় নিয়ম, সীমাবদ্ধতা এবং দায়িত্ব সম্পর্কে জেনে নিন।
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-slate-600">
            Last updated: May 23, 2026
          </p>
        </motion.header>

        <motion.div variants={fadeUp} className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Use</p>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">শিক্ষামূলক ও ব্যক্তিগত শেখার কাজে ব্যবহার করুন।</p>
          </div>
          <div className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Respect</p>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">কনটেন্ট কপি বা পুনঃপ্রকাশের আগে অনুমতি নিন।</p>
          </div>
          <div className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Verify</p>
            <p className="mt-2 text-sm font-semibold leading-7 text-slate-300">প্রফেশনাল সিদ্ধান্তের আগে তথ্য যাচাই করুন।</p>
          </div>
        </motion.div>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="mt-8 space-y-4"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.article key={section.title} variants={fadeUp} className="rounded-lg border border-cyan-100/[0.08] bg-[#06111d] p-5 md:p-6">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-300/10 text-teal-300">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">{section.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-400 md:text-base md:leading-8">{section.text}</p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.section>
      </motion.div>
    </main>
  );
}
