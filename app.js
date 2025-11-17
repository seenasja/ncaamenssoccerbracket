/* ===== STATIC 48-TEAM BRACKET APP (client-only) =====
 - Round 1: 32 teams -> 16 winners
 - Round of 32: 16 seeded teams vs those 16 winners -> 16 winners
 - Round of 16 -> Quarter -> Semi -> Final
 - Admin can paste JSON with "round1" (32 items) and "seeds" (16 items) to populate teams.
=====================================================*/

// Default placeholders (example short names). Admin can replace via JSON paste.
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

// DOM refs
const bracketRoot = document.getElementById('bracket');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const applyTeamsBtn = document.getElementById('applyTeams');
const teamsJsonArea = document.getElementById('teamsJson');
const fillExampleBtn = document.getElementById('fillExample');
const playerNameInput = document.getElementById('playerName');

// Data model: rounds arrays. Each match is an object {teamA, teamB, winner}
let rounds = []; // rounds[0] = Round1 (16 matches), rounds[1] = Ro32 (16 matches), rounds[2]=Ro16 (8), rounds[3]=QF (4), rounds[4]=SF (2), rounds[5]=Final (1)

function buildMatchesFromTeams(arr){
  const matches = [];
  for(let i=0;i<arr.length;i+=2){
    matches.push({teamA: arr[i]||null, teamB: arr[i+1]||null, winner: null});
  }
  return matches;
}

function initBrackets(){
  const r1 = buildMatchesFromTeams(round1Teams); // 16 matches
  // Round of 32: seededTeams vs winners of r1. seededTeams occupy teamA slot, teamB placeholder is winner of r1 match
  const ro32 = [];
  for(let i=0;i<16;i++){
    ro32.push({teamA: seededTeams[i]||null, teamB: `Winner R1-${i+1}`, winner:null});
  }
  const ro16 = Array.from({length:8}, ()=>({teamA:null, teamB:null, winner:null}));
  const qf = Array.from({length:4}, ()=>({teamA:null, teamB:null, winner:null}));
  const sf = Array.from({length:2}, ()=>({teamA:null, teamB:null, winner:null}));
  const final = [{teamA:null, teamB:null, winner:null}];

  rounds = [r1, ro32, ro16, qf, sf, final];
  // auto-advance byes or placeholders if any (none by default)
  autoPropagateAll();
  render();
}

// Convert internal rounds into flattened text for export/import
function exportData(){
  return {
    player: playerNameInput.value || "Anonymous",
    timestamp: new Date().toISOString(),
    rounds: rounds
  };
}

// RENDER
function render(){
  bracketRoot.innerHTML = '';
  const labels = ['Round 1\n(32 -> 16)','Round of 32\n(Seeds vs R1 winners)','Round of 16','Quarterfinals','Semifinals','Final'];
  rounds.forEach((round, rIdx) => {
    const col = document.createElement('div');
    col.className = 'round';
    const title = document.createElement('div');
    title.className = 'roundTitle';
    title.innerText = labels[rIdx];
    col.appendChild(title);

    round.forEach((m, mIdx) => {
      const match = document.createElement('div');
      match.className = 'match';
      // Team A
      const a = document.createElement('div');
      a.className = 'team' + (m.winner === m.teamA ? ' selected' : '');
      a.innerText = m.teamA || '—';
      a.onclick = () => handlePick(rIdx, mIdx, m.teamA);
      match.appendChild(a);
      // Team B
      const b = document.createElement('div');
      b.className = 'team' + (m.winner === m.teamB ? ' selected' : '');
      b.innerText = m.teamB || '—';
      b.onclick = () => handlePick(rIdx, mIdx, m.teamB);
      match.appendChild(b);

      col.appendChild(match);
    });

    bracketRoot.appendChild(col);
  });
}

// Handle a user click picking winnerName at rounds[roundIdx][matchIdx]
function handlePick(roundIdx, matchIdx, winnerName){
  if (!winnerName || winnerName === '—') return;
  // set winner
  rounds[roundIdx][matchIdx].winner = winnerName;
  // propagate to next round
  if (roundIdx < rounds.length - 1){
    if (roundIdx === 0){
      // R1 winner goes into Ro32 match at same index as teamB
      rounds[1][matchIdx].teamB = winnerName;
      // clear downstream winners from round 1 position
      clearDownstreamFrom(1, matchIdx);
    } else {
      const nextMatch = Math.floor(matchIdx/2);
      const nextSlot = matchIdx % 2 === 0 ? 'teamA' : 'teamB';
      rounds[roundIdx+1][nextMatch][nextSlot] = winnerName;
      clearDownstreamFrom(roundIdx+1, nextMatch);
    }
  }
  render();
}

