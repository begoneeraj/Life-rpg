/**
 * Life RPG — R1 theme architecture.
 *
 * Every palette color is a CSS-variable channel triplet (`R G B`) resolved
 * with <alpha-value>, so `bg-dungeon-850/80`, `text-parchment-100`, etc.
 * keep working exactly as before — but now resolve differently per theme.
 *
 * Dark values (:root)  = the established dungeon palette.
 * Light values (html[data-theme='light']) = "Adventurer's Compendium":
 * warm parchment surfaces, ink text, bronze accents. See index.css.
 *
 * Components never reference literals — they keep using the same
 * dungeon/parchment/gold/… classes and theme automatically.
 */
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Structure surfaces (page bg → panel → elevated → borders).
        dungeon: {
          950: v('dungeon-950'),
          900: v('dungeon-900'),
          850: v('dungeon-850'),
          800: v('dungeon-800'),
          700: v('dungeon-700'),
          600: v('dungeon-600'),
          500: v('dungeon-500'),
        },
        // Text ramp (primary → secondary → muted).
        parchment: {
          100: v('parchment-100'),
          200: v('parchment-200'),
          300: v('parchment-300'),
        },
        gold: {
          300: v('gold-300'),
          400: v('gold-400'),
          500: v('gold-500'),
          600: v('gold-600'),
        },
        ember: {
          400: v('ember-400'),
          500: v('ember-500'),
          600: v('ember-600'),
        },
        mystic: {
          400: v('mystic-400'),
          500: v('mystic-500'),
          600: v('mystic-600'),
        },
        // Rare-tier azure (RARITY_STYLES previously reused mystic for "rare").
        azure: {
          400: v('azure-400'),
          500: v('azure-500'),
        },
        xp: {
          400: v('xp-400'),
          500: v('xp-500'),
          600: v('xp-600'),
        },
      },
      boxShadow: {
        // Glows resolve through channel vars so they stay tasteful in light mode.
        glow: '0 0 12px rgb(var(--c-glow-gold) / 0.55), 0 0 2px rgb(var(--c-glow-gold) / 0.9)',
        'glow-mystic': '0 0 14px rgb(var(--c-glow-mystic) / 0.55)',
        'glow-xp': '0 0 10px rgb(var(--c-glow-xp) / 0.65)',
        card: 'var(--shadow-panel)',
        // Raised state for interactive cards (hover elevation).
        'card-lg': 'var(--shadow-panel-lg)',
      },
      backgroundImage: {
        'dungeon-grid':
          'radial-gradient(circle at 1px 1px, rgb(var(--c-grid-dot) / 0.5) 1px, transparent 0)',
        parchment:
          'linear-gradient(180deg, rgb(var(--c-parchment-100) / 0.06), rgb(var(--c-parchment-100) / 0.02))',
      },
      backgroundSize: {
        grid: '22px 22px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        // Ambient backdrop: slow diagonal drift of the star field.
        ambientDrift: {
          '0%': { backgroundPosition: '0 0, 0 0' },
          '100%': { backgroundPosition: '240px 120px, -180px -90px' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        floatUp: 'floatUp 1.2s ease-out forwards',
        flicker: 'flicker 2.4s ease-in-out infinite',
        // Slow enough to be atmosphere, not distraction; paused entirely under
        // prefers-reduced-motion via index.css.
        ambientDrift: 'ambientDrift 90s linear infinite',
      },
    },
  },
  plugins: [],
};
