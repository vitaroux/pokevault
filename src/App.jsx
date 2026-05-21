import { useState, useEffect } from "react";

const STORAGE_KEY = "pokevault-v3";
const THEME_KEY = "pokevault-theme";

const defaultData = {
  pokemon: [
    { id: 1, name: "Pikachu & Zekrom GX", numero: "031/095", set: "Tag Bolt", langue: "JP", statut: "PSA 10", achat: 164, valeur: 164, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "Illustré par Mitsuhiro Arita" },
    { id: 2, name: "Gengar & Mimikyu GX SA", numero: "103/095", set: "Tag Bolt", langue: "JP", statut: "AFG 9.5 → PSA en cours", achat: 600, valeur: 600, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "Graal Tag Team" },
    { id: 10, name: "Pikachu & Zekrom GX", numero: "031/095", set: "Tag Bolt JP", langue: "JP", statut: "PSA 10", achat: 161.19, valeur: 161.19, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "En transit" },
    { id: 11, name: "Reshiram & Charizard GX", numero: "016/173", set: "Tag All Stars", langue: "JP", statut: "PSA 10", achat: 87.69, valeur: 87.69, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "En transit" },
    { id: 12, name: "Lugia", numero: "249", set: "Neo Genesis Gold Silver to a New World", langue: "JP", statut: "Raw NM", achat: 299.25, valeur: 299.25, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "Vintage JP" },
    { id: 13, name: "Noctali (Umbreon)", numero: "06/15", set: "Chinese Gem Pack Vol. 2", langue: "CN", statut: "En transit", achat: 126.50, valeur: 126.50, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 14, name: "Noctali (Umbreon)", numero: "06/15", set: "Chinese Gem Pack Vol. 2", langue: "CN", statut: "En transit", achat: 131.75, valeur: 131.75, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 15, name: "Pikachu & Zekrom GX", numero: "166", set: "CSM2aC", langue: "CN", statut: "PSA 9", achat: 183.75, valeur: 183.75, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 16, name: "Umbreon V", numero: "152/132", set: "9 Colors Gather", langue: "CN", statut: "CGC Pristine 10", achat: 150, valeur: 150, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 17, name: "Latias & Latios GX", numero: "175/150", set: "CSM2a", langue: "CN", statut: "PSA 10", achat: 700, valeur: 350, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 20, name: "Latias GG20", numero: "GG20", set: "Crown Zenith", langue: "FR", statut: "Raw NM", achat: 21.43, valeur: 21.43, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 21, name: "Mew EX Gold", numero: "205/165", set: "151 EV3.5", langue: "FR", statut: "Raw NM", achat: 32.24, valeur: 32.24, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 22, name: "Dracaufeu VMAX", numero: "261", set: "—", langue: "FR", statut: "Gradé", achat: 87.69, valeur: 87.69, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 23, name: "Pikachu GG30", numero: "GG30", set: "Zénith Suprême", langue: "FR", statut: "PSA 9", achat: 61.44, valeur: 61.44, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 24, name: "Ectoplasma", numero: "157/264", set: "—", langue: "FR", statut: "Gradé", achat: 161.99, valeur: 161.99, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 25, name: "Sulfura ex Team Rocket", numero: "—", set: "Rivaux Destinés", langue: "FR", statut: "Gradé", achat: 77.99, valeur: 77.99, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 26, name: "Pikachu CRZ 160", numero: "160", set: "Crown Zenith", langue: "FR", statut: "Raw NM", achat: 71.94, valeur: 71.94, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 27, name: "Pikachu VMAX TG17", numero: "TG17", set: "Lost Origin", langue: "FR", statut: "Raw NM", achat: 77.19, valeur: 77.19, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 28, name: "Pikachu VMAX", numero: "—", set: "—", langue: "FR", statut: "PSA 10", achat: 318.69, valeur: 318.69, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 29, name: "Mew Ryota Murayama", numero: "—", set: "—", langue: "FR", statut: "Raw NM", achat: 66.89, valeur: 66.89, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 30, name: "Dracaufeu Alt Art", numero: "234/091", set: "Destinées de Paldea", langue: "FR", statut: "Raw NM", achat: 197.94, valeur: 197.94, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 31, name: "Mew Point Fusion", numero: "—", set: "Poing de Fusion", langue: "FR", statut: "Raw NM", achat: 46.49, valeur: 46.49, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 32, name: "Reshiram & Charizard GX PSA 10", numero: "—", set: "—", langue: "JP", statut: "Retour initié", achat: 132.25, valeur: 132.25, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "⚠️ Retour en cours" },
    { id: 33, name: "Tortank Alt Art", numero: "200/165", set: "151 EV3.5", langue: "FR", statut: "En transit", achat: 161.08, valeur: 161.08, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
  ],
  op: [
    { id: 40, name: "Boa Hancock Alt Art", numero: "OP01-078", set: "OP01", langue: "JP", statut: "Gradé", achat: 404.25, valeur: 404.25, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 41, name: "Boa Hancock Alt Art", numero: "—", set: "One Piece", langue: "JP", statut: "PSA 10", achat: 141.75, valeur: 141.75, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 42, name: "Boa Hancock SP SR", numero: "OP12-014", set: "OP12", langue: "JP", statut: "Raw NM", achat: 224.19, valeur: 224.19, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 43, name: "Vinsmoke Sanji", numero: "—", set: "One Piece", langue: "JP", statut: "Raw NM", achat: 36.75, valeur: 36.75, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 44, name: "Boa Hancock SP", numero: "OP07-051", set: "OP07", langue: "JP", statut: "CGC Pristine 10", achat: 321.14, valeur: 321.14, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "⚠️ Problème livraison" },
  ],
  dbz: [
    { id: 50, name: "Son Gohan Childhood", numero: "FB08-106", set: "Dragon Ball Super", langue: "JP", statut: "En transit", achat: 47.75, valeur: 47.75, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 51, name: "Son Goku Alt Art", numero: "BT13-123", set: "Dragon Ball Super", langue: "JP", statut: "PSA 10", achat: 162.75, valeur: 162.75, mode: "hold", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 52, name: "Son Goku", numero: "FB01-139", set: "Fusion World", langue: "JP", statut: "En transit", achat: 47.09, valeur: 47.09, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
    { id: 53, name: "Enel", numero: "—", set: "Dragon Ball Super", langue: "JP", statut: "Gradé", achat: 89.25, valeur: 89.25, mode: "swing", surLiquidite: true, vendu: false, prixVente: null, notes: "" },
  ],
  liquidite: { historique: [] },
};

function calcLiquidite(data) {
  const allCards = [...(data.pokemon||[]), ...(data.op||[]), ...(data.dbz||[])];
  const totalInjecte = (data.liquidite?.historique||[]).filter(h => h.type === "injection").reduce((s, h) => s + h.montant, 0);
  const totalAchats = allCards.filter(c => c.surLiquidite && !c.vendu).reduce((s, c) => s + c.achat, 0);
  const totalVentes = allCards.filter(c => c.vendu && c.surLiquidite && c.prixVente).reduce((s, c) => s + c.prixVente, 0);
  return { totalInjecte, totalAchats, totalVentes, solde: totalInjecte - totalAchats + totalVentes };
}

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : defaultData; } catch { return defaultData; }
}
function saveData(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }
function loadTheme() { try { return localStorage.getItem(THEME_KEY) || "dark"; } catch { return "dark"; } }

