import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Pencil } from 'lucide-react';
import { C, COLOR_OPTS, ICON_MAP, ICON_OPTS, gbp } from '../constants.js';
import { Card, Btn, Field } from '../components/UI.js';

const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${C.border}`, fontSize: 14,
  fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box',
};

function IconPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {ICON_OPTS.map(name => {
        const Icon   = ICON_MAP[name];
        const active = value === name;
        return (
          <button key={name} onClick={() => onChange(name)} style={{
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
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {COLOR_OPTS.map(col => (
        <button key={col} onClick={() => onChange(col)} style={{
          width: 28, height: 28, borderRadius: '50%', background: col, cursor: 'pointer',
          border: `3px solid ${value === col ? C.text : 'transparent'}`,
        }} />
      ))}
    </div>
  );
}

export default function CategoriesView({ cats, addCat, deleteCat, updateCat }) {
  const [addOpen, setAddOpen] = useState(false);
  const [form,    setForm]    = useState({ name: '', icon: 'Package', color: '#6B7280', budget: '' });
  const [editId,  setEditId]  = useState(null);
  const [editForm, setEditForm] = useState({});

  const submitAdd = () => {
    if (!form.name.trim()) return;
    addCat({ ...form, budget: parseFloat(form.budget) || 0 });
    setForm({ name: '', icon: 'Package', color: '#6B7280', budget: '' });
    setAddOpen(false);
  };

  const startEdit = cat => {
    setEditId(cat.id);
    setEditForm({ icon: cat.icon, color: cat.color, budget: cat.budget ?? '' });
  };

  const saveEdit = cat => {
    updateCat(cat.id, {
      icon:   editForm.icon,
      color:  editForm.color,
      budget: parseFloat(editForm.budget) || 0,
    });
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 22 }}>Categories</div>
        <Btn onClick={() => setAddOpen(o => !o)} primary><Plus size={15} />New Category</Btn>
      </div>

      {addOpen && (
        <Card>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>New Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Icon">
              <IconPicker value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} />
            </Field>
            <Field label="Colour">
              <ColorPicker value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} />
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
              <button onClick={submitAdd} style={{
                flex: 1, padding: 12, borderRadius: 10, border: 'none', background: C.primary,
                color: '#FFF', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
              }}>Add Category</button>
              <button onClick={() => setAddOpen(false)} style={{
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
          const editing  = editId === cat.id;

          return (
            <Card key={cat.id} style={{ padding: '14px 16px' }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: `${editing ? editForm.color : cat.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {(() => {
                    const Ic = ICON_MAP[editing ? editForm.icon : cat.icon];
                    return Ic ? <Ic size={18} color={editing ? editForm.color : cat.color} /> : null;
                  })()}
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: editing ? editForm.color : cat.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</div>
                  {!editing && (
                    <div style={{ fontSize: 12, color: C.muted }}>Budget: {gbp(cat.budget ?? 0)} / month</div>
                  )}
                </div>
                {!editing && (
                  <>
                    <button onClick={() => startEdit(cat)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8,
                    }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteCat(cat.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8,
                    }}>
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
                {editing && (
                  <>
                    <button onClick={() => saveEdit(cat)} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: C.primary, padding: 8,
                    }}>
                      <Check size={17} />
                    </button>
                    <button onClick={cancelEdit} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 8,
                    }}>
                      <X size={17} />
                    </button>
                  </>
                )}
              </div>

              {/* Inline edit form */}
              {editing && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Monthly Budget (£)">
                    <input
                      type="number"
                      value={editForm.budget}
                      onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))}
                      placeholder="0"
                      min="0"
                      style={inp}
                      autoFocus
                    />
                  </Field>
                  <Field label="Icon">
                    <IconPicker value={editForm.icon} onChange={v => setEditForm(f => ({ ...f, icon: v }))} />
                  </Field>
                  <Field label="Colour">
                    <ColorPicker value={editForm.color} onChange={v => setEditForm(f => ({ ...f, color: v }))} />
                  </Field>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
