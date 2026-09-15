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

THESIS: A recruiter should feel like they picked up something off a working engineer's desk, not a portfolio template — the page behaves like functioning shop equipment you operate, refusing the generic hero-plus-card-grid arrangement.

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
