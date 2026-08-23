import { useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import { db } from '../../../config/firebase';
import { QK, STALE } from '../../../lib/queryConfig';
import { Skeleton, SkeletonList } from '../../../components/UI/Skeleton';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Play, Trophy, Clock, Search, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

export default function LiveExamList() {
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, ongoing, past
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // লাইভ পরীক্ষার সময় বদলায়, তাই staleTime কম রাখা হয়েছে
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

      // সবচেয়ে সাম্প্রতিক শেষ হওয়া পরীক্ষা আগে থাকবে
      past.sort((a, b) => b.endTime - a.endTime);

      return { upcoming, ongoing, past };
    },
    staleTime: STALE.LIVE,
  });

  const getStatusColor = (tab) => {
    if (tab === 'upcoming') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    if (tab === 'ongoing') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 animate-pulse';
    return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
  };

  const renderExamList = (list) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-700/50">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No {activeTab} exams</h3>
          <p className="text-slate-500">Check back later for more live exams!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(exam => (
          <div key={exam.id} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <CalendarClock className="h-24 w-24 text-indigo-400" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(activeTab)}`}>
                {activeTab.toUpperCase()}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded-lg">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="capitalize">{exam.subject}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 relative z-10">{exam.title}</h3>
            <p className="text-sm text-slate-400 mb-6 line-clamp-2 relative z-10">{exam.description}</p>

            <div className="space-y-3 mb-6 relative z-10">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold">{exam.duration} Minutes</p>
                  <p className="text-xs text-slate-500">{exam.totalQuestions} Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="h-8 w-8 rounded-lg bg-fuchsia-500/10 flex items-center justify-center shrink-0">
                  <CalendarClock className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm">
                    {activeTab === 'upcoming' ? 'Starts:' : activeTab === 'ongoing' ? 'Ends:' : 'Ended:'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(activeTab === 'upcoming' ? exam.startTime : exam.endTime)?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              {activeTab === 'ongoing' ? (
                <button 
                  onClick={() => navigate(`/academic/live-exam/${exam.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Play className="h-5 w-5" /> Join Live Exam
                </button>
              ) : activeTab === 'past' ? (
                <button 
                  onClick={() => navigate(`/academic/live-exam/${exam.id}/leaderboard`)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Trophy className="h-5 w-5" /> View Leaderboard
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-3 bg-slate-700/50 text-slate-400 rounded-xl font-bold flex justify-center items-center gap-2 cursor-not-allowed"
                >
                  <Clock className="h-5 w-5" /> Waiting to Start
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050914] text-slate-200 font-bangla pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mx-auto mb-12 max-w-md space-y-3 text-center">
            <Skeleton className="mx-auto h-9 w-64" />
            <Skeleton className="mx-auto h-4 w-80" />
          </div>
          <SkeletonList count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050914] text-slate-200 font-bangla pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-500/10 mb-4">
            <CalendarClock className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Exams</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Participate in real-time competitive exams, test your preparation against thousands of students, and secure your place on the global leaderboard.
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 flex gap-1 overflow-x-auto w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'upcoming', label: 'Upcoming', count: exams.upcoming.length, icon: Clock },
              { id: 'ongoing', label: 'Ongoing', count: exams.ongoing.length, icon: Play },
              { id: 'past', label: 'Past Exams', count: exams.past.length, icon: Trophy },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Exam List */}
        <div>
          {renderExamList(exams[activeTab])}
        </div>
      </div>
    </div>
  );
}
