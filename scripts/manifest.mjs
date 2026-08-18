// Aurevia Premium Motors — image manifest
// Every slot the site needs. Consumed by scripts/generate-images.mjs
//
// RATIOS: Gemini accepts only 1:1, 3:4, 4:3, 9:16, 16:9. No 3:2.
// TRANSPARENCY: cars are generated on a DARK CHARCOAL seamless and keyed to
//   alpha by remove.bg. Models do not emit reliable alpha directly.
//   The backdrop still matters even though the keying is no longer a local
//   colour measurement: a clean, even, unambiguous field is what any keyer
//   does best on, and charcoal is the one value that is far from white paint,
//   silver paint and black paint at once. The value asked for is below the
//   value wanted — see the note on the card slots.

// ---------------------------------------------------------------------
// The style clause. Appended VERBATIM to every prompt.
// One visual register across all 154 images is what makes them read as
// one photographer. Never edit this per-image.
// ---------------------------------------------------------------------
export const STYLE = `
Photographed on a full-frame camera with a 35mm lens at f/4.
Soft, controlled, neutral daylight — no warm cast, no blue cast.
Muted desaturated colour grade. Deep blacks, clean whites, no crushed shadows.
Materials are concrete, glass, brushed steel and polished stone.
Architectural, calm, restrained. Quiet luxury, not flashy.
Realistic proportions and realistic reflections. Photographic, not rendered.
The boot lid is one continuous painted surface. Every panel of the car is smooth uninterrupted paint. The grille centre is plain mesh with nothing mounted on it. Number plate areas are smooth blank painted panels.
The entire image is near-monochrome. Greys, blacks, whites and the car's own body colour only. No gold, no chrome glint, no saturated colour anywhere in frame.
All tail lights, headlights and indicators are switched off, unlit and dark. No red or amber glow anywhere.
`.trim();

// ---------------------------------------------------------------------
// The negative clause. Appended VERBATIM to every prompt.
// Text-in-frame is the single most common generated-image failure.
// ---------------------------------------------------------------------
export const NEGATIVE = `
Absolutely no text anywhere in frame. No signs, no lettering, no numbers,
no banners, no hoardings, no posters, no readable branding, no watermarks,
no licence plates with characters, no dealership signage.
No people. No other vehicles. No traffic. No city clutter.
No HDR, no neon, no lens flare, no motion blur, no tilt-shift.
No extreme wide angle, no fisheye, no worm's-eye or bird's-eye angles.
`.trim();

