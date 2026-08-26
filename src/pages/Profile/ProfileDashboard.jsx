import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { uploadImage, validateImageFile } from '../../lib/imageUpload';
import { 
  doc, getDoc, setDoc, updateDoc, getDocs, collection, query, 
  orderBy, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
  User, LayoutDashboard, History, Settings, GraduationCap, Target,
  Save, Loader2, Camera, Mail, Flame, CheckCircle, Circle,
  Plus, CalendarClock, BookOpen, Zap, Award, ClipboardList, Quote,
  Trash2, ChevronRight, TrendingUp, Star, Megaphone, Bookmark, 
  Activity, BookX, Crown, Sparkles, CheckCircle2, AlertCircle, 
  Layers, BarChart2, Filter, Search, ArrowUpRight, Compass, ShieldCheck, Trophy
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import BookmarkList from './BookmarkList';
import WeaknessAnalyzer from './WeaknessAnalyzer';
import MistakeNotebook from '../Academic/Mistakes/MistakeNotebook';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ProfileDashboardSkeleton from './ProfileDashboardSkeleton';
import { useAcademicSubjects } from '../../hooks/useAcademicSubjects';
import { MEDICAL_SUBJECTS_DETAILED } from '../../data/academic/medicalConfig';
import { NURSING_SUBJECTS_CONFIG } from '../../data/academic/nursingConfig';
import { mergeExamHistory } from '../../lib/examProgress';
import { toBn } from '../../lib/format';
import toast from 'react-hot-toast';

const MASTERY_ACCURACY = 70;
const MASTERY_MIN_ATTEMPTS = 3;

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

const ACCENTS = {
  indigo: { grad: 'from-indigo-500 to-violet-500', glow: 'shadow-indigo-500/25', text: 'text-indigo-400' },
  emerald: { grad: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/25', text: 'text-emerald-400' },
  amber: { grad: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/25', text: 'text-amber-400' },
  fuchsia: { grad: 'from-fuchsia-500 to-pink-500', glow: 'shadow-fuchsia-500/25', text: 'text-fuchsia-400' },
  rose: { grad: 'from-rose-500 to-orange-500', glow: 'shadow-rose-500/25', text: 'text-rose-400' },
  slate: { grad: 'from-slate-500 to-slate-600', glow: 'shadow-slate-500/20', text: 'text-slate-400' },
};

const SectionHeader = ({ icon: Icon, title, subtitle, accent = 'indigo', className = '' }) => {
  const a = ACCENTS[accent] || ACCENTS.indigo;
  return (
    <div className={`mb-6 flex items-start gap-3 border-b border-white/[0.06] pb-4 ${className}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${a.grad} shadow-lg ${a.glow}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
};

export default function ProfileDashboard() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const { data: allSubjects = [] } = useAcademicSubjects();
  
  const initialTab = searchParams.get('tab') || location.state?.tab || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab') || location.state?.tab;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams, location.state]);

  const [openChapterSubject, setOpenChapterSubject] = useState(null);
  const [historySubjectFilter, setHistorySubjectFilter] = useState('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: '', educationLevel: 'HSC', target: '', examDate: '',
    photoURL: '', streak: 0, lastVisit: '', todos: [], xp: 0,
    examHistory: [], questionsBySubject: {}, lastDailyChallenge: null,
    chapterStats: {}, completedChapters: {}, isPremium: false, plan: 'free',
  });

  // Dynamic admin settings query
  const { data: adminData } = useQuery({
    queryKey: ['profile_admin_data'],
    queryFn: async () => {
      const [quotesSnap, annSnap, levelsSnap] = await Promise.all([
        getDoc(doc(db, 'admin_settings', 'quotes')),
        getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))),
        getDoc(doc(db, 'admin_settings', 'gamification')),
      ]);

      return {
        quotes: quotesSnap.exists() ? quotesSnap.data().list || [] : [],
        announcements: annSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        levels: levelsSnap.exists() && levelsSnap.data().levels ? levelsSnap.data().levels : [
          { id: 'level_1', icon: '🌱', label: 'Novice', minXp: 0, desc: 'নতুন শুরু করেছ' }
        ]
      };
    },
    staleTime: 1000 * 60 * 60
  });

  const dynamicQuotes = adminData?.quotes || [];
  const dynamicAnnouncements = adminData?.announcements || [];
  const dynamicLevels = adminData?.levels || [{ id: 'level_1', icon: '🌱', label: 'Novice', minXp: 0, desc: 'নতুন শুরু করেছ' }];

  const getLevelInfo = (xpVal = 0) => {
    const sortedLevels = [...dynamicLevels].sort((a, b) => a.minXp - b.minXp);
    for (let i = sortedLevels.length - 1; i >= 0; i--) {
      if (xpVal >= sortedLevels[i].minXp) {
        const cur = sortedLevels[i];
        const next = sortedLevels[i + 1] || null;
        const progressInLevel = xpVal - cur.minXp;
        const levelRange = next ? next.minXp - cur.minXp : 1;
        const progressPct = next ? Math.min((progressInLevel / levelRange) * 100, 100) : 100;
        const xpToNext = next ? next.minXp - xpVal : 0;
        return {
          level: i + 1, title: cur.label, emoji: cur.icon, minXP: cur.minXp,
          color: 'from-indigo-400 to-purple-400', next, progressInLevel, levelRange, progressPct, xpToNext
        };
      }
    }
    return { level: 1, title: 'Novice', emoji: '🌱', minXP: 0, progressPct: 0, xpToNext: 100, color: 'from-slate-400 to-slate-500' };
  };

  const examHistory = profileData.examHistory || [];
  const totalExams = examHistory.length;
  const totalCorrect = examHistory.reduce((s, e) => s + (e.correct || 0), 0);
  const totalQuestionsSolved = examHistory.reduce((s, e) => s + (e.totalQuestions || 0), 0);
  const avgMarks = totalExams > 0
    ? Math.round(examHistory.reduce((s, e) => s + (e.percentage || 0), 0) / totalExams) : 0;
  const xp = profileData.xp || 0;
  const levelInfo = getLevelInfo(xp);

  const today = new Date().toDateString();
  const isPremiumUser = Boolean(profileData.isPremium || profileData.plan === 'premium');

  const currentLevel = profileData.educationLevel || 'HSC';

  const availableSubjects = useMemo(() => {
    if (currentLevel === 'Admission') {
      const fromDb = allSubjects.filter(s => s.level === 'Admission');
      if (fromDb.length > 0) return fromDb;

      // Admission subjects fallback mapping with chapters
      return [
        {
          id: 'admission-biology',
          label: 'জীববিজ্ঞান (উদ্ভিদবিজ্ঞান ও প্রাণিবিজ্ঞান)',
          emoji: '🧬',
          level: 'Admission',
          chapters: MEDICAL_SUBJECTS_DETAILED.find(s => s.id === 'biology')?.chapters || []
        },
        {
          id: 'admission-chemistry',
          label: 'রসায়ন (১ম ও ২য় পত্র)',
          emoji: '⚗️',
          level: 'Admission',
          chapters: MEDICAL_SUBJECTS_DETAILED.find(s => s.id === 'chemistry')?.chapters || []
        },
        {
          id: 'admission-physics',
          label: 'পদার্থবিজ্ঞান (১ম ও ২য় পত্র)',
          emoji: '⚡',
          level: 'Admission',
          chapters: MEDICAL_SUBJECTS_DETAILED.find(s => s.id === 'physics')?.chapters || []
        },
        {
          id: 'admission-gk',
          label: 'সাধারণ জ্ঞান ও বাংলাদেশ বিষয়াবলী',
          emoji: '🌍',
          level: 'Admission',
          chapters: MEDICAL_SUBJECTS_DETAILED.find(s => s.id === 'gk')?.chapters || []
        },
        {
          id: 'admission-english',
          label: 'English Vocabulary & Grammar',
          emoji: '📖',
          level: 'Admission',
          chapters: MEDICAL_SUBJECTS_DETAILED.find(s => s.id === 'english')?.chapters || []
        },
      ];
    }

    return allSubjects.filter(s => s.level === currentLevel);
  }, [allSubjects, currentLevel]);

  // Overall readiness index (based on completed chapters & average score)
  const readinessScore = useMemo(() => {
    let totalChapters = 0;
    let completedChaptersCount = 0;
    availableSubjects.forEach(s => {
      totalChapters += (s.chapters?.length || 0);
      const done = profileData.completedChapters?.[s.id] || [];
      completedChaptersCount += done.length;
    });

    const syllabusPct = totalChapters > 0 ? (completedChaptersCount / totalChapters) * 100 : 0;
    if (totalExams === 0) return Math.min(Math.round(syllabusPct * 0.5), 100);
    return Math.min(Math.round(syllabusPct * 0.4 + avgMarks * 0.6), 100);
  }, [availableSubjects, profileData.completedChapters, totalExams, avgMarks]);

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
          subjectId: subId,
          chapterId: chId,
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
    : { text: "সাফল্য রাতারাতি আসে না, প্রতিদিনের নিয়মিত প্রচেষ্টাই গড়ে তোলে সাফল্য।", author: "অ্যাকাডেমিক হাব" };

  // Fetch profile
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

          let historyDocs = [];
          try {
            const historySnap = await getDocs(collection(db, 'users', currentUser.uid, 'exam_history'));
            historyDocs = historySnap.docs.map((d) => d.data());
          } catch (err) {
            console.error('Failed to fetch subcollection exam history:', err);
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
  }, [currentUser, queryClient, today]);

  useEffect(() => {
    if (currentUser && !loading) {
      queryClient.setQueryData(['userProfile', currentUser.uid], profileData);
    }
  }, [profileData, currentUser, loading, queryClient]);

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: profileData.name || '',
        target: profileData.target || '',
        educationLevel: profileData.educationLevel || 'HSC',
        examDate: profileData.examDate || '',
      }, { merge: true });
      toast.success('প্রোফাইল সফলভাবে আপডেট হয়েছে! ✅');
      setSuccessMsg('প্রোফাইল সফলভাবে আপডেট হয়েছে! ✅');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { 
      console.error(err);
      toast.error('প্রোফাইল সেভ করা যায়নি।');
    } finally { 
      setSaving(false); 
    }
  };

  /**
   * শ্রেণি/পর্যায় বদলানো — ড্যাশবোর্ডের কুইক সুইচার ও সেটিংসের সিলেক্ট, দুই
   * জায়গা থেকেই ডাকা হয়। ফাংশনটা কখনো লেখাই হয়নি, ফলে ক্লিক করলেই
   * `ReferenceError: handleLevelChange is not defined` হতো এবং শিক্ষার্থী
   * শ্রেণি বদলাতেই পারত না। সেভ ব্যর্থ হলে আগের মানে ফিরিয়ে দেওয়া হয়।
   */
  const handleLevelChange = async (level) => {
    if (!level || level === profileData.educationLevel) return;
    const previous = profileData.educationLevel;
    setProfileData((prev) => ({ ...prev, educationLevel: level }));
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { educationLevel: level },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
      setProfileData((prev) => ({ ...prev, educationLevel: previous }));
      toast.error('শ্রেণি পরিবর্তন সেভ করা যায়নি।');
    }
  };

  // Image upload — ImgBB (এই প্রজেক্টে Firebase Storage প্রভিশন করা নেই)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const invalid = validateImageFile(file);
    if (invalid) {
      toast.error(invalid);
      e.target.value = '';
      return;
    }
    setImageUploading(true);
    try {
      const url = await uploadImage(file);
      await updateProfile(currentUser, { photoURL: url });
      await setDoc(doc(db, 'users', currentUser.uid), { photoURL: url }, { merge: true });
      setProfileData(prev => ({ ...prev, photoURL: url }));
      toast.success('প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে! 🎉');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      e.target.value = '';
      setImageUploading(false);
    }
  };

  // Todo helpers
  const [newTodo, setNewTodo] = useState('');
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const updated = [...(profileData.todos || []), { id: Date.now(), text: newTodo.trim(), done: false }];
    setProfileData(prev => ({ ...prev, todos: updated }));
    setNewTodo('');
    await setDoc(doc(db, 'users', currentUser.uid), { todos: updated }, { merge: true });
  };
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

  // Chapter completion toggle
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
      toast.success(isDone ? 'পড়া বাকি হিসেবে চিহ্নিত' : 'অধ্যায়টি সম্পন্ন হিসেবে চিহ্নিত! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('সেভ করা যায়নি, আবার চেষ্টা করো।');
      setProfileData((prev) => ({
        ...prev,
        completedChapters: { ...(prev.completedChapters || {}), [subjectId]: list },
      }));
    }
  };

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

  const countdown = profileData.examDate
    ? Math.ceil((new Date(profileData.examDate) - new Date()) / 86400000) : null;

  // Filtered Exam History
  const filteredExamHistory = useMemo(() => {
    return [...examHistory].reverse().filter(exam => {
      const matchSub = historySubjectFilter === 'all' || exam.subject === historySubjectFilter || exam.subjectTitle?.includes(historySubjectFilter);
      const matchSearch = !historySearchQuery || exam.subjectTitle?.toLowerCase().includes(historySearchQuery.toLowerCase());
      return matchSub && matchSearch;
    });
  }, [examHistory, historySubjectFilter, historySearchQuery]);

  // Chart datasets
  const scoreTrendData = useMemo(() => {
    return [...examHistory].slice(-15).map((e, idx) => ({
      examName: e.subjectTitle ? (e.subjectTitle.length > 8 ? e.subjectTitle.slice(0, 8) + '…' : e.subjectTitle) : `Exam #${idx + 1}`,
      percentage: e.percentage || 0,
      fullTitle: e.subjectTitle || 'মডেল টেস্ট',
      date: e.date ? new Date(e.date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' }) : `টেস্ট ${idx + 1}`
    }));
  }, [examHistory]);

  const subjectAccuracyData = useMemo(() => {
    const map = {};
    examHistory.forEach(e => {
      const key = e.subjectTitle || 'সাধারণ';
      if (!map[key]) map[key] = { subject: key, correct: 0, total: 0 };
      map[key].correct += (e.correct || 0);
      map[key].total += (e.totalQuestions || 0);
    });
    return Object.values(map)
      .map(s => ({
        subject: s.subject.length > 12 ? s.subject.slice(0, 12) + '…' : s.subject,
        accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        total: s.total,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 6);
  }, [examHistory]);

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
    { id: 'history', label: 'পরীক্ষার ইতিহাস', icon: History, count: totalExams },
    { id: 'mistakes', label: 'ভুলের খাতা', icon: BookX },
    { id: 'graph', label: 'অ্যানালিটিক্স', icon: TrendingUp },
    { id: 'progress', label: 'সিলেবাস ও প্রগ্রেস', icon: BookOpen },
    { id: 'todos', label: 'স্টাডি প্ল্যানার', icon: ClipboardList, count: profileData.todos?.filter(t => !t.done).length || null },
    { id: 'badges', label: 'অর্জন ও ব্যাজ', icon: Award },
    { id: 'analyzer', label: 'দুর্বলতা অ্যানালাইজার', icon: Activity },
    { id: 'bookmarks', label: 'বুকমার্কস', icon: Bookmark },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  if (loading) return <ProfileDashboardSkeleton />;
  const photoSrc = profileData.photoURL || currentUser?.photoURL;

  return (
    <div className="relative mx-auto w-full min-h-screen max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 font-bangla">

      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-16 left-1/4 h-80 w-80 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-52 right-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />

      <div className="relative space-y-6">

        {/* ── Daily Motivation Quote ────────────────────────────────────── */}
        <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-white/[0.02] to-transparent p-4 backdrop-blur-xl">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
            <Quote className="h-4 w-4 text-indigo-300" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-200 text-xs sm:text-sm italic leading-relaxed">"{quote.text}"</p>
            <p className="text-indigo-400 text-[11px] font-semibold mt-1">— {quote.author}</p>
          </div>
        </div>

        {/* ── Announcements ────────────────────────────────────────────── */}
        {dynamicAnnouncements.filter(a => a.active).map(a => (
          <div key={a.id} className={`relative overflow-hidden flex items-start gap-4 rounded-2xl border px-5 py-4 shadow-lg backdrop-blur-xl ${
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
              <p className="text-slate-300 text-xs sm:text-sm whitespace-pre-wrap">{a.message}</p>
            </div>
          </div>
        ))}

        {/* ── Academic Level Switcher Bar ─────────────────────────────── */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-slate-200 block">তোমার বর্তমান পড়াশোনার স্তর:</span>
              <span className="text-[11px] text-slate-400">লেভেল অনুযায়ী তোমার প্রোফাইল, বিষয়, সিলেবাস ও প্রশ্নব্যাংক পরিবর্তিত হবে</span>
            </div>
          </div>

          {/* 3-Level Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800/90 w-full sm:w-auto">
            {[
              { id: 'SSC', label: '🏫 এসএসসি (SSC)', desc: '৯ম-১০ম শ্রেণি' },
              { id: 'HSC', label: '🎓 এইচএসসি (HSC)', desc: '১১শ-১২শ শ্রেণি' },
              { id: 'Admission', label: '🩺 ভর্তি পরীক্ষা (Admission)', desc: 'মেডিকেল/ভার্সিটি/নার্সিং' },
            ].map(lvl => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelChange(lvl.id)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  profileData.educationLevel === lvl.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Modern Hero Profile Card ──────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7 backdrop-blur-2xl shadow-xl space-y-6">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
            
            {/* Left: Avatar & Identity */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left min-w-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="প্রোফাইল ছবি পরিবর্তন করুন"
                className="group relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 cursor-pointer rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-[3px] shadow-lg shadow-indigo-500/20 transition-transform active:scale-95"
              >
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0b0f19] ring-2 ring-[#0b0f19]">
                  {photoSrc ? (
                    <img src={photoSrc} alt="Profile" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-slate-400" />
                  )}
                  <div className="absolute inset-0 hidden flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                    {imageUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                      <>
                        <Camera className="mb-1 h-5 w-5 text-white" />
                        <span className="text-[10px] font-semibold text-white">ছবি পরিবর্তন</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={`absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-sm shadow-lg border-2 border-[#0b0f19]`}>
                  {levelInfo.emoji}
                </div>
              </button>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white truncate">
                    {profileData.name || 'শিক্ষার্থী'}
                  </h1>
                  {isPremiumUser ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-sm">
                      <Crown className="w-3.5 h-3.5 text-amber-400" /> PRO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium">
                      Free Member
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                    {levelInfo.emoji} লেভেল {toBn(levelInfo.level)} · {levelInfo.title}
                  </span>
                </div>

                <p className="flex items-center justify-center sm:justify-start gap-1.5 text-xs sm:text-sm text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{currentUser?.email}</span>
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 pt-1">
                  <span className="flex items-center gap-1 rounded-lg border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-300">
                    <GraduationCap className="h-3.5 w-3.5" /> 
                    {profileData.educationLevel === 'SSC' ? 'এসএসসি (SSC 9-10)' : 
                     profileData.educationLevel === 'Admission' ? 'ভর্তি প্রস্তুতি (Admission)' : 
                     'এইচএসসি (HSC 11-12)'}
                  </span>
                  {profileData.target && (
                    <span className="flex items-center gap-1 rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/10 px-2.5 py-1 text-xs font-bold text-fuchsia-300">
                      <Target className="h-3.5 w-3.5" /> টার্গেট: {profileData.target}
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-lg border border-orange-400/20 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-300">
                    <Flame className="h-3.5 w-3.5 text-orange-400" /> {toBn(profileData.streak || 1)} দিনের স্ট্রিক
                  </span>
                </div>
              </div>
            </div>

            {/* Right: XP & Countdown Panel */}
            <div className="w-full lg:w-72 shrink-0 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">মোট অভিজ্ঞতা</span>
                <span className="text-sm font-black bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {toBn(xp)} <span className="text-[11px] font-bold text-slate-500">XP</span>
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 shadow-[0_0_12px_rgba(129,140,248,0.5)] transition-all duration-700"
                  style={{ width: `${Math.max(levelInfo.progressPct, 4)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{levelInfo.title}</span>
                <span>{levelInfo.next ? `আর ${toBn(levelInfo.xpToNext)} XP বাকি` : 'Max Level'}</span>
              </div>

              {countdown !== null && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold">
                    <CalendarClock className="w-3.5 h-3.5 text-rose-400" />
                    <span>টার্গেট পরীক্ষা</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-black">
                    {countdown > 0 ? `${toBn(countdown)} দিন বাকি` : 'আজ পরীক্ষা!'}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Tailored Quick Action Bar based on Level */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {profileData.educationLevel === 'SSC' && (
                <>
                  <Link
                    to="/academic/ssc"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>এসএসসি ড্যাশবোর্ড</span>
                  </Link>
                  <Link
                    to="/academic/question-builder"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>প্রশ্ন জাদুকর</span>
                  </Link>
                  <Link
                    to="/academic/question-bank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>বোর্ড প্রশ্নব্যাংক</span>
                  </Link>
                </>
              )}

              {profileData.educationLevel === 'HSC' && (
                <>
                  <Link
                    to="/academic/hsc"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>এইচএসসি ড্যাশবোর্ড</span>
                  </Link>
                  <Link
                    to="/academic/formula-sheet"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>ফর্মুলা ও শর্টকাট</span>
                  </Link>
                  <Link
                    to="/academic/question-bank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>বোর্ড প্রশ্নব্যাংক</span>
                  </Link>
                </>
              )}

              {profileData.educationLevel === 'Admission' && (
                <>
                  <Link
                    to="/academic/admission/medical"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>মেডিকেল হাব</span>
                  </Link>
                  <Link
                    to="/academic/admission/nursing"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>নার্সিং হাব</span>
                  </Link>
                  <Link
                    to="/academic/admission/question-bank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>বিগত ২০ বছরের প্রশ্ন</span>
                  </Link>
                  <Link
                    to="/academic/admission/exam-schedule"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>ভর্তি রুটিন</span>
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('mistakes')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
              >
                <BookX className="w-3.5 h-3.5" />
                <span>ভুলের খাতা</span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('settings')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" /> সেটিংস
            </button>
          </div>

        </div>

        {/* ── Key Stats Ribbon ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'মোট পরীক্ষা', value: toBn(totalExams), icon: ClipboardList, color: 'from-blue-500 to-indigo-600' },
            { label: 'সঠিক উত্তর', value: toBn(totalCorrect), icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
            { label: 'গড় মার্কস', value: `${toBn(avgMarks)}%`, icon: Zap, color: 'from-amber-500 to-orange-500' },
            { label: 'প্রস্তুতি সূচক', value: `${toBn(readinessScore)}%`, icon: Star, color: 'from-purple-500 to-fuchsia-600' },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.08] bg-slate-900/40 backdrop-blur-xl">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} shadow-lg shadow-black/20`}>
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-black leading-tight text-white">{s.value}</p>
                <p className="truncate text-xs font-medium text-slate-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Navigation Tabs & Content Layout ─────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-600/25 text-white border border-indigo-500/40 shadow-md'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <tab.icon className={`h-4 w-4 shrink-0 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.count !== undefined && tab.count !== null && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {toBn(tab.count)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Panels */}
          <div className="flex-1 min-w-0">
            <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 sm:p-7 min-h-[450px] shadow-xl">

              {/* ── 1. Overview Tab ────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <SectionHeader 
                    icon={LayoutDashboard} 
                    title="প্রোফাইল ওভারভিউ" 
                    subtitle="তোমার দৈনন্দিন পড়ার ধারাবাহিকতা, প্রস্তুতি সূচক ও সাম্প্রতিক পারফরম্যান্স।" 
                    accent="indigo" 
                  />

                  {/* Readiness Progress Meter */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/50 border border-indigo-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-bold text-white text-sm sm:text-base">পরীক্ষার সামগ্রিক প্রস্তুতি সূচক</h3>
                      </div>
                      <span className="text-lg font-black text-indigo-300">{toBn(readinessScore)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-950 ring-1 ring-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 shadow-sm"
                        style={{ width: `${Math.max(readinessScore, 5)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {readinessScore >= 80 ? '🎉 চমৎকার প্রস্তুতি! রিভিশন ও নিয়মিত মডেল টেস্ট চালিয়ে যাও।' :
                       readinessScore >= 50 ? '👍 ভালো অগ্রগতি হচ্ছে। যেসব অধ্যায়ে দুর্বলতা আছে সেগুলোতে মনোযোগ দাও।' :
                       '🌱 প্রস্তুতি শুরু হয়েছে। প্রতিদিন রুটিন করে অধ্যায়গুলো পড়া শেষ করো ও টেস্ট দাও।'}
                    </p>
                  </div>

                  {/* Habit / Streak Grid */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-400" />
                        <h3 className="font-bold text-white text-sm">পড়ার ধারাবাহিকতা ও স্ট্রিক</h3>
                      </div>
                      <span className="font-black text-orange-300 text-sm">{toBn(profileData.streak || 1)} দিন 🔥</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-6 w-6 rounded-lg transition-all ${
                            i < (profileData.streak || 1) 
                              ? 'bg-gradient-to-br from-orange-400 to-amber-500 shadow-sm shadow-orange-500/30' 
                              : 'bg-white/5 border border-white/5'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">প্রতিদিন অন্তত ১টি টেস্ট দিলে স্ট্রিক বজায় থাকে</p>
                  </div>

                  {/* Recent 3 Exams */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <History className="h-4 w-4 text-indigo-400" /> সাম্প্রতিক পরীক্ষা
                      </h3>
                      <button 
                        onClick={() => setActiveTab('history')} 
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                      >
                        সবগুলো ইতিহাস দেখুন <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {examHistory.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {[...examHistory].reverse().slice(0, 3).map((exam, i) => (
                          <div key={i} className="py-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                exam.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
                                exam.percentage >= 50 ? 'bg-amber-500/15 text-amber-400' :
                                'bg-rose-500/15 text-rose-400'
                              }`}>
                                {exam.percentage}%
                              </div>
                              <div className="min-w-0">
                                <p className="text-slate-200 text-sm font-semibold truncate">{exam.subjectTitle}</p>
                                <p className="text-slate-500 text-xs">{new Date(exam.date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 font-bold shrink-0">
                              {toBn(exam.correct)}/{toBn(exam.totalQuestions)} সঠিক
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400 text-xs">এখনও কোনো পরীক্ষা দেওয়া হয়নি।</p>
                        <Link to="/academic/model-test" className="inline-flex items-center gap-1 mt-3 text-indigo-400 text-xs font-bold">
                          প্রথম টেস্ট শুরু করুন <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── 2. Exam History Tab ────────────────────────────────── */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <SectionHeader 
                    icon={History} 
                    title="পরীক্ষার সম্পূর্ণ হিস্ট্রি" 
                    subtitle="তোমার দেওয়া সকল মডেল টেস্ট ও লাইভ পরীক্ষার রেকর্ড।" 
                    accent="indigo" 
                  />

                  {/* Filter & Search */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder="পরীক্ষার নাম খুঁজুন..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {filteredExamHistory.length === 0 ? (
                    <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                      <History className="h-10 w-10 text-slate-600 mx-auto" />
                      <p className="text-slate-400 text-sm">কোনো পরীক্ষার রেকর্ড পাওয়া যায়নি।</p>
                      <Link 
                        to="/academic/model-test" 
                        className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg"
                      >
                        নতুন পরীক্ষা শুরু করুন <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      {filteredExamHistory.map((exam, i) => (
                        <div key={exam.id || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-white/[0.02] transition">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                              exam.percentage >= 80 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                              exam.percentage >= 50 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                              'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {exam.percentage}%
                            </div>
                            <div className="min-w-0">
                              <p className="text-slate-100 font-bold text-sm truncate">{exam.subjectTitle || 'মডেল টেস্ট'}</p>
                              <p className="text-slate-500 text-xs mt-0.5">
                                {new Date(exam.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                            <div className="flex flex-col items-center">
                              <span className="text-emerald-400 font-black">{toBn(exam.correct)}</span>
                              <span className="text-slate-500 text-[10px]">সঠিক</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-rose-400 font-black">{toBn(exam.wrong || 0)}</span>
                              <span className="text-slate-500 text-[10px]">ভুল</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-slate-300 font-black">{toBn(exam.totalQuestions)}</span>
                              <span className="text-slate-500 text-[10px]">মোট</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── 3. Mistake Notebook Tab ────────────────────────────── */}
              {activeTab === 'mistakes' && (
                <div>
                  <SectionHeader 
                    icon={BookX} 
                    title="ভুলের খাতা (Mistake Notebook)" 
                    subtitle="মডেল টেস্ট ও পরীক্ষায় যে প্রশ্নগুলো ভুল হয়েছিল, সেগুলো বারবার রিভিশন দিয়ে প্রস্তুতি নিখুঁত করো।" 
                    accent="rose" 
                  />
                  <MistakeNotebook />
                </div>
              )}

              {/* ── 4. Analytics & Graphs Tab ──────────────────────────── */}
              {activeTab === 'graph' && (
                <div className="space-y-6">
                  <SectionHeader 
                    icon={TrendingUp} 
                    title="পারফরম্যান্স গ্রাফ ও অ্যানালিটিক্স" 
                    subtitle="পরীক্ষায় তোমার স্কোরের উন্নতি এবং বিষয়ভিত্তিক নির্ভুলতার চিত্র।" 
                    accent="emerald" 
                  />

                  {/* Score Progression Area Chart */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                    <h3 className="font-bold text-white text-sm">স্কোর প্রগ্রেস ট্রেন্ড (সর্বশেষ ১৫টি পরীক্ষা)</h3>
                    {scoreTrendData.length > 0 ? (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                            <defs>
                              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="percentage" name="মার্কস %" stroke="#10b981" strokeWidth={2.5} fill="url(#scoreGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-xs text-center py-8">গ্রাফের জন্য পর্যাপ্ত পরীক্ষার ডেটা নেই।</p>
                    )}
                  </div>

                  {/* Subject-wise Accuracy Bar Chart */}
                  {subjectAccuracyData.length > 0 && (
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                      <h3 className="font-bold text-white text-sm">বিষয়ভিত্তিক নির্ভুলতা (Accuracy %)</h3>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={subjectAccuracyData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.4} />
                            <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={90} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            />
                            <Bar dataKey="accuracy" name="নির্ভুলতা %" fill="#6366f1" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* High / Low Summary */}
                  {examHistory.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <p className="text-xl font-black text-emerald-400">{Math.max(...examHistory.map(e => e.percentage))}%</p>
                        <p className="text-slate-400 text-xs mt-0.5">সর্বোচ্চ স্কোর</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <p className="text-xl font-black text-rose-400">{Math.min(...examHistory.map(e => e.percentage))}%</p>
                        <p className="text-slate-400 text-xs mt-0.5">সর্বনিম্ন স্কোর</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                        <p className="text-xl font-black text-indigo-400">{avgMarks}%</p>
                        <p className="text-slate-400 text-xs mt-0.5">গড় নির্ভুলতা</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 5. Syllabus & Progress Tab ─────────────────────────── */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <SectionHeader 
                    icon={BookOpen} 
                    title="সিলেবাস ও অধ্যায়ভিত্তিক প্রগ্রেস" 
                    subtitle={`যেসব অধ্যায়ে ন্যূনতম ৩টি প্রশ্নে ৭০%+ মার্কস পাবে, সেগুলো "মাস্টার্ড" হিসেবে গণ্য হবে।`} 
                    accent="emerald" 
                  />

                  <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
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
                            className="flex w-full items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition"
                          >
                            <span className="flex min-w-0 items-center gap-2.5 font-bold text-slate-200">
                              <span className="shrink-0 text-xl">{sub.emoji}</span>
                              <span className="truncate text-sm sm:text-base">{sub.label}</span>
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-bold text-indigo-400">{pct}% মাস্টার্ড</span>
                              <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                            </div>
                          </button>

                          <div className="px-5 pb-3">
                            <div className="h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500" 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                              মাস্টার্ড {toBn(masteredCount)}/{toBn(chapters.length)} অধ্যায় · পড়া শেষ {toBn(readCount)}/{toBn(chapters.length)}
                            </p>
                          </div>

                          {isOpen && (
                            <div className="divide-y divide-white/5 bg-slate-950/40 border-t border-white/5">
                              {chapterRows.map((ch) => (
                                <div key={ch.id} className="flex items-center justify-between gap-3 px-5 py-3 text-xs">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => toggleChapterComplete(sub.id, ch.id)}
                                      className="shrink-0"
                                      title="পড়া শেষ হলে টিক দিন"
                                    >
                                      {ch.read ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-slate-600" />
                                      )}
                                    </button>
                                    <span className={`truncate ${ch.read ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                      {ch.name || ch.title || ch.id}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      ch.status === 'mastered' ? 'bg-emerald-500/15 text-emerald-400' :
                                      ch.status === 'weak' ? 'bg-rose-500/15 text-rose-400' :
                                      ch.status === 'needsMore' ? 'bg-amber-500/15 text-amber-400' :
                                      'bg-slate-800 text-slate-500'
                                    }`}>
                                      {ch.status === 'mastered' ? `✓ ${toBn(ch.accuracy)}%` :
                                       ch.status === 'weak' ? `${toBn(ch.accuracy)}% দুর্বল` :
                                       ch.status === 'needsMore' ? `${toBn(ch.attempted)}/${toBn(MASTERY_MIN_ATTEMPTS)}` :
                                       'টেস্ট বাকি'}
                                    </span>

                                    <Link
                                      to={`/academic/model-test?subject=${encodeURIComponent(sub.id)}&chapter=${encodeURIComponent(ch.id)}`}
                                      className="text-indigo-400 hover:text-indigo-300 font-bold p-1 hover:bg-indigo-500/10 rounded-lg transition"
                                      title="অনুশীলন করুন"
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 6. Study Planner / Todos Tab ───────────────────────── */}
              {activeTab === 'todos' && (
                <div className="space-y-6">
                  <SectionHeader 
                    icon={ClipboardList} 
                    title="দৈনিক স্টাডি প্ল্যানার ও টু-ডু" 
                    subtitle="আজকে কী কী অধ্যায় ও টপিক পড়বে তা লিখে রাখো।" 
                    accent="fuchsia" 
                  />

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newTodo} 
                      onChange={e => setNewTodo(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && addTodo()}
                      placeholder="নতুন টাস্ক বা পড়ার টপিক লিখুন..." 
                      className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500" 
                    />
                    <button 
                      onClick={addTodo} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {profileData.todos.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">কোনো টাস্ক যুক্ত করা হয়নি।</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      {profileData.todos.map(todo => (
                        <div key={todo.id} className="flex items-center gap-3 p-3.5 text-xs">
                          <button onClick={() => toggleTodo(todo.id)} className="shrink-0">
                            {todo.done ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-500 hover:text-indigo-400" />
                            )}
                          </button>
                          <span className={`flex-1 font-medium ${todo.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {todo.text}
                          </span>
                          <button onClick={() => deleteTodo(todo.id)} className="text-slate-600 hover:text-rose-400 transition">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── 7. Badges Tab ──────────────────────────────────────── */}
              {activeTab === 'badges' && (
                <div className="space-y-6">
                  <SectionHeader 
                    icon={Award} 
                    title="অর্জনের ব্যাজ ও মাইলস্টোন" 
                    subtitle="মডেল টেস্ট সম্পন্ন ও নিয়মিত প্র্যাকটিসের মাধ্যমে নতুন ব্যাজ আনলক করো।" 
                    accent="amber" 
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {getBadges().map(badge => (
                      <div 
                        key={badge.id} 
                        className={`relative rounded-2xl p-4 text-center border transition-all ${
                          badge.earned 
                            ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30 shadow-lg shadow-amber-500/5' 
                            : 'bg-white/[0.02] border-white/[0.06] opacity-40 grayscale'
                        }`}
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <p className={`text-xs font-bold mb-1 ${badge.earned ? 'text-amber-200' : 'text-slate-400'}`}>
                          {badge.label}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-snug">{badge.desc}</p>
                        {badge.earned && (
                          <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <CheckCircle className="h-3 w-3" /> অর্জিত
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 8. Weakness Analyzer Tab ───────────────────────────── */}
              {activeTab === 'analyzer' && (
                <div>
                  <SectionHeader 
                    icon={Activity} 
                    title="দুর্বলতা ও রিভিশন অ্যানালাইজার" 
                    subtitle="পরীক্ষার ডেটা বিশ্লেষণ করে যেসব অধ্যায়ে অতিরিক্ত অনুশীলন প্রয়োজন সেগুলো চিহ্নিত করা হয়েছে।" 
                    accent="indigo" 
                  />
                  <WeaknessAnalyzer chapterRows={flatChapterStats} />
                </div>
              )}

              {/* ── 9. Bookmarks Tab ───────────────────────────────────── */}
              {activeTab === 'bookmarks' && (
                <div>
                  <SectionHeader 
                    icon={Bookmark} 
                    title="আমার সেভ করা বুকমার্কস" 
                    subtitle="তোমার পছন্দের ও গুরুত্বপূর্ণ প্রশ্নগুলো এক নজরে রিভিশন করো।" 
                    accent="amber" 
                  />
                  <BookmarkList />
                </div>
              )}

              {/* ── 10. Profile Settings Tab ───────────────────────────── */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl space-y-6">
                  <SectionHeader 
                    icon={Settings} 
                    title="প্রোফাইল সেটিংস ও তথ্য" 
                    subtitle="তোমার নাম, টার্গেট প্রতিষ্ঠান ও পরীক্ষার তারিখ আপডেট করো।" 
                    accent="slate" 
                  />

                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">আপনার নাম</label>
                      <input 
                        type="text" 
                        value={profileData.name || ''} 
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500" 
                        placeholder="যেমন: Rakib Hossain" 
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300">টার্গেট প্রতিষ্ঠান (কলেজ/বিশ্ববিদ্যালয়/মেডিকেল)</label>
                        <span className="text-[11px] text-indigo-400">ক্লিক করে নির্বাচন করুন</span>
                      </div>
                      <input 
                        type="text" 
                        value={profileData.target || ''} 
                        onChange={e => setProfileData({ ...profileData, target: e.target.value })}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500" 
                        placeholder={
                          profileData.educationLevel === 'SSC' ? 'যেমন: Notre Dame College, Viqarunnisa, Dhaka College' :
                          profileData.educationLevel === 'Admission' ? 'যেমন: Dhaka Medical College (DMC), BUET, DU A, Nursing' :
                          'যেমন: BUET, Dhaka Medical College, DU A'
                        }
                      />
                      
                      {/* Interactive Presets for Selected Level */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(profileData.educationLevel === 'SSC' ? [
                          'নটর ডেম কলেজ (NDC)', 'ঢাকা কলেজ', 'ভিকারুননিসা নূন', 'হলিক্রস কলেজ', 'রাজউক উত্তরা মডেল', 'চট্টগ্রাম কলেজ'
                        ] : profileData.educationLevel === 'Admission' ? [
                          'ঢাকা মেডিকেল কলেজ (DMC)', 'সলিমুল্লাহ মেডিকেল (SSMC)', 'বুয়েট ইঞ্জিনিয়ারিং', 'ঢাবি ‘ক’ ইউনিট', 'নার্সিং (BSc/Diploma)', 'জিএসটি গুচ্ছ'
                        ] : [
                          'বুয়েট (BUET)', 'ঢাকা মেডিকেল কলেজ (DMC)', 'ঢাকা বিশ্ববিদ্যালয় (DU A)', 'সিইউইটি/রুয়েট/কুয়েট', 'শাবিপ্রবি (SUST)', 'মেডিকেল ও ডেন্টাল'
                        ]).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setProfileData({ ...profileData, target: preset })}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition ${
                              profileData.target === preset
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">বর্তমান শ্রেণি / পরীক্ষার পর্যায়</label>
                      <select 
                        value={profileData.educationLevel || 'HSC'} 
                        onChange={e => handleLevelChange(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="SSC">🏫 নবম-দশম / এসএসসি (SSC 9-10)</option>
                        <option value="HSC">🎓 একাদশ-দ্বাদশ / এইচএসসি (HSC 11-12)</option>
                        <option value="Admission">🩺 ভর্তি পরীক্ষার্থী (Admission Candidate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-indigo-400" />
                        <span>টার্গেট পরীক্ষার তারিখ (লাইভ কাউন্টডাউন)</span>
                      </label>
                      <input 
                        type="date" 
                        value={profileData.examDate || ''} 
                        onChange={e => setProfileData({ ...profileData, examDate: e.target.value })}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500" 
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
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
