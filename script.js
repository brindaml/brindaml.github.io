// Shadow-or-purify calculator.
//
// The mechanics this is built on, all from Pokemon GO's own rules:
// - A shadow Pokemon gets +20% Attack and -20% Defense versus its normal
//   stats, and its only charged move is Frustration until you TM it away.
// - Purifying removes both of those multipliers, guarantees the charged
//   move Return, and nudges every IV below 15 up by 2 (capped at 15).
//   It cannot be undone.
// - CP is computed from a Pokemon's base stats, its IVs, and its level's
//   CP multiplier (CPM), using the same formula the game uses:
//     CP = floor( Atk * sqrt(Def) * sqrt(Sta) * CPM^2 / 10 )
//   The game never shows you "level" directly, only CP, so this works
//   backward: given the species, IVs, and the CP the game is showing you
//   right now (while it's still shadow), it solves that same formula for
//   CPM instead of taking CPM as an input, then reuses that CPM to work
//   out the purified CP.
// - In raids, a short fight rewards the Attack boost over the Defense
//   penalty, so shadow is usually the better pick for a dedicated
//   attacker. In PvP, a long fight punishes the Defense penalty, so
//   purified is usually better, unless you deliberately want a fast,
//   fragile lead.

const SHADOW_ATK_MULT = 1.2;
const SHADOW_DEF_MULT = 0.8;
const PURIFY_IV_BONUS = 2;
const MAX_IV = 15;

const speciesSelect = document.getElementById("species");
const currentCpInput = document.getElementById("current-cp");
const ivAtkInput = document.getElementById("iv-atk");
const ivDefInput = document.getElementById("iv-def");
const ivStaInput = document.getElementById("iv-sta");
const ivAtkValue = document.getElementById("iv-atk-value");
const ivDefValue = document.getElementById("iv-def-value");
const ivStaValue = document.getElementById("iv-sta-value");

const form = document.getElementById("calc-form");
const cpError = document.getElementById("cp-error");
const result = document.getElementById("result");
const verdictEl = document.getElementById("result-verdict");
const reasoningEl = document.getElementById("result-reasoning");

// The CPM range the game actually uses, level 1 through 40. A derived CPM
// outside this range means the entered CP doesn't match a real Pokemon at
// these IVs, so the inputs get flagged instead of showing a fake result.
const MIN_CPM = CPM_TABLE["1"];
const MAX_CPM = CPM_TABLE["40"];

// --- Populate the species dropdown from pokemon-data.js ---
for (const species of GEN1_BASE_STATS) {
  const option = document.createElement("option");
  option.value = species.dex;
  option.textContent = `#${species.dex} ${species.name}`;
  speciesSelect.appendChild(option);
}

// --- Live slider readouts ---
ivAtkInput.addEventListener("input", () => (ivAtkValue.textContent = ivAtkInput.value));
ivDefInput.addEventListener("input", () => (ivDefValue.textContent = ivDefInput.value));
ivStaInput.addEventListener("input", () => (ivStaValue.textContent = ivStaInput.value));

// --- Stat math ---

function effectiveStats(base, ivs, isShadow) {
  return {
    atk: (base.atk + ivs.atk) * (isShadow ? SHADOW_ATK_MULT : 1),
    def: (base.def + ivs.def) * (isShadow ? SHADOW_DEF_MULT : 1),
    sta: base.sta + ivs.sta,
  };
}

function computeCP(stats, cpm) {
  const raw = (stats.atk * Math.sqrt(stats.def) * Math.sqrt(stats.sta) * cpm * cpm) / 10;
  return Math.max(10, Math.floor(raw));
}

function purifiedIVs(ivs) {
  const bump = (value) => Math.min(MAX_IV, value + PURIFY_IV_BONUS);
  return { atk: bump(ivs.atk), def: bump(ivs.def), sta: bump(ivs.sta) };
}

// Given the shadow stats and the CP the game is currently showing,
// solve CP = floor(Atk * sqrt(Def) * sqrt(Sta) * CPM^2 / 10) for CPM.
// Returns null if the CP doesn't correspond to any real level (1-40) for
// this species and these IVs.
function deriveCpm(shadowStats, enteredCP) {
  const denom = shadowStats.atk * Math.sqrt(shadowStats.def) * Math.sqrt(shadowStats.sta);
  const cpmSquared = (10 * enteredCP) / denom;
  if (!(cpmSquared > 0)) return null;

  const cpm = Math.sqrt(cpmSquared);
  const tolerance = 0.01; // rounding from the game's own floor() can nudge this slightly
  if (cpm < MIN_CPM - tolerance || cpm > MAX_CPM + tolerance) return null;

  return cpm;
}

