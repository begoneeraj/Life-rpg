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
    <div className="parchment-card p-4">
      <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
        Attribute Sheet
      </h3>
      <div className="h-64 w-full" role="img" aria-label="Radar chart of Intellect, Strength, Discipline, Focus, and Energy attribute scores">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#2a2149" />
            <PolarAngleAxis dataKey="attribute" tick={{ fill: '#dcc699', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, max]} tick={{ fill: '#4f3f85', fontSize: 10 }} />
            <Radar
              name="Attributes"
              dataKey="value"
              stroke="#a78bfa"
              fill="#8b5cf6"
              fillOpacity={0.45}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
