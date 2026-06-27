import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Database, FlaskConical, Filter, BookOpen, Calculator, GraduationCap, FileText, CheckSquare, BrainCircuit, LayoutGrid, SlidersHorizontal } from 'lucide-react';

const questionBanks = [
  {
    id: 1,
    title: 'এইচএসসি আইসিটি (ICT)',
    category: 'HSC',
    description: 'বিগত সালের সকল বোর্ড প্রশ্ন ও উত্তর এবং অধ্যায়ভিত্তিক এমসিকিউ (MCQ)।',
    icon: Database,
    baseRoute: '/academic/hsc/ict',
    gradient: 'from-pink-500/10 to-rose-500/10',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
    borderColor: 'border-pink-500/20',
    hoverBorder: 'hover:border-pink-500/50'
  },
  {
    id: 2,
    title: 'এইচএসসি রসায়ন ১ম পত্র',
    category: 'HSC',
    description: 'অধ্যায়ভিত্তিক বিগত সালের বোর্ড সৃজনশীল প্রশ্ন ও সমাধান।',
    icon: FlaskConical,
    baseRoute: '/academic/hsc/chemistry',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50'
  },
  {
    id: 3,
    title: 'এসএসসি পদার্থবিজ্ঞান',
    category: 'SSC',
    description: 'সকল বোর্ডের বিগত সালের প্রশ্ন ও গাণিতিক সমস্যা সমাধান।',
    icon: Calculator,
    baseRoute: '/academic/ssc/physics',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50'
  },
  {
    id: 4,
    title: 'এসএসসি বাংলা ১ম পত্র',
    category: 'SSC',
    description: 'গদ্য ও পদ্যের গুরুত্বপূর্ণ সৃজনশীল প্রশ্ন ও উত্তর।',
    icon: BookOpen,
    baseRoute: '/academic/ssc/bangla-1',
    gradient: 'from-purple-500/10 to-fuchsia-500/10',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50'
  }
];

const categories = ['All', 'HSC', 'SSC', 'Admission'];

const QuestionBankDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredBanks = questionBanks.filter((bank) => {
    const matchesSearch = bank.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          bank.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || bank.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-16">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-14">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>সেন্ট্রাল আর্কাইভ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-4 leading-tight">
            স্মার্ট প্রশ্নব্যাংক
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            এসএসসি, এইচএসসি এবং এডমিশন টেস্টের সকল বিষয়ের বিগত সালের বোর্ড প্রশ্ন, সৃজনশীল (CQ), এবং বহুনির্বাচনী (MCQ) প্রশ্নের বিশাল সংগ্রহশালা।
          </p>
        </div>
      </div>

      {/* Controls Section (Search & Filter) */}
      <div className="flex flex-col gap-5 mb-8 lg:mb-12 w-full">
        {/* Search Bar & Filter Popup */}
        <div className="relative w-full z-30 flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex flex-grow items-center w-full bg-slate-800/40 border border-slate-700/50 rounded-full p-1.5 shadow-inner backdrop-blur-md focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <div className="pl-4 pr-2 sm:pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="flex-grow bg-transparent border-none text-slate-100 text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:ring-0 py-2 sm:py-2.5 w-full"
              placeholder="বিষয় বা টপিক খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop Categories (Hidden on mobile/tablet) */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === category
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                {category === 'All' ? 'সকল বিষয়' : category}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <div className="relative shrink-0 lg:hidden">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 sm:p-3.5 rounded-2xl sm:rounded-[1.25rem] border transition-all flex items-center justify-center ${
                showFilters 
                  ? 'bg-indigo-500/30 text-indigo-200 border-indigo-500/50 shadow-lg shadow-indigo-500/20' 
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 border-slate-700/50'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Category Filters Popup */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-3 w-48 sm:w-56 p-2 rounded-2xl bg-slate-800/95 border border-slate-700/70 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-50">
                <h4 className="text-[10px] font-bold text-slate-500 mb-2 mt-1 px-3 uppercase tracking-wider">ক্যাটাগরি ফিল্টার</h4>
                <div className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setShowFilters(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeCategory === category
                          ? 'bg-indigo-500/20 text-indigo-300 shadow-inner'
                          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                      }`}
                    >
                      <span>{category === 'All' ? 'সকল বিষয়' : category}</span>
                      {activeCategory === category && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredBanks.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {filteredBanks.map((bank) => {
            const Icon = bank.icon;
            return (
              <div
                key={bank.id}
                className={`group relative flex flex-col p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${bank.gradient} border ${bank.borderColor} ${bank.hoverBorder} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm overflow-hidden`}
              >
                {/* Background decorative blob */}
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${bank.iconBg} blur-3xl opacity-40 group-hover:opacity-80 transition-opacity`}></div>
                
                <div className="relative z-10 flex flex-row items-start gap-3 sm:gap-4 mb-5">
                  <div className={`p-3 sm:p-4 rounded-xl ${bank.iconBg} ${bank.iconColor} shrink-0 mt-1`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/50 text-[10px] sm:text-xs font-bold text-slate-300 mb-2">
                      {bank.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-1 leading-snug">
                      {bank.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {bank.description}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons Grid */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 sm:mt-4 border-t border-slate-700/30 pt-5 sm:pt-6">
                  
                  {/* CQ Link */}
                  <Link 
                    to={`${bank.baseRoute}/cq`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-500/50 transition-all text-slate-200 hover:text-white"
                  >
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">সৃজনশীল (CQ)</span>
                      <span className="text-[10px] text-slate-400">অধ্যায়ভিত্তিক</span>
                    </div>
                  </Link>

                  {/* MCQ Link */}
                  <Link 
                    to={`${bank.baseRoute}/mcq`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-500/50 transition-all text-slate-200 hover:text-white"
                  >
                    <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400 shrink-0">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">বহুনির্বাচনী (MCQ)</span>
                      <span className="text-[10px] text-slate-400">অধ্যায়ভিত্তিক</span>
                    </div>
                  </Link>

                  {/* Knowledge/Comprehension Link */}
                  <Link 
                    to={`${bank.baseRoute}/knowledge`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-500/50 transition-all text-slate-200 hover:text-white"
                  >
                    <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400 shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">জ্ঞান ও অনুধাবন</span>
                      <span className="text-[10px] text-slate-400">ক ও খ নং প্রশ্ন</span>
                    </div>
                  </Link>

                  {/* Board Questions Link */}
                  <Link 
                    to={`${bank.baseRoute}/board-questions`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-indigo-100 hover:text-white"
                  >
                    <div className="bg-indigo-500/30 p-2 rounded-lg text-indigo-300 shrink-0">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">বোর্ড প্রশ্ন</span>
                      <span className="text-[10px] text-indigo-300/70">ঢাকা, রাজশাহী, ...</span>
                    </div>
                  </Link>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-slate-700/50 rounded-2xl bg-slate-800/10">
          <Database className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">কোনো বিষয় পাওয়া যায়নি</h3>
          <p className="text-slate-500 max-w-sm">
            আপনার অনুসন্ধানের সাথে মিল রয়েছে এমন কোনো প্রশ্নব্যাংক পাওয়া যায়নি। অন্য কিছু দিয়ে চেষ্টা করুন।
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-6 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg font-medium hover:bg-indigo-500/30 transition-colors"
          >
            রিসেট ফিল্টার
          </button>
        </div>
      )}

      {/* Global CSS for hiding scrollbar in filters */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
};

export default QuestionBankDashboard;
