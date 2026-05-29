import { motion } from 'framer-motion';
import { Cookie, Database, FileCheck, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
};

const sections = [
  {
    icon: ShieldCheck,
    title: '১. তথ্য সংগ্রহ',
    text: 'আপনি যখন contact form ব্যবহার করেন, তখন আমরা আপনার নাম, ইমেইল, বিষয় এবং মেসেজ সংগ্রহ করতে পারি। এই তথ্য শুধুমাত্র যোগাযোগ এবং সহায়তার জন্য ব্যবহার করা হয়।',
  },
  {
    icon: Cookie,
    title: '২. কুকিজ ও বিজ্ঞাপন',
    text: 'সাইটে third-party service বা বিজ্ঞাপন থাকলে তারা cookies ব্যবহার করতে পারে। আপনার browser settings থেকে cookies নিয়ন্ত্রণ করা যায়।',
  },
  {
    icon: Database,
    title: '৩. লগ ডেটা',
    text: 'সাইটের performance বুঝতে browser type, page visit, device information বা similar analytics data ব্যবহৃত হতে পারে। এগুলো সাধারণত aggregate form-এ দেখা হয়।',
  },
  {
    icon: UserCheck,
    title: '৪. তথ্য শেয়ারিং',
    text: 'আপনার ব্যক্তিগত তথ্য আমরা বিক্রি করি না। প্রয়োজন হলে কেবল service operation, আইনগত বাধ্যবাধকতা বা নিরাপত্তার কারণে সীমিতভাবে তথ্য ব্যবহার করা হতে পারে।',
  },
  {
    icon: FileCheck,
    title: '৫. নীতির পরিবর্তন',
    text: 'Privacy Policy সময়ের সাথে আপডেট হতে পারে। পরিবর্তন হলে এই পেজেই নতুন তারিখসহ প্রকাশ করা হবে।',
  },
  {
    icon: Mail,
    title: '৬. যোগাযোগ',
    text: 'গোপনীয়তা নীতি নিয়ে প্রশ্ন থাকলে contact@mlbookramim.com এ ইমেইল করতে পারেন অথবা Contact পেজ ব্যবহার করতে পারেন।',
  },
];

export default function PrivacyPolicy() {
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
            <Lock size={14} />
            Data Protection
          </div>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">গোপনীয়তা নীতি</h1>
          <p className="mt-5 text-base leading-8 text-slate-400">
            আপনার তথ্য কীভাবে সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখা হয় তার সরল ব্যাখ্যা।
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-slate-600">
            Last updated: May 23, 2026
          </p>
        </motion.header>

        <motion.div variants={fadeUp} className="mt-10 rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5 md:p-7">
          <p className="text-sm leading-7 text-slate-400">
            এই policy educational website ব্যবহারের সাধারণ privacy expectation ব্যাখ্যা করে। আমরা learner trust-কে গুরুত্ব দিই এবং প্রয়োজনের বাইরে কোনো personal data চাই না।
          </p>
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
