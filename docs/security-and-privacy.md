# Security and Privacy

TradeVision AI is designed as a local chart-analysis assistant. It does not require broker credentials or remote AI services to function.

## Privacy principles
- No fullscreen or screen-share capture is uploaded by default.
- Screen-share access is explicit and browser-controlled.
- Users must approve screen-sharing permission before any stream is captured.
- Shared-screen videos are used only within the browser session and are not retained unless the user intentionally exports them.

## Security expectations
- Never attempt to bypass browser or OS-level restrictions.
- Do not assume any privileged access to the user's machine beyond the selected display share.
- Validate all API inputs using runtime schemas.
- Treat all chart-derived values as estimates, not official market-feed data.

## Data handling
- The app should avoid persisting frame images or private screen content unless a clear opt-in exists.
- When analysis is required, prefer local heuristics and small metadata payloads rather than uploading raw pixels.
