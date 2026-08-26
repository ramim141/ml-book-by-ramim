import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Sparkles, GraduationCap, Award, Library, Target, 
  CalendarDays, FlaskConical, Zap, ShieldCheck, Mail, Phone, 
  MapPin, Heart, Code2, ArrowUpRight, ChevronRight, User, School
} from 'lucide-react';

function smoothToTop() {
  window.setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 0);
}

const ACADEMIC_TRACKS = [
  { name: 'এসএসসি প্রস্তুতি (SSC 9-10)', path: '/academic/ssc' },
  { name: 'এইচএসসি প্রস্তুতি (HSC 11-12)', path: '/academic/hsc' },
  { name: 'মেডিকেল ও ডেন্টাল (MBBS/BDS)', path: '/academic/admission/medical' },
  { name: 'নার্সিং ভর্তি হাব (BSc/Diploma)', path: '/academic/admission/nursing' },
  { name: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি (BUET/CKET)', path: '/academic/admission/engineering' },
  { name: 'ঢাবি ‘ক’ ও জিএসটি গুচ্ছ', path: '/academic/admission/varsity-a' },
];

const SMART_TOOLS = [
  { name: 'প্রশ্ন তৈরির জাদুকর (Question Builder)', path: '/academic/question-builder', isNew: true },
  { name: 'স্মার্ট মডেল টেস্ট হাব (Model Test)', path: '/academic/admission/model-test' },
  { name: 'বিগত সালের প্রশ্নব্যাংক', path: '/academic/admission/question-bank' },
  { name: 'ভর্তি পরীক্ষার সময়সূচী ও রুটিন', path: '/academic/admission/exam-schedule' },
  { name: 'ইন্টারেক্টিভ পর্যায় সারণি', path: '/academic/periodic-table' },
  { name: 'স্মার্ট ফর্মুলা ও শর্টকাট শিট', path: '/academic/formula-sheet' },
  { name: 'ভুলের খাতা (Mistake Book)', path: '/academic/admission/mistakes' },
];

import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function AcademicFooter() {
  const { data: siteSettings } = useSiteSettings();
  const dev = siteSettings?.developer || {};
  const soc = siteSettings?.social || {};

  const socialLinks = [
    {
      label: `LinkedIn (${soc.linkedinUser || 'ramim-ahmed'})`,
      href: soc.linkedin || 'https://www.linkedin.com/in/ramim-ahmed',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.82-2.06 3.74-2.06 4 0 4.74 2.63 4.74 6.05V21h-4v-5.72c0-1.36-.03-3.1-1.89-3.1-1.89 0-2.18 1.48-2.18 3V21h-4V9Z" />
        </svg>
      ),
    },
    {
      label: `Facebook (${soc.facebookUser || 'ramim141'})`,
      href: soc.facebook || 'https://www.facebook.com/ramim141',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.55c0-.93.26-1.56 1.6-1.56h1.7V4.13c-.83-.09-1.66-.13-2.5-.13-2.5 0-4.22 1.52-4.22 4.3v2.38H7.07v3.2h2.99V22h3.44Z" />
        </svg>
      ),
    },
    {
      label: `YouTube (${soc.youtubeUser || '@codewithramuu'})`,
      href: soc.youtube || 'https://www.youtube.com/@codewithramuu',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      label: `Email (${soc.email || 'ahramu584@gmail.com'})`,
      href: `mailto:${soc.email || 'ahramu584@gmail.com'}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative mt-auto border-t border-indigo-500/15 bg-[#040813] font-bangla text-slate-300 selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-fuchsia-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Brand & Minimal Developer Card (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/academic" onClick={smoothToTop} className="inline-flex items-center transition hover:opacity-95 group">
              <img 
                src="/assets/images/logo.png" 
                alt="অ্যাকাডেমিক হাব" 
                className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              এসএসসি, এইচএসসি ও মেডিকেল-ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার জন্য পূর্ণাঙ্গ ডিজিটাল রিসোর্স, স্মার্ট মডেল টেস্ট ও স্বয়ংক্রিয় প্রশ্ন তৈরির আধুনিক প্ল্যাটফর্ম।
            </p>

            {/* Minimal Developer Card (Icon-free typography, dynamic from admin) */}
            <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-3 backdrop-blur-sm">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
                  DEVELOPED & MAINTAINED BY
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                  {dev.name || 'Ramim Ahmed'}
                </h4>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {dev.degree || 'BSc in CSE'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {dev.university || 'Metropolitan University'}
                </p>
              </div>

              {/* Social Channels */}
              <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.06]">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.label}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-indigo-600/30 text-slate-400 hover:text-white border border-white/[0.06] hover:border-indigo-500/40 transition"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Academic Tracks (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>একাডেমিক ট্র্যাকসমূহ</span>
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              {ACADEMIC_TRACKS.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={smoothToTop}
                    className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Smart Tools & Utilities (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>স্মার্ট স্টাডি টুলস</span>
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              {SMART_TOOLS.map((tool) => (
                <li key={tool.name}>
                  <Link
                    to={tool.path}
                    onClick={smoothToTop}
                    className="group inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-300 font-medium transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    <span>{tool.name}</span>
                    {tool.isNew && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        NEW
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Platform Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>যোগাযোগ</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-slate-400 font-medium">
              <a
                href="mailto:ahramu584@gmail.com"
                className="flex items-start gap-2 hover:text-indigo-300 transition-colors"
              >
                <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span className="break-all">ahramu584@gmail.com</span>
              </a>

              <a
                href="tel:+8801768628911"
                className="flex items-center gap-2 hover:text-emerald-300 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+8801768628911</span>
              </a>

              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Sylhet, Bangladesh</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/ml"
                onClick={smoothToTop}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>মেশিন লার্নিং বই পড়ুন</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Credit Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()}</span>
            <strong className="text-slate-200">Learn with Ramim</strong>
            <span>— সর্বস্বত্ব সংরক্ষিত।</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Developed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>by</span>
            <span className="font-bold text-indigo-300">Ramim Ahmed</span>
            <span className="text-slate-500 hidden sm:inline">(BSc in CSE, Metropolitan University)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <Link to="/privacy" onClick={smoothToTop} className="hover:text-slate-300 transition">প্রাইভেসি পলিসি</Link>
            <span>•</span>
            <Link to="/terms" onClick={smoothToTop} className="hover:text-slate-300 transition">শর্তাবলী</Link>
            <span>•</span>
            <Link to="/contact" onClick={smoothToTop} className="hover:text-slate-300 transition">যোগাযোগ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
