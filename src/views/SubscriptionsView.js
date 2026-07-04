import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Pencil, RotateCcw, Repeat } from 'lucide-react';
import { C, CADENCES, SUBSCRIPTION_KEYWORDS, NON_SUBSCRIPTION_KEYWORDS, gbp, todayStr } from '../constants.js';
import { Card, Btn, Field, StatCard, EmptyState } from '../components/UI.js';

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${C.border}`, fontSize: 14,
  fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box',
};

const normalizeKey = d => d.trim().toLowerCase().replace(/\s+/g, ' ');

const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
};

const fmtDate = d => d
  ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const cadenceLabel = days => {
  if (!days) return '—';
  const nearest = CADENCES.reduce((best, c) => Math.abs(c.days - days) < Math.abs(best.days - days) ? c : best, CADENCES[0]);
  return Math.abs(nearest.days - days) <= 2 ? nearest.label : `~every ${Math.round(days)}d`;
};

const monthlyEquiv = (amount, intervalDays) => amount * (30 / (intervalDays || 30));

const KNOWN_RE   = new RegExp(SUBSCRIPTION_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
const EXCLUDE_RE = new RegExp(`\\b(${NON_SUBSCRIPTION_KEYWORDS.join('|')})\\b`, 'i');

// How close intervalDays is to a recognised billing cadence (0 = exact match).
const nearestCadenceDiff = days => Math.min(...CADENCES.map(c => Math.abs(c.days - days) / c.days));

// Detect recurring charges by description, regardless of category: same/similar
// amount repeating at a roughly consistent interval. Category-based grouping
// alone misses subscriptions filed under Entertainment, Bills & Utilities, etc.
//
// Two paths: a known brand/generic keyword (Netflix, "subscription", etc.) is
// trusted even with a single charge or an irregular amount. Everything else
// needs at least 3 charges landing close to a real billing cadence (weekly/
// monthly/quarterly/yearly) with a consistent amount - otherwise two
// coincidentally similar purchases months apart get misread as a subscription.
// Rent and installment/loan repayments are excluded outright: they're
// recurring, but not a cancellable ongoing service.
function detectCandidates(txs) {
  const groups = {};
  txs.filter(t => t.type === 'expense' && t.description).forEach(t => {
    const key = normalizeKey(t.description);
    (groups[key] = groups[key] || []).push(t);
  });

  const today = todayStr();

  return Object.entries(groups)
    .filter(([key]) => !EXCLUDE_RE.test(key))
    .map(([key, group]) => {
      const sorted    = [...group].sort((a, b) => a.date.localeCompare(b.date));
      const amounts   = sorted.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      const amountSpread = sorted.length > 1 ? (Math.max(...amounts) - Math.min(...amounts)) / avgAmount : 0;

      const gaps = [];
      for (let i = 1; i < sorted.length; i++) {
        gaps.push((new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / 86400000);
      }
      const avgGap    = gaps.length ? gaps.reduce((s, g) => s + g, 0) / gaps.length : null;
      const gapSpread = gaps.length ? Math.max(...gaps.map(g => Math.abs(g - avgGap))) / avgGap : 0;

      const last  = sorted[sorted.length - 1];
      const known = KNOWN_RE.test(key);

      const intervalDays = avgGap !== null ? Math.round(avgGap) : null;
      const nextDate      = intervalDays ? addDays(last.date, intervalDays) : null;
      const daysOverdue   = nextDate ? (new Date(today) - new Date(nextDate)) / 86400000 : 0;
      const lapsed        = !!nextDate && daysOverdue > 1.5 * intervalDays;

      return {
        key, known, lapsed,
        label:        last.description,
        category:     last.category,
        amount:       avgAmount,
        intervalDays,
        occurrences:  sorted.length,
        lastDate:     last.date,
        amountSpread, gapSpread,
      };
    })
    .filter(c => {
      if (c.known) return true;
      return c.occurrences >= 3
        && c.amountSpread <= 0.35
        && c.gapSpread <= 0.5
        && c.intervalDays !== null
        && nearestCadenceDiff(c.intervalDays) <= 0.2;
    });
}

function SubForm({ initial, cats, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="Name">
        <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} style={inp} autoFocus />
      </Field>
      <Field label="Amount (£)">
        <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} min="0" style={inp} />
      </Field>
      <Field label="Cadence">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CADENCES.map(c => (
            <button key={c.label} onClick={() => setForm(f => ({ ...f, intervalDays: c.days }))} style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              background: form.intervalDays === c.days ? C.primary : C.card,
              color:      form.intervalDays === c.days ? '#FFF' : C.muted,
              border: `1px solid ${form.intervalDays === c.days ? C.primary : C.border}`,
              fontWeight: 600, fontSize: 13, fontFamily: "'Outfit', sans-serif",
            }}>{c.label}</button>
          ))}
        </div>
      </Field>
      <Field label="Category">
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
          {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSave(form)} style={{
          flex: 1, padding: 12, borderRadius: 10, border: 'none', background: C.primary,
          color: '#FFF', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif",
        }}>Save</button>
        <button onClick={onCancel} style={{
          padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
          background: 'transparent', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
        }}>Cancel</button>
      </div>
    </div>
  );
}

export default function SubscriptionsView({ txs, cats, subs, addSub, deleteSub, updateSub }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [showDismissed, setShowDismissed] = useState(false);

  const candidates    = detectCandidates(txs);
  const overrideByKey = {};
  subs.forEach(s => { overrideByKey[s.key] = s; });

  const active    = [];
  const dismissed = [];

  candidates.forEach(c => {
    const ov = overrideByKey[c.key];
    const item = {
      ...c,
      label:        ov?.label || c.label,
      amount:       ov?.amount ?? c.amount,
      intervalDays: ov?.intervalDays ?? c.intervalDays,
      category:     ov?.category || c.category,
      overrideId:   ov?.id,
      manual:       false,
    };
    (ov?.dismissed ? dismissed : active).push(item);
  });

  subs.forEach(ov => {
    if (ov.manual && !candidates.some(c => c.key === ov.key) && !ov.dismissed) {
      active.push({
        key: ov.key, label: ov.label, amount: ov.amount, intervalDays: ov.intervalDays,
        category: ov.category, occurrences: 0, lastDate: null, overrideId: ov.id, manual: true,
      });
    }
  });

  active.sort((a, b) => monthlyEquiv(b.amount, b.intervalDays) - monthlyEquiv(a.amount, a.intervalDays));
  const totalMonthly = active.filter(c => !c.lapsed).reduce((s, c) => s + monthlyEquiv(c.amount, c.intervalDays), 0);

  const dismiss = c => c.overrideId ? updateSub(c.overrideId, { dismissed: true }) : addSub({ key: c.key, dismissed: true });
  const restore = c => updateSub(c.overrideId, { dismissed: false });
  const removeManual = c => deleteSub(c.overrideId);

  const saveEdit = (c, form) => {
    const data = {
      key:          c.key,
      label:        form.label.trim(),
      amount:       parseFloat(form.amount) || 0,
      intervalDays: form.intervalDays,
      category:     form.category,
      ...(c.manual ? { manual: true } : {}),
    };
    if (c.overrideId) updateSub(c.overrideId, data); else addSub(data);
    setEditKey(null);
  };

  const submitAdd = form => {
    if (!form.label.trim()) return;
    addSub({
      key: normalizeKey(form.label), label: form.label.trim(),
      amount: parseFloat(form.amount) || 0, intervalDays: form.intervalDays,
      category: form.category, manual: true,
    });
    setAddOpen(false);
  };

  const renderCard = c => {
    const editing = editKey === c.key;
    return (
      <Card key={c.key} style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: `${C.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Repeat size={17} color={C.primary} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</div>
              {c.lapsed && (
                <span style={{
                  padding: '1px 7px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                  background: '#FEF3C7', color: '#92400E', flexShrink: 0,
                }}>Possibly ended</span>
              )}
            </div>
            {!editing && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {gbp(c.amount)} · {cadenceLabel(c.intervalDays)} · {c.category}
              </div>
            )}
          </div>
          {!editing && (
            <>
              <button onClick={() => setEditKey(c.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8 }}>
                <Pencil size={15} />
              </button>
              {c.manual
                ? <button onClick={() => removeManual(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8 }}><Trash2 size={15} /></button>
                : <button onClick={() => dismiss(c)} title="Not a subscription" style={{
                    padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.border}`,
                    background: 'transparent', color: C.muted, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap',
                  }}>Not a subscription</button>
              }
            </>
          )}
        </div>

        {!editing && c.occurrences > 0 && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 8, paddingLeft: 48 }}>
            Last charged {fmtDate(c.lastDate)}
            {c.intervalDays ? ` · next expected ~${fmtDate(addDays(c.lastDate, c.intervalDays))}` : ''}
            {' · '}{c.occurrences} charge{c.occurrences !== 1 ? 's' : ''} seen
          </div>
        )}

        {editing && (
          <SubForm
            initial={{ label: c.label, amount: c.amount, intervalDays: c.intervalDays, category: c.category }}
            cats={cats}
            onSave={form => saveEdit(c, form)}
            onCancel={() => setEditKey(null)}
          />
        )}
      </Card>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 22 }}>Subscriptions</div>
        <Btn onClick={() => setAddOpen(o => !o)} primary><Plus size={15} />Add Subscription</Btn>
      </div>

      <StatCard label="Estimated monthly recurring spend" value={gbp(totalMonthly)} color={C.expense} Icon={Repeat} />

      {addOpen && (
        <Card>
          <div style={{ fontWeight: 600, fontSize: 16 }}>New Subscription</div>
          <SubForm
            initial={{ label: '', amount: '', intervalDays: 30, category: cats[0]?.name || 'Other' }}
            cats={cats}
            onSave={submitAdd}
            onCancel={() => setAddOpen(false)}
          />
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {active.length > 0
          ? active.map(renderCard)
          : <EmptyState height={120} message="No subscriptions detected yet. They'll show up automatically as recurring charges, or add one manually." />
        }
      </div>

      {dismissed.length > 0 && (
        <div>
          <button onClick={() => setShowDismissed(s => !s)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
            fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", padding: '4px 0',
          }}>
            {showDismissed ? 'Hide' : 'Show'} not-a-subscription ({dismissed.length})
          </button>
          {showDismissed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {dismissed.map(c => (
                <Card key={c.key} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 14, color: C.muted }}>{c.label}</div>
                  <button onClick={() => restore(c)} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
                    border: `1px solid ${C.border}`, background: 'transparent', color: C.muted,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                  }}><RotateCcw size={13} />Restore</button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
