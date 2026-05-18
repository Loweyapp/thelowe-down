import React from 'react';
import { Download, LogOut } from 'lucide-react';
import { C, NAV, VERSION } from '../constants.js';

export function Sidebar({ view, setView, exportCSV, user, signOut }) {
  return (
    <nav style={{
      width: 220, background: C.sidebar, display: 'flex', flexDirection: 'column',
      padding: '28px 16px 24px', gap: 4, flexShrink: 0,
    }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#FFF', letterSpacing: '-0.3px' }}>💰 The LoweDown</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>Personal Finance · {VERSION}</div>
      </div>

      {NAV.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button key={id} onClick={() => setView(id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: active ? C.primary : 'transparent',
            color: active ? '#FFF' : 'rgba(255,255,255,0.55)',
            fontSize: 14, fontWeight: active ? 600 : 400,
            fontFamily: "'Outfit', sans-serif", textAlign: 'left',
            transition: 'background 0.12s',
          }}>
            <Icon size={17} />{label}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button onClick={exportCSV} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
        background: 'transparent', color: 'rgba(255,255,255,0.55)',
        fontSize: 13, fontFamily: "'Outfit', sans-serif", marginBottom: 8,
      }}>
        <Download size={16} />Export CSV
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
        {user.photoURL && (
          <img src={user.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
        )}
        <div style={{
          flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.4)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user.displayName || user.email}
        </div>
        <button onClick={signOut} title="Sign out" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.4)', padding: 4,
        }}>
          <LogOut size={14} />
        </button>
      </div>
    </nav>
  );
}

export function TopHeader({ label, signOut }) {
  return (
    <div style={{
      background: C.sidebar,
      padding: '14px 20px', paddingTop: 'max(14px, calc(env(safe-area-inset-top) + 6px))',
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#FFF' }}>
        💰 The LoweDown{' '}
        <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.38)' }}>{VERSION}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      <button onClick={signOut} title="Sign out" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)', padding: 4,
      }}>
        <LogOut size={16} />
      </button>
    </div>
  );
}

export function BottomNav({ view, setView }) {
  return (
    <div style={{
      display: 'flex', background: C.card, borderTop: `1px solid ${C.border}`,
      flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button key={id} onClick={() => setView(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: active ? C.primary : C.muted,
            fontSize: 10, fontFamily: "'Outfit', sans-serif",
            fontWeight: active ? 600 : 400, minHeight: 56,
          }}>
            <Icon size={20} />{label}
          </button>
        );
      })}
    </div>
  );
}
