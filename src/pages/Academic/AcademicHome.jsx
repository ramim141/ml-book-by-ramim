import { memo, useMemo } from 'react';
import { 
  Book, GraduationCap, Video, ArrowRight, Library, BookOpen, FileText, 
  CheckSquare, Sparkles, Award, PlayCircle, Brain, Target, ShieldCheck, 
  Zap, Trophy, Activity, CalendarDays, Clock, FlaskConical, Stethoscope, 
  ChevronRight, Compass, ShieldAlert, Cpu, HeartPulse, Sparkle, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../config/firebase';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';
import { useAdmissionExamSchedules } from '../../hooks/useAdmissionData';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { QK, STALE } from '../../lib/queryConfig';
import SEO from '../../components/SEO';
import GlobalSearch from '../../components/Academic/GlobalSearch';
import DailyChallengeWidget from '../../components/Academic/DailyChallengeWidget';
import { Megaphone } from 'lucide-react';

// Helper to calculate days remaining until exam
function getDaysRemaining(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Convert English numbers to Bengali numerals
const toBn = (num) => {
  if (num === null || num === undefined) return '০';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bnDigits[d]);
};

const TrackCard = memo(({ title, subtitle, track, icon: Icon, badge, colorGradient, borderHover, glowColor, path, groups }) => (
  <Link
    to={path}
    className={`group relative overflow-hidden rounded-[2.5rem] bg-slate-900/70 border border-slate-800/90 ${borderHover} p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 shadow-2xl backdrop-blur-xl`}
  >
    {/* Subtle Background Glow */}
    <div className={`absolute top-0 right-0 w-44 h-44 ${glowColor} blur-[70px] rounded-full group-hover:opacity-100 opacity-40 transition-opacity duration-700 pointer-events-none`}></div>
    
    <div className="space-y-5 relative z-10">
      <div className="flex items-center justify-between">
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${colorGradient} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
          <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-md">
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />
          </div>
        </div>
        {badge && (
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-300 backdrop-blur-md">
            {badge}
          </span>
        )}
      </div>

      <div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
          {track}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Group / Stream Chips (Science, Commerce, Humanities, Admission Tracks) */}
      {groups && groups.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1">
          {groups.map((grp, idx) => (
            <span
              key={idx}
              className="text-[11px] sm:text-xs font-semibold bg-slate-800/90 hover:bg-slate-800 text-slate-200 px-1 sm:px-2 py-1.5 rounded-xl border border-slate-700/60 shadow-sm transition flex items-center justify-center gap-1 text-center whitespace-nowrap overflow-hidden text-ellipsis"
              title={grp}
            >
              {grp}
            </span>
          ))}
        </div>
      )}
    </div>

    <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300 group-hover:text-white relative z-10">
      <span>সিলেবাস ও প্রস্তুতি শুরু করুন</span>
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorGradient} flex items-center justify-center text-white shadow-md group-hover:translate-x-1 transition-transform`}>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  </Link>
));

const ToolCard = memo(({ title, description, icon: Icon, color, path, badge, isNew }) => (
  <Link
    to={path}
    className="group relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col justify-between backdrop-blur-lg"
  >
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white drop-shadow" />
        </div>
        {isNew ? (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            NEW FEATURE
          </span>
        ) : badge ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {badge}
          </span>
        ) : null}
      </div>

      <div>
        <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-200 transition-colors">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>

    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
      <span>ব্যবহার করুন</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
));

const StatCard = memo(({ icon: Icon, number, label, colorClass, gradient }) => (
  <div className="relative group p-[1px] rounded-3xl overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30 group-hover:opacity-80 transition-opacity duration-500`}></div>
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-slate-900/90 backdrop-blur-xl rounded-[23px] h-full transition-all duration-500 group-hover:bg-slate-900/70">
      <div className={`p-3 mb-3 transition-transform duration-500 rounded-2xl bg-slate-800/80 shadow-inner group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
      <h3 className="mb-1 text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-300">
        {toBn(number)}
      </h3>
      <p className="text-xs sm:text-sm font-bold text-slate-400 leading-tight">
        {label}
      </p>
    </div>
  </div>
));

export default function AcademicHome() {
  const { data: subjectList = [] } = useAcademicSubjects();
  const { data: examSchedules = [] } = useAdmissionExamSchedules();
  const { data: siteSettings } = useSiteSettings();
  const emergency = siteSettings?.emergencyBanner;

  const { data: questionCounts = { cqs: 0, mcqs: 0 } } = useQuery({
    queryKey: ['academicStatsWithAdmission'],
    queryFn: async () => {
      try {
        const [cqSnap, mcqSnap, qbSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'academic_content'), where('type', '==', 'cq'))).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(query(collection(db, 'academic_content'), where('type', '==', 'mcq'))).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(collection(db, 'question_bank')).catch(() => ({ data: () => ({ count: 0 }) })),
        ]);
        const academicCqs = cqSnap.data().count || 0;
        const academicMcqs = mcqSnap.data().count || 0;
        const admissionMcqs = qbSnap.data().count || 0;

        return {
          cqs: academicCqs,
          mcqs: academicMcqs + admissionMcqs,
          admissionMcqs,
        };
      } catch (err) {
        console.warn('Academic stats fetch error:', err);
        return { cqs: 0, mcqs: 0, admissionMcqs: 0 };
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  const stats = useMemo(() => {
    const totalMcqs = questionCounts.mcqs;
    const totalCqs = questionCounts.cqs;
    return {
      subjects: subjectList.length || 18,
      chapters: subjectList.reduce((acc, sub) => acc + (sub.chapters?.length || 0), 0) || 120,
      cqs: totalCqs > 0 ? totalCqs : 1500,
      mcqs: totalMcqs > 0 ? totalMcqs : 8500,
    };
  }, [subjectList, questionCounts]);

  const upcomingExams = useMemo(() => {
    return examSchedules
      .filter(s => s.active !== false)
      .map(s => ({ ...s, daysRemaining: getDaysRemaining(s.examDate) }))
      .slice(0, 3);
  }, [examSchedules]);

  return (
    <div className="relative min-h-screen bg-[#060a14] overflow-hidden text-slate-200 font-bangla selection:bg-indigo-500/30">
      <SEO
        title="অ্যাকাডেমিক হাব | এসএসসি, এইচএসসি ও ভর্তি প্রস্তুতি প্ল্যাটফর্ম"
        description="এসএসসি, এইচএসসি এবং এডমিশন টেস্টের সকল বিষয়ের এ টু জেড প্রস্তুতি ও প্রশ্ন তৈরির জাদুকর। বাংলাদেশের স্মার্টেস্ট লার্নিং প্ল্যাটফর্ম।"
        canonical="https://learnwithramim.com/academic"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: 'Learn with Ramim — Academic Hub',
          url: 'https://learnwithramim.com/academic',
          description: 'এসএসসি, এইচএসসি এবং এডমিশন টেস্টের সকল বিষয়ের প্রস্তুতি প্ল্যাটফর্ম।',
        }}
      />

      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[10%] w-[45%] h-[45%] bg-indigo-600/20 blur-[130px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[25%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/15 blur-[140px] rounded-full animate-[pulse_12s_ease-in-out_infinite_alternate-reverse]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-cyan-600/15 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 space-y-16 sm:space-y-24">

        {/* Dynamic Emergency Announcement Bar */}
        {emergency?.active && emergency?.text && (
          <div className="animate-in fade-in slide-in-from-top-3 duration-500 max-w-4xl mx-auto">
            <Link
              to={emergency.link || '#'}
              className="flex items-center gap-3 p-3 sm:px-5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold transition group shadow-lg shadow-amber-500/5 backdrop-blur-md"
            >
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Megaphone className="w-4 h-4 animate-bounce" />
              </span>
              <span className="flex-1 text-left line-clamp-1">{emergency.text}</span>
              {emergency.link && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 transition shrink-0">
                  দেখুন <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Link>
          </div>
        )}

        {/* ── 1. Hero & Search Section ────────────────────────────────────── */}
        <section className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-8 pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(99,102,241,0.25)] backdrop-blur-md animate-fade-in-up">
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            <span>স্মার্ট অ্যাকাডেমিক ও ভর্তি প্রস্তুতি ইকোসিস্টেম</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.2]">
            একটি প্ল্যাটফর্মেই সম্পূর্ণ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 animate-gradient-x">
              অ্যাকাডেমিক ও ভর্তি প্রস্তুতি
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            নবম-দশম (SSC), একাদশ-দ্বাদশ (HSC) এবং মেডিকেল, নার্সিং ও ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার প্রশ্নব্যাংক, মডেল টেস্ট এবং স্বয়ংক্রিয় প্রশ্ন তৈরির সেরা প্ল্যাটফর্ম।
          </p>

          {/* Global Search Bar */}
          <div className="max-w-2xl mx-auto relative group pt-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/30 to-cyan-500/40 rounded-3xl blur-md opacity-40 group-hover:opacity-80 transition duration-500"></div>
            <div className="relative">
              <GlobalSearch />
            </div>
          </div>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">জনপ্রিয় সার্চ:</span>
            {[
              { label: '📝 প্রশ্ন তৈরির জাদুকর', path: '/academic/question-builder' },
              { label: '🩺 মেডিকেল প্রস্তুতি', path: '/academic/admission/medical' },
              { label: '🏥 নার্সিং প্রস্তুতি', path: '/academic/admission/nursing' },
              { label: '🎯 মডেল টেস্ট', path: '/academic/admission/model-test' },
              { label: '📅 ভর্তি পরীক্ষার রুটিন', path: '/academic/admission/exam-schedule' },
              { label: '🧪 পর্যায় সারণি', path: '/academic/periodic-table' },
            ].map((tag, idx) => (
              <Link
                key={idx}
                to={tag.path}
                className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:text-indigo-300 transition"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── 2. Track Selector Cards (SSC, HSC, Admission) ───────────────── */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">আপনার লক্ষ্য বেছে নিন</h2>
            <p className="text-slate-400 text-xs sm:text-sm">যে ক্লাসে বা যে লক্ষ্য নিয়ে পড়ছেন, সেটি সিলেক্ট করে আপনার প্রস্তুতি শুরু করুন।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
            {/* SSC Track */}
            <TrackCard
              track="নবম - দশম শ্রেণি"
              title="এসএসসি (SSC)"
              subtitle="বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের বিষয়ভিত্তিক প্রশ্নব্যাংক, CQ ও MCQ ব্যাখ্যাসহ সমাধান।"
              icon={BookOpen}
              badge="বোর্ড প্রস্তুতি"
              path="/academic/ssc"
              colorGradient="from-indigo-500 to-purple-600"
              borderHover="hover:border-indigo-500/50"
              glowColor="bg-indigo-500/20"
              groups={['🔬 Science', '💼 Commerce', '📚 Humanities']}
            />

            {/* HSC Track */}
            <TrackCard
              track="একাদশ - দ্বাদশ শ্রেণি"
              title="এইচএসসি (HSC)"
              subtitle="বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের বোর্ড প্রশ্ন, শীর্ষ কলেজ টেস্ট পেপার ও মডেল টেস্ট।"
              icon={GraduationCap}
              badge="সেরা প্রস্তুতি"
              path="/academic/hsc"
              colorGradient="from-cyan-500 to-blue-600"
              borderHover="hover:border-cyan-500/50"
              glowColor="bg-cyan-500/20"
              groups={['🔬 Science', '💼 Commerce', '📚 Humanities']}
            />

            {/* Admission Track */}
            <TrackCard
              track="বিশ্ববিদ্যালয় ও মেডিকেল"
              title="ভর্তি পরীক্ষা (Admission)"
              subtitle="মেডিকেল (MBBS/BDS), নার্সিং, বুয়েট, ঢাবি ‘ক’, গুচ্ছ ও সকল বিশ্ববিদ্যালয়ের পূর্ণাঙ্গ প্রস্তুতি।"
              icon={Award}
              path="/academic/admission"
              colorGradient="from-rose-500 to-pink-600"
              borderHover="hover:border-rose-500/50"
              glowColor="bg-rose-500/20"
              groups={['🩺 Medical', '⚙️ Engineering', '🧪 Varsity \'A\'', '🏥 Nursing']}
            />
          </div>
        </section>

        {/* ── 3. Live Admission Exam Schedules Widget ─────────────────────── */}
        {upcomingExams.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl bg-slate-900/50 border border-slate-800/90 p-5 sm:p-7 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">ভর্তি পরীক্ষার লাইভ সময়সূচী ও ডেডলাইন</h3>
                  <p className="text-xs text-slate-400">অফিসিয়াল নোটিশ ও প্রবেশপত্র সংক্রান্ত তথ্য</p>
                </div>
              </div>

              <Link
                to="/academic/admission/exam-schedule"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
              >
                <span>সকল রুটিন দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 flex flex-col justify-between space-y-2.5 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {exam.category}
                      </span>
                      {exam.daysRemaining !== null && exam.daysRemaining >= 0 && (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {exam.daysRemaining === 0 ? 'আজকে পরীক্ষা!' : `${exam.daysRemaining} দিন বাকি`}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 line-clamp-1">{exam.title}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{exam.examDateBangla || exam.examDate}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{exam.examTime}</span>
                    <Link to="/academic/admission/exam-schedule" className="text-amber-400 hover:underline font-bold">
                      বিস্তারিত
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. Smart Learning & Utility Tools Suite ─────────────────────── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider block mb-1">
                SMART UTILITIES & ENGINES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">ফ্ল্যাগশিপ স্টাডি টুলস</h2>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md">
              শিক্ষার্থী ও শিক্ষকদের জন্য প্রশ্ন তৈরি, প্র্যাকটিস এবং দ্রুত রিভিশনের অত্যাধুনিক টুলস।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Tool 1: Question Builder (Flagship) */}
            <ToolCard
              title="প্রশ্ন তৈরির জাদুকর"
              description="যেকোনো বিষয় ও অধ্যায় থেকে স্বয়ংক্রিয়ভাবে প্রফেশনাল প্রশ্নপত্র, ওএমআর ও উত্তরপত্র তৈরি ও প্রিন্ট করুন।"
              icon={Sparkles}
              color="bg-gradient-to-br from-indigo-500 to-purple-600"
              path="/academic/question-builder"
              isNew={true}
            />

            {/* Tool 2: Model Test Hub */}
            <ToolCard
              title="স্মার্ট মডেল টেস্ট হাব"
              description="টাইমার ও রিয়েল নেগেটিভ মার্কিংযুক্ত আনলিমিটেড ১০০ নম্বরের স্ট্যান্ডার্ড মডেল টেস্ট।"
              icon={Target}
              color="bg-gradient-to-br from-fuchsia-500 to-pink-600"
              path="/academic/admission/model-test"
              badge="রিয়েল টেস্ট"
            />

            {/* Tool 3: Question Bank */}
            <ToolCard
              title="বিগত সালের প্রশ্নব্যাংক"
              description="মেডিকেল, নার্সিং, বুয়েট ও ঢাবির বিগত ২৫+ বছরের প্রশ্নপত্র অধ্যায় ও সালভিত্তিক সমাধান।"
              icon={Library}
              color="bg-gradient-to-br from-blue-500 to-cyan-600"
              path="/academic/admission/question-bank"
              badge="সল্যুশন সহ"
            />

            {/* Tool 4: Periodic Table */}
            <ToolCard
              title="ইন্টারেক্টিভ পর্যায় সারণি"
              description="১১৮টি মৌলের ইলেকট্রন বিন্যাস, পারমাণবিক ভর ও বৈশিষ্ট্যসহ ভিজ্যুয়াল পর্যায় সারণি।"
              icon={FlaskConical}
              color="bg-gradient-to-br from-teal-500 to-emerald-600"
              path="/academic/periodic-table"
              badge="কেমিস্ট্রি টুল"
            />

            {/* Tool 5: Smart Formula Sheet */}
            <ToolCard
              title="স্মার্ট ফর্মুলা শিট"
              description="পদার্থবিজ্ঞান, উচ্চতর গণিত ও রসায়নের সকল প্রয়োজনীয় সূত্র ও শর্টকাট এক জায়গায়।"
              icon={Zap}
              color="bg-gradient-to-br from-amber-500 to-orange-600"
              path="/academic/formula-sheet"
              badge="কুইক রিভিশন"
            />

            {/* Tool 6: Mistake Notebook */}
            <ToolCard
              title="ভুলের খাতা (Mistake Book)"
              description="পরীক্ষায় যে যে প্রশ্নে ভুল হয়েছে তা স্বয়ংক্রিয়ভাবে সেভ হবে এবং স্পেসড রিপিটেশনে রিভিশন হবে।"
              icon={ShieldCheck}
              color="bg-gradient-to-br from-rose-500 to-red-600"
              path="/academic/admission/mistakes"
              badge="স্মার্ট রিভিশন"
            />
          </div>
        </section>

        {/* ── 5. Platform Live Analytics Counter ──────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900/80 via-indigo-950/30 to-slate-900/80 border border-slate-800 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">আমাদের বিশাল রিসোর্স কালেকশন</h2>
            <p className="text-slate-400 text-xs sm:text-sm">প্রতিনিয়ত যুক্ত হচ্ছে নতুন নতুন প্রশ্ন, সমাধান ও স্টাডি মেটেরিয়াল</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            <StatCard
              icon={Library}
              number={stats.subjects}
              label="মোট বিষয়"
              colorClass="text-indigo-400"
              gradient="from-indigo-500 to-purple-500"
            />
            <StatCard
              icon={BookOpen}
              number={stats.chapters}
              label="মোট অধ্যায়"
              colorClass="text-cyan-400"
              gradient="from-cyan-500 to-emerald-500"
            />
            <StatCard
              icon={FileText}
              number={stats.cqs}
              label="সৃজনশীল প্রশ্ন (CQ)"
              colorClass="text-fuchsia-400"
              gradient="from-fuchsia-500 to-pink-500"
            />
            <StatCard
              icon={CheckSquare}
              number={stats.mcqs}
              label="বহুনির্বাচনি (MCQ)"
              colorClass="text-amber-400"
              gradient="from-amber-500 to-orange-500"
            />
          </div>
        </section>

        {/* ── 6. Why We Are Different & Highlights ────────────────────────── */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">কেন এই প্ল্যাটফর্মটি সেরা?</h2>
            <p className="text-slate-400 text-xs sm:text-sm">গতানুগতিক পড়ার চেয়ে কার্যকর ও আধুনিক প্রযুক্তিনির্ভর শিক্ষা ব্যবস্থা।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">ধাপে ধাপে নির্ভুল ব্যাখ্যা</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                প্রতিটি CQ ও MCQ প্রশ্নের রয়েছে স্ট্যান্ডার্ড পাঠ্যবই অনুযায়ী বিস্তারিত ব্যাখ্যা ও শর্টকাট সমাধান।
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">স্মার্ট উইকনেস অ্যানালাইসিস</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                কোন কোন অধ্যায়ে দুর্বলতা রয়েছে তা স্বয়ংক্রিয়ভাবে বিশ্লেষণ করে রিভিশনের সুযোগ করে দেয়।
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">গ্যামিফাইড লার্নিং ও র‍্যাঙ্ক</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                প্রতিদিনের চ্যালেঞ্জ, XP পয়েন্ট অর্জন এবং সারা দেশের শিক্ষার্থীদের মাঝে লিডারবোর্ডে নিজের অবস্থান।
              </p>
            </div>
          </div>
        </section>

        {/* ── 7. Call To Action ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-950 via-slate-900 to-fuchsia-950 border border-indigo-500/30 p-8 sm:p-14 text-center shadow-2xl">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              আজই শুরু হোক আপনার স্বপ্নের প্রস্তুতি!
            </h2>
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
              ফ্রিতে প্রশ্নপত্র তৈরি করুন, মডেল টেস্ট দিন এবং আপনার দুর্বলতা কাটিয়ে হয়ে উঠুন সেরাদের সেরা।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/academic/question-builder"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-600 hover:to-fuchsia-600 text-white px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition shadow-lg shadow-indigo-500/30 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>প্রশ্ন তৈরি শুরু করুন</span>
              </Link>
              <Link
                to="/academic/admission"
                className="inline-flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition hover:scale-105"
              >
                <span>অ্যাডমিশন সেন্টারে যান</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      {/* Floating Daily Challenge Widget */}
      <DailyChallengeWidget />
    </div>
  );
}
