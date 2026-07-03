import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Database, Quote, BookOpen, Swords, LayoutDashboard, Users, Star, MessageSquareWarning, Megaphone, Bell, CalendarClock, ChevronRight } from 'lucide-react';

// Import all modularized components
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

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
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
        { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
      ]
    },
    {
      title: 'একাডেমিক',
      tabs: [
        { id: 'question_bank', label: 'কোশ্চেন ব্যাংক', icon: Database },
        { id: 'live_exams', label: 'লাইভ এক্সাম', icon: CalendarClock },
        { id: 'subjects', label: 'সাবজেক্ট ম্যানেজমেন্ট', icon: BookOpen },
      ]
    },
    {
      title: 'ইউজার ও এনগেজমেন্ট',
      tabs: [
        { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users },
        { id: 'gamification', label: 'গেমিফিকেশন (Levels)', icon: Star },
        { id: 'challenges', label: 'ডেইলি চ্যালেঞ্জ', icon: Swords },
      ]
    },
    {
      title: 'কন্টেন্ট ও নোটিফিকেশন',
      tabs: [
        { id: 'announcements', label: 'নোটিশ বোর্ড', icon: Megaphone },
        { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
        { id: 'quotes', label: 'ডেইলি কোট', icon: Quote },
        { id: 'formulas', label: 'স্মার্ট ফর্মুলা', icon: BookOpen },
      ]
    },
    {
      title: 'সিস্টেম',
      tabs: [
        { id: 'reports', label: 'রিপোর্টস', icon: MessageSquareWarning },
        { id: 'migration', label: 'ডাটা মাইগ্রেশন', icon: Database },
      ]
    }
  ];

  const getActiveTabTitle = () => {
    for (const cat of tabCategories) {
      const tab = cat.tabs.find(t => t.id === activeTab);
      if (tab) return tab.label;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-200 font-bangla pb-20">
      {/* Admin Navbar */}
      <nav className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-xl shadow-lg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Database className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
                অ্যাডমিন প্যানেল
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-slate-300 font-bold transition-all hover:text-white"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Mobile Breadcrumb */}
        <div className="lg:hidden flex items-center gap-2 mb-4 text-slate-400 text-sm font-bold">
          <span>অ্যাডমিন</span>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-indigo-400">{getActiveTabTitle()}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border border-slate-800 sticky top-24">
              {tabCategories.map((category, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <h3 className="px-4 text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
                    {category.title}
                  </h3>
                  <div className="space-y-1">
                    {category.tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          activeTab === tab.id
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll Sidebar */}
            <div className="lg:hidden bg-slate-900/60 backdrop-blur-md rounded-2xl p-2 border border-slate-800 flex overflow-x-auto gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabCategories.flatMap(cat => cat.tabs).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 sm:p-8 border border-slate-800 min-h-[600px] shadow-2xl">
              {/* Header for content area (Desktop only) */}
              <div className="hidden lg:flex items-center gap-3 mb-8 pb-6 border-b border-slate-800/60">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center">
                  {(() => {
                    const activeTabInfo = tabCategories.flatMap(c => c.tabs).find(t => t.id === activeTab);
                    const Icon = activeTabInfo?.icon || LayoutDashboard;
                    return <Icon className="w-6 h-6 text-indigo-400" />;
                  })()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{getActiveTabTitle()}</h2>
                  <p className="text-slate-400 text-sm mt-1">Manage and configure platform settings.</p>
                </div>
              </div>

              {activeTab === 'overview' && <OverviewManager />}
              {activeTab === 'live_exams' && <LiveExamManager />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'question_bank' && <QuestionBankManager />}
              {activeTab === 'quotes' && <QuotesManager />}
              {activeTab === 'subjects' && <SubjectsManager />}
              {activeTab === 'challenges' && <DailyChallengeManager />}
              {activeTab === 'gamification' && <GamificationManager />}
              {activeTab === 'reports' && <FeedbackManager />}
              {activeTab === 'announcements' && <AnnouncementManager />}
              {activeTab === 'notifications' && <NotificationManager />}
              {activeTab === 'formulas' && <FormulaManager />}
              {activeTab === 'migration' && <DatabaseMigrationHelper />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
