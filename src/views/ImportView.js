import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
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
  { date:'2026-05-06', description:'M&S',                           category:'Groceries',        amount:-5.86,   type:'expense', account:'Kelly' },
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

const APR_2026 = [
  { date:'2026-04-01', description:'Alex takeaway kebab',              category:'Dining Out',        amount:-6.80,   type:'expense', account:'Alex'  },
  { date:'2026-04-02', description:'Alex ear buds',                    category:'Shopping',          amount:-35.68,  type:'expense', account:'Alex'  },
  { date:'2026-04-02', description:'Heathrow parking',                 category:'Transport',         amount:-8.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-03', description:"Sainsbury's savings card",         category:'Groceries',         amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2026-04-03', description:'International supermarket',        category:'Groceries',         amount:-4.37,   type:'expense', account:'Alex'  },
  { date:'2026-04-03', description:'Waitrose',                         category:'Groceries',         amount:-24.96,  type:'expense', account:'Alex'  },
  { date:'2026-04-04', description:'Alex history book',                category:'Shopping',          amount:-10.40,  type:'expense', account:'Alex'  },
  { date:'2026-04-04', description:'Tesco',                            category:'Groceries',         amount:-19.84,  type:'expense', account:'Alex'  },
  { date:'2026-04-04', description:'Alex Audible',                     category:'Entertainment',     amount:-3.79,   type:'expense', account:'Alex'  },
  { date:'2026-04-06', description:'Alex book shopping',               category:'Shopping',          amount:-22.87,  type:'expense', account:'Alex'  },
  { date:'2026-04-06', description:'Hotel in Japan',                   category:'Holiday & Travel',  amount:-152.94, type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Music stand',                      category:'Entertainment',     amount:-9.94,   type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:"Sainsbury's",                      category:'Groceries',         amount:-40.34,  type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Alex podcast subscription',        category:'Entertainment',     amount:-7.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Alex Audible',                     category:'Entertainment',     amount:-8.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-07', description:'Kelly tube',                       category:'Transport',         amount:-8.40,   type:'expense', account:'Kelly' },
  { date:'2026-04-08', description:'Call to Korea',                    category:'Bills & Utilities', amount:-0.99,   type:'expense', account:'Kelly' },
  { date:'2026-04-09', description:'Alex ear buds',                    category:'Shopping',          amount:-6.19,   type:'expense', account:'Alex'  },
  { date:'2026-04-09', description:'Call to Korea',                    category:'Bills & Utilities', amount:-0.99,   type:'expense', account:'Kelly' },
  { date:'2026-04-09', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-09', description:'Kelly dinner and drinks',          category:'Dining Out',        amount:-52.37,  type:'expense', account:'Kelly' },
  { date:'2026-04-10', description:'Pub with Rob',                     category:'Dining Out',        amount:-36.65,  type:'expense', account:'Alex'  },
  { date:'2026-04-10', description:'Kelly and Alex El Dudley dinner',  category:'Dining Out',        amount:-187.15, type:'expense', account:'Kelly' },
  { date:'2026-04-11', description:'Tesco',                            category:'Groceries',         amount:-24.93,  type:'expense', account:'Alex'  },
  { date:'2026-04-11', description:'Alex tube',                        category:'Transport',         amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-04-11', description:'Alex lunch',                       category:'Dining Out',        amount:-18.50,  type:'expense', account:'Alex'  },
  { date:'2026-04-11', description:'Kelly tube',                       category:'Transport',         amount:-5.90,   type:'expense', account:'Kelly' },
  { date:'2026-04-11', description:'Kelly Bolt',                       category:'Transport',         amount:-13.11,  type:'expense', account:'Kelly' },
  { date:'2026-04-12', description:"Sainsbury's",                      category:'Groceries',         amount:-32.35,  type:'expense', account:'Alex'  },
  { date:'2026-04-12', description:'Kelly tube',                       category:'Transport',         amount:-7.00,   type:'expense', account:'Kelly' },
  { date:'2026-04-13', description:"Sainsbury's savings card",         category:'Groceries',         amount:-95.50,  type:'expense', account:'Kelly' },
  { date:'2026-04-13', description:'Kelly Libera phone bill',          category:'Subscriptions',     amount:-5.00,   type:'expense', account:'Kelly' },
  { date:'2026-04-13', description:'Paints',                           category:'Shopping',          amount:-5.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Bird poo remover',                 category:'Car',               amount:-16.99,  type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Alex Jazz cafe',                   category:'Dining Out',        amount:-36.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Alex kebab',                       category:'Dining Out',        amount:-12.90,  type:'expense', account:'Alex'  },
  { date:'2026-04-13', description:'Modeling content',                 category:'Entertainment',     amount:-9.60,   type:'expense', account:'Alex'  },
  { date:'2026-04-14', description:'Kelly coffee',                     category:'Dining Out',        amount:-4.45,   type:'expense', account:'Kelly' },
  { date:'2026-04-14', description:'Temu - shopping organising',       category:'Shopping',          amount:-9.58,   type:'expense', account:'Kelly' },
  { date:'2026-04-14', description:"Sainsbury's",                      category:'Groceries',         amount:-9.66,   type:'expense', account:'Kelly' },
  { date:'2026-04-14', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-15', description:'Pub',                              category:'Dining Out',        amount:-26.30,  type:'expense', account:'Alex'  },
  { date:'2026-04-15', description:'Temu',                             category:'Shopping',          amount:-0.58,   type:'expense', account:'Kelly' },
  { date:'2026-04-16', description:'Alex to watch gig',                category:'Entertainment',     amount:-27.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:"Dad's birthday gift",              category:'Shopping',          amount:-27.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Alex tube',                        category:'Transport',         amount:-8.40,   type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Alex drinks with colleagues',      category:'Dining Out',        amount:-51.35,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Internet broadband',               category:'Bills & Utilities', amount:-40.04,  type:'expense', account:'Alex'  },
  { date:'2026-04-16', description:'Apple storage fee',                category:'Subscriptions',     amount:-2.99,   type:'expense', account:'Kelly' },
  { date:'2026-04-16', description:'Vinted earnings',                  category:'Income',            amount:60.00,   type:'income',  account:'Kelly' },
  { date:'2026-04-17', description:'Alex drinks',                      category:'Dining Out',        amount:-1.35,   type:'expense', account:'Alex'  },
  { date:'2026-04-17', description:'Alex work lunch',                  category:'Dining Out',        amount:-5.90,   type:'expense', account:'Alex'  },
  { date:'2026-04-17', description:'Modeling content',                 category:'Entertainment',     amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2026-04-17', description:'Kelly lunch with Cecilie',         category:'Dining Out',        amount:-19.00,  type:'expense', account:'Kelly' },
  { date:'2026-04-17', description:'Kelly dinner with friends',        category:'Dining Out',        amount:-23.35,  type:'expense', account:'Kelly' },
  { date:'2026-04-17', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-18', description:"Kelly's gift for dad",             category:'Shopping',          amount:-50.00,  type:'expense', account:'Kelly' },
  { date:'2026-04-18', description:'Hand soap and cream',              category:'Shopping',          amount:-21.99,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:"Alex's socks",                     category:'Shopping',          amount:-38.95,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:'Alex coffee',                      category:'Groceries',         amount:-15.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:'Gift for KOR',                     category:'Shopping',          amount:-35.43,  type:'expense', account:'Alex'  },
  { date:'2026-04-18', description:'Cakes',                            category:'Dining Out',        amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-19', description:'Cat toy',                          category:'Shopping',          amount:-6.62,   type:'expense', account:'Alex'  },
  { date:'2026-04-19', description:'Lebara phone plan',                category:'Subscriptions',     amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-19', description:"Upfront bill for Kelly's bday",    category:'Dining Out',        amount:-60.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-20', description:"Takeaway for dad's birthday",      category:'Shopping',          amount:-94.50,  type:'expense', account:'Alex'  },
  { date:'2026-04-20', description:'Vinted earnings',                  category:'Income',            amount:40.00,   type:'income',  account:'Kelly' },
  { date:'2026-04-21', description:'Stansted airport parking',         category:'Transport',         amount:-41.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-22', description:'Alex app',                         category:'Entertainment',     amount:-7.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-22', description:'Leaving gift',                     category:'Shopping',          amount:-5.00,   type:'expense', account:'Alex'  },
  { date:'2026-04-22', description:'Tesco',                            category:'Groceries',         amount:-7.33,   type:'expense', account:'Kelly' },
  { date:'2026-04-23', description:'Alex drinks with Tom',             category:'Dining Out',        amount:-37.40,  type:'expense', account:'Alex'  },
  { date:'2026-04-23', description:'Bed payment installment',          category:'Home & Garden',     amount:-75.70,  type:'expense', account:'Alex'  },
  { date:'2026-04-24', description:'Alex tube',                        category:'Transport',         amount:-4.80,   type:'expense', account:'Alex'  },
  { date:'2026-04-24', description:'Uber home',                        category:'Transport',         amount:-31.67,  type:'expense', account:'Alex'  },
  { date:'2026-04-24', description:'Kelly tube',                       category:'Transport',         amount:-4.80,   type:'expense', account:'Kelly' },
  { date:'2026-04-25', description:'Alex book shopping',               category:'Shopping',          amount:-13.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Drinks',                           category:'Dining Out',        amount:-41.80,  type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Alex tube',                        category:'Transport',         amount:-7.20,   type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:"Kelly's birthday dinner",          category:'Dining Out',        amount:-159.88, type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Taxi - pay to Lorie',              category:'Transport',         amount:-30.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-25', description:'Kelly tube',                       category:'Transport',         amount:-7.20,   type:'expense', account:'Kelly' },
  { date:'2026-04-26', description:'Petrol',                           category:'Car',               amount:-15.03,  type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:'COSTCO',                           category:'Groceries',         amount:-135.76, type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:'Colombia Road flowers',            category:'Home & Garden',     amount:-36.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:"Sainsbury's",                      category:'Groceries',         amount:-26.68,  type:'expense', account:'Alex'  },
  { date:'2026-04-26', description:'Shopping',                         category:'Groceries',         amount:-12.05,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'Light bulbs',                      category:'Home & Garden',     amount:-24.97,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'M&S',                              category:'Groceries',         amount:-3.50,   type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:"Sainsbury's",                      category:'Groceries',         amount:-1.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'HSBC bank fee',                    category:'Bills & Utilities', amount:-11.95,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:'Flowers for garden',               category:'Home & Garden',     amount:-25.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-27', description:"Kelly's birthday cake",            category:'Shopping',          amount:-35.95,  type:'expense', account:'Alex'  },
  { date:'2026-04-28', description:'Alex salary',                      category:'Income',            amount:3581.28, type:'income',  account:'Alex'  },
  { date:'2026-04-28', description:'Stansted drop off for mum',        category:'Transport',         amount:-10.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-28', description:'Gift',                             category:'Shopping',          amount:-9.99,   type:'expense', account:'Alex'  },
  { date:'2026-04-28', description:"F&M gift for Nora's family",       category:'Shopping',          amount:-30.20,  type:'expense', account:'Kelly' },
  { date:'2026-04-28', description:'Kelly tube',                       category:'Transport',         amount:-11.50,  type:'expense', account:'Kelly' },
  { date:'2026-04-29', description:'Claude subscription',              category:'Subscriptions',     amount:-18.00,  type:'expense', account:'Alex'  },
  { date:'2026-04-29', description:'House rent',                       category:'Bills & Utilities', amount:-500.00, type:'expense', account:'Alex'  },
  { date:'2026-04-30', description:'Alex hair product',                category:'Shopping',          amount:-2.20,   type:'expense', account:'Alex'  },
  { date:'2026-04-30', description:'Alex breakfast at Stansted',       category:'Dining Out',        amount:-16.25,  type:'expense', account:'Alex'  },
  { date:'2026-04-30', description:'Kelly breakfast at Stansted',      category:'Dining Out',        amount:-12.50,  type:'expense', account:'Kelly' },
];

const HISTORY = [
  { label: 'April 2026', sub: '103 transactions · £3,067.26 expenses · £3,681.28 income', data: APR_2026 },
  { label: 'May 2026',   sub: '37 transactions · £1,724.46 expenses · £23.74 income',     data: MAY_2026 },
];

export default function ImportView({ importTxs, setView }) {
  const [dragOver,  setDragOver]  = useState(false);
  const [preview,   setPreview]   = useState(null);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);
  const [loading,   setLoading]   = useState(null);
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

  const loadHistory = async label => {
    const entry = HISTORY.find(h => h.label === label);
    if (!entry) return;
    setLoading(label);
    await importTxs(entry.data.map((r, i) => ({ ...r, id: Date.now() + i })));
    setLoading(null);
    setDone(true);
    setTimeout(() => { setDone(false); setView('dashboard'); }, 2000);
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Import</div>

      {!preview && !done && (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: C.muted }}>Historical data</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {HISTORY.map(h => (
              <Card key={h.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '14px 20px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{h.label}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{h.sub}</div>
                </div>
                <button onClick={() => loadHistory(h.label)} disabled={!!loading} style={{
                  padding: '8px 18px', borderRadius: 10, border: 'none',
                  background: loading === h.label ? C.muted : C.primary,
                  color: '#FFF', fontWeight: 600, fontSize: 13, cursor: loading ? 'default' : 'pointer',
                  fontFamily: "'Outfit', sans-serif", flexShrink: 0,
                }}>
                  {loading === h.label ? 'Importing…' : 'Import'}
                </button>
              </Card>
            ))}
          </div>

          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 10, color: C.muted }}>Import from CSV</div>
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
