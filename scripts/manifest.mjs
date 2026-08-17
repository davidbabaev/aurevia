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
// `desc` describes the car for the image model. `slug` matches the URL.
// ---------------------------------------------------------------------
export const VEHICLES = [
  { slug: 'mercedes-benz-s-580',        brand: 'Mercedes-Benz', type: 'sedan',  desc: 'a long-wheelbase Mercedes-Benz S-Class luxury saloon in obsidian black metallic, chrome window surrounds, large multi-spoke alloy wheels' },
  { slug: 'mercedes-amg-gle-53',        brand: 'Mercedes-Benz', type: 'suv',    desc: 'a Mercedes-AMG GLE performance SUV in polar white, dark grille, dark alloy wheels, red brake calipers' },
  { slug: 'mercedes-amg-gt-63',         brand: 'Mercedes-Benz', type: 'sports', desc: 'a low four-door Mercedes-AMG GT coupe in matte graphite grey, wide rear haunches, dark alloys' },

  { slug: 'audi-a7-sportback',          brand: 'Audi',          type: 'sedan',  desc: 'an Audi A7 Sportback five-door coupe in daytona grey, sloping fastback roofline, full-width rear light bar' },
  { slug: 'audi-q8',                    brand: 'Audi',          type: 'suv',    desc: 'an Audi Q8 coupe SUV in glacier white, octagonal grille, black lower cladding, large alloys' },
  { slug: 'audi-rs-e-tron-gt',          brand: 'Audi',          type: 'sports', desc: 'an Audi RS e-tron GT electric four-door coupe in mythos black metallic, closed-off front, low wide stance' },

  { slug: 'bmw-i4-m50',                 brand: 'BMW',           type: 'sedan',  desc: 'a BMW i4 M50 electric gran coupe in mineral white, closed kidney grille, dark trim, dark alloys' },
  { slug: 'bmw-x7',                     brand: 'BMW',           type: 'suv',    desc: 'a large BMW X7 seven-seat SUV in carbon black metallic, tall upright stance, split headlights, chrome trim' },
  { slug: 'bmw-m4-competition',         brand: 'BMW',           type: 'sports', desc: 'a BMW M4 Competition coupe in brilliant white with a carbon roof, very wide arches, dark forged wheels' },

  { slug: 'porsche-taycan',             brand: 'Porsche',       type: 'sedan',  desc: 'a Porsche Taycan electric sports saloon in volcano grey metallic, very low roofline, full-width light bar' },
  { slug: 'porsche-cayenne',            brand: 'Porsche',       type: 'suv',    desc: 'a Porsche Cayenne SUV in jet black metallic, sloping roof, body-coloured arches, polished alloys' },
  { slug: 'porsche-911-carrera',        brand: 'Porsche',       type: 'sports', desc: 'a Porsche 911 Carrera coupe in agate grey metallic, classic round headlights, wide rear body, centre-lock wheels' },
];

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

  // 12 vehicle card cut-outs (4:3, keyed to transparent by the script)
  ...VEHICLES.map((v) => ({
    id: `card-${v.slug}`,
    file: `vehicles/${v.slug}/card.png`,
    ratio: '4:3',
    transparent: true,
    // The background clause leads, and the value asked for is deliberately
    // darker than the value wanted.
    //
    // The target is mid-grey, RGB(128,128,128) — far enough from white paint,
    // from silver paint and from black paint to key against all three. Asked
    // for as "mid-grey RGB(128,128,128)", stated three ways, the model
    // returned 155–188 both times: a light grey. At 182 the shaded flank of a
    // white M4 is the same value as the backdrop and the key has nothing to
    // separate, which is exactly the failure the white seamless had. The model
    // has a strong prior for a bright studio sweep and a number does not move
    // it, so the number is set low and the prior brings it back up. Charcoal
    // is named as a material as well, which moves it further than the triplet
    // does on its own.
    prompt: `A studio product photograph of ${v.desc}, front three-quarter view, standing against a completely flat, featureless field of DARK CHARCOAL GREY. The background is the critical part of this brief. Every pixel that is not the car is the same dark charcoal grey, RGB(70,70,70) — the tone of a charcoal grey painted studio wall, definitely dark, closer to black than to white, never a light grey and never a bright studio sweep. It is that identical grey corner to corner and edge to edge, behind the car and under it: no gradient, no vignette, no falloff, no brighter pool behind the car, no floor, no horizon, no wall-to-floor curve, no shadow beneath or behind the car and no reflection under it. The car floats against an even charcoal field. Even shadowless studio lighting on the car itself. The car is fully in frame with a small margin on all sides.`,
  })),

  // 48 gallery shots
  ...VEHICLES.flatMap((v) =>
    GALLERY_SHOTS.map((s) => ({
      id: `${v.slug}-${s.key}`,
      file: `vehicles/${v.slug}/${s.key}.png`,
      ratio: s.ratio,
      transparent: s.transparent,
      prompt: s.prompt(v),
    }))
  ),
];

// 3 + 4 + 4 + 12 + 48 = 71
export const TOTAL = SLOTS.length;
