# Aurevia Premium Motors — brief

## 1 · What this is
A showcase website for Aurevia Premium Motors, a premium multi-brand car
showroom presenting selected vehicles from Mercedes-Benz, Audi, BMW and
Porsche. It is for people considering a premium vehicle who want to browse
stock and speak to a person. The single conversion goal is: book a meeting
with a sales agent.

This is a brochure site, NOT a web application. No accounts, no payments,
no checkout, no cart, no rental booking, no CMS, no admin dashboard.
Vehicle data lives in local content files. The meeting form posts to a
rented form service. If a task seems to need a database, auth or a server,
the task is wrong — stop and say so.

v1 ships: Home, Vehicles, Brand (one template x4), Vehicle detail (one
template), Book a Meeting, Contact. About, Services, FAQ and legal pages
are v2 and must not be built yet.

## 2 · Stack
[FILL FROM package.json AFTER SCAFFOLDING. Do not guess.]
No test framework. The gate is `npm run build` passing.

## 3 · Structure
[FILL FROM THE REAL TREE ON DISK AFTER SCAFFOLDING.]

## 4 · Design direction

Reference: A premium multi-brand car showroom in the style of a modern
  rental/fleet site — floating white pill nav, cinematic showroom hero,
  four brand image cards, horizontal vehicle cards, alternating
  white / light-gray / obsidian section rhythm.

Signature: The search bar. A white card, radius 16px, overlapping the
  bottom edge of the hero image by exactly 40% of its own height, with a
  segmented tab row (All Vehicles / New Arrivals / Featured) sitting on
  its top edge. Four pill selects and one accent Search button inside.
  This is the one structural device tying hero to page — get it exact.
  Below 768px it drops below the hero instead of overlapping.

Palette:
  --color-ink       #080A0D  [headings, body text, dark sections, footer]
  --color-graphite  #181B20  [secondary dark bands, image overlays]
  --color-bg        #FFFFFF  [page background, nav bar, cards]
  --color-surface   #F3F4F6  [alternate sections, inventory background]
  --color-border    #DDE1E6  [dividers, input outlines — decorative only]
  --color-muted     #69717C  [specs, labels, metadata]
  --color-accent    #74A7FF  [button fills, active tabs, selected card tint]
  --color-sold      #B7BBC2  [sold / unavailable status]
  --color-available #2E9D69  [available status, form success]

Type:
  Display: Manrope 600/700/800 — h1-h3, vehicle names, prices, nav.
  Body:    Inter 400/500/600 — paragraphs, specs, labels, buttons.
  Accent:  none. Never a third family.

Rules — never violate:
  - Never write a raw hex in a component. Everything from @theme tokens.
  - CONTRAST: #74A7FF measures 2.41:1 on white and 8.22:1 on #080A0D.
    Accent is a BACKGROUND only. Text on an accent fill is always #080A0D,
    never white. Accent is never text, link or icon colour on white or
    #F3F4F6. Accent as text is permitted on #080A0D and #181B20 only.
  - #DDE1E6 is 1.31:1 on white — dividers and decoration only. A border
    that identifies a control uses #69717C.
  - Accent occupies under 10% of any screen. Never a full-width accent band.
  - Never fork a component to add a variant. Add the variant.
  - Build two real layouts: 390px and 1280px. Not one stretched one.
  - No gradients, no shadows beyond a 1px hairline, no glassmorphism.

## 5 · Conventions
- Server components by default; client only where interaction requires it.
- One component per file, named to match the file.
- All colour and spacing from @theme tokens. Never a raw hex.
- Never override a component's base utility via className. Wrap it instead.
- Copy is sentence case, active voice.
  Banned: elevate, curated, bespoke, nestled, unparalleled, seamless,
  world-class, amazing deal, hurry, best ever.
- Never invent vehicle data, prices, discounts, reviews or offers.
  Unknown values are marked [REPLACE] so they are greppable.
- Match the existing exemplar before inventing a new pattern.

## 6 · Guardrails
- Never commit to main. Branch: [type]/[short-description].
- Never run a command requiring sudo. You cannot answer a password prompt.
  If a step needs it, stop and tell me the command to run myself.
- Never use --no-verify or any flag that bypasses a git hook.
- Never install a UI component library. Build from tokens.
- Never mark work complete because a build passed. Verify in a browser.
- Never reproduce a manufacturer logo as a brand asset. Manufacturer names
  appear as text only.

## 7 · Definition of done
1. `npm run build` passes clean.
2. Verified in a browser at 390px and 1280px.
3. No horizontal scroll at any width from 320 to 1920.
4. Exactly one h1 per page.
"It builds" is not done. Observed behaviour is done.

## 8 · Working efficiently
- Batch independent reads and commands into one call. Do not read a file
  you have already read this session.
- Do not narrate. Report what changed, not what you are about to do.
- Verify to blast radius: a copy or image change needs a build and a look
  at that one page. A token change needs a click through the site.
- Keep this file under 5,000 tokens. Anything that must survive a context
  reset belongs here; nothing else does.

## 9 · Ambiguity
Resolve in this order: this file, then the convention already established
elsewhere in this codebase. If both are silent, decide and continue —
then record the decision in the commit message. Do not stop to ask.
