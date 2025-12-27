import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Mountain } from 'lucide-react';

const PerfumeCard = ({ perfume, delay = 0 }) => {
  // Helper to safely split notes
  const splitNotes = (notesStr) => {
    if (!notesStr) return [];
    return notesStr.split(',').map(n => n.trim());
  };

  const topNotes = splitNotes(perfume['Top Notes']);
  const midNotes = splitNotes(perfume['Middle Notes']);
  const baseNotes = splitNotes(perfume['Base Notes']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <h3 className="text-2xl font-playfair font-bold mb-2 text-amber-200">{perfume.Name}</h3>
      <p className="text-sm text-gray-300 mb-4 italic">{perfume.Description}</p>
      
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Wind className="w-5 h-5 text-blue-300 mt-1 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Top Notes</span>
            <p className="text-sm text-gray-200">{topNotes.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Droplets className="w-5 h-5 text-pink-300 mt-1 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider">Middle Notes</span>
            <p className="text-sm text-gray-200">{midNotes.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Mountain className="w-5 h-5 text-amber-300 mt-1 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Base Notes</span>
            <p className="text-sm text-gray-200">{baseNotes.join(', ')}</p>
          </div>
        </div>
      </div>

      {perfume.matchNotes && perfume.matchNotes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-green-300">
            Matching notes: {perfume.matchNotes.join(', ')}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PerfumeCard;
