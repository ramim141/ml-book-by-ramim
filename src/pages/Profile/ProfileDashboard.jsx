import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment, getDocs, collection, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import {
  User, LayoutDashboard, History, Settings, GraduationCap, Target,
  Save, Loader2, Camera, Trophy, Sparkles, Flame, CheckCircle, Circle,
  Plus, CalendarClock, BookOpen, Zap, Award, ClipboardList, Quote,
  Trash2, ChevronRight, TrendingUp, Swords, Star, Megaphone, Bookmark, Activity
} from 'lucide-react';
import PageLoader from '../../components/UI/PageLoader';
import BookmarkList from './BookmarkList';
import WeaknessAnalyzer from './WeaknessAnalyzer';
import { useQuery } from '@tanstack/react-query';

// ─── Daily Quotes ─────────────────────────────────────────────────────────────
// Fetched dynamically from admin_settings/quotes

// ─── Daily MCQ Questions ──────────────────────────────────────────────────────
// Fetched dynamically from daily_challenges collection

// ─── XP Level System ─────────────────────────────────────────────────────────
// Fetched dynamically from admin_settings/gamification

// ─── Subject Config ───────────────────────────────────────────────────────────
// Fetched dynamically from admin_settings/subjects

const GOAL_PER_SUBJECT = 100; // 100 correct answers = 100%

// ─── Badges ───────────────────────────────────────────────────────────────────
const BADGES = [
  { id: 'first_login', icon: '🌟', label: 'প্রথম পদক্ষেপ', desc: 'অ্যাকাউন্ট তৈরি করেছ' },
  { id: 'profile_complete', icon: '✅', label: 'সম্পূর্ণ প্রোফাইল', desc: 'প্রোফাইল আপডেট করেছ' },
  { id: 'first_exam', icon: '📝', label: 'প্রথম পরীক্ষা', desc: '১টি মডেল টেস্ট দিয়েছ' },
  { id: 'streak_7', icon: '🔥', label: 'স্ট্রিক হিরো', desc: '৭ দিন ধারাবাহিকভাবে পড়েছ' },
  { id: 'questions_50', icon: '💪', label: 'প্রশ্ন বিশারদ', desc: 'মোট ৫০টি প্রশ্ন সঠিক করেছ' },
  { id: 'top_scorer', icon: '🏆', label: 'টপ স্কোরার', desc: 'কোনো পরীক্ষায় ৯০%+ পেয়েছ' },
  { id: 'daily_challenge', icon: '🎯', label: 'চ্যালেঞ্জ বিজয়ী', desc: 'দৈনিক চ্যালেঞ্জ সম্পন্ন করেছ' },
  { id: 'level_3', icon: '⭐', label: 'Scholar', desc: 'Level 3 Scholar অর্জন করেছ' },
];


const getDayOfYear = () => {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
};

