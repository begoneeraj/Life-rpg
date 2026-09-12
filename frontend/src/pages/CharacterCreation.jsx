import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import CharacterStage from '../components/character/CharacterStage';
import SlotIcon from '../components/character/characterIcons';
import {
  GENDERS,
  PHYSIQUE_BY_GENDER,
  SKIN_TONES,
  FACE_TYPES_BY_GENDER,
  EYE_COLORS,
  HAIR_STYLES_BY_GENDER,
  HAIR_COLORS,
  FACIAL_HAIR_OPTIONS,
  SKIN_DETAILS,
} from '../components/character/constants';
import {
  OptionChip,
  Swatch,
  SectionTitle,
  PixelCorners,
  GlassPanel,
} from '../components/character/characterUI';

/**
 * Life RPG — Character Forge.
 *
 * Same data contract as before (createCharacter with the validated enums,
 * rotation state, one-time submit) — only the presentation changed.
 * Tabs read as game customization categories; selected options get gold +
 * pixel corners + glow; level-locked hairstyles show their real unlock
 * level (creation-time level is 1, so locked chips are informative, not
 * dead ends — they unlock later in the Armory / level flow).
 */

const TABS = [
  { id: 'identity', label: 'Identity', icon: 'profile' },
  { id: 'face', label: 'Head & Face', icon: 'character' },
  { id: 'hair', label: 'Hair', icon: 'spark' },
];

// The shared ui icon set is nav-oriented; map tab icons to SlotIcon fallbacks.
const TAB_ICONS = { identity: 'head', face: 'head', hair: 'spark' };

