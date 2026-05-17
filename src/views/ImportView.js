import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { C, TYPE_COLOR, todayStr } from '../constants.js';
import { Card, Btn } from '../components/UI.js';

export default function ImportView({ importTxs, setView }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState(false);
  const fileRef = useRef();

  const parse = file => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => {
        const rows = data.map((r, i) => ({
          id:          Date.now() + i,
          date:        r.date?.trim()        || todayStr(),
          description: r.description?.trim() || '',
          category:    r.category?.trim()    || 'Other',
          amount:      parseFloat(r.amount)  || 0,
          type:        r.type?.trim()        || 'expense',
          account:     r.account?.trim()     || 'Alex',
        })).filter(r => r.description && r.amount !== 0);
        if (!rows.length) { setError('No valid rows found. Check your CSV format.'); return; }
        setPreview(rows);
        setError('');
      },
      error: () => setError('Failed to parse CSV. Please check the file.'),
    });
  };

  const confirm = () => {
    importTxs(preview);
    setPreview(null);
    setDone(true);
    setTimeout(() => { setDone(false); setView('dashboard'); }, 2000);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Import CSV</div>

      {!preview && !done && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Expected format</div>
            <pre style={{
              fontFamily: 'monospace', fontSize: 12, background: C.bg,
              padding: 12, borderRadius: 8, color: C.text, overflowX: 'auto',
            }}>
{`date, description, category, amount, type, account
2026-01-15, Tesco, Groceries, -45.20, expense, Alex
2026-01-01, Vinted earnings, Income, 23.74, income, Kelly`}
            </pre>
          </Card>

          <div
            onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) parse(f); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `2px dashed ${dragOver ? C.primary : C.border}`, borderRadius: 16,
              padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? `${C.primary}08` : C.card, transition: 'all 0.12s',
            }}
          >
            <Upload size={32} color={dragOver ? C.primary : C.muted} style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Drop your CSV here</div>
            <div style={{ color: C.muted, fontSize: 14 }}>or click to browse</div>
            <input ref={fileRef} type="file" accept=".csv"
              onChange={e => { if (e.target.files[0]) parse(e.target.files[0]); }}
              style={{ display: 'none' }} />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              borderRadius: 10, marginTop: 12, background: '#FEF2F2', color: C.expense, fontSize: 14,
            }}>
              <AlertCircle size={15} />{error}
            </div>
          )}
        </>
      )}

      {done && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12,
          background: '#F0FDF4', color: C.income, fontSize: 15, fontWeight: 600,
        }}>
          <Check size={20} />Import successful! Redirecting to dashboard…
        </div>
      )}

      {preview && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              Preview — {preview.length} transaction{preview.length !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPreview(null)} style={{
                padding: '8px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                background: 'transparent', cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              }}>Cancel</button>
              <Btn onClick={confirm} primary>Import All</Btn>
            </div>
          </div>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['Date', 'Description', 'Category', 'Amount', 'Type', 'Account'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px', textAlign: 'left', fontWeight: 600,
                        color: C.muted, borderBottom: `1px solid ${C.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{r.date}</td>
                      <td style={{ padding: '10px 12px' }}>{r.description}</td>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{r.category}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: r.amount >= 0 ? C.income : C.expense }}>
                        {r.amount >= 0 ? '+' : ''}£{Math.abs(r.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: `${TYPE_COLOR[r.type] || '#6B7280'}20`,
                          color:       TYPE_COLOR[r.type] || '#6B7280',
                        }}>{r.type}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: C.muted }}>{r.account || 'Alex'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 50 && (
                <div style={{ padding: 12, textAlign: 'center', color: C.muted, fontSize: 13 }}>
                  +{preview.length - 50} more rows not shown
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
