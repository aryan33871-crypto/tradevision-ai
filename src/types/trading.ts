export type MarketMode = 'binary-options' | 'forex';
export type SignalDirection = 'BUY' | 'SELL' | 'NO_TRADE' | 'DATA_UNAVAILABLE';
export type SignalStatus = 'ACTIVE' | 'EXPIRED' | 'INVALIDATED' | 'NO_TRADE';
export type CandleDirection = 'bullish' | 'bearish' | 'doji';

export interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
  timestamp: string;
}

export interface DataQuality {
  symbol: boolean;
  timeframe: boolean;
  currentPrice: boolean;
  candles: boolean;
  sourceType: boolean;
  confidence: number;
  warnings: string[];
}

export interface LiquidityZone {
  type: string;
  priceMin: number | null;
  priceMax: number | null;
  timestamp: string;
  timeframe: string;
  confidence: number;
  reason: string;
  invalidation: string;
}

export interface SignalEvidence {
  label: string;
  value: string;
  weight: number;
}

export interface Signal {
  signalId: string;
  instrument: string;
  marketType: MarketMode;
  timeframe: string;
  direction: SignalDirection;
  status: SignalStatus;
  generatedAt: string;
  referencePrice: number | null;
  entryZone: [number | null, number | null] | null;
  invalidationLevel: number | null;
  stopLoss: number | null;
  takeProfitLevels: Array<number | null>;
  riskRewardRatio: number | null;
  confidenceScore: number;
  evidence: SignalEvidence[];
  warnings: string[];
  dataQuality: DataQuality;
  expiresAt: string;
}
