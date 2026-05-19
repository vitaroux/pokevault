import { useState, useEffect } from "react";

const STORAGE_KEY = "pokevault-v1";
const THEME_KEY = "pokevault-theme";
const defaultData = {
  hold: [
    { id: 1, name: "Pikachu & Zekrom GX", numero: "031/095", set: "Tag Bolt", langue: "JP", statut: "PSA 10", achat: 164, valeur: 300, notes: "Illustré par Mitsuhiro Arita", branche: "hold" },
    { id: 2, name: "Gengar & Mimikyu GX SA", numero: "103/095", set: "Tag Bolt", langue: "JP", statut: "AFG 9.5 → PSA en cours", achat: 600, valeur: 1200, notes: "Graal Tag Team — crack + envoi PSA", branche: "hold" },
    { id: 10, name: "Pikachu & Zekrom GX", numero: "031/095", set: "Tag Bolt JP", langue: "JP", statut: "PSA 10", achat: 161.19, valeur: 161.19, notes: "En transit", branche: "hold" },
    { id: 11, name: "Reshiram & Charizard GX", numero: "016/173", set: "Tag All Stars", langue: "JP", statut: "PSA 10", achat: 87.69, valeur: 87.69, notes: "En transit", branche: "hold" },
    { id: 12, name: "Lugia", numero: "249", set: "Neo Genesis Gold Silver to a New World", langue: "JP", statut: "Raw NM", achat: 299.25, valeur: 299.25, notes: "Vintage JP — hold long terme", branche: "hold" },
  ],
  cn: [
    { id: 3, name: "Umbreon V", numero: "152/132", set: "9 Colors Gather", langue: "CN", statut: "CGC Pristine 10", achat: 150, valeur: 150, notes: "Marché CN niche", branche: "cn" },
    { id: 4, name: "Latias & Latios GX", numero: "175/150", set: "CSM2a", langue: "CN", statut: "PSA 10", achat: 700, valeur: 350, notes: "Marché CN — liquidité limitée", branche: "cn" },
    { id: 13, name: "Noctali (Umbreon)", numero: "06/15", set: "Chinese Gem Pack Vol. 2 CBB2C", langue: "CN", statut: "En transit", achat: 126.50, valeur: 126.50, notes: "Poche CN — en cours d'acheminement", branche: "cn" },
    { id: 14, name: "Noctali (Umbreon)", numero: "06/15", set: "Chinese Gem Pack Vol. 2 CBB2C", langue: "CN", statut: "En transit", achat: 131.75, valeur: 131.75, notes: "Poche CN — en cours d'acheminement", branche: "cn" },
    { id: 15, name: "Pikachu & Zekrom GX", numero: "166", set: "CSM2aC", langue: "CN", statut: "PSA 9", achat: 183.75, valeur: 183.75, notes: "Poche CN", branche: "cn" },
  ],
  sealed: [
    { id: 5, name: "ETB Prismatic Evolutions", numero: "—", set: "Prismatic Evolutions", langue: "EN", statut: "Sealed", achat: 55, valeur: 117, notes: "PC Exclusif à surveiller", branche: "sealed" },
    { id: 6, name: "ETB Surging Sparks", numero: "—", set: "Surging Sparks", langue: "EN", statut: "Sealed", achat: 55, valeur: 101, notes: "En collection", branche: "sealed" },
  ],
  swing: [
    { id: 20, name: "Latias GG20", numero: "GG20", set: "Crown Zenith", langue: "FR", statut: "Raw NM", achat: 21.43, valeur: 21.43, notes: "Swing FR", branche: "swing" },
    { id: 21, name: "Mew EX Gold", numero: "205/165", set: "151 (EV3.5)", langue: "FR", statut: "Raw NM", achat: 32.24, valeur: 32.24, notes: "Swing FR", branche: "swing" },
    { id: 22, name: "Dracaufeu VMAX", numero: "261", set: "—", langue: "FR", statut: "PSA ?", achat: 87.69, valeur: 87.69, notes: "Gradé — vérifier numéro exact", branche: "swing" },
    { id: 23, name: "Pikachu GG30", numero: "GG30", set: "Zénith Suprême", langue: "FR", statut: "PSA 9", achat: 61.44, valeur: 61.44, notes: "Swing FR", branche: "swing" },
    { id: 24, name: "Ectoplasma (Gengar)", numero: "157/264", set: "—", langue: "FR", statut: "PSA ?", achat: 161.99, valeur: 161.99, notes: "Gradé", branche: "swing" },
    { id: 25, name: "Sulfura ex Team Rocket", numero: "—", set: "Rivaux Destinés", langue: "FR", statut: "PSA ?", achat: 77.99, valeur: 77.99, notes: "Swing FR", branche: "swing" },
    { id: 26, name: "Pikachu CRZ 160", numero: "160", set: "Crown Zenith", langue: "FR", statut: "Raw NM", achat: 71.94, valeur: 71.94, notes: "Swing FR", branche: "swing" },
    { id: 27, name: "Pikachu VMAX TG17", numero: "TG17", set: "Lost Origin", langue: "FR", statut: "Raw NM", achat: 77.19, valeur: 77.19, notes: "Swing FR", branche: "swing" },
    { id: 28, name: "Pikachu VMAX", numero: "—", set: "—", langue: "FR", statut: "PSA 10", achat: 318.69, valeur: 318.69, notes: "Swing — PSA 10", branche: "swing" },
    { id: 29, name: "Mew Ryota Murayama", numero: "—", set: "—", langue: "FR", statut: "Raw NM", achat: 66.89, valeur: 66.89, notes: "Swing FR", branche: "swing" },
    { id: 30, name: "Dracaufeu Alt Art", numero: "234/091", set: "Destinées de Paldea", langue: "FR", statut: "Raw NM", achat: 197.94, valeur: 197.94, notes: "Swing FR", branche: "swing" },
    { id: 31, name: "Mew Point Fusion", numero: "—", set: "Poing de Fusion", langue: "FR", statut: "Raw NM", achat: 46.49, valeur: 46.49, notes: "Swing FR", branche: "swing" },
    { id: 32, name: "Reshiram & Charizard GX PSA 10", numero: "—", set: "—", langue: "JP", statut: "Retour initié", achat: 132.25, valeur: 132.25, notes: "⚠️ Retour en cours", branche: "swing" },
  ],
  autres: [
    { id: 40, name: "Son Gohan Childhood", numero: "FB08-106", set: "Dragon Ball Super", langue: "JP", statut: "En transit", achat: 47.75, valeur: 47.75, notes: "DBS — en cours", branche: "autres" },
    { id: 41, name: "Son Goku Alt Art", numero: "BT13-123", set: "Dragon Ball Super", langue: "JP", statut: "PSA 10", achat: 162.75, valeur: 162.75, notes: "DBS PSA 10 JP", branche: "autres" },
    { id: 42, name: "Son Goku", numero: "FB01-139", set: "Dragon Ball Super Fusion World", langue: "JP", statut: "En transit", achat: 47.09, valeur: 47.09, notes: "DBS — en cours", branche: "autres" },
    { id: 43, name: "Enel", numero: "—", set: "One Piece", langue: "JP", statut: "Gradé", achat: 89.25, valeur: 89.25, notes: "One Piece gradé", branche: "autres" },
    { id: 44, name: "Boa Hancock Alt Art", numero: "OP01-078", set: "One Piece OP01", langue: "JP", statut: "PSA ?", achat: 404.25, valeur: 404.25, notes: "One Piece — alt art", branche: "autres" },
    { id: 45, name: "Boa Hancock Alt Art", numero: "—", set: "One Piece", langue: "JP", statut: "PSA 10", achat: 141.75, valeur: 141.75, notes: "One Piece PSA 10 JP", branche: "autres" },
    { id: 46, name: "Boa Hancock SP SR", numero: "OP12-014", set: "One Piece OP12", langue: "JP", statut: "Raw NM", achat: 224.19, valeur: 224.19, notes: "One Piece SP SR", branche: "autres" },
    { id: 47, name: "Vinsmoke Sanji", numero: "—", set: "One Piece", langue: "JP", statut: "Raw NM", achat: 36.75, valeur: 36.75, notes: "One Piece", branche: "autres" },
    { id: 48, name: "Boa Hancock SP", numero: "OP07-051", set: "One Piece OP07", langue: "JP", statut: "CGC Pristine 10", achat: 321.14, valeur: 321.14, notes: "⚠️ Problème livraison", branche: "autres" },
    { id: 49, name: "Tortank Alt Art", numero: "200/165", set: "151 (EV3.5)", langue: "FR", statut: "En transit", achat: 161.08, valeur: 161.08, notes: "En cours d'acheminement", branche: "autres" },
  ],
};

