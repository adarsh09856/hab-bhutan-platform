'use client';

import React from 'react';
import Link from 'next/link';

interface NewsItem {
  kind: string;
  date: string;
  title: string;
  blurb: string;
}

interface EventItem {
  day: string;
  mon: string;
  title: string;
  place: string;
}

export default function NewsPage() {
  const [articles, setArticles] = React.useState<NewsItem[]>([]);
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles)) {
          setArticles(
            data.articles.map((a: any) => ({
              kind: a.kind || 'News',
              date: a.dateString || 'Recent',
              title: a.title,
              blurb: a.blurb || '',
            }))
          );
        }
        if (data?.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return (
    <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <div className="font-mono text-[11.5px] text-[#6B5A4C] mb-6 sm:mb-8">
        <Link href="/" className="hover:underline">Home</Link> /{' '}
        <span>News &amp; events</span>
      </div>

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-marcellus text-2xl sm:text-3xl lg:text-[44px] font-normal leading-[1.06] text-[#33261F] mb-2">
          News &amp; events
        </h1>
        <p className="font-lora text-sm sm:text-base lg:text-[17px] text-[#6B5A4C]">
          Stay informed, stay empowered.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
        {/* Left Column: Articles */}
        <div className="flex flex-col gap-5">
          {articles.map((article) => (
            <div
              key={article.title}
              className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] overflow-hidden grid grid-cols-1 sm:grid-cols-[200px_1fr]"
            >
              <div data-cms-img className="relative min-h-[180px] sm:min-h-[150px] bg-[#E8E1D4] border-b sm:border-b-0 sm:border-r border-[#E4DDD1] overflow-hidden">
                <img
                  src={article.kind === 'Programs' ? '/images/programs/trade.jpg' : article.kind === 'Artisan support' ? '/images/programs/dye_training.jpg' : article.kind === 'Events' ? '/images/outlets/thimphu.jpg' : '/images/about_hero.jpg'}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-2 z-10 font-mono text-[10px] text-[#F4F0E7] bg-[#33261F]/85 backdrop-blur-sm px-2 py-0.5 rounded">
                  {article.kind}
                </span>
              </div>

              <div className="p-4 sm:p-[22px_24px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] sm:text-[10.5px] bg-[#F1E9DB] text-[#8B2E24] px-2 py-0.5 rounded">
                      {article.kind}
                    </span>
                    <span className="font-mono text-[10.5px] sm:text-[11px] text-[#6B5A4C]">
                      {article.date}
                    </span>
                  </div>
                  <h2 className="font-figtree font-bold text-base sm:text-[20px] leading-[1.28] text-[#33261F] mb-2">
                    {article.title}
                  </h2>
                  <p className="font-lora text-xs sm:text-[15px] leading-[1.55] text-[#6B5A4C]">
                    {article.blurb}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFE9DE] mt-4">
                  <span className="font-figtree font-semibold text-xs sm:text-[13.5px] text-[#8B2E24] hover:underline cursor-pointer">
                    Continue reading →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Events & Downloads */}
        <div className="lg:sticky lg:top-[100px] flex flex-col gap-6">
          {/* Upcoming Events Card */}
          <div className="bg-[#FFFCF8] border border-[#E4DDD1] rounded-[12px] p-6">
            <h3 className="font-figtree font-bold text-[18px] text-[#33261F] mb-4">
              Upcoming events
            </h3>
            <div className="divide-y divide-[#EFE9DE]">
              {events.map((ev) => (
                <div key={ev.title} className="py-3.5 flex items-center gap-4 first:pt-0 last:pb-0">
                  <div className="w-[44px] h-[44px] bg-[#F4F0E7] border border-[#CDBEA8] rounded-[8px] flex flex-col items-center justify-center flex-none">
                    <span className="font-figtree font-bold text-[14px] text-[#33261F] leading-none">
                      {ev.day}
                    </span>
                    <span className="font-mono text-[10px] text-[#8B2E24] font-bold">
                      {ev.mon}
                    </span>
                  </div>
                  <div>
                    <div className="font-figtree font-semibold text-[15px] text-[#33261F]">
                      {ev.title}
                    </div>
                    <div className="font-lora text-[13px] text-[#6B5A4C]">
                      {ev.place}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publications Promo */}
          <div className="bg-[#33261F] text-[#F1ECE2] rounded-[12px] p-6">
            <h3 className="font-marcellus text-[22px] font-normal text-white mb-2">
              Annual Reports &amp; Studies
            </h3>
            <p className="font-lora text-[14px] text-[#D2C2AE] mb-4 leading-[1.5]">
              Download full audited accounts, strategic blueprints, and value-chain assessments.
            </p>
            <Link
              href="/publications"
              className="font-figtree font-semibold text-[13.5px] text-[#F1ECE2] border-b border-[#8B2E24] pb-0.5 hover:text-white transition-colors"
            >
              Browse downloads →
            </Link>
          </div>

          <div className="font-mono text-[11px] text-[#6B5A4C] p-2">
            Sample content — updated weekly from the HAB communications desk.
          </div>
        </div>
      </div>
    </main>
  );
}
