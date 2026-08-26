import React, { useState, useMemo } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Trophy, Medal, Star, Shield, ArrowUp, Flame, 
  GraduationCap, Sparkles, Search, Crown, User, 
  Zap, AlertTriangle, ChevronRight, Activity, Award, TrendingUp, Compass
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { toBn } from '../../lib/format';

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' | 'SSC' | 'HSC' | 'Admission'
  const [admissionTrack, setAdmissionTrack] = useState('all'); // 'all' | 'medical' | 'engineering' | 'varsity' | 'nursing'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch top 100 users sorted by XP
  const { data: allLeaders = [], isLoading, isError } = useQuery({
    queryKey: ['leaderboard_top_100'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.xp && data.xp > 0) {
          users.push({
            id: doc.id,
            name: data.name || data.displayName || 'শিক্ষার্থী',
            photoURL: data.photoURL,
            xp: data.xp || 0,
            badges: data.badges || {},
            academicLevel: data.academicLevel || data.educationLevel || 'HSC',
            targetTrack: data.targetTrack || data.dreamVarsity || '',
            streak: data.streak || 0,
            modelTestsCount: data.modelTestsCount || Math.floor(data.xp / 40) + 1,
          });
        }
      });
      return users;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Filtered Leaderboard based on Level and Track
  const filteredLeaders = useMemo(() => {
    return allLeaders.filter(user => {
      if (selectedLevel !== 'all') {
        const userLevel = (user.academicLevel || '').toLowerCase();
        const target = selectedLevel.toLowerCase();
        if (userLevel !== target && !userLevel.includes(target)) {
          return false;
        }
      }

      if (selectedLevel === 'Admission' && admissionTrack !== 'all') {
        const userTrack = (user.targetTrack || '').toLowerCase();
        if (!userTrack.includes(admissionTrack.toLowerCase())) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(q) || (user.targetTrack && user.targetTrack.toLowerCase().includes(q));
      }

      return true;
    });
  }, [allLeaders, selectedLevel, admissionTrack, searchQuery]);

  // Current User's Rank
  const myRankIndex = useMemo(() => {
    if (!currentUser) return -1;
    return filteredLeaders.findIndex(u => u.id === currentUser.uid);
  }, [filteredLeaders, currentUser]);

  const myData = myRankIndex !== -1 ? filteredLeaders[myRankIndex] : null;
  const nextUser = myRankIndex > 0 ? filteredLeaders[myRankIndex - 1] : null;
  const xpNeededToPass = nextUser && myData ? (nextUser.xp - myData.xp + 10) : 0;

  const topThree = useMemo(() => filteredLeaders.slice(0, 3), [filteredLeaders]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-8 font-bangla">
        <div className="text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-slate-800 animate-pulse mx-auto" />
          <div className="h-8 w-64 bg-slate-800 animate-pulse mx-auto rounded-xl" />
          <div className="h-4 w-80 bg-slate-800/60 animate-pulse mx-auto rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-16 rounded-2xl border border-slate-800/80 bg-slate-900/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center font-bangla">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-300">লিডারবোর্ড ডেটা লোড করতে সমস্যা হয়েছে!</h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-14 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-bangla">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-96 w-[550px] rounded-full bg-indigo-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-80 right-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-40 left-0 h-80 w-80 rounded-full bg-blue-600/10 blur-[130px]" />

      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold backdrop-blur-md shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>লাইভ সিজন র‍্যাংকিং · ২০২৬</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          মেধা তালিকা ও <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">লিডারবোর্ড</span>
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          মডেল টেস্ট, কুইজ ও চ্যাপ্টার প্র্যাকটিসে অর্জিত এক্সপেরিয়েন্স পয়েন্ট (XP) এর ভিত্তিতে শীর্ষ শিক্ষার্থীদের সরাসরি অবস্থান।
        </p>
      </div>

      {/* Controls Bar: Categories, Filters & Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 p-2 sm:p-2.5 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-xl">
        
        {/* Main Category Switcher */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: 'all', label: '🌍 গ্লোবাল' },
            { id: 'SSC', label: '🎒 এসএসসি (SSC)' },
            { id: 'HSC', label: '🎓 এইচএসসি (HSC)' },
            { id: 'Admission', label: '🩺 ভর্তি যুদ্ধ (Admission)' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedLevel(tab.id);
                setAdmissionTrack('all');
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                selectedLevel === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="নাম বা ড্রিম ভার্সিটি..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800/90 rounded-2xl pl-10 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition shadow-inner"
          />
        </div>

      </div>

      {/* Admission Track Pills */}
      {selectedLevel === 'Admission' && (
        <div className="flex flex-wrap items-center gap-2 mb-8 px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800/70 backdrop-blur-md">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>ভর্তি ইউনিট:</span>
          </span>
          {[
            { id: 'all', label: 'সকল ইউনিট' },
            { id: 'medical', label: '🩺 মেডিকেল ও ডেন্টাল' },
            { id: 'engineering', label: '⚡ বুয়েট ও ইঞ্জিনিয়ারিং' },
            { id: 'varsity', label: '🏛️ বিশ্ববিদ্যালয় ও গুচ্ছ' },
            { id: 'nursing', label: '💉 নার্সিং' },
          ].map(track => (
            <button
              key={track.id}
              type="button"
              onClick={() => setAdmissionTrack(track.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                admissionTrack === track.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>
      )}

      {/* Top 3 Featured Showcase Cards (Hall of Fame) */}
      {topThree.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Rank 1: Gold Champion */}
          <div className="relative order-1 md:order-2 p-5 rounded-3xl bg-gradient-to-b from-amber-500/[0.12] via-slate-900/80 to-slate-900/80 border border-amber-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.1)] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>#১ চ্যাম্পিয়ন</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 mt-2">
              <div className="relative shrink-0">
                {topThree[0].photoURL ? (
                  <img src={topThree[0].photoURL} alt={topThree[0].name} loading="lazy" className="w-14 h-14 rounded-2xl border-2 border-amber-400 object-cover shadow-lg shadow-amber-500/30" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 font-black text-xl shadow-lg shadow-amber-500/20">
                    {topThree[0].name?.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-lg text-[9px] font-black shadow">
                  ১ম
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate">{topThree[0].name}</h3>
                <span className="text-xs text-amber-300/90 font-semibold block truncate">
                  {topThree[0].targetTrack || `${topThree[0].academicLevel} টপার`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                <span>লেভেল {toBn(Math.floor(topThree[0].xp / 100) + 1)}</span>
                {topThree[0].streak > 0 && <span className="ml-2 text-amber-400 font-bold">🔥 {toBn(topThree[0].streak)} দিন</span>}
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-amber-400">{toBn(topThree[0].xp.toLocaleString())}</span>
                <span className="text-xs font-bold text-slate-400 ml-1">XP</span>
              </div>
            </div>
          </div>

          {/* Rank 2: Silver Runner-Up */}
          <div className="relative order-2 md:order-1 p-5 rounded-3xl bg-slate-900/60 border border-slate-400/30 backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-400/15 border border-slate-400/30 text-slate-300 text-[11px] font-bold">
                <Medal className="w-3.5 h-3.5 text-slate-300" />
                <span>#২ রানার আপ</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 mt-2">
              <div className="relative shrink-0">
                {topThree[1].photoURL ? (
                  <img src={topThree[1].photoURL} alt={topThree[1].name} loading="lazy" className="w-13 h-13 rounded-2xl border border-slate-300 object-cover" />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-slate-800 border border-slate-300 flex items-center justify-center text-slate-300 font-bold text-lg">
                    {topThree[1].name?.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-slate-300 text-slate-950 px-1 py-0.5 rounded-md text-[9px] font-black">
                  ২য়
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{topThree[1].name}</h3>
                <span className="text-xs text-slate-400 font-medium block truncate">
                  {topThree[1].targetTrack || `${topThree[1].academicLevel} শিক্ষার্থী`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400">লেভেল {toBn(Math.floor(topThree[1].xp / 100) + 1)}</span>
              <div className="text-right">
                <span className="text-base font-black text-slate-200">{toBn(topThree[1].xp.toLocaleString())}</span>
                <span className="text-xs font-bold text-slate-400 ml-1">XP</span>
              </div>
            </div>
          </div>

          {/* Rank 3: Bronze */}
          <div className="relative order-3 md:order-3 p-5 rounded-3xl bg-slate-900/60 border border-amber-700/30 backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500 text-[11px] font-bold">
                <Medal className="w-3.5 h-3.5 text-amber-600" />
                <span>#৩ ৩য় স্থান</span>
              </span>
            </div>

            <div className="flex items-center gap-3.5 mt-2">
              <div className="relative shrink-0">
                {topThree[2].photoURL ? (
                  <img src={topThree[2].photoURL} alt={topThree[2].name} loading="lazy" className="w-13 h-13 rounded-2xl border border-amber-700 object-cover" />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-slate-800 border border-amber-700 flex items-center justify-center text-amber-500 font-bold text-lg">
                    {topThree[2].name?.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-amber-700 text-white px-1 py-0.5 rounded-md text-[9px] font-black">
                  ৩য়
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{topThree[2].name}</h3>
                <span className="text-xs text-slate-400 font-medium block truncate">
                  {topThree[2].targetTrack || `${topThree[2].academicLevel} শিক্ষার্থী`}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-400">লেভেল {toBn(Math.floor(topThree[2].xp / 100) + 1)}</span>
              <div className="text-right">
                <span className="text-base font-black text-amber-500">{toBn(topThree[2].xp.toLocaleString())}</span>
                <span className="text-xs font-bold text-slate-400 ml-1">XP</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Current User's Dynamic Floating Progress Banner */}
      {currentUser && myData && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/40 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-indigo-600/30 shrink-0">
              #{toBn(myRankIndex + 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">{myData.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/30">
                  তুমি
                </span>
              </div>
              <span className="text-xs text-slate-300 block">
                লেভেল {toBn(Math.floor(myData.xp / 100) + 1)} · {myData.academicLevel}
                {xpNeededToPass > 0 && <span className="text-indigo-300 ml-2">({toBn(xpNeededToPass)} XP পেলেই পরবর্তী র‍্যাংক!)</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
            <div>
              <span className="text-[11px] text-slate-400 block">মোট অর্জিত স্কোর</span>
              <span className="text-xl font-black text-indigo-400">{toBn(myData.xp.toLocaleString())} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table Container */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        
        {/* Table Header Ribbon */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-400">
          <div className="col-span-2 sm:col-span-1 text-center">র‍্যাংক</div>
          <div className="col-span-6 sm:col-span-5">শিক্ষার্থী ও লক্ষ্য</div>
          <div className="hidden sm:block sm:col-span-3">শিক্ষা স্তর / ব্যাজ</div>
          <div className="col-span-4 sm:col-span-3 text-right">মোট XP পয়েন্ট</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {filteredLeaders.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
              <h4 className="text-base font-bold text-slate-300">কোনো ফলাফল পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500 mt-1">অন্য কোনো ক্যাটাগরি বা কিওয়ার্ড দিয়ে অনুসন্ধান করুন।</p>
            </div>
          ) : (
            filteredLeaders.map((user, index) => {
              const isCurrentUser = currentUser?.uid === user.id;

              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-3 items-center px-4 sm:px-5 py-3.5 transition-all duration-150 ${
                    isCurrentUser 
                      ? 'bg-indigo-600/[0.12] border-l-4 border-indigo-500' 
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Rank Number / Badge */}
                  <div className="col-span-2 sm:col-span-1 flex justify-center">
                    {index === 0 ? (
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shadow-sm">
                        ১
                      </span>
                    ) : index === 1 ? (
                      <span className="w-7 h-7 rounded-xl bg-slate-400/20 text-slate-200 border border-slate-400/30 flex items-center justify-center font-black text-xs">
                        ২
                      </span>
                    ) : index === 2 ? (
                      <span className="w-7 h-7 rounded-xl bg-amber-700/20 text-amber-500 border border-amber-700/30 flex items-center justify-center font-black text-xs">
                        ৩
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">
                        #{toBn(index + 1)}
                      </span>
                    )}
                  </div>

                  {/* Student Profile Info */}
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          loading="lazy"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-sm">
                          {user.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs sm:text-sm font-bold truncate ${isCurrentUser ? 'text-indigo-300 font-black' : 'text-slate-100'}`}>
                          {user.name}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white text-[9px] font-bold">
                            তুমি
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {user.targetTrack || (user.academicLevel === 'Admission' ? 'ভর্তি পরীক্ষার্থী' : `${user.academicLevel} ব্যাচ`)}
                      </span>
                    </div>
                  </div>

                  {/* Academic Level & Level Tag */}
                  <div className="hidden sm:flex sm:col-span-3 items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-semibold text-slate-300">
                      লেভেল {toBn(Math.floor(user.xp / 100) + 1)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {user.academicLevel}
                    </span>
                  </div>

                  {/* XP Points */}
                  <div className="col-span-4 sm:col-span-3 text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className={`text-sm sm:text-base font-black ${index < 3 ? 'text-amber-400' : 'text-indigo-400'}`}>
                        {toBn(user.xp.toLocaleString())}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">XP</span>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
