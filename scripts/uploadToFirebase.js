import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the config from our previously created file
// Since it's outside src and we can't easily import JSX/JS with Vite aliases here,
// let's just copy the config for the script
const firebaseConfig = {
  apiKey: "AIzaSyB4bxjV_RAmx2KbpqhbtjcqUeL-tZEli3g",
  authDomain: "academic-hub-hero.firebaseapp.com",
  projectId: "academic-hub-hero",
  storageBucket: "academic-hub-hero.firebasestorage.app",
  messagingSenderId: "776870084510",
  appId: "1:776870084510:web:09d1b184206392f92fa08f",
  measurementId: "G-ERN94L9979"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to find all json files recursively
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') {
        if (dirFile.endsWith('.json')) {
            filelist.push(dirFile);
        }
      } else {
        throw err;
      }
    }
  });
  return filelist;
};

// Fix walkSync logic
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.json')) {
          files.push(name);
      }
    }
  }
  return files;
}

const academicDir = path.join(__dirname, '../src/components/Academic');

async function uploadData() {
  console.log('Starting data migration to Firestore...');
  const allJsonFiles = getFiles(academicDir);
  
  // Filter for question files (MCQs, CQs, k_kh, shortcuts)
  const questionFiles = allJsonFiles.filter(f => 
    f.includes('_MCQs.json') || 
    f.includes('_CQs.json') || 
    f.includes('_k_kh.json') || 
    f.includes('_shortcuts.json')
  );

  console.log(`Found ${questionFiles.length} question files to upload.`);

  let totalUploaded = 0;

  for (const file of questionFiles) {
    console.log(`\nProcessing: ${path.basename(file)}`);
    
    // Determine subject
    let subject = 'unknown';
    if (file.includes(path.sep + 'ICT' + path.sep) || file.includes('ICT_data')) subject = 'hsc-ict';
    if (file.includes(path.sep + 'Chemistry' + path.sep) || file.includes('Chemistry_data')) subject = 'hsc-chemistry';
    
    // Determine type
    let type = 'unknown';
    if (file.includes('_MCQs.json')) type = 'mcq';
    if (file.includes('_CQs.json')) type = 'cq';
    if (file.includes('_k_kh.json')) type = 'knowledge';
    if (file.includes('_shortcuts.json')) type = 'shortcut';

    // Determine chapter
    const fileName = path.basename(file);
    const chapterMatch = fileName.match(/chapter_(\d+)/);
    const chapter = chapterMatch ? `chapter_${chapterMatch[1]}` : 'unknown';

    console.log(`Mapping -> Subject: ${subject}, Type: ${type}, Chapter: ${chapter}`);

    const fileContent = fs.readFileSync(file, 'utf-8');
    let data;
    try {
        data = JSON.parse(fileContent);
    } catch(e) {
        console.error(`Error parsing JSON for ${file}`);
        continue;
    }

    if (!Array.isArray(data)) {
        console.log(`Skipping ${file} because it's not an array of items.`);
        continue;
    }

    // Upload each item
    for (const item of data) {
        try {
            // Append metadata to item
            const itemToUpload = {
                ...item,
                subject,
                type,
                chapterId: chapter,
                // Add a timestamp for ordering
                createdAt: new Date().toISOString()
            };
            
            // We use a single collection "academic_content"
            await addDoc(collection(db, "academic_content"), itemToUpload);
            totalUploaded++;
            
            if (totalUploaded % 100 === 0) {
                console.log(`Uploaded ${totalUploaded} items so far...`);
            }
        } catch (error) {
            console.error(`Failed to upload item from ${file}:`, error.message);
        }
    }
  }

  console.log(`\n✅ Migration Complete! Total items uploaded: ${totalUploaded}`);
  process.exit(0);
}

uploadData().catch(console.error);
