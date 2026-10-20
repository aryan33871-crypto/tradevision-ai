import type { ReactNode } from 'react';
import type { MarketMode } from '../../types/trading';

interface ConfigurationPanelProps {
  mode: MarketMode;
  symbol: string;
  timeframe: string;
  onModeChange: (mode: MarketMode) => void;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  children?: ReactNode;
}

export function ConfigurationPanel({
  mode,
  symbol,
  timeframe,
  onModeChange,
  onSymbolChange,
  onTimeframeChange,
  children,
}: ConfigurationPanelProps) {
  return (
    <section className="panel">
      <div className="section-header">
        <h3>Analysis Configuration</h3>
      </div>

      <div className="config-grid">
        <label>
          Market Mode
          <select value={mode} onChange={(event) => onModeChange(event.target.value as MarketMode)}>
            <option value="forex">Forex</option>
            <option value="binary-options">Binary Options</option>
          </select>
        </label>

        <label>
          Symbol
          <input value={symbol} onChange={(event) => onSymbolChange(event.target.value)} />
        </label>

        <label>
          Timeframe
          <input value={timeframe} onChange={(event) => onTimeframeChange(event.target.value)} />
        </label>
      </div>

      {children}
    </section>
  );
}
