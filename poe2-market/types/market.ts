// ─── Leagues ─────────────────────────────────────────────────────────────────
export interface League {
  id: string;
  realm: string;
  url: string;
  startAt: string;
  endAt: string | null;
  description: string;
  category: { id: string };
  rules: { id: string; name: string; description: string }[];
  registerAt: string;
  event: boolean;
  timedEvent: boolean;
  scoreEvent: boolean;
  delveEvent: boolean;
  ancestorEvent: boolean;
  labyrinthEvent: boolean;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
export interface Sparkline {
  data: (number | null)[];
  totalChange: number;
}

// ─── Currency ────────────────────────────────────────────────────────────────
export interface CurrencyLine {
  currencyTypeName: string;
  pay?: {
    id: number;
    league_id: number;
    pay_currency_id: number;
    get_currency_id: number;
    sample_time_utc: string;
    count: number;
    value: number;
    data_point_count: number;
    includes_secondary: boolean;
  };
  receive?: {
    id: number;
    league_id: number;
    pay_currency_id: number;
    get_currency_id: number;
    sample_time_utc: string;
    count: number;
    value: number;
    data_point_count: number;
    includes_secondary: boolean;
  };
  paySparkLine: Sparkline;
  receiveSparkLine: Sparkline;
  lowConfidencePaySparkLine: Sparkline;
  lowConfidenceReceiveSparkLine: Sparkline;
  chaosEquivalent: number;
  detailsId: string;
  tradeId: string;
}

export interface CurrencyDetail {
  id: number;
  icon: string;
  name: string;
  tradeId: string;
  poeTradeId?: number | null;
}

export interface CurrencyResponse {
  lines: CurrencyLine[];
  currencyDetails: CurrencyDetail[];
}

// ─── Items ────────────────────────────────────────────────────────────────────
export interface ItemLine {
  id: number;
  name: string;
  icon: string;
  mapTier?: number | null;
  levelRequired?: number | null;
  baseType?: string | null;
  stackSize?: number | null;
  variant?: string | null;
  links?: number | null;
  itemClass?: number | null;
  sparkline: Sparkline;
  lowConfidenceSparkline: Sparkline;
  implicitModifiers: Modifier[];
  explicitModifiers: Modifier[];
  flavourText?: string;
  corrupted?: boolean;
  gemLevel?: number | null;
  gemQuality?: number | null;
  itemType?: string;
  chaosValue: number;
  exaltedValue?: number;
  divineValue?: number;
  count: number;
  detailsId: string;
  listingCount?: number;
}

export interface Modifier {
  text: string;
  optional: boolean;
}

export interface ItemResponse {
  lines: ItemLine[];
}

// ─── Unified Market Item ──────────────────────────────────────────────────────
export type ItemCategory =
  | "Currency"
  | "Fragment"
  | "Rune"
  | "Omen"
  | "Divination"
  | "UniqueWeapon"
  | "UniqueArmour"
  | "UniqueAccessory"
  | "UniqueFlask"
  | "UniqueJewel"
  | "SkillGem"
  | "UniqueMap"
  | "Map";

export interface MarketItem {
  id: string;
  name: string;
  icon: string;
  chaosValue: number;
  divineValue?: number;
  change24h: number; // % change
  sparkline: (number | null)[];
  category: ItemCategory;
  count: number;
  listingCount?: number;
  corrupted?: boolean;
  gemLevel?: number | null;
  gemQuality?: number | null;
  baseType?: string | null;
  variant?: string | null;
  links?: number | null;
}

export interface CategorySummary {
  type: ItemCategory;
  label: string;
  icon: string;
  topMover: MarketItem | null;
  avgChange: number;
  itemCount: number;
  topItems: MarketItem[];
}