export default function CharacterCreation() {
  const createCharacter = useStore((s) => s.createCharacter);
  const navigate = useNavigate();

  const [tab, setTab] = useState('identity');
  const [gender, setGender] = useState('male');
  const [physique, setPhysique] = useState('athletic');
  const [skinTone, setSkinTone] = useState('medium');
  const [faceType, setFaceType] = useState(FACE_TYPES_BY_GENDER.male[0].value);
  const [eyeColor, setEyeColor] = useState('espresso_brown');
  const [hairStyle, setHairStyle] = useState(HAIR_STYLES_BY_GENDER.male[0].value);
  const [hairColor, setHairColor] = useState('black');
  const [facialHair, setFacialHair] = useState('clean_shaven');
  const [skinDetail, setSkinDetail] = useState('none');
  const [rotation, setRotation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faceOptions = FACE_TYPES_BY_GENDER[gender];
  const physiqueOptions = PHYSIQUE_BY_GENDER[gender];
  // All hairstyles stay visible so the locked ones read as future unlocks;
  // creation happens at level 1, so only unlockLevel-free ones are active.
  const hairOptions = useMemo(() => HAIR_STYLES_BY_GENDER[gender], [gender]);

  // Preview draft object shaped like the saved character so CharacterStage
  // can present it with starter garments (visual only — nothing persisted).
  const previewCharacter = {
    gender,
    physique,
    skinTone,
    faceType,
    eyeColor,
    hairStyle,
    hairColor,
    facialHair: gender === 'male' ? facialHair : 'clean_shaven',
    skinDetail,
    level: 1,
  };
  const equipped = {
    top: { svgKey: 'top_basic_tee' },
    bottom: { svgKey: 'bottom_basic_pants' },
    shoes: { svgKey: 'shoes_basic' },
  };

  function handleGenderChange(next) {
    setGender(next);
    setPhysique(PHYSIQUE_BY_GENDER[next][1].value);
    setFaceType(FACE_TYPES_BY_GENDER[next][0].value);
    setHairStyle(HAIR_STYLES_BY_GENDER[next][0].value);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await createCharacter({
        gender,
        physique,
        skinTone,
        faceType,
        eyeColor,
        hairStyle,
        hairColor,
        facialHair: gender === 'male' ? facialHair : 'clean_shaven',
        skinDetail,
      });
      navigate('/character', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create your character. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepMeta = TABS.findIndex((t) => t.id === tab);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-[1440px] flex-col gap-5 px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:items-stretch">
      {/* -------- the forge stage -------- */}
      <div className="relative min-h-[420px] lg:col-span-5">
        <CharacterStage
          character={previewCharacter}
          equipped={equipped}
          level={1}
          rotation={rotation}
          blur={12}
          className="absolute inset-0"
        >
          {/* rotate controls — ◀ ROTATE ▶ */}
          <div className="relative z-10 flex items-center justify-center gap-3 border-t border-dungeon-600/40 bg-dungeon-950/45 px-4 py-2.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRotation((r) => Math.max(-45, r - 15))}
              aria-label="Rotate left"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dungeon-500 bg-dungeon-900 text-gold-400 transition-all hover:border-gold-400 hover:shadow-glow active:translate-y-px"
            >
              <SlotIcon name="chevronLeft" className="h-4 w-4" />
            </button>
            <span className="font-hud text-[10px] uppercase tracking-[0.3em] text-parchment-300/60">
              Rotate
            </span>
            <button
              type="button"
              onClick={() => setRotation((r) => Math.min(45, r + 15))}
              aria-label="Rotate right"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dungeon-500 bg-dungeon-900 text-gold-400 transition-all hover:border-gold-400 hover:shadow-glow active:translate-y-px"
            >
              <SlotIcon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </CharacterStage>
      </div>

      {/* -------- customization console -------- */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="lg:col-span-7"
      >
        <GlassPanel className="flex h-full flex-col gap-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-hud text-[10px] uppercase tracking-[0.32em] text-mystic-300/80">
                Character Forge
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-wide text-gold-400 sm:text-4xl">
                CREATE YOUR HERO
              </h1>
              <p className="mt-1 text-sm text-parchment-300/70">
                This face stays with you for the whole journey. Choose wisely.
              </p>
            </div>
            {/* forge step pips */}
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {TABS.map((t, i) => (
                <span
                  key={t.id}
                  className={`h-2 w-2 ${i <= stepMeta ? 'bg-gold-400' : 'bg-dungeon-600'}`}
                  style={i <= stepMeta ? { boxShadow: '0 0 6px rgb(var(--c-glow-gold) / 0.6)' } : undefined}
                />
              ))}
            </span>
          </div>

          {/* category tabs */}
          <div role="tablist" aria-label="Customization categories" className="grid grid-cols-3 gap-2">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 font-hud text-[11px] uppercase tracking-[0.18em] transition-all duration-150 ${
                    active
                      ? 'border-gold-500 bg-gold-500/10 text-gold-300 shadow-glow'
                      : 'border-dungeon-600 bg-dungeon-900/70 text-parchment-300/60 hover:border-mystic-500/70 hover:text-parchment-200'
                  }`}
                >
                  {active && <PixelCorners size={7} />}
                  <SlotIcon name={TAB_ICONS[t.id]} className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* panels */}
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {tab === 'identity' && (
              <motion.div key="identity" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                <section>
                  <SectionTitle>Gender</SectionTitle>
                  <div className="flex gap-2">
                    {GENDERS.map((g) => (
                      <OptionChip key={g.value} selected={gender === g.value} onClick={() => handleGenderChange(g.value)}>
                        {g.label}
                      </OptionChip>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Physique</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {physiqueOptions.map((p) => (
                      <OptionChip key={p.value} selected={physique === p.value} onClick={() => setPhysique(p.value)}>
                        {p.label}
                      </OptionChip>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Skin Tone</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_TONES.map((tone) => (
                      <Swatch key={tone.value} selected={skinTone === tone.value} onClick={() => setSkinTone(tone.value)} hex={tone.hex} label={tone.label} />
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {tab === 'face' && (
              <motion.div key="face" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                <section>
                  <SectionTitle>Face</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {faceOptions.map((f) => (
                      <OptionChip key={f.value} selected={faceType === f.value} onClick={() => setFaceType(f.value)}>
                        {f.label}
                      </OptionChip>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Eye Color</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {EYE_COLORS.map((c) => (
                      <Swatch key={c.value} selected={eyeColor === c.value} onClick={() => setEyeColor(c.value)} hex={c.hex} label={c.label} />
                    ))}
                  </div>
                </section>

                {gender === 'male' && (
                  <section>
                    <SectionTitle>Facial Hair</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {FACIAL_HAIR_OPTIONS.map((f) => (
                        <OptionChip key={f.value} selected={facialHair === f.value} onClick={() => setFacialHair(f.value)}>
                          {f.label}
                        </OptionChip>
                      ))}
                    </div>
                  </section>
                )}

                <section>
                  <SectionTitle>Skin Details</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {SKIN_DETAILS.map((d) => (
                      <OptionChip key={d.value} selected={skinDetail === d.value} onClick={() => setSkinDetail(d.value)}>
                        {d.label}
                      </OptionChip>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {tab === 'hair' && (
              <motion.div key="hair" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                <section>
                  <SectionTitle right={<span className="font-hud text-[10px] uppercase tracking-widest text-gold-500/70">Locked = future unlock</span>}>
                    Hairstyle
                  </SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {hairOptions.map((h) => (
                      <OptionChip
                        key={h.value}
                        selected={hairStyle === h.value}
                        locked={Boolean(h.unlockLevel)}
                        unlockLevel={h.unlockLevel}
                        onClick={() => setHairStyle(h.value)}
                      >
                        {h.label}
                      </OptionChip>
                    ))}
                  </div>
                </section>

                <section>
                  <SectionTitle>Hair Color</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {HAIR_COLORS.map((c) => (
                      <Swatch key={c.value} selected={hairColor === c.value} onClick={() => setHairColor(c.value)} hex={c.hex} label={c.label} />
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </div>

          {/* forge action */}
          <div className="border-t border-dungeon-600/40 pt-4">
            <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'FORGING YOUR LEGEND…' : 'BEGIN YOUR JOURNEY'}
            </button>
            <p className="mt-2 text-center text-[11px] text-parchment-300/45">
              Level 1 · Novice · Your equipment is earned through quests.
            </p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
