// The game library's data, one entry per game, shared by all three view
// modes (Shelf, Timeline, Playtime). Rendering lives in library.js.
//
// hoursPlayed and timelineOrder are PLACEHOLDERS (marked below) - real
// numbers have to come from you, since only your own Steam client shows
// actual hours played. Until you fill them in, Playtime shows everything
// as roughly the same size and Timeline shows a rough, unconfirmed order.
//
// Fields:
//   id           unique slug
//   name         display name
//   category     shelf grouping (see CATEGORIES below)
//   hue          HSL hue for this category's color, 0-360
//   cover        a Steam CDN image URL, or null to use generated art
//   hoursPlayed  PLACEHOLDER: real hours played, for the Playtime view
//   timelineOrder PLACEHOLDER: smaller = played earlier, for Timeline view
//   featured     true for games with a write-up card (Shelf view only)
//   take         your one/two sentences (null = shows a "todo" box)
//   flag         a small badge, e.g. "Not started"
//   link/linkLabel  an extra link under the write-up (used for Pokemon GO)

const CATEGORIES = {
  "friend-slop": { label: "Friend slop", hue: 25, icon: "🎮" },
  "solo-atmospheric": { label: "Solo & atmospheric", hue: 265, icon: "🌙" },
  "cozy": { label: "Cozy", hue: 130, icon: "🌻" },
  "big-single-player": { label: "Big single-player", hue: 355, icon: "🗺️" },
  "shooters": { label: "Shooters", hue: 205, icon: "🎯" },
  "up-next": { label: "Up next", hue: 15, icon: "📌" },
};

