import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Database, Quote, BookOpen, Swords, LayoutDashboard, Users, Star, MessageSquareWarning, Megaphone, Bell, CalendarClock, ChevronRight, Activity, Lightbulb, Search, Menu, Wallet, Tag } from 'lucide-react';

// Import all modularized components
import AdminCommandPalette from '../../components/Admin/AdminCommandPalette';
import OverviewManager from '../../components/Admin/OverviewManager';
import UserManagement from '../../components/Admin/UserManagement';
import QuestionBankManager from '../../components/Admin/QuestionBankManager';
import QuotesManager from '../../components/Admin/QuotesManager';
import SubjectsManager from '../../components/Admin/SubjectsManager';
import DailyChallengeManager from '../../components/Admin/DailyChallengeManager';
import GamificationManager from '../../components/Admin/GamificationManager';
import FeedbackManager from '../../components/Admin/FeedbackManager';
import AnnouncementManager from '../../components/Admin/AnnouncementManager';
import DatabaseMigrationHelper from './DatabaseMigrationHelper';
import NotificationManager from '../../components/Admin/NotificationManager';
import LiveExamManager from '../../components/Admin/LiveExamManager';
import FormulaManager from '../../components/Admin/FormulaManager';
import SuggestionManager from '../../components/Admin/SuggestionManager';
import AdminActivityFeed from '../../components/Admin/AdminActivityFeed';
import PaymentManager from '../../components/Admin/PaymentManager';
import PlanManager from '../../components/Admin/PlanManager';

/**
 * প্রতিটি ট্যাবের নিজস্ব এক লাইন — আগে সব ট্যাবেই একই ইংরেজি বাক্য
 * ("Manage and configure platform settings.") বসত, যা কিছুই জানাত না।
 */
