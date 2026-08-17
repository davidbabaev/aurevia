// Aurevia Premium Motors — site copy
//
// ⚠️ Aurevia is a fictional dealership built as a portfolio project.
// Contact details are [REPLACE] markers, not real. No claims here
// describe a real business.
//
// Copy rules (CLAUDE.md §5): sentence case, active voice.
// Banned: elevate, curated, bespoke, nestled, unparalleled, seamless,
// world-class, amazing deal, hurry, best ever.

export const SITE = {
  name: 'Aurevia Premium Motors',
  shortName: 'Aurevia',
  tagline: 'Premium cars. Personal service.',
} as const;

// ── Home ─────────────────────────────────────────────────────────
export const HOME = {
  hero: {
    eyebrow: 'Premium automotive gallery',
    heading: 'Find your next premium car',
    support:
      'Explore a selected collection of premium vehicles and receive personal guidance from our automotive sales specialists.',
    primaryCta: 'Explore vehicles',
    secondaryCta: 'Book a meeting',
  },

  search: {
    tabs: ['All vehicles', 'New arrivals', 'Featured'],
    fields: {
      brand: 'Any brand',
      model: 'Any model',
      year: 'Any year',
      price: 'Any price',
    },
    submit: 'Search',
  },

  brands: {
    heading: 'Explore by brand',
    support: 'Four manufacturers, one standard of preparation.',
  },

  // The statement section between brands and featured vehicles
  statement: {
    heading: 'Cars worth the drive home',
    body:
      'Every vehicle in our showroom is inspected, documented and photographed before it is listed. You will know what you are looking at before you arrive.',
    primaryCta: 'View vehicles',
    secondaryCta: 'Our collection',
  },

  featured: {
    heading: 'Featured vehicles',
    viewAll: 'View all',
  },

  values: [
    {
      title: 'Carefully selected vehicles',
      body: 'Every car is inspected and documented before it reaches the showroom floor.',
    },
    {
      title: 'Personal sales guidance',
      body: 'One specialist handles your enquiry from first question to handover.',
    },
    {
      title: 'Trade-in assistance',
      body: 'We will value your current car and take it in part exchange.',
    },
    {
      title: 'Transparent vehicle information',
      body: 'Full specification, history and condition, shared before you ask.',
    },
  ],

  showroomCta: {
    badge: 'Private viewing',
    heading: 'Arrange a private showroom visit',
    body: 'Meet one of our sales specialists and see the vehicle in person, without a showroom floor full of other people.',
    cta: 'Book a meeting',
  },
} as const;

// ── Vehicles / inventory ─────────────────────────────────────────
export const VEHICLES_PAGE = {
  heading: 'All vehicles',
  support: 'Twelve vehicles from four manufacturers, all available to view by appointment.',
  resultCount: (n: number) => `${n} ${n === 1 ? 'vehicle' : 'vehicles'}`,
  filters: {
    heading: 'Filter',
    clear: 'Clear all',
    brand: 'Brand',
    type: 'Vehicle type',
    fuel: 'Fuel type',
    price: 'Price range',
    year: 'Year',
  },
  sort: {
    label: 'Sort by',
    options: [
      'Newest first',
      'Price: low to high',
      'Price: high to low',
      'Year: newest first',
    ],
  },
  empty: {
    heading: 'No vehicles match those filters',
    body: 'Try widening the price range or clearing a filter.',
    cta: 'Clear all filters',
  },
} as const;

// ── Brand pages ──────────────────────────────────────────────────
export const BRANDS = {
  'mercedes-benz': {
    name: 'Mercedes-Benz',
    heading: 'Mercedes-Benz',
    intro:
      'Mercedes-Benz builds the quietest cars in this showroom. Whether that is an S-Class on air suspension or an AMG with a V8 behind the grille, the engineering underneath is the same.',
  },
  audi: {
    name: 'Audi',
    heading: 'Audi',
    intro:
      'Audi has spent four decades refining quattro all-wheel drive, and it shows in how confidently these cars deal with poor weather. The interiors are among the best assembled anywhere.',
  },
  bmw: {
    name: 'BMW',
    heading: 'BMW',
    intro:
      'BMW still builds its cars around the driver, whether the power comes from a straight-six or a battery. The i4 and the M4 in our showroom make that point from opposite directions.',
  },
  porsche: {
    name: 'Porsche',
    heading: 'Porsche',
    intro:
      'Porsche makes sports cars that work as daily transport, which is harder than it sounds. The 911 has been proving it since 1963; the Taycan now does the same on electricity.',
  },
} as const;

