import Papa from 'papaparse';
import Fuse from 'fuse.js';

let perfumeDatabase = [];
let saharDatabase = [];
let noteFamilyMap = {}; // Maps note name -> family
let fuse = null;

export const loadDatabases = async () => {
  try {
    const [perfumeResponse, saharResponse, familiesResponse] = await Promise.all([
      fetch('/perfume-database.csv'),
      fetch('/saharscents-database.csv'),
      fetch('/perfume_note_families.csv')
    ]);

    const perfumeText = await perfumeResponse.text();
    const saharText = await saharResponse.text();
    const familiesText = await familiesResponse.text();

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

    const familiesResult = Papa.parse(familiesText, {
      header: true,
      delimiter: ',',
      skipEmptyLines: true,
      transformHeader: (header) => header.trim()
    });

    perfumeDatabase = perfumeResult.data;
    saharDatabase = saharResult.data.filter(item => item['Product Type'] === 'Perfume');

    // Build note-to-family mapping (lowercase for easy lookup)
    noteFamilyMap = {};
    familiesResult.data.forEach(row => {
      if (row.note && row.family) {
        noteFamilyMap[row.note.toLowerCase().trim()] = row.family.trim();
      }
    });

    // Initialize Fuse for fuzzy search
    fuse = new Fuse(perfumeDatabase, {
      keys: ['Perfume', 'Brand'],
      threshold: 0.3,
      distance: 100
    });

    console.log('Databases loaded. Note families:', Object.keys(noteFamilyMap).length);
    return true;
  } catch (error) {
    console.error('Error loading databases:', error);
    return false;
  }
};

export const findPerfume = (query) => {
  if (!fuse) return [];
  return fuse.search(query).map(result => result.item).slice(0, 15);
};

// Convert notes string to a Set of families
const getNoteFamilies = (notesStr) => {
  if (!notesStr) return new Set();
  const notes = notesStr.split(',').map(n => n.toLowerCase().trim()).filter(n => n);
  const families = notes.map(note => noteFamilyMap[note] || null).filter(f => f);
  return new Set(families);
};

// Calculate Jaccard similarity between two family sets
const calculateFamilySimilarity = (setA, setB) => {
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

// Weighted family-based matching: Top 30%, Middle 30%, Base 40%
const calculateWeightedFamilyScore = (targetPerfume, saharPerfume) => {
  // Get families for each layer - target perfume uses Top/Middle/Base, SaharScents uses Top Notes/Middle Notes/Base Notes
  const targetTopFamilies = getNoteFamilies(targetPerfume['Top']);
  const targetMidFamilies = getNoteFamilies(targetPerfume['Middle']);
  const targetBaseFamilies = getNoteFamilies(targetPerfume['Base']);

  const saharTopFamilies = getNoteFamilies(saharPerfume['Top Notes']);
  const saharMidFamilies = getNoteFamilies(saharPerfume['Middle Notes']);
  const saharBaseFamilies = getNoteFamilies(saharPerfume['Base Notes']);

  // Calculate similarity for each layer
  const topSimilarity = calculateFamilySimilarity(targetTopFamilies, saharTopFamilies);
  const midSimilarity = calculateFamilySimilarity(targetMidFamilies, saharMidFamilies);
  const baseSimilarity = calculateFamilySimilarity(targetBaseFamilies, saharBaseFamilies);

  // Weighted score: Top 30%, Middle 30%, Base 40%
  const weightedScore = (topSimilarity * 0.30) + (midSimilarity * 0.30) + (baseSimilarity * 0.40);

  return weightedScore;
};

// Get matched families for display
const getMatchedFamilies = (targetPerfume, saharPerfume) => {
  const allTargetFamilies = new Set([
    ...getNoteFamilies(targetPerfume['Top']),
    ...getNoteFamilies(targetPerfume['Middle']),
    ...getNoteFamilies(targetPerfume['Base'])
  ]);

  const allSaharFamilies = new Set([
    ...getNoteFamilies(saharPerfume['Top Notes']),
    ...getNoteFamilies(saharPerfume['Middle Notes']),
    ...getNoteFamilies(saharPerfume['Base Notes'])
  ]);

  return [...allTargetFamilies].filter(f => allSaharFamilies.has(f));
};

export const getRecommendations = (targetPerfume) => {
  if (!targetPerfume || saharDatabase.length === 0) return [];

  const scored = saharDatabase.map(saharPerfume => {
    const score = calculateWeightedFamilyScore(targetPerfume, saharPerfume);
    const matchedFamilies = getMatchedFamilies(targetPerfume, saharPerfume);
    return { ...saharPerfume, score, matchNotes: matchedFamilies };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 2);
};
