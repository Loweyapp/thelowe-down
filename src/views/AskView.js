import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, Key, X } from 'lucide-react';
import { C, getBudgetForMonth, mkKey, mkLabel, todayStr } from '../constants.js';

function buildContext(txs, cats) {
  const now    = todayStr();
  const cutoff = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);
  const recent = txs.filter(t => t.date >= cutoff);

  const months = {};
  recent.forEach(t => {
    const m = t.date.slice(0, 7);
    if (!months[m]) months[m] = { income: 0, expense: 0, saving: 0, investment: 0, cats: {} };
    months[m][t.type] = (months[m][t.type] || 0) + Math.abs(t.amount);
    if (t.type === 'expense')
      months[m].cats[t.category] = (months[m].cats[t.category] || 0) + Math.abs(t.amount);
  });

  const monthlySummary = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => {
      const catLine = Object.entries(d.cats)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amt]) => `${cat} £${amt.toFixed(2)}`)
        .join(', ');
      return `${mkLabel(month)}: income £${d.income.toFixed(2)}, expenses £${d.expense.toFixed(2)}, saving £${d.saving.toFixed(2)}, investment £${d.investment.toFixed(2)}${catLine ? ` [${catLine}]` : ''}`;
    })
    .join('\n');

  const thisMonth  = mkKey(now);
  const budgetLines = cats.map(c => `${c.name}: £${getBudgetForMonth(c, thisMonth).toFixed(2)}/mo`).join(', ');

  const recentTxLines = txs.slice(0, 30)
    .map(t => `${t.date} ${t.type} ${t.category || ''} £${Math.abs(t.amount).toFixed(2)} "${t.description}"${t.account ? ` (${t.account})` : ''}`)
    .join('\n');

  return `Today: ${now}\n\nMonthly budgets: ${budgetLines}\n\n6-month summary:\n${monthlySummary || 'No transactions yet.'}\n\nRecent transactions (newest first):\n${recentTxLines || 'None.'}`;
}

const SUGGESTIONS = [
  'How much did I spend last month?',
  'Which category am I most over budget?',
  'How does this month compare to last month?',
  'What were my biggest expenses recently?',
];

// Lightweight markdown for assistant replies: **bold**, "- " / "1. " lists,
// "#" headings, paragraphs. Claude's answers read as raw asterisks/dashes
// without this since messages render as plain pre-wrap text otherwise.
function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    : <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
  );
}

function Markdown({ text }) {
  const lines  = text.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (/^\s*[-*•]\s+/.test(lines[i])) {
      const items = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*•]\s+/, '')); i++; }
      blocks.push({ type: 'ul', items });
    } else if (/^\s*\d+[.)]\s+/.test(lines[i])) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i++; }
      blocks.push({ type: 'ol', items });
    } else if (/^#{1,3}\s+/.test(lines[i])) {
      blocks.push({ type: 'h', text: lines[i].replace(/^#{1,3}\s+/, '') });
      i++;
    } else if (lines[i].trim() === '') {
      i++;
    } else {
      const paraLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !/^\s*[-*•]\s+/.test(lines[i]) && !/^\s*\d+[.)]\s+/.test(lines[i]) && !/^#{1,3}\s+/.test(lines[i])) {
        paraLines.push(lines[i]); i++;
      }
      blocks.push({ type: 'p', text: paraLines.join(' ') });
    }
  }

  return blocks.map((b, bi) => {
    if (b.type === 'ul') return <ul key={bi} style={{ margin: '4px 0', paddingLeft: 20 }}>{b.items.map((it, ii) => <li key={ii} style={{ marginBottom: 3 }}>{renderInline(it, `${bi}-${ii}`)}</li>)}</ul>;
    if (b.type === 'ol') return <ol key={bi} style={{ margin: '4px 0', paddingLeft: 20 }}>{b.items.map((it, ii) => <li key={ii} style={{ marginBottom: 3 }}>{renderInline(it, `${bi}-${ii}`)}</li>)}</ol>;
    if (b.type === 'h')  return <div key={bi} style={{ fontWeight: 700, marginTop: bi ? 10 : 0, marginBottom: 3 }}>{renderInline(b.text, `${bi}`)}</div>;
    return <div key={bi} style={{ marginBottom: bi < blocks.length - 1 ? 8 : 0 }}>{renderInline(b.text, `${bi}`)}</div>;
  });
}

