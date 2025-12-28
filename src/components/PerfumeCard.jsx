import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Wind, Mountain, ArrowRight } from 'lucide-react';

const PerfumeCard = ({ perfume, delay = 0 }) => {
  const splitNotes = (notesStr) => {
    if (!notesStr) return [];
    return notesStr.split(',').map(n => n.trim());
  };

  const topNotes = splitNotes(perfume['Top Notes']);
  const midNotes = splitNotes(perfume['Middle Notes']);
  const baseNotes = splitNotes(perfume['Base Notes']);

  const NoteTag = ({ note }) => (
    <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-200 border border-white/10 mr-2 mb-2 shadow-sm">
      {note}
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-accent-gold)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-accent-gold)]/20 transition-all duration-500" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-playfair font-bold text-[var(--color-accent-gold)] mb-1">
              {perfume.Name}
            </h3>
            <span className="inline-block px-3 py-1 bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] text-xs rounded-full tracking-wider uppercase font-semibold">
              {perfume['Product Type'] || 'Perfume'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-300 mb-6 leading-relaxed italic border-l-2 border-[var(--color-accent-gold)]/30 pl-4">
          "{perfume.Description}"
        </p>
        
        <div className="space-y-5">
          <div className="group/note">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Top Notes</span>
            </div>
            <div className="flex flex-wrap">
              {topNotes.map((note, i) => <NoteTag key={i} note={note} />)}
            </div>
          </div>
          
          <div className="group/note">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-pink-300" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">Middle Notes</span>
            </div>
            <div className="flex flex-wrap">
              {midNotes.map((note, i) => <NoteTag key={i} note={note} />)}
            </div>
          </div>
          
          <div className="group/note">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Base Notes</span>
            </div>
            <div className="flex flex-wrap">
              {baseNotes.map((note, i) => <NoteTag key={i} note={note} />)}
            </div>
          </div>
        </div>

        {perfume.matchNotes && perfume.matchNotes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-[var(--color-accent-gold)]">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Matched Notes</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {perfume.matchNotes.join(', ')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const SparklesIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

export default PerfumeCard;
