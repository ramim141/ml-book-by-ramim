const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/components/Academic/HSC/Chemistry/Chemistry_data');

const filesToClear = [
  'chapter_01_Json/chapter_01_CQs.json',
  'chapter_01_Json/chapter_01_MCQs.json',
  'chapter_01_Json/chapter_01_k_kh.json',
  'chapter_02_Json/chapter_02_CQs.json',
  'chapter_02_Json/chapter_02_MCQs.json',
  'chapter_02_Json/chapter_02_k_kh.json',
  'chapter_03_Json/chapter_03_CQs.json',
  'chapter_03_Json/chapter_03_MCQs.json',
  'chapter_03_Json/chapter_03_k_kh.json',
  'board_questions.json',
  'hsc_chemistry.json'
];

filesToClear.forEach(relPath => {
  const fullPath = path.join(dataDir, relPath);
  if (fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '[\n]', 'utf8');
    console.log('Cleared:', fullPath);
  }
});
