'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ImagePlus, Link2, RotateCcw, Save, X } from 'lucide-react';

type Override = { text?: string; href?: string; src?: string; alt?: string; placeholder?: string };
type OverrideMap = Record<string, Override>;

const EDITABLE_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,button,a,figcaption,img,span,label,small,strong,em,b,dt,dd,th,td,time,input[placeholder],textarea[placeholder],[data-hab-editable]';
const EXCLUDED_SELECTOR = '.hab-page-quick-editor,.hab-section-edit-badge,[data-hab-no-quick-edit],[role="dialog"],script,style,noscript';

function elementKey(element: Element, root: Element): string {
  const explicit = element.getAttribute('data-hab-edit-key');
  if (explicit) return explicit;
  const zone = element.closest('.hab-public-shell, header, footer, .utility') || root;
  const zoneName = zone.matches('.hab-public-shell') ? 'main'
    : zone.matches('header') ? 'header'
      : zone.matches('footer') ? 'footer'
        : zone.matches('.utility') ? 'utility' : 'page';
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== zone && parts.length < 10) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;
    const tag = current.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter((child) => child.tagName === current!.tagName);
    parts.unshift(`${tag}:${Math.max(1, siblings.indexOf(current) + 1)}`);
    current = parent;
  }
  return `${zoneName}/${parts.join('/')}`;
}

function editableElements(): HTMLElement[] {
  const shell = document.body;
  if (!shell) return [];
  return Array.from(shell.querySelectorAll<HTMLElement>(EDITABLE_SELECTOR)).filter((element) => {
    if (element.closest(EXCLUDED_SELECTOR)) return false;
    if (element.matches('input,textarea')) return Boolean(element.getAttribute('placeholder'));
    if (!element.matches('img') && !element.textContent?.trim()) return false;
    if (element.matches('a,button') && element.querySelector('h1,h2,h3,h4,p,li')) return false;
    return true;
  });
}

function editableTextNodes(element: HTMLElement): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('svg,[aria-hidden="true"],script,style')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const direct = nodes.filter((node) => node.parentElement === element && node.textContent?.trim());
  return direct.length > 0 ? direct : nodes.filter((node) => node.textContent?.trim());
}

function setVisibleText(element: HTMLElement, text: string) {
  const nodes = editableTextNodes(element);
  const first = nodes.find((node) => node.textContent?.trim());
  if (!first) {
    element.appendChild(document.createTextNode(text));
    return;
  }
  if (first.textContent !== text) first.textContent = text;
  for (const node of nodes) {
    if (node !== first && node.textContent?.trim()) node.textContent = '';
  }
}

