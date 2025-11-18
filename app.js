/* script.js
   Bracket app: logos (left of team names), autosave, sharing, GET submission
*/

// ------------- CONFIG -------------
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx1unaY6FhZjdr04v39BnOCVhO8cGwkegL1iMN5vZjfeeV25p8qN2Y9saiYnEwYAZJ-qg/exec";
const LEADERBOARD_URL = SHEETS_WEBHOOK_URL;
const AUTO_SAVE_KEY = "ncaa_bracket_autosave";
const CONFIDENCE_MODE = false;

// ------------- LOGOS MAP -------------
const teamLogos = {
  "Vermont":"https://a.espncdn.com/i/teamlogos/ncaa/500/261.png",
  "Virginia":"https://a.espncdn.com/i/teamlogos/ncaa/500/258.png",
  "Princeton":"https://a.espncdn.com/i/teamlogos/ncaa/500/163.png",
  "Maryland":"https://a.espncdn.com/i/teamlogos/ncaa/500/120.png",
  "SMU":"https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png",
  "Indiana":"https://a.espncdn.com/i/teamlogos/ncaa/500/84.png",
  "Georgetown":"https://a.espncdn.com/i/teamlogos/ncaa/500/46.png",
  "Portland":"https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png",
  "San Diego":"https://a.espncdn.com/i/teamlogos/ncaa/500/301.png",
  "High Point":"https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png",
  "Bryant":"https://a.espncdn.com/i/teamlogos/ncaa/500/2066.png",
  "Stanford":"https://a.espncdn.com/i/teamlogos/ncaa/500/24.png",
  "UConn":"https://a.espncdn.com/i/teamlogos/ncaa/500/41.png",
  "Akron":"https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png",
  "NC State":"https://a.espncdn.com/i/teamlogos/ncaa/500/152.png",
  "Furman":"https://a.espncdn.com/i/teamlogos/ncaa/500/231.png",
  "Duke":"https://a.espncdn.com/i/teamlogos/ncaa/500/150.png",
  "Syracuse":"https://a.espncdn.com/i/teamlogos/ncaa/500/183.png",
  "Clemson":"https://a.espncdn.com/i/teamlogos/ncaa/500/228.png",
  "Denver":"https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png",
  "Cornell":"https://a.espncdn.com/i/teamlogos/ncaa/500/167.png",
  "North Carolina":"https://a.espncdn.com/i/teamlogos/ncaa/500/153.png",
  "UCF":"https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png",
  "West Virginia":"https://a.espncdn.com/i/teamlogos/ncaa/500/277.png",
  "Marshall":"https://a.espncdn.com/i/teamlogos/ncaa/500/276.png",
  "Saint Louis":"https://a.espncdn.com/i/teamlogos/ncaa/500/139.png",
  "Oregon St.":"https://a.espncdn.com/i/teamlogos/ncaa/500/204.png",
  "UCLA":"https://a.espncdn.com/i/teamlogos/ncaa/500/26.png",
  "Michigan":"https://a.espncdn.com/i/teamlogos/ncaa/500/130.png",
  "Notre Dame":"https://a.espncdn.com/i/teamlogos/ncaa/500/87.png",
  "Pitt":"https://a.espncdn.com/i/teamlogos/ncaa/500/221.png",
  "Hofstra":"https://a.espncdn.com/i/teamlogos/ncaa/500/2275.png",
  "Elon":"https://a.espncdn.com/i/teamlogos/ncaa/500/2210.png",
  "UNC Greensboro":"https://a.espncdn.com/i/teamlogos/ncaa/500/2430.png",
  "Cleveland State":"https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png",
  "North Florida":"https://a.espncdn.com/i/teamlogos/ncaa/500/2454.png",
  "Lafayette":"https://a.espncdn.com/i/teamlogos/ncaa/500/322.png",
  "St. John's (NY)":"https://a.espncdn.com/i/teamlogos/ncaa/500/747.png",
  "Florida Atlantic":"https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png",
  "Kansas City":"https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png",
  "Lindenwood":"https://a.espncdn.com/i/teamlogos/ncaa/500/2336.png",
  "Washington":"https://a.espncdn.com/i/teamlogos/ncaa/500/264.png",
  "Kentucky":"https://a.espncdn.com/i/teamlogos/ncaa/500/96.png",
  "Siena":"https://a.espncdn.com/i/teamlogos/ncaa/500/2561.png",
  "Seton Hall":"https://a.espncdn.com/i/teamlogos/ncaa/500/2550.png",
  "UC Irvine":"https://a.espncdn.com/i/teamlogos/ncaa/500/300.png",
  "Grand Canyon":"https://a.espncdn.com/i/teamlogos/ncaa/500/2253.png",
  "Western Michigan":"https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png",
  "Fairleigh Dickinson":"https://a.espncdn.com/i/teamlogos/ncaa/500/161.png"
};

