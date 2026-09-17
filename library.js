// Renders the game library in three view modes from library-data.js:
//   shelf     grouped by genre/category, matches the original page
//   timeline  ordered by timelineOrder (placeholder data - see note below)
//   playtime  bubbles sized by hoursPlayed (placeholder data - see note below)
//
// The Playtime bubbles are a simplified CSS layout (sorted, wrapped,
// centered), not a true physics circle-packing simulation - it reads as
// a bubble cloud without the collision math a library like d3 would do.

const root = document.getElementById("library-root");
const toggle = document.getElementById("view-toggle");

function caseArt(game) {
  if (game.cover) {
    return `<img loading="lazy" onerror="this.remove()" src="${game.cover}" alt="">`;
  }
  return ""; // falls back to generated art via the --generated class
}

// --- Shelf view: the original genre-grouped shelf, plus write-ups ---

function renderShelf() {
  const byCategory = {};
  for (const g of GAMES) (byCategory[g.category] ??= []).push(g);

  const order = [
    "up-next", "friend-slop", "solo-atmospheric", "cozy",
    "big-single-player", "shooters",
  ];

  let html = "";
  for (const catId of order) {
    const games = byCategory[catId];
    if (!games) continue;
    const cat = CATEGORIES[catId];
    // "Up next" sits at the very top as a quick, plain row of cases (with
    // their "Not started" badge) rather than the write-up treatment - a
    // glance, not a chunk of placeholder text, and it's the first thing
    // the page shows.
    const featured = catId === "up-next" ? [] : games.filter((g) => g.featured);
    const rest = catId === "up-next" ? games : games.filter((g) => !g.featured);

    html += `<section class="shelf-section${catId === "friend-slop" ? " slop" : ""}">`;
    html += `<h2 class="shelf-label" style="--h:${cat.hue}"><span class="shelf-label-tape"></span><span class="shelf-label-icon">${cat.icon}</span>${cat.label}</h2>`;

    for (const g of featured) {
      html += `
        <article class="game-feature" style="--h:${cat.hue}">
          <div class="game-case game-case--tall${g.cover ? "" : " game-case--generated"}" data-id="${g.id}">
            ${caseArt(g)}
            ${g.flag ? `<span class="case-flag">${g.flag}</span>` : ""}
            <span class="case-title">${g.name}</span>
          </div>
          <div class="feature-body">
            <h3>${g.name}</h3>
            <p class="take todo">${g.take || "Why this one mattered. 1&ndash;2 sentences."}</p>
            ${g.link ? `<p>I got deep enough into this one to build a tool for it: <a class="tool-link" href="${g.link}">${g.linkLabel}</a></p>` : ""}
          </div>
        </article>`;
    }

    if (rest.length) {
      html += `<div class="shelf-grid" style="--h:${cat.hue}">`;
      for (const g of rest) {
        html += `<article class="game-case${g.cover ? "" : " game-case--generated"}" data-id="${g.id}">${caseArt(g)}${g.flag ? `<span class="case-flag">${g.flag}</span>` : ""}<span class="case-title">${g.name}</span></article>`;
      }
      html += `</div>`;
    }
    html += `</section>`;
  }
  root.innerHTML = html;
}

// --- Timeline view: a snake - flows across a row, drops down, then flows
// back the other way, like an ox plowing a field. Reads left-to-right,
// right-to-left, left-to-right, and so on, top to bottom - uses a
// desktop screen's width without either one long column or a narrow
// left/right zigzag down the middle. ---

