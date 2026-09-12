import Icon from './icons';

const OPTIONS = [
  { value: 'dark', icon: 'moon', label: 'Dark' },
  { value: 'light', icon: 'sun', label: 'Light' },
];

/**
 * ThemeToggle — compact premium dark/light switch for the player HUD.
 *
 * Two icon segments (moon / sun) with the active one highlighted; the whole
 * control is a radiogroup so screen readers announce the current theme and
 * each option is individually reachable. Controlled by the shell's useTheme.
 */
export default function ThemeToggle({ theme, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center rounded-md border border-dungeon-600/80 bg-dungeon-900/80 p-0.5"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={theme === option.value}
          aria-label={`${option.label} theme`}
          title={`${option.label} theme`}
          onClick={() => onChange(option.value)}
          className={`theme-toggle-option ${theme === option.value ? 'theme-toggle-option-active' : ''}`}
        >
          <Icon name={option.icon} className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
