/**
 * অ্যাডমিন ডেটা রপ্তানি — CSV ও JSON।
 *
 * আগে পুরো অ্যাডমিন প্যানেলে ডাউনলোডের কোনো ব্যবস্থাই ছিল না, অর্থাৎ
 * প্রশ্নব্যাংকের একটাও কপি Firestore এর বাইরে থাকত না। ভুল করে মুছে ফেললে
 * বা অ্যাকাউন্টে সমস্যা হলে হাজারো প্রশ্ন চিরতরে হারিয়ে যেত।
 *
 * কোনো বাইরের লাইব্রেরি লাগে না — ব্রাউজারের Blob ই যথেষ্ট।
 */

/** Excel বাংলা ঠিকমতো দেখাতে BOM লাগে, না হলে অক্ষর ভেঙে যায় */
const BOM = '﻿';

/** CSV ঘরে কমা/উদ্ধৃতি/নতুন লাইন থাকলে নিরাপদে মুড়ে দিই */
function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/**
 * @param {Array<object>} rows
 * @param {Array<{key: string, label: string, map?: Function}>} columns
 * @returns {string} CSV টেক্সট
 */
export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const body = (rows || []).map((row) =>
    columns.map((c) => escapeCell(c.map ? c.map(row) : row[c.key])).join(',')
  );
  return BOM + [header, ...body].join('\r\n');
}

/** ফাইলের নামে যেসব অক্ষর চলে না। পরপর একাধিক ড্যাশ একটাতে নামিয়ে আনি,
 *  না হলে "ICT / ১ম: টেস্ট" থেকে "ICT---১ম--টেস্ট" এর মতো নাম তৈরি হতো। */
function safeName(name) {
  const cleaned = String(name || 'export')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'export';
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // সাথে সাথে revoke করলে কিছু ব্রাউজারে ডাউনলোড আটকে যায়
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCSV(rows, columns, filename) {
  download(toCSV(rows, columns), `${safeName(filename)}.csv`, 'text/csv;charset=utf-8;');
}

export function downloadJSON(data, filename) {
  download(JSON.stringify(data, null, 2), `${safeName(filename)}.json`, 'application/json;charset=utf-8;');
}

/** ফাইলের নামে তারিখ — একাধিক ব্যাকআপ আলাদা করে চেনা যায় */
export function dateStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
