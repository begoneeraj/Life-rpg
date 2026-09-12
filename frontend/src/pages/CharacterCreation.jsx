import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import CharacterAvatar from '../components/character/CharacterAvatar';
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

function OptionSwatch({ selected, onClick, style, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={selected}
      aria-label={label}
      className={`h-9 w-9 shrink-0 rounded-full border-2 transition-transform hover:scale-110 ${
        selected ? 'border-gold-400 shadow-glow' : 'border-dungeon-600'
      }`}
      style={{ background: style }}
    />
  );
}

function OptionPill({ selected, onClick, children, locked }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      aria-pressed={selected}
      className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-gold-500 bg-gold-500/10 text-gold-400'
          : 'border-dungeon-600 bg-dungeon-800 text-parchment-200/80 hover:border-mystic-500 hover:text-mystic-400'
      }`}
    >
      {children}
    </button>
  );
}

const TABS = [
  { id: 'identity', label: 'Identity' },
  { id: 'face', label: 'Head & Face' },
  { id: 'hair', label: 'Hair' },
];

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
  const hairOptions = useMemo(
    () => HAIR_STYLES_BY_GENDER[gender].filter((h) => !h.unlockLevel),
    [gender]
  );

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

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 lg:flex-row lg:items-stretch">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs shrink-0 text-center"
      >
        <div className="parchment-card flex h-full flex-col items-center justify-center gap-4 p-6">
          <CharacterAvatar
            gender={gender}
            physique={physique}
            skinTone={skinTone}
            faceType={faceType}
            eyeColor={eyeColor}
            hairStyle={hairStyle}
            hairColor={hairColor}
            facialHair={facialHair}
            skinDetail={skinDetail}
            equippedTop={{ svgKey: 'top_basic_tee' }}
            equippedBottom={{ svgKey: 'bottom_basic_pants' }}
            equippedShoes={{ svgKey: 'shoes_basic' }}
            rotation={rotation}
            className="h-72 w-auto"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Rotate left"
              onClick={() => setRotation((r) => Math.max(-45, r - 15))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-dungeon-600 text-parchment-300 transition-colors hover:border-gold-500 hover:text-gold-400"
            >
              ‹
            </button>
            <p className="text-xs uppercase tracking-widest text-parchment-300/60">
              Everyone starts from zero.
            </p>
            <button
              type="button"
              aria-label="Rotate right"
              onClick={() => setRotation((r) => Math.min(45, r + 15))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-dungeon-600 text-parchment-300 transition-colors hover:border-gold-500 hover:text-gold-400"
            >
              ›
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="parchment-card w-full flex-1 space-y-6 p-6 sm:p-8"
      >
        <div className="text-center lg:text-left">
          <h1 className="font-display text-3xl font-extrabold text-gold-400 sm:text-4xl">
            CREATE YOUR CHARACTER
          </h1>
          <p className="mt-1 text-sm text-parchment-300/70">Your journey begins here.</p>
        </div>

        <div className="flex gap-1 border-b border-dungeon-700 pb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                tab === t.id
                  ? 'border-gold-500 text-gold-400'
                  : 'border-transparent text-parchment-300/50 hover:text-parchment-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'identity' && (
          <div className="space-y-6">
            <section>
              <p className="label-text">Gender</p>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <OptionPill key={g.value} selected={gender === g.value} onClick={() => handleGenderChange(g.value)}>
                    {g.label}
                  </OptionPill>
                ))}
              </div>
            </section>

            <section>
              <p className="label-text">Physique</p>
              <div className="flex flex-wrap gap-2">
                {physiqueOptions.map((p) => (
                  <OptionPill key={p.value} selected={physique === p.value} onClick={() => setPhysique(p.value)}>
                    {p.label}
                  </OptionPill>
                ))}
              </div>
            </section>

            <section>
              <p className="label-text">Skin Tone</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((tone) => (
                  <OptionSwatch
                    key={tone.value}
                    selected={skinTone === tone.value}
                    onClick={() => setSkinTone(tone.value)}
                    style={tone.hex}
                    label={tone.label}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'face' && (
          <div className="space-y-6">
            <section>
              <p className="label-text">Face</p>
              <div className="flex flex-wrap gap-2">
                {faceOptions.map((f) => (
                  <OptionPill key={f.value} selected={faceType === f.value} onClick={() => setFaceType(f.value)}>
                    {f.label}
                  </OptionPill>
                ))}
              </div>
            </section>

            <section>
              <p className="label-text">Eye Color</p>
              <div className="flex flex-wrap gap-2">
                {EYE_COLORS.map((c) => (
                  <OptionSwatch
                    key={c.value}
                    selected={eyeColor === c.value}
                    onClick={() => setEyeColor(c.value)}
                    style={c.hex}
                    label={c.label}
                  />
                ))}
              </div>
            </section>

            {gender === 'male' && (
              <section>
                <p className="label-text">Facial Hair</p>
                <div className="flex flex-wrap gap-2">
                  {FACIAL_HAIR_OPTIONS.map((f) => (
                    <OptionPill
                      key={f.value}
                      selected={facialHair === f.value}
                      onClick={() => setFacialHair(f.value)}
                    >
                      {f.label}
                    </OptionPill>
                  ))}
                </div>
              </section>
            )}

            <section>
              <p className="label-text">Skin Details</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_DETAILS.map((d) => (
                  <OptionPill key={d.value} selected={skinDetail === d.value} onClick={() => setSkinDetail(d.value)}>
                    {d.label}
                  </OptionPill>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'hair' && (
          <div className="space-y-6">
            <section>
              <p className="label-text">Hairstyle</p>
              <div className="flex flex-wrap gap-2">
                {hairOptions.map((h) => (
                  <OptionPill key={h.value} selected={hairStyle === h.value} onClick={() => setHairStyle(h.value)}>
                    {h.label}
                  </OptionPill>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-parchment-300/50">
                More hairstyles unlock automatically as you level up.
              </p>
            </section>

            <section>
              <p className="label-text">Hair Color</p>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((c) => (
                  <OptionSwatch
                    key={c.value}
                    selected={hairColor === c.value}
                    onClick={() => setHairColor(c.value)}
                    style={c.hex}
                    label={c.label}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        <button type="button" className="btn-primary w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Forging your legend…' : 'Begin Your Journey'}
        </button>
      </motion.div>
    </div>
  );
}
