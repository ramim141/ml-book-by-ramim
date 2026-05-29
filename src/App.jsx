import { useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import ReadModeWidget from './components/UI/ReadModeWidget';


import Home from './pages/Home/Home';
import LandingPage from './pages/Landing/LandingPage';
import MLTopics from './pages/MLTopics/MLTopics';
import Contact from './pages/Contact/Contact';
import About from './pages/About/About';
import BookReader from './pages/BookReader/BookReader';
import BookStart from './components/MachineLearning/start/BookStart';
import TermsConditions from './pages/Legal/TermsConditions';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import Books from './pages/Books/Books';

import BlogLanding from './pages/Blog/BlogLanding';
import DynamicBlogReader from './pages/Blog/DynamicBlogReader';


function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const contentScrollRef = useRef(null);


  const showSidebar = location.pathname === '/dashboard' || location.pathname.startsWith('/word/');
  const showFooter = !showSidebar && !location.pathname.startsWith('/word/');

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className={`flex flex-col bg-[#0b0f19] font-sans antialiased text-slate-200 ${showSidebar ? 'h-[100dvh] overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}>

      <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />

      <div className={`relative flex flex-1 pt-16 sm:pt-18 lg:pt-20 ${showSidebar ? 'min-h-0 overflow-hidden' : ''}`}>

        {showSidebar && (
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            closeMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div ref={contentScrollRef} className={`flex-1 flex flex-col bg-[#0b0f19] ${showSidebar ? 'min-h-0 overflow-y-auto custom-scrollbar' : 'w-full'}`}>

          <main className="flex-1">
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


              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>


          {showFooter && <Footer />}

        </div>
      </div>

      {/* গ্লোবাল রিডিং মোড ফ্লোটিং বাটন */}
      <ReadModeWidget />
    </div>
  );
}

export default App;