// ── Vehicle detail ───────────────────────────────────────────────
export const VEHICLE_DETAIL = {
  contactForPrice: 'Contact for price',
  primaryCta: 'Book a meeting',
  secondaryCtas: {
    call: 'Call sales',
    whatsapp: 'WhatsApp',
    enquire: 'Request information',
  },
  sections: {
    specs: 'Specifications',
    features: 'Features and equipment',
    description: 'About this vehicle',
    similar: 'Similar vehicles',
  },
  featureGroups: {
    safety: 'Safety',
    comfort: 'Comfort',
    technology: 'Technology',
    exterior: 'Exterior',
  },
  gallery: {
    exterior: 'Exterior',
    interior: 'Interior',
    dashboard: 'Dashboard',
    detail: 'Detail',
  },
  stockLabel: 'Stock number',
} as const;

// ── Book a meeting ───────────────────────────────────────────────
export const BOOKING = {
  heading: 'Book a meeting',
  support:
    'Tell us when suits you and which vehicle you would like to see. A sales specialist will confirm the appointment by phone or email.',
  fields: {
    name: 'Full name',
    phone: 'Phone number',
    email: 'Email address',
    contactMethod: 'Preferred contact method',
    vehicle: 'Vehicle of interest',
    date: 'Preferred date',
    time: 'Preferred time',
    meetingType: 'Meeting type',
    message: 'Anything else we should know',
    consent: 'I agree to Aurevia contacting me about this enquiry.',
  },
  meetingTypes: ['Showroom visit', 'Phone call', 'Video call'],
  contactMethods: ['Phone', 'Email', 'WhatsApp'],
  submit: 'Send request',
  // Never claim the meeting is confirmed — no calendar system backs it.
  success: {
    heading: 'Request received',
    body: 'A sales specialist will contact you to confirm the appointment.',
  },
  error: {
    heading: 'That did not send',
    body: 'Something went wrong on our side. Please try again, or call us directly.',
  },
} as const;

// ── Contact ──────────────────────────────────────────────────────
export const CONTACT = {
  heading: 'Contact us',
  support: 'Visit the showroom, or get in touch and we will come back to you the same day.',
  showroomHeading: 'Showroom',
  hoursHeading: 'Opening hours',
  directions: 'Get directions',
  form: {
    heading: 'Send a message',
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send message',
  },
} as const;

// ── Footer ───────────────────────────────────────────────────────
export const FOOTER = {
  blurb:
    'Aurevia Premium Motors presents selected vehicles from four of the world\'s leading manufacturers, with personal guidance from first enquiry to handover.',
  newsletter: {
    heading: 'Subscribe to our newsletter',
    placeholder: 'Email address',
    submit: 'Subscribe',
  },
  columns: {
    brands: 'Brands',
    explore: 'Explore',
    contact: 'Contact',
  },
  legal: ['Terms', 'Privacy policy', 'Accessibility'],
  copyright: (year: number) => `© ${year} Aurevia Premium Motors`,
} as const;

// ── Contact details — NOT REAL ───────────────────────────────────
// The three wireframes disagree (Tel Aviv vs Miami). Per CLAUDE.md §5
// these ship as [REPLACE] markers rather than an invented address.
export const DETAILS = {
  address: '[REPLACE] street address',
  city: '[REPLACE] city, country',
  phone: '[REPLACE] phone number',
  email: '[REPLACE] email address',
  hours: '[REPLACE] opening hours',
  whatsapp: '[REPLACE] WhatsApp number',
} as const;

// ── 404 ──────────────────────────────────────────────────────────
export const NOT_FOUND = {
  heading: 'That page does not exist',
  body: 'The link may be out of date, or the vehicle may have been sold.',
  cta: 'View all vehicles',
} as const;
