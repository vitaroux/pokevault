import { useState, useEffect } from "react";

// ── STORAGE ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "pokevault-v1";
const THEME_KEY = "pokevault-theme";
const defaultData = {
  hold: [
    { id: 1, name: "Pikachu & Zekrom GX", numero: "031/095", set: "Tag Bolt", langue: "JP", statut: "PSA 10", achat: 164, valeur: 300, notes: "Illustré par Mitsuhiro Arita", branche: "hold" },
    { id: 2, name: "Gengar & Mimikyu GX SA", numero: "103/095", set: "Tag Bolt", langue: "JP", statut: "AFG 9.5 → PSA en cours", achat: 600, valeur: 1200, notes: "Graal Tag Team — crack + envoi PSA", branche: "hold" },
  ],
  cn: [
    { id: 3, name: "Umbreon V", numero: "152/132", set: "9 Colors Gather", langue: "CN", statut: "CGC Pristine 10", achat: 150, valeur: 150, notes: "Marché CN niche", branche: "cn" },
    { id: 4, name: "Latias & Latios GX", numero: "175/150", set: "CSM2a", langue: "CN", statut: "PSA 10", achat: 700, valeur: 350, notes: "Marché CN — liquidité limitée", branche: "cn" },
  ],
  sealed: [
    { id: 5, name: "ETB Prismatic Evolutions", numero: "—", set: "Prismatic Evolutions", langue: "EN", statut: "Sealed", achat: 55, valeur: 117, notes: "PC Exclusif à surveiller", branche: "sealed" },
    { id: 6, name: "ETB Surging Sparks", numero: "—", set: "Surging Sparks", langue: "EN", statut: "Sealed", achat: 55, valeur: 101, notes: "En collection", branche: "sealed" },
  ],
  swing: [],
};

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : defaultData; } catch { return defaultData; }
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
function loadTheme() { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; } }

// ── THEME ─────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#060b14",
    bgGrad: "radial-gradient(ellipse at 15% 10%, rgba(99,102,241,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(245,158,11,0.05) 0%, transparent 55%)",
    surface: "rgba(255,255,255,0.03)",
    surface2: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.06)",
    border2: "rgba(255,255,255,0.1)",
    text: "#e2e8f0",
    textSub: "#64748b",
    textMuted: "#475569",
    modalBg: "#0d1520",
    inputBg: "rgba(255,255,255,0.05)",
    barBg: "#1e293b",
    tabInactive: "#475569",
  },
  light: {
    bg: "#f8fafc",
    bgGrad: "radial-gradient(ellipse at 15% 10%, rgba(99,102,241,0.05) 0%, transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(245,158,11,0.04) 0%, transparent 55%)",
    surface: "rgba(0,0,0,0.03)",
    surface2: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.08)",
    border2: "rgba(0,0,0,0.12)",
    text: "#0f172a",
    textSub: "#64748b",
    textMuted: "#94a3b8",
    modalBg: "#ffffff",
    inputBg: "rgba(0,0,0,0.04)",
    barBg: "#e2e8f0",
    tabInactive: "#94a3b8",
  },
};

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const STATUTS = ["Raw NM", "Raw LP", "PSA 10", "PSA 9", "PSA 8", "CGC Pristine 10", "CGC 10", "AFG 9.5 → PSA en cours", "En attente PSA", "Sealed", "Autre"];
const LANGUES = ["JP", "EN", "FR", "CN", "KR"];
const BRANCHES = [
  { id: "hold", label: "🏆 Hold Tag Team JP", color: "#f59e0b" },
  { id: "cn", label: "🇨🇳 Poche CN", color: "#ef4444" },
  { id: "sealed", label: "📦 Sealed ETB", color: "#60a5fa" },
  { id: "swing", label: "📈 Swing", color: "#22c55e" },
];

const fmt = (n) => (n ?? 0).toLocaleString("fr-FR") + "€";
const pct = (a, b) => a === 0 ? 0 : ((b - a) / a * 100).toFixed(1);

// ── CARDMARKET URL BUILDER ────────────────────────────────────────────────────
function buildCMUrl(card) {
  const langMap = { JP: "Japanese", EN: "English", FR: "French", CN: "Simplified Chinese", KR: "Korean" };
  const query = encodeURIComponent(`${card.name} ${card.numero || ""}`.trim());
  const lang = langMap[card.langue] || "";
  return `https://www.cardmarket.com/fr/Pokemon/Products/Singles?searchString=${query}&language=${lang}&minCondition=2`;
}

function buildEbayUrl(card) {
  const query = encodeURIComponent(`${card.name} ${card.numero || ""} ${card.langue || ""}`.trim());
  return `https://www.ebay.fr/sch/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1`;
}

