import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookX, ArrowLeft, Target, Stethoscope, HeartPulse, Cpu, Microscope,
  Globe, GraduationCap, BookOpen, Briefcase, Sprout, Beaker
} from 'lucide-react';
import { useAdmissionPrograms } from '../../../hooks/useAdmissionData';
import MistakeNotebook from './MistakeNotebook';

/**
 * প্রোগ্রামের নাম, সাবটাইটেল ও ফিরে যাওয়ার লিংক এখন `admin_settings/admission`
 * থেকে আসে (useAdmissionPrograms)। এখানে শুধু উপস্থাপনের অংশটুকু — আইকন ও
 * অ্যাকসেন্ট রঙ — ম্যাপ করা, কারণ ওগুলো ডেটাবেসে রাখা হয় না। নতুন কোনো প্রোগ্রাম
 * অ্যাডমিন প্যানেল থেকে যোগ হলে সেটাও এখানে কাজ করবে, শুধু ডিফল্ট আইকন পাবে।
 */
const PROGRAM_STYLE = {
  medical: { icon: Stethoscope, accent: 'rose' },
  nursing: { icon: HeartPulse, accent: 'emerald' },
  engineering: { icon: Cpu, accent: 'blue' },
  'varsity-a': { icon: Microscope, accent: 'indigo' },
  'varsity-b': { icon: BookOpen, accent: 'amber' },
  'varsity-c': { icon: Briefcase, accent: 'cyan' },
  gst: { icon: Globe, accent: 'teal' },
  agri: { icon: Sprout, accent: 'lime' },
  'iba-bup': { icon: Target, accent: 'fuchsia' },
  hsc: { icon: GraduationCap, accent: 'violet' },
  ssc: { icon: Beaker, accent: 'sky' }
};

/**
 * এইচএসসি/এসএসসি ভর্তি প্রোগ্রাম নয় — এগুলোর রুট অ্যাপেই স্থির, তাই এখানেই থাকে।
 */
const LEVEL_META = {
  hsc: {
    title: 'এইচএসসি মিসটেক বুক (HSC Mistake Book)',
    shortTitle: 'এইচএসসি মিসটেক বুক',
    backPath: '/academic/hsc',
    backLabel: 'এইচএসসিতে ফিরে যান'
  },
  ssc: {
    title: 'এসএসসি মিসটেক বুক (SSC Mistake Book)',
    shortTitle: 'এসএসসি মিসটেক বুক',
    backPath: '/academic/ssc',
    backLabel: 'এসএসসিতে ফিরে যান'
  }
};

const ACCENT_TEXT = {
  rose: 'text-rose-400',
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  teal: 'text-teal-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  lime: 'text-lime-400',
  fuchsia: 'text-fuchsia-400',
  sky: 'text-sky-400'
};

/** 'নার্সিং ভর্তি প্রস্তুতি (BSc & Diploma)' → 'নার্সিং ভর্তি প্রস্তুতি' */
function shortenProgramTitle(title = '') {
  return title.split('(')[0].split('/')[0].split('—')[0].trim() || title;
}

export default function MistakePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programKey = searchParams.get('program');
  const { data: programs = [] } = useAdmissionPrograms();

  const currentMeta = useMemo(() => {
    if (!programKey) return null;

    const style = PROGRAM_STYLE[programKey] || {};
    const level = LEVEL_META[programKey];
    if (level) return { ...level, ...style, isAdmission: false };

    const program = programs.find((p) => p.id === programKey);
    if (!program) return null;

    const short = shortenProgramTitle(program.title);
    return {
      title: `${short} মিসটেক বুক`,
      shortTitle: `${short} মিসটেক বুক`,
      backPath: program.path || `/academic/admission/${program.id}`,
      backLabel: `${short}-এ ফিরে যান`,
      isAdmission: true,
      ...style
    };
  }, [programKey, programs]);

  const HeaderIcon = currentMeta?.icon || BookX;
  const accent = currentMeta?.accent || 'rose';
  const accentText = ACCENT_TEXT[accent] || ACCENT_TEXT.rose;
  // এইচএসসি/এসএসসি-র মডেল টেস্ট আলাদা রুটে, তাই লিংকটাও প্রোগ্রাম অনুযায়ী বদলায়
  const modelTestPath = currentMeta && !currentMeta.isAdmission
    ? '/academic/model-test'
    : '/academic/admission/model-test';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [programKey]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-24 font-bangla selection:bg-rose-500/30">

      {/* Sticky title bar — one row, no stacked boxes */}
      <header className="sticky top-[64px] sm:top-[80px] z-30 bg-[#070b14]/95 backdrop-blur-xl border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2.5">

          <button
            onClick={() => currentMeta?.backPath ? navigate(currentMeta.backPath) : navigate(-1)}
            className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] active:scale-95 transition shrink-0"
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

          {/* মোবাইলে শুধু আইকন — তবে ট্যাপ এরিয়া যেন ছোট না হয় তাই বর্ডারসহ বাটন */}
          <Link
            to={modelTestPath}
            title="মডেল টেস্ট"
            aria-label="মডেল টেস্ট"
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 sm:px-3 text-[12px] font-bold transition hover:bg-white/[0.09] hover:text-white active:scale-95 ${accentText}`}
          >
            <Target className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">মডেল টেস্ট</span>
          </Link>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <MistakeNotebook program={programKey} accent={accent} modelTestPath={modelTestPath} />
      </main>

    </div>
  );
}
