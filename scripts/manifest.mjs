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
// One visual register across all 71 images is what makes them read as
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
  { slug: 'porsche-911-carrera',        brand: 'Porsche',       type: 'sports', lead: 'a Porsche 911 Carrera coupe',                          colour: 'agate grey metallic',     family: 'grey',   tail: ', classic round headlights, wide rear body, centre-lock wheels' },
];

// The car described in a given colour. Passing the car's own colour gives
// back exactly the `desc` string these entries were written as.
const describe = (v, colour) => `${v.lead} in ${colour}${v.tail}`;

export const VEHICLES = VEHICLE_PARTS.map((v) => ({ ...v, desc: describe(v, v.colour) }));

// ---------------------------------------------------------------------
// Exterior colour swatches. Four standard finishes, plus deep navy as the
// stand-in whenever one of the four would just repeat the car's own paint —
// which, as it happens, is every car in the set: four are black, four white
// and four grey. Navy is specified as near-black on purpose. A saturated
// blue would be the only colour in the whole library and would break the
// near-monochrome clause in STYLE.
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

const DEEP_NAVY = {
  name: 'deep navy',
  slug: 'deep-navy',
  family: 'navy',
  prompt: 'deep navy metallic so dark it reads almost black rather than blue',
};

// The four alternatives for one car: the standard swatches minus any that
// duplicate its own family, topped up with navy.
export const swatchesFor = (v) => {
  const kept = COLOUR_SWATCHES.filter((c) => c.family !== v.family);
  return kept.length === COLOUR_SWATCHES.length ? kept : [...kept, DEEP_NAVY];
};

// ---------------------------------------------------------------------
// Per-vehicle gallery shots. 4 per car = 48 images.
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
  // The rear deliberately mirrors the exterior shot word for word apart from
  // the angle. The two sit side by side in the gallery strip, so a different
  // showroom or a different light would read as two different days.
  {
    key: 'rear',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `A three-quarter REAR exterior photograph of ${v.desc}, parked inside a modern minimalist concrete showroom with floor-to-ceiling glazing and a polished dark floor. The camera is behind the car and to one side, looking at the rear bumper and the back of the roof. The car fills most of the frame, shot from standing eye height. The manufacturer badge is small in frame and partially turned away from camera.`,
  },
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
const cutOutPrompt = (description) =>
  `A studio product photograph of ${description}, front three-quarter view. The front of the car points to the LEFT of frame. It stands against a completely flat, featureless field of DARK CHARCOAL GREY. The background is the critical part of this brief. Every pixel that is not the car is the same dark charcoal grey, RGB(70,70,70) — the tone of a charcoal grey painted studio wall, definitely dark, closer to black than to white, never a light grey and never a bright studio sweep. It is that identical grey corner to corner and edge to edge, behind the car and under it: no gradient, no vignette, no falloff, no brighter pool behind the car, no floor, no horizon, no wall-to-floor curve, no shadow beneath or behind the car and no reflection under it. The car floats against an even charcoal field. Even shadowless studio lighting on the car itself. The car is fully in frame with a small margin on all sides.`;

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

  // 48 colour variants — swatches two to five, 4 per car.
  ...VEHICLES.flatMap((v) =>
    swatchesFor(v).map((c) => ({
      id: `${v.slug}-colour-${c.slug}`,
      file: `vehicles/${v.slug}/colour-${c.slug}.png`,
      ratio: '4:3',
      transparent: true,
      prompt: cutOutPrompt(describe(v, c.prompt)),
    }))
  ),

  // 72 gallery shots (6 per car)
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


// 3 + 4 + 4 + 12 + 48 + 72 + 24 = 167
export const TOTAL = SLOTS.length;
