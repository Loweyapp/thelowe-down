import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  LayoutDashboard, List, Tag, Plus, Upload, Download,
  TrendingUp, TrendingDown, PiggyBank, Trash2,
  ChevronLeft, ChevronRight, Check, AlertCircle,
  ArrowUpRight, ArrowDownRight, LogOut,
} from 'lucide-react';
import Papa from 'papaparse';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, addDoc, deleteDoc,
  onSnapshot, query, orderBy, writeBatch,
} from 'firebase/firestore';
import {
  getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider,
  onAuthStateChanged, signOut as firebaseSignOut,
} from 'firebase/auth';

// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyD7qjTrmTyTO22ZdWze3RmdiboMwgIuDLk",
  authDomain: "thelowe-down.firebaseapp.com",
  projectId: "thelowe-down",
  storageBucket: "thelowe-down.firebasestorage.app",
  messagingSenderId: "679113035762",
  appId: "1:679113035762:web:0b5fd9e3bebdfee05f656b",
};
const firebaseApp = initializeApp(firebaseConfig);
const db  = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// ===== DESIGN TOKENS =====
const C = {
  primary:    '#0ABFA3',
  sidebar:    '#1C2333',
  bg:         '#F4F7F9',
  card:       '#FFFFFF',
  border:     '#E8ECF0',
  text:       '#1C2333',
  muted:      '#6B7280',
  income:     '#22C55E',
  expense:    '#EF4444',
  investment: '#8B5CF6',
  saving:     '#3B82F6',
};

const TYPE_COLOR = {
  income:     C.income,
  expense:    C.expense,
  saving:     C.saving,
  investment: C.investment,
};

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'summary',    label: 'Summary',    Icon: List },
  { id: 'categories', label: 'Categories', Icon: Tag },
  { id: 'add',        label: 'Add',        Icon: Plus },
  { id: 'import',     label: 'Import',     Icon: Upload },
];

const DEFAULT_CATS = [
  { name: 'Food & Drink',      emoji: '🍔', color: '#F97316', budget: 300 },
  { name: 'Transport',         emoji: '🚗', color: '#3B82F6', budget: 150 },
  { name: 'Shopping',          emoji: '🛍️', color: '#EC4899', budget: 200 },
  { name: 'Entertainment',     emoji: '🎬', color: '#8B5CF6', budget: 100 },
  { name: 'Health',            emoji: '💊', color: '#22C55E', budget:  50 },
  { name: 'Bills & Utilities', emoji: '🏠', color: '#EF4444', budget: 400 },
  { name: 'Subscriptions',     emoji: '📱', color: '#0ABFA3', budget:  50 },
  { name: 'Other',             emoji: '📦', color: '#6B7280', budget: 100 },
];

// ===== HELPERS =====
const gbp      = n  => `£${Math.abs(n).toFixed(2)}`;
const mkKey    = d  => d.slice(0, 7);
const todayStr = () => new Date().toISOString().slice(0, 10);
const mkLabel  = k  => {
  const [y, m] = k.split('-');
  return new Date(+y, +m - 1, 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
};

// ===== HOOKS =====
function useBreakpoint() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

// ===== LOGIN SCREEN =====
function LoginScreen({ onSignIn }) {
  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: C.sidebar, fontFamily: "'Outfit', sans-serif",
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>💰</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#FFF', marginBottom: 8 }}>TheLowDown</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginBottom: 48 }}>Your personal finance tracker</div>
      <button onClick={onSignIn} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 32px', borderRadius: 12, border: 'none',
        background: C.primary, color: '#FFF',
        fontSize: 16, fontWeight: 600, cursor: 'pointer',
        fontFamily: "'Outfit', sans-serif",
      }}>
        Sign in with Google
      </button>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.sidebar,
    }}>
      <div style={{ fontSize: 56 }}>💰</div>
    </div>
  );
}

