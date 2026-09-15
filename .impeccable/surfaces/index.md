---
version: 1
slug: "index"
primary_target: "index"
related_targets: []
---

# Surface: index.html (whole page, Experience mode)

Scope: entire single-page site. Audience: ME internship recruiters skimming quickly. Job: come away remembering real, verifiable engineering substance. Proof/content: resume, PER brake design doc, two SSRN papers, real bio facts already in the page. Constraints: one page, no nav, mostly text, no fake content, no stock/AI photos, no purple gradients/pill buttons/emoji/em dashes, must respect prefers-reduced-motion and remain keyboard/touch accessible (no hover-only content).

User brief is explicitly pinned: reinterpret the interaction pattern of a reference "movie premiere" personal site (spotlight cursor, hover-reveal name, a swinging hung object, tearable ticket-style elements, a click-to-flip split-flap display) using mechanical-engineering motifs instead of movie motifs. Explicitly corrected away from a basketball theme. Per new-work.md, a brief this specific is treated as already pinning the world; built as the assigned/top-ranked direction rather than run through an open 7-candidate tournament (no decision-page is viewable by the user in this remote session, and the user asked to see the build before further discussion).

## Direction contract

THESIS: A recruiter should feel like they picked up something off a working engineer's desk, not a portfolio template; the page behaves like functioning shop equipment you operate, refusing the generic hero-plus-card-grid arrangement.

OWN-WORLD: Near-black instrument-panel ground, IBM Plex Mono throughout, one warm amber/signal accent (inspection-stamp ink / indicator LED). Hairline rules and corner registration marks like a drafting sheet border. Real engineering artifacts stand in for the reference's movie props: a hanging shop ID badge on a lanyard in place of a framed photo; tearable credential tags (NASA SEES visitor badge, ISEF exhibitor badge, Penn Electric Racing tech-inspection sticker) in place of movie tickets; a split-flap role/status display (elevator floor indicator / workshop status board) in place of the reference's job-title flip board; a cursor that acts as a handheld inspection lamp in place of a spotlight.

STORY: Page loads mostly dim; moving the cursor sweeps a work-light across it, and his name resolves into focus as the light passes near it. The badge hangs and swings on hover like something physically suspended. Clicking a credential tag tears it open to reveal the specific real achievement it names. The flip board cycles through his actual roles/titles on click. No scrolling needed beyond one page of real content underneath.

FIRST VIEWPORT: hanging badge top-right on a cord; name centered, dim until the cursor-light passes near it; 2-3 tearable credential tags upper-left; flip-board role display beneath the name; bio copy below, unchanged in substance from the current build; contact row and tagline at the bottom, as today.

FORM: engineering-instrumentation/workshop-desk world; treated as the brief-pinned direction (concept-seed ran degraded, seed key 8c441959, assigned index 5 of a notional 7; brief-pinned decisions beat the roll per new-work.md).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Revision 2 (user course-correction, supersedes parts of the contract above)

After the first finish review (disposition: fix), the user clarified live in conversation that the reference site was meant only as an example of what "dynamic" can look like, not a template to reskin literally. Explicit corrections, which override the original OWN-WORLD/STORY language above:

- No cursor-tracking spotlight/lamp of any kind ("this isn't a movie"). Removed entirely, including the hover-reveal-name mechanic that depended on it. The name is now simply always visible, centered, static.
- Accent color changed from amber/orange to blue (`--accent: #4da6ff`, `--accent-dim: #234058`), explicitly because amber/orange was rejected.
- Typography changed from IBM Plex Mono (a "typewriter" look, rejected) to Titillium Web, a clean grotesque sans with a technical/aerospace design heritage, used throughout instead of monospace.
- Added a genuinely mechanical dynamic element requested by name: two meshed SVG gears (10-tooth and 8-tooth polygons) that continuously counter-rotate at an angular-velocity ratio matching their tooth counts, paused under `prefers-reduced-motion`. This, not a cursor effect, is now the page's signature "dynamic" element.
- Kept from the original contract: the hanging badge (swings on hover/click), the tearable credential tags (now linking out to the real SSRN papers and the PER brake design PDF, per the first finish review's fix items), the split-flap role display, and the drafting-sheet corner registration marks.

This revision has not yet been through a fresh finish review; the reviewer's remaining "fix" items from the first pass that are still relevant (proof links, corner frame) were already applied before this revision and are unaffected by it.

## Revision 3 (user course-correction: commit fully to a real blueprint)

User supplied three real reference photos (a CubeSat, the actual Penn Electric Racing car, a space-debris field illustration) and asked for a genuine cyanotype blueprint, not a dark theme with a faint grid tint. Also called out the car/CubeSat icons from Revision 2 as looking wrong and randomly placed, and asked what "skills" would fix it; the honest answer given was that hand-authored representational SVG icons (a cartoon car, a cartoon satellite) were the wrong approach regardless of skill, since no image-generation tool is available in this environment. Pivoted to line-art blueprint schematics instead, which suits hand-authored SVG far better than representational icons do.

- Full color change to an actual blueprint palette: `--bg: #163a5c` (blueprint blue), `--ink`/`--ink-soft` near-white/light-blue for high contrast, `--accent: #ff7a63` (a "redline" red, referencing how engineers redline blueprints in red pen/pencil, used for every interactive element).
- Real two-scale grid (17px fine + 170px coarse) over the whole page, styled as blueprint graph paper rather than a generic UI grid tint.
- `Allerta Stencil` added for the name, section-like labels, tag stamps, and figure captions (genuine blueprint/drafting lettering); body copy stays in Titillium Web for readability.
- Removed the hanging ID-badge element entirely. The name is now the literal first element on the page, large and centered.
- Replaced the sidebar car/CubeSat icons with three bordered "figure plates" (styled after the real Figure 1/2/3 captions in the PER brake design PDF already in the repo), each a proper blueprint line-art schematic drawn from the user's reference photos, placed in-flow directly after the bullet list that discusses all three topics (not fixed-position, not hidden on any viewport):
  - Fig. 1: space debris field, orbiting the Earth's limb, with 3 fragments actually animated along dashed orbit paths via SVG `animateMotion` (genuine orbital motion, not decorative).
  - Fig. 2: isometric 1U CubeSat with corner rails and solar-panel paneling, plus a blinking telemetry-light accent.
  - Fig. 3: FSAE open-wheel car side profile (nose, cockpit, rear wing with endplates, exposed wheels), with the wheels actually spinning.
- Fixed two real bugs found while building this: the Earth-limb circle bled out of its frame into the caption (`.plate-art` had `overflow: visible`; changed to `hidden`), and the car's wheel-spin animation drifted away from the car body at this smaller render scale (`transform-box: fill-box` with pixel-value `transform-origin` doesn't scale correctly; fixed by wrapping each wheel in a `translate(cx,cy)` group and spinning an inner group centered on local origin with percentage-based `transform-origin: 50% 50%`).

