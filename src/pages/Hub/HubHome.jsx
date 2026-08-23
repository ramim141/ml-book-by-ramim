import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BrainCircuit, GraduationCap, ArrowRight, Sparkles,
  BookOpen, FlaskConical, Trophy, Database, Mail
} from 'lucide-react';
import SEO from '../../components/SEO';

const subSites = [
  {
    to: '/ml',
    label: 'সাব-সাইট ০১',
    title: 'শব্দে শব্দে মেশিন লার্নিং',
    subtitle: 'ML Book · বাংলা',
    description:
      'জটিল অ্যালগরিদম আর খটমট সংজ্ঞা বাদ দিয়ে, গল্পের ছলে আর ইন্টারেক্টিভ সিমুলেশনের মাধ্যমে মেশিন লার্নিং শিখুন। Hardcopy ও অনলাইন — দুই ভার্সনেই।',
    icon: BrainCircuit,
    cta: 'বই পড়া শুরু করুন',
    accent: {
      glow: 'bg-teal-500/20',
      ring: 'hover:border-teal-300/50',
      chipBg: 'bg-teal-300/10',
      chipText: 'text-teal-300',
      iconBg: 'bg-teal-300',
      iconText: 'text-[#06111d]',
      ctaText: 'text-teal-300',
    },
    highlights: [
      { icon: BookOpen, text: '২৮টি অধ্যায়' },
      { icon: FlaskConical, text: 'ইন্টারেক্টিভ ল্যাব' },
    ],
  },
  {
    to: '/academic',
    label: 'সাব-সাইট ০২',
    title: 'একাডেমিক হাব',
    subtitle: 'SSC · HSC · Admission',
    description:
      'বিগত সালের বোর্ড প্রশ্ন, সৃজনশীল ও বহুনির্বাচনী প্রশ্নব্যাংক, মডেল টেস্ট, লাইভ এক্সাম আর লিডারবোর্ড — এক জায়গায় পুরো প্রস্তুতি।',
    icon: GraduationCap,
    cta: 'প্রস্তুতি শুরু করুন',
    accent: {
      glow: 'bg-indigo-500/20',
      ring: 'hover:border-indigo-300/50',
      chipBg: 'bg-indigo-400/10',
      chipText: 'text-indigo-300',
      iconBg: 'bg-indigo-400',
      iconText: 'text-[#0b0f19]',
      ctaText: 'text-indigo-300',
    },
    highlights: [
      { icon: Database, text: 'স্মার্ট প্রশ্নব্যাংক' },
      { icon: Trophy, text: 'লাইভ এক্সাম' },
    ],
  },
];

const footerLinks = [
  { label: 'আমাদের সম্পর্কে', to: '/about' },
  { label: 'ব্লগ', to: '/ml/blog' },
  { label: 'যোগাযোগ', to: '/contact' },
  { label: 'প্রাইভেসি পলিসি', to: '/privacy' },
  { label: 'টার্মস', to: '/terms' },
];

export default function HubHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050b12] font-sans text-slate-200 selection:bg-teal-400/30">
      <SEO
        title="Learn with Ramim"
        description="রামীম আহমেদের কেন্দ্রীয় লার্নিং প্ল্যাটফর্ম — বাংলায় মেশিন লার্নিং শেখার ইন্টারেক্টিভ বই এবং SSC, HSC ও ভর্তি পরীক্ষার একাডেমিক হাব।"
        canonical="https://learnwithramim.com/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Learn with Ramim',
          url: 'https://learnwithramim.com/',
          description:
            'রামীম আহমেদের কেন্দ্রীয় লার্নিং প্ল্যাটফর্ম — বাংলা মেশিন লার্নিং বই এবং একাডেমিক হাব।',
        }}
      />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-300 text-[#06111d] shadow-[0_0_24px_rgba(45,212,191,0.25)]">
              <BrainCircuit size={20} />
            </span>
            <span className="text-base font-black leading-tight text-white sm:text-lg">
              Learn with Ramim
            </span>
          </div>

          <Link
            to="/contact"
            className="hidden items-center gap-2 rounded-md border border-cyan-100/[0.08] bg-[#071521] px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-teal-300/40 hover:text-teal-200 sm:inline-flex"
          >
            <Mail size={15} /> যোগাযোগ
          </Link>
        </header>

        {/* Hero */}
        <section className="mt-14 text-center sm:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/[0.07] px-4 py-2 text-xs font-bold text-teal-300 sm:text-sm"
          >
            <Sparkles size={15} /> রামীম আহমেদের লার্নিং প্ল্যাটফর্ম
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mt-7 max-w-3xl bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent sm:text-5xl lg:text-6xl"
          >
            Learn with Ramim
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8"
          >
            একটাই ঠিকানা, দুইটা আলাদা জগৎ — বাংলায় মেশিন লার্নিং শেখার ইন্টারেক্টিভ বই,
            আর SSC থেকে ভর্তি পরীক্ষা পর্যন্ত পূর্ণাঙ্গ একাডেমিক প্রস্তুতি। নিচ থেকে বেছে নিন।
          </motion.p>
        </section>

        {/* Sub-site cards */}
        <section className="mt-12 grid flex-1 content-start gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-8">
          {subSites.map((site, index) => {
            const Icon = site.icon;
            return (
              <motion.div
                key={site.to}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
              >
                <Link
                  to={site.to}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-100/[0.08] bg-[#071521] p-6 transition-all duration-300 hover:-translate-y-1 sm:p-8 ${site.accent.ring}`}
                >
                  <div
                    className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full ${site.accent.glow} blur-[90px] opacity-50 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  <div className="relative z-10 flex items-start gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${site.accent.iconBg} ${site.accent.iconText} sm:h-14 sm:w-14`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`inline-block rounded-md ${site.accent.chipBg} ${site.accent.chipText} px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]`}
                      >
                        {site.label}
                      </span>
                      <h2 className="mt-2.5 text-xl font-black leading-snug text-white sm:text-2xl">
                        {site.title}
                      </h2>
                      <p className="mt-1 text-xs font-bold text-slate-500 sm:text-sm">
                        {site.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="relative z-10 mt-5 text-sm leading-7 text-slate-400">
                    {site.description}
                  </p>

                  <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                    {site.highlights.map((highlight) => {
                      const HighlightIcon = highlight.icon;
                      return (
                        <span
                          key={highlight.text}
                          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-100/[0.08] bg-[#050b12] px-3 py-1.5 text-xs font-bold text-slate-400"
                        >
                          <HighlightIcon size={13} className={site.accent.chipText} />
                          {highlight.text}
                        </span>
                      );
                    })}
                  </div>

                  <div
                    className={`relative z-10 mt-auto flex items-center gap-2 pt-7 text-sm font-black ${site.accent.ctaText}`}
                  >
                    {site.cta}
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1.5"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="mt-14 border-t border-cyan-100/[0.06] pt-7 sm:mt-20">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-bold text-slate-500 transition-colors hover:text-teal-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-center text-xs text-slate-600">
            © 2026 <span className="font-bold text-slate-500">Learn with Ramim</span>. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
