/* Enhanced bracket app with logos, animations, auto-save, confidence points, and sharing
   New Features:
   - Team logos from ESPN CDN
   - Auto-save to localStorage
   - Smooth animations
   - Confidence points system (optional)
   - Shareable bracket URLs
*/

// ------------------ CONFIG ------------------
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx1unaY6FhZjdr04v39BnOCVhO8cGwkegL1iMN5vZjfeeV25p8qN2Y9saiYnEwYAZJ-qg/exec";
const LEADERBOARD_URL = "https://script.google.com/macros/s/AKfycbx1unaY6FhZjdr04v39BnOCVhO8cGwkegL1iMN5vZjfeeV25p8qN2Y9saiYnEwYAZJ-qg/exec";
const AUTO_SAVE_KEY = "ncaa_bracket_autosave";
const CONFIDENCE_MODE = false; // Set to true to enable confidence points

// Team ID mapping for ESPN logos
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
  "Pitt": "https://a.espncdn.com/i/teamlogos/ncaa/500/221.png",
  // Missing teams added below
  "Hofstra": "https://a.espncdn.com/i/teamlogos/ncaa/500/2275.png",
  "Elon": "https://a.espncdn.com/i/teamlogos/ncaa/500/2210.png",
  "UNC Greensboro": "https://a.espncdn.com/i/teamlogos/ncaa/500/2430.png",
  "Cleveland State": "https://a.espncdn.com/i/teamlogos/ncaa/500/2132.png",
  "North Florida": "https://a.espncdn.com/i/teamlogos/ncaa/500/2454.png",
  "Lafayette": "https://a.espncdn.com/i/teamlogos/ncaa/500/322.png",
  "St. John's (NY)": "https://a.espncdn.com/i/teamlogos/ncaa/500/747.png",
  "Florida Atlantic": "https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png",
  "Kansas City": "https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png",
  "Lindenwood": "https://a.espncdn.com/i/teamlogos/ncaa/500/2336.png",
  "Washington": "https://a.espncdn.com/i/teamlogos/ncaa/500/264.png",
  "Kentucky": "https://a.espncdn.com/i/teamlogos/ncaa/500/96.png",
  "Siena": "https://a.espncdn.com/i/teamlogos/ncaa/500/2561.png",
  "Seton Hall": "https://a.espncdn.com/i/teamlogos/ncaa/500/2550.png",
  "UC Irvine": "https://a.espncdn.com/i/teamlogos/ncaa/500/300.png",
  "Grand Canyon": "https://a.espncdn.com/i/teamlogos/ncaa/500/2253.png",
  "Western Michigan": "https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png",
  "Fairleigh Dickinson": "https://a.espncdn.com/i/teamlogos/ncaa/500/161.png"
};

// Placeholders
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

// DOM
const bracketRoot = document.getElementById('bracket');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const applyTeamsBtn = document.getElementById('applyTeams');
const fillExampleBtn = document.getElementById('fillExample');
const teamsJsonArea = document.getElementById('teamsJson');
const resultsJsonArea = document.getElementById('resultsJson');
const publishResultsBtn = document.getElementById('publishResults');
const clearResultsBtn = document.getElementById('clearResults');
const submitBtn = document.getElementById('submitBtn');
const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');
const leaderboardDiv = document.getElementById('leaderboard');
const toggleViewBtn = document.getElementById('toggleViewBtn');

// Model
let rounds = [];
let confidencePoints = {}; // {roundIdx-matchIdx: points}
let officialResultsPublished = false;

// Get logo URL for team
function getTeamLogo(teamName) {
  if (!teamName || teamName.startsWith('Winner') || teamName === '—' || teamName.startsWith('Seed')) return null;
  return teamLogos[teamName] || null;
}

