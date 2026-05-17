import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C, ACCOUNTS, gbp, mkKey, mkLabel, todayStr } from '../constants.js';
import { NavBtn, TxRow, EmptyState } from '../components/UI.js';

export default function TransactionsView({ txs, cats, deleteTx }) {
  const months = [...new Set(txs.map(t => mkKey(t.date)))].sort().reverse();
  const [idx,     setIdx]    = useState(0);
  const [account, setAccount] = useState('All');
  const [groupBy, setGroupBy] = useState('date');

  useEffect(() => {
    if (document.getElementById('tx-anim-style')) return;
    const s = document.createElement('style');
    s.id = 'tx-anim-style';
    s.textContent = `
      @keyframes txFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(s);
  }, []);

  const sel     = months[idx] || mkKey(todayStr());
  const acctTxs = account === 'All' ? txs : txs.filter(t => t.account === account);
  const mTxs    = acctTxs
    .filter(t => mkKey(t.date) === sel)
    .sort((a, b) => b.date.localeCompare(a.date));

  const income  = mTxs.filter(t => t.type === 'income').reduce((s, t) => s + Math.abs(t.amount), 0);
  const expense = mTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

  // Build date groups (newest first)
  const dateKeys = [];
  const dateMap  = {};
  mTxs.forEach(t => {
    if (!dateMap[t.date]) { dateMap[t.date] = []; dateKeys.push(t.date); }
    dateMap[t.date].push(t);
  });

  // Build category groups (expenses only, sorted by total desc; income at end)
  const catMap  = {};
  mTxs.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = catMap[t.category] || [];
    catMap[t.category].push(t);
  });
  const catKeys = Object.keys(catMap).sort(
    (a, b) => catMap[b].reduce((s, t) => s + Math.abs(t.amount), 0)
            - catMap[a].reduce((s, t) => s + Math.abs(t.amount), 0)
  );
  const incomeItems = mTxs.filter(t => t.type !== 'expense');

  const fmtDay = date => new Date(date + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const GroupHeader = ({ left, right, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 2px', marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: color || C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{left}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{right}</div>
    </div>
  );

  const TxCard = ({ children }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '0 14px', marginBottom: 10 }}>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Account filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['All', ...ACCOUNTS].map(a => (
          <button key={a} onClick={() => setAccount(a)} style={{
            padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
            background: account === a ? C.primary : C.card,
            color:      account === a ? '#FFF' : C.muted,
            fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif",
            border: `1px solid ${account === a ? C.primary : C.border}`,
            transition: 'background 0.15s, color 0.15s',
          }}>{a}</button>
        ))}
      </div>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <NavBtn onClick={() => setIdx(i => Math.min(i + 1, months.length - 1))} disabled={idx >= months.length - 1}>
          <ChevronLeft size={18} />
        </NavBtn>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{mkLabel(sel)}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
            <span style={{ color: C.income, fontWeight: 600 }}>{gbp(income)}</span>
            {' in · '}
            <span style={{ color: C.expense, fontWeight: 600 }}>{gbp(expense)}</span>
            {' out · '}
            {mTxs.length} transactions
          </div>
        </div>
        <NavBtn onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0}>
          <ChevronRight size={18} />
        </NavBtn>
      </div>

      {/* Group toggle */}
      <div style={{
        display: 'inline-flex', background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, padding: 3, marginBottom: 20,
      }}>
        {[['date', 'By Date'], ['category', 'By Category']].map(([val, label]) => (
          <button key={val} onClick={() => setGroupBy(val)} style={{
            padding: '5px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: groupBy === val ? C.primary : 'transparent',
            color:      groupBy === val ? '#FFF' : C.muted,
            fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif",
            transition: 'background 0.15s, color 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* Empty state */}
      {mTxs.length === 0 && (
        <EmptyState height={160} message="No transactions for this month" />
      )}

      {/* By Date */}
      {mTxs.length > 0 && groupBy === 'date' && dateKeys.map((date, gi) => (
        <div key={date} style={{ animation: `txFadeIn 0.18s ease ${gi * 0.04}s both` }}>
          <GroupHeader
            left={fmtDay(date)}
            right={gbp(dateMap[date].filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0))}
          />
          <TxCard>
            {dateMap[date].map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTx} cats={cats} />)}
          </TxCard>
        </div>
      ))}

      {/* By Category */}
      {mTxs.length > 0 && groupBy === 'category' && (
        <>
          {catKeys.map((cat, gi) => {
            const total  = catMap[cat].reduce((s, t) => s + Math.abs(t.amount), 0);
            const catDef = cats.find(c => c.name === cat);
            return (
              <div key={cat} style={{ animation: `txFadeIn 0.18s ease ${gi * 0.04}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 2px', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: catDef?.color || C.muted, flexShrink: 0 }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.expense }}>{gbp(total)}</div>
                </div>
                <TxCard>
                  {catMap[cat].map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTx} cats={cats} />)}
                </TxCard>
              </div>
            );
          })}
          {incomeItems.length > 0 && (
            <div style={{ animation: `txFadeIn 0.18s ease ${catKeys.length * 0.04}s both` }}>
              <GroupHeader
                left="Income"
                right={gbp(incomeItems.reduce((s, t) => s + Math.abs(t.amount), 0))}
                color={C.income}
              />
              <TxCard>
                {incomeItems.map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTx} cats={cats} />)}
              </TxCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
