import React from 'react';
import { motion } from 'framer-motion';

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

  const NoteSection = ({ label, notes }) => (
    <div style={{ marginBottom: '20px' }}>
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
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{
          fontSize: '22px',
          fontWeight: '600',
          color: '#fbbf24',
          marginBottom: '6px',
          fontFamily: "'Playfair Display', serif"
        }}>
          {perfume.Name}
        </h3>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}>
          {perfume['Product Type'] || 'Perfume'}
        </span>
      </div>

      {/* Notes Sections */}
      <NoteSection label="Top Notes" notes={topNotes} />
      <NoteSection label="Middle Notes" notes={midNotes} />
      <NoteSection label="Base Notes" notes={baseNotes} />

      {/* Matched Notes */}
      {perfume.matchNotes && perfume.matchNotes.length > 0 && (
        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '600',
            color: '#fbbf24',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '8px'
          }}>
            Matched Notes
          </span>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: '1.6'
          }}>
            {perfume.matchNotes.join(', ')}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default PerfumeCard;
