/* NCAA Bracket App - Enhanced
   Features:
   - Team logos
   - Auto-save
   - Mobile + desktop responsive
   - Fixed final match picking
*/

const AUTO_SAVE_KEY = "ncaa_bracket_autosave";

// Team logos
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
  "Pitt":"https://a.espncdn.com/i/teamlogos/ncaa/500/221.png"
};

let round1Teams = [
  "Vermont","Virginia","Princeton","Maryland","SMU","Indiana","Georgetown","Portland",
  "San Diego","High Point","Bryant","Stanford","UConn","Akron","NC State","Furman",
  "Duke","Syracuse","Clemson","Denver","Cornell","North Carolina","UCF","West Virginia",
  "Marshall","Saint Louis","Oregon St.","UCLA","Michigan","Notre Dame","Pitt","Stanford"
];

let seededTeams = [
  "Seed 1","Seed 2","Seed 3","Seed 4","Seed 5","Seed 6","Seed 7","Seed 8",
  "Seed 9","Seed 10","Seed 11","Seed 12","Seed 13","Seed 14","Seed 15","Seed 16"
];

const bracketRoot = document.getElementById('bracket');

let rounds = [];

function getLogo(team){
  return teamLogos[team]||null;
}

function buildMatches(arr){
  const matches = [];
  for(let i=0;i<arr.length;i+=2){
    matches.push({teamA: arr[i], teamB: arr[i+1], winner:null, logoA:getLogo(arr[i]), logoB:getLogo(arr[i+1])});
  }
  return matches;
}

function initRounds(){
  const r1 = buildMatches(round1Teams);
  const r32 = seededTeams.map((seed,i)=>{
    return {teamA:seed, teamB:`Winner R1-${i+1}`, winner:null, logoA:getLogo(seed), logoB:null};
  });
  const r16 = Array.from({length:8},()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const qf = Array.from({length:4},()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const sf = Array.from({length:2},()=>({teamA:null,teamB:null,winner:null,logoA:null,logoB:null}));
  const f = [{teamA:null,teamB:null,winner:null,logoA:null,logoB:null}];
  
  rounds = [r1,r32,r16,qf,sf,f];
  autoPropagateAll();
  loadAutoSave();
  render();
}

function render(){
  bracketRoot.innerHTML='';
  const labels=['First Round','Second Round','Third Round','Quarterfinals','Semifinals','Final'];
  rounds.forEach((round,rIdx)=>{
    const col=document.createElement('div');
    col.className='round';
    const title=document.createElement('h2');
    title.innerText=labels[rIdx];
    col.appendChild(title);

    round.forEach((m,mIdx)=>{
      const match=document.createElement('div');
      match.className='match';

      const a=document.createElement('div');
      a.className='teamBtn'+(m.winner===m.teamA?' picked':'');
      a.onclick=()=>handlePick(rIdx,mIdx,m.teamA);
      if(m.logoA){ const img=document.createElement('img'); img.className='logo'; img.src=m.logoA; img.onerror=()=>img.style.display='none'; a.appendChild(img);}
      const nameA=document.createElement('div'); nameA.className='name'; nameA.innerText=m.teamA||'—'; a.appendChild(nameA);

      const b=document.createElement('div');
      b.className='teamBtn'+(m.winner===m.teamB?' picked':'');
      b.onclick=()=>handlePick(rIdx,mIdx,m.teamB);
      if(m.logoB){ const img=document.createElement('img'); img.className='logo'; img.src=m.logoB; img.onerror=()=>img.style.display='none'; b.appendChild(img);}
      const nameB=document.createElement('div'); nameB.className='name'; nameB.innerText=m.teamB||'—'; b.appendChild(nameB);

      match.appendChild(a);
      match.appendChild(b);
      col.appendChild(match);
    });

    bracketRoot.appendChild(col);
  });
}

function handlePick(rIdx,mIdx,winner){
  if(!winner||winner==='—')return;
  rounds[rIdx][mIdx].winner=winner;

  if(rIdx<rounds.length-1){
    const nextMatch=Math.floor(mIdx/2);
    const slot=(mIdx%2===0)?'teamA':'teamB';
    rounds[rIdx+1][nextMatch][slot]=winner;
    const prev=rounds[rIdx][mIdx];
    const logo=(prev.teamA===winner?prev.logoA:prev.logoB);
    rounds[rIdx+1][nextMatch][slot==='teamA'?'logoA':'logoB']=logo;
    clearDownstreamFrom(rIdx+1,nextMatch);
  }

  autoSave();
  render();
}

function clearDownstreamFrom(r,m){
  for(let i=r;i<rounds.length;i++){
    rounds[i].forEach(match=>match.winner=null);
    if(i>r){
      rounds[i].forEach(match=>{
        if(match.teamA && match.teamA.toString().startsWith('Winner')) match.teamA=null;
        if(match.teamB && match.teamB.toString().startsWith('Winner')) match.teamB=null;
      });
    }
  }
}

function autoPropagateAll(){
  for(let r=0;r<rounds.length-1;r++){
    rounds[r].forEach((m,i)=>{
      const w=m.winner||null;
      const nxt=rounds[r+1];
      if(!w)return;
      if(r===0){
        if(!nxt[i].teamB||nxt[i].teamB.toString().startsWith('Winner')){
          nxt[i].teamB=w;
          nxt[i].logoB=(m.teamA===w?m.logoA:m.logoB);
        }
      }else{
        const nm=Math.floor(i/2); const slot=(i%2===0)?'teamA':'teamB';
        if(!nxt[nm][slot]||nxt[nm][slot].toString().startsWith('Winner')){
          nxt[nm][slot]=w;
          nxt[nm][slot==='teamA'?'logoA':'logoB']=(m.teamA===w?m.logoA:m.logoB);
        }
      }
    });
  }
}

function autoSave(){
  try{
    localStorage.setItem(AUTO_SAVE_KEY,JSON.stringify(rounds));
  }catch(e){console.warn(e);}
}

function loadAutoSave(){
  try{
    const saved=localStorage.getItem(AUTO_SAVE_KEY);
    if(saved){ rounds=JSON.parse(saved); }
  }catch(e){console.warn(e);}
}

initRounds();
