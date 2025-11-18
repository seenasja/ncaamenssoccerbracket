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
  "Marshall": "https://