// ===== APP ROOT =====
export default function App() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view,        setView]        = useState('dashboard');
  const [txs,         setTxs]         = useState([]);
  const [cats,        setCats]        = useState([]);
  const mobile = useBreakpoint();

  // Auth listener
  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Firestore listeners — run when user logs in
  useEffect(() => {
    if (!user) return;

    const txRef  = collection(db, 'users', user.uid, 'transactions');
    const catRef = collection(db, 'users', user.uid, 'categories');

    const unsubTx = onSnapshot(
      query(txRef, orderBy('date', 'desc')),
      snap => setTxs(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    );

    const unsubCat = onSnapshot(catRef, async snap => {
      if (snap.empty) {
        const batch = writeBatch(db);
        DEFAULT_CATS.forEach(cat => batch.set(doc(catRef), cat));
        await batch.commit();
      } else {
        setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });

    return () => { unsubTx(); unsubCat(); };
  }, [user]);

  const signIn  = () => signInWithRedirect(auth, new GoogleAuthProvider());
  const signOut = () => firebaseSignOut(auth);

  const addTx = async tx => {
    const { id, ...data } = tx;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), data);
  };

  const deleteTx = async id => {
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', String(id)));
  };

  const addCat = async cat => {
    const { id, ...data } = cat;
    await addDoc(collection(db, 'users', user.uid, 'categories'), data);
  };

  const deleteCat = async id => {
    await deleteDoc(doc(db, 'users', user.uid, 'categories', String(id)));
  };

  const importTxs = async rows => {
    const batch = writeBatch(db);
    rows.forEach(({ id, ...data }) => {
      batch.set(doc(collection(db, 'users', user.uid, 'transactions')), data);
    });
    await batch.commit();
  };

  const exportCSV = () => {
    const csv = Papa.unparse(txs.map(({ id, ...t }) => t));
    const a   = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'thelowe-down-export.csv',
    });
    a.click();
  };

  if (authLoading) return <LoadingScreen />;
  if (!user)       return <LoginScreen onSignIn={signIn} />;

  const shared = { txs, cats, addTx, deleteTx, addCat, deleteCat, importTxs, exportCSV, setView, mobile };
  const VIEWS  = { dashboard: DashboardView, summary: SummaryView, categories: CategoriesView, add: AddView, import: ImportView };
  const View   = VIEWS[view] || DashboardView;

  return (
    <div style={{ display: 'flex', height: '100dvh', background: C.bg, fontFamily: "'Outfit', sans-serif", overflow: 'hidden' }}>
      {!mobile && <Sidebar view={view} setView={setView} exportCSV={exportCSV} user={user} signOut={signOut} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {mobile && <TopHeader label={NAV.find(n => n.id === view)?.label || ''} signOut={signOut} />}
        <div style={{ flex: 1, overflowY: 'auto', padding: mobile ? '16px 16px 8px' : '28px 32px' }}>
          <View {...shared} />
        </div>
        {mobile && <BottomNav view={view} setView={setView} />}
      </div>
    </div>
  );
}

// ===== NAVIGATION =====
function Sidebar({ view, setView, exportCSV, user, signOut }) {
  return (
    <nav style={{
      width: 220, background: C.sidebar, display: 'flex', flexDirection: 'column',
      padding: '28px 16px 24px', gap: 4, flexShrink: 0,
    }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: '#FFF', letterSpacing: '-0.3px' }}>💰 TheLowDown</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>Personal Finance</div>
      </div>
      {NAV.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button key={id} onClick={() => setView(id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer',
            background: active ? C.primary : 'transparent',
            color: active ? '#FFF' : 'rgba(255,255,255,0.55)',
            fontSize: 14, fontWeight: active ? 600 : 400, fontFamily: "'Outfit', sans-serif",
            textAlign: 'left', transition: 'background 0.12s',
          }}>
            <Icon size={17} />{label}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button onClick={exportCSV} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer',
        background: 'transparent', color: 'rgba(255,255,255,0.55)',
        fontSize: 13, fontFamily: "'Outfit', sans-serif", marginBottom: 8,
      }}>
        <Download size={16} />Export CSV
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
        {user.photoURL && <img src={user.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
        <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.displayName || user.email}
        </div>
        <button onClick={signOut} title="Sign out" style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4,
        }}>
          <LogOut size={14} />
        </button>
      </div>
    </nav>
  );
}

