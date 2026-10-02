import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { authService } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authService.login(email, password);
      } else {
        res = await authService.register(name, email, password);
      }

      if (res.token) {
        localStorage.setItem('token', res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // First attempt to login with default demo account
      try {
        const res = await authService.login('ansh@example.com', 'Password123');
        if (res.token) {
          localStorage.setItem('token', res.token);
          onAuthSuccess(res.user);
          onClose();
          return;
        }
      } catch (loginErr) {
        // If demo user doesn't exist, create it
        const res = await authService.register('Ansh Demo', 'ansh@example.com', 'Password123');
        if (res.token) {
          localStorage.setItem('token', res.token);
          onAuthSuccess(res.user);
          onClose();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '28px',
        position: 'relative',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
            {isLogin ? 'Sign In to MediExtract' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Access saved prescriptions and clinical NER history
          </p>
        </div>

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            width: '100%',
            marginBottom: '16px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: '#38bdf8',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} />
          <span>One-Click Instant Demo Login</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: '12px 0',
          color: 'var(--text-dim)',
          fontSize: '12px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#f87171',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Ansh Rajput"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '12px' }}
          >
            {loading ? <span className="spinner"></span> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
