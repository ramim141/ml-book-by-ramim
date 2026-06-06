import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://learnwithramim.com'; // Change this to the actual domain when going live

// Static Routes
const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/ml-topics',
  '/books',
  '/blog',
  '/dashboard',
  '/bookmarks'
];

// Read wordsIndex.js
const wordsIndexPath = path.resolve('./src/data/wordsIndex.js');
let wordRoutes = [];
if (fs.existsSync(wordsIndexPath)) {
  const content = fs.readFileSync(wordsIndexPath, 'utf8');
  // Match path: "something" or path: 'something'
  const matches = [...content.matchAll(/path:\s*['"]([^'"]+)['"]/g)];
  wordRoutes = matches.map(m => `/word/${m[1]}`);
}

// Read blogIndex.js
const blogIndexPath = path.resolve('./src/data/blogIndex.js');
let blogRoutes = [];
if (fs.existsSync(blogIndexPath)) {
  const content = fs.readFileSync(blogIndexPath, 'utf8');
  // Match slug: "something" or slug: 'something'
  const matches = [...content.matchAll(/slug:\s*['"]([^'"]+)['"]/g)];
  blogRoutes = matches.map(m => `/blog/${m[1]}`);
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
