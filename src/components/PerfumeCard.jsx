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
    <span 
      className="inline-block bg-white/5 hover:bg-white/10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold text-gray-200 border border-white/10 transition-all duration-300 hover:border-[var(--color-accent-gold)]/30 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)] mb-2 mr-2"
      style={{ padding: '8px 24px' }}
    >
      {note}
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden group h-full flex flex-col"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-accent-gold)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-accent-gold)]/20 transition-all duration-500" />

      <div className="relative z-10 flex-grow">
        <div className="flex justify-between items-start mb-6">
          <div className="pr-4">
            <h3 className="text-2xl font-playfair font-bold text-[var(--color-accent-gold)] mb-2 leading-tight">
              {perfume.Name}
            </h3>
            <span className="inline-block px-3 py-1 bg-[var(--color-accent-gold)]/10 text-[var(--color-accent-gold)] text-[10px] rounded-full tracking-[0.2em] uppercase font-bold">
              {perfume['Product Type'] || 'Perfume'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-300 mb-8 leading-relaxed italic border-l-2 border-[var(--color-accent-gold)]/30 pl-4 opacity-90">
          "{perfume.Description}"
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
          <div className="group/note">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-[0.2em]">Top Notes</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {topNotes.map((note, i) => <NoteTag key={i} note={note} />)}
            </div>
          </div>
          
          <div className="group/note">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-pink-200 uppercase tracking-[0.2em]">Middle Notes</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {midNotes.map((note, i) => <NoteTag key={i} note={note} />)}
            </div>
          </div>
          
          <div className="group/note">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-[0.2em]">Base Notes</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {baseNotes.map((note, i) => <NoteTag key={i} note={note} />)}
            </div>
          </div>
        </div>

        {perfume.matchNotes && perfume.matchNotes.length > 0 && (
          <div className="mt-8 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 text-[var(--color-accent-gold)] mb-2">
              <span className="text-[16px] font-bold uppercase tracking-[0.15em]">Matched Notes</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {perfume.matchNotes.join(', ')}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PerfumeCard;
