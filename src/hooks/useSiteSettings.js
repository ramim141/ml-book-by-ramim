import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const DEFAULT_SITE_SETTINGS = {
  platformName: 'Learn with Ramim & Academic Hub',
  tagline: 'বাংলায় AI/ML শেখার ইন্টারেক্টিভ প্ল্যাটফর্ম এবং এসএসসি, এইচএসসি ও ভর্তি পরীক্ষার পূর্ণাঙ্গ ডিজিটাল একাডেমি',
  developer: {
    name: 'Ramim Ahmed',
    degree: 'BSc in CSE',
    university: 'Metropolitan University',
    bio: 'Software Engineer & Full Stack Developer passionated about AI/ML & EdTech.',
  },
  social: {
    linkedin: 'https://www.linkedin.com/in/ramim-ahmed',
    linkedinUser: 'ramim-ahmed',
    facebook: 'https://www.facebook.com/ramim141',
    facebookUser: 'ramim141',
    youtube: 'https://www.youtube.com/@codewithramuu',
    youtubeUser: '@codewithramuu',
    email: 'ahramu584@gmail.com',
    phone: '+8801768628911',
  },
  emergencyBanner: {
    active: false,
    text: '',
    link: '',
  },
  updatedAt: new Date().toISOString(),
};

async function fetchSiteSettings() {
  try {
    const snap = await getDoc(doc(db, 'admin_settings', 'site_config'));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...snap.data() };
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (err) {
    console.warn('Failed to fetch site_config, using default settings:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['admin_settings', 'site_config'],
    queryFn: fetchSiteSettings,
    staleTime: 1000 * 60 * 30, // 30 mins
    initialData: DEFAULT_SITE_SETTINGS,
  });
}
