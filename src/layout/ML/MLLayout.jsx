import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import ReadModeWidget from '../../components/UI/ReadModeWidget';

export default function MLLayout() {
  const location = useLocation();
  const contentScrollRef = useRef(null);
  const lastScrollY = useRef(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  // বই পড়ার পেজগুলোতে (ড্যাশবোর্ড ও প্রতিটি শব্দ) সাইডবার দেখানো হয়
  const showSidebar =
    location.pathname === '/ml/dashboard' || location.pathname.startsWith('/ml/word/');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = showSidebar ? contentScrollRef.current?.scrollTop : window.scrollY;

      if (scrollY === undefined) return;

      if (scrollY > lastScrollY.current + 15) {
        setIsScrollingDown(true);
        lastScrollY.current = scrollY;
      } else if (scrollY < lastScrollY.current - 15) {
        setIsScrollingDown(false);
        lastScrollY.current = scrollY;
      }
    };

    const scrollContainer = showSidebar ? contentScrollRef.current : window;

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [showSidebar]);

  useEffect(() => {
    setIsScrollingDown(false);
    lastScrollY.current = 0;
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div
      className={`flex flex-col bg-[#0b0f19] font-sans antialiased text-slate-200 ${
        showSidebar ? 'h-[100dvh] overflow-hidden' : 'min-h-screen overflow-x-hidden'
      }`}
    >
      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} isScrollingDown={isScrollingDown} />

      <div
        className={`relative flex flex-1 pt-16 sm:pt-18 lg:pt-20 ${
          showSidebar ? 'min-h-0 overflow-hidden' : ''
        }`}
      >
        {showSidebar && (
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            closeMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div
          ref={contentScrollRef}
          className={`flex-1 flex flex-col bg-[#0b0f19] ${
            showSidebar ? 'min-h-0 overflow-y-auto custom-scrollbar' : 'w-full'
          }`}
        >
          <main className="flex-1">
            <Outlet />
          </main>

          {!showSidebar && <Footer />}
        </div>
      </div>

      {/* গ্লোবাল রিডিং মোড ফ্লোটিং বাটন */}
      <ReadModeWidget isScrollingDown={isScrollingDown} />
    </div>
  );
}