// Clear winners from and after a given round+match to avoid inconsistent picks
function clearDownstreamFrom(roundIdx, matchIdx){
  for(let r = roundIdx; r < rounds.length; r++){
    rounds[r].forEach(m => m.winner = null);
    // For rounds beyond roundIdx, also clear team placeholders derived from changed ones only when necessary.
    if (r > roundIdx){
      rounds[r].forEach(m => { if (m.teamA && m.teamA.toString().startsWith('Winner')) m.teamA = null; if (m.teamB && m.teamB.toString().startsWith('Winner')) m.teamB = null; });
    }
  }
}

// Auto-propagate logical single-sided winners (e.g., if opponent is null)
function autoPropagateAll(){
  for(let r=0;r<rounds.length-1;r++){
    const cur = rounds[r];
    const nxt = rounds[r+1];
    cur.forEach((m, i)=>{
      const w = m.winner || null;
      // If one side exists and other is explicit null, auto-advance the present side
      // But avoid overwriting explicit opponent strings like "Winner R1-5"
      if (r === 0){
        // R1 -> place into ro32 teamB slot only if teamB is placeholder or null
        if (w && (!nxt[i].teamB || nxt[i].teamB.toString().startsWith('Winner'))) nxt[i].teamB = w;
      } else {
        const nextMatch = Math.floor(i/2);
        const slot = i % 2 === 0 ? 'teamA' : 'teamB';
        if (w && (!nxt[nextMatch][slot] || nxt[nextMatch][slot].toString().startsWith('Winner'))) nxt[nextMatch][slot] = w;
      }
    });
  }
}

// EXPORT / IMPORT handlers
exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(exportData(), null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(playerNameInput.value||'bracket').replace(/\s+/g,'_')}_bracket.json`;
  a.click();
});

importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.rounds){
        // apply winners into rounds without changing team definitions unless provided
        data.rounds.forEach((rData, rIdx)=>{
          rData.forEach((m, mIdx)=>{
            if (rounds[rIdx] && rounds[rIdx][mIdx]) rounds[rIdx][mIdx].winner = m.winner || null;
            // also copy team names if author included them
            if (m.teamA) rounds[rIdx][mIdx].teamA = m.teamA;
            if (m.teamB) rounds[rIdx][mIdx].teamB = m.teamB;
          });
        });
        render();
        alert('Bracket imported (winners applied).');
      } else {
        alert('Invalid bracket file (missing rounds).');
      }
    } catch(err){
      alert('Error reading file: ' + err.message);
    }
  };
  r.readAsText(f);
});

// RESET
resetBtn.addEventListener('click', ()=>{
  if (!confirm('Reset all picks to initial state?')) return;
  initBrackets();
});

// Admin: apply teams JSON
applyTeamsBtn.addEventListener('click', ()=>{
  const txt = teamsJsonArea.value.trim();
  if (!txt){ if(!confirm('No JSON supplied — this will re-apply the placeholders. Proceed?')) return; fillPlaceholders(); return; }
  try {
    const obj = JSON.parse(txt);
    if (!Array.isArray(obj.round1) || !Array.isArray(obj.seeds) || obj.round1.length !== 32 || obj.seeds.length !== 16){
      alert('Please provide an object with "round1" (32 items) and "seeds" (16 items).');
      return;
    }
    round1Teams = obj.round1.slice();
    seededTeams = obj.seeds.slice();
    initBrackets();
    alert('Teams applied. Players can now pick from the official teams.');
  } catch(err){
    alert('Invalid JSON: ' + err.message);
  }
});

// Fill example placeholders (replaces with default placeholders)
fillExampleBtn.addEventListener('click', ()=>{
  fillPlaceholders();
  initBrackets();
  alert('Example placeholders filled.');
});

function fillPlaceholders(){
  round1Teams = [
    "A1","A2","B1","B2","C1","C2","D1","D2",
    "E1","E2","F1","F2","G1","G2","H1","H2",
    "I1","I2","J1","J2","K1","K2","L1","L2",
    "M1","M2","N1","N2","O1","O2","P1","P2"
  ];
  seededTeams = [
    "Seed 1","Seed 2","Seed 3","Seed 4","Seed 5","Seed 6","Seed 7","Seed 8",
    "Seed 9","Seed10","Seed11","Seed12","Seed13","Seed14","Seed15","Seed16"
  ];
}

// Initialize app
initBrackets();

// small helper to expose state (dev)
window.__bracketState = () => JSON.parse(JSON.stringify(rounds));