// Every verdict below is read off the actual computed stats for this
// species and these IVs, not a fixed rule per purpose, so a Pokemon whose
// numbers land differently gets a different answer.

function recommend(purpose, shadowStats, purifiedStats) {
  if (purpose === "raid") {
    const shadowWins = shadowStats.atk >= purifiedStats.atk;
    return {
      verdict: shadowWins ? "Keep it shadow." : "Purify it.",
      isShadow: shadowWins,
      reasoning:
        `Raids are short, so raw Attack decides more than survivability. ` +
        `Shadow gives this Pokemon ${shadowStats.atk.toFixed(1)} effective ` +
        `Attack, versus ${purifiedStats.atk.toFixed(1)} purified, so ` +
        `${shadowWins ? "staying shadow" : "purifying"} deals more damage ` +
        `over the fight.` +
        (shadowWins
          ? " The one downside, its weak Frustration charge move, is " +
            "fixed with a Charged TM, so it does not need to hold you back."
          : ""),
    };
  }

  if (purpose === "pvp") {
    // Stat product (Attack x Defense x Stamina) is a common rough stand-in
    // for how a Pokemon performs in PvP: it rewards a balance of damage
    // and survivability rather than raw Attack alone.
    const shadowProduct = shadowStats.atk * shadowStats.def * shadowStats.sta;
    const purifiedProduct = purifiedStats.atk * purifiedStats.def * purifiedStats.sta;
    const shadowWins = shadowProduct > purifiedProduct;

    return {
      verdict: shadowWins ? "Keep it shadow." : "Purify it.",
      isShadow: shadowWins,
      reasoning:
        `Stat product (Attack x Defense x Stamina), a rough stand-in for ` +
        `overall PvP performance, comes out to ` +
        `${Math.round(shadowProduct).toLocaleString()} shadow versus ` +
        `${Math.round(purifiedProduct).toLocaleString()} purified, so ` +
        `${shadowWins ? "shadow" : "purified"} rates higher here. This is a ` +
        `simplified proxy, not a full league-capped ranking: real PvP play ` +
        `levels a Pokemon to just under a league's CP cap, which this does ` +
        `not account for. It does capture the core tradeoff though, shadow ` +
        `trades Defense for Attack, and over a long battle that usually ` +
        `costs more than it earns.`,
    };
  }

  // purpose === "dex"
  return {
    verdict: "Purify it.",
    isShadow: false,
    reasoning:
      "There is no combat tradeoff to weigh for a Pokedex or collection " +
      "entry, so take the free upside: purifying nudges up any IV below " +
      "15 and costs you nothing you were using.",
  };
}

// --- Wire it together ---

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const dex = Number(speciesSelect.value);
  const base = GEN1_BASE_STATS.find((species) => species.dex === dex);
  if (!base) return;

  const purpose = form.querySelector('input[name="purpose"]:checked')?.value;
  if (!purpose) return;

  const enteredCP = Number(currentCpInput.value);
  const ivs = {
    atk: Number(ivAtkInput.value),
    def: Number(ivDefInput.value),
    sta: Number(ivStaInput.value),
  };

  const shadowStats = effectiveStats(base, ivs, true);
  const cpm = deriveCpm(shadowStats, enteredCP);

  if (cpm === null) {
    cpError.hidden = false;
    result.hidden = true;
    return;
  }
  cpError.hidden = true;

  const purifiedStats = effectiveStats(base, purifiedIVs(ivs), false);
  const purifiedCP = computeCP(purifiedStats, cpm);

  document.getElementById("stat-atk-shadow").textContent = shadowStats.atk.toFixed(1);
  document.getElementById("stat-atk-purified").textContent = purifiedStats.atk.toFixed(1);
  document.getElementById("stat-def-shadow").textContent = shadowStats.def.toFixed(1);
  document.getElementById("stat-def-purified").textContent = purifiedStats.def.toFixed(1);
  document.getElementById("stat-cp-shadow").textContent = enteredCP;
  document.getElementById("stat-cp-purified").textContent = purifiedCP;

  const { verdict, isShadow, reasoning } = recommend(purpose, shadowStats, purifiedStats);
  verdictEl.textContent = `${base.name}: ${verdict}`;
  reasoningEl.textContent = reasoning;
  result.classList.toggle("verdict-shadow", isShadow);
  result.classList.toggle("verdict-purified", !isShadow);

  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
