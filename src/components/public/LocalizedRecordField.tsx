'use client';

import type { CSSProperties, ElementType } from 'react';
import { useLanguage } from '@/context/LanguageContext';

type Props = {
  english?: string | null;
  dzongkha?: string | null;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  splitParagraphs?: boolean;
  /** HTML already sanitized by a server-side caller. */
  safeEnglishHtml?: string | null;
  /** HTML already sanitized by a server-side caller. */
  safeDzongkhaHtml?: string | null;
};

/** Renders a record's translation when present, otherwise preserves its English value. */
export default function LocalizedRecordField({
  english,
  dzongkha,
  as: Tag = 'span',
  className,
  style,
  splitParagraphs = false,
  safeEnglishHtml,
  safeDzongkhaHtml,
}: Props) {
  const { language } = useLanguage();
  const useDzongkha = language === 'dz' && Boolean(dzongkha?.trim());
  const value = (useDzongkha ? dzongkha : english) || '';
  const safeHtml = useDzongkha ? safeDzongkhaHtml : safeEnglishHtml;

  if (safeHtml != null) {
    return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }

  if (splitParagraphs) {
    const Paragraph = Tag === 'span' ? 'p' : Tag;
    return <>{value.split(/\n\s*\n/).filter(Boolean).map((part, index) => (
      <Paragraph key={index} className={className} style={style}>{part.trim()}</Paragraph>
    ))}</>;
  }

  return <Tag className={className} style={style}>{value}</Tag>;
}
