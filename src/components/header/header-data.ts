export const utilityLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
];

type ProductNavSection = {
  label: string;
  slug: string;
  items: string[];
};

type ProductNavColumn = {
  sections: ProductNavSection[];
};

type ProductCategory = {
  label: string;
  featured?: boolean;
  items?: string[];
  sections?: ProductNavSection[];
  columns?: ProductNavColumn[];
  showAll?: boolean;
  scrollable?: boolean;
};

export const productCategories: ProductCategory[] = [
  {
    label: "Brands",
    items: ["Alpinestars", "Barkbusters", "Klim", "Loboo", "Mosko Moto"],
    featured: true,
  },
  {
    label: "Riding gear",
    sections: [
      {
        label: "Mens Riding Gear",
        slug: "mens",
        items: [
          "Jackets",
          "Pants",
          "Gloves",
          "Base Layers",
          "Mid Layers",
          "Rain Gear",
          "Socks",
          "Jerseys",
          "Headwear",
          "Casuals",
          "Gear Bundles",
        ],
      },
      {
        label: "Womens Riding Gear",
        slug: "womens",
        items: [
          "Jackets",
          "Pants",
          "Gloves",
          "Base Layers",
          "Mid Layers",
          "Rain Gear",
          "Socks",
          "Jerseys",
          "Headwear",
          "Casuals",
          "Gear Bundles",
        ],
      },
      {
        label: "Riding Protection",
        slug: "protection",
        items: [
          "Helmets",
          "Boots",
          "Airbag Systems",
          "Body Armour",
          "Armour Inserts",
          "Knee Guards",
          "Knee Braces",
          "Goggles",
          "Goggle Lenses",
          "Kidney Belts",
          "Helmet Accessories",
          "Hearing Protection",
        ],
      },
      {
        label: "Riding Gear Bundles",
        slug: "bundles",
        items: ["Alpinestars", "Dririder", "Leatt", "MotoDry", "Fox"],
      },
    ],
  },
  {
    label: "Parts",
    scrollable: true,
    columns: [
      {
        sections: [
          {
            label: "Bike Protection",
            slug: "bike-protection",
            items: [
              "Bash & Skid Plates",
              "Case Savers",
              "Crash Bars",
              "Frame Guards",
              "Radiator Guards",
              "Headlight Guards",
              "Swingarm Protectors",
              "Clutch Cover Protectors",
              "Ignition Cover Protectors",
              "Hand Guards",
            ],
          },
          {
            label: "Brakes",
            slug: "brakes",
            items: [
              "Brake Pads",
              "Front Brake Pads",
              "Rear Brake Pads",
              "Brake Discs",
              "Front Brake Discs",
              "Rear Brake Discs",
              "Brake Pedals",
              "Brake Bleeders",
            ],
          },
        ],
      },
      {
        sections: [
          {
            label: "Body",
            slug: "body",
            items: [
              "Plastics",
              "Sidestand Enlargers",
              "Mirrors",
              "Windshields",
              "Luggage Racks",
              "Centre Stands",
              "Side Stands",
            ],
          },
          {
            label: "Cables",
            slug: "cables",
            items: ["Throttle Cables", "Clutch Cables"],
          },
          {
            label: "Chains & Sprockets",
            slug: "chains-and-sprockets",
            items: [
              "Chains",
              "Sprockets",
              "Front Sprockets",
              "Rear Sprockets",
              "Chain & Sprocket Kits",
              "Chain Oilers",
            ],
          },
        ],
      },
      {
        sections: [
          {
            label: "Controls",
            slug: "controls",
            items: [
              "Handlebars",
              "Footpegs",
              "Steg Pegz",
              "Handlebar Risers",
              "Grips",
              "Heated Grips",
              "Brake Levers",
              "Clutch Levers",
              "Gear Levers",
              "Steering Dampers",
            ],
          },
          {
            label: "Electrical",
            slug: "electrical",
            items: [
              "Lighting Systems",
              "Batteries",
              "Horns",
              "Indicators",
              "Tail Lights",
              "Canbus Controls",
            ],
          },
        ],
      },
      {
        sections: [
          {
            label: "Exhaust",
            slug: "exhaust",
            items: ["Slip-On Exhausts", "Exhaust Systems", "Exhaust Headers"],
          },
          {
            label: "Filters",
            slug: "filters",
            items: [
              "Air Filters",
              "Oil Filters",
              "Fuel Filters",
              "Air Filter Dust Covers",
            ],
          },
          {
            label: "Wheels",
            slug: "wheels",
            items: ["Wheel Bearing Kits", "Wheel Spacers", "Rim Locks"],
          },
          {
            label: "Fuel",
            slug: "fuel",
            items: ["Fuel Tank Caps", "Auxiliary Fuel Tanks", "Fuel Tanks"],
          },
        ],
      },
      {
        sections: [
          {
            label: "Seats",
            slug: "seats",
            items: ["Seat Cushions"],
          },
          {
            label: "Suspension",
            slug: "suspension",
            items: [
              "Rear Suspension",
              "Lowering Links",
              "Fork Oil Seal Kits",
              "Fork Dust Seals",
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Luggage",
    sections: [
      {
        label: "Motorcycle Luggage",
        slug: "motorcycle-luggage",
        items: [
          "Pannier Bags",
          "Duffel Bags",
          "Rollie Bags",
          "Tank Bags",
          "Tail Bags",
          "Rackless Luggage",
          "Top Boxes",
          "Side Cases",
          "Tool Bags",
          "Tool Boxes",
          "Dry Bags",
        ],
      },
      {
        label: "Luggage Accessories",
        slug: "accessories",
        items: [
          "Luggage Racks",
          "Pannier Racks",
          "Fuel Containers",
          "Fuel Bladders",
          "Water Containers",
          "Straps & Harnesses",
          "Rain Covers",
          "Locks",
          "Heat Shields",
          "Luggage Repair Kits",
          "Replacement Hardware",
        ],
      },
      {
        label: "Rider Luggage",
        slug: "rider-luggage",
        items: ["Backpacks", "Hydration Packs"],
      },
    ],
  },
  {
    label: "Accessories",
    scrollable: true,
    columns: [
      {
        sections: [
          {
            label: "Security",
            slug: "security",
            items: [
              "Grip Locks",
              "Helmet Locks",
              "Security Anchors",
              "Security Cables & Chains",
              "Motorcycle Covers",
            ],
          },
          {
            label: "Oils & Lubricants",
            slug: "oils-and-lubricants",
            items: [
              "Air Filter Cleaners",
              "Air Filter Oils",
              "Brake & Clutch Fluids",
              "Brake & Contact Cleaners",
              "Chain Cleaners",
              "Chain Lubes",
              "Coolants",
              "Engine Oils",
              "Fork Oils",
              "Gear Oils",
              "Grease & Lubes",
              "Shock Fluids",
            ],
          },
        ],
      },
      {
        sections: [
          {
            label: "Cleaning Products",
            slug: "cleaning-products",
            items: [
              "Bike Cleaners & Degreaser",
              "Cleaning Brushes",
              "Helmet & Goggle Care",
              "Polish",
              "Silicone Spray",
              "Towels & Chamois",
              "Exhaust Plugs",
            ],
          },
          {
            label: "Fuel Systems",
            slug: "fuel-systems",
            items: [
              "Fuel Tanks",
              "Fuel Bottles",
              "Fuel Bladders",
              "Fuel Containers",
              "Funnels",
            ],
          },
          {
            label: "Communication & Navigation",
            slug: "communication-and-navigation",
            items: [
              "Communication Systems",
              "GPS Systems",
              "Phone & GPS Mounts",
            ],
          },
        ],
      },
      {
        sections: [
          {
            label: "Electrical",
            slug: "electrical",
            items: [
              "Power Cables",
              "Jump Starters",
              "Tyre Pumps",
              "Battery Chargers",
              "Power Adaptors & Outlets",
              "Heated Grips",
              "Indicators",
              "Horns",
            ],
          },
          {
            label: "Stands",
            slug: "stands",
            items: ["Paddock Stands", "Trail Stands"],
          },
        ],
      },
    ],
  },
  {
    label: "Tyres",
    showAll: false,
    sections: [
      {
        label: "Tyres",
        slug: "tyres",
        items: ["Front Tyres", "Rear Tyres", "Tubes"],
      },
      {
        label: "Featured Brands",
        slug: "brands",
        items: [
          "Bridgestone",
          "Continental",
          "Dunlop",
          "Kenda",
          "Metzeler",
          "Michelin",
          "Mitas",
          "Motoz",
          "Pirelli",
          "Shinko",
          "Vee Rubber",
        ],
      },
    ],
  },
  {
    label: "Tools",
    sections: [
      {
        label: "Tyre & Wheel Tools",
        slug: "tyre-and-wheel-tools",
        items: [
          "Bead Tools",
          "Tyre Levers",
          "Tyre Gauges",
          "Tyre Repair Kits",
          "Valve Core Tools",
          "Spoke Spanners",
          "Axle Tools",
          "Bearing Pullers",
          "Brake Bleeders",
        ],
      },
      {
        label: "Engine Tools",
        slug: "engine-tools",
        items: [
          "Engine Tools",
          "Flywheel Pullers",
          "Spark Plug Tools",
          "Exhaust Tools",
        ],
      },
      {
        label: "Suspension Tools",
        slug: "suspension-tools",
        items: ["Fork Tools", "Shock Tools"],
      },
      {
        label: "Drivetrain Tools",
        slug: "drivetrain-tools",
        items: ["Chain Tools", "Cable Tools"],
      },
      {
        label: "Hand Tools",
        slug: "hand-tools",
        items: [
          "Allen Keys",
          "Screwdrivers",
          "Spanners",
          "Pliers",
          "Sockets & Socket Sets",
          "T-Bars",
          "Drive Tools",
          "Tool Kits",
        ],
      },
    ],
  },
];

export function slugify(value: string) {
  return value.toLowerCase().replaceAll(" ", "-");
}

export function isPathActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
