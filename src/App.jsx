import { useState, useEffect } from "react";

const STORAGE_KEY = "pokevault-v6";
const THEME_KEY = "pokevault-theme-v2";
const IMG_KEY = "pokevault-images-v2";

function loadData() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (r) {
      const d = JSON.parse(r);
      return {
        pokemon: d.pokemon || [],
        op: d.op || [],
        dbz: d.dbz || [],
        sealed: d.sealed || [],
        liquidite: d.liquidite || { historique: [] },
      };
    }
  } catch {}
  return { pokemon: [], op: [], dbz: [], sealed: [], liquidite: { historique: [] } };
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
function loadTheme() { try { return localStorage.getItem(THEME_KEY) || "light"; } catch { return "light"; } }
function loadImages() {
  try {
    const raw = localStorage.getItem(IMG_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

const fmt = (n) => (n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
const pct = (a, b) => a === 0 ? "0.0" : ((b - a) / a * 100).toFixed(1);
const dateStr = () => new Date().toLocaleDateString("fr-FR");

const LIGHT = {
  bg: "#F2F2F7", surface: "#FFFFFF", surface2: "#F2F2F7",
  border: "rgba(60,60,67,0.1)", text: "#000000", textSub: "#8E8E93",
  navBg: "rgba(242,242,247,0.95)", modalBg: "#F2F2F7",
  shadow: "0 1px 3px rgba(0,0,0,0.08)", shadowMd: "0 4px 16px rgba(0,0,0,0.1)",
  accent: "#007AFF", green: "#34C759", red: "#FF3B30", orange: "#FF9500",
  isDark: false,
};
const DARK = {
  bg: "#000000", surface: "#1C1C1E", surface2: "#2C2C2E",
  border: "rgba(255,255,255,0.08)", text: "#FFFFFF", textSub: "#8E8E93",
  navBg: "rgba(28,28,30,0.95)", modalBg: "#1C1C1E",
  shadow: "0 1px 3px rgba(0,0,0,0.3)", shadowMd: "0 4px 16px rgba(0,0,0,0.4)",
  accent: "#0A84FF", green: "#30D158", red: "#FF453A", orange: "#FF9F0A",
  isDark: true,
};

const STATUTS = ["Raw NM","Raw LP","PSA 10","PSA 9","PSA 8","CGC Pristine 10","CGC 10","AFG 9.5 → PSA en cours","En attente PSA","En transit","Retour initié","Sealed","Gradé","Autre"];
const LANGUES = ["JP","EN","FR","CN","KR","Autre"];
const TCGS = [
  { id: "pokemon", label: "Pokémon", icon: "🎴", color: "#f59e0b" },
  { id: "op", label: "One Piece", icon: "☠️", color: "#ef4444" },
  { id: "dbz", label: "Dragon Ball", icon: "🐉", color: "#f97316" },
];
const NAV = [
  { id: "dashboard", icon: "⚡", label: "Accueil" },
  { id: "pokemon", icon: "🎴", label: "Pokémon" },
  { id: "op", icon: "☠️", label: "One Piece" },
  { id: "dbz", icon: "🐉", label: "DBZ" },
  { id: "sealed", icon: "📦", label: "Sealed" },
  { id: "vendues", icon: "✅", label: "Vendues" },
];

const buildCMUrl = (c) => `https://www.cardmarket.com/fr/Pokemon/Products/Singles?searchString=${encodeURIComponent(c.name + " " + (c.numero || ""))}`;

function RenderNotes({ notes }) {
  if (!notes) return null;
  const parts = notes.split(/(https?:\/\/[^\s]+)/);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("http")
          ? <span key={i} onClick={() => window.open(p, "_blank")} style={{ color: "#007AFF", textDecoration: "underline", cursor: "pointer", wordBreak: "break-all" }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function CardModal({ tcg, card, onSave, onClose, T }) {
  const def = { name: "", numero: "", set: "", langue: "JP", statut: "Raw NM", achat: "", valeur: "", surLiquidite: false, vendu: false, prixVente: "", notes: "", _tcg: tcg };
  const [f, setF] = useState(card ? { ...card, prixVente: card.prixVente || "", _tcg: card._tcg || tcg } : def);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.name && f.achat && f.valeur;
  const inp = { background: T.isDark ? "#2C2C2E" : "#F2F2F7", border: "none", borderRadius: 10, color: T.text, padding: "13px 14px", fontSize: 15, outline: "none", width: "100%", WebkitAppearance: "none", fontFamily: "inherit" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }} onClick={onClose}>
      <div style={{ background: T.modalBg, borderRadius: "20px 20px 0 0", padding: "20px 16px 44px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: T.isDark ? "#3A3A3C" : "#D1D1D6", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 16 }}>{card ? "Modifier" : "Nouvelle carte"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inp} placeholder="Nom *" value={f.name} onChange={e => set("name", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input style={inp} placeholder="Numéro" value={f.numero} onChange={e => set("numero", e.target.value)} />
            <input style={inp} placeholder="Set" value={f.set} onChange={e => set("set", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select style={{ ...inp, cursor: "pointer" }} value={f.langue} onChange={e => set("langue", e.target.value)}>{LANGUES.map(l => <option key={l}>{l}</option>)}</select>
            <select style={{ ...inp, cursor: "pointer" }} value={f.statut} onChange={e => set("statut", e.target.value)}>{STATUTS.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          <select style={{ ...inp, cursor: "pointer" }} value={f._tcg} onChange={e => set("_tcg", e.target.value)}>
            {TCGS.map(t => <option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input style={inp} type="number" placeholder="Achat €" value={f.achat} onChange={e => set("achat", e.target.value)} />
            <input style={inp} type="number" placeholder="Actuel €" value={f.valeur} onChange={e => set("valeur", e.target.value)} />
          </div>
          <div onClick={() => set("surLiquidite", !f.surLiquidite)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: f.surLiquidite ? "rgba(52,199,89,0.1)" : T.isDark ? "#2C2C2E" : "#F2F2F7", borderRadius: 10, cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: f.surLiquidite ? T.green : T.isDark ? "#3A3A3C" : "#D1D1D6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }}>{f.surLiquidite ? "✓" : ""}</div>
            <span style={{ fontSize: 14, color: T.text }}>Achat sur liquidité</span>
          </div>
          <div onClick={() => set("vendu", !f.vendu)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: f.vendu ? "rgba(99,102,241,0.1)" : T.isDark ? "#2C2C2E" : "#F2F2F7", borderRadius: 10, cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: f.vendu ? "#6366f1" : T.isDark ? "#3A3A3C" : "#D1D1D6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }}>{f.vendu ? "✓" : ""}</div>
            <span style={{ fontSize: 14, color: T.text }}>Carte vendue</span>
          </div>
          {f.vendu && <input style={inp} type="number" placeholder="Prix de vente €" value={f.prixVente} onChange={e => set("prixVente", e.target.value)} />}
          <input style={inp} placeholder="Notes..." value={f.notes} onChange={e => set("notes", e.target.value)} />
          <input style={inp} placeholder="Lien photo (URL)" value={f.photoUrl || ""} onChange={e => set("photoUrl", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "14px", background: T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 12, color: T.textSub, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Annuler</button>
          <button onClick={() => valid && onSave({ ...f, id: card?.id || Date.now(), achat: parseFloat(f.achat), valeur: parseFloat(f.valeur), prixVente: f.prixVente ? parseFloat(f.prixVente) : null })}
            style={{ flex: 2, padding: "14px", background: valid ? T.accent : T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 12, color: valid ? "#fff" : T.textSub, fontWeight: 600, cursor: valid ? "pointer" : "default", fontSize: 15, fontFamily: "inherit" }}>
            {card ? "Sauvegarder" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────────────────────────
function Card({ card, tcgId, onEdit, onDelete, onUpload, T, imgVersion }) {
  const img = loadImages()[String(card.id)];
  const [open, setOpen] = useState(false);
  const gain = card.valeur - card.achat;
  const gainPct = parseFloat(pct(card.achat, card.valeur));
  const up = gain >= 0;
  const sc = card.statut.includes("PSA 10") || card.statut.includes("Pristine") ? T.green
    : card.statut.includes("PSA 9") || card.statut.includes("AFG") ? T.orange
    : card.statut.includes("transit") || card.statut.includes("Retour") ? T.orange : T.textSub;

  return (
    <div style={{ marginBottom: 10, borderRadius: 14, background: T.surface, boxShadow: T.shadow, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        {(img || card.photoUrl)
          ? <img src={img || card.photoUrl} alt={card.name} style={{ width: 48, height: 64, borderRadius: 8, objectFit: "contain", background: T.surface2, flexShrink: 0 }} onError={e => e.target.style.display="none"} />
          : <div style={{ width: 48, height: 64, borderRadius: 8, background: T.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🃏</div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.name}</div>
          <div style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: sc + "20", color: sc, display: "inline-block", marginBottom: 4 }}>{card.statut}</div>
          <div style={{ fontSize: 11, color: T.textSub }}>{card.langue}{card.set && card.set !== "—" ? " · " + card.set : ""}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: T.textSub, marginBottom: 2 }}>Achat</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{fmt(card.achat)}</div>
          <div style={{ fontSize: 11, color: T.textSub, marginBottom: 2 }}>Actuel</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: up ? T.green : T.red }}>{fmt(card.valeur)}</div>
          <div style={{ fontSize: 11, color: up ? T.green : T.red }}>{up ? "+" : ""}{gainPct}%</div>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
            {[["Achat", fmt(card.achat)], ["Actuel", fmt(card.valeur)], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain)], ["ROI", (gainPct >= 0 ? "+" : "") + gainPct + "%"]].map(([k, v]) => (
              <div key={k} style={{ background: T.surface2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{v}</div>
              </div>
            ))}
          </div>
          {card.notes && (() => {
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = card.notes.match(urlRegex) || [];
            const text = card.notes.replace(urlRegex, "").trim();
            return (
              <div style={{ marginBottom: 12 }}>
                {text && <div style={{ fontSize: 13, color: T.textSub, padding: "10px 12px", background: T.surface2, borderRadius: 8, marginBottom: urls.length ? 8 : 0 }}>{text}</div>}
                {urls.map((url, i) => {
                  const label = url.includes("cardmarket") ? "📊 Voir sur Cardmarket"
                    : url.includes("ebay") ? "🔍 Voir sur eBay"
                    : url.includes("vinted") ? "👕 Voir sur Vinted"
                    : "🔗 Ouvrir le lien";
                  return (
                    <button key={i} onClick={() => window.open(url, "_blank")}
                      style={{ width: "100%", padding: "11px", background: "rgba(0,122,255,0.1)", border: "none", borderRadius: 10, color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: i < urls.length - 1 ? 6 : 0 }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            );
          })()}
          <label style={{ padding: "11px", background: "rgba(99,102,241,0.1)", borderRadius: 10, color: "#818cf8", fontSize: 13, fontWeight: 600, textAlign: "center", display: "block", cursor: "pointer", marginBottom: 8 }}>
            📷 Ajouter une photo
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              const r = new FileReader();
              r.onload = ev => onUpload(card.id, ev.target.result);
              r.readAsDataURL(file);
            }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={() => onEdit(card)} style={{ padding: "11px", background: T.surface2, border: "none", borderRadius: 10, color: T.textSub, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✏️ Modifier</button>
            <button onClick={() => onDelete(tcgId, card.id)} style={{ padding: "11px", background: "rgba(255,59,48,0.08)", border: "none", borderRadius: 10, color: T.red, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>🗑 Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── CARD GRID ─────────────────────────────────────────────────────────────────
function CardGrid({ card, tcgId, onEdit, onDelete, onUpload, T, imgVersion }) {
  const img = loadImages()[String(card.id)];
  const [open, setOpen] = useState(false);
  const gain = card.valeur - card.achat;
  const gainPct = parseFloat((card.achat === 0 ? 0 : (gain / card.achat * 100)).toFixed(1));
  const up = gain >= 0;
  const displayImg = img || card.photoUrl;
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", background: T.isDark ? "#1C1C1E" : "#E5E5EA", position: "relative", paddingBottom: "150%" }}>
      <div onClick={() => setOpen(true)} style={{ position: "absolute", inset: 0, cursor: "pointer" }}>
        {displayImg
          ? <img src={displayImg} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>🃏</div>
        }
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 6px 6px", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginBottom: 1 }}>{fmt(card.achat)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: up ? "#30D158" : "#FF453A" }}>{fmt(card.valeur)}</div>
        </div>
        <div style={{ position: "absolute", top: 5, right: 5, background: up ? "rgba(48,209,88,0.9)" : "rgba(255,69,58,0.9)", borderRadius: 6, padding: "2px 6px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{up ? "+" : ""}{gainPct}%</span>
        </div>
      </div>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }} onClick={() => setOpen(false)}>
          <div style={{ background: T.isDark ? "#1C1C1E" : "#F2F2F7", borderRadius: "20px 20px 0 0", padding: "20px 16px 44px", width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: T.isDark ? "#3A3A3C" : "#D1D1D6", borderRadius: 2, margin: "0 auto 16px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 14 }}>{card.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
              {[["Achat", fmt(card.achat)], ["Actuel", fmt(card.valeur)], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain)], ["ROI", (gainPct >= 0 ? "+" : "") + gainPct + "%"]].map(([k, v]) => (
                <div key={k} style={{ background: T.isDark ? "#2C2C2E" : "#fff", borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{v}</div>
                </div>
              ))}
            </div>
            <label style={{ padding: "11px", background: "rgba(99,102,241,0.1)", borderRadius: 10, color: "#818cf8", fontSize: 13, fontWeight: 600, textAlign: "center", display: "block", cursor: "pointer", marginBottom: 10 }}>
              📷 Ajouter une photo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files?.[0]; if (!file) return;
                const r = new FileReader(); r.onload = ev => { onUpload(card.id, ev.target.result); setOpen(false); }; r.readAsDataURL(file);
              }} />
            </label>
            <button onClick={() => window.open(buildCMUrl(card), "_blank")} style={{ width: "100%", padding: "11px", background: "rgba(0,122,255,0.1)", border: "none", borderRadius: 10, color: T.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}>📊 Voir sur Cardmarket</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button onClick={() => { setOpen(false); onEdit(card); }} style={{ padding: "11px", background: T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 10, color: T.textSub, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>✏️ Modifier</button>
              <button onClick={() => { setOpen(false); onDelete(tcgId, card.id); }} style={{ padding: "11px", background: "rgba(255,59,48,0.08)", border: "none", borderRadius: 10, color: T.red, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>🗑 Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TCG VIEW ──────────────────────────────────────────────────────────────────
function TcgView({ tcg, cards, imgVersion, onEdit, onDelete, onUpload, T }) {
  const [view, setView] = useState("grid");
  const images = loadImages();
  const actives = cards.filter(c => !c.vendu);
  const inv = actives.reduce((s, c) => s + c.achat, 0);
  const val = actives.reduce((s, c) => s + c.valeur, 0);
  const gain = val - inv;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        {[["Investi", fmt(inv), T.accent], ["Valeur", fmt(val), T.text], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain), gain >= 0 ? T.green : T.red]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, borderRadius: 12, padding: "12px 8px", textAlign: "center", boxShadow: T.shadow }}>
            <div style={{ fontSize: 10, color: T.textSub, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {actives.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div style={{ display: "flex", background: T.surface, borderRadius: 8, padding: 2, gap: 2, boxShadow: T.shadow }}>
            {[["grid", "⊞"], ["list", "☰"]].map(([m, icon]) => (
              <button key={m} onClick={() => setView(m)} style={{ padding: "5px 12px", borderRadius: 6, fontSize: 15, border: "none", cursor: "pointer", background: view === m ? T.accent : "transparent", color: view === m ? "#fff" : T.textSub, fontFamily: "inherit" }}>{icon}</button>
            ))}
          </div>
        </div>
      )}
      {actives.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 20px", color: T.textSub }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Aucune carte</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Appuie sur + pour ajouter</div>
          </div>
        : view === "grid"
          ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {actives.map(c => <CardGrid key={c.id} card={c} tcgId={tcg.id} onEdit={onEdit} onDelete={onDelete} onUpload={onUpload} T={T} imgVersion={imgVersion}/>)}
            </div>
          : actives.map(c => <Card key={c.id} card={c} tcgId={tcg.id} onEdit={onEdit} onDelete={onDelete} onUpload={onUpload} T={T} imgVersion={imgVersion}/>)
      }
    </div>
  );
}

// ── VENDUES VIEW ──────────────────────────────────────────────────────────────
function VenduesView({ data, onRestaurer, T }) {
  const all = TCGS.flatMap(t => (data[t.id] || []).filter(c => c.vendu).map(c => ({ ...c, _tcgId: t.id, _tcgLabel: t.label })));
  const totalAchat = all.reduce((s, c) => s + c.achat, 0);
  const totalVente = all.filter(c => c.prixVente).reduce((s, c) => s + c.prixVente, 0);
  const benef = totalVente - totalAchat;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[["Acheté", fmt(totalAchat), T.accent], ["Vendu", fmt(totalVente), "#818cf8"], ["Bénéfice", (benef >= 0 ? "+" : "") + fmt(benef), benef >= 0 ? T.green : T.red]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, borderRadius: 12, padding: "12px 8px", textAlign: "center", boxShadow: T.shadow }}>
            <div style={{ fontSize: 10, color: T.textSub, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {all.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 20px", color: T.textSub }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Aucune carte vendue</div>
          </div>
        : all.map(c => {
            const b = (c.prixVente || 0) - c.achat;
            return (
              <div key={c.id} style={{ marginBottom: 10, borderRadius: 14, background: T.surface, boxShadow: T.shadow, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: T.textSub }}>{c._tcgLabel} · {c.langue}</div>
                  </div>
                  <button onClick={() => onRestaurer(c._tcgId, c.id)} style={{ padding: "6px 12px", background: "rgba(99,102,241,0.1)", border: "none", borderRadius: 8, color: "#818cf8", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", flexShrink: 0, marginLeft: 8 }}>↩ Restaurer</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                  {[["Achat", fmt(c.achat), T.text], ["Vendu", fmt(c.prixVente || 0), "#818cf8"], ["Bénéf.", (b >= 0 ? "+" : "") + fmt(b), b >= 0 ? T.green : T.red]].map(([k, v, col]) => (
                    <div key={k} style={{ background: T.surface2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: col }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
      }
    </div>
  );
}

// ── SEALED VIEW ───────────────────────────────────────────────────────────────
const SEALED_TYPES = ["ETB", "Display", "Autre"];

function SealedModal({ item, onSave, onClose, T }) {
  const def = { name: "", type: "ETB", set: "", langue: "EN", achat: "", valeur: "", qty: "1", notes: "" };
  const [f, setF] = useState(item ? { ...item, qty: String(item.qty || 1) } : def);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const valid = f.name && f.achat && f.valeur;
  const inp = { background: T.isDark ? "#2C2C2E" : "#F2F2F7", border: "none", borderRadius: 10, color: T.text, padding: "13px 14px", fontSize: 15, outline: "none", width: "100%", WebkitAppearance: "none", fontFamily: "inherit" };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }} onClick={onClose}>
      <div style={{ background: T.modalBg, borderRadius: "20px 20px 0 0", padding: "20px 16px 44px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: T.isDark ? "#3A3A3C" : "#D1D1D6", borderRadius: 2, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 16 }}>{item ? "Modifier" : "Nouveau scellé"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inp} placeholder="Nom *" value={f.name} onChange={e => set("name", e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select style={{ ...inp, cursor: "pointer" }} value={f.type} onChange={e => set("type", e.target.value)}>{SEALED_TYPES.map(t => <option key={t}>{t}</option>)}</select>
            <input style={inp} placeholder="Set" value={f.set} onChange={e => set("set", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select style={{ ...inp, cursor: "pointer" }} value={f.langue} onChange={e => set("langue", e.target.value)}>{LANGUES.map(l => <option key={l}>{l}</option>)}</select>
            <input style={inp} type="number" placeholder="Quantité" value={f.qty} onChange={e => set("qty", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input style={inp} type="number" placeholder="Achat € (unitaire)" value={f.achat} onChange={e => set("achat", e.target.value)} />
            <input style={inp} type="number" placeholder="Actuel € (unitaire)" value={f.valeur} onChange={e => set("valeur", e.target.value)} />
          </div>
          <input style={inp} placeholder="Notes..." value={f.notes} onChange={e => set("notes", e.target.value)} />
          <input style={inp} placeholder="Lien photo (URL)" value={f.photoUrl || ""} onChange={e => set("photoUrl", e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "14px", background: T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 12, color: T.textSub, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Annuler</button>
          <button onClick={() => valid && onSave({ ...f, id: item?.id || Date.now(), achat: parseFloat(f.achat), valeur: parseFloat(f.valeur), qty: parseInt(f.qty) || 1 })}
            style={{ flex: 2, padding: "14px", background: valid ? T.accent : T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 12, color: valid ? "#fff" : T.textSub, fontWeight: 600, cursor: valid ? "pointer" : "default", fontSize: 15, fontFamily: "inherit" }}>
            {item ? "Sauvegarder" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SealedView({ items, onSave, onDelete, T }) {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const inv = items.reduce((s, i) => s + i.achat * i.qty, 0);
  const val = items.reduce((s, i) => s + i.valeur * i.qty, 0);
  const gain = val - inv;
  const grouped = { ETB: [], Display: [], Autre: [] };
  items.forEach(i => { (grouped[i.type] || grouped["Autre"]).push(i); });
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Investi", fmt(inv), T.accent], ["Valeur", fmt(val), T.text], ["P&L", (gain >= 0 ? "+" : "") + fmt(gain), gain >= 0 ? T.green : T.red]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, borderRadius: 12, padding: "12px 8px", textAlign: "center", boxShadow: T.shadow }}>
            <div style={{ fontSize: 10, color: T.textSub, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {items.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 20px", color: T.textSub }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Aucun produit scellé</div>
          </div>
        : SEALED_TYPES.map(type => {
            const group = grouped[type] || [];
            if (!group.length) return null;
            return (
              <div key={type} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.accent, marginBottom: 10 }}>📦 {type}</div>
                {group.map(item => {
                  const g = (item.valeur - item.achat) * item.qty;
                  const up = g >= 0;
                  return (
                    <div key={item.id} style={{ marginBottom: 10, borderRadius: 14, background: T.surface, boxShadow: T.shadow, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 4 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: T.textSub }}>{item.set} · {item.langue} · x{item.qty}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: up ? T.green : T.red }}>{up ? "+" : ""}{((item.valeur - item.achat) / item.achat * 100).toFixed(1)}%</div>
                          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                            <button onClick={() => { setEditItem(item); setShowModal(true); }} style={{ width: 32, height: 32, borderRadius: 8, background: T.surface2, border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                            <button onClick={() => onDelete(item.id)} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,59,48,0.08)", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: T.red }}>🗑</button>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
                        {[["Achat/u", fmt(item.achat), T.text], ["Actuel/u", fmt(item.valeur), T.text], ["P&L total", (g >= 0 ? "+" : "") + fmt(g), up ? T.green : T.red]].map(([k, v, c]) => (
                          <div key={k} style={{ background: T.surface2, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
                            <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
      }
      {showModal && <SealedModal item={editItem} onSave={item => { onSave(item); setShowModal(false); setEditItem(null); }} onClose={() => { setShowModal(false); setEditItem(null); }} T={T} />}
    </div>
  );
}

// ── LIQUIDITE VIEW ────────────────────────────────────────────────────────────
function LiquiditeView({ data, onInjecter, onEditInj, onDeleteInj, T }) {
  const hist = data.liquidite?.historique || [];
  const totalInjecte = hist.filter(h => h.type === "injection").reduce((s, h) => s + h.montant, 0);
  const allCards = [...(data.pokemon || []), ...(data.op || []), ...(data.dbz || [])];
  const totalAchats = allCards.filter(c => c.surLiquidite && !c.vendu).reduce((s, c) => s + c.achat, 0);
  // Use historique ventes to calculate solde (same as LiquiditeView)
  const totalVentes = hist.filter(h => h.type === "vente").reduce((s, h) => s + h.montant, 0);
  const solde = totalInjecte - totalAchats + totalVentes;
  const [showInject, setShowInject] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [montant, setMontant] = useState("");
  const [label, setLabel] = useState("");
  const reversed = [...hist].reverse();
  const inp = { background: T.isDark ? "#2C2C2E" : "#F2F2F7", border: "none", borderRadius: 10, color: T.text, padding: "13px 14px", fontSize: 15, outline: "none", width: "100%", fontFamily: "inherit" };
  return (
    <div>
      <div style={{ background: T.surface, borderRadius: 18, padding: "20px 16px", marginBottom: 16, boxShadow: T.shadowMd }}>
        <div style={{ fontSize: 12, color: T.textSub, marginBottom: 4 }}>Solde disponible</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: solde >= 0 ? T.green : T.red, letterSpacing: "-1px", marginBottom: 14 }}>{fmt(solde)}</div>
        <button onClick={() => setShowInject(true)} style={{ padding: "11px 20px", background: T.green, border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>+ Injecter</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[["Injecté", fmt(totalInjecte), T.accent], ["Dépensé", fmt(totalAchats), T.red], ["Récupéré", fmt(totalVentes), T.green]].map(([k, v, c]) => (
          <div key={k} style={{ background: T.surface, borderRadius: 12, padding: "12px 8px", textAlign: "center", boxShadow: T.shadow }}>
            <div style={{ fontSize: 9, color: T.textSub, textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: T.textSub, fontWeight: 600, marginBottom: 10 }}>Historique</div>
      {reversed.length === 0
        ? <div style={{ textAlign: "center", padding: "30px", color: T.textSub, fontSize: 13 }}>Aucun mouvement</div>
        : <div style={{ background: T.surface, borderRadius: 14, overflow: "hidden", boxShadow: T.shadow }}>
            {reversed.slice(0, 30).map((h, i) => {
              const realIdx = reversed.length - 1 - i;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < Math.min(reversed.length, 30) - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: h.type === "injection" ? "rgba(52,199,89,0.15)" : h.type === "vente" ? "rgba(99,102,241,0.15)" : "rgba(255,59,48,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                    {h.type === "injection" ? "💵" : h.type === "vente" ? "✅" : "🛒"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.label}</div>
                    <div style={{ fontSize: 11, color: T.textSub }}>{h.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: h.type === "achat" ? T.red : T.green }}>{h.type === "achat" ? "-" : "+"}{fmt(h.montant)}</div>
                    {h.type === "injection" && <>
                      <button onClick={() => { setEditIdx(realIdx); setMontant(String(h.montant)); setLabel(h.label); setShowInject(true); }} style={{ width: 28, height: 28, borderRadius: 8, background: T.surface2, border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                    </>}
                  {(h.type === "injection" || h.type === "vente") && (
                    <button onClick={() => onDeleteInj(realIdx)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,59,48,0.08)", border: "none", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", color: T.red }}>🗑</button>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
      }
      {showInject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300 }} onClick={() => { setShowInject(false); setEditIdx(null); setMontant(""); setLabel(""); }}>
          <div style={{ background: T.modalBg, borderRadius: "20px 20px 0 0", padding: "20px 16px 44px", width: "100%", maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: T.isDark ? "#3A3A3C" : "#D1D1D6", borderRadius: 2, margin: "0 auto 18px" }} />
            <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 16 }}>{editIdx !== null ? "Modifier" : "Injecter des fonds"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} type="number" placeholder="Montant €" value={montant} onChange={e => setMontant(e.target.value)} />
              <input style={inp} placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => { setShowInject(false); setEditIdx(null); setMontant(""); setLabel(""); }} style={{ flex: 1, padding: "14px", background: T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 12, color: T.textSub, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>Annuler</button>
              <button onClick={() => { if (!montant) return; editIdx !== null ? onEditInj(editIdx, parseFloat(montant), label || "Injection") : onInjecter(parseFloat(montant), label || "Injection"); setMontant(""); setLabel(""); setShowInject(false); setEditIdx(null); }}
                style={{ flex: 2, padding: "14px", background: montant ? T.green : T.isDark ? "#2C2C2E" : "#E5E5EA", border: "none", borderRadius: 12, color: montant ? "#fff" : T.textSub, fontWeight: 600, cursor: montant ? "pointer" : "default", fontSize: 15, fontFamily: "inherit" }}>
                {editIdx !== null ? "Modifier" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ data, onGoLiquidite, T }) {
  const allCards = TCGS.flatMap(t => (data[t.id] || []).filter(c => !c.vendu));
  const sealed = data.sealed || [];
  const cardsInv = allCards.reduce((s, c) => s + c.achat, 0);
  const cardsVal = allCards.reduce((s, c) => s + c.valeur, 0);
  const sealedInv = sealed.reduce((s, i) => s + i.achat * i.qty, 0);
  const sealedVal = sealed.reduce((s, i) => s + i.valeur * i.qty, 0);
  const inv = cardsInv + sealedInv;
  const val = cardsVal + sealedVal;
  const gain = val - inv;
  const roi = inv === 0 ? 0 : ((val - inv) / inv * 100).toFixed(1);
  const hist = data.liquidite?.historique || [];
  const totalInjecte = hist.filter(h => h.type === "injection").reduce((s, h) => s + h.montant, 0);
  const totalVentes = hist.filter(h => h.type === "vente").reduce((s, h) => s + h.montant, 0);
  const totalAchats = hist.filter(h => h.type === "achat").reduce((s, h) => s + h.montant, 0);
  const solde = totalInjecte - totalAchats + totalVentes;
  return (
    <div>
      <div style={{ background: T.surface, borderRadius: 18, padding: "20px 16px", marginBottom: 14, boxShadow: T.shadowMd }}>
        <div style={{ fontSize: 12, color: T.textSub, marginBottom: 4 }}>Portefeuille total</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: T.text, letterSpacing: "-1px", marginBottom: 6 }}>{fmt(val)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: gain >= 0 ? T.green : T.red }}>{gain >= 0 ? "▲ +" : "▼ "}{fmt(gain)}</span>
          <span style={{ fontSize: 12, color: T.textSub }}>· {fmt(inv)} investi</span>
        </div>
        <div style={{ display: "inline-flex", padding: "5px 12px", borderRadius: 20, background: parseFloat(roi) >= 0 ? "rgba(52,199,89,0.12)" : "rgba(255,59,48,0.12)" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: parseFloat(roi) >= 0 ? T.green : T.red }}>ROI {parseFloat(roi) >= 0 ? "+" : ""}{roi}% · {allCards.length} cartes</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: T.textSub, fontWeight: 600, marginBottom: 10 }}>Par TCG</div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
        {TCGS.map(tcg => {
          const cards = (data[tcg.id] || []).filter(c => !c.vendu);
          const i = cards.reduce((s, c) => s + c.achat, 0);
          const v = cards.reduce((s, c) => s + c.valeur, 0);
          return (
            <div key={tcg.id} style={{ flexShrink: 0, width: 140, background: T.surface, borderRadius: 14, padding: "14px 12px", borderTop: `3px solid ${tcg.color}`, boxShadow: T.shadow }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tcg.color, marginBottom: 8 }}>{tcg.icon} {tcg.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 3 }}>{fmt(i)}</div>
              <div style={{ fontSize: 12, color: (v - i) >= 0 ? T.green : T.red }}>{(v - i) >= 0 ? "+" : ""}{fmt(v - i)}</div>
              <div style={{ fontSize: 11, color: T.textSub, marginTop: 4 }}>{cards.length} carte{cards.length > 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: T.textSub, fontWeight: 600, marginBottom: 10 }}>Liquidité</div>
      <div onClick={onGoLiquidite} style={{ background: T.surface, borderRadius: 14, padding: "16px", boxShadow: T.shadowMd, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: T.textSub, marginBottom: 3 }}>Solde disponible</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: solde >= 0 ? T.green : T.red }}>{fmt(solde)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 28 }}>💰</span>
          <span style={{ fontSize: 20, color: T.textSub }}>›</span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(loadData);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState(loadTheme);
  const [imgVersion, setImgVersion] = useState(0);
  const T = theme === "dark" ? DARK : LIGHT;

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, theme); } catch {} }, [theme]);


  function handleUpload(cardId, b64) {
    try {
      const raw = localStorage.getItem(IMG_KEY);
      const stored = raw ? JSON.parse(raw) : {};
      stored[String(cardId)] = b64;
      localStorage.setItem(IMG_KEY, JSON.stringify(stored));
    } catch(e) {}
    setImgVersion(v => v + 1);
  }

  function handleSave(card) {
    const src = tab;
    const tgt = card._tcg || src;
    setData(prev => {
      const srcList = prev[src] || [];
      const exists = srcList.find(c => c.id === card.id);
      const wasVendu = exists?.vendu;
      let nd = { ...prev };
      if (exists && tgt !== src) {
        nd[src] = srcList.filter(c => c.id !== card.id);
        nd[tgt] = [...(prev[tgt] || []), card];
      } else if (exists) {
        nd[src] = srcList.map(c => c.id === card.id ? card : c);
      } else {
        nd[tgt] = [...(prev[tgt] || []), card];
      }
      let hist = [...(prev.liquidite?.historique || [])];
      if (!exists && card.surLiquidite) hist.push({ type: "achat", montant: card.achat, label: `Achat : ${card.name}`, date: dateStr() });
      if (!wasVendu && card.vendu && card.prixVente) hist.push({ type: "vente", montant: card.prixVente, label: `Vente : ${card.name}`, date: dateStr() });
      return { ...nd, liquidite: { ...prev.liquidite, historique: hist } };
    });
    setModal(null);
  }

  function handleDelete(tcg, id) { setData(p => ({ ...p, [tcg]: (p[tcg] || []).filter(c => c.id !== id) })); }
  function handleRestaurer(tcg, id) {
    setData(p => {
      const card = (p[tcg] || []).find(c => c.id === id);
      const newCards = (p[tcg] || []).map(c => c.id === id ? { ...c, vendu: false, prixVente: null } : c);
      // Remove last matching vente from historique
      let hist = [...(p.liquidite?.historique || [])];
      if (card) {
        const idx = [...hist].reverse().findIndex(h => h.type === "vente" && h.label === `Vente : ${card.name}`);
        if (idx !== -1) hist.splice(hist.length - 1 - idx, 1);
      }
      return { ...p, [tcg]: newCards, liquidite: { ...p.liquidite, historique: hist } };
    });
  }
  function handleSealedSave(item) { setData(p => { const l = p.sealed || []; const e = l.find(i => i.id === item.id); return { ...p, sealed: e ? l.map(i => i.id === item.id ? item : i) : [...l, item] }; }); }
  function handleSealedDelete(id) { setData(p => ({ ...p, sealed: (p.sealed || []).filter(i => i.id !== id) })); }
  function handleInjecter(m, l) { setData(p => ({ ...p, liquidite: { ...p.liquidite, historique: [...(p.liquidite?.historique || []), { type: "injection", montant: m, label: l, date: dateStr() }] } })); }
  function handleEditInj(idx, m, l) { setData(p => { const h = [...(p.liquidite?.historique || [])]; h[idx] = { ...h[idx], montant: m, label: l }; return { ...p, liquidite: { ...p.liquidite, historique: h } }; }); }
  function handleDeleteInj(idx) { setData(p => { const h = [...(p.liquidite?.historique || [])]; h.splice(idx, 1); return { ...p, liquidite: { ...p.liquidite, historique: h } }; }); }

  const activeTcg = TCGS.find(t => t.id === tab);
  const nbVendues = TCGS.flatMap(t => (data[t.id] || []).filter(c => c.vendu)).length;

  return (
    <>
      <style>{`* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } body { margin: 0; padding: 0; overscroll-behavior: none; -webkit-font-smoothing: antialiased; } ::-webkit-scrollbar { display: none; } input, select, button { font-family: inherit; } select option { background: #fff; color: #000; }`}</style>
      <div style={{ minHeight: "100dvh", background: T.bg, fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", color: T.text, paddingBottom: 88 }}>
        {/* HEADER */}
        <div style={{ padding: "52px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(145deg,#FF9500,#FF3B30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>PokéVault</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ width: 34, height: 34, borderRadius: "50%", background: T.surface, border: `1px solid ${T.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{theme === "dark" ? "☀️" : "🌙"}</button>
            {activeTcg && <button onClick={() => setModal({ tcg: tab })} style={{ width: 34, height: 34, borderRadius: "50%", background: T.accent, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>}
            {tab === "sealed" && <button onClick={() => setModal({ tcg: "sealed" })} style={{ width: 34, height: 34, borderRadius: "50%", background: T.accent, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>}
          </div>
        </div>
        {/* TITLE */}
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.8px" }}>
            {tab === "dashboard" ? "Vue d'ensemble" : tab === "liquidite" ? "Liquidité" : tab === "vendues" ? "Cartes vendues" : tab === "sealed" ? "Produits scellés" : activeTcg?.label}
          </div>
        </div>
        {/* CONTENT */}
        <div style={{ padding: "0 14px" }}>
          {tab === "dashboard" && <Dashboard data={data} onGoLiquidite={() => setTab("liquidite")} T={T} />}
          {activeTcg && <TcgView tcg={activeTcg} cards={data[tab] || []} imgVersion={imgVersion} onEdit={card => setModal({ tcg: tab, card })} onDelete={handleDelete} onUpload={handleUpload} T={T} />}
          {tab === "liquidite" && <LiquiditeView data={data} onInjecter={handleInjecter} onEditInj={handleEditInj} onDeleteInj={handleDeleteInj} T={T} />}
          {tab === "sealed" && <SealedView items={data.sealed || []} onSave={handleSealedSave} onDelete={handleSealedDelete} T={T} />}
          {tab === "vendues" && <VenduesView data={data} onRestaurer={handleRestaurer} T={T} />}
        </div>
      </div>
      {/* NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.navBg, borderTop: `1px solid ${T.border}`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", paddingBottom: "env(safe-area-inset-bottom, 8px)", display: "flex", justifyContent: "space-around", zIndex: 100 }}>
        {NAV.map(n => {
          const active = tab === n.id;
          const color = active ? T.accent : T.textSub;
          return (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "8px 6px 4px", minWidth: 48, position: "relative" }}>
              <span style={{ fontSize: 22, opacity: active ? 1 : 0.45 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color }}>{n.label}</span>
              {active && <div style={{ width: 16, height: 3, borderRadius: 2, background: color, marginTop: 1 }} />}
              {n.id === "vendues" && nbVendues > 0 && !active && <div style={{ position: "absolute", top: 4, right: 6, width: 16, height: 16, borderRadius: 8, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{nbVendues}</div>}
            </button>
          );
        })}
      </div>
      {modal && modal.tcg !== "sealed" && <CardModal tcg={modal.tcg} card={modal.card} onSave={handleSave} onClose={() => setModal(null)} T={T} />}
      {modal && modal.tcg === "sealed" && <SealedModal item={modal.card} onSave={item => { handleSealedSave(item); setModal(null); }} onClose={() => setModal(null)} T={T} />}
    </>
  );
}
