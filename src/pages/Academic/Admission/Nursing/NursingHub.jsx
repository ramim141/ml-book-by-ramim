import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, HeartPulse, Stethoscope, Baby, Clock, 
  ArrowRight, Sparkles, ShieldCheck, GraduationCap, 
  Users, CheckCircle2, Award, BookOpen
} from 'lucide-react';
import { NURSING_TRACKS } from '../../../../data/academic/nursingConfig';

export default function NursingHub() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const trackQuickDetails = {
    bsc: {
      title: 'বিএসসি ইন নার্সিং (BSc in Nursing)',
      durationBadge: '৪ বছর মেয়াদী অনার্স',
      subtitle: 'বিজ্ঞান বিভাগের শিক্ষার্থীদের জন্য সরকারি ও বেসরকারি নার্সিং কলেজ কোর্স।',
      points: [
        'ন্যূনতম যোগ্যতা: বিজ্ঞান বিভাগ থেকে জিপিএ ৭.০০+',
        '১০০টি MCQ প্রশ্ন • ৬০ মিনিট সময় • নেগেটিভ মার্কিং',
        'বিষয়: পদার্থ, রসায়ন, জীববিজ্ঞান, বাংলা, ইংরেজি, গণিত ও জিকে'
      ],
      btnText: 'বিএসসি প্রস্তুতিতে প্রবেশ করুন'
    },
    diploma: {
      title: 'ডিপ্লোমা ইন নার্সিং সায়েন্স (Diploma)',
      durationBadge: '৩ বছর মেয়াদী ডিপ্লোমা',
      subtitle: 'বিজ্ঞান, মানবিক ও বাণিজ্য সকল বিভাগের শিক্ষার্থীদের জন্য নার্সিং কোর্স।',
      points: [
        'ন্যূনতম যোগ্যতা: যেকোনো বিভাগ থেকে জিপিএ ৬.০০+',
        '১০০টি MCQ প্রশ্ন • ৬০ মিনিট সময় • ছেলে ও মেয়ে উভয়ই যোগ্য',
        'বিষয়: সাধারণ বিজ্ঞান, বাংলা, ইংরেজি, সাধারণ গণিত ও জিকে'
      ],
      btnText: 'ডিপ্লোমা প্রস্তুতিতে প্রবেশ করুন'
    },
    midwifery: {
      title: 'ডিপ্লোমা ইন মিডওয়াইফারি (Midwifery)',
      durationBadge: '৩ বছর মেয়াদী বিশেষায়িত',
      subtitle: 'শুধুমাত্র নারী প্রার্থীদের জন্য বিশেষায়িত মিডওয়াইফারি ও স্বাস্থ্যসেবা কোর্স।',
      points: [
        'ন্যূনতম যোগ্যতা: যেকোনো বিভাগ থেকে জিপিএ ৬.০০+ (নারী)',
        '১০০টি MCQ প্রশ্ন • ৬০ মিনিট সময় • সরকারি ইনস্টিটিউটসমূহ',
        'বিষয়: সাধারণ বিজ্ঞান, বাংলা, ইংরেজি, সাধারণ গণিত ও জিকে'
      ],
      btnText: 'মিডওয়াইফারি প্রস্তুতিতে প্রবেশ করুন'
    }
  };

  return (
    <div className="min-h-screen bg-[#070d1e] pb-24 sm:pb-16 pt-6 font-bangla selection:bg-emerald-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            to="/academic/admission" 
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition mb-3 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            অ্যাডমিশন সেন্টারে ফিরে যান
          </Link>

          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/50 border border-emerald-500/25 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wide">
                <HeartPulse className="w-4 h-4" />
                <span>BANGLADESH NURSING & MIDWIFERY COUNCIL (BNMC)</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                নার্সিং ও মিডওয়াইফারি <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">ভর্তি পোর্টাল</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                বাংলাদেশ নার্সিং কাউন্সিলের অধীনে বিএসসি, ডিপ্লোমা ও মিডওয়াইফারি ভর্তি পরীক্ষার বিগত সালের আসল প্রশ্নব্যাংক, অধ্যায়ভিত্তিক দাগানো লাইনস ও ১০০ নম্বরের মডেল টেস্ট। আপনার কাঙ্ক্ষিত প্রোগ্রাম সিলেক্ট করুন:
              </p>
            </div>
          </div>
        </div>

        {/* ─── 3 Clean Modern Cards ────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <span>নার্সিং প্রোগ্রামসমূহ (কোর্স নির্বাচন করুন)</span>
            </h2>
            <span className="text-xs text-slate-400">৩টি শাখা উপলব্ধ</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {NURSING_TRACKS.map((track) => {
              const details = trackQuickDetails[track.id] || trackQuickDetails.bsc;
              const Icon = track.id === 'bsc' ? Stethoscope : track.id === 'diploma' ? HeartPulse : Baby;
              
              const cardBg = track.id === 'bsc' 
                ? 'from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30 hover:border-emerald-500/60' :
                track.id === 'diploma'
                ? 'from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/30 hover:border-indigo-500/60' :
                'from-pink-950/40 via-slate-900 to-slate-900 border-pink-500/30 hover:border-pink-500/60';

              const iconColor = track.id === 'bsc' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                track.id === 'diploma' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' :
                                'bg-pink-500/20 text-pink-400 border-pink-500/30';

              const badgeColor = track.id === 'bsc' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                                 track.id === 'diploma' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                                 'bg-pink-500/10 text-pink-300 border-pink-500/30';

              const btnColor = track.id === 'bsc' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' :
                               track.id === 'diploma' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' :
                               'bg-pink-600 hover:bg-pink-500 shadow-pink-600/20';

              return (
                <div
                  key={track.id}
                  className={`group rounded-3xl border bg-gradient-to-b ${cardBg} p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-lg`}
                >
                  <div className="space-y-4">
                    {/* Top Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${iconColor} shadow-inner`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                        {details.durationBadge}
                      </span>
                    </div>

                    {/* Title & Short Subtitle */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">
                        {details.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {details.subtitle}
                      </p>
                    </div>

                    {/* 3 Clean Bullet Highlights */}
                    <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                      {details.points.map((pt, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clean CTA Action Button */}
                  <Link
                    to={`/academic/admission/nursing/${track.id}`}
                    className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl ${btnColor} text-white text-xs sm:text-sm font-bold shadow-lg transition-all transform active:scale-95`}
                  >
                    <span>{details.btnText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Nursing Admission FAQ & Guidelines ─────────────────────────────── */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h3 className="text-lg sm:text-xl font-bold text-white">
              নার্সিং ভর্তি পরীক্ষার গুরুত্বপূর্ণ তথ্য ও নির্দেশিকা
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-2">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>নেগেটিভ মার্কিং পদ্ধতি</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                নার্সিং ভর্তি পরীক্ষায় প্রতিটি সঠিক উত্তরের জন্য ১ নম্বর যোগ হবে এবং ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে (নেগেটিভ মার্কিং প্রযোজ্য)।
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-2">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>পাস নম্বর ও মেধা তালিকা</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                ১০০ নম্বরের ভর্তি পরীক্ষায় ন্যূনতম পাস নম্বর ৪০। ভর্তি পরীক্ষার ১০০ নম্বর এবং এসএসসি ও এইচএসসি জিপিএ নম্বরের ভিত্তিতে মেধা তালিকা তৈরি হয়।
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-2">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>কোটা ও পুরুষ প্রার্থী অনুপাত</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                বিএসসি ও ডিপ্লোমা নার্সিং কোর্সে সরকারি প্রতিষ্ঠানে মোট আসনের ১০% পুরুষ প্রার্থীদের জন্য সংরক্ষিত। মিডওয়াইফারি কোর্সে শুধুমাত্র নারী প্রার্থীরা আবেদন করতে পারেন।
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-2">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ভবিষ্যৎ ক্যারিয়ার ও স্কোপ</span>
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                কোর্স সফলভাবে সম্পন্ন করার পর বাংলাদেশ নার্সিং কাউন্সিল থেকে লাইসেন্স প্রাপ্ত হয়ে সরকারি হাসপাতাল, সামরিক হাসপাতাল এবং আন্তর্জাতিক পর্যায়ে ক্যারিয়ার গড়ার সুযোগ রয়েছে।
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
