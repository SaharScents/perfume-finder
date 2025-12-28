import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDatabases, findPerfume, getRecommendations } from './utils/matching';
import PerfumeCard from './components/PerfumeCard';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadDatabases().then(() => {
      setLoading(false);
    });
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
    const recs = getRecommendations(perfume);
    setRecommendations(recs);
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
          className="text-center mb-12 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-8 h-8 text-[var(--color-accent-gold)] mx-auto mb-2 opacity-80" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gradient-gold font-playfair tracking-tight">
            SaharScents
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] font-light tracking-wide max-w-lg mx-auto">
            Discover your signature scent through the art of fragrance matching.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative max-w-2xl mx-auto mb-16 z-50"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 blur"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search for a perfume you love..."
                className="w-full bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl border border-white/10 rounded-full py-4 md:py-5 pl-14 pr-12 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-gold)]/50 shadow-2xl transition-all"
              />
              <Search className="absolute left-5 text-gray-400 w-6 h-6" />
              {query && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearching && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[60vh] overflow-y-auto custom-scrollbar"
              >
                {searchResults.map((result, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex flex-col group"
                  >
                    <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-gold)] transition-colors text-lg">{result.Perfume}</span>
                    <span className="text-sm text-[var(--color-text-secondary)] mt-1">{result.Brand} • {result.Gender}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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

              <div className="grid md:grid-cols-2 gap-6 md:gap-10">
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
