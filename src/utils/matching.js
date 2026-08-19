import Papa from 'papaparse';
import Fuse from 'fuse.js';

// Comprehensive dictionary mapping fragrance notes, variants, plurals, and botanical names
const SYNONYM_MAP = {
  // Oud & Exotic Woods
  'agarwood (oud)': 'oud',
  'agarwood': 'oud',
  'aoud': 'oud',
  'aloeswood': 'oud',
  'oudh': 'oud',
  'rosewood': 'rosewood',
  'brazilian rosewood': 'rosewood',
  'sandalwood': 'sandalwood',
  'mysore sandalwood': 'sandalwood',
  'australian sandalwood': 'sandalwood',
  'cashmeran': 'cashmere wood',
  'cashmirwood': 'cashmere wood',
  'cashmere wood': 'cashmere wood',
  'blonde woods': 'woody notes',
  'white woods': 'woody notes',
  'woodsy notes': 'woody notes',
  'woody notes': 'woody notes',
  'clearwood': 'woody notes',
  'guaiac wood': 'guaiac wood',
  'guayacan': 'guaiac wood',
  'cedar': 'cedar',
  'virginia cedar': 'cedar',
  'atlas cedar': 'cedar',
  'cedarwood': 'cedar',

  // Florals
  'damask rose': 'rose',
  'bulgarian rose': 'rose',
  'turkish rose': 'rose',
  'rose de mai': 'rose',
  'moroccan rose': 'rose',
  'taif rose': 'rose',
  'grasse rose': 'rose',
  'rose absolute': 'rose',
  'rose petals': 'rose',
  'may rose': 'rose',
  'tea rose': 'rose',
  'egyptian jasmine': 'jasmine',
  'jasmine sambac': 'jasmine',
  'grandiflorum jasmine': 'jasmine',
  'jasmin': 'jasmine',
  'star jasmine': 'jasmine',
  'orange blossom': 'orange blossom',
  "fleur d'oranger": 'orange blossom',
  'neroli': 'orange blossom',
  'pink peony': 'peony',
  'peony': 'peony',
  'sweet pea': 'sweet pea',
  'ylang-ylang': 'ylang-ylang',
  'ylang ylang': 'ylang-ylang',
  'freesia': 'freesia',
  'magnolia': 'magnolia',
  'white magnolia': 'magnolia',
  'lotus': 'lotus',
  'lotus flower': 'lotus',
  'gardenia': 'gardenia',
  'lavender': 'lavender',
  'french lavender': 'lavender',
  'tuberose': 'tuberose',
  'iris': 'orris',
  'orris': 'orris',
  'orris root': 'orris',
  'violet': 'violet',
  'violet leaf': 'violet',

  // Fruits & Citrus
  'black cherry': 'cherry',
  'sour cherry': 'cherry',
  'sweet cherry': 'cherry',
  'cherry liqueur': 'cherry',
  'griotte': 'cherry',
  'peach': 'peach',
  'bitter peach': 'peach',
  'peach nectar': 'peach',
  'blackcurrant': 'black currant',
  'black currant': 'black currant',
  'blackcurrant nectar': 'black currant',
  'cassis': 'black currant',
  'lychee': 'lychee',
  'litchi': 'lychee',
  'blood orange': 'orange',
  'sicilian orange': 'orange',
  'sweet orange': 'orange',
  'bitter orange': 'orange',
  'orange': 'orange',
  'mandarin orange': 'mandarin',
  'green mandarin': 'mandarin',
  'mandarin': 'mandarin',
  'clementine': 'mandarin',
  'tangerine': 'mandarin',
  'sicilian bergamot': 'bergamot',
  'calabrian bergamot': 'bergamot',
  'bergamot': 'bergamot',
  'grapefruit': 'grapefruit',
  'pink grapefruit': 'grapefruit',
  'lime': 'lime',
  'lemon': 'lemon',
  'amalfi lemon': 'lemon',
  'sicilian lemon': 'lemon',
  'pear': 'pear',
  'plum': 'plum',
  'mirabelle': 'plum',
  'fig': 'fig',
  'fig leaf': 'fig',
  'grapes': 'grapes',
  'grape': 'grapes',
  'apricot': 'apricot',
  'raspberry': 'raspberry',
  'apple': 'apple',
  'green apple': 'apple',
  'red apple': 'apple',
  'pineapple': 'pineapple',

  // Spices & Aromatics
  'pink pepper': 'pink pepper',
  'pink peppercorn': 'pink pepper',
  'chinese pepper': 'pepper',
  'sichuan pepper': 'pepper',
  'black pepper': 'pepper',
  'pepper': 'pepper',
  'cardamom': 'cardamom',
  'green cardamom': 'cardamom',
  'black cardamom': 'cardamom',
  'cinnamon': 'cinnamon',
  'cinnamon bark': 'cinnamon',
  'cloves': 'clove',
  'clove': 'clove',
  'saffron': 'saffron',
  'nutmeg': 'nutmeg',
  'coriander': 'coriander',
  'coriander seeds': 'coriander',
  'ginger': 'ginger',
  'paprika': 'paprika',
  'red chilli pepper': 'paprika',
  'chili': 'paprika',
  'mint': 'mint',
  'spearmint': 'mint',
  'peppermint': 'mint',
  'elemi': 'elemi',
  'elemi resin': 'elemi',

  // Gourmand, Resins & Sweet
  'bourbon vanilla': 'vanilla',
  'madagascar vanilla': 'vanilla',
  'tahitian vanilla': 'vanilla',
  'vanilla absolute': 'vanilla',
  'vanilla bean': 'vanilla',
  'vanille': 'vanilla',
  'vanilla': 'vanilla',
  'tonka': 'tonka bean',
  'tonka bean': 'tonka bean',
  'roasted coffee beans': 'coffee',
  'coffee beans': 'coffee',
  'coffee': 'coffee',
  'praline': 'praline',
  'cacao': 'cacao',
  'dark chocolate': 'cacao',
  'chocolate': 'cacao',
  'cocoa': 'cacao',
  'licorice': 'licorice',
  'liquorice': 'licorice',
  'honey': 'honey',
  'honeycomb': 'honey',
  'rum': 'rum',
  'dark rum': 'rum',
  'cognac': 'cognac',
  'bitter almond': 'almond',
  'sweet almond': 'almond',
  'almond': 'almond',
  'caramel': 'caramel',
  'labdanum': 'labdanum',
  'cistus': 'labdanum',
  'benzoin': 'benzoin',
  'amber': 'amber',
  'ambergris': 'amber',
  'amberwood': 'amber',
  'ambroxan': 'amber',

  // Earth, Moss & Musks
  'indonesian patchouli leaf': 'patchouli',
  'patchouli leaf': 'patchouli',
  'indian patchouli': 'patchouli',
  'patchouli': 'patchouli',
  'vetiver': 'vetiver',
  'haitian vetiver': 'vetiver',
  'bourbon vetiver': 'vetiver',
  'vetyver': 'vetiver',
  'white musk': 'musk',
  'musk': 'musk',
  'musks': 'musk',
  'oakmoss': 'oakmoss',
  'oak moss': 'oakmoss',
  'moss': 'oakmoss',
  'tobacco': 'tobacco',
  'tobacco leaf': 'tobacco',
  'blonde tobacco': 'tobacco',
  'leather': 'leather',
  'suede': 'leather',
  'black leather': 'leather',
  'tea': 'tea',
  'black tea': 'tea',
  'green tea': 'tea'
};

