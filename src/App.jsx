import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDatabases, findPerfume, getRecommendations } from './utils/matching';
import PerfumeCard from './components/PerfumeCard';
import './App.css';

// Parse CSV helper function
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] || '';
    });
    return obj;
  });
};

// Category Perfume Card Component
const CategoryPerfumeCard = ({ perfume, delay = 0 }) => {
  const splitNotes = (notesStr) => {
    if (!notesStr) return [];
    return notesStr.split(',').map(n => n.trim());
  };

  const topNotes = splitNotes(perfume['Top Notes']);
  const midNotes = splitNotes(perfume['Middle Notes']);
  const baseNotes = splitNotes(perfume['Base Notes']);

  const NoteTag = ({ note }) => (
    <span 
      style={{
        display: 'inline-block',
        padding: '6px 14px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: '0.05em'
      }}
    >
      {note}
    </span>
  );

  const NoteSection = ({ label, notes }) => {
    if (!notes || notes.length === 0) return null;
    return (
      <div style={{ marginBottom: '16px' }}>
        <span style={{
          display: 'block',
          fontSize: '10px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '10px'
        }}>
          {label}
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {notes.map((note, i) => <NoteTag key={i} note={note} />)}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '28px',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#fbbf24',
          marginBottom: '8px',
          fontFamily: "'Playfair Display', serif"
        }}>
          {perfume.Name}
        </h3>
        <span style={{
          display: 'inline-block',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          background: 'rgba(251, 191, 36, 0.1)',
          padding: '4px 10px',
          borderRadius: '20px',
          border: '1px solid rgba(251, 191, 36, 0.2)'
        }}>
          {perfume['Product Type'] || 'Perfume'}
        </span>
      </div>

      {/* Description */}
      {perfume.Description && (
        <p style={{
          fontSize: '14px',
          lineHeight: '1.7',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {perfume.Description}
        </p>
      )}

      {/* Notes Sections */}
      <NoteSection label="Top Notes" notes={topNotes} />
      <NoteSection label="Middle Notes" notes={midNotes} />
      <NoteSection label="Base Notes" notes={baseNotes} />
    </motion.div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Category feature states
  const [categories, setCategories] = useState([]);
  const [perfumeCategories, setPerfumeCategories] = useState([]);
  const [saharscentsData, setSaharscentsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPerfumes, setCategoryPerfumes] = useState([]);

  useEffect(() => {
    const loadAll = async () => {
      // Load the matching databases
      await loadDatabases();
      
      // Load perfume categories
      try {
        const catResponse = await fetch('/perfume-categories.csv');
        const catText = await catResponse.text();
        const catData = parseCSV(catText);
        setPerfumeCategories(catData);
        
        // Extract unique categories
        const allCategories = new Set();
        catData.forEach(item => {
          if (item.Category) {
            item.Category.split(',').forEach(cat => {
              allCategories.add(cat.trim());
            });
          }
        });
        setCategories([...allCategories].sort());
        
        // Load saharscents database for full perfume details
        const ssResponse = await fetch('/saharscents-database.csv');
        const ssText = await ssResponse.text();
        const ssData = parseCSV(ssText);
        setSaharscentsData(ssData);
      } catch (err) {
        console.error('Error loading category data:', err);
      }
      
      setLoading(false);
    };
    
    loadAll();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      const results = findPerfume(val);
      setSearchResults(results);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSelectedPerfume(null);
    setRecommendations([]);
  };

  const handleSelect = (perfume) => {
    setSelectedPerfume(perfume);
    setQuery(perfume.Perfume);
    setIsSearching(false);
    setSelectedCategory(null);
    setCategoryPerfumes([]);
    const recs = getRecommendations(perfume);
    setRecommendations(recs);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedPerfume(null);
    setRecommendations([]);
    setQuery('');
    setIsSearching(false);
    
    // Find all perfumes that match this category
    const matchingPerfumes = perfumeCategories.filter(item => {
      const cats = item.Category ? item.Category.split(',').map(c => c.trim()) : [];
      return cats.includes(category);
    });
    
    // Get full perfume data from saharscents database
    const fullPerfumeData = matchingPerfumes.map(mp => {
      const fullData = saharscentsData.find(ss => 
        ss.Name && mp.Perfume && 
        ss.Name.toLowerCase().trim() === mp.Perfume.toLowerCase().trim()
      );
      return fullData || { Name: mp.Perfume, categories: mp.Category };
    }).filter(p => p.Name);
    
    setCategoryPerfumes(fullPerfumeData);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setCategoryPerfumes([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex flex-col items-center justify-center text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-[var(--color-accent-gold)]" />
        </motion.div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xl font-light tracking-widest text-[var(--color-accent-gold)] uppercase"
        >
          Curating Scents
        </motion.span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-accent-gold)] selection:text-black pb-20 overflow-x-hidden relative">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12 md:pt-24 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-gold font-playfair tracking-tight leading-tight">
            SaharScents
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-secondary)] font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            Find a scent that smells similar to SaharScents.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-50"
          style={{ maxWidth: '500px', margin: '0 auto 4rem auto', padding: '0 1rem' }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-30 blur-xl"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(168,85,247,0.2))' }}
          />
          
          {/* Search Input Container */}
          <div 
            className="relative"
            style={{ 
              background: 'rgba(30, 41, 59, 0.95)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            <Search 
              className="absolute text-amber-400"
              style={{ left: '20px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px' }}
            />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search for a perfume..."
              style={{ 
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '18px 50px 18px 56px',
                fontSize: '16px',
                color: 'white',
                borderRadius: '16px'
              }}
            />
            {query && (
              <button 
                onClick={clearSearch}
                className="absolute hover:bg-white/10 rounded-full transition-colors"
                style={{ right: '16px', top: '50%', transform: 'translateY(-50%)', padding: '8px' }}
              >
                <X style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearching && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '12px',
                  background: 'rgba(30, 41, 59, 0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {searchResults.map((result, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelect(result)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    className="hover:bg-white/10"
                  >
                    <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>{result.Perfume}</span>
                    <span style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>{result.Brand} • {result.Gender}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Grid Section */}
        {!selectedPerfume && !selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-16"
            style={{ padding: '0 1rem' }}
          >
            <div className="text-center mb-10">
              <p className="text-[var(--color-accent-gold)] uppercase tracking-[0.2em] text-xs font-semibold mb-2">
                Explore By
              </p>
              <h2 className="text-2xl md:text-3xl font-playfair text-white">
                Scent Categories
              </h2>
            </div>
            
            <div 
              style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center',
                gap: '16px',
                maxWidth: '800px', 
                margin: '0 auto' 
              }}
            >
              {categories.map((category, idx) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * idx, duration: 0.3 }}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategorySelect(category)}
                  className="group cursor-pointer"
                  style={{
                    padding: '14px 28px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span 
                    className="font-semibold transition-all duration-300 group-hover:text-[var(--color-accent-gold)]"
                    style={{ 
                      color: 'rgba(255,255,255,0.9)',
                      letterSpacing: '0.03em',
                      fontSize: '14px'
                    }}
                  >
                    {category}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Results Section */}
        <AnimatePresence mode="wait">
          {selectedCategory && categoryPerfumes.length > 0 && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ padding: '0 1rem' }}
            >
              {/* Back button and header */}
              <div className="mb-8">
                <motion.button
                  onClick={clearCategory}
                  whileHover={{ scale: 1.02, x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    marginBottom: '24px',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover:bg-[rgba(251,191,36,0.2)]"
                >
                  <ChevronLeft size={20} style={{ color: '#fbbf24' }} />
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#fbbf24',
                    letterSpacing: '0.02em'
                  }}>
                    Back to Categories
                  </span>
                </motion.button>
                
                <div className="text-center">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100px" }} 
                    className="h-1 bg-[var(--color-accent-gold)] mx-auto mb-6 rounded-full"
                  />
                  <p className="text-[var(--color-accent-gold)] mb-3 uppercase tracking-[0.2em] text-xs font-semibold">
                    {selectedCategory} Scents
                  </p>
                  <h2 className="text-3xl md:text-4xl font-playfair text-white capitalize">
                    {categoryPerfumes.length} Perfume{categoryPerfumes.length !== 1 ? 's' : ''} Found
                  </h2>
                </div>
              </div>

              {/* Category Perfume Cards */}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {categoryPerfumes.map((perfume, idx) => (
                  <CategoryPerfumeCard key={idx} perfume={perfume} delay={idx * 0.15} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {selectedPerfume && (
            <motion.div
              key={selectedPerfume.Perfume}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-12">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100px" }} 
                  className="h-1 bg-[var(--color-accent-gold)] mx-auto mb-6 rounded-full"
                />
                <p className="text-[var(--color-accent-gold)] mb-3 uppercase tracking-[0.2em] text-xs font-semibold">Perfect Matches For</p>
                <h2 className="text-3xl md:text-4xl font-playfair text-white capitalize">
                  {selectedPerfume.Perfume}
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-2 text-lg">by {selectedPerfume.Brand}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                {recommendations.map((rec, idx) => (
                  <PerfumeCard key={idx} perfume={rec} delay={idx * 0.2} />
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center text-gray-400 mt-12 glass-panel p-8 rounded-2xl max-w-md mx-auto">
                  <p className="text-lg">We couldn't find a direct match in our collection yet.</p>
                  <p className="text-sm mt-2">Try searching for another favorite!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default App;
