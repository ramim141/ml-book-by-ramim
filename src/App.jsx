import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import ReadModeWidget from './components/UI/ReadModeWidget';


import PageLoader from './components/UI/PageLoader';

const Home = lazy(() => import('./pages/Home/Home'));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const MLTopics = lazy(() => import('./pages/MLTopics/MLTopics'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const About = lazy(() => import('./pages/About/About'));
const BookReader = lazy(() => import('./pages/BookReader/BookReader'));
const BookStart = lazy(() => import('./components/MachineLearning/start/BookStart'));
const TermsConditions = lazy(() => import('./pages/Legal/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));
const Books = lazy(() => import('./pages/Books/Books'));

const BlogLanding = lazy(() => import('./pages/Blog/BlogLanding'));
const DynamicBlogReader = lazy(() => import('./pages/Blog/DynamicBlogReader'));
const Bookmarks = lazy(() => import('./pages/Bookmarks/Bookmarks'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));


function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const contentScrollRef = useRef(null);


  const showSidebar = location.pathname === '/dashboard' || location.pathname.startsWith('/word/');
  const showFooter = !showSidebar && !location.pathname.startsWith('/word/');

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

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
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className={`flex flex-col bg-[#0b0f19] font-sans antialiased text-slate-200 ${showSidebar ? 'h-[100dvh] overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}>

      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} isScrollingDown={isScrollingDown} />

      <div className={`relative flex flex-1 pt-16 sm:pt-18 lg:pt-20 ${showSidebar ? 'min-h-0 overflow-hidden' : ''}`}>

        {showSidebar && (
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            closeMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div ref={contentScrollRef} className={`flex-1 flex flex-col bg-[#0b0f19] ${showSidebar ? 'min-h-0 overflow-y-auto custom-scrollbar' : 'w-full'}`}>

          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Home />} />
                <Route path="/ml-topics" element={<MLTopics />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />


                <Route path="/start" element={<BookStart />} />
                <Route path="/word/:wordPath" element={<BookReader />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/books" element={<Books />} />

                <Route path="/blog" element={<BlogLanding />} />
                <Route path="/blog/:blogSlug" element={<DynamicBlogReader />} />
                <Route path="/bookmarks" element={<Bookmarks />} />


                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>


          {showFooter && <Footer />}

        </div>
      </div>

      {/* গ্লোবাল রিডিং মোড ফ্লোটিং বাটন */}
      <ReadModeWidget isScrollingDown={isScrollingDown} />
    </div>
  );
}

export default App;
