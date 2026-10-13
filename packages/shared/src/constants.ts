export const AGENCY_FEE_PER_WORKER = 50000;
export const REPLACEMENT_WINDOW_DAYS = 14;
export const REMOVAL_NOTICE_DAYS = 3;

export const JOB_CATEGORIES = [
  "Fashion, Tailoring & Textile",
  "Construction & Building",
  "Electrical & Electronics",
  "Automotive",
  "Transport & Driving",
  "Beauty, Hair & Personal Care",
  "Catering, Food & Hospitality",
  "Cleaning & Domestic Services",
  "Woodwork & Furniture",
  "Metalwork & Fabrication",
  "Painting & Interior Finishing",
  "Technology & Digital Professionals",
  "Fashion Production",
  "Sales, Retail & Commercial",
  "Professional Business Services"
];

export const ERRAND_CATEGORIES = [
  {
    id: "property_inspection",
    label: "Property Inspection",
    description: "Verify construction site, inspect land, check building progress",
  },
  {
    id: "personal_errand",
    label: "Personal Errands",
    description: "Market shopping, supervised household errands",
  },
  {
    id: "administrative_errand",
    label: "Administrative Errands",
    description: "Queuing at banks/government agencies, document filing and pickup",
  },
  {
    id: "photography",
    label: "Photography & Media",
    description: "Take timestamped photos or video inspection of a location or item",
  },
  {
    id: "pickup_delivery",
    label: "Pickup & Delivery",
    description: "Secure transport and delivery of packages from one location to another",
  },
] as const;

export type ErrandCategoryId = typeof ERRAND_CATEGORIES[number]["id"];

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "OPay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "TAJ Bank", code: "302" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
] as const;
