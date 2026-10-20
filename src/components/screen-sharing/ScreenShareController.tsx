import { useEffect, useRef, useState } from 'react';
import type { MarketMode } from '../../types/trading';

interface ScreenShareControllerProps {
  mode: MarketMode;
  symbol: string;
  timeframe: string;
  onAnalysis: (payload: {
    symbol: string;
    timeframe: string;
    mode: MarketMode;
    confidence: number;
    warnings: string[];
  }) => void;
  isAnalyzing: boolean;
}

export function ScreenShareController({ mode, symbol, timeframe, onAnalysis, isAnalyzing }: ScreenShareControllerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setIsSupported(false);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => undefined);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleStartSharing = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setError('Screen sharing is not supported in this browser.');
      setIsSupported(false);
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      mediaStream.getVideoTracks()[0].onended = () => {
        setStream(null);
        setError('Screen sharing was stopped by the browser or user.');
      };

      setStream(mediaStream);
      setError(null);
    } catch (err) {
      setError('Permission was denied or screen selection was cancelled.');
    }
  };

  const handleStopSharing = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
  };

  const handleRunAnalysis = () => {
    onAnalysis({
      symbol,
      timeframe,
      mode,
      confidence: 0.74,
      warnings: ['Chart recognition should be manually confirmed when the symbol or timeframe is uncertain.'],
    });
  };

  return (
    <section className="panel">
      <div className="section-header">
        <h3>Screen Analysis</h3>
        <span className={`badge ${isAnalyzing ? 'active' : ''}`}>{isAnalyzing ? 'Analyzing' : 'Idle'}</span>
      </div>

      <p className="muted">
        Screen sharing lets the app inspect a chart you choose. It does not grant broad access to your computer, and browser permissions control the exact tab, window, or screen that is shared.
      </p>

      {!isSupported && (
        <div className="notice warning">This browser does not support the required screen capture API.</div>
      )}

      {error && <div className="notice warning">{error}</div>}

      <div className="button-row">
        <button className="primary" onClick={handleStartSharing} type="button">
          Start Sharing
        </button>
        <button onClick={handleRunAnalysis} type="button" disabled={!stream}>
          Start Analysis
        </button>
      </div>

      <div className="button-row">
        <button type="button" disabled={!stream}>Pause Analysis</button>
        <button type="button" disabled={!stream}>Resume Analysis</button>
        <button className="secondary" type="button" onClick={handleStopSharing}>
          Stop Sharing
        </button>
      </div>

      <div className="preview-shell">
        {stream ? (
          <video ref={videoRef} className="preview-video" autoPlay muted playsInline />
        ) : (
          <div className="preview-placeholder">No active screen share</div>
        )}
      </div>
    </section>
  );
}
