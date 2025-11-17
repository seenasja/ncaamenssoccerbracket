/* Full client-side bracket app with logos, animations, admin, Google Sheets hooks.
   IMPORTANT:
    - Replace SHEETS_WEBHOOK_URL with your deployed Apps Script POST URL (for submissions & publishing results).
    - Replace LEADERBOARD_URL with your deployed Apps Script GET URL to fetch computed leaderboard JSON.
*/

// ------------------ CONFIG: paste your Apps Script URLs here ------------------
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxWrQwqE6T0cjY070lIE_de5eN94vn2TbcfKxjszyn8aHnW3oPvC8uyQRPzm165EHqvrw/exec"; // POST endpoint to save submission or publish results
const LEADERBOARD_URL = "https://script.google.com/macros/s/AKfycbxWrQwqE6T0cjY070lIE_de5eN94vn2TbcfKxjszyn8aHnW3oPvC8uyQRPzm165EHqvrw/exec"; // GET endpoint returns leaderboard JSON
// ---------------------------------------------------------------------------

// Placeholders until admin pastes official teams
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

// Model: rounds with objects {teamA, teamB, winner, logoA?, logoB?}
let rounds = []; // rounds[0]=R1 (16 matches), [1]=R32 (16), [2]=R16(8), [3]=QF(4), [4]=SF(2), [5]=F(1)
let officialResultsPublished = false;

// Build matches from arrays
function buildMatchesFromTeams(arr){
  const matches = [];
  for(let i=0;i<arr.length;i+=2){
    matches.push({teamA: arr[i]||null, teamB: arr[i+1]||null, winner: null, logoA:null, logoB:null});
  }
  return matches;
}

