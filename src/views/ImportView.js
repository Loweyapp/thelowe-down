import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle, Database } from 'lucide-react';
import Papa from 'papaparse';
import { C, TYPE_COLOR, todayStr } from '../constants.js';
import { Card, Btn } from '../components/UI.js';

const MAY_2026 = [
  { date:'2026-05-01', description:'Ryanair tea',                   category:'Holiday & Travel', amount:-3.25,   type:'expense', account:'Alex'  },
  { date:'2026-05-02', description:'Vinted earnings',               category:'Income',           amount:23.74,   type:'income',  account:'Kelly' },
  { date:'2026-05-03', description:"Alex's Riga trip expenses",     category:'Holiday & Travel', amount:-420.00, type:'expense', account:'Alex'  },
  { date:'2026-05-03', description:'Riga - Kelly cash',             category:'Holiday & Travel', amount:-46.00,  type:'expense', account:'Kelly' },
  { date:'2026-05-03', description:'Riga - Kelly Monzo',            category:'Holiday & Travel', amount:-25.20,  type:'expense', account:'Kelly' },
  { date:'2026-05-03', description:'Chinese takeaway',              category:'Dining Out',       amount:-31.40,  type:'expense', account:'Kelly' },
  { date:'2026-05-04', description:'Alex tube',                     category:'Transport',        amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-05-04', description:'K festival - snacks',           category:'Dining Out',       amount:-18.30,  type:'expense', account:'Kelly' },
  { date:'2026-05-04', description:'Korean food & Ginseng tea',     category:'Groceries',        amount:-47.66,  type:'expense', account:'Kelly' },
  { date:'2026-05-04', description:'Kelly tube',                    category:'Transport',        amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-05-05', description:'Cinema popcorn',                category:'Entertainment',    amount:-14.61,  type:'expense', account:'Alex'  },
  { date:'2026-05-05', description:'Alex tube',                     category:'Transport',        amount:-10.70,  type:'expense', account:'Alex'  },
  { date:'2026-05-06', description:'Parking',                       category:'Transport',        amount:-3.00,   type:'expense', account:'Alex'  },
  { date:'2026-05-06', description:'M&S',                          category:'Groceries',        amount:-5.86,   type:'expense', account:'Kelly' },
  { date:'2026-05-07', description:'Alex Audible',                  category:'Entertainment',    amount:-4.49,   type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'Kelly tube',                    category:'Transport',        amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-05-07', description:'Kelly tube',                    category:'Transport',        amount:-3.60,   type:'expense', account:'Kelly' },
  { date:'2026-05-07', description:'Hand soap wash',                category:'Shopping',         amount:-40.60,  type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'International supermarket',     category:'Groceries',        amount:-1.99,   type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'Snacks',                        category:'Groceries',        amount:-57.70,  type:'expense', account:'Alex'  },
  { date:'2026-05-07', description:'Alex History podcast',          category:'Entertainment',    amount:-7.99,   type:'expense', account:'Alex'  },
  { date:'2026-05-08', description:'Stansted drop off',             category:'Transport',        amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2026-05-08', description:'Lebara phone plan',             category:'Subscriptions',    amount:-3.00,   type:'expense', account:'Kelly' },
  { date:'2026-05-08', description:"Gordon's wine bar",             category:'Dining Out',       amount:-63.74,  type:'expense', account:'Kelly' },
  { date:'2026-05-08', description:'Kelly tube',                    category:'Transport',        amount:-7.80,   type:'expense', account:'Kelly' },
  { date:'2026-05-09', description:'COSTCO',                        category:'Groceries',        amount:-126.28, type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:'Flowers for garden',            category:'Home & Garden',    amount:-37.71,  type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:"Sainsbury's",                   category:'Groceries',        amount:-19.20,  type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:'Tesco',                         category:'Groceries',        amount:-10.10,  type:'expense', account:'Alex'  },
  { date:'2026-05-09', description:'International supermarket',     category:'Groceries',        amount:-6.06,   type:'expense', account:'Kelly' },
  { date:'2026-05-09', description:"Sainsbury's savings card",      category:'Groceries',        amount:-102.30, type:'expense', account:'Kelly' },
  { date:'2026-05-11', description:'Drop off at Gatwick',           category:'Transport',        amount:-20.00,  type:'expense', account:'Alex'  },
  { date:'2026-05-11', description:'Car cleaning',                  category:'Car',              amount:-35.00,  type:'expense', account:'Alex'  },
  { date:'2026-05-12', description:'Dart bridge charge',            category:'Transport',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-05-12', description:'Patreon channel',               category:'Entertainment',    amount:-9.60,   type:'expense', account:'Alex'  },
  { date:'2026-05-13', description:'Alex glasses and eye check',    category:'Health & Medical', amount:-240.00, type:'expense', account:'Alex'  },
  { date:'2026-05-13', description:'Kelly paid Sudeng - Sapphire',  category:'Holiday & Travel', amount:-262.72, type:'expense', account:'Kelly' },
];

export default function ImportView({ importTxs, setView }) {
  const [dragOver,   setDragOver]   = useState(false);
  const [preview,    setPreview]    = useState(null);
  const [error,      setError]      = useState('');
  const [done,       setDone]       = useState(false);
  const [seeding,    setSeeding]    = useState(false);
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

  const loadMay2026 = async () => {
    setSeeding(true);
    await importTxs(MAY_2026.map((r, i) => ({ ...r, id: Date.now() + i })));
    setDone(true);
    setTimeout(() => { setDone(false); setView('dashboard'); }, 2000);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Import CSV</div>

      {!preview && !done && (
        <>
          <Card style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>May 2026 — historical data</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>37 transactions · £1,724.46 expenses · £23.74 income</div>
            </div>
            <button onClick={loadMay2026} disabled={seeding} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              borderRadius: 10, border: 'none', background: C.primary, color: '#FFF',
              fontWeight: 600, fontSize: 14, cursor: seeding ? 'default' : 'pointer',
              fontFamily: "'Outfit', sans-serif", opacity: seeding ? 0.6 : 1, flexShrink: 0,
            }}>
              <Database size={15} />{seeding ? 'Importing…' : 'Import May 2026'}
            </button>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Expected CSV format</div>
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
