import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import Footer from '../Footer';

const hubLinks = [
  { label: 'এমএল বই', to: '/ml' },
  { label: 'একাডেমিক', to: '/academic' },
  { label: 'আমাদের সম্পর্কে', to: '/about' },
  { label: 'যোগাযোগ', to: '/contact' },
];

/**
 * হাব-লেভেল পেজগুলোর (about, contact, terms, privacy) লেআউট।
 * এগুলো কোনো একটি সাব-সাইটের অংশ নয়, তাই স্লিম হেডার ব্যবহার করা হয়।
 */
export default function HubLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] font-sans antialiased text-slate-200">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-100/[0.08] bg-[#050b12]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:h-18 sm:px-6 lg:h-20">
          <Link to="/" className="flex min-w-0 shrink items-center gap-2.5 transition hover:opacity-90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-300 text-[#06111d] shadow-[0_0_24px_rgba(45,212,191,0.2)] sm:h-10 sm:w-10">
              <BrainCircuit size={18} />
            </span>
            <span className="truncate text-sm font-black leading-tight text-white sm:text-base lg:text-lg">
              Learn with Ramim
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto sm:gap-1">
            {hubLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-2.5 py-2 text-xs font-bold transition sm:px-3 sm:text-sm ${
                    isActive
                      ? 'bg-teal-300/10 text-teal-300'
                      : 'text-slate-400 hover:bg-white/[0.035] hover:text-teal-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16 sm:pt-18 lg:pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
