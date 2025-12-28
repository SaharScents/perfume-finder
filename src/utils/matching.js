import Papa from 'papaparse';
import Fuse from 'fuse.js';

let perfumeDatabase = [];
let saharDatabase = [];
let fuse = null;

export const loadDatabases = async () => {
  try {
    const [perfumeResponse, saharResponse] = await Promise.all([
      fetch('/perfume-database.csv'),
      fetch('/saharscents-database.csv')
    ]);

    const perfumeText = await perfumeResponse.text();
    const saharText = await saharResponse.text();

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

    perfumeDatabase = perfumeResult.data;
    saharDatabase = saharResult.data.filter(item => item['Product Type'] === 'Perfume'); // Filter only perfumes

    // Initialize Fuse for fuzzy search
    fuse = new Fuse(perfumeDatabase, {
      keys: ['Perfume', 'Brand'],
      threshold: 0.3,
      distance: 100
    });

    return true;
  } catch (error) {
    console.error('Error loading databases:', error);
    return false;
  }
};

export const findPerfume = (query) => {
  if (!fuse) return [];
  return fuse.search(query).map(result => result.item).slice(0, 12); // Return top 12 matches
};

const getNotesSet = (item, isSahar = false) => {
  let notes = [];
  if (isSahar) {
    if (item['Top Notes']) notes.push(...item['Top Notes'].split(','));
    if (item['Middle Notes']) notes.push(...item['Middle Notes'].split(','));
    if (item['Base Notes']) notes.push(...item['Base Notes'].split(','));
  } else {
    if (item['Top']) notes.push(...item['Top'].split(','));
    if (item['Middle']) notes.push(...item['Middle'].split(','));
    if (item['Base']) notes.push(...item['Base'].split(','));
  }
  
  // Normalize: lowercase, trim
  return new Set(notes.map(n => n.toLowerCase().trim()).filter(n => n));
};

const calculateJaccardSimilarity = (setA, setB) => {
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

export const getRecommendations = (targetPerfume) => {
  if (!targetPerfume || saharDatabase.length === 0) return [];

  const targetNotes = getNotesSet(targetPerfume, false);

  const scored = saharDatabase.map(saharPerfume => {
    const saharNotes = getNotesSet(saharPerfume, true);
    const score = calculateJaccardSimilarity(targetNotes, saharNotes);
    return { ...saharPerfume, score, matchNotes: [...targetNotes].filter(x => saharNotes.has(x)) };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 2);
};
