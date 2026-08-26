import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays, Plus, Trash2, Edit, Save, RotateCcw,
  Check, X, Search, Clock, Award, Globe, ExternalLink,
  Layers, CheckCircle2, ShieldAlert, Sparkles, Building2,
  FileCode, Upload, Download, Copy, AlertTriangle, Code2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '../../hooks/useConfirm';
import { DEFAULT_ADMISSION_EXAM_SCHEDULES } from '../../data/academic/admissionExamSchedules';

const STATUS_OPTIONS = [
  { id: 'application_open', label: 'আবেদন চলছে', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'date_announced', label: 'তারিখ ঘোষিত', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'upcoming', label: 'শীঘ্রই আসছে', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'completed', label: 'পরীক্ষা সম্পন্ন', color: 'bg-slate-700/50 text-slate-400 border-slate-600/40' }
];

const PROGRAM_OPTIONS = [
  { id: 'medical', label: 'মেডিকেল ও ডেন্টাল', category: 'মেডিকেল ও ডেন্টাল' },
  { id: 'nursing', label: 'নার্সিং (BSc/Diploma)', category: 'নার্সিং' },
  { id: 'engineering', label: 'ইঞ্জিনিয়ারিং (BUET, CKET)', category: 'প্রকৌশল ও প্রযুক্তি' },
  { id: 'varsity-a', label: 'ভার্সিটি ক ইউনিট (DU A)', category: 'বিশ্ববিদ্যালয়' },
  { id: 'gst', label: 'জিএসটি গুচ্ছ (GST)', category: 'গুচ্ছ বিশ্ববিদ্যালয়' },
  { id: 'agri', label: 'কৃষি গুচ্ছ (Agri Cluster)', category: 'কৃষি বিশ্ববিদ্যালয়' },
  { id: 'others', label: 'অন্যান্য', category: 'অন্যান্য' }
];

