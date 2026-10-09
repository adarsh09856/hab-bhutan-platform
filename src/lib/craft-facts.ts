export type CraftFactSource = {
  name: string;
  english: string;
  technique?: string | null;
  materials?: string | null;
  practised_in?: string | null;
};

export type CraftFact = { label: string; value: string };

export function getCraftFacts(craft: CraftFactSource): CraftFact[] {
  const facts: CraftFact[] = [
    { label: 'Craft', value: [craft.name, craft.english].filter(Boolean).join(' · ') },
    { label: 'Technique', value: craft.technique?.trim() || '' },
    { label: 'Materials', value: craft.materials?.trim() || '' },
    { label: 'Practised in', value: craft.practised_in?.trim() || '' },
  ];
  return facts.filter((fact) => fact.value.length > 0);
}