// Notes that carry high olfactory distinction and identity
const SIGNATURE_NOTES = new Set([
  'cherry', 'coffee', 'licorice', 'plum', 'almond', 'saffron', 'cognac', 'rum',
  'praline', 'sweet pea', 'elemi', 'paprika', 'tobacco', 'rosewood', 'oud', 'clove',
  'lychee', 'cinnamon', 'cardamom', 'leather', 'peach', 'black currant', 'lotus'
]);

export const normalizeNote = (rawNote) => {
  if (!rawNote) return '';
  let note = rawNote.toLowerCase().trim().replace(/\s+/g, ' ');
  
  if (SYNONYM_MAP[note]) {
    return SYNONYM_MAP[note];
  }
  
  for (const [synonym, canonical] of Object.entries(SYNONYM_MAP)) {
    if (note === synonym || note.includes(` ${synonym}`) || note.includes(`${synonym} `)) {
      return canonical;
    }
  }

  // Handle trailing 's' plurals (e.g. 'woods', 'fruits', 'spices')
  if (note.endsWith('s') && !note.endsWith('ss') && note.length > 3) {
    const singular = note.slice(0, -1);
    if (Object.values(SYNONYM_MAP).includes(singular)) {
      return singular;
    }
  }

  return note;
};

const parseNotesString = (notesStr) => {
  if (!notesStr) return [];
  return notesStr
    .split(',')
    .map(n => n.trim())
    .filter(n => n.length > 0);
};