// ---------------------------------------------------------------------
// The twelve vehicles. All new. Three per brand: sedan, SUV, sports.
// `slug` matches the URL. The car is described in three parts rather than
// one string so the colour can be swapped without touching a single other
// word — the swatch row on the detail page only reads as one car in five
// colours if the five frames are otherwise identical, and the surest way to
// get that is for the five prompts to differ by one substring and nothing
// else. `desc` recomposes them and is byte-identical to the single string
// this replaced, so every already-generated slot keeps its exact prompt.
//
// `family` is the colour family the car's own paint belongs to. It is what
// decides which standard swatch would have been a duplicate.
// ---------------------------------------------------------------------
const VEHICLE_PARTS = [
  { slug: 'mercedes-benz-s-580',        brand: 'Mercedes-Benz', type: 'sedan',  lead: 'a long-wheelbase Mercedes-Benz S-Class luxury saloon', colour: 'obsidian black metallic', family: 'black',  tail: ', chrome window surrounds, large multi-spoke alloy wheels' },
  { slug: 'mercedes-amg-gle-53',        brand: 'Mercedes-Benz', type: 'suv',    lead: 'a Mercedes-AMG GLE performance SUV',                   colour: 'polar white',             family: 'white',  tail: ', dark grille, dark alloy wheels, red brake calipers' },
  { slug: 'mercedes-amg-gt-63',         brand: 'Mercedes-Benz', type: 'sports', lead: 'a low four-door Mercedes-AMG GT coupe',                colour: 'matte graphite grey',     family: 'grey',   tail: ', wide rear haunches, dark alloys' },

  { slug: 'audi-a7-sportback',          brand: 'Audi',          type: 'sedan',  lead: 'an Audi A7 Sportback five-door coupe',                 colour: 'daytona grey',            family: 'grey',   tail: ', sloping fastback roofline, full-width rear light bar' },
  { slug: 'audi-q8',                    brand: 'Audi',          type: 'suv',    lead: 'an Audi Q8 coupe SUV',                                 colour: 'glacier white',           family: 'white',  tail: ', octagonal grille, black lower cladding, large alloys' },
  { slug: 'audi-rs-e-tron-gt',          brand: 'Audi',          type: 'sports', lead: 'an Audi RS e-tron GT electric four-door coupe',        colour: 'mythos black metallic',   family: 'black',  tail: ', closed-off front, low wide stance' },

  { slug: 'bmw-i4-m50',                 brand: 'BMW',           type: 'sedan',  lead: 'a BMW i4 M50 electric gran coupe',                     colour: 'mineral white',           family: 'white',  tail: ', closed kidney grille, dark trim, dark alloys' },
  { slug: 'bmw-x7',                     brand: 'BMW',           type: 'suv',    lead: 'a large BMW X7 seven-seat SUV',                        colour: 'carbon black metallic',   family: 'black',  tail: ', tall upright stance, split headlights, chrome trim' },
  { slug: 'bmw-m4-competition',         brand: 'BMW',           type: 'sports', lead: 'a BMW M4 Competition coupe',                           colour: 'brilliant white',         family: 'white',  tail: ' with a carbon roof, very wide arches, dark forged wheels' },

  { slug: 'porsche-taycan',             brand: 'Porsche',       type: 'sedan',  lead: 'a Porsche Taycan electric sports saloon',              colour: 'volcano grey metallic',   family: 'grey',   tail: ', very low roofline, full-width light bar' },
  { slug: 'porsche-cayenne',            brand: 'Porsche',       type: 'suv',    lead: 'a Porsche Cayenne SUV',                                colour: 'jet black metallic',      family: 'black',  tail: ', sloping roof, body-coloured arches, polished alloys' },
  // "classic round headlights" pulled three of the five swatches to an
  // air-cooled-era car while the card and obsidian black stayed modern, so the
  // row showed two different 911s. The generation is now pinned by name and by
  // the details only the current car has.
  { slug: 'porsche-911-carrera',        brand: 'Porsche',       type: 'sports', lead: 'a current-generation Porsche 911 Carrera 992 coupe',   colour: 'agate grey metallic',     family: 'grey',   tail: ', modern LED headlights, full-width rear light bar, flush pop-out door handles, wide rear body, centre-lock wheels' },
];

// The car described in a given colour. Passing the car's own colour gives
// back exactly the `desc` string these entries were written as.
const describe = (v, colour) => `${v.lead} in ${colour}${v.tail}`;

export const VEHICLES = VEHICLE_PARTS.map((v) => ({ ...v, desc: describe(v, v.colour) }));

// ---------------------------------------------------------------------
// Exterior colour swatches. Four standard finishes, plus a fifth as the
// stand-in whenever one of the four would just repeat the car's own paint —
// which, as it happens, is every car in the set: four are black, four white
// and four grey.
//
// That fifth was deep navy, qualified as "so dark it reads almost black
// rather than blue". It came back blue on all twelve — measured at up to
// 4.8% saturated pixels, the most colourful frames in the library, against a
// STYLE clause that allows no saturated colour anywhere. Asking for a colour
// and then asking for it not to look like that colour does not work; the
// qualifier loses to the colour word. So the colour word itself is now black,
// and the undertone is the qualifier rather than the other way round.
//
// `name` is what the site shows and `prompt` is what the model is given;
// they differ only where the model needs the extra steer.
// ---------------------------------------------------------------------
const COLOUR_SWATCHES = [
  { name: 'obsidian black', slug: 'obsidian-black', family: 'black',  prompt: 'obsidian black metallic' },
  { name: 'graphite grey',  slug: 'graphite-grey',  family: 'grey',   prompt: 'graphite grey metallic' },
  { name: 'glacier white',  slug: 'glacier-white',  family: 'white',  prompt: 'glacier white' },
  { name: 'silver',         slug: 'silver',         family: 'silver', prompt: 'silver metallic' },
];

const MIDNIGHT_BLACK = {
  name: 'midnight black',
  slug: 'midnight-black',
  // Its own family, so it is never filtered out as a duplicate — it is the
  // top-up, not one of the four.
  family: 'midnight',
  prompt:
    'midnight black metallic — black paint with only a faint cool undertone in the highlights, never a blue body colour',
};

