import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PrescriptionInput from './components/PrescriptionInput';
import EntityViewer from './components/EntityViewer';
import HistoryDrawer from './components/HistoryDrawer';
import AuthModal from './components/AuthModal';
import { prescriptionService, authService } from './services/api';
import { Cpu, Server, Database, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Initialize: Check user session and load initial history
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe();
          if (userData.success && userData.user) {
            setUser(userData.user);
            loadHistory();
          }
        } catch (err) {
          console.warn('Existing token expired or invalid, auto-login with demo...');
          autoDemoLogin();
        }
      } else {
        // Auto sign-in to demo account so everything works immediately out-of-the-box
        autoDemoLogin();
      }
    };

    initApp();
  }, []);

  const autoDemoLogin = async () => {
    try {
      let res;
      try {
        res = await authService.login('ansh@example.com', 'Password123');
      } catch (e) {
        res = await authService.register('Ansh Rajput', 'ansh@example.com', 'Password123');
      }
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        loadHistory();
      }
    } catch (err) {
      console.error('Auto login error:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await prescriptionService.getAll();
      if (res.success && res.prescriptions) {
        setHistory(res.prescriptions);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleExtract = async (text, notes) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await prescriptionService.extract(text, notes);
      if (res.success && res.prescription) {
        setCurrentResult(res.prescription);
        // Refresh history
        setHistory((prev) => [res.prescription, ...prev]);
      }
    } catch (err) {
      console.error('Extraction failed:', err);
      const msg = err.response?.data?.message || err.message || 'Extraction failed. Make sure ML microservice and Express server are running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await prescriptionService.delete(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
      if (currentResult && currentResult._id === id) {
        setCurrentResult(null);
      }
    } catch (err) {
      console.error('Failed to delete prescription:', err);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setCurrentResult(item);
    setIsHistoryOpen(false);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setHistory([]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      <main style={{
        flex: 1,
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        padding: '36px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 8px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '999px',
            fontSize: '12px',
            color: 'var(--accent-cyan)',
            fontWeight: 700,
            marginBottom: '16px',
          }}>
            <Sparkles size={14} />
            <span>AI Clinical NLP • Named Entity Recognition Engine</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '14px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Extract Medical Entities From Prescriptions with Precision
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Parse unstructured clinical text and prescriptions to instantly isolate <strong>Medicines</strong>, <strong>Dosages</strong>, <strong>Frequencies</strong>, and <strong>Durations</strong>.
          </p>
        </div>

        {/* Pipeline Architecture Indicator */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '14px 20px',
          background: 'rgba(17, 24, 39, 0.5)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={18} color="#34d399" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>AI MICROSERVICE</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>SpaCy NER (:8001)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={18} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>API BACKEND</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Express + JWT (:5000)</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={18} color="#a78bfa" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>DATABASE</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>MongoDB Local (:27017)</div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            fontSize: '14px',
          }}>
            <AlertCircle size={20} />
            <div style={{ flex: 1 }}>{error}</div>
            <button
              onClick={() => setError(null)}
              style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Input Section */}
        <PrescriptionInput onExtract={handleExtract} isLoading={isLoading} />

        {/* Results Section */}
        <EntityViewer result={currentResult} />
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onDelete={handleDeleteHistory}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setUser(user);
          loadHistory();
        }}
      />
    </div>
  );
}
