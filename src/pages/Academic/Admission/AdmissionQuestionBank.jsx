import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Library, Search, Stethoscope, Award, 
  Cpu, Microscope, BookOpen, ChevronRight, Play, Sparkles, Building2, Globe, FileText,
  CheckSquare, BrainCircuit, LayoutGrid, Zap, Layers, Compass, HelpCircle, HeartPulse
} from 'lucide-react';

export const ADMISSION_CARD_BANKS = [
  {
    id: 'medical-dental',
    category: 'Admission',
    title: 'মেডিকেল ও ডেন্টাল (MBBS & BDS)',
    description: 'মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষার বিগত ২৫+ বছরের প্রশ্নব্যাংক, দাগানো বই ও রিয়েল টেস্ট।',
    icon: Stethoscope,
    gradient: 'from-rose-950/40 via-slate-900 to-indigo-950/40',
    borderColor: 'border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/50',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    badge: 'মেডিকেল ও ডেন্টাল',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    features: [
      {
        title: 'MBBS প্রশ্নব্যাংক',
        subtitle: 'বিগত ২৫+ বছরের সমাধান',
        icon: Stethoscope,
        iconColor: 'text-rose-400',
        iconBg: 'bg-rose-500/20',
        path: '/academic/admission/medical'
      },
      {
        title: 'BDS ডেন্টাল প্রশ্নব্যাংক',
        subtitle: 'বিগত ২০+ বছরের সমাধান',
        icon: Award,
        iconColor: 'text-indigo-400',
        iconBg: 'bg-indigo-500/20',
        path: '/academic/admission/medical'
      },
      {
        title: 'দাগানো বই ও মেডি ছন্দ',
        subtitle: 'মূল বইয়ের দাগানো লাইনস',
        icon: BookOpen,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        path: '/academic/admission/medical'
      },
      {
        title: '১০০ নম্বরের রিয়েল টেস্ট',
        subtitle: '৬০ মিনিট, -০.২৫ নেগেটিভ',
        icon: Zap,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        path: '/academic/admission/medical/exam/MBBS/2023-2024'
      }
    ]
  },
  {
    id: 'gst-cluster',
    category: 'Admission',
    title: 'GST গুচ্ছ (২৪টি সাধারণ ও বিজ্ঞান প্রযুক্তি)',
    description: '২৪টি বিশ্ববিদ্যালয়ের সমন্বিত গুচ্ছ ভর্তি পরীক্ষার বিগত সালের প্রশ্নব্যাংক ও সমাধান।',
    icon: Building2,
    gradient: 'from-purple-950/40 via-slate-900 to-indigo-950/40',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    badge: 'GST গুচ্ছ ক্লাস্টার',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    features: [
      {
        title: 'গুচ্ছ প্রশ্নব্যাংক',
        subtitle: 'বিগত সালের সকল প্রশ্ন',
        icon: Library,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/20',
        path: '/academic/admission/gst'
      },
      {
        title: 'বিজ্ঞান গুচ্ছ (A Unit)',
        subtitle: 'পদার্থ, রসায়ন, বায়ো, ম্যাথ',
        icon: Microscope,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/20',
        path: '/academic/admission/gst'
      },
      {
        title: 'মানবিক ও বাণিজ্য গুচ্ছ',
        subtitle: 'B ও C ইউনিট প্রস্তুতি',
        icon: BookOpen,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        path: '/academic/admission/gst'
      },
      {
        title: 'গুচ্ছ ফুল মডেল টেস্ট',
        subtitle: '১০০ MCQ স্পিড টেস্ট',
        icon: Zap,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        path: '/academic/admission/model-test'
      }
    ]
  },
  {
    id: 'engineering-buet',
    category: 'Admission',
    title: 'ইঞ্জিনিয়ারিং (BUET, CKET, BUTEX, MIST)',
    description: 'বুয়েট, রুয়েট, কুয়েট, চুয়েট ও প্রকৌশল বিশ্ববিদ্যালয় প্রিলিমিনারি ও লিখিত প্রশ্নব্যাংক।',
    icon: Cpu,
    gradient: 'from-blue-950/40 via-slate-900 to-cyan-950/40',
    borderColor: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    badge: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    features: [
      {
        title: 'বুয়েট প্রশ্নব্যাংক',
        subtitle: 'প্রিলি ও রিটেন প্রশ্ন',
        icon: Cpu,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
        path: '/academic/admission/engineering'
      },
      {
        title: 'সিকেয়েট (CKET)',
        subtitle: 'রুয়েট, কুয়েট, চুয়েট প্রশ্ন',
        icon: Building2,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/20',
        path: '/academic/admission/engineering'
      },
      {
        title: 'ক্যালকুলেটর হ্যাকস',
        subtitle: 'fx-991EX / CW ট্রিকস',
        icon: Sparkles,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        path: '/academic/admission/shortcuts'
      },
      {
        title: 'বুয়েট প্রিলি মডেল টেস্ট',
        subtitle: '১০০ MCQ, ৬০ মিনিট',
        icon: Zap,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        path: '/academic/admission/model-test'
      }
    ]
  },
  {
    id: 'varsity-ka',
    category: 'Admission',
    title: 'ভার্সিটি ক ইউনিট / বিজ্ঞান (DU A, JU, RU, SUST)',
    description: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট, সাস্ট ও পাবলিক বিশ্ববিদ্যালয় বিজ্ঞান অনুষদ প্রশ্নব্যাংক।',
    icon: Microscope,
    gradient: 'from-emerald-950/40 via-slate-900 to-teal-950/40',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    badge: 'ভার্সিটি ‘ক’ ও সাস্ট',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    features: [
      {
        title: 'ঢাবি ‘ক’ প্রশ্নব্যাংক',
        subtitle: 'MCQ ও লিখিত প্রশ্ন',
        icon: Microscope,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        path: '/academic/admission/varsity-a'
      },
      {
        title: 'সাস্ট ও জাবি ইউনিট',
        subtitle: 'বিজ্ঞান অনুষদের প্রশ্ন',
        icon: Building2,
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/20',
        path: '/academic/admission/varsity-a'
      },
      {
        title: 'হ্যান্ড ক্যালকুলেশন ট্রিকস',
        subtitle: 'ক্যালকুলেটর ছাড়া গণিত',
        icon: Sparkles,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        path: '/academic/admission/shortcuts'
      },
      {
        title: 'ঢাবি ‘ক’ মডেল টেস্ট',
        subtitle: '৬০ MCQ, ৪৫ মিনিট',
        icon: Zap,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/20',
        path: '/academic/admission/model-test'
      }
    ]
  },
  {
    id: 'nursing-prep',
    category: 'Admission',
    title: 'নার্সিং ভর্তি প্রস্তুতি (BSc & Diploma Nursing)',
    description: 'বিএসসি ইন নার্সিং ও ডিপ্লোমা ইন নার্সিং মিডওয়াইফারি ভর্তি পরীক্ষার বিগত সালের প্রশ্ন।',
    icon: HeartPulse,
    gradient: 'from-teal-950/40 via-slate-900 to-indigo-950/40',
    borderColor: 'border-teal-500/20',
    hoverBorder: 'hover:border-teal-500/50',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-400',
    badge: 'নার্সিং ও মিডওয়াইফারি',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    features: [
      {
        title: 'বিএসসি নার্সিং প্রশ্নব্যাংক',
        subtitle: 'বিগত সালের সমাধান',
        icon: HeartPulse,
        iconColor: 'text-teal-400',
        iconBg: 'bg-teal-500/20',
        path: '/academic/admission/nursing'
      },
      {
        title: 'ডিপ্লোমা নার্সিং প্রশ্নব্যাংক',
        subtitle: 'নার্সিং ও মিডওয়াইফারি',
        icon: Award,
        iconColor: 'text-indigo-400',
        iconBg: 'bg-indigo-500/20',
        path: '/academic/admission/nursing'
      },
      {
        title: 'বিজ্ঞান ও সাধারণ জ্ঞান',
        subtitle: 'নার্সিং বিশেষ কন্টেন্ট',
        icon: BookOpen,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        path: '/academic/admission/nursing'
      },
      {
        title: '১০০ নম্বরের মডেল টেস্ট',
        subtitle: 'নার্সিং স্ট্যান্ডার্ড টেস্ট',
        icon: Zap,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        path: '/academic/admission/model-test'
      }
    ]
  },
  {
    id: 'agri-cluster',
    category: 'Admission',
    title: 'কৃষি গুচ্ছ (Agri Cluster 8 Universities)',
    description: '৮টি কৃষি বিশ্ববিদ্যালয়ের সমন্বিত কৃষি গুচ্ছ ভর্তি পরীক্ষার প্রশ্নব্যাংক ও সমাধান।',
    icon: Compass,
    gradient: 'from-lime-950/40 via-slate-900 to-emerald-950/40',
    borderColor: 'border-lime-500/20',
    hoverBorder: 'hover:border-lime-500/50',
    iconBg: 'bg-lime-500/10',
    iconColor: 'text-lime-400',
    badge: 'কৃষি গুচ্ছ',
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
    features: [
      {
        title: 'কৃষি গুচ্ছ প্রশ্নব্যাংক',
        subtitle: 'বিগত সালের সকল প্রশ্ন',
        icon: Library,
        iconColor: 'text-lime-400',
        iconBg: 'bg-lime-500/20',
        path: '/academic/admission/agri'
      },
      {
        title: 'জীববিজ্ঞান ও রসায়ন',
        subtitle: 'কৃষি প্যাটার্ন প্রশ্ন',
        icon: Microscope,
        iconColor: 'text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        path: '/academic/admission/agri'
      },
      {
        title: 'পদার্থ ও উচ্চতর গণিত',
        subtitle: 'শর্টকাট টেকনিক',
        icon: Sparkles,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        path: '/academic/admission/agri'
      },
      {
        title: 'কৃষি ১০০ মার্কস টেস্ট',
        subtitle: 'রিয়েল এক্সাম মোড',
        icon: Zap,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/20',
        path: '/academic/admission/model-test'
      }
    ]
  }
];

