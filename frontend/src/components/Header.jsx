import React from 'react';
import { Activity, Pill, History, User, LogOut, CheckCircle2 } from 'lucide-react';

export default function Header({ user, onOpenAuth, onLogout, onToggleHistory, historyCount }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 15, 29, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      padding: '16px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #06b6d4, #10b981)',
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
        }}>
          <Pill size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
              MediExtract <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
            </h1>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
            }}>
              v1.0
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Clinical Named Entity Recognition (NER) Pipeline
          </p>
        </div>
      </div>

      {/* Center Live Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', display: 'none', '@media (min-width: 768px)': { display: 'flex' } }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#34d399',
          fontWeight: 600,
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', animation: 'pulseGlow 2s infinite' }}></span>
          ML Microservice :8001
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '20px',
          fontSize: '12px',
          color: '#38bdf8',
          fontWeight: 600,
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06b6d4', animation: 'pulseGlow 2s infinite' }}></span>
          Express API :5000
        </div>
      </div>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onToggleHistory}
          className="btn btn-secondary btn-sm"
          title="View Extraction History"
          style={{ position: 'relative' }}
        >
          <History size={16} />
          <span>History</span>
          {historyCount > 0 && (
            <span style={{
              background: 'var(--accent-cyan)',
              color: '#090d16',
              fontWeight: 800,
              fontSize: '11px',
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '2px',
            }}>
              {historyCount}
            </span>
          )}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
              }}>
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                {user.name}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ color: '#f87171' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
            <User size={15} />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </header>
  );
}