function TopHeader({ label, signOut }) {
  return (
    <div style={{
      background: C.sidebar, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
    }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: '#FFF' }}>💰 TheLowDown</div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      <button onClick={signOut} title="Sign out" style={{
        background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4,
      }}>
        <LogOut size={16} />
      </button>
    </div>
  );
}

function BottomNav({ view, setView }) {
  return (
    <div style={{
      display: 'flex', background: C.card, borderTop: `1px solid ${C.border}`, flexShrink: 0,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(({ id, label, Icon }) => {
        const active = view === id;
        return (
          <button key={id} onClick={() => setView(id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: active ? C.primary : C.muted,
            fontSize: 10, fontFamily: "'Outfit', sans-serif", fontWeight: active ? 600 : 400,
            minHeight: 56,
          }}>
            <Icon size={20} />{label}
          </button>
        );
      })}
    </div>
  );
}

// ===== SHARED UI =====
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, ...style,
    }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color, Icon, sub }) {
  return (
    <Card style={{ flex: 1, minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{label}</div>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || C.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </Card>
  );
}

function TxRow({ tx, onDelete, cats }) {
  const cat   = cats.find(c => c.name === tx.category);
  const plus  = tx.type === 'income';
  const color = TYPE_COLOR[tx.type] || C.text;
  const emoji = cat?.emoji ?? { income: '💵', saving: '🏦', investment: '📈' }[tx.type] ?? '💳';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: cat ? `${cat.color}18` : C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 500, fontSize: 14, color: C.text,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tx.description}
        </div>
        <div style={{ fontSize: 12, color: C.muted }}>{tx.category} · {tx.date}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color, flexShrink: 0 }}>
        {plus ? '+' : '-'}{gbp(tx.amount)}
      </div>
      {onDelete && (
        <button onClick={() => onDelete(tx.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 6, borderRadius: 6,
        }}>
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

// ===== DASHBOARD VIEW =====
const RANGES = [
  { label: '30D', days: 30 },
  { label: '3M',  days: 90 },
  { label: '6M',  days: 180 },
  { label: '1Y',  days: 365 },
  { label: 'All', days: Infinity },
];

function DashboardView({ txs, cats, deleteTx, exportCSV, mobile }) {
  const [rangeIdx, setRangeIdx] = useState(2);

  const cutoff   = RANGES[rangeIdx].days === Infinity ? null
    : new Date(Date.now() - RANGES[rangeIdx].days * 86400000).toISOString().slice(0, 10);
  const filtered = cutoff ? txs.filter(t => t.date >= cutoff) : txs;

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
  const pieData = Object.entries(byCat).map(([name, value]) => ({
    name, value, color: cats.find(c => c.name === name)?.color || '#6B7280',
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  const recent = txs.slice(0, 12);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatCard label="Income"         value={gbp(income)}          color={C.income}                                    Icon={TrendingUp} />
        <StatCard label="Expenses"       value={gbp(expense)}         color={C.expense}                                   Icon={TrendingDown} />
        <StatCard label="Net Balance"    value={gbp(net)}             color={net >= 0 ? C.income : C.expense}             Icon={net >= 0 ? ArrowUpRight : ArrowDownRight} />
        <StatCard label="Saved/Invested" value={gbp(saving + invest)} color={C.saving}                                   Icon={PiggyBank} />
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
                  <stop offset="95%" stopColor={C.income}  stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.expense} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.expense} stopOpacity={0}   />
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
        ) : (
          <EmptyState height={220} message="No transactions yet" />
        )}
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
                {pieData.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, color: C.text }}>{d.name}</div>
                    <div style={{ fontWeight: 600, color: C.text }}>{gbp(d.value)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState height={170} message="No expenses yet" />
          )}
        </Card>

        <Card style={{ flex: mobile ? '1 1 100%' : '2 1 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Recent Transactions</div>
            <button onClick={exportCSV} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
              background: 'transparent', cursor: 'pointer', color: C.muted,
              fontSize: 13, fontFamily: "'Outfit', sans-serif",
            }}>
              <Download size={13} />Export
            </button>
          </div>
          {recent.length > 0
            ? recent.map(tx => <TxRow key={tx.id} tx={tx} onDelete={deleteTx} cats={cats} />)
            : <EmptyState height={120} message="No transactions yet. Add one or import a CSV." />
          }
        </Card>
      </div>
    </div>
  );
}

