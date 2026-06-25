import { Outlet } from 'react-router-dom';
import AcademicNavbar from './AcademicNavbar';
import AcademicFooter from './AcademicFooter';

const AcademicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0b0f19] text-slate-200">
      <AcademicNavbar />
      <main className="flex-1 flex flex-col relative w-full">
        {/* Subtle background glow effect for academic section */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="relative z-10 flex-1">
          <Outlet />
        </div>
      </main>
      <AcademicFooter />
    </div>
  );
};

export default AcademicLayout;
