// Aurevia Premium Motors — image manifest
// Every slot the site needs. Consumed by scripts/generate-images.mjs
//
// RATIOS: Gemini accepts only 1:1, 3:4, 4:3, 9:16, 16:9. No 3:2.
// TRANSPARENCY: cars are generated on pure white seamless, then keyed
//   to alpha by the script. Models do not emit reliable alpha directly.

// ---------------------------------------------------------------------
// The style clause. Appended VERBATIM to every prompt.
// One visual register across all 70 images is what makes them read as
// one photographer. Never edit this per-image.
// ---------------------------------------------------------------------
export const STYLE = `
Photographed on a full-frame camera with a 35mm lens at f/4.
Soft, controlled, neutral daylight — no warm cast, no blue cast.
Muted desaturated colour grade. Deep blacks, clean whites, no crushed shadows.
Materials are concrete, glass, brushed steel and polished stone.
Architectural, calm, restrained. Quiet luxury, not flashy.
Realistic proportions and realistic reflections. Photographic, not rendered.
The bonnet is one continuous painted surface running unbroken to the grille. The boot lid is one continuous painted surface. Wheel centres are recessed dark hollows in shadow. Every panel of the car is smooth uninterrupted paint. The grille centre is plain mesh with nothing mounted on it. Number plate areas are smooth blank painted panels.
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
  { slug: 'audi-rs-e-tron-gt',          brand: 'Audi',          type: 'sports', desc: 'an Audi RS e-tron GT electric four-door coupe in tactical green metallic, closed-off front, low wide stance' },

  { slug: 'bmw-i4-m50',                 brand: 'BMW',           type: 'sedan',  desc: 'a BMW i4 M50 electric gran coupe in mineral white, closed kidney grille, blue accent trim, dark alloys' },
  { slug: 'bmw-x7',                     brand: 'BMW',           type: 'suv',    desc: 'a large BMW X7 seven-seat SUV in carbon black metallic, tall upright stance, split headlights, chrome trim' },
  { slug: 'bmw-m4-competition',         brand: 'BMW',           type: 'sports', desc: 'a BMW M4 Competition coupe in sao paulo yellow, very wide arches, carbon roof, dark forged wheels' },

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
  {
    key: 'interior',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `An interior photograph of ${v.desc}, shot from the rear seat looking forward across the front seats. Premium leather and stitching, brushed metal and open-pore wood trim, soft even daylight through the windows. No badges or lettering visible on any surface.`,
  },
  {
    key: 'dashboard',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `A dashboard and steering wheel photograph of ${v.desc}, shot from the driver's door opening. Screens are switched off and completely black with no interface, no icons and no text. Leather, stitching and metal detail are sharp.`,
  },
  {
    key: 'detail',
    ratio: '4:3',
    transparent: false,
    prompt: (v) => `A close detail photograph of ${v.desc} — the front wheel, brake caliper and lower body line, shot low and tight. Shallow depth of field. Polished alloy, tyre sidewall with no lettering, clean paint reflections of concrete architecture.`,
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
    prompt: `A wide cinematic photograph of a single white four-door luxury coupe seen from a FRONT THREE-QUARTER angle, the front of the car facing left of camera, standing alone on a vast polished near-black showroom floor. Tall concrete columns and floor-to-ceiling glazing are far behind it and out of focus. The car sits in the RIGHT HALF of the frame. CRITICAL COMPOSITION: the left half of the frame contains only empty polished dark floor receding into darkness. No columns, no walls, no structure of any kind in the left half. Headline text goes there. Soft daylight from the left.`,
  },
  {
    id: 'cta-showroom',
    file: 'hero/showroom-visit.png',
    ratio: '16:9',
    transparent: false,
    prompt: `A wide photograph of a black Porsche Taycan in a very dark private viewing room. Dramatic low-key lighting picks out only the car's shoulder line, roof edge and wheels; the surroundings fall away into near black. CRITICAL COMPOSITION: the left third of the frame is almost pure black empty space for text. The car occupies the centre and right.`,
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
    prompt: `A studio product photograph of ${v.desc}, front three-quarter view, on a pure flat white seamless background with no floor line, no horizon, no shadow, no reflection and no gradient. The background must be uniform pure white #FFFFFF everywhere around the car. Even shadowless studio lighting. The car is fully in frame with a small margin on all sides.`,
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

// 2 + 4 + 4 + 12 + 48 = 70
export const TOTAL = SLOTS.length;
