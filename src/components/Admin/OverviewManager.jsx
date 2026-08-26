import React, { useState, useMemo } from 'react';
import { 
  collection, getDocs, getCountFromServer, query, where 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Users, Swords, BookOpen, Trophy, AlertTriangle, 
  CreditCard, MessageSquareWarning, Megaphone, Plus, 
  ArrowUpRight, Sparkles, TrendingUp, CheckCircle2, 
  Clock, ShieldAlert, FileQuestion, GraduationCap, 
  Activity, RefreshCw, Layers, Zap, Calendar, ExternalLink
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton, SkeletonGrid, SkeletonList } from '../UI/Skeleton';
import { STALE } from '../../lib/queryConfig';

const PIE_COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

export default function OverviewManager() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('7d'); // '7d' | '30d'

  const { data: stats, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin_overview_stats_enhanced'],
    staleTime: STALE.STATS || 1000 * 60 * 15,
    queryFn: async () => {
      let totalUsers = 0;
      let totalPremiumUsers = 0;
      let totalExams = 0;
      let totalXP = 0;
      let dailyActive = 0;
      let students = [];
      let recentStudents = [];
      
      const todayStr = new Date().toDateString();
      const levelMap = { 'SSC': 0, 'HSC': 0, 'মেডিকেল': 0, 'নার্সিং': 0, 'অন্যান্য': 0 };
      const last7DaysMap = {};
      const examTrendMap = {};
      const subjectMap = {};
      
      // Initialize last 7 days keys
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
        last7DaysMap[dateKey] = 0;
        examTrendMap[dateKey] = 0;
      }

      // 1. Fetch Users
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        totalUsers++;
        totalXP += (data.xp || 0);
        if (data.lastVisit === todayStr) dailyActive++;
        if (data.plan === 'premium' || data.isPremium) totalPremiumUsers++;
        
        // Level breakdown
        const rawLevel = String(data.educationLevel || data.targetProgram || '').toUpperCase();
        if (rawLevel.includes('SSC')) levelMap['SSC']++;
        else if (rawLevel.includes('HSC')) levelMap['HSC']++;
        else if (rawLevel.includes('MEDIC') || rawLevel.includes('মেডিকেল')) levelMap['মেডিকেল']++;
        else if (rawLevel.includes('NURS') || rawLevel.includes('নার্সিং')) levelMap['নার্সিং']++;
        else levelMap['অন্যান্য']++;

        const studentObj = {
          id: docSnap.id,
          name: data.name || data.displayName || 'নামহীন শিক্ষার্থী',
          email: data.email || '—',
          xp: data.xp || 0,
          level: data.educationLevel || data.targetProgram || 'HSC',
          isPremium: Boolean(data.plan === 'premium' || data.isPremium),
          createdAt: data.createdAt,
        };

        students.push(studentObj);

        // Join Date mapping
        if (data.createdAt) {
          let d;
          if (data.createdAt.toDate) d = data.createdAt.toDate();
          else d = new Date(data.createdAt);
          
          if (!isNaN(d.getTime())) {
            const dateKey = d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
            if (last7DaysMap[dateKey] !== undefined) {
              last7DaysMap[dateKey]++;
            }
          }
        }

        // Exam Stats mapping
        if (data.examHistory && Array.isArray(data.examHistory)) {
          totalExams += data.examHistory.length;
          data.examHistory.forEach(exam => {
            if (exam.subject) {
              subjectMap[exam.subject] = (subjectMap[exam.subject] || 0) + 1;
            }
            if (exam.date || exam.timestamp) {
              const ed = new Date(exam.date || exam.timestamp);
              if (!isNaN(ed.getTime())) {
                const dateKey = ed.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' });
                if (examTrendMap[dateKey] !== undefined) {
                  examTrendMap[dateKey]++;
                }
              }
            }
          });
        }
      });

      // Sort by XP for top performers
      students.sort((a, b) => b.xp - a.xp);

      // Sort by creation date for recent registrations
      recentStudents = [...students]
        .filter(s => s.createdAt)
        .sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
          const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
          return tB - tA;
        })
        .slice(0, 6);

      // 2. Fetch Pending Payments & Reports Counts
      let pendingPaymentsCount = 0;
      let pendingReportsCount = 0;
      let totalQuestionsCount = 0;
      let activeLiveExamsCount = 0;

      try {
        const [paySnap, repSnap, qSnap, qbSnap, examSnap] = await Promise.all([
          getCountFromServer(query(collection(db, 'payment_requests'), where('status', '==', 'pending'))).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(query(collection(db, 'reported_errors'), where('status', '==', 'pending'))).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(collection(db, 'academic_content')).catch(() => ({ data: () => ({ count: 0 }) })),
          getCountFromServer(collection(db, 'question_bank')).catch(() => ({ data: () => ({ count: 0 }) })),
          getDocs(collection(db, 'live_exams')).catch(() => ({ docs: [] })),
        ]);

        pendingPaymentsCount = paySnap.data().count;
        pendingReportsCount = repSnap.data().count;
        totalQuestionsCount = (qSnap.data().count || 0) + (qbSnap.data().count || 0);

        const now = Date.now();
        activeLiveExamsCount = examSnap.docs.filter(d => {
          const ex = d.data();
          const endMs = ex.endTime?.toMillis ? ex.endTime.toMillis() : new Date(ex.endTime).getTime();
          return endMs > now;
        }).length;
      } catch (err) {
        console.warn('Non-blocking fetch error for stats counts:', err);
      }

      // Format Chart Datasets
      const joinData = Object.keys(last7DaysMap).map(date => ({
        date,
        'নতুন শিক্ষার্থী': last7DaysMap[date],
        'সম্পন্ন পরীক্ষা': examTrendMap[date] || 0,
      }));

      const subjectData = Object.keys(subjectMap)
        .map(subject => ({ subject, count: subjectMap[subject] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const levelData = Object.keys(levelMap)
        .map(name => ({ name, value: levelMap[name] }))
        .filter(item => item.value > 0);

      return {
        totalUsers,
        totalPremiumUsers,
        totalExams,
        totalXP,
        dailyActive,
        pendingPaymentsCount,
        pendingReportsCount,
        totalQuestionsCount,
        activeLiveExamsCount,
        topStudents: students.slice(0, 10),
        recentStudents,
        joinData,
        subjectData,
        levelData,
      };
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 font-bangla">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <SkeletonGrid count={6} columns="grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 w-full lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <SkeletonList count={6} />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-rose-400 font-bangla space-y-3">
        <AlertTriangle className="w-10 h-10" />
        <p className="text-sm font-semibold">ওভারভিউ ডেটা লোড করতে সমস্যা হয়েছে।</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition"
        >
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  const hasPendingAlerts = (stats.pendingPaymentsCount > 0) || (stats.pendingReportsCount > 0);

  return (
    <div className="space-y-8 font-bangla pb-8">
      {/* ── Top Header & Refresh Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">সিস্টেম ওভারভিউ ও লাইভ স্ট্যাটাস</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">প্ল্যাটফর্মের সার্বিক পারফরম্যান্স, শিক্ষার্থী বৃদ্ধি ও অ্যাক্টিভিটি রিপোর্ট</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/70 text-slate-300 hover:text-white text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isFetching ? 'আপডেট হচ্ছে...' : 'রিফ্রেশ'}</span>
          </button>
        </div>
      </div>

      {/* ── Action Required Alert Banner ─────────────────────────────── */}
      {hasPendingAlerts && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg shadow-amber-500/5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">জরুরি অ্যাকশন প্রয়োজন (Pending Tasks)</h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                {stats.pendingPaymentsCount > 0 && `• ${stats.pendingPaymentsCount} টি বিকাশ পেমেন্ট অনুরোধ অপেক্ষমাণ আছে। `}
                {stats.pendingReportsCount > 0 && `• ${stats.pendingReportsCount} টি প্রশ্নের ভুল সংশোধনের রিপোর্ট জমা পড়েছে।`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stats.pendingPaymentsCount > 0 && (
              <a
                href="/admin?tab=payments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>পেমেন্ট যাচাই ({stats.pendingPaymentsCount})</span>
              </a>
            )}
            {stats.pendingReportsCount > 0 && (
              <a
                href="/admin?tab=reports"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                <MessageSquareWarning className="w-3.5 h-3.5" />
                <span>রিপোর্টস ({stats.pendingReportsCount})</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Stat Ribbon (6 Primary Metrics) ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Users */}
        <div className="bg-slate-900/50 hover:bg-slate-900/70 transition-all rounded-2xl p-4 sm:p-5 border border-slate-800 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 h-14 w-14 bg-indigo-500/10 rounded-full translate-x-3 -translate-y-3 pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">মোট</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalUsers}</p>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
            <span>স্টুডেন্ট</span>
            <span className="text-[11px] text-indigo-400 font-semibold">{stats.totalPremiumUsers} প্রিমিয়াম</span>
          </div>
        </div>

        {/* Metric 2: Daily Active */}
        <div className="bg-slate-900/50 hover:bg-slate-900/70 transition-all rounded-2xl p-4 sm:p-5 border border-slate-800 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 h-14 w-14 bg-emerald-500/10 rounded-full translate-x-3 -translate-y-3 pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">২৪ ঘণ্টা</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.dailyActive}</p>
          <p className="text-xs text-slate-400 mt-1">আজকের এক্টিভ</p>
        </div>

        {/* Metric 3: Total Exams */}
        <div className="bg-slate-900/50 hover:bg-slate-900/70 transition-all rounded-2xl p-4 sm:p-5 border border-slate-800 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 h-14 w-14 bg-amber-500/10 rounded-full translate-x-3 -translate-y-3 pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">সাবমিশন</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalExams}</p>
          <p className="text-xs text-slate-400 mt-1">মোট পরীক্ষা সম্পন্ন</p>
        </div>

        {/* Metric 4: Question Bank Size */}
        <div className="bg-slate-900/50 hover:bg-slate-900/70 transition-all rounded-2xl p-4 sm:p-5 border border-slate-800 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 h-14 w-14 bg-cyan-500/10 rounded-full translate-x-3 -translate-y-3 pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <FileQuestion className="h-4 w-4 text-cyan-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">ব্যাংক</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalQuestionsCount > 0 ? stats.totalQuestionsCount : '১০,০০০+'}</p>
          <p className="text-xs text-slate-400 mt-1">মোট প্রশ্নভান্ডার</p>
        </div>

        {/* Metric 5: Pending Payments */}
        <div className={`bg-slate-900/50 hover:bg-slate-900/70 transition-all rounded-2xl p-4 sm:p-5 border ${stats.pendingPaymentsCount > 0 ? 'border-amber-500/40 bg-amber-500/[0.03]' : 'border-slate-800'} relative overflow-hidden group shadow-sm`}>
          <div className="absolute top-0 right-0 h-14 w-14 bg-amber-500/10 rounded-full translate-x-3 -translate-y-3 pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="h-4 w-4 text-amber-400" />
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stats.pendingPaymentsCount > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>বিকাশ</span>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${stats.pendingPaymentsCount > 0 ? 'text-amber-400' : 'text-white'}`}>{stats.pendingPaymentsCount}</p>
          <p className="text-xs text-slate-400 mt-1">পেন্ডিং পেমেন্ট</p>
        </div>

        {/* Metric 6: Total XP */}
        <div className="bg-slate-900/50 hover:bg-slate-900/70 transition-all rounded-2xl p-4 sm:p-5 border border-slate-800 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 h-14 w-14 bg-purple-500/10 rounded-full translate-x-3 -translate-y-3 pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-2">
            <Trophy className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20">গ্যামিফিকেশন</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">{stats.totalXP > 1000 ? `${(stats.totalXP / 1000).toFixed(1)}k` : stats.totalXP}</p>
          <p className="text-xs text-slate-400 mt-1">মোট অর্জিত XP</p>
        </div>
      </div>

      {/* ── Quick Action Hub ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>অ্যাডমিন কুইক একশন হাব</span>
          </div>
          <span className="text-[11px] text-slate-400">সরাসরি কাজ শুরু করুন</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <a
            href="/admin?tab=question_bank"
            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-indigo-600/20 border border-white/[0.06] hover:border-indigo-500/40 text-slate-200 hover:text-white transition group text-xs font-semibold"
          >
            <Plus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>প্রশ্ন আপলোড</span>
          </a>

          <a
            href="/admin?tab=live_exams"
            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-600/20 border border-white/[0.06] hover:border-emerald-500/40 text-slate-200 hover:text-white transition group text-xs font-semibold"
          >
            <Calendar className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>লাইভ এক্সাম চালু</span>
          </a>

          <a
            href="/admin?tab=admission"
            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-purple-600/20 border border-white/[0.06] hover:border-purple-500/40 text-slate-200 hover:text-white transition group text-xs font-semibold"
          >
            <GraduationCap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>অ্যাডমিশন ম্যানেজার</span>
          </a>

          <a
            href="/admin?tab=announcements"
            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-cyan-600/20 border border-white/[0.06] hover:border-cyan-500/40 text-slate-200 hover:text-white transition group text-xs font-semibold"
          >
            <Megaphone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>নোটিশ প্রকাশ</span>
          </a>

          <a
            href="/admin?tab=settings"
            className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-amber-600/20 border border-white/[0.06] hover:border-amber-500/40 text-slate-200 hover:text-white transition group text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>সাইট ও সোশ্যাল</span>
          </a>
        </div>
      </div>

      {/* ── Visual Analytics Charts Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Student Growth & Exam Trend (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/50 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">গত ৭ দিনে রেজিস্ট্রেশন ও পরীক্ষার ট্রেন্ড</h3>
                <p className="text-xs text-slate-400">প্রতিদিন নতুন জয়েন করা শিক্ষার্থী ও তাদের সম্পন্ন করা পরীক্ষা</p>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.joinData} margin={{ top: 10, right: 15, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="examGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                />
                <Area type="monotone" dataKey="নতুন শিক্ষার্থী" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#userGrad)" />
                <Area type="monotone" dataKey="সম্পন্ন পরীক্ষা" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#examGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Student Level / Program Distribution (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/50 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-fuchsia-400" />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">প্রোগ্রামভিত্তিক বন্টন</h3>
                <p className="text-xs text-slate-400">SSC, HSC ও ভর্তি ট্র‍্যাকের অনুপাত</p>
              </div>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {stats.levelData.length === 0 ? (
              <p className="text-xs text-slate-500">কোনো তথ্য নেই</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.levelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            {stats.levelData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="text-slate-300 font-medium truncate">{item.name}:</span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Top Subjects Exam Participation (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/50 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">জনপ্রিয় বিষয়ভিত্তিক পরীক্ষা</h3>
                <p className="text-xs text-slate-400">যেসব বিষয়ে সবচেয়ে বেশি পরীক্ষা সম্পন্ন হয়েছে</p>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            {stats.subjectData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">কোনো পরীক্ষার ডেটা নেই।</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectData} layout="vertical" margin={{ top: 5, right: 15, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.4} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={110} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" name="পরীক্ষা সংখ্যা" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* List: Recent Registered Students (6 Cols) */}
        <div className="lg:col-span-6 bg-slate-900/50 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">সম্প্রতি জয়েন করা শিক্ষার্থী</h3>
                <p className="text-xs text-slate-400">সর্বশেষ রেজিস্ট্রেশন করা ৬ জন শিক্ষার্থী</p>
              </div>
            </div>
            <a href="/admin?tab=users" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              সব দেখুন <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2.5">
            {stats.recentStudents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">কোনো তথ্য নেই</p>
            ) : (
              stats.recentStudents.map((st) => (
                <div key={st.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-300 font-bold flex items-center justify-center shrink-0">
                      {st.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-200 truncate">{st.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{st.email}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700">
                      {st.level}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── Bottom Section: Top 10 Leaderboard ──────────────────────── */}
      <div className="bg-slate-900/50 rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">টপ ১০ লিডারবোর্ড (সর্বোচ্চ XP অর্জনকারী)</h3>
              <p className="text-xs text-slate-400">নিয়মিত প্র্যাকটিস ও পরীক্ষায় শীর্ষে থাকা শিক্ষার্থীরা</p>
            </div>
          </div>
        </div>

        {stats.topStudents.length === 0 ? (
          <p className="text-slate-500 text-xs py-4">কোনো স্টুডেন্ট পাওয়া যায়নি।</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.topStudents.map((s, i) => (
              <div 
                key={s.id} 
                className="flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/70 transition rounded-xl border border-slate-800 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                    i === 0 ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                    i === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30' :
                    i === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 text-xs sm:text-sm truncate group-hover:text-indigo-300 transition">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-500">{s.level}</span>
                      {s.isPremium && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          PRO
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-indigo-400 font-black text-xs sm:text-sm">{s.xp.toLocaleString('bn-BD')} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