function renderTimeline() {
  // Descending: up-next and most-recently-played sit at the top, and
  // scrolling down works backward through history to the oldest games.
  const sorted = [...GAMES].sort((a, b) => b.timelineOrder - a.timelineOrder);
  const PER_ROW = 5;

  const rows = [];
  for (let i = 0; i < sorted.length; i += PER_ROW) {
    rows.push(sorted.slice(i, i + PER_ROW));
  }
  // Rows stay in natural DOM order (6,7,8,9,10, not reversed); the visual
  // right-to-left flip on odd rows comes entirely from CSS's
  // flex-direction: row-reverse on .snake-row--rtl below. Reversing the
  // array here too would flip it twice, right back to normal order -
  // that was the actual bug the first time this shipped.

  // A little vertical wobble per node, in a repeating but non-obvious
  // pattern, so cards scatter up and down instead of sitting in one
  // rigid straight line - this is what the connecting line threads
  // through, so the wobble is what makes the whole path feel organic.
  const WOBBLE = [0, 26, -16, 34, -10, 14];
  let nodeIndex = 0;

  let html = `
    <div class="timeline-snake">
      <svg class="snake-line"></svg>`;
  rows.forEach((row, rowIndex) => {
    const dir = rowIndex % 2 === 0 ? "ltr" : "rtl";
    html += `<div class="snake-row snake-row--${dir}">`;
    for (const g of row) {
      const cat = CATEGORIES[g.category];
      const wobble = WOBBLE[nodeIndex % WOBBLE.length];
      nodeIndex++;
      html += `
        <div class="snake-node" style="margin-top:${wobble}px">
          <div class="snake-dot" style="--h:${cat.hue}"></div>
          <article class="game-case timeline-case${g.cover ? "" : " game-case--generated"}" style="--h:${cat.hue}" data-id="${g.id}">
            ${caseArt(g)}
            <span class="timeline-info">${g.hoursPlayed > 0 ? `${g.hoursPlayed}h played` : "Not started"}</span>
          </article>
          <span class="timeline-text">
            <span class="timeline-name">${g.name}</span>
            <span class="timeline-cat" style="--h:${cat.hue}">${cat.label}</span>
          </span>
        </div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;
  root.innerHTML = html;
  drawSnakeLine(root.querySelector(".timeline-snake"));
}

// One continuous smooth line threaded through every dot's real, measured
// position (wobble included), instead of separate straight pieces for
// "across" and "down" that never quite read as the same path. Smoothing
// technique: draw quadratic curves where each curve's control point is
// the actual dot and its end point is the midpoint to the next dot - a
// standard trick for turning a jagged point-to-point line into one that
// flows.
function drawSnakeLine(container) {
  if (!container) return;
  const svg = container.querySelector(".snake-line");
  const dots = [...container.querySelectorAll(".snake-dot")];
  if (dots.length < 2) return;

  const base = container.getBoundingClientRect();
  const pts = dots.map((dot) => {
    const r = dot.getBoundingClientRect();
    return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
  });

  // Catmull-Rom -> cubic Bezier: unlike the quadratic-through-midpoints
  // trick this used to use, this curve passes exactly through every
  // point (not just near it), which is what puts each dot exactly on
  // the line while keeping the whole thing smooth. Standard conversion:
  // for the segment p1->p2, using neighbors p0 and p3 (the first/last
  // point repeats itself as its own neighbor so the ends don't need
  // special-casing), the two control points are p1+(p2-p0)/6 and
  // p2-(p3-p1)/6.
  const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
  }

  svg.setAttribute("viewBox", `0 0 ${container.scrollWidth} ${container.scrollHeight}`);
  svg.innerHTML = `<path d="${d}" fill="none" stroke="var(--page-ink-faint)" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" />`;
}

// --- Playtime view: bubbles sized by hoursPlayed, real circle packing ---
//
// The biggest circle (most hours) goes first, dead center. Every circle
// after that spirals outward from the center, in ever-widening loops,
// and settles at the first point along that spiral where it doesn't
// overlap anything already placed - so the whole thing grows as one
// tight cluster around the most-played game, rather than wrapping into
// rows. This is a real (if simple) packing algorithm, not a layout trick.

function packCircles(items) {
  // items: [{ r, ...rest }], sorted caller's choice; biggest should be
  // first so it anchors the center.
  const placed = [];
  const PADDING = 3; // a little breathing room between touching circles

  for (const item of items) {
    if (placed.length === 0) {
      placed.push({ ...item, x: 0, y: 0 });
      continue;
    }

    const angleStep = 0.12;
    const spiralTightness = 3.2; // smaller = tighter, more overlap checks
    // The search spiral is squashed vertically and stretched horizontally
    // (candidate positions further out sideways get tried before ones
    // far up/down), so the cluster naturally settles into a wide, flat
    // shape instead of growing tall. Collision checks below still use
    // these same real, biased coordinates and real radii, so circles
    // still never actually overlap - the bias only steers where each one
    // searches for its resting spot, it can't break the packing itself.
    const X_BIAS = 1.55;
    const Y_BIAS = 0.62;
    let x = 0, y = 0;
    for (let a = 0; a < 250; a += angleStep) {
      const rad = spiralTightness * a;
      x = rad * Math.cos(a) * X_BIAS;
      y = rad * Math.sin(a) * Y_BIAS;
      const collides = placed.some((p) => {
        const dx = x - p.x, dy = y - p.y;
        return Math.hypot(dx, dy) < item.r + p.r + PADDING;
      });
      if (!collides) break;
    }
    placed.push({ ...item, x, y });
  }
  return placed;
}

// A brush-stroke trail that follows the cursor across the bubble cluster,
// and pushes a little life into whatever bubbles it passes near - not
// just a decoration drawn on top, but something the circles themselves
// react to. Two parts:
//
// 1. A "follower" point that eases toward the real cursor every frame
//    (rather than snapping to it) - that lag is the follow-through, a
//    little whip behind fast movement. The last several follower
//    positions draw a tapering row of line segments behind it.
// 2. Every bubble whose center is close to that follower puffs up a
//    little, more the closer it is, easing back down as the trail moves
//    on - like the stroke is nudging them as it brushes past.
function initBubbleTrail(field) {
  if (!field) return;

  const bubbles = [...field.querySelectorAll(".bubble")].map((el, i) => {
    // Matches the CSS nth-child tilt rule, so the resting rotation this
    // reads back to isn't a jarring reset to dead-straight.
    const pos = i + 1;
    const baseRotate = pos % 3 === 0 ? -4 : pos % 3 === 1 ? 3 : 0;
    return {
      el,
      cx: el.offsetLeft + el.offsetWidth / 2,
      cy: el.offsetTop + el.offsetHeight / 2,
      baseRotate,
    };
  });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "bubble-trail");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  field.appendChild(svg);

  let mouse = null;
  let follower = null;
  const points = [];
  const MAX_POINTS = 14;
  const EASE = 0.25;
  const REACH = 120; // px - how far a bubble can feel the trail
  const MAX_PUFF = 0.3; // biggest size boost, right under the follower

  field.addEventListener("mousemove", (e) => {
    const rect = field.getBoundingClientRect();
    mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  });
  field.addEventListener("mouseleave", () => {
    mouse = null;
  });

  function tick() {
    // The old bubble-field from a previous Playtime render gets fully
    // replaced (not just hidden) when the view changes, so this is how
    // that old loop notices and stops recursing instead of running
    // forever in the background.
    if (!field.isConnected) return;

    if (mouse) {
      if (!follower) follower = { ...mouse };
      follower = {
        x: follower.x + (mouse.x - follower.x) * EASE,
        y: follower.y + (mouse.y - follower.y) * EASE,
      };
      points.push({ ...follower });
      if (points.length > MAX_POINTS) points.shift();
    } else if (points.length) {
      points.shift(); // drains the trail away once the cursor leaves
    }

    svg.innerHTML = "";
    for (let i = 1; i < points.length; i++) {
      const t = i / points.length; // 0 near the tail, 1 at the cursor end
      const seg = document.createElementNS("http://www.w3.org/2000/svg", "line");
      seg.setAttribute("x1", points[i - 1].x);
      seg.setAttribute("y1", points[i - 1].y);
      seg.setAttribute("x2", points[i].x);
      seg.setAttribute("y2", points[i].y);
      seg.setAttribute("stroke-width", (1 + t * 4.5).toFixed(2));
      seg.setAttribute("opacity", (t * 0.85).toFixed(2));
      svg.appendChild(seg);
    }

    if (follower) {
      for (const b of bubbles) {
        const dist = Math.hypot(follower.x - b.cx, follower.y - b.cy);
        const closeness = Math.max(0, 1 - dist / REACH);
        const scale = 1 + MAX_PUFF * closeness * closeness; // eased falloff
        b.el.style.transform = `scale(${scale.toFixed(3)}) rotate(${b.baseRotate}deg)`;
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderPlaytime() {
  const withHours = GAMES.filter((g) => g.hoursPlayed > 0);
  const maxHours = Math.max(...withHours.map((g) => g.hoursPlayed));
  const MIN_R = 26, MAX_R = 105;
  // A square-root curve (exponent 0.5) is the usual choice for bubble
  // charts (area, not radius, then reads proportional to the value) but
  // it compresses the top of the range - a game with way more hours than
  // everything else doesn't end up looking like it. A gentler curve
  // (0.7) keeps that relationship but lets the real standouts read as
  // bigger, at the cost of the strict area-proportionality.
  const CURVE = 0.7;

  const sized = withHours.map((g) => ({
    g,
    r: Math.round(MIN_R + (MAX_R - MIN_R) * Math.pow(g.hoursPlayed / maxHours, CURVE)),
  }));

  // Biggest first, so packCircles anchors it at dead center - literally
  // "centered around the one you play the most."
  sized.sort((a, b) => b.r - a.r);
  const placed = packCircles(sized);

  const minX = Math.min(...placed.map((c) => c.x - c.r));
  const maxX = Math.max(...placed.map((c) => c.x + c.r));
  const minY = Math.min(...placed.map((c) => c.y - c.r));
  const maxY = Math.max(...placed.map((c) => c.y + c.r));
  const width = maxX - minX;
  const height = maxY - minY;

  let html = `
    <div class="bubble-field-wrap">
      <div class="bubble-field" style="width:${width}px; height:${height}px;">`;
  for (const c of placed) {
    const cat = CATEGORIES[c.g.category];
    const left = c.x - c.r - minX;
    const top = c.y - c.r - minY;
    const size = c.r * 2;
    html += `
        <div class="bubble${c.g.cover ? "" : " bubble--generated"}" style="left:${left}px; top:${top}px; width:${size}px; height:${size}px; --h:${cat.hue}" title="${c.g.name} — ${c.g.hoursPlayed}h" data-id="${c.g.id}">
          ${c.g.cover ? `<img loading="lazy" onerror="this.remove()" src="${c.g.cover}" alt="">` : ""}
          <span class="bubble-label">${c.g.name}</span>
        </div>`;
  }
  html += `</div></div>`;
  root.innerHTML = html;
  initBubbleTrail(root.querySelector(".bubble-field"));
}

const VIEWS = { shelf: renderShelf, timeline: renderTimeline, playtime: renderPlaytime };

// --- FLIP transition between views ---
// (First, Last, Invert, Play: record where each game's card is now, render
// the new view, then animate each matching card from its old spot to its
// new one instead of letting it just jump.) Matching is by data-id, which
// every game element carries in all three views. A card that only exists
// in one view (the Shelf write-up boxes, the section labels) has nothing
// to match against, so it simply fades and scales in instead.

function switchView(renderFn) {
  const before = new Map();
  root.querySelectorAll("[data-id]").forEach((el) => {
    before.set(el.dataset.id, el.getBoundingClientRect());
  });

  renderFn();

  root.querySelectorAll("[data-id]").forEach((el) => {
    const prev = before.get(el.dataset.id);
    const now = el.getBoundingClientRect();

    if (!prev) {
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.transform = "scale(0.85)";
      el.getBoundingClientRect(); // force layout so "none" actually commits
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
          el.style.opacity = "1";
          el.style.transform = "";
        });
      });
      return;
    }

    const dx = prev.left - now.left;
    const dy = prev.top - now.top;
    const sx = prev.width / now.width;
    const sy = prev.height / now.height;
    if (!dx && !dy && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;

    el.style.transformOrigin = "top left";
    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    el.getBoundingClientRect(); // force layout so the browser commits this
                                // starting position before we animate away
                                // from it - otherwise both style changes can
                                // get batched into one frame and nothing
                                // visibly moves.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });
  });

  // Clean up the inline styles once the animation finishes, so hover
  // states and later transitions go back to whatever the CSS says.
  setTimeout(() => {
    root.querySelectorAll("[data-id]").forEach((el) => {
      el.style.transition = "";
      el.style.transform = "";
      el.style.opacity = "";
      el.style.transformOrigin = "";
    });
  }, 700);
}

toggle.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-view]");
  if (!btn || btn.classList.contains("active")) return;
  toggle.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
  switchView(VIEWS[btn.dataset.view]);
});

const startView = location.hash.replace("#", "");
if (VIEWS[startView]) {
  toggle.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.view === startView));
}
VIEWS[startView] ? VIEWS[startView]() : renderShelf();
