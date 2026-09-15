# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: plain static HTML/CSS/JS, no framework, no build step. Deployed as a static site (GitHub repo `NikhilK1212/PersonalWebsite`, branch `claude/modest-darwin-gvjepa`); no custom domain attached yet.

## Users

Recruiters and hiring managers evaluating Nikhil Krishna for mechanical engineering internships. They are skimming quickly, comparing him against other applicants, and looking for evidence of real hands-on engineering competence (CAD, hand calculations, hardware that got built and tested) rather than personality or polish for its own sake.

## Product Purpose

A personal site that gets Nikhil considered for ME internships. Success means a recruiter comes away with concrete, verifiable evidence of engineering ability (real design calculations, real published research, real organizations) and remembers him, without anything on the page reading as fabricated, templated, or AI-generated.

## Positioning

Most student portfolio sites in this genre are either (a) generic AI-generated SaaS-template layouts (card grids, purple gradients, vague hero copy) or (b) plain resumes. This site instead reads as authored by a specific person: real engineering substance (FSAE brake system design worked from the rulebook, published SSRN papers, a NASA internship) delivered through a distinctive, hand-crafted interactive presentation, the way a small set of standout personal sites in other fields (e.g. film, startups) do.

## Operating Context

Single page, no internal navigation/routing. Viewed by recruiters on desktop primarily, but must work on mobile. No CMS, no backend; content changes are code edits. Real downloadable assets already in the repo: `assets/Nikhil_Krishna_Resume.pdf`, `assets/Penn_Electric_Racing_Brake_Pedal_Design.pdf`.

## Capabilities and Constraints

- No fake or fabricated content anywhere: no fake reviews, testimonials, metrics, or customer counts. Every number/claim must trace to the resume, the two SSRN papers, or the PER design document already in the repo.
- No stock photography or AI-generated imagery. No real photo of Nikhil exists in the project yet; any figure/portrait-style element must use a real photo he supplies later, or a non-photographic (illustrated/typographic/object) stand-in until then.
- Never launches until: a custom domain is connected, a favicon exists (already does: `assets/favicon.svg`), and no "Made with AI" watermark is present.
- Banned stylistically, per explicit earlier instruction: purple gradients, pill-shaped buttons, emoji-as-icons, em dashes anywhere in copy or code comments, vague/generic hero copy, cursor-animation gimmicks done for their own sake rather than in service of the concept, over-the-top scroll animations, fake customer/visitor counters.
- Current visual language: IBM Plex Mono throughout, dark background by default with a working light/dark toggle (persisted via localStorage), no external JS framework.
- New engineering-themed interactive direction (this round): the user wants a "movie premiere personal site" interaction pattern (spotlight cursor, hover-reveal name, a swinging hung object, tearable ticket/pass elements, a split-flap display that changes on click) reinterpreted with mechanical-engineering motifs instead of movie motifs. Explicitly NOT basketball-themed (user corrected this). Still one page, still mostly text.

## Brand Commitments

- Name: Nikhil Krishna. Contact: nikhilkr@engineering.upenn.edu, linkedin.com/in/nikhil-rao-krishna.
- Voice established so far: plain, factual, lowercase-casual first-person narration (see current `index.html`), not corporate/marketing tone.

## Evidence on Hand

- `assets/Nikhil_Krishna_Resume.pdf`: full resume (education, research, activities, certifications).
- `assets/Penn_Electric_Racing_Brake_Pedal_Design.pdf`: an 11-page from-first-principles brake pedal design calculation for Penn Electric Racing's FSAE vehicle (pedal ratio, master cylinder bore, hydraulic pressure, structural load case).
- Two published SSRN papers (real, with real abstract IDs used as links: ssrn.com/abstract=5367113 and ssrn.com/abstract=7271839): space debris ML surveillance framework, and a bioinspired CubeSat thermal control film from a NASA SEES internship.
- No real photo of Nikhil is on hand. State this rather than substituting a stock or AI-generated one.

## Product Principles

1. Every visual flourish must be earned by and traceable to something real Nikhil actually did; decoration standing in for substance is the exact failure mode this project is reacting against.
2. Interactive/motion elements should feel like discoveries a recruiter makes while reading, not a demo reel; they must never block or slow down getting to the real content (resume, papers, design doc).
3. One page, no fake metrics, no stock imagery, no purple-gradient/pill-button/emoji default aesthetic, no em dashes.
4. When an interaction needs an asset the project doesn't have yet (e.g. a real photo), design around the gap honestly rather than faking the asset.

## Accessibility & Inclusion

No custom cursor or hover-only interaction may be the sole way to reach content or information; provide a non-hover/non-cursor path (e.g. focus/tap states) for keyboard and touch users. Respect `prefers-reduced-motion`.