// ─── Performance Graph (SVG) ─────────────────────────────────────────────────
const PerformanceGraph = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <TrendingUp className="h-10 w-10 text-slate-600 mb-3" />
      <p className="text-slate-400 text-sm">এখনও কোনো পরীক্ষার ডেটা নেই।</p>
      <a href="/academic/model-test" className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
        প্রথম পরীক্ষা দাও <ChevronRight className="h-4 w-4" />
      </a>
    </div>
  );

  const W = 560, H = 200, PX = 50, PY = 30;
  const n = data.length;
  const scores = data.map(e => e.percentage);
  const maxScore = Math.max(...scores);

  const xPos = (i) => PX + (n === 1 ? (W - 2 * PX) / 2 : (i / (n - 1)) * (W - 2 * PX));
  const yPos = (v) => H - PY - (v / 100) * (H - 2 * PY);

  const pathD = scores.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(v)}`).join(' ');
  const areaD = n > 1
    ? `${pathD} L ${xPos(n - 1)} ${H - PY} L ${xPos(0)} ${H - PY} Z`
    : `M ${xPos(0)} ${yPos(scores[0])} L ${xPos(0)} ${H - PY} Z`;

  const dotColor = (v) => v >= 80 ? '#10b981' : v >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[320px]" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={PX} y1={yPos(v)} x2={W - PX + 10} y2={yPos(v)} stroke="#1e293b" strokeWidth="1" />
            <text x={PX - 8} y={yPos(v)} textAnchor="end" dominantBaseline="middle" fill="#475569" fontSize="10">{v}%</text>
          </g>
        ))}

        {/* Area */}
        <path d={areaD} fill="url(#chartGrad)" />

        {/* Line */}
        {n > 1 && <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Data points */}
        {scores.map((v, i) => (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(v)} r="6" fill={dotColor(v)} stroke="#0f172a" strokeWidth="2" />
            <text x={xPos(i)} y={yPos(v) - 12} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">{v}%</text>
            {data[i]?.subjectTitle && (
              <text x={xPos(i)} y={H - PY + 14} textAnchor="middle" fill="#64748b" fontSize="9" className="truncate">
                {data[i].subjectTitle.length > 10 ? data[i].subjectTitle.slice(0, 10) + '…' : data[i].subjectTitle}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3">
        {[['#10b981', '≥80% (চমৎকার)'], ['#f59e0b', '50-79% (ঠিকাছে)'], ['#ef4444', '<50% (রিভিশন দাও)']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            <span className="text-slate-400 text-xs">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ProfileDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [xpMsg, setXpMsg] = useState('');
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '', educationLevel: 'HSC', target: '', examDate: '',
    photoURL: '', streak: 0, lastVisit: '', todos: [], xp: 0,
    examHistory: [], questionsBySubject: {}, lastDailyChallenge: null,
  });

  // Dynamic admin data via React Query
  const { data: adminData } = useQuery({
    queryKey: ['profile_admin_data'],
    queryFn: async () => {
      const quotesSnap = await getDoc(doc(db, 'admin_settings', 'quotes'));
      const annSnap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const levelsSnap = await getDoc(doc(db, 'admin_settings', 'gamification'));

      return {
        quotes: quotesSnap.exists() ? quotesSnap.data().list || [] : [],
        announcements: annSnap.docs.map(d => ({id: d.id, ...d.data()})),
        subjects: subjectsSnap.docs.map(d => d.data()),
        levels: levelsSnap.exists() && levelsSnap.data().levels ? levelsSnap.data().levels : [
          { id: 'level_1', icon: '🌱', label: 'Novice', minXp: 0, desc: 'নতুন শুরু করেছ' }
        ]
      };
    },
    staleTime: 1000 * 60 * 60 // 1 hour for static admin data
  });

  const dynamicQuotes = adminData?.quotes || [];
  const dynamicAnnouncements = adminData?.announcements || [];
  const dynamicSubjects = adminData?.subjects || [];
  const dynamicLevels = adminData?.levels || [{ id: 'level_1', icon: '🌱', label: 'Novice', minXp: 0, desc: 'নতুন শুরু করেছ' }];

  const getLevelInfo = (xp = 0) => {
    const sortedLevels = [...dynamicLevels].sort((a, b) => a.minXp - b.minXp);
    for (let i = sortedLevels.length - 1; i >= 0; i--) {
      if (xp >= sortedLevels[i].minXp) {
        const cur = sortedLevels[i];
        const next = sortedLevels[i + 1] || null;
        const progressInLevel = xp - cur.minXp;
        const levelRange = next ? next.minXp - cur.minXp : 1;
        const progressPct = next ? Math.min((progressInLevel / levelRange) * 100, 100) : 100;
        const xpToNext = next ? next.minXp - xp : 0;
        return { 
          level: i + 1, title: cur.label, emoji: cur.icon, minXP: cur.minXp, 
          color: 'from-indigo-400 to-purple-400', next, progressInLevel, levelRange, progressPct, xpToNext 
        };
      }
    }
    return { level: 1, title: 'Novice', emoji: '🌱', minXP: 0, progressPct: 0, xpToNext: 100, color: 'from-slate-400 to-slate-500' };
  };

  // ─ Computed values ──────────────────────────────────────────────────────────
  const examHistory = profileData.examHistory || [];
  const totalExams = examHistory.length;
  const totalCorrect = examHistory.reduce((s, e) => s + (e.correct || 0), 0);
  const avgMarks = totalExams > 0
    ? Math.round(examHistory.reduce((s, e) => s + (e.percentage || 0), 0) / totalExams) : 0;
  const xp = profileData.xp || 0;
  const levelInfo = getLevelInfo(xp);
  const questionsBySubject = profileData.questionsBySubject || {};

  const today = new Date().toDateString();
  
  // Available data based on level
  const availableSubjects = dynamicSubjects.filter(s => s.level === profileData.educationLevel);
  
  const quote = dynamicQuotes.length > 0 
    ? dynamicQuotes[new Date().getDay() % dynamicQuotes.length] 
    : { text: "সাফল্য রাতারাতি আসে না।", author: "অজানা" };

  // ─ Fetch profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAllData() {
      if (!currentUser) return;
      try {
        // 1. Fetch Profile
        const docRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          let { streak = 0, lastVisit, xp: savedXP = 0 } = data;

          let newXP = savedXP;
          if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            streak = lastVisit === yesterday.toDateString() ? streak + 1 : 1;
            newXP = savedXP + 5; 
            await updateDoc(docRef, { streak, lastVisit: today, xp: newXP });
          }

          setProfileData({
            ...data, streak, xp: newXP,
            todos: data.todos || [], examHistory: data.examHistory || [],
            questionsBySubject: data.questionsBySubject || {},
            lastDailyChallenge: data.lastDailyChallenge || null,
          });

          if (data.lastDailyChallenge?.date === today) {
            setSelectedAnswer(data.lastDailyChallenge.answer ?? null);
            setChallengeSubmitted(true);
          }
        } else {
          const defaults = {
            name: currentUser.displayName || '', educationLevel: 'HSC',
            target: '', examDate: '', photoURL: currentUser.photoURL || '',
            streak: 1, lastVisit: today, todos: [], xp: 5,
            examHistory: [], questionsBySubject: {}, lastDailyChallenge: null,
          };
          await setDoc(docRef, defaults);
          setProfileData(defaults);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // ─ Save profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });
      setSuccessMsg('প্রোফাইল সফলভাবে আপডেট হয়েছে! ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // ─ Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(currentUser, { photoURL: url });
      await setDoc(doc(db, 'users', currentUser.uid), { photoURL: url }, { merge: true });
      setProfileData(prev => ({ ...prev, photoURL: url }));
      setSuccessMsg('ছবি সফলভাবে আপলোড হয়েছে! 🎉');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { alert('ছবি আপলোড করতে সমস্যা হয়েছে।'); }
    finally { setImageUploading(false); }
  };

  // ─ Todo helpers ───────────────────────────────────────────────────────────
  const [newTodo, setNewTodo] = useState('');
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const updated = [...(profileData.todos || []), { id: Date.now(), text: newTodo.trim(), done: false }];
    setProfileData(prev => ({ ...prev, todos: updated }));
    setNewTodo('');
    await setDoc(doc(db, 'users', currentUser.uid), { todos: updated }, { merge: true });
  };
  const toggleTodo = async (id) => {
    const todo = profileData.todos.find(t => t.id === id);
    const updated = profileData.todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setProfileData(prev => ({ ...prev, todos: updated }));
    // Award XP for completing a todo
    if (!todo?.done) {
      await updateDoc(doc(db, 'users', currentUser.uid), { todos: updated, xp: increment(2) });
      setProfileData(prev => ({ ...prev, xp: (prev.xp || 0) + 2 }));
      setXpMsg('+2 XP ✅ টাস্ক সম্পন্ন!');
      setTimeout(() => setXpMsg(''), 2000);
    } else {
      await setDoc(doc(db, 'users', currentUser.uid), { todos: updated }, { merge: true });
    }
  };
  const deleteTodo = async (id) => {
    const updated = profileData.todos.filter(t => t.id !== id);
    setProfileData(prev => ({ ...prev, todos: updated }));
    await setDoc(doc(db, 'users', currentUser.uid), { todos: updated }, { merge: true });
  };

  // ─ Badge logic ────────────────────────────────────────────────────────────
  const getBadges = () => BADGES.map(b => {
    if (b.id === 'first_login') return { ...b, earned: true };
    if (b.id === 'profile_complete') return { ...b, earned: !!(profileData.name && profileData.target) };
    if (b.id === 'streak_7') return { ...b, earned: (profileData.streak || 0) >= 7 };
    if (b.id === 'first_exam') return { ...b, earned: totalExams >= 1 };
    if (b.id === 'questions_50') return { ...b, earned: totalCorrect >= 50 };
    if (b.id === 'top_scorer') return { ...b, earned: examHistory.some(e => e.percentage >= 90) };
    if (b.id === 'daily_challenge') return { ...b, earned: !!profileData.lastDailyChallenge?.correct };
    if (b.id === 'level_3') return { ...b, earned: levelInfo.level >= 3 };
    return b;
  });

  // ─ Exam countdown ─────────────────────────────────────────────────────────
  const countdown = profileData.examDate
    ? Math.ceil((new Date(profileData.examDate) - new Date()) / 86400000) : null;

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
    { id: 'history', label: 'পরীক্ষা', icon: History },
    { id: 'graph', label: 'গ্রাফ', icon: TrendingUp },
    { id: 'progress', label: 'প্রগ্রেস', icon: BookOpen },
    { id: 'todos', label: 'টু-ডু', icon: ClipboardList },
    { id: 'badges', label: 'ব্যাজ', icon: Award },
    { id: 'analyzer', label: 'অ্যানালাইজার', icon: Activity },
    { id: 'bookmarks', label: 'বুকমার্কস', icon: Bookmark },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  if (loading) return <PageLoader />;
  const photoSrc = profileData.photoURL || currentUser?.photoURL;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-h-screen">

      {/* XP Toast */}
      {xpMsg && (
        <div className="fixed top-24 right-4 z-50 bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in slide-in-from-top-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-300" /> {xpMsg}
        </div>
      )}

      {/* ── Daily Quote ──────────────────────────────────────────────────── */}
      <div className="mb-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl px-5 py-4 flex items-start gap-4">
        <Quote className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-200 text-sm italic">"{quote.text}"</p>
          <p className="text-indigo-400 text-xs mt-1">— {quote.author}</p>
        </div>
      </div>

      {/* ── Announcements ──────────────────────────────────────────────────── */}
      {dynamicAnnouncements.filter(a => a.active).map(a => (
        <div key={a.id} className={`mb-4 px-5 py-4 rounded-2xl border flex items-start gap-4 shadow-lg ${
          a.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
          a.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
          'bg-indigo-500/10 border-indigo-500/30'
        }`}>
          <div className="shrink-0 mt-1">
            <Megaphone className={`h-5 w-5 ${
              a.type === 'warning' ? 'text-amber-400' :
              a.type === 'success' ? 'text-emerald-400' :
              'text-indigo-400'
            }`} />
          </div>
          <div>
            <h4 className={`text-sm font-bold mb-1 ${
              a.type === 'warning' ? 'text-amber-300' :
              a.type === 'success' ? 'text-emerald-300' :
              'text-indigo-300'
            }`}>{a.title}</h4>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{a.message}</p>
          </div>
        </div>
      ))}

      {/* ── Profile Header ────────────────────────────────────────────────── */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 mb-5 sm:mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

        {/* Avatar */}
        <div className="relative h-24 w-24 sm:h-36 sm:w-36 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-[3px] shrink-0 group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}>
          <div className="h-full w-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden relative">
            {photoSrc
              ? <img src={photoSrc} alt="Profile" className="h-full w-full object-cover" />
              : <User className="h-12 w-12 sm:h-14 sm:w-14 text-slate-400" />}
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {imageUploading
                ? <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-spin" />
                : <><Camera className="h-6 w-6 sm:h-7 sm:w-7 text-white mb-1" /><span className="text-[10px] sm:text-[11px] text-white font-semibold">পরিবর্তন</span></>}
            </div>
          </div>
          {/* Level badge on avatar */}
          <div className={`absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-sm sm:text-lg shadow-lg border-2 border-slate-900`}>
            {levelInfo.emoji}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Info */}
        <div className="text-center sm:text-left flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl sm:text-3xl font-extrabold text-white truncate">{profileData.name || 'শিক্ষার্থী'}</h1>
            <span className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r ${levelInfo.color} bg-opacity-20 rounded-lg text-white text-[10px] sm:text-xs font-bold`}>
              {levelInfo.emoji} Level {levelInfo.level} {levelInfo.title}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400 shrink-0" /> {currentUser.email}
          </p>

          {/* XP Bar */}
          <div className="mb-3 sm:mb-4 max-w-sm mx-auto sm:mx-0">
            <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 mb-1">
              <span className="font-bold text-indigo-300">{xp} XP</span>
              {levelInfo.next && <span>পরবর্তী Level: {levelInfo.xpToNext} XP বাকি</span>}
            </div>
            <div className="h-2 sm:h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${levelInfo.color} rounded-full transition-all duration-700`}
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2">
            <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5">
              <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {profileData.educationLevel}
            </span>
            {profileData.target && (
              <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-full text-fuchsia-300 text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5">
                <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {profileData.target}
              </span>
            )}
            <span className="px-2.5 py-1 sm:px-3 sm:py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-300 text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5">
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {profileData.streak || 1} দিনের স্ট্রিক
            </span>
          </div>
        </div>

        {/* Countdown */}
        {countdown !== null && countdown > 0 && (
          <div className="w-full sm:w-auto shrink-0 flex flex-col items-center bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/25 rounded-2xl px-5 py-3 sm:py-4 text-center mt-2 sm:mt-0">
            <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mb-0.5 sm:mb-1" />
            <p className="text-2xl sm:text-3xl font-black text-red-300">{countdown}</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">দিন বাকি</p>
          </div>
        )}
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'মোট পরীক্ষা', value: totalExams, icon: ClipboardList, color: 'from-blue-500 to-indigo-600' },
          { label: 'সঠিক উত্তর', value: totalCorrect, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
          { label: 'গড় মার্কস', value: `${avgMarks}%`, icon: Zap, color: 'from-amber-500 to-orange-500' },
          { label: 'মোট XP', value: xp, icon: Star, color: 'from-purple-500 to-fuchsia-600' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/40 backdrop-blur border border-slate-700/40 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-600/60 transition-all">
            <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-br ${s.color} opacity-10 rounded-full translate-x-4 -translate-y-4 group-hover:opacity-20 transition-opacity`} />
            <s.icon className="h-5 w-5 text-slate-400 mb-2" />
            <p className="text-2xl font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar Tabs ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-1.5 sm:p-2 flex flex-row lg:flex-col gap-1 sm:gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2.5 px-3 py-2 sm:px-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap snap-center ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-700/50 border border-transparent'
                }`}>
                <tab.icon className="h-4 w-4 shrink-0" /><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-4 sm:p-8 min-h-[400px]">

            {/* ── Overview ──────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><LayoutDashboard className="h-5 w-5 text-indigo-400" /> ওভারভিউ</h2>
                {/* Streak */}
                <div className="mb-5 bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <h3 className="font-bold text-white">পড়ার স্ট্রিক</h3>
                    <span className="ml-auto text-orange-300 font-black">{profileData.streak || 1} দিন 🔥</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className={`h-5 w-5 rounded-md ${i < (profileData.streak || 1) ? 'bg-orange-500' : 'bg-slate-700/60'}`} />
                    ))}
                  </div>
                </div>


                {/* Recent exams */}
                {examHistory.length > 0 ? (
                  <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white flex items-center gap-2"><History className="h-4 w-4 text-indigo-400" /> সাম্প্রতিক পরীক্ষা</h3>
                      <button onClick={() => setActiveTab('history')} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1">সব দেখুন <ChevronRight className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="space-y-2">
                      {[...examHistory].reverse().slice(0, 3).map((exam, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${exam.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' : exam.percentage >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                            {exam.percentage}%
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-200 text-sm font-semibold truncate">{exam.subjectTitle}</p>
                            <p className="text-slate-500 text-xs">{new Date(exam.date).toLocaleDateString('en-BD', { month: 'short', day: 'numeric' })}</p>
                          </div>
                          <span className="text-xs text-slate-500">{exam.correct}/{exam.totalQuestions}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                    <p className="text-slate-400 text-sm">এখনও কোনো পরীক্ষা দেওনি।</p>
                    <a href="/academic/model-test" className="inline-flex items-center gap-1 mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-bold">
                      প্রথম টেস্ট দাও <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ── Analyzer ─────────────────────────────────────────────── */}
            {activeTab === 'analyzer' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" /> পারফরম্যান্স অ্যানালাইজার
                </h2>
                <p className="text-slate-400 text-sm mb-6">মডেল টেস্টের ডেটা থেকে তোমার দুর্বল এবং শক্তিশালী অধ্যায়গুলো এখানে দেখানো হচ্ছে।</p>
                <WeaknessAnalyzer chapterStats={profileData.chapterStats} />
              </div>
            )}

            {/* ── Bookmarks ─────────────────────────────────────────────── */}
            {activeTab === 'bookmarks' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-amber-400" /> আমার বুকমার্কস
                </h2>
                <p className="text-slate-400 text-sm mb-6">তোমার সেভ করা গুরুত্বপূর্ণ প্রশ্নগুলো এখানে পাবে।</p>
                <BookmarkList />
              </div>
            )}

            {/* ── Exam History ──────────────────────────────────────────── */}
            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><History className="h-5 w-5 text-indigo-400" /> পরীক্ষার হিস্ট্রি</h2>
                <p className="text-slate-400 text-sm mb-5">তোমার সব মডেল টেস্টের তালিকা।</p>
                {examHistory.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                    <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">এখনও কোনো পরীক্ষা নেই।</p>
                    <a href="/academic/model-test" className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold">
                      পরীক্ষা দাও <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...examHistory].reverse().map((exam, i) => (
                      <div key={exam.id || i} className="bg-slate-900/50 rounded-2xl p-4 sm:p-5 border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${exam.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : exam.percentage >= 50 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                          {exam.percentage}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-100 font-bold truncate">{exam.subjectTitle}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{new Date(exam.date).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="flex gap-4 text-sm shrink-0">
                          <span className="flex flex-col items-center"><span className="text-emerald-400 font-black">{exam.correct}</span><span className="text-slate-500 text-xs">সঠিক</span></span>
                          <span className="flex flex-col items-center"><span className="text-red-400 font-black">{exam.wrong}</span><span className="text-slate-500 text-xs">ভুল</span></span>
                          <span className="flex flex-col items-center"><span className="text-slate-300 font-black">{exam.totalQuestions}</span><span className="text-slate-500 text-xs">মোট</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Performance Graph ────────────────────────────────────── */}
            {activeTab === 'graph' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-400" /> পারফরম্যান্স গ্রাফ</h2>
                <p className="text-slate-400 text-sm mb-6">পরীক্ষায় তোমার স্কোরের উন্নতি বা পরিবর্তন এখানে দেখতে পাবে।</p>
                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                  <PerformanceGraph data={examHistory} />
                </div>

                {examHistory.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { label: 'সর্বোচ্চ স্কোর', value: `${Math.max(...examHistory.map(e => e.percentage))}%`, color: 'text-emerald-400' },
                      { label: 'সর্বনিম্ন স্কোর', value: `${Math.min(...examHistory.map(e => e.percentage))}%`, color: 'text-red-400' },
                      { label: 'গড় স্কোর', value: `${avgMarks}%`, color: 'text-indigo-400' },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 text-center">
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Subject Progress ─────────────────────────────────────── */}
            {activeTab === 'progress' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-400" /> সাবজেক্ট প্রগ্রেস</h2>
                <p className="text-slate-400 text-sm mb-6">মডেল টেস্টে সঠিক উত্তরের উপর ভিত্তি করে প্রগ্রেস নির্ধারিত হয়। লক্ষ্য: প্রতিটি বিষয়ে <span className="text-emerald-400 font-bold">{GOAL_PER_SUBJECT} টি সঠিক উত্তর।</span></p>
                <div className="space-y-5">
                  {availableSubjects.map((sub, idx) => {
                    const correct = questionsBySubject[sub.id] || 0;
                    const pct = Math.min(Math.round((correct / GOAL_PER_SUBJECT) * 100), 100);
                    return (
                      <div key={idx} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-200 flex items-center gap-2"><span className="text-xl">{sub.emoji}</span> {sub.label}</span>
                          <div className="text-right">
                            <span className={`text-sm font-black bg-gradient-to-r ${sub.color || 'from-indigo-400 to-purple-400'} bg-clip-text text-transparent`}>{pct}%</span>
                            <p className="text-slate-500 text-xs">{correct}/{GOAL_PER_SUBJECT} সঠিক</p>
                          </div>
                        </div>
                        <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div className={`absolute left-0 top-0 h-full bg-gradient-to-r ${sub.color || 'from-indigo-400 to-purple-400'} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-slate-600 text-xs mt-1.5">
                          {pct === 0 ? 'এই বিষয়ে এখনও কোনো মডেল টেস্ট দেওনি।' : pct >= 100 ? '🎉 লক্ষ্য অর্জিত! অভিনন্দন!' : `আরও ${GOAL_PER_SUBJECT - correct} টি সঠিক উত্তর দিলে ১০০% হবে।`}
                        </p>
                      </div>
                    );
                  })}
                  {availableSubjects.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">আপনার লেভেলের জন্য কোনো সাবজেক্ট যুক্ত করা হয়নি।</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── To-Do List ───────────────────────────────────────────── */}
            {activeTab === 'todos' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-fuchsia-400" /> পড়ার লিস্ট</h2>
                <p className="text-slate-400 text-sm mb-5">টাস্ক সম্পন্ন করলে <span className="text-yellow-400 font-bold">+2 XP</span> পাবে।</p>
                <div className="flex gap-2 mb-5">
                  <input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()}
                    placeholder="নতুন টাস্ক লিখুন..." className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600" />
                  <button onClick={addTodo} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-colors"><Plus className="h-5 w-5" /></button>
                </div>
                {profileData.todos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">কোনো টাস্ক নেই।</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profileData.todos.map(todo => (
                      <div key={todo.id} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${todo.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-700/50'}`}>
                        <button onClick={() => toggleTodo(todo.id)} className="shrink-0">
                          {todo.done ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-slate-500 hover:text-indigo-400 transition-colors" />}
                        </button>
                        <span className={`flex-1 text-sm font-medium ${todo.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{todo.text}</span>
                        <button onClick={() => deleteTodo(todo.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Badges ───────────────────────────────────────────────── */}
            {activeTab === 'badges' && (
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Award className="h-5 w-5 text-amber-400" /> অর্জনের ব্যাজ</h2>
                <p className="text-slate-400 text-sm mb-6">মাইলস্টোন পূরণ করলে নতুন ব্যাজ আনলক হবে।</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {getBadges().map(badge => (
                    <div key={badge.id} className={`rounded-2xl p-4 border text-center transition-all ${badge.earned ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5' : 'bg-slate-900/40 border-slate-700/40 opacity-50'}`}>
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <p className={`text-xs font-bold mb-1 ${badge.earned ? 'text-amber-300' : 'text-slate-400'}`}>{badge.label}</p>
                      <p className="text-[10px] text-slate-500">{badge.desc}</p>
                      {badge.earned && <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold"><CheckCircle className="h-3 w-3" /> অর্জিত</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Settings ─────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings className="h-5 w-5 text-slate-400" /> প্রোফাইল সেটিংস</h2>
                {successMsg && <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-bold">{successMsg}</div>}
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {[
                    { label: 'আপনার নাম', key: 'name', type: 'text', placeholder: 'e.g. Rakib Hossain' },
                    { label: 'টার্গেট (বিশ্ববিদ্যালয়/মেডিকেল)', key: 'target', type: 'text', placeholder: 'e.g. BUET, DMC, DU' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-semibold text-slate-400 mb-1.5">{f.label}</label>
                      <input type={f.type} value={profileData[f.key] || ''} onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors" placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">বর্তমান ক্লাস</label>
                    <select value={profileData.educationLevel} onChange={e => setProfileData({ ...profileData, educationLevel: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                      <option value="SSC">SSC</option>
                      <option value="HSC">HSC</option>
                      <option value="Admission">Admission Candidate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> পরীক্ষার তারিখ (Countdown)</label>
                    <input type="date" value={profileData.examDate || ''} onChange={e => setProfileData({ ...profileData, examDate: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} সেভ করুন
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