function steamCover(appid) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`;
}

const GAMES = [
  // --- Friend slop ---
  { id: "peak", name: "PEAK", category: "friend-slop",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/89f65be18915d2dc5566de1de322379d62c1dcac/header_alt_assets_3.jpg",
    hoursPlayed: 5, timelineOrder: 10 },
  { id: "among-us", name: "Among Us", category: "friend-slop", cover: steamCover(945360), hoursPlayed: 4, timelineOrder: 5 },
  { id: "goose-goose-duck", name: "Goose Goose Duck", category: "friend-slop", cover: steamCover(1568590), hoursPlayed: 8, timelineOrder: 9 },
  { id: "bread-fred", name: "Bread & Fred", category: "friend-slop", cover: steamCover(1607680), hoursPlayed: 36, timelineOrder: 27 },
  { id: "chained-together", name: "Chained Together", category: "friend-slop", cover: steamCover(2567870), hoursPlayed: 9, timelineOrder: 11 },
  { id: "lethal-company", name: "Lethal Company", category: "friend-slop", cover: steamCover(1966720), hoursPlayed: 3, timelineOrder: 4 },
  { id: "phasmophobia", name: "Phasmophobia", category: "friend-slop", cover: steamCover(739630), hoursPlayed: 44, timelineOrder: 23 },
  { id: "it-takes-two", name: "It Takes Two", category: "friend-slop", cover: steamCover(1426210), hoursPlayed: 6, timelineOrder: 14 },
  { id: "split-fiction", name: "Split Fiction", category: "friend-slop", cover: steamCover(2001120), hoursPlayed: 7, timelineOrder: 28 },
  { id: "tabletop-simulator", name: "Tabletop Simulator", category: "friend-slop", cover: steamCover(286160), hoursPlayed: 2, timelineOrder: 25 },
  { id: "left-4-dead-2", name: "Left 4 Dead 2", category: "friend-slop", cover: steamCover(550), hoursPlayed: 2, timelineOrder: 1 },
  { id: "marvel-rivals", name: "Marvel Rivals", category: "friend-slop", cover: steamCover(2767030), hoursPlayed: 1, timelineOrder: 6 },
  { id: "midnight-murder-club", name: "Midnight Murder Club", category: "friend-slop", cover: steamCover(2698870), hoursPlayed: 55, timelineOrder: 29 },
  { id: "rv-there-yet", name: "RV There Yet?", category: "friend-slop",
    cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3949040/df3b0e300632f3cd1caf0aa9dc6213ebe79dac43/header_alt_assets_0.jpg",
    hoursPlayed: 11, timelineOrder: 20 },
  { id: "guards-thieves", name: "Of Guards and Thieves", category: "friend-slop", cover: steamCover(302590), hoursPlayed: 39, timelineOrder: 30 },

  // --- Solo & atmospheric ---
  { id: "hollow-knight", name: "Hollow Knight", category: "solo-atmospheric", cover: steamCover(367520), hoursPlayed: 37, timelineOrder: 19 },
  { id: "ori-blind-forest", name: "Ori and the Blind Forest", category: "solo-atmospheric", cover: steamCover(387290), hoursPlayed: 59, timelineOrder: 31 },
  { id: "ori-wisps", name: "Ori and the Will of the Wisps", category: "solo-atmospheric", cover: steamCover(1057090), hoursPlayed: 31, timelineOrder: 32 },
  { id: "rain-world", name: "Rain World", category: "solo-atmospheric", cover: steamCover(312520), hoursPlayed: 37, timelineOrder: 33 },
  { id: "little-nightmares-2", name: "Little Nightmares II", category: "up-next", cover: steamCover(860510), hoursPlayed: 0, timelineOrder: 44, featured: true, flag: "Not started", take: null },
  { id: "outlast", name: "Outlast", category: "solo-atmospheric", cover: steamCover(238320), hoursPlayed: 1, timelineOrder: 3 },
  { id: "bendy", name: "Bendy and the Ink Machine", category: "solo-atmospheric", cover: steamCover(622650), hoursPlayed: 41, timelineOrder: 15 },

  // --- Cozy ---
  { id: "stardew-valley", name: "Stardew Valley", category: "cozy", cover: steamCover(413150), hoursPlayed: 63, timelineOrder: 34 },
  { id: "slime-rancher", name: "Slime Rancher", category: "cozy", cover: steamCover(433340), hoursPlayed: 21, timelineOrder: 21 },
  { id: "slime-rancher-2", name: "Slime Rancher 2", category: "cozy", cover: steamCover(1657630), hoursPlayed: 18, timelineOrder: 35 },
  { id: "terraria", name: "Terraria", category: "cozy", cover: steamCover(105600), hoursPlayed: 1, timelineOrder: 2 },
  { id: "unpacking", name: "Unpacking", category: "cozy", cover: steamCover(1135690), hoursPlayed: 1, timelineOrder: 13 },
  { id: "little-to-the-left", name: "A Little to the Left", category: "cozy", cover: steamCover(1629520), hoursPlayed: 2, timelineOrder: 16 },
  { id: "botany-manor", name: "Botany Manor", category: "cozy", cover: steamCover(1425350), hoursPlayed: 31, timelineOrder: -5 },
  { id: "is-this-seat-taken", name: "Is This Seat Taken?", category: "cozy", cover: steamCover(3035120), hoursPlayed: 28, timelineOrder: 37 },

  // --- Big single-player ---
  { id: "cyberpunk-2077", name: "Cyberpunk 2077", category: "up-next", cover: steamCover(1091500), hoursPlayed: 0, timelineOrder: 45, featured: true, flag: "Not started", take: null },
  { id: "rdr2", name: "Red Dead Redemption 2", category: "big-single-player", cover: steamCover(1174180), hoursPlayed: 2, timelineOrder: 12 },
  { id: "fallout-4", name: "Fallout 4", category: "up-next", cover: steamCover(377160), hoursPlayed: 0, timelineOrder: 46, featured: true, flag: "Not started", take: null },
  { id: "hitman-woa", name: "HITMAN World of Assassination", category: "big-single-player", cover: steamCover(1659040), hoursPlayed: 3, timelineOrder: -4 },

  // --- Shooters ---
  { id: "cs2", name: "Counter-Strike 2", category: "shooters", cover: steamCover(730), hoursPlayed: 119, timelineOrder: 26 },
  { id: "destiny-2", name: "Destiny 2", category: "shooters", cover: steamCover(1085660), hoursPlayed: 62, timelineOrder: 39 },
  { id: "half-life-2", name: "Half-Life 2", category: "shooters", cover: steamCover(220), hoursPlayed: 12, timelineOrder: -1 },
  { id: "hl2-deathmatch", name: "Half-Life 2: Deathmatch", category: "shooters", cover: steamCover(320), hoursPlayed: 47, timelineOrder: -2 },
  { id: "hl-deathmatch-source", name: "Half-Life Deathmatch: Source", category: "shooters", cover: steamCover(360), hoursPlayed: 69, timelineOrder: -3 },
  { id: "arc-raiders", name: "ARC Raiders", category: "shooters", cover: steamCover(1808500), hoursPlayed: 22, timelineOrder: 17 },

  // --- Odds and ends ---
  { id: "henry-stickmin", name: "The Henry Stickmin Collection", category: "big-single-player", cover: steamCover(1089980), hoursPlayed: 45, timelineOrder: 8 },
  { id: "dispatch", name: "Dispatch", category: "big-single-player", cover: steamCover(2592160), hoursPlayed: 11, timelineOrder: 43 },
  { id: "homicipher", name: "Homicipher", category: "big-single-player", cover: steamCover(2423320), hoursPlayed: 1, timelineOrder: 7 },
  { id: "defense-grid-2", name: "Defense Grid 2", category: "big-single-player", cover: steamCover(221540), hoursPlayed: 8, timelineOrder: 18 },
  { id: "wizard101", name: "Wizard101", category: "cozy", cover: steamCover(799960), hoursPlayed: 105, timelineOrder: 24 },
  // This is a wallpaper/desktop tool, not really a game - kept since it
  // was in your Steam data, but say the word and it's gone.
  { id: "wallpaper-engine", name: "Wallpaper Engine", category: "big-single-player", cover: steamCover(431960), hoursPlayed: 3, timelineOrder: 22 },

  // --- Featured (Shelf view shows a write-up card for this) ---
  { id: "dead-space", name: "Dead Space", category: "up-next", cover: steamCover(1693980),
    hoursPlayed: 0, timelineOrder: 47, featured: true, flag: "Not started", take: null },
];
