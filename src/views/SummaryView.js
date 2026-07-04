import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Check, X, Flame } from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { C, ACCOUNTS, gbp, getBudgetForMonth, mkKey, mkLabel, todayStr } from '../constants.js';
import { Card, EmptyState, NavBtn } from '../components/UI.js';

export default function SummaryView({ txs, cats, savingsGoal, saveSavingsGoal }) {
  const months = [...new Set(txs.map(t => mkKey(t.date)))].sort().reverse();
  const [idx,     setIdx]    = useState(0);
  const [account, setAccount] = useState('All');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft,   setGoalDraft]   = useState('');
  const sel = months[idx] || mkKey(todayStr());

  const acctTxs = account === 'All' ? txs : txs.filter(t => t.account === account);
  const mTxs    = acctTxs.filter(t => mkKey(t.date) === sel);
  const sum   = type => mTxs.filter(t => t.type === type).reduce((s, t) => s + Math.abs(t.amount), 0);
  const income = sum('income'), expense = sum('expense'), saving = sum('saving'), invest = sum('investment');
  const net   = income - expense - saving - invest;

  // Savings & Investments: all-time totals + monthly trend, independent of the
  // month navigator above so "running total" and "this month" always reflect
  // reality regardless of which month you're browsing.
  const thisMonthKey = mkKey(todayStr());
  const totalSaved   = acctTxs.filter(t => t.type === 'saving').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalInvest  = acctTxs.filter(t => t.type === 'investment').reduce((s, t) => s + Math.abs(t.amount), 0);

  const byMonth = {};
  acctTxs.forEach(t => {
    if (t.type !== 'saving' && t.type !== 'investment') return;
    const k = mkKey(t.date);
    if (!byMonth[k]) byMonth[k] = { month: k, saved: 0, invested: 0 };
    byMonth[k][t.type === 'saving' ? 'saved' : 'invested'] += Math.abs(t.amount);
  });
  const savingsTrend = Object.values(byMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, label: mkLabel(d.month) }));

  const thisMonthSaved = byMonth[thisMonthKey]?.saved || 0;

  let streak = 0;
  if (savingsGoal > 0) {
    const completed = savingsTrend.filter(d => d.month !== thisMonthKey).sort((a, b) => b.month.localeCompare(a.month));
    for (const m of completed) { if (m.saved >= savingsGoal) streak++; else break; }
  }

  const startEditGoal = () => { setGoalDraft(String(savingsGoal || '')); setEditingGoal(true); };
  const saveGoal = () => { saveSavingsGoal(parseFloat(goalDraft) || 0); setEditingGoal(false); };

  const catData = cats
    .map(cat => ({
      name:   cat.name,
      color:  cat.color,
      budget: getBudgetForMonth(cat, sel),
      actual: mTxs.filter(t => t.category === cat.name && t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
    }))
    .filter(d => d.budget > 0 || d.actual > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {['All', ...ACCOUNTS].map(a => (
          <button key={a} onClick={() => setAccount(a)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: account === a ? C.primary : C.card,
            color:      account === a ? '#FFF' : C.muted,
            fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif",
            border: `1px solid ${account === a ? C.primary : C.border}`,
          }}>{a}</button>
        ))}
      </div>
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

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Savings & Investments</div>
          {!editingGoal ? (
            <button onClick={startEditGoal} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
              border: `1px solid ${C.border}`, background: 'transparent', color: C.muted,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
            }}>
              <Pencil size={12} />{savingsGoal > 0 ? `Goal: ${gbp(savingsGoal)}/mo` : 'Set a savings goal'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="number" value={goalDraft} onChange={e => setGoalDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveGoal()}
                placeholder="£/month" autoFocus style={{
                  width: 90, padding: '5px 8px', borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: 'none',
                }} />
              <button onClick={saveGoal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, padding: 4 }}><Check size={16} /></button>
              <button onClick={() => setEditingGoal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4 }}><X size={16} /></button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '14px 0' }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: C.muted }}>Total saved (all time)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: C.saving }}>{gbp(totalSaved)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 11, color: C.muted }}>Total invested (all time)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: C.investment }}>{gbp(totalInvest)}</div>
          </div>
        </div>

        {savingsGoal > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
              <span>This month: {gbp(thisMonthSaved)} / {gbp(savingsGoal)}</span>
              {streak > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontWeight: 700 }}>
                  <Flame size={13} />{streak}-month streak
                </span>
              )}
            </div>
            <div style={{ height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${Math.min((thisMonthSaved / savingsGoal) * 100, 100)}%`,
                borderRadius: 4, transition: 'width 0.3s',
                background: thisMonthSaved >= savingsGoal ? C.income : C.saving,
              }} />
            </div>
          </div>
        )}

        {savingsTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={savingsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={v => `£${v}`} />
              <Tooltip formatter={(v, n) => [`£${v.toFixed(2)}`, n]} />
              <Legend />
              {savingsGoal > 0 && (
                <ReferenceLine y={savingsGoal} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Goal', fontSize: 10, fill: '#F59E0B' }} />
              )}
              <Bar dataKey="saved"    name="Saved"    fill={C.saving}     radius={[4, 4, 0, 0]} />
              <Bar dataKey="invested" name="Invested" fill={C.investment} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState height={120} message="No savings or investments recorded yet" />}
      </Card>

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
