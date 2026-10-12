'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { ImagePlus, Link2, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { isEditableInlineTextPath, joinEditableText } from '@/lib/quick-edit-text';
import { applyQuickEditImage, normalizeQuickEditImageSource } from '@/lib/quick-edit-image';

type Override = { text?: string; textDz?: string; href?: string; src?: string; alt?: string; placeholder?: string };
type OverrideMap = Record<string, Override>;

const EDITABLE_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,button,a,figcaption,img,span,label,small,strong,em,b,dt,dd,th,td,time,option,div,input[placeholder],textarea[placeholder],[data-hab-editable]';
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
    if (!element.matches('img') && !element.matches('input,textarea') && editableTextNodes(element).length === 0) return false;
    if (element.matches('a,button') && element.querySelector('h1,h2,h3,h4,p,li')) return false;
    return true;
  });
}

function editableTextNodes(element: HTMLElement): Text[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.parentElement?.closest('svg,[aria-hidden="true"],script,style,noscript')) return NodeFilter.FILTER_REJECT;
      const ancestorTags: string[] = [];
      let current = node.parentElement;
      while (current && current !== element) {
        ancestorTags.push(current.tagName);
        current = current.parentElement;
      }
      return current === element && isEditableInlineTextPath(element.tagName, ancestorTags)
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes.filter((node) => node.textContent?.trim());
}

function setVisibleText(element: HTMLElement, text: string) {
  const nodes = editableTextNodes(element);
  const first = nodes.find((node) => node.parentElement === element) || nodes[0];
  if (!first) {
    return;
  }
  if (first.textContent !== text) first.textContent = text;
  for (const node of nodes) {
      if (node !== first && node.textContent?.trim()) node.textContent = '';
  }
}