export default function UniversalPageQuickEdit() {
  const pathname = usePathname() || '/';
  const [active, setActive] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<Override>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const overridesRef = useRef<OverrideMap>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/health', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const role = String(data?.user?.roleSlug || data?.user?.role || '').toLowerCase();
        if (!cancelled) setIsStaff(['super_admin', 'staff_operator'].includes(role));
      })
      .catch(() => { if (!cancelled) setIsStaff(false); });
    return () => { cancelled = true; };
  }, [pathname]);

  const applyOverrides = useCallback((overrides: OverrideMap) => {
    const shell = document.body;
    if (!shell) return;
    for (const element of editableElements()) {
      const key = elementKey(element, shell);
      element.dataset.habEditKey = key;
      const value = overrides[key];
      if (!value) continue;
      if (element instanceof HTMLImageElement) {
        if (value.src && element.getAttribute('src') !== value.src) element.src = value.src;
        if (value.alt !== undefined && element.alt !== value.alt) element.alt = value.alt;
      } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (value.placeholder !== undefined && element.placeholder !== value.placeholder) element.placeholder = value.placeholder;
      } else {
        if (value.text !== undefined && editableTextNodes(element).map((node) => node.textContent).join(' ').trim() !== value.text) setVisibleText(element, value.text);
        const anchor = element instanceof HTMLAnchorElement ? element : element.closest('a');
        if (anchor && value.href !== undefined && anchor.getAttribute('href') !== value.href) anchor.setAttribute('href', value.href);
      }
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/page-overrides?path=${encodeURIComponent(pathname)}`, { cache: 'no-store' });
      const data = await response.json();
      overridesRef.current = data?.overrides || {};
      applyOverrides(overridesRef.current);
    } catch {}
  }, [applyOverrides, pathname]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleToggle = (event: Event) => {
      const enabled = Boolean((event as CustomEvent).detail?.active);
      setActive(enabled);
      if (!enabled) setSelected(null);
    };
    window.addEventListener('hab:visual-edit-toggled', handleToggle);
    setActive(document.body.classList.contains('hab-visual-edit-on'));
    return () => window.removeEventListener('hab:visual-edit-toggled', handleToggle);
  }, [pathname]);

  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selected]);

  useEffect(() => {
    if (!active || !isStaff) return;
    const shell = document.body;
    if (!shell) return;
    const elements = editableElements();
    for (const element of elements) {
      element.classList.add('hab-universal-editable');
      element.dataset.habEditKey = elementKey(element, shell);
    }
    const onClick = (event: Event) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(EDITABLE_SELECTOR);
      if (!target || !shell.contains(target) || target.closest(EXCLUDED_SELECTOR)) return;
      event.preventDefault();
      event.stopPropagation();
      setSelected(target);
      setMessage('');
      setDraft(target instanceof HTMLImageElement
        ? { src: target.currentSrc || target.src, alt: target.alt }
        : target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
          ? { placeholder: target.placeholder }
          : { text: editableTextNodes(target).map((node) => node.textContent).join(' ').trim(), href: target.closest('a')?.getAttribute('href') || undefined });
    };
    shell.addEventListener('click', onClick, true);
    return () => {
      shell.removeEventListener('click', onClick, true);
      for (const element of elements) element.classList.remove('hab-universal-editable');
    };
  }, [active, isStaff, pathname]);

  useEffect(() => {
    const shell = document.body;
    if (!shell) return;
    const observer = new MutationObserver(() => applyOverrides(overridesRef.current));
    observer.observe(shell, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [applyOverrides, pathname]);

  const save = async () => {
    if (!selected) return;
    const key = selected.dataset.habEditKey;
    if (!key) return;
    const storagePath = /^(header|footer|utility)\//.test(key) ? '/__global__' : pathname;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/page-overrides', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: storagePath, key, override: draft }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Save failed.');
      overridesRef.current = { ...overridesRef.current, [key]: draft };
      applyOverrides(overridesRef.current);
      setMessage('Saved live.');
    } catch (error: any) { setMessage(error?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (!selected?.dataset.habEditKey) return;
    setSaving(true); setMessage('');
    const key = selected.dataset.habEditKey;
    const storagePath = /^(header|footer|utility)\//.test(key) ? '/__global__' : pathname;
    try {
      const response = await fetch('/api/page-overrides', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname: storagePath, key, remove: true, override: {} }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Reset failed.');
      delete overridesRef.current[key];
      setMessage('Override removed. Reload to restore the original value.');
    } catch (error: any) { setMessage(error?.message || 'Reset failed.'); }
    finally { setSaving(false); }
  };

  const upload = async (file: File) => {
    const body = new FormData(); body.append('file', file);
    setSaving(true); setMessage('Uploading original image…');
    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed.');
      setDraft((current) => ({ ...current, src: data.url }));
      setMessage('Image uploaded. Select Save to publish it here.');
    } catch (error: any) { setMessage(error?.message || 'Upload failed.'); }
    finally { setSaving(false); }
  };

  if (!active || !isStaff || !selected) return null;
  const image = selected instanceof HTMLImageElement;
  const field = selected instanceof HTMLInputElement || selected instanceof HTMLTextAreaElement;
  const link = Boolean(selected.closest('a'));

  return createPortal(
    <aside className="hab-page-quick-editor fixed right-4 bottom-4 z-[99999] w-[min(390px,calc(100vw-2rem))] rounded-2xl border border-amber-300 bg-white p-4 text-slate-900 shadow-2xl" data-hab-no-quick-edit>
      <div className="flex items-center justify-between gap-3 mb-3">
        <strong className="text-sm">Quick edit {image ? 'image' : selected.tagName.toLowerCase()}</strong>
        <button type="button" onClick={() => setSelected(null)} aria-label="Close quick editor"><X className="w-4 h-4" /></button>
      </div>
      {image ? <>
        <label className="block text-xs font-semibold mb-1">Image URL</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.src || ''} onChange={(e) => setDraft({ ...draft, src: e.target.value })} />
        <label className="block text-xs font-semibold mb-1">Alternative text</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.alt || ''} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
        <input ref={fileRef} className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold" onClick={() => fileRef.current?.click()}><ImagePlus className="w-4 h-4" /> Replace with upload</button>
      </> : field ? <>
        <label className="block text-xs font-semibold mb-1">Form placeholder</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" value={draft.placeholder || ''} onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })} />
      </> : <>
        <label className="block text-xs font-semibold mb-1">Visible text</label>
        <textarea rows={4} className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.text || ''} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
        {link && <><label className="flex items-center gap-1 text-xs font-semibold mb-1"><Link2 className="w-3 h-3" /> Link target</label><input className="w-full rounded-lg border px-3 py-2 text-sm" value={draft.href || ''} onChange={(e) => setDraft({ ...draft, href: e.target.value })} /></>}
      </>}
      {message && <p className="mt-3 text-xs text-slate-600">{message}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" disabled={saving} onClick={reset} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"><RotateCcw className="w-3.5 h-3.5" /> Undo override</button>
        <button type="button" disabled={saving} onClick={save} className="inline-flex items-center gap-1 rounded-lg bg-[#8B2E24] px-3 py-2 text-xs font-bold text-white"><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save live'}</button>
      </div>
    </aside>,
    document.body
  );
}
