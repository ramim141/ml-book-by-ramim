import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Menu, X, LogIn, UserPlus, LogOut, ShieldCheck, User, Globe, Trophy, CalendarClock, FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../config/roles';
import NotificationBell from '../../components/Navigation/NotificationBell';

// শিক্ষাস্তরগুলো আলাদা আলাদা দেখালে ন্যাভবারে ন'টা আইটেম হয়ে ভিড় লাগত,
// তাই এই তিনটা একটা ড্রপডাউনে আনা হয়েছে।
const programLinks = [
  { to: '/academic/ssc', label: 'এসএসসি', desc: 'নবম-দশম শ্রেণি' },
  { to: '/academic/hsc', label: 'এইচএসসি', desc: 'একাদশ-দ্বাদশ শ্রেণি' },
  { to: '/academic/admission', label: 'এডমিশন', desc: 'ভর্তি পরীক্ষার প্রস্তুতি' },
];

const navLinks = [
  { to: '/academic', label: 'হোম' },
  { type: 'dropdown', id: 'program', label: 'প্রোগ্রাম', icon: GraduationCap, children: programLinks },
  { to: '/academic/question-bank', label: 'প্রশ্নব্যাংক' },
  { to: '/academic/question-builder', label: 'প্রশ্ন তৈরি', icon: FileText },
  { to: '/academic/live-exams', label: 'লাইভ এক্সাম', icon: CalendarClock },
  { to: '/academic/leaderboard', label: 'লিডারবোর্ড', icon: Trophy },
  { to: '/academic/shortcut/all/all/all', label: 'শর্টকাট' },
];

const isProgramPath = (pathname) => programLinks.some((l) => pathname.startsWith(l.to));

const AcademicNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  // যে স্তরের পেজে আছি সেই সেকশনটা মোবাইলে খোলা অবস্থায় শুরু হোক
  const [isMobileProgramOpen, setIsMobileProgramOpen] = useState(() => isProgramPath(window.location.pathname));
  const programRef = useRef(null);
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const isLinkActive = (to) =>
    to === '/academic' ? location.pathname === '/academic' : location.pathname.startsWith(to);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProgramOpen(false);
  }, [location.pathname]);

  // বাইরে ক্লিক বা Escape চাপলে ড্রপডাউন বন্ধ হবে
  useEffect(() => {
    if (!isProgramOpen) return;

    const handlePointerDown = (event) => {
      if (programRef.current && !programRef.current.contains(event.target)) {
        setIsProgramOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsProgramOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProgramOpen]);

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
    <nav className="academic-navbar sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0f172a]/90 border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
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
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinks.map((link) => {
              if (link.type === 'dropdown') {
                const sectionActive = isProgramPath(location.pathname);
                return (
                  <div key={link.id} className="relative" ref={programRef}>
                    <button
                      type="button"
                      onClick={() => setIsProgramOpen((v) => !v)}
                      aria-expanded={isProgramOpen}
                      aria-haspopup="menu"
                      className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
                        sectionActive || isProgramOpen ? 'text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <link.icon className="w-4 h-4 text-amber-400" />
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProgramOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProgramOpen && (
                      <div
                        role="menu"
                        className="absolute left-0 top-full z-50 mt-3 w-60 rounded-2xl border border-slate-700/70 bg-[#0f172a] p-1.5 shadow-2xl shadow-black/40"
                      >
                        {link.children.map((child) => {
                          const childActive = isLinkActive(child.to);
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              role="menuitem"
                              className={`block rounded-xl px-3 py-2.5 transition-colors ${
                                childActive
                                  ? 'bg-indigo-500/15 text-indigo-200'
                                  : 'text-slate-200 hover:bg-slate-800/80'
                              }`}
                            >
                              <span className="block text-sm font-bold">{child.label}</span>
                              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">{child.desc}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = isLinkActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
                    active ? 'text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-amber-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              title="মেইন সাইটে ফিরে যান"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-slate-300 bg-slate-800/50 hover:bg-indigo-500/20 hover:text-indigo-300 border border-slate-700/50 hover:border-indigo-500/30 transition-all group"
            >
              <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2">
                  {isAdmin(currentUser.email) && (
                    <Link
                      to="/admin"
                      title="অ্যাডমিন প্যানেল"
                      className="flex items-center justify-center w-9 h-9 rounded-full text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 hover:text-amber-200 border border-amber-500/20 transition-all group"
                    >
                      <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </Link>
                  )}
                  <Link
                    to="/academic/profile"
                    title="প্রোফাইল"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all group"
                  >
                    <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Link>
                  <button
                    onClick={() => logout()}
                    title="লগআউট"
                    className="flex items-center justify-center w-9 h-9 rounded-full text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-200 border border-rose-500/20 transition-all group"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <NotificationBell />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  title="লগইন"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-200 border border-indigo-500/20 transition-all group"
                >
                  <LogIn className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  title="সাইন আপ"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all group"
                >
                  <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            )}

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
        className={`md:hidden border-t border-indigo-500/10 transition-[max-height,opacity] duration-300 ease-out custom-scrollbar ${isMobileOpen ? 'max-h-[calc(100vh-70px)] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
      >
        <div className="px-4 sm:px-6 py-3 bg-[#0f172a]/95 backdrop-blur-xl space-y-1">
          {navLinks.map((link) => {
            if (link.type === 'dropdown') {
              const sectionActive = isProgramPath(location.pathname);
              return (
                <div key={link.id}>
                  <button
                    type="button"
                    onClick={() => setIsMobileProgramOpen((v) => !v)}
                    aria-expanded={isMobileProgramOpen}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors ${sectionActive
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-200 hover:bg-slate-800/70 border border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <link.icon className={`w-4 h-4 ${sectionActive ? 'text-indigo-400' : 'text-amber-400'}`} />
                      <span>{link.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-indigo-400/70 transition-transform duration-200 ${isMobileProgramOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMobileProgramOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l border-slate-700/60 pl-3">
                      {link.children.map((child) => {
                        const childActive = isLinkActive(child.to);
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${childActive
                              ? 'bg-indigo-500/15 text-indigo-300'
                              : 'text-slate-300 hover:bg-slate-800/70'
                              }`}
                          >
                            <span>{child.label}</span>
                            <span className="text-indigo-400/70">›</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = isLinkActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors ${isActive
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-200 hover:bg-slate-800/70 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon && <link.icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-amber-400'}`} />}
                  <span>{link.label}</span>
                </div>
                <span className="text-indigo-400/70">›</span>
              </Link>
            );
          })}

          {/* Mobile Auth Links */}
          <div className="pt-2 mt-2 border-t border-slate-700/50">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors text-slate-300 hover:bg-slate-800/70"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>মেইন সাইটে ফিরে যান</span>
              </div>
            </Link>
            
            {!currentUser && (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors text-indigo-300 hover:bg-slate-800/70 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>লগইন করুন</span>
                  </div>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors text-fuchsia-300 hover:bg-slate-800/70 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>নতুন অ্যাকাউন্ট খুলুন</span>
                  </div>
                </Link>
              </>
            )}
            {currentUser && (
              <>
                <Link
                  to="/academic/profile"
                  className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors text-indigo-300 hover:bg-slate-800/70 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>প্রোফাইল</span>
                  </div>
                </Link>
                {isAdmin(currentUser.email) && (
                  <Link
                    to="/admin"
                    className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors text-amber-300 hover:bg-slate-800/70 mt-1"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      <span>অ্যাডমিন প্যানেল</span>
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors text-red-300 hover:bg-slate-800/70 mt-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>লগআউট</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AcademicNavbar;
