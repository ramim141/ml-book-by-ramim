import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { bookStructure } from '../data/wordsIndex';
import { 
  ChevronDown, ChevronRight, ChevronLeft, Home, BookOpen, X 
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, closeMobileMenu }) {
  const location = useLocation(); 
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openChapter, setOpenChapter] = useState("chapter_01");
  const [openPart, setOpenPart] = useState("part_01");

  const toggleChapter = (chapterId) => {
    if (isCollapsed) setIsCollapsed(false); 
    setOpenChapter(openChapter === chapterId ? null : chapterId);
  };

  const togglePart = (partId) => {
    setOpenPart(openPart === partId ? null : partId);
  };

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (isMobileOpen) {
      closeMobileMenu();
    }
  };

  return (
    <>
      {/* --- Mobile Overlay Backdrop --- */}
      <div 
        onClick={closeMobileMenu}
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden bg-black/70 backdrop-blur-md ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* --- Sidebar Container --- */}
      <aside 
        className={`bg-[#070b12] text-slate-300 flex flex-col border-r border-white/[0.07] shrink-0 transition-all duration-300 shadow-[10px_0_36px_rgba(0,0,0,0.24)]
          fixed md:relative z-40 top-20 md:top-0 left-0 h-full
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          ${isCollapsed ? 'md:w-20' : 'md:w-80 lg:w-96'} 
          w-[85vw] sm:w-80
        `}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-4 h-56 w-56 rounded-full bg-slate-500/[0.035] blur-[80px]" />
          <div className="absolute bottom-12 right-[-80px] h-64 w-64 rounded-full bg-slate-500/[0.025] blur-[90px]" />
        </div>

        {/* Mobile Close Button (X icon) */}
        <button 
          onClick={closeMobileMenu}
          className="absolute z-10 transition-colors md:hidden top-4 right-4 text-slate-400 hover:text-slate-100"
        >
          <X size={24} />
        </button>

        {/* Desktop Minimize/Maximize Toggle Button (Absolutely Centered) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0b111b] border border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-slate-100 hover:border-white/20 z-50 shadow-md transition-all"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Scrollable Navigation Section */}
        <div className="relative z-10 flex-1 p-5 pt-8 pb-20 overflow-x-hidden overflow-y-auto custom-scrollbar md:pb-5">
          
          {/* Main Menu Items */}
          <nav className="pb-8 mb-8 space-y-2 border-b border-white/[0.07]">
            <Link 
              to="/dashboard" 
              onClick={handleLinkClick}
              title="বইয়ের হোম পেজ"
              className={`w-full flex items-center py-3.5 rounded-lg text-[15px] font-bold transition-all ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'
              } ${
                isActive('/dashboard') 
                  ? 'bg-[#1f3a46] text-slate-100 shadow-sm' 
                  : 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-100'
              }`}
            >
              <Home size={20} className="shrink-0" /> 
              <span className={isCollapsed ? 'block md:hidden whitespace-nowrap' : 'whitespace-nowrap'}>বইয়ের হোম পেজ</span>
            </Link>

            <Link 
              to="/start" 
              onClick={handleLinkClick}
              title="বইয়ের সূচনালগ্নে"
              className={`w-full flex items-center py-3.5 rounded-lg text-[15px] font-bold transition-all ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'
              } ${
                isActive('/start') 
                  ? 'bg-[#1f3a46] text-slate-100 shadow-sm' 
                  : 'hover:bg-white/[0.04] text-slate-400 hover:text-slate-100'
              }`}
            >
              <BookOpen size={20} className="shrink-0" /> 
              <span className={isCollapsed ? 'block md:hidden whitespace-nowrap' : 'whitespace-nowrap'}>বইয়ের সূচনালগ্নে</span>
            </Link>
          </nav>

          {/* Chapters Section */}
          <div>
            {!isCollapsed && (
              <p className="px-2 mb-5 text-xs font-bold tracking-widest uppercase text-slate-500 whitespace-nowrap">
                অধ্যায়সমূহ
              </p>
            )}
            
            <div className="space-y-4">
              {bookStructure.map((chapter) => (
                <div key={chapter.chapterId} className="space-y-2">
                  
                  {/* Chapter Button */}
                  <button 
                    onClick={() => toggleChapter(chapter.chapterId)}
                    title={`অধ্যায়-${chapter.chapterNo}: ${chapter.chapterTitle}`}
                    className={`w-full flex items-center py-3 rounded-xl transition-all ${
                      isCollapsed ? 'justify-center px-0' : 'justify-between px-2'
                    } ${
                      openChapter === chapter.chapterId ? 'bg-[#0b111b] border border-white/[0.08]' : 'hover:bg-white/[0.035] border border-transparent'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-black transition-colors shrink-0 ${
                        openChapter === chapter.chapterId ? 'bg-[#1f3a46] text-slate-100 shadow-sm' : 'bg-[#0b111b] text-slate-400 border border-white/[0.06]'
                      }`}>
                        {chapter.chapterNo}
                      </span>
                      <span className={isCollapsed ? `block md:hidden text-[15px] md:text-[16px] text-left font-bold truncate max-w-[200px] md:max-w-[220px] ${openChapter === chapter.chapterId ? 'text-slate-100' : 'text-slate-300'}` : `text-[15px] md:text-[16px] text-left font-bold truncate max-w-[200px] md:max-w-[220px] ${openChapter === chapter.chapterId ? 'text-slate-100' : 'text-slate-300'}`}>
                        অধ্যায়-{chapter.chapterNo}ঃ {chapter.chapterTitle}
                      </span>
                    </div>
                    {!isCollapsed && (
                      <ChevronDown 
                        size={18} 
                        className={`text-slate-500 transition-transform duration-300 shrink-0 ${openChapter === chapter.chapterId ? 'rotate-180 text-slate-300' : ''}`} 
                      />
                    )}
                  </button>

                  {/* Parts & Words */}
                  <div className={`grid transition-all duration-300 ease-in-out ${
                    openChapter === chapter.chapterId && !isCollapsed
                      ? 'grid-rows-[1fr] opacity-100 mt-3 mb-6'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}>
                    <div className="overflow-hidden pl-3 ml-4 border-l-2 border-white/[0.07] space-y-3">
                      {chapter.parts.map((part) => (
                        <div key={part.partId} className="space-y-1">
                          <button 
                            onClick={() => togglePart(part.partId)}
                            className="flex items-center justify-between w-full px-3 py-2 transition-colors rounded-lg hover:bg-white/[0.035] group"
                          >
                            <span className={`text-[14px] md:text-[16px] font-bold tracking-wide text-left truncate ${
                              openPart === part.partId ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-300'
                            }`}>
                              পর্ব-{part.partNo}: {part.partTitle}
                            </span>
                            <ChevronRight 
                              size={16} 
                              className={`text-slate-500 shrink-0 transition-transform duration-200 ${openPart === part.partId ? 'rotate-90 text-slate-300' : ''}`} 
                            />
                          </button>
                          
                          {/* Words inside the Part (If Part is open) */}
                          <div className={`grid transition-all duration-300 ease-in-out ${
                            openPart === part.partId
                              ? 'grid-rows-[1fr] opacity-100'
                              : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                          }`}>
                            <div className="overflow-hidden">
                              <div className="space-y-1.5 pl-3 py-2">
                                {part.words.map((word) => {
                                  const wordPath = `/word/${word.path}`;
                                  const isWordActive = isActive(wordPath);

                                  return (
                                    <Link
                                      key={word.id}
                                      to={wordPath}
                                      onClick={handleLinkClick}
                                      className={`block text-left py-2.5 px-4 rounded-xl text-[13px] md:text-[14px] transition-all relative ${
                                        isWordActive 
                                          ? 'bg-white/[0.07] text-slate-100 font-bold shadow-sm' 
                                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.035] font-medium'
                                      }`}
                                    >
                                      {isWordActive && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-500 rounded-r-md"></span>
                                      )}
                                      <span className="leading-relaxed line-clamp-2">{word.title}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
