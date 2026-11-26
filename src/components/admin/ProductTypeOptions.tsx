'use client';

import { useEffect, useState } from 'react';

export default function ProductTypeOptions({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [options, setOptions] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/admin/product-types', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load product types.');
        setOptions(data.options);
      })
      .catch(error => setError(error.message));
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
      if (!response.ok) throw new Error(data.error || 'Could not save product types.');
      setOptions(data.options);
      if (action === 'remove') onChange('');
      else onChange(name.trim());
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
          <button type="button" disabled={busy || !name.trim()} onClick={() => save('add')} className="admin-button-secondary px-3 py-2 rounded-lg">Add type</button>
          <button type="button" disabled={busy || !value || !name.trim()} onClick={() => save('rename')} className="admin-button-secondary px-3 py-2 rounded-lg">Rename selected</button>
          <button type="button" disabled={busy || !value} onClick={() => save('remove')} className="admin-button-secondary px-3 py-2 rounded-lg">Remove selected option</button>
        </div>
        <p className="admin-muted">Renaming updates assigned products. Removing an option keeps existing product assignments.</p>
      </div>
    </details>
    {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
  </div>;
}
