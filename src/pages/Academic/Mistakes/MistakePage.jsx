import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookX, ArrowLeft, Target, Sparkles, Stethoscope, HeartPulse, Cpu, Microscope, Globe, GraduationCap } from 'lucide-react';
import MistakeNotebook from './MistakeNotebook';

const PROGRAM_META = {
  medical: {
    title: 'মেডিকেল মিসটেক বুক (Medical Mistake Book)',
    subtitle: 'MBBS ও BDS ভর্তি পরীক্ষার ভুলসমূহ ও রিভিশন',
    icon: Stethoscope,
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    backPath: '/academic/admission/medical',
    backLabel: 'মেডিকেলে ফিরে যান'
  },
  nursing: {
    title: 'নার্সিং মিসটেক বুক (Nursing Mistake Book)',
    subtitle: 'BSc ও ডিপ্লোমা নার্সিং ভর্তি পরীক্ষার ভুলসমূহ',
    icon: HeartPulse,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    backPath: '/academic/admission/nursing',
    backLabel: 'নার্সিংয়ে ফিরে যান'
  },
  engineering: {
    title: 'ইঞ্জিনিয়ারিং মিসটেক বুক (Engineering Mistake Book)',
    subtitle: 'বুয়েট, চুয়েট, কুয়েট, রুয়েট ও ইঞ্জিনিয়ারিং ভুলসমূহ',
    icon: Cpu,
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    backPath: '/academic/admission/engineering',
    backLabel: 'ইঞ্জিনিয়ারিংয়ে ফিরে যান'
  },
  'varsity-a': {
    title: 'ভার্সিটি ক মিসটেক বুক (Varsity A Mistake Book)',
    subtitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট ও বিজ্ঞান ভর্তি ভুলসমূহ',
    icon: Microscope,
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    backPath: '/academic/admission/varsity-a',
    backLabel: 'ভার্সিটি ক-তে ফিরে যান'
  },
  gst: {
    title: 'গুচ্ছ (GST) মিসটেক বুক',
    subtitle: '২৪ বিশ্ববিদ্যালয় গুচ্ছ ভর্তি পরীক্ষার ভুলসমূহ',
    icon: Globe,
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    backPath: '/academic/admission/gst',
    backLabel: 'গুচ্ছে ফিরে যান'
  },
  hsc: {
    title: 'এইচএসসি মিসটেক বুক (HSC Mistake Book)',
    subtitle: 'এইচএসসি বোর্ড ও টেস্ট পরীক্ষার ভুল প্রশ্নসমূহ',
    icon: GraduationCap,
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    backPath: '/academic/hsc',
    backLabel: 'এইচএসসিতে ফিরে যান'
  }
};

export default function MistakePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programKey = searchParams.get('program');
  const currentMeta = programKey && PROGRAM_META[programKey] ? PROGRAM_META[programKey] : null;
  const HeaderIcon = currentMeta ? currentMeta.icon : BookX;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [programKey]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 font-bangla selection:bg-rose-500/30">
      
      {/* Top Floating Control Bar */}
      <header className="sticky top-[64px] sm:top-[80px] z-30 bg-[#090d18]/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => currentMeta?.backPath ? navigate(currentMeta.backPath) : navigate(-1)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition shrink-0"
              title={currentMeta?.backLabel || 'পিছনে যান'}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`p-1.5 rounded-xl border ${currentMeta ? currentMeta.badgeColor : 'bg-rose-500/15 text-rose-400 border-rose-500/30'}`}>
                <HeaderIcon className="h-4 w-4" />
              </span>
              <div>
                <h1 className="text-sm sm:text-base font-black text-white whitespace-nowrap">
                  {currentMeta ? currentMeta.title : 'মিসটেক বুক (Mistake Notebook)'}
                </h1>
                {currentMeta?.subtitle && (
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {currentMeta.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick action */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/academic/admission/model-test"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
            >
              <Target className="h-3.5 w-3.5" />
              <span>মডেল টেস্ট</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <MistakeNotebook program={programKey} />
      </main>

    </div>
  );
}

