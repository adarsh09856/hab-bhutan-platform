'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const val = searchParams.get('event') || searchParams.get('key') || 'national-craft-fair';
    router.replace(`/events/${encodeURIComponent(val)}`);
  }, [router, searchParams]);

  return (
    <main id="main">
      <section className="section section--narrow">
        <p>Loading…</p>
      </section>
    </main>
  );
}

export default function QueryRedirectPage() {
  return (
    <Suspense fallback={<div className="section"><p>Loading…</p></div>}>
      <RedirectContent />
    </Suspense>
  );
}
