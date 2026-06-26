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

const dirs = [
  path.join(__dirname, 'src/components/Academic/HSC/Chemistry'),
  path.join(__dirname, 'src/pages/Academic/HSC/Chemistry')
];

dirs.forEach(dir => {
  walk(dir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      if (file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        
        content = content.replace(/ICT_data/g, 'Chemistry_data');
        content = content.replace(/\/hsc\/ict/g, '/hsc/chemistry');
        content = content.replace(/HSC\/ICT/g, 'HSC/Chemistry');
        content = content.replace(/ICTSubjectHome/g, 'ChemistrySubjectHome');
        content = content.replace(/আইসিটি/g, 'রসায়ন');
        content = content.replace(/তথ্য ও যোগাযোগ প্রযুক্তি \(ICT\)/g, 'রসায়ন');
        content = content.replace(/তথ্য ও যোগাযোগ প্রযুক্তি/g, 'রসায়ন');
        
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
      }
    });
  });
});
