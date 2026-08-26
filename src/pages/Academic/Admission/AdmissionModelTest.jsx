import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Target, Clock, ShieldAlert, Award, 
  Play, Sparkles, Dna, FlaskConical, Zap, Globe, BookOpen, Stethoscope, 
  Cpu, Microscope, Check, Settings2, HelpCircle, Layers, CheckCircle2, 
  ChevronRight, ChevronDown, ChevronUp, BarChart3, AlertCircle, Sliders, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ADMISSION_MODEL_TESTS = [
  {
    id: 'med-full-1',
    category: 'medical',
    title: 'মেডিকেল ও ডেন্টাল ফুল মডেল টেস্ট - ০১',
    subtitle: 'বায়োলজি ৩০ • রসায়ন ২৫ • পদার্থ ২০ • ইংরেজি ১৫ • জিকে ১০',
    marks: 100,
    duration: 60,
    negativeMark: 0.25,
    tag: 'মেডিকেল ফুল সিলেবাস',
    tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: Stethoscope,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    path: '/academic/admission/medical/exam/MBBS/2023-2024'
  },
  {
    id: 'bds-full-1',
    category: 'medical',
    title: 'ডেন্টাল (BDS) স্পেশাল মডেল টেস্ট - ০১',
    subtitle: 'ডেন্টাল ভর্তি পরীক্ষার স্ট্যান্ডার্ড ১০০ নম্বরের প্রশ্নপত্র',
    marks: 100,
    duration: 60,
    negativeMark: 0.25,
    tag: 'ডেন্টাল স্পেশাল',
    tagColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    icon: Award,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    path: '/academic/admission/medical/exam/BDS/2023-2024'
  },
  {
    id: 'bio-sub-final',
    category: 'subject_final',
    title: 'জীববিজ্ঞান পেপার ফাইনাল',
    subtitle: 'উদ্ভিদবিজ্ঞান ১৫ + প্রাণিবিজ্ঞান ১৫ (মেডিকেল স্ট্যান্ডার্ড)',
    marks: 30,
    duration: 15,
    negativeMark: 0.25,
    tag: 'বায়োলজি ফাইনাল',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Dna,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    path: '/academic/admission/medical/exam/MBBS/2023-2024'
  },
  {
    id: 'chem-sub-final',
    category: 'subject_final',
    title: 'রসায়ন পেপার ফাইনাল',
    subtitle: 'রসায়ন ১ম পত্র + ২য় পত্র কম্বাইন্ড ২৫ MCQ',
    marks: 25,
    duration: 12,
    negativeMark: 0.25,
    tag: 'রসায়ন ফাইনাল',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: FlaskConical,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    path: '/academic/admission/medical/exam/MBBS/2023-2024'
  },
  {
    id: 'phy-sub-final',
    category: 'subject_final',
    title: 'পদার্থবিজ্ঞান পেপার ফাইনাল',
    subtitle: 'পদার্থবিজ্ঞান ১ম পত্র + ২য় পত্র ২০ MCQ',
    marks: 20,
    duration: 10,
    negativeMark: 0.25,
    tag: 'পদার্থ ফাইনাল',
    tagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    icon: Zap,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    path: '/academic/admission/medical/exam/MBBS/2023-2024'
  },
  {
    id: 'eng-gk-final',
    category: 'subject_final',
    title: 'মেডিকেল ইংলিশ ও জিকে টেস্ট',
    subtitle: 'ইংরেজি ১৫ + সাধারণ জ্ঞান ১০ (স্পিড ড্রিল)',
    marks: 25,
    duration: 12,
    negativeMark: 0.25,
    tag: 'ইংলিশ ও জিকে',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Globe,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    path: '/academic/admission/medical/exam/MBBS/2023-2024'
  },
  {
    id: 'du-a-mock',
    category: 'varsity',
    title: 'ঢাবি ‘ক’ ইউনিট ফুল মডেল টেস্ট',
    subtitle: 'পদার্থ + রসায়ন + গণিত + জীববিজ্ঞান (৬০ MCQ)',
    marks: 60,
    duration: 45,
    negativeMark: 0.25,
    tag: 'ঢাবি ক-ইউনিট',
    tagColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    icon: Microscope,
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    path: '/academic/admission/varsity-a'
  },
  {
    id: 'buet-preli-mock',
    category: 'engineering',
    title: 'বুয়েট প্রিলিমিনারি মডেল টেস্ট',
    subtitle: 'উচ্চতর গণিত + পদার্থবিজ্ঞান + রসায়ন (১০০ MCQ)',
    marks: 100,
    duration: 60,
    negativeMark: 0.25,
    tag: 'বুয়েট প্রিলি',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Cpu,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    path: '/academic/admission/engineering'
  }
];

