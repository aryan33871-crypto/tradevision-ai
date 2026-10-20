import type { Signal } from '../../types/trading';

interface SignalOverviewProps {
  signal: Signal | null;
}

export function SignalOverview({ signal }: SignalOverviewProps) {
  if (!signal) {
    return <section className="panel empty-state">No signal generated yet.</section>;
  }

  const badgeClass = signal.direction === 'BUY' ? 'buy' : signal.direction === 'SELL' ? 'sell' : 'neutral';

  return (
    <section className="panel signal-box">
      <div className="section-header">
        <h3>Latest Analysis</h3>
        <span className={`badge ${badgeClass}`}>{signal.direction}</span>
      </div>

      <div className="stats-grid">
        <div>
          <span>Instrument</span>
          <strong>{signal.instrument}</strong>
        </div>
        <div>
          <span>Timeframe</span>
          <strong>{signal.timeframe}</strong>
        </div>
        <div>
          <span>Reference Price</span>
          <strong>{signal.referencePrice ?? 'N/A'}</strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{signal.confidenceScore}</strong>
        </div>
      </div>

      <div className="risk-grid">
        <div>
          <span>Entry Zone</span>
          <strong>{signal.entryZone ? `${signal.entryZone[0]} → ${signal.entryZone[1]}` : 'N/A'}</strong>
        </div>
        <div>
          <span>Stop</span>
          <strong>{signal.stopLoss ?? 'N/A'}</strong>
        </div>
        <div>
          <span>Invalidation</span>
          <strong>{signal.invalidationLevel ?? 'N/A'}</strong>
        </div>
        <div>
          <span>R/R</span>
          <strong>{signal.riskRewardRatio ?? 'N/A'}</strong>
        </div>
      </div>

      <ul className="evidence-list">
        {signal.evidence.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
