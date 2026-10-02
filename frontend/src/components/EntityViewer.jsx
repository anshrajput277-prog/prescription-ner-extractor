import React, { useState } from 'react';
import { Pill, Scale, Clock, Calendar, Copy, Check, Code, Eye, Layers } from 'lucide-react';

export default function EntityViewer({ result }) {
  const [activeTab, setActiveTab] = useState('annotated'); // 'annotated' | 'cards' | 'json'
  const [copiedKey, setCopiedKey] = useState(null);

  if (!result) return null;

  const { rawText, medicine, dosage, frequency, duration, entities = [] } = result;

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Render annotated text with highlighted entities based on character offsets
  const renderAnnotatedText = () => {
    if (!entities || entities.length === 0) {
      return <span>{rawText}</span>;
    }

    // Sort entities by start index
    const sorted = [...entities].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sorted.forEach((ent, idx) => {
      // Add plain text before this entity
      if (ent.start > lastIndex) {
        elements.push(
          <span key={`plain-${idx}`}>
            {rawText.slice(lastIndex, ent.start)}
          </span>
        );
      }

      // Add highlighted entity
      elements.push(
        <span
          key={`ent-${idx}`}
          className={`mark-entity mark-${ent.label}`}
          title={`${ent.label}: ${ent.text} [offset ${ent.start}-${ent.end}]`}
        >
          {ent.text}
          <span style={{
            fontSize: '9px',
            marginLeft: '4px',
            opacity: 0.85,
            fontWeight: 700,
            textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.3)',
            padding: '1px 4px',
            borderRadius: '3px',
          }}>
            {ent.label}
          </span>
        </span>
      );

      lastIndex = ent.end;
    });

    // Add trailing text
    if (lastIndex < rawText.length) {
      elements.push(
        <span key="plain-tail">
          {rawText.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  const entityCards = [
    {
      key: 'medicine',
      label: 'MEDICINE',
      value: medicine,
      icon: <Pill size={18} color="var(--color-med)" />,
      badgeClass: 'badge-med',
      borderVar: 'var(--border-med)',
      bgVar: 'var(--bg-med)',
      colorVar: 'var(--color-med)',
    },
    {
      key: 'dosage',
      label: 'DOSAGE',
      value: dosage,
      icon: <Scale size={18} color="var(--color-dosage)" />,
      badgeClass: 'badge-dosage',
      borderVar: 'var(--border-dosage)',
      bgVar: 'var(--bg-dosage)',
      colorVar: 'var(--color-dosage)',
    },
    {
      key: 'frequency',
      label: 'FREQUENCY',
      value: frequency,
      icon: <Clock size={18} color="var(--color-freq)" />,
      badgeClass: 'badge-freq',
      borderVar: 'var(--border-freq)',
      bgVar: 'var(--bg-freq)',
      colorVar: 'var(--color-freq)',
    },
    {
      key: 'duration',
      label: 'DURATION',
      value: duration,
      icon: <Calendar size={18} color="var(--color-dur)" />,
      badgeClass: 'badge-dur',
      borderVar: 'var(--border-dur)',
      bgVar: 'var(--bg-dur)',
      colorVar: 'var(--color-dur)',
    },
  ];

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--color-med)',
            padding: '6px',
            borderRadius: '8px',
          }}>
            <Layers size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>Extraction Results</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {entities.length} {entities.length === 1 ? 'entity' : 'entities'} detected by clinical NER model
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          gap: '4px',
        }}>
          <button
            onClick={() => setActiveTab('annotated')}
            style={{
              background: activeTab === 'annotated' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'annotated' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'annotated' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Eye size={14} />
            <span>Annotated Text</span>
          </button>

          <button
            onClick={() => setActiveTab('cards')}
            style={{
              background: activeTab === 'cards' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'cards' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'cards' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Layers size={14} />
            <span>Structured Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            style={{
              background: activeTab === 'json' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'json' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === 'json' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Code size={14} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Entity Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'var(--bg-input)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
          Entity Labels:
        </span>
        <span className="badge badge-med">● Medicine</span>
        <span className="badge badge-dosage">● Dosage</span>
        <span className="badge badge-freq">● Frequency</span>
        <span className="badge badge-dur">● Duration</span>
      </div>

      {/* Tab 1: Annotated View */}
      {activeTab === 'annotated' && (
        <div style={{
          padding: '20px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '16px',
          lineHeight: '2.2',
          letterSpacing: '0.01em',
          color: 'var(--text-main)',
        }}>
          {renderAnnotatedText()}
        </div>
      )}

      {/* Tab 2: Structured Cards View */}
      {activeTab === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
        }}>
          {entityCards.map((card) => {
            const hasVal = Boolean(card.value);
            return (
              <div
                key={card.key}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${hasVal ? card.borderVar : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {card.icon}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: hasVal ? card.colorVar : 'var(--text-dim)',
                      letterSpacing: '0.05em',
                    }}>
                      {card.label}
                    </span>
                  </div>

                  {hasVal && (
                    <button
                      onClick={() => handleCopy(card.key, card.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Copy value"
                    >
                      {copiedKey === card.key ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>

                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: hasVal ? '#fff' : 'var(--text-dim)',
                  minHeight: '26px',
                }}>
                  {hasVal ? card.value : <em style={{ fontSize: '13px', opacity: 0.6 }}>Not detected</em>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: JSON View */}
      {activeTab === 'json' && (
        <div style={{ position: 'relative' }}>
          <pre style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: '#38bdf8',
            overflowX: 'auto',
            maxHeight: '300px',
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          <button
            onClick={() => handleCopy('json', JSON.stringify(result, null, 2))}
            className="btn btn-secondary btn-sm"
            style={{ position: 'absolute', top: '10px', right: '10px' }}
          >
            {copiedKey === 'json' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copiedKey === 'json' ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