function loadData() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : defaultData; } catch { return defaultData; } }
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
function loadTheme() { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; } }

const THEMES = {
  dark: { bg: "#07090f", bgGrad: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.12) 0%, transparent 50%)", surface: "#111827", surface2: "#1a2235", border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)", text: "#f1f5f9", textSub: "#64748b", textMuted: "#374151", modalBg: "#0d1117", inputBg: "#1a2235", barBg: "#1e293b", navBg: "#0d1117", isDark: true },
  light: { bg: "#f1f5f9", bgGrad: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.06) 0%, transparent 50%)", surface: "#ffffff", surface2: "#f8fafc", border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.12)", text: "#0f172a", textSub: "#64748b", textMuted: "#94a3b8", modalBg: "#ffffff", inputBg: "#f1f5f9", barBg: "#e2e8f0", navBg: "#ffffff", isDark: false },
};

const STATUTS = ["Raw NM", "Raw LP", "PSA 10", "PSA 9", "PSA 8", "CGC Pristine 10", "CGC 10", "AFG 9.5 → PSA en cours", "En attente PSA", "En transit", "Retour initié", "Sealed", "Autre"];
const LANGUES = ["JP", "EN", "FR", "CN", "KR", "Autre"];
const BRANCHES = [
  { id: "hold", label: "Hold JP", icon: "🏆", color: "#f59e0b" },
  { id: "cn", label: "Poche CN", icon: "🀄", color: "#ef4444" },
  { id: "sealed", label: "Sealed", icon: "📦", color: "#60a5fa" },
  { id: "swing", label: "Swing", icon: "📈", color: "#22c55e" },
  { id: "autres", label: "Autres TCG", icon: "🃏", color: "#a78bfa" },
];
const NAV = [
  { id: "dashboard", icon: "⚡", label: "Accueil" },
  { id: "hold", icon: "🏆", label: "Hold JP" },
  { id: "cn", icon: "🀄", label: "CN" },
  { id: "sealed", icon: "📦", label: "Sealed" },
  { id: "swing", icon: "📈", label: "Swing" },
  { id: "autres", icon: "🃏", label: "Autres" },
];

