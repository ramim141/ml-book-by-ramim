import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Settings, User, Globe, Mail, Phone, Save, RotateCcw, 
  CheckCircle2, Sparkles, AlertTriangle, ShieldCheck, 
  Megaphone, Loader2, Share2, Link2, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_SITE_SETTINGS } from '../../hooks/useSiteSettings';

export default function SiteSettingsManager() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'admin_settings', 'site_config'));
      if (snap.exists()) {
        setFormData({ ...DEFAULT_SITE_SETTINGS, ...snap.data() });
      } else {
        setFormData(DEFAULT_SITE_SETTINGS);
      }
    } catch (err) {
      console.error('Failed to load site settings:', err);
      toast.error('সেটিংস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'admin_settings', 'site_config'), {
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['admin_settings', 'site_config'] });
      toast.success('প্লাটফর্ম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', { icon: '✅' });
    } catch (err) {
      console.error('Failed to save site settings:', err);
      toast.error('সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('আপনি কি সব সেটিংস ডিফল্ট মানে রিসেট করতে চান?')) {
      setFormData(DEFAULT_SITE_SETTINGS);
      toast('ডিফল্ট মান সেট করা হয়েছে। সেভ করতে সংরক্ষণ বাটনে চাপুন।', { icon: 'ℹ️' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-7 w-7 text-indigo-400 animate-spin mb-3" />
        <p className="text-slate-400 text-sm">সেটিংস লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-bangla pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">প্লাটফর্ম ও ডেভেলপার সেটিংস</h2>
            <p className="text-xs text-slate-400 mt-0.5">ফুটার, সোশ্যাল হ্যান্ডেল, যোগাযোগ তথ্য ও জরুরি ব্যানার ম্যানেজ করুন</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Developer Credentials */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 border-b border-slate-800/80 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>ডেভেলপার প্রোফাইল ও পরিচিতি</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">ডেভেলপারের নাম</label>
              <input
                type="text"
                value={formData.developer?.name || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developer: { ...formData.developer, name: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="যেমন: Ramim Ahmed"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">ডিগ্রি / পদবী</label>
              <input
                type="text"
                value={formData.developer?.degree || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developer: { ...formData.developer, degree: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="যেমন: BSc in CSE"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">শিক্ষা প্রতিষ্ঠান / বিশ্ববিদ্যালয়</label>
              <input
                type="text"
                value={formData.developer?.university || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developer: { ...formData.developer, university: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="যেমন: Metropolitan University"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">সংক্ষিপ্ত বায়ো / ট্যাগলাইন</label>
              <input
                type="text"
                value={formData.developer?.bio || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  developer: { ...formData.developer, bio: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="Software Engineer & EdTech Enthusiast"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Social Links & Contact */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 border-b border-slate-800/80 pb-3">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>সোশ্যাল মিডিয়া ও যোগাযোগ তথ্য</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn প্রোফাইল লিংক বা ইউজারনেম</span>
              </label>
              <input
                type="text"
                value={formData.social?.linkedin || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, linkedin: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="https://www.linkedin.com/in/ramim-ahmed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Facebook প্রোফাইল লিংক বা ইউজারনেম</span>
              </label>
              <input
                type="text"
                value={formData.social?.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, facebook: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="https://www.facebook.com/ramim141"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube চ্যানেল লিংক বা হ্যান্ডেল</span>
              </label>
              <input
                type="text"
                value={formData.social?.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, youtube: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="https://www.youtube.com/@codewithramuu"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>অফিশিয়াল ইমেইল এড্রেস</span>
              </label>
              <input
                type="email"
                value={formData.social?.email || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, email: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="ahramu584@gmail.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>হেল্পলাইন / মোবাইল নম্বর</span>
              </label>
              <input
                type="text"
                value={formData.social?.phone || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social: { ...formData.social, phone: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                placeholder="+8801768628911"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Marquee Banner */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>টপ ইমার্জেন্সি / নোটিশ ব্যানার</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.emergencyBanner?.active)}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyBanner: { ...formData.emergencyBanner, active: e.target.checked }
                })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-slate-300">ব্যানার প্রদর্শন করুন</span>
            </label>
          </div>

          {formData.emergencyBanner?.active && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">নোটিশ বার্তা (বিজ্ঞপ্তি)</label>
                <input
                  type="text"
                  value={formData.emergencyBanner?.text || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyBanner: { ...formData.emergencyBanner, text: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="যেমন: মেডিকেল ভর্তি পরীক্ষার স্পেশাল লাইভ এক্সাম আগামী শুক্রবার রাত ৯টায় অনুষ্ঠিত হবে!"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">ক্লিকেবল লিংক (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={formData.emergencyBanner?.link || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyBanner: { ...formData.emergencyBanner, link: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="/academic/live-exams"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
