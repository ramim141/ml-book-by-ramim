import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import ReadModeWidget from './components/UI/ReadModeWidget';

import PageLoader from './components/UI/PageLoader';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const ProfileDashboard = lazy(() => import('./pages/Profile/ProfileDashboard'));
const Leaderboard = lazy(() => import('./pages/Leaderboard/Leaderboard'));

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

const AcademicLayout = lazy(() => import('./layout/Academic/AcademicLayout'));
const AcademicHome = lazy(() => import('./pages/Academic/AcademicHome'));
const DynamicAcademicSubjectHome = lazy(() => import('./pages/Academic/DynamicAcademicSubjectHome'));
const DynamicAcademicChapterDetails = lazy(() => import('./pages/Academic/DynamicAcademicChapterDetails'));
const DynamicBoardQuestionsList = lazy(() => import('./pages/Academic/DynamicBoardQuestionsList'));
const DynamicBoardQuestionViewer = lazy(() => import('./pages/Academic/DynamicBoardQuestionViewer'));
const SSCDashboard = lazy(() => import('./pages/Academic/SSC/SSCDashboard'));
const AdmissionDashboard = lazy(() => import('./pages/Academic/Admission/AdmissionDashboard'));
const MedicalDashboard = lazy(() => import('./pages/Academic/Admission/Medical/MedicalDashboard'));
const EngineeringDashboard = lazy(() => import('./pages/Academic/Admission/Engineering/EngineeringDashboard'));
const VarsityADashboard = lazy(() => import('./pages/Academic/Admission/VarsityA/VarsityADashboard'));
const GSTDashboard = lazy(() => import('./pages/Academic/Admission/GST/GSTDashboard'));
const AgriDashboard = lazy(() => import('./pages/Academic/Admission/Agri/AgriDashboard'));
const VarsityOthersDashboard = lazy(() => import('./pages/Academic/Admission/VarsityOthers/VarsityOthersDashboard'));
const ShortcutDashboard = lazy(() => import('./pages/Academic/Shortcut/ShortcutDashboard'));
const ChapterShortcutViewer = lazy(() => import('./pages/Academic/Shortcut/ChapterShortcutViewer'));
const HSCDashboard = lazy(() => import('./pages/Academic/HSC/HSCDashboard'));
const ICTSubjectHome = lazy(() => import('./pages/Academic/HSC/ICT/ICTSubjectHome'));
const ChapterDetails = lazy(() => import('./pages/Academic/HSC/ICT/ChapterDetails'));
const BoardQuestionsList = lazy(() => import('./pages/Academic/HSC/ICT/BoardQuestionsList'));
const BoardQuestionViewer = lazy(() => import('./pages/Academic/HSC/ICT/BoardQuestionViewer'));

const ChemistrySubjectHome = lazy(() => import('./pages/Academic/HSC/Chemistry/ChemistrySubjectHome'));
const ChemistryChapterDetails = lazy(() => import('./pages/Academic/HSC/Chemistry/ChapterDetails'));
const ChemistryBoardQuestionsList = lazy(() => import('./pages/Academic/HSC/Chemistry/BoardQuestionsList'));
const ChemistryBoardQuestionViewer = lazy(() => import('./pages/Academic/HSC/Chemistry/BoardQuestionViewer'));

const SSCPhysicsSubjectHome = lazy(() => import('./pages/Academic/SSC/Physics/PhysicsSubjectHome'));
const SSCChemistrySubjectHome = lazy(() => import('./pages/Academic/SSC/Chemistry/ChemistrySubjectHome'));
const SSCMathSubjectHome = lazy(() => import('./pages/Academic/SSC/Math/MathSubjectHome'));
const SSCHigherMathSubjectHome = lazy(() => import('./pages/Academic/SSC/HigherMath/HigherMathSubjectHome'));
const SSCBiologySubjectHome = lazy(() => import('./pages/Academic/SSC/Biology/BiologySubjectHome'));
const QuestionBankDashboard = lazy(() => import('./pages/Academic/QuestionBank/QuestionBankDashboard'));
const CQQuestionViewer = lazy(() => import('./pages/Academic/QuestionBank/CQQuestionViewer'));
const MCQQuestionViewer = lazy(() => import('./pages/Academic/QuestionBank/MCQQuestionViewer'));
const KnowledgeQuestionViewer = lazy(() => import('./pages/Academic/QuestionBank/KnowledgeQuestionViewer'));
const QuestionBuilder = lazy(() => import('./pages/Academic/QuestionBuilder/QuestionBuilder'));

const ModelTestConfig = lazy(() => import('./pages/Academic/ModelTest/ModelTestConfig'));
const ModelTestExam = lazy(() => import('./pages/Academic/ModelTest/ModelTestExam'));
const ModelTestResult = lazy(() => import('./pages/Academic/ModelTest/ModelTestResult'));

const LiveExamList = lazy(() => import('./pages/Academic/ModelTest/LiveExamList'));
const LiveExamEngine = lazy(() => import('./pages/Academic/ModelTest/LiveExamEngine'));
const LiveExamResult = lazy(() => import('./pages/Academic/ModelTest/LiveExamResult'));
const LiveExamLeaderboard = lazy(() => import('./pages/Academic/ModelTest/LiveExamLeaderboard'));