// ------------- PLACEHOLDERS -------------
let round1Teams = [
  "A1","A2","B1","B2","C1","C2","D1","D2",
  "E1","E2","F1","F2","G1","G2","H1","H2",
  "I1","I2","J1","J2","K1","K2","L1","L2",
  "M1","M2","N1","N2","O1","O2","P1","P2"
];
let seededTeams = [
  "Seed 1","Seed 2","Seed 3","Seed 4","Seed 5","Seed 6","Seed 7","Seed 8",
  "Seed 9","Seed10","Seed11","Seed12","Seed13","Seed14","Seed15","Seed16"
];

// ------------- DOM -------------
const bracketRoot = document.getElementById('bracket');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const applyTeamsBtn = document.getElementById('applyTeams');
const fillExampleBtn = document.getElementById('fillExample');
const teamsJsonArea = document.getElementById('teamsJson');
const publishResultsBtn = document.getElementById('publishResults');
const clearResultsBtn = document.getElementById('clearResults');
const submitBtn = document.getElementById('submitBtn');
const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');
const leaderboardRows = document.getElementById('leaderboardRows');
const AUTO_SAVE = AUTO_SAVE_KEY;

// ------------- MODEL -------------
let rounds = [];
let confidencePoints = {};
let officialResultsPublished = false;

// ------------- HELPERS -------------
function getLogo(team) {
  if (!team) return null;
  return teamLogos[team] || null;
}

// Resolves placeholders like "Winner R2-5"
function resolvePlaceholder(name) {
  if (!name) return {display:'—', logo:null, clickable:false};
  if (!name.toString().startsWith('Winner R')) {
    return {display: name, logo: getLogo(name), clickable: (name !== '—' && !name.toString().startsWith('Seed'))};
  }
  const m = name.match(/Winner R(\d+)-(\d+)/i);
  if (!m) return {display:'Winner', logo:null, clickable:false};
  const rIdx = parseInt(m[1],10) - 1;
  const matchIdx = parseInt(m[2],10) - 1;
  if (!rounds[rIdx] || !rounds[rIdx][matchIdx]) return {display:'Winner', logo:null, clickable:false};
  const source = rounds[rIdx][matchIdx];
  if (source.winner) {
    const winner = source.winner;
    return {display: winner, logo: (source.teamA===winner?source.logoA:source.logoB) || getLogo(winner), clickable:true};
  }
  return {display:'Winner', logo:null, clickable:false};
}

// ------------- BUILD / INIT -------------
function buildMatchesFromTeams(arr){
  const matches = [];
  for(let i=0;i<arr.length;i+=2){
    const teamA = arr[i]||null;
    const teamB = arr[i+1]||null;
    matches.push({
      teamA, teamB, winner: null, logoA: getLogo(teamA), logoB: getLogo(teamB)
    });
  }
  return matches;
}

