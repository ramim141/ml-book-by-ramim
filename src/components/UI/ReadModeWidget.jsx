import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Minus, Plus } from 'lucide-react';

export default function ReadModeWidget() {
  const location = useLocation();
  const [isReadMode, setIsReadMode] = useState(() => localStorage.getItem('read-mode') === 'true');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('read-mode-font-size') || '20', 10));
  const [isLabTab, setIsLabTab] = useState(false);

  const isTargetPage =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/word/') ||
    location.pathname === '/blog' ||
    location.pathname.startsWith('/blog/');

  useEffect(() => {
    document.body.style.setProperty('--reading-font-size', `${fontSize}px`);
    localStorage.setItem('read-mode-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const shouldUseReadMode = isTargetPage && !isLabTab && isReadMode;
    document.body.classList.toggle('reading-mode-active', shouldUseReadMode);
    localStorage.setItem('read-mode', String(isReadMode));

    return () => {
      document.body.classList.remove('reading-mode-active');
    };
  }, [isReadMode, isLabTab, isTargetPage, location.pathname]);

  useEffect(() => {
    if (!isTargetPage || !location.pathname.startsWith('/word/')) {
      const timeout = setTimeout(() => setIsLabTab(false), 0);
      return () => clearTimeout(timeout);
    }

    const checkLabTab = () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const labButton = buttons.find(
        (button) => button.textContent.includes('ল্যাব সিমুলেটর') && !button.textContent.includes('লাইভ'),
      );

      if (!labButton) {
        setIsLabTab(false);
        return;
      }

      const isActive = labButton.classList.contains('text-slate-100') || !labButton.classList.contains('text-slate-500');
      setIsLabTab(isActive);
    };

    checkLabTab();
    const handleGlobalClick = () => setTimeout(checkLabTab, 50);
    document.addEventListener('click', handleGlobalClick);
    const interval = setInterval(checkLabTab, 400);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
      clearInterval(interval);
    };
  }, [isTargetPage, location.pathname]);

  if (!isTargetPage || isLabTab) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex select-none items-center gap-2 font-sans">
      <AnimatePresence>
        {isReadMode && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="flex items-center gap-1.5 rounded-full border border-black/15 bg-[#eae1c9] px-3 py-1.5 shadow-2xl backdrop-blur-sm"
          >
            <button
              onClick={() => setFontSize((prev) => Math.max(14, prev - 2))}
              disabled={fontSize <= 14}
              className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-amber-950 transition-all hover:bg-black/5 active:scale-90 disabled:opacity-30"
              title="ফন্ট সাইজ কমান (A-)"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>

            <span className="min-w-[36px] px-1 text-center text-xs font-black text-amber-950">
              {fontSize}px
            </span>

            <button
              onClick={() => setFontSize((prev) => Math.min(26, prev + 2))}
              disabled={fontSize >= 26}
              className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-amber-950 transition-all hover:bg-black/5 active:scale-90 disabled:opacity-30"
              title="ফন্ট সাইজ বাড়ান (A+)"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsReadMode((prev) => !prev)}
        aria-label={isReadMode ? 'রিডিং মোড বন্ধ করুন' : 'রিডিং মোড চালু করুন'}
        aria-pressed={isReadMode}
        className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl transition-all active:scale-95 ${
          isReadMode
            ? 'border-black/15 bg-[#eae1c9] text-amber-950 hover:bg-[#dfd5ba]'
            : 'border-white/10 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
        title={isReadMode ? 'রিডিং মোড বন্ধ করুন' : 'রিডিং মোড চালু করুন'}
      >
        <BookOpen size={20} strokeWidth={2} />
      </button>
    </div>
  );
}
