// ─── PoE2 Item types from the character-window API ───────────────────────────

export interface PoEProperty {
  name: string;
  values: [string, number][];
  displayMode: number;
  type?: number;
}

export interface PoESockets {
  group: number;
  attr?: string;
  sColour?: string;
}

export interface PoEItem {
  id: string;
  name: string;          // populated for uniques/named items
  typeLine: string;      // base type line
  baseType: string;      // base type
  identified: boolean;
  ilvl: number;
  /**
   * 0 = Normal, 1 = Magic, 2 = Rare, 3 = Unique,
   * 4 = Gem, 5 = Currency, 6 = Divination Card,
   * 9 = Rune / socketable currency
   */
  frameType: number;
  icon: string;
  league?: string;
  stackSize?: number;
  maxStackSize?: number;
  corrupted?: boolean;
  duplicated?: boolean;
  properties?: PoEProperty[];
  additionalProperties?: PoEProperty[];
  requirements?: PoEProperty[];
  implicitMods?: string[];
  explicitMods?: string[];
  craftedMods?: string[];
  enchantMods?: string[];
  flavourText?: string[];
  sockets?: PoESockets[];
  socketedItems?: PoEItem[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  inventoryId?: string;
  support?: boolean;
  note?: string;
}

export interface PoECharacter {
  name: string;
  league: string;
  classId: number;
  ascendancyClass: number;
  class: string;
  level: number;
  experience: number;
}

export interface CharacterItemsResponse {
  character: PoECharacter;
  items: PoEItem[];
}

// ─── Enriched item with estimated value ──────────────────────────────────────

export interface ValuedItem extends PoEItem {
  /** Estimated value in Chaos Orbs */
  estimatedChaos: number;
  /** Name used to match against poe.ninja */
  matchedAs?: string;
  /** true when the total accounts for stack size */
  isStack: boolean;
}

export interface InventoryValuation {
  character: PoECharacter;
  items: ValuedItem[];
  totalChaos: number;
  unknownCount: number;
}

// ─── Slot labels ─────────────────────────────────────────────────────────────

export const SLOT_LABELS: Record<string, string> = {
  Weapon: "Arma Principal",
  Offhand: "Secundária",
  Helm: "Capacete",
  BodyArmour: "Peitoral",
  Gloves: "Luvas",
  Boots: "Botas",
  Amulet: "Amuleto",
  Ring: "Anel Dir.",
  Ring2: "Anel Esq.",
  Belt: "Cinto",
  Flask: "Frasco",
  Flask2: "Frasco 2",
  Flask3: "Frasco 3",
  Flask4: "Frasco 4",
  Flask5: "Frasco 5",
  PassiveJewels: "Joias",
  Trinket: "Trinket",
};

export const FRAME_LABELS: Record<number, string> = {
  0: "Normal",
  1: "Mágico",
  2: "Raro",
  3: "Único",
  4: "Gema",
  5: "Moeda",
  6: "Carta Div.",
  9: "Runa",
};