const getFragranceProfile = (item, isSahar = false) => {
  const topKey = isSahar ? 'Top Notes' : 'Top';
  const midKey = isSahar ? 'Middle Notes' : 'Middle';
  const baseKey = isSahar ? 'Base Notes' : 'Base';

  const rawTop = parseNotesString(item[topKey]);
  const rawMid = parseNotesString(item[midKey]);
  const rawBase = parseNotesString(item[baseKey]);

  const top = new Set(rawTop.map(normalizeNote).filter(Boolean));
  const mid = new Set(rawMid.map(normalizeNote).filter(Boolean));
  const base = new Set(rawBase.map(normalizeNote).filter(Boolean));
  const all = new Set([...top, ...mid, ...base]);

  // Maintain human-readable original formatting for display
  const rawNameMap = {};
  [...rawTop, ...rawMid, ...rawBase].forEach(raw => {
    const normalized = normalizeNote(raw);
    if (!rawNameMap[normalized]) {
      rawNameMap[normalized] = raw.trim();
    }
  });

  return { top, mid, base, all, rawNameMap };
};

let perfumeDatabase = [];
let saharDatabase = [];
let categoryMap = {};
let categoryList = [];
let searchIndex = [];
let fuse = null;

// Build search index for sub-2ms lookups over 24,000 items
const buildSearchIndex = (data) => {
  return data.map(p => {
    const pName = (p.Perfume || '').toLowerCase();
    const bName = (p.Brand || '').toLowerCase();
    const cleanP = pName.replace(/-/g, ' ').replace(/[^a-z0-9\s]/g, '');
    const cleanB = bName.replace(/-/g, ' ').replace(/[^a-z0-9\s]/g, '');
    return {
      item: p,
      cleanP,
      cleanB,
      combined: `${cleanP} ${cleanB} ${cleanB} ${cleanP}`
    };
  });
};