function initRounds(){
  const r1 = buildMatchesFromTeams(round1Teams);
  const r32 = [];
  for(let i=0;i<16;i++){
    r32.push({teamA: seededTeams[i]||null, teamB: `Winner R1-${i+1}`, winner:null, logoA:null, logoB:null});
  }
  const r16 = Array.from({length:8}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const qf = Array.from({length:4}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const sf = Array.from({length:2}, ()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const f = [{teamA:null,teamB:null,winner:null,logoA:null,logoB:null}];

  rounds = [r1,r32,r16,qf,sf,f];
  autoPropagateAll();
  render();
}

// Render round columns and matches
function render(){
  bracketRoot.innerHTML = '';
  const labels = ['Round 1','Round of 32','Round of 16','Quarterfinals','Semifinals','Final'];
  rounds.forEach((roundMatches, rIdx) => {
    const col = document.createElement('div');
    col.className = 'round';
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
      // logo support
      if (m.logoA){
        const img = document.createElement('img'); img.className='logo'; img.src = m.logoA; a.appendChild(img);
      }
      const nameA = document.createElement('div'); nameA.className='name'; nameA.innerText = m.teamA || '—';
      a.appendChild(nameA);

      // Team B element
      const b = document.createElement('div');
      b.className = 'teamBtn' + (m.winner === m.teamB ? ' picked' : '');
      b.onclick = ()=> handlePick(rIdx,mIdx,m.teamB);
      if (m.logoB){
        const imgb = document.createElement('img'); imgb.className='logo'; imgb.src = m.logoB; b.appendChild(imgb);
      }
      const nameB = document.createElement('div'); nameB.className='name'; nameB.innerText = m.teamB || '—';
      b.appendChild(nameB);

      match.appendChild(a);
      match.appendChild(b);
      col.appendChild(match);
    });

    bracketRoot.appendChild(col);
  });
}

// Click picking + propagation
function handlePick(roundIdx, matchIdx, winnerName){
  if (!winnerName || winnerName.toString().startsWith('Winner') || winnerName==='—') return;
  rounds[roundIdx][matchIdx].winner = winnerName;

  // downstream clearing
  if (roundIdx === 0) {
    rounds[1][matchIdx].teamB = winnerName; rounds[1][matchIdx].logoB = rounds[0][matchIdx].logoA || rounds[0][matchIdx].logoB || null;
    clearDownstreamFrom(1, matchIdx);
  } else {
    const nextMatch = Math.floor(matchIdx/2);
    const slot = (matchIdx %2 === 0) ? 'teamA' : 'teamB';
    rounds[roundIdx+1][nextMatch][slot] = winnerName;
    // assign logo if available (try to get from previous match)
    const prev = rounds[roundIdx][matchIdx];
    const logo = (prev.teamA===winnerName?prev.logoA:prev.logoB) || null;
    rounds[roundIdx+1][nextMatch][slot === 'teamA'?'logoA':'logoB'] = logo;
    clearDownstreamFrom(roundIdx+1,nextMatch);
  }
  render();
}

// clear winners downstream to avoid inconsistency
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

// auto propagate single-sided things
function autoPropagateAll(){
  for(let r=0;r<rounds.length-1;r++){
    const cur = rounds[r];
    const nxt = rounds[r+1];
    cur.forEach((m,i)=>{
      const w = m.winner || null;
      if (r===0){
        if (w && (!nxt[i].teamB || nxt[i].teamB.toString().startsWith('Winner'))) nxt[i].teamB = w;
      } else {
        const nm = Math.floor(i/2);
        const slot = (i%2===0) ? 'teamA' : 'teamB';
        if (w && (!nxt[nm][slot] || nxt[nm][slot].toString().startsWith('Winner'))) nxt[nm][slot] = w;
      }
    });
  }
}

// Export JSON
exportBtn.addEventListener('click', ()=>{
  const payload = {player: playerNameInput.value || 'Anonymous', email: playerEmailInput.value || '', rounds};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${(playerNameInput.value||'bracket').replace(/\s+/g,'_')}_bracket.json`; a.click();
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
        // adopt teams & winners if present
        rounds = d.rounds;
        render();
        alert('Bracket imported.');
      } else alert('Invalid bracket JSON (missing rounds).');
    } catch(err){ alert('Error parsing JSON: '+err.message);}
  };
  reader.readAsText(f);
});

// Reset
resetBtn.addEventListener('click', ()=> {
  if (!confirm('Reset picks?')) return;
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
    initRounds();
    alert('Official teams applied into bracket.');
  } catch(err){ alert('Could not parse JSON: '+err.message); }
});

// Fill example
fillExampleBtn.addEventListener('click', ()=>{
  teamsJsonArea.value = JSON.stringify({round1: round1Teams, seeds: seededTeams},null,2);
  alert('Example JSON filled into admin box.');
});

// Admin: publish official results (sends to Sheets webhook)
publishResultsBtn && publishResultsBtn.addEventListener && publishResultsBtn.addEventListener('click', async ()=>{
  if (!SHEETS_WEBHOOK_URL.includes('https://')) { alert('Please set SHEETS_WEBHOOK_URL in app.js to your Apps Script POST URL.'); return; }
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
  const payload = {action:'submitBracket', player, email, rounds, timestamp:new Date().toISOString()};
  try {
    const res = await fetch(SHEETS_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const txt = await res.text();
    if (res.ok) { alert('Submission saved. Thank you!'); fetchLeaderboard(); }
    else alert('Submission failed: '+txt);
  } catch(err){ alert('Error submitting: '+err.message); }
});

// Leaderboard fetch
async function fetchLeaderboard(){
  if (!LEADERBOARD_URL.includes('https://')) { leaderboardDiv.innerText = "Set LEADERBOARD_URL in app.js to enable live standings."; return; }
  try {
    const res = await fetch(LEADERBOARD_URL);
    if (!res.ok) { leaderboardDiv.innerText = "Error fetching leaderboard"; return; }
    const data = await res.json();
    renderLeaderboard(data);
  } catch(err){ leaderboardDiv.innerText = "Leaderboard error: "+err.message; }
}

function renderLeaderboard(data){
  leaderboardDiv.innerHTML = '';
  if (!data || !data.rows || data.rows.length===0) { leaderboardDiv.innerText = "No submissions yet."; return; }
  data.rows.forEach(r=>{
    const row = document.createElement('div'); row.className='leaderRow';
    const name = document.createElement('div'); name.className='name'; name.innerText = r.player + (r.email? ` (${r.email})` : '');
    const score = document.createElement('div'); score.className='score'; score.innerText = r.score;
    row.appendChild(name); row.appendChild(score);
    leaderboardDiv.appendChild(row);
  });
}

// Toggle collapsed (mobile-friendly)
toggleViewBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('collapsed');
  toggleViewBtn.innerText = document.body.classList.contains('collapsed') ? 'Expand Rounds' : 'Collapse Rounds (mobile)';
});

// Poll leaderboard every 30s
setInterval(fetchLeaderboard, 30000);

// -------------------- Initialize --------------------
initRounds();
fetchLeaderboard();

// expose state for debugging
window.__rounds = () => JSON.parse(JSON.stringify(rounds));
window.__fetchLeaderboard = fetchLeaderboard;