export default function ExamScheduleManager() {
  const queryClient = useQueryClient();
  const [confirm, confirmDialog] = useConfirm();

  const [schedules, setSchedules] = useState(DEFAULT_ADMISSION_EXAM_SCHEDULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // JSON Bulk Modal State
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    program: 'medical',
    category: 'মেডিকেল ও ডেন্টাল',
    badge: '',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    examDate: '',
    examDateBangla: '',
    examTime: '',
    applicationStart: '',
    applicationEnd: '',
    admitCardDate: '',
    resultDate: '',
    totalMarks: '',
    minGpa: '',
    officialUrl: '',
    venue: '',
    status: 'date_announced',
    statusLabel: 'তারিখ ঘোষিত',
    statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: '',
    noticeText: '',
    active: true,
    order: 1
  });

  // Load from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadSchedules() {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'admin_settings', 'admission_exam_schedules'));
        if (snap.exists() && snap.data().schedules) {
          if (isMounted) setSchedules(snap.data().schedules);
        } else {
          if (isMounted) setSchedules(DEFAULT_ADMISSION_EXAM_SCHEDULES);
        }
      } catch (err) {
        console.error('Failed to load admission exam schedules:', err);
        toast.error('ভর্তি পরীক্ষার সময়সূচী লোড করতে সমস্যা হয়েছে');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSchedules();
    return () => { isMounted = false; };
  }, []);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(s => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory || s.program === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.badge?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [schedules, selectedCategory, searchQuery]);

  // Handle open create/edit modal
  const handleOpenModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({ ...schedule });
    } else {
      setEditingSchedule(null);
      setFormData({
        id: `schedule_${Date.now()}`,
        title: '',
        program: 'medical',
        category: 'মেডিকেল ও ডেন্টাল',
        badge: 'ভর্তি পরীক্ষা',
        badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        examDate: '',
        examDateBangla: '',
        examTime: 'সকাল ১০:০০ - ১১:০০ টা (১ ঘণ্টা)',
        applicationStart: '',
        applicationEnd: '',
        admitCardDate: '',
        resultDate: '',
        totalMarks: '১০০ নম্বর (MCQ)',
        minGpa: 'মোট জিপিএ ৮.০০',
        officialUrl: '',
        venue: 'বিভাগীয় কেন্দ্রসমূহ',
        status: 'date_announced',
        statusLabel: 'তারিখ ঘোষিত',
        statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        description: '',
        noticeText: '',
        active: true,
        order: schedules.length + 1
      });
    }
    setShowModal(true);
  };

  // ── JSON Bulk Editor Handlers ───────────────────────────────────────────────
  const handleOpenJsonModal = () => {
    setJsonContent(JSON.stringify(schedules, null, 2));
    setJsonError('');
    setShowJsonModal(true);
  };

  const handleJsonChange = (val) => {
    setJsonContent(val);
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        setJsonError('JSON অবশ্যই একটি Array হতে হবে (যেমন: [ { ... }, { ... } ])');
      } else {
        setJsonError('');
      }
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('JSON ক্লিপবোর্ডে কপি হয়েছে');
    } catch {
      toast.error('ক্লিপবোর্ডে কপি করতে সমস্যা হয়েছে');
    }
  };

  const handleDownloadJson = () => {
    try {
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admission_exam_schedules_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON ফাইল ডাউনলোড হয়েছে');
    } catch {
      toast.error('ডাউনলোড করতে সমস্যা হয়েছে');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        handleJsonChange(text);
        toast.success(`'${file.name}' সফলভাবে আপলোড হয়েছে`);
      }
    };
    reader.onerror = () => toast.error('ফাইল পড়তে সমস্যা হয়েছে');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveJsonToFirebase = async () => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed)) {
        toast.error('JSON অবশ্যই একটি শিডিউল Array হতে হবে!');
        return;
      }

      setSaving(true);
      await setDoc(doc(db, 'admin_settings', 'admission_exam_schedules'), {
        schedules: parsed,
        updatedAt: new Date().toISOString()
      });

      setSchedules(parsed);
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'exam_schedules'] });
      setShowJsonModal(false);
      toast.success(`🎉 ${parsed.length}টি সময়সূচী ফায়ারবেসে সফলভাবে সংরক্ষিত ও সিংক হয়েছে!`);
    } catch (err) {
      console.error('Failed to save JSON:', err);
      toast.error(`JSON ভুল আছে: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle save from modal into local state and Firebase
  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('পরীক্ষার শিরোনাম আবশ্যক');
      return;
    }

    const matchedStatus = STATUS_OPTIONS.find(st => st.id === formData.status);
    const updated = {
      ...formData,
      statusLabel: matchedStatus ? matchedStatus.label : 'তারিখ ঘোষিত',
      statusColor: matchedStatus ? matchedStatus.color : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    };

    const updatedList = editingSchedule
      ? schedules.map(s => s.id === editingSchedule.id ? updated : s)
      : [updated, ...schedules];

    setSchedules(updatedList);
    setShowModal(false);

    try {
      setSaving(true);
      await setDoc(doc(db, 'admin_settings', 'admission_exam_schedules'), {
        schedules: updatedList,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'exam_schedules'] });
      toast.success(editingSchedule ? 'শিডিউল সফলভাবে আপডেট হয়েছে! 🎉' : 'নতুন শিডিউল সফলভাবে যোগ হয়েছে! 🚀');
    } catch (err) {
      console.error('Failed to save exam schedules:', err);
      toast.error('ফায়ারবেসে সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete with instant Firestore auto-save
  const handleDelete = async (id, title) => {
    const ok = await confirm({
      title: 'শিডিউল ডিলিট নিশ্চিতকরণ',
      message: `আপনি কি "${title}" সময়সূচীটি তালিকা থেকে মুছে ফেলতে চান?`,
      confirmText: 'মুছে ফেলুন',
      cancelText: 'বাতিল',
      type: 'danger'
    });
    if (!ok) return;

    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated);

    try {
      setSaving(true);
      await setDoc(doc(db, 'admin_settings', 'admission_exam_schedules'), {
        schedules: updated,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'exam_schedules'] });
      toast.success('শিডিউল সফলভাবে মুছে ফেলা হয়েছে! 🗑️');
    } catch (err) {
      console.error('Failed to delete exam schedule from firebase:', err);
      toast.error('ফায়ারবেস থেকে মুছতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active with instant Firestore update
  const handleToggleActive = async (id) => {
    const updated = schedules.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSchedules(updated);
    try {
      await setDoc(doc(db, 'admin_settings', 'admission_exam_schedules'), {
        schedules: updated,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'exam_schedules'] });
      toast.success('স্ট্যাটাস আপডেট করা হয়েছে');
    } catch (err) {
      console.error('Failed to toggle active status:', err);
    }
  };

  // Reset to Default
  const handleResetToDefault = async () => {
    const ok = await confirm({
      title: 'ডিফল্ট ডেটা রিস্টোর',
      message: 'আপনি কি নিশ্চিত যে সকল শিডিউল রিসেট করে সিস্টেমের ডিফল্ট ২০২৪-২৫ শিডিউল লোড করতে চান?',
      confirmText: 'রিসেট করুন',
      type: 'warning'
    });
    if (!ok) return;

    setSchedules(DEFAULT_ADMISSION_EXAM_SCHEDULES);
    try {
      setSaving(true);
      await setDoc(doc(db, 'admin_settings', 'admission_exam_schedules'), {
        schedules: DEFAULT_ADMISSION_EXAM_SCHEDULES,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'exam_schedules'] });
      toast.success('ডিফল্ট শিডিউল রিসেট ও সেভ করা হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('রিসেট সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  // Save to Firebase (Manual button trigger)
  const handleSaveToFirebase = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, 'admin_settings', 'admission_exam_schedules'), {
        schedules,
        updatedAt: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'admission', 'exam_schedules'] });
      toast.success('🎉 ভর্তি পরীক্ষার সময়সূচী ফায়ারবেসে সফলভাবে সংরক্ষিত হয়েছে!');
    } catch (err) {
      console.error('Failed to save exam schedules:', err);
      toast.error('ফায়ারবেসে সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-bangla">
      {confirmDialog}

      {/* Hidden file input for JSON file upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              ভর্তি পরীক্ষার সময়সূচী ও রুটিন
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {schedules.length}টি পরীক্ষা
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              মেডিকেল, নার্সিং, বুয়েট, ঢাবি ক ও গুচ্ছ ভর্তি পরীক্ষার তারিখ, ডেডলাইন ও নোটিশ নিয়ন্ত্রণ করুন
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* New Schedule Add Button */}
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন শিডিউল যোগ</span>
          </button>

          {/* Manual Firebase Save Button */}
          <button
            type="button"
            onClick={handleSaveToFirebase}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'ফায়ারবেসে সেভ করুন'}</span>
          </button>

          {/* JSON Bulk Editor Button */}
          <button
            type="button"
            onClick={handleOpenJsonModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-2xl border border-slate-700 transition active:scale-95"
          >
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>JSON আপলোড</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetToDefault}
            title="ডিফল্ট রিস্টোর"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="পরীক্ষার নাম বা ক্যাটাগরি খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
          />
        </div>

        {/* Category Tabs (Clean without native ugly scrollbar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            সব
          </button>
          {PROGRAM_OPTIONS.map((prog) => (
            <button
              key={prog.id}
              type="button"
              onClick={() => setSelectedCategory(prog.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === prog.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {prog.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedules Cards Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-sm">কোনো সময়সূচী পাওয়া যায়নি</p>
          <p className="text-slate-500 text-xs mt-1">নতুন শিডিউল যোগ করতে বা JSON আপলোড করতে উপরের বাটনে চাপুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSchedules.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-3xl border transition-all ${
                item.active
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60">
                    {item.category || item.program}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${item.statusColor || 'bg-blue-500/15 text-blue-300 border-blue-500/30'}`}>
                    {item.statusLabel || item.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    title={item.active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                    className={`p-1.5 rounded-lg transition ${
                      item.active
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {item.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(item)}
                    title="এডিট করুন"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    title="মুছে ফেলুন"
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-3">
                <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                )}
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">পরীক্ষার তারিখ</span>
                    <strong className="text-slate-200">{item.examDateBangla || item.examDate || 'শীঘ্রই প্রকাশিত'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">পরীক্ষার সময় ও নম্বর</span>
                    <strong className="text-slate-200">{item.examTime || 'সকাল ১০:০০ টা'}</strong>
                  </div>
                </div>
              </div>

              {/* Notice text */}
              {item.noticeText && (
                <div className="text-[11px] text-slate-300 bg-indigo-500/10 border border-indigo-500/20 p-2.5 rounded-xl mb-3 leading-relaxed">
                  <span className="font-bold text-indigo-400 mr-1.5">ℹ</span>
                  {item.noticeText}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-2.5">
                <span>ন্যূনতম যোগ্যতা: <strong className="text-slate-400">{item.minGpa || 'জিপিএ ৮.০০'}</strong></span>
                {item.officialUrl && (
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-semibold"
                  >
                    <span>অফিসিয়াল ওয়েবসাইট</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── JSON Bulk Editor Modal ────────────────────────────────────────── */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    ভর্তি পরীক্ষার সময়সূচী JSON বাল্ক এডিটর ও আপলোড
                  </h3>
                  <p className="text-xs text-slate-400">
                    এখানে সরাসরি JSON পেস্ট করুন অথবা ফাইল আপলোড করে এক ক্লিকে সকল শিডিউল আপডেট করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>JSON ফাইল আপলোড</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>JSON ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'কপি হয়েছে' : 'JSON কপি'}</span>
                </button>
              </div>

              {/* Status Validation Pill */}
              <div>
                {jsonError ? (
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px] bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ভুল ফরম্যাট</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>বৈধ JSON ফরম্যাট</span>
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner */}
            {jsonError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
                <strong>JSON Error:</strong> {jsonError}
              </div>
            )}

            {/* JSON Code Textarea */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              <textarea
                value={jsonContent}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
                rows={15}
                className="w-full flex-1 p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-200 leading-relaxed outline-none focus:border-indigo-500 shadow-inner resize-y custom-scrollbar"
                placeholder="[ { ... }, { ... } ]"
              />
            </div>

            {/* Footer Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <p className="text-[11px] text-slate-500">
                টিপ: আপনি যেকোনো টেক্সট এডিটর বা ChatGPT দিয়ে শিডিউলের তালিকা তৈরি করে এখানে সরাসরি পেস্ট করতে পারেন।
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowJsonModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={saving || Boolean(jsonError)}
                  onClick={handleSaveJsonToFirebase}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'ফায়ারবেসে সেভ ও প্রকাশ করুন 🚀'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Single Item Form Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingSchedule ? 'শিডিউল এডিট করুন' : 'নতুন শিডিউল যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">পরীক্ষার শিরোনাম (Title) *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: এমবিবিএস (MBBS) ভর্তি পরীক্ষা ২০২৪-২৫"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">প্রোগ্রাম ক্যাটাগরি</label>
                  <select
                    value={formData.program}
                    onChange={(e) => {
                      const selected = PROGRAM_OPTIONS.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        program: e.target.value,
                        category: selected?.category || 'অন্যান্য'
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {PROGRAM_OPTIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ব্যাজ / সংক্ষিপ্ত ট্যাগ</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="যেমন: ভর্তি পরীক্ষা"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">পরীক্ষার তারিখ (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">তারিখ বাংলায় (প্রদর্শন করার জন্য)</label>
                  <input
                    type="text"
                    value={formData.examDateBangla}
                    onChange={(e) => setFormData({ ...formData, examDateBangla: e.target.value })}
                    placeholder="যেমন: ১৭ জানুয়ারি ২০২৫"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">পরীক্ষার সময়</label>
                  <input
                    type="text"
                    value={formData.examTime}
                    onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                    placeholder="যেমন: সকাল ১০:০০ - ১১:০০ টা (১ ঘণ্টা)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">মোট নম্বর ও মান বণ্টন</label>
                  <input
                    type="text"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    placeholder="যেমন: ১০০ নম্বর (MCQ)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">স্ট্যাটাস (Status)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {STATUS_OPTIONS.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ন্যূনতম যোগ্যতা / GPA</label>
                  <input
                    type="text"
                    value={formData.minGpa}
                    onChange={(e) => setFormData({ ...formData, minGpa: e.target.value })}
                    placeholder="যেমন: মোট জিপিএ ৯.০০"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">অফিসিয়াল ওয়েবসাইট / লিঙ্ক</label>
                  <input
                    type="url"
                    value={formData.officialUrl}
                    onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">পরীক্ষার কেন্দ্র / ভেন্যু</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="যেমন: সারাদেশের নির্ধারিত কেন্দ্রসমূহ"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">সংক্ষিপ্ত বিবরণ ও নোটিশ</label>
                <textarea
                  rows="3"
                  value={formData.noticeText}
                  onChange={(e) => setFormData({ ...formData, noticeText: e.target.value })}
                  placeholder="নম্বর বণ্টন বা বিশেষ নির্দেশাবলী..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition"
                >
                  {editingSchedule ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