const TAB_DESCRIPTIONS = {
  overview: 'প্ল্যাটফর্মের সারসংক্ষেপ ও সাম্প্রতিক অবস্থা',
  question_bank: 'প্রশ্ন, নোট ও ভিডিও যোগ করুন, খুঁজুন ও সম্পাদনা করুন',
  live_exams: 'নির্দিষ্ট সময়ের পরীক্ষা তৈরি ও অংশগ্রহণকারী দেখুন',
  subjects: 'বিষয় ও অধ্যায়ের তালিকা — পুরো হাবের ভিত্তি',
  users: 'শিক্ষার্থীদের তালিকা, অগ্রগতি ও অ্যাকাউন্ট ব্যবস্থাপনা',
  payments: 'বিকাশ পেমেন্ট যাচাই করে প্রিমিয়াম চালু করুন',
  plans: 'প্ল্যানের দাম, মেয়াদ ও কুপন/ছাড় নিয়ন্ত্রণ',
  gamification: 'XP, লেভেল ও ব্যাজের নিয়ম নির্ধারণ',
  challenges: 'প্রতিদিনের চ্যালেঞ্জ প্রশ্ন নির্ধারণ',
  announcements: 'শিক্ষার্থীদের ড্যাশবোর্ডে দেখানো নোটিশ',
  notifications: 'নির্দিষ্ট বা সব ব্যবহারকারীকে বার্তা পাঠান',
  quotes: 'প্রোফাইলে প্রতিদিন দেখানো অনুপ্রেরণামূলক উক্তি',
  formulas: 'বিষয়ভিত্তিক সূত্রের সংকলন',
  suggestions: 'পরীক্ষার সাজেশন তৈরি ও প্রকাশ',
  activity_feed: 'অ্যাডমিনের কাজের হিসাব ও সিস্টেম লগ',
  reports: 'শিক্ষার্থীদের পাঠানো ভুলের রিপোর্ট',
  migration: 'পুরনো ডেটা নতুন কাঠামোয় নেওয়ার সরঞ্জাম',
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  // ট্যাবটা URL এ রাখি (?tab=users)। আগে শুধু state এ থাকায় রিফ্রেশ করলেই
  // ওভারভিউতে ফিরে যেত, নির্দিষ্ট ট্যাব বুকমার্ক করা যেত না, আর ব্রাউজারের
  // back বাটনও কাজ করত না।
  const [searchParams, setSearchParams] = useSearchParams();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
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
        { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard, keywords: 'dashboard home হোম' },
      ]
    },
    {
      title: 'একাডেমিক',
      tabs: [
        { id: 'question_bank', label: 'কোশ্চেন ব্যাংক', icon: Database, keywords: 'question bank mcq cq প্রশ্ন ব্যাংক' },
        { id: 'live_exams', label: 'লাইভ এক্সাম', icon: CalendarClock, keywords: 'live exam পরীক্ষা এক্সাম' },
        { id: 'subjects', label: 'সাবজেক্ট ম্যানেজমেন্ট', icon: BookOpen, keywords: 'subject chapter বিষয় অধ্যায়' },
      ]
    },
    {
      title: 'ইউজার ও এনগেজমেন্ট',
      tabs: [
        { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users, keywords: 'user student ছাত্র ব্যবহারকারী' },
        { id: 'payments', label: 'পেমেন্ট', icon: Wallet, keywords: 'payment bkash subscription পেমেন্ট বিকাশ সাবস্ক্রিপশন টাকা' },
        { id: 'plans', label: 'প্ল্যান ও কুপন', icon: Tag, keywords: 'plan price coupon discount প্ল্যান দাম কুপন ছাড়' },
        { id: 'gamification', label: 'গেমিফিকেশন (Levels)', icon: Star, keywords: 'xp level badge লেভেল ব্যাজ' },
        { id: 'challenges', label: 'ডেইলি চ্যালেঞ্জ', icon: Swords, keywords: 'daily challenge চ্যালেঞ্জ' },
      ]
    },
    {
      title: 'কন্টেন্ট ও নোটিফিকেশন',
      tabs: [
        { id: 'announcements', label: 'নোটিশ বোর্ড', icon: Megaphone, keywords: 'announcement notice নোটিশ ঘোষণা' },
        { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, keywords: 'notification push নোটিফিকেশন' },
        { id: 'quotes', label: 'ডেইলি কোট', icon: Quote, keywords: 'quote উক্তি কোট' },
        { id: 'formulas', label: 'স্মার্ট ফর্মুলা', icon: BookOpen, keywords: 'formula সূত্র ফর্মুলা' },
        { id: 'suggestions', label: 'সাজেশন', icon: Lightbulb, keywords: 'suggestion সাজেশন' },
      ]
    },
    {
      title: 'সিস্টেম',
      tabs: [
        { id: 'activity_feed', label: 'অ্যাক্টিভিটি ফিড', icon: Activity, keywords: 'activity log অ্যাক্টিভিটি লগ' },
        { id: 'reports', label: 'রিপোর্টস', icon: MessageSquareWarning, keywords: 'report feedback রিপোর্ট ফিডব্যাক' },
        { id: 'migration', label: 'ডাটা মাইগ্রেশন', icon: Database, keywords: 'migration data ডাটা মাইগ্রেশন' },
      ]
    }
  ];

  // সব ট্যাব একটা সমতল তালিকায় — খোঁজা ও দেখানো দুটোতেই লাগে
  const allTabs = useMemo(
    () => tabCategories.flatMap((c) => c.tabs.map((t) => ({ ...t, category: c.title }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // URL এ অচেনা কিছু থাকলে ওভারভিউতেই ফিরি
  const requestedTab = searchParams.get('tab');
  const activeTab = allTabs.some((t) => t.id === requestedTab) ? requestedTab : 'overview';

  const setActiveTab = useCallback((id) => {
    setSearchParams(id === 'overview' ? {} : { tab: id });
    setMobileNavOpen(false);
  }, [setSearchParams]);

  // Ctrl/⌘ + K — ১৫টা ট্যাবের মধ্যে দ্রুত যাওয়ার সবচেয়ে সহজ পথ
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
    <div className="min-h-screen bg-[#0a0e17] pb-16 font-bangla text-slate-200">
      {/* গ্রেডিয়েন্ট লেখা ও ভারী ছায়া সরানো হলো — অ্যাডমিন টুল রোজ ঘণ্টার পর
          ঘণ্টা দেখতে হয়, তাই চোখে আরাম আর তথ্যের স্পষ্টতাই মুখ্য */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0e17]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 ring-1 ring-indigo-400/25">
                <Database className="h-3.5 w-3.5 text-indigo-300" />
              </div>
              <span className="truncate text-[15px] font-semibold tracking-tight text-white">
                অ্যাডমিন প্যানেল
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* ১৫টা ট্যাবের মধ্যে দ্রুত যাওয়ার পথ — কীবোর্ডেও Ctrl+K */}
              <button
                onClick={() => setPaletteOpen(true)}
                title="ট্যাব খুঁজুন (Ctrl+K)"
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:border-white/15 hover:text-white"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden md:inline">খুঁজুন</span>
                <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-px font-sans text-[10px] text-slate-500 md:inline">⌘K</kbd>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:border-rose-400/30 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        
        {/* Mobile Breadcrumb */}
        <div className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-slate-500 lg:hidden">
          <span>অ্যাডমিন</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-700" />
          <span className="text-slate-300">{getActiveTabTitle()}</span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:gap-7">
          
          {/* Sidebar */}
          <div className="w-full lg:w-60 shrink-0">
            {/* Desktop Sidebar — জ্বলজ্বলে বাক্সের বদলে বাঁ পাশে সরু অ্যাকসেন্ট
                রেখা। সারিগুলো ঘন, তাই ১৫টা ট্যাবই এক পর্দায় ধরে। */}
            <nav className="sticky top-[72px] hidden lg:block">
              {tabCategories.map((category, idx) => (
                <div key={idx} className="mb-5 last:mb-0">
                  <h3 className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                    {category.title}
                  </h3>
                  <div className="space-y-0.5">
                    {category.tabs.map(tab => {
                      const on = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          aria-current={on ? 'page' : undefined}
                          className={`group relative flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] transition-colors ${
                            on
                              ? 'bg-white/[0.06] font-semibold text-white'
                              : 'font-medium text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                          }`}
                        >
                          <span className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-indigo-400 transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />
                          <tab.icon className={`h-4 w-4 shrink-0 ${on ? 'text-indigo-300' : 'text-slate-600 group-hover:text-slate-400'}`} />
                          <span className="truncate">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* মোবাইল: ১৫টা ট্যাব সবসময় খোলা থাকলে আসল কাজের জায়গায় পৌঁছাতেই
                অনেকটা স্ক্রল করতে হতো। এখন শুধু বর্তমান ট্যাবের নাম দেখায়,
                দরকার হলে খুলে নেওয়া যায়। */}
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-expanded={mobileNavOpen}
              className="mb-3 flex w-full items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-left lg:hidden"
            >
              {activeTabInfo?.icon && <activeTabInfo.icon className="h-4 w-4 shrink-0 text-indigo-300" />}
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-slate-100">
                {getActiveTabTitle()}
              </span>
              <Menu className="h-4 w-4 shrink-0 text-slate-500" />
            </button>

            <div className={`space-y-2.5 lg:hidden ${mobileNavOpen ? '' : 'hidden'}`}>
              {tabCategories.map((category, idx) => (
                <div key={idx} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <h3 className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                    {category.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {category.tabs.map(tab => {
                      const on = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          aria-current={on ? 'page' : undefined}
                          className={`flex min-h-10 items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] transition-colors ${
                            on
                              ? 'bg-white/[0.07] font-semibold text-white'
                              : 'font-medium text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
                          }`}
                        >
                          <tab.icon className={`h-3.5 w-3.5 shrink-0 ${on ? 'text-indigo-300' : 'text-slate-600'}`} />
                          <span className="truncate leading-tight">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* ১৫টা ম্যানেজারে একই ইনপুট ছয় রকম দেখাত (bg-slate-900/50,
                bg-slate-950, bg-slate-900 … rounded-lg vs xl, px-3 vs px-4)।
                প্রতিটা ফাইলে হাত না দিয়ে এখানেই এক নিয়মে বাঁধি — এই সিলেক্টর
                গুলোর specificity (0,2,x) একক Tailwind ক্লাসের (0,1,0) চেয়ে
                বেশি, তাই পুরনো ক্লাস থাকলেও এগুলোই কার্যকর হয়।
                চেকবক্স/রেডিও/রেঞ্জ ছোঁয়া হয়নি — ওদের নিজস্ব চেহারা দরকার। */}
            <style>{`
              .admin-surface input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]),
              .admin-surface select,
              .admin-surface textarea {
                background-color: rgba(255,255,255,0.03) !important;
                border: 1px solid rgba(255,255,255,0.09) !important;
                border-radius: 8px !important;
                color: #e2e8f0 !important;
                padding: 8px 12px !important;
                font-size: 13.5px !important;
                line-height: 1.5 !important;
                outline: none !important;
                transition: border-color .15s, box-shadow .15s;
              }
              .admin-surface textarea { padding: 10px 12px !important; }
              .admin-surface input:focus,
              .admin-surface select:focus,
              .admin-surface textarea:focus {
                border-color: rgba(129,140,248,0.55) !important;
                box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
              }
              .admin-surface input::placeholder,
              .admin-surface textarea::placeholder { color: #475569 !important; }
              .admin-surface input:disabled,
              .admin-surface select:disabled,
              .admin-surface textarea:disabled { opacity: .5; cursor: not-allowed; }
              /* মোবাইলে ১৬px এর কম হলে iOS নিজে থেকে জুম করে ফেলে */
              @media (max-width: 640px) {
                .admin-surface input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),
                .admin-surface select,
                .admin-surface textarea { font-size: 16px !important; }
              }
              .admin-surface table { width: 100%; border-collapse: collapse; }
              .admin-surface th {
                font-size: 11px; font-weight: 600; text-transform: uppercase;
                letter-spacing: .06em; color: #64748b; text-align: left;
              }
            `}</style>

            <div className="admin-surface min-h-[600px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-7">
              {/* Header for content area (Desktop only) */}
              <div className="mb-7 hidden items-start gap-3 border-b border-white/[0.06] pb-5 lg:flex">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-400/20">
                  {(() => {
                    const Icon = activeTabInfo?.icon || LayoutDashboard;
                    return <Icon className="h-[18px] w-[18px] text-indigo-300" />;
                  })()}
                </div>
                <div className="min-w-0 pt-0.5">
                  <h2 className="text-[17px] font-semibold tracking-tight text-white">{getActiveTabTitle()}</h2>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {TAB_DESCRIPTIONS[activeTab] || 'প্ল্যাটফর্ম ব্যবস্থাপনা'}
                  </p>
                </div>
              </div>

              {activeTab === 'overview' && <OverviewManager />}
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
              {activeTab === 'activity_feed' && <AdminActivityFeed />}
              {activeTab === 'reports' && <FeedbackManager />}
              {activeTab === 'migration' && <DatabaseMigrationHelper />}
            </div>
          </div>
        </div>
      </div>

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
