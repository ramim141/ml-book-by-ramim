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
      className={`block relative overflow-hidden bg-slate-800/40 border ${activeTheme.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${activeTheme.hover}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${activeTheme.bg} ${activeTheme.text}`}>
          <Book className="w-6 h-6" />
        </div>
        {code && (
          <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
            {code}
          </span>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeTheme.gradient}`}></span>
          {chaptersCount} টি অধ্যায়
        </span>
        <span className={`flex items-center text-sm font-semibold ${activeTheme.text}`}>
          প্রবেশ করুন <ArrowRight className="w-4 h-4 ml-1" />
        </span>
      </div>
    </Link>
  );
};

export default SubjectCard;
