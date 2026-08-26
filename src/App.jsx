import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';

import PageLoader from './components/UI/PageLoader';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

// Suspense fallback নিজে lazy হতে পারে না — হলে ফলব্যাকটাই আবার suspend করত।
import HubHomeSkeleton from './pages/Hub/HubHomeSkeleton';
import ProfileDashboardSkeleton from './pages/Profile/ProfileDashboardSkeleton';

/* ── কেন্দ্রীয় হাব (Learn with Ramim) ───────────────────────────────────── */
const HubHome = lazy(() => import('./pages/Hub/HubHome'));
const HubLayout = lazy(() => import('./layout/Hub/HubLayout'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const TermsConditions = lazy(() => import('./pages/Legal/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy'));

/* ── সাব-সাইট ০১: এমএল বই (/ml) ─────────────────────────────────────────── */
const MLLayout = lazy(() => import('./layout/ML/MLLayout'));
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const Home = lazy(() => import('./pages/Home/Home'));
const BookStart = lazy(() => import('./components/MachineLearning/start/BookStart'));
const BookReader = lazy(() => import('./pages/BookReader/BookReader'));
const MLTopics = lazy(() => import('./pages/MLTopics/MLTopics'));
const Books = lazy(() => import('./pages/Books/Books'));
const BlogLanding = lazy(() => import('./pages/Blog/BlogLanding'));
const DynamicBlogReader = lazy(() => import('./pages/Blog/DynamicBlogReader'));
const Bookmarks = lazy(() => import('./pages/Bookmarks/Bookmarks'));

/* ── সাব-সাইট ০২: একাডেমিক হাব (/academic) ──────────────────────────────── */
const AcademicLayout = lazy(() => import('./layout/Academic/AcademicLayout'));
const AcademicHome = lazy(() => import('./pages/Academic/AcademicHome'));
const DynamicAcademicSubjectHome = lazy(() => import('./pages/Academic/DynamicAcademicSubjectHome'));
const DynamicAcademicChapterDetails = lazy(() => import('./pages/Academic/DynamicAcademicChapterDetails'));
const DynamicBoardQuestionsList = lazy(() => import('./pages/Academic/DynamicBoardQuestionsList'));
const DynamicBoardQuestionViewer = lazy(() => import('./pages/Academic/DynamicBoardQuestionViewer'));
const SSCDashboard = lazy(() => import('./pages/Academic/SSC/SSCDashboard'));
const HSCDashboard = lazy(() => import('./pages/Academic/HSC/HSCDashboard'));
const AdmissionDashboard = lazy(() => import('./pages/Academic/Admission/AdmissionDashboard'));
const AdmissionShortcuts = lazy(() => import('./pages/Academic/Admission/AdmissionShortcuts'));
const AdmissionQuestionBank = lazy(() => import('./pages/Academic/Admission/AdmissionQuestionBank'));
const AdmissionModelTest = lazy(() => import('./pages/Academic/Admission/AdmissionModelTest'));
const MedicalDashboard = lazy(() => import('./pages/Academic/Admission/Medical/MedicalDashboard'));
const MedicalSubjectHome = lazy(() => import('./pages/Academic/Admission/Medical/MedicalSubjectHome'));
const MedicalChapterDetails = lazy(() => import('./pages/Academic/Admission/Medical/MedicalChapterDetails'));
const MedicalExamViewer = lazy(() => import('./pages/Academic/Admission/Medical/MedicalExamViewer'));
const NursingHub = lazy(() => import('./pages/Academic/Admission/Nursing/NursingHub'));
const NursingTrackDashboard = lazy(() => import('./pages/Academic/Admission/Nursing/NursingTrackDashboard'));
const EngineeringDashboard = lazy(() => import('./pages/Academic/Admission/Engineering/EngineeringDashboard'));
const VarsityADashboard = lazy(() => import('./pages/Academic/Admission/VarsityA/VarsityADashboard'));
const GSTDashboard = lazy(() => import('./pages/Academic/Admission/GST/GSTDashboard'));
const AgriDashboard = lazy(() => import('./pages/Academic/Admission/Agri/AgriDashboard'));
const VarsityOthersDashboard = lazy(() => import('./pages/Academic/Admission/VarsityOthers/VarsityOthersDashboard'));
const PastQuestionsPage = lazy(() => import('./pages/Academic/Admission/PastQuestionsPage'));
const ModelTestPage = lazy(() => import('./pages/Academic/Admission/ModelTestPage'));
const HighlightedLinesPage = lazy(() => import('./pages/Academic/Admission/HighlightedLinesPage'));
const MnemonicsPage = lazy(() => import('./pages/Academic/Admission/MnemonicsPage'));
const ExamSchedulePage = lazy(() => import('./pages/Academic/Admission/ExamSchedule/ExamSchedulePage'));
const AdmissionCalculatorPage = lazy(() => import('./pages/Academic/Admission/AdmissionCalculatorPage'));
const ShortcutDashboard = lazy(() => import('./pages/Academic/Shortcut/ShortcutDashboard'));
const ChapterShortcutViewer = lazy(() => import('./pages/Academic/Shortcut/ChapterShortcutViewer'));
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
const MistakePage = lazy(() => import('./pages/Academic/Mistakes/MistakePage'));
const ComingSoon = lazy(() => import('./pages/Academic/ComingSoon'));

/* ── দুই সাব-সাইটেই ব্যবহৃত গ্লোবাল পেজ ─────────────────────────────────── */
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const ProfileDashboard = lazy(() => import('./pages/Profile/ProfileDashboard'));
const Leaderboard = lazy(() => import('./pages/Leaderboard/Leaderboard'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

/**
 * পুরনো রুট-লেভেল URL গুলোকে নতুন /ml/* এ পাঠায়।
 * `to` না দিলে বর্তমান pathname এর আগে /ml বসিয়ে দেয়।
 */
function LegacyMLRedirect({ to }) {
  const location = useLocation();
  const target = to ?? `/ml${location.pathname}`;
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0b0f19] font-sans antialiased text-slate-200">
      {/* রুট বদলালে ক্র্যাশ থেকে নিজে থেকেই সেরে ওঠে */}
      <ErrorBoundary locationKey={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── কেন্দ্রীয় হাব ─────────────────────────────────────────── */}
            {/* নিজস্ব Suspense সীমা — বাইরের সাধারণ স্পিনারের বদলে হাব পেজের
              আকৃতির স্কেলিটন দেখায়, তাই চাঙ্ক এলে লেআউট নড়ে না */}
            <Route
              path="/"
              element={
                <Suspense fallback={<HubHomeSkeleton />}>
                  <HubHome />
                </Suspense>
              }
            />

            <Route element={<HubLayout />}>
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Route>

            {/* ── সাব-সাইট ০১: এমএল বই ──────────────────────────────────── */}
            <Route path="/ml" element={<MLLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="dashboard" element={<Home />} />
              <Route path="start" element={<BookStart />} />
              <Route path="word/:wordPath" element={<BookReader />} />
              <Route path="topics" element={<MLTopics />} />
              <Route path="books" element={<Books />} />
              <Route path="blog" element={<BlogLanding />} />
              <Route path="blog/:blogSlug" element={<DynamicBlogReader />} />
              <Route path="bookmarks" element={<Bookmarks />} />
            </Route>

            {/* ── সাব-সাইট ০২: একাডেমিক হাব ─────────────────────────────── */}
            <Route path="/academic" element={<AcademicLayout />}>
              <Route index element={<AcademicHome />} />

              <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                {/* চাঙ্ক লোড ও ডেটা লোড — দুই ধাপেই একই স্কেলিটন, তাই কোনো ঝাঁকুনি নেই */}
                <Route
                  path="profile"
                  element={
                    <Suspense fallback={<ProfileDashboardSkeleton />}>
                      <ProfileDashboard />
                    </Suspense>
                  }
                />
                <Route path="subscription" element={<Navigate to="/academic" replace />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="shortcut" element={<ShortcutDashboard />} />
                <Route path="shortcut/:educationLevel/:subject/:chapterId" element={<ChapterShortcutViewer />} />
                <Route path="question-bank" element={<QuestionBankDashboard />} />
                <Route path="question-builder" element={<QuestionBuilder />} />
                <Route path="mistakes" element={<MistakePage />} />

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
                <Route path="admission/exam-schedule" element={<ExamSchedulePage />} />
                <Route path="admission/mistakes" element={<MistakePage />} />
                <Route path="admission/shortcuts" element={<AdmissionShortcuts />} />
                <Route path="admission/question-bank" element={<AdmissionQuestionBank />} />
                <Route path="admission/model-test" element={<AdmissionModelTest />} />
                <Route path="admission/medical" element={<MedicalDashboard />} />
                <Route path="admission/medical/:subjectSlug" element={<MedicalSubjectHome />} />
                <Route path="admission/medical/:subjectSlug/:chapterId" element={<MedicalChapterDetails />} />
                <Route path="admission/medical/exam/:examType/:year" element={<MedicalExamViewer />} />
                <Route path="admission/medical/session/:year" element={<MedicalExamViewer />} />
                <Route path="admission/nursing" element={<NursingHub />} />
                <Route path="admission/nursing/:trackId" element={<NursingTrackDashboard />} />
                <Route path="admission/nursing/:trackId/past-questions" element={<PastQuestionsPage />} />
                <Route path="admission/engineering" element={<EngineeringDashboard />} />
                <Route path="admission/varsity-a" element={<VarsityADashboard />} />
                <Route path="admission/varsity-b" element={<ComingSoon title="ভার্সিটি খ-ইউনিট (মানবিক)" description="ঢাকা বিশ্ববিদ্যালয় 'খ' ইউনিটসহ সকল বিশ্ববিদ্যালয়ের কলা ও মানবিক অনুষদের প্রশ্নব্যাংক ও প্রস্তুতি তৈরি হচ্ছে।" />} />
                <Route path="admission/varsity-c" element={<ComingSoon title="ভার্সিটি গ-ইউনিট (বাণিজ্য)" description="ঢাকা বিশ্ববিদ্যালয় 'গ' ইউনিটসহ সকল বিশ্ববিদ্যালয়ের ব্যবসায় শিক্ষা অনুষদের প্রশ্নব্যাংক ও প্রস্তুতি তৈরি হচ্ছে।" />} />
                <Route path="admission/gst" element={<GSTDashboard />} />
                <Route path="admission/agri" element={<AgriDashboard />} />
                <Route path="admission/iba-bup" element={<ComingSoon title="IBA ও BUP ভর্তি প্রস্তুতি" description="আইবিএ ও বিইউপি ভর্তি পরীক্ষার বিগত সালের প্রশ্নব্যাংক ও প্র্যাকটিস মডিউল তৈরি হচ্ছে।" />} />
                <Route path="admission/varsity-others" element={<VarsityOthersDashboard />} />

                {/* ── Dedicated Past Questions routes ───────────────────── */}
                <Route path="admission/medical/past-questions" element={<PastQuestionsPage />} />
                <Route path="admission/engineering/past-questions" element={<PastQuestionsPage />} />
                <Route path="admission/varsity-a/past-questions" element={<PastQuestionsPage />} />
                <Route path="admission/gst/past-questions" element={<PastQuestionsPage />} />
                <Route path="admission/agri/past-questions" element={<PastQuestionsPage />} />
                <Route path="admission/varsity-others/past-questions" element={<PastQuestionsPage />} />

                {/* ── Dedicated Model Test routes ──────────────────────────── */}
                <Route path="admission/medical/model-test" element={<ModelTestPage />} />
                <Route path="admission/nursing/:trackId/model-test" element={<ModelTestPage />} />
                <Route path="admission/engineering/model-test" element={<ModelTestPage />} />
                <Route path="admission/varsity-a/model-test" element={<ModelTestPage />} />
                <Route path="admission/gst/model-test" element={<ModelTestPage />} />
                <Route path="admission/agri/model-test" element={<ModelTestPage />} />
                <Route path="admission/varsity-others/model-test" element={<ModelTestPage />} />

                {/* ── Dedicated Highlighted Lines & Subjects routes ─────────── */}
                <Route path="admission/medical/highlighted-lines" element={<HighlightedLinesPage />} />
                <Route path="admission/nursing/:trackId/highlighted-lines" element={<HighlightedLinesPage />} />
                <Route path="admission/engineering/highlighted-lines" element={<HighlightedLinesPage />} />
                <Route path="admission/varsity-a/highlighted-lines" element={<HighlightedLinesPage />} />
                <Route path="admission/gst/highlighted-lines" element={<HighlightedLinesPage />} />
                <Route path="admission/agri/highlighted-lines" element={<HighlightedLinesPage />} />
                <Route path="admission/varsity-others/highlighted-lines" element={<HighlightedLinesPage />} />

                {/* ── Dedicated Mnemonics & Shortcuts routes ───────────────── */}
                <Route path="admission/medical/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/nursing/:trackId/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/nursing/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/engineering/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/varsity-a/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/gst/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/agri/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/varsity-others/mnemonics" element={<MnemonicsPage />} />
                <Route path="admission/calculator" element={<AdmissionCalculatorPage />} />
                <Route path="admission/eligibility" element={<AdmissionCalculatorPage />} />
                <Route path="admission/chance-predictor" element={<AdmissionCalculatorPage />} />

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

                {/* ড্যাশবোর্ডের কুইক-অ্যাকশন ও sitemap এ এই পাঁচটি আগে থেকেই বিজ্ঞাপন
                  দেওয়া, কিন্তু পেজ বানানো হয়নি — আগে "পেজ পাওয়া যায়নি" আসত */}
                <Route path="suggestion" element={<ComingSoon title="সাজেশন" description="বিষয়ভিত্তিক ফাইনাল সাজেশন তৈরি হচ্ছে। প্রকাশ হলেই এখানে পেয়ে যাবে।" />} />
                <Route path="syllabus" element={<ComingSoon title="সিলেবাস" description="বোর্ড অনুযায়ী সিলেবাস গুছিয়ে তোলার কাজ চলছে।" />} />
                <Route path="routine" element={<ComingSoon title="রুটিন" description="পড়ার রুটিন বানানোর টুল শীঘ্রই আসছে।" />} />
                <Route path="result" element={<ComingSoon title="রেজাল্ট" description="পরীক্ষার ফলাফল দেখার সুবিধা তৈরি হচ্ছে।" />} />
                <Route path="timer" element={<ComingSoon title="স্টাডি টাইমার" description="পড়ার সময় মাপার টাইমার শীঘ্রই যুক্ত হবে।" />} />
              </Route>
            </Route>

            {/* ── গ্লোবাল (কোনো সাব-সাইটের অংশ নয়) ──────────────────────── */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ── পুরনো URL → নতুন /ml/* (SEO ও শেয়ার করা লিংক রক্ষার জন্য) ─ */}
            <Route path="/dashboard" element={<LegacyMLRedirect />} />
            <Route path="/start" element={<LegacyMLRedirect />} />
            <Route path="/word/*" element={<LegacyMLRedirect />} />
            <Route path="/books" element={<LegacyMLRedirect />} />
            <Route path="/blog/*" element={<LegacyMLRedirect />} />
            <Route path="/bookmarks" element={<LegacyMLRedirect />} />
            <Route path="/ml-topics" element={<LegacyMLRedirect to="/ml/topics" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
