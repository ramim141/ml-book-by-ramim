import { useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../config/firebase';
import { QK, STALE } from '../../../lib/queryConfig';
import { Skeleton, SkeletonList } from '../../../components/UI/Skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Trophy, Clock, Search, BookOpen, AlertCircle, 
  ArrowRight, FileText, Calendar, ShieldAlert
} from 'lucide-react';
import { toBn } from '../../../lib/format';
import ExamPdfExportModal from '../../../components/Academic/ExamPdfExportModal';

const CATEGORIES = [
  { id: 'all', label: 'সকল স্তর' },
  { id: 'ssc', label: 'এসএসসি' },
  { id: 'hsc', label: 'এইচএসসি' },
  { id: 'admission', label: 'এডমিশন' },
];

const ADMISSION_SUB_TRACKS = [
  { id: 'all', label: 'সব ট্র্যাক' },
  { id: 'medical', label: 'মেডিকেল' },
  { id: 'engineering', label: 'ইঞ্জিনিয়ারিং' },
  { id: 'varsity-a', label: 'ভার্সিটি ক' },
  { id: 'nursing', label: 'নার্সিং' },
  { id: 'gst', label: 'GST গুচ্ছ' },
];

function formatRemainingTime(targetDate) {
  if (!targetDate) return '';
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return 'শুরু হচ্ছে...';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return `${toBn(days)} দিন ${toBn(hours)} ঘণ্টা বাকি`;
  if (hours > 0) return `${toBn(hours)} ঘণ্টা ${toBn(minutes)} মিনিট বাকি`;
  return `${toBn(minutes)} মিনিট বাকি`;
}

