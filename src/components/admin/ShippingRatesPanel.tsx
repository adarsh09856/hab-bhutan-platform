'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { SHIPPING_COUNTRIES } from '@/lib/countries';
import { EMPTY_SHIPPING_RATE_TABLE, type ShippingRateTable, type ShippingRateZone } from '@/lib/shipping';

type ShippingRateTableWithDefaults = ShippingRateTable & {
  defaults?: { emsUsd: number; expressUsd: number };
};

const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm admin-text';
const blankZone = (index: number): ShippingRateZone => ({
  id: `shipping-zone-${Date.now()}-${index}`,
  name: '',
  countries: [],
  bands: [{ maxWeightKg: null, emsUsd: null, expressUsd: null }],
});

export default function ShippingRatesPanel() {
  const [rateTable, setRateTable] = useState<ShippingRateTableWithDefaults>({
    ...EMPTY_SHIPPING_RATE_TABLE,
    defaults: { emsUsd: 24, expressUsd: 62 },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [zoneCountrySearch, setZoneCountrySearch] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/shipping-rates', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Could not load shipping rates.');
      const loaded = data.rateTable || EMPTY_SHIPPING_RATE_TABLE;
      setRateTable({
        ...loaded,
        defaults: loaded.defaults ?? { emsUsd: 24, expressUsd: 62 },
      });
    } catch (reason: any) {
      setError(reason?.message || 'Could not load shipping rates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateZone = (id: string, update: Partial<ShippingRateZone>) => {
    setRateTable((current) => ({ ...current, zones: current.zones.map((zone) => zone.id === id ? { ...zone, ...update } : zone) }));
  };

  const addZone = () => setRateTable((current) => ({ ...current, zones: [...current.zones, blankZone(current.zones.length)] }));

  const updateDefault = (key: 'emsUsd' | 'expressUsd', value: number) => {
    setRateTable((current) => ({
      ...current,
      defaults: { ...(current.defaults ?? { emsUsd: 24, expressUsd: 62 }), [key]: value },
    }));
  };

  const defaultValidation = (['emsUsd', 'expressUsd'] as const).flatMap((key) => {
    const label = key === 'emsUsd' ? 'Default EMS charge' : 'Default DHL Express charge';
    const value = rateTable.defaults?.[key];
    if (value === undefined || !Number.isFinite(value)) return [`${label} is required.`];
    if (value < 0 || value > 100000) return [`${label} must be between 0 and 100,000 USD.`];
    return [];
  });

  const addBand = (zone: ShippingRateZone) => {
    const bands = [...zone.bands];
    const last = bands[bands.length - 1];
    if (!last || last.maxWeightKg === null) {
      setError('Enter the current band’s approved upper weight limit before adding another band.');
      setMessage('');
      return;
    }
    bands.push({ maxWeightKg: null, emsUsd: null, expressUsd: null });
    updateZone(zone.id, { bands });
    setError('');
  };

  const save = async () => {
    if (defaultValidation.length) {
      setError(defaultValidation.join(' '));
      setMessage('');
      return;
    }
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch('/api/admin/shipping-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rateTable }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Could not save shipping rates.');
      setRateTable(data.rateTable);
      setMessage('Default shipping charges and destination/weight rates saved.');
    } catch (reason: any) {
      setError(reason?.message || 'Could not save shipping rates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card rounded-xl border admin-border p-6 text-sm admin-muted" role="status">Loading shipping-rate settings…</div>;

  return (
    <section className="space-y-5">
      <div className="admin-card rounded-xl border admin-border p-5 space-y-3">
        <div>
          <h2 className="admin-title text-base font-semibold">Default shipping charges</h2>
          <p className="admin-muted mt-1 text-sm">These saved charges apply when no destination and weight tariff matches the order.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="admin-text block text-sm font-medium">
            EMS (USD)
            <input type="number" min="0" max="100000" step="0.01" value={Number.isFinite(rateTable.defaults?.emsUsd) ? rateTable.defaults!.emsUsd : ''} onChange={(event) => updateDefault('emsUsd', event.target.value === '' ? Number.NaN : Number(event.target.value))} className={fieldClass} aria-label="Default EMS charge in USD" aria-invalid={defaultValidation.some((item) => item.startsWith('Default EMS'))} />
          </label>
          <label className="admin-text block text-sm font-medium">
            DHL Express (USD)
            <input type="number" min="0" max="100000" step="0.01" value={Number.isFinite(rateTable.defaults?.expressUsd) ? rateTable.defaults!.expressUsd : ''} onChange={(event) => updateDefault('expressUsd', event.target.value === '' ? Number.NaN : Number(event.target.value))} className={fieldClass} aria-label="Default DHL Express charge in USD" aria-invalid={defaultValidation.some((item) => item.startsWith('Default DHL Express'))} />
          </label>
        </div>
        {defaultValidation.length > 0 && <p className="text-sm text-rose-700" role="alert">{defaultValidation.join(' ')}</p>}
      </div>

      <div className="admin-card rounded-xl border admin-border p-5 space-y-3">
        <div>
          <h2 className="admin-title text-base font-semibold">Destination and weight shipping rates</h2>
          <p className="admin-muted mt-1 text-sm">Create a destination zone, select its countries, then enter the official EMS and Express prices for each order-weight band. Prices are USD. Blank tariffs remain unset.</p>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Fallback behavior:</strong> saved default shipping charges apply when no destination and weight tariff matches. The existing $200 EMS free-shipping threshold remains in effect. No destination tariffs are prefilled here.
        </div>
        <p className="admin-muted text-xs">Order weight is summed from product records. A product weight must include a clear unit, such as “250 g” or “1.2 kg”; when the weight is unknown or no destination/weight tariff matches, saved default charges apply. EMS is free on eligible retail orders of USD 200 or more up to 10 kg.</p>
      </div>

      {rateTable.zones.map((zone, zoneIndex) => (
        <article key={zone.id} className="admin-card rounded-xl border admin-border p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="admin-title text-sm font-semibold">{zone.name || `New destination zone ${zoneIndex + 1}`}</h3>
            <button type="button" onClick={() => setRateTable((current) => ({ ...current, zones: current.zones.filter((item) => item.id !== zone.id) }))} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
              <Trash2 size={14} /> Remove zone
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-text block text-sm font-medium">
              Zone name
              <input value={zone.name} onChange={(event) => updateZone(zone.id, { name: event.target.value })} className={fieldClass} maxLength={100} placeholder="For example, Bhutan or South Asia" />
            </label>
            <fieldset className="admin-text min-w-0 text-sm">
              <legend className="font-medium">Countries in this zone ({zone.countries.length} selected)</legend>
              <input
                type="search"
                value={zoneCountrySearch[zone.id] ?? ''}
                onChange={(event) => setZoneCountrySearch((current) => ({ ...current, [zone.id]: event.target.value }))}
                className={fieldClass}
                placeholder="Find a country"
                aria-label={`Find a country for ${zone.name || `zone ${zoneIndex + 1}`}`}
              />
              <div className="mt-2 grid max-h-52 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-slate-300 bg-white p-2 sm:grid-cols-2">
                {SHIPPING_COUNTRIES.filter((country) => country.name.toLowerCase().includes((zoneCountrySearch[zone.id] ?? '').trim().toLowerCase())).map((country) => {
                  const assignedElsewhere = rateTable.zones.some((otherZone) => otherZone.id !== zone.id && otherZone.countries.includes(country.code));
                  const checked = zone.countries.includes(country.code);
                  return (
                    <label key={country.code} className={`flex min-h-9 items-center gap-2 rounded-md px-2 text-xs ${assignedElsewhere ? 'cursor-not-allowed text-slate-400' : 'cursor-pointer text-slate-700 hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={assignedElsewhere}
                        onChange={(event) => updateZone(zone.id, { countries: event.target.checked ? [...zone.countries, country.code] : zone.countries.filter((code) => code !== country.code) })}
                        className="h-4 w-4 accent-[#8B2E24]"
                      />
                      <span>{country.name}{assignedElsewhere ? ' · in another zone' : ''}</span>
                    </label>
                  );
                })}
                {SHIPPING_COUNTRIES.every((country) => !country.name.toLowerCase().includes((zoneCountrySearch[zone.id] ?? '').trim().toLowerCase())) && (
                  <p className="admin-muted col-span-full px-2 py-3 text-xs">No countries match that search.</p>
                )}
              </div>
              <p className="admin-muted mt-1 text-xs">Tick the countries for this zone. Each country can belong to one zone only.</p>
            </fieldset>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="admin-text text-sm font-semibold">Weight bands</h4>
              <button type="button" onClick={() => addBand(zone)} className="inline-flex items-center gap-1.5 rounded-lg border admin-border px-3 py-2 text-xs font-semibold admin-text hover:bg-slate-50"><Plus size={14} /> Add band</button>
            </div>
            <div className="overflow-x-auto rounded-lg border admin-border">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-slate-50 admin-muted"><tr><th className="p-3">Order weight up to (kg)</th><th className="p-3">EMS (USD)</th><th className="p-3">Express (USD)</th><th className="p-3">Action</th></tr></thead>
                <tbody>
                  {zone.bands.map((band, bandIndex) => (
                    <tr key={`${zone.id}-band-${bandIndex}`} className="border-t admin-border">
                      <td className="p-2"><input type="number" min="0.001" step="0.001" value={band.maxWeightKg ?? ''} onChange={(event) => updateZone(zone.id, { bands: zone.bands.map((row, index) => index === bandIndex ? { ...row, maxWeightKg: event.target.value === '' ? null : Number(event.target.value) } : row) })} className="w-40 rounded-md border border-slate-300 px-2.5 py-2 admin-text" placeholder={bandIndex === zone.bands.length - 1 ? 'Any higher weight' : 'Required'} aria-label={`Maximum weight for zone ${zoneIndex + 1}, band ${bandIndex + 1}`} /></td>
                      <td className="p-2"><input type="number" min="0" max="100000" step="0.01" value={band.emsUsd ?? ''} onChange={(event) => updateZone(zone.id, { bands: zone.bands.map((row, index) => index === bandIndex ? { ...row, emsUsd: event.target.value === '' ? null : Number(event.target.value) } : row) })} className="w-36 rounded-md border border-slate-300 px-2.5 py-2 admin-text" placeholder="Not entered" aria-label={`EMS tariff for zone ${zoneIndex + 1}, band ${bandIndex + 1}`} /></td>
                      <td className="p-2"><input type="number" min="0" max="100000" step="0.01" value={band.expressUsd ?? ''} onChange={(event) => updateZone(zone.id, { bands: zone.bands.map((row, index) => index === bandIndex ? { ...row, expressUsd: event.target.value === '' ? null : Number(event.target.value) } : row) })} className="w-36 rounded-md border border-slate-300 px-2.5 py-2 admin-text" placeholder="Not entered" aria-label={`Express tariff for zone ${zoneIndex + 1}, band ${bandIndex + 1}`} /></td>
                      <td className="p-2"><button type="button" disabled={zone.bands.length <= 1} onClick={() => updateZone(zone.id, { bands: zone.bands.filter((_, index) => index !== bandIndex) })} className="rounded-md p-2 text-rose-700 hover:bg-rose-50 disabled:opacity-40" aria-label={`Remove band ${bandIndex + 1} from zone ${zoneIndex + 1}`}><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="admin-muted text-xs">Enter each upper weight limit in increasing order. Leave the last limit blank for “any higher weight”. Leave a service price blank when HAB has not received its approved carrier tariff yet.</p>
          </div>
        </article>
      ))}

      {rateTable.zones.length === 0 && <div className="admin-card rounded-xl border admin-border p-8 text-center"><p className="admin-title font-semibold">No carrier rate zones configured</p><p className="admin-muted mt-1 text-sm">Saved default shipping charges are used when no destination and weight tariff matches.</p></div>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={addZone} className="inline-flex items-center gap-2 rounded-lg border admin-border px-4 py-2.5 text-sm font-semibold admin-text hover:bg-slate-50"><Plus size={16} /> Add destination zone</button>
        <button type="button" onClick={() => void save()} disabled={saving || defaultValidation.length > 0} className="inline-flex items-center gap-2 rounded-lg admin-button-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"><Save size={16} /> {saving ? 'Saving rates…' : 'Save shipping rates'}</button>
        {message && <span className="text-sm text-emerald-700" role="status">{message}</span>}
        {error && <span className="text-sm text-rose-700" role="alert">{error}</span>}
      </div>
    </section>
  );
}
