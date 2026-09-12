import Icon from './ui/icons';

const ATTRIBUTE_STYLES = {
  intellect: { label: 'Intellect', icon: 'attr_intellect', bar: 'from-mystic-600 to-mystic-400' },
  strength: { label: 'Strength', icon: 'attr_strength', bar: 'from-ember-600 to-ember-400' },
  discipline: { label: 'Discipline', icon: 'attr_discipline', bar: 'from-gold-600 to-gold-400' },
  focus: { label: 'Focus', icon: 'attr_focus', bar: 'from-xp-600 to-xp-400' },
  energy: { label: 'Energy', icon: 'attr_energy', bar: 'from-ember-500 to-gold-400' },
};

/** A compact labeled progress bar for one attribute, scaled against a shared cap so all five are comparable. */
export default function AttributeMiniBar({ attribute, value, cap = 100 }) {
  const meta = ATTRIBUTE_STYLES[attribute];
  const pct = Math.min(100, Math.round((value / cap) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-parchment-300/80">
        <span className="flex items-center gap-1.5">
          <Icon name={meta.icon} className="h-3.5 w-3.5 text-parchment-300/60" />
          {meta.label}
        </span>
        <span className="font-hud text-parchment-100">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-dungeon-600 bg-dungeon-900">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out ${meta.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
