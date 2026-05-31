import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { C, TYPE_COLOR, ICON_MAP, gbp } from '../constants.js';

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, color, Icon, sub }) {
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </Card>
  );
}

function DeleteBtn({ onDelete }) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(false), 3000);
    return () => clearTimeout(t);
  }, [confirm]);

  const handleClick = () => {
    if (confirm) { onDelete(); } else { setConfirm(true); }
  };

  return (
    <button onClick={handleClick} style={{
      background: confirm ? '#EF4444' : 'none',
      border: 'none', cursor: 'pointer',
      color: confirm ? '#FFF' : C.muted,
      padding: confirm ? '4px 8px' : 6,
      borderRadius: 6, fontSize: 11, fontWeight: 700,
      transition: 'all 0.15s', flexShrink: 0,
      fontFamily: "'Outfit', sans-serif",
    }}>
      {confirm ? 'Delete?' : <Trash2 size={15} />}
    </button>
  );
}

export function TxRow({ tx, onDelete, cats }) {
  const cat      = cats.find(c => c.name === tx.category);
  const plus     = tx.type === 'income';
  const color    = TYPE_COLOR[tx.type] || C.text;
  const typeIconNames = { income: 'Banknote', saving: 'PiggyBank', investment: 'TrendingUp' };
  const iconName = cat?.icon || typeIconNames[tx.type] || 'Package';
  const IconComp = ICON_MAP[iconName];
  const iconColor = cat?.color || color;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `${iconColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {IconComp
          ? <IconComp size={18} color={iconColor} />
          : <span style={{ fontSize: 18 }}>{cat?.emoji ?? '💳'}</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500, fontSize: 14, color: C.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tx.description}
        </div>
        <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
          {tx.account && (
            <span style={{
              padding: '1px 6px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: tx.account === 'Alex' ? '#0ABFA318' : '#8B5CF618',
              color:      tx.account === 'Alex' ? C.primary   : '#8B5CF6',
            }}>{tx.account}</span>
          )}
          {tx.account && <span>·</span>}
          <span>{tx.category} · {tx.date}</span>
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color, flexShrink: 0 }}>
        {plus ? '+' : '-'}{gbp(tx.amount)}
      </div>
      {onDelete && <DeleteBtn onDelete={() => onDelete(tx.id)} />}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

export function EmptyState({ height, message }) {
  return (
    <div style={{
      height, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.muted, fontSize: 14, textAlign: 'center',
    }}>
      {message}
    </div>
  );
}

export function NavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: 8, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1, display: 'flex', alignItems: 'center',
    }}>
      {children}
    </button>
  );
}

export function Btn({ onClick, primary, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
      borderRadius: 10,
      border:     primary ? 'none' : `1px solid ${C.border}`,
      background: primary ? C.primary : 'transparent',
      color:      primary ? '#FFF' : C.text,
      fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
    }}>
      {children}
    </button>
  );
}