function initRounds(){
  const r1 = buildMatchesFromTeams(round1Teams);
  const r32 = [];
  for(let i=0;i<16;i++){
    const seedTeam = seededTeams[i]||null;
    r32.push({
      teamA: seedTeam,
      teamB: `Winner R1-${i+1}`,
      winner: null,
      logoA: getLogo(seedTeam),
      logoB: null
    });
  }
  const r16 = Array.from({length:8}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const qf = Array.from({length:4}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const sf = Array.from({length:2}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const f = [{teamA:null,teamB:null,winner:null,logoA:null,logoB:null}];

  rounds = [r1,r32,r16,qf,sf,f];
  autoPropagateAll();
  loadAutoSave();
  loadFromURL();
  render();
}

// ------------- RENDER -------------
function render(){
  bracketRoot.innerHTML = '';
  const labels = ['First Round','Second Round','Third Round','Quarterfinals','Semifinals','Final'];
  rounds.forEach((roundMatches, rIdx) => {
    const col = document.createElement('div');
    col.className = 'round';
    if (rIdx === rounds.length-1) col.classList.add('final-round');
    const title = document.createElement('div');
    title.className = 'round-title';
    title.innerText = labels[rIdx];
    col.appendChild(title);

    roundMatches.forEach((m, mIdx) => {
      const match = document.createElement('div');
      match.className = 'match';

      // team A
      const resA = resolvePlaceholder(m.teamA);
      const a = document.createElement('div');
      a.className = 'teamBtn' + (m.winner === resA.display ? ' picked' : '');
      if (resA.clickable) a.addEventListener('click', ()=> handlePick(rIdx,mIdx,resA.display));
      else a.style.cursor = 'default';
      if (resA.logo){
        const img = document.createElement('img'); img.className='logo'; img.src = resA.logo; img.onerror = ()=> img.style.display='none';
        a.appendChild(img);
      }
      const nameA = document.createElement('div'); nameA.className='name'; nameA.innerText = resA.display || '—';
      a.appendChild(nameA);

      // team B
      const resB = resolvePlaceholder(m.teamB);
      const b = document.createElement('div');
      b.className = 'teamBtn' + (m.winner === resB.display ? ' picked' : '');
      if (resB.clickable) b.addEventListener('click', ()=> handlePick(rIdx,mIdx,resB.display));
      else b.style.cursor = 'default';
      if (resB.logo){
        const imgb = document.createElement('img'); imgb.className='logo'; imgb.src = resB.logo; imgb.onerror = ()=> imgb.style.display='none';
        b.appendChild(imgb);
      }
      const nameB = document.createElement('div'); nameB.className='name'; nameB.innerText = resB.display || '—';
      b.appendChild(nameB);

      match.appendChild(a);
      match.appendChild(b);
      col.appendChild(match);
    });

    bracketRoot.appendChild(col);
  });
}

// ------------- PICK & PROPAGATE -------------
function handlePick(roundIdx, matchIdx, winnerName){
  if (!winnerName || winnerName === '—') return;
  const matchObj = rounds[roundIdx][matchIdx];
  if (!matchObj) return;

  matchObj.winner = winnerName;

  // propagate downstream
  if (roundIdx === 0) {
    // 2nd-round layout expects teamB filled at index matchIdx
    if (rounds[1] && rounds[1][matchIdx]) {
      rounds[1][matchIdx].teamB = winnerName;
      rounds[1][matchIdx].logoB = (matchObj.teamA === winnerName ? matchObj.logoA : matchObj.logoB) || getLogo(winnerName);
    }
    clearDownstreamFrom(1, matchIdx);
  } else {
    const nextMatch = Math.floor(matchIdx/2);
    const slot = (matchIdx % 2 === 0) ? 'teamA' : 'teamB';
    if (rounds[roundIdx+1] && rounds[roundIdx+1][nextMatch]) {
      rounds[roundIdx+1][nextMatch][slot] = winnerName;
      const logo = (matchObj.teamA === winnerName? matchObj.logoA : matchObj.logoB) || getLogo(winnerName);
      rounds[roundIdx+1][nextMatch][slot === 'teamA' ? 'logoA' : 'logoB'] = logo;
    }
    clearDownstreamFrom(roundIdx+1, nextMatch);
  }

  autoSave();
  render();
}

function clearDownstreamFrom(roundIdx, matchIdx){
  for(let r=roundIdx; r<rounds.length; r++){
    rounds[r].forEach(m => { m.winner = null; });
    if (r > roundIdx){
      rounds[r].forEach(m => {
        if (m.teamA && m.teamA.toString().startsWith('Winner')) m.teamA = null;
        if (m.teamB && m.teamB.toString().startsWith('Winner')) m.teamB = null;
      });
    }
  }
}

function autoPropagateAll(){
  for(let r=0;r<rounds.length-1;r++){
    const cur = rounds[r];
    const nxt = rounds[r+1];
    cur.forEach((m,i)=>{
      const w = m.winner || null;
      if (r===0){
        if (w && (!nxt[i].teamB || nxt[i].teamB.toString().startsWith('Winner'))) {
          nxt[i].teamB = w;
          const match = rounds[0][i];
          nxt[i].logoB = (match.teamA===w ? match.logoA : match.logoB);
        }
      } else {
        const nm = Math.floor(i/2);
        const slot = (i%2===0) ? 'teamA' : 'teamB';
        if (w && (!nxt[nm][slot] || nxt[nm][slot].toString().startsWith('Winner'))) {
          nxt[nm][slot] = w;
          const logo = (m.teamA===w ? m.logoA : m.logoB);
          nxt[nm][slot === 'teamA'?'logoA':'logoB'] = logo;
        }
      }
    });
  }
}

// ------------- AUTO-SAVE -------------
function autoSave(){
  try{
    const data = { rounds, confidencePoints, player: playerNameInput.value, email: playerEmailInput.value, ts: new Date().toISOString() };
    localStorage.setItem(AUTO_SAVE, JSON.stringify(data));
  } catch(e){ console.warn('Auto-save failed', e); }
}

function loadAutoSave(){
  try {
    const s = localStorage.getItem(AUTO_SAVE);
    if (!s) return;
    const d = JSON.parse(s);
    if (d.rounds && d.rounds.length === rounds.length){
      rounds = d.rounds;
      confidencePoints = d.confidencePoints || {};
      if (d.player) playerNameInput.value = d.player;
      if (d.email) playerEmailInput.value = d.email;
      console.log('Loaded autosave');
    }
  } catch(e){ console.warn('loadAutoSave failed', e); }
}

function clearAutoSave(){ localStorage.removeItem(AUTO_SAVE); }

// ------------- SHARE / URL -------------
function generateShareURL(){
  const data = { r: rounds, p: playerNameInput.value || 'Anonymous' };
  const encoded = btoa(JSON.stringify(data));
  const u = new URL(window.location.href);
  u.searchParams.set('bracket', encoded);
  return u.toString();
}
function loadFromURL(){
  const params = new URLSearchParams(window.location.search);
  const b = params.get('bracket');
  if (!b) return;
  try {
    const decoded = JSON.parse(atob(b));
    if (decoded.r && decoded.r.length === rounds.length){
      rounds = decoded.r;
      if (decoded.p) playerNameInput.value = decoded.p + ' (shared)';
      console.log('Loaded from URL');
    }
  } catch(e){ console.warn('loadFromURL error', e); }
}

// ------------- EXPORT / IMPORT -------------
exportBtn && exportBtn.addEventListener('click', ()=>{
  const payload = { player: playerNameInput.value || 'Anonymous', email: playerEmailInput.value || '', rounds, confidencePoints };
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${(playerNameInput.value||'bracket').replace(/\s+/g,'_')}_bracket.json`; a.click();
});

importBtn && importBtn.addEventListener('click', ()=> importFile.click());
importFile && importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      if (d.rounds){ rounds = d.rounds; confidencePoints = d.confidencePoints || {}; render(); autoSave(); alert('Imported'); }
      else alert('Invalid JSON (missing rounds)');
    } catch(err){ alert('Parse error: '+err.message); }
  };
  r.readAsText(f);
});

// ------------- ADMIN: Apply Teams -------------
applyTeamsBtn && applyTeamsBtn.addEventListener('click', ()=>{
  try {
    const obj = JSON.parse(teamsJsonArea.value);
    if (!Array.isArray(obj.round1) || !Array.isArray(obj.seeds) || obj.round1.length !== 32 || obj.seeds.length !== 16){
      alert('Expect {round1:[32], seeds:[16]}');
      return;
    }
    round1Teams = obj.round1.slice();
    seededTeams = obj.seeds.slice();
    clearAutoSave();
    initRounds();
    alert('Teams applied.');
  } catch(e){ alert('Invalid JSON: '+e.message); }
});

fillExampleBtn && fillExampleBtn.addEventListener('click', ()=>{
  teamsJsonArea.value = JSON.stringify({round1: round1Teams, seeds: seededTeams},null,2);
  alert('Example filled.');
});

// ------------- ADMIN: publish/clear (POST preserved) -------------
publishResultsBtn && publishResultsBtn.addEventListener('click', async ()=>{
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Set SHEETS_WEBHOOK_URL'); return; }
  try {
    const payload = { action:'publishResults', rounds, admin:true, ts: new Date().toISOString() };
    const res = await fetch(SHEETS_WEBHOOK_URL, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const txt = await res.text();
    if (res.ok) { alert('Published: '+txt); fetchLeaderboard(); } else alert('Publish failed: '+txt);
  } catch(e){ alert('Publish error: '+e.message); }
});

clearResultsBtn && clearResultsBtn.addEventListener('click', async ()=>{
  if (!confirm('Clear official results?')) return;
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Set SHEETS_WEBHOOK_URL'); return; }
  try {
    const payload = { action:'clearResults', admin:true, ts: new Date().toISOString() };
    const res = await fetch(SHEETS_WEBHOOK_URL, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const txt = await res.text();
    if (res.ok) { alert('Cleared: '+txt); fetchLeaderboard(); } else alert('Clear failed: '+txt);
  } catch(e){ alert('Clear error: '+e.message); }
});

// ------------- SUBMIT (GET workaround) -------------
submitBtn && submitBtn.addEventListener('click', ()=>{
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Set SHEETS_WEBHOOK_URL'); return; }
  const player = playerNameInput.value || 'Anonymous';
  const email = playerEmailInput.value || '';
  const payload = { action:'submitBracket', player, email, rounds, confidencePoints, ts: new Date().toISOString() };
  const url = SHEETS_WEBHOOK_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));

  fetch(url)
    .then(async res => {
      const txt = await res.text();
      try { return JSON.parse(txt); } catch(e){ throw new Error('Invalid response: '+txt); }
    })
    .then(json => {
      if (json.result === 'success') { alert('Saved — thank you!'); fetchLeaderboard(); }
      else alert('Submit failed: '+(json.message || 'unknown'));
    })
    .catch(err => { console.error('Submit error', err); alert('Submit error — check console'); });
});

// ------------- LEADERBOARD -------------
async function fetchLeaderboard(){
  if (!LEADERBOARD_URL.includes('https://')) { leaderboardRows.innerText = "Set LEADERBOARD_URL"; return; }
  try {
    const res = await fetch(LEADERBOARD_URL);
    if (!res.ok) { leaderboardRows.innerText = "Error fetching leaderboard"; return; }
    const data = await res.json();
    renderLeaderboard(data);
  } catch(e){ leaderboardRows.innerText = "Leaderboard error: "+e.message; }
}

function renderLeaderboard(data){
  leaderboardRows.innerHTML = '';
  if (!data || !data.rows || data.rows.length === 0) { leaderboardRows.innerText = "No submissions yet."; return; }
  data.rows.forEach((r, idx) => {
    const row = document.createElement('div'); row.className = 'leaderRow';
    const name = document.createElement('div'); name.className='name'; name.innerText = `${idx+1}. ${r.player}${r.email? ' ('+r.email+')' : ''}`;
    const score = document.createElement('div'); score.className='score'; score.innerText = r.score;
    row.appendChild(name); row.appendChild(score);
    leaderboardRows.appendChild(row);
  });
}

// ------------- INIT -------------
initRounds();
fetchLeaderboard();

// debug helpers
window.__rounds = ()=> JSON.parse(JSON.stringify(rounds));
window.__fetchLeaderboard = fetchLeaderboard;
window.__clearAutoSave = clearAutoSave;