const THEMES = {
  dark: { bg: "#07090f", bgGrad: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.12) 0%, transparent 50%)", surface: "#111827", surface2: "#1a2235", border: "rgba(255,255,255,0.07)", border2: "rgba(255,255,255,0.12)", text: "#f1f5f9", textSub: "#64748b", textMuted: "#374151", modalBg: "#0d1117", inputBg: "#1a2235", barBg: "#1e293b", navBg: "#0d1117" },
  light: { bg: "#f1f5f9", bgGrad: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.06) 0%, transparent 50%)", surface: "#ffffff", surface2: "#f8fafc", border: "rgba(0,0,0,0.07)", border2: "rgba(0,0,0,0.12)", text: "#0f172a", textSub: "#64748b", textMuted: "#94a3b8", modalBg: "#ffffff", inputBg: "#f1f5f9", barBg: "#e2e8f0", navBg: "#ffffff" },
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
  { id: "hold", icon: "🏆", label: "Hold" },
  { id: "swing", icon: "📈", label: "Swing" },
  { id: "liquidite", icon: "💰", label: "Liquidité" },
];

const fmt = (n) => { const v = Math.abs(n ?? 0); if (v >= 1000) return ((n < 0 ? "-" : "") + (v / 1000).toFixed(1).replace(".0","") + "k€"); return (n ?? 0).toLocaleString("fr-FR") + "€"; };
const pct = (a, b) => a === 0 ? "0.0" : ((b - a) / a * 100).toFixed(1);
const buildCMUrl = (c) => `https://www.cardmarket.com/fr/Pokemon/Products/Singles?searchString=${encodeURIComponent(c.name+" "+(c.numero||""))}&language=${{JP:"Japanese",EN:"English",FR:"French",CN:"Simplified Chinese",KR:"Korean"}[c.langue]||""}&minCondition=2`;
const buildEbayUrl = (c) => `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(c.name+" "+(c.numero||"")+" "+(c.langue||""))}&LH_Sold=1&LH_Complete=1`;
const dateStr = () => new Date().toLocaleDateString("fr-FR");

// ── IMAGE HELPERS ─────────────────────────────────────────────────────────────
const IMG_KEY = "pokevault-images";
function loadImages() { try { return JSON.parse(localStorage.getItem(IMG_KEY)||"{}"); } catch { return {}; } }
function saveImage(cardId, base64) { try { const imgs=loadImages(); imgs[cardId]=base64; localStorage.setItem(IMG_KEY,JSON.stringify(imgs)); } catch {} }
function deleteImage(cardId) { try { const imgs=loadImages(); delete imgs[cardId]; localStorage.setItem(IMG_KEY,JSON.stringify(imgs)); } catch {} }