const AVAILABLE_SUBJECTS = [
  { id: 'biology', name: 'জীববিজ্ঞান', code: 'Bio', icon: Dna, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' },
  { id: 'chemistry', name: 'রসায়ন', code: 'Chem', icon: FlaskConical, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300' },
  { id: 'physics', name: 'পদার্থবিজ্ঞান', code: 'Phy', icon: Zap, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' },
  { id: 'math', name: 'উচ্চতর গণিত', code: 'Math', icon: Cpu, color: 'text-blue-400', activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-300' },
  { id: 'english', name: 'ইংরেজি', code: 'Eng', icon: BookOpen, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300' },
  { id: 'gk', name: 'সাধারণ জ্ঞান', code: 'GK', icon: Globe, color: 'text-rose-400', activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300' },
];

const TRACK_PRESETS = [
  { 
    id: 'medical', 
    title: 'মেডিকেল ও ডেন্টাল', 
    shortTitle: 'মেডিকেল',
    desc: 'Bio 30 • Chem 25 • Phy 20 • Eng 15 • GK 10', 
    subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'], 
    count: 100, 
    duration: 60, 
    negative: 0.25,
    icon: Stethoscope,
    emoji: '🩺',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-300'
  },
  { 
    id: 'engineering', 
    title: 'ইঞ্জিনিয়ারিং (BUET)', 
    shortTitle: 'ইঞ্জিনিয়ারিং',
    desc: 'Math 40 • Physics 35 • Chemistry 25', 
    subjects: ['math', 'physics', 'chemistry'], 
    count: 100, 
    duration: 60, 
    negative: 0.25,
    icon: Cpu,
    emoji: '⚙️',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300'
  },
  { 
    id: 'varsity_a', 
    title: 'ভার্সিটি ‘ক’ ইউনিট', 
    shortTitle: 'ভার্সিটি ক',
    desc: 'Physics • Chemistry • Math • Biology (60 Q)', 
    subjects: ['physics', 'chemistry', 'math', 'biology'], 
    count: 60, 
    duration: 45, 
    negative: 0.25,
    icon: Microscope,
    emoji: '🔬',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300'
  },
  { 
    id: 'nursing', 
    title: 'নার্সিং ভর্তি', 
    shortTitle: 'নার্সিং',
    desc: 'BSc ও ডিপ্লোমা নার্সিং স্ট্যান্ডার্ড', 
    subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'], 
    count: 100, 
    duration: 60, 
    negative: 0.25,
    icon: Award,
    emoji: '🏥',
    color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/40 text-teal-300'
  },
  { 
    id: 'custom', 
    title: 'কাস্টম মিক্সড', 
    shortTitle: 'কাস্টম',
    desc: 'নিজের ইচ্ছেমতো যেকোনো বিষয় নির্বাচন করুন', 
    subjects: ['biology', 'chemistry'], 
    count: 25, 
    duration: 15, 
    negative: 0.25,
    icon: Settings2,
    emoji: '🎛️',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300'
  }
];

export default function AdmissionModelTest() {
  const navigate = useNavigate();
  const [activeMainTab, setActiveMainTab] = useState('custom_builder'); // 'custom_builder' or 'ready_tests'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Custom Model Test State
  const [selectedPreset, setSelectedPreset] = useState('medical');
  const [selectedSubjects, setSelectedSubjects] = useState(['biology', 'chemistry', 'physics', 'english', 'gk']);
  const [questionCount, setQuestionCount] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [negativeMark, setNegativeMark] = useState(0.25);
  const [examMode, setExamMode] = useState('real'); // 'real' or 'practice'

  // Section Collapse State
  const [expandedSections, setExpandedSections] = useState({
    preset: true,
    subjects: true,
    settings: true
  });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleApplyPreset = (presetId) => {
    setSelectedPreset(presetId);
    const preset = TRACK_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedSubjects(preset.subjects);
      setQuestionCount(preset.count);
      setDurationMinutes(preset.duration);
      setNegativeMark(preset.negative);
    }
  };

  const toggleSubject = (subId) => {
    setSelectedPreset('custom');
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length === 1) {
        toast.error('অন্তত একটি বিষয় সিলেক্ট করতে হবে');
        return;
      }
      setSelectedSubjects(selectedSubjects.filter(s => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const selectAllSubjects = () => {
    setSelectedPreset('custom');
    setSelectedSubjects(AVAILABLE_SUBJECTS.map(s => s.id));
    toast.success('সকল বিষয় অন্তর্ভুক্ত করা হয়েছে');
  };

  const handleStartCustomExam = () => {
    if (selectedSubjects.length === 0) {
      toast.error('অনুগ্রহ করে অন্তত একটি বিষয় নির্বাচন করুন');
      return;
    }
    toast.success('মডেল টেস্ট শুরু হচ্ছে...');
    navigate(`/academic/admission/medical/exam/MBBS/2023-2024?mode=${examMode}&count=${questionCount}&duration=${durationMinutes}&negative=${negativeMark}&subjects=${selectedSubjects.join(',')}`);
  };

  const categories = [
    { id: 'all', label: 'সকল টেস্ট' },
    { id: 'medical', label: '🩺 মেডিকেল' },
    { id: 'subject_final', label: '🧬 সাবজেক্ট ফাইনাল' },
    { id: 'varsity', label: '🔬 ঢাবি ক' },
    { id: 'engineering', label: '⚙️ বুয়েট প্রিলি' }
  ];

  const filteredTests = useMemo(() => {
    if (selectedCategory === 'all') return ADMISSION_MODEL_TESTS;
    return ADMISSION_MODEL_TESTS.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const activePresetObj = TRACK_PRESETS.find(p => p.id === selectedPreset) || TRACK_PRESETS[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-28 lg:pb-24 pt-4 sm:pt-8 font-bangla selection:bg-rose-500/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <Link 
              to="/academic/admission" 
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition font-semibold group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" /> 
              অ্যাডমিশন সেন্টারে ফিরে যান
            </Link>
            
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                <span>অ্যাডমিশন মডেল টেস্ট</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                  Simulator
                </span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              মেডিকেল, বুয়েট, ঢাবি ক ও গুচ্ছ স্ট্যান্ডার্ড টেস্ট এবং কাস্টম সিমুলেটর
            </p>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl shadow-inner shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveMainTab('custom_builder')}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeMainTab === 'custom_builder'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>কাস্টম বিল্ডার</span>
            </button>

            <button
              onClick={() => setActiveMainTab('ready_tests')}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeMainTab === 'ready_tests'
                  ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4 text-rose-400" />
              <span>প্রস্তুত টেস্ট ({ADMISSION_MODEL_TESTS.length})</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            VIEW 1: Interactive Custom Model Test Studio (2-Column)
           ========================================================= */}
        {activeMainTab === 'custom_builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Test Configurator with Mobile-First Polish */}
            <div className="lg:col-span-8 space-y-3 sm:space-y-5">
              
              {/* Step 1: Select Track / Target Preset (Swipeable Carousel on Mobile) */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3 transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection('preset')}
                  className="w-full flex items-center justify-between text-left focus:outline-none gap-2"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">১. টার্গেট প্রিসেট</span>
                  </span>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className="text-[10px] sm:text-xs text-rose-400 font-bold bg-rose-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-rose-500/20 whitespace-nowrap">
                      {activePresetObj.shortTitle || activePresetObj.title}
                    </span>
                    {expandedSections.preset ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                </button>

                {expandedSections.preset && (
                  /* Horizontal Scroll Slider on Mobile, Grid on Tablet/Desktop */
                  <div className="flex sm:grid sm:grid-cols-3 gap-2.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    {TRACK_PRESETS.map((preset) => {
                      const isSelected = selectedPreset === preset.id;
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplyPreset(preset.id)}
                          className={`min-w-[170px] sm:min-w-0 p-3 sm:p-4 rounded-2xl border text-left transition-all duration-200 relative shrink-0 sm:shrink flex flex-col justify-between gap-2 sm:gap-3 ${
                            isSelected
                              ? `bg-gradient-to-br ${preset.color} shadow-lg shadow-rose-950/40 scale-[1.01]`
                              : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-slate-800 text-slate-400'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                              {preset.title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                              {preset.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Multi-Select Subject Chips (Mobile Touch Friendly) */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSection('subjects')}
                    className="w-full flex items-center justify-between text-left focus:outline-none gap-2"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                      <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">২. বিষয়সমূহ</span>
                    </span>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <span className="text-[10px] sm:text-xs text-cyan-400 font-bold bg-cyan-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-cyan-500/20 whitespace-nowrap">
                        {selectedSubjects.length}টি বিষয়
                      </span>
                      {expandedSections.subjects ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </button>
                </div>

                {expandedSections.subjects && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVAILABLE_SUBJECTS.map((sub) => {
                        const isChecked = selectedSubjects.includes(sub.id);
                        const Icon = sub.icon;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => toggleSubject(sub.id)}
                            className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-1.5 ${
                              isChecked
                                ? `${sub.activeBg} shadow-sm scale-[1.01]`
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Icon className={`w-4 h-4 shrink-0 ${isChecked ? sub.color : 'text-slate-600'}`} />
                              <span className="text-xs font-bold truncate text-white">{sub.name}</span>
                            </div>

                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                              isChecked ? 'bg-white/20 text-white font-bold' : 'bg-slate-800 text-slate-600'
                            }`}>
                              {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : '+'}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={selectAllSubjects}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20"
                      >
                        সকল বিষয় সিলেক্ট করুন
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Exam Parameters (Mobile Touch Friendly) */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-3 transition-all">
                <button
                  type="button"
                  onClick={() => toggleSection('settings')}
                  className="w-full flex items-center justify-between text-left focus:outline-none gap-2"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">৩. পরীক্ষার সেটিংস</span>
                  </span>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span className="text-[10px] sm:text-xs text-amber-400 font-bold bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-amber-500/20 whitespace-nowrap">
                      {questionCount} MCQ • {durationMinutes}মি.
                    </span>
                    {expandedSections.settings ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                </button>

                {expandedSections.settings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                    {/* Questions Count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>মোট প্রশ্নের সংখ্যা</span>
                        <span className="text-rose-400 font-black">{questionCount} টি</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
                        {[10, 25, 50, 100].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => {
                              setQuestionCount(cnt);
                              if (cnt === 10) setDurationMinutes(10);
                              else if (cnt === 25) setDurationMinutes(15);
                              else if (cnt === 50) setDurationMinutes(30);
                              else if (cnt === 100) setDurationMinutes(60);
                            }}
                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                              questionCount === cnt
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>সময়সীমা</span>
                        <span className="text-cyan-400 font-black">{durationMinutes} মিনিট</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
                        {[10, 15, 30, 60].map((dur) => (
                          <button
                            key={dur}
                            type="button"
                            onClick={() => setDurationMinutes(dur)}
                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                              durationMinutes === dur
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {dur} মি.
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Negative Marking */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>নেগেটিভ মার্কিং</span>
                        <span className="text-amber-400 font-black">{negativeMark > 0 ? `-${negativeMark}` : 'নেই'}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
                        {[
                          { val: 0.25, label: '-০.২৫' },
                          { val: 0.50, label: '-০.৫০' },
                          { val: 0.00, label: 'নেই' }
                        ].map((neg) => (
                          <button
                            key={neg.val}
                            type="button"
                            onClick={() => setNegativeMark(neg.val)}
                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                              negativeMark === neg.val
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {neg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Exam Mode */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>পরীক্ষার মোড</span>
                        <span className="text-emerald-400 font-black">{examMode === 'real' ? 'রিয়েল এক্সাম' : 'প্র্যাকটিস'}</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
                        {[
                          { val: 'real', label: 'রিয়েল এক্সাম' },
                          { val: 'practice', label: 'প্র্যাকটিস' }
                        ].map((m) => (
                          <button
                            key={m.val}
                            type="button"
                            onClick={() => setExamMode(m.val)}
                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                              examMode === m.val
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Interactive Blueprint Card (Desktop Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4 w-full">
              <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0c1220] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
                
                {/* Accent glow */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Blueprint Header */}
                <div className="space-y-1.5 border-b border-slate-800 pb-3 sm:pb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Test Blueprint</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    আপনার তৈরি করা টেস্ট
                  </h3>
                  <p className="text-xs text-slate-400">
                    টার্গেট: <span className="text-white font-semibold">{activePresetObj.title}</span>
                  </p>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">মোট প্রশ্ন</span>
                    <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">{questionCount} টি</span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">সময় সীমা</span>
                    <span className="text-lg sm:text-xl font-black text-cyan-300 mt-0.5 block">{durationMinutes} মি.</span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">নেগেটিভ মার্ক</span>
                    <span className="text-lg sm:text-xl font-black text-rose-400 mt-0.5 block">
                      {negativeMark > 0 ? `-${negativeMark}` : '০.০০'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-800/50 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">পূর্ণমান</span>
                    <span className="text-lg sm:text-xl font-black text-amber-300 mt-0.5 block">{questionCount} নম্বর</span>
                  </div>
                </div>

                {/* Selected Subjects List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 block">নির্বাচিত বিষয়সমূহ:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubjects.map(subId => {
                      const subObj = AVAILABLE_SUBJECTS.find(s => s.id === subId);
                      return (
                        <span key={subId} className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
                          {subObj?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Launch Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartCustomExam}
                    className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>মডেল টেস্ট শুরু করুন ({questionCount} MCQ)</span>
                  </button>
                  
                  <p className="text-[10px] sm:text-[11px] text-slate-500 text-center mt-2">
                    {examMode === 'real' ? '⏱️ রিয়েল এক্সাম টাইমার চালু হবে' : '📖 তাৎক্ষণিক উত্তর ও সমাধান দেখতে পারবেন'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =========================================================
            VIEW 2: Ready-Made Standard Model Tests (3-Column Grid)
           ========================================================= */}
        {activeMainTab === 'ready_tests' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(c => {
                const active = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      active 
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>

            {/* Clean 3-Column Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredTests.map((test) => {
                const Icon = test.icon;
                return (
                  <div 
                    key={test.id}
                    className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-200 flex flex-col justify-between gap-4 sm:gap-5 group shadow-lg"
                  >
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 sm:p-2.5 rounded-2xl ${test.iconBg} ${test.iconColor}`}>
                          <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${test.tagColor}`}>
                          {test.tag}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm sm:text-base lg:text-lg group-hover:text-rose-300 transition-colors leading-snug">
                          {test.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {test.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 pt-2 text-[11px] sm:text-xs text-slate-400 font-semibold border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> {test.duration} মি.
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <ShieldAlert className="w-3.5 h-3.5" /> -{test.negativeMark}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300 font-bold">{test.marks} মার্ক</span>
                      </div>
                    </div>

                    <div>
                      <Link
                        to={test.path}
                        className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>টেস্ট শুরু করুন</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* =========================================================
          MOBILE STICKY BOTTOM ACTION BAR (Custom Builder Mode)
         ========================================================= */}
      {activeMainTab === 'custom_builder' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d18]/95 backdrop-blur-xl border-t border-slate-800 p-2.5 px-4 shadow-[0_-10px_25px_rgba(0,0,0,0.6)] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-black text-white">
              <span>{questionCount} MCQ</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300">{durationMinutes} মি.</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400">-{negativeMark}</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {activePresetObj.shortTitle || activePresetObj.title} ({selectedSubjects.length} বিষয়)
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartCustomExam}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>টেস্ট শুরু</span>
          </button>
        </div>
      )}

    </div>
  );
}
