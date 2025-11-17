// Placeholder until NCAA announces official teams.
// These will be replaced with 48 real team names.
let round1Teams = [
  "Team A1", "Team A2",
  "Team B1", "Team B2",
  "Team C1", "Team C2",
  "Team D1", "Team D2",
  "Team E1", "Team E2",
  "Team F1", "Team F2",
  "Team G1", "Team G2",
  "Team H1", "Team H2",

  "Team I1", "Team I2",
  "Team J1", "Team J2",
  "Team K1", "Team K2",
  "Team L1", "Team L2",
  "Team M1", "Team M2",
  "Team N1", "Team N2",
  "Team O1", "Team O2",
  "Team P1", "Team P2"
];

const bracketDiv = document.getElementById("bracket");

function createRound(teams) {
  let round = document.createElement("div");
  round.classList.add("round");

  for (let i = 0; i < teams.length; i += 2) {
    let match = document.createElement("div");
    match.classList.add("match");

    let t1 = document.createElement("div");
    t1.classList.add("team");
    t1.textContent = teams[i];

    let t2 = document.createElement("div");
    t2.classList.add("team");
    t2.textContent = teams[i + 1];

    t1.onclick = () => selectWinner(match, t1, t2);
    t2.onclick = () => selectWinner(match, t1, t2);

    match.appendChild(t1);
    match.appendChild(t2);
    round.appendChild(match);
  }

  return round;
}

function selectWinner(match, t1, t2) {
  t1.classList.remove("selected");
  t2.classList.remove("selected");
  event.target.classList.add("selected");
}

function buildBracket() {
  bracketDiv.innerHTML = "";
  let r1 = createRound(round1Teams);
  bracketDiv.appendChild(r1);
}

buildBracket();

document.getElementById("export").onclick = () => {
  let picks = [];
  document.querySelectorAll(".match").forEach(m => {
    let selected = m.querySelector(".selected");
    picks.push(selected ? selected.textContent : null);
  });

  let blob = new Blob([JSON.stringify(picks, null, 2)], { type: "application/json" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "my_bracket.json";
  a.click();
};

document.getElementById("reset").onclick = () => buildBracket();