// The alternatives for one car: the standard swatches minus any that would
// repeat its own paint, topped up with midnight black.
//
// The top-up is skipped for a car that is already black. Midnight black next
// to obsidian, mythos, carbon or jet black is two chips the eye cannot tell
// apart — a swatch that changes nothing when clicked is worse than one fewer
// swatch. Those four ship four swatches; the other eight ship five. The row
// is data-driven, so the count comes from here and the component does not
// care.
export const swatchesFor = (v) => {
  const kept = COLOUR_SWATCHES.filter((c) => c.family !== v.family);
  if (kept.length === COLOUR_SWATCHES.length || v.family === 'black') return kept;
  return [...kept, MIDNIGHT_BLACK];
};

// ---------------------------------------------------------------------
// Per-vehicle gallery shots. 5 per car = 60 images. With the 2 lifestyle
// shots below that gives the six thumbnails the wireframe strip holds.
// ---------------------------------------------------------------------
const GALLERY_SHOTS = [
  {
    key: 'exterior',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `A three-quarter front exterior photograph of ${v.desc}, parked inside a modern minimalist concrete showroom with floor-to-ceiling glazing and a polished dark floor. The car fills most of the frame, shot from standing eye height. The manufacturer badge is small in frame and partially turned away from camera.`,
  },
  // The interior and dashboard prompts lead with the camera being INSIDE the
  // car and say explicitly that the outside is not in shot. The earlier
  // wording named the shot ("An interior photograph of...") and let the angle
  // follow, which returned an exterior 22 times out of 24 — the model latched
  // onto the car description and photographed the car. Naming the camera
  // position first is what the two that did work had in common.
  {
    key: 'interior',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `A photograph taken from inside the cabin of ${v.desc}. The camera is positioned on the rear seat, inside the car, looking forward between the two front headrests. Nothing outside the car is visible except through the windscreen. The frame is filled by the backs of the front seats, the centre console between them, the dashboard ahead and the headlining above. Premium leather and stitching, brushed metal and open-pore wood trim, soft even daylight through the glass. No badges or lettering visible on any surface.`,
  },
  {
    key: 'dashboard',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `A photograph taken from inside the cabin of ${v.desc}. The camera is positioned at the driver's seat, inside the car, looking forward and slightly down across the dashboard. Nothing outside the car is visible except through the windscreen. The frame is filled by the steering wheel, the instrument binnacle behind it, the air vents and the centre console. Screens are switched off and completely black with no interface, no icons and no text. Leather, stitching and metal detail are sharp.`,
  },
  // Same failure mode on detail: naming the car first produced whole-car
  // three-quarters. This one states the crop as a constraint instead.
  {
    key: 'detail',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `An extreme close-up photograph of the front wheel of ${v.desc}. The camera is very close and low, at wheel hub height. The wheel and tyre fill most of the frame and are cropped by the edges of the frame. No other part of the car is in shot — no bonnet, no doors, no roof, no headlights, no windows. Shallow depth of field. Polished alloy, brake caliper visible behind the spokes, tyre sidewall with no lettering, clean paint reflections of concrete architecture.`,
  },
  // There is no rear shot, and that is deliberate. A rear three-quarter points
  // the camera at the two things STYLE spends its length avoiding: the model
  // lettering across the tailgate and the tail lights. Of twelve generated,
  // four carried readable lettering, six had saturated red lamps and one came
  // back as the wrong generation of 911. The gallery ships six per car
  // without it, which is what the wireframe's thumbnail strip holds anyway.
  //
  // Second detail. Same trick as the wheel crop: state the crop as a hard
  // constraint first, because naming the car first returns a whole-car
  // three-quarter every time.
  {
    key: 'detail-2',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `An extreme close-up photograph of the headlight and front wing of ${v.desc}. The camera is very close, level with the headlight. The headlight unit and the curve of the front wing behind it fill the frame and are cropped by the edges of the frame. No other part of the car is in shot — no grille centre, no windscreen, no roof, no wheels, no doors. The headlight is switched off, unlit and dark. Shallow depth of field. Crisp lens facets, the shut line between wing and bumper, clean paint reflections of concrete architecture.`,
  },
];

