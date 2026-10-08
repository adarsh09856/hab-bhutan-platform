'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CraftRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const val = searchParams.get('craft') || 'thagzo';
    router.replace(`/craft/${encodeURIComponent(val)}`);
  }, [router, searchParams]);

  return (
    <main id="main">
      <section className="section section--narrow">
        <h1 className="display display--page">Craft</h1>
        <p>Loading craft…</p>
      </section>
    </main>
  );
}

export default function CraftIndexPage() {
  return (
    <Suspense fallback={<main id="main"><section className="section"><h1 className="display display--page">Craft</h1><p>Loading…</p></section></main>}>
      <CraftRedirectContent />
    </Suspense>
  );
}

