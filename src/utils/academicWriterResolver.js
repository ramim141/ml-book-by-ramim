/**
 * Academic Textbook Writer / Author Name Resolver
 * Resolves specific textbook author names instead of generic "Textbook" or "Main Book"
 */

export const isGenericTextbookLabel = (str) => {
  if (!str || typeof str !== 'string') return true;
  const lower = str.toLowerCase().trim();
  return (
    lower === 'textbook' ||
    lower === 'text book' ||
    lower === 'main_book' ||
    lower === 'main book' ||
    lower === 'mainbook' ||
    lower === 'অনুশীলনী' ||
    lower === 'মূল বই' ||
    lower === 'বই' ||
    lower === 'মূল বইয়ের অনুশীলনী' ||
    lower === 'মূল বইয়ের অনুশীলনী mcq'
  );
};

export const getMainBookWriterName = (q = {}, subject = null, chapter = null) => {
  // 1. Direct writer / author fields on question object
  if (q.writer && typeof q.writer === 'string' && !isGenericTextbookLabel(q.writer)) {
    return q.writer.trim();
  }
  if (q.bookWriter && typeof q.bookWriter === 'string' && !isGenericTextbookLabel(q.bookWriter)) {
    return q.bookWriter.trim();
  }
  if (q.author && typeof q.author === 'string' && !isGenericTextbookLabel(q.author)) {
    return q.author.trim();
  }
  if (q.bookSource && typeof q.bookSource === 'string' && !isGenericTextbookLabel(q.bookSource)) {
    return q.bookSource.trim();
  }

  // 2. Specific non-generic bookName
  if (q.bookName && typeof q.bookName === 'string' && !isGenericTextbookLabel(q.bookName)) {
    return q.bookName.trim();
  }

  // 3. Check tags for author names
  if (Array.isArray(q.examTags) && q.examTags.length > 0) {
    const writerTag = q.examTags.find(t => {
      const name = (t.name || t.type || '').toLowerCase();
      return name.includes('হাসান') || name.includes('আজমল') || name.includes('হাজারী') || 
             name.includes('তপন') || name.includes('ইসহাক') || name.includes('গাজী') || 
             name.includes('সরোজ') || name.includes('সেলু') || name.includes('আলী') ||
             name.includes('কবীর') || name.includes('গুহ');
    });
    if (writerTag) {
      return (writerTag.name || writerTag.type).trim();
    }
  }

  // 4. Intelligent Subject/Paper-based National Curriculum Author fallback
  const subName = (subject?.name || q.subject || '').toLowerCase();
  const subId = (subject?.id || q.subjectId || '').toLowerCase();
  const paper = (chapter?.paper || q.paper || '').toLowerCase();

  // Botany / উদ্ভিদবিজ্ঞান
  if (subName.includes('উদ্ভিদ') || subId.includes('botany') || subName.includes('botany')) {
    return 'ড. আবুল হাসান স্যার';
  }
  // Zoology / প্রাণিবিজ্ঞান
  if (subName.includes('প্রাণি') || subName.includes('প্রাণী') || subId.includes('zoology') || subName.includes('zoology')) {
    return 'গাজী আজমল স্যার';
  }
  // Biology / জীববিজ্ঞান
  if (subName.includes('জীব') || subId.includes('bio')) {
    if (paper.includes('১ম') || paper.includes('1st') || paper.includes('উদ্ভিদ')) return 'ড. আবুল হাসান স্যার';
    if (paper.includes('২য়') || paper.includes('2nd') || paper.includes('প্রাণি') || paper.includes('প্রাণী')) return 'গাজী আজমল স্যার';
    return 'হাসান ও আজমল স্যার';
  }
  // Physics / পদার্থবিজ্ঞান
  if (subName.includes('পদার্থ') || subId.includes('phy') || subName.includes('physics')) {
    return 'ড. শাহজাহান তপন ও ইসহাক স্যার';
  }
  // Chemistry / রসায়ন
  if (subName.includes('রসায়ন') || subName.includes('রসায়ন') || subId.includes('chem') || subName.includes('chemistry')) {
    return 'হাজারী ও নাগ স্যার';
  }
  // Bangla / বাংলা
  if (subName.includes('বাংলা') || subId.includes('bangla')) {
    return 'বাংলা ব্যাকরণ ও নির্মিতি (NCTB)';
  }
  // English / ইংরেজি
  if (subName.includes('ইংরেজি') || subName.includes('ইংরেজী') || subId.includes('eng') || subName.includes('english')) {
    return 'English Grammar & Composition (NCTB)';
  }
  // Higher Math / General Math / গণিত
  if (subName.includes('গণিত') || subId.includes('math')) {
    return 'এস. ইউ. আহাম্মদ ও অসীম কুমার সাহা';
  }
  // General Knowledge / সাধারণ জ্ঞান
  if (subName.includes('সাধারণ জ্ঞান') || subId.includes('gk')) {
    return 'সাধারণ জ্ঞান পাঠ্যবই';
  }

  return 'মূল পাঠ্যবই (NCTB)';
};
