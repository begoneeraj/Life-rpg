import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CharacterAvatar from '../components/character/CharacterAvatar';

/**
 * AuthShell — the shared "game entrance" frame for /login and /signup.
 *
 * Composition, top to bottom:
 *   1. Title-screen brand: ⚔ LIFE RPG + tagline, gold display treatment.
 *   2. Decorative default-gear adventurer beside the panel (desktop only,
 *      aria-hidden — it previews the character creator, it is NOT the
 *      player's avatar, which doesn't exist before login).
 *   3. The page's form rendered inside a gold game-panel with pixel
 *      corner ornaments and a rune divider.
 *
 * Staged entrance (brand → avatar → panel) is quick (~0.45s total) and
 * collapses to instant appearance under prefers-reduced-motion via the
 * global duration clamp in index.css.
 *
 * NOTE: purely presentational — no auth logic lives here.
 */

// Staggered entrance choreography (fast, professional, no bouncing).
const ease = [0.22, 1, 0.36, 1];
const brandMotion = { initial: { opacity: 0, y: -14 }, animate: { opacity: 1, y: 0 } };
const avatarMotion = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };
const panelMotion = { initial: { opacity: 0, y: 18, scale: 0.985 }, animate: { opacity: 1, y: 0, scale: 1 } };

export default function AuthShell({ icon, title, subtitle, children, footer }) {
  return (
    <div className="auth-force-dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* --- Title screen brand --- */}
      <motion.div
        {...brandMotion}
        transition={{ duration: 0.45, ease }}
        className="mb-6 flex flex-col items-center text-center sm:mb-8"
      >
        <span
          aria-hidden="true"
          className="text-3xl drop-shadow-[0_0_14px_rgba(232,200,116,0.55)] sm:text-4xl"
        >
          ⚔️
        </span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-[0.12em] text-gold-400 drop-shadow-[0_0_18px_rgba(212,175,55,0.35)] sm:text-5xl">
          LIFE RPG
        </h1>
        <div className="mt-2 flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-600/70 sm:w-16" />
          <span className="font-hud text-[10px] uppercase tracking-[0.35em] text-parchment-300/70 sm:text-[11px]">
            Turn your life into an adventure
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-600/70 sm:w-16" />
        </div>
      </motion.div>

      {/* --- Panel + decorative adventurer row --- */}
      <div className="relative flex w-full max-w-md items-stretch justify-center gap-6">
        {/* Decorative avatar (desktop only): a default-gear adventurer that
            hints at the character creator. Purely decorative — aria-hidden,
            non-focusable, absolutely positioned so it never affects form
            layout or pushes the panel on any screen size. */}
        <motion.div
          {...avatarMotion}
          transition={{ duration: 0.5, delay: 0.12, ease }}
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 bottom-0 hidden w-32 select-none opacity-90 lg:block"
        >
          <div className="relative">
            <div
              className="absolute inset-x-2 bottom-0 h-40 rounded-full bg-mystic-500/10 blur-2xl"
              aria-hidden="true"
            />
            <CharacterAvatar
              gender="female"
              physique="athletic"
              skinTone="tan"
              faceType="confident"
              eyeColor="glacial_blue"
              hairStyle="ponytail"
              hairColor="dark_brown"
              facialHair="clean_shaven"
              skinDetail="none"
              equippedTop={{ svgKey: 'top_leather_jacket' }}
              equippedBottom={{ svgKey: 'bottom_cargo_pants' }}
              equippedShoes={{ svgKey: 'shoes_combat_boots' }}
              level={12}
              idle
              className="h-80 w-auto"
            />
          </div>
        </motion.div>

        {/* --- The game panel --- */}
        <motion.div
          {...panelMotion}
          transition={{ duration: 0.5, delay: 0.06, ease }}
          className="game-panel game-panel-gold hud-frame relative z-10 w-full max-w-md px-6 py-8 sm:px-8"
        >
          {/* Panel header */}
          <div className="mb-6 text-center">
            <span aria-hidden="true" className="text-3xl">
              {icon}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-wide text-gold-400 sm:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-parchment-300/70">{subtitle}</p>}
            {/* Rune divider: gold line with a centered diamond marker. */}
            <div className="mt-4 flex items-center gap-2" aria-hidden="true">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-dungeon-500 to-dungeon-500" />
              <span className="text-[9px] text-gold-600/80">◆</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-dungeon-500 to-dungeon-500" />
            </div>
          </div>

          {children}
        </motion.div>
      </div>

      {/* --- Below-panel footer (cross-links between login/signup) --- */}
      {footer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          className="relative z-10 mt-6"
        >
          {footer}
        </motion.div>
      )}

      {/* Bottom quest-marker flourish */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        aria-hidden="true"
        className="font-hud pointer-events-none mt-6 select-none text-[10px] uppercase tracking-[0.4em] text-parchment-300/40"
      >
        ⚔ Your adventure awaits
      </motion.p>
    </div>
  );
}

/** Shared cross-link row so Login/Signup feel like two screens of one game. */
export function AuthSwitchLink({ prompt, to, linkText }) {
  return (
    <p className="text-center text-sm text-parchment-300/70">
      {prompt}{' '}
      <Link to={to} className="font-semibold text-mystic-400 transition-colors hover:text-mystic-300 hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
