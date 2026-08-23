import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://learnwithramim.com'; // Change this to the actual domain when going live

// Static Routes
const staticRoutes = [
  // কেন্দ্রীয় হাব
  '/',
  '/about',
  '/contact',
  // সাব-সাইট ০১: এমএল বই
  '/ml',
  '/ml/dashboard',
  '/ml/start',
  '/ml/topics',
  '/ml/books',
  '/ml/blog',
  '/ml/bookmarks',
  // সাব-সাইট ০২: একাডেমিক হাব
  '/academic',
  '/academic/ssc',
  '/academic/hsc',
  '/academic/admission',
  '/academic/question-bank',
  '/academic/model-test',
  '/academic/shortcut/all/all/all',
  // suggestion / syllabus / routine / result / timer এখনো "শীঘ্রই আসছে" পেজ —
  // তৈরি না হওয়া পেজ sitemap এ দিলে Google এ খালি ফলাফল দেখায়।
  // পেজগুলো তৈরি হলে এখানে ফিরিয়ে আনতে হবে।
];

// Read wordsIndex.js
const wordsIndexPath = path.resolve('./src/data/wordsIndex.js');
let wordRoutes = [];
if (fs.existsSync(wordsIndexPath)) {
  const content = fs.readFileSync(wordsIndexPath, 'utf8');
  // Match path: "something" or path: 'something'
  const matches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)];
  wordRoutes = matches.map(m => `/ml/word/${m[1]}`);
}

// Read blogIndex.js
const blogIndexPath = path.resolve('./src/data/blogIndex.js');
let blogRoutes = [];
if (fs.existsSync(blogIndexPath)) {
  const content = fs.readFileSync(blogIndexPath, 'utf8');
  // Match slug: "something" or slug: 'something'
  const matches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];
  blogRoutes = matches.map(m => `/ml/blog/${m[1]}`);
}

const allRoutes = [...staticRoutes, ...wordRoutes, ...blogRoutes];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(route => {
    return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.resolve('./public/sitemap.xml'), sitemap);
console.log(`✅ Sitemap successfully generated with ${allRoutes.length} URLs!`);
