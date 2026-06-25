import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react';

const AcademicNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0f172a]/90 border-b border-indigo-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <Link to="/academic" className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-purple-200">
              একাডেমিক হাব
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/academic" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">হোম</Link>
            <Link to="/academic/ssc" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">এসএসসি (SSC)</Link>
            <Link to="/academic/hsc" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">এইচএসসি (HSC)</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-100 bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg transition-all border border-indigo-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline font-bold">মেইন সাইট</span>
            </Link>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default AcademicNavbar;
