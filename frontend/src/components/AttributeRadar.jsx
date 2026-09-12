import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ATTRIBUTE_META = [
  { key: 'intellect', label: 'Intellect' },
  { key: 'strength', label: 'Strength' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'focus', label: 'Focus' },
  { key: 'energy', label: 'Energy' },
];

export default function AttributeRadar({ character }) {
  const data = ATTRIBUTE_META.map(({ key, label }) => ({
    attribute: label,
    value: character?.[key] ?? 0,
  }));
  const max = Math.max(20, ...data.map((d) => d.value));

  return (
    <div className="radar-theme parchment-card p-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
        Attribute Sheet
      </h3>
      <div className="h-64 w-full" role="img" aria-label="Radar chart of Intellect, Strength, Discipline, Focus, and Energy attribute scores">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            {/* Colors resolve per theme through the .radar-theme CSS overrides
                in index.css (SVG presentation attrs can't use CSS vars). */}
            <PolarGrid stroke="#3f4354" />
            <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, max]} tick={{ fontSize: 10 }} />
            <Radar
              name="Attributes"
              dataKey="value"
              stroke="#9a8aeb"
              fill="#8b76e5"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
