import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
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

  const handleSelect = (perfume) => {
    setSelectedPerfume(perfume);
    setQuery(perfume.Perfume); // Set input to selected name
    setIsSearching(false);
    const recs = getRecommendations(perfume);
    setRecommendations(recs);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <span className="ml-3 text-xl font-light">Loading Fragrances...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white font-sans selection:bg-amber-500 selection:text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-20">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 font-playfair">
            SaharScents
          </h1>
          <p className="text-lg text-gray-300 font-light tracking-wide">
            Discover your perfect scent match
          </p>
        </motion.div>

        {/* Search Section */}
        <div className="relative max-w-2xl mx-auto mb-16 z-50">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Enter a perfume you love (e.g., J'adore)..."
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full py-4 pl-14 pr-6 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 shadow-2xl transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {isSearching && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
              >
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-6 py-4 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 flex flex-col"
                  >
                    <span className="font-medium text-amber-100">{result.Perfume}</span>
                    <span className="text-sm text-gray-400">{result.Brand} • {result.Gender}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {selectedPerfume && (
            <motion.div
              key={selectedPerfume.Perfume}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-12">
                <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs">Based on your selection</p>
                <h2 className="text-3xl font-playfair text-white">
                  {selectedPerfume.Perfume} <span className="text-gray-500 text-xl">by {selectedPerfume.Brand}</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {recommendations.map((rec, idx) => (
                  <PerfumeCard key={idx} perfume={rec} delay={idx * 0.2} />
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center text-gray-400 mt-8">
                  <p>No close matches found. Try another perfume!</p>
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
