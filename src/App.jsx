import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Sparkles, Loader2, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDatabases, findPerfume, getRecommendations, getDatabaseData, formatDisplayName } from './utils/matching';
import PerfumeCard from './components/PerfumeCard';
import './App.css';

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(delay, 0.1), ease: "easeOut" }}
      style={{
        background: 'rgba(30, 41, 59, 0.65)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '28px',
        backdropFilter: 'blur(12px)',
        transform: 'translateZ(0)'
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
  const searchContainerRef = useRef(null);
  
  // Category feature states
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [saharscentsData, setSaharscentsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPerfumes, setCategoryPerfumes] = useState([]);
  const [showAllPerfumes, setShowAllPerfumes] = useState(false);

  // Single unified data load
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await loadDatabases();
      if (isMounted) {
        const data = getDatabaseData();
        setCategories(data.categories || []);
        setSaharscentsData(data.saharPerfumes || []);
        setCategoryMap(data.categoryMap || {});
        setLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Debounced search for zero input lag and high frame rates on mobile
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // If query matches current selected perfume name, do not re-open the dropdown
    if (selectedPerfume && formatDisplayName(selectedPerfume.Perfume).toLowerCase().trim() === query.toLowerCase().trim()) {
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      const results = findPerfume(query);
      setSearchResults(results);
      setIsSearching(results.length > 0);
    }, 60);

    return () => clearTimeout(timer);
  }, [query, selectedPerfume]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (selectedPerfume && formatDisplayName(selectedPerfume.Perfume) !== val) {
      setSelectedPerfume(null);
      setRecommendations([]);
    }
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const clearSearch = useCallback(() => {
    setQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSelectedPerfume(null);
    setRecommendations([]);
  }, []);

  const handleSelect = useCallback((perfume) => {
    setSelectedPerfume(perfume);
    setQuery(formatDisplayName(perfume.Perfume));
    setIsSearching(false);
    setSearchResults([]);
    setSelectedCategory(null);
    setCategoryPerfumes([]);
    const recs = getRecommendations(perfume);
    setRecommendations(recs);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedPerfume(null);
    setRecommendations([]);
    setShowAllPerfumes(false);
    setQuery('');
    setIsSearching(false);
    
    const catLower = category.toLowerCase().trim();
    const matching = saharscentsData.filter(ss => {
      const nameKey = (ss.Name || '').toLowerCase().trim();
      const cats = categoryMap[nameKey] || [];
      return cats.includes(catLower);
    });
    
    setCategoryPerfumes(matching);
  }, [saharscentsData, categoryMap]);

  const clearCategory = useCallback(() => {
    setSelectedCategory(null);
    setCategoryPerfumes([]);
  }, []);

  const handleViewAllPerfumes = useCallback(() => {
    setShowAllPerfumes(true);
    setSelectedPerfume(null);
    setRecommendations([]);
    setSelectedCategory(null);
    setCategoryPerfumes([]);
    setQuery('');
    setIsSearching(false);
  }, []);

  const clearAllPerfumes = useCallback(() => {
    setShowAllPerfumes(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex flex-col items-center justify-center text-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-[var(--color-accent-gold)]" />
        </motion.div>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-4 text-xl font-light tracking-widest text-[var(--color-accent-gold)] uppercase"
        >
          Curating Scents
        </motion.span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-accent-gold)] selection:text-black pb-20 overflow-x-hidden relative">
      
      {/* Background Elements - Hardware accelerated GPU radial gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, transform: 'translateZ(0)' }}>
        <div 
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(88, 28, 135, 0.35) 0%, rgba(88, 28, 135, 0) 70%)',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(217, 119, 6, 0) 70%)',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12 md:pt-24 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center mb-10 md:mb-14"
        >

          <h1 className="text-4xl md:text-6xl font-bold mb-3 text-gradient-gold font-playfair tracking-tight leading-tight">
            SaharScents
          </h1>
          <p className="text-base md:text-lg text-[var(--color-text-secondary)] font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            Find a scent that smells similar to SaharScents.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          ref={searchContainerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-50"
          style={{ maxWidth: '500px', margin: '0 auto 3.5rem auto', padding: '0 1rem' }}
        >
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-30 blur-xl pointer-events-none"
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
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0 && (!selectedPerfume || formatDisplayName(selectedPerfume.Perfume) !== query)) {
                  setIsSearching(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearching(false);
                }
              }}
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
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
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
                  <button
                    key={idx}
                    onClick={() => handleSelect(result)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 20px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'background 0.12s ease'
                    }}
                    className="hover:bg-white/10 active:bg-white/15"
                  >
                    <span style={{ color: 'white', fontSize: '15px', fontWeight: '500' }}>{formatDisplayName(result.Perfume)}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>{formatDisplayName(result.Brand)} • {result.Gender}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Grid Section */}
        {!selectedPerfume && !selectedCategory && !showAllPerfumes && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-16"
            style={{ padding: '0 1rem' }}
          >
            <div className="text-center mb-8">
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
                gap: '12px',
                maxWidth: '800px', 
                margin: '0 auto' 
              }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategorySelect(category)}
                  className="group cursor-pointer"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.15s ease-out',
                  }}
                >
                  <span 
                    className="font-semibold transition-colors duration-150 group-hover:text-[var(--color-accent-gold)]"
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

            {/* View All Perfumes Button */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '32px' 
              }}
            >
              <motion.button
                onClick={handleViewAllPerfumes}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '14px 32px',
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.35)',
                  boxShadow: '0 4px 20px rgba(251, 191, 36, 0.12)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                className="hover:shadow-[0_6px_28px_rgba(251,191,36,0.25)]"
              >
                <Sparkles size={17} style={{ color: '#fbbf24' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fbbf24',
                  letterSpacing: '0.03em'
                }}>
                  View All SaharScents Perfumes
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* All Perfumes Section */}
        <AnimatePresence mode="wait">
          {showAllPerfumes && saharscentsData.length > 0 && (
            <motion.div
              key="all-perfumes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ padding: '0 1rem' }}
            >
              {/* Back button and header */}
              <div className="mb-6">
                <motion.button
                  onClick={clearAllPerfumes}
                  whileHover={{ scale: 1.02, x: -3 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-[rgba(251,191,36,0.2)]"
                >
                  <ChevronLeft size={18} style={{ color: '#fbbf24' }} />
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#fbbf24',
                    letterSpacing: '0.02em'
                  }}>
                    Back to Home
                  </span>
                </motion.button>
                
                <div className="text-center">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "80px" }} 
                    transition={{ duration: 0.25 }}
                    className="h-1 bg-[var(--color-accent-gold)] mx-auto mb-4 rounded-full"
                  />
                  <p className="text-[var(--color-accent-gold)] mb-2 uppercase tracking-[0.2em] text-xs font-semibold">
                    Our Collection
                  </p>
                  <h2 className="text-2xl md:text-3xl font-playfair text-white">
                    All SaharScents Perfumes
                  </h2>
                  <p className="text-[var(--color-text-secondary)] mt-2 text-sm max-w-lg mx-auto">
                    Explore our full range of {saharscentsData.length} luxury oil-based fragrances
                  </p>
                </div>
              </div>

              {/* All Perfume Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px', padding: '0 1rem' }}>
                {saharscentsData.map((perfume, idx) => (
                  <div key={idx} id={`all-perfume-${perfume.Name ? perfume.Name.replace(/\s+/g, '-').toLowerCase() : idx}`}>
                    <CategoryPerfumeCard perfume={perfume} delay={Math.min(idx * 0.03, 0.15)} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Results Section */}
        <AnimatePresence mode="wait">
          {selectedCategory && categoryPerfumes.length > 0 && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ padding: '0 1rem' }}
            >
              {/* Back button and header */}
              <div className="mb-6">
                <motion.button
                  onClick={clearCategory}
                  whileHover={{ scale: 1.02, x: -3 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-[rgba(251,191,36,0.2)]"
                >
                  <ChevronLeft size={18} style={{ color: '#fbbf24' }} />
                  <span style={{ 
                    fontSize: '13px', 
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
                    animate={{ width: "80px" }} 
                    transition={{ duration: 0.25 }}
                    className="h-1 bg-[var(--color-accent-gold)] mx-auto mb-4 rounded-full"
                  />
                  <p className="text-[var(--color-accent-gold)] mb-2 uppercase tracking-[0.2em] text-xs font-semibold">
                    {selectedCategory} Scents
                  </p>
                  <h2 className="text-2xl md:text-3xl font-playfair text-white capitalize">
                    {categoryPerfumes.length} Perfume{categoryPerfumes.length !== 1 ? 's' : ''} Found
                  </h2>
                  
                  {/* Perfume Names List */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '16px',
                      padding: '0 1rem'
                    }}
                  >
                    {categoryPerfumes.map((perfume, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.12 }}
                        onClick={() => {
                          const element = document.getElementById(`perfume-${perfume.Name.replace(/\s+/g, '-').toLowerCase()}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: '6px 14px',
                          background: 'rgba(251, 191, 36, 0.1)',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#fbbf24',
                          letterSpacing: '0.02em',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        className="hover:bg-[rgba(251,191,36,0.2)]"
                      >
                        {perfume.Name}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Perfume Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px', padding: '0 1rem' }}>
                {categoryPerfumes.map((perfume, idx) => (
                  <div key={idx} id={`perfume-${perfume.Name.replace(/\s+/g, '-').toLowerCase()}`}>
                    <CategoryPerfumeCard perfume={perfume} delay={Math.min(idx * 0.03, 0.15)} />
                  </div>
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="text-center mb-8">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "80px" }} 
                  transition={{ duration: 0.25 }}
                  className="h-1 bg-[var(--color-accent-gold)] mx-auto mb-4 rounded-full"
                />
                <p className="text-[var(--color-accent-gold)] mb-2 uppercase tracking-[0.2em] text-xs font-semibold">Perfect Matches For</p>
                <h2 className="text-2xl md:text-3xl font-playfair text-white">
                  {formatDisplayName(selectedPerfume.Perfume)}
                </h2>
                <p className="text-[var(--color-text-secondary)] mt-1 text-base">by {formatDisplayName(selectedPerfume.Brand)}</p>
              </div>

              {/* Searched Perfume Notes */}
              {(selectedPerfume.Top || selectedPerfume.Middle || selectedPerfume.Base) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    background: 'rgba(30, 41, 59, 0.65)',
                    border: '1px solid rgba(251, 191, 36, 0.15)',
                    borderRadius: '20px',
                    padding: '24px',
                    backdropFilter: 'blur(12px)',
                    marginBottom: '36px',
                    maxWidth: '700px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    transform: 'translateZ(0)'
                  }}
                >
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#fbbf24',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    Notes of {formatDisplayName(selectedPerfume.Perfume)}
                  </h3>

                  {selectedPerfume.Top && (
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{
                        display: 'block', fontSize: '10px', fontWeight: '600',
                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                        letterSpacing: '0.15em', marginBottom: '8px'
                      }}>Top Notes</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedPerfume.Top.split(',').map((n, i) => (
                          <span key={i} style={{
                            display: 'inline-block', padding: '5px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                            color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em'
                          }}>{n.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPerfume.Middle && (
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{
                        display: 'block', fontSize: '10px', fontWeight: '600',
                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                        letterSpacing: '0.15em', marginBottom: '8px'
                      }}>Middle Notes</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedPerfume.Middle.split(',').map((n, i) => (
                          <span key={i} style={{
                            display: 'inline-block', padding: '5px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                            color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em'
                          }}>{n.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPerfume.Base && (
                    <div>
                      <span style={{
                        display: 'block', fontSize: '10px', fontWeight: '600',
                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                        letterSpacing: '0.15em', marginBottom: '8px'
                      }}>Base Notes</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {selectedPerfume.Base.split(',').map((n, i) => (
                          <span key={i} style={{
                            display: 'inline-block', padding: '5px 12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '20px', fontSize: '11px', fontWeight: '500',
                            color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em'
                          }}>{n.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {recommendations.map((rec, idx) => (
                  <PerfumeCard key={idx} perfume={rec} delay={idx * 0.08} />
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center text-gray-400 mt-10 glass-panel p-8 rounded-2xl max-w-md mx-auto">
                  <p className="text-base">We couldn't find a direct match in our collection yet.</p>
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