// ---------------------------------------------------------------------
// Lifestyle shots. 2 per car = 24 images, 16:9.
// The gallery shots are all studio and showroom; these are the only two
// frames in the library where a car is outside in the world, and they carry
// the wide bands on the detail page.
// ---------------------------------------------------------------------
const LIFESTYLE_SHOTS = [
  {
    key: 'road',
    ratio: '16:9',
    transparent: false,
    prompt: (v) => `A wide photograph of ${v.desc}, on an empty clean road, seen from a three-quarter FRONT angle. The camera is low, close to road height, following from ahead and to one side as if from a chase car. Flat overcast light, no sun and no hard shadows. The road surface is clean dark asphalt with no markings, no kerbs and no street furniture. Empty quiet landscape falls away behind, soft and far out of focus. The car is alone — no other traffic, no other vehicles of any kind.`,
  },
  {
    key: 'architecture',
    ratio: '16:9',
    transparent: false,
    prompt: (v) => `A wide photograph of ${v.desc}, parked outside a large modern concrete and glass building, seen from a three-quarter FRONT angle. The camera is at standing height. The building fills the frame behind the car — flat concrete planes, tall glazing, no ornament. Soft overcast light, even and shadowless. The forecourt is clean bare concrete. The car is alone in frame.`,
  },
];

// ---------------------------------------------------------------------
// Standalone site slots.
// ---------------------------------------------------------------------
const SITE_SLOTS = [
  {
    id: 'hero-home',
    file: 'hero/home-hero.png',
    ratio: '16:9',
    transparent: false,
    // The left half is a text well, not scenery. The earlier wording banned
    // columns and walls but still allowed "structure … far behind it", and the
    // model read the glazing as fair game: bright concrete columns filled the
    // left half and the white headline had nothing to sit on. Glazing and
    // bright surfaces are now named, and the left half is described by what it
    // does contain — floor, nothing else — rather than by a list of what it
    // must not.
    prompt: `A wide cinematic photograph of a single white four-door luxury coupe seen from a FRONT THREE-QUARTER angle, the front of the car facing left of camera, standing alone on a vast polished near-black showroom floor. The car sits in the RIGHT HALF of the frame. CRITICAL COMPOSITION: the left half of the frame is entirely empty polished dark floor receding into blackness. No columns, no walls, no glazing, no structure and no bright surfaces anywhere in the left half. Only the floor. Headline text goes there. Soft daylight from the left.`,
  },
  {
    id: 'cta-showroom',
    file: 'hero/showroom-visit.png',
    ratio: '16:9',
    transparent: false,
    prompt: `A wide photograph of a black Porsche Taycan in a very dark private viewing room. Dramatic low-key lighting picks out only the car's shoulder line, roof edge and wheels; the surroundings fall away into near black. CRITICAL COMPOSITION: the left third of the frame is almost pure black empty space for text. The car occupies the centre and right.`,
  },
  // The statement band on the home page — copy and buttons left, one large
  // car right. Keyed to alpha like the cards because it sits on the light
  // surface panel, but shot far bigger: the cards are thumbnails, this one
  // carries the section on its own. Same charcoal backdrop clause as the
  // cut-outs, for the same reason — see the note on the card slots below.
  {
    id: 'statement-s-class',
    file: 'hero/statement-s-class.png',
    ratio: '4:3',
    transparent: true,
    prompt: `A studio photograph of a black long-wheelbase luxury saloon with chrome window surrounds and large multi-spoke alloy wheels, seen almost side-on and angled slightly toward the camera, the front of the car pointing to the LEFT of frame. The camera is low, at about headlight height, and the car fills the frame corner to corner — imposing and cinematic rather than a small catalogue thumbnail. The whole car is in frame from front bumper to rear bumper with a small margin on all sides. It stands against a completely flat, featureless field of DARK CHARCOAL GREY. Every pixel that is not the car is the same dark charcoal grey, RGB(70,70,70) — the tone of a charcoal grey painted studio wall, definitely dark, closer to black than to white, never a light grey and never a bright studio sweep. It is that identical grey corner to corner and edge to edge, behind the car and under it: no gradient, no vignette, no falloff, no brighter pool behind the car, no floor, no horizon, no wall-to-floor curve, no shadow beneath or behind the car and no reflection under it. The car floats against an even charcoal field. Even shadowless studio lighting on the car itself.`,
  },
];

