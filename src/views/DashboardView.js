import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight, Download,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { C, RANGES, ACCOUNTS, gbp, mkKey, mkLabel } from '../constants.js';
import { Card, StatCard, TxRow, EmptyState } from '../components/UI.js';

export default function DashboardView({ txs, cats, deleteTx, exportCSV, mobile }) {
  const [rangeIdx, setRangeIdx] = useState(2);
  const [account,  setAccount]  = useState('All');

  const cutoff   = RANGES[rangeIdx].days === Infinity ? null
    : new Date(Date.now() - RANGES[rangeIdx].days * 86400000).toISOString().slice(0, 10);
  const byDate   = cutoff ? txs.filter(t => t.date >= cutoff) : txs;
  const filtered = account === 'All' ? byDate : byDate.filter(t => t.account === account);

  const sum    = type => filtered.filter(t => t.type === type).reduce((s, t) => s + Math.abs(t.amount), 0);
  const income = sum('income'), expense = sum('expense'), saving = sum('saving'), invest = sum('investment');
  const net    = income - expense - saving - invest;

  const byMonth = {};
  filtered.forEach(t => {
    const k = mkKey(t.date);
    if (!byMonth[k]) byMonth[k] = { month: k, income: 0, expenses: 0 };
    if (t.type === 'income') byMonth[k].income   += Math.abs(t.amount);
    else                     byMonth[k].expenses += Math.abs(t.amount);
  });
  const areaData = Object.values(byMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(d => ({ ...d, month: mkLabel(d.month) }));

  const byCat = {};
  filtered.filter(t => t.type === 'expense').forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  });
  const pieData = Object.entries(byCat)
    .map(([name, value]) => ({ name, value, color: cats.find(c => c.name === name)?.color || '#6B7280' }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>Dashboard</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{today}</div>
      </div>
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
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Income"         value={gbp(income)}          color={C.income}                        Icon={TrendingUp} />
        <StatCard label="Expenses"       value={gbp(expense)}         color={C.expense}                       Icon={TrendingDown} />
        <StatCard label="Net Balance"    value={gbp(net)}             color={net >= 0 ? C.income : C.expense} Icon={net >= 0 ? ArrowUpRight : ArrowDownRight} />
        <StatCard label="Saved/Invested" value={gbp(saving + invest)} color={C.saving}                       Icon={PiggyBank} />
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>Cash Flow</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {RANGES.map((r, i) => (
              <button key={r.label} onClick={() => setRangeIdx(i)} style={{
                padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: rangeIdx === i ? C.primary : C.bg,
                color:      rangeIdx === i ? '#FFF' : C.muted,
                fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {areaData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="gIncome"  x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.income}  stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.income}  stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.expense} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={v => `£${v}`} />
              <Tooltip formatter={(v, n) => [`£${v.toFixed(2)}`, n]} />
              <Legend />
              <Area type="monotone" dataKey="income"   name="Income"   stroke={C.income}  fill="url(#gIncome)"  strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke={C.expense} fill="url(#gExpense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <EmptyState height={220} message="No transactions yet" />}
      </Card>

      <div style={{ display: 'flex', gap: 16, flexWrap: mobile ? 'wrap' : 'nowrap' }}>
        <Card style={{ flex: mobile ? '1 1 100%' : '1 1 260px' }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Expense Breakdown</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `£${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, color: C.text }}>{d.name}</div>
                    <div style={{ fontWeight: 600, color: C.text }}>{gbp(d.value)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : <EmptyState height={170} message="No expenses yet" />}
        </Card>

        <Card style={{ flex: mobile ? '1 1 100%' : '2 1 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Recent Transactions</div>
            <button onClick={exportCSV} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent',
              cursor: 'pointer', color: C.muted, fontSize: 13, fontFamily: "'Outfit', sans-serif",
            }}>
              <Download size={13} />Export
            </button>
          </div>
          {filtered.slice(0, 12).length > 0
            ? filtered.slice(0, 12).map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTx} cats={cats} />)
            : <EmptyState height={120} message="No transactions yet. Add one or import a CSV." />
          }
        </Card>
      </div>
    </div>
  );
}
