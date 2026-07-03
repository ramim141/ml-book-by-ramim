import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import fs from 'fs';

// Read config from frontend
const code = fs.readFileSync('src/config/firebase.js', 'utf-8');
const match = code.match(/const firebaseConfig = ({[\s\S]*?});/);
if (!match) {
  console.log("No config");
  process.exit(1);
}

// Evaluate config
let firebaseConfig;
eval(`firebaseConfig = ${match[1]}`);

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const normalizeAcademicLevel = (level = '') => String(level).trim().toLowerCase();
const getSubjectSlug = (subject = {}) => {
  const level = normalizeAcademicLevel(subject.level);
  const id = String(subject.id || '').toLowerCase();
  if (id === 'hsc-chemistry-1') return 'chemistry';
  if (level && id.startsWith(`${level}-`)) return id.slice(level.length + 1);
  return id;
};

const getSubjectPath = (subject = {}) => {
  const level = normalizeAcademicLevel(subject.level);
  const slug = getSubjectSlug(subject);
  if (!level || !slug) return '/academic';
  return `/academic/${level}/${slug}`;
};

const resolveSubjectFromRoute = (subjects = [], levelParam = '', subjectSlug = '') => {
  const level = normalizeAcademicLevel(levelParam);
  const slug = decodeURIComponent(String(subjectSlug || '')).toLowerCase();

  return subjects.find((subject) => {
    const subjectLevel = normalizeAcademicLevel(subject.level);
    if (subjectLevel !== level) return false;

    const id = String(subject.id || '').toLowerCase();
    return id === `${level}-${slug}` || id === slug || getSubjectSlug(subject) === slug;
  }) || null;
};

async function run() {
  const snap = await getDoc(doc(db, 'admin_settings', 'subjects'));
  const subjects = snap.exists() ? snap.data().list || [] : [];
  
  console.log(`Found ${subjects.length} subjects.`);
  
  for (const s of subjects) {
    if (s.level === 'SSC') {
       const path = getSubjectPath(s);
       console.log(`Subject: ${s.label}, ID: ${s.id}, Path: ${path}`);
       console.dir(s, { depth: null });
       
       // simulate matching
       const parts = path.split('/'); // ["", "academic", "ssc", "slug"]
       if (parts.length >= 4) {
         const matched = resolveSubjectFromRoute(subjects, parts[2], parts[3]);
         console.log(`  Resolved back? ${matched ? 'YES' : 'NO'}`);
       }
    }
  }
  process.exit(0);
}

run();