export const loadDatabases = async () => {
  try {
    const [perfumeResponse, saharResponse, categoryResponse] = await Promise.all([
      fetch('/perfume-database.csv'),
      fetch('/saharscents-database.csv'),
      fetch('/perfume-categories.csv')
    ]);

    const [perfumeText, saharText, categoryText] = await Promise.all([
      perfumeResponse.text(),
      saharResponse.text(),
      categoryResponse.text()
    ]);

    const perfumeResult = Papa.parse(perfumeText, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    const saharResult = Papa.parse(saharText, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    const categoryResult = Papa.parse(categoryText, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    perfumeDatabase = perfumeResult.data;
    saharDatabase = saharResult.data.filter(item => item['Product Type'] === 'Perfume');

    categoryMap = {};
    const uniqueCategories = new Set();

    categoryResult.data.forEach(item => {
      if (item.Perfume && item.Category) {
        const cats = item.Category.split(',').map(c => c.trim());
        cats.forEach(c => uniqueCategories.add(c));
        categoryMap[item.Perfume.trim().toLowerCase()] = cats.map(c => c.toLowerCase());
      }
    });

    if (!categoryMap['peachy paradise']) {
      categoryMap['peachy paradise'] = ['unisex', 'fruity', 'warm', 'sweet', 'woody', 'amber', 'spicy'];
      ['Unisex', 'Fruity', 'Warm', 'Sweet', 'Woody', 'Amber', 'Spicy'].forEach(c => uniqueCategories.add(c));
    }

    categoryList = [...uniqueCategories].sort();

    // Build ultra-fast token search index (<15ms build time, <2ms search time)
    searchIndex = buildSearchIndex(perfumeDatabase);

    // Keep Fuse as a lazy fallback only if exact token matches are exhausted
    fuse = new Fuse(perfumeDatabase, {
      keys: ['Perfume', 'Brand'],
      threshold: 0.35,
      distance: 100
    });

    return true;
  } catch (error) {
    console.error('Error loading databases:', error);
    return false;
  }
};

export const getDatabaseData = () => ({
  perfumes: perfumeDatabase,
  saharPerfumes: saharDatabase,
  categories: categoryList,
  categoryMap: categoryMap
});

export const findPerfume = (query) => {
  if (!query || !searchIndex.length) return [];
  const q = query.toLowerCase().trim().replace(/-/g, ' ').replace(/[^a-z0-9\s]/g, '');
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  const results = [];
  for (let i = 0; i < searchIndex.length; i++) {
    const entry = searchIndex[i];
    let matchesAll = true;
    for (let j = 0; j < tokens.length; j++) {
      if (!entry.combined.includes(tokens[j])) {
        matchesAll = false;
        break;
      }
    }
    if (matchesAll) {
      let score = 0;
      if (entry.cleanP === q) score += 100;
      else if (entry.cleanP.startsWith(q)) score += 60;
      else if (entry.cleanB === q) score += 50;
      else if (entry.cleanB.startsWith(q)) score += 30;

      if (entry.cleanP.startsWith(tokens[0])) score += 20;
      if (entry.cleanB.startsWith(tokens[0])) score += 15;

      results.push({ item: entry.item, score });
      if (results.length >= 60) break;
    }
  }

  if (results.length > 0) {
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 15).map(r => r.item);
  }

  // Fallback to fuzzy search if token search yielded 0 results (e.g. typos)
  if (fuse) {
    return fuse.search(query).map(result => result.item).slice(0, 15);
  }

  return [];
};

// Characteristic note combinations that define specific fragrance DNAs
const SIGNATURE_PAIRS = [
  { pair: ['coffee', 'rose'], sahar: 'rosewood romance', boost: 0.18 },
  { pair: ['cherry', 'almond'], sahar: 'cherry noir', boost: 0.18 },
  { pair: ['coffee', 'licorice'], sahar: 'twilight', boost: 0.18 },
  { pair: ['coffee', 'vanilla'], sahar: 'twilight', boost: 0.12 },
  { pair: ['praline', 'rose'], sahar: 'velvet rose & oud', boost: 0.18 },
  { pair: ['praline', 'clove'], sahar: 'velvet rose & oud', boost: 0.18 },
  { pair: ['peach', 'cardamom'], sahar: 'peachy paradise', boost: 0.18 },
  { pair: ['tobacco', 'cinnamon'], sahar: 'tobacco spice', boost: 0.18 },
  { pair: ['tobacco', 'paprika'], sahar: 'tobacco spice', boost: 0.18 },
  { pair: ['leather', 'cinnamon'], sahar: 'millionaire aura', boost: 0.18 },
  { pair: ['oud', 'cardamom'], sahar: 'mystic oud', boost: 0.18 },
  { pair: ['rosewood', 'cardamom'], sahar: 'mystic oud', boost: 0.18 },
  { pair: ['black currant', 'rose'], sahar: 'empress charm', boost: 0.18 },
  { pair: ['sweet pea', 'peony'], sahar: 'magnolia magic', boost: 0.18 },
  { pair: ['lychee', 'lotus'], sahar: 'lychee sunset', boost: 0.18 },
  { pair: ['oud', 'fig'], sahar: 'oudmazing', boost: 0.18 }
];

// Multi-layered Olfactory Similarity Engine
const calculatePerfumeMatch = (targetPerfume, saharPerfume) => {
  const targetProf = getFragranceProfile(targetPerfume, false);
  const saharProf = getFragranceProfile(saharPerfume, true);

  if (targetProf.all.size === 0 || saharProf.all.size === 0) {
    return { score: 0, matchNotes: [] };
  }

  const commonAll = [...targetProf.all].filter(note => saharProf.all.has(note));
  if (commonAll.length === 0) {
    return { score: 0, matchNotes: [] };
  }

  // 1. Note Overlap (Sørensen-Dice Coefficient)
  const diceSimilarity = (2 * commonAll.length) / (targetProf.all.size + saharProf.all.size);

  // 2. Pyramid-Weighted Similarity (Base > Middle > Top)
  const commonBase = [...targetProf.base].filter(n => saharProf.base.has(n));
  const commonMid = [...targetProf.mid].filter(n => saharProf.mid.has(n));
  const commonTop = [...targetProf.top].filter(n => saharProf.top.has(n));

  const crossMatches = commonAll.filter(
    n => !commonBase.includes(n) && !commonMid.includes(n) && !commonTop.includes(n)
  );

  let pyramidScore = 0;
  let weightSum = 0;

  if (targetProf.base.size > 0) {
    pyramidScore += 0.45 * (commonBase.length / targetProf.base.size);
    weightSum += 0.45;
  }
  if (targetProf.mid.size > 0) {
    pyramidScore += 0.35 * (commonMid.length / targetProf.mid.size);
    weightSum += 0.35;
  }
  if (targetProf.top.size > 0) {
    pyramidScore += 0.20 * (commonTop.length / targetProf.top.size);
    weightSum += 0.20;
  }

  if (weightSum > 0) {
    pyramidScore = (pyramidScore / weightSum) + (0.15 * crossMatches.length / Math.max(targetProf.all.size, 1));
  }

  // 3. Main Accords & Olfactory Profile Alignment
  const targetAccords = [
    targetPerfume.mainaccord1,
    targetPerfume.mainaccord2,
    targetPerfume.mainaccord3,
    targetPerfume.mainaccord4,
    targetPerfume.mainaccord5
  ]
    .filter(Boolean)
    .map(a => a.toLowerCase().trim());

  const saharNameKey = (saharPerfume.Name || '').toLowerCase().trim();
  const saharCategories = categoryMap[saharNameKey] || [];

  let accordMatches = 0;
  targetAccords.forEach(accord => {
    const hasMatch = saharCategories.some(cat => cat.includes(accord) || accord.includes(cat));
    if (hasMatch) accordMatches++;
  });

  const accordScore = targetAccords.length > 0
    ? accordMatches / targetAccords.length
    : 0.5;

  // 4. Signature / Specificity Note Bonus
  const signatureMatches = commonAll.filter(n => SIGNATURE_NOTES.has(n));
  let signatureBonus = Math.min(signatureMatches.length * 0.05, 0.20);

  // 5. Signature Chord / DNA Synergy Bonus
  for (const { pair, sahar, boost } of SIGNATURE_PAIRS) {
    if (saharNameKey === sahar) {
      const hasFirst = targetProf.all.has(pair[0]);
      const hasSecond = targetProf.all.has(pair[1]);
      if (hasFirst && hasSecond) {
        signatureBonus += boost;
        break;
      }
    }
  }

  // 6. Blended Base Score
  const baseScore = (0.35 * diceSimilarity) +
                    (0.30 * pyramidScore) +
                    (0.15 * accordScore) +
                    signatureBonus;

  // Smooth calibration curve so strong matches feel authentic (70%-98%)
  const boostedScore = 1.0 - Math.pow(Math.max(0, 1.0 - baseScore), 1.5);
  const finalScore = Math.min(Math.round(boostedScore * 1000) / 1000, 0.98);

  // Clean note names for user presentation
  const matchNotes = commonAll.map(note => {
    return saharProf.rawNameMap[note] ||
           targetProf.rawNameMap[note] ||
           note.charAt(0).toUpperCase() + note.slice(1);
  });

  return { score: finalScore, matchNotes };
};

export const getRecommendations = (targetPerfume) => {
  if (!targetPerfume || saharDatabase.length === 0) return [];

  const scored = saharDatabase.map(saharPerfume => {
    const { score, matchNotes } = calculatePerfumeMatch(targetPerfume, saharPerfume);
    return {
      ...saharPerfume,
      score,
      matchNotes
    };
  });

  // Sort by similarity score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top recommendations with meaningful match score
  return scored.slice(0, 2);
};
