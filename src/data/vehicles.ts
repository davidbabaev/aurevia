// Aurevia Premium Motors — vehicle content
//
// ⚠️ ALL DATA IN THIS FILE IS FICTIONAL.
// Aurevia is a portfolio project. These vehicles do not exist, are not
// for sale, and the prices, stock numbers and specifications are
// invented for demonstration. Specifications are approximate to the
// real models but must not be treated as accurate. If this site is
// ever used commercially, every value here must be replaced with real
// dealership data.
//
// Copy rules (CLAUDE.md §5): sentence case, active voice, no banned
// words. Descriptions describe what the photographs actually show.
//
// Merged from the manifest-derived vehicles.ts and the hand-written
// vehicles-content.ts. `slug`, `brand`, `name` and `colours` are derived
// from scripts/manifest.mjs, which is the source of truth for what imagery
// exists — keep them in step, because the detail page builds image paths
// from the slug. Everything else is the invented content described above.

export type Condition = 'New';
export type FuelType = 'Petrol' | 'Electric' | 'Hybrid';
export type VehicleType = 'Sedan' | 'SUV' | 'Sports';

export interface Vehicle {
  slug: string;
  brand: 'Mercedes-Benz' | 'Audi' | 'BMW' | 'Porsche';
  name: string;
  model: string;
  trim: string;
  year: number;
  type: VehicleType;
  condition: Condition;
  price: number | null;        // null renders as "Contact for price"
  currency: 'USD';
  available: boolean;
  featured: boolean;
  stockNumber: string;
  description: string;
  /**
   * Exterior swatch row, five entries. Index 0 is the paint the car
   * was photographed in and its cut-out is card.webp; the other four
   * are colour-<slugified name>.webp in the same folder. Worded as the
   * manifest words them, which is not always how specs.exteriorColour
   * words the same paint.
   */
  colours: string[];
  specs: {
    engine: string;
    power: string;
    transmission: string;
    drivetrain: string;
    fuel: FuelType;
    acceleration: string;
    topSpeed: string;
    seats: number;
    doors: number;
    exteriorColour: string;
    interiorColour: string;
  };
  features: {
    safety: string[];
    comfort: string[];
    technology: string[];
    exterior: string[];
  };
}