function buildMatchesFromTeams(arr){
  const matches = [];
  for(let i=0;i<arr.length;i+=2){
    const teamA = arr[i]||null;
    const teamB = arr[i+1]||null;
    matches.push({
      teamA, 
      teamB, 
      winner: null, 
      logoA: getTeamLogo(teamA), 
      logoB: getTeamLogo(teamB)
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
      winner:null, 
      logoA: getTeamLogo(seedTeam), 
      logoB:null
    });
  }
  const r16 = Array.from({length:8}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const qf = Array.from({length:4}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const sf = Array.from({length:2}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const f = [{teamA:null,teamB:null,winner:null,logoA:null,logoB:null}];

  rounds = [r1,r32,r16,qf,sf,f];
  autoPropagateAll();
  
  // Try to load from auto-save
  loadAutoSave();
  
  // Try to load from URL
  loadFromURL();
  
  render();
}

// Render round columns and matches
function render(){
  bracketRoot.innerHTML = '';
  const labels = ['First Round','Second Round','Third Round','Quarterfinals','Semifinals','Final'];
  rounds.forEach((roundMatches, rIdx) => {
    const col = document.createElement('div');
    col.className = 'round';
    col.style.opacity = '0';
    col.style.transform = 'translateY(20px)';
    
    const title = document.createElement('h2');
    title.innerText = labels[rIdx];
    col.appendChild(title);

    roundMatches.forEach((m, mIdx) => {
      const match = document.createElement('div');
      match.className = 'match';

      // Team A element
      const a = document.createElement('div');
      a.className = 'teamBtn' + (m.winner === m.teamA ? ' picked' : '');
      a.onclick = ()=> handlePick(rIdx,mIdx,m.teamA);
      
      if (m.logoA){
        const img = document.createElement('img'); 
        img.className='logo'; 
        img.src = m.logoA;
        img.onerror = () => img.style.display = 'none'; // Hide if logo fails
        a.appendChild(img);
      }
      const nameA = document.createElement('div'); 
      nameA.className='name'; 
      nameA.innerText = m.teamA || '—';
      a.appendChild(nameA);

      // Team B element
      const b = document.createElement('div');
      b.className = 'teamBtn' + (m.winner === m.teamB ? ' picked' : '');
      b.onclick = ()=> handlePick(rIdx,mIdx,m.teamB);
      
      if (m.logoB){
        const imgb = document.createElement('img'); 
        imgb.className='logo'; 
        imgb.src = m.logoB;
        imgb.onerror = () => imgb.style.display = 'none';
        b.appendChild(imgb);
      }
      const nameB = document.createElement('div'); 
      nameB.className='name'; 
      nameB.innerText = m.teamB || '—';
      b.appendChild(nameB);

      match.appendChild(a);
      match.appendChild(b);
      col.appendChild(match);
    });

    bracketRoot.appendChild(col);
    
    // Animate in
    setTimeout(() => {
      col.style.transition = 'all 0.5s ease';
      col.style.opacity = '1';
      col.style.transform = 'translateY(0)';
    }, rIdx * 100);
  });
}

// Click picking + propagation
function handlePick(roundIdx, matchIdx, winnerName){
  if (!winnerName || winnerName.toString().startsWith('Winner') || winnerName==='—') return;
  
  rounds[roundIdx][matchIdx].winner = winnerName;

  // downstream clearing
  if (roundIdx === 0) {
    const match = rounds[0][matchIdx];
    const winnerLogo = (match.teamA===winnerName ? match.logoA : match.logoB);
    rounds[1][matchIdx].teamB = winnerName; 
    rounds[1][matchIdx].logoB = winnerLogo;
    clearDownstreamFrom(1, matchIdx);
  } else {
    const nextMatch = Math.floor(matchIdx/2);
    const slot = (matchIdx %2 === 0) ? 'teamA' : 'teamB';
    rounds[roundIdx+1][nextMatch][slot] = winnerName;
    
    const prev = rounds[roundIdx][matchIdx];
    const logo = (prev.teamA===winnerName?prev.logoA:prev.logoB) || null;
    rounds[roundIdx+1][nextMatch][slot === 'teamA'?'logoA':'logoB'] = logo;
    clearDownstreamFrom(roundIdx+1,nextMatch);
  }
  
  // Auto-save after each pick
  autoSave();
  
  render();
}

function clearDownstreamFrom(roundIdx, matchIdx){
  for(let r=roundIdx; r<rounds.length; r++){
    rounds[r].forEach(m=> m.winner = null);
    if (r>roundIdx){
      rounds[r].forEach(m=>{
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

// AUTO-SAVE FUNCTIONALITY
function autoSave() {
  try {
    const data = {
      rounds,
      confidencePoints,
      player: playerNameInput.value,
      email: playerEmailInput.value,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
  } catch(e) {
    console.warn('Auto-save failed:', e);
  }
}

function loadAutoSave() {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.rounds && data.rounds.length === rounds.length) {
        rounds = data.rounds;
        confidencePoints = data.confidencePoints || {};
        if (data.player) playerNameInput.value = data.player;
        if (data.email) playerEmailInput.value = data.email;
        console.log('✓ Bracket restored from auto-save');
      }
    }
  } catch(e) {
    console.warn('Could not load auto-save:', e);
  }
}

function clearAutoSave() {
  localStorage.removeItem(AUTO_SAVE_KEY);
}

// SHARE FUNCTIONALITY
function generateShareURL() {
  const data = {r: rounds, p: playerNameInput.value || 'Anonymous'};
  const encoded = btoa(JSON.stringify(data));
  const url = new URL(window.location.href);
  url.searchParams.set('bracket', encoded);
  return url.toString();
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const bracketData = params.get('bracket');
  if (bracketData) {
    try {
      const decoded = JSON.parse(atob(bracketData));
      if (decoded.r && decoded.r.length === rounds.length) {
        rounds = decoded.r;
        if (decoded.p) playerNameInput.value = decoded.p + " (shared)";
        console.log('✓ Bracket loaded from URL');
      }
    } catch(e) {
      console.warn('Could not load bracket from URL:', e);
    }
  }
}

// Export JSON
exportBtn.addEventListener('click', ()=>{
  const payload = {
    player: playerNameInput.value || 'Anonymous', 
    email: playerEmailInput.value || '', 
    rounds,
    confidencePoints
  };
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); 
  a.href = url; 
  a.download = `${(playerNameInput.value||'bracket').replace(/\s+/g,'_')}_bracket.json`; 
  a.click();
});

// Import JSON
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    try {
      const d = JSON.parse(ev.target.result);
      if (d.rounds) {
        rounds = d.rounds;
        confidencePoints = d.confidencePoints || {};
        render();
        autoSave();
        alert('Bracket imported and auto-saved.');
      } else alert('Invalid bracket JSON (missing rounds).');
    } catch(err){ alert('Error parsing JSON: '+err.message);}
  };
  reader.readAsText(f);
});

// Reset
resetBtn.addEventListener('click', ()=> {
  if (!confirm('Reset all picks? This will clear your auto-saved bracket.')) return;
  clearAutoSave();
  initRounds();
});

// Admin: apply teams JSON
applyTeamsBtn.addEventListener('click', ()=>{
  try {
    const obj = JSON.parse(teamsJsonArea.value);
    if (!Array.isArray(obj.round1) || !Array.isArray(obj.seeds) || obj.round1.length !== 32 || obj.seeds.length !== 16){
      alert('Expect {round1:[32], seeds:[16]}. Use exact ordering.');
      return;
    }
    round1Teams = obj.round1.slice();
    seededTeams = obj.seeds.slice();
    clearAutoSave(); // Clear old saves when new teams applied
    initRounds();
    alert('Official teams applied into bracket.');
  } catch(err){ alert('Could not parse JSON: '+err.message); }
});

// Fill example
fillExampleBtn.addEventListener('click', ()=>{
  teamsJsonArea.value = JSON.stringify({round1: round1Teams, seeds: seededTeams},null,2);
  alert('Example JSON filled into admin box.');
});

// Admin: publish official results
publishResultsBtn && publishResultsBtn.addEventListener && publishResultsBtn.addEventListener('click', async ()=>{
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Please set SHEETS_WEBHOOK_URL in app.js.'); return; }
  try {
    const payload = {action:'publishResults', rounds, admin:true, timestamp: new Date().toISOString()};
    const res = await fetch(SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const txt = await res.text();
    if (res.ok) { alert('Results published: '+txt); fetchLeaderboard(); }
    else alert('Publish failed: '+txt);
  } catch(err){ alert('Publish error: '+err.message); }
});

// Admin: clear official results
clearResultsBtn && clearResultsBtn.addEventListener && clearResultsBtn.addEventListener('click', async ()=>{
  if (!confirm('Clear official results in the sheet?')) return;
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Please set SHEETS_WEBHOOK_URL in app.js.'); return; }
  try {
    const payload = {action:'clearResults', admin:true, timestamp:new Date().toISOString()};
    const res = await fetch(SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const txt = await res.text();
    if (res.ok) { alert('Official results cleared.'); fetchLeaderboard(); }
    else alert('Clear failed: '+txt);
  } catch(err){ alert('Error: '+err.message); }
});

// Submit bracket to Sheets
submitBtn.addEventListener('click', async ()=>{
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Set the submission URL in app.js first.'); return; }
  const player = playerNameInput.value || 'Anonymous';
  const email = playerEmailInput.value || '';
  const payload = {
    action:'submitBracket', 
    player, 
    email, 
    rounds, 
    confidencePoints,
    timestamp:new Date().toISOString()
  };
  try {
    const res = await fetch(SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const txt = await res.text();
    if (res.ok) { alert('Submission saved. Thank you!'); fetchLeaderboard(); }
    else alert('Submission failed: '+txt);
  } catch(err){ alert('Error submitting: '+err.message); }
});

// Leaderboard fetch
async function fetchLeaderboard(){
  if (!LEADERBOARD_URL.includes('https://')) { 
    leaderboardDiv.innerText = "Set LEADERBOARD_URL in app.js to enable live standings."; 
    return; 
  }
  try {
    const res = await fetch(LEADERBOARD_URL);
    if (!res.ok) { leaderboardDiv.innerText = "Error fetching leaderboard"; return; }
    const data = await res.json();
    renderLeaderboard(data);
  } catch(err){ leaderboardDiv.innerText = "Leaderboard error: "+err.message; }
}

function renderLeaderboard(data){
  leaderboardDiv.innerHTML = '';
  if (!data || !data.rows || data.rows.length===0) { 
    leaderboardDiv.innerText = "No submissions yet."; 
    return; 
  }
  data.rows.forEach((r, idx)=>{
    const row = document.createElement('div'); 
    row.className='leaderRow';
    if (idx === 0) row.style.fontWeight = '700'; // Highlight leader
    
    const name = document.createElement('div'); 
    name.className='name'; 
    name.innerText = `${idx+1}. ${r.player}${r.email? ` (${r.email})` : ''}`;
    
    const score = document.createElement('div'); 
    score.className='score'; 
    score.innerText = r.score;
    
    row.appendChild(name); 
    row.appendChild(score);
    leaderboardDiv.appendChild(row);
  });
}

// Toggle collapsed (mobile-friendly)
toggleViewBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('collapsed');
  toggleViewBtn.innerText = document.body.classList.contains('collapsed') ? 'Expand Rounds' : 'Collapse Rounds (mobile)';
});

// Add Share Button
const shareBtn = document.createElement('button');
shareBtn.id = 'shareBtn';
shareBtn.innerText = 'Share My Bracket';
shareBtn.onclick = async () => {
  const url = generateShareURL();
  try {
    await navigator.clipboard.writeText(url);
    alert('✓ Shareable link copied to clipboard!\n\nAnyone with this link can view your bracket.');
  } catch(e) {
    prompt('Copy this URL to share your bracket:', url);
  }
};
document.getElementById('controls').appendChild(shareBtn);

// Poll leaderboard every 30s
setInterval(fetchLeaderboard, 30000);

// Initialize
initRounds();
fetchLeaderboard();

// Expose for debugging
window.__rounds = () => JSON.parse(JSON.stringify(rounds));
window.__fetchLeaderboard = fetchLeaderboard;
window.__clearAutoSave = clearAutoSave;