export default function UniversalPageQuickEdit() {
  const pathname = usePathname() || '/';
  const { language } = useLanguage();
  const [active, setActive] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [staffPermissions, setStaffPermissions] = useState<string[]>([]);
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [sectionManagement, setSectionManagement] = useState<{ label: string; href: string; description: string } | null>(null);
  const [draft, setDraft] = useState<Override>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideCaption, setNewSlideCaption] = useState('');
  const [newSlideAlt, setNewSlideAlt] = useState('');
  const overridesRef = useRef<OverrideMap>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/health', { credentials: 'include', cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        const role = String(data?.user?.roleSlug || data?.user?.role || '').toLowerCase();
        if (!cancelled) {
          setIsStaff(['super_admin', 'staff_operator'].includes(role));
          setStaffPermissions(Array.isArray(data?.user?.permissions) ? data.user.permissions : []);
        }
      })
      .catch(() => { if (!cancelled) { setIsStaff(false); setStaffPermissions([]); } });
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
        if (value.src) applyQuickEditImage(element, value.src);
        if (value.alt !== undefined && element.alt !== value.alt) element.alt = value.alt;
      } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
        if (value.placeholder !== undefined && element.placeholder !== value.placeholder) element.placeholder = value.placeholder;
      } else {
        const localizedText = language === 'dz' ? value.textDz : value.text;
        if (localizedText !== undefined && joinEditableText(editableTextNodes(element)) !== localizedText) setVisibleText(element, localizedText);
      }
      const anchor = element instanceof HTMLAnchorElement ? element : element.closest('a');
      if (anchor && value.href !== undefined && anchor.getAttribute('href') !== value.href) anchor.setAttribute('href', value.href);
    }
  }, [language]);

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
      if (!enabled) { setSelected(null); setSectionManagement(null); }
    };
    window.addEventListener('hab:visual-edit-toggled', handleToggle);
    setActive(document.body.classList.contains('hab-visual-edit-on'));
    return () => window.removeEventListener('hab:visual-edit-toggled', handleToggle);
  }, [pathname]);

  useEffect(() => {
    if (!selected && !sectionManagement) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSelected(null); setSectionManagement(null); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selected, sectionManagement]);

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
      const clicked = event.target as HTMLElement | null;
      if (clicked?.closest('.hab-page-quick-editor')) return;
      const openSectionManager = () => {
        setSelected(null);
        setSectionManagement(null);
        if (!clicked || clicked.closest('a,button,input,textarea,select,[role="button"],[data-hab-no-quick-edit],.hab-section-edit-badge')) return;
        const section = clicked.closest<HTMLElement>('[data-hab-section]');
        const adminLink = section?.querySelector<HTMLAnchorElement>('.hab-section-edit-badge a[href]');
        if (!section) return;
        event.preventDefault();
        event.stopPropagation();
        setSectionManagement(adminLink ? {
          label: adminLink.textContent?.replace(/\s+/g, ' ').trim() || 'Manage this section',
          href: adminLink.href,
          description: 'Use the existing section manager to add or manage this section’s content.',
        } : {
          label: 'Add an extra page section',
          href: `/admin/pages/sections?path=${encodeURIComponent(pathname)}`,
          description: 'This area has no dedicated section manager. Click visible text to edit it, or add an extra content block below this page in Admin.',
        });
      };
      const target = clicked?.closest<HTMLElement>(EDITABLE_SELECTOR);
      if (!target || !shell.contains(target) || target.closest(EXCLUDED_SELECTOR)) {
        openSectionManager();
        return;
      }
      const isMediaPlaceholder = target.hasAttribute('data-hab-media-placeholder');
      const isTextOrMedia = target instanceof HTMLImageElement || isMediaPlaceholder || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || editableTextNodes(target).length > 0;
      if (!isTextOrMedia) {
        openSectionManager();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setSelected(target);
      setSectionManagement(null);
      setMessage('');
      setNewSlideUrl('');
      setNewSlideCaption('');
      setNewSlideAlt('');
      const saved = overridesRef.current[elementKey(target, shell)];
      setDraft(target instanceof HTMLImageElement || isMediaPlaceholder
        ? {
          ...(saved || {}),
          src: saved?.src || normalizeQuickEditImageSource(target instanceof HTMLImageElement ? (target.getAttribute('src') || target.currentSrc || target.src) : '', window.location.href),
          alt: saved?.alt ?? (target instanceof HTMLImageElement ? target.alt : target.getAttribute('data-hab-media-alt') || ''),
          href: saved?.href ?? (target.closest('a')?.getAttribute('href') || undefined),
        }
        : target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
          ? { ...(saved || {}), placeholder: saved?.placeholder ?? target.placeholder }
          : { ...(saved || {}), text: saved?.text ?? joinEditableText(editableTextNodes(target)), href: saved?.href ?? (target.closest('a')?.getAttribute('href') || undefined) });
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
    observer.observe(shell, {
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'sizes', 'alt', 'href', 'placeholder'],
      subtree: true,
    });
    return () => observer.disconnect();
  }, [applyOverrides, pathname]);

  const save = async () => {
    if (!selected) return;
    const key = selected.dataset.habEditKey;
    if (!key) return;
    const storagePath = /^(header|footer|utility)\//.test(key) ? '/__global__' : pathname;
    setSaving(true); setMessage('');
    try {
      if ((selected instanceof HTMLImageElement || selected.hasAttribute('data-hab-media-placeholder')) && galleryElement && galleryType) {
        const imageElement = selected instanceof HTMLImageElement ? selected : null;
        const imageAlt = draft.alt?.trim() || imageElement?.alt || '';
        const nextUrl = draft.src?.trim() || '';
        if (!/^\/(?!\/)/.test(nextUrl) && !/^https:\/\//i.test(nextUrl)) {
          throw new Error('Use a site image path or HTTPS URL.');
        }
        const requestJson = async (url: string, init?: RequestInit) => {
          const response = await fetch(url, { credentials: 'include', cache: 'no-store', ...init });
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error || 'Could not update the gallery.');
          return data;
        };
        const write = (url: string, method: string, payload: unknown) => requestJson(url, {
          method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (galleryType === 'hero') {
          const id = selected.dataset.habGallerySlideId;
          if (!id) throw new Error('This hero slide has not loaded yet. Please try again.');
          await write(`/api/admin/hero-slides/${encodeURIComponent(id)}`, 'PUT', { imageUrl: nextUrl, altText: imageAlt });
        } else if (galleryType === 'outlet' && galleryId) {
          const { outlets } = await requestJson('/api/admin/outlets');
          const outlet = outlets.find((item: { key: string }) => item.key === galleryId);
          if (!outlet) throw new Error('Outlet not found in Admin.');
          if (!imageElement) throw new Error('Select an existing outlet photo to replace it.');
          const position = Array.from(galleryElement.querySelectorAll('img')).indexOf(imageElement);
          if (position < 0) throw new Error('Could not identify this outlet photo.');
          if (position === 0) {
            await write('/api/admin/outlets', 'PUT', { id: outlet.id, imageUrl: nextUrl });
          } else {
            const images: string[] = Array.isArray(outlet.galleryImages) ? [...outlet.galleryImages] : [];
            if (position > images.length) throw new Error('This outlet photo is not available in Admin.');
            images[position - 1] = nextUrl;
            await write('/api/admin/outlets', 'PUT', { id: outlet.id, galleryImages: images });
          }
        } else if (galleryType === 'product' && galleryId) {
          const { products } = await requestJson('/api/admin/products');
          const product = products.find((item: { code: string }) => item.code === galleryId);
          if (!product) throw new Error('Product not found in Admin.');
          if (!imageElement) throw new Error('Select an existing product photo to replace it.');
          const position = galleryElement.dataset.habGalleryView === 'card'
            ? 0 : Array.from(galleryElement.querySelectorAll('.gallery__slide img')).indexOf(imageElement);
          if (position < 0) throw new Error('Could not identify this product photo.');
          const images: Array<{ url: string; role?: string; alt?: string }> = Array.isArray(product.images)
            ? product.images.map((item: string | { url: string; role?: string; alt?: string }) => typeof item === 'string' ? { url: item } : item)
            : [];
          const source = imageElement.getAttribute('src');
          const sourceIndex = images.findIndex(item => item.url === source);
          const isCard = galleryElement.dataset.habGalleryView === 'card';
          const primaryIndex = images.findIndex(item => item.role?.toLowerCase() === 'primary');
          const target = isCard ? Math.max(0, primaryIndex) : sourceIndex >= 0 ? sourceIndex : position;
          if (target < images.length) images[target] = { ...images[target], url: nextUrl, ...(isCard ? { role: 'primary' } : {}), alt: imageAlt };
          else if (position === 0) images.unshift({ url: nextUrl, role: 'primary', alt: imageAlt });
          else throw new Error('This product photo is not available in Admin.');
          await write('/api/admin/products', 'PATCH', { id: product.id, images });
        } else if (galleryType === 'page' && galleryId) {
          const { page } = await requestJson(`/api/admin/pages/${encodeURIComponent(galleryId)}`);
          if (!imageElement) throw new Error('Select an existing page photo to replace it.');
          const position = Array.from(galleryElement.querySelectorAll('img')).indexOf(imageElement);
          const images: Array<{ url: string; caption?: string }> = Array.isArray(page.galleryImages) ? [...page.galleryImages] : [];
          if (position < 0 || position >= images.length) throw new Error('This page photo is not available in Admin.');
          images[position] = { ...images[position], url: nextUrl, caption: draft.alt?.trim() || images[position].caption };
          await write(`/api/admin/pages/${encodeURIComponent(galleryId)}`, 'PUT', { galleryImages: images });
        } else if (galleryType === 'project' && galleryId) {
          const { projects } = await requestJson('/api/admin/projects');
          const project = projects.find((item: { id: string }) => item.id === galleryId);
          if (!project) throw new Error('Project not found in Admin.');
          await write('/api/admin/projects', 'PUT', { id: project.id, coverPhotoUrl: nextUrl });
        } else if (galleryType === 'member' && galleryId) {
          const { members } = await requestJson('/api/admin/members');
          const member = members.find((item: { regNumber: string }) => item.regNumber === galleryId);
          if (!member) throw new Error('Member not found in Admin.');
          await write('/api/admin/members', 'PATCH', { id: member.id, portraitUrl: nextUrl });
        } else {
          throw new Error('This gallery is not linked to an Admin record.');
        }
        if (overridesRef.current[key]) {
          await write('/api/page-overrides', 'PUT', { pathname: storagePath, key, remove: true, override: {} });
          delete overridesRef.current[key];
        }
        window.location.reload();
        return;
      }
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
      // Overrides are applied directly to DOM nodes, so simply deleting the
      // saved value cannot reconstruct text split across inline children.
      // Reload after the successful delete so the server-rendered source value
      // is restored immediately (including for global header/footer edits).
      window.location.reload();
    } catch (error: any) { setMessage(error?.message || 'Reset failed.'); }
    finally { setSaving(false); }
  };

  const upload = async (file: File) => {
    const body = new FormData(); body.append('file', file);
    setSaving(true); setMessage('Uploading original image…');
    try {
      const uploadUrl = galleryType === 'member' && galleryId
        ? `/api/admin/upload?purpose=member-portrait&memberRegNumber=${encodeURIComponent(galleryId)}`
        : '/api/admin/upload';
      const response = await fetch(uploadUrl, { method: 'POST', credentials: 'include', body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed.');
      setDraft((current) => ({ ...current, src: data.url }));
      setMessage('Image uploaded. Select Save to publish it here.');
    } catch (error: any) { setMessage(error?.message || 'Upload failed.'); }
    finally { setSaving(false); }
  };

  const uploadSlide = async (file: File) => {
    const body = new FormData(); body.append('file', file);
    setSaving(true); setMessage('Uploading new slide…');
    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Upload failed.');
      setNewSlideUrl(data.url);
      setMessage('Photo uploaded. Select Add slide to publish it.');
    } catch (error: any) { setMessage(error?.message || 'Upload failed.'); }
    finally { setSaving(false); }
  };

  const mediaSelection = typeof HTMLImageElement !== 'undefined'
    && (selected instanceof HTMLImageElement || Boolean(selected?.hasAttribute('data-hab-media-placeholder')));
  const galleryElement = mediaSelection ? selected?.closest<HTMLElement>('[data-hab-gallery]') || null : null;
  const galleryType = galleryElement?.dataset.habGallery;
  const galleryId = galleryElement?.dataset.habGalleryId;
  const hasPermission = (permission: string) => staffPermissions.includes('*') || staffPermissions.includes(permission);
  const requiredPermissions = galleryType === 'product' ? ['products:view', 'products:edit']
    : galleryType === 'member' ? ['members:view', 'members:edit']
      : galleryType ? ['content:view', 'content:edit'] : ['content:edit'];
  const canSaveSelection = requiredPermissions.every(hasPermission) && (galleryType !== 'member' || Boolean(galleryId));
  const canAddSlide = Boolean(canSaveSelection && (galleryType === 'hero' && hasPermission('content:create')
    || (galleryId && ['outlet', 'product', 'page'].includes(galleryType || '') && galleryElement?.dataset.habGalleryView !== 'card')));
  const selectedGalleryImage = selected instanceof HTMLImageElement ? selected : null;
  const selectedGalleryPosition = selectedGalleryImage && galleryElement
    ? Array.from(galleryElement.querySelectorAll('img')).indexOf(selectedGalleryImage) : -1;
  const canRemoveMedia = Boolean(canSaveSelection && selectedGalleryImage && (
    galleryType === 'hero' && selectedGalleryImage.dataset.habGallerySlideId && hasPermission('content:delete')
    || galleryType === 'outlet' && galleryId && selectedGalleryPosition > 0
    || galleryType === 'product' && galleryId && galleryElement?.dataset.habGalleryView !== 'card'
    || galleryType === 'page' && galleryId && selectedGalleryPosition >= 0
  ));

  const removeMedia = async () => {
    if (!canRemoveMedia || !selectedGalleryImage || !galleryElement) return;
    if (!window.confirm('Remove this photo from its gallery? The uploaded file will not be deleted.')) return;
    setSaving(true); setMessage('Removing photo…');
    try {
      const requestJson = async (url: string, init?: RequestInit) => {
        const response = await fetch(url, { credentials: 'include', cache: 'no-store', ...init });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not remove this photo.');
        return data;
      };
      const write = (url: string, method: string, payload: unknown) => requestJson(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (galleryType === 'hero') {
        await requestJson(`/api/admin/hero-slides/${encodeURIComponent(selectedGalleryImage.dataset.habGallerySlideId || '')}`, { method: 'DELETE' });
      } else if (galleryType === 'outlet' && galleryId) {
        const { outlets } = await requestJson('/api/admin/outlets');
        const outlet = outlets.find((item: { key: string }) => item.key === galleryId);
        if (!outlet) throw new Error('Outlet not found in Admin.');
        const photos: string[] = Array.isArray(outlet.galleryImages) ? outlet.galleryImages : [];
        if (selectedGalleryPosition - 1 >= photos.length) throw new Error('This outlet slide is not available in Admin.');
        await write('/api/admin/outlets', 'PUT', { id: outlet.id, galleryImages: photos.filter((_, i) => i !== selectedGalleryPosition - 1) });
      } else if (galleryType === 'product' && galleryId) {
        const { products } = await requestJson('/api/admin/products');
        const product = products.find((item: { code: string }) => item.code === galleryId);
        if (!product) throw new Error('Product not found in Admin.');
        const images: Array<string | { url: string }> = Array.isArray(product.images) ? product.images : [];
        const source = selectedGalleryImage.getAttribute('src');
        const imageIndex = images.findIndex(item => (typeof item === 'string' ? item : item.url) === source);
        if (imageIndex < 0) throw new Error('This photo is a reference fallback, not a saved product image. Manage its photos in Admin.');
        await write('/api/admin/products', 'PATCH', { id: product.id, images: images.filter((_, i) => i !== imageIndex) });
      } else if (galleryType === 'page' && galleryId) {
        const { page } = await requestJson(`/api/admin/pages/${encodeURIComponent(galleryId)}`);
        const photos: Array<{ url: string; caption?: string }> = Array.isArray(page.galleryImages) ? page.galleryImages : [];
        if (selectedGalleryPosition >= photos.length) throw new Error('This page photo is not available in Admin.');
        await write(`/api/admin/pages/${encodeURIComponent(galleryId)}`, 'PUT', { galleryImages: photos.filter((_, i) => i !== selectedGalleryPosition) });
      }
      window.location.reload();
    } catch (error: any) { setMessage(error?.message || 'Could not remove this photo.'); setSaving(false); }
  };

  const addSlide = async () => {
    const url = newSlideUrl.trim();
    if (!url || !canAddSlide) { setMessage('Upload or enter a photo URL first.'); return; }
    if (!/^\/(?!\/)/.test(url) && !/^https:\/\//i.test(url)) { setMessage('Use a site image path or HTTPS URL.'); return; }
    if (galleryType === 'hero' && (!newSlideCaption.trim() || !newSlideAlt.trim())) { setMessage('Enter a caption and image description for this hero slide.'); return; }
    setSaving(true); setMessage('Adding slide…');
    try {
      const requestJson = async (url: string, init?: RequestInit) => {
        const response = await fetch(url, { credentials: 'include', cache: 'no-store', ...init });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Could not save the slide.');
        return data;
      };
      const write = (url: string, method: string, payload: unknown) => requestJson(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (galleryType === 'hero') {
        const { slides } = await requestJson('/api/admin/hero-slides');
        await write('/api/admin/hero-slides', 'POST', {
          imageUrl: url, caption: newSlideCaption.trim(),
          altText: newSlideAlt.trim(),
          sortOrder: Math.max(0, ...slides.map((slide: { sortOrder?: number }) => Number(slide.sortOrder) || 0)) + 1,
          isActive: true,
        });
      } else if (galleryType === 'outlet') {
        const { outlets } = await requestJson('/api/admin/outlets');
        const outlet = outlets.find((item: { key: string }) => item.key === galleryId);
        if (!outlet) throw new Error('Outlet not found in Admin.');
        const photos: string[] = Array.isArray(outlet.galleryImages) ? outlet.galleryImages : [];
        if (photos.length >= 24) throw new Error('This outlet has reached the 24-slide limit.');
        await write('/api/admin/outlets', 'PUT', { id: outlet.id, galleryImages: [...photos, url] });
      } else if (galleryType === 'product') {
        const { products } = await requestJson('/api/admin/products');
        const product = products.find((item: { code: string }) => item.code === galleryId);
        if (!product) throw new Error('Product not found in Admin.');
        const images = Array.isArray(product.images) ? product.images : [];
        await write('/api/admin/products', 'PATCH', { id: product.id, images: [...images, { url, role: 'gallery', alt: newSlideAlt.trim() || undefined }] });
      } else if (galleryType === 'page') {
        const { page } = await requestJson(`/api/admin/pages/${galleryId}`);
        const images = Array.isArray(page.galleryImages) ? page.galleryImages : [];
        await write(`/api/admin/pages/${galleryId}`, 'PUT', { galleryImages: [...images, { url, caption: newSlideCaption.trim() || newSlideAlt.trim() }] });
      }
      window.location.reload();
    } catch (error: any) { setMessage(error?.message || 'Could not add the slide.'); setSaving(false); }
  };

  if (!active || !isStaff) return null;
  const image = Boolean(mediaSelection);
  const field = selected instanceof HTMLInputElement || selected instanceof HTMLTextAreaElement;
  const link = Boolean(selected?.closest('a'));

  return <>
    {sectionManagement && createPortal(
      <aside role="dialog" aria-modal="false" aria-label="Manage selected page section" className="hab-page-quick-editor fixed right-4 bottom-4 z-[99999] w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-amber-300 bg-white p-4 text-slate-900 shadow-2xl" data-hab-no-quick-edit>
        <div className="flex items-center justify-between gap-3">
          <strong className="text-sm">Empty section</strong>
          <button type="button" onClick={() => setSectionManagement(null)} aria-label="Close section editor" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"><X className="w-4 h-4" /><span>Close</span></button>
        </div>
        <p className="mt-2 text-xs text-slate-600">{sectionManagement.description}</p>
        <a href={sectionManagement.href} className="mt-3 inline-flex rounded-lg bg-[#8B2E24] px-3 py-2 text-xs font-bold text-white">{sectionManagement.label}</a>
      </aside>, document.body,
    )}
    {selected && createPortal(
    <aside role="dialog" aria-modal="false" aria-label="Edit selected page content" className="hab-page-quick-editor fixed right-4 bottom-4 z-[99999] w-[min(390px,calc(100vw-2rem))] rounded-2xl border border-amber-300 bg-white p-4 text-slate-900 shadow-2xl" data-hab-no-quick-edit>
      <div className="flex items-center justify-between gap-3 mb-3">
        <strong className="text-sm">{image && selected?.hasAttribute('data-hab-media-placeholder') ? 'Add member portrait' : `Edit this ${image ? 'image' : field ? 'placeholder' : 'text'}`}</strong>
        <button type="button" onClick={() => setSelected(null)} aria-label="Close quick editor" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"><X className="w-4 h-4" /><span>Close</span></button>
      </div>
      {image ? <>
        <label className="block text-xs font-semibold mb-1">Image URL</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.src || ''} onChange={(e) => setDraft({ ...draft, src: e.target.value })} />
        {galleryType !== 'outlet' && galleryType !== 'project' && galleryType !== 'member' && <>
          <label className="block text-xs font-semibold mb-1">Alternative text</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.alt || ''} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} />
        </>}
        {galleryElement && <p className="mb-2 text-xs text-slate-600">Replacing this photo updates {galleryType === 'project' ? 'the project cover' : galleryType === 'member' ? 'the member portrait in the registry and public profile' : 'its gallery'} in Admin and on other public pages.</p>}
        {link && !galleryElement && <><label className="flex items-center gap-1 text-xs font-semibold mb-1"><Link2 className="w-3 h-3" /> Link target</label><input className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.href || ''} onChange={(e) => setDraft({ ...draft, href: e.target.value })} /></>}
        <input ref={fileRef} className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <button type="button" disabled={!canSaveSelection} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50" onClick={() => fileRef.current?.click()}><ImagePlus className="w-4 h-4" /> Replace with upload</button>
        {canAddSlide && <div className="mt-4 border-t border-slate-200 pt-3">
          <strong className="text-xs">Add another {galleryType === 'product' ? 'product photo' : 'slide'}</strong>
          <p className="mt-1 text-xs text-slate-500">This adds a new photo to the {galleryType} gallery; it does not replace the current one.</p>
          <input ref={slideFileRef} className="hidden" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadSlide(e.target.files[0])} />
          <button type="button" disabled={saving} className="mt-2 rounded-lg border px-3 py-2 text-xs font-semibold" onClick={() => slideFileRef.current?.click()}><ImagePlus className="mr-1 inline h-4 w-4" /> Upload new photo</button>
          <input aria-label="New slide image URL" placeholder="Or enter image URL" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" value={newSlideUrl} onChange={e => setNewSlideUrl(e.target.value)} />
          {(galleryType === 'hero' || galleryType === 'page') && <input aria-label="New slide caption" placeholder="Caption" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" value={newSlideCaption} onChange={e => setNewSlideCaption(e.target.value)} />}
          <input aria-label="New slide image description" placeholder="Image description" className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" value={newSlideAlt} onChange={e => setNewSlideAlt(e.target.value)} />
          <button type="button" disabled={saving || !newSlideUrl.trim()} onClick={addSlide} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#8B2E24] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Plus className="h-4 w-4" /> Add slide</button>
          <a className="ml-3 text-xs font-semibold text-[#8B2E24] underline" href={galleryType === 'hero' ? '/admin/hero' : galleryType === 'outlet' ? '/admin/clusters-outlets' : galleryType === 'product' ? '/admin/products' : '/admin/pages'}>Manage gallery in Admin</a>
        </div>}
      </> : field ? <>
        <label className="block text-xs font-semibold mb-1">Form placeholder</label>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" value={draft.placeholder || ''} onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })} />
      </> : <>
        <label className="block text-xs font-semibold mb-1">English text</label>
        <textarea rows={3} className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.text || ''} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
        <label className="block text-xs font-semibold mb-1">Dzongkha text (optional)</label>
        <textarea rows={3} className="w-full rounded-lg border px-3 py-2 text-sm mb-2" value={draft.textDz || ''} onChange={(e) => setDraft({ ...draft, textDz: e.target.value })} />
        {link && <><label className="flex items-center gap-1 text-xs font-semibold mb-1"><Link2 className="w-3 h-3" /> Link target</label><input className="w-full rounded-lg border px-3 py-2 text-sm" value={draft.href || ''} onChange={(e) => setDraft({ ...draft, href: e.target.value })} /></>}
      </>}
      {message && <p className="mt-3 text-xs text-slate-600">{message}</p>}
      {!canSaveSelection && <p className="mt-3 text-xs text-amber-800" role="status">Your role cannot save this {galleryType === 'product' ? 'product image' : 'content'}. Ask an administrator for {requiredPermissions.join(' and ')} access.</p>}
      <div className="mt-4 flex justify-end gap-2">
        {canRemoveMedia && <button type="button" disabled={saving} onClick={removeMedia} className="mr-auto rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Remove photo</button>}
        {(!galleryElement || overridesRef.current[selected.dataset.habEditKey || '']) && <button type="button" disabled={saving} onClick={reset} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs"><RotateCcw className="w-3.5 h-3.5" /> Undo override</button>}
        <button type="button" disabled={saving || !canSaveSelection} onClick={save} className="inline-flex items-center gap-1 rounded-lg bg-[#8B2E24] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : galleryType === 'project' ? 'Save cover' : galleryElement ? 'Save gallery' : 'Save live'}</button>
      </div>
    </aside>,
    document.body
  )}
  </>;
}
