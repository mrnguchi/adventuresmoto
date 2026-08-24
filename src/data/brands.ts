export type Brand = {
  name: string;
  image: string;
  href: string;
  initial: string;
};

type BrandNameGroup = {
  initial: string;
  names: string[];
};

const brandNameGroups: BrandNameGroup[] = [
  {
    initial: "0-9",
    names: ["100% Percent", "3BR Powersports"],
  },
  {
    initial: "A",
    names: [
      "A1 Accessories",
      "ACE Bikes",
      "Acerbis",
      "Adventure Moto",
      "ADVWORX",
      "Airhawk",
      "Airoh",
      "Akin Moto",
      "Akrapovic",
      "Albek",
      "All Balls Racing",
      "Alpine Hearing Protection",
      "Alpinestars",
      "Arai",
      "Ariete",
      "Arrowhead",
      "ASV Levers",
      "ATG",
      "Atlas",
      "Avon Tyres",
      "Axiom Moto-X",
      "AXP Racing",
    ],
  },
  {
    initial: "B",
    names: [
      "B&B Offroad",
      "Ballard's Off Road",
      "Barkbusters",
      "Barrett Products",
      "BC Battery",
      "Bearing Worx",
      "Bell",
      "Berik",
      "BMC Air Filter",
      "Bolt Motorcycle Hardware",
      "Braking",
      "Bridgestone",
      "Bull Bar",
    ],
  },
  {
    initial: "C",
    names: [
      "Camel ADV Products",
      "Cardo",
      "Champion",
      "Chigee",
      "Click N Ride",
      "Cobrra",
      "Continental",
      "Cool Covers",
      "CrossPro",
      "CruzTools",
      "CST Tyres",
      "Cube Intuitive",
    ],
  },
  {
    initial: "D",
    names: [
      "Denali",
      "Devol",
      "DFX Parts",
      "Dirtlab",
      "Domino",
      "Doubletake Mirrors",
      "Draggin",
      "DRC",
      "DriRider",
      "Dunlop",
    ],
  },
  {
    initial: "E",
    names: [
      "EBC Brakes",
      "EK Chains",
      "Enduro Engineering",
      "Envy",
      "Evakool",
      "EVS",
      "Excel",
    ],
  },
  {
    initial: "F",
    names: [
      "Falco",
      "Fastway",
      "Fempro Armour",
      "Ferodo",
      "Five Advanced Gloves",
      "Fly Racing",
      "FMF",
      "Force Accessories",
      "Forcefield Body Armour",
      "Forma",
      "Fox",
      "Fuel Star",
      "Funnelweb Filters",
      "Fusport",
    ],
  },
  {
    initial: "G",
    names: [
      "Gaerne",
      "Galfer",
      "Garmin",
      "Gear Aid",
      "GeerTop",
      "Giant Loop",
      "Givi",
      "GoldenTyre",
    ],
  },
  {
    initial: "H",
    names: [
      "Haan Wheels",
      "Heidenau",
      "Helinox",
      "Hema Maps",
      "Hex ezCAN",
      "HifloFiltro",
      "Hightail",
      "Hinson",
      "Hiplok",
      "HJC Helmets",
      "Hot Cams",
      "Hot Rods",
      "Hunersdorff",
    ],
  },
  {
    initial: "I",
    names: [
      "Icebreaker",
      "IMS Products",
      "Insta360",
      "Interphone",
      "IPONE",
      "IRC Tyre",
    ],
  },
  {
    initial: "J",
    names: ["JDJetting", "JT Sprockets"],
  },
  {
    initial: "K",
    names: [
      "K&N",
      "Kaoko",
      "Kenda",
      "Kite Performance",
      "Klim",
      "Kovix",
      "Kriega",
      "KroozR",
      "Kustom Hardware",
    ],
  },
  {
    initial: "L",
    names: ["La Corsa", "Leatt", "LeoVince", "Loboo", "LS2 Helmets"],
  },
  {
    initial: "M",
    names: [
      "M2R Helmets",
      "Macna",
      "Maxima Racing Oils",
      "Maxxis",
      "MCS",
      "Metzeler",
      "Michelin",
      "Mitas",
      "Mo-Tech",
      "Motion Pro",
      "Moto Manufacturing",
      "Moto-Master",
      "Moto-Skiveez",
      "Motobatt",
      "MotoDry",
      "Moto-Hansa",
      "Motorex",
      "Motoz",
      "Motul",
      "MSC Moto",
      "Muc-Off",
    ],
  },
  {
    initial: "N",
    names: ["Nelson-Rigg", "Newfren", "Nitro Helmets", "No Toil"],
  },
  {
    initial: "O",
    names: [
      "Oakley",
      "Ocean Signal",
      "ODI",
      "Ogio",
      "Oneal",
      "OnGuard",
      "Optimate",
      "Osah",
      "Outback Motortek",
      "Oxford",
    ],
  },
  {
    initial: "P",
    names: [
      "P3 Carbon",
      "Pelion",
      "Pirelli",
      "Pivot Pegz",
      "Pivot Works",
      "POD",
      "Polisport",
      "Precision Moto",
      "Pro Circuit",
      "Pro Taper",
      "Pro-GreenMX",
      "ProFilter",
      "Progrip",
    ],
  },
  {
    initial: "Q",
    names: ["Quad Lock"],
  },
  {
    initial: "R",
    names: [
      "Racetech",
      "RAM Mounts",
      "Regina Chain",
      "Rekluse",
      "Renthal",
      "Rheon",
      "RJays",
      "RK",
      "RMStator",
      "Rocky Creek Designs",
      "ROK Stopper",
      "ROK Straps",
      "Rotopax",
      "ROXspeedFX",
      "Raptor Performance Filters",
      "RST",
    ],
  },
  {
    initial: "S",
    names: [
      "S3 Parts",
      "Samco Sport",
      "SBS",
      "Scaggs Moto Designs",
      "Scott",
      "Sea To Summit",
      "Seat Concepts",
      "Sena",
      "Shad",
      "Sherpa Outdoors",
      "Shinko",
      "Sidi",
      "Simpson",
      "SKF",
      "SP Connect",
      "SPOT",
      "SSB Powersport",
      "Steg Pegz",
      "Supersprox",
      "SW-Motech",
    ],
  },
  {
    initial: "T",
    names: [
      "Takeway",
      "TecMate",
      "Thor",
      "Tirox",
      "Torc1 Racing",
      "Trail Tech",
      "Traverse",
      "Troy Lee Designs",
      "Twin Air",
    ],
  },
  {
    initial: "U",
    names: ["UFO Plast", "Uni Filter", "USWE"],
  },
  {
    initial: "V",
    names: ["Vee Rubber", "Vertex", "Vuplex"],
  },
  {
    initial: "W",
    names: [
      "Whites Powersports",
      "Winderosa",
      "Wiseco",
      "Wolfman Luggage",
    ],
  },
  {
    initial: "X",
    names: ["XRP"],
  },
  {
    initial: "Y",
    names: ["Yoshimura"],
  },
  {
    initial: "Z",
    names: ["Zac Speed", "Zeta"],
  },
];

const nonJpgExtensions: Record<number, string> = {
  10006: "png",
  10012: "webp",
  10034: "png",
  10066: "png",
  10094: "png",
  10099: "png",
  10104: "png",
  10106: "png",
  10109: "png",
  10115: "png",
  10121: "png",
  10213: "png",
};

function slugifyBrand(name: string) {
  return name
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const brandLogoIds = Array.from(
  { length: 232 },
  (_, index) => 10003 + index,
).filter((id) => id !== 10228);

let logoIndex = 0;

export const brandGroups = brandNameGroups.map(({ initial, names }) => ({
  initial,
  brands: names.map((name): Brand => {
    const imageId = brandLogoIds[logoIndex];
    const extension = nonJpgExtensions[imageId] ?? "jpg";

    logoIndex += 1;

    return {
      name,
      initial,
      image: `/images/brands/brand-${imageId}.${extension}`,
      href: `/brands/${slugifyBrand(name)}`,
    };
  }),
}));

export const brands = brandGroups.flatMap((group) => group.brands);
