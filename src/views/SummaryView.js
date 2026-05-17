import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { C, gbp, mkKey, mkLabel, todayStr } from '../constants.js';
import { Card, EmptyState, NavBtn } from '../components/UI.js';

export default function SummaryView({ txs, cats }) {
  const months = [...new Set(txs.map(t => mkKey(t.date)))].sort().reverse();
  const [idx, setIdx] = useState(0);
  const sel = months[idx] || mkKey(todayStr());

  const mTxs  = txs.filter(t => mkKey(t.date) === sel);
  const sum   = type => mTxs.filter(t => t.type === type).reduce((s, t) => s + Math.abs(t.amount), 0);
  const income = sum('income'), expense = sum('expense'), saving = sum('saving'), invest = sum('investment');
  const net   = income - expense - saving - invest;

  const catData = cats
    .map(cat => ({
      name:   cat.name,
      color:  cat.color,
      budget: cat.budget,
      actual: mTxs.filter(t => t.category === cat.name && t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
    }))
    .filter(d => d.budget > 0 || d.actual > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <NavBtn onClick={() => setIdx(i => Math.min(i + 1, months.length - 1))} disabled={idx >= months.length - 1}>
          <ChevronLeft size={18} />
        </NavBtn>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 20 }}>{mkLabel(sel)}</div>
        <NavBtn onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0}>
          <ChevronRight size={18} />
        </NavBtn>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'Income',   value: gbp(income),  color: C.income },
          { label: 'Expenses', value: gbp(expense),  color: C.expense },
          { label: 'Saved',    value: gbp(saving),   color: C.saving },
          { label: 'Invested', value: gbp(invest),   color: C.investment },
          { label: 'Net',      value: gbp(net),      color: net >= 0 ? C.income : C.expense },
        ].map(p => (
          <div key={p.label} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '10px 16px', flex: 1, minWidth: 88,
          }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{p.label}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: p.color }}>{p.value}</div>
          </div>
        ))}
      </div>

      {catData.length > 0 && (
        <Card>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Budget vs Actuals</div>
          <ResponsiveContainer width="100%" height={Math.max(200, catData.length * 38)}>
            <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} tickFormatter={v => `£${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: C.text }} width={110} />
              <Tooltip formatter={v => `£${v.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill={`${C.primary}55`} radius={[0, 4, 4, 0]} />
              <Bar dataKey="actual" name="Actual" radius={[0, 4, 4, 0]}>
                {catData.map((d, i) => (
                  <Cell key={i} fill={d.actual > d.budget && d.budget > 0 ? C.expense : C.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Category Breakdown</div>
        {catData.length === 0 ? <EmptyState height={80} message="No data for this month" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {catData.map(d => {
              const pct  = d.budget > 0 ? Math.min((d.actual / d.budget) * 100, 100) : 0;
              const over = d.actual > d.budget && d.budget > 0;
              return (
                <div key={d.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: over ? '#FEF2F2' : '#F0FDF4',
                      color:      over ? C.expense  : C.income,
                    }}>
                      {over ? 'Over budget' : 'On track'}
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: over ? C.expense : C.text }}>
                      {gbp(d.actual)} <span style={{ color: C.muted, fontWeight: 400 }}>/ {gbp(d.budget)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 3, transition: 'width 0.3s',
                      background: over ? C.expense : C.primary,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
