import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookX, ArrowLeft, Target, Stethoscope, HeartPulse, Cpu, Microscope, Globe, GraduationCap } from 'lucide-react';
import MistakeNotebook from './MistakeNotebook';

const PROGRAM_META = {
  medical: {
    title: 'মেডিকেল মিসটেক বুক (Medical Mistake Book)',
    shortTitle: 'মেডিকেল মিসটেক বুক',
    accent: 'rose',
    subtitle: 'MBBS ও BDS ভর্তি পরীক্ষার ভুলসমূহ ও রিভিশন',
    icon: Stethoscope,
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    backPath: '/academic/admission/medical',
    backLabel: 'মেডিকেলে ফিরে যান'
  },
  nursing: {
    title: 'নার্সিং মিসটেক বুক (Nursing Mistake Book)',
    shortTitle: 'নার্সিং মিসটেক বুক',
    accent: 'emerald',
    subtitle: 'BSc ও ডিপ্লোমা নার্সিং ভর্তি পরীক্ষার ভুলসমূহ',
    icon: HeartPulse,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    backPath: '/academic/admission/nursing',
    backLabel: 'নার্সিংয়ে ফিরে যান'
  },
  engineering: {
    title: 'ইঞ্জিনিয়ারিং মিসটেক বুক (Engineering Mistake Book)',
    shortTitle: 'ইঞ্জিনিয়ারিং মিসটেক বুক',
    accent: 'blue',
    subtitle: 'বুয়েট, চুয়েট, কুয়েট, রুয়েট ও ইঞ্জিনিয়ারিং ভুলসমূহ',
    icon: Cpu,
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    backPath: '/academic/admission/engineering',
    backLabel: 'ইঞ্জিনিয়ারিংয়ে ফিরে যান'
  },
  'varsity-a': {
    title: 'ভার্সিটি ক মিসটেক বুক (Varsity A Mistake Book)',
    shortTitle: 'ভার্সিটি ক মিসটেক বুক',
    accent: 'indigo',
    subtitle: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট ও বিজ্ঞান ভর্তি ভুলসমূহ',
    icon: Microscope,
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    backPath: '/academic/admission/varsity-a',
    backLabel: 'ভার্সিটি ক-তে ফিরে যান'
  },
  gst: {
    title: 'গুচ্ছ (GST) মিসটেক বুক',
    shortTitle: 'গুচ্ছ মিসটেক বুক',
    accent: 'teal',
    subtitle: '২৪ বিশ্ববিদ্যালয় গুচ্ছ ভর্তি পরীক্ষার ভুলসমূহ',
    icon: Globe,
    badgeColor: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    backPath: '/academic/admission/gst',
    backLabel: 'গুচ্ছে ফিরে যান'
  },
  hsc: {
    title: 'এইচএসসি মিসটেক বুক (HSC Mistake Book)',
    shortTitle: 'এইচএসসি মিসটেক বুক',
    accent: 'violet',
    subtitle: 'এইচএসসি বোর্ড ও টেস্ট পরীক্ষার ভুল প্রশ্নসমূহ',
    icon: GraduationCap,
    badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    backPath: '/academic/hsc',
    backLabel: 'এইচএসসিতে ফিরে যান'
  }
};

const ACCENT_TEXT = {
  rose: 'text-rose-400',
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  teal: 'text-teal-400',
  violet: 'text-violet-400'
};

export default function MistakePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programKey = searchParams.get('program');
  const currentMeta = programKey && PROGRAM_META[programKey] ? PROGRAM_META[programKey] : null;
  const HeaderIcon = currentMeta ? currentMeta.icon : BookX;
  const accent = currentMeta?.accent || 'rose';
  const accentText = ACCENT_TEXT[accent] || ACCENT_TEXT.rose;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [programKey]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 font-bangla selection:bg-rose-500/30">
      
      {/* Sticky title bar — one row, no stacked boxes */}
      <header className="sticky top-[64px] sm:top-[80px] z-30 bg-[#070b14]/95 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 sm:gap-2.5">

          <button
            onClick={() => currentMeta?.backPath ? navigate(currentMeta.backPath) : navigate(-1)}
            className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-white transition shrink-0"
            title={currentMeta?.backLabel || 'পিছনে যান'}
            aria-label={currentMeta?.backLabel || 'পিছনে যান'}
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>

          <HeaderIcon className={`h-[18px] w-[18px] shrink-0 ${accentText}`} />

          <h1 className="text-[13.5px] sm:text-base font-black text-white truncate min-w-0 flex-1">
            <span className="hidden sm:inline">
              {currentMeta ? currentMeta.title : 'মিসটেক বুক (Mistake Notebook)'}
            </span>
            <span className="sm:hidden">
              {currentMeta ? (currentMeta.shortTitle || currentMeta.title) : 'মিসটেক বুক'}
            </span>
          </h1>

          <Link
            to="/academic/admission/model-test"
            title="মডেল টেস্ট"
            className={`shrink-0 inline-flex items-center gap-1.5 p-1 text-[12px] font-bold transition hover:text-white ${accentText}`}
          >
            <Target className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">মডেল টেস্ট</span>
          </Link>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <MistakeNotebook program={programKey} accent={currentMeta?.accent || 'rose'} />
      </main>

    </div>
  );
}

