'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

/** Render PDFs without depending on the browser's PDF plug-in. */
export default function PdfPreview({ url, title, className = '' }: {
  url: string; title: string; className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(600);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(180, entry.contentRect.width - 24)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof import('pdfjs-dist').getDocument> | undefined;
    setDocument(null);
    setPage(1);
    setError('');
    setBusy(true);
    void import('pdfjs-dist').then(pdf => {
      if (cancelled) return;
      pdf.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      task = pdf.getDocument({ url, isEvalSupported: false });
      return task.promise;
    }).then(doc => {
      if (doc && !cancelled) setDocument(doc);
    }).catch(() => {
      if (!cancelled) { setError('This document could not be previewed. Open or download the file below.'); setBusy(false); }
    });
    return () => { cancelled = true; void task?.destroy().catch(() => {}); };
  }, [url]);

  useEffect(() => {
    if (!document) return;
    let cancelled = false;
    let render: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | undefined;
    setBusy(true);
    setError('');
    setText('');
    void document.getPage(page).then(async pdfPage => {
      if (cancelled || !canvas.current) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: width / base.width });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const target = canvas.current;
      target.width = Math.ceil(viewport.width * ratio);
      target.height = Math.ceil(viewport.height * ratio);
      target.style.width = `${viewport.width}px`;
      target.style.height = `${viewport.height}px`;
      render = pdfPage.render({ canvas: target, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await render.promise;
      const content = await pdfPage.getTextContent();
      if (!cancelled) { setText(content.items.map(item => 'str' in item ? item.str : '').join(' ')); setBusy(false); }
    }).catch(err => {
      if (!cancelled && err?.name !== 'RenderingCancelledException') { setError('This page could not be previewed. Open or download the file below.'); setBusy(false); }
    });
    return () => { cancelled = true; render?.cancel(); };
  }, [document, page, width]);

  return <div ref={container} className={`flex min-h-0 flex-col bg-slate-100 ${className}`} aria-label={title}>
    <div className="flex flex-wrap items-center justify-center gap-3 border-b bg-white px-3 py-2 text-sm">
      <button type="button" disabled={!document || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous page</button>
      <span aria-live="polite">{document ? `Page ${page} of ${document.numPages}` : 'PDF preview'}</span>
      <button type="button" disabled={!document || page >= document.numPages} onClick={() => setPage(value => value + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next page</button>
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">Open PDF</a>
      <a href={url} download className="underline">Download</a>
    </div>
    <div className="min-h-0 flex-1 overflow-auto p-3" aria-busy={busy}>
      {busy && !error && <p role="status" className="text-center text-sm">Loading document…</p>}
      {error && <p role="alert" className="p-4 text-center text-sm">{error}</p>}
      <canvas ref={canvas} role="img" aria-label={`${title}, page ${page}`} className="mx-auto max-w-full bg-white shadow" hidden={!!error} />
      <p className="sr-only">{text}</p>
    </div>
  </div>;
}
