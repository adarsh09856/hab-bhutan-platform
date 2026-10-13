import React from 'react';

export default function PublicLoading() {
  return (
    <main
      id="main"
      className="flex min-h-[55vh] items-center justify-center px-6 py-16"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          aria-hidden="true"
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#8B2E24]/20 border-t-[#8B2E24]"
        />
        <p className="font-medium text-[#6B5A4C]">Loading page…</p>
      </div>
    </main>
  );
}
