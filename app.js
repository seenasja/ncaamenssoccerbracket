// --- CONFIG ---
const AUTO_SAVE_KEY = "ncaa_bracket_autosave";

// Team logos
const teamLogos = {
  "Vermont": "https://a.espncdn.com/i/teamlogos/ncaa/500/261.png",
  "Virginia": "https://a.espncdn.com/i/teamlogos/ncaa/500/258.png",
  "Princeton": "https://a.espncdn.com/i/teamlogos/ncaa/500/163.png",
  "Maryland": "https://a.espncdn.com/i/teamlogos/ncaa/500/120.png",
  "SMU": "https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png",
  "Indiana": "https://a.espncdn.com/i/teamlogos/ncaa/500/84.png",
  "Georgetown": "https://a.espncdn.com/i/teamlogos/ncaa/500/46.png",
  "Portland": "https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png",
  "San Diego": "https://a.espncdn.com/i/teamlogos/ncaa/500/301.png",
  "High Point": "https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png",
  "Bryant": "https://a.espncdn.com/i/teamlogos/ncaa/500/2066.png",
  "Stanford": "https://a.espncdn.com/i/teamlogos/ncaa/500/24.png",
  "UConn": "https://a.espncdn.com/i/teamlogos/ncaa/500/41.png",
  "Akron": "https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png",
  "NC State": "https://a.espncdn.com/i/teamlogos/ncaa/500/152.png",
  "Furman": "https://a.espncdn.com/i/teamlogos/ncaa/500/231.png",
  "Duke": "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png",
  "Syracuse": "https://a.espncdn.com/i/teamlogos/ncaa/500/183.png",
  "Clemson": "https://a.espncdn.com/i/teamlogos/ncaa/500/228.png",
  "Denver": "https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png",
  "Cornell": "https://a.espncdn.com/i/teamlogos/ncaa/500/167.png",
  "North Carolina": "https://a.espncdn.com/i/teamlogos/ncaa/500/153.png",
  "UCF": "https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png",
  "West Virginia": "https://a.espncdn.com/i/teamlogos/ncaa/500/277.png",
  "Marshall": "https://a.espncdn.com/i/teamlogos/ncaa/500/276.png",
  "Saint Louis": "https://a.espncdn.com/i/teamlogos/ncaa/500/139.png",
  "Oregon St.": "https://a.espncdn.com/i/teamlogos/ncaa/500/204.png",
  "UCLA": "https://a.espncdn.com/i/teamlogos/ncaa/500/26.png",
  "Michigan": "https://a.espncdn.com/i/teamlogos/ncaa/500/130.png",
  "Notre Dame": "https://a.espncdn.com/i/teamlogos/ncaa/500/87.png",
  "Pitt": "https://a.espncdn.com/i/teamlogos/ncaa/500/221.png"
};

// --- DOM ---
const bracketRoot = document.getElementById('bracket');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');

// --- Model ---
let rounds = [];
const round1Teams = Object.keys(teamLogos).slice(0,32);
const seededTeams = Object.keys(teamLogos).slice(0,16);

function getLogo(team){ return teamLogos[team]||null; }

function buildMatches(arr){
  const matches = [];
  for(let i=0;i<arr.length;i+=2){
    matches.push({teamA: arr[i]||null, teamB: arr[i+1]||null, winner:null, logoA:getLogo(arr[i]), logoB:getLogo(arr[i+1])});
  }
  return matches;
}

function initRounds(){
  const r1 = buildMatches(round1Teams);
  const r2 = seededTeams.map((team,i)=>({teamA:team,teamB:`Winner R1-${i+1}`,winner:null,logoA:getLogo(team),logoB:null}));
  const r3 = Array.from({length:8},()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const qf = Array.from({length:4},()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const sf = Array.from({length:2},()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const f = [{teamA:null,teamB:null,winner:null,logoA:null,logoB:null}];
  rounds = [r1,r2,r3,qf,sf,f];
  loadAutoSave();
  render();
}

function render(){
  bracketRoot.innerHTML = '';
  const labels = ['First Round','Second Round','Third Round','Quarterfinals','Semifinals','Final'];
  rounds.forEach((rMatches,rIdx)=>{
    const col = document.createElement('div'); col.className='round';
    const h2 = document.createElement('h2'); h2.innerText=labels[rIdx]; col.appendChild(h2);
    rMatches.forEach((m,mIdx)=>{
      const match = document.createElement('div'); match.className='match';
      ['A','B'].forEach(side=>{
        const btn = document.createElement('div'); btn.className='teamBtn';
        const team = m['team'+side]; 
        if(team) btn.onclick=()=> pick(rIdx,mIdx,team);
        if(m.winner===team) btn.classList.add('picked');
        const logoUrl = m['logo'+side]; if(logoUrl){ const img=document.createElement('img'); img.className='logo'; img.src=logoUrl; img.onerror=()=>img.style.display='none'; btn.appendChild(img);}
        const nameDiv=document.createElement('div'); nameDiv.className='name'; nameDiv.innerText=team||'—'; btn.appendChild(nameDiv);
        match.appendChild(btn);
      });
      col.appendChild(match);
    });
    bracketRoot.appendChild(col);
  });
}

function pick(rIdx,mIdx,team){
  rounds[rIdx][mIdx].winner=team;
  propagate(rIdx,mIdx,team);
  autoSave();
  render();
}

function propagate(rIdx,mIdx,team){
  if(rIdx===rounds.length-1) return;
  const nextMatch=Math.floor(mIdx/2);
  const slot=(mIdx%2===0)?'teamA':'teamB';
  rounds[rIdx+1][nextMatch][slot]=team;
  rounds[rIdx+1][nextMatch]['logo'+(slot==='teamA'?'A':'B')]=getLogo(team);
}

function autoSave(){ localStorage.setItem(AUTO_SAVE_KEY,JSON.stringify(rounds)); }
function loadAutoSave(){ const saved=localStorage.getItem(AUTO_SAVE_KEY); if(saved) rounds=JSON.parse(saved); }

// --- Buttons ---
exportBtn.onclick=()=>{ const blob=new Blob([JSON.stringify(rounds,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='bracket.json'; a.click(); }
importBtn.onclick=()=>importFile.click();
importFile.onchange=(e)=>{ const f=e.target.files[0]; if(!f) return; const reader=new FileReader(); reader.onload=ev=>{ rounds=JSON.parse(ev.target.result); render(); autoSave(); }; reader.readAsText(f);}
resetBtn.onclick=()=>{ if(confirm('Reset bracket?')){ localStorage.removeItem(AUTO_SAVE_KEY); initRounds(); }}

// --- Init ---
initRounds();