// ── SPARK ─────────────────────────────────────────────────────────────────────
function Spark({ buy, current }) {
  const pts = [buy, (buy + current) / 2, current];
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const w = 60, h = 24;
  const path = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const up = current >= buy;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={path} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((current - min) / range) * h} r="2.5" fill={up ? "#22c55e" : "#ef4444"} />
    </svg>
  );
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
function Progress({ buy, current, T }) {
  const up = current >= buy;
  const prog = Math.min(100, (current / (buy * 2)) * 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: T.textSub }}>Achat : {fmt(buy)}</span>
        <span style={{ color: up ? "#22c55e" : "#ef4444", fontWeight: 700 }}>Actuel : {fmt(current)}</span>
      </div>
      <div style={{ height: 4, background: T.barBg, borderRadius: 2 }}>
        <div style={{ width: `${prog}%`, height: "100%", background: up ? "linear-gradient(90deg,#166534,#22c55e)" : "linear-gradient(90deg,#7f1d1d,#ef4444)", borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ fontSize: 10, marginTop: 3 }}>
        <span style={{ color: up ? "#22c55e" : "#ef4444" }}>{up ? "▲" : "▼"} {Math.abs(pct(buy, current))}% depuis l'achat</span>
      </div>
    </div>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ branche, card, onSave, onClose, T }) {
  const empty = { name: "", numero: "", set: "", langue: "JP", statut: "Raw NM", achat: "", valeur: "", notes: "", branche };
  const [form, setForm] = useState(card ? { ...card, achat: card.achat, valeur: card.valeur } : empty);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name && form.achat && form.valeur;

  const inp = { background: T.inputBg, border: `1px solid ${T.border2}`, borderRadius: 8, color: T.text, padding: "9px 13px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", marginTop: 5 };
  const lbl = { fontSize: 10, color: T.textSub, textTransform: "uppercase", letterSpacing: "1px" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div style={{ background: T.modalBg, border: `1px solid ${T.border2}`, borderRadius: 18, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 20 }}>{card ? "✏️ Modifier" : "➕ Ajouter une carte"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <div style={lbl}>Nom de la carte *</div>
            <input style={inp} placeholder="ex: Gengar & Mimikyu GX SA" value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div><div style={lbl}>Numéro</div><input style={inp} placeholder="103/095" value={form.numero} onChange={e => set("numero", e.target.value)} /></div>
          <div><div style={lbl}>Set</div><input style={inp} placeholder="Tag Bolt" value={form.set} onChange={e => set("set", e.target.value)} /></div>
          <div>
            <div style={lbl}>Langue</div>
            <select style={{ ...inp, cursor: "pointer" }} value={form.langue} onChange={e => set("langue", e.target.value)}>
              {LANGUES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div style={lbl}>Statut</div>
            <select style={{ ...inp, cursor: "pointer" }} value={form.statut} onChange={e => set("statut", e.target.value)}>
              {STATUTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><div style={lbl}>Prix d'achat € *</div><input style={inp} type="number" placeholder="600" value={form.achat} onChange={e => set("achat", e.target.value)} /></div>
          <div><div style={lbl}>Valeur actuelle € *</div><input style={inp} type="number" placeholder="1200" value={form.valeur} onChange={e => set("valeur", e.target.value)} /></div>
          <div style={{ gridColumn: "1/-1" }}><div style={lbl}>Notes</div><input style={inp} placeholder="Observations..." value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textSub, cursor: "pointer", fontSize: 13 }}>Annuler</button>
          <button onClick={() => valid && onSave({ ...form, id: card?.id || Date.now(), achat: parseFloat(form.achat), valeur: parseFloat(form.valeur), cible: 0 })}
            style={{ flex: 2, padding: "10px", background: valid ? "linear-gradient(135deg,#f59e0b,#f97316)" : T.barBg, border: "none", borderRadius: 8, color: valid ? "#000" : T.textMuted, fontWeight: 700, cursor: valid ? "pointer" : "default", fontSize: 13 }}>
            {card ? "Sauvegarder" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CARD ROW ──────────────────────────────────────────────────────────────────
function CardRow({ card, brancheColor, onEdit, onDelete, T }) {
  const [open, setOpen] = useState(false);
  const gain = card.valeur - card.achat;
  const gainPct = pct(card.achat, card.valeur);
  const up = gain >= 0;
  const statutColor = card.statut.includes("PSA 10") || card.statut.includes("Pristine") ? "#22c55e" :
    card.statut.includes("PSA 9") || card.statut.includes("AFG") ? "#f59e0b" :
    card.statut.includes("Sealed") ? "#60a5fa" : "#94a3b8";

  return (
    <div style={{ marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ background: open ? T.surface2 : T.surface, border: `1px solid ${open ? brancheColor + "44" : T.border}`, borderRadius: open ? "12px 12px 0 0" : 12, padding: "14px 16px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", transition: "all 0.2s" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{card.name}</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: statutColor + "22", color: statutColor, border: `1px solid ${statutColor}44`, fontWeight: 700 }}>{card.statut}</span>
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: T.surface2, color: T.textSub }}>{card.langue}</span>
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>{card.set} · {card.numero}</div>
          <Progress buy={card.achat} current={card.valeur} T={T} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <Spark buy={card.achat} current={card.valeur} />
          <div style={{ fontSize: 20, fontWeight: 800, color: up ? "#22c55e" : "#ef4444" }}>{up ? "+" : ""}{gainPct}%</div>
          <div style={{ fontSize: 12, color: up ? "#22c55e" : "#ef4444" }}>{up ? "+" : ""}{fmt(gain)}</div>
        </div>
      </div>
      {open && (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: "0 0 12px 12px", borderTop: "none", padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 14 }}>
            {[["Achat", fmt(card.achat)], ["Valeur actuelle", fmt(card.valeur)], ["P&L €", (gain >= 0 ? "+" : "") + fmt(gain)], ["ROI", (gainPct >= 0 ? "+" : "") + gainPct + "%"]].map(([k, v]) => (
              <div key={k} style={{ background: T.surface2, borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 9, color: T.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
          {card.notes && <div style={{ fontSize: 12, color: T.textSub, marginBottom: 12, fontStyle: "italic" }}>💬 {card.notes}</div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href={buildCMUrl(card)} target="_blank" rel="noopener noreferrer"
              style={{ padding: "7px 14px", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 8, color: "#60a5fa", cursor: "pointer", fontSize: 12, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              📊 Cardmarket
            </a>
            <a href={buildEbayUrl(card)} target="_blank" rel="noopener noreferrer"
              style={{ padding: "7px 14px", background: "rgba(234,179,8,0.12)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 8, color: "#eab308", cursor: "pointer", fontSize: 12, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              🔍 eBay vendus
            </a>
            <button onClick={() => onEdit(card)} style={{ padding: "7px 14px", background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textSub, cursor: "pointer", fontSize: 12 }}>✏️ Modifier</button>
            <button onClick={() => onDelete(card.id)} style={{ padding: "7px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 12 }}>🗑</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BRANCH VIEW ───────────────────────────────────────────────────────────────
function BranchView({ branche, cards, color, onAdd, onEdit, onDelete, T }) {
  const total = cards.reduce((s, c) => s + c.achat, 0);
  const valeur = cards.reduce((s, c) => s + c.valeur, 0);
  const gain = valeur - total;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[["Investi", fmt(total), "#60a5fa"], ["Valeur actuelle", fmt(valeur), T.text], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain), gain >= 0 ? "#22c55e" : "#ef4444"]].map(([k, v, c]) => (
          <div key={k} style={{ flex: "1 1 130px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14 }}>Aucune carte dans cette branche</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Clique sur + Ajouter pour commencer</div>
        </div>
      ) : cards.map(card => <CardRow key={card.id} card={card} brancheColor={color} onEdit={onEdit} onDelete={onDelete} T={T} />)}
      <button onClick={onAdd} style={{ width: "100%", marginTop: 12, padding: "12px", background: T.surface, border: `1px dashed ${color}55`, borderRadius: 12, color, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
        + Ajouter une carte
      </button>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ data, T }) {
  const all = [...data.hold, ...data.cn, ...data.sealed, ...data.swing];
  const totalInvesti = all.reduce((s, c) => s + c.achat, 0);
  const totalValeur = all.reduce((s, c) => s + c.valeur, 0);
  const gain = totalValeur - totalInvesti;
  const roi = pct(totalInvesti, totalValeur);

  const branchStats = BRANCHES.map(b => {
    const cards = data[b.id] || [];
    const inv = cards.reduce((s, c) => s + c.achat, 0);
    const val = cards.reduce((s, c) => s + c.valeur, 0);
    return { ...b, cards: cards.length, investi: inv, valeur: val, gain: val - inv };
  });

  const topCards = [...all].sort((a, b) => pct(b.achat, b.valeur) - pct(a.achat, a.valeur)).slice(0, 3);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[["Total investi", fmt(totalInvesti), "#60a5fa"], ["Valeur portefeuille", fmt(totalValeur), T.text], ["P&L global", (gain >= 0 ? "+" : "") + fmt(gain), gain >= 0 ? "#22c55e" : "#ef4444"], ["ROI", (roi >= 0 ? "+" : "") + roi + "%", roi >= 0 ? "#22c55e" : "#ef4444"], ["Nb cartes", all.length, "#a78bfa"]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>{k}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 12, color: T.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Répartition par branche</div>
          {branchStats.map(b => {
            const p = totalInvesti > 0 ? (b.investi / totalInvesti * 100) : 0;
            return (
              <div key={b.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: b.color }}>{b.label}</span>
                  <span style={{ color: T.textSub }}>{b.cards} carte{b.cards > 1 ? "s" : ""} · {fmt(b.investi)}</span>
                </div>
                <div style={{ height: 5, background: T.barBg, borderRadius: 3 }}>
                  <div style={{ width: `${p}%`, height: "100%", background: b.color, borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 12, color: T.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>🏆 Top performers</div>
          {topCards.length === 0 ? <div style={{ color: T.textMuted, fontSize: 13 }}>Aucune carte</div> : topCards.map((c, i) => {
            const g = pct(c.achat, c.valeur);
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 16 }}>{"🥇🥈🥉"[i]}</span>
                <div style={{ flex: 1, fontSize: 12, color: T.text }}>{c.name}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: parseFloat(g) >= 0 ? "#22c55e" : "#ef4444" }}>{g >= 0 ? "+" : ""}{g}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 12, color: T.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Performance par branche</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {branchStats.map(b => (
            <div key={b.id} style={{ background: `${b.color}11`, border: `1px solid ${b.color}33`, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: b.color, fontWeight: 700, marginBottom: 8 }}>{b.label}</div>
              <div style={{ fontSize: 13, color: T.text, marginBottom: 2 }}>{fmt(b.valeur)}</div>
              <div style={{ fontSize: 11, color: b.gain >= 0 ? "#22c55e" : "#ef4444" }}>{b.gain >= 0 ? "+" : ""}{fmt(b.gain)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const T = THEMES[theme];

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch {} }, [theme]);

  function handleSave(card) {
    const b = card.branche;
    setData(prev => {
      const list = prev[b] || [];
      const exists = list.find(c => c.id === card.id);
      return { ...prev, [b]: exists ? list.map(c => c.id === card.id ? card : c) : [...list, card] };
    });
    setModal(null);
  }

  function handleDelete(branche, id) {
    setData(prev => ({ ...prev, [branche]: prev[branche].filter(c => c.id !== id) }));
  }

  const tabs = [{ id: "dashboard", label: "📊 Dashboard" }, ...BRANCHES.map(b => ({ id: b.id, label: b.label }))];
  const activeBranche = BRANCHES.find(b => b.id === activeTab);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ minHeight: "100vh", background: T.bg, backgroundImage: T.bgGrad, fontFamily: "'Outfit', sans-serif", color: T.text, transition: "background 0.3s, color 0.3s" }}>

        {/* HEADER */}
        <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, boxShadow: "0 0 18px rgba(245,158,11,0.35)" }}>⚡</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-0.5px" }}>PokéVault</div>
              <div style={{ fontSize: 10, color: T.textSub, letterSpacing: "2px", textTransform: "uppercase" }}>Collection Manager</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              style={{ padding: "7px 14px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
              {theme === "dark" ? "☀️ Clair" : "🌙 Sombre"}
            </button>
            {activeBranche && (
              <button onClick={() => setModal({ branche: activeTab })} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#f59e0b,#f97316)", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 13, boxShadow: "0 4px 14px rgba(245,158,11,0.25)" }}>
                + Ajouter
              </button>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 2, padding: "0 24px", borderBottom: `1px solid ${T.border}`, overflowX: "auto" }}>
          {tabs.map(t => {
            const b = BRANCHES.find(b => b.id === t.id);
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "12px 16px", fontSize: 12, fontWeight: active ? 700 : 500, color: active ? (b?.color || "#f59e0b") : T.tabInactive, background: "none", border: "none", borderBottom: `2px solid ${active ? (b?.color || "#f59e0b") : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div style={{ padding: "20px 24px", opacity: mounted ? 1 : 0, transition: "opacity 0.4s" }}>
          {activeTab === "dashboard" && <Dashboard data={data} T={T} />}
          {BRANCHES.map(b => activeTab === b.id && (
            <BranchView key={b.id} branche={b.id} cards={data[b.id] || []} color={b.color} T={T}
              onAdd={() => setModal({ branche: b.id })}
              onEdit={card => setModal({ branche: b.id, card })}
              onDelete={id => handleDelete(b.id, id)}
            />
          ))}
        </div>

        {modal && <Modal branche={modal.branche} card={modal.card} onSave={handleSave} onClose={() => setModal(null)} T={T} />}
      </div>
    </>
  );
}
