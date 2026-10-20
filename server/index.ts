import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { buildSignalFromObservation, generateMockCandles } from '../src/features/market-structure';

const app = express();
const port = Number(process.env.PORT ?? 3001);

const analysisRequestSchema = z.object({
  symbol: z.string().default('EUR/USD'),
  timeframe: z.string().default('1m'),
  mode: z.enum(['forex', 'binary-options']).default('forex'),
  confidence: z.number().min(0).max(1).default(0.72),
  warnings: z.array(z.string()).default([]),
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TradeVision AI API',
    version: '0.1.0',
    mode: 'analysis-only',
  });
});

app.post('/api/analysis', (req, res) => {
  const parsed = analysisRequestSchema.safeParse(req.body ?? {});
  const payload = parsed.success ? parsed.data : analysisRequestSchema.parse({});

  const basePrice = payload.mode === 'forex' ? 1.0825 : 1.5;
  const candles = generateMockCandles(basePrice, payload.timeframe.length);
  const signal = buildSignalFromObservation({
    instrument: payload.symbol,
    marketType: payload.mode,
    timeframe: payload.timeframe,
    candles,
    confidence: payload.confidence,
    warnings: payload.warnings.length ? payload.warnings : [
      'Chart recognition is local and should be treated as an estimate unless manually confirmed.',
    ],
  });

  res.json({ signal, generatedAt: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`TradeVision AI API listening on http://localhost:${port}`);
});
