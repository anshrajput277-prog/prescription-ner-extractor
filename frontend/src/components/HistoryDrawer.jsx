import React from 'react';
import { X, Trash2, Calendar, Pill, Clock, ArrowRight } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history = [], onSelect, onDelete }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--bg-main)',
        borderLeft: '1px solid var(--border-card)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Saved Prescriptions</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Stored in MongoDB ({history.length} items)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: 'none',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {history.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-dim)',
            }}>
              <Pill size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px', fontWeight: 600 }}>No saved prescriptions yet</p>
              <p style={{ fontSize: '12px' }}>Extract any prescription text to save it to your MongoDB database</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => onSelect(item)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-med">
                      {item.medicine || 'Prescription'}
                    </span>
                    {item.dosage && <span className="badge badge-dosage">{item.dosage}</span>}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item._id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                }}>
                  {item.rawText}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  marginTop: '4px',
                }}>
                  <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--accent-cyan)' }}>
                    View <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
