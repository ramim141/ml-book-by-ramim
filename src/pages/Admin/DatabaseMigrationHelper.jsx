import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ictCQs = import.meta.glob('../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_CQs.json');
const ictMCQs = import.meta.glob('../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_MCQs.json');
const ictKQs = import.meta.glob('../../components/Academic/HSC/ICT/ICT_data/chapter_*_Json/chapter_*_k_kh.json');

const chemCQs = import.meta.glob('../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_CQs.json');
const chemMCQs = import.meta.glob('../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_MCQs.json');
const chemKQs = import.meta.glob('../../components/Academic/HSC/Chemistry/Chemistry_data/chapter_*_Json/chapter_*_k_kh.json');

export default function DatabaseMigrationHelper() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const log = (msg) => setLogs(prev => [...prev, msg]);

  const migrate = async () => {
    setLoading(true);
    setLogs([]);
    try {
      const colRef = collection(db, 'academic_content');
      
      const process = async (globObj, subject, type) => {
        for (const path in globObj) {
          const mod = await globObj[path]();
          const items = mod.default || [];
          
          let chapterNum = path.match(/chapter_(\d+)/)?.[1];
          let chapterId = `chapter-${parseInt(chapterNum, 10)}`;
          
          log(`Uploading ${items.length} ${type}s for ${subject} ${chapterId}...`);
          for (const item of items) {
            await addDoc(colRef, {
              ...item,
              subject,
              type,
              chapterId
            });
          }
        }
      };

      await process(ictCQs, 'hsc-ict', 'cq');
      await process(ictMCQs, 'hsc-ict', 'mcq');
      await process(ictKQs, 'hsc-ict', 'knowledge');

      await process(chemCQs, 'hsc-chemistry-1', 'cq');
      await process(chemMCQs, 'hsc-chemistry-1', 'mcq');
      await process(chemKQs, 'hsc-chemistry-1', 'knowledge');

      log('Migration completed successfully!');
    } catch (e) {
      console.error(e);
      log(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <h2 className="text-xl font-bold mb-4">Database Migration</h2>
      <button 
        onClick={migrate} 
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? 'Migrating...' : 'Migrate All Static Data to Firestore'}
      </button>
      <div className="mt-4 max-h-64 overflow-y-auto text-sm text-slate-400 font-mono space-y-1">
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}