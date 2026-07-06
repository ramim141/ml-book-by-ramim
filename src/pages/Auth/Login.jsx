import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../config/roles';
import { Mail, Lock, AlertCircle, Loader2, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const userCredential = await login(email, password);
      
      if (isAdmin(userCredential.user.email)) {
        navigate('/admin');
      } else {
        // Log the student login to admin_activity
        try {
          const { getFirestore, addDoc, collection, serverTimestamp } = await import('firebase/firestore');
          const db = getFirestore();
          await addDoc(collection(db, 'admin_activity'), {
            type: 'login',
            message: 'স্টুডেন্ট লগইন করেছেন',
            userEmail: userCredential.user.email,
            timestamp: serverTimestamp(),
            read: false
          });
        } catch (logError) {
          console.error("Failed to log activity:", logError);
        }
        
        navigate('/academic');
      }
    } catch (err) {
      console.error(err);
      setError('লগইন ব্যর্থ হয়েছে। ইমেইল বা পাসওয়ার্ড ভুল হতে পারে।');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-bangla relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-5 sm:space-y-8 bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800 backdrop-blur-xl relative z-10 shadow-2xl">
        <div>
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            লগইন করুন
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-slate-400 font-medium">
            অ্যাডমিন প্যানেলে প্রবেশ করতে আপনার ইমেইল ও পাসওয়ার্ড দিন
          </p>
        </div>
        
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-500"
                placeholder="ইমেইল অ্যাড্রেস"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-500"
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'লগইন করুন'
              )}
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400 backdrop-blur-xl">অথবা</span>
            </div>
          </div>
          
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              try {
                setError('');
                setLoading(true);
                const userCredential = await loginWithGoogle();
                
                if (isAdmin(userCredential.user.email)) {
                  navigate('/admin');
                } else {
                  // Log the student login to admin_activity
                  try {
                    const { getFirestore, addDoc, collection, serverTimestamp } = await import('firebase/firestore');
                    const db = getFirestore();
                    await addDoc(collection(db, 'admin_activity'), {
                      type: 'login',
                      message: 'স্টুডেন্ট গুগল দিয়ে লগইন করেছেন',
                      userEmail: userCredential.user.email,
                      timestamp: serverTimestamp(),
                      read: false
                    });
                  } catch (logError) {
                    console.error("Failed to log activity:", logError);
                  }
                  
                  navigate('/academic');
                }
              } catch (err) {
                console.error(err);
                setError('Google দিয়ে লগইন করা যায়নি।');
                setLoading(false);
              }
            }}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 px-2 sm:px-4 border border-slate-700/50 rounded-xl bg-slate-800/50 hover:bg-slate-700/80 transition-all text-slate-200 font-bold focus:outline-none focus:ring-4 focus:ring-slate-700/50 whitespace-nowrap text-sm sm:text-base"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Google দিয়ে লগইন করুন</span>
          </button>
          
          <div className="text-center text-sm text-slate-400">
            অ্যাকাউন্ট নেই?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