## Revision 4 (user course-correction: page read as a static document, not a website; drawings not convincing enough)

User feedback: the page still looked like "a fancy document/pdf," not a website; the three figures needed to look like the real objects (an actual CubeSat, an actual car), the debris needed to visibly move, the tearable credential-tag rack needed to go entirely ("that's not engineering"), the name needed to look like actual handwriting on a blueprint, the linework needed to look hand-sketched rather than computer-drawn while staying dynamic, and body copy needed more personality. User named three libraries to fetch and use: `rough.js` (via a referenced skills repo), `motiondivision/motion`, and later mid-round `juliangarnier/anime` specifically for the schematics.

- Removed the tag-rack entirely (markup, CSS, JS listener). The three real proof links it carried (two SSRN abstracts, the PER brake-design PDF) were relocated as inline "Read the paper / Read the design doc &rarr;" links at the end of the relevant paragraph, so no factual/verifiable content was lost.
- Typography: replaced Allerta Stencil with self-hosted `Architects Daughter` for the name only (rotated -1.2deg, reads as handwriting on the sheet), added `Space Grotesk` for kickers/captions/tagline (a display face with more personality than the previous stencil label style), and replaced Titillium Web with `Nunito` for body copy (warmer, rounder, less "bland" per the request). All three fonts are vendored locally as woff2 (`fonts/`, sourced from the `@fontsource` npm packages, ~160KB total) with local `@font-face` rules rather than a Google Fonts `@import`, since this sandbox's egress proxy blocks `fonts.googleapis.com` at test time and self-hosting removes that fragility for real users behind any similarly strict network too.
- Rebuilt all three schematics (CubeSat, FSAE car, space-debris field) as programmatically-generated rough.js sketches (`js/illustrations.js`, `js/vendor/rough.js`, a locally-vendored copy of `roughjs@4.6.6`'s bundled UMD build) instead of hand-authored crisp SVG polygons, so the linework reads as hand-drawn rather than vector-perfect. Added more object-specific detail per the user's fidelity complaint: the CubeSat gained rail bolts, panel seam lines, and a deployable-antenna bracket; the car gained a roll hoop, sidepod line, and a rear diffuser kick in addition to the existing wings/cockpit/wheels.
- Space debris motion: enlarged the fragments, added a fourth fragment, and gave each one two trailing "ghost" copies (same shape, later `animateMotion` phase, lower opacity) to read as a comet-trail smear, which was the fix for the user's repeated "the debris still isn't registering as moving" note; a single small dot moving slowly wasn't legible as motion, a trail is.
- Added `anime.js v4` (`js/vendor/anime.min.js`, vendored UMD build fetched via the npm registry directly since jsDelivr/unpkg are blocked here) purely for the three schematics: each rough-sketched mount group is put through `anime.createDrawable()` plus `animate({ draw: ['0 0','0 1'] })`, triggered by `anime.onScroll()` when the figure scrolls into view, so the sketch visibly draws itself onto the page rather than appearing fully formed. Found and fixed a real bug while wiring this up: the car body and Earth-limb circle used `hachure` fillStyle with a fill color equal to (or nearly indistinguishable from) the page background, so the sketchy fill wash was being generated but invisible; changed both to a translucent light ink color so the hachure shading actually shows.
- Added `motion` (Motion/Framer Motion, `js/vendor/motion.min.js`, a minimal esbuild-bundled build exporting only `animate`/`inView`/`stagger` rather than vendoring the full ~800-file unbundled package) for scroll-triggered entrance reveals on the text blocks and a staggered reveal on the bullet list (`js/main.js`), replacing the now-dead tag-tear click handler. This is the fix for "it just looks like a fancy document": content now enters with motion as the page is scrolled, rather than all being present and static on load.
- All added motion (rough draw-on, Motion text reveals, the existing blink/spin/tumble/orbit loops) is skipped under `prefers-reduced-motion: reduce`; reduced-motion visitors get the final static state directly with no missing content.
- Investigated the user's other named link, `saurav-z/free-image-generation-api`: it is genuinely free (Cloudflare Workers AI free tier, no billing required) but requires the user to create their own Cloudflare account and manually deploy a Worker (paste code, set an API key, enable Workers AI, add an AI binding), account/infra setup only the user can do, so it was not integrated in this round; reported to the user instead of silently skipped.
