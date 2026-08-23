import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import {
  User, LayoutDashboard, History, Settings, GraduationCap, Target,
  Save, Loader2, Camera, Mail, Flame, CheckCircle, Circle,
  Plus, CalendarClock, BookOpen, Zap, Award, ClipboardList, Quote,
  Trash2, ChevronRight, TrendingUp, Star, Megaphone, Bookmark, Activity, BookX, Crown, Sparkles
} from 'lucide-react';
import BookmarkList from './BookmarkList';
import WeaknessAnalyzer from './WeaknessAnalyzer';
import MistakeNotebook from '../Academic/Mistakes/MistakeNotebook';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProfileDashboardSkeleton from './ProfileDashboardSkeleton';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';
import { mergeExamHistory } from '../../lib/examProgress';
import { toBn } from '../../lib/format';
import toast from 'react-hot-toast';

// ─── Daily Quotes ─────────────────────────────────────────────────────────────
// Fetched dynamically from admin_settings/quotes

// ─── Daily MCQ Questions ──────────────────────────────────────────────────────
// Fetched dynamically from daily_challenges collection

// ─── XP Level System ─────────────────────────────────────────────────────────
// Fetched dynamically from admin_settings/gamification

// ─── Subject Config ───────────────────────────────────────────────────────────
// Fetched dynamically from admin_settings/subjects

// অধ্যায় "মাস্টার্ড" ধরা হয় যদি ন্যূনতম MASTERY_MIN_ATTEMPTS টা প্রশ্নে
// MASTERY_ACCURACY %+ নির্ভুলতা থাকে — এই দুটোই ModelTestResult.jsx এ
// জমা হওয়া chapterStats থেকে হিসাব হয়।
const MASTERY_ACCURACY = 70;
const MASTERY_MIN_ATTEMPTS = 3;

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

