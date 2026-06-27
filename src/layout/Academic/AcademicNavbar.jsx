import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/academic', label: 'হোম' },
  { to: '/academic/ssc', label: 'এসএসসি (SSC)' },
  { to: '/academic/hsc', label: 'এইচএসসি (HSC)' },
  { to: '/academic/question-bank', label: 'প্রশ্নব্যাংক' },
  { to: '/academic/shortcut/all/all/all', label: 'শর্টকাট' },
];

const AcademicNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0f172a]/90 border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3 min-h-16 py-3 sm:h-20 sm:py-0">

          {/* Logo / Brand */}
          <Link to="/academic" className="min-w-0 flex-shrink flex items-center transition hover:opacity-90">
            <img 
              src="/assets/images/logo.png" 
              alt="একাডেমিক হাব" 
              className="h-14 sm:h-20 w-auto object-contain py-1 sm:py-2 scale-[1.15] sm:scale-125 ml-2 sm:ml-4" 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-100 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 sm:px-4 py-2 rounded-lg transition-all border border-indigo-500/20"
              aria-label="মেইন সাইটে ফিরে যান"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-bold">মেইন সাইট</span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-200 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 active:scale-95 transition"
              aria-label={isMobileOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden overflow-hidden border-t border-indigo-500/10 transition-[max-height,opacity] duration-300 ease-out ${isMobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 sm:px-6 py-3 bg-[#0f172a]/95 backdrop-blur-xl space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-200 hover:bg-slate-800/70 border border-transparent'
                  }`}
              >
                <span>{link.label}</span>
                <span className="text-indigo-400/70">›</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AcademicNavbar;