const PeriodicTable = lazy(() => import('./pages/Academic/Tools/PeriodicTable'));
const BaseConverter = lazy(() => import('./pages/Academic/Tools/BaseConverter'));
const LogicGateSimulator = lazy(() => import('./pages/Academic/Tools/LogicGateSimulator'));
const GraphingTool = lazy(() => import('./pages/Academic/Tools/GraphingTool'));
const SmartFormulaSheet = lazy(() => import('./pages/Academic/Tools/SmartFormulaSheet'));

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const contentScrollRef = useRef(null);

  const showSidebar = location.pathname === '/dashboard' || location.pathname.startsWith('/word/');
  const isAcademic = location.pathname.startsWith('/academic');
  const showNavbar = !isAcademic && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/admin';
  const showFooter = !isAcademic && !showSidebar && !location.pathname.startsWith('/word/') && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/admin';

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
    <div className={`flex flex-col bg-[#0b0f19] font-sans antialiased text-slate-200 ${showSidebar ? 'h-[100dvh] overflow-hidden' : `min-h-screen ${isAcademic ? '' : 'overflow-x-hidden'}`}`}>

      {showNavbar && (
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} isScrollingDown={isScrollingDown} />
      )}

      <div className={`relative flex flex-1 ${showNavbar ? 'pt-16 sm:pt-18 lg:pt-20' : ''} ${showSidebar ? 'min-h-0 overflow-hidden' : ''}`}>

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
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />


                <Route path="/start" element={<BookStart />} />
                <Route path="/word/:wordPath" element={<BookReader />} />
                <Route path="/terms" element={<TermsConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/books" element={<Books />} />

                <Route path="/blog" element={<BlogLanding />} />
                <Route path="/blog/:blogSlug" element={<DynamicBlogReader />} />
                <Route path="/bookmarks" element={<Bookmarks />} />

                {/* Academic Sub-website */}
                <Route path="/academic" element={<AcademicLayout />}>
                  <Route index element={<AcademicHome />} />
                  
                  <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                    <Route path="profile" element={<ProfileDashboard />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="shortcut" element={<ShortcutDashboard />} />
                    <Route path="shortcut/:educationLevel/:subject/:chapterId" element={<ChapterShortcutViewer />} />
                    <Route path="question-bank" element={<QuestionBankDashboard />} />
                    <Route path="question-builder" element={<QuestionBuilder />} />
                    
                    {/* Model Test */}
                    <Route path="model-test" element={<ModelTestConfig />} />
                    <Route path="model-test/exam" element={<ModelTestExam />} />
                    <Route path="model-test/result" element={<ModelTestResult />} />
                    
                    {/* Live Exams */}
                    <Route path="live-exams" element={<LiveExamList />} />
                    <Route path="live-exam/:examId" element={<LiveExamEngine />} />
                    <Route path="live-exam/:examId/result" element={<LiveExamResult />} />
                    <Route path="live-exam/:examId/leaderboard" element={<LiveExamLeaderboard />} />

                    <Route path="ssc" element={<SSCDashboard />} />
                    
                    <Route path="hsc" element={<HSCDashboard />} />
                    <Route path="admission" element={<AdmissionDashboard />} />
                    <Route path="admission/medical" element={<MedicalDashboard />} />
                    <Route path="admission/engineering" element={<EngineeringDashboard />} />
                    <Route path="admission/varsity-a" element={<VarsityADashboard />} />
                    <Route path="admission/gst" element={<GSTDashboard />} />
                    <Route path="admission/agri" element={<AgriDashboard />} />
                    <Route path="admission/varsity-others" element={<VarsityOthersDashboard />} />

                    <Route path=":educationLevel/:subject/cq" element={<CQQuestionViewer />} />
                    <Route path=":educationLevel/:subject/mcq" element={<MCQQuestionViewer />} />
                    <Route path=":educationLevel/:subject/knowledge" element={<KnowledgeQuestionViewer />} />
                    <Route path=":educationLevel/:subject/board-questions" element={<DynamicBoardQuestionsList />} />
                    <Route path=":educationLevel/:subject/board-questions/:boardName/:year" element={<DynamicBoardQuestionViewer />} />
                    <Route path=":educationLevel/:subject/:chapterId" element={<DynamicAcademicChapterDetails />} />
                    <Route path=":educationLevel/:subject" element={<DynamicAcademicSubjectHome />} />

                    <Route path="periodic-table" element={<PeriodicTable />} />
                    <Route path="base-converter" element={<BaseConverter />} />
                    <Route path="logic-gate" element={<LogicGateSimulator />} />
                    <Route path="graphing-tool" element={<GraphingTool />} />
                    <Route path="formula-sheet" element={<SmartFormulaSheet />} />
                  </Route>
                </Route>


                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>


          {showFooter && <Footer />}

        </div>
      </div>

      {/* গ্লোবাল রিডিং মোড ফ্লোটিং বাটন */}
      <ReadModeWidget isScrollingDown={isScrollingDown} />
      
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
