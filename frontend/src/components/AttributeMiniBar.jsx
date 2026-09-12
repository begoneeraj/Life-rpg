const ATTRIBUTE_STYLES = {
  intellect: { label: 'Intellect', icon: '🧠', bar: 'from-mystic-600 to-mystic-400' },
  strength: { label: 'Strength', icon: '💪', bar: 'from-ember-600 to-ember-400' },
  discipline: { label: 'Discipline', icon: '🛡️', bar: 'from-gold-600 to-gold-400' },
  focus: { label: 'Focus', icon: '🎯', bar: 'from-xp-600 to-xp-400' },
  energy: { label: 'Energy', icon: '❤️', bar: 'from-ember-500 to-gold-400' },
};

/** A compact labeled progress bar for one attribute, scaled against a shared cap so all four are comparable. */
export default function AttributeMiniBar({ attribute, value, cap = 100 }) {
  const meta = ATTRIBUTE_STYLES[attribute];
  const pct = Math.min(100, Math.round((value / cap) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-parchment-300/80">
        <span>
          <span aria-hidden="true">{meta.icon}</span> {meta.label}
        </span>
        <span>{value}</span>
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
