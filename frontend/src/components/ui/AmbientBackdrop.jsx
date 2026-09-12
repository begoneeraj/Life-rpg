/**
 * AmbientBackdrop — full-viewport decorative atmosphere layer.
 *
 * A faint, ultra-slow-drifting star/dust field (two parallaxed dot layers
 * via one CSS animation) plus two fixed torch-glow gradients. Pure CSS,
 * no assets, `pointer-events-none` so it never intercepts input, and it
 * sits behind all content (z-0) — content renders above it.
 *
 * Reduced motion: the drift animation is disabled globally by the
 * prefers-reduced-motion block in index.css (durations collapse to ~0),
 * leaving a static, still-pleasant dust field.
 *
 * Mount ONCE, at the app root (App.jsx wraps routes with it).
 */
export default function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 animate-ambientDrift"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgb(var(--c-ambient-a) / 0.14) 1px, transparent 0),' +
          'radial-gradient(circle at 1px 1px, rgb(var(--c-ambient-b) / 0.16) 1px, transparent 0)',
        backgroundSize: '120px 120px, 200px 200px',
        backgroundPosition: '0 0, 0 0',
        opacity: 0.5,
      }}
    />
  );
}
