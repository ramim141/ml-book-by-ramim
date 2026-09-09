import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, Database, Quote, BookOpen, Swords, LayoutDashboard, 
  Users, Star, MessageSquareWarning, Megaphone, Bell, CalendarClock, 
  ChevronRight, Activity, Lightbulb, Search, Menu, Wallet, Tag, 
  GraduationCap, PanelLeftClose, PanelLeftOpen, Settings,
  ExternalLink, Sparkles, ShieldCheck, Check
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

import AdminCommandPalette from '../../components/Admin/AdminCommandPalette';

// Lazy load modularized manager components for extreme performance & instant chunk loading
const OverviewManager = lazy(() => import('../../components/Admin/OverviewManager'));
const UserManagement = lazy(() => import('../../components/Admin/UserManagement'));
const QuestionBankManager = lazy(() => import('../../components/Admin/QuestionBankManager'));
const QuotesManager = lazy(() => import('../../components/Admin/QuotesManager'));
const SubjectsManager = lazy(() => import('../../components/Admin/SubjectsManager'));
const DailyChallengeManager = lazy(() => import('../../components/Admin/DailyChallengeManager'));
const GamificationManager = lazy(() => import('../../components/Admin/GamificationManager'));
const FeedbackManager = lazy(() => import('../../components/Admin/FeedbackManager'));
const AnnouncementManager = lazy(() => import('../../components/Admin/AnnouncementManager'));
const DatabaseMigrationHelper = lazy(() => import('./DatabaseMigrationHelper'));
const NotificationManager = lazy(() => import('../../components/Admin/NotificationManager'));
const LiveExamManager = lazy(() => import('../../components/Admin/LiveExamManager'));
const FormulaManager = lazy(() => import('../../components/Admin/FormulaManager'));
const SuggestionManager = lazy(() => import('../../components/Admin/SuggestionManager'));
const AdminActivityFeed = lazy(() => import('../../components/Admin/AdminActivityFeed'));
const PaymentManager = lazy(() => import('../../components/Admin/PaymentManager'));
const PlanManager = lazy(() => import('../../components/Admin/PlanManager'));
const AdmissionManager = lazy(() => import('../../components/Admin/AdmissionManager'));
const SiteSettingsManager = lazy(() => import('../../components/Admin/SiteSettingsManager'));

// Sleek Shadcn-style Manager Skeleton Loader
function ManagerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse font-bangla">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-zinc-800 rounded-lg" />
          <div className="h-3.5 w-72 bg-zinc-800/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-zinc-800 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-zinc-900/60 rounded-2xl border border-zinc-800/80" />
        ))}
      </div>
      <div className="h-64 bg-zinc-900/40 rounded-2xl border border-zinc-800/80" />
    </div>
  );
}

