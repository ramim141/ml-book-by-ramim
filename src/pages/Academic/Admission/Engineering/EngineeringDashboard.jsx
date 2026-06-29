import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';

export default function EngineeringDashboard() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1c] pb-24 sm:pb-10 pt-10 font-bangla selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <Link to="/academic/admission" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition mb-2">
              <ArrowLeft className="h-4 w-4" /> অ্যাডমিশনে ফিরে যান
            </Link>
            <h1 className="text-3xl font-black text-white">ইঞ্জিনিয়ারিং ভর্তি প্রস্তুতি</h1>
            <p className="text-slate-400 text-sm mt-1">বুয়েট, চুয়েট, রুয়েট, কুয়েট ভর্তি পরীক্ষার সম্পূর্ণ গাইডলাইন ও প্র্যাকটিস</p>
          </div>
        </div>

        {/* Coming Soon Box */}
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 border border-slate-700/50 rounded-3xl text-center px-4 backdrop-blur-md">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-200">ইঞ্জিনিয়ারিং ভর্তি প্রস্তুতি শীঘ্রই আসছে!</h2>
          <p className="text-slate-500 text-sm max-w-md mt-2 font-medium">
            আমরা বুয়েট এবং প্রকৌশল বিশ্ববিদ্যালয়সমূহের ভর্তি পরীক্ষার জন্য বিশেষ কন্টেন্ট, প্রশ্নব্যাংক এবং মডেল টেস্ট তৈরি করছি। খুব দ্রুতই এই সেকশনটি উন্মুক্ত করা হবে।
          </p>
        </div>
      </div>
    </div>
  );
}
