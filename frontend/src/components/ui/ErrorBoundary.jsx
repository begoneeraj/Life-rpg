import { Component } from 'react';
import Icon from './icons';

/**
 * F0.1 — Global React Error Boundary.
 *
 * Class component is required here: React only supports getDerivedStateFromError /
 * componentDidCatch in class components (no hook equivalent exists).
 *
 * Catches *render-time* errors anywhere below it in the tree (not event handlers,
 * not async callbacks — those have their own paths via try/catch + toasts).
 *
 * Normal operation is untouched: when no error occurs, this renders
 * `children` with zero extra DOM, styling, or re-render cost.
 *
 * Reuses the existing design system from index.css (parchment-card,
 * btn-primary, font-display, dungeon/parchment/gold palette) — no new
 * design language, no index.css changes.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Render the fallback on the next pass. Never store the raw error in
    // state so nothing technical can leak into the user-facing UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Dev-only diagnostics: full error + component stack in the console.
    // Users never see any of this (the fallback is a friendly screen only).
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] A render error was caught:', error, errorInfo);
    }
  }

  handleReload = () => {
    // Full remount clears the broken tree; sessionStorage data (game state)
    // is server-backed, so nothing is lost.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen items-center justify-center px-4 py-12"
          role="alert"
          aria-live="assertive"
        >
          <div className="parchment-card w-full max-w-md p-8 text-center">
            <div className="mb-6 flex items-center justify-center gap-2">
              <Icon name="sword" className="h-6 w-6 text-gold-400" />
              <h1 className="font-display text-2xl font-bold text-gold-400">Life RPG</h1>
            </div>

            <span
              aria-hidden="true"
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dungeon-500 bg-dungeon-900 text-parchment-300/80"
            >
              <Icon name="armory" className="h-8 w-8" />
            </span>
            <h2 className="mt-3 font-display text-xl font-bold text-parchment-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-parchment-300/70">
              An unexpected error interrupted your quest. Your progress is safe —
              reload to return to your journey.
            </p>

            <button type="button" className="btn-primary mt-6 w-full" onClick={this.handleReload}>
              Reload the Realm
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
