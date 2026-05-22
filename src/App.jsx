import { useState, useEffect } from "react";

const STORAGE_KEY = "pokevault-v5";
const THEME_KEY = "pokevault-theme";
const IMG_KEY = "pokevault-images";

const defaultData = {
  pokemon: [],
  op: [],
  dbz: [],
  sealed: [],
  liquidite: { historique: [] },
};

function calcLiquidite(data) {
  const all = [...(data.pokemon||[]), ...(data.op||[]), ...(data.dbz||[])];
  const totalInjecte = (data.liquidite?.historique||[]).filter(h=>h.type==="injection").reduce((s,h)=>s+h.montant,0);
  const totalAchats = all.filter(c=>c.surLiquidite&&!c.vendu).reduce((s,c)=>s+c.achat,0);
  const totalVentes = all.filter(c=>c.vendu&&c.surLiquidite&&c.prixVente).reduce((s,c)=>s+c.prixVente,0);
  return { totalInjecte, totalAchats, totalVentes, solde: totalInjecte-totalAchats+totalVentes };
}
function loadData() { try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):defaultData; } catch { return defaultData; } }
function saveData(d) { try { localStorage.setItem(STORAGE_KEY,JSON.stringify(d)); } catch {} }
function loadTheme() { try { return localStorage.getItem(THEME_KEY)||"light"; } catch { return "light"; } }
function loadImages() { try { return JSON.parse(localStorage.getItem(IMG_KEY)||"{}"); } catch { return {}; } }
function saveImage(id,b64) { try { const i=loadImages(); i[id]=b64; localStorage.setItem(IMG_KEY,JSON.stringify(i)); } catch {} }
function deleteImage(id) { try { const i=loadImages(); delete i[id]; localStorage.setItem(IMG_KEY,JSON.stringify(i)); } catch {} }
async function fetchPokemonImage(name) {
  try {
    const clean=name.toLowerCase().replace(/&/g," ").replace(/gx|ex|vmax|vstar|\bv\b/gi,"").replace(/tag team/gi,"").replace(/sa|sr|rr|hr/gi,"").replace(/psa.*|cgc.*|afg.*/gi,"").replace(/\s+/g," ").trim().split(" ")[0];
    const res=await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(clean)}&pageSize=1&orderBy=-set.releaseDate`);
    const d=await res.json();
    return d.data?.[0]?.images?.large||d.data?.[0]?.images?.small||null;
  } catch { return null; }
}
const dateStr = () => new Date().toLocaleDateString("fr-FR");
const fmt = (n) => (n??0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+"€";
const pct = (a,b) => a===0?"0.0":((b-a)/a*100).toFixed(1);
const buildCMUrl = (c) => `https://www.cardmarket.com/fr/Pokemon/Products/Singles?searchString=${encodeURIComponent(c.name+" "+(c.numero||""))}&language=${{JP:"Japanese",EN:"English",FR:"French",CN:"Simplified Chinese",KR:"Korean"}[c.langue]||""}&minCondition=2`;
const buildEbayUrl = (c) => `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(c.name+" "+(c.numero||"")+" "+(c.langue||""))}&LH_Sold=1&LH_Complete=1`;

const THEMES = {
  light: {
    bg:"#F2F2F7", bgGrad:"none",
    surface:"#FFFFFF", surface2:"#F2F2F7",
    surfaceElevated:"#FFFFFF",
    border:"rgba(60,60,67,0.1)", border2:"rgba(60,60,67,0.18)",
    text:"#000000", textSub:"#8E8E93", textTertiary:"#C7C7CC",
    modalBg:"#F2F2F7", inputBg:"#FFFFFF",
    barBg:"#E5E5EA", navBg:"rgba(242,242,247,0.92)",
    shadow:"0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    shadowMd:"0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
    accent:"#007AFF", accentGreen:"#34C759", accentRed:"#FF3B30",
    accentOrange:"#FF9500", accentPurple:"#AF52DE",
    isDark:false,
  },
  dark: {
    bg:"#000000", bgGrad:"none",
    surface:"#1C1C1E", surface2:"#2C2C2E",
    surfaceElevated:"#3A3A3C",
    border:"rgba(255,255,255,0.08)", border2:"rgba(255,255,255,0.15)",
    text:"#FFFFFF", textSub:"#8E8E93", textTertiary:"#636366",
    modalBg:"#1C1C1E", inputBg:"#2C2C2E",
    barBg:"#3A3A3C", navBg:"rgba(0,0,0,0.85)",
    shadow:"0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
    shadowMd:"0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
    accent:"#0A84FF", accentGreen:"#30D158", accentRed:"#FF453A",
    accentOrange:"#FF9F0A", accentPurple:"#BF5AF2",
    isDark:true,
  },
};
const STATUTS = ["Raw NM","Raw LP","PSA 10","PSA 9","PSA 8","CGC Pristine 10","CGC 10","AFG 9.5 → PSA en cours","En attente PSA","En transit","Retour initié","Sealed","Gradé","Autre"];
const LANGUES = ["JP","EN","FR","CN","KR","Autre"];
const TCGS = [
  { id:"pokemon", label:"Pokémon", icon:"🎴", color:"#f59e0b" },
  { id:"op", label:"One Piece", icon:"☠️", color:"#ef4444" },
  { id:"dbz", label:"Dragon Ball", icon:"🐉", color:"#f97316" },
];
const NAV = [
  { id:"dashboard", icon:"⚡", label:"Accueil" },
  { id:"pokemon", icon:"🎴", label:"Pokémon" },
  { id:"op", icon:"☠️", label:"One Piece" },
  { id:"dbz", icon:"🐉", label:"DBZ" },
  { id:"sealed", icon:"📦", label:"Sealed" },
  { id:"vendues", icon:"✅", label:"Vendues" },
];

// ── CARD IMAGE ────────────────────────────────────────────────────────────────
function CardImage({ card, tcg, T, style }) {
  const [customImg,setCustomImg] = useState(()=>loadImages()[card.id]||null);
  const [autoImg,setAutoImg] = useState(null);
  const [loading,setLoading] = useState(false);
  useEffect(()=>{
    if(!customImg&&tcg==="pokemon"){
      setLoading(true);
      fetchPokemonImage(card.name).then(url=>{setAutoImg(url);setLoading(false);});
    }
  },[card.id]);
  const displayed=customImg||autoImg;
  function handleUpload(e){const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=ev=>{saveImage(card.id,ev.target.result);setCustomImg(ev.target.result);};r.readAsDataURL(file);}
  function handleReset(e){e.stopPropagation();deleteImage(card.id);setCustomImg(null);}
  return (
    <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:T.isDark?"#2C2C2E":"#F2F2F7",display:"flex",alignItems:"center",justifyContent:"center",...style}}>
      {loading&&<div style={{color:T.textSub,fontSize:11}}>...</div>}
      {!loading&&displayed&&<img src={displayed} alt={card.name} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setAutoImg(null)}/>}
      {!loading&&!displayed&&<div style={{textAlign:"center",color:T.textSub,fontSize:20}}>🃏</div>}
      <div style={{position:"absolute",bottom:4,right:4,display:"flex",gap:4}}>
        <label style={{width:24,height:24,borderRadius:6,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12}}>
          📷<input type="file" accept="image/*" style={{display:"none"}} onChange={handleUpload}/>
        </label>
        {customImg&&<button onClick={handleReset} style={{width:24,height:24,borderRadius:6,background:"rgba(239,68,68,0.7)",border:"none",color:"#fff",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
      </div>
    </div>
  );
}

// ── CARD MODAL ────────────────────────────────────────────────────────────────
function CardModal({ tcg, card, onSave, onClose, T }) {
  const empty={name:"",numero:"",set:"",langue:"JP",statut:"Raw NM",achat:"",valeur:"",surLiquidite:true,vendu:false,prixVente:"",notes:"",_tcg:tcg};
  const [form,setForm]=useState(card?{...card,prixVente:card.prixVente||"",_tcg:card._tcg||tcg}:empty);
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const valid=form.name&&form.achat&&form.valeur;
  const inp={background:T.isDark?"#2C2C2E":"#F2F2F7",border:"none",borderRadius:12,color:T.text,padding:"14px 16px",fontSize:15,outline:"none",width:"100%",WebkitAppearance:"none",fontFamily:"inherit"};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={onClose}>
      <div style={{background:T.modalBg,borderRadius:"24px 24px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 32px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,background:T.isDark?"#3A3A3C":"#D1D1D6",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:18}}>{card?"Modifier":"Nouvelle carte"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input style={inp} placeholder="Nom *" value={form.name} onChange={e=>s("name",e.target.value)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <input style={inp} placeholder="Numéro" value={form.numero} onChange={e=>s("numero",e.target.value)}/>
            <input style={inp} placeholder="Set" value={form.set} onChange={e=>s("set",e.target.value)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <select style={{...inp,cursor:"pointer"}} value={form.langue} onChange={e=>s("langue",e.target.value)}>{LANGUES.map(l=><option key={l}>{l}</option>)}</select>
            <select style={{...inp,cursor:"pointer"}} value={form.statut} onChange={e=>s("statut",e.target.value)}>{STATUTS.map(st=><option key={st}>{st}</option>)}</select>
          </div>
          <select style={{...inp,cursor:"pointer"}} value={form._tcg||tcg} onChange={e=>s("_tcg",e.target.value)}>
            {TCGS.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <input style={inp} type="number" placeholder="Prix achat €" value={form.achat} onChange={e=>s("achat",e.target.value)}/>
            <input style={inp} type="number" placeholder="Valeur actuelle €" value={form.valeur} onChange={e=>s("valeur",e.target.value)}/>
          </div>
          <div onClick={()=>s("surLiquidite",!form.surLiquidite)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:form.surLiquidite?"rgba(34,197,94,0.08)":T.surface2,border:`1px solid ${form.surLiquidite?"rgba(34,197,94,0.3)":T.border}`,borderRadius:12,cursor:"pointer"}}>
            <div style={{width:24,height:24,borderRadius:6,background:form.surLiquidite?"#22c55e":T.barBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#000",flexShrink:0}}>{form.surLiquidite?"✓":""}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>Achat sur liquidité</div><div style={{fontSize:11,color:T.textSub}}>Déduit du solde</div></div>
          </div>
          <div onClick={()=>s("vendu",!form.vendu)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:form.vendu?"rgba(99,102,241,0.08)":T.surface2,border:`1px solid ${form.vendu?"rgba(99,102,241,0.3)":T.border}`,borderRadius:12,cursor:"pointer"}}>
            <div style={{width:24,height:24,borderRadius:6,background:form.vendu?"#6366f1":T.barBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",flexShrink:0}}>{form.vendu?"✓":""}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>Carte vendue</div><div style={{fontSize:11,color:T.textSub}}>Bascule dans l'onglet Vendues</div></div>
          </div>
          {form.vendu&&<input style={inp} type="number" placeholder="Prix de vente €" value={form.prixVente} onChange={e=>s("prixVente",e.target.value)}/>}
          <input style={inp} placeholder="Notes..." value={form.notes} onChange={e=>s("notes",e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:"15px",background:T.isDark?"#3A3A3C":"#E5E5EA",border:"none",borderRadius:14,color:T.textSub,cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit"}}>Annuler</button>
          <button onClick={()=>valid&&onSave({...form,id:card?.id||Date.now(),achat:parseFloat(form.achat),valeur:parseFloat(form.valeur),prixVente:form.prixVente?parseFloat(form.prixVente):null,_tcg:form._tcg||tcg})}
            style={{flex:2,padding:"15px",background:valid?T.accent:T.isDark?"#3A3A3C":"#E5E5EA",border:"none",borderRadius:14,color:valid?"#fff":T.textSub,fontWeight:600,cursor:valid?"pointer":"default",fontSize:15,fontFamily:"inherit"}}>
            {card?"Sauvegarder":"Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CARD GRID ITEM ────────────────────────────────────────────────────────────
function CardGridItem({ card, tcg, tcgColor, onEdit, onDelete, T }) {
  const [open,setOpen]=useState(false);
  const gain=card.valeur-card.achat;
  const gainPct=parseFloat(pct(card.achat,card.valeur));
  const up=gain>=0;
  const sc=card.statut.includes("PSA 10")||card.statut.includes("Pristine")?"#22c55e":card.statut.includes("PSA 9")||card.statut.includes("AFG")?"#f59e0b":card.statut.includes("transit")||card.statut.includes("Retour")?"#f97316":"#94a3b8";
  return (
    <div style={{borderRadius:16,overflow:"hidden",background:T.surface,boxShadow:T.shadow,position:"relative"}}>
      <div onClick={()=>setOpen(!open)} style={{cursor:"pointer"}}>
        <CardImage card={card} tcg={tcg} T={T} style={{height:160,borderRadius:0}}/>
        <div style={{padding:"10px 10px 12px"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <span style={{fontSize:10,color:T.textSub}}>Achat</span>
            <span style={{fontSize:12,fontWeight:700,color:T.text}}>{fmt(card.achat)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:10,color:T.textSub}}>Actuel</span>
            <span style={{fontSize:12,fontWeight:700,color:up?"#22c55e":"#ef4444"}}>{fmt(card.valeur)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:sc+"20",color:sc,fontWeight:700,border:`1px solid ${sc}30`}}>{card.statut}</span>
            <span style={{fontSize:12,fontWeight:800,color:up?"#22c55e":"#ef4444"}}>{up?"+":""}{gainPct}%</span>
          </div>
        </div>
      </div>
      {open&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={()=>setOpen(false)}>
          <div style={{background:T.modalBg,borderRadius:"24px 24px 0 0",padding:"20px 20px 44px",width:"100%",maxWidth:500}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:T.isDark?"#3A3A3C":"#D1D1D6",borderRadius:2,margin:"0 auto 16px"}}/>
            <div style={{fontSize:16,fontWeight:800,color:T.text,marginBottom:14}}>{card.name}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
              {[["Achat",fmt(card.achat),"#60a5fa"],["Actuel",fmt(card.valeur),up?"#22c55e":"#ef4444"],["P&L",(gain>=0?"+":"")+fmt(gain),up?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
                <div key={k} style={{background:T.surface2,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:800,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            {card.notes&&<div style={{fontSize:13,color:T.textSub,marginBottom:12,padding:"10px 12px",background:T.surface2,borderRadius:10,fontStyle:"italic"}}>{card.notes}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <a href={buildCMUrl(card)} target="_blank" rel="noopener noreferrer" style={{padding:"11px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,color:"#60a5fa",fontSize:12,textDecoration:"none",fontWeight:600,textAlign:"center",display:"block"}}>📊 Cardmarket</a>
              <a href={buildEbayUrl(card)} target="_blank" rel="noopener noreferrer" style={{padding:"11px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,color:"#eab308",fontSize:12,textDecoration:"none",fontWeight:600,textAlign:"center",display:"block"}}>🔍 eBay vendus</a>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <button onClick={()=>{setOpen(false);onEdit(card);}} style={{padding:"12px",background:T.surface2,border:`1px solid ${T.border}`,borderRadius:12,color:T.textSub,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>✏️ Modifier</button>
              <button onClick={()=>{setOpen(false);onDelete(tcg,card.id);}} style={{padding:"12px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>🗑 Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CARD LIST ITEM ────────────────────────────────────────────────────────────
function CardListItem({ card, tcg, tcgColor, onEdit, onDelete, T }) {
  const [open,setOpen]=useState(false);
  const gain=card.valeur-card.achat;
  const gainPct=parseFloat(pct(card.achat,card.valeur));
  const up=gain>=0;
  const sc=card.statut.includes("PSA 10")||card.statut.includes("Pristine")?"#22c55e":card.statut.includes("PSA 9")||card.statut.includes("AFG")?"#f59e0b":card.statut.includes("transit")||card.statut.includes("Retour")?"#f97316":"#94a3b8";
  return (
    <div style={{marginBottom:10,borderRadius:16,overflow:"hidden",background:T.surface,boxShadow:open?T.shadowMd:T.shadow,transition:"box-shadow 0.2s"}}>
      <div onClick={()=>setOpen(!open)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <CardImage card={card} tcg={tcg} T={T} style={{width:48,height:64,borderRadius:8,flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
          <span style={{fontSize:11,padding:"2px 7px",borderRadius:6,background:sc+"20",color:sc,fontWeight:700,border:`1px solid ${sc}30`}}>{card.statut}</span>
          <div style={{fontSize:11,color:T.textSub,marginTop:4}}>{card.langue}{card.set&&card.set!=="—"?" · "+card.set:""}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:10,color:T.textSub,marginBottom:1}}>Achat</div>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>{fmt(card.achat)}</div>
          <div style={{fontSize:10,color:T.textSub,marginBottom:1}}>Actuel</div>
          <div style={{fontSize:14,fontWeight:800,color:up?"#22c55e":"#ef4444"}}>{fmt(card.valeur)}</div>
          <div style={{fontSize:11,color:up?"#22c55e":"#ef4444"}}>{up?"+":""}{gainPct}%</div>
        </div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${T.border}`,padding:"14px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            {[["Achat",fmt(card.achat)],["Actuel",fmt(card.valeur)],["P&L",(gain>=0?"+":"")+fmt(gain)],["ROI",(gainPct>=0?"+":"")+gainPct+"%"]].map(([k,v])=>(
              <div key={k} style={{background:T.isDark?"#2C2C2E":"#F2F2F7",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
                <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{k}</div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{v}</div>
              </div>
            ))}
          </div>
          {card.notes&&<div style={{fontSize:13,color:T.textSub,marginBottom:12,padding:"10px 12px",background:T.surface2,borderRadius:10,fontStyle:"italic"}}>{card.notes}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <a href={buildCMUrl(card)} target="_blank" rel="noopener noreferrer" style={{padding:"11px",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:12,color:"#60a5fa",fontSize:12,textDecoration:"none",fontWeight:600,textAlign:"center",display:"block"}}>📊 Cardmarket</a>
            <a href={buildEbayUrl(card)} target="_blank" rel="noopener noreferrer" style={{padding:"11px",background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,color:"#eab308",fontSize:12,textDecoration:"none",fontWeight:600,textAlign:"center",display:"block"}}>🔍 eBay vendus</a>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <button onClick={()=>onEdit(card)} style={{padding:"12px",background:T.surface2,border:`1px solid ${T.border}`,borderRadius:12,color:T.textSub,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>✏️ Modifier</button>
            <button onClick={()=>onDelete(tcg,card.id)} style={{padding:"12px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>🗑 Supprimer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TCG VIEW ──────────────────────────────────────────────────────────────────
function TcgView({ tcg, cards, onEdit, onDelete, T }) {
  const [viewMode,setViewMode]=useState("list");
  const [sort,setSort]=useState("achat-desc");
  const [showSort,setShowSort]=useState(false);
  const actives=[...cards.filter(c=>!c.vendu)].sort((a,b)=>{
    if(sort==="achat-asc") return a.achat-b.achat;
    if(sort==="achat-desc") return b.achat-a.achat;
    if(sort==="valeur-asc") return a.valeur-b.valeur;
    if(sort==="valeur-desc") return b.valeur-a.valeur;
    return 0;
  });
  const inv=actives.reduce((s,c)=>s+c.achat,0);
  const val=actives.reduce((s,c)=>s+c.valeur,0);
  const gain=val-inv;
  const roi=parseFloat(pct(inv,val));
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[["Investi",fmt(inv),"#60a5fa"],["Valeur",fmt(val),T.text],["P&L",(gain>=0?"+":"")+fmt(gain),gain>=0?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
          <div key={k} style={{background:T.surface,borderRadius:14,padding:"12px 10px",textAlign:"center",boxShadow:T.shadow}}>
            <div style={{fontSize:10,color:T.textSub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{k}</div>
            <div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      {inv>0&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:T.surface,borderRadius:14,boxShadow:T.shadow}}>
          <span style={{fontSize:18}}>{roi>=0?"📈":"📉"}</span>
          <span style={{fontSize:14,fontWeight:800,color:roi>=0?"#22c55e":"#ef4444"}}>ROI {roi>=0?"+":""}{roi}%</span>
          <span style={{fontSize:12,color:T.textSub,marginLeft:"auto"}}>{actives.length} carte{actives.length>1?"s":""}</span>
          {/* Sort */}
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowSort(s=>!s)} style={{padding:"4px 10px",borderRadius:8,fontSize:12,border:`1px solid ${T.border}`,cursor:"pointer",background:T.surface2,color:T.textSub,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
              ⇅ {sort==="achat-asc"?"Achat ↑":sort==="achat-desc"?"Achat ↓":sort==="valeur-asc"?"Actuel ↑":"Actuel ↓"}
            </button>
            {showSort&&(
              <div style={{position:"absolute",right:0,top:36,background:T.modalBg,border:`1px solid ${T.border2}`,borderRadius:12,overflow:"hidden",zIndex:50,minWidth:140,boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                {[["achat-desc","Achat ↓"],["achat-asc","Achat ↑"],["valeur-desc","Actuel ↓"],["valeur-asc","Actuel ↑"]].map(([v,l])=>(
                  <button key={v} onClick={()=>{setSort(v);setShowSort(false);}} style={{display:"block",width:"100%",padding:"12px 14px",textAlign:"left",background:sort===v?T.accent+"15":"transparent",color:sort===v?T.accent:T.text,border:"none",cursor:"pointer",fontSize:13,fontWeight:sort===v?700:500,fontFamily:"inherit"}}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Toggle */}
          <div style={{display:"flex",background:T.surface2,borderRadius:8,padding:2,gap:2}}>
            {[["grid","⊞"],["list","☰"]].map(([m,icon])=>(
              <button key={m} onClick={()=>setViewMode(m)} style={{padding:"4px 10px",borderRadius:6,fontSize:14,border:"none",cursor:"pointer",background:viewMode===m?T.accent+"18":"transparent",color:viewMode===m?T.accent:T.textSub,fontFamily:"inherit"}}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}
      {actives.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:T.textSub}}>
          <div style={{fontSize:44,marginBottom:14}}>📭</div>
          <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:6}}>Aucune carte</div>
          <div style={{fontSize:14}}>Appuie sur + pour en ajouter</div>
        </div>
      ):viewMode==="grid"?(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {actives.map(card=><CardGridItem key={card.id} card={card} tcg={tcg.id} tcgColor={tcg.color} onEdit={onEdit} onDelete={onDelete} T={T}/>)}
        </div>
      ):(
        actives.map(card=><CardListItem key={card.id} card={card} tcg={tcg.id} tcgColor={tcg.color} onEdit={onEdit} onDelete={onDelete} T={T}/>)
      )}
    </div>
  );
}

// ── VENDUES VIEW ──────────────────────────────────────────────────────────────
function VenduesView({ data, onRestaurer, T }) {
  const allVendues = TCGS.flatMap(t=>(data[t.id]||[]).filter(c=>c.vendu).map(c=>({...c,_tcg:t.id,_tcgLabel:t.label,_tcgColor:t.color})));
  const totalAchat = allVendues.reduce((s,c)=>s+c.achat,0);
  const totalVente = allVendues.filter(c=>c.prixVente).reduce((s,c)=>s+c.prixVente,0);
  const totalBenef = totalVente-totalAchat;
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[["Total acheté",fmt(totalAchat),"#60a5fa"],["Total vendu",fmt(totalVente),"#a78bfa"],["Bénéfice",(totalBenef>=0?"+":"")+fmt(totalBenef),totalBenef>=0?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
          <div key={k} style={{background:T.surface,borderRadius:14,padding:"12px 10px",textAlign:"center",boxShadow:T.shadow}}>
            <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{k}</div>
            <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      {allVendues.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:T.textSub}}>
          <div style={{fontSize:44,marginBottom:14}}>✅</div>
          <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:6}}>Aucune carte vendue</div>
          <div style={{fontSize:14}}>Les cartes marquées "vendu" apparaîtront ici</div>
        </div>
      ):allVendues.map(card=>{
        const benef=(card.prixVente||0)-card.achat;
        const benefPct=parseFloat(pct(card.achat,card.prixVente||card.achat));
        return (
          <div key={card.id} style={{marginBottom:10,borderRadius:16,overflow:"hidden",background:T.surface,boxShadow:T.shadow}}>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:4,height:52,borderRadius:2,background:benef>=0?"#22c55e":"#ef4444",flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{card.name}</div>
                <div style={{fontSize:11,color:T.textSub,marginBottom:6}}>{card._tcgLabel} · {card.langue}{card.set&&card.set!=="—"?" · "+card.set:""}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                  {[["Achat",fmt(card.achat),"#60a5fa"],["Vendu",fmt(card.prixVente||0),"#a78bfa"],["Bénéf.",(benef>=0?"+":"")+fmt(benef),benef>=0?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
                    <div key={k} style={{background:T.surface,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                      <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:18,fontWeight:900,color:benef>=0?"#22c55e":"#ef4444"}}>{benef>=0?"+":""}{benefPct}%</div>
                <button onClick={()=>onRestaurer(card._tcg,card.id)} style={{marginTop:8,padding:"6px 12px",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:8,color:"#818cf8",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",whiteSpace:"nowrap"}}>↩ Restaurer</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── LIQUIDITE VIEW ────────────────────────────────────────────────────────────
function LiquiditeView({ data, onInjecter, onEditInjection, onDeleteInjection, T }) {
  const { totalInjecte,totalAchats,totalVentes,solde }=calcLiquidite(data);
  const [showInject,setShowInject]=useState(false);
  const [editingIdx,setEditingIdx]=useState(null);
  const [montant,setMontant]=useState("");
  const [label,setLabel]=useState("");
  const historique=(data.liquidite?.historique||[]).slice().reverse();
  const inp={background:T.isDark?"#2C2C2E":"#F2F2F7",border:"none",borderRadius:12,color:T.text,padding:"14px 16px",fontSize:15,outline:"none",width:"100%",fontFamily:"inherit"};
  return (
    <div>
      <div style={{background:T.surface,borderRadius:22,padding:"24px 20px",marginBottom:20,boxShadow:T.shadowMd}}>
        <div style={{fontSize:13,color:T.textSub,fontWeight:500,marginBottom:4}}>Solde disponible</div>
        <div style={{fontSize:38,fontWeight:700,color:solde>=0?T.accentGreen:T.accentRed,letterSpacing:"-1.5px",marginBottom:16,lineHeight:1}}>{fmt(solde)}</div>
        <button onClick={()=>setShowInject(true)} style={{padding:"12px 20px",background:T.accentGreen,border:"none",borderRadius:12,color:"#fff",fontWeight:600,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+ Injecter des fonds</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
        {[["Injecté",fmt(totalInjecte),"#60a5fa"],["Dépensé",fmt(totalAchats),"#ef4444"],["Récupéré",fmt(totalVentes),"#22c55e"]].map(([k,v,c])=>(
          <div key={k} style={{background:T.surface,borderRadius:14,padding:"14px 10px",textAlign:"center",boxShadow:T.shadow}}>
            <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:5}}>{k}</div>
            <div style={{fontSize:17,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{fontSize:13,color:T.textSub,fontWeight:600,letterSpacing:"-0.2px",marginBottom:10,paddingLeft:4}}>Historique</div>
      {historique.length===0?<div style={{textAlign:"center",padding:"30px",color:T.textSub,fontSize:13}}>Aucun mouvement</div>:(
        <div style={{background:T.surface,borderRadius:18,overflow:"hidden",boxShadow:T.shadow}}>
          {historique.slice(0,30).map((h,i)=>{
            const realIdx=historique.length-1-i;
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
                  <div style={{fontSize:14,fontWeight:800,color:h.type==="achat"?"#ef4444":"#22c55e"}}>{h.type==="achat"?"-":"+"}{fmt(h.montant)}</div>
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
            <div style={{width:36,height:4,background:T.isDark?"#3A3A3C":"#D1D1D6",borderRadius:2,margin:"0 auto 20px"}}/>
            <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:18}}>{editingIdx!==null?"✏️ Modifier":"💵 Injecter des fonds"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <input style={inp} type="number" placeholder="Montant €" value={montant} onChange={e=>setMontant(e.target.value)}/>
              <input style={inp} placeholder="Label (ex: Virement initial)" value={label} onChange={e=>setLabel(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:18}}>
              <button onClick={()=>{setShowInject(false);setEditingIdx(null);setMontant("");setLabel("");}} style={{flex:1,padding:"15px",background:T.isDark?"#3A3A3C":"#E5E5EA",border:"none",borderRadius:14,color:T.textSub,cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit"}}>Annuler</button>
              <button onClick={()=>{if(!montant)return;editingIdx!==null?onEditInjection(editingIdx,parseFloat(montant),label||"Injection"):onInjecter(parseFloat(montant),label||"Injection");setMontant("");setLabel("");setShowInject(false);setEditingIdx(null);}}
                style={{flex:2,padding:"15px",background:montant?T.accentGreen:T.isDark?"#3A3A3C":"#E5E5EA",border:"none",borderRadius:14,color:montant?"#fff":T.textSub,fontWeight:600,cursor:montant?"pointer":"default",fontSize:15,fontFamily:"inherit"}}>
                {editingIdx!==null?"Modifier":"Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── SEALED VIEW ───────────────────────────────────────────────────────────────
const SEALED_TYPES = ["ETB", "Display", "Autre"];

function SealedModal({ item, onSave, onClose, T }) {
  const empty = { name:"", type:"ETB", set:"", langue:"EN", statut:"Sealed", achat:"", valeur:"", qty:1, notes:"" };
  const [form,setForm] = useState(item?{...item}:empty);
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const valid=form.name&&form.achat&&form.valeur;
  const inp={background:T.isDark?"#2C2C2E":"#F2F2F7",border:"none",borderRadius:12,color:T.text,padding:"14px 16px",fontSize:15,outline:"none",width:"100%",WebkitAppearance:"none",fontFamily:"inherit"};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={onClose}>
      <div style={{background:T.modalBg,borderRadius:"24px 24px 0 0",padding:"24px 20px 44px",width:"100%",maxWidth:500,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 -8px 32px rgba(0,0,0,0.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,background:T.isDark?"#3A3A3C":"#D1D1D6",borderRadius:2,margin:"0 auto 20px"}}/>
        <div style={{fontSize:18,fontWeight:800,color:T.text,marginBottom:18}}>{item?"Modifier":"Nouveau produit scellé"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input style={inp} placeholder="Nom *" value={form.name} onChange={e=>s("name",e.target.value)}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <select style={{...inp,cursor:"pointer"}} value={form.type} onChange={e=>s("type",e.target.value)}>{SEALED_TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <input style={inp} placeholder="Set" value={form.set} onChange={e=>s("set",e.target.value)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <select style={{...inp,cursor:"pointer"}} value={form.langue} onChange={e=>s("langue",e.target.value)}>{LANGUES.map(l=><option key={l}>{l}</option>)}</select>
            <input style={inp} type="number" placeholder="Quantité" value={form.qty} onChange={e=>s("qty",e.target.value)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <input style={inp} type="number" placeholder="Prix achat € (unitaire)" value={form.achat} onChange={e=>s("achat",e.target.value)}/>
            <input style={inp} type="number" placeholder="Valeur actuelle € (unitaire)" value={form.valeur} onChange={e=>s("valeur",e.target.value)}/>
          </div>
          <input style={inp} placeholder="Notes..." value={form.notes} onChange={e=>s("notes",e.target.value)}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button onClick={onClose} style={{flex:1,padding:"15px",background:T.isDark?"#3A3A3C":"#E5E5EA",border:"none",borderRadius:14,color:T.textSub,cursor:"pointer",fontSize:15,fontWeight:600,fontFamily:"inherit"}}>Annuler</button>
          <button onClick={()=>valid&&onSave({...form,id:item?.id||Date.now(),achat:parseFloat(form.achat),valeur:parseFloat(form.valeur),qty:parseInt(form.qty)||1})}
            style={{flex:2,padding:"15px",background:valid?T.accent:T.isDark?"#3A3A3C":"#E5E5EA",border:"none",borderRadius:14,color:valid?"#fff":T.textSub,fontWeight:600,cursor:valid?"pointer":"default",fontSize:15,fontFamily:"inherit"}}>
            {item?"Sauvegarder":"Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SealedView({ items, onAdd, onEdit, onDelete, T }) {
  const [showModal,setShowModal]=useState(false);
  const [editItem,setEditItem]=useState(null);
  useEffect(()=>{const h=()=>{setEditItem(null);setShowModal(true);};document.addEventListener("sealed-add",h);return()=>document.removeEventListener("sealed-add",h);},[]);
  const totalInvesti=items.reduce((s,i)=>s+i.achat*i.qty,0);
  const totalValeur=items.reduce((s,i)=>s+i.valeur*i.qty,0);
  const gain=totalValeur-totalInvesti;
  const roi=parseFloat(pct(totalInvesti,totalValeur));
  const grouped={ETB:[],Display:[],Autre:[]};
  items.forEach(i=>{ if(grouped[i.type]) grouped[i.type].push(i); else grouped["Autre"].push(i); });
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
        {[["Investi",fmt(totalInvesti),"#60a5fa"],["Valeur",fmt(totalValeur),T.text],["P&L",(gain>=0?"+":"")+fmt(gain),gain>=0?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
          <div key={k} style={{background:T.surface,borderRadius:14,padding:"12px 10px",textAlign:"center",boxShadow:T.shadow}}>
            <div style={{fontSize:10,color:T.textSub,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{k}</div>
            <div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      {totalInvesti>0&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,padding:"10px 14px",background:T.surface,borderRadius:12,border:`1px solid ${T.border}`}}>
          <span style={{fontSize:18}}>{roi>=0?"📈":"📉"}</span>
          <span style={{fontSize:14,fontWeight:800,color:roi>=0?"#22c55e":"#ef4444"}}>ROI {roi>=0?"+":""}{roi}%</span>
          <span style={{fontSize:12,color:T.textSub,marginLeft:"auto"}}>{items.length} produit{items.length>1?"s":""}</span>
        </div>
      )}
      {items.length===0?(
        <div style={{textAlign:"center",padding:"60px 20px",color:T.textSub}}>
          <div style={{fontSize:44,marginBottom:14}}>📦</div>
          <div style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:6}}>Aucun produit scellé</div>
          <div style={{fontSize:14}}>Appuie sur + pour en ajouter</div>
        </div>
      ):SEALED_TYPES.map(type=>{
        const group=grouped[type]||[];
        if(group.length===0) return null;
        return (
          <div key={type} style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:800,color:"#60a5fa",marginBottom:10}}>📦 {type}</div>
            {group.map(item=>{
              const g=(item.valeur-item.achat)*item.qty;
              const gPct=parseFloat(pct(item.achat,item.valeur));
              const up=g>=0;
              return (
                <div key={item.id} style={{marginBottom:10,borderRadius:16,overflow:"hidden",background:T.surface,boxShadow:T.shadow}}>
                  <div style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:4,height:52,borderRadius:2,background:up?"#22c55e":"#ef4444",flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</div>
                      <div style={{fontSize:11,color:T.textSub,marginBottom:6}}>{item.set&&item.set!=="—"?item.set+" · ":""}{item.langue} · x{item.qty}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                        {[["Achat/u",fmt(item.achat),"#60a5fa"],["Actuel/u",fmt(item.valeur),T.text],["P&L total",(g>=0?"+":"")+fmt(g),up?"#22c55e":"#ef4444"]].map(([k,v,c])=>(
                          <div key={k} style={{background:T.surface2,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                            <div style={{fontSize:9,color:T.textSub,textTransform:"uppercase",marginBottom:2}}>{k}</div>
                            <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:18,fontWeight:900,color:up?"#22c55e":"#ef4444"}}>{up?"+":""}{gPct}%</div>
                      <div style={{display:"flex",gap:6,marginTop:8}}>
                        <button onClick={()=>{setEditItem(item);setShowModal(true);}} style={{width:32,height:32,borderRadius:8,background:T.surface2,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
                        <button onClick={()=>onDelete(item.id)} style={{width:32,height:32,borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>🗑</button>
                      </div>
                    </div>
                  </div>
                  {item.notes&&<div style={{fontSize:12,color:T.textSub,padding:"0 16px 12px",fontStyle:"italic"}}>{item.notes}</div>}
                </div>
              );
            })}
          </div>
        );
      })}
      {showModal&&<SealedModal item={editItem} onSave={item=>{onEdit?onEdit(item):onAdd(item);setShowModal(false);setEditItem(null);}} onClose={()=>{setShowModal(false);setEditItem(null);}} T={T}/>}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ data, T, onGoLiquidite }) {
  const allCards=TCGS.flatMap(t=>(data[t.id]||[]).filter(c=>!c.vendu));
  const inv=allCards.reduce((s,c)=>s+c.achat,0);
  const val=allCards.reduce((s,c)=>s+c.valeur,0);
  const gain=val-inv;
  const roi=parseFloat(pct(inv,val));
  const { solde,totalInjecte,totalAchats,totalVentes }=calcLiquidite(data);
  const nbVendues=TCGS.flatMap(t=>(data[t.id]||[]).filter(c=>c.vendu)).length;
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#131d35,#0f1624)",borderRadius:22,padding:"24px 20px",marginBottom:20,border:"1px solid rgba(99,102,241,0.2)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,158,11,0.1),transparent)"}}/>
        <div style={{fontSize:12,color:"#64748b",textTransform:"uppercase",letterSpacing:"2px",marginBottom:6}}>Portefeuille total</div>
        <div style={{fontSize:38,fontWeight:900,color:"#f1f5f9",letterSpacing:"-1px",marginBottom:8}}>{fmt(val)}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:15,fontWeight:700,color:gain>=0?"#22c55e":"#ef4444"}}>{gain>=0?"▲ +":"▼ "}{fmt(gain)}</span>
          <span style={{fontSize:12,color:"#475569"}}>vs {fmt(inv)} · {allCards.length} cartes</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <div style={{display:"inline-flex",alignItems:"center",padding:"6px 14px",borderRadius:20,background:(roi>=0?"rgba(34,197,94,":"rgba(239,68,68,")+"0.15)",border:`1px solid ${(roi>=0?"rgba(34,197,94,":"rgba(239,68,68,")+"0.3)"}`}}>
            <span style={{fontSize:14,fontWeight:800,color:roi>=0?"#22c55e":"#ef4444"}}>ROI {roi>=0?"+":""}{roi}%</span>
          </div>

        </div>
      </div>
      <div style={{fontSize:13,color:T.textSub,fontWeight:600,letterSpacing:"-0.2px",marginBottom:10,paddingLeft:4}}>Par TCG</div>
      <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:6,marginBottom:22,scrollbarWidth:"none"}}>
        {TCGS.map(tcg=>{
          const cards=(data[tcg.id]||[]).filter(c=>!c.vendu);
          const i=cards.reduce((s,c)=>s+c.achat,0);
          const v=cards.reduce((s,c)=>s+c.valeur,0);
          return (
            <div key={tcg.id} style={{flexShrink:0,width:148,background:T.surface,borderRadius:18,padding:"16px 14px",borderTop:`3px solid ${tcg.color}`,boxShadow:T.shadow}}>
              <div style={{fontSize:13,fontWeight:700,color:tcg.color,marginBottom:10}}>{tcg.icon} {tcg.label}</div>
              <div style={{fontSize:11,color:T.textSub,marginBottom:2}}>Investi</div>
              <div style={{fontSize:17,fontWeight:900,color:T.text,marginBottom:4}}>{fmt(i)}</div>
              <div style={{fontSize:13,color:(v-i)>=0?"#22c55e":"#ef4444",marginBottom:4}}>{(v-i)>=0?"+":""}{fmt(v-i)}</div>
              <div style={{fontSize:11,color:T.textSub}}>{cards.length} carte{cards.length>1?"s":""}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontSize:13,color:T.textSub,fontWeight:600,letterSpacing:"-0.2px",marginBottom:10,paddingLeft:4}}>Scellé</div>
      {(()=>{const si=data.sealed||[];const inv=si.reduce((s,i)=>s+i.achat*i.qty,0);const val=si.reduce((s,i)=>s+i.valeur*i.qty,0);const g=val-inv;return si.length>0?(<div style={{background:T.surface,borderRadius:18,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:16,boxShadow:T.shadow}}>
        <span style={{fontSize:28}}>📦</span>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>{si.length} produit{si.length>1?"s":""}</div><div style={{fontSize:12,color:T.textSub}}>Investi : {fmt(inv)}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:800,color:T.text}}>{fmt(val)}</div><div style={{fontSize:12,color:g>=0?"#22c55e":"#ef4444"}}>{g>=0?"+":""}{fmt(g)}</div></div>
      </div>):null})()}
      <div style={{fontSize:13,color:T.textSub,fontWeight:600,letterSpacing:"-0.2px",marginBottom:10,paddingLeft:4}}>Liquidité</div>
      <div onClick={()=>onGoLiquidite()} style={{background:T.surface,borderRadius:18,padding:"18px 16px",cursor:"pointer",boxShadow:T.shadowMd}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:12,color:T.textSub,marginBottom:4}}>Solde disponible</div>
            <div style={{fontSize:26,fontWeight:900,color:solde>=0?"#22c55e":"#ef4444"}}>{fmt(solde)}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:32}}>💰</span>
            <span style={{fontSize:18,color:T.textSub}}>›</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[["Injecté",fmt(totalInjecte),"#60a5fa"],["Dépensé",fmt(totalAchats),"#ef4444"],["Récupéré",fmt(totalVentes),"#22c55e"]].map(([k,v,c])=>(
            <div key={k} style={{background:T.isDark?"#2C2C2E":"#F2F2F7",borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
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
  const [data,setData]=useState(loadData);
  const [activeTab,setActiveTab]=useState("dashboard");
  const [modal,setModal]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [theme,setTheme]=useState(loadTheme);
  const T=THEMES[theme];

  useEffect(()=>{setMounted(true);},[]);
  useEffect(()=>{saveData(data);},[data]);
  useEffect(()=>{try{localStorage.setItem(THEME_KEY,theme);}catch{}},[theme]);

  function handleSave(card) {
    const sourceTcg = activeTab;
    const targetTcg = card._tcg || sourceTcg;
    setData(prev=>{
      let nd = {...prev};
      const sourceList = prev[sourceTcg]||[];
      const exists = sourceList.find(c=>c.id===card.id);
      const wasVendu = exists?.vendu;
      if(exists && targetTcg !== sourceTcg) {
        // Move card to new TCG
        nd[sourceTcg] = sourceList.filter(c=>c.id!==card.id);
        nd[targetTcg] = [...(prev[targetTcg]||[]), card];
      } else if(exists) {
        nd[sourceTcg] = sourceList.map(c=>c.id===card.id?card:c);
      } else {
        nd[targetTcg] = [...(prev[targetTcg]||[]), card];
      }
      let hist=[...(prev.liquidite?.historique||[])];
      if(!exists&&card.surLiquidite) hist.push({type:"achat",montant:card.achat,label:`Achat : ${card.name}`,date:dateStr()});
      if(!wasVendu&&card.vendu&&card.prixVente&&card.surLiquidite) hist.push({type:"vente",montant:card.prixVente,label:`Vente : ${card.name}`,date:dateStr()});
      return {...nd,liquidite:{...prev.liquidite,historique:hist}};
    });
    setModal(null);
  }

  function handleDelete(tcg,id){setData(prev=>({...prev,[tcg]:(prev[tcg]||[]).filter(c=>c.id!==id)}));}
  function handleSealedSave(item){setData(prev=>{const list=prev.sealed||[];const exists=list.find(i=>i.id===item.id);return{...prev,sealed:exists?list.map(i=>i.id===item.id?item:i):[...list,item]};});}
  function handleSealedDelete(id){setData(prev=>({...prev,sealed:(prev.sealed||[]).filter(i=>i.id!==id)}));}
  function handleRestaurer(tcg,id){setData(prev=>({...prev,[tcg]:(prev[tcg]||[]).map(c=>c.id===id?{...c,vendu:false,prixVente:null}:c)}));}
  function handleInjecter(m,l){setData(prev=>({...prev,liquidite:{...prev.liquidite,historique:[...(prev.liquidite?.historique||[]),{type:"injection",montant:m,label:l,date:dateStr()}]}}));}
  function handleEditInjection(idx,m,l){setData(prev=>{const h=[...(prev.liquidite?.historique||[])];h[idx]={...h[idx],montant:m,label:l};return{...prev,liquidite:{...prev.liquidite,historique:h}};});}
  function handleDeleteInjection(idx){setData(prev=>{const h=[...(prev.liquidite?.historique||[])];h.splice(idx,1);return{...prev,liquidite:{...prev.liquidite,historique:h}};});}

  const activeTcg=TCGS.find(t=>t.id===activeTab);
  const nbVendues=TCGS.flatMap(t=>(data[t.id]||[]).filter(c=>c.vendu)).length;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        body{margin:0;padding:0;overscroll-behavior:none;-webkit-font-smoothing:antialiased;}
        ::-webkit-scrollbar{display:none;}
        input,select,button{font-family:inherit;}
        select option{background:#fff;color:#000;}
      `}</style>
      <div style={{minHeight:"100dvh",background:T.bg,fontFamily:"-apple-system,'SF Pro Display','Inter',sans-serif",color:T.text,paddingBottom:90}}>
        {/* HEADER */}
        <div style={{padding:"56px 20px 0px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(145deg,#FF9500,#FF3B30)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 2px 8px rgba(255,59,48,0.3)"}}>⚡</div>
            <span style={{fontSize:20,fontWeight:700,letterSpacing:"-0.5px",color:T.text}}>PokéVault</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{width:34,height:34,borderRadius:"50%",background:T.surface,border:`1px solid ${T.border}`,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.shadow}}>{theme==="dark"?"☀️":"🌙"}</button>
            {(activeTcg||activeTab==="sealed")&&(
              <button onClick={()=>activeTcg?setModal({tcg:activeTab}):document.dispatchEvent(new CustomEvent("sealed-add"))}
                style={{width:34,height:34,borderRadius:"50%",background:T.accent,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${T.accent}55`}}>+</button>
            )}
          </div>
        </div>
        {/* PAGE TITLE */}
        <div style={{padding:"20px 20px 16px"}}>
          <div style={{fontSize:32,fontWeight:700,letterSpacing:"-0.8px",color:T.text}}>
            {activeTab==="dashboard"?"Vue d'ensemble":activeTab==="liquidite"?"Liquidité":activeTab==="vendues"?"Cartes vendues":activeTab==="sealed"?"Produits scellés":activeTcg?.label}
          </div>
        </div>
        <div style={{padding:"0 16px",opacity:mounted?1:0,transition:"opacity 0.4s"}}>
          {activeTab==="dashboard"&&<Dashboard data={data} T={T} onGoLiquidite={()=>setActiveTab("liquidite")}/>}
          {activeTcg&&<TcgView tcg={activeTcg} cards={data[activeTab]||[]} onEdit={card=>setModal({tcg:activeTab,card})} onDelete={handleDelete} T={T}/>}
          {activeTab==="liquidite"&&<LiquiditeView data={data} onInjecter={handleInjecter} onEditInjection={handleEditInjection} onDeleteInjection={handleDeleteInjection} T={T}/>}
          {activeTab==="sealed"&&<SealedView items={data.sealed||[]} onAdd={handleSealedSave} onEdit={handleSealedSave} onDelete={handleSealedDelete} T={T}/>}
          {activeTab==="vendues"&&<VenduesView data={data} onRestaurer={handleRestaurer} T={T}/>}
        </div>
      </div>
      {/* BOTTOM NAV - Apple Tab Bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:T.navBg,borderTop:`1px solid ${T.border}`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",paddingBottom:"env(safe-area-inset-bottom,8px)",display:"flex",justifyContent:"space-around",zIndex:100}}>
        {NAV.map(n=>{
          const active=activeTab===n.id;
          const color=active?T.accent:T.textSub;
          return (
            <button key={n.id} onClick={()=>setActiveTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",padding:"8px 6px 4px",minWidth:52,position:"relative",transition:"all 0.15s"}}>
              <span style={{fontSize:22,opacity:active?1:0.5,transition:"all 0.15s",filter:active?"none":"grayscale(0.3)"}}>{n.icon}</span>
              <span style={{fontSize:10,fontWeight:active?600:400,color,transition:"color 0.15s",letterSpacing:"-0.2px"}}>{n.label}</span>
              {n.id==="vendues"&&nbVendues>0&&!active&&<div style={{position:"absolute",top:4,right:8,minWidth:16,height:16,borderRadius:8,background:T.accentRed,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",padding:"0 3px"}}>{nbVendues}</div>}
            </button>
          );
        })}
      </div>
      {modal&&<CardModal tcg={modal.tcg} card={modal.card} onSave={handleSave} onClose={()=>setModal(null)} T={T}/>}
    </>
  );
}