import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Hammer, Library, Target } from 'lucide-react';

/**
 * এই রুটগুলো ড্যাশবোর্ডের কুইক-অ্যাকশন ও sitemap-এ আগে থেকেই বিজ্ঞাপন দেওয়া,
 * কিন্তু পেজ বানানো হয়নি — ফলে ক্লিক করলে "পেজ পাওয়া যায়নি" আসত।
 * তার বদলে এখানে স্পষ্ট করে জানানো হয় যে ফিচারটি তৈরি হচ্ছে।
 */
export default function ComingSoon({
  title = 'শীঘ্রই আসছে',
  description = 'এই ফিচারটি নিয়ে কাজ চলছে। খুব শিগগিরই এখানে পাবে।',
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      {/* react-helmet-async এ <title> এর সন্তান একটাই টেক্সট নোড হতে হয় —
          {title} | ... লিখলে দুইটা সন্তান হয় আর title নীরবে বাদ পড়ে।
          তৈরি না হওয়া পেজ সার্চ ইঞ্জিনে ইনডেক্স হওয়ারও দরকার নেই। */}
      <Helmet>
        <title>{`${title} | একাডেমিক হাব`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
          <Hammer className="h-7 w-7" />
        </div>

        <span className="inline-block rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-amber-300">
          তৈরি হচ্ছে
        </span>

        <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
          {description}
        </p>

        <div className="mt-8">
          <p className="mb-3 text-xs font-bold text-slate-500">ততক্ষণে এগুলো দেখতে পারো</p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link
              to="/academic/question-bank"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-4 py-2.5 text-sm font-extrabold text-indigo-200 transition hover:bg-indigo-500/25 active:scale-95"
            >
              <Library className="h-4 w-4" /> প্রশ্নব্যাংক
            </Link>
            <Link
              to="/academic/model-test"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-extrabold text-slate-200 transition hover:bg-slate-800 active:scale-95"
            >
              <Target className="h-4 w-4" /> মডেল টেস্ট
            </Link>
          </div>
        </div>

        <Link
          to="/academic"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" /> একাডেমিক হোমে ফিরে যাও
        </Link>
      </div>
    </div>
  );
}
