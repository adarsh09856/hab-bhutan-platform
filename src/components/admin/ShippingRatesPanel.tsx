'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { SHIPPING_COUNTRIES } from '@/lib/countries';
import { EMPTY_SHIPPING_RATE_TABLE, type ShippingRateTable, type ShippingRateZone } from '@/lib/shipping';

const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm admin-text';
const blankZone = (index: number): ShippingRateZone => ({
  id: `shipping-zone-${Date.now()}-${index}`,
  name: '',
  countries: [],
  bands: [{ maxWeightKg: null, emsUsd: null, expressUsd: null }],
});

export default function ShippingRatesPanel() {
  const [rateTable, setRateTable] = useState<ShippingRateTable>(EMPTY_SHIPPING_RATE_TABLE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/shipping-rates', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Could not load shipping rates.');
      setRateTable(data.rateTable || EMPTY_SHIPPING_RATE_TABLE);
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
      setMessage('Destination and weight rates saved. Checkout will use configured bands where a tariff is entered.');
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
          <h2 className="admin-title text-base font-semibold">Destination and weight shipping rates</h2>
          <p className="admin-muted mt-1 text-sm">Create a destination zone, select its countries, then enter the official EMS and Express prices for each order-weight band. Prices are USD. Blank tariffs remain unset.</p>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Legacy fallback:</strong> until HAB enters a matching carrier tariff, checkout continues to use the existing flat $24 EMS / $62 Express values (and its existing $200 EMS free-shipping threshold). No carrier prices are prefilled here.
        </div>
        <p className="admin-muted text-xs">Order weight is summed from product records. A product weight must include a clear unit, such as “250 g” or “1.2 kg”; an unknown weight uses the marked legacy fallback. EMS is free on eligible retail orders of USD 200 or more up to 10 kg.</p>
      </div>

      {rateTable.zones.map((zone, zoneIndex) => (
        <article key={zone.id} className="admin-card rounded-xl border admin-border p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="admin-title text-sm font-semibold">Zone {zoneIndex + 1}</h3>
            <button type="button" onClick={() => setRateTable((current) => ({ ...current, zones: current.zones.filter((item) => item.id !== zone.id) }))} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">
              <Trash2 size={14} /> Remove zone
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="admin-text block text-sm font-medium">
              Zone name
              <input value={zone.name} onChange={(event) => updateZone(zone.id, { name: event.target.value })} className={fieldClass} maxLength={100} placeholder="For example, Bhutan or South Asia" />
            </label>
            <label className="admin-text block text-sm font-medium">
              Countries
              <select multiple value={zone.countries} onChange={(event) => updateZone(zone.id, { countries: Array.from(event.currentTarget.selectedOptions, (option) => option.value) })} className={`${fieldClass} min-h-36`} aria-label={`Countries for ${zone.name || `zone ${zoneIndex + 1}`}`}>
                {SHIPPING_COUNTRIES.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
              </select>
              <span className="admin-muted mt-1 block text-xs">Use Ctrl or Command to select multiple countries. Each country can belong to one zone.</span>
            </label>
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

      {rateTable.zones.length === 0 && <div className="admin-card rounded-xl border admin-border p-8 text-center"><p className="admin-title font-semibold">No carrier rate zones configured</p><p className="admin-muted mt-1 text-sm">Checkout remains on the marked legacy flat fallback until a rate zone and tariff values are saved.</p></div>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={addZone} className="inline-flex items-center gap-2 rounded-lg border admin-border px-4 py-2.5 text-sm font-semibold admin-text hover:bg-slate-50"><Plus size={16} /> Add destination zone</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg admin-button-primary px-5 py-2.5 text-sm font-semibold disabled:opacity-50"><Save size={16} /> {saving ? 'Saving rates…' : 'Save shipping rates'}</button>
        {message && <span className="text-sm text-emerald-700" role="status">{message}</span>}
        {error && <span className="text-sm text-rose-700" role="alert">{error}</span>}
      </div>
    </section>
  );
}