const TAB_DESCRIPTIONS = {
  overview: 'প্ল্যাটফর্মের সামগ্রিক পরিসংখ্যান, ব্যবহারকারী ও সাম্প্রতিক অবস্থা',
  admission: 'ভর্তি প্রোগ্রামসমূহ, অধ্যায়ভিত্তিক সিলেবাস ও অ্যাডমিশন কনফিগ',
  question_bank: 'কোশ্চেন ব্যাংক, এক্সেল/CSV বাল্ক আপলোড ও রিসোর্স হাব',
  live_exams: 'নির্দিষ্ট সময়সীমার লাইভ এক্সাম তৈরি ও লিডারবোর্ড',
  subjects: 'একাডেমিক বিষয় ও অধ্যায়ের কেন্দ্রীয় আর্কিটেকচার',
  users: 'নিবন্ধিত শিক্ষার্থীদের তালিকা, অগ্রগতি ও রোল ব্যবস্থাপনা',
  payments: 'ম্যানুয়াল বিকাশ ও নগদ পেমেন্ট যাচাই ও সাবস্ক্রিপশন চালু',
  plans: 'প্যাকেজের মূল্য, মেয়াদ ও প্রোমো কোড/ছাড় নিয়ন্ত্রণ',
  gamification: 'XP, স্ট্রিক, ডেইলি রেয়ার্ডস ও লেভেল রুলস',
  challenges: 'প্রতিদিনের স্পেশাল চ্যালেঞ্জ কুইজ নির্ধারণ',
  announcements: 'শিক্ষার্থীদের নোটিশ বোর্ড ও জরুরি বার্তা',
  notifications: 'নির্দিষ্ট বা সকল ব্যবহারকারীকে পুশ নোটিফিকেশন',
  quotes: 'দৈনিক মোটিভেশনাল উক্তি ও কোটস',
  formulas: 'বিষয়ভিত্তিক স্মার্ট সূত্র ও ফর্মুলা শিট',
  suggestions: 'পরীক্ষার স্পেশাল সাজেশন ও গাইডলাইন',
  settings: 'সাইট মেটাডেটা, সোশ্যাল লিংক ও জরুরি নোটিশ',
  activity_feed: 'অ্যাডমিনদের অ্যাক্টিভিটি লগ ও অডিট ট্রেইল',
  reports: 'শিক্ষার্থীদের পাঠানো প্রশ্ন ভুলের রিপোর্ট ও ফিডব্যাক',
  migration: 'ডাটাবেজ মাইগ্রেশন ও সিস্টেম ব্যাকআপ টুলস',
};

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);

  useEffect(() => {
    // Live listener for pending payments
    const paymentsQuery = query(
      collection(db, 'payment_requests'),
      where('status', '==', 'pending')
    );
    const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
      setPendingPayments(snapshot.size);
    }, (error) => {
      console.warn('Error listening to pending payments:', error);
    });

    // Live listener for pending reports
    const reportsQuery = query(
      collection(db, 'reported_errors'),
      where('status', '==', 'pending')
    );
    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      setPendingReports(snapshot.size);
    }, (error) => {
      console.warn('Error listening to pending reports:', error);
    });

    return () => {
      unsubscribePayments();
      unsubscribeReports();
    };
  }, []);
  
  // Sidebar minimize/collapse state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  const tabCategories = [
    {
      title: 'ড্যাশবোর্ড',
      tabs: [
        { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard, keywords: 'dashboard home ওভারভিউ হোম' },
      ]
    },
    {
      title: 'একাডেমিক ও কন্টেন্ট',
      tabs: [
        { id: 'admission', label: 'অ্যাডমিশন হাব', icon: GraduationCap, keywords: 'admission medical engineering varsity admission অ্যাডমিশন ভর্তি' },
        { id: 'question_bank', label: 'কোশ্চেন ব্যাংক ও আপলোড', icon: Database, keywords: 'question bank mcq cq bulk upload excel csv প্রশ্ন বাল্ক আপলোড' },
        { id: 'live_exams', label: 'লাইভ এক্সাম', icon: CalendarClock, keywords: 'live exam পরীক্ষা এক্সাম লাইভ' },
        { id: 'subjects', label: 'সাবজেক্ট আর্কিটেকচার', icon: BookOpen, keywords: 'subject chapter বিষয় অধ্যায়' },
        { id: 'formulas', label: 'স্মার্ট ফর্মুলা', icon: Sparkles, keywords: 'formula সূত্র ফর্মুলা' },
        { id: 'suggestions', label: 'সাজেশন হাব', icon: Lightbulb, keywords: 'suggestion সাজেশন' },
      ]
    },
    {
      title: 'ইউজার ও সাবস্ক্রিপশন',
      tabs: [
        { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users, keywords: 'user student ছাত্র ব্যবহারকারী' },
        { id: 'payments', label: 'পেমেন্ট ভেরিফিকেশন', icon: Wallet, keywords: 'payment bkash subscription পেমেন্ট বিকাশ সাবস্ক্রিপশন টাকা' },
        { id: 'plans', label: 'প্ল্যান ও প্রোমো কোড', icon: Tag, keywords: 'plan price coupon discount প্ল্যান দাম কুপন ছাড়' },
        { id: 'gamification', label: 'গেমিফিকেশন (XP & Badges)', icon: Star, keywords: 'xp level badge লেভেল ব্যাজ গেমিফিকেশন' },
        { id: 'challenges', label: 'ডেইলি চ্যালেঞ্জ', icon: Swords, keywords: 'daily challenge চ্যালেঞ্জ' },
      ]
    },
    {
      title: 'যোগাযোগ ও নোটিশ',
      tabs: [
        { id: 'announcements', label: 'নোটিশ বোর্ড', icon: Megaphone, keywords: 'announcement notice নোটিশ ঘোষণা' },
        { id: 'notifications', label: 'পুশ নোটিফিকেশন', icon: Bell, keywords: 'notification push নোটিফিকেশন' },
        { id: 'quotes', label: 'অনুপ্রেরণামূলক উক্তি', icon: Quote, keywords: 'quote উক্তি কোট' },
      ]
    },
    {
      title: 'সিস্টেম ও কনফিগারেশন',
      tabs: [
        { id: 'settings', label: 'সাইট ও ডেভেলপার সেটিংস', icon: Settings, keywords: 'settings developer site social footer contact সেটিংস ডেভেলপার' },
        { id: 'reports', label: 'রিপোর্ট ও ফিডব্যাক', icon: MessageSquareWarning, keywords: 'report feedback রিপোর্ট ফিডব্যাক' },
        { id: 'activity_feed', label: 'অ্যাক্টিভিটি লগ', icon: Activity, keywords: 'activity log অ্যাক্টিভিটি লগ' },
        { id: 'migration', label: 'ডাটাবেজ মাইগ্রেশন', icon: Database, keywords: 'migration data ডাটা মাইগ্রেশন' },
      ]
    }
  ];

  const allTabs = useMemo(
    () => tabCategories.flatMap((c) => c.tabs.map((t) => ({ ...t, category: c.title }))),
    []
  );

  const requestedTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (requestedTab === 'bulk_upload') return 'question_bank';
    return allTabs.some((t) => t.id === requestedTab) ? requestedTab : 'overview';
  }, [requestedTab, allTabs]);

  const setActiveTab = useCallback((id) => {
    setSearchParams(id === 'overview' ? {} : { tab: id });
    setMobileNavOpen(false);
  }, [setSearchParams]);

  // Global Shortcut Ctrl/⌘ + K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeTabInfo = allTabs.find((t) => t.id === activeTab);
  const getActiveTabTitle = () => activeTabInfo?.label || '';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-bangla pb-16 selection:bg-zinc-800">
      
      {/* ── Sleek Minimalist Topbar ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Brand, Sidebar Toggle & System Status */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-zinc-100 transition-all duration-200"
                title={sidebarCollapsed ? 'সাইডবার প্রসারিত করুন' : 'সাইডবার মিনিমাইজ করুন'}
                aria-label="Toggle Sidebar"
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4.5 w-4.5 text-zinc-300" />
                ) : (
                  <PanelLeftClose className="h-4.5 w-4.5 text-zinc-400" />
                )}
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 shadow-inner">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                      অ্যাডমিন কনসোল
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      লাইভ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Command Search */}
              <button
                onClick={() => setPaletteOpen(true)}
                title="ট্যাব বা কমান্ড খুঁজুন (Ctrl+K)"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:text-zinc-200"
              >
                <Search className="h-3.5 w-3.5 text-zinc-500" />
                <span className="hidden md:inline font-medium">কমান্ড খুঁজুন...</span>
                <kbd className="hidden rounded bg-zinc-850 border border-zinc-800 px-1.5 py-0.5 font-sans text-[9px] text-zinc-500 md:inline font-mono tracking-wide">
                  Ctrl+K
                </kbd>
              </button>

              {/* View Main Site */}
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-200"
                title="মূল ওয়েবসাইট দেখুন"
              >
                <span>ওয়েবসাইট</span>
                <ExternalLink className="h-3 w-3 text-zinc-500" />
              </Link>

              {/* Profile & Logout Group */}
              <div className="flex items-center gap-2.5 pl-2.5 border-l border-zinc-800/80">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Admin"
                    className="w-8 h-8 rounded-xl object-cover border border-zinc-800 hover:border-zinc-700 transition"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-750 flex items-center justify-center text-zinc-300 font-bold text-xs tracking-wider">
                    {currentUser?.displayName?.charAt(0) || 'A'}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-all duration-200 hover:border-rose-500/30 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95"
                  title="লগআউট"
                >
                  <LogOut className="h-3.5 w-3.5 text-zinc-500 hover:text-rose-400" />
                  <span className="hidden md:inline">লগআউট</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── Main Workspace Layout ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        
        {/* Mobile Navigation Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-expanded={mobileNavOpen}
          className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md p-3 text-left lg:hidden hover:border-zinc-750 transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {activeTabInfo?.icon && (
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 shrink-0">
                <activeTabInfo.icon className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-500 font-semibold block uppercase tracking-wider leading-tight">বর্তমান ট্যাব</span>
              <span className="text-xs font-semibold text-zinc-200 truncate block mt-0.5">
                {getActiveTabTitle()}
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-700">
            {mobileNavOpen ? 'বন্ধ করুন' : 'মেন্যু তালিকা'}
          </div>
        </button>

        {/* Mobile Menu Grid (Collapsible) */}
        {mobileNavOpen && (
          <div className="mb-6 space-y-4 lg:hidden p-3.5 rounded-2xl bg-zinc-900/90 backdrop-blur-lg border border-zinc-800 shadow-xl max-h-[70vh] overflow-y-auto">
            {tabCategories.map((category, idx) => (
              <div key={idx} className="space-y-1.5 pb-2.5 border-b border-zinc-800/60 last:border-0 last:pb-0 last:border-b-0">
                <h3 className="px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {category.title}
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {category.tabs.map(tab => {
                    const on = activeTab === tab.id;
                    let badgeCount = 0;
                    if (tab.id === 'payments') badgeCount = pendingPayments;
                    if (tab.id === 'reports') badgeCount = pendingReports;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                          on
                            ? 'bg-zinc-850 text-white font-semibold border border-zinc-700'
                            : 'bg-zinc-950/40 text-zinc-400 border border-zinc-900 hover:bg-zinc-850 hover:text-zinc-250'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <tab.icon className={`h-4 w-4 shrink-0 ${on ? 'text-zinc-100' : 'text-zinc-550'}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {badgeCount > 0 && (
                          <span className="shrink-0 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white leading-none">
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desktop 2-Column Sidebar + Content Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-5 lg:gap-6">
          
          {/* ── Sleek Minimalist Sidebar ────────────────────────────────────── */}
          <aside className={`shrink-0 hidden lg:block transition-all duration-300 sticky top-20 ${
            sidebarCollapsed ? 'w-[72px]' : 'w-64'
          }`}>
            <div className="p-2.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto shadow-lg no-scrollbar">
              {tabCategories.map((category, idx) => (
                <div key={idx} className="space-y-1">
                  {!sidebarCollapsed ? (
                    <h3 className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                      <span>{category.title}</span>
                      <span className="text-[9px] font-mono font-semibold px-1 py-0.5 rounded bg-zinc-950 text-zinc-650 border border-zinc-850">{category.tabs.length}</span>
                    </h3>
                  ) : (
                    idx > 0 && <div className="my-2.5 border-t border-zinc-800/60" />
                  )}

                  <div className="space-y-0.5">
                    {category.tabs.map(tab => {
                      const on = activeTab === tab.id;
                      let badgeCount = 0;
                      if (tab.id === 'payments') badgeCount = pendingPayments;
                      if (tab.id === 'reports') badgeCount = pendingReports;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`group relative flex w-full items-center rounded-xl text-xs font-medium transition-all duration-200 ${
                            sidebarCollapsed 
                              ? 'justify-center p-2.5' 
                              : 'gap-2.5 px-3 py-2 border border-transparent'
                          } ${
                            on
                              ? 'bg-zinc-800/80 text-white font-semibold border-zinc-700/65 shadow-md shadow-black/10'
                              : 'text-zinc-400 hover:text-zinc-105 hover:bg-zinc-800/35 border-transparent'
                          }`}
                        >
                          <tab.icon className={`h-4 w-4 shrink-0 transition-colors ${
                            on 
                              ? 'text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.45)]' 
                              : 'text-zinc-500 group-hover:text-zinc-350'
                          }`} />
                          
                          {!sidebarCollapsed && (
                            <span className="truncate">{tab.label}</span>
                          )}

                          {/* Desktop Badge Count */}
                          {badgeCount > 0 && (
                            sidebarCollapsed ? (
                              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white ring-2 ring-zinc-900 leading-none">
                                {badgeCount}
                              </span>
                            ) : (
                              <span className="ml-auto shrink-0 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white leading-none">
                                {badgeCount}
                              </span>
                            )
                          )}

                          {/* Hover Tooltip when collapsed */}
                          {sidebarCollapsed && (
                            <div className="absolute left-full ml-3 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-200 text-[11px] rounded-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[60] shadow-xl">
                              {tab.label}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main Content Work Surface ──────────────────────────────────── */}
          <main className="flex-1 min-w-0 w-full">
            {/* Global Input & Surface Styles (Global Theme Injection) */}
            <style>{`
              /* Slim custom scrollbars */
              ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
              }
              ::-webkit-scrollbar-track {
                background: transparent;
              }
              ::-webkit-scrollbar-thumb {
                background: #27272a;
                border-radius: 9999px;
              }
              ::-webkit-scrollbar-thumb:hover {
                background: #3f3f46;
              }

              /* Unified Input & Forms Styling */
              .admin-surface input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]),
              .admin-surface select,
              .admin-surface textarea {
                width: 100% !important;
                display: block !important;
                box-sizing: border-box !important;
                background-color: #0c0c0e !important;
                border: 1px solid #27272a !important;
                border-radius: 10px !important;
                color: #f4f4f5 !important;
                padding: 9px 12px !important;
                font-size: 13px !important;
                line-height: 1.5 !important;
                outline: none !important;
                transition: all 0.2s ease-in-out !important;
              }
              .admin-surface textarea {
                padding: 10px 12px !important;
              }
              .admin-surface input:focus,
              .admin-surface select:focus,
              .admin-surface textarea:focus {
                border-color: #6366f1 !important;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15) !important;
                background-color: #09090b !important;
              }
              .admin-surface input::placeholder,
              .admin-surface textarea::placeholder {
                color: #52525b !important;
              }

              /* Minimalist Tables Overhaul */
              .admin-surface table {
                width: 100% !important;
                border-collapse: collapse !important;
                font-size: 12.5px !important;
              }
              .admin-surface th {
                font-size: 10px !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                color: #71717a !important;
                text-align: left !important;
                padding: 12px 14px !important;
                border-bottom: 1px solid #18181b !important;
                background-color: #09090b !important;
              }
              .admin-surface td {
                padding: 12px 14px !important;
                border-bottom: 1px solid #18181b !important;
                color: #d4d4d8 !important;
                vertical-align: middle !important;
                transition: background-color 0.15s ease-in-out !important;
              }
              .admin-surface tr:hover td {
                background-color: rgba(39, 39, 42, 0.15) !important;
                color: #ffffff !important;
              }
              
              /* Button Standardizations */
              .admin-surface button.btn-primary,
              .admin-surface button[class*="bg-indigo-600"],
              .admin-surface button[class*="bg-indigo-500"] {
                background-color: #ffffff !important;
                color: #09090b !important;
                font-weight: 600 !important;
                border-radius: 10px !important;
                padding: 8px 16px !important;
                font-size: 12.5px !important;
                border: 1px solid #ffffff !important;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
              }
              .admin-surface button.btn-primary:hover,
              .admin-surface button[class*="bg-indigo-600"]:hover,
              .admin-surface button[class*="bg-indigo-500"]:hover {
                background-color: #e4e4e7 !important;
                border-color: #e4e4e7 !important;
                transform: translateY(-0.5px) !important;
              }
              .admin-surface button.btn-primary:active,
              .admin-surface button[class*="bg-indigo-600"]:active,
              .admin-surface button[class*="bg-indigo-500"]:active {
                transform: scale(0.98) !important;
              }

              .admin-surface button.btn-secondary {
                background-color: rgba(39, 39, 42, 0.3) !important;
                color: #e4e4e7 !important;
                font-weight: 500 !important;
                border-radius: 10px !important;
                padding: 8px 16px !important;
                font-size: 12.5px !important;
                border: 1px solid #27272a !important;
                transition: all 0.2s !important;
              }
              .admin-surface button.btn-secondary:hover {
                background-color: rgba(39, 39, 42, 0.7) !important;
                color: #ffffff !important;
                border-color: #3f3f46 !important;
              }
            `}</style>

            <div className="admin-surface min-h-[650px] rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-6 shadow-xl space-y-6">
              
              {/* Dynamic Header for Content Area (Desktop) */}
              <div className="hidden lg:flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {(() => {
                      const Icon = activeTabInfo?.icon || LayoutDashboard;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100 leading-tight">
                      {getActiveTabTitle()}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {TAB_DESCRIPTIONS[activeTab] || 'প্ল্যাটফর্ম ব্যবস্থাপনা কনসোল'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                    TAB: {activeTab.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ── Lazy Module Rendering with Suspense ───────────────────── */}
              <Suspense fallback={<ManagerSkeleton />}>
                {activeTab === 'overview' && <OverviewManager />}
                {activeTab === 'admission' && <AdmissionManager />}
                {activeTab === 'live_exams' && <LiveExamManager />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'payments' && <PaymentManager />}
                {activeTab === 'plans' && <PlanManager />}
                {activeTab === 'question_bank' && <QuestionBankManager />}
                {activeTab === 'quotes' && <QuotesManager />}
                {activeTab === 'subjects' && <SubjectsManager />}
                {activeTab === 'challenges' && <DailyChallengeManager />}
                {activeTab === 'gamification' && <GamificationManager />}
                {activeTab === 'announcements' && <AnnouncementManager />}
                {activeTab === 'notifications' && <NotificationManager />}
                {activeTab === 'formulas' && <FormulaManager />}
                {activeTab === 'suggestions' && <SuggestionManager />}
                {activeTab === 'settings' && <SiteSettingsManager />}
                {activeTab === 'activity_feed' && <AdminActivityFeed />}
                {activeTab === 'reports' && <FeedbackManager />}
                {activeTab === 'migration' && <DatabaseMigrationHelper />}
              </Suspense>

            </div>
          </main>
        </div>
      </div>

      {/* ── Global Command Palette (Ctrl+K) ───────────────────────────────── */}
      <AdminCommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        tabs={allTabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
      />
    </div>
  );
}
