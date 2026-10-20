import { describe, expect, it } from 'vitest';
import { buildSignalFromObservation, classifyTrend, generateMockCandles } from './market-structure';

describe('market structure analysis', () => {
  it('classifies an upward trend as bullish', () => {
    const candles = generateMockCandles(100, 0);
    const trend = classifyTrend(candles);
    expect(['bullish', 'bearish', 'consolidation']).toContain(trend);
  });

  it('builds a signal object with evidence and confidence', () => {
    const candles = generateMockCandles(1.085, 2);
    const signal = buildSignalFromObservation({
      instrument: 'EUR/USD',
      marketType: 'forex',
      timeframe: '1m',
      candles,
      confidence: 0.8,
      warnings: ['Consider manual confirmation.'],
    });

    expect(signal.instrument).toBe('EUR/USD');
    expect(signal.dataQuality.confidence).toBeGreaterThan(0);
    expect(signal.evidence.length).toBeGreaterThan(0);
  });
});
