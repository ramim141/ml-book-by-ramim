import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050b12] px-6 text-center text-slate-200">
      <SEO 
        title="404 - Page Not Found" 
        description="আপনি যে পেইজটি খুঁজছেন তা পাওয়া যায়নি। Page not found." 
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <h1 className="mb-4 text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
          404
        </h1>
        <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">
          পেইজটি পাওয়া যায়নি!
        </h2>
        <p className="mb-8 text-slate-400">
          আপনি হয়তো ভুল লিংকে ক্লিক করেছেন অথবা পেইজটি সরিয়ে ফেলা হয়েছে। দয়া করে সঠিক লিংক চেক করুন অথবা হোমপেইজে ফিরে যান।
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link 
            to="/" 
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium transition-colors hover:bg-indigo-700 sm:w-auto"
          >
            <Home size={18} />
            হোমপেইজে যান
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-transparent px-6 py-3 font-medium transition-colors hover:bg-slate-800 sm:w-auto"
          >
            <ArrowLeft size={18} />
            পেছনে ফিরুন
          </button>
        </div>
      </motion.div>
    </main>
  );
}