export default function LiveExamList() {
  const [statusTab, setStatusTab] = useState('ongoing'); // ongoing, upcoming, past
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfModalExam, setPdfModalExam] = useState(null);

  const navigate = useNavigate();

  const { data: exams = { upcoming: [], ongoing: [], past: [] }, isLoading: loading } = useQuery({
    queryKey: QK.liveExams(),
    queryFn: async () => {
      const snapshot = await getDocs(query(collection(db, 'live_exams'), orderBy('startTime', 'asc')));
      const now = new Date();

      const upcoming = [];
      const ongoing = [];
      const past = [];

      snapshot.docs.forEach((docSnap) => {
        const d = docSnap.data();
        const start = d.startTime?.toDate();
        const end = d.endTime?.toDate();
        const examData = { id: docSnap.id, ...d, startTime: start, endTime: end };

        if (now < start) upcoming.push(examData);
        else if (now >= start && now <= end) ongoing.push(examData);
        else past.push(examData);
      });

      past.sort((a, b) => b.endTime - a.endTime);
      return { upcoming, ongoing, past };
    },
    staleTime: STALE.LIVE,
  });

  const filteredExams = useMemo(() => {
    const list = exams[statusTab] || [];
    return list.filter((exam) => {
      const examLevel = (exam.level || 'HSC').toLowerCase();
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'admission' && !examLevel.includes('admission') && !exam.admissionTrack) {
          return false;
        }
        if (selectedCategory !== 'admission' && !examLevel.includes(selectedCategory)) {
          return false;
        }
      }

      if (selectedCategory === 'admission' && selectedTrack !== 'all') {
        if (exam.admissionTrack && exam.admissionTrack !== selectedTrack) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (exam.title || '').toLowerCase().includes(q) ||
          (exam.subject || '').toLowerCase().includes(q) ||
          (exam.subjectLabel || '').toLowerCase().includes(q) ||
          (exam.description || '').toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [exams, statusTab, selectedCategory, selectedTrack, searchQuery]);

  const getLevelLabel = (exam) => {
    const lvl = (exam.level || 'HSC').toUpperCase();
    if (lvl.includes('SSC')) return 'এসএসসি';
    if (lvl.includes('ADMISSION') || exam.admissionTrack) {
      const map = {
        medical: 'মেডিকেল',
        engineering: 'ইঞ্জিনিয়ারিং',
        'varsity-a': 'ভার্সিটি ক',
        nursing: 'নার্সিং',
        gst: 'GST গুচ্ছ',
      };
      return `এডমিশন • ${map[exam.admissionTrack] || 'সাধারণ'}`;
    }
    return 'এইচএসসি';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-200 font-bangla pb-24 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <SkeletonList count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-bangla pb-28 pt-20 selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* ── Minimal Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              লাইভ এক্সাম ও মেধা তালিকা
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              এসএসসি, এইচএসসি ও এডমিশন শিক্ষার্থীদের জন্য রিয়েল-টাইম মডেল টেস্ট
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="পরীক্ষা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* ── Minimal Control Bar: Status Tabs + Category Filter ─────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {[
              { id: 'ongoing', label: 'লাইভ চলছে', count: exams.ongoing.length, isLive: true },
              { id: 'upcoming', label: 'আসন্ন', count: exams.upcoming.length },
              { id: 'past', label: 'ফলাফল ও পূর্ববর্তী', count: exams.past.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  statusTab === tab.id
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  statusTab === tab.id ? 'bg-white/10 text-slate-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {toBn(tab.count)}
                </span>
              </button>
            ))}
          </div>

          {/* Level Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (cat.id !== 'admission') setSelectedTrack('all');
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Admission Sub-tracks (if Admission chosen) */}
        {selectedCategory === 'admission' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 text-[11px] font-semibold mr-1">ট্র্যাক:</span>
            {ADMISSION_SUB_TRACKS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(track.id)}
                className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
                  selectedTrack === track.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Exam Cards Grid (Minimal & Classy) ─────────────────────────── */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((exam) => {
              const isOngoing = statusTab === 'ongoing';
              const isUpcoming = statusTab === 'upcoming';
              const isPast = statusTab === 'past';

              return (
                <div
                  key={exam.id}
                  className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    
                    {/* Top Tag Row */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                        {getLevelLabel(exam)} • {exam.subjectLabel || exam.subject || 'সাধারণ'}
                      </span>

                      {isOngoing && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          লাইভ চলছে
                        </span>
                      )}

                      {isUpcoming && (
                        <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {formatRemainingTime(exam.startTime)}
                        </span>
                      )}

                      {isPast && (
                        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          সমাপ্ত
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {exam.title}
                      </h2>
                      {exam.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                          {exam.description}
                        </p>
                      )}
                    </div>

                    {/* Clean Meta Snippet */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-1">
                      <span>⏱ {toBn(exam.duration || 30)} মিনিট</span>
                      <span>•</span>
                      <span>📝 {toBn(exam.totalQuestions || 25)}টি MCQ</span>
                      <span>•</span>
                      <span>🎯 {toBn((exam.totalQuestions || 25) * (exam.marksPerQuestion || 1))} নম্বর</span>
                      {exam.negativeMarking > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400">📉 -{toBn(exam.negativeMarking)}</span>
                        </>
                      )}
                    </div>

                    {/* Schedule Time */}
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>
                        {isUpcoming ? 'শুরু: ' : 'সময়: '}
                        {(isUpcoming ? exam.startTime : exam.endTime)?.toLocaleString('bn-BD', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80">
                    {isOngoing && (
                      <button
                        type="button"
                        onClick={() => navigate(`/academic/live-exam/${exam.id}`)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>পরীক্ষায় অংশ নিন</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {isUpcoming && (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>নির্ধারিত সময়ে পরীক্ষা শুরু হবে</span>
                      </button>
                    )}

                    {isPast && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/academic/live-exam/${exam.id}/leaderboard`)}
                          className="w-full py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                          <span>মেধা তালিকা</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPdfModalExam({
                              title: exam.title,
                              questions: exam.customQuestions || [],
                              subject: exam.subjectLabel || exam.subject,
                              totalMarks: exam.totalQuestions || 25,
                              timeLimitMinutes: exam.duration || 30
                            });
                          }}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>PDF শিট</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 p-6 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">কোনো পরীক্ষা পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">অন্য ফিল্টার বেছে দেখুন অথবা পরবর্তীতে চেক করুন।</p>
          </div>
        )}

      </div>

      {/* ── Printable PDF Modal ───────────────────────────────────────────── */}
      {pdfModalExam && (
        <ExamPdfExportModal
          isOpen={Boolean(pdfModalExam)}
          onClose={() => setPdfModalExam(null)}
          examTitle={pdfModalExam.title}
          questions={pdfModalExam.questions}
          examInfo={{
            totalMarks: pdfModalExam.totalMarks,
            timeLimitMinutes: pdfModalExam.timeLimitMinutes,
            subject: pdfModalExam.subject
          }}
        />
      )}

    </div>
  );
}
