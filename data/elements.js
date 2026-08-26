// All 118 IUPAC-recognized elements, in atomic-number order.
// Names/order verified against https://en.wikipedia.org/wiki/List_of_chemical_elements
// Standard atomic weights follow common IUPAC/CIAAW reference values (rounded);
// elements with no stable isotope show the mass number of their most stable
// known isotope in brackets, per convention (e.g. "[98]" for Technetium).
// Categories follow the standard 10-category scheme used on most modern
// printed periodic tables (the same scheme/colours as the reference chart
// this activity is modeled on).
const ELEMENTS = [
  { number: 1, symbol: 'H', name: 'Hydrogen', weight: '1.008', category: 'reactive-nonmetal' },
  { number: 2, symbol: 'He', name: 'Helium', weight: '4.003', category: 'noble-gas' },
  { number: 3, symbol: 'Li', name: 'Lithium', weight: '6.94', category: 'alkali' },
  { number: 4, symbol: 'Be', name: 'Beryllium', weight: '9.012', category: 'alkaline-earth' },
  { number: 5, symbol: 'B', name: 'Boron', weight: '10.81', category: 'metalloid' },
  { number: 6, symbol: 'C', name: 'Carbon', weight: '12.011', category: 'reactive-nonmetal' },
  { number: 7, symbol: 'N', name: 'Nitrogen', weight: '14.007', category: 'reactive-nonmetal' },
  { number: 8, symbol: 'O', name: 'Oxygen', weight: '15.999', category: 'reactive-nonmetal' },
  { number: 9, symbol: 'F', name: 'Fluorine', weight: '18.998', category: 'reactive-nonmetal' },
  { number: 10, symbol: 'Ne', name: 'Neon', weight: '20.180', category: 'noble-gas' },
  { number: 11, symbol: 'Na', name: 'Sodium', weight: '22.990', category: 'alkali' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', weight: '24.305', category: 'alkaline-earth' },
  { number: 13, symbol: 'Al', name: 'Aluminium', weight: '26.982', category: 'post-transition' },
  { number: 14, symbol: 'Si', name: 'Silicon', weight: '28.085', category: 'metalloid' },
  { number: 15, symbol: 'P', name: 'Phosphorus', weight: '30.974', category: 'reactive-nonmetal' },
  { number: 16, symbol: 'S', name: 'Sulfur', weight: '32.06', category: 'reactive-nonmetal' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', weight: '35.45', category: 'reactive-nonmetal' },
  { number: 18, symbol: 'Ar', name: 'Argon', weight: '39.948', category: 'noble-gas' },
  { number: 19, symbol: 'K', name: 'Potassium', weight: '39.098', category: 'alkali' },
  { number: 20, symbol: 'Ca', name: 'Calcium', weight: '40.078', category: 'alkaline-earth' },
  { number: 21, symbol: 'Sc', name: 'Scandium', weight: '44.956', category: 'transition' },
  { number: 22, symbol: 'Ti', name: 'Titanium', weight: '47.867', category: 'transition' },
  { number: 23, symbol: 'V', name: 'Vanadium', weight: '50.942', category: 'transition' },
  { number: 24, symbol: 'Cr', name: 'Chromium', weight: '51.996', category: 'transition' },
  { number: 25, symbol: 'Mn', name: 'Manganese', weight: '54.938', category: 'transition' },
  { number: 26, symbol: 'Fe', name: 'Iron', weight: '55.845', category: 'transition' },
  { number: 27, symbol: 'Co', name: 'Cobalt', weight: '58.933', category: 'transition' },
  { number: 28, symbol: 'Ni', name: 'Nickel', weight: '58.693', category: 'transition' },
  { number: 29, symbol: 'Cu', name: 'Copper', weight: '63.546', category: 'transition' },
  { number: 30, symbol: 'Zn', name: 'Zinc', weight: '65.38', category: 'transition' },
  { number: 31, symbol: 'Ga', name: 'Gallium', weight: '69.723', category: 'post-transition' },
  { number: 32, symbol: 'Ge', name: 'Germanium', weight: '72.630', category: 'metalloid' },
  { number: 33, symbol: 'As', name: 'Arsenic', weight: '74.922', category: 'metalloid' },
  { number: 34, symbol: 'Se', name: 'Selenium', weight: '78.971', category: 'reactive-nonmetal' },
  { number: 35, symbol: 'Br', name: 'Bromine', weight: '79.904', category: 'reactive-nonmetal' },
  { number: 36, symbol: 'Kr', name: 'Krypton', weight: '83.798', category: 'noble-gas' },
  { number: 37, symbol: 'Rb', name: 'Rubidium', weight: '85.468', category: 'alkali' },
  { number: 38, symbol: 'Sr', name: 'Strontium', weight: '87.62', category: 'alkaline-earth' },
  { number: 39, symbol: 'Y', name: 'Yttrium', weight: '88.906', category: 'transition' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', weight: '91.224', category: 'transition' },
  { number: 41, symbol: 'Nb', name: 'Niobium', weight: '92.906', category: 'transition' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', weight: '95.95', category: 'transition' },
  { number: 43, symbol: 'Tc', name: 'Technetium', weight: '[98]', category: 'transition' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', weight: '101.07', category: 'transition' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', weight: '102.906', category: 'transition' },
  { number: 46, symbol: 'Pd', name: 'Palladium', weight: '106.42', category: 'transition' },
  { number: 47, symbol: 'Ag', name: 'Silver', weight: '107.868', category: 'transition' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', weight: '112.414', category: 'transition' },
  { number: 49, symbol: 'In', name: 'Indium', weight: '114.818', category: 'post-transition' },
  { number: 50, symbol: 'Sn', name: 'Tin', weight: '118.710', category: 'post-transition' },
  { number: 51, symbol: 'Sb', name: 'Antimony', weight: '121.760', category: 'metalloid' },
  { number: 52, symbol: 'Te', name: 'Tellurium', weight: '127.60', category: 'metalloid' },
  { number: 53, symbol: 'I', name: 'Iodine', weight: '126.904', category: 'reactive-nonmetal' },
  { number: 54, symbol: 'Xe', name: 'Xenon', weight: '131.293', category: 'noble-gas' },
  { number: 55, symbol: 'Cs', name: 'Caesium', weight: '132.905', category: 'alkali' },
  { number: 56, symbol: 'Ba', name: 'Barium', weight: '137.327', category: 'alkaline-earth' },
  { number: 57, symbol: 'La', name: 'Lanthanum', weight: '138.905', category: 'lanthanide' },
  { number: 58, symbol: 'Ce', name: 'Cerium', weight: '140.116', category: 'lanthanide' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', weight: '140.908', category: 'lanthanide' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', weight: '144.242', category: 'lanthanide' },
  { number: 61, symbol: 'Pm', name: 'Promethium', weight: '[145]', category: 'lanthanide' },
  { number: 62, symbol: 'Sm', name: 'Samarium', weight: '150.36', category: 'lanthanide' },
  { number: 63, symbol: 'Eu', name: 'Europium', weight: '151.964', category: 'lanthanide' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', weight: '157.25', category: 'lanthanide' },
  { number: 65, symbol: 'Tb', name: 'Terbium', weight: '158.925', category: 'lanthanide' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', weight: '162.500', category: 'lanthanide' },
  { number: 67, symbol: 'Ho', name: 'Holmium', weight: '164.930', category: 'lanthanide' },
  { number: 68, symbol: 'Er', name: 'Erbium', weight: '167.259', category: 'lanthanide' },
  { number: 69, symbol: 'Tm', name: 'Thulium', weight: '168.934', category: 'lanthanide' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', weight: '173.045', category: 'lanthanide' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', weight: '174.967', category: 'lanthanide' },
  { number: 72, symbol: 'Hf', name: 'Hafnium', weight: '178.49', category: 'transition' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', weight: '180.948', category: 'transition' },
  { number: 74, symbol: 'W', name: 'Tungsten', weight: '183.84', category: 'transition' },
  { number: 75, symbol: 'Re', name: 'Rhenium', weight: '186.207', category: 'transition' },
  { number: 76, symbol: 'Os', name: 'Osmium', weight: '190.23', category: 'transition' },
  { number: 77, symbol: 'Ir', name: 'Iridium', weight: '192.217', category: 'transition' },
  { number: 78, symbol: 'Pt', name: 'Platinum', weight: '195.084', category: 'transition' },
  { number: 79, symbol: 'Au', name: 'Gold', weight: '196.967', category: 'transition' },
  { number: 80, symbol: 'Hg', name: 'Mercury', weight: '200.592', category: 'transition' },
  { number: 81, symbol: 'Tl', name: 'Thallium', weight: '204.38', category: 'post-transition' },
  { number: 82, symbol: 'Pb', name: 'Lead', weight: '207.2', category: 'post-transition' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', weight: '208.980', category: 'post-transition' },
  { number: 84, symbol: 'Po', name: 'Polonium', weight: '[209]', category: 'post-transition' },
  { number: 85, symbol: 'At', name: 'Astatine', weight: '[210]', category: 'metalloid' },
  { number: 86, symbol: 'Rn', name: 'Radon', weight: '[222]', category: 'noble-gas' },
  { number: 87, symbol: 'Fr', name: 'Francium', weight: '[223]', category: 'alkali' },
  { number: 88, symbol: 'Ra', name: 'Radium', weight: '[226]', category: 'alkaline-earth' },
  { number: 89, symbol: 'Ac', name: 'Actinium', weight: '[227]', category: 'actinide' },
  { number: 90, symbol: 'Th', name: 'Thorium', weight: '232.038', category: 'actinide' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', weight: '231.036', category: 'actinide' },
  { number: 92, symbol: 'U', name: 'Uranium', weight: '238.029', category: 'actinide' },
  { number: 93, symbol: 'Np', name: 'Neptunium', weight: '[237]', category: 'actinide' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', weight: '[244]', category: 'actinide' },
  { number: 95, symbol: 'Am', name: 'Americium', weight: '[243]', category: 'actinide' },
  { number: 96, symbol: 'Cm', name: 'Curium', weight: '[247]', category: 'actinide' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', weight: '[247]', category: 'actinide' },
  { number: 98, symbol: 'Cf', name: 'Californium', weight: '[251]', category: 'actinide' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', weight: '[252]', category: 'actinide' },
  { number: 100, symbol: 'Fm', name: 'Fermium', weight: '[257]', category: 'actinide' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', weight: '[258]', category: 'actinide' },
  { number: 102, symbol: 'No', name: 'Nobelium', weight: '[259]', category: 'actinide' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', weight: '[266]', category: 'actinide' },
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', weight: '[267]', category: 'transition' },
  { number: 105, symbol: 'Db', name: 'Dubnium', weight: '[268]', category: 'transition' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', weight: '[269]', category: 'transition' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', weight: '[270]', category: 'transition' },
  { number: 108, symbol: 'Hs', name: 'Hassium', weight: '[269]', category: 'transition' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', weight: '[278]', category: 'transition' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', weight: '[281]', category: 'transition' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', weight: '[282]', category: 'transition' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', weight: '[285]', category: 'transition' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', weight: '[286]', category: 'unknown' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', weight: '[289]', category: 'unknown' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', weight: '[290]', category: 'unknown' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', weight: '[293]', category: 'unknown' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', weight: '[294]', category: 'unknown' },
  { number: 118, symbol: 'Og', name: 'Oganesson', weight: '[294]', category: 'noble-gas' },
];

// Deterministic (period, group) placement for the standard 18-column /
// 7-period layout. Lanthanum (57) and Actinium (89) get their own cell in
// the main grid at group 3 — only Cerium-Lutetium (58-71) and
// Thorium-Lawrencium (90-103) are routed to the separate f-block row below
// (fCol 0-13), matching the standard printed chart convention.
function positionForElement(number) {
  if (number === 1) return { period: 1, group: 1 };
  if (number === 2) return { period: 1, group: 18 };
  if (number >= 3 && number <= 10) {
    const groups = [1, 2, 13, 14, 15, 16, 17, 18];
    return { period: 2, group: groups[number - 3] };
  }
  if (number >= 11 && number <= 18) {
    const groups = [1, 2, 13, 14, 15, 16, 17, 18];
    return { period: 3, group: groups[number - 11] };
  }
  if (number >= 19 && number <= 36) return { period: 4, group: number - 18 };
  if (number >= 37 && number <= 54) return { period: 5, group: number - 36 };
  if (number === 55) return { period: 6, group: 1 };
  if (number === 56) return { period: 6, group: 2 };
  if (number === 57) return { period: 6, group: 3 };
  if (number >= 58 && number <= 71) return { period: 6, fBlock: true, fCol: number - 58 };
  if (number >= 72 && number <= 86) return { period: 6, group: number - 68 };
  if (number === 87) return { period: 7, group: 1 };
  if (number === 88) return { period: 7, group: 2 };
  if (number === 89) return { period: 7, group: 3 };
  if (number >= 90 && number <= 103) return { period: 7, fBlock: true, fCol: number - 90 };
  if (number >= 104 && number <= 118) return { period: 7, group: number - 100 };
  return null;
}