// ─── Section Header (shared premium header for content panels) ────────────────
const ACCENTS = {
  indigo: { grad: 'from-indigo-500 to-violet-500', glow: 'shadow-indigo-500/25' },
  emerald: { grad: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/25' },
  amber: { grad: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/25' },
  fuchsia: { grad: 'from-fuchsia-500 to-pink-500', glow: 'shadow-fuchsia-500/25' },
  rose: { grad: 'from-rose-500 to-orange-500', glow: 'shadow-rose-500/25' },
  slate: { grad: 'from-slate-500 to-slate-600', glow: 'shadow-slate-500/20' },
};

const SectionHeader = ({ icon: Icon, title, subtitle, accent = 'indigo', className = '' }) => {
  const a = ACCENTS[accent] || ACCENTS.indigo;
  return (
    <div className={`mb-6 flex items-start gap-3 ${className}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${a.grad} shadow-lg ${a.glow}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
};

// ─── Performance Graph (SVG) ─────────────────────────────────────────────────
const PerformanceGraph = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <TrendingUp className="h-10 w-10 text-slate-600 mb-3" />
      <p className="text-slate-400 text-sm">এখনও কোনো পরীক্ষার ডেটা নেই।</p>
      <Link to="/academic/model-test" className="mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-1">
        প্রথম পরীক্ষা দাও <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );

  const W = 560, H = 200, PX = 50, PY = 30;
  const n = data.length;
  const scores = data.map(e => e.percentage);

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
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
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
        {n > 1 && <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Data points */}
        {scores.map((v, i) => (
          <g key={i}>
            <circle cx={xPos(i)} cy={yPos(v)} r="6" fill={dotColor(v)} stroke="#0b0f19" strokeWidth="2" />
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
  const queryClient = useQueryClient();
  // প্রগ্রেস ট্যাব আগে টপ-লেভেল 'subjects' কালেকশন পড়ত — বাকি অ্যাপ
  // admin_settings/subjects ব্যবহার করে, তাই তালিকাটা সবসময় খালি থাকত।
  const { data: allSubjects = [] } = useAcademicSubjects();
  const [activeTab, setActiveTab] = useState('overview');
  // অধ্যায় চেকলিস্ট — কুইজ স্কোরের বাইরে, শুধু "কতটুকু পড়া শেষ" সেটা তালিকায়ায় রাখা
  const [openChapterSubject, setOpenChapterSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
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
      const levelsSnap = await getDoc(doc(db, 'admin_settings', 'gamification'));

      return {
        quotes: quotesSnap.exists() ? quotesSnap.data().list || [] : [],
        announcements: annSnap.docs.map(d => ({id: d.id, ...d.data()})),
        levels: levelsSnap.exists() && levelsSnap.data().levels ? levelsSnap.data().levels : [
          { id: 'level_1', icon: '🌱', label: 'Novice', minXp: 0, desc: 'নতুন শুরু করেছ' }
        ]
      };
    },
    staleTime: 1000 * 60 * 60 // 1 hour for static admin data
  });

  const dynamicQuotes = adminData?.quotes || [];
  const dynamicAnnouncements = adminData?.announcements || [];
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

  const today = new Date().toDateString();

  // Available data based on level
  const availableSubjects = allSubjects.filter(s => s.level === profileData.educationLevel);

  // Analyzer ট্যাব chapterStats এর ফ্ল্যাট শেপ (নাম → পরিসংখ্যান) আশা করে।
  // এখন সেভ হয় subjectId → chapterId নেস্ট করে (একই নামের অধ্যায় ভিন্ন
  // বিষয়ে মিশে না যাওয়ার জন্য) — তাই দেখানোর আগে subject/chapter নাম
  // জুড়ে একটা ফ্ল্যাট লিস্টে রূপান্তর করা হয়।
  const flatChapterStats = useMemo(() => {
    const nested = profileData.chapterStats || {};
    const rows = [];
    Object.entries(nested).forEach(([subId, chapters]) => {
      if (!chapters || typeof chapters !== 'object' || typeof chapters.attempted === 'number') return;
      const subject = allSubjects.find((s) => s.id === subId);
      const subjectLabel = subject ? `${subject.emoji} ${subject.label}` : subId;
      Object.entries(chapters).forEach(([chId, stat]) => {
        const chapter = subject?.chapters?.find((c) => c.id === chId);
        const chapterLabel = chapter ? (chapter.name || chapter.title || chId) : (chId === 'uncategorized' ? 'অন্যান্য' : chId);
        rows.push({
          // আইডিগুলোও সাথে রাখি — "এই অধ্যায়ে অনুশীলন করো" লিংক বানাতে লাগে
          subjectId: subId,
          chapterId: chId,
          // অধ্যায়টা কনফিগে না থাকলে মডেল টেস্টে ওটা বেছে দেওয়া যাবে না
          practiceable: Boolean(subject && chapter),
          name: `${subjectLabel} · ${chapterLabel}`,
          ...stat,
        });
      });
    });
    return rows;
  }, [profileData.chapterStats, allSubjects]);

  const quote = dynamicQuotes.length > 0
    ? dynamicQuotes[getDayOfYear() % dynamicQuotes.length]
    : { text: "সাফল্য রাতারাতি আসে না।", author: "অজানা" };

  // ─ Fetch profile ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAllData() {
      if (!currentUser) return;

      const queryKey = ['userProfile', currentUser.uid];
      const cached = queryClient.getQueryData(queryKey);

      if (cached) {
         setProfileData(cached);
         setLoading(false);
         return;
      }

      try {
        // 1. Fetch Profile
        const docRef = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(docRef);
        let finalData;
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

          // পরীক্ষার ইতিহাস এখন সাবকালেকশনে জমে (আগে users ডকের একটা
          // অ্যারেতে, তাতে ডকটা অসীম বাড়ত)। পুরনো অ্যারের ডেটা যেন হারিয়ে
          // না যায়, তাই দুটো মিলিয়ে দেখাই — আলাদা মাইগ্রেশন লাগে না।
          let historyDocs = [];
          try {
            const historySnap = await getDocs(collection(db, 'users', currentUser.uid, 'exam_history'));
            historyDocs = historySnap.docs.map((d) => d.data());
          } catch (err) {
            console.error('পরীক্ষার ইতিহাস পড়া যায়নি', err);
          }

          finalData = {
            ...data, streak, xp: newXP,
            todos: data.todos || [],
            examHistory: mergeExamHistory(data.examHistory, historyDocs),
            questionsBySubject: data.questionsBySubject || {},
            lastDailyChallenge: data.lastDailyChallenge || null,
          };
        } else {
          finalData = {
            name: currentUser.displayName || '', educationLevel: 'HSC',
            target: '', examDate: '', photoURL: currentUser.photoURL || '',
            streak: 1, lastVisit: today, todos: [], xp: 5,
            examHistory: [], questionsBySubject: {}, lastDailyChallenge: null,
          };
          await setDoc(docRef, finalData);
        }

        setProfileData(finalData);
        queryClient.setQueryData(queryKey, finalData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Sync local changes back to cache so remounts use the latest local state
  useEffect(() => {
    if (currentUser && !loading) {
      queryClient.setQueryData(['userProfile', currentUser.uid], profileData);
    }
  }, [profileData, currentUser, loading, queryClient]);

  // ─ Save profile ───────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // আগে পুরো profileData লেখা হতো — ফলে অন্য ট্যাবে পরীক্ষা দিলে সেটিংস
      // সেভ করার সময় পুরনো examHistory/xp দিয়ে তা চাপা পড়তো।
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: profileData.name || '',
        target: profileData.target || '',
        educationLevel: profileData.educationLevel || 'HSC',
        examDate: profileData.examDate || '',
      }, { merge: true });
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
    } catch (err) {
      console.error(err);
      toast.error('ছবি আপলোড করতে সমস্যা হয়েছে।');
    }
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
  // আগে প্রতিবার টিক দিলেই +2 XP বসত — অন/অফ করে অসীম XP নেওয়া যেত।
  const toggleTodo = async (id) => {
    const updated = profileData.todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setProfileData(prev => ({ ...prev, todos: updated }));
    await setDoc(doc(db, 'users', currentUser.uid), { todos: updated }, { merge: true });
  };
  const deleteTodo = async (id) => {
    const updated = profileData.todos.filter(t => t.id !== id);
    setProfileData(prev => ({ ...prev, todos: updated }));
    await setDoc(doc(db, 'users', currentUser.uid), { todos: updated }, { merge: true });
  };

  // ─ অধ্যায় চেকলিস্ট ────────────────────────────────────────────
  // কুইজের স্কোর থেকে আলাদা — "কতটুকু পড়া শেষ করেছি" তা সরাসরি ছাত্র নিজে টিক দেয়।
  const completedChapters = profileData.completedChapters || {};

  const toggleChapterComplete = async (subjectId, chapterId) => {
    const list = completedChapters[subjectId] || [];
    const isDone = list.includes(chapterId);
    const updatedList = isDone ? list.filter((c) => c !== chapterId) : [...list, chapterId];

    setProfileData((prev) => ({
      ...prev,
      completedChapters: { ...(prev.completedChapters || {}), [subjectId]: updatedList },
    }));

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        [`completedChapters.${subjectId}`]: isDone ? arrayRemove(chapterId) : arrayUnion(chapterId),
      });
    } catch (err) {
      console.error(err);
      toast.error('সেভ করা যায়নি, আবার চেষ্টা করো।');
      // ব্যর্থ হলে UI আগের অবস্থায় ফিরিয়ে নিই
      setProfileData((prev) => ({
        ...prev,
        completedChapters: { ...(prev.completedChapters || {}), [subjectId]: list },
      }));
    }
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
    { id: 'mistakes', label: 'ভুলের খাতা', icon: BookX },
    { id: 'graph', label: 'গ্রাফ', icon: TrendingUp },
    { id: 'progress', label: 'প্রগ্রেস', icon: BookOpen },
    { id: 'todos', label: 'টু-ডু', icon: ClipboardList },
    { id: 'badges', label: 'ব্যাজ', icon: Award },
    { id: 'analyzer', label: 'অ্যানালাইজার', icon: Activity },
    { id: 'bookmarks', label: 'বুকমার্কস', icon: Bookmark },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  if (loading) return <ProfileDashboardSkeleton />;
  const photoSrc = profileData.photoURL || currentUser?.photoURL;

  return (
    <div className="relative mx-auto w-full min-h-screen max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">

      {/* ── Ambient glow ──────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-52 right-0 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />

      <div className="relative">

      {/* ── Daily Quote ──────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-white/[0.03] to-transparent px-4 py-3.5 backdrop-blur-xl sm:mb-6 sm:gap-4 sm:px-5 sm:py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
          <Quote className="h-4 w-4 text-indigo-300" />
        </div>
        <div className="min-w-0">
          <p className="text-slate-200 text-sm italic leading-relaxed">"{quote.text}"</p>
          <p className="text-indigo-400 text-xs font-medium mt-1">— {quote.author}</p>
        </div>
      </div>

      {/* ── Announcements ──────────────────────────────────────────────────── */}
      {dynamicAnnouncements.filter(a => a.active).map(a => (
        <div key={a.id} className={`relative mb-4 overflow-hidden flex items-start gap-4 rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-xl ${
          a.type === 'warning' ? 'bg-amber-500/[0.07] border-amber-400/20' :
          a.type === 'success' ? 'bg-emerald-500/[0.07] border-emerald-400/20' :
          'bg-indigo-500/[0.07] border-indigo-400/20'
        }`}>
          <div className={`absolute inset-y-0 left-0 w-1 ${
            a.type === 'warning' ? 'bg-amber-400' : a.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'
          }`} />
          <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${
            a.type === 'warning' ? 'bg-amber-500/15 ring-amber-400/25' :
            a.type === 'success' ? 'bg-emerald-500/15 ring-emerald-400/25' :
            'bg-indigo-500/15 ring-indigo-400/25'
          }`}>
            <Megaphone className={`h-4 w-4 ${
              a.type === 'warning' ? 'text-amber-300' :
              a.type === 'success' ? 'text-emerald-300' :
              'text-indigo-300'
            }`} />
          </div>
          <div className="min-w-0">
            <h4 className={`text-sm font-bold mb-1 ${
              a.type === 'warning' ? 'text-amber-200' :
              a.type === 'success' ? 'text-emerald-200' :
              'text-indigo-200'
            }`}>{a.title}</h4>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">{a.message}</p>
          </div>
        </div>
      ))}

      {/* ── Profile Header ────────────────────────────────────────────────── */}
      <div className="relative mb-5 flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:mb-6 sm:flex-row sm:items-center sm:gap-6 sm:rounded-3xl sm:p-7 lg:gap-8">
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/10 blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

        {/* Avatar — মোবাইলে hover নেই, তাই ক্যামেরা ব্যাজ সবসময় দৃশ্যমান */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="প্রোফাইল ছবি পরিবর্তন করুন"
          className="group relative h-24 w-24 shrink-0 cursor-pointer rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-[3px] shadow-lg shadow-indigo-500/20 transition-transform active:scale-95 sm:h-28 sm:w-28"
        >
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0b0f19] ring-2 ring-[#0b0f19]">
            {photoSrc
              ? <img src={photoSrc} alt="Profile" className="h-full w-full object-cover" />
              : <User className="h-11 w-11 text-slate-400 sm:h-12 sm:w-12" />}
            <div className="absolute inset-0 hidden flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
              {imageUploading
                ? <Loader2 className="h-7 w-7 animate-spin text-white" />
                : <><Camera className="mb-1 h-6 w-6 text-white" /><span className="text-[11px] font-semibold text-white">পরিবর্তন</span></>}
            </div>
            {imageUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 sm:hidden">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* স্থায়ী ক্যামেরা ব্যাজ — মোবাইলে এটাই একমাত্র সংকেত যে ছবি বদলানো যায় */}
          <span className="absolute -bottom-0.5 -left-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0b0f19] bg-slate-800 text-slate-300 shadow-lg sm:hidden">
            <Camera className="h-4 w-4" />
          </span>
          {/* Level badge on avatar */}
          <div className={`absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-sm sm:text-lg shadow-lg border-2 border-[#0b0f19]`}>
            {levelInfo.emoji}
          </div>
        </button>

        {/* ফাইল ইনপুট বাটনের বাইরে — নেস্টেড interactive element অবৈধ HTML */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        {/* পরিচয় */}
        <div className="relative min-w-0 flex-1 text-center sm:text-left">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h1 className="break-words bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-extrabold text-transparent sm:truncate sm:text-2xl lg:text-3xl">
              {profileData.name || 'শিক্ষার্থী'}
            </h1>
            <span className="flex items-center gap-1 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-200 sm:px-3 sm:text-xs">
              {levelInfo.emoji} লেভেল {toBn(levelInfo.level)} · {levelInfo.title}
            </span>
          </div>

          <p className="mb-4 flex items-center justify-center gap-1.5 text-xs text-slate-400 sm:justify-start sm:text-sm">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-500 sm:h-4 sm:w-4" />
            <span className="truncate">{currentUser.email}</span>
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2">
            <span className="flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-300 sm:gap-1.5 sm:px-3 sm:text-xs">
              <GraduationCap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {profileData.educationLevel}
            </span>
            {profileData.target && (
              <span className="flex items-center gap-1 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-[11px] font-bold text-fuchsia-300 sm:gap-1.5 sm:px-3 sm:text-xs">
                <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {profileData.target}
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-orange-300 sm:gap-1.5 sm:px-3 sm:text-xs">
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {toBn(profileData.streak || 1)} দিনের স্ট্রিক
            </span>
          </div>
        </div>

        {/* লেভেল প্যানেল — আগে XP বারটা পরিচয়ের নিচে চাপা পড়ে থাকত আর কার্ডের
            ডান অর্ধেক পুরো ফাঁকা যেত। এখন সেটাই ডান পাশের ব্লক। */}
        <div className="relative w-full shrink-0 rounded-2xl bg-slate-950/40 p-4 sm:w-64 lg:w-72">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-xs font-bold text-slate-400">অভিজ্ঞতা</span>
            <span className="text-sm font-black bg-gradient-to-r from-indigo-300 to-fuchsia-300 bg-clip-text text-transparent">
              {toBn(xp)} <span className="text-[11px] font-bold text-slate-500">XP</span>
            </span>
          </div>

          {/* সরু হলেও পূরণ অংশটা যেন দেখা যায় — ৫/১০০০ XP তে আগে বারটা একেবারে খালি দেখাত */}
          <div className="h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_rgba(129,140,248,0.5)] transition-all duration-700"
              style={{ width: `${levelInfo.progressPct > 0 && levelInfo.progressPct < 3 ? 3 : levelInfo.progressPct}%` }}
            />
          </div>

          <p className="mt-2 text-[11px] font-semibold text-slate-500">
            {levelInfo.next
              ? <>পরবর্তী লেভেলে আর <span className="text-slate-300">{toBn(levelInfo.xpToNext)}</span> XP</>
              : 'সর্বোচ্চ লেভেলে পৌঁছে গেছো'}
          </p>

          {countdown !== null && countdown > 0 && (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5">
              <CalendarClock className="h-4 w-4 shrink-0 text-red-400" />
              <span className="text-sm font-black text-red-300">{toBn(countdown)}</span>
              <span className="text-[11px] font-semibold text-slate-400">দিন বাকি</span>
            </div>
          )}
        </div>
      </div>


      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="mb-5 grid grid-cols-2 divide-x divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl sm:mb-8 sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: 'মোট পরীক্ষা', value: toBn(totalExams), icon: ClipboardList, color: 'from-blue-500 to-indigo-600' },
          { label: 'সঠিক উত্তর', value: toBn(totalCorrect), icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
          { label: 'গড় মার্কস', value: `${toBn(avgMarks)}%`, icon: Zap, color: 'from-amber-500 to-orange-500' },
          { label: 'মোট XP', value: toBn(xp), icon: Star, color: 'from-purple-500 to-fuchsia-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 transition-colors hover:bg-white/[0.03] sm:p-5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black leading-tight text-white sm:text-2xl">{s.value}</p>
              <p className="truncate text-[11px] font-medium text-slate-400 sm:text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">

        {/* ── Sidebar Tabs ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-60 shrink-0">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 sm:p-2 flex flex-row lg:flex-col gap-1 sm:gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2.5 px-3 py-2 sm:px-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap snap-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/10 text-white shadow-[inset_0_0_0_1px_rgba(129,140,248,0.35)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}>
                {activeTab === tab.id && (
                  <span className="absolute left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-400 to-fuchsia-400 lg:block" />
                )}
                <tab.icon className={`h-4 w-4 shrink-0 ${activeTab === tab.id ? 'text-indigo-300' : ''}`} /><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-8 min-h-[400px] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)]">

            {/* ── Overview ──────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div>
                <SectionHeader icon={LayoutDashboard} title="ওভারভিউ" accent="indigo" />
                {/* Streak */}
                <div className="mb-5 rounded-2xl bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <h3 className="font-bold text-white">পড়ার স্ট্রিক</h3>
                    <span className="ml-auto font-black text-orange-300">{toBn(profileData.streak || 1)} দিন 🔥</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className={`h-5 w-5 rounded-md ${i < (profileData.streak || 1) ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm shadow-orange-500/30' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>


                {/* Recent exams */}
                {examHistory.length > 0 ? (
                  <div className="rounded-2xl bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white flex items-center gap-2"><History className="h-4 w-4 text-indigo-400" /> সাম্প্রতিক পরীক্ষা</h3>
                      <button onClick={() => setActiveTab('history')} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1">সব দেখুন <ChevronRight className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="divide-y divide-white/5">
                      {[...examHistory].reverse().slice(0, 3).map((exam, i) => (
                        <div key={i} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-white/[0.03]">
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
                  <div className="text-center py-8 rounded-2xl bg-white/[0.02]">
                    <p className="text-slate-400 text-sm">এখনও কোনো পরীক্ষা দেওনি।</p>
                    <Link to="/academic/model-test" className="inline-flex items-center gap-1 mt-3 text-indigo-400 hover:text-indigo-300 text-sm font-bold">
                      প্রথম টেস্ট দাও <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── Analyzer ─────────────────────────────────────────────── */}
            {activeTab === 'analyzer' && (
              <div>
                <SectionHeader icon={Activity} title="পারফরম্যান্স অ্যানালাইজার" subtitle="মডেল টেস্টের ডেটা থেকে তোমার দুর্বল এবং শক্তিশালী অধ্যায়গুলো এখানে দেখানো হচ্ছে।" accent="indigo" />
                <WeaknessAnalyzer chapterRows={flatChapterStats} />
              </div>
            )}

            {/* ── Bookmarks ─────────────────────────────────────────────── */}
            {activeTab === 'bookmarks' && (
              <div>
                <SectionHeader icon={Bookmark} title="আমার বুকমার্কস" subtitle="তোমার সেভ করা গুরুত্বপূর্ণ প্রশ্নগুলো এখানে পাবে।" accent="amber" />
                <BookmarkList />
              </div>
            )}

            {/* ── Exam History ──────────────────────────────────────────── */}
            {activeTab === 'history' && (
              <div>
                <SectionHeader icon={History} title="পরীক্ষার হিস্ট্রি" subtitle="তোমার সব মডেল টেস্টের তালিকা।" accent="indigo" />
                {examHistory.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl bg-white/[0.02]">
                    <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">এখনও কোনো পরীক্ষা নেই।</p>
                    <Link to="/academic/model-test" className="inline-flex items-center gap-1 mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-fuchsia-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                      পরীক্ষা দাও <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02]">
                    {[...examHistory].reverse().map((exam, i) => (
                      <div key={exam.id || i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 transition-colors hover:bg-white/[0.03]">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${exam.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' : exam.percentage >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
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

            {/* ── Mistake Notebook ─────────────────────────────────────── */}
            {activeTab === 'mistakes' && (
              <div>
                <SectionHeader icon={BookX} title="ভুলের খাতা" subtitle="মডেল টেস্ট ও লাইভ এক্সামে ভুল হওয়া প্রশ্নগুলো এখানে জমা হয়, বারবার অনুশীলনের জন্য।" accent="rose" />
                <MistakeNotebook />
              </div>
            )}

            {/* ── Performance Graph ────────────────────────────────────── */}
            {activeTab === 'graph' && (
              <div>
                <SectionHeader icon={TrendingUp} title="পারফরম্যান্স গ্রাফ" subtitle="পরীক্ষায় তোমার স্কোরের উন্নতি বা পরিবর্তন এখানে দেখতে পাবে।" accent="emerald" />
                <div className="rounded-2xl bg-white/[0.02] p-5">
                  <PerformanceGraph data={examHistory} />
                </div>

                {examHistory.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                    {[
                      { label: 'সর্বোচ্চ স্কোর', value: `${Math.max(...examHistory.map(e => e.percentage))}%`, color: 'text-emerald-400' },
                      { label: 'সর্বনিম্ন স্কোর', value: `${Math.min(...examHistory.map(e => e.percentage))}%`, color: 'text-red-400' },
                      { label: 'গড় স্কোর', value: `${avgMarks}%`, color: 'text-indigo-400' },
                    ].map((s, i) => (
                      <div key={i} className="p-3 text-center">
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Subject Progress (chapter-mastery ভিত্তিক) ──────────────
                প্রতিটি অধ্যায়ে ন্যূনতম MASTERY_MIN_ATTEMPTS টা প্রশ্নে
                MASTERY_ACCURACY %+ নির্ভুলতা পেলে সেটা "মাস্টার্ড" ধরা হয়।
                সাবজেক্ট প্রগ্রেস = মাস্টার্ড অধ্যায়ের অনুপাত — তাই একই সহজ
                প্রশ্ন বারবার দিলে সংখ্যাটা কৃত্রিমভাবে বাড়ে না। ম্যানুয়াল
                "পড়া শেষ" চেকবক্সও একই লিস্টে পাশাপাশি রাখা হলো, যাতে দুটো
                আলাদা ট্যাবে ঘুরে দুইবার একই subject দেখতে না হয়। ───────── */}
            {activeTab === 'progress' && (
              <div>
                <SectionHeader icon={BookOpen} title="সাবজেক্ট প্রগ্রেস" accent="emerald"
                  subtitle={<>কোনো অধ্যায়ে ন্যূনতম {toBn(MASTERY_MIN_ATTEMPTS)}টি প্রশ্নে <span className="text-emerald-400 font-bold">{MASTERY_ACCURACY}%+</span> নির্ভুলতা পেলে সেটা "মাস্টার্ড" ধরা হয়। প্রগ্রেস = মাস্টার্ড অধ্যায়ের অনুপাত।</>} />
                <div className="divide-y divide-white/5 overflow-hidden rounded-2xl bg-white/[0.02]">
                  {availableSubjects.map((sub) => {
                    const chapters = sub.chapters || [];
                    const subjectStats = (profileData.chapterStats || {})[sub.id] || {};
                    const doneList = completedChapters[sub.id] || [];
                    const isOpen = openChapterSubject === sub.id;

                    const chapterRows = chapters.map((ch) => {
                      const stat = subjectStats[ch.id] || { attempted: 0, correct: 0 };
                      const accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;
                      const mastered = stat.attempted >= MASTERY_MIN_ATTEMPTS && accuracy >= MASTERY_ACCURACY;
                      const status = stat.attempted === 0
                        ? 'untried'
                        : stat.attempted < MASTERY_MIN_ATTEMPTS
                          ? 'needsMore'
                          : mastered ? 'mastered' : 'weak';
                      return { ...ch, attempted: stat.attempted, accuracy, status, read: doneList.includes(ch.id) };
                    });

                    const masteredCount = chapterRows.filter((r) => r.status === 'mastered').length;
                    const readCount = chapterRows.filter((r) => r.read).length;
                    const pct = chapters.length ? Math.round((masteredCount / chapters.length) * 100) : 0;

                    return (
                      <div key={sub.id}>
                        <button
                          type="button"
                          onClick={() => setOpenChapterSubject(isOpen ? null : sub.id)}
                          className="flex w-full items-center justify-between gap-3 p-5 text-left"
                        >
                          <span className="flex min-w-0 items-center gap-2 font-bold text-slate-200">
                            <span className="shrink-0 text-xl">{sub.emoji}</span>
                            <span className="truncate">{sub.label}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            {chapters.length > 0 && (
                              <span className={`text-sm font-black bg-gradient-to-r ${sub.color || 'from-indigo-400 to-purple-400'} bg-clip-text text-transparent`}>{pct}%</span>
                            )}
                            <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                          </span>
                        </button>

                        {chapters.length > 0 && (
                          <div className="px-5 pb-4">
                            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                              <div className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${sub.color || 'from-indigo-400 to-purple-400'} transition-all duration-700`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
                              মাস্টার্ড {toBn(masteredCount)}/{toBn(chapters.length)} অধ্যায় · পড়া শেষ {toBn(readCount)}/{toBn(chapters.length)}
                            </p>
                          </div>
                        )}

                        {isOpen && (
                          <div className="divide-y divide-white/5 border-t border-white/5 bg-black/10">
                            {chapters.length === 0 && (
                              <p className="p-5 text-xs text-slate-500">কোনো অধ্যায় যুক্ত করা হয়নি।</p>
                            )}
                            {chapterRows.map((ch) => (
                              <div key={ch.id} className="flex items-center gap-3 px-5 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleChapterComplete(sub.id, ch.id)}
                                  className="shrink-0"
                                  title="পড়া শেষ হলে টিক দাও"
                                >
                                  {ch.read
                                    ? <CheckCircle className="h-4 w-4 text-emerald-400" />
                                    : <Circle className="h-4 w-4 text-slate-600" />}
                                </button>
                                <span className={`min-w-0 flex-1 truncate text-sm ${ch.read ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                  {ch.name || ch.title || ch.id}
                                </span>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                  ch.status === 'mastered' ? 'bg-emerald-500/15 text-emerald-400' :
                                  ch.status === 'weak' ? 'bg-red-500/15 text-red-400' :
                                  ch.status === 'needsMore' ? 'bg-amber-500/15 text-amber-400' :
                                  'bg-white/5 text-slate-500'
                                }`}>
                                  {ch.status === 'mastered' ? `✓ ${toBn(ch.accuracy)}%` :
                                    ch.status === 'weak' ? `${toBn(ch.accuracy)}% দুর্বল` :
                                    ch.status === 'needsMore' ? `চেষ্টা ${toBn(ch.attempted)}/${toBn(MASTERY_MIN_ATTEMPTS)}` :
                                    'কুইজ দেওয়া হয়নি'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {availableSubjects.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-400">আপনার লেভেলের জন্য কোনো সাবজেক্ট যুক্ত করা হয়নি।</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── To-Do List ───────────────────────────────────────────── */}
            {activeTab === 'todos' && (
              <div>
                <SectionHeader icon={ClipboardList} title="পড়ার লিস্ট" subtitle="আজকের পড়ার পরিকল্পনা লিখে রাখো, শেষ হলে টিক দাও।" accent="fuchsia" />
                <div className="flex gap-2 mb-5">
                  <input type="text" value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()}
                    placeholder="নতুন টাস্ক লিখুন..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-colors placeholder:text-slate-600" />
                  <button onClick={addTodo} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:shadow-indigo-500/40 text-white px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"><Plus className="h-5 w-5" /></button>
                </div>
                {profileData.todos.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">কোনো টাস্ক নেই।</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02]">
                    {profileData.todos.map(todo => (
                      <div key={todo.id} className={`flex items-center gap-3 p-4 transition-colors ${todo.done ? 'bg-emerald-500/[0.04]' : 'hover:bg-white/[0.03]'}`}>
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
                <SectionHeader icon={Award} title="অর্জনের ব্যাজ" subtitle="মাইলস্টোন পূরণ করলে নতুন ব্যাজ আনলক হবে।" accent="amber" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {getBadges().map(badge => (
                    <div key={badge.id} className={`group relative overflow-hidden rounded-2xl p-4 text-center transition-all ${badge.earned ? 'bg-gradient-to-b from-amber-500/10 to-transparent shadow-[0_10px_28px_-10px_rgba(245,158,11,0.3)]' : 'bg-white/[0.02] opacity-40 grayscale'}`}>
                      {badge.earned && <div className="pointer-events-none absolute -top-6 -right-6 h-16 w-16 rounded-full bg-amber-400/20 blur-2xl" />}
                      <div className="relative text-4xl mb-2 transition-transform group-hover:scale-110">{badge.icon}</div>
                      <p className={`relative text-xs font-bold mb-1 ${badge.earned ? 'text-amber-200' : 'text-slate-400'}`}>{badge.label}</p>
                      <p className="relative text-[11px] leading-snug text-slate-500">{badge.desc}</p>
                      {badge.earned && <span className="relative mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold"><CheckCircle className="h-3 w-3" /> অর্জিত</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Settings ─────────────────────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl">
                <SectionHeader icon={Settings} title="প্রোফাইল সেটিংস" accent="slate" />
                {successMsg && <div className="mb-5 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-400 text-sm font-bold">{successMsg}</div>}
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {[
                    { label: 'আপনার নাম', key: 'name', type: 'text', placeholder: 'e.g. Rakib Hossain' },
                    { label: 'টার্গেট (বিশ্ববিদ্যালয়/মেডিকেল)', key: 'target', type: 'text', placeholder: 'e.g. BUET, DMC, DU' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-sm font-semibold text-slate-400 mb-1.5">{f.label}</label>
                      <input type={f.type} value={profileData[f.key] || ''} onChange={e => setProfileData({ ...profileData, [f.key]: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-colors" placeholder={f.placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5">বর্তমান ক্লাস</label>
                    <select value={profileData.educationLevel} onChange={e => setProfileData({ ...profileData, educationLevel: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-colors">
                      <option value="SSC">SSC</option>
                      <option value="HSC">HSC</option>
                      <option value="Admission">Admission Candidate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> পরীক্ষার তারিখ (Countdown)</label>
                    <input type="date" value={profileData.examDate || ''} onChange={e => setProfileData({ ...profileData, examDate: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-base sm:text-sm focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-colors" />
                  </div>
                  <div className="pt-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:hover:translate-y-0">
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
    </div>
  );
}
