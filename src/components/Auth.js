import React from 'react';
import { C } from '../constants.js';

export function LoginScreen({ onSignIn }) {
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: C.sidebar, fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>💰</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#FFF', marginBottom: 8 }}>The LoweDown</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>Your personal finance tracker</div>
      <button onClick={onSignIn} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 32px',
        borderRadius: 12, border: 'none', background: C.primary, color: '#FFF',
        fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
      }}>
        Sign in with Google
      </button>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: C.sidebar,
    }}>
      <div style={{ fontSize: 56 }}>💰</div>
    </div>
  );
}
