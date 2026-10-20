import type { Candle, CandleDirection, MarketMode, Signal, SignalDirection, SignalStatus } from '../types/trading';

export function getCandleDirection(candle: Candle): CandleDirection {
  const body = Math.abs(candle.close - candle.open);
  if (body < 0.0001) {
    return 'doji';
  }
  return candle.close >= candle.open ? 'bullish' : 'bearish';
}

export function classifyTrend(candles: Candle[]): 'bullish' | 'bearish' | 'consolidation' {
  if (candles.length < 5) {
    return 'consolidation';
  }

  let upTicks = 0;
  let downTicks = 0;

  for (let i = 1; i < candles.length; i += 1) {
    const previous = candles[i - 1];
    const current = candles[i];
    if (current.close > previous.close) {
      upTicks += 1;
    } else if (current.close < previous.close) {
      downTicks += 1;
    }
  }

  if (upTicks > downTicks + 1) {
    return 'bullish';
  }

  if (downTicks > upTicks + 1) {
    return 'bearish';
  }

  return 'consolidation';
}

export function detectSwingLevels(candles: Candle[]): { recentHigh: number; recentLow: number } {
  if (!candles.length) {
    return { recentHigh: 0, recentLow: 0 };
  }

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);

  return {
    recentHigh: Math.max(...highs),
    recentLow: Math.min(...lows),
  };
}

export function estimateVolatility(candles: Candle[]): number {
  if (!candles.length) {
    return 0;
  }

  const ranges = candles.map((c) => Math.abs(c.high - c.low));
  return ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
}

export function detectSupportResistance(candles: Candle[]): { support: number; resistance: number } {
  if (!candles.length) {
    return { support: 0, resistance: 0 };
  }

  const recent = candles.slice(-12);
  const support = Math.min(...recent.map((c) => c.low));
  const resistance = Math.max(...recent.map((c) => c.high));

  return { support, resistance };
}

export function detectLiquidityCandidates(candles: Candle[]) {
  const { support, resistance } = detectSupportResistance(candles);
  const { recentHigh, recentLow } = detectSwingLevels(candles);

  return [
    {
      type: 'sell-side liquidity',
      priceMin: recentLow,
      priceMax: recentLow + Math.max(estimateVolatility(candles) * 0.7, 0.0005),
      timestamp: new Date().toISOString(),
      timeframe: '1m',
      confidence: 0.7,
      reason: 'Recent swing low plus volatility expansion',
      invalidation: 'Break above recent low',
    },
    {
      type: 'buy-side liquidity',
      priceMin: recentHigh - Math.max(estimateVolatility(candles) * 0.7, 0.0005),
      priceMax: recentHigh,
      timestamp: new Date().toISOString(),
      timeframe: '1m',
      confidence: 0.68,
      reason: 'Recent swing high and liquidity cluster',
      invalidation: 'Break below recent high',
    },
    {
      type: 'support zone',
      priceMin: support,
      priceMax: support + Math.max(estimateVolatility(candles) * 0.5, 0.0004),
      timestamp: new Date().toISOString(),
      timeframe: '1m',
      confidence: 0.65,
      reason: 'Observed support band from recent candles',
      invalidation: 'Close below support band',
    },
    {
      type: 'resistance zone',
      priceMin: resistance - Math.max(estimateVolatility(candles) * 0.5, 0.0004),
      priceMax: resistance,
      timestamp: new Date().toISOString(),
      timeframe: '1m',
      confidence: 0.65,
      reason: 'Observed resistance band from recent candles',
      invalidation: 'Close above resistance band',
    },
  ];
}

export function generateMockCandles(basePrice: number, offset = 0): Candle[] {
  const candles: Candle[] = [];
  let current = basePrice;

  for (let i = 0; i < 14; i += 1) {
    const drift = Math.sin((i + offset) / 2.1) * 0.002;
    const open = current;
    const close = open + drift + (Math.random() - 0.5) * 0.004;
    const high = Math.max(open, close) + Math.random() * 0.003;
    const low = Math.min(open, close) - Math.random() * 0.003;
    candles.push({
      open: Number(open.toFixed(5)),
      close: Number(close.toFixed(5)),
      high: Number(high.toFixed(5)),
      low: Number(low.toFixed(5)),
      timestamp: new Date(Date.now() - (13 - i) * 60000).toISOString(),
    });
    current = close;
  }

  return candles;
}

export function buildSignalFromObservation(input: {
  instrument: string;
  marketType: MarketMode;
  timeframe: string;
  candles: Candle[];
  confidence?: number;
  warnings?: string[];
}): Signal {
  const qualityScore = input.confidence ?? 0.72;
  const trend = classifyTrend(input.candles);
  const { support, resistance } = detectSupportResistance(input.candles);
  const recent = detectSwingLevels(input.candles);
  const direction: SignalDirection =
    qualityScore < 0.55 ? 'DATA_UNAVAILABLE' : trend === 'bullish' ? 'BUY' : trend === 'bearish' ? 'SELL' : 'NO_TRADE';

  const signalStatus: SignalStatus = direction === 'NO_TRADE' || direction === 'DATA_UNAVAILABLE' ? 'NO_TRADE' : 'ACTIVE';
  const referencePrice = input.candles[input.candles.length - 1]?.close ?? null;
  const entryZone = direction === 'BUY'
    ? [referencePrice != null ? referencePrice - 0.0008 : null, referencePrice != null ? referencePrice + 0.0008 : null]
    : direction === 'SELL'
      ? [referencePrice != null ? referencePrice - 0.0008 : null, referencePrice != null ? referencePrice + 0.0008 : null]
      : null;

  const invalidationLevel = direction === 'BUY' ? support : direction === 'SELL' ? resistance : null;
  const stopLoss = direction === 'BUY' ? support : direction === 'SELL' ? resistance : null;
  const takeProfitLevels = direction === 'BUY'
    ? [referencePrice != null ? referencePrice + (resistance - referencePrice) * 1.8 : null]
    : direction === 'SELL'
      ? [referencePrice != null ? referencePrice - (referencePrice - support) * 1.8 : null]
      : [null];

  const evidence = [
    { label: 'Trend', value: trend, weight: 0.7 },
    { label: 'Support', value: support.toFixed(5), weight: 0.55 },
    { label: 'Resistance', value: resistance.toFixed(5), weight: 0.55 },
  ];

  return {
    signalId: `sig-${Date.now()}`,
    instrument: input.instrument,
    marketType: input.marketType,
    timeframe: input.timeframe,
    direction,
    status: signalStatus,
    generatedAt: new Date().toISOString(),
    referencePrice,
    entryZone,
    invalidationLevel,
    stopLoss,
    takeProfitLevels,
    riskRewardRatio: referencePrice && stopLoss ? Number(((Math.abs(referencePrice - stopLoss)) / (Math.max(Math.abs(referencePrice - (takeProfitLevels[0] ?? referencePrice)), 0.0001))).toFixed(2)) : null,
    confidenceScore: Number(Math.max(0.15, Math.min(0.97, qualityScore)).toFixed(2)),
    evidence,
    warnings: input.warnings ?? ['Data is chart-derived and should be treated as an estimate, not a confirmed broker feed.'],
    dataQuality: {
      symbol: Boolean(input.instrument),
      timeframe: Boolean(input.timeframe),
      currentPrice: referencePrice != null,
      candles: input.candles.length >= 5,
      sourceType: true,
      confidence: qualityScore,
      warnings: input.warnings ?? ['Uncertain chart recognition may require manual confirmation.'],
    },
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}
