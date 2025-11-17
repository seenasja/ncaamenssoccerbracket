/* ========= NCAA Men's Soccer — 48-Team Static Bracket App =========
   Rounds:
   - Round 1: 32 teams (play-ins)
   - Round of 32: 16 seeded teams join winners
   - Then Round of 16, Quarterfinals, Semifinals, Final
==================================================================== */

// ---------------------------
// Default placeholder teams
// ---------------------------
let round1Teams = [
  "A1","A2","B1","B2","C1","C2","D1","D2",
  "E1","E2","F1","F2","G1","G2","H1","H2",
  "I1","I2","J1","J2","K1","K2","L1","L2",
  "M1","M2","N1","N2","O1","O2","P1","P2"
];

let seededTeams = [
  "Seed 1","Seed 2","Seed 3","Seed 4","Seed 5","Seed 6","Seed 7","Seed 8",
  "Seed 9","Seed 10","Seed 11","Seed 12","Seed 13","Seed 14","Seed 15","Seed 16"
];

// State of user picks (per round)
let picks = {
  r1: Array(16).fill(null),     // winners of 16 Round 1 matches
  r32: Array(16).fill(null),    // Round of 32 winners
  r16: Array(8).fill(null),
  qf: Array(4).fill(null),
  sf: Array(2).fill(null),
  f: Array(1).fill(null)
};

// ---------------------------
// Build HTML for bracket
// ---------------------------
function buildBracket()
