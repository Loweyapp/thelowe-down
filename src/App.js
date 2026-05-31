import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase.js';
import {
  collection, doc, addDoc, deleteDoc, updateDoc, setDoc, getDoc,
  onSnapshot, query, orderBy, writeBatch,
} from 'firebase/firestore';
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, onAuthStateChanged, signOut as firebaseSignOut,
} from 'firebase/auth';
import Papa from 'papaparse';
import { DEFAULT_CATS, NAV } from './constants.js';
import { LoginScreen, LoadingScreen } from './components/Auth.js';
import { Sidebar, TopHeader, BottomNav } from './components/Navigation.js';
import DashboardView     from './views/DashboardView.js';
import TransactionsView  from './views/TransactionsView.js';
import SummaryView       from './views/SummaryView.js';
import CategoriesView    from './views/CategoriesView.js';
import AddView           from './views/AddView.js';
import ImportView        from './views/ImportView.js';
import AskView           from './views/AskView.js';

function useBreakpoint() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return mobile;
}

export default function App() {
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view,        setView]        = useState(() => {
    const p = new URLSearchParams(window.location.search).get('view');
    return ['dashboard','transactions','summary','categories','add','import','ask'].includes(p) ? p : 'dashboard';
  });
  const [txs,         setTxs]         = useState([]);
  const [cats,        setCats]        = useState([]);
  const [anthropicKey, setAnthropicKey] = useState('');
  const [testMode,    setTestMode]    = useState(false);
  const txCollection = testMode ? 'transactions_test' : 'transactions';
  const mobile = useBreakpoint();

  useEffect(() => {
    getRedirectResult(auth)
      .then(result => { if (result?.user) setUser(result.user); })
      .catch(() => {});
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setTxs([]);
    const txRef  = collection(db, 'family', 'lowe', txCollection);
    const catRef = collection(db, 'family', 'lowe', 'categories');

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
        const existingMap = {};
        snap.docs.forEach(d => { existingMap[d.data().name] = { id: d.id, ...d.data() }; });
        const batch = writeBatch(db);
        let changes = false;
        DEFAULT_CATS.forEach(def => {
          if (!existingMap[def.name]) {
            batch.set(doc(catRef), def);
            changes = true;
          } else {
            const cur = existingMap[def.name];
            if (cur.icon !== def.icon || cur.color !== def.color) {
              batch.update(doc(catRef, cur.id), { icon: def.icon, color: def.color });
              changes = true;
            }
          }
        });
        if (changes) await batch.commit();
        setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });

    const settingsRef = doc(db, 'users', user.uid, 'settings', 'config');
    getDoc(settingsRef).then(snap => {
      if (snap.exists()) setAnthropicKey(snap.data().anthropicKey || '');
    });

    return () => { unsubTx(); unsubCat(); };
  }, [user, txCollection]);

  const saveAnthropicKey = async key => {
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'config');
    await setDoc(settingsRef, { anthropicKey: key }, { merge: true });
    setAnthropicKey(key);
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      }
    }
  };

  const signOut = () => firebaseSignOut(auth);

  const addTx = async tx => {
    const { id, ...data } = tx;
    await addDoc(collection(db, 'family', 'lowe', txCollection), data);
  };

  const deleteTx = async id => {
    await deleteDoc(doc(db, 'family', 'lowe', txCollection, String(id)));
  };

  const addCat = async cat => {
    const { id, ...data } = cat;
    await addDoc(collection(db, 'family', 'lowe', 'categories'), data);
  };

  const deleteCat = async id => {
    await deleteDoc(doc(db, 'family', 'lowe', 'categories', String(id)));
  };

  const updateCat = async (id, updates) => {
    await updateDoc(doc(db, 'family', 'lowe', 'categories', String(id)), updates);
  };

  const importTxs = async rows => {
    const existingKeys = new Set(txs.map(t => `${t.date}|${t.description}|${t.amount}`));
    const fresh = rows.filter(r => !existingKeys.has(`${r.date}|${r.description}|${r.amount}`));
    if (!fresh.length) return 0;
    const batch = writeBatch(db);
    fresh.forEach(({ id, ...data }) => {
      batch.set(doc(collection(db, 'family', 'lowe', txCollection)), data);
    });
    await batch.commit();
    return fresh.length;
  };

  const deleteTxsByBank = async bank => {
    const toDelete = txs.filter(t => t.bank === bank);
    if (!toDelete.length) return 0;
    const batch = writeBatch(db);
    toDelete.forEach(t => batch.delete(doc(db, 'family', 'lowe', txCollection, t.id)));
    await batch.commit();
    return toDelete.length;
  };

  const clearAllTxs = async () => {
    if (!txs.length) return 0;
    const batch = writeBatch(db);
    txs.forEach(t => batch.delete(doc(db, 'family', 'lowe', txCollection, t.id)));
    await batch.commit();
    return txs.length;
  };

  const exportCSV = () => {
    const csv = Papa.unparse(txs.map(({ id, ...t }) => t));
    const a   = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: 'the-lowedown-export.csv',
    });
    a.click();
  };

  if (authLoading) return <LoadingScreen />;
  if (!user)       return <LoginScreen onSignIn={signIn} />;

  const shared = { txs, cats, addTx, deleteTx, deleteTxsByBank, clearAllTxs, addCat, deleteCat, updateCat, importTxs, exportCSV, setView, mobile, anthropicKey, saveAnthropicKey, user, testMode, setTestMode };
  const VIEWS  = { dashboard: DashboardView, transactions: TransactionsView, summary: SummaryView, categories: CategoriesView, add: AddView, import: ImportView, ask: AskView };
  const View   = VIEWS[view] || DashboardView;

  return (
    <div style={{
      display: 'flex', height: '100dvh', background: '#F4F7F9',
      fontFamily: "'Outfit', sans-serif", overflow: 'hidden',
    }}>
      {!mobile && <Sidebar view={view} setView={setView} exportCSV={exportCSV} user={user} signOut={signOut} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {mobile && <TopHeader label={NAV.find(n => n.id === view)?.label || ''} signOut={signOut} />}
        {testMode && (
          <div style={{
            background: '#EF4444', color: '#FFF', textAlign: 'center',
            fontSize: 12, fontWeight: 700, padding: '6px 12px', flexShrink: 0,
            letterSpacing: '0.03em',
          }}>
            🧪 TEST MODE — writes go to transactions_test, not your real data
          </div>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: mobile ? '16px 16px 8px' : '28px 32px' }}>
          <View {...shared} />
        </div>
        {mobile && <BottomNav view={view} setView={setView} />}
      </div>
    </div>
  );
}