// ===== SUMMARY VIEW =====
function SummaryView({ txs, cats }) {
  const months = [...new Set(txs.map(t => mkKey(t.date)))].sort().reverse();
  const [idx, setIdx] = useState(0);
  const sel = months[idx] || mkKey(todayStr());

  const mTxs   = txs.filter(t => mkKey(t.date) === sel);
  const sum     = type => mTxs.filter(t => t.type === type).reduce((s, t) => s + Math.abs(t.amount), 0);
  const income  = sum('income'), expense = sum('expense'), saving = sum('saving'), invest = sum('investment');
  const net     = income - expense - saving - invest;

  const catData = cats
    .map(cat => ({
      name:   cat.name,
      emoji:  cat.emoji,
      color:  cat.color,
      budget: cat.budget,
      actual: mTxs.filter(t => t.category === cat.name && t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0),
    }))
    .filter(d => d.budget > 0 || d.actual > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <NavBtn onClick={() => setIdx(i => Math.min(i + 1, months.length - 1))} disabled={idx >= months.length - 1}><ChevronLeft size={18} /></NavBtn>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 20 }}>{mkLabel(sel)}</div>
        <NavBtn onClick={() => setIdx(i => Math.max(i - 1, 0))} disabled={idx === 0}><ChevronRight size={18} /></NavBtn>
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
              <Bar dataKey="actual" name="Actual"  radius={[0, 4, 4, 0]}>
                {catData.map((d, i) => <Cell key={i} fill={d.actual > d.budget && d.budget > 0 ? C.expense : C.primary} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Category Breakdown</div>
        {catData.length === 0
          ? <EmptyState height={80} message="No data for this month" />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {catData.map(d => {
                const pct  = d.budget > 0 ? Math.min((d.actual / d.budget) * 100, 100) : 0;
                const over = d.actual > d.budget && d.budget > 0;
                return (
                  <div key={d.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{d.emoji}</span>
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
          )
        }
      </Card>
    </div>
  );
}

// ===== CATEGORIES VIEW =====
const EMOJI_OPTS = ['🍔','🚗','🛍️','🎬','💊','🏠','📱','📦','✈️','💪','🎓','💇','🐾','🎁','🍕','☕','🎮','📚','💡','🌿','🎵','⚽','🏖️','🍷'];
const COLOR_OPTS = ['#F97316','#3B82F6','#EC4899','#8B5CF6','#22C55E','#EF4444','#0ABFA3','#6B7280','#F59E0B','#06B6D4','#84CC16','#F43F5E'];

function CategoriesView({ cats, addCat, deleteCat }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', emoji: '📦', color: '#6B7280', budget: '' });
  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box' };

  const submit = () => {
    if (!form.name.trim()) return;
    addCat({ ...form, budget: parseFloat(form.budget) || 0 });
    setForm({ name: '', emoji: '📦', color: '#6B7280', budget: '' });
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
            <Field label="Emoji">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {EMOJI_OPTS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} style={{
                    fontSize: 20, padding: 6, borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${form.emoji === e ? C.primary : C.border}`, background: 'transparent',
                  }}>{e}</button>
                ))}
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
                color: '#FFF', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
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
        {cats.map(cat => (
          <Card key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 24 }}>{cat.emoji}</div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
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
        ))}
      </div>
    </div>
  );
}

// ===== ADD VIEW =====
const TX_TYPES = [
  { id: 'expense',    label: 'Expense',    color: C.expense    },
  { id: 'income',     label: 'Income',     color: C.income     },
  { id: 'saving',     label: 'Saving',     color: C.saving     },
  { id: 'investment', label: 'Investment', color: C.investment },
];

function AddView({ addTx, cats, setView }) {
  const [form, setForm] = useState({ type: 'expense', date: todayStr(), description: '', category: '', amount: '' });
  const [ok, setOk] = useState(false);

  const getCats = type =>
    type === 'income'      ? [{ id: 'i', name: 'Income',      emoji: '💵' }]
    : type === 'saving'    ? [{ id: 's', name: 'Savings',     emoji: '🏦' }]
    : type === 'investment'? [{ id: 'v', name: 'Investments', emoji: '📈' }]
    : cats;

  useEffect(() => {
    const c = getCats(form.type);
    setForm(f => ({ ...f, category: c[0]?.name || '' }));
  }, [form.type]);

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontSize: 15,
    fontFamily: "'Outfit', sans-serif", outline: 'none', boxSizing: 'border-box', background: C.card,
  };

  const submit = () => {
    const amt = parseFloat(form.amount);
    if (!form.description.trim() || !form.category || isNaN(amt) || amt <= 0) return;
    addTx({
      id:          Date.now(),
      date:        form.date,
      description: form.description.trim(),
      category:    form.category,
      amount:      form.type === 'income' ? amt : -amt,
      type:        form.type,
    });
    setOk(true);
    const c = getCats(form.type);
    setForm(f => ({ ...f, date: todayStr(), description: '', amount: '', category: c[0]?.name || '' }));
    setTimeout(() => setOk(false), 2000);
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Add Transaction</div>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="Type">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TX_TYPES.map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{
                  flex: 1, minWidth: 80, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                  border:      `2px solid ${form.type === t.id ? t.color : C.border}`,
                  background:  form.type === t.id ? `${t.color}14` : 'transparent',
                  color:       form.type === t.id ? t.color : C.muted,
                  fontWeight:  600, fontSize: 13, fontFamily: "'Outfit', sans-serif",
                }}>{t.label}</button>
              ))}
            </div>
          </Field>

          <Field label="Date">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inp} />
          </Field>

          <Field label="Description">
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Tesco weekly shop" style={inp} />
          </Field>

          <Field label="Category">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={{ ...inp, cursor: 'pointer' }}>
              {getCats(form.type).map(c => <option key={c.id} value={c.name}>{c.emoji} {c.name}</option>)}
            </select>
          </Field>

          <Field label="Amount (£)">
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" min="0" step="0.01" style={inp} />
          </Field>

          {ok && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              borderRadius: 10, background: '#F0FDF4', color: C.income, fontSize: 14, fontWeight: 500,
            }}>
              <Check size={16} />Transaction added!
            </div>
          )}

          <button onClick={submit} style={{
            padding: 14, borderRadius: 12, border: 'none', background: C.primary,
            color: '#FFF', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}>
            Add Transaction
          </button>
        </div>
      </Card>
    </div>
  );
}

// ===== IMPORT VIEW =====
function ImportView({ importTxs, setView }) {
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
              fontFamily: 'monospace', fontSize: 12, background: C.bg, padding: 12,
              borderRadius: 8, color: C.text, overflowX: 'auto',
            }}>
{`date, description, category, amount, type
2026-01-15, Tesco, Food & Drink, -45.20, expense
2026-01-01, Salary, Income, 3500, income`}
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
            <input ref={fileRef} type="file" accept=".csv" onChange={e => { if (e.target.files[0]) parse(e.target.files[0]); }} style={{ display: 'none' }} />
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
                    {['Date','Description','Category','Amount','Type'].map(h => (
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
                        {r.amount >= 0 ? '+' : ''}{gbp(r.amount)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: `${TYPE_COLOR[r.type] || '#6B7280'}20`,
                          color:       TYPE_COLOR[r.type] || '#6B7280',
                        }}>{r.type}</span>
                      </td>
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

// ===== TINY HELPERS =====
function EmptyState({ height, message }) {
  return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 14, textAlign: 'center' }}>
      {message}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function NavBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: 8, cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.35 : 1, display: 'flex', alignItems: 'center',
    }}>
      {children}
    </button>
  );
}

function Btn({ onClick, primary, children }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 10,
      border:      primary ? 'none' : `1px solid ${C.border}`,
      background:  primary ? C.primary : 'transparent',
      color:       primary ? '#FFF' : C.text,
      fontWeight:  600, fontSize: 14, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
    }}>
      {children}
    </button>
  );
}
