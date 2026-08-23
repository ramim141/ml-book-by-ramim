/**
 * পুরনো রুট-লেভেল URL গুলো এখন /ml/* সাব-সাইটে সরে গেছে।
 * ক্লায়েন্ট-সাইড রিডাইরেক্টও App.jsx এ আছে, কিন্তু এজ থেকে 301 দিলে
 * সার্চ ইঞ্জিন ও শেয়ার করা লিংকগুলো সঠিকভাবে নতুন URL এ ট্রান্সফার হয়।
 */
const LEGACY_EXACT = {
  "/dashboard": "/ml/dashboard",
  "/start": "/ml/start",
  "/books": "/ml/books",
  "/bookmarks": "/ml/bookmarks",
  "/ml-topics": "/ml/topics",
  "/blog": "/ml/blog",
};

const LEGACY_PREFIX = {
  "/word/": "/ml/word/",
  "/blog/": "/ml/blog/",
};

function legacyTarget(pathname) {
  if (LEGACY_EXACT[pathname]) return LEGACY_EXACT[pathname];

  for (const [from, to] of Object.entries(LEGACY_PREFIX)) {
    if (pathname.startsWith(from)) {
      return to + pathname.slice(from.length);
    }
  }

  return null;
}

/* ── ক্যাশিং নীতি ─────────────────────────────────────────────────────
 * Vite প্রতিটি বিল্ডে কনটেন্ট-হ্যাশসহ ফাইলনাম বানায় (index-DZXAN4FJ.js),
 * তাই সেগুলো চিরস্থায়ীভাবে ক্যাশ করা নিরাপদ — কনটেন্ট বদলালে নামও বদলায়।
 * কিন্তু index.html কখনো ক্যাশ করা যাবে না, না হলে নতুন ডিপ্লয়ের পরেও
 * ব্রাউজার পুরনো হ্যাশের দিকে ইশারা করা HTML ধরে রাখবে।
 */
const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";
const ALWAYS_REVALIDATE = "no-cache";
const ONE_DAY_SWR = "public, max-age=3600, stale-while-revalidate=86400";

// হ্যাশযুক্ত অ্যাসেট: নামের মধ্যে -XXXXXXXX থাকে (৮+ ক্যারেক্টারের হ্যাশ)
const HASHED_ASSET = /\/assets\/.+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/;

function cacheControlFor(pathname, contentType = "") {
  // HTML কখনোই ক্যাশ করা যাবে না — নতুন ডিপ্লয়ে হ্যাশ বদলালেও ব্রাউজার
  // পুরনো HTML ধরে রাখলে সে পুরনো অ্যাসেটের দিকেই ইশারা করতে থাকবে।
  // ASSETS বাইন্ডিং SPA রুটে 404 না দিয়ে সরাসরি index.html দিলেও এটি নিরাপদ।
  if (contentType.includes("text/html")) return ALWAYS_REVALIDATE;

  if (HASHED_ASSET.test(pathname)) return ONE_YEAR_IMMUTABLE;

  if (pathname === "/" || pathname.endsWith(".html")) return ALWAYS_REVALIDATE;

  // হ্যাশবিহীন স্ট্যাটিক ফাইল (favicon, logo, sitemap, robots, og-image…)
  return ONE_DAY_SWR;
}

function withCacheHeaders(res, pathname) {
  const out = new Response(res.body, res);
  out.headers.set(
    "Cache-Control",
    cacheControlFor(pathname, res.headers.get("Content-Type") || "")
  );
  return out;
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const target = legacyTarget(url.pathname);

      if (target) {
        const redirectUrl = new URL(target, url.origin);
        redirectUrl.search = url.search;
        redirectUrl.hash = url.hash;
        return Response.redirect(redirectUrl.toString(), 301);
      }

      const res = await env.ASSETS.fetch(request);

      if (res.status === 404) {
        // SPA fallback — index.html ফেরত দিই, কিন্তু ক্যাশ করতে দিই না
        const fallback = await env.ASSETS.fetch(new Request(new URL("/", request.url)));
        const out = new Response(fallback.body, fallback);
        out.headers.set("Cache-Control", ALWAYS_REVALIDATE);
        return out;
      }

      return withCacheHeaders(res, url.pathname);
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
