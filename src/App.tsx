import { useEffect, useMemo, useState } from 'react';
import { ScreenShareController } from './components/screen-sharing/ScreenShareController';
import { ConfigurationPanel } from './components/settings/ConfigurationPanel';
import { SignalOverview } from './components/dashboard/SignalOverview';
import { buildSignalFromObservation, detectLiquidityCandidates, generateMockCandles } from './features/market-structure';
import type { MarketMode, Signal } from './types/trading';

function App() {
  const [mode, setMode] = useState<MarketMode>('forex');
  const [symbol, setSymbol] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1m');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [signal, setSignal] = useState<Signal | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Waiting for data');

  const liquidityZones = useMemo(() => {
    const candles = generateMockCandles(1.0825, 1);
    return detectLiquidityCandidates(candles);
  }, []);

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }

    const interval = window.setInterval(() => {
      const candles = generateMockCandles(Number((1.0825 + Math.random() * 0.005).toFixed(5)), Math.random());
      const observation = buildSignalFromObservation({
        instrument: symbol,
        marketType: mode,
        timeframe,
        candles,
        confidence: 0.74,
        warnings: mode === 'binary-options' ? ['This is a short expiry scenario; capture latency may materially affect interpretation.'] : ['Manual confirmation recommended if price scale is unclear.'],
      });
      setSignal(observation);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isAnalyzing, mode, symbol, timeframe]);

  const handleAnalysisRequest = ({
    symbol: incomingSymbol,
    timeframe: incomingTimeframe,
    mode: incomingMode,
    confidence,
    warnings,
  }: {
    symbol: string;
    timeframe: string;
    mode: MarketMode;
    confidence: number;
    warnings: string[];
  }) => {
    setIsAnalyzing(true);
    const candles = generateMockCandles(mode === 'forex' ? 1.0825 : 1.5, 2);
    const observation = buildSignalFromObservation({
      instrument: incomingSymbol,
      marketType: incomingMode,
      timeframe: incomingTimeframe,
      candles,
      confidence,
      warnings,
    });
    setSignal(observation);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const displayDirection = signal?.direction ?? 'NO_TRADE';

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">TradeVision AI</p>
          <h1>Chart intelligence dashboard</h1>
        </div>
        <nav className="nav">
          <a href="#">Dashboard</a>
          <a href="#">Screen Analysis</a>
          <a href="#">Liquidity Map</a>
          <a href="#">Forex Mode</a>
          <a href="#">Binary Options Mode</a>
        </nav>
      </header>

      <main className="content-grid">
        <div className="left-column">
          <ScreenShareController
            mode={mode}
            symbol={symbol}
            timeframe={timeframe}
            onAnalysis={handleAnalysisRequest}
            isAnalyzing={isAnalyzing}
          />

          <ConfigurationPanel
            mode={mode}
            symbol={symbol}
            timeframe={timeframe}
            onModeChange={setMode}
            onSymbolChange={setSymbol}
            onTimeframeChange={setTimeframe}
          >
            <div className="small-actions">
              <button type="button" onClick={() => setIsAnalyzing((value) => !value)}>
                {isAnalyzing ? 'Pause Analysis' : 'Resume Analysis'}
              </button>
              <button type="button" onClick={() => setIsAnalyzing(false)} className="secondary">
                Stop Analysis
              </button>
            </div>
          </ConfigurationPanel>
        </div>

        <div className="right-column">
          <section className="panel summary-panel">
            <div className="section-header">
              <h3>Market Summary</h3>
              <span className={`badge ${displayDirection === 'BUY' ? 'buy' : displayDirection === 'SELL' ? 'sell' : 'neutral'}`}>
                {displayDirection}
              </span>
            </div>

            <div className="metrics-grid">
              <div>
                <span>Mode</span>
                <strong>{mode}</strong>
              </div>
              <div>
                <span>Symbol</span>
                <strong>{symbol}</strong>
              </div>
              <div>
                <span>Timeframe</span>
                <strong>{timeframe}</strong>
              </div>
              <div>
                <span>Last Analysis</span>
                <strong>{lastUpdated}</strong>
              </div>
            </div>
          </section>

          <SignalOverview signal={signal} />

          <section className="panel">
            <div className="section-header">
              <h3>Liquidity Map</h3>
            </div>
            <ul className="liquidity-list">
              {liquidityZones.map((zone) => (
                <li key={`${zone.type}-${zone.timestamp}`}>
                  <span>{zone.type}</span>
                  <strong>{zone.priceMin?.toFixed(5)} → {zone.priceMax?.toFixed(5)}</strong>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
