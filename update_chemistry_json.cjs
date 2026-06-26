const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const dir = path.join(__dirname, 'src/components/Academic/HSC/Chemistry/Chemistry_data');

walk(dir, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    if (file.endsWith('.json')) {
      let content = fs.readFileSync(file, 'utf8');
      
      content = content.replace(/ICT/g, 'Chemistry');
      content = content.replace(/ict/g, 'chemistry');
      content = content.replace(/আইসিটি/g, 'রসায়ন');
      content = content.replace(/তথ্য ও যোগাযোগ প্রযুক্তি/g, 'রসায়ন');
      content = content.replace(/তথ্য প্রযুক্তি/g, 'রসায়ন');
      content = content.replace(/বিশ্ব ও বাংলাদেশ প্রেক্ষিত/g, 'পরিবেশ রসায়ন');
      content = content.replace(/কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং/g, 'গুণগত রসায়ন');
      content = content.replace(/সংখ্যা পদ্ধতি ও ডিজিটাল লজিক ডিজাইন/g, 'মৌলের পর্যায়বৃত্ত ধর্ম');
      
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated:', file);
      
      // If file name has ict in it
      const baseName = path.basename(file);
      if (baseName.includes('ict')) {
        const newName = baseName.replace(/ict/g, 'chemistry');
        const newPath = path.join(path.dirname(file), newName);
        fs.renameSync(file, newPath);
        console.log(`Renamed: ${file} -> ${newPath}`);
      }
    }
  });
});
