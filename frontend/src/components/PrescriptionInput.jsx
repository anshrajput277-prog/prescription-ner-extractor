import React, { useState } from 'react';
import { Sparkles, Trash2, FileText, Send, ArrowRight } from 'lucide-react';

const SAMPLE_PRESCRIPTIONS = [
  {
    title: 'Amoxicillin Antibiotic',
    text: 'Take Amoxicillin 500mg three times daily for 7 days with plenty of water',
  },
  {
    title: 'Paracetamol Fever/Pain',
    text: 'Tab Paracetamol 650mg SOS after meals for 3 days',
  },
  {
    title: 'Metformin Diabetes',
    text: 'Prescription: Metformin 500mg twice daily with breakfast and dinner for 30 days',
  },
  {
    title: 'Azithromycin Course',
    text: 'Azithromycin 250mg once daily 1 hour before meal for 5 days',
  },
  {
    title: 'Ibuprofen Anti-inflammatory',
    text: 'Take Ibuprofen 400mg every 8 hours after food for 5 days',
  },
];

export default function PrescriptionInput({ onExtract, isLoading }) {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onExtract(text.trim(), notes.trim());
  };

  const handleSelectSample = (sampleText) => {
    setText(sampleText);
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Title & Clear */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--accent-cyan)',
            padding: '6px',
            borderRadius: '8px',
          }}>
            <FileText size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Input Prescription Text</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Enter medical dosage instructions, doctor notes, or click a quick sample below
            </p>
          </div>
        </div>

        {text && (
          <button
            type="button"
            onClick={() => setText('')}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Preset Samples */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Quick Preset Examples (Click to load):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SAMPLE_PRESCRIPTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s.text)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Sparkles size={12} color="var(--accent-cyan)" />
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Prescribed Amoxicillin 500mg capsule three times a day for 7 days after food..."
            rows={4}
            maxLength={5000}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              color: 'var(--text-main)',
              fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-cyan)';
              e.target.style.boxShadow = '0 0 0 2px rgba(6, 182, 212, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-card)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            fontSize: '11px',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}>
            {text.length} / 5000
          </div>
        </div>

        {/* Optional Note */}
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional patient note or diagnosis (e.g. Acute bronchitis, Dr. Smith)..."
          maxLength={500}
          style={{
            width: '100%',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--text-main)',
            fontSize: '13px',
            outline: 'none',
          }}
        />

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="btn btn-primary"
            style={{ minWidth: '180px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Extracting Entities...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Run NER Extraction</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