// ---------------------------------------------------------------------
// The cut-out prompt, shared by a car's card and all four of its colour
// swatches. One template, called five times with five descriptions that
// differ by the colour and nothing else — same angle, same framing, same
// distance, same lighting, same words. The card slot passes the car's own
// `desc`, so its prompt is unchanged from the one that produced the shipped
// card and the five frames still belong to the same set.
//
// The background clause leads, and the value asked for is deliberately
// darker than the value wanted.
//
// The target is mid-grey, RGB(128,128,128) — far enough from white paint,
// from silver paint and from black paint to key against all three. Asked for
// as "mid-grey RGB(128,128,128)", stated three ways, the model returned
// 155–188 both times: a light grey. At 182 the shaded flank of a white M4 is
// the same value as the backdrop and the key has nothing to separate, which
// is exactly the failure the white seamless had. The model has a strong
// prior for a bright studio sweep and a number does not move it, so the
// number is set low and the prior brings it back up. Charcoal is named as a
// material as well, which moves it further than the triplet does on its own.
//
// These are keyed through remove.bg and composited onto a CSS gradient, so
// the backdrop only ever has to be clean — it is never seen.
//
// The direction is stated as its own sentence. "Front three-quarter view"
// describes the angle but says nothing about which way the car points, and
// the model mirrored 9 of the 48 colour variants — a swatch row where the car
// flips direction between clicks reads as a different car, not a repaint.
// Naming the direction positively is what fixed the same failure on
// hero-home, where describing what the frame should contain worked and
// listing what it should not did not.
// ---------------------------------------------------------------------
// The backdrop clause itself, lifted out so the cut-outs and the body-style
// tiles below are asked for the same field in the same words. It is the part
// remove.bg actually keys against, so it is the part that must never drift
// between two slots that both have to key. Everything before it is camera and
// subject; this is background and framing.
const CHARCOAL_BACKDROP = `It stands against a completely flat, featureless field of DARK CHARCOAL GREY. The background is the critical part of this brief. Every pixel that is not the car is the same dark charcoal grey, RGB(70,70,70) — the tone of a charcoal grey painted studio wall, definitely dark, closer to black than to white, never a light grey and never a bright studio sweep. It is that identical grey corner to corner and edge to edge, behind the car and under it: no gradient, no vignette, no falloff, no brighter pool behind the car, no floor, no horizon, no wall-to-floor curve, no shadow beneath or behind the car and no reflection under it. The car floats against an even charcoal field. Even shadowless studio lighting on the car itself. The car is fully in frame with a small margin on all sides.`;

const cutOutPrompt = (description) =>
  `A studio product photograph of ${description}, front three-quarter view. The front of the car points to the LEFT of frame. ${CHARCOAL_BACKDROP}`;

// ---------------------------------------------------------------------
// Body-style tiles for /vehicles. Three, matching the three types actually
// in the inventory. Same charcoal backdrop and same keying path as the
// cut-outs; only the camera and the subject differ.
//
// SIDE PROFILE, not the cards' front three-quarter. These render small and
// have to read as a shape — a saloon, a tall box, a low wedge — and a
// three-quarter of any of the three collapses to the same blob at tile size.
// "Side view" alone returns a shallow three-quarter, so the angle is stated
// twice: once as the camera being perpendicular and once as what must NOT be
// visible, which is the framing that fixed the same drift on the cut-outs.
//
// No manufacturer identity: these stand for a category, not a car, and a
// badge would make one of them read as a brand tile. NEGATIVE bans text but
// not emblems, so the ban is spelled out here, part by part — a bare "no
// badges" leaves the wheel centres and the bonnet crest behind.
//
// One paint across all three, because the three tiles sit in a row.
// ---------------------------------------------------------------------
const BODY_STYLE_PAINT = 'graphite grey metallic';

const BODY_STYLES = [
  {
    slug: 'sedan',
    desc: `a generic modern premium four-door saloon in ${BODY_STYLE_PAINT}, a clean three-box shape with a long bonnet, a separate boot lid and large multi-spoke alloy wheels`,
  },
  {
    slug: 'suv',
    desc: `a generic modern premium mid-size SUV in ${BODY_STYLE_PAINT}, tall and upright with a raised ride height, a long flat roof, deep wheel arches and large multi-spoke alloy wheels`,
  },
  {
    slug: 'sports',
    desc: `a generic modern premium two-door sports coupe in ${BODY_STYLE_PAINT}, very low and wide with a long bonnet, a fastback roofline sloping straight into the tail, wide rear haunches and large multi-spoke alloy wheels`,
  },
];

