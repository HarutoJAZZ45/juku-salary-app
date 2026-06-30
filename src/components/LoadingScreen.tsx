import './LoadingScreen.css';

export function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <span className="loading-screen-label">Loading...</span>
    </div>
  );
}