export default function AskView({ txs, cats, anthropicKey, saveAnthropicKey }) {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [listening,    setListening]    = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [keyDraft,     setKeyDraft]     = useState('');
  const bottomRef = useRef(null);
  const recogRef  = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async text => {
    const q = text.trim();
    if (!q || loading) return;
    if (!anthropicKey) { setShowKeyPanel(true); return; }

    const history = [...messages, { role: 'user', text: q }];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: `You are a personal finance assistant for The LoweDown app. Answer questions concisely using the data provided. Use £ for currency. Be specific with numbers. If asked about something not in the data, say so. Format for readability: **bold** key figures, use "- " bullet lists for breakdowns of more than 2 items.\n\n${buildContext(txs, cats)}`,
          messages: history.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setMessages(m => [...m, { role: 'assistant', text: data.content?.[0]?.text || 'No response received.' }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: `Sorry, I couldn't get a response. ${err.message || 'Check your API key.'}` }]);
    }
    setLoading(false);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = 'en-GB';
    r.interimResults = false;
    r.onresult = e => send(e.results[0][0].transcript);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };

  const saveKey = () => {
    if (!keyDraft.trim()) return;
    saveAnthropicKey(keyDraft.trim());
    setShowKeyPanel(false);
    setKeyDraft('');
    inputRef.current?.focus();
  };

  const SR_AVAILABLE = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 720 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color={C.primary} />
            <span style={{ fontSize: 22, fontWeight: 700 }}>Ask</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Ask questions about your finances</div>
        </div>
        <button onClick={() => { setShowKeyPanel(p => !p); setKeyDraft(anthropicKey); }} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 8, border: `1px solid ${C.border}`, background: 'transparent',
          cursor: 'pointer', color: anthropicKey ? C.primary : C.muted, fontSize: 12,
          fontFamily: "'Outfit', sans-serif",
        }}>
          <Key size={13} />{anthropicKey ? 'API key set' : 'Set API key'}
        </button>
      </div>

      {/* API key panel */}
      {showKeyPanel && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 16, marginBottom: 16, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Anthropic API key</div>
            <button onClick={() => setShowKeyPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              placeholder="sk-ant-..."
              autoFocus
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 8, border: `1px solid ${C.border}`,
                fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: 'none',
              }}
            />
            <button onClick={saveKey} style={{
              padding: '9px 16px', borderRadius: 8, border: 'none', background: C.primary,
              color: '#FFF', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              fontFamily: "'Outfit', sans-serif",
            }}>Save</button>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
            Saved to your account — works on all devices automatically.
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8, minHeight: 0 }}>

        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Try asking:</div>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                textAlign: 'left', padding: '10px 14px', borderRadius: 10,
                border: `1px solid ${C.border}`, background: C.card, cursor: 'pointer',
                fontSize: 13, color: C.text, fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                background: `${C.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={13} color={C.primary} />
              </div>
            )}
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: 14,
              background: msg.role === 'user' ? C.primary : C.card,
              color:      msg.role === 'user' ? '#FFF'    : C.text,
              border:     msg.role === 'user' ? 'none'    : `1px solid ${C.border}`,
              fontSize: 14, lineHeight: 1.55,
              borderBottomRightRadius: msg.role === 'user' ? 4 : 14,
              borderBottomLeftRadius:  msg.role === 'user' ? 14 : 4,
            }}>
              {msg.role === 'assistant' ? <Markdown text={msg.text} /> : <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 2,
              background: `${C.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={13} color={C.primary} />
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: 14, borderBottomLeftRadius: 4,
              background: C.card, border: `1px solid ${C.border}`,
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: C.muted,
                  animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 12, flexShrink: 0, borderTop: `1px solid ${C.border}` }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          placeholder="Ask about your finances…"
          disabled={loading}
          style={{
            flex: 1, padding: '11px 14px', borderRadius: 12,
            border: `1px solid ${C.border}`, fontSize: 14,
            fontFamily: "'Outfit', sans-serif", outline: 'none',
            background: loading ? C.bg : '#FFF',
          }}
        />
        {SR_AVAILABLE && (
          <button onClick={toggleVoice} style={{
            width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: listening ? '#FEF2F2' : C.bg,
            color:      listening ? C.expense  : C.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
        <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{
          width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: input.trim() && !loading ? C.primary : C.bg,
          color:      input.trim() && !loading ? '#FFF'    : C.muted,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.12s',
        }}>
          <Send size={17} />
        </button>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}
