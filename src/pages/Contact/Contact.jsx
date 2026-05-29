import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react';

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxr2Yz2uECcWJ6aEoglmSRMOD24ddba6Im4QtKQVyy6KSBsjCEWrp796AjpXwjVrVY-/exec';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const contactItems = [
  {
    icon: Mail,
    label: 'ইমেইল',
    value: 'ahramu584@gmail.com',
    href: 'mailto:ahramu584@gmail.com',
  },
  {
    icon: Clock,
    label: 'রেসপন্স টাইম',
    value: 'সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে',
  },
  {
    icon: MapPin,
    label: 'লোকেশন',
    value: 'Bangladesh, online-first',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error!', error);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[#050b12] px-5 py-14 text-slate-200 sm:px-8 lg:px-12 lg:py-20">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="mx-auto max-w-7xl"
      >
        <motion.div variants={fadeUp} className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-teal-300/20 bg-teal-300/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-teal-300">
            <Sparkles size={14} />
            Contact
          </div>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            প্রশ্ন, feedback বা সহযোগিতার কথা জানাতে পারেন।
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
            বই, ল্যাব, কনটেন্ট বা পার্টনারশিপ নিয়ে কোনো কথা থাকলে নিচের ফর্মে লিখুন। পরিষ্কার context দিলে উত্তর দেওয়া আরও সহজ হয়।
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.aside variants={fadeUp} className="space-y-4">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex gap-4 rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5 transition hover:border-teal-300/25">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal-300/10 text-teal-300">
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</span>
                    <span className="mt-1 block text-sm font-bold text-slate-200">{item.value}</span>
                  </span>
                </div>
              );

              return item.href ? (
                <a key={item.label} href={item.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}

            <div className="rounded-lg border border-cyan-100/[0.08] bg-[#06111d] p-6">
              <MessageSquare size={22} className="text-cyan-300" />
              <h2 className="mt-4 text-xl font-black text-white">কী লিখবেন?</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                আপনার প্রশ্নের বিষয়, কোন পেজ বা lesson নিয়ে বলছেন, এবং আপনি কী ধরনের সাহায্য চান তা লিখলে দ্রুত ও নির্ভুলভাবে উত্তর দেওয়া যায়।
              </p>
            </div>
          </motion.aside>

          <motion.section variants={fadeUp} className="rounded-lg border border-cyan-100/[0.08] bg-[#071521] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-8">
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
                    <CheckCircle2 size={34} />
                  </div>
                  <h2 className="mt-6 text-3xl font-black text-white">মেসেজ পাঠানো হয়েছে</h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                    ধন্যবাদ। আপনার মেসেজ পেয়েছি, যত দ্রুত সম্ভব উত্তর দেওয়া হবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-7 rounded-md border border-cyan-100/15 px-5 py-3 text-sm font-bold text-slate-200 transition hover:border-teal-300/40 hover:text-teal-200"
                  >
                    আরেকটি মেসেজ পাঠান
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <InputField
                      label="আপনার নাম"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="উদাহরণ: রামীম আহমেদ"
                      required
                    />
                    <InputField
                      label="ইমেইল"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ramim@example.com"
                      required
                    />
                  </div>

                  <InputField
                    label="বিষয়"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="আপনি কোন বিষয়ে জানতে চান?"
                    required
                  />

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">মেসেজ</span>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows="6"
                      placeholder="এখানে বিস্তারিত লিখুন..."
                      className="w-full resize-none rounded-md border border-cyan-100/[0.08] bg-[#050b12] p-4 text-sm leading-7 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10"
                    />
                  </label>

                  {status === 'error' && (
                    <p className="rounded-md border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm font-semibold text-rose-200">
                      মেসেজ পাঠাতে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-teal-300 px-6 py-4 text-sm font-black text-[#06111d] transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        মেসেজ পাঠান
                        <Send size={17} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </motion.div>
    </main>
  );
}

function InputField({ label, type = 'text', ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input
        type={type}
        {...props}
        className="w-full rounded-md border border-cyan-100/[0.08] bg-[#050b12] p-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-teal-300/50 focus:ring-2 focus:ring-teal-300/10"
      />
    </label>
  );
}