export default function AdmissionQuestionBank() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrack, setActiveTrack] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filterTabs = [
    { id: 'all', label: 'সকল' },
    { id: 'medical-dental', label: '🩺 মেডিকেল' },
    { id: 'gst-cluster', label: '🏛️ GST গুচ্ছ' },
    { id: 'engineering-buet', label: '⚙️ ইঞ্জিনিয়ারিং' },
    { id: 'varsity-ka', label: '🔬 ভার্সিটি ক' },
    { id: 'nursing-prep', label: '🏥 নার্সিং' },
    { id: 'agri-cluster', label: '🌾 কৃষি গুচ্ছ' }
  ];

  const filteredBanks = useMemo(() => {
    return ADMISSION_CARD_BANKS.filter(bank => {
      const matchTrack = activeTrack === 'all' || bank.id === activeTrack;
      if (!searchQuery.trim()) return matchTrack;
      const q = searchQuery.toLowerCase();
      const matchSearch = 
        bank.title.toLowerCase().includes(q) ||
        bank.description.toLowerCase().includes(q) ||
        bank.features.some(f => f.title.toLowerCase().includes(q) || f.subtitle.toLowerCase().includes(q));
      return matchTrack && matchSearch;
    });
  }, [searchQuery, activeTrack]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-12 pt-8 font-bangla selection:bg-rose-500/30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link 
            to="/academic/admission" 
            className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm font-semibold transition mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            অ্যাডমিশন সেন্টারে ফিরে যান
          </Link>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black tracking-wide">
                <Library className="w-4 h-4" />
                <span>ADMISSION QUESTION ARCHIVE</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                অ্যাডমিশন <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">স্মার্ট প্রশ্নব্যাংক</span>
              </h1>
              
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                মেডিকেল, ডেন্টাল, গুচ্ছ, বুয়েট, ঢাবি ‘ক’ ইউনিট ও নার্সিং ভর্তি পরীক্ষার 
                বিগত ২৫+ বছরের আসল প্রশ্নপত্র, দাগানো নোটস এবং রিয়েল মডেল টেস্ট।
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar on Left, Filter Tabs on Right */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="flex items-center bg-slate-800/40 border border-slate-700/50 rounded-2xl p-2 shadow-inner backdrop-blur-md focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
              <div className="pl-3 pr-2 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="মেডিকেল, গুচ্ছ, বুয়েট, ঢাবি ক খুঁজুন..."
                className="flex-grow bg-transparent border-none text-slate-100 text-sm focus:outline-none focus:ring-0 py-1.5 placeholder:text-slate-500 font-medium"
              />
            </div>
          </div>

          {/* Filter Pills on Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none no-scrollbar">
            {filterTabs.map((tab) => {
              const active = activeTrack === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTrack(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/40'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admission Cards Grid (2-Column Large Cards with 4 Action Features Each) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {filteredBanks.map((bank) => {
            const Icon = bank.icon;
            return (
              <div
                key={bank.id}
                className={`group relative flex flex-col p-5 sm:p-6 rounded-3xl bg-gradient-to-br ${bank.gradient} border ${bank.borderColor} ${bank.hoverBorder} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-sm overflow-hidden`}
              >
                {/* Background blob */}
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${bank.iconBg} blur-3xl opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none`} />
                
                {/* Card Header */}
                <div className="relative z-10 flex flex-row items-start gap-3 sm:gap-4 mb-4">
                  <div className={`p-3.5 sm:p-4 rounded-2xl ${bank.iconBg} ${bank.iconColor} shrink-0 mt-0.5 shadow-inner`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] sm:text-xs font-black mb-1.5 ${bank.badgeColor}`}>
                      {bank.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-snug">
                      {bank.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {bank.description}
                    </p>
                  </div>
                </div>
                
                {/* 4 Feature Buttons Grid (Identical layout to HSC Smart Question Bank) */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto border-t border-slate-700/30 pt-4">
                  {bank.features.map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <Link 
                        key={idx}
                        to={feat.path}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/90 border border-slate-700/50 hover:border-slate-500/60 transition-all duration-200 text-slate-200 hover:text-white group/btn active:scale-95 shadow-sm"
                      >
                        <div className={`${feat.iconBg} ${feat.iconColor} p-2 rounded-xl shrink-0 group-hover/btn:scale-110 transition-transform`}>
                          <FeatIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-bold truncate group-hover/btn:text-white">
                            {feat.title}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {feat.subtitle}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
