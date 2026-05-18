import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { C, TX_TYPES, ACCOUNTS, todayStr } from '../constants.js';
import { Card, Field } from '../components/UI.js';

export default function AddView({ addTx, cats, txs }) {
  const [form, setForm] = useState({
    account: 'Alex', type: 'expense', date: todayStr(),
    description: '', category: '', amount: '',
  });
  const [ok,   setOk]   = useState(false);
  const [warn, setWarn] = useState(null); // { description, amount, date } of the existing match

  const getCats = type =>
    type === 'income'       ? [{ id: 'i', name: 'Income'      }]
    : type === 'saving'     ? [{ id: 's', name: 'Savings'     }]
    : type === 'investment' ? [{ id: 'v', name: 'Investments' }]
    : cats;

  useEffect(() => {
    const c = getCats(form.type);
    setForm(f => ({ ...f, category: c[0]?.name || '' }));
  }, [form.type]);

  // Clear warning whenever the form changes
  useEffect(() => { setWarn(null); }, [form.description, form.amount, form.date]);

  const findDuplicate = () => {
    const amt = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amt) || amt <= 0) return null;
    const month = form.date.slice(0, 7);
    const desc  = form.description.trim().toLowerCase();
    return (txs || []).find(t =>
      t.description.toLowerCase() === desc &&
      Math.abs(t.amount) === amt &&
      t.date.slice(0, 7) === month
    ) || null;
  };

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontSize: 15,
    fontFamily: "'Outfit', sans-serif", outline: 'none',
    boxSizing: 'border-box', background: C.card,
  };

  const doAdd = () => {
    const amt = parseFloat(form.amount);
    addTx({
      id:          Date.now(),
      account:     form.account,
      date:        form.date,
      description: form.description.trim(),
      category:    form.category,
      amount:      form.type === 'income' ? amt : -amt,
      type:        form.type,
    });
    setOk(true);
    setWarn(null);
    const c = getCats(form.type);
    setForm(f => ({ ...f, date: todayStr(), description: '', amount: '', category: c[0]?.name || '' }));
    setTimeout(() => setOk(false), 2000);
  };

  const submit = () => {
    const amt = parseFloat(form.amount);
    if (!form.description.trim() || !form.category || isNaN(amt) || amt <= 0) return;
    const dup = findDuplicate();
    if (dup) { setWarn(dup); return; }
    doAdd();
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Add Transaction</div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <Field label="Account">
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCOUNTS.map(a => (
                <button key={a} onClick={() => setForm(f => ({ ...f, account: a }))} style={{
                  flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                  border:     `2px solid ${form.account === a ? C.primary : C.border}`,
                  background: form.account === a ? `${C.primary}14` : 'transparent',
                  color:      form.account === a ? C.primary : C.muted,
                  fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif",
                }}>{a}</button>
              ))}
            </div>
          </Field>

          <Field label="Type">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TX_TYPES.map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{
                  flex: 1, minWidth: 80, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                  border:     `2px solid ${form.type === t.id ? t.color : C.border}`,
                  background: form.type === t.id ? `${t.color}14` : 'transparent',
                  color:      form.type === t.id ? t.color : C.muted,
                  fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif",
                }}>{t.label}</button>
              ))}
            </div>
          </Field>

          <Field label="Date">
            <input type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
          </Field>

          <Field label="Description">
            <input value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Tesco weekly shop" style={inp} />
          </Field>

          <Field label="Category">
            <select value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...inp, cursor: 'pointer' }}>
              {getCats(form.type).map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Amount (£)">
            <input type="number" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" min="0" step="0.01" style={inp} />
          </Field>

          {warn && (
            <div style={{
              padding: '14px 16px', borderRadius: 10,
              background: '#FFFBEB', border: `1px solid #F59E0B`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <AlertTriangle size={16} color="#F59E0B" />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>Possible duplicate</span>
              </div>
              <div style={{ fontSize: 13, color: '#92400E', marginBottom: 12 }}>
                "{warn.description}" for £{Math.abs(warn.amount).toFixed(2)} already exists on {warn.date}.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setWarn(null)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: `1px solid #F59E0B`,
                  background: 'transparent', color: '#92400E', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                }}>Cancel</button>
                <button onClick={doAdd} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                  background: '#F59E0B', color: '#FFF', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                }}>Add Anyway</button>
              </div>
            </div>
          )}

          {ok && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              borderRadius: 10, background: '#F0FDF4', color: C.income, fontSize: 14, fontWeight: 500,
            }}>
              <Check size={16} />Transaction added!
            </div>
          )}

          {!warn && (
            <button onClick={submit} style={{
              padding: 14, borderRadius: 12, border: 'none', background: C.primary,
              color: '#FFF', fontSize: 16, fontWeight: 700, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}>Add Transaction</button>
          )}

        </div>
      </Card>
    </div>
  );
}
