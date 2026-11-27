'use client';

import { useEffect, useState } from 'react';

export default function ProductTypeOptions({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [options, setOptions] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/product-types', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load product types.');
        if (!Array.isArray(data.options) || data.options.some((option: unknown) => typeof option !== 'string')) {
          throw new Error('The saved product type list is invalid. Ask an Admin to review it.');
        }
        setOptions(data.options);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') setError(error.message || 'Could not load product types.');
        else if (!(error instanceof Error)) setError('Could not load product types.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  async function save(action: string) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/product-types', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, name: action === 'add' ? name : value, newName: name }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) throw new Error('Your Admin session has expired. Sign in again, then retry.');
        if (response.status === 403) throw new Error('Your role does not allow product type changes. This action requires Products → Edit Product; ask an Admin to update your role.');
        throw new Error(data.error || 'Could not save product types.');
      }
      if (!Array.isArray(data.options) || data.options.some((option: unknown) => typeof option !== 'string')) {
        throw new Error('The server returned an invalid product type list. Reload before editing products.');
      }
      setOptions(data.options);
      // Removing a list option does not rewrite existing product records. Keep
      // the current form value too, so a later product save cannot accidentally
      // erase that assignment merely because its option was removed.
      if (action !== 'remove') onChange(name.trim());
      setName('');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <label className="block font-medium admin-text">Product type
      <select value={value} onChange={event => onChange(event.target.value)} className="w-full admin-input border rounded-lg px-3 py-2 mt-1">
        <option value="">Choose type</option>
        {Array.from(new Set([...options, ...(value ? [value] : [])])).map(option => <option key={option}>{option}</option>)}
      </select>
    </label>
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-[#8B2E24]">Manage product types</summary>
      <div className="mt-2 space-y-2">
        <label className="block">Type name<input value={name} maxLength={80} onChange={event => setName(event.target.value)} className="w-full admin-input border rounded-lg px-3 py-2 mt-1" /></label>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={loading || busy || !name.trim()} onClick={() => save('add')} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">Add type</button>
          <button type="button" disabled={loading || busy || !value || !name.trim()} onClick={() => save('rename')} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">Rename selected</button>
          <button type="button" disabled={loading || busy || !value} onClick={() => save('remove')} className="admin-button-secondary px-3 py-2 rounded-lg disabled:opacity-50">Remove from type list</button>
        </div>
        <p className="admin-muted">{loading ? 'Loading saved types…' : 'Renaming updates assigned products. Removing a type only removes it from the list; saved product assignments remain unchanged.'}</p>
      </div>
    </details>
    {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
  </div>;
}
