import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Target, Clock, ShieldAlert, Award,
  Play, Sparkles, Dna, FlaskConical, Zap, Globe, BookOpen, Stethoscope,
  Cpu, Microscope, Check, Settings2, Layers, CheckCircle2,
  ChevronDown, ChevronUp, BarChart3, AlertCircle, RotateCcw,
  HeartPulse, Baby, BookMarked, Sprout, GraduationCap, Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NURSING_TRACKS } from '../../../data/academic/nursingConfig';

// ─── Program configs ────────────────────────────────────────────────────────

const PROGRAM_CONFIGS = {
  medical: {
    name: 'মেডিকেল ও ডেন্টাল',
    shortName: 'মেডিকেল',
    backPath: '/academic/admission/medical',
    icon: Stethoscope,
    accent: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', from: 'from-rose-500', to: 'to-pink-600', active: 'bg-rose-600', shadow: 'shadow-rose-600/20' },
    presets: [
      { id: 'mbbs', title: 'MBBS পূর্ণ সিলেবাস', shortTitle: 'MBBS', desc: 'জীব ৩০ • রসায়ন ২৫ • পদার্থ ২০ • ইংরেজি ১৫ • জিকে ১০', subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'], count: 100, duration: 60, negative: 0.25, emoji: '🩺', color: 'from-rose-500/20 to-pink-500/10 border-rose-500/40 text-rose-300', icon: Stethoscope },
      { id: 'bds', title: 'BDS ডেন্টাল সিলেবাস', shortTitle: 'BDS', desc: 'জীব ৩০ • রসায়ন ২৫ • পদার্থ ২০ • ইংরেজি ১৫ • জিকে ১০', subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'], count: 100, duration: 60, negative: 0.25, emoji: '🦷', color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300', icon: Award },
      { id: 'bio_only', title: 'জীববিজ্ঞান স্পিড টেস্ট', shortTitle: 'জীববিজ্ঞান', desc: 'শুধু জীববিজ্ঞান ৩০ MCQ (স্পিড ড্রিল)', subjects: ['biology'], count: 30, duration: 15, negative: 0.25, emoji: '🧬', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300', icon: Dna },
      { id: 'chem_phy', title: 'রসায়ন + পদার্থ কম্বো', shortTitle: 'রসায়ন+পদার্থ', desc: 'রসায়ন ২৫ + পদার্থ ২০ (৪৫ MCQ)', subjects: ['chemistry', 'physics'], count: 45, duration: 25, negative: 0.25, emoji: '⚗️', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300', icon: FlaskConical },
      { id: 'custom', title: 'কাস্টম মিক্সড', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় ও প্রশ্ন নির্বাচন', subjects: ['biology', 'chemistry'], count: 25, duration: 15, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'biology', name: 'জীববিজ্ঞান', icon: Dna, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', defaultMark: 30 },
      { id: 'chemistry', name: 'রসায়ন', icon: FlaskConical, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 25 },
      { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: Zap, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300', defaultMark: 20 },
      { id: 'english', name: 'ইংরেজি', icon: BookOpen, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300', defaultMark: 15 },
      { id: 'gk', name: 'সাধারণ জ্ঞান', icon: Globe, color: 'text-rose-400', activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300', defaultMark: 10 },
    ],
    examTypeForUrl: 'MBBS',
    sessionForUrl: '2023-2024',
  },
  nursing: {
    name: 'নার্সিং ভর্তি',
    shortName: 'নার্সিং',
    backPath: '/academic/admission/nursing',
    icon: HeartPulse,
    accent: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', from: 'from-emerald-500', to: 'to-teal-600', active: 'bg-emerald-600', shadow: 'shadow-emerald-600/20' },
    presets: [
      { id: 'bsc', title: 'BSc Nursing পূর্ণ সিলেবাস', shortTitle: 'BSc Nursing', desc: 'বাংলা ২০ • ইংরেজি ২০ • পদার্থ ১০ • রসায়ন ১০ • জীব ১০ • গণিত ১০ • জিকে ২০', subjects: ['bangla', 'english', 'physics', 'chemistry', 'biology', 'math', 'gk'], count: 100, duration: 60, negative: 0.25, emoji: '🏥', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300', icon: HeartPulse },
      { id: 'diploma', title: 'Diploma Nursing সিলেবাস', shortTitle: 'Diploma', desc: 'বাংলা ২০ • ইংরেজি ২০ • বিজ্ঞান ২৫ • গণিত ১৫ • জিকে ২০', subjects: ['bangla', 'english', 'science', 'math', 'gk'], count: 100, duration: 60, negative: 0.25, emoji: '📋', color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/40 text-teal-300', icon: BookMarked },
      { id: 'midwifery', title: 'Midwifery সিলেবাস', shortTitle: 'Midwifery', desc: 'ডিপ্লোমা ইন মিডওয়াইফারি ভর্তি পরীক্ষার স্ট্যান্ডার্ড', subjects: ['bangla', 'english', 'science', 'math', 'gk'], count: 100, duration: 60, negative: 0.25, emoji: '👶', color: 'from-pink-500/20 to-rose-500/10 border-pink-500/40 text-pink-300', icon: Baby },
      { id: 'custom', title: 'কাস্টম মিক্সড', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় নির্বাচন', subjects: ['bangla', 'english'], count: 30, duration: 20, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'bangla', name: 'বাংলা', icon: BookOpen, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 20 },
      { id: 'english', name: 'ইংরেজি', icon: Globe, color: 'text-sky-400', activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300', defaultMark: 20 },
      { id: 'biology', name: 'জীববিজ্ঞান', icon: Dna, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', defaultMark: 10 },
      { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: Zap, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300', defaultMark: 10 },
      { id: 'chemistry', name: 'রসায়ন', icon: FlaskConical, color: 'text-rose-400', activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300', defaultMark: 10 },
      { id: 'math', name: 'সাধারণ গণিত', icon: Calculator, color: 'text-indigo-400', activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300', defaultMark: 10 },
      { id: 'science', name: 'সাধারণ বিজ্ঞান', icon: Microscope, color: 'text-teal-400', activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-300', defaultMark: 25 },
      { id: 'gk', name: 'সাধারণ জ্ঞান', icon: Sparkles, color: 'text-pink-400', activeBg: 'bg-pink-500/15 border-pink-500/40 text-pink-300', defaultMark: 20 },
    ],
    examTypeForUrl: 'BSc Nursing',
    sessionForUrl: '2023-2024',
  },
  engineering: {
    name: 'ইঞ্জিনিয়ারিং',
    shortName: 'ইঞ্জিনিয়ারিং',
    backPath: '/academic/admission/engineering',
    icon: Cpu,
    accent: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', from: 'from-blue-500', to: 'to-indigo-600', active: 'bg-blue-600', shadow: 'shadow-blue-600/20' },
    presets: [
      { id: 'buet', title: 'BUET প্রিলিমিনারি', shortTitle: 'BUET', desc: 'উচ্চতর গণিত ৪০ • পদার্থ ৩৫ • রসায়ন ২৫', subjects: ['higher_math', 'physics', 'chemistry'], count: 100, duration: 60, negative: 0.25, emoji: '⚙️', color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300', icon: Cpu },
      { id: 'cket', title: 'CUET/RUET/KUET', shortTitle: 'CKET', desc: 'গণিত ৩০ • পদার্থ ৩০ • রসায়ন ২০ • ইংরেজি ২০', subjects: ['higher_math', 'physics', 'chemistry', 'english'], count: 100, duration: 60, negative: 0.25, emoji: '🏛️', color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300', icon: Layers },
      { id: 'butex', title: 'BUTEX টেক্সটাইল', shortTitle: 'BUTEX', desc: 'পদার্থ + রসায়ন + গণিত + ইংরেজি', subjects: ['physics', 'chemistry', 'higher_math', 'english'], count: 100, duration: 60, negative: 0.25, emoji: '🧵', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-300', icon: Layers },
      { id: 'custom', title: 'কাস্টম টেস্ট', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় নির্বাচন', subjects: ['higher_math', 'physics'], count: 50, duration: 30, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'higher_math', name: 'উচ্চতর গণিত', icon: Calculator, color: 'text-blue-400', activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-300', defaultMark: 40 },
      { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: Zap, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300', defaultMark: 35 },
      { id: 'chemistry', name: 'রসায়ন', icon: FlaskConical, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 25 },
      { id: 'english', name: 'ইংরেজি', icon: BookOpen, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300', defaultMark: 20 },
    ],
    examTypeForUrl: 'BUET',
    sessionForUrl: '2023-2024',
  },
  'varsity-a': {
    name: 'ভার্সিটি ক-ইউনিট',
    shortName: 'ভার্সিটি ক',
    backPath: '/academic/admission/varsity-a',
    icon: GraduationCap,
    accent: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', from: 'from-indigo-500', to: 'to-purple-600', active: 'bg-indigo-600', shadow: 'shadow-indigo-600/20' },
    presets: [
      { id: 'du_a', title: `ঢাবি 'ক' ইউনিট`, shortTitle: 'ঢাবি ক', desc: 'পদার্থ • রসায়ন • গণিত • জীববিজ্ঞান (৬০ MCQ)', subjects: ['physics', 'chemistry', 'higher_math', 'biology'], count: 60, duration: 45, negative: 0.25, emoji: '🔬', color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300', icon: GraduationCap },
      { id: 'sust', title: 'সাস্ট ভর্তি', shortTitle: 'সাস্ট', desc: 'পদার্থ + রসায়ন + গণিত + ইংরেজি (৫০ MCQ)', subjects: ['physics', 'chemistry', 'higher_math', 'english'], count: 50, duration: 40, negative: 0.25, emoji: '🏫', color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-300', icon: Microscope },
      { id: 'custom', title: 'কাস্টম টেস্ট', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় নির্বাচন', subjects: ['physics', 'chemistry'], count: 30, duration: 20, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: Zap, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300', defaultMark: 20 },
      { id: 'chemistry', name: 'রসায়ন', icon: FlaskConical, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 15 },
      { id: 'higher_math', name: 'উচ্চতর গণিত', icon: Calculator, color: 'text-blue-400', activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-300', defaultMark: 15 },
      { id: 'biology', name: 'জীববিজ্ঞান', icon: Dna, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', defaultMark: 10 },
      { id: 'english', name: 'ইংরেজি', icon: BookOpen, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300', defaultMark: 10 },
    ],
    examTypeForUrl: 'DU-A',
    sessionForUrl: '2023-2024',
  },
  gst: {
    name: 'GST গুচ্ছ',
    shortName: 'GST',
    backPath: '/academic/admission/gst',
    icon: FlaskConical,
    accent: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', from: 'from-fuchsia-500', to: 'to-pink-600', active: 'bg-fuchsia-600', shadow: 'shadow-fuchsia-600/20' },
    presets: [
      { id: 'gst_full', title: 'GST পূর্ণ সিলেবাস', shortTitle: 'GST Full', desc: 'বাংলা • ইংরেজি • বিজ্ঞান • গণিত (৬০ MCQ)', subjects: ['bangla', 'english', 'science', 'math'], count: 60, duration: 45, negative: 0.25, emoji: '🧪', color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/40 text-fuchsia-300', icon: FlaskConical },
      { id: 'custom', title: 'কাস্টম টেস্ট', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় নির্বাচন', subjects: ['bangla', 'english'], count: 30, duration: 20, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'bangla', name: 'বাংলা', icon: BookOpen, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 15 },
      { id: 'english', name: 'ইংরেজি', icon: Globe, color: 'text-sky-400', activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300', defaultMark: 15 },
      { id: 'science', name: 'সাধারণ বিজ্ঞান', icon: Microscope, color: 'text-teal-400', activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-300', defaultMark: 20 },
      { id: 'math', name: 'গণিত', icon: Calculator, color: 'text-indigo-400', activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300', defaultMark: 10 },
    ],
    examTypeForUrl: 'GST',
    sessionForUrl: '2023-2024',
  },
  agri: {
    name: 'কৃষি বিশ্ববিদ্যালয়',
    shortName: 'কৃষি',
    backPath: '/academic/admission/agri',
    icon: Sprout,
    accent: { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30', from: 'from-lime-500', to: 'to-green-600', active: 'bg-lime-600', shadow: 'shadow-lime-600/20' },
    presets: [
      { id: 'bau', title: 'বাকৃবি (BAU) পূর্ণ', shortTitle: 'BAU', desc: 'জীববিজ্ঞান • রসায়ন • পদার্থ • ইংরেজি (১০০ MCQ)', subjects: ['biology', 'chemistry', 'physics', 'english'], count: 100, duration: 60, negative: 0.25, emoji: '🌾', color: 'from-lime-500/20 to-green-500/10 border-lime-500/40 text-lime-300', icon: Sprout },
      { id: 'custom', title: 'কাস্টম টেস্ট', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় নির্বাচন', subjects: ['biology', 'chemistry'], count: 30, duration: 20, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'biology', name: 'জীববিজ্ঞান', icon: Dna, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300', defaultMark: 35 },
      { id: 'chemistry', name: 'রসায়ন', icon: FlaskConical, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 30 },
      { id: 'physics', name: 'পদার্থবিজ্ঞান', icon: Zap, color: 'text-cyan-400', activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300', defaultMark: 25 },
      { id: 'english', name: 'ইংরেজি', icon: BookOpen, color: 'text-purple-400', activeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-300', defaultMark: 10 },
    ],
    examTypeForUrl: 'BAU',
    sessionForUrl: '2023-2024',
  },
  'varsity-others': {
    name: 'অন্যান্য ভার্সিটি',
    shortName: 'অন্য ভার্সিটি',
    backPath: '/academic/admission/varsity-others',
    icon: GraduationCap,
    accent: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', from: 'from-amber-500', to: 'to-orange-600', active: 'bg-amber-600', shadow: 'shadow-amber-600/20' },
    presets: [
      { id: 'du_b', title: `ঢাবি 'খ' ইউনিট`, shortTitle: 'ঢাবি খ', desc: 'বাংলা • ইংরেজি • সাধারণ জ্ঞান (৬০ MCQ)', subjects: ['bangla', 'english', 'gk'], count: 60, duration: 45, negative: 0.25, emoji: '📚', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300', icon: GraduationCap },
      { id: 'custom', title: 'কাস্টম টেস্ট', shortTitle: 'কাস্টম', desc: 'নিজের ইচ্ছেমতো বিষয় নির্বাচন', subjects: ['bangla', 'english'], count: 30, duration: 20, negative: 0.25, emoji: '🎛️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-300', icon: Settings2 },
    ],
    subjects: [
      { id: 'bangla', name: 'বাংলা', icon: BookOpen, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300', defaultMark: 25 },
      { id: 'english', name: 'ইংরেজি', icon: Globe, color: 'text-sky-400', activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300', defaultMark: 25 },
      { id: 'gk', name: 'সাধারণ জ্ঞান', icon: Sparkles, color: 'text-rose-400', activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300', defaultMark: 20 },
      { id: 'math', name: 'গণিত', icon: Calculator, color: 'text-indigo-400', activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300', defaultMark: 15 },
    ],
    examTypeForUrl: 'DU-B',
    sessionForUrl: '2023-2024',
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ModelTestPage() {
  const { trackId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Detect program from URL
  const programKey = useMemo(() => {
    if (pathname.includes('/nursing/')) return 'nursing';
    if (pathname.includes('/medical')) return 'medical';
    if (pathname.includes('/engineering')) return 'engineering';
    if (pathname.includes('/varsity-a')) return 'varsity-a';
    if (pathname.includes('/varsity-others')) return 'varsity-others';
    if (pathname.includes('/gst')) return 'gst';
    if (pathname.includes('/agri')) return 'agri';
    return 'medical';
  }, [pathname]);

  const config = PROGRAM_CONFIGS[programKey] || PROGRAM_CONFIGS.medical;
  const Icon = config.icon;
  const { accent } = config;

  // Determine back path for nursing with trackId
  const backPath = programKey === 'nursing' && trackId
    ? `/academic/admission/nursing/${trackId}`
    : config.backPath;

  // Auto-select preset based on trackId for nursing
  const defaultPresetId = useMemo(() => {
    if (programKey === 'nursing' && trackId) {
      if (trackId === 'bsc') return 'bsc';
      if (trackId === 'diploma') return 'diploma';
      if (trackId === 'midwifery') return 'midwifery';
    }
    return config.presets[0]?.id || 'custom';
  }, [programKey, trackId, config.presets]);

  const [selectedPreset, setSelectedPreset] = useState(defaultPresetId);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [questionCount, setQuestionCount] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [negativeMark, setNegativeMark] = useState(0.25);
  const [examMode, setExamMode] = useState('real');
  const [expandedSections, setExpandedSections] = useState({ preset: true, subjects: true, settings: true });

  // Initialize from preset
  useEffect(() => {
    const preset = config.presets.find(p => p.id === defaultPresetId) || config.presets[0];
    if (preset) {
      setSelectedPreset(preset.id);
      setSelectedSubjects(preset.subjects);
      setQuestionCount(preset.count);
      setDurationMinutes(preset.duration);
      setNegativeMark(preset.negative);
    }
  }, [defaultPresetId, programKey]);

  const handleApplyPreset = (presetId) => {
    const preset = config.presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setSelectedSubjects(preset.subjects);
      setQuestionCount(preset.count);
      setDurationMinutes(preset.duration);
      setNegativeMark(preset.negative);
    }
  };

  const toggleSubject = (subId) => {
    setSelectedPreset('custom');
    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length === 1) { toast.error('অন্তত একটি বিষয় সিলেক্ট করতে হবে'); return; }
      setSelectedSubjects(selectedSubjects.filter(s => s !== subId));
    } else {
      setSelectedSubjects([...selectedSubjects, subId]);
    }
  };

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleStartExam = () => {
    if (!selectedSubjects.length) { toast.error('অনুগ্রহ করে অন্তত একটি বিষয় নির্বাচন করুন'); return; }
    toast.success('মডেল টেস্ট শুরু হচ্ছে...');
    const examType = encodeURIComponent(config.examTypeForUrl);
    const session = config.sessionForUrl;
    navigate(
      `/academic/admission/medical/exam/${examType}/${session}?mode=${examMode}&count=${questionCount}&duration=${durationMinutes}&negative=${negativeMark}&subjects=${selectedSubjects.join(',')}`
    );
  };

  const activePresetObj = config.presets.find(p => p.id === selectedPreset) || config.presets[0];
  const totalMarks = questionCount;
  const negMarkDisplay = negativeMark === 0 ? 'নেই' : `-${negativeMark}`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 pb-28 lg:pb-12 pt-6 sm:pt-10 font-bangla selection:bg-rose-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* ── Back + Header ── */}
        <div className="space-y-3">
          <Link
            to={backPath}
            className={`inline-flex items-center gap-2 ${accent.text} hover:opacity-80 text-sm font-semibold transition group`}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            {config.name} ড্যাশবোর্ডে ফিরে যান
          </Link>

          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${accent.from}/10 via-slate-900 ${accent.to}/5 border ${accent.border} p-6 sm:p-8 shadow-2xl`}>
            <div className={`absolute -right-12 -top-12 w-56 h-56 bg-gradient-to-br ${accent.from} ${accent.to} opacity-10 rounded-full blur-3xl pointer-events-none`} />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${accent.bg} border ${accent.border} ${accent.text} text-xs font-black tracking-wide`}>
                  <Icon className="w-4 h-4" />
                  <span>{config.shortName.toUpperCase()} MODEL TEST SIMULATOR</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ১০০ নম্বরের{' '}
                  <span className={`bg-clip-text text-transparent bg-gradient-to-r ${accent.from} ${accent.to}`}>
                    মডেল টেস্ট
                  </span>
                </h1>
                <p className="text-slate-400 text-sm">{config.name} ভর্তি পরীক্ষার স্ট্যান্ডার্ড সিমুলেটর — প্রিসেট বা কাস্টম সেটিং দিয়ে শুরু করুন</p>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200">
                  <Target className="w-3.5 h-3.5 text-fuchsia-400" /> {questionCount} প্রশ্ন
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {durationMinutes} মিনিট
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-slate-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> নেগেটিভ: {negMarkDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid: Left (Config) + Right (Preview) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">

          {/* ── Left Column: Configurator ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* Step 1: Preset Selection */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
              <button
                onClick={() => toggleSection('preset')}
                className="w-full flex items-center justify-between text-left focus:outline-none gap-2"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${accent.text}`} />
                  ১. টার্গেট প্রিসেট বেছে নিন
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold ${accent.bg} ${accent.text} border ${accent.border} px-2 py-0.5 rounded-md`}>
                    {activePresetObj?.shortTitle}
                  </span>
                  {expandedSections.preset ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expandedSections.preset && (
                <div className="flex sm:grid sm:grid-cols-3 gap-2.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar pt-1">
                  {config.presets.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    const PIcon = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset.id)}
                        className={`min-w-[160px] sm:min-w-0 p-3 sm:p-4 rounded-2xl border text-left transition-all duration-200 shrink-0 sm:shrink flex flex-col justify-between gap-2 ${
                          isSelected
                            ? `bg-gradient-to-br ${preset.color} shadow-lg scale-[1.01]`
                            : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/15' : 'bg-slate-800'}`}>
                            <PIcon className="w-4 h-4" />
                          </div>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_6px_rgba(255,255,255,0.6)]" />}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{preset.emoji} {preset.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{preset.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Subject Selection */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
              <button
                onClick={() => toggleSection('subjects')}
                className="w-full flex items-center justify-between text-left focus:outline-none gap-2"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  ২. বিষয় নির্বাচন করুন
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                    {selectedSubjects.length}টি বিষয়
                  </span>
                  {expandedSections.subjects ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {expandedSections.subjects && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {config.subjects.map((sub) => {
                      const isChecked = selectedSubjects.includes(sub.id);
                      const SIcon = sub.icon;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => toggleSubject(sub.id)}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between gap-1.5 ${
                            isChecked
                              ? `${sub.activeBg} shadow-sm scale-[1.01]`
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <SIcon className={`w-4 h-4 shrink-0 ${isChecked ? sub.color : 'text-slate-600'}`} />
                            <span className="text-xs font-bold truncate text-white">{sub.name}</span>
                          </div>
                          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center shrink-0 ${isChecked ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-600'}`}>
                            {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px]">+</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setSelectedPreset('custom'); setSelectedSubjects(config.subjects.map(s => s.id)); toast.success('সকল বিষয় যুক্ত হয়েছে'); }}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                    >
                      সকল বিষয় সিলেক্ট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Settings */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
              <button
                onClick={() => toggleSection('settings')}
                className="w-full flex items-center justify-between text-left focus:outline-none gap-2"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-amber-400" />
                  ৩. পরীক্ষার সেটিং
                </span>
                {expandedSections.settings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedSections.settings && (
                <div className="space-y-4 pt-1">
                  {/* Question Count */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">প্রশ্ন সংখ্যা</label>
                      <span className={`text-xs font-black ${accent.text} px-2 py-0.5 rounded-md ${accent.bg} border ${accent.border}`}>{questionCount} টি</span>
                    </div>
                    <input
                      type="range" min="10" max="150" step="5"
                      value={questionCount}
                      onChange={e => { setQuestionCount(Number(e.target.value)); setSelectedPreset('custom'); }}
                      className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500"><span>১০</span><span>৫০</span><span>১০০</span><span>১৫০</span></div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">সময়সীমা</label>
                      <span className="text-xs font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">{durationMinutes} মিনিট</span>
                    </div>
                    <input
                      type="range" min="10" max="120" step="5"
                      value={durationMinutes}
                      onChange={e => { setDurationMinutes(Number(e.target.value)); setSelectedPreset('custom'); }}
                      className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500"><span>১০</span><span>৩০</span><span>৬০</span><span>১২০</span></div>
                  </div>

                  {/* Negative Mark */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">নেগেটিভ মার্কিং</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 0.25, 0.5].map(val => (
                        <button
                          key={val}
                          onClick={() => setNegativeMark(val)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            negativeMark === val
                              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                              : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          {val === 0 ? 'নেই' : `-${val}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exam Mode */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">পরীক্ষার ধরন</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setExamMode('real')}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${examMode === 'real' ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-md' : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                      >
                        <Target className="w-3.5 h-3.5" /> রিয়েল পরীক্ষা
                      </button>
                      <button
                        onClick={() => setExamMode('practice')}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${examMode === 'practice' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                      >
                        <BookOpen className="w-3.5 h-3.5" /> প্র্যাকটিস মোড
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column: Live Preview & Start ── */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">

            {/* Preview Card */}
            <div className={`bg-gradient-to-br ${accent.from}/10 border ${accent.border} rounded-3xl p-5 space-y-4`}>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <BarChart3 className={`w-4 h-4 ${accent.text}`} />
                টেস্ট প্রিভিউ
              </h3>

              <div className="space-y-2.5">
                {[
                  { label: 'নির্বাচিত প্রিসেট', value: activePresetObj?.emoji + ' ' + (activePresetObj?.shortTitle || '—'), icon: Target },
                  { label: 'মোট প্রশ্ন', value: `${questionCount} MCQ`, icon: CheckCircle2 },
                  { label: 'সময়সীমা', value: `${durationMinutes} মিনিট`, icon: Clock },
                  { label: 'নেগেটিভ মার্ক', value: negMarkDisplay, icon: ShieldAlert },
                  { label: 'পরীক্ষার ধরন', value: examMode === 'real' ? 'রিয়েল পরীক্ষা' : 'প্র্যাকটিস মোড', icon: Play },
                ].map(({ label, value, icon: RowIcon }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                    <span className="text-xs font-bold text-white text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Selected subjects chips */}
              {selectedSubjects.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">নির্বাচিত বিষয়</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubjects.map(subId => {
                      const sub = config.subjects.find(s => s.id === subId);
                      if (!sub) return null;
                      return (
                        <span key={subId} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sub.activeBg}`}>
                          {sub.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartExam}
              disabled={!selectedSubjects.length}
              className={`w-full py-4 rounded-2xl font-black text-white text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${accent.from} ${accent.to} hover:opacity-90 shadow-${accent.shadow}`}
            >
              <Play className="w-5 h-5 fill-current" />
              {examMode === 'real' ? 'পরীক্ষা শুরু করুন' : 'প্র্যাকটিস শুরু করুন'}
            </button>

            {examMode === 'real' && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  রিয়েল পরীক্ষায় টাইমার চলবে এবং নেগেটিভ মার্কিং সক্রিয় থাকবে।
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
