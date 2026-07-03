import React from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Trophy, Medal, Star, Shield, ArrowUp, Activity, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Leaderboard() {
  const { data: leaders = [], isLoading, isError } = useQuery({
    queryKey: ['leaderboard_top_50'],
    queryFn: async () => {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.xp && data.xp > 0) {
          users.push({
            id: doc.id,
            name: data.name || data.displayName || 'Unknown User',
            photoURL: data.photoURL,
            xp: data.xp || 0,
            badges: data.badges || {}
          });
        }
      });
      return users;
    }
  });

  const getRankStyle = (index) => {
    switch (index) {
      case 0: return 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      case 1: return 'bg-slate-300/10 border-slate-300/50 text-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.1)]';
      case 2: return 'bg-orange-700/10 border-orange-700/50 text-orange-500 shadow-[0_0_15px_rgba(194,65,12,0.2)]';
      default: return 'bg-slate-800/40 border-slate-700/50 text-slate-400';
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />;
      case 1: return <Medal className="w-6 h-6 text-slate-300" />;
      case 2: return <Medal className="w-6 h-6 text-orange-500" />;
      default: return <span className="font-black text-lg">#{index + 1}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
        <Activity className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
        <h2 className="text-xl font-bold text-slate-300">লিডারবোর্ড লোড হচ্ছে...</h2>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-300">ডেটা লোড করতে সমস্যা হয়েছে!</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12 animate-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">গ্লোবাল <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">লিডারবোর্ড</span></h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">দেশের সেরা স্টুডেন্টদের সাথে প্রতিযোগিতা করো এবং টপে নিজের জায়গা করে নাও!</p>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {leaders.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-3xl border border-slate-700/50">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-400">এখনো কোনো ডেটা নেই</h3>
            <p className="text-slate-500 mt-2">পরীক্ষা দিয়ে প্রথম পয়েন্ট অর্জন করো!</p>
          </div>
        ) : (
          leaders.map((user, index) => (
            <div 
              key={user.id} 
              className={`flex items-center p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] ${getRankStyle(index)} backdrop-blur-xl animate-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Rank */}
              <div className="w-12 sm:w-16 flex justify-center shrink-0">
                {getRankIcon(index)}
              </div>

              {/* Avatar */}
              <div className="relative shrink-0 mr-4 sm:mr-6">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/10 object-cover" />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-700 border-2 border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-slate-300">{user.name?.charAt(0) || '?'}</span>
                  </div>
                )}
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1 border-2 border-slate-900 shadow-lg">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white truncate pr-4">{user.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                    <Shield className="w-3 h-3" />
                    Level {Math.floor(user.xp / 100) + 1}
                  </span>
                  {Object.keys(user.badges).length > 0 && (
                    <span className="text-xs text-slate-400">
                      • {Object.keys(user.badges).length} ব্যাজ
                    </span>
                  )}
                </div>
              </div>

              {/* XP */}
              <div className="text-right pl-4">
                <div className="flex items-center justify-end gap-1 text-indigo-400">
                  <span className="text-lg sm:text-2xl font-black">{user.xp.toLocaleString()}</span>
                  <span className="text-xs font-bold mt-1">XP</span>
                </div>
                {index < 3 && (
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-bold mt-0.5">
                    <ArrowUp className="w-3 h-3" />
                    Top {index + 1}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
