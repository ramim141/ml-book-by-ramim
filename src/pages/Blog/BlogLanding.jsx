import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight, Clock, Hash, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { allBlogs } from '../../data/blogIndex';

const POSTS_PER_PAGE = 4;

export default function BlogLanding() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set(allBlogs.map((blog) => blog.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return allBlogs.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.slice(1);
  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = remainingPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE,
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.getElementById('blog-content-start')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div data-blog-page className="min-h-screen bg-[#0b0f19] pb-20 text-slate-300 font-sans relative overflow-hidden">
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#5b5dfa]/5 to-transparent blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#00daf3]/5 to-transparent blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Hero Header */}
        <section className="py-12 border-b border-slate-800/60 sm:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 border-l-2 border-[#5b5dfa] pl-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8c8dff]">
              <BookOpen size={14} />
              <span>জ্ঞান, প্রযুক্তি ও শেখা</span>
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-white break-keep sm:text-5xl">
              আমাদের ব্লগ
            </h1>
            <p className="max-w-2xl mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
              মেশিন লার্নিং, এআই, ক্যারিয়ার গাইড এবং আধুনিক ওয়েব প্রযুক্তি নিয়ে সহজ, পরিষ্কার ও চিন্তাশীল লেখা।
            </p>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div
          className="flex flex-col gap-4 py-6 border-b border-slate-800/60 md:flex-row md:items-center md:justify-between"
          id="blog-content-start"
        >
          {/* Category Filter */}
          <div className="flex w-full gap-2 pb-1 overflow-x-auto md:w-auto md:pb-0 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'border-[#5b5dfa] bg-[#5b5dfa] text-white shadow-lg shadow-[#5b5dfa]/15'
                    : 'border-slate-800 bg-[#111729]/40 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="আর্টিকেল খুঁজুন..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-full border border-slate-800 bg-[#111729]/40 py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-[#5b5dfa] focus:ring-1 focus:ring-[#5b5dfa]"
            />
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col gap-10 pt-10 lg:flex-row lg:gap-12">
          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {featuredPost && currentPage === 1 && (
              <motion.article
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="group mb-12 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#111729]/60 to-[#0c101d]/60 shadow-xl hover:border-slate-700/60 transition-all duration-300"
              >
                <Link to={`/blog/${featuredPost.slug}`} className="grid min-h-[360px] md:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[230px] overflow-hidden bg-slate-900">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <span className="text-[#8c8dff] bg-[#5b5dfa]/10 border border-[#5b5dfa]/20 px-2.5 py-0.5 rounded-full">{featuredPost.category}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                        <span className="text-[#00daf3]">Featured</span>
                      </div>
                      <h2 className="text-2xl font-bold leading-snug text-white transition-colors group-hover:text-[#5b5dfa] lg:text-3xl">
                        {featuredPost.title}
                      </h2>
                      <p className="mt-4 text-sm leading-relaxed line-clamp-3 text-slate-400 sm:text-base">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 pt-5 mt-8 border-t border-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {featuredPost.date}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {featuredPost.readTime}</span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5b5dfa] group-hover:text-[#8c8dff] transition-colors">
                        পড়ুন <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            )}

            {/* Sub-posts Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map((post, index) => (
                  <React.Fragment key={post.id}>

                    <motion.article
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group flex overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#111729]/40 to-[#0c101d]/40 shadow-lg hover:shadow-xl hover:border-slate-700/60 transition-all"
                    >
                      <Link to={`/blog/${post.slug}`} className="flex flex-col w-full">
                        <div className="relative h-48 overflow-hidden bg-slate-900">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                          />
                          <span className="absolute right-4 top-4 rounded-full bg-[#0b0f19]/90 px-3 py-1 text-xs font-bold text-[#00daf3] border border-[#00daf3]/20 shadow-sm">
                            {post.category}
                          </span>
                        </div>

                        <div className="flex flex-col flex-1 p-5 sm:p-6">
                          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-[#5b5dfa]">
                            {post.title}
                          </h3>
                          <p className="mt-3 text-xs leading-relaxed line-clamp-3 sm:text-sm text-slate-400">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between gap-4 pt-5 mt-auto border-t border-slate-800/60">
                            <div className="min-w-0 text-[11px] font-medium text-slate-500">
                              <span className="block truncate">{post.date}</span>
                              <span className="block mt-1">{post.readTime}</span>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs sm:text-sm font-bold text-[#5b5dfa] group-hover:text-[#8c8dff] transition-colors">
                              পড়ুন <ArrowRight size={15} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  </React.Fragment>
                ))
              ) : (
                !featuredPost && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-[#111729]/20 py-20 text-center">
                    <Hash size={36} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-base text-slate-400">কোনো আর্টিকেল পাওয়া যায়নি!</p>
                  </div>
                )
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full border border-slate-800 bg-[#111729]/40 p-2.5 text-slate-400 hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 rounded-full border text-sm font-semibold transition ${
                      currentPage === page
                        ? 'border-[#5b5dfa] bg-[#5b5dfa] text-white shadow-md shadow-[#5b5dfa]/15'
                        : 'border-slate-800 bg-[#111729]/40 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-slate-800 bg-[#111729]/40 p-2.5 text-slate-400 hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="hidden w-[280px] shrink-0 space-y-8 lg:block">
            <div className="sticky space-y-8 top-24">
              {/* Recent Posts Widget */}
              <section className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#111729]/40 to-[#0c101d]/40 p-5 shadow-sm">
                <h3 className="border-b border-slate-800/60 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#5b5dfa] rounded-full"></span>
                  সাম্প্রতিক পোস্ট
                </h3>
                <div className="mt-5 space-y-4">
                  {allBlogs.slice(0, 4).map((post) => (
                    <Link to={`/blog/${post.slug}`} key={post.id} className="group flex gap-3.5 items-center">
                      <div className="overflow-hidden h-14 w-14 shrink-0 rounded-xl bg-slate-900">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-xs sm:text-sm font-semibold leading-snug text-slate-200 transition-colors group-hover:text-[#5b5dfa]">
                          {post.title}
                        </h4>
                        <span className="mt-1 block text-[10px] text-slate-500">{post.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Categories Widget */}
              <section className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-[#111729]/40 to-[#0c101d]/40 p-5 shadow-sm">
                <h3 className="border-b border-slate-800/60 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-[#00daf3] rounded-full"></span>
                  ক্যাটাগরি
                </h3>
                <ul className="mt-3 space-y-1">
                  {categories.filter((cat) => cat !== 'All').map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-xs sm:text-sm transition-colors ${
                          activeCategory === cat
                            ? 'bg-[#5b5dfa]/15 font-semibold text-[#8c8dff]'
                            : 'text-slate-400 hover:bg-[#111729]/50 hover:text-white'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="rounded-md bg-[#0b0f19] border border-slate-800 px-2 py-0.5 text-[10px] text-slate-500">
                          {allBlogs.filter((blog) => blog.category === cat).length}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
