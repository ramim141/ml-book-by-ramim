import { ArrowRight, Book } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubjectCard = ({ title, description, code, chaptersCount, link, color = 'indigo' }) => {
  // Theme variants for the cards
  const theme = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      hover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/20',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      hover: 'hover:border-purple-500/40 hover:shadow-purple-500/20',
      gradient: 'from-purple-500 to-purple-600'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      hover: 'hover:border-cyan-500/40 hover:shadow-cyan-500/20',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      hover: 'hover:border-blue-500/40 hover:shadow-blue-500/20',
      gradient: 'from-blue-500 to-blue-600'
    },
    pink: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-400',
      hover: 'hover:border-pink-500/40 hover:shadow-pink-500/20',
      gradient: 'from-pink-500 to-pink-600'
    }
  };

  const activeTheme = theme[color] || theme.indigo;

  return (
    <Link
      to={link}
      className={`block h-full relative overflow-hidden bg-slate-800/40 border ${activeTheme.border} rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-lg sm:hover:-translate-y-1 active:scale-[0.98] ${activeTheme.hover}`}
    >
      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
        <div className={`p-2.5 sm:p-3 rounded-xl ${activeTheme.bg} ${activeTheme.text} shrink-0`}>
          <Book className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {code && (
          <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            {code}
          </span>
        )}
      </div>

      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 leading-snug">{title}</h3>
      <p className="text-sm text-slate-400 mb-5 sm:mb-6 line-clamp-3 sm:line-clamp-2 leading-relaxed">{description}</p>

      <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between gap-2.5 min-[380px]:gap-3 mt-auto pt-3.5 sm:pt-4 border-t border-slate-700/50">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeTheme.gradient}`}></span>
          {chaptersCount} টি অধ্যায়
        </span>
        <span className={`flex items-center text-sm font-semibold ${activeTheme.text} transition-transform group-hover:translate-x-0.5 group-active:translate-x-0.5`}>
          প্রবেশ করুন <ArrowRight className="w-4 h-4 ml-1" />
        </span>
      </div>
    </Link>
  );
};

export default SubjectCard;
