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

  // Calculate match percentage (score is 0-1, convert to 0-100)
  const matchPercentage = perfume.score ? Math.round(perfume.score * 100) : 0;

  // Determine color based on percentage
  const getMatchColor = (percentage) => {
    if (percentage >= 70) return '#22c55e'; // Green
    if (percentage >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const matchColor = getMatchColor(matchPercentage);

  // SVG Ring component
  const MatchRing = () => {
    const size = 56;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (matchPercentage / 100) * circumference;

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={matchColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '14px',
          fontWeight: '700',
          color: matchColor
        }}>
          {matchPercentage}%
        </span>
      </div>
    );
  };

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
      {/* Header with Match Ring */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
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
        <MatchRing />
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
