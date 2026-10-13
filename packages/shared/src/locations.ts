export interface StateLgaMap {
  state: string;
  lgas: string[];
}

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
] as const;

export type NigerianState = (typeof NIGERIAN_STATES)[number];

export const PROMINENT_LGAS_BY_STATE: Record<string, string[]> = {
  "Lagos": [
    "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", "Badagry",
    "Epe", "Eti-Osa (Ikoyi, Victoria Island, Lekki)", "Ibeju-Lekki", "Ifako-Ijaiye",
    "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland (Yaba, Ebute Metta)",
    "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
  ],
  "FCT - Abuja": [
    "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal (Maitama, Asokoro, Wuse, Garki, Jabi, Utako)"
  ],
  "Rivers": [
    "Port Harcourt", "Obio-Akpor", "Eleme", "Ikwerre", "Oyigbo", "Bonny", "Okrika", "Degema"
  ],
  "Oyo": [
    "Ibadan North", "Ibadan North-East", "Ibadan North-West", "Ibadan South-East",
    "Ibadan South-West", "Oluyole", "Oyo East", "Oyo West", "Ogbomosho North", "Ogbomosho South"
  ],
  "Ogun": [
    "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ifo", "Ijebu Ode", "Sagamu", "Obafemi Owode"
  ],
  "Kano": [
    "Dala", "Fagge", "Gwale", "Kano Municipal", "Kumbotso", "Nasarawa", "Tarauni"
  ],
  "Kaduna": [
    "Kaduna North", "Kaduna South", "Chikun", "Igabi", "Zaria", "Sabon Gari"
  ],
  "Edo": [
    "Oredo (Benin City)", "Ikpoba Okha", "Egor", "Ovia North-East", "Esan Central", "Esan West"
  ],
  "Anambra": [
    "Awka North", "Awka South", "Onitsha North", "Onitsha South", "Idemili North", "Nnewi North"
  ],
  "Enugu": [
    "Enugu East", "Enugu North", "Enugu South", "Nkanu West", "Nsukka", "Udi"
  ],
  "Delta": [
    "Warri South", "Warri North", "Warri South-West", "Uvwie (Effurun)", "Sapele", "Oshimili South (Asaba)", "Ughelli North"
  ],
};

export function getLgasForState(state: string): string[] {
  return PROMINENT_LGAS_BY_STATE[state] || ["Metropolis / Central", "North", "South", "East", "West"];
}