export const VEHICLES: Vehicle[] = [
  // ── Mercedes-Benz ──────────────────────────────────────────────
  {
    slug: 'mercedes-benz-s-580',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-Benz S 580',
    model: 'S-Class',
    trim: 'S 580 4MATIC',
    year: 2026,
    type: 'Sedan',
    condition: 'New',
    price: 138500,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1041',
    description:
      'The long-wheelbase S-Class is the quietest car in our showroom. It rides on air suspension that reads the road ahead, and the rear cabin is closer to a private room than a back seat. Finished in obsidian black over a cream interior, with chrome window surrounds and multi-spoke alloys.',
    colours: ['obsidian black metallic', 'graphite grey', 'glacier white', 'silver'],
    specs: {
      engine: '4.0-litre twin-turbo V8 with mild hybrid',
      power: '496 hp',
      transmission: '9-speed automatic',
      drivetrain: 'All-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 4.4 s',
      topSpeed: '130 mph (limited)',
      seats: 5,
      doors: 4,
      exteriorColour: 'Obsidian black metallic',
      interiorColour: 'Macchiato beige leather',
    },
    features: {
      safety: ['Active distance assist', 'Lane keeping assist', 'Blind spot assist', 'Pre-safe impact anticipation'],
      comfort: ['Rear executive seating', 'Four-zone climate control', 'Heated and ventilated seats', 'Acoustic laminated glass'],
      technology: ['Augmented reality navigation', 'Burmester 4D surround sound', 'Rear entertainment screens', 'Wireless phone integration'],
      exterior: ['Air suspension', 'Adaptive LED headlights', 'Panoramic roof', '20-inch multi-spoke alloys'],
    },
  },
  {
    slug: 'mercedes-amg-gle-53',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-AMG GLE 53',
    model: 'GLE',
    trim: 'AMG GLE 53 4MATIC+',
    year: 2026,
    type: 'SUV',
    condition: 'New',
    price: null,
    currency: 'USD',
    available: true,
    featured: true,
    stockNumber: 'AUR-1042',
    description:
      'A family SUV that behaves like something considerably smaller. The AMG straight-six pulls hard from low revs, and the air suspension keeps the body flat through corners without punishing anyone in the back. Polar white with a dark grille, dark alloys and red brake calipers.',
    colours: ['polar white', 'obsidian black', 'graphite grey', 'silver', 'midnight black'],
    specs: {
      engine: '3.0-litre turbocharged inline-six with electric assist',
      power: '429 hp',
      transmission: '9-speed AMG SPEEDSHIFT',
      drivetrain: 'All-wheel drive',
      fuel: 'Hybrid',
      acceleration: '0–60 mph in 5.2 s',
      topSpeed: '155 mph',
      seats: 5,
      doors: 5,
      exteriorColour: 'Polar white',
      interiorColour: 'Black nappa leather',
    },
    features: {
      safety: ['Active brake assist', 'Active steering assist', 'Traffic sign assist', '360-degree camera'],
      comfort: ['AMG sports seats', 'Heated steering wheel', 'Four-zone climate control', 'Power tailgate'],
      technology: ['MBUX voice control', 'Head-up display', 'Wireless charging', 'Digital instrument cluster'],
      exterior: ['AMG body styling', 'Air suspension', 'Panoramic roof', '21-inch AMG alloys'],
    },
  },
  {
    slug: 'mercedes-amg-gt-63',
    brand: 'Mercedes-Benz',
    name: 'Mercedes-AMG GT 63',
    model: 'AMG GT',
    trim: 'AMG GT 63 4-Door Coupe',
    year: 2026,
    type: 'Sports',
    condition: 'New',
    price: 172000,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1043',
    description:
      'Four doors, four seats, and a V8 that makes no attempt to be discreet. The GT 63 sits low and wide, with rear-axle steering that makes it far more agile than its size suggests. Matte graphite grey over black, on dark forged wheels.',
    colours: ['matte graphite grey', 'obsidian black', 'glacier white', 'silver', 'midnight black'],
    specs: {
      engine: '4.0-litre twin-turbo V8',
      power: '577 hp',
      transmission: '9-speed AMG SPEEDSHIFT MCT',
      drivetrain: 'All-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 3.3 s',
      topSpeed: '196 mph',
      seats: 4,
      doors: 4,
      exteriorColour: 'Selenite grey magno',
      interiorColour: 'Black nappa with contrast stitching',
    },
    features: {
      safety: ['AMG ceramic composite brakes', 'Active blind spot assist', 'Adaptive high beam', 'Parking package with camera'],
      comfort: ['AMG performance seats', 'Climatised front seats', 'Ambient lighting', 'Burmester surround sound'],
      technology: ['AMG Track Pace', 'Head-up display', 'MBUX with dual screens', 'Wireless phone integration'],
      exterior: ['Rear-axle steering', 'AMG Ride Control+', 'Active rear spoiler', '21-inch forged alloys'],
    },
  },

  // ── Audi ────────────────────────────────────────────────────────
  {
    slug: 'audi-a7-sportback',
    brand: 'Audi',
    name: 'Audi A7 Sportback',
    model: 'A7',
    trim: 'A7 Sportback 55 TFSI quattro',
    year: 2026,
    type: 'Sedan',
    condition: 'New',
    price: 82400,
    currency: 'USD',
    available: true,
    featured: true,
    stockNumber: 'AUR-1044',
    description:
      'The A7 solves a problem most saloons ignore: the boot. Its fastback tailgate opens to a genuinely useful load space without spoiling the roofline. Daytona grey, with a full-width rear light bar and a cabin trimmed in dark leather and open-pore wood.',
    colours: ['daytona grey', 'obsidian black', 'glacier white', 'silver', 'midnight black'],
    specs: {
      engine: '3.0-litre turbocharged V6 with mild hybrid',
      power: '335 hp',
      transmission: '7-speed S tronic',
      drivetrain: 'quattro all-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 5.2 s',
      topSpeed: '155 mph',
      seats: 5,
      doors: 5,
      exteriorColour: 'Daytona grey pearl',
      interiorColour: 'Black valcona leather',
    },
    features: {
      safety: ['Adaptive cruise assist', 'Side assist', 'Cross traffic assist', 'Top view camera'],
      comfort: ['Heated and ventilated front seats', 'Four-zone climate control', 'Power soft-close doors', 'Panoramic roof'],
      technology: ['Virtual cockpit plus', 'Dual touchscreen MMI', 'Bang & Olufsen 3D sound', 'Head-up display'],
      exterior: ['Matrix LED headlights', 'Full-width rear light bar', 'Adaptive air suspension', '20-inch alloys'],
    },
  },
  {
    slug: 'audi-q8',
    brand: 'Audi',
    name: 'Audi Q8',
    model: 'Q8',
    trim: 'Q8 55 TFSI quattro',
    year: 2026,
    type: 'SUV',
    condition: 'New',
    price: 94800,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1045',
    description:
      'A coupe roofline on a full-size SUV, which usually means a compromise somewhere. Here it costs a little rear headroom and buys a car that looks considerably lower than it is. Glacier white with black lower cladding and large polished alloys.',
    colours: ['glacier white', 'obsidian black', 'graphite grey', 'silver', 'midnight black'],
    specs: {
      engine: '3.0-litre turbocharged V6 with mild hybrid',
      power: '335 hp',
      transmission: '8-speed tiptronic',
      drivetrain: 'quattro all-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 5.6 s',
      topSpeed: '155 mph',
      seats: 5,
      doors: 5,
      exteriorColour: 'Glacier white metallic',
      interiorColour: 'Okapi brown leather',
    },
    features: {
      safety: ['Pre-sense front and rear', 'Adaptive cruise assist', 'Lane departure warning', '360-degree camera'],
      comfort: ['Heated and ventilated seats', 'Four-zone climate control', 'Power tailgate', 'Ambient lighting'],
      technology: ['Virtual cockpit plus', 'Dual touchscreen MMI', 'Bang & Olufsen 3D sound', 'Wireless charging'],
      exterior: ['Adaptive air suspension', 'HD Matrix LED headlights', 'Panoramic roof', '21-inch alloys'],
    },
  },
  {
    slug: 'audi-rs-e-tron-gt',
    brand: 'Audi',
    name: 'Audi RS e-tron GT',
    model: 'RS e-tron GT',
    trim: 'RS e-tron GT quattro',
    year: 2026,
    type: 'Sports',
    condition: 'New',
    price: 156900,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1046',
    description:
      'Electric, and not apologetic about it. The RS e-tron GT delivers its full torque instantly and silently, which takes most people one launch to adjust to. Mythos black, with a closed front and a stance wide enough to look planted standing still.',
    colours: ['mythos black metallic', 'graphite grey', 'glacier white', 'silver'],
    specs: {
      engine: 'Dual electric motors, 93 kWh battery',
      power: '637 hp',
      transmission: '2-speed automatic',
      drivetrain: 'quattro all-wheel drive',
      fuel: 'Electric',
      acceleration: '0–60 mph in 3.1 s',
      topSpeed: '155 mph',
      seats: 4,
      doors: 4,
      exteriorColour: 'Mythos black metallic',
      interiorColour: 'Black leather with red stitching',
    },
    features: {
      safety: ['Adaptive cruise assist', 'Ceramic brakes', 'Night vision assist', '360-degree camera'],
      comfort: ['RS sport seats', 'Four-zone climate control', 'Heated and ventilated seats', 'Ambient lighting'],
      technology: ['Virtual cockpit plus', 'Bang & Olufsen 3D sound', 'Head-up display', '270 kW rapid charging'],
      exterior: ['Adaptive air suspension', 'Rear-axle steering', 'Carbon roof', '21-inch alloys'],
    },
  },

  // ── BMW ─────────────────────────────────────────────────────────
  {
    slug: 'bmw-i4-m50',
    brand: 'BMW',
    name: 'BMW i4 M50',
    model: 'i4',
    trim: 'i4 M50 xDrive',
    year: 2026,
    type: 'Sedan',
    condition: 'New',
    price: 72500,
    currency: 'USD',
    available: true,
    featured: true,
    stockNumber: 'AUR-1047',
    description:
      'The i4 M50 is the easiest car here to recommend to someone moving to electric for the first time. It drives like a 4 Series, charges quickly enough for real journeys, and the M-tuned chassis makes it genuinely quick. Mineral white with a closed grille and dark trim.',
    colours: ['mineral white', 'obsidian black', 'graphite grey', 'silver', 'midnight black'],
    specs: {
      engine: 'Dual electric motors, 81 kWh battery',
      power: '536 hp',
      transmission: 'Single-speed automatic',
      drivetrain: 'xDrive all-wheel drive',
      fuel: 'Electric',
      acceleration: '0–60 mph in 3.7 s',
      topSpeed: '140 mph',
      seats: 5,
      doors: 5,
      exteriorColour: 'Mineral white metallic',
      interiorColour: 'Black vernasca leather',
    },
    features: {
      safety: ['Active driving assistant pro', 'Frontal collision warning', 'Lane departure warning', 'Parking assistant plus'],
      comfort: ['M sport seats', 'Three-zone climate control', 'Heated front seats', 'Acoustic glazing'],
      technology: ['BMW curved display', 'Harman Kardon surround sound', 'Head-up display', '200 kW rapid charging'],
      exterior: ['M sport suspension', 'Adaptive LED headlights', 'M aerodynamic package', '20-inch M alloys'],
    },
  },
  {
    slug: 'bmw-x7',
    brand: 'BMW',
    name: 'BMW X7',
    model: 'X7',
    trim: 'X7 xDrive40i',
    year: 2026,
    type: 'SUV',
    condition: 'New',
    price: 108600,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1048',
    description:
      'Seven seats, and the third row is one adults will actually sit in. The X7 is the largest car in our showroom and hides it well on the move, thanks to air suspension on both axles. Carbon black metallic, with split headlights and chrome trim.',
    colours: ['carbon black metallic', 'graphite grey', 'glacier white', 'silver'],
    specs: {
      engine: '3.0-litre turbocharged inline-six with mild hybrid',
      power: '375 hp',
      transmission: '8-speed Steptronic',
      drivetrain: 'xDrive all-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 5.6 s',
      topSpeed: '155 mph',
      seats: 7,
      doors: 5,
      exteriorColour: 'Carbon black metallic',
      interiorColour: 'Ivory white merino leather',
    },
    features: {
      safety: ['Driving assistant professional', 'Active blind spot detection', 'Surround view camera', 'Rear collision prevention'],
      comfort: ['Captain\'s chairs, second row', 'Five-zone climate control', 'Heated and ventilated seats', 'Panoramic sky lounge roof'],
      technology: ['BMW curved display', 'Bowers & Wilkins surround sound', 'Head-up display', 'Rear entertainment screens'],
      exterior: ['Two-axle air suspension', 'Adaptive LED headlights', 'Split tailgate', '22-inch alloys'],
    },
  },
  {
    slug: 'bmw-m4-competition',
    brand: 'BMW',
    name: 'BMW M4 Competition',
    model: 'M4',
    trim: 'M4 Competition xDrive',
    year: 2026,
    type: 'Sports',
    condition: 'New',
    price: 134900,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1049',
    description:
      'The M4 Competition is the most focused car in the showroom and makes no secret of it. With xDrive it is usable year-round, and the rear-drive mode is still there when the road is dry. Brilliant white with a carbon roof, wide arches and dark forged wheels.',
    colours: ['brilliant white', 'obsidian black', 'graphite grey', 'silver', 'midnight black'],
    specs: {
      engine: '3.0-litre twin-turbo inline-six',
      power: '523 hp',
      transmission: '8-speed M Steptronic',
      drivetrain: 'M xDrive all-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 3.4 s',
      topSpeed: '180 mph',
      seats: 4,
      doors: 2,
      exteriorColour: 'Brilliant white with carbon roof',
      interiorColour: 'Black merino with blue stitching',
    },
    features: {
      safety: ['M compound brakes', 'Active driving assistant', 'Parking assistant plus', 'Frontal collision warning'],
      comfort: ['M carbon bucket seats', 'Three-zone climate control', 'Heated front seats', 'Harman Kardon sound'],
      technology: ['BMW curved display', 'M Drive Professional', 'Head-up display', 'M laptimer'],
      exterior: ['Adaptive M suspension', 'Active M differential', 'Carbon fibre roof', '19/20-inch forged alloys'],
    },
  },

  // ── Porsche ─────────────────────────────────────────────────────
  {
    slug: 'porsche-taycan',
    brand: 'Porsche',
    name: 'Porsche Taycan',
    model: 'Taycan',
    trim: 'Taycan 4S',
    year: 2026,
    type: 'Sedan',
    condition: 'New',
    price: 128400,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1050',
    description:
      'The Taycan is the electric car that convinced sceptics, largely because it drives like a Porsche first and an EV second. Its 800-volt architecture charges faster than almost anything else on the road. Volcano grey, sitting very low, with a full-width light bar.',
    colours: ['volcano grey metallic', 'obsidian black', 'glacier white', 'silver', 'midnight black'],
    specs: {
      engine: 'Dual electric motors, 105 kWh battery',
      power: '536 hp',
      transmission: '2-speed automatic, rear axle',
      drivetrain: 'All-wheel drive',
      fuel: 'Electric',
      acceleration: '0–60 mph in 3.7 s',
      topSpeed: '155 mph',
      seats: 4,
      doors: 4,
      exteriorColour: 'Volcano grey metallic',
      interiorColour: 'Black leather-free with race-tex',
    },
    features: {
      safety: ['Adaptive cruise control', 'Lane keeping assist', 'Surround view camera', 'Night vision assist'],
      comfort: ['18-way adaptive sports seats', 'Four-zone climate control', 'Heated and ventilated seats', 'Panoramic roof'],
      technology: ['Porsche Communication Management', 'Bose surround sound', 'Passenger display', '320 kW rapid charging'],
      exterior: ['Adaptive air suspension', 'Porsche Torque Vectoring Plus', 'Matrix LED headlights', '20-inch alloys'],
    },
  },
  {
    slug: 'porsche-cayenne',
    brand: 'Porsche',
    name: 'Porsche Cayenne',
    model: 'Cayenne',
    trim: 'Cayenne S Coupe',
    year: 2026,
    type: 'SUV',
    condition: 'New',
    price: 116200,
    currency: 'USD',
    available: true,
    featured: false,
    stockNumber: 'AUR-1051',
    description:
      'The Cayenne Coupe trades a little practicality for a considerably better profile, and the V8 makes a sound no electric SUV can match. Jet black metallic with body-coloured arches and polished alloys, over a black interior.',
    colours: ['jet black metallic', 'graphite grey', 'glacier white', 'silver'],
    specs: {
      engine: '4.0-litre twin-turbo V8',
      power: '468 hp',
      transmission: '8-speed Tiptronic S',
      drivetrain: 'All-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 4.7 s',
      topSpeed: '169 mph',
      seats: 5,
      doors: 5,
      exteriorColour: 'Jet black metallic',
      interiorColour: 'Black leather with silver stitching',
    },
    features: {
      safety: ['Porsche Surface Coated Brakes', 'Lane change assist', 'Surround view camera', 'Adaptive cruise control'],
      comfort: ['14-way comfort seats', 'Four-zone climate control', 'Heated and ventilated seats', 'Panoramic fixed glass roof'],
      technology: ['Porsche Communication Management', 'Bose surround sound', 'Head-up display', 'Wireless charging'],
      exterior: ['Adaptive air suspension', 'Sport exhaust system', 'Matrix LED headlights', '21-inch alloys'],
    },
  },
  {
    slug: 'porsche-911-carrera',
    brand: 'Porsche',
    name: 'Porsche 911 Carrera',
    model: '911',
    trim: '911 Carrera S',
    year: 2026,
    type: 'Sports',
    condition: 'New',
    price: 168700,
    currency: 'USD',
    available: true,
    featured: true,
    stockNumber: 'AUR-1052',
    description:
      'Sixty years of iteration and the engine is still in the wrong place, which is exactly why it drives the way it does. The 911 remains usable every day in a way its rivals are not. Agate grey metallic, on centre-lock wheels, with a black interior.',
    colours: ['agate grey metallic', 'obsidian black', 'glacier white', 'silver', 'midnight black'],
    specs: {
      engine: '3.0-litre twin-turbo flat-six',
      power: '473 hp',
      transmission: '8-speed PDK',
      drivetrain: 'Rear-wheel drive',
      fuel: 'Petrol',
      acceleration: '0–60 mph in 3.3 s',
      topSpeed: '191 mph',
      seats: 4,
      doors: 2,
      exteriorColour: 'Agate grey metallic',
      interiorColour: 'Black leather with silver stitching',
    },
    features: {
      safety: ['Porsche Ceramic Composite Brakes', 'Lane keeping assist', 'Reversing camera', 'Adaptive cruise control'],
      comfort: ['18-way adaptive sports seats', 'Two-zone climate control', 'Heated seats', 'Bose surround sound'],
      technology: ['Porsche Communication Management', 'Sport Chrono package', 'Wireless charging', 'Track precision app'],
      exterior: ['Porsche Active Suspension Management', 'Rear-axle steering', 'Sport exhaust', '20/21-inch centre-lock alloys'],
    },
  },
];
