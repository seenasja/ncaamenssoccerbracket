// --- CONFIG ---
const AUTO_SAVE_KEY = "ncaa_bracket_autosave";

// Team logos
const teamLogos = {
  // UNSEEDED TEAMS (32) - Play in First Round - EXACT ORDER FROM PDF
  // LEFT SIDE (top to bottom) - matches 1-8
  "Syracuse": "https://a.espncdn.com/i/teamlogos/ncaa/500/183.png",
  "Hofstra": "https://a.espncdn.com/i/teamlogos/ncaa/500/2275.png",
  "Clemson": "https://a.espncdn.com/i/teamlogos/ncaa/500/228.png",
  "Western Mich.": "https://a.espncdn.com/i/teamlogos/ncaa/500/2711.png",
  "UCLA": "https://a.espncdn.com/i/teamlogos/ncaa/500/26.png",
  "Grand Canyon": "https://a.espncdn.com/i/teamlogos/ncaa/500/2253.png",
  "Denver": "https://a.espncdn.com/i/teamlogos/ncaa/500/2172.png",
  "UC Irvine": "https://a.espncdn.com/i/teamlogos/ncaa/500/2509.png",
  "Oregon St.": "https://a.espncdn.com/i/teamlogos/ncaa/500/204.png",
  "Washington": "https://a.espncdn.com/i/teamlogos/ncaa/500/264.png",
  "Kansas City": "https://a.espncdn.com/i/teamlogos/ncaa/500/2305.png",
  "Lindenwood": "https://a.espncdn.com/i/teamlogos/ncaa/500/2335.png",
  "Cornell": "https://a.espncdn.com/i/teamlogos/ncaa/500/167.png",
  "Lafayette": "https://a.espncdn.com/i/teamlogos/ncaa/500/322.png",
  "North Carolina": "https://a.espncdn.com/i/teamlogos/ncaa/500/153.png",
  "North Florida": "https://a.espncdn.com/i/teamlogos/ncaa/500/2454.png",
  // RIGHT SIDE (top to bottom) - matches 9-16
  "Duke": "https://a.espncdn.com/i/teamlogos/ncaa/500/150.png",
  "FDU": "https://a.espncdn.com/i/teamlogos/ncaa/500/161.png",
  "Seton Hall": "https://a.espncdn.com/i/teamlogos/ncaa/500/180.png",
  "Siena": "https://a.espncdn.com/i/teamlogos/ncaa/500/2599.png",
  "Saint Louis": "https://a.espncdn.com/i/teamlogos/ncaa/500/139.png",
  "Kentucky": "https://a.espncdn.com/i/teamlogos/ncaa/500/96.png",
  "Michigan": "https://a.espncdn.com/i/teamlogos/ncaa/500/130.png",
  "Notre Dame": "https://a.espncdn.com/i/teamlogos/ncaa/500/87.png",
  "Elon": "https://a.espncdn.com/i/teamlogos/ncaa/500/2210.png",
  "UNC Greensboro": "https://a.espncdn.com/i/teamlogos/ncaa/500/2430.png",
  "Fla. Atlantic": "https://a.espncdn.com/i/teamlogos/ncaa/500/2226.png",
  "UCF": "https://a.espncdn.com/i/teamlogos/ncaa/500/2116.png",
  "West Virginia": "https://a.espncdn.com/i/teamlogos/ncaa/500/277.png",
  "St. John's (NY)": "https://a.espncdn.com/i/teamlogos/ncaa/500/stjn.png",
  "Marshall": "https://a.espncdn.com/i/teamlogos/ncaa/500/276.png",
  "Cleveland St.": "https://a.espncdn.com/i/teamlogos/ncaa/500/325.png",
  
  // SEEDED TEAMS (16) - Second Round - CORRECT ORDER
  // LEFT SIDE (top to bottom) - matches 1-8
  "Vermont": "https://a.espncdn.com/i/teamlogos/ncaa/500/261.png",
  "Furman": "https://a.espncdn.com/i/teamlogos/ncaa/500/231.png",
  "San Diego": "https://a.espncdn.com/i/teamlogos/ncaa/500/301.png",
  "Portland": "https://a.espncdn.com/i/teamlogos/ncaa/500/2501.png",
  "SMU": "https://a.espncdn.com/i/teamlogos/ncaa/500/2567.png",
  "Stanford": "https://a.espncdn.com/i/teamlogos/ncaa/500/24.png",
  "UConn": "https://a.espncdn.com/i/teamlogos/ncaa/500/41.png",
  "Maryland": "https://a.espncdn.com/i/teamlogos/ncaa/500/120.png",
  // RIGHT SIDE (top to bottom) - matches 9-16
  "Princeton": "https://a.espncdn.com/i/teamlogos/ncaa/500/163.png",
  "Bryant": "https://a.espncdn.com/i/teamlogos/ncaa/500/2066.png",
  "Indiana": "https://a.espncdn.com/i/teamlogos/ncaa/500/84.png",
  "Akron": "https://a.espncdn.com/i/teamlogos/ncaa/500/2006.png",
  "Virginia": "https://a.espncdn.com/i/teamlogos/ncaa/500/258.png",
  "Georgetown": "https://a.espncdn.com/i/teamlogos/ncaa/500/46.png",
  "High Point": "https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png",
  "NC State": "https://a.espncdn.com/i/teamlogos/ncaa/500/152.png"
};

