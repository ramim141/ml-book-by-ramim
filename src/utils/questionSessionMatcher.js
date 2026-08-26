/**
 * Intelligent Question & Session Matcher
 * Matches questions with target session and examType across:
 * - Direct examType & year
 * - examTags: [{ type, session }]
 * - institutions: [{ name, year }]
 * - tags: ['MAT 23-24', 'MAT 2023-2024', ...]
 * - comma-separated years / sessions
 */

export function normalizeStr(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, '')
    .replace(/[–—_]/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function normalizeYearString(str) {
  if (!str) return '';
  // Convert Bengali numerals to English numerals
  const bnToEn = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '⑧': '8', '৯': '9', '৮': '8' };
  let s = String(str).replace(/[০-৯]/g, w => bnToEn[w] || w).trim();
  
  // Strip quotes and apostrophes like '23-24
  s = s.replace(/['"`]/g, '');

  // Extract digits and hyphens/slashes
  return s.toLowerCase().replace(/[\/\\]/g, '-').replace(/[^0-9\-]/g, '');
}

/**
 * Parses session string into normalized year parts:
 * "2023-2024" -> [{y4: 2023, y2: "23"}, {y4: 2024, y2: "24"}]
 * "23-24"     -> [{y4: 2023, y2: "23"}, {y4: 2024, y2: "24"}]
 * "2023-24"   -> [{y4: 2023, y2: "23"}, {y4: 2024, y2: "24"}]
 * "2023"      -> [{y4: 2023, y2: "23"}]
 */
export function parseYearParts(str) {
  if (!str) return [];
  const clean = normalizeYearString(str);
  const parts = clean.split('-').filter(Boolean);
  
  if (parts.length === 0) return [];
  
  return parts.map(p => {
    let num = parseInt(p, 10);
    if (isNaN(num)) return { y4: 0, y2: p };
    // 2-digit conversion (e.g. 23 -> 2023, 98 -> 1998)
    let y4 = num < 100 ? (num > 50 ? 1900 + num : 2000 + num) : num;
    let y2 = y4 % 100;
    return { y4, y2: y2 < 10 ? `0${y2}` : `${y2}` };
  });
}

export function matchExamType(sourceType, targetType) {
  if (!targetType) return true;
  if (!sourceType) return false;

  const s = normalizeStr(sourceType);
  const t = normalizeStr(targetType);

  if (s === t || s.includes(t) || t.includes(s)) return true;

  // Medical & Dental all-inclusive matching (MAT, DAT, MBBS, BDS, Medical, Dental)
  const isMedTarget = t === 'mbbs' || t === 'mat' || t === 'bds' || t === 'dat' || t === 'medical' || t === 'dental' || t === 'mbbsbds' || t.includes('mbbs') || t.includes('mat') || t.includes('dat') || t.includes('bds');
  const isMedSource = s === 'mbbs' || s === 'mat' || s === 'bds' || s === 'dat' || s === 'medical' || s === 'dental' || s === 'mbbsbds' || s.includes('mbbs') || s.includes('mat') || s.includes('dat') || s.includes('bds');
  if (isMedTarget && isMedSource) return true;

  // DU A Unit aliases
  const isDuTarget = t === 'dua' || t === 'du' || t === 'du-a';
  const isDuSource = s === 'dua' || s === 'du' || s === 'du-a';
  if (isDuTarget && isDuSource) return true;

  // Nursing aliases
  if (t.includes('nursing') && s.includes('nursing')) return true;
  if (t.includes('bsc') && s.includes('bsc')) return true;
  if (t.includes('diploma') && s.includes('diploma')) return true;
  if (t.includes('midwifery') && s.includes('midwifery')) return true;

  // Engineering aliases
  if (t.includes('buet') && s.includes('buet')) return true;
  if (t.includes('cket') && (s.includes('cket') || s.includes('cuet') || s.includes('ruet') || s.includes('kuet'))) return true;

  return false;
}

export function matchSessionYear(sourceYear, targetSession) {
  if (!targetSession) return true;
  if (!sourceYear) return false;

  const sClean = normalizeYearString(sourceYear);
  const tClean = normalizeYearString(targetSession);
  if (sClean === tClean) return true;

  const targetParts = parseYearParts(targetSession);
  if (targetParts.length === 0) return true;

  const sYears = String(sourceYear).split(',');

  return sYears.some(sy => {
    const srcParts = parseYearParts(sy);
    if (srcParts.length === 0) return false;

    // 1. Match start year (e.g. 2023 === 2023 or 23 === 23)
    if (srcParts[0].y4 === targetParts[0].y4) {
      if (srcParts.length > 1 && targetParts.length > 1) {
        return srcParts[1].y4 === targetParts[1].y4;
      }
      return true;
    }

    // 2. Direct inclusion
    const syClean = normalizeYearString(sy);
    if (syClean.includes(tClean) || tClean.includes(syClean)) return true;

    return false;
  });
}

/**
 * Main Question Matcher
 */
export function isQuestionInSession(question, targetExamType, targetSession) {
  if (!question) return false;

  // 1. Direct fields: examType & year
  if (
    matchExamType(question.examType, targetExamType) &&
    matchSessionYear(question.year, targetSession)
  ) {
    return true;
  }

  // 2. examTags: array of { type, session }
  if (Array.isArray(question.examTags) && question.examTags.length > 0) {
    const matchedTag = question.examTags.some(tag => {
      const type = tag.type || tag.name || tag.exam || question.examType || '';
      const session = tag.session || tag.year || question.year || '';
      return matchExamType(type, targetExamType) && matchSessionYear(session, targetSession);
    });
    if (matchedTag) return true;
  }

  // 3. Medical/Dental target broad session fallback
  const isMedTarget = matchExamType('medical', targetExamType);
  if (isMedTarget) {
    const isMedQ = matchExamType(question.examType, 'medical') || 
                   question.category === 'admission' || 
                   (Array.isArray(question.examTags) && question.examTags.some(t => matchExamType(t.type, 'medical')));
    if (isMedQ) {
      if (matchSessionYear(question.year, targetSession)) return true;
      if (Array.isArray(question.examTags) && question.examTags.some(t => matchSessionYear(t.session, targetSession))) return true;
    }
  }

  // 4. institutions: array of { name, year }
  if (Array.isArray(question.institutions) && question.institutions.length > 0) {
    const matchedInst = question.institutions.some(inst => {
      const name = inst.name || inst.type || question.examType || '';
      const year = inst.year || inst.session || question.year || '';
      return matchExamType(name, targetExamType) && matchSessionYear(year, targetSession);
    });
    if (matchedInst) return true;
  }

  // 5. tags: array of strings e.g. ["MAT '23-24", "MAT 23-24", "DU A 2021-22"]
  if (Array.isArray(question.tags) && question.tags.length > 0) {
    const matchedStr = question.tags.some(tag => {
      if (typeof tag === 'string') {
        return matchExamType(tag, targetExamType) && matchSessionYear(tag, targetSession);
      }
      return false;
    });
    if (matchedStr) return true;
  }

  return false;
}