const bodyStylePrompt = (description) =>
  `A studio product photograph of ${description}, in EXACT SIDE PROFILE. The camera is exactly perpendicular to the side of the car, level with the door handles, and the car is perfectly square to it — a flat side elevation, both near-side wheels fully round and fully visible, the whole flank of the car parallel to the frame. This is NOT a three-quarter view: no part of the front of the car and no part of the rear of the car is turned toward the camera, and neither the grille nor the tailgate is visible. The front of the car points to the LEFT of frame. The car is an unbranded generic design belonging to no manufacturer: no badge, no emblem, no logo, no roundel, no star, no rings, no crest, no shield and no lettering anywhere on it — not on the bonnet, not on the wings, not on the doors, not on the boot lid and not on the wheels, whose centre caps are plain smooth discs. ${CHARCOAL_BACKDROP}`;

// Brand cards — 3:4 portrait, architectural, matching the wireframe.
const BRAND_CARDS = [
  { brand: 'Mercedes-Benz', slug: 'mercedes-benz', desc: 'a black Mercedes-Benz G-Class boxy luxury SUV' },
  { brand: 'Audi',          slug: 'audi',          desc: 'a silver Audi A6 saloon' },
  { brand: 'BMW',           slug: 'bmw',           desc: 'a black BMW 7 Series saloon, front three-quarter, large kidney grille' },
  { brand: 'Porsche',       slug: 'porsche',       desc: 'a grey Porsche 911 coupe' },
];

// ---------------------------------------------------------------------
// Assemble.
// ---------------------------------------------------------------------
export const SLOTS = [
  ...SITE_SLOTS,

  // 3 body-style tiles (4:3, keyed to transparent by the script)
  ...BODY_STYLES.map((b) => ({
    id: `bodystyle-${b.slug}`,
    file: `bodystyle/${b.slug}.png`,
    ratio: '4:3',
    transparent: true,
    prompt: bodyStylePrompt(b.desc),
  })),

  // 4 brand cards (3:4 portrait)
  ...BRAND_CARDS.map((b) => ({
    id: `brand-card-${b.slug}`,
    file: `brands/${b.slug}-card.png`,
    ratio: '3:4',
    transparent: false,
    prompt: `A tall vertical photograph of ${b.desc} positioned in front of a large modern concrete and glass building. Shot from a low standing angle. The upper third of the frame is quiet architecture and sky so a label can sit over it. Overcast, soft, even light. Muted, almost monochrome.`,
  })),

  // 4 brand page heroes (16:9)
  ...BRAND_CARDS.map((b) => ({
    id: `brand-hero-${b.slug}`,
    file: `brands/${b.slug}-hero.png`,
    ratio: '16:9',
    transparent: false,
    prompt: `A wide cinematic photograph of ${b.desc} inside a dark modern showroom with concrete columns and a polished floor. The car sits to the right of frame; the left half is quiet empty space for a heading. Soft directional daylight.`,
  })),

  // 12 vehicle card cut-outs (4:3, keyed to transparent by the script).
  // Swatch one of five — see cutOutPrompt.
  ...VEHICLES.map((v) => ({
    id: `card-${v.slug}`,
    file: `vehicles/${v.slug}/card.png`,
    ratio: '4:3',
    transparent: true,
    prompt: cutOutPrompt(v.desc),
  })),

  // 44 colour variants — swatches two to five; four per car, three for the
  // four cars whose own paint is black. See swatchesFor.
  ...VEHICLES.flatMap((v) =>
    swatchesFor(v).map((c) => ({
      id: `${v.slug}-colour-${c.slug}`,
      file: `vehicles/${v.slug}/colour-${c.slug}.png`,
      ratio: '4:3',
      transparent: true,
      prompt: cutOutPrompt(describe(v, c.prompt)),
    }))
  ),

  // 60 gallery shots (5 per car)
  ...VEHICLES.flatMap((v) =>
    GALLERY_SHOTS.map((s) => ({
      id: `${v.slug}-${s.key}`,
      file: `vehicles/${v.slug}/${s.key}.png`,
      ratio: s.ratio,
      transparent: s.transparent,
      prompt: s.prompt(v),
    }))
  ),

  // 24 lifestyle shots (2 per car)
  ...VEHICLES.flatMap((v) =>
    LIFESTYLE_SHOTS.map((s) => ({
      id: `${v.slug}-${s.key}`,
      file: `vehicles/${v.slug}/${s.key}.png`,
      ratio: s.ratio,
      transparent: s.transparent,
      prompt: s.prompt(v),
    }))
  ),
];


// 3 + 3 + 4 + 4 + 12 + 44 + 60 + 24 = 154
export const TOTAL = SLOTS.length;
