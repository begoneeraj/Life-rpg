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
        dungeon: {
          950: '#0a0714',
          900: '#0f0a1e',
          850: '#151027',
          800: '#1c1533',
          700: '#2a2149',
          600: '#3b2e66',
          500: '#4f3f85',
        },
        parchment: {
          100: '#f5ecd7',
          200: '#e9dbb8',
          300: '#dcc699',
        },
        gold: {
          300: '#f3d98a',
          400: '#e8c874',
          500: '#d4af37',
          600: '#b8912a',
        },
        ember: {
          400: '#ff8a5c',
          500: '#ff6b3d',
          600: '#e0501f',
        },
        mystic: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // Rare-tier azure (RARITY_STYLES previously reused mystic for "rare").
        azure: {
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        xp: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
      boxShadow: {
        glow: '0 0 12px rgba(232, 200, 116, 0.55), 0 0 2px rgba(232, 200, 116, 0.9)',
        'glow-mystic': '0 0 14px rgba(139, 92, 246, 0.55)',
        'glow-xp': '0 0 10px rgba(34, 197, 94, 0.65)',
        card: '0 4px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
        // Raised state for interactive cards (hover elevation).
        'card-lg': '0 12px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,200,116,0.08)',
      },
      backgroundImage: {
        'dungeon-grid':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.045) 1px, transparent 0)',
        parchment:
          'linear-gradient(180deg, rgba(245,236,215,0.06), rgba(245,236,215,0.02))',
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
