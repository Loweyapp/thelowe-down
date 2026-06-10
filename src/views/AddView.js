import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertTriangle, Mic } from 'lucide-react';
import { C, TX_TYPES, ACCOUNTS, todayStr } from '../constants.js';
import { Card, Field } from '../components/UI.js';

export default function AddView({ addTx, cats, txs, anthropicKey, user }) {
  const [form, setForm] = useState({
    account: 'Alex', type: 'expense', date: todayStr(),
    description: '', category: '', amount: '',
  });
  const [ok,         setOk]         = useState(false);
  const [warn,       setWarn]       = useState(null);
  const [voiceState, setVoiceState] = useState('idle'); // idle | recording | processing
  const [voiceError, setVoiceError] = useState('');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef  = useRef('');
  const finalTextRef   = useRef('');
  const holdingRef     = useRef(false);

  const getCats = type =>
    type === 'income'       ? [{ id: 'i', name: 'Income'      }]
    : type === 'saving'     ? [{ id: 's', name: 'Savings'     }]
    : type === 'investment' ? [{ id: 'v', name: 'Investments' }]
    : cats;

  useEffect(() => {
    const c = getCats(form.type);
    setForm(f => ({ ...f, category: c[0]?.name || '' }));
  }, [form.type]);

  useEffect(() => { setWarn(null); }, [form.description, form.amount, form.date]);

  // Set default account from logged-in user
  useEffect(() => {
    const name = user?.displayName?.split(' ')[0];
    if (name && ACCOUNTS.includes(name)) setForm(f => ({ ...f, account: name }));
  }, [user]);

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

  const doAdd = (autoListen = false) => {
    const amt = parseFloat(form.amount);
    addTx({
      id:              Date.now(),
      account:         form.account,
      date:            form.date,
      description:     form.description.trim(),
      description_raw: form.description.trim(),
      category:        form.category,
      amount:          form.type === 'income' ? amt : -amt,
      type:            form.type,
    });
    setOk(true);
    setWarn(null);
    setTranscript('');
    const c = getCats(form.type);
    setForm(f => ({ ...f, date: todayStr(), description: '', amount: '', category: c[0]?.name || '' }));
    setTimeout(() => { setOk(false); }, 2000);
  };

  const submit = () => {
    const amt = parseFloat(form.amount);
    if (!form.description.trim() || !form.category || isNaN(amt) || amt <= 0) return;
    const dup = findDuplicate();
    if (dup) { setWarn(dup); return; }
    doAdd();
  };

  // ── Voice ──────────────────────────────────────────────────────────────────

  const startRecording = e => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceError('Voice input not supported in this browser'); return; }

    holdingRef.current    = true;
    finalTextRef.current  = '';
    transcriptRef.current = '';

    const startSession = () => {
      if (!holdingRef.current) return;
      const r = new SR();
      r.continuous     = false;
      r.interimResults = false;
      r.lang           = 'en-GB';

      r.onresult = ev => {
        finalTextRef.current += ev.results[0][0].transcript + ' ';
        transcriptRef.current = finalTextRef.current.trim();
        setTranscript(finalTextRef.current.trim());
      };

      r.onerror = ev => {
        if (ev.error !== 'aborted' && ev.error !== 'no-speech') {
          setVoiceError(`Mic error: ${ev.error}`);
          holdingRef.current = false;
          setVoiceState('idle');
        }
      };

      r.onend = () => { if (holdingRef.current) startSession(); };

      recognitionRef.current = r;
      r.start();
    };

    startSession();
    setVoiceState('recording');
    setVoiceError('');
    setTranscript('');
  };

  const stopRecording = () => {
    holdingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Wait 350ms for any pending onresult to fire before reading transcript
    setTimeout(() => {
      const t = transcriptRef.current.trim();
      if (!t) { setVoiceState('idle'); return; }
      setVoiceState('processing');
      parseTranscript(t);
    }, 350);
  };

  const parseTranscript = async t => {
    if (!anthropicKey) {
      setVoiceError('No API key — set it in the Ask view');
      setVoiceState('idle');
      return;
    }
    const catNames      = cats.map(c => c.name).join(', ');
    const defaultAcct   = user?.displayName?.split(' ')[0] || 'Alex';
    const yesterday     = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const currentMonth  = todayStr().slice(0, 7);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type':    'application/json',
          'x-api-key':       anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 256,
          messages: [{
            role: 'user',
            content: `Parse this spoken transaction into JSON. Today is ${todayStr()}.

Spoken: "${t}"

Rules:
- date: YYYY-MM-DD. "The fourteenth" = ${currentMonth}-14. "Yesterday" = ${yesterday}. If no date mentioned, use today.
- description: clean readable merchant/description
- category: exactly one of: ${catNames}
- amount: positive number
- type: expense, income, saving, or investment. Default expense.
- account: Alex or Kelly. Default ${defaultAcct} unless another name is mentioned.

Return only a JSON object, no markdown.`,
          }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let text = data.content[0].text.trim();
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(text);
      setForm(f => ({
        ...f,
        date:        parsed.date        || f.date,
        description: parsed.description || f.description,
        category:    parsed.category    || f.category,
        amount:      parsed.amount      ? String(Math.abs(parsed.amount)) : f.amount,
        type:        parsed.type        || f.type,
        account:     parsed.account     || f.account,
      }));
      setVoiceState('idle');
    } catch (err) {
      setVoiceError(err.message?.includes('API') ? err.message : 'Could not parse — try again');
      setVoiceState('idle');
    }
  };

  const micColor = voiceState === 'recording' ? '#EF4444' : C.primary;
  const micLabel =
    voiceState === 'recording'  ? 'Recording… release when done' :
    voiceState === 'processing' ? 'Thinking…' :
    'Hold to speak';

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Add Transaction</div>

      {/* Voice button */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerCancel={stopRecording}
          disabled={voiceState === 'processing'}
          style={{
            width: 72, height: 72, borderRadius: '50%', border: 'none',
            background: voiceState === 'recording' ? '#EF4444' : voiceState === 'processing' ? C.muted : C.primary,
            color: '#FFF', cursor: voiceState === 'processing' ? 'default' : 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: voiceState === 'recording' ? '0 0 0 8px #EF444433' : '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all 0.15s',
            touchAction: 'none',
          }}
        >
          <Mic size={28} />
        </button>
        <div style={{ marginTop: 6, fontSize: 12, color: voiceState === 'recording' ? '#EF4444' : C.muted, fontWeight: 500 }}>
          {micLabel}
        </div>
        {transcript && voiceState === 'idle' && (
          <div style={{ marginTop: 6, fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
            "{transcript}"
          </div>
        )}
        {voiceError && (
          <div style={{ marginTop: 6, fontSize: 12, color: C.expense }}>{voiceError}</div>
        )}
      </div>

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
                <button onClick={() => doAdd()} style={{
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
