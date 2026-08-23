import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

/**
 * রেন্ডারের সময় কোনো কম্পোনেন্ট ক্র্যাশ করলে React পুরো ট্রি খুলে ফেলে —
 * ফলাফল একটা সাদা স্ক্রিন, ফেরার উপায় নেই। পরীক্ষা চলাকালে এমন হলে
 * ছাত্রের পরীক্ষাটাই নষ্ট হয়। তাই ক্র্যাশ ধরে অন্তত ফেরার পথ দেখাই।
 *
 * এটি ক্লাস কম্পোনেন্ট হতেই হবে — `componentDidCatch` এর কোনো হুক সংস্করণ নেই।
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // পরে Sentry/LogRocket বসালে এখানেই পাঠানো হবে
    console.error('ErrorBoundary ধরেছে:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-7 w-7" />
          </span>

          <h1 className="mb-2 text-lg font-black text-white">কিছু একটা ভুল হয়েছে</h1>
          <p className="mb-5 text-sm leading-relaxed text-slate-400">
            পাতাটি দেখাতে সমস্যা হচ্ছে। আবার চেষ্টা করুন — না হলে হোমে ফিরে যান।
            আপনার সংরক্ষিত কাজ হারায়নি।
          </p>

          {import.meta.env.DEV && (
            <pre className="mb-5 max-h-40 overflow-auto rounded-lg bg-slate-950 p-3 text-left text-[11px] leading-relaxed text-rose-300">
              {String(error?.stack || error)}
            </pre>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={this.handleRetry}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 active:scale-95"
            >
              <RotateCcw className="h-4 w-4" /> আবার চেষ্টা করুন
            </button>
            <a
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800"
            >
              <Home className="h-4 w-4" /> হোমে ফিরুন
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