const fmt = (n) => { const v = Math.abs(n ?? 0); if (v >= 1000) return ((n < 0 ? "-" : "") + (v / 1000).toFixed(1).replace(".0", "") + "k€"); return (n ?? 0).toLocaleString("fr-FR") + "€"; };
const pct = (a, b) => a === 0 ? 0 : ((b - a) / a * 100).toFixed(1);
const buildCMUrl = (card) => `https://www.cardmarket.com/fr/Pokemon/Products/Singles?searchString=${encodeURIComponent(card.name + " " + (card.numero || ""))}&language=${{ JP: "Japanese", EN: "English", FR: "French", CN: "Simplified Chinese", KR: "Korean" }[card.langue] || ""}&minCondition=2`;
const buildEbayUrl = (card) => `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(card.name + " " + (card.numero || "") + " " + (card.langue || ""))}&LH_Sold=1&LH_Complete=1`;

function Modal({ branche, card, onSave, onClose, T }) {
  const empty = { name: "", numero: "", set: "", langue: "JP", statut: "Raw NM", achat: "", valeur: "", notes: "", branche };
  const [form, setForm] = useState(card ? { ...card } : empty);
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name && form.achat && form.valeur;
  const inp = { background: T.inputBg, border: `1px solid ${T.border2}`, borderRadius: 12, color: T.text, padding: "14px", fontSize: 15, outline: "none", width: "100%", WebkitAppearance: "none", fontFamily: "inherit" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }} onClick={onClose}>
      <div style={{ background: T.modalBg, borderRadius: "24px 24px 0 0", padding: "20px 20px 44px", width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: T.border2, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 18 }}>{card ? "Modifier" : "Nouvelle carte"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inp} placeholder="Nom de la carte *" value={form.name} onChange={e => s("name", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input style={inp} placeholder="Numéro" value={form.numero} onChange={e => s("numero", e.target.value)} />
            <input style={inp} placeholder="Set" value={form.set} onChange={e => s("set", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select style={{ ...inp, cursor: "pointer" }} value={form.langue} onChange={e => s("langue", e.target.value)}>{LANGUES.map(l => <option key={l}>{l}</option>)}</select>
            <select style={{ ...inp, cursor: "pointer" }} value={form.statut} onChange={e => s("statut", e.target.value)}>{STATUTS.map(st => <option key={st}>{st}</option>)}</select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input style={inp} type="number" placeholder="Prix achat €" value={form.achat} onChange={e => s("achat", e.target.value)} />
            <input style={inp} type="number" placeholder="Valeur actuelle €" value={form.valeur} onChange={e => s("valeur", e.target.value)} />
          </div>
          <input style={inp} placeholder="Notes..." value={form.notes} onChange={e => s("notes", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "15px", background: T.surface2, border: "none", borderRadius: 14, color: T.textSub, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>Annuler</button>
          <button onClick={() => valid && onSave({ ...form, id: card?.id || Date.now(), achat: parseFloat(form.achat), valeur: parseFloat(form.valeur), cible: 0 })}
            style={{ flex: 2, padding: "15px", background: valid ? "linear-gradient(135deg,#f59e0b,#f97316)" : T.barBg, border: "none", borderRadius: 14, color: valid ? "#000" : T.textSub, fontWeight: 800, cursor: valid ? "pointer" : "default", fontSize: 15, fontFamily: "inherit" }}>
            {card ? "Sauvegarder" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CardItem({ card, brancheColor, onEdit, onDelete, T }) {
  const [open, setOpen] = useState(false);
  const gain = card.valeur - card.achat;
  const gainPct = parseFloat(pct(card.achat, card.valeur));
  const up = gain >= 0;
  const sc = card.statut.includes("PSA 10") || card.statut.includes("Pristine") ? "#22c55e" : card.statut.includes("PSA 9") || card.statut.includes("AFG") ? "#f59e0b" : card.statut.includes("Sealed") ? "#60a5fa" : "#94a3b8";
  return (
    <div style={{ marginBottom: 10, borderRadius: 18, overflow: "hidden", border: `1px solid ${open ? brancheColor + "44" : T.border}`, background: T.surface, transition: "border 0.2s" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ width: 4, height: 48, borderRadius: 2, background: up ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: sc + "20", color: sc, fontWeight: 700, border: `1px solid ${sc}30`, flexShrink: 0 }}>{card.statut}</span>
            <span style={{ fontSize: 11, color: T.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.langue} · {card.set}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: up ? "#22c55e" : "#ef4444", letterSpacing: "-0.5px" }}>{up ? "+" : ""}{gainPct}%</div>
          <div style={{ fontSize: 12, color: up ? "#22c55e" : "#ef4444" }}>{up ? "+" : ""}{fmt(gain)}</div>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[["Achat", fmt(card.achat)], ["Actuel", fmt(card.valeur)], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain)], ["ROI", (gainPct >= 0 ? "+" : "") + gainPct + "%"]].map(([k, v]) => (
              <div key={k} style={{ background: T.surface2, borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 5, background: T.barBg, borderRadius: 3, marginBottom: 14 }}>
            <div style={{ width: `${Math.min(100, (card.valeur / (card.achat * 2)) * 100)}%`, height: "100%", background: up ? "linear-gradient(90deg,#166534,#22c55e)" : "linear-gradient(90deg,#7f1d1d,#ef4444)", borderRadius: 3 }} />
          </div>
          {card.notes && <div style={{ fontSize: 13, color: T.textSub, marginBottom: 14, padding: "10px 12px", background: T.surface2, borderRadius: 10, fontStyle: "italic" }}>{card.notes}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <a href={buildCMUrl(card)} target="_blank" rel="noopener noreferrer" style={{ padding: "12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, color: "#60a5fa", fontSize: 13, textDecoration: "none", fontWeight: 600, textAlign: "center", display: "block" }}>📊 Cardmarket</a>
            <a href={buildEbayUrl(card)} target="_blank" rel="noopener noreferrer" style={{ padding: "12px", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 12, color: "#eab308", fontSize: 13, textDecoration: "none", fontWeight: 600, textAlign: "center", display: "block" }}>🔍 eBay vendus</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => onEdit(card)} style={{ padding: "12px", background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.textSub, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>✏️ Modifier</button>
            <button onClick={() => onDelete(card.id)} style={{ padding: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>🗑 Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchView({ branche, cards, color, onEdit, onDelete, T }) {
  const total = cards.reduce((s, c) => s + c.achat, 0);
  const valeur = cards.reduce((s, c) => s + c.valeur, 0);
  const gain = valeur - total;
  const roi = parseFloat(pct(total, valeur));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Investi", fmt(total), "#60a5fa"], ["Valeur", fmt(valeur), T.text], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain), gain >= 0 ? "#22c55e" : "#ef4444"]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: T.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{k}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "12px 16px", background: T.surface, borderRadius: 14, border: `1px solid ${T.border}` }}>
          <span style={{ fontSize: 22 }}>{roi >= 0 ? "📈" : "📉"}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: roi >= 0 ? "#22c55e" : "#ef4444" }}>ROI {roi >= 0 ? "+" : ""}{roi}%</span>
          <span style={{ fontSize: 12, color: T.textSub, marginLeft: "auto" }}>{cards.length} carte{cards.length > 1 ? "s" : ""}</span>
        </div>
      )}
      {cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: T.textSub }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📭</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 6 }}>Aucune carte</div>
          <div style={{ fontSize: 14 }}>Appuie sur + pour en ajouter</div>
        </div>
      ) : cards.map(card => <CardItem key={card.id} card={card} brancheColor={color} onEdit={onEdit} onDelete={onDelete} T={T} />)}
    </div>
  );
}

function Dashboard({ data, T }) {
  const all = [...data.hold, ...data.cn, ...data.sealed, ...data.swing, ...(data.autres || [])];
  const inv = all.reduce((s, c) => s + c.achat, 0);
  const val = all.reduce((s, c) => s + c.valeur, 0);
  const gain = val - inv;
  const roi = parseFloat(pct(inv, val));
  const branchStats = BRANCHES.map(b => { const cards = data[b.id] || []; const i = cards.reduce((s, c) => s + c.achat, 0); const v = cards.reduce((s, c) => s + c.valeur, 0); return { ...b, count: cards.length, investi: i, valeur: v, gain: v - i }; });
  const top = [...all].sort((a, b) => parseFloat(pct(b.achat, b.valeur)) - parseFloat(pct(a.achat, a.valeur))).slice(0, 3);
  return (
    <div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#131d35,#0f1624)", borderRadius: 22, padding: "24px 20px", marginBottom: 20, border: "1px solid rgba(99,102,241,0.2)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.12),transparent)" }} />
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 6 }}>Portefeuille total</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-1px", marginBottom: 8 }}>{fmt(val)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: gain >= 0 ? "#22c55e" : "#ef4444" }}>{gain >= 0 ? "▲ +" : "▼ "}{fmt(gain)}</span>
          <span style={{ fontSize: 12, color: "#475569" }}>vs {fmt(inv)} investi</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: (roi >= 0 ? "rgba(34,197,94," : "rgba(239,68,68,") + "0.15)", padding: "6px 14px", borderRadius: 20, border: `1px solid ${(roi >= 0 ? "rgba(34,197,94," : "rgba(239,68,68,") + "0.3)"}` }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: roi >= 0 ? "#22c55e" : "#ef4444" }}>ROI {roi >= 0 ? "+" : ""}{roi}% · {all.length} cartes</span>
        </div>
      </div>

      {/* Branches scroll */}
      <div style={{ fontSize: 12, color: T.textSub, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Branches</div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, marginBottom: 22, scrollbarWidth: "none" }}>
        {branchStats.map(b => (
          <div key={b.id} style={{ flexShrink: 0, width: 148, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 14px", borderTop: `3px solid ${b.color}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: b.color, marginBottom: 10 }}>{b.icon} {b.label}</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: T.text, marginBottom: 3, letterSpacing: "-0.5px" }}>{fmt(b.valeur)}</div>
            <div style={{ fontSize: 13, color: b.gain >= 0 ? "#22c55e" : "#ef4444", marginBottom: 4 }}>{b.gain >= 0 ? "+" : ""}{fmt(b.gain)}</div>
            <div style={{ fontSize: 11, color: T.textSub }}>{b.count} carte{b.count > 1 ? "s" : ""}</div>
          </div>
        ))}
      </div>

      {/* Top performers */}
      <div style={{ fontSize: 12, color: T.textSub, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Top performers</div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
        {top.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: T.textSub, fontSize: 14 }}>Aucune carte</div>
        ) : top.map((c, i) => {
          const g = parseFloat(pct(c.achat, c.valeur));
          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderBottom: i < top.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize: 24, width: 30, textAlign: "center", flexShrink: 0 }}>{["🥇", "🥈", "🥉"][i]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: T.textSub }}>{c.set} · {c.langue}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: g >= 0 ? "#22c55e" : "#ef4444" }}>{g >= 0 ? "+" : ""}{g}%</div>
                <div style={{ fontSize: 11, color: T.textSub }}>{fmt(c.valeur)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[["Cartes", all.length, "#a78bfa"], ["Investi", fmt(inv), "#60a5fa"], ["Hausses", all.filter(c => c.valeur > c.achat).length + "/" + all.length, "#22c55e"]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{k}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState(loadTheme);
  const [showReset, setShowReset] = useState(false);
  const T = THEMES[theme];

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch {} }, [theme]);

  function handleSave(card) {
    const b = card.branche;
    setData(prev => { const list = prev[b] || []; const exists = list.find(c => c.id === card.id); return { ...prev, [b]: exists ? list.map(c => c.id === card.id ? card : c) : [...list, card] }; });
    setModal(null);
  }

  function handleDelete(branche, id) { setData(prev => ({ ...prev, [branche]: (prev[branche] || []).filter(c => c.id !== id) })); }

  function handleReset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setData(defaultData);
    setShowReset(false);
  }

  const activeBranche = BRANCHES.find(b => b.id === activeTab);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } body { margin: 0; padding: 0; overscroll-behavior: none; } ::-webkit-scrollbar { display: none; } input, select { font-family: inherit; } select option { background: #1a2235; color: #f1f5f9; }`}</style>

      <div style={{ minHeight: "100dvh", background: T.bg, backgroundImage: T.bgGrad, fontFamily: "'Outfit', sans-serif", color: T.text, paddingBottom: 84 }}>
        {/* HEADER */}
        <div style={{ padding: "56px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(135deg,#f59e0b,#ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, boxShadow: "0 4px 14px rgba(245,158,11,0.4)" }}>⚡</div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.5px", lineHeight: 1.1 }}>PokéVault</div>
              <div style={{ fontSize: 10, color: T.textSub, letterSpacing: "2px", textTransform: "uppercase" }}>Collection</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ width: 40, height: 40, borderRadius: 13, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setShowReset(true)} style={{ width: 40, height: 40, borderRadius: 13, background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ⚙️
            </button>
            {activeBranche && (
              <button onClick={() => setModal({ branche: activeTab })} style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(135deg,#f59e0b,#f97316)", border: "none", color: "#000", fontWeight: 900, cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(245,158,11,0.35)" }}>
                +
              </button>
            )}
          </div>
        </div>

        {/* PAGE TITLE */}
        <div style={{ padding: "8px 20px 20px" }}>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.5px" }}>
            {activeTab === "dashboard" ? "Vue d'ensemble" : activeBranche?.icon + " " + activeBranche?.label}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "0 16px", opacity: mounted ? 1 : 0, transition: "opacity 0.3s" }}>
          {activeTab === "dashboard" && <Dashboard data={data} T={T} />}
          {BRANCHES.map(b => activeTab === b.id && (
            <BranchView key={b.id} branche={b.id} cards={data[b.id] || []} color={b.color} T={T}
              onEdit={card => setModal({ branche: b.id, card })}
              onDelete={id => handleDelete(b.id, id)}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, paddingBottom: "env(safe-area-inset-bottom, 16px)", display: "flex", justifyContent: "space-around", zIndex: 100 }}>
        {NAV.map(n => {
          const active = activeTab === n.id;
          const branch = BRANCHES.find(b => b.id === n.id);
          const color = active ? (branch?.color || "#f59e0b") : T.textSub;
          return (
            <button key={n.id} onClick={() => setActiveTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: "10px 10px 6px", minWidth: 56, fontFamily: "inherit" }}>
              <span style={{ fontSize: 22, opacity: active ? 1 : 0.45, transition: "opacity 0.2s" }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color, letterSpacing: "0.3px", transition: "color 0.2s" }}>{n.label}</span>
              {active && <div style={{ width: 18, height: 3, borderRadius: 2, background: color, marginTop: 1 }} />}
            </button>
          );
        })}
      </div>

      {modal && <Modal branche={modal.branche} card={modal.card} onSave={handleSave} onClose={() => setModal(null)} T={T} />}

      {showReset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }} onClick={() => setShowReset(false)}>
          <div style={{ background: T.modalBg, borderRadius: "24px 24px 0 0", padding: "20px 20px 44px", width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: T.border2, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 6 }}>⚙️ Paramètres</div>
            <div style={{ fontSize: 13, color: T.textSub, marginBottom: 24 }}>Version 1.0 · PokéVault</div>
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: "16px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#ef4444", marginBottom: 6 }}>⚠️ Réinitialiser les données</div>
              <div style={{ fontSize: 13, color: T.textSub, marginBottom: 14 }}>Recharge les données par défaut depuis le code. Toutes tes modifications manuelles seront perdues.</div>
              <button onClick={handleReset} style={{ width: "100%", padding: "14px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "inherit" }}>
                Réinitialiser
              </button>
            </div>
            <button onClick={() => setShowReset(false)} style={{ width: "100%", marginTop: 12, padding: "14px", background: T.surface2, border: "none", borderRadius: 12, color: T.textSub, cursor: "pointer", fontSize: 15, fontWeight: 600, fontFamily: "inherit" }}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