async function fetchPokemonImage(name) {
  try {
    const clean = name.toLowerCase()
      .replace(/&/g," ").replace(/gx|ex|vmax|vstar|v/gi,"").replace(/tag team/gi,"")
      .replace(/sa|sr|rr|hr/gi,"").replace(/psa.*|cgc.*|afg.*/gi,"")
      .replace(/\s+/g," ").trim().split(" ")[0];
    const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(clean)}&pageSize=1`);
    const data = await res.json();
    return data.data?.[0]?.images?.large || data.data?.[0]?.images?.small || null;
  } catch { return null; }
}

const TCG_PLACEHOLDERS = {
  pokemon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Pok%C3%A9_Ball_icon.svg/240px-Pok%C3%A9_Ball_icon.svg.png",
  op: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/One_Piece_Logo.svg/240px-One_Piece_Logo.svg.png",
  dbz: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Dragon_Ball_Z_Logo.svg/240px-Dragon_Ball_Z_Logo.svg.png",
};

// ── CARD MODAL ────────────────────────────────────────────────────────────────
function CardModal({ tcg, card, onSave, onClose, T }) {
  const empty = { name:"", numero:"", set:"", langue:"JP", statut:"Raw NM", achat:"", valeur:"", mode:"hold", surLiquidite:true, vendu:false, prixVente:"", notes:"", tcg };
  const [form, setForm] = useState(card ? {...card, prixVente: card.prixVente||"", tcg: card.tcg||tcg} : empty);
  const s = (k,v) => setForm(p => ({...p,[k]:v}));
  const valid = form.name && form.achat && form.valeur;
  const inp = { background:T.inputBg, border:`1px solid ${T.border2}`, borderRadius:12, color:T.text, padding:"14px", fontSize:15, outline:"none", width:"100%", WebkitAppearance:"none", fontFamily:"inherit" };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={onClose}>
      <div style={{background:T.modalBg,borderRadius:"24px 24px 0 0",padding:"20px 20px 44px",width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:40,height:4,background:T.border2,borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:18}}>{card?"Modifier":"Nouvelle carte"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input style={inp} placeholder="Nom de la carte *" value={form.name} onChange={e=>s("name",e.target.value)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <input style={inp} placeholder="Numéro" value={form.numero} onChange={e=>s("numero",e.target.value)}/>
            <input style={inp} placeholder="Set" value={form.set} onChange={e=>s("set",e.target.value)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <select style={{...inp,cursor:"pointer"}} value={form.langue} onChange={e=>s("langue",e.target.value)}>{LANGUES.map(l=><option key={l}>{l}</option>)}</select>
            <select style={{...inp,cursor:"pointer"}} value={form.statut} onChange={e=>s("statut",e.target.value)}>{STATUTS.map(st=><option key={st}>{st}</option>)}</select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <input style={inp} type="number" placeholder="Prix achat €" value={form.achat} onChange={e=>s("achat",e.target.value)}/>
            <input style={inp} type="number" placeholder="Valeur actuelle €" value={form.valeur} onChange={e=>s("valeur",e.target.value)}/>
          </div>
          {/* TCG selector */}
          <select style={{...inp,cursor:"pointer"}} value={form.tcg} onChange={e=>s("tcg",e.target.value)}>
            {TCGS.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          {/* Hold / Swing toggle */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {["hold","swing"].map(m => (
              <div key={m} onClick={()=>s("mode",m)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"14px",background:form.mode===m?(m==="hold"?"rgba(245,158,11,0.12)":"rgba(34,197,94,0.12)"):T.surface2,border:`1px solid ${form.mode===m?(m==="hold"?"rgba(245,158,11,0.4)":"rgba(34,197,94,0.4)"):T.border}`,borderRadius:12,cursor:"pointer"}}>
                <span style={{fontSize:18}}>{m==="hold"?"🏆":"📈"}</span>
                <span style={{fontSize:14,fontWeight:700,color:form.mode===m?(m==="hold"?"#f59e0b":"#22c55e"):T.textSub}}>{m==="hold"?"Hold":"Swing"}</span>
              </div>
            ))}
          </div>
          {/* Sur liquidité */}
          <div onClick={()=>s("surLiquidite",!form.surLiquidite)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:form.surLiquidite?"rgba(34,197,94,0.08)":T.surface2,border:`1px solid ${form.surLiquidite?"rgba(34,197,94,0.3)":T.border}`,borderRadius:12,cursor:"pointer"}}>
            <div style={{width:24,height:24,borderRadius:6,background:form.surLiquidite?"#22c55e":T.barBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{form.surLiquidite?"✓":""}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>Achat sur liquidité</div><div style={{fontSize:11,color:T.textSub}}>Déduit du solde disponible</div></div>
          </div>
          {/* Vendu */}
          <div onClick={()=>s("vendu",!form.vendu)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:form.vendu?"rgba(99,102,241,0.08)":T.surface2,border:`1px solid ${form.vendu?"rgba(99,102,241,0.3)":T.border}`,borderRadius:12,cursor:"pointer"}}>
            <div style={{width:24,height:24,borderRadius:6,background:form.vendu?"#6366f1":T.barBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{form.vendu?"✓":""}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>Carte vendue</div><div style={{fontSize:11,color:T.textSub}}>Re-crédite la liquidité</div></div>
          </div>
          {form.vendu && <input style={inp} type="number" placeholder="Prix de vente €" value={form.prixVente} onChange={e=>s("prixVente",e.target.value)}/>}
          <input style={inp} placeholder="Notes..." value={form.notes} onChange={e=>s("notes",e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:"15px",background:T.surface2,border:"none",borderRadius:14,color:T.textSub,cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit"}}>Annuler</button>
          <button onClick={()=>valid&&onSave({...form,id:card?.id||Date.now(),achat:parseFloat(form.achat),valeur:parseFloat(form.valeur),prixVente:form.prixVente?parseFloat(form.prixVente):null})}
            style={{flex:2,padding:"15px",background:valid?"linear-gradient(135deg,#f59e0b,#f97316)":T.barBg,border:"none",borderRadius:14,color:valid?"#000":T.textSub,fontWeight:800,cursor:valid?"pointer":"default",fontSize:15,fontFamily:"inherit"}}>
            {card?"Sauvegarder":"Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODE TOGGLE (quick switch Hold/Swing) ─────────────────────────────────────
function ModeToggle({ card, onChange, T }) {
  return (
    <div style={{display:"flex",gap:6}}>
      {["hold","swing"].map(m=>(
        <button key={m} onClick={e=>{e.stopPropagation();onChange(card,m);}}
          style={{padding:"4px 10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",border:"none",
            background:card.mode===m?(m==="hold"?"rgba(245,158,11,0.2)":"rgba(34,197,94,0.2)"):T.surface2,
            color:card.mode===m?(m==="hold"?"#f59e0b":"#22c55e"):T.textSub}}>
          {m==="hold"?"🏆":"📈"}
        </button>
      ))}
    </div>
  );
}

// ── CARD IMAGE ───────────────────────────────────────────────────────────────
function CardImage({ card, T }) {
  const [img, setImg] = useState(() => loadImages()[card.id] || null);
  const [autoImg, setAutoImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useState(null);
  const inputRef = { current: null };

  useEffect(() => {
    if (!img && card.tcg === "pokemon") {
      setLoading(true);
      fetchPokemonImage(card.name).then(url => { setAutoImg(url); setLoading(false); });
    }
  }, [card.id]);

  const displayed = img || autoImg;

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { saveImage(card.id, ev.target.result); setImg(ev.target.result); };
    reader.readAsDataURL(file);
  }

  function handleReset() { deleteImage(card.id); setImg(null); }

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: T.surface2, aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: 220 }}>
        {loading && <div style={{ color: T.textSub, fontSize: 13 }}>Chargement...</div>}
        {!loading && displayed && (
          <img src={displayed} alt={card.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={() => setAutoImg(null)} />
        )}
        {!loading && !displayed && (
          <div style={{ textAlign: "center", color: T.textSub, padding: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🃏</div>
            <div style={{ fontSize: 12 }}>Aucune image</div>
          </div>
        )}
        {/* Upload overlay */}
        <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 6 }}>
          <label style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>
            📷
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
          </label>
          {img && (
            <button onClick={handleReset} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.6)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>✕</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CARD ITEM ─────────────────────────────────────────────────────────────────
function CardItem({ card, tcgColor, onEdit, onDelete, onModeChange, T }) {
  const [open, setOpen] = useState(false);
  const sellPrice = card.vendu && card.prixVente ? card.prixVente : card.valeur;
  const gain = sellPrice - card.achat;
  const gainPct = parseFloat(pct(card.achat, sellPrice));
  const up = gain >= 0;
  const sc = card.statut.includes("PSA 10")||card.statut.includes("Pristine")?"#22c55e":card.statut.includes("PSA 9")||card.statut.includes("AFG")?"#f59e0b":card.statut.includes("transit")||card.statut.includes("Retour")?"#f97316":"#94a3b8";
  const modeColor = card.mode==="hold"?"#f59e0b":"#22c55e";
  return (
    <div style={{marginBottom:10,borderRadius:18,overflow:"hidden",border:`1px solid ${card.vendu?"rgba(99,102,241,0.3)":open?tcgColor+"44":T.border}`,background:card.vendu?"rgba(99,102,241,0.04)":T.surface}}>
      <div onClick={()=>setOpen(!open)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <div style={{width:4,height:46,borderRadius:2,background:card.vendu?"#6366f1":up?"#22c55e":"#ef4444",flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{fontSize:15,fontWeight:700,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
            {card.vendu&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"rgba(99,102,241,0.2)",color:"#818cf8",fontWeight:700,flexShrink:0}}>VENDU</span>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:sc+"20",color:sc,fontWeight:700,border:`1px solid ${sc}30`,flexShrink:0}}>{card.statut}</span>
            <span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:modeColor+"15",color:modeColor,fontWeight:700,flexShrink:0}}>{card.mode==="hold"?"🏆 Hold":"📈 Swing"}</span>
            <span style={{fontSize:11,color:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.langue}</span>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:19,fontWeight:900,color:card.vendu?"#818cf8":up?"#22c55e":"#ef4444",letterSpacing:"-0.5px"}}>{up?"+":""}{gainPct}%</div>
          <div style={{fontSize:12,color:card.vendu?"#818cf8":up?"#22c55e":"#ef4444"}}>{up?"+":""}{fmt(gain)}</div>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${T.border}`,padding:"14px 16px"}}>
          <CardImage card={card} T={T}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            {[["Achat",fmt(card.achat)],[card.vendu?"Vendu":"Actuel",fmt(sellPrice)],["P&L",(gain>=0?"+":"")+fmt(gain)],["ROI",(gainPct>=0?"+":"")+gainPct+"%"]].map(([k,v])=>(
              <div key={k} style={{background:T.surface2,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:T.textSub}}>Mode :</span>
            <ModeToggle card={card} onChange={onModeChange} T={T}/>
            {card.surLiquidite&&<span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(34,197,94,0.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.2)"}}>💰 Liquidité</span>}
          </div>
          {card.notes&&<div style={{fontSize:13,color:T.textSub,marginBottom:12,padding:"10px 12px",background:T.surface2,borderRadius:10,fontStyle:"italic"}}>{card.notes}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <a href={buildCMUrl(card)} target="_blank" rel="noopener noreferrer" style={{padding:"12px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,color:"#60a5fa",fontSize:13,textDecoration:"none",fontWeight:600,textAlign:"center",display:"block"}}>📊 Cardmarket</a>
            <a href={buildEbayUrl(card)} target="_blank" rel="noopener noreferrer" style={{padding:"12px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,color:"#eab308",fontSize:13,textDecoration:"none",fontWeight:600,textAlign:"center",display:"block"}}>🔍 eBay vendus</a>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button onClick={()=>onEdit(card)} style={{padding:"12px",background:T.surface2,border:`1px solid ${T.border}`,borderRadius:12,color:T.textSub,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>✏️ Modifier</button>
            <button onClick={()=>onDelete(card.tcg||"pokemon",card.id)} style={{padding:"12px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>🗑 Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MODE VIEW (Hold or Swing) ─────────────────────────────────────────────────
function ModeView({ mode, data, onEdit, onDelete, onModeChange, T }) {
  const modeColor = mode==="hold"?"#f59e0b":"#22c55e";
  const allCards = TCGS.flatMap(t=>(data[t.id]||[]).filter(c=>c.mode===mode&&!c.vendu).map(c=>({...c,tcg:c.tcg||t.id})));
  const totalInvesti = allCards.reduce((s,c)=>s+c.achat,0);
  const totalValeur = allCards.reduce((s,c)=>s+c.valeur,0);
  const gain = totalValeur - totalInvesti;
  const roi = parseFloat(pct(totalInvesti,totalValeur));

  return (
    <div>
      {/* Total stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[["Investi",fmt(totalInvesti),"#60a5fa"],["Valeur",fmt(totalValeur),T.text],["P&L",(gain>=0?"+":"")+fmt(gain),gain>=0?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
          <div key={k} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontSize:10,color:T.textSub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{k}</div>
            <div style={{fontSize:18,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      {totalInvesti>0&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,padding:"12px 16px",background:T.surface,borderRadius:14,border:`1px solid ${T.border}`}}>
          <span style={{fontSize:20}}>{roi>=0?"📈":"📉"}</span>
          <span style={{fontSize:15,fontWeight:800,color:roi>=0?"#22c55e":"#ef4444"}}>ROI {roi>=0?"+":""}{roi}%</span>
          <span style={{fontSize:12,color:T.textSub,marginLeft:"auto"}}>{allCards.length} carte{allCards.length>1?"s":""}</span>
        </div>
      )}

      {/* Cards by TCG */}
      {TCGS.map(tcg=>{
        const cards = (data[tcg.id]||[]).filter(c=>c.mode===mode&&!c.vendu).map(c=>({...c,tcg:tcg.id}));
        if(cards.length===0) return null;
        const inv = cards.reduce((s,c)=>s+c.achat,0);
        const val = cards.reduce((s,c)=>s+c.valeur,0);
        return (
          <div key={tcg.id} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>{tcg.icon}</span>
                <span style={{fontSize:15,fontWeight:800,color:tcg.color}}>{tcg.label}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:14,fontWeight:700,color:T.text}}>{fmt(val)}</div>
                <div style={{fontSize:11,color:(val-inv)>=0?"#22c55e":"#ef4444"}}>{(val-inv)>=0?"+":""}{fmt(val-inv)}</div>
              </div>
            </div>
            {cards.map(card=>(
              <CardItem key={card.id} card={card} tcgColor={tcg.color} onEdit={onEdit} onDelete={onDelete} onModeChange={onModeChange} T={T}/>
            ))}
          </div>
        );
      })}

      {allCards.length===0&&(
        <div style={{textAlign:"center",padding:"60px 20px",color:T.textSub}}>
          <div style={{fontSize:44,marginBottom:14}}>{mode==="hold"?"🏆":"📈"}</div>
          <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:6}}>Aucune carte en {mode}</div>
          <div style={{fontSize:14}}>Appuie sur + pour en ajouter</div>
        </div>
      )}
    </div>
  );
}

// ── LIQUIDITE VIEW ────────────────────────────────────────────────────────────
function LiquiditeView({ data, onInjecter, onEditInjection, onDeleteInjection, T }) {
  const { totalInjecte, totalAchats, totalVentes, solde } = calcLiquidite(data);
  const [showInject, setShowInject] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [montant, setMontant] = useState("");
  const [label, setLabel] = useState("");
  const historique = (data.liquidite?.historique||[]).slice().reverse();
  const inp = { background:T.inputBg,border:`1px solid ${T.border2}`,borderRadius:12,color:T.text,padding:"14px",fontSize:15,outline:"none",width:"100%",fontFamily:"inherit" };
  return (
    <div>
      <div style={{background:solde>=0?"linear-gradient(135deg,#052e16,#14532d)":"linear-gradient(135deg,#450a0a,#7f1d1d)",borderRadius:22,padding:"24px 20px",marginBottom:20,border:`1px solid ${solde>=0?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:120,height:120,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.1),transparent)"}}/>
        <div style={{fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Solde disponible</div>
        <div style={{fontSize:38,fontWeight:900,color:solde>=0?"#22c55e":"#ef4444",letterSpacing:"-1px",marginBottom:16}}>{fmt(solde)}</div>
        <button onClick={()=>setShowInject(true)} style={{padding:"12px 20px",background:"linear-gradient(135deg,#22c55e,#16a34a)",border:"none",borderRadius:12,color:"#000",fontWeight:800,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+ Injecter des fonds</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[["Injecté",fmt(totalInjecte),"#60a5fa"],["Dépensé",fmt(totalAchats),"#ef4444"],["Récupéré",fmt(totalVentes),"#22c55e"]].map(([k,v,c])=>(
          <div key={k} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{k}</div>
            <div style={{fontSize:17,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:T.textSub,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Historique</div>
      {historique.length===0?(
        <div style={{textAlign:"center",padding:"30px",color:T.textSub,fontSize:13}}>Aucun mouvement</div>
      ):(
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,overflow:"hidden"}}>
          {historique.slice(0,30).map((h,i)=>{
            const realIdx = historique.length-1-i;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderBottom:i<Math.min(historique.length,30)-1?`1px solid ${T.border}`:"none"}}>
                <div style={{width:36,height:36,borderRadius:10,background:h.type==="injection"?"rgba(34,197,94,0.15)":h.type==="vente"?"rgba(99,102,241,0.15)":"rgba(239,68,68,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                  {h.type==="injection"?"💵":h.type==="vente"?"✅":"🛒"}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.label}</div>
                  <div style={{fontSize:11,color:T.textSub}}>{h.date}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontSize:15,fontWeight:800,color:h.type==="achat"?"#ef4444":"#22c55e"}}>{h.type==="achat"?"-":"+"}{fmt(h.montant)}</div>
                  {h.type==="injection"&&<>
                    <button onClick={()=>{setEditingIdx(realIdx);setMontant(String(h.montant));setLabel(h.label);setShowInject(true);}} style={{width:28,height:28,borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
                    <button onClick={()=>onDeleteInjection(realIdx)} style={{width:28,height:28,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
                  </>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showInject&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={()=>{setShowInject(false);setEditingIdx(null);setMontant("");setLabel("");}}>
          <div style={{background:T.modalBg,borderRadius:"24px 24px 0 0",padding:"20px 20px 44px",width:"100%",maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:T.border2,borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:18}}>{editingIdx!==null?"✏️ Modifier l'injection":"💵 Injecter des fonds"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input style={inp} type="number" placeholder="Montant €" value={montant} onChange={e=>setMontant(e.target.value)}/>
              <input style={inp} placeholder="Label (ex: Virement initial)" value={label} onChange={e=>setLabel(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>{setShowInject(false);setEditingIdx(null);setMontant("");setLabel("");}} style={{flex:1,padding:"15px",background:T.surface2,border:"none",borderRadius:14,color:T.textSub,cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit"}}>Annuler</button>
              <button onClick={()=>{if(!montant)return;if(editingIdx!==null){onEditInjection(editingIdx,parseFloat(montant),label||"Injection");}else{onInjecter(parseFloat(montant),label||"Injection");}setMontant("");setLabel("");setShowInject(false);setEditingIdx(null);}}
                style={{flex:2,padding:"15px",background:montant?"linear-gradient(135deg,#22c55e,#16a34a)":T.barBg,border:"none",borderRadius:14,color:montant?"#000":T.textSub,fontWeight:800,cursor:montant?"pointer":"default",fontSize:15,fontFamily:"inherit"}}>
                {editingIdx!==null?"Modifier":"Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ data, T }) {
  const allCards = TCGS.flatMap(t=>(data[t.id]||[]).map(c=>({...c,tcg:t.id})));
  const actives = allCards.filter(c=>!c.vendu);
  const holdCards = actives.filter(c=>c.mode==="hold");
  const swingCards = actives.filter(c=>c.mode==="swing");
  const holdInvesti = holdCards.reduce((s,c)=>s+c.achat,0);
  const holdValeur = holdCards.reduce((s,c)=>s+c.valeur,0);
  const swingInvesti = swingCards.reduce((s,c)=>s+c.achat,0);
  const swingValeur = swingCards.reduce((s,c)=>s+c.valeur,0);
  const { solde, totalInjecte, totalAchats, totalVentes } = calcLiquidite(data);
  const totalInvesti = holdInvesti + swingInvesti;
  const totalValeur = holdValeur + swingValeur;
  const gain = totalValeur - totalInvesti;
  const roi = parseFloat(pct(totalInvesti, totalValeur));

  return (
    <div>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#131d35,#0f1624)",borderRadius:22,padding:"24px 20px",marginBottom:20,border:"1px solid rgba(99,102,241,0.2)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.1),transparent)"}}/>
        <div style={{fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Portefeuille total</div>
        <div style={{fontSize:38,fontWeight:900,color:"#f1f5f9",letterSpacing:"-1px",marginBottom:8}}>{fmt(totalValeur)}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700,color:gain>=0?"#22c55e":"#ef4444"}}>{gain>=0?"▲ +":"▼ "}{fmt(gain)}</span>
          <span style={{fontSize:12,color:"#475569"}}>vs {fmt(totalInvesti)} investi · {actives.length} cartes</span>
        </div>
        <div style={{display:"inline-flex",alignItems:"center",padding:"6px 14px",borderRadius:20,background:(roi>=0?"rgba(34,197,94,":"rgba(239,68,68,")+"0.15)",border:`1px solid ${(roi>=0?"rgba(34,197,94,":"rgba(239,68,68,")+"0.3)"}`}}>
          <span style={{fontSize:14,fontWeight:800,color:roi>=0?"#22c55e":"#ef4444"}}>ROI {roi>=0?"+":""}{roi}%</span>
        </div>
      </div>

      {/* Hold & Swing blocks */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {[{label:"Hold",icon:"🏆",color:"#f59e0b",inv:holdInvesti,val:holdValeur,count:holdCards.length},{label:"Swing",icon:"📈",color:"#22c55e",inv:swingInvesti,val:swingValeur,count:swingCards.length}].map(b=>{
          const g = b.val-b.inv;
          const r = parseFloat(pct(b.inv,b.val));
          return (
            <div key={b.label} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"16px 14px",borderTop:`3px solid ${b.color}`}}>
              <div style={{fontSize:13,fontWeight:800,color:b.color,marginBottom:10}}>{b.icon} {b.label}</div>
              <div style={{fontSize:11,color:T.textSub,marginBottom:2}}>Investi</div>
              <div style={{fontSize:18,fontWeight:900,color:T.text,marginBottom:4,letterSpacing:"-0.5px"}}>{fmt(b.inv)}</div>
              <div style={{fontSize:13,color:g>=0?"#22c55e":"#ef4444",marginBottom:4}}>{g>=0?"+":""}{fmt(g)}</div>
              <div style={{fontSize:11,color:T.textSub}}>{r>=0?"+":""}{r}% · {b.count} carte{b.count>1?"s":""}</div>
            </div>
          );
        })}
      </div>

      {/* Par TCG */}
      <div style={{fontSize:12,color:T.textSub,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Par TCG</div>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,marginBottom:22,scrollbarWidth:"none"}}>
        {TCGS.map(tcg=>{
          const cards = (data[tcg.id]||[]).filter(c=>!c.vendu);
          const inv = cards.reduce((s,c)=>s+c.achat,0);
          const val = cards.reduce((s,c)=>s+c.valeur,0);
          const holdC = cards.filter(c=>c.mode==="hold").length;
          const swingC = cards.filter(c=>c.mode==="swing").length;
          return (
            <div key={tcg.id} style={{flexShrink:0,width:148,background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"16px 14px",borderTop:`3px solid ${tcg.color}`}}>
              <div style={{fontSize:13,fontWeight:700,color:tcg.color,marginBottom:10}}>{tcg.icon} {tcg.label}</div>
              <div style={{fontSize:11,color:T.textSub,marginBottom:2}}>Investi</div>
              <div style={{fontSize:18,fontWeight:900,color:T.text,marginBottom:4,letterSpacing:"-0.5px"}}>{fmt(inv)}</div>
              <div style={{fontSize:13,color:(val-inv)>=0?"#22c55e":"#ef4444",marginBottom:6}}>{(val-inv)>=0?"+":""}{fmt(val-inv)}</div>
              <div style={{fontSize:11,color:T.textSub}}>🏆 {holdC} · 📈 {swingC}</div>
            </div>
          );
        })}
      </div>

      {/* Liquidité */}
      <div style={{fontSize:12,color:T.textSub,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:12}}>Liquidité</div>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:"18px 16px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:12,color:T.textSub,marginBottom:4}}>Solde disponible</div>
            <div style={{fontSize:26,fontWeight:900,color:solde>=0?"#22c55e":"#ef4444",letterSpacing:"-0.5px"}}>{fmt(solde)}</div>
          </div>
          <span style={{fontSize:32}}>💰</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["Injecté",fmt(totalInjecte),"#60a5fa"],["Dépensé",fmt(totalAchats),"#ef4444"],["Récupéré",fmt(totalVentes),"#22c55e"]].map(([k,v,c])=>(
            <div key={k} style={{background:T.surface2,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{k}</div>
              <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
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
  const [showReset, setShowReset] = useState(false);
  const T = THEMES[theme];

  useEffect(()=>{setMounted(true);},[]);
  useEffect(()=>{saveData(data);},[data]);
  useEffect(()=>{try{localStorage.setItem(THEME_KEY,theme);}catch{}},[theme]);

  function handleSave(card) {
    const tcg = card.tcg || "pokemon";
    setData(prev => {
      // Find original in any TCG
      let origTcg = null;
      for (const t of TCGS.map(t=>t.id)) {
        if ((prev[t]||[]).find(c=>c.id===card.id)) { origTcg=t; break; }
      }
      const wasVendu = origTcg ? (prev[origTcg]||[]).find(c=>c.id===card.id)?.vendu : false;
      const isNowVendu = card.vendu && card.prixVente;
      let nd = {...prev};
      if (origTcg && origTcg!==tcg) {
        nd[origTcg] = (prev[origTcg]||[]).filter(c=>c.id!==card.id);
        nd[tcg] = [...(prev[tcg]||[]), card];
      } else if (origTcg) {
        nd[tcg] = (prev[tcg]||[]).map(c=>c.id===card.id?card:c);
      } else {
        nd[tcg] = [...(prev[tcg]||[]), card];
      }
      let hist = [...(prev.liquidite?.historique||[])];
      if (!origTcg && card.surLiquidite) hist.push({type:"achat",montant:card.achat,label:`Achat : ${card.name}`,date:dateStr()});
      if (!wasVendu && isNowVendu && card.surLiquidite) hist.push({type:"vente",montant:card.prixVente,label:`Vente : ${card.name}`,date:dateStr()});
      return {...nd, liquidite:{...prev.liquidite,historique:hist}};
    });
    setModal(null);
  }

  function handleDelete(tcg, id) { setData(prev=>({...prev,[tcg]:(prev[tcg]||[]).filter(c=>c.id!==id)})); }

  function handleModeChange(card, newMode) {
    const tcg = card.tcg || "pokemon";
    setData(prev=>({...prev,[tcg]:(prev[tcg]||[]).map(c=>c.id===card.id?{...c,mode:newMode}:c)}));
  }

  function handleInjecter(montant,label) { setData(prev=>({...prev,liquidite:{...prev.liquidite,historique:[...(prev.liquidite?.historique||[]),{type:"injection",montant,label,date:dateStr()}]}})); }
  function handleEditInjection(idx,montant,label) { setData(prev=>{const h=[...(prev.liquidite?.historique||[])];h[idx]={...h[idx],montant,label};return{...prev,liquidite:{...prev.liquidite,historique:h}};}); }
  function handleDeleteInjection(idx) { setData(prev=>{const h=[...(prev.liquidite?.historique||[])];h.splice(idx,1);return{...prev,liquidite:{...prev.liquidite,historique:h}};}); }
  function handleReset() { try{localStorage.removeItem(STORAGE_KEY);}catch{} setData(defaultData); setShowReset(false); }

  const defaultTcg = activeTab==="hold"||activeTab==="swing" ? "pokemon" : activeTab;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}body{margin:0;padding:0;overscroll-behavior:none;}::-webkit-scrollbar{display:none;}input,select,button{font-family:inherit;}select option{background:#1a2235;color:#f1f5f9;}`}</style>
      <div style={{minHeight:"100dvh",background:T.bg,backgroundImage:T.bgGrad,fontFamily:"'Outfit',sans-serif",color:T.text,paddingBottom:84}}>
        {/* HEADER */}
        <div style={{padding:"56px 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:13,background:"linear-gradient(135deg,#f59e0b,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,boxShadow:"0 4px 14px rgba(245,158,11,0.4)"}}>⚡</div>
            <div>
              <div style={{fontSize:21,fontWeight:900,letterSpacing:"-0.5px",lineHeight:1.1}}>PokéVault</div>
              <div style={{fontSize:10,color:T.textSub,letterSpacing:"2px",textTransform:"uppercase"}}>Collection</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{width:40,height:40,borderRadius:13,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:19,display:"flex",alignItems:"center",justifyContent:"center"}}>{theme==="dark"?"☀️":"🌙"}</button>
            <button onClick={()=>setShowReset(true)} style={{width:40,height:40,borderRadius:13,background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:19,display:"flex",alignItems:"center",justifyContent:"center"}}>⚙️</button>
            {(activeTab==="hold"||activeTab==="swing"||TCGS.find(t=>t.id===activeTab))&&(
              <button onClick={()=>setModal({tcg:defaultTcg,mode:activeTab==="swing"?"swing":"hold"})} style={{width:40,height:40,borderRadius:13,background:"linear-gradient(135deg,#f59e0b,#f97316)",border:"none",color:"#000",fontWeight:900,cursor:"pointer",fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(245,158,11,0.35)"}}>+</button>
            )}
          </div>
        </div>
        <div style={{padding:"8px 20px 20px"}}>
          <div style={{fontSize:28,fontWeight:900,letterSpacing:"-0.5px"}}>
            {activeTab==="dashboard"?"Vue d'ensemble":activeTab==="hold"?"🏆 Hold":activeTab==="swing"?"📈 Swing":"💰 Liquidité"}
          </div>
        </div>
        <div style={{padding:"0 16px",opacity:mounted?1:0,transition:"opacity 0.3s"}}>
          {activeTab==="dashboard"&&<Dashboard data={data} T={T}/>}
          {(activeTab==="hold"||activeTab==="swing")&&<ModeView mode={activeTab} data={data} onEdit={card=>setModal({tcg:card.tcg||"pokemon",card})} onDelete={handleDelete} onModeChange={handleModeChange} T={T}/>}
          {activeTab==="liquidite"&&<LiquiditeView data={data} onInjecter={handleInjecter} onEditInjection={handleEditInjection} onDeleteInjection={handleDeleteInjection} T={T}/>}
        </div>
      </div>
      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.navBg,borderTop:`1px solid ${T.border}`,paddingBottom:"env(safe-area-inset-bottom,16px)",display:"flex",justifyContent:"space-around",zIndex:100}}>
        {NAV.map(n=>{
          const active=activeTab===n.id;
          const colors={"dashboard":"#f59e0b","hold":"#f59e0b","swing":"#22c55e","liquidite":"#22c55e"};
          const color=active?(colors[n.id]||"#f59e0b"):T.textSub;
          return (
            <button key={n.id} onClick={()=>setActiveTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"10px 8px 6px",minWidth:60}}>
              <span style={{fontSize:22,opacity:active?1:0.45,transition:"opacity 0.2s"}}>{n.icon}</span>
              <span style={{fontSize:10,fontWeight:active?700:500,color,transition:"color 0.2s"}}>{n.label}</span>
              {active&&<div style={{width:18,height:3,borderRadius:2,background:color,marginTop:1}}/>}
            </button>
          );
        })}
      </div>
      {modal&&<CardModal tcg={modal.tcg||"pokemon"} card={modal.card?{...modal.card,mode:modal.card.mode||(activeTab==="swing"?"swing":"hold")}:null} onSave={handleSave} onClose={()=>setModal(null)} T={T}/>}
      {showReset&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={()=>setShowReset(false)}>
          <div style={{background:T.modalBg,borderRadius:"24px 24px 0 0",padding:"20px 20px 44px",width:"100%",maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <div style={{width:40,height:4,background:T.border2,borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:6}}>⚙️ Paramètres</div>
            <div style={{fontSize:13,color:T.textSub,marginBottom:24}}>PokéVault v3.0</div>
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:15,fontWeight:700,color:"#ef4444",marginBottom:6}}>⚠️ Réinitialiser</div>
              <div style={{fontSize:13,color:T.textSub,marginBottom:14}}>Recharge les données par défaut. Toutes tes modifications seront perdues.</div>
              <button onClick={handleReset} style={{width:"100%",padding:"14px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:12,color:"#ef4444",cursor:"pointer",fontSize:15,fontWeight:700}}>Réinitialiser</button>
            </div>
            <button onClick={()=>setShowReset(false)} style={{width:"100%",marginTop:12,padding:"14px",background:T.surface2,border:"none",borderRadius:12,color:T.textSub,cursor:"pointer",fontSize:15,fontWeight:600}}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}
