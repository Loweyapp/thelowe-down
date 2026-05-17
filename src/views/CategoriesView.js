import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { C, COLOR_OPTS, ICON_MAP, ICON_OPTS, gbp } from '../constants.js';
import { Card, Btn, Field } from '../components/UI.js';

export default function CategoriesView({ cats, addCat, deleteCat }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', icon: 'Package', color: '#6B7280', budget: '' });

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontSize: 14,
    fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box',
  };

  const submit = () => {
    if (!form.name.trim()) return;
    addCat({ ...form, budget: parseFloat(form.budget) || 0 });
    setForm({ name: '', icon: 'Package', color: '#6B7280', budget: '' });
    setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 22 }}>Categories</div>
        <Btn onClick={() => setOpen(o => !o)} primary><Plus size={15} />New Category</Btn>
      </div>

      {open && (
        <Card>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>New Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Icon">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICON_OPTS.map(name => {
                  const Icon   = ICON_MAP[name];
                  const active = form.icon === name;
                  return (
                    <button key={name} onClick={() => setForm(f => ({ ...f, icon: name }))} style={{
                      padding: 8, borderRadius: 8, cursor: 'pointer',
                      border:     `2px solid ${active ? C.primary : C.border}`,
                      background: active ? `${C.primary}14` : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={active ? C.primary : C.muted} />
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Colour">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {COLOR_OPTS.map(col => (
                  <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))} style={{
                    width: 28, height: 28, borderRadius: '50%', background: col, cursor: 'pointer',
                    border: `3px solid ${form.color === col ? C.text : 'transparent'}`,
                  }} />
                ))}
              </div>
            </Field>

            <Field label="Name">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Groceries" style={inp} />
            </Field>

            <Field label="Monthly Budget (£)">
              <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                placeholder="0" min="0" style={inp} />
            </Field>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={submit} style={{
                flex: 1, padding: 12, borderRadius: 10, border: 'none', background: C.primary,
                color: '#FFF', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}>Add Category</button>
              <button onClick={() => setOpen(false)} style={{
                padding: '12px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                background: 'transparent', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              }}>Cancel</button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cats.map(cat => {
          const IconComp = cat.icon ? ICON_MAP[cat.icon] : null;
          return (
            <Card key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: `${cat.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {IconComp
                  ? <IconComp size={18} color={cat.color} />
                  : <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                }
              </div>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: C.muted }}>Budget: {gbp(cat.budget)} / month</div>
              </div>
              <button onClick={() => deleteCat(cat.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8,
              }}>
                <Trash2 size={15} />
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