// --- DOM ---
const bracketRoot = document.getElementById('bracket');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');
const submitBtn = document.getElementById('submitBtn');

// --- Model ---
let rounds = [];
const round1Teams = Object.keys(teamLogos).slice(0,32);
const seededTeams = Object.keys(teamLogos).slice(32);

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
        const logoUrl = m['logo'+side]; 
        if(logoUrl){ 
          const img=document.createElement('img'); 
          img.className='logo'; 
          img.src=logoUrl; 
          img.onerror=()=>img.style.display='none'; 
          btn.appendChild(img);
        }
        const nameDiv=document.createElement('div'); 
        nameDiv.className='name'; 
        nameDiv.innerText=team||'—'; 
        btn.appendChild(nameDiv);
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
  
  // Special handling for Round 1 → Round 2 (1:1 mapping)
  if(rIdx === 0) {
    rounds[1][mIdx].teamB = team;
    rounds[1][mIdx].logoB = getLogo(team);
  } 
  // Normal bracket propagation for Round 2 onwards
  else {
    const nextMatch = Math.floor(mIdx/2);
    const slot = (mIdx%2===0) ? 'teamA' : 'teamB';
    rounds[rIdx+1][nextMatch][slot] = team;
    rounds[rIdx+1][nextMatch]['logo'+(slot==='teamA'?'A':'B')] = getLogo(team);
  }
}

function autoSave(){ localStorage.setItem(AUTO_SAVE_KEY,JSON.stringify(rounds)); }
function loadAutoSave(){ const saved=localStorage.getItem(AUTO_SAVE_KEY); if(saved) rounds=JSON.parse(saved); }

// --- Buttons ---
submitBtn.onclick = async () => {
  const name = playerNameInput.value.trim();
  const email = playerEmailInput.value.trim();
  
  if (!name) {
    alert('Please enter your name before submitting!');
    return;
  }
  
  if (!email) {
    alert('Please enter your email before submitting!');
    return;
  }
  // Check if bracket is complete (champion selected)
  if (!rounds[5][0].winner) {
    alert('Please complete your bracket by selecting a champion!');
    return;
  }
  
  const submission = {
    name: name,
    email: email,
    bracket: rounds,
    timestamp: new Date().toISOString()
  };
  
  // Disable button to prevent double-submission
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxrr-ZX0vZ5XfFxkqWgvZfWJV_8oHNMjiG_pz3ZTkBURB2HF9LGyf8fSO7z2qouxm5x0g/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission)
    });
    
    alert(`Bracket submitted successfully, ${name}! Good luck! 🏆`);
    
    // Optionally clear the form
    playerNameInput.value = '';
    playerEmailInput.value = '';
    
  } catch (error) {
    console.error('Submission error:', error);
    alert('There was an error submitting your bracket. Please try again or contact support.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Bracket';
  }
};
exportBtn.onclick=()=>{ 
  const blob=new Blob([JSON.stringify(rounds,null,2)],{type:'application/json'}); 
  const url=URL.createObjectURL(blob); 
  const a=document.createElement('a'); 
  a.href=url; 
  a.download='bracket.json'; 
  a.click(); 
}

importBtn.onclick=()=>importFile.click();

importFile.onchange=(e)=>{ 
  const f=e.target.files[0]; 
  if(!f) return; 
  const reader=new FileReader(); 
  reader.onload=ev=>{ 
    rounds=JSON.parse(ev.target.result); 
    render(); 
    autoSave(); 
  }; 
  reader.readAsText(f);
}

resetBtn.onclick=()=>{ 
  if(confirm('Reset bracket?')){ 
    localStorage.removeItem(AUTO_SAVE_KEY); 
    initRounds(); 
  }
}
// --- Leaderboard ---
async function loadLeaderboard() {
  const leaderboardDiv = document.getElementById('leaderboard');
  
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbxrr-ZX0vZ5XfFxkqWgvZfWJV_8oHNMjiG_pz3ZTkBURB2HF9LGyf8fSO7z2qouxm5x0g/exec');
    const data = await response.json();
    
    if (data.leaderboard && data.leaderboard.length > 0) {
      let html = '<h2>Leaderboard</h2><table><thead><tr><th>Rank</th><th>Name</th><th>Score</th><th>Champion Pick</th></tr></thead><tbody>';
      
      const top = data.leaderboard.slice(0, 10);
      top.forEach(entry => {
        html += `<tr>
          <td>${entry.rank}</td>
          <td>${entry.name}</td>
          <td><strong>${entry.score}</strong></td>
          <td>${entry.champion}</td>
        </tr>`;
      });
      
      html += '</tbody></table>';
      html += '<p class="leaderboard-update">Last updated: ' + new Date().toLocaleTimeString() + '</p>';
      leaderboardDiv.innerHTML = html;
    } else {
      leaderboardDiv.innerHTML = '<p>No scores yet. Waiting for tournament to begin!</p>';
    }
    
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    leaderboardDiv.innerHTML = '<p>Leaderboard will appear once tournament begins.</p>';
  }
}

// Load leaderboard on page load and refresh every 60 seconds
loadLeaderboard();
setInterval(loadLeaderboard, 60000);
// --- Init ---
initRounds();
